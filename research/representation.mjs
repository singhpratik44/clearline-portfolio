// Clearline experimental reversible representation module.
// This is ordinary deterministic computing, not quantum hardware or evidence of a quantum speedup.
export const SCHEMA = "clearline.scenario.v1";
const KEYS = ["conversion","demand","follow","hours","revenue"];
export function validate(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) throw Error("Expected state object");
  if (Object.keys(state).sort().join(",") !== KEYS.join(",")) throw Error("State keys do not match schema");
  for (const key of KEYS) {
    if (!Number.isSafeInteger(state[key]) || state[key] < 0) throw Error("Invalid "+key);
  }
  if (state.follow > 100 || state.conversion > 100) throw Error("Percentage out of range");
  return state;
}
export function encode(state) {
  validate(state);
  // Ordered array is a bijective representation for this explicitly versioned schema.
  return { schema: SCHEMA, values: KEYS.map(k => state[k]) };
}
export function decode(record) {
  if (!record || record.schema !== SCHEMA || !Array.isArray(record.values) || record.values.length !== KEYS.length) throw Error("Unsupported representation");
  const state = Object.fromEntries(KEYS.map((k,i) => [k,record.values[i]]));
  return validate(state);
}
export function equivalent(a,b) {
  return JSON.stringify(encode(a)) === JSON.stringify(encode(b));
}
export function compute(state) {
  validate(state);
  const served = Math.min(state.demand,state.hours);
  const rate = state.conversion / 100 * (0.5 + 0.5 * state.follow / 100);
  const enrolled = served * rate;
  return {served,unserved:state.demand-served,enrolled,income:enrolled*state.revenue,rate};
}
export function roundTripCertificate(state) {
  const encoded=encode(state), reconstructed=decode(encoded);
  return {schema:SCHEMA,representation:encoded,reconstructed,roundTripPassed:equivalent(state,reconstructed),outputPreserved:JSON.stringify(compute(state))===JSON.stringify(compute(reconstructed))};
}
