import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { resources } from '../src/lib/data.mjs';
const repo=process.env.GITHUB_REPOSITORY||'tana1980/info_uiapduino';
const name=repo.split('/')[1];
const base=process.env.BASE_PATH??(name.endsWith('.github.io')?'/':`/${name}/`);
const url=`http://127.0.0.1:4322${base}`;
const server=spawn(process.execPath,['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port','4322'],{stdio:['ignore','pipe','pipe'],env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}});
let output='';server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
let browser;
try {
  for(let i=0;i<100;i++) {try {if((await fetch(url)).ok)break;}catch {}if(i===99)throw Error('Preview did not start: '+output);await new Promise(r=>setTimeout(r,100));}
  const local='/usr/bin/chromium';
  const executablePath=process.env.CHROMIUM_PATH||(await fs.access(local).then(()=>local).catch(()=>undefined));
  browser=await chromium.launch({executablePath,args:['--no-sandbox']});
  const context=await browser.newContext();const page=await context.newPage();let errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const width of [390,1280]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['', 'resources/', 'about/']) {
      await page.goto(url+route);await page.waitForLoadState('networkidle');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow: ${route} @${width}`);
      const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],`accessibility: ${route} @${width}`);
    }
  }
  await page.goto(url+'resources/?category=Project');
  const visible=()=>page.locator('[data-resource]:visible').count();
  const list=resources();assert.equal(await visible(),list.filter(r=>r.categories.includes('Project')).length);
  await page.locator('[name=region]').selectOption('Japan');
  await page.locator('[name=language]').selectOption('ja');
  await page.locator('[name=product]').selectOption('UIAPduino Pro Micro CH32V003');
  await page.locator('[name=q]').fill('ピアノ');assert.equal(await visible(),1);
  await page.reload();assert.equal(await visible(),1);
  await page.locator('[name=q]').fill('no-such-resource-12345');assert.equal(await visible(),0);assert.equal(await page.locator('#empty').isVisible(),true);
  await page.getByRole('button',{name:'条件をクリア'}).click();await page.waitForFunction(()=>document.querySelector('[name=q]').value==='');await page.waitForTimeout(100);assert.equal(await visible(),list.length);
  await page.goto(url);await page.keyboard.press('Tab');assert.equal(await page.getByRole('link',{name:'本文へスキップ'}).evaluate(el=>el===document.activeElement),true);
  const ctx=await browser.newContext({javaScriptEnabled:false});const plain=await ctx.newPage();await plain.goto(url+'resources/');assert.equal(await plain.locator('[data-resource]:visible').count(),list.length);await ctx.close();
  await fs.mkdir('reports',{recursive:true});await page.setViewportSize({width:1280,height:900});await page.goto(url);await page.screenshot({path:'reports/home-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'reports/home-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log(`Browser smoke passed: 3 pages × 2 widths, WCAG A/AA, all filters, search, URL persistence, reset, keyboard, no-JS, subpath assets (${base}).`);
} finally {await browser?.close();server.kill('SIGTERM');}
