import {readData} from '../../src/lib/data.mjs';

const resources = new Map(readData('resources').map(r => [r.id,r]));
const recent = readData('weekly-picks').slice(-2).flatMap(p => p.resource_ids).map(id => resources.get(id));
const recentTopics = new Set(recent.flatMap(r => [...r.categories,r.region,...r.products]));
const novelty = r => [...r.categories,r.region,...r.products].filter(x => !recentTopics.has(x)).length;
const candidates = readData('candidates').map(c => resources.get(c.resource_id))
  .filter(r => r.status === 'active').sort((a,b) => novelty(b)-novelty(a) || a.id.localeCompare(b.id));
if (candidates.length) {
  // Rotate through the highest-ranked quarter so a single unreachable page does not starve the rest.
  const week = Math.floor(Date.parse(process.env.WATCH_DATE) / 604800000);
  const choice = candidates[week % Math.ceil(candidates.length / 4)];
  console.log(choice.url);
}
