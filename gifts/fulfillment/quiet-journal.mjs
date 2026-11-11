/**
 * APERTURE Quiet Practice: checkout-verified 21-day journal PDF.
 *
 * The PDF is dynamically assembled by the private service, never hosted as a
 * downloadable static file. The educational text itself is not DRM-protected;
 * the paid entitlement licenses the professionally formatted PDF.
 */
const LINK = 'plink_1UaTfeRuy3ohymOHLkzMJK3n';
const PRICE = 1900;

export const DAYS = Object.freeze([
  ['Make room', 'What is taking up the most space in your mind today?',
    'Find five things you can see, four you can feel, three you can hear, two you can smell, and one you can taste.',
    'Clear a small physical space, such as a table or desk.'],
  ['Name the weather', "If today's feeling were weather, what would it look like?",
    'Name one emotion and where you notice it in your body. You do not need to change it.',
    'Drink a glass of water slowly.'],
  ['A kinder voice', "What would you say to a friend experiencing today's difficulty?",
    'Rewrite one harsh self-statement into a neutral and factual sentence.',
    'Use that new sentence once today.'],
  ['The controllable circle', 'Which part of your current challenge can you influence?',
    'Draw two circles: within my control and outside my control. Place concerns accordingly.',
    'Choose one step from the inner circle.'],
  ['Energy budget', 'Which activities give or drain your energy?',
    'Sort tasks into urgent, can wait, and optional. Let one optional task go.',
    'Protect ten minutes without demands.'],
  ['Return to the senses', 'What helps you feel present without explaining anything?',
    'Observe a simple object for 60 seconds: shape, texture, color, light.',
    'Take a short sensory break.'],
  ['One-week check-in', 'What patterns have you noticed across this first week?',
    'Circle a feeling that recurred. Ask what need might be underneath it.',
    'Celebrate one effort, not an outcome.'],
  ['Boundaries', 'Where do you need a little more space or clarity?',
    'Practice: I can do X, but I cannot do Y right now.',
    'Set one gentle boundary.'],
  ['Values before goals', 'Which value do you want to live by this week?',
    'Choose care, honesty, courage, curiosity, patience, or your own value.',
    'Take one five-minute value-aligned action.'],
  ['Rest without earning it', 'What makes rest feel difficult or easy for you?',
    'Notice any thought that rest must be deserved. Label it a thought.',
    'Plan a short restorative pause.'],
  ['Stories and facts', 'What story are you telling yourself about an event?',
    'Write observable facts, then list two alternative explanations.',
    'Ask one curious question instead of assuming.'],
  ['Connection', 'Who helps you feel more like yourself?',
    'Consider a low-pressure connection: a text, smile, or shared activity.',
    'Reach out if safe and welcome.'],
  ['Compassionate repair', 'What small mistake can you learn from without punishing yourself?',
    'Write what happened, what matters, and what you will do differently.',
    'Make one proportionate repair, if appropriate.'],
  ['Two-week check-in', 'What has changed, even slightly, since day one?',
    'Review which practices felt supportive. Cross out what did not fit.',
    'Pick one practice to repeat.'],
  ['Uncertainty', 'What is uncertain, and what is certain today?',
    'Use this sentence: I do not know X yet; I do know Y.',
    'Take the next helpful step you can name.'],
  ['Everyday courage', 'What is one small thing you did despite discomfort?',
    'Notice the distinction between fear and danger. Never override safety signals.',
    'Acknowledge one act of courage.'],
  ['Body respect', 'What does your body need from you today?',
    'Try a gentle body scan, stopping if uncomfortable. Notice without forcing.',
    'Adjust posture, hydrate, or rest.'],
  ['Tiny joy', 'What ordinary moment has felt good recently?',
    'Write three specific sensory details about that moment.',
    'Revisit one harmless pleasure.'],
  ['Support map', 'What kind of help is reasonable to ask for?',
    'Make three columns: self-support, people, professional resources.',
    'Draft one specific help request.'],
  ['Next week, realistically', 'What routine would support you without another burden?',
    'Choose one cue, one tiny action, and one flexible time.',
    'Create a two-minute starter ritual.'],
  ['Carry forward', 'What would you like to remember on a hard day?',
    'Make a personal return-to-center card: notice, breathe, connect, act.',
    'Write a note to your future self.'],
]);

export async function verifyQuietPurchase(sessionId, {secret = process.env.STRIPE_SECRET_KEY, fetchFn = globalThis.fetch} = {}) {
  if(typeof sessionId !== 'string' || !/^cs_live_[A-Za-z0-9_]{10,256}$/.test(sessionId))
    return {ok:false,status:400,code:'invalid_session_id'};
  if(typeof secret !== 'string' || !/^(sk|rk)_live_/.test(secret))
    return {ok:false,status:503,code:'fulfillment_unavailable'};
  let reply;
  try {
    reply = await fetchFn('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
      method:'GET',
      headers:{Authorization:'Bearer '+secret,Accept:'application/json'},
      cache:'no-store',
      signal:AbortSignal.timeout(8000),
    });
  } catch(_e) { return {ok:false,status:502,code:'stripe_unavailable'}; }
  if(!reply?.ok) return {ok:false,status:reply?.status===404?403:502,code:'payment_unverified'};
  let s;
  try {s=await reply.json();}catch(_e){return {ok:false,status:502,code:'stripe_response_invalid'};}
  const paymentLink=typeof s?.payment_link==='string'?s.payment_link:s?.payment_link?.id;
  if(s?.status!=='complete' || s?.payment_status!=='paid' || s?.livemode!==true ||
    s?.mode!=='payment' || s?.currency!=='usd' || s?.amount_total!==PRICE ||
    paymentLink!==LINK || s?.amount_total<=0)
    return {ok:false,status:403,code:'payment_not_authorized'};
  return {ok:true,status:200};
}

/** PDF text is rendered as searchable standard PDF Type1 text; no dependencies. */
function pdfText(s) {
  return String(s).normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\x20-\x7e]/g,'-')
    .replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)');
}
function wrap(s, maxWidth=81) {
  const words=String(s).split(/\s+/);
  const out=[];let cur='';
  for(const word of words){
    if(cur.length+word.length+1>maxWidth && cur){out.push(cur);cur=word;}
    else cur=cur?cur+' '+word:word;
  }
  if(cur)out.push(cur);
  return out;
}
function pageBase(n) {
  const parts=['0.988 0.979 0.958 rg 0 0 612 792 re f',
    '0.25 0.38 0.30 RG 0.5 w 55 53 m 557 53 l S'];
  parts.push('0.18 0.34 0.25 rg BT /F1 8 Tf 55 37 Td (APERTURE QUIET PRACTICE | PERSONAL REFLECTION) Tj ET');
  parts.push('BT /F1 8 Tf 500 37 Td ('+pdfText('PAGE '+String(n).padStart(2,'0')+'/25')+') Tj ET');
  return parts;
}
function draw(parts, txt, x, y, {font='F1',size=11,leading=19,max=83,color='0.16 0.24 0.20'}={}) {
  let at=y;
  for(const line of wrap(txt,max)){
    parts.push(color+' rg BT /'+font+' '+size+' Tf 1 0 0 1 '+x+' '+at+' Tm ('+pdfText(line)+') Tj ET');
    at-=leading;
  }
  return at;
}
function drawLines(parts, y, count=4) {
  parts.push('0.82 0.87 0.82 RG 0.65 w');
  for(let i=0;i<count;i++)parts.push('64 '+(y-i*32)+' m 548 '+(y-i*32)+' l S');
}
function cover() {
  let p=pageBase(1);
  p.push('0.30 0.49 0.37 rg 519 669 35 0 360 arc'); // This non-standard arc is omitted below.
  p.pop();
  p.push('0.72 0.56 0.36 rg 55 612 45 4 re f');
  draw(p,'A SMALL DAILY PRACTICE',55,586,{font:'F3',size:11,color:'0.30 0.49 0.37'});
  draw(p,'21 Days of',55,508,{font:'F2',size:38,max:35});
  draw(p,'Reflection',55,460,{font:'F2',size:38,max:35});
  draw(p,'A gentle, self-paced journal for noticing what matters, making room for emotions, and taking one realistic next step.',55,397,{size:12,leading:24,max:74});
  p.push('0.90 0.94 0.88 rg 55 180 500 142 re f');
  draw(p,'A note before beginning',73,287,{font:'F3',size:14,max:45});
  draw(p,'This educational self-reflection workbook is not psychotherapy, diagnosis, or emergency care. Skip any exercise that feels unhelpful. For distress, consider a licensed mental health professional. In the US, call or text 988 in a crisis; call 911 for immediate danger.',73,261,{size:10,leading:18,max:84});
  return p;
}
function instructions() {
  const p=pageBase(2);
  draw(p,'How to use this journal',55,710,{font:'F2',size:26,max:60});
  draw(p,'The goal is consistency, not perfection. Spend five to ten minutes a day or return whenever you need. Nothing in this workbook has to be completed.',55,662,{size:12,max:82});
  const steps=[
    ['1   Arrive', 'Put both feet on the floor and orient to the space around you.'],
    ['2   Notice', 'Name a feeling without arguing with it.'],
    ['3   Reflect', 'Use the prompts, draw, or write a few words.'],
    ['4   Act', 'Choose one realistic action you can finish today.'],
    ['5   Release', 'You can stop. A missed day is not a failure.'],
  ]; let y=556;
  for(const [head,body] of steps){
    draw(p,head,57,y,{font:'F3',size:13,color:'0.30 0.49 0.37'});
    draw(p,body,57,y-24,{size:11,max:80});
    y-=85;
  }
  p.push('0.90 0.94 0.88 rg 55 98 500 68 re f');
  draw(p,'Privacy: store your notes where only you can access them. Avoid writing sensitive information on a shared device. You may skip anything that feels unsafe.',70,143,{size:10,max:81});
  return p;
}
function day(n,d) {
  const p=pageBase(n+2);
  const [title,prompt,skill,action]=d;
  draw(p,'DAY '+String(n).padStart(2,'0')+' OF 21',55,733,{font:'F3',size:11,color:'0.68 0.48 0.27'});
  draw(p,title,55,690,{font:'F2',size:27,max:45});
  p.push('0.82 0.87 0.82 RG 0.8 w 55 664 m 557 664 l S');
  draw(p,"TODAY'S NOTICING PROMPT",55,625,{font:'F3',size:10,color:'0.30 0.49 0.37'});
  draw(p,prompt,55,595,{font:'F1',size:13,leading:22,max:72});
  drawLines(p,523,4);
  draw(p,'TRY THIS SKILL',55,361,{font:'F3',size:10,color:'0.30 0.49 0.37'});
  draw(p,skill,55,332,{size:11,leading:20,max:83});
  p.push('0.90 0.94 0.88 rg 55 171 500 108 re f');
  draw(p,'ONE SMALL ACTION',72,253,{font:'F3',size:10,color:'0.30 0.49 0.37'});
  draw(p,action,72,224,{size:11,leading:20,max:78});
  draw(p,'Something to carry into tomorrow:',55,129,{size:10});
  drawLines(p,98,1);
  return p;
}
function plan() {
  const p=pageBase(24);
  draw(p,'Your return-to-center plan',55,713,{font:'F2',size:27,max:60});
  draw(p,'Keep the practices that help. Leave the rest. Write a short plan for an ordinary difficult day.',55,674,{size:12,max:79});
  for(const [y,title] of [[593,'When I notice a difficult feeling...'],[477,'A grounding practice I can try...'],[361,'Someone or somewhere I can turn to...'],[245,'One small action within my control...']]){
    draw(p,title,55,y,{font:'F3',size:11,color:'0.30 0.49 0.37'});
    drawLines(p,y-34,2);
  }
  return p;
}
function close() {
  const p=pageBase(25);
  draw(p,'Keep going, gently',55,712,{font:'F2',size:29,max:55});
  draw(p,'You do not need a perfect record to create a more supportive routine. Return here to notice, reflect, and choose one next step.',55,668,{size:12,max:77});
  draw(p,'If you want more support',55,553,{font:'F3',size:13,color:'0.30 0.49 0.37'});
  draw(p,'Consider a qualified, licensed mental health professional for clinical concerns. In the US, call or text 988 or visit 988lifeline.org for crisis support. For immediate danger, call emergency services.',55,520,{size:11,max:82});
  draw(p,'Your personal reminder',55,412,{font:'F3',size:13,color:'0.30 0.49 0.37'});
  drawLines(p,380,7);
  draw(p,'APERTURE Quiet Practice | Personal-use digital journal. No guaranteed medical or therapeutic outcome. You may print copies for yourself. Please do not redistribute or resell.',55,114,{size:9,max:92});
  return p;
}

export function buildQuietPdf() {
  const pages=[cover(),instructions(),...DAYS.map((d,i)=>day(i+1,d)),plan(),close()];
  if(pages.length!==25)throw Error('unexpected page count');
  const objs=[null]; // PDF objects start at 1
  const add=s=>{objs.push(s);return objs.length-1};
  const catalog=add('');
  const rootPages=add('');
  const regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const serif=add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>');
  const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const ids=[];
  for(const page of pages){
    const data=page.join('\n')+'\n';
    const length=Buffer.byteLength(data,'ascii');
    const stream=add('<< /Length '+length+' >>\nstream\n'+data+'endstream');
    const pageId=add('<< /Type /Page /Parent '+rootPages+' 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 '+regular+' 0 R /F2 '+serif+' 0 R /F3 '+bold+' 0 R >> >> /Contents '+stream+' 0 R >>');
    ids.push(pageId);
  }
  objs[catalog]='<< /Type /Catalog /Pages '+rootPages+' 0 R >>';
  objs[rootPages]='<< /Type /Pages /Kids ['+ids.map(n=>n+' 0 R').join(' ')+'] /Count '+ids.length+' >>';
  const blocks=['%PDF-1.4\n'];
  const offsets=[0];
  let length=Buffer.byteLength(blocks[0],'ascii');
  for(let i=1;i<objs.length;i++){
    offsets[i]=length;
    const part=i+' 0 obj\n'+objs[i]+'\nendobj\n';
    blocks.push(part);length+=Buffer.byteLength(part,'ascii');
  }
  const xref=length;
  blocks.push('xref\n0 '+objs.length+'\n0000000000 65535 f \n');
  for(let i=1;i<objs.length;i++)blocks.push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  blocks.push('trailer\n<< /Size '+objs.length+' /Root '+catalog+' 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
  return Buffer.from(blocks.join(''),'ascii');
}
