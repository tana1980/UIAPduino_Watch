import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { stringify } from 'yaml';
import { readData, canonicalUrl, categories, regions } from '../../src/lib/data.mjs';

const file = path => fs.readFileSync(path, 'utf8');
const add = (path, value) => fs.appendFileSync(path, value);
const appendYaml = (name, values) => {
  if (values.length) add(`data/${name}.yml`, '\n' + stringify(values, {lineWidth: 0}));
};
const records = JSON.parse(file(process.env.WATCH_RECORDS));
const pending = file(process.env.WATCH_PENDING);
const today = process.env.WATCH_DATE;
// The existing resource validator enforces UTC for source check timestamps.
const checkedDate = new Date().toISOString().slice(0,10);
const resources = readData('resources');
const candidates = readData('candidates');
const picks = readData('weekly-picks');
const byUrl = new Map(resources.map(r => [canonicalUrl(r.url), r]));
const picked = new Set(picks.flatMap(p => p.resource_ids));
const saved = new Set(candidates.map(c => c.resource_id));
const forbidden = /[<>{}\x00-\x1f\x7f]|https?:|\]\(|ignore (?:all |previous)|system prompt|API[_ ]?KEY|GITHUB_TOKEN|プロンプト|以前の指示|作業メモ|内部指示|秘密鍵/i;
function plain(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max && !forbidden.test(value);
}
function week(date) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.toISOString().slice(0,10);
}
const outcomes = { unverified: 0, duplicate: 0, pending: 0 };
const fresh = [], eligible = [];
const audit = [];
const titles = new Set(resources.map(r => r.title.normalize('NFKC').toLowerCase().trim()));
const seen = new Set();
for (const row of records) {
  if (row.title_grounded !== true || !plain(row.evidence, 250) || !plain(row.title, 180) || !plain(row.summary_ja, 350) || !plain(row.reason_ja, 250)
      || !/[ぁ-んァ-ヶ一-龠]/u.test(row.summary_ja) || !/UIAPduino/i.test(row.evidence)
      || !/^[0-9a-f]{64}$/.test(row.source_sha256) || !regions.includes(row.region)
      || !['ja','en','unknown'].includes(row.language) || !Array.isArray(row.categories)
      || !row.categories.length || !row.categories.every(c => categories.includes(c) && c !== 'Official')) {
    outcomes.unverified++; continue;
  }
  const page = new URL(row.url);
  // Feed, search and topic indexes provide discovery, not an author’s original work.
  if (page.search || /\/(?:topics|search)(?:\/|$)|\/(?:feed|rss)\/?$/i.test(page.pathname)) {
    outcomes.unverified++; continue;
  }
  const key = canonicalUrl(row.url), existing = byUrl.get(key);
  const titleKey = row.title.normalize('NFKC').toLowerCase().trim();
  const id = existing?.id ?? 'uiap-' + createHash('sha256').update(key).digest('hex').slice(0,16);
  if (pending.includes(key) || pending.includes(id) || pending.includes(row.title)) { outcomes.pending++; continue; }
  if (seen.has(key) || picked.has(id) || (!existing && titles.has(titleKey))) { outcomes.duplicate++; continue; }
  seen.add(key); titles.add(titleKey);
  const host = new URL(key).hostname;
  const official = host === 'www.uiap.jp';
  const cats = [...new Set(row.categories)];
  if (official) cats.unshift('Official');
  const record = existing ?? {
    id, title: row.title, url: key, source: host, author: plain(row.author, 80) && row.evidence.includes(row.author) ? row.author : null,
    region: row.region === 'Japan' && row.language === 'ja' && /^(?:www\.uiap\.jp|zenn\.dev|qiita\.com|note\.com|protopedia\.net|news\.coderdojo\.jp)$/.test(host) ? 'Japan' : 'Global', language: row.language, categories: cats, products: [],
    published_at: /^\d{4}-\d{2}-\d{2}$/.test(row.published_at) && row.evidence.includes(row.published_at) ? row.published_at : null,
    discovered_at: checkedDate, last_checked_at: checkedDate, summary_ja: row.summary_ja, tags: cats,
    official, status: 'active', verification: {checked_url: key, note: '元ページの本文でUIAPduinoに関する記述を照合。', content_sha256: row.source_sha256},
  };
  if (!existing) {fresh.push(record); byUrl.set(key, record);}
  if (!existing || (saved.has(id) && existing.status === 'active')) {
    eligible.push({record, reason: row.reason_ja});
    const excerpt = row.evidence.trim().split(/\s+/).slice(0,12).join(' ').slice(0,48).replaceAll('`','');
    audit.push(`- <${key}> — 本文の照合箇所 \`${excerpt}\`。SHA-256 ${row.source_sha256}。\n`);
  }
}
// All saved candidates are compared by identity above. Only candidates with fresh
// primary-source evidence qualify. Break ties in favor of diverse topics and audiences.
const selected = [], represented = new Set();
const gain = ({record:r}) => [...r.categories,r.region,...r.products].filter(x => !represented.has(x)).length;
while (eligible.length && selected.length < 3) {
  eligible.sort((a,b) => gain(b) - gain(a) || a.record.id.localeCompare(b.record.id));
  const next = eligible.shift(); selected.push(next);
  for (const k of [...next.record.categories,next.record.region,...next.record.products]) represented.add(k);
}
const alreadyPublished = picks.some(p => week(p.date) === week(today));
const note = (msg) => {
  console.log(msg);
  if (process.env.GITHUB_STEP_SUMMARY) add(process.env.GITHUB_STEP_SUMMARY, msg + '\n');
};
if (alreadyPublished || !selected.length) {
  note(alreadyPublished ? '今週の推薦版はmainに掲載済みです。' : `推薦できる新規情報なし。元ページ確認済み ${records.length}、掲載条件外 ${outcomes.unverified}、重複 ${outcomes.duplicate}、他のPRで検討中 ${outcomes.pending}。`);
} else {
  const selectedIds = new Set(selected.map(x => x.record.id));
  appendYaml('resources', fresh);
  const retained = candidates.filter(c => !selectedIds.has(c.resource_id));
  const waiting = eligible.filter(x => !saved.has(x.record.id)).map(x => ({resource_id:x.record.id, added_at:today, reason_ja:x.reason}));
  if (retained.length !== candidates.length) fs.writeFileSync('data/candidates.yml', stringify([...retained,...waiting], {lineWidth:0}));
  else appendYaml('candidates', waiting);
  appendYaml('weekly-picks', [{date:today, kind:'weekly', intro_ja:selected.map(x=>x.reason).join(' '), resource_ids:[...selectedIds]}]);
  add('docs/research-log.md', `\n## 週次調査記録 — ${today}\n\n- 公式シリーズ・イベント、GitHubトピック、Zenn・Qiita・noteのフィード、ProtoPediaと保存済み候補を対象に巡回。到達範囲はActionsの実行記録を参照。登録済み${resources.length}件・保存済み候補${saved.size}件と未マージPRを照合。本文確認が得られた推薦だけを採用。\n- 本文照合後の候補${records.length}件。掲載条件外${outcomes.unverified}件、重複${outcomes.duplicate}件、他PRで検討中${outcomes.pending}件。動画・実機動作・ライセンスの独立検証は行っていない。\n` + audit.join(''));
  add('CHANGELOG.md', `\n## Weekly update — ${today}\n\n- 新規リソース${fresh.length}件、週次推薦${selected.length}件。\n`);
  note(`確認済みリソースを${fresh.length}件追加、推薦は${selected.length}件。\n`);
}
