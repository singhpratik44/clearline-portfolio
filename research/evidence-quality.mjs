/** Pure evidence quality rules. No unsupported claims of peer review or causality. */
export function assessEvidence(record,{now=new Date()}={}){
  if(!record||typeof record!=="object")throw new TypeError("Evidence record required");
  const date=record.updated_at??record.published_at??null;
  const ms=date?Date.parse(date):NaN;
  const ageDays=Number.isFinite(ms)?Math.max(0,Math.floor((now.getTime()-ms)/86400000)):null;
  const flags=[];
  if(!record.url)flags.push("missing-source-url");
  if(!record.title)flags.push("missing-title");
  if(ageDays===null)flags.push("unknown-date");
  if(ageDays!==null&&ageDays>365)flags.push("stale-over-one-year");
  if(record.review_status?.includes("preprint"))flags.push("peer-review-unverified");
  if(!record.retrieved_at)flags.push("not-retrieved");
  return {id:record.id??null,age_days:ageDays,flags,ready_for_decision:flags.length===0};
}
export function evidenceGate(records,{now=new Date()}={}){
  if(!Array.isArray(records)||!records.length)return {allowed:false,reason:"No evidence",assessments:[]};
  const assessments=records.map(record=>assessEvidence(record,{now}));
  return {allowed:assessments.every(a=>a.ready_for_decision),reason:assessments.every(a=>a.ready_for_decision)?"Evidence metadata complete":"Evidence needs verification",assessments};
}
