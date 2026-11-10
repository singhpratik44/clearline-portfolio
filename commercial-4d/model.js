/* APERTURE COMMERCIAL 4D — deterministic illustrative model, no external data. */
(function(root){
  "use strict";
  const VERTICALS=Object.freeze([
    {id:"sport",name:"Sports partnerships",short:"SPORTS",leads:18,close:.12,value:3200,margin:.42,hours:22,cycle:2,risk:.32},
    {id:"education",name:"Education contracts",short:"EDUCATION",leads:10,close:.15,value:6300,margin:.38,hours:38,cycle:3,risk:.26},
    {id:"franchise",name:"Franchise operations",short:"FRANCHISE",leads:14,close:.19,value:4900,margin:.46,hours:31,cycle:2,risk:.20},
    {id:"ai",name:"AI implementation",short:"AI DELIVERY",leads:12,close:.13,value:8200,margin:.53,hours:54,cycle:4,risk:.37}
  ]);
  const DEFAULTS=Object.freeze({capacity:190,investment:4500,closeLift:0,network:0.12,focus:"balanced",scenario:"base",startingCash:40000,fixedCosts:6000,horizon:24});
  const CASES={downside:{demand:.72,price:.94,extraRisk:.12},base:{demand:1,price:1,extraRisk:0},upside:{demand:1.21,price:1.04,extraRisk:-.05}};
  const safe=(value,fallback,min,max)=>{const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};
  function normalize(cfg){
    const o=Object.assign({},DEFAULTS,cfg||{});
    o.capacity=safe(o.capacity,190,20,1000);
    o.investment=safe(o.investment,4500,0,20000);
    o.closeLift=safe(o.closeLift,0,0,.5);
    o.network=safe(o.network,.12,0,.8);
    o.startingCash=safe(o.startingCash,40000,0,500000);
    o.fixedCosts=safe(o.fixedCosts,6000,0,50000);
    o.horizon=Math.round(safe(o.horizon,24,6,36));
    if(!CASES[o.scenario])o.scenario="base";
    if(o.focus!=="balanced"&&!VERTICALS.some(v=>v.id===o.focus))o.focus="balanced";
    return o;
  }
  function simulate(input){
    const c=normalize(input),caseData=CASES[c.scenario];
    const history=[];let cash=c.startingCash;const totals=Object.fromEntries(VERTICALS.map(v=>[v.id,{revenue:0,deals:0,hours:0,unserved:0}]));
    for(let month=0;month<=c.horizon;month++){
      if(month===0){
        history.push({month,cash,revenue:0,contribution:0,net:0,utilization:0,unserved:0,segments:VERTICALS.map(v=>({id:v.id,name:v.name,deals:0,planned:0,revenue:0,hours:0,risk:v.risk}))});
        continue;
      }
      let remainingHours=c.capacity;
      const candidates=VERTICALS.map(v=>{
        const ramp=Math.min(1,month/Math.max(1,v.cycle));
        const growth=1+Math.min(.5,(c.investment/9000)*Math.log1p(month)*.32);
        const partnerGain=1+c.network*(v.id==="sport"||v.id==="education"?.75:.40);
        const planned=v.leads*v.close*(1+c.closeLift)*caseData.demand*ramp*growth*partnerGain;
        const score=(v.value*caseData.price*v.margin/v.hours)*(c.focus===v.id?1.55:1)*(1-v.risk*.18);
        return {v,planned,score};
      }).sort((a,b)=>b.score-a.score);
      const segments=[];
      for(const item of candidates){
        const v=item.v;
        const deals=Math.min(item.planned,remainingHours/v.hours);
        remainingHours=Math.max(0,remainingHours-deals*v.hours);
        const revenue=deals*v.value*caseData.price;
        totals[v.id].revenue+=revenue;totals[v.id].deals+=deals;totals[v.id].hours+=deals*v.hours;totals[v.id].unserved+=Math.max(0,item.planned-deals);
        segments.push({id:v.id,name:v.name,deals,planned:item.planned,revenue,hours:deals*v.hours,risk:Math.max(.05,v.risk+caseData.extraRisk)});
      }
      segments.sort((a,b)=>VERTICALS.findIndex(v=>v.id===a.id)-VERTICALS.findIndex(v=>v.id===b.id));
      const revenue=segments.reduce((sum,s)=>sum+s.revenue,0);
      const contribution=segments.reduce((sum,s)=>sum+s.revenue*VERTICALS.find(v=>v.id===s.id).margin,0);
      const net=contribution-c.fixedCosts-c.investment;
      cash+=net;
      history.push({month,cash,revenue,contribution,net,utilization:1-remainingHours/c.capacity,unserved:segments.reduce((sum,s)=>sum+s.planned-s.deals,0),segments});
    }
    const month=history[history.length-1];const cumulativeRevenue=history.reduce((sum,m)=>sum+m.revenue,0);
    const cumulativeNet=history.reduce((sum,m)=>sum+m.net,0);
    const flags=[];
    if(history.some(m=>m.cash<0))flags.push("Cash crosses below zero under these assumptions");
    if(month.utilization>.93)flags.push("Capacity saturation constrains upside");
    if(month.unserved>1)flags.push("Opportunity demand exceeds available delivery hours");
    if(c.scenario==="upside")flags.push("Upside scenario is an assumption, not a probability");
    if(!flags.length)flags.push("No modeled hard constraint breach; external risks remain unmodeled");
    return {config:c,history,totals,summary:{cumulativeRevenue,cumulativeNet,endingCash:month.cash,monthRevenue:month.revenue,monthNet:month.net,utilization:month.utilization,unserved:month.unserved,flags}};
  }
  function variations(input){
    const cfg=normalize(input);
    return Object.fromEntries(["downside","base","upside"].map(k=>[k,simulate({...cfg,scenario:k})]));
  }
  function recommendations(result){
    const s=result.summary,c=result.config,ideas=[];
    if(s.endingCash<10000||result.history.some(m=>m.cash<0))ideas.push({priority:"Critical",title:"Protect runway before growing spend",reason:"The scenario puts cash close to or below the modeled safety floor.",action:"Validate receivables, reduce discretionary spend and require an owner-approved recovery plan."});
    if(s.utilization>.90)ideas.push({priority:"High",title:"Add delivery capacity before lead volume",reason:"The modeled pipeline competes for scarce delivery hours.",action:"Pilot contract instructors or delivery partners with verified rates, availability and quality gates."});
    else ideas.push({priority:"High",title:"Test a narrower conversion experiment",reason:"Underused capacity may make new demand valuable before additional hiring.",action:"Run one buyer segment, define baseline response and close rates, then compare 30-day results."});
    if(c.network>.25)ideas.push({priority:"Medium",title:"Validate referral economics and permissions",reason:"Partner effects are modeled assumptions, not signed contracts.",action:"Confirm attributable lead definitions, approved outreach wording, written terms and payment triggers."});
    if(c.focus!=="balanced")ideas.push({priority:"Medium",title:"Check portfolio concentration",reason:"Focused capacity allocation can suppress otherwise profitable verticals.",action:"Compare the selected focus to balanced and downside cases before committing."});
    ideas.push({priority:"Required",title:"Convert assumptions into evidence",reason:"Forecast values here are illustrative; no live CRM, accounting or staffing source is connected.",action:"Import verified commercial facts with source date, consent, confidence and validation owner."});
    return ideas.slice(0,5);
  }
  root.AP4DModel={VERTICALS,DEFAULTS,CASES,normalize,simulate,variations,recommendations};
  if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DModel;
})(typeof globalThis!=="undefined"?globalThis:this);
