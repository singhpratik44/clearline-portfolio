/**
 * A Quiet Journey — daily practice plan, deterministic and offline.
 *
 * "Day" uses the user's local ISO date, then UTC calendar math to avoid DST drift.
 * No spiritual score, streak penalty, generative scripture or prediction is made.
 * The SGGS reader is an independent external link, not an embedded quotation.
 */
const DAY_MS = 86_400_000;
export const STEP_TITLES = ["Arrive", "Read", "Reflect", "Live", "Release"];
export const STEP_LABELS = [
  "Settle into the present",
  "Approach a verified Gurbani reader",
  "Notice one honest answer",
  "Choose a concrete action",
  "Release the outcome"
];
const REFLECTIONS = Object.freeze([
  "What truth needs attention without judgment?",
  "Who helped you reach this moment, and have you thanked them?",
  "Where might a small act of service matter today?",
  "What would patience change in your next conversation?",
  "Where can you act with integrity rather than urgency?",
  "What is within your responsibility, and what can you release?",
  "How might you begin again without treating yesterday as a failure?"
]);
const ACTIONS = Object.freeze([
  "Name one fact clearly before taking action.",
  "Thank someone for a specific act of care.",
  "Do a useful, ordinary act of service without announcing it.",
  "Listen fully before offering advice.",
  "Keep one manageable promise you made.",
  "Take the next responsible step and let go of forcing a result.",
  "Return to a simple practice without shame or a streak."
]);
const FOCUS_INVITATIONS = Object.freeze({
  truth:"Notice what is true, and separate it from fear or assumption.",
  gratitude:"Recognize the people and gifts you might otherwise overlook.",
  seva:"Look for one real opportunity to help while respecting dignity.",
  courage:"Practice courage and humility together in one small choice.",
  stewardship:"Care responsibly for time, promises, people and resources.",
  stillness:"Leave room to observe without demanding immediate answers."
});

export function parseISODate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error("Expected YYYY-MM-DD");
  const [y,m,d] = iso.split("-").map(Number);
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) throw new Error("Invalid local date");
  const utc = new Date(Date.UTC(y,m-1,d));
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m-1 || utc.getUTCDate() !== d) throw new Error("Nonexistent local date");
  return utc;
}
export function formatISODate(date) {
  return date.toISOString().slice(0,10);
}
export function addCalendarMonths(iso,months) {
  if (!Number.isInteger(months) || months < 0 || months > 120) throw new Error("Invalid calendar duration");
  const original=parseISODate(iso);
  const first = new Date(Date.UTC(original.getUTCFullYear(), original.getUTCMonth()+months,1));
  const lastDay=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  first.setUTCDate(Math.min(original.getUTCDate(),lastDay));
  return formatISODate(first);
}
export function dailyWindow({start,today,months}) {
  if (![12,36,60,120].includes(months)) throw new Error("Unsupported journey");
  const startMs=parseISODate(start).getTime();
  const todayMs=parseISODate(today).getTime();
  const end=addCalendarMonths(start,months); // exclusive end at the same day in the final month
  const endMs=parseISODate(end).getTime();
  const totalDays=Math.round((endMs-startMs)/DAY_MS);
  const offset=Math.round((todayMs-startMs)/DAY_MS);
  const status=offset<0?"upcoming":offset>=totalDays?"complete":"active";
  const dayNumber=Math.max(1,Math.min(totalDays,offset+1));
  const dailyISO=status==="upcoming"?start:status==="complete"?formatISODate(new Date(endMs-DAY_MS)):today;
  let monthNumber=1;
  for(let i=1;i<months;i++) {
    const anniversary=parseISODate(addCalendarMonths(start,i)).getTime();
    if(anniversary<=parseISODate(dailyISO).getTime()) monthNumber=i+1;
    else break;
  }
  return {start,end,dayNumber,totalDays,dayISO:dailyISO,monthNumber,
    yearNumber:Math.floor((monthNumber-1)/12)+1,status,isCurrentDay:status==="active" && dailyISO===today};
}
export function dailyPlan({start,today,months,focus,minutes}){
  const window=dailyWindow({start,today,months});
  if(!(focus in FOCUS_INVITATIONS) || ![5,10,20,40].includes(minutes)) throw new Error("Invalid practice preferences");
  const i=(window.dayNumber-1)%7;
  const phase=["Notice","Practice","Integrate"][Math.floor((window.monthNumber-1)/12)%3];
  return {
    ...window,
    chapterPhase:phase,
    minutes,
    focus,
    prompt:REFLECTIONS[i],
    action:ACTIONS[i],
    focusInvitation:FOCUS_INVITATIONS[focus],
    // The step series is a scaffold, not a claim that a person has read scripture.
    steps:[
      {label:STEP_TITLES[0],description:"Be still. Your attention is enough to begin. Give yourself permission to arrive.",detail:"Set your own "+minutes+"-minute intention. You may sit, stand or move as is comfortable."},
      {label:STEP_TITLES[1],description:"Read or listen to a genuine Gurbani passage in an independent scripture resource.",detail:"Never treat an autogenerated prompt as Gurbani. The external reader opens only when you choose it."},
      {label:STEP_TITLES[2],description:REFLECTIONS[i],detail:FOCUS_INVITATIONS[focus]},
      {label:STEP_TITLES[3],description:ACTIONS[i],detail:"Choose a grounded action of care or responsibility. No one needs to know you completed it."},
      {label:STEP_TITLES[4],description:"The practice is an invitation, not a score.",detail:"Notice what you learned. Release any claim that a timer, app or payment measures spiritual worth."}
    ]
  };
}
