import { createHash } from 'node:crypto';

const kinds = new Set(['discovered','verified','proposed','approved','submitted','confirmed','implemented','tested','blocked']);
const agents = new Set(['jobs','build']);
const authorities = new Set(['agent-proposal','owner-approved','provider-confirmed']);
const required = ['id','timestamp','agent','entity_id','kind','evidence_urls','depends_on','summary','authority'];
const privatePattern = /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b|(?:api[_-]?key|password|secret|token)\s*[:=])/i;

export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
export const encode = value => JSON.stringify(canonical(value));
export const decode = text => JSON.parse(text);
export const digest = value => createHash('sha256').update(encode(value)).digest('hex');
export function validate(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw Error('Event must be object');
  if (Object.keys(event).sort().join('|') !== required.slice().sort().join('|')) throw Error('Event fields mismatch');
  for (const key of ['id','entity_id','summary']) if (typeof event[key] !== 'string' || !event[key].trim()) throw Error('Invalid '+key);
  if (!agents.has(event.agent) || !kinds.has(event.kind) || !authorities.has(event.authority)) throw Error('Invalid enum');
  if (typeof event.timestamp !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(event.timestamp) || !Number.isFinite(Date.parse(event.timestamp))) throw Error('Invalid timestamp');
  for (const key of ['evidence_urls','depends_on']) if (!Array.isArray(event[key]) || !event[key].every(x => typeof x === 'string' && x.length > 0)) throw Error('Invalid '+key);
  if (!event.evidence_urls.every(url => { try { const u = new URL(url); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } })) throw Error('Invalid evidence URL');
  if (privatePattern.test(encode(event))) throw Error('Possible private information');
  if (['submitted','confirmed'].includes(event.kind) && event.authority !== 'provider-confirmed') throw Error('Submission requires provider confirmation');
  if (event.kind === 'approved' && event.authority !== 'owner-approved') throw Error('Approval requires owner authority');
  return true;
}
export function parseLedger(text) {
  const records = text.trim() ? text.trim().split('\n').map(line => decode(line)) : [];
  const ids = new Set();
  for (const record of records) {
    validate(record);
    if (ids.has(record.id)) throw Error('Duplicate event ID');
    for (const parent of record.depends_on) if (!ids.has(parent)) throw Error('Missing or future dependency');
    ids.add(record.id);
  }
  return records;
}
export function append(text, event, expectedHash = digest(parseLedger(text))) {
  const current = parseLedger(text);
  if (digest(current) !== expectedHash) throw Error('Stale ledger version');
  validate(event);
  if (current.some(x => x.id === event.id)) throw Error('Duplicate event ID');
  for (const parent of event.depends_on) if (!current.some(x => x.id === parent)) throw Error('Missing dependency');
  return [...current,event].map(encode).join('\n')+'\n';
}
export function project(records, agent) {
  if (!agents.has(agent)) throw Error('Invalid agent');
  return records.filter(x => x.agent === agent);
}
