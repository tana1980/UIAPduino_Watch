import { readData, canonicalUrl, categories, regions } from '../src/lib/data.mjs';
import { pathToFileURL } from 'node:url';
export function validate(resources, candidates, picks) {
  const errors = [], ids = new Set(), urls = new Set();
  const fields = ['id','title','url','source','author','region','language','categories','products','published_at','discovered_at','last_checked_at','summary_ja','tags','official','status'];
  const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  if (!Array.isArray(resources) || !Array.isArray(candidates) || !Array.isArray(picks)) return ['All data roots must be arrays'];
  for (const [i, r] of resources.entries()) {
    const at = `resources[${i}]`;
    if (!r || typeof r !== 'object') { errors.push(`${at}: expected object`); continue; }
    for (const f of fields) if (!Object.hasOwn(r,f)) errors.push(`${at}: missing ${f}`);
    for (const f of ['id','title','url','source','region','language','summary_ja']) if (typeof r[f] !== 'string' || !r[f].trim()) errors.push(`${at}: invalid ${f}`);
    if (typeof r.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id)) errors.push(`${at}: invalid id format`);
    if (ids.has(r.id)) errors.push(`${at}: duplicate id ${r.id}`); ids.add(r.id);
    try {
      const u = new URL(r.url);
      if (u.protocol !== 'https:' || u.username || u.password) throw Error();
      const key = canonicalUrl(r.url);
      if (urls.has(key)) errors.push(`${at}: duplicate URL ${key}`); urls.add(key);
    } catch { errors.push(`${at}: invalid HTTPS URL`); }
    if (!regions.includes(r.region)) errors.push(`${at}: invalid region`);
    if (!/^(unknown|[a-z]{2,3}(?:-[A-Za-z0-9]+)*)$/.test(r.language)) errors.push(`${at}: invalid language code`);
    for (const f of ['categories','products','tags']) if (!Array.isArray(r[f]) || (f==='categories' && !r[f].length) || r[f].some(x=>typeof x!=='string'||!x.trim()) || new Set(r[f]).size!==r[f].length) errors.push(`${at}: invalid ${f}`);
    if (Array.isArray(r.categories) && r.categories.some(c=>!categories.includes(c))) errors.push(`${at}: unknown category`);
    if (typeof r.official !== 'boolean' || (Array.isArray(r.categories) && r.categories.includes('Official') !== r.official)) errors.push(`${at}: Official category/flag mismatch`);
    if (!['active','archived','unavailable'].includes(r.status)) errors.push(`${at}: invalid status`);
    if (r.author !== null && typeof r.author !== 'string') errors.push(`${at}: author must be string or null`);
    if (r.published_at !== null && !date(r.published_at)) errors.push(`${at}: invalid published_at`);
    for (const f of ['discovered_at','last_checked_at']) if (!date(r[f])) errors.push(`${at}: invalid ${f}`);
    if (r.discovered_at > r.last_checked_at) errors.push(`${at}: check precedes discovery`);
    if (r.last_checked_at > new Date().toISOString().slice(0,10)) errors.push(`${at}: check date is in the future`);
    if (!r.verification || typeof r.verification.note !== 'string' || !r.verification.note.trim() || typeof r.verification.checked_url !== 'string') errors.push(`${at}: missing source verification`);
    else try { if (canonicalUrl(r.verification.checked_url)!==canonicalUrl(r.url)) errors.push(`${at}: checked_url differs from resource URL`); } catch { errors.push(`${at}: invalid checked_url`); }
  }
  const pickIds = new Set(), editions = new Set();
  for (const [i,p] of picks.entries()) {
    if (!p || !date(p.date) || !['initial','weekly'].includes(p.kind) || !Array.isArray(p.resource_ids) || !p.resource_ids.length || (p.kind==='weekly' && p.resource_ids.length!==3) || new Set(p.resource_ids).size!==p.resource_ids.length) { errors.push(`picks[${i}]: invalid edition`); continue; }
    if (editions.has(p.date)) errors.push(`picks[${i}]: duplicate date`); editions.add(p.date);
    for (const id of p.resource_ids) { if (!resources.some(r=>r.id===id && r.status==='active')) errors.push(`picks[${i}]: invalid resource ${id}`); pickIds.add(id); }
    if (typeof p.intro_ja !== 'string' || !p.intro_ja.trim()) errors.push(`picks[${i}]: missing intro_ja`);
  }
  const candidateIds = new Set();
  for (const [i,c] of candidates.entries()) {
    if (!c || typeof c.resource_id!=='string' || !ids.has(c.resource_id) || !date(c.added_at) || typeof c.reason_ja!=='string' || !c.reason_ja.trim()) { errors.push(`candidates[${i}]: invalid candidate`); continue; }
    if (candidateIds.has(c.resource_id)) errors.push(`candidates[${i}]: duplicate reference`);
    if (pickIds.has(c.resource_id)) errors.push(`candidates[${i}]: already selected in picks`);
    candidateIds.add(c.resource_id);
  }
  for (const r of resources) if (r.status==='active' && !pickIds.has(r.id) && !candidateIds.has(r.id)) errors.push(`${r.id}: missing candidate record`);
  return errors;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const r = readData('resources'), c = readData('candidates'), p = readData('weekly-picks');
    const errors = validate(r,c,p);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
    else console.log(`Validated ${r.length} resources, ${c.length} candidates, ${p.length} editions; no duplicate URLs.`);
  } catch(e) { console.error(e.message); process.exitCode=1; }
}
