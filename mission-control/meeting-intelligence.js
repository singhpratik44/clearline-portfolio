/* APERTURE / MEETING INTELLIGENCE — deterministic, no AI, network or external writes. */
(function(root){
"use strict";
const C=root.ApertureMission;
if(!C)throw Error("Mission core required");
function prepare(raw,id,now=new Date()){
 const s=C.normalize(raw),m=s.meetings.find(x=>x.id===id);
 if(!m)throw Error("Unknown meeting");
 const p=s.projects.find(x=>x.id===m.projectId);
 const metric=C.metrics(s,now);
 const tasks=s.tasks.filter(t=>t.projectId===m.projectId);
 const unresolved=tasks.filter(t=>t.status!=="done");
 const blocked=unresolved.filter(t=>metric.blockedIds.includes(t.id));
 const overdue=unresolved.filter(t=>t.due&&t.due<now.toISOString().slice(0,10));
 const decisions=s.proposals.filter(q=>q.projectId===m.projectId&&q.status==="pending");
 const related=tasks.filter(t=>t.meetingId===id);
 const sorted=[...unresolved].sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999"));
 const lines=[
  "# APERTURE / PRE-MEETING INTELLIGENCE",
  "",
  s.sample?"**SYNTHETIC DEMONSTRATION — NO REAL MEETING OR PROJECT RECORDS**":"**PRIVATE LOCAL WORKSPACE — VERIFY ALL EVIDENCE BEFORE SHARING**",
  "",
  "Meeting: "+m.title,
  "Project: "+p.name,
  "When: "+m.startsAt,
  "Facilitator: "+(m.owner||"Unassigned"),
  "Project outcome: "+(p.goal||"Not specified"),
  "Agenda: "+(m.agenda||"Not specified"),
  "",
  "## Evidence to bring",
  "- Confirm actual project progress against source records; local statuses are user-entered.",
  "- Verify owners, deadlines, and whether blockers remain open.",
  "- Ask which decisions need explicit approval; do not assume a discussion creates a commitment.",
  "",
  "## Execution signals",
  "Open tasks: "+unresolved.length+"; blocked: "+blocked.length+"; overdue: "+overdue.length+"; unreviewed decisions: "+decisions.length,
  "",
  "### Blocked tasks",
  ...(blocked.length?blocked.map(t=>"- "+t.title+" — waiting for "+t.blockedBy.filter(x=>s.tasks.find(y=>y.id===x)?.status!=="done").map(x=>s.tasks.find(y=>y.id===x)?.title||x).join("; ")):["- None identified"]),
  "",
  "### Overdue tasks",
  ...(overdue.length?overdue.map(t=>"- "+t.title+" — due "+t.due+" — owner "+(t.owner||"Unassigned")):["- None identified"]),
  "",
  "### Next unresolved commitments",
  ...sorted.slice(0,7).map(t=>"- "+t.title+" — "+(t.owner||"Unassigned")+" — "+(t.due||"no due date")+" — "+t.status),
  "",
  "## Decisions awaiting review",
  ...(decisions.length?decisions.map(q=>"- "+q.title+" — owner "+q.owner+" — cited source: "+q.source):["- None"]),
  "",
  "## Previous actions from this meeting",
  ...(related.length?related.map(t=>"- "+t.title+" — "+t.status):["- No approved tasks linked to this meeting"]),
  "",
  "## Suggested questions (not inferred facts)",
  "1. What changed since the last update, and what is the evidence?",
  "2. Which predecessor can be resolved by an accountable owner?",
  "3. Which proposed decision needs a named reviewer?",
  "4. What should explicitly remain unapproved?",
  "5. Which measurable outcome will we inspect at the next meeting?",
  "",
  "## Human review / external action boundary",
  "This briefing is generated only from local user-entered project records. It is not a meeting transcript, calendar sync, or factual verification. No invitation, email, or task was sent to an external provider."
 ];
 return {meetingId:id,projectId:m.projectId,blocked:blocked.map(t=>t.id),overdue:overdue.map(t=>t.id),pending:decisions.map(q=>q.id),markdown:lines.join("\n")};
}
root.ApertureMeetingIntelligence={prepare};
})(typeof globalThis!=="undefined"?globalThis:this);
