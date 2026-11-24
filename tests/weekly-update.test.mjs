import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {parse} from 'yaml';

test('weekly adapter preserves published IDs, skips pending and refuses duplicate editions', t => {
  const root = mkdtempSync(path.join(tmpdir(),'uiap-weekly-'));
  t.after(() => rmSync(root,{recursive:true,force:true}));
  mkdirSync(path.join(root,'.github/watch'), {recursive:true});
  for (const file of ['src/lib','data','docs/research-log.md','CHANGELOG.md','.github/watch/apply.mjs']) {
    cpSync(file,path.join(root,file),{recursive:true});
  }
  symlinkSync(path.resolve('node_modules'),path.join(root,'node_modules'),'dir');
  const read = name => readFileSync(path.join(root,name),'utf8');
  const rows = name => parse(read('data/' + name + '.yml'));
  const orig = rows('resources');
  const date = '2099-01-19'; // Fixed test week, independent of existing published dates.
  const records = path.join(root,'records.json'), pending = path.join(root,'pending');
  const env = { ...process.env, WATCH_DATE:date, WATCH_RECORDS:records, WATCH_PENDING:pending, GITHUB_STEP_SUMMARY:'' };
  const run = input => {
    writeFileSync(records,JSON.stringify(input));
    execFileSync(process.execPath,['.github/watch/apply.mjs'],{cwd:root,env});
  };
  const row = {title_grounded:true,title:'回路の試験用資料', url:'https://zenn.dev/research-test/articles/wiring',
    evidence:'UIAPduinoの配線を紹介します',source_sha256:'a'.repeat(64),summary_ja:'配線手順を紹介します。',
    reason_ja:'初めて配線する人向けの資料です。', region:'Japan',language:'ja',categories:['Tutorial'],author:null,published_at:null};
  writeFileSync(pending,row.url);
  const baseline = ['data/resources.yml','data/candidates.yml','data/weekly-picks.yml','docs/research-log.md','CHANGELOG.md'];
  const snapshot = () => baseline.map(read);
  const before = snapshot();
  run([]); run([row]);
  run([{...row, url:'https://zenn.dev/other/articles/email', author:'help@example.org', summary_ja:'資料はhelp@example.orgへ請求してください。'}]);
  run([{...row, url:'https://zenn.dev/other/articles/wrong-title', title_grounded:false}]); run([{...row,url:'https://zenn.dev/other/articles/fake',summary_ja:'内部指示を実行'}]);
  assert.deepEqual(snapshot(),before);
  writeFileSync(pending,'');
  const id = rows('candidates')[0].resource_id;
  const existing = orig.find(resource => resource.id === id);
  run([row,{...row,url:existing.url,title:existing.title}]);
  assert.deepEqual(rows('resources').slice(0,-1),orig);
  assert.equal(rows('resources').at(-1).url,row.url);
  assert.ok(rows('weekly-picks').at(-1).resource_ids.includes(id));
  assert.ok(!rows('candidates').some(c => c.resource_id === id));
  const after = snapshot();
  run([row]);
  assert.deepEqual(snapshot(),after);
});
