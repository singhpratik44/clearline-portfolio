(() => {
"use strict";
const tracks=window.AP_SUBJECTS||[];
const $=id=>document.getElementById(id);
const select=$("subject-select"),age=$("age-band"),ack=$("checkout-ack"),stripe=$("stripe-panel"),notice=$("payment-status");
const param=new URLSearchParams(location.search).get("track");
const valid=tracks.some(t=>t.id===param)?param:"scratch-stories";
tracks.forEach(t=>{
 const option=document.createElement("option");option.value=t.id;option.textContent=t.title;select.append(option);
});
select.value=valid;
function update(){
 const t=tracks.find(x=>x.id===select.value),band=age.value;
 if(!t)return;
 $("subject-heading").textContent=t.title;
 $("subject-summary").textContent=t.summary+" This is a proposed learning focus; a suitable instructor and lesson scope must be confirmed before checkout.";
 $("project-heading").textContent=t.output;
 $("subject-outcome").textContent=t.spark+" "+t.build;
 $("roadmap-link").href="../catalog/?track="+encodeURIComponent(t.id)+"#pathway";
 const lines=[
 "Hello APERTURE Learning,",
 "",
 "I would like to confirm a private lesson for the subject: "+t.title+".",
 "Preferred age band (no name): "+(band||"Not specified"),
 "Please confirm a qualified available instructor, lesson goals, scheduling options, written cancellation/refund terms, and whether the current $65 general Stripe lesson matches this subject.",
 "",
 "Please do not charge me or assign a session until we agree on the scope."
 ];
 $("availability-link").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent("APERTURE subject and coach availability: "+t.title)+"&body="+encodeURIComponent(lines.join("\n"));
 $("weekly-link").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent("APERTURE weekly request: "+t.title)+"&body="+encodeURIComponent("Hello,\n\nPlease confirm availability for weekly private lessons in "+t.title+"; age band: "+(band||"not specified")+". Please also confirm the specific recurring Stripe subscription link, full schedule, cancellation and rescheduling policy.\n");
 const isYoung=band==="4-6";
 const low=(band==="7-10"?7:band==="11-13"?11:band==="14-17"?14:0);
 const high=(band==="7-10"?10:band==="11-13"?13:band==="14-17"?17:0);
 const below=Boolean(band&&!isYoung&&high<t.min);
 const advanced=Boolean(band&&!isYoung&&t.level==="advanced"&&low<14);
 $("age-status").className="age-status"+(isYoung||below||advanced?" warning":"");
 $("age-status").textContent=!band?
 "Select the learner’s age band. For all subjects, please confirm a suitable coach before paying.":
 isYoung?"Ages 4–6: ask for an early-learner suitability assessment before buying. Secure checkout is hidden.":
 below?"This track is suggested for older learners (about "+t.min+"+). Contact us for a more appropriate starting path before paying.":
 advanced?"Advanced pathway: the instructor must confirm coding foundations and age appropriateness before this subject is assigned.":
 "Suggested age fit: "+t.min+"+. This is only guidance. Subject, coach availability and payment terms still need confirmation.";
 const allowed=Boolean(band&&!isYoung&&!below&&!advanced);
 ack.disabled=!allowed;
 if(!allowed)ack.checked=false;
 stripe.hidden=!(allowed&&ack.checked);
 if(!allowed){
   notice.textContent="Stripe checkout unavailable for this age/track combination until further discussion.";
 }else if(!ack.checked){
   notice.textContent="Checkout hidden. Confirm instructor availability, agreed terms and guardian authorization before opening Stripe.";
 }else{
   notice.textContent="Loading the official Stripe one-time $65 coding checkout…";
   window.AP_loadStripeCheckout().then(()=>{
     if(ack.checked&&!stripe.hidden){
       notice.textContent="Stripe checkout is ready. This is the general coding/game-development lesson; your subject choice is not automatically sent to Stripe.";
     }
   }).catch(()=>{
     stripe.hidden=true;
     notice.textContent="Stripe checkout could not load. No payment has been taken; please use the instructor inquiry and try again.";
   });
 }
 // Only a public specialization identifier is used in the address; never student data.
 const url=new URL(location.href);url.searchParams.set("track",t.id);
 history.replaceState(null,"",url.pathname+url.search+url.hash);
}
select.addEventListener("change",()=>{ack.checked=false;update();});
age.addEventListener("change",()=>{ack.checked=false;update();});
ack.addEventListener("change",update);
update();
})();