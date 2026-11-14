/**
 * APERTURE ∞ Strategy Ladder
 * Ten progressively higher-leverage questions, from outcomes to falsification.
 * This module is a deterministic planning aid, not an intelligence score or an AI model.
 * Does not transmit answers, store data, or authorize consequential actions.
 */
export const STRATEGY_QUESTIONS=Object.freeze([
 {id:"objective",tier:"Purpose",question:"What exact change in a real person's life should APERTURE produce within the next 30 days?",why:"An outcome is more useful than a product inventory.",evidence:"A concrete beneficiary, outcome metric, and review date."},
 {id:"actor",tier:"Reality",question:"Who can experience that change first, what do they need today, and what do they already use instead?",why:"Start with a specific real person or institution, not an imagined global audience.",evidence:"One reachable segment, current workflow, and verifiable pain."},
 {id:"proof",tier:"Evidence",question:"What is the strongest available proof that APERTURE can deliver the outcome—and what key claim is still unsupported?",why:"Distinguish demonstrated work from assumptions, reputation, and intention.",evidence:"A test, source, artifact, comparison, or verified outcome."},
 {id:"constraints",tier:"Constraint",question:"What is the binding constraint: buyer demand, permission, staffing, technical reliability, funds, distribution, or time?",why:"Removing the true constraint can outperform adding features.",evidence:"One constraint, its observed signal, and what would overturn the diagnosis."},
 {id:"counterfactual",tier:"Counterfactual",question:"If APERTURE disappeared tomorrow, how would the beneficiary solve this—and why would our approach be meaningfully better?",why:"Avoid building capabilities without a real alternative advantage.",evidence:"A specific substitute and one testable differentiation."},
 {id:"economics",tier:"Unit economics",question:"For one learner, one institution, or one paid project, what are the full costs, price, conversion rate, time-to-value, and evidence needed to claim success?",why:"A credible operating model needs measurable units and margins, not hypothetical millions.",evidence:"Price, variable cost, hours, conversion assumption and measured/unknown flags."},
 {id:"network",tier:"Network design",question:"Which two existing networks could exchange value through APERTURE without claiming an unapproved partnership or moving students' private data?",why:"The global map should connect complementary, consented workflows rather than display logos.",evidence:"Proposed nodes, roles, mutual benefit, permission and consent gates."},
 {id:"failure",tier:"Adversarial review",question:"What would a skeptical parent, school operator, security reviewer, or prospective buyer identify as our most dangerous false assumption?",why:"Failures are easier to catch before a public release or student impact.",evidence:"A falsifiable risk and a stop/reversal criterion."},
 {id:"experiment",tier:"Experiment",question:"What is the smallest reversible experiment we can run this week that could disprove the strategy before we invest heavily?",why:"Seek information gain, not activity or a feature-count quota.",evidence:"Owner, one-week cost, pass/fail metric, stop rule, and approval."},
 {id:"compounding",tier:"Compounding systems",question:"If the experiment succeeds, what reusable capability, evidence loop, and governance rule should compound across coding, sports, USPA discovery, and the global map without reducing human dignity?",why:"A civilization-scale ambition must grow from repeatable truth, safe incentives, and real outcomes.",evidence:"A portable capability, verified feedback loop, and explicit human oversight."}
]);
export function buildStrategyBrief(answers={},options={}){
 const normalize=(value)=>String(value??"").trim().slice(0,2000);
 const items=STRATEGY_QUESTIONS.map((q,i)=>({
  order:i+1,id:q.id,tier:q.tier,question:q.question,
  answer:normalize(answers[q.id]),evidenceRequired:q.evidence,
  status:normalize(answers[q.id])?"answered—unverified":"open"
 }));
 const completed=items.filter(i=>i.answer).length;
 const outstanding=items.filter(i=>!i.answer);
 return {
  title:"APERTURE ∞ — progressive strategy review",
  generatedAt:options.generatedAt||new Date().toISOString(),
  completed,total:items.length,
  status:completed===10?"answered—evidence review required":"incomplete",
  claims:"User answers are assumptions or proposals unless independent evidence is recorded.",
  decisions:items,
  firstOpenQuestion:outstanding[0]?.question||null,
  singleSmartestNextMove:completed===10
   ?"Select one reversible, permissioned experiment and define its owner, evidence, stop rule, and maximum cost before deployment."
   :"Answer the next open question, supplying evidence or explicitly marking the answer as an assumption.",
  externalActionsAuthorized:false
 };
}
export function formatStrategyReport(brief,agentReport=null){
 const lines=[
  brief.title,
  "Status: "+brief.completed+"/"+brief.total+" answered. "+brief.status+".",
  "No external actions authorized. Answers are not verified proof.",
  "",
  ...brief.decisions.flatMap(d=>[d.order+". ["+d.tier+"] "+d.question, "Answer: "+(d.answer||"Not supplied"),"Evidence to seek: "+d.evidenceRequired,""]),
  "Single smartest next move: "+brief.singleSmartestNextMove
 ];
 if(agentReport){
  lines.push("","Most recent local agent run: "+String(agentReport.generatedAt||"unknown"),
    "Agent decisions: "+(agentReport.results?.length||0),
    "Pass/review/hold: "+(agentReport.summary?.passed||0)+"/"+(agentReport.summary?.review||0)+"/"+(agentReport.summary?.held||0),
    "External actions: none",
    "Evidence ledger: "+(agentReport.ledgerDigest||"cryptographic digest not available"));
 }
 return lines.join("\n");
}