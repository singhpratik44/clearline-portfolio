const CHAPTERS = [
  ["The art of arriving","Begin where you are.","What is asking for your honest attention in this season?","Set aside a quiet moment to name one truthful intention."],
  ["A clearer window","Notice without judgment.","Which assumption are you ready to examine gently?","Listen before responding to one difficult situation."],
  ["The ground of truth","Make room for what is real.","Where does truth require more courage than appearance?","Write a fact separately from the story you tell about it."],
  ["Small gratitudes","Honor what is already here.","What has supported you that you rarely stop to appreciate?","Thank someone without expecting a response."],
  ["The practice of humility","Release the need to perform.","Where might you learn by admitting you do not know?","Ask a sincere question and listen to the answer."],
  ["The space between","Be present before acting.","What becomes clearer when you do not rush to fill silence?","Create one uninterrupted quiet interval today."],
  ["A softer response","Choose care under pressure.","Which relationship would benefit from patience?","Offer a thoughtful response rather than a quick reaction."],
  ["The limits of control","Distinguish care from control.","What responsibility is yours, and what cannot be forced?","Name one useful action and release one impossible demand."],
  ["Courage in motion","Take the next honest step.","What have you postponed because it is uncomfortable?","Make one small, responsible move toward it."],
  ["The ethics of enough","Hold resources with care.","Where can you be more transparent or fair?","Fulfill one concrete obligation you have made."],
  ["A life of service","Give without performance.","Who could benefit from your time and attention?","Offer practical help while respecting another person's dignity."],
  ["A year of noticing","Return and reflect.","What has changed in what you notice, not what you claim to have achieved?","Revisit a reflection and write what you now understand."],
  ["Practice over intention","Let intention become action.","Which value would someone recognize from your choices?","Choose a small repeatable action that expresses your value."],
  ["The discipline of listening","Hear what is difficult.","When do you listen only to prepare a reply?","Invite someone to finish their thought without interruption."],
  ["Truth in relationship","Speak clearly and gently.","What truth needs both honesty and compassion?","Say one thing directly and respectfully."],
  ["Generosity of attention","Give the gift of presence.","What has divided your attention from the people around you?","Offer someone ten minutes without distractions."],
  ["Repair and forgiveness","Make space for repair.","Where is an apology or boundary more useful than blame?","Consider a safe, respectful step toward repair."],
  ["A steadier rhythm","Build an honest cadence.","What kind of daily practice can you sustain without resentment?","Make your quiet time small enough to repeat."],
  ["Kindness under stress","Find gentleness in difficulty.","How might you respond to uncertainty with steadiness?","Pause before one stressful decision."],
  ["Service in community","Consider the whole.","Where do your decisions affect people you may never meet?","Support one local or shared need."],
  ["Learning through correction","Welcome a better understanding.","Which feedback would help you act more wisely?","Ask for constructive feedback and consider it carefully."],
  ["Stewardship in practice","Make responsibility visible.","What promise needs better follow-through?","Write down and honor a specific commitment."],
  ["A courageous kindness","Protect without hardening.","How can you practice courage without losing tenderness?","Do something helpful that requires a little courage."],
  ["A year of practicing","Notice what your actions teach.","Which habits have been valuable and which need a new shape?","Reflect on actions, not streaks or external scores."],
  ["Living the question","Do not hurry the answer.","Which important question can remain open for now?","Spend time considering rather than resolving it."],
  ["A generous perspective","See beyond yourself.","Whose view have you not yet seriously considered?","Ask a person what they wish you understood."],
  ["Truth through change","Keep your center while changing.","What principle remains steady as circumstances shift?","Name a principle you want to practice today."],
  ["A practice of gratitude","Recognize quiet abundance.","Who or what helped bring you to this moment?","Offer specific thanks without turning it into a transaction."],
  ["Humility with strength","Hold conviction without ego.","When could being right become less important than being useful?","Seek understanding before defending a position."],
  ["Peace in unfinished work","Accept imperfection honestly.","What can you carry with care without solving immediately?","Give an unfinished concern a bounded place in your day."],
  ["A wider compassion","Let your circle expand.","Who is affected by a choice that feels personal?","Make one small decision with broader care."],
  ["Practical faithfulness","Honor small promises.","Which promise matters precisely because it is ordinary?","Complete a manageable responsibility."],
  ["Serving in the long view","Think beyond this moment.","What good can you sustain rather than announce?","Contribute quietly to something larger than yourself."],
  ["The wisdom of return","Begin again without shame.","What has this journey taught you about returning after pauses?","Offer yourself permission to restart today."],
  ["An open horizon","Leave space for becoming.","Which values should guide the next chapter of your life?","Write a letter to your future self, without predictions."],
  ["Three years, many beginnings","The journey remains open.","What would you keep, release, or begin anew?","Honor what was real. Choose your next simple practice."]
];
const MONTHS=36;
const steps=[
  ["Attention","What is verifiably true about this month's experience? Write facts before interpretations."],
  ["Humility","Where might pride, avoidance, or impatience obscure what needs care?"],
  ["Practice","Name one voluntary, concrete, reversible action that expresses your intention."],
  ["Service","Who or what could benefit from your time or practical help? Respect others' boundaries."],
  ["Release","What outcome can you stop forcing while still acting responsibly?"]
];
function node(tag,klass,text){const el=document.createElement(tag);if(klass)el.className=klass;if(text!==undefined)el.textContent=text;return el;}
function blankLines(parent,count){for(let i=0;i<count;i++)parent.append(node("div","write-line"));}
const list=document.getElementById("months");
for(let i=0;i<MONTHS;i++){
 const item=CHAPTERS[i],year=Math.floor(i/12)+1;
 const section=node("section","month-sheet");
 section.append(node("p","overline","YEAR "+year+" · MONTH "+String(i+1).padStart(2,"0")+" OF 36"));
 section.append(node("h2","",item[0]));
 section.append(node("p","chapter-lead",item[1]));
 section.append(node("p","chapter-prompt","Personal reflection: "+item[2]));
 blankLines(section,3);
 const actions=node("div","practice-grid");
 for(const [heading,prompt] of steps){
    const card=node("div","practice-cell");card.append(node("h3","",heading));card.append(node("p","",prompt));blankLines(card,2);actions.append(card);
 }
 section.append(actions);
 const note=node("div","month-action");note.append(node("h3","","A small invitation"));note.append(node("p","",item[3]));blankLines(note,2);
 section.append(note);
 section.append(node("p","month-footer","An optional personal practice · Not an indication of spiritual standing"));
 list.append(section);
}
const reviews=document.getElementById("reviews");
for(let quarter=1;quarter<=12;quarter++){
 const s=node("section","review-sheet");
 s.append(node("p","overline","QUARTER "+String(quarter).padStart(2,"0")+" · YEAR "+(Math.floor((quarter-1)/4)+1)));
 s.append(node("h2","","A season of returning"));
 s.append(node("p","chapter-lead","There are no streak penalties, predictions or required confessions."));
 for(const [heading,question] of [
   ["What I noticed","What was true in these three months?"],
   ["Where I practiced","Which concrete actions supported care or responsibility?"],
   ["What needs repair","Is there a truthful, safe and respectful next step?"],
   ["What I can release","What outcome is not mine to control?"],
   ["The next season","What manageable intention will I carry forward?"]]){
   const div=node("div","review-prompt");div.append(node("h3","",heading));div.append(node("p","",question));blankLines(div,3);s.append(div);
 }
 s.append(node("p","month-footer","A reflection, not a score"));
 reviews.append(s);
}
document.getElementById("printWorkbook").addEventListener("click",()=>window.print());
