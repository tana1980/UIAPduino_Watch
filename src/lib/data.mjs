import fs from 'node:fs';
import { parse } from 'yaml';
export const readData = (name) => parse(fs.readFileSync(new URL(`../../data/${name}.yml`, import.meta.url), 'utf8'));
export const resources = () => readData('resources').filter(r => r.status === 'active');
export const weekly = () => readData('weekly-picks');
export const categories = ['Official','Documentation','News','Tutorial','Project','GitHub','Article','SNS','Video','Event','Shop','Hardware','Library','Tool','Education'];
export const regions = ['Japan','Overseas','Global'];
export function canonicalUrl(value) {
  const u = new URL(value);
  u.hash = '';
  for (const key of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/.test(key)) u.searchParams.delete(key);
  u.searchParams.sort();
  return u.href.replace(/\/$/, '');
}
