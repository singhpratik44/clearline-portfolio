(() => {
"use strict";
const root="https://singhpratik44.github.io/clearline-portfolio/learning/";
const campaigns=Object.freeze([
 {id:"nextdoor",label:"Nextdoor · parent introduction",platform:"Nextdoor business post",landing:"book/?track=roblox-worlds",body:"Does your child love games? What if they could start creating one?\n\nAPERTURE Learning offers independent, live 1-on-1 online coding instruction. We explore original projects in Scratch, Roblox and Python, with an emphasis on building, testing and explaining the code.\n\nOur one-time private coding/game-development lesson is $65 for 60 minutes. Subject, suitable instructor, scheduling and cancellation/refund terms must be confirmed before payment.\n\nExplore the Roblox project pathway: "},
 {id:"activityhero",label:"ActivityHero · online class description",platform:"Provider class listing draft",landing:"book/?track=scratch-stories",body:"APERTURE Learning — Private Online Coding & Game-Development Introduction\n\nFormat: live online, 60-minute private lesson. Learner creates or modifies a small original project under live instruction, works through a coding or design challenge, and receives an age-appropriate progress recap for their parent or guardian.\n\nPossible tools include Scratch, Roblox Studio or Python, depending on the learner's readiness and a qualified instructor's availability. A single lesson is $65; additional sessions are purchased separately. Specific subject, date/time, instructor, technical needs and refund/rescheduling terms are confirmed before enrollment. No guarantee of completing a full application in one lesson.\n\nSee learning directions and inquire: "},
 {id:"pta",label:"PTA · permission-based workshop offer",platform:"Email to an authorized council or unit organizer",landing:"catalog/?track=scratch-stories",body:"Subject: Request to share a free, parent-child coding demonstration\n\nHello,\n\nI operate APERTURE Learning, an independent project-based coding instruction initiative. Would your organization consider allowing a short, complimentary demonstration showing how a child can design, test and explain a simple interactive game or animation?\n\nWe would be happy to provide a sample agenda, instructor qualifications once confirmed, and a clear explanation of how the session would work. There is no required purchase, and we will follow your organization's outreach and child-safeguarding policies.\n\nSample pathway: "},
 {id:"coach",label:"Former coach · staffing inquiry",platform:"Private one-to-one email or message",landing:"",body:"Subject: Would you be interested in teaching with APERTURE Learning?\n\nHi,\n\nI'm establishing APERTURE Learning as an independent, live project-based coding program. I'm organizing personalized instruction around Scratch, Python, Roblox and age-appropriate AI literacy.\n\nWould you be open to discussing online private-session teaching? If so, I'd value knowing your strongest subjects, available days/times, preferred compensation arrangement, and any qualifications or resources you'd want us to provide. Before offering students, we'll confirm safeguarding, scheduling and scope together.\n\nThis is an invitation to discuss, not an assumption that you've joined. I'd be glad to reconnect."},
 {id:"school",label:"School program · vendor introduction",platform:"Permission-based program coordinator email",landing:"",body:"Subject: Coding and AI-literacy enrichment — vendor requirements inquiry\n\nHello,\n\nI'm exploring whether APERTURE Learning could be considered for age-appropriate enrichment workshops in introductory coding, game design, Python projects and responsible AI literacy.\n\nCould you share your current requirements for vendor approval, instructor screening, insurance, safeguarding, approved schedules, sample curriculum and procurement? We can prepare a scoped proposal and budget for review once eligibility and staffing are confirmed.\n\nWe are not representing ourselves as an existing partner of your school or district. Thank you for advising on the proper process."}
]);
const target=document.getElementById("launch-copy");
const select=document.getElementById("campaign-choice");
const area=document.getElementById("campaign-text");
const link=document.getElementById("campaign-target");
const copy=document.getElementById("campaign-copy");
const status=document.getElementById("campaign-status");
if(!target||!select||!area||!copy||!status)return;
for(const campaign of campaigns){
 const option=document.createElement("option");option.value=campaign.id;option.textContent=campaign.label;select.append(option);
}
function render(){
 const campaign=campaigns.find(c=>c.id===select.value)||campaigns[0];
 area.value=campaign.body+(campaign.landing?root+campaign.landing:"");
 link.href=campaign.landing?root+campaign.landing:"../#schools";
 link.textContent=campaign.landing?"Preview this campaign landing page ↗":"See APERTURE program scope ↗";
 status.textContent="Ready for review. Nothing is published or sent automatically.";
}
select.addEventListener("change",render);
copy.addEventListener("click",async()=>{
 const body=area.value;
 try{await navigator.clipboard.writeText(body);status.textContent="Copy prepared. Review details and posting rules before using it.";}
 catch(_){area.focus();area.select();status.textContent="Clipboard unavailable; the text is selected so you can copy it manually.";}
});
render();
})();