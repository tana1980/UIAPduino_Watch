import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readData, canonicalUrl } from '../src/lib/data.mjs';
import { validate } from '../scripts/validate-data.mjs';
import { matches } from '../src/lib/filter.mjs';
const fixture=()=>[structuredClone(readData('resources')),structuredClone(readData('candidates')),structuredClone(readData('weekly-picks'))];
test('curated data and candidate/pick references are valid',()=>assert.deepEqual(validate(...fixture()),[]));
test('required fields cannot disappear',()=>{const f=fixture();delete f[0][0].author;assert.match(validate(...f).join('\n'),/missing author/);});
test('normalized duplicate URLs are rejected',()=>{const f=fixture();f[0][1].url=f[0][0].url+'?utm_source=test#section';assert.match(validate(...f).join('\n'),/duplicate URL/);});
test('impossible dates are rejected',()=>{const f=fixture();f[0][0].last_checked_at='2026-02-30';assert.match(validate(...f).join('\n'),/invalid last_checked_at/);});
test('official identity requires matching category',()=>{const f=fixture();f[0][0].official=true;assert.match(validate(...f).join('\n'),/Official category\/flag mismatch/);});
test('unconfirmed pages cannot lack verification records',()=>{const f=fixture();delete f[0][0].verification;assert.match(validate(...f).join('\n'),/source verification/);});
test('weekly editions allow one to three active resources',()=>{
  for (const count of [1,2,3]) {
    const f=fixture();
    const resource_ids=f[1].slice(0,count).map(c=>c.resource_id);
    f[1]=f[1].filter(c=>!resource_ids.includes(c.resource_id));
    f[2].push({date:'2026-10-12',kind:'weekly',intro_ja:'Weekly test edition',resource_ids});
    assert.deepEqual(validate(...f),[]);
  }
});
test('weekly editions reject zero or more than three resources',()=>{
  const zero=fixture();
  zero[2].push({date:'2026-10-12',kind:'weekly',intro_ja:'Weekly test edition',resource_ids:[]});
  assert.match(validate(...zero).join('\n'),/invalid edition/);
  const four=fixture();
  const resource_ids=four[1].slice(0,4).map(c=>c.resource_id);
  four[1]=four[1].filter(c=>!resource_ids.includes(c.resource_id));
  four[2].push({date:'2026-10-12',kind:'weekly',intro_ja:'Weekly test edition',resource_ids});
  assert.match(validate(...four).join('\n'),/invalid edition/);
});
test('unused confirmed candidates cannot be dropped',()=>{const f=fixture();f[1].pop();assert.match(validate(...f).join('\n'),/missing candidate/);});
test('credential URLs are rejected',()=>{const f=fixture();f[0][0].url='https://secret:password@example.com';assert.match(validate(...f).join('\n'),/invalid HTTPS URL/);});
test('all filter dimensions compose with AND',()=>{const r=readData('resources').find(r=>r.id==='inajob-uiapduino-piano');assert.equal(matches(r,{region:'Japan',category:'Project',language:'ja',product:'UIAPduino Pro Micro CH32V003',q:'PWM'}),true);assert.equal(matches(r,{region:'Overseas',q:'PWM'}),false);});
test('search handles Japanese, case and full-width Latin',()=>{const r=readData('resources').find(r=>r.id==='inajob-uiapduino-piano');assert.equal(matches(r,{q:'ｐｗｍ'}),true);assert.equal(matches(r,{q:'ピアノ'}),true);assert.equal(matches(r,{q:'not-present-in-resource'}),false);});
test('canonical URLs keep content queries but remove fragments and tracking',()=>assert.equal(canonicalUrl('https://example.com/page/?b=2&utm_medium=mail&a=1#part'),'https://example.com/page/?a=1&b=2'));
