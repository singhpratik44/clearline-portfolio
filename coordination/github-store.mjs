import { append, digest, parseLedger, validate } from './ledger.mjs';

/**
 * GitHub adapter contract:
 * read() => { content: string, sha: string }
 * write({content, sha}) => Promise<void>, where GitHub rejects stale blob SHA with 409/422.
 * Do not retry blindly: reread and revalidate the proposal against latest state.
 */
export async function appendWithCas(adapter, event, { maxAttempts = 3 } = {}) {
  validate(event);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw Error('Invalid attempt budget');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const snapshot = await adapter.read();
    if (!snapshot || typeof snapshot.content !== 'string' || typeof snapshot.sha !== 'string' || !snapshot.sha) throw Error('Invalid GitHub snapshot');
    const records = parseLedger(snapshot.content);
    if (records.some(x => x.id === event.id)) return { status:'already-recorded', attempts:attempt, stateHash:digest(records) };
    const updated = append(snapshot.content, event, digest(records));
    try {
      await adapter.write({ content:updated, sha:snapshot.sha });
      return { status:'appended', attempts:attempt, stateHash:digest(parseLedger(updated)) };
    } catch (error) {
      if (![409,422].includes(error?.status) && ![409,422].includes(error?.response?.status)) throw error;
      if (attempt === maxAttempts) throw Error('Concurrent write conflict; no confirmed append');
    }
  }
}
