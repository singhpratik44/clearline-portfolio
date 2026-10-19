import { digest, parseLedger } from './ledger.mjs';

/** Derive all views from the same immutable event sequence. */
export function views(text) {
  const records=parseLedger(text);
  const byEntity=new Map();
  for(const event of records) {
    const list=byEntity.get(event.entity_id)||[];
    list.push(event);
    byEntity.set(event.entity_id,list);
  }
  const entities=[...byEntity].sort(([a],[b])=>a.localeCompare(b)).map(([id,events])=>({
    id,
    latest:events.at(-1).kind,
    events:events.map(e=>e.id),
    unresolved:events.at(-1).kind==='blocked',
    evidence:[...new Set(events.flatMap(e=>e.evidence_urls))].sort()
  }));
  return {version:digest(records),events:records.length,entities,
    jobs:records.filter(e=>e.agent==='jobs').map(e=>e.id),
    build:records.filter(e=>e.agent==='build').map(e=>e.id)};
}
export function explain(text, entityId) {
  const records=parseLedger(text), map=new Map(records.map(e=>[e.id,e]));
  const roots=records.filter(e=>e.entity_id===entityId);
  const included=new Set();
  function walk(id) {if(included.has(id))return;const e=map.get(id);if(!e)throw Error('Unknown event');included.add(id);for(const p of e.depends_on)walk(p);}
  for(const e of roots)walk(e.id);
  return records.filter(e=>included.has(e.id));
}
