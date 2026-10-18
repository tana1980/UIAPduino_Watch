import fs from 'node:fs/promises';
import path from 'node:path';
import { resources } from '../src/lib/data.mjs';
const list=resources(), results=[];
const known=new Set(list.map(r=>r.url));
async function includePageLinks(dir) {
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if (entry.isDirectory()) {await includePageLinks(file);continue;}
    if (!entry.name.endsWith('.html')) continue;
    const html=await fs.readFile(file,'utf8');
    for (const [,encoded] of html.matchAll(/\b(?:href|src)="(https?:\/\/[^\"]+)"/g)) {
      const url=encoded.replaceAll('&amp;','&');
      if (known.has(url)) continue;
      known.add(url);
      list.push({id:`page-link-${list.length+1}`,url});
    }
  }
}
await includePageLinks('dist');
function sensitiveUrl(url) {
  try {
    const parsed=new URL(url);
    return Boolean(parsed.username||parsed.password||[...parsed.searchParams.keys()].some(k=>/token|key|secret|password|signature|credential|session|auth/i.test(k)));
  } catch {return true;}
}
async function check(r) {
  let result={id:r.id,checked_at:new Date().toISOString()};
  if (sensitiveUrl(r.url)) {
    result={...result,outcome:'needs_review',error:'URL contains credentials or cannot be parsed'};
    results.push(result);
    console.log(`${result.outcome}: ${r.id} (URL withheld)`);
    return;
  }
  result.url=r.url;
  try {
    let response=await fetch(r.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(20000)});
    if ([405,501].includes(response.status)) {response=await fetch(r.url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(20000)});await response.body?.cancel();}
    result={...result,http_status:response.status,final_url:response.url,outcome:response.ok?'reachable':[404,410].includes(response.status)?'broken':'needs_review'};
  } catch(e) {result={...result,outcome:'needs_review',error:e.message};}
  results.push(result);
  console.log(`${result.outcome}: ${r.url}${result.http_status?' ('+result.http_status+')':''}`);
}
let index=0;
await Promise.all(Array.from({length:3},async()=>{while(index<list.length) await check(list[index++]);}));
await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/link-check.json',JSON.stringify(results,null,2)+'\n');
const counts=Object.fromEntries(['reachable','broken','needs_review'].map(k=>[k,results.filter(r=>r.outcome===k).length]));
console.log(JSON.stringify(counts));
// 403/429/5xx/timeouts remain reviewable warnings. Never rewrite editorial data automatically.
if (process.argv.includes('--strict') && counts.broken) process.exitCode=1;
