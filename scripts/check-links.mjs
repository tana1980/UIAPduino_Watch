import fs from 'node:fs/promises';
import { resources } from '../src/lib/data.mjs';
const list=resources(), results=[];
async function check(r) {
  let result={id:r.id,url:r.url,checked_at:new Date().toISOString()};
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
