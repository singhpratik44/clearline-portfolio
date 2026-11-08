
(()=>{
'use strict';
const KEY='aperture-arena-v1', $=id=>document.getElementById(id), $$=s=>Array.from(document.querySelectorAll(s));
const NS='http://www.w3.org/2000/svg';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const now=()=>new Date().toISOString();
const fmtTime=t=>t.toFixed(1)+'s';
const positions={
motion:[
[[500,500],[245,397],[755,397],[145,195],[855,195]],
[[472,423],[330,306],[675,402],[240,255],[796,245]],
[[480,341],[370,251],[715,328],[200,203],[790,187]],
[[500,278],[400,216],[660,263],[193,173],[795,174]]],
horns:[
[[500,490],[253,391],[747,391],[395,222],[605,222]],
[[500,406],[300,369],[730,365],[413,263],[588,263]],
[[615,334],[338,343],[740,377],[455,233],[610,217]],
[[636,252],[305,340],[780,354],[444,217],[565,177]]],
spain:[
[[500,503],[230,359],[770,359],[386,233],[604,242]],
[[485,406],[254,312],[700,322],[425,290],[561,288]],
[[554,320],[283,303],[686,293],[470,267],[571,216]],
[[591,251],[300,320],[725,299],[481,219],[614,179]]],
zone:[
[[490,500],[230,365],[764,360],[278,220],[694,225]],
[[460,402],[285,340],[726,295],[403,250],[627,245]],
[[458,310],[318,330],[744,268],[486,205],[619,188]],
[[491,252],[338,300],[737,274],[477,165],[638,169]]]
};
const playNames={motion:'FIVE-OUT MOTION',horns:'HORNS',spain:'SPAIN PICK-AND-ROLL',zone:'ZONE OVERLOAD'};
const phaseNames={motion:['Initial spacing','First cut','Attack the gap','Decision at the rim'],
horns:['Two elbows established','Two-side read','Turn the corner','Finishing decision'],
spain:['Ball screen formation','Roll + back screen','Defense chooses','Read the advantage'],
zone:['Overload spacing','Middle touch','Force the rotation','Make the second pass']};
const handlers={motion:[0,0,1,0],horns:[0,0,0,0],spain:[0,0,0,0],zone:[0,0,3,3]};
const defensiveInitial=[[470,397],[302,302],[698,305],[409,185],[600,192]];
const fitMatrix={motion:{switch:8,drop:7,zone:5,pressure:6},horns:{switch:6,drop:8,zone:5,pressure:6},spain:{switch:5,drop:9,zone:4,pressure:6},zone:{switch:4,drop:5,zone:9,pressure:6}};
const counters={
switch:{play:'motion',title:'Make switches defend two actions.',reason:'Five-out spacing punishes late exchanges. Cut behind a switch, force a closeout, then attack the second rotation.',weakness:'A disciplined, connected defense can switch without surrendering an immediate advantage.'},
drop:{play:'spain',title:'Make the low defender choose.',reason:'A Spain ball screen puts the dropping big and back-screen defender in conflict. The roller, popper and weak-side shooter become linked reads.',weakness:'A well-timed peel or pre-switch may erase the first advantage.'},
zone:{play:'zone',title:'Occupy the middle. Move the bottom line.',reason:'An overload with a high-post flash creates a decision between the middle touch, short corner and skip pass. The second pass is the weapon.',weakness:'Poor weak-side balance can give the defense a transition opportunity.'},
pressure:{play:'horns',title:'Use a pressure-release entry.',reason:'An elbow catch and an immediate second-side read can give the ball handler a clean decision away from ball pressure.',weakness:'Aggressive traps can still force a hurried entry; spacing and ball security come first.'}
};
const fixtures=[
{id:'F01',name:'Exhibition Opponent 01',type:'Switch-heavy',coverage:'switch',power:67},
{id:'F02',name:'Exhibition Opponent 02',type:'Drop coverage',coverage:'drop',power:72},
{id:'F03',name:'Exhibition Opponent 03',type:'2–3 zone',coverage:'zone',power:76},
{id:'F04',name:'Exhibition Opponent 04',type:'Pressure defense',coverage:'pressure',power:71}
];
const clips=[
{title:'The weak-side tag',strap:'Why the second rotation matters',strategy:'spain',coverage:'drop',frames:[
'The ball screen pulls the big into contain. Who owns the roll?',
'The weak-side low defender must tag the roller without giving up a wide-open corner.',
'The back screen interrupts the normal rotation. Read the defender, not the name of the set.',
'The shot is not predetermined. The coach evaluates advantage, timing and the next pass.'
]},
{title:'The middle touch',strap:'How to move a 2–3 zone',strategy:'zone',coverage:'zone',frames:[
'The front line is organized. Perimeter passing alone is not enough.',
'Flash to the nail while a short-corner option stretches the back line.',
'The defense collapses. The weak-side closeout becomes the actual contest.',
'The advantage is created by the read that follows the middle touch.'
]},
{title:'The switch',strap:'When the original action disappears',strategy:'motion',coverage:'switch',frames:[
'An exchange is coming. Both defenders are ready to switch.',
'Cut behind the exchange instead of running the original play blindly.',
'The first advantage may vanish. Keep a second action available.',
'Film should grade decision quality, not reward a difficult shot solely because it went in.'
]}
];
const originalPlayers=[
{id:'G1',role:'Lead guard',shoot:73,read:80,defend:64,condition:77,load:22,xp:0},
{id:'G2',role:'Scoring guard',shoot:79,read:69,defend:63,condition:72,load:19,xp:0},
{id:'W1',role:'Two-way wing',shoot:68,read:72,defend:81,condition:76,load:24,xp:0},
{id:'F1',role:'Forward',shoot:61,read:75,defend:78,condition:74,load:19,xp:0},
{id:'B1',role:'Interior',shoot:59,read:66,defend:85,condition:70,load:27,xp:0}
];
function defaults(){
return{version:1,screen:'court',strategy:'motion',opp:'switch',aggression:60,phase:0,custom:null,seed:38951,
possessionCount:0,points:0,players:originalPlayers.map(p=>({...p})),selectedPlayer:'G1',week:1,season:1,trainingCount:0,
scheduleIndex:0,gameResults:[],readinessHistory:[],events:[],playbook:[],filmClip:0,filmFrame:0};
}
let state=defaults();
try{let raw=localStorage.getItem(KEY);if(raw){let s=JSON.parse(raw);
if(s&&s.version===1&&positions[s.strategy]&&counters[s.opp]&&Array.isArray(s.players)&&s.players.length===5&&Number.isInteger(s.seed)&&Array.isArray(s.events)&&Array.isArray(s.gameResults)&&Array.isArray(s.readinessHistory)){
state={...defaults(),...s,events:s.events.slice(0,160),gameResults:s.gameResults.slice(0,100),playbook:Array.isArray(s.playbook)?s.playbook.slice(0,40):[],readinessHistory:s.readinessHistory.slice(-30)};
}}}catch(e){}
const rng=()=>{state.seed=(Math.imul(state.seed,1664525)+1013904223)>>>0;return state.seed/4294967296};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
const toast=text=>{const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800)};
const timeStamp=()=>new Date().toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
function log(category,action,details,assumptions='Rules-based sandbox; illustrative result'){
 state.events.unshift({id:'D'+String(state.events.length+state.week*100+state.season*1000).padStart(5,'0'),time:now(),category,action,details,assumptions,source:'LOCAL SANDBOX'});
 state.events=state.events.slice(0,160);save();renderQuickLedger();if(state.screen==='evidence')renderEvidence();
}
function clear(el){while(el.firstChild)el.removeChild(el.firstChild)}
function el(tag,cls,txt){
 const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;
}
function se(tag,attrs={}){
 const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;
}
function svgTitle(g,text){const title=se('title');title.textContent=text;g.appendChild(title)}
function coordsAt(strategy,frame){return positions[strategy][frame].map(p=>p.slice())}
function offenseAt(frame=state.phase,strategy=state.strategy){
 if(strategy===state.strategy&&state.custom&&state.custom.strategy===strategy&&state.custom.frame===frame&&Array.isArray(state.custom.points))return state.custom.points.map(p=>p.slice());
 return coordsAt(strategy,frame);
}
function defenders(coverage,frame,agg=60){
 const p=defensiveInitial.map(a=>a.slice());
 if(coverage==='zone'){
   return [[405,250],[595,250],[320,145],[500,161],[680,145]].map((xy,i)=>[xy[0]+Math.sin(frame+i)*12,xy[1]+frame*7]);
 }
 if(coverage==='drop'){p[0][1]+=frame*10;p[3][1]-=frame*8;p[4][0]+=frame*8;}
 if(coverage==='switch'){p[0][0]+=frame*27;p[1][0]+=frame*14;p[2][0]-=frame*12;}
 if(coverage==='pressure'){p.forEach((xy,i)=>{xy[1]+=75+(agg-50)*.45-i*6;xy[0]+=frame*(i%2?7:-6);});}
 return p.map(xy=>[clamp(xy[0],55,945),clamp(xy[1],55,560)]);
}
function drawRoutes(target,pts,next){
 clear(target);if(!next)return;
 for(let i=0;i<pts.length;i++){
  const a=pts[i],b=next[i];
  const line=se('path',{d:'M'+a[0]+' '+a[1]+' L'+b[0]+' '+b[1],class:'route'});
  target.appendChild(line);
 }
}
function drawPlayers(oid,did,bid,off,def,ballIndex,drag){
 const offense=$(oid),defense=$(did),ball=$(bid);
 clear(offense);clear(defense);clear(ball);
 def.forEach((p,i)=>{let g=se('g',{class:'defender',transform:'translate('+p[0]+','+p[1]+')'});g.append(se('circle',{r:24}),se('text',{y:1}));g.querySelector('text').textContent='×';svgTitle(g,'Defender '+(i+1));defense.appendChild(g)});
 off.forEach((p,i)=>{let g=se('g',{class:'player',transform:'translate('+p[0]+','+p[1]+')','data-player':i,tabindex:drag?'0':'-1',role:'img','aria-label':'Offensive player '+(i+1)+(drag?', draggable':'')});
 const circle=se('circle',{r:27,class:'player-ring'}),text=se('text',{y:1});text.textContent=i+1;g.append(circle,text);svgTitle(g,'Offense '+(i+1));offense.appendChild(g)});
 const bp=off[ballIndex];if(bp)ball.appendChild(se('circle',{cx:bp[0]+25,cy:bp[1]-20,r:10,class:'ball'}));
}
function avgLoad(){return state.players.reduce((v,p)=>v+p.load,0)/state.players.length}
function playerRating(p){return Math.round(p.shoot*.23+p.read*.31+p.defend*.30+p.condition*.16)}
function readiness(){const m=state.players.reduce((v,p)=>v+playerRating(p),0)/state.players.length;return Math.round(clamp(m-avgLoad()*.14,20,99))}
function fitValue(strategy=state.strategy,coverage=state.opp,agg=state.aggression){
 const base=fitMatrix[strategy][coverage];
 const read=state.players.reduce((v,p)=>v+p.read,0)/5;
 const stress=avgLoad();
 return Math.round(clamp(base+(read-70)*.04-(agg-55)*.008-stress*.011,1,10)*10)/10;
}
function renderQuickLedger(){
 const wrap=$('quick-ledger');clear(wrap);
 const items=state.events.slice(0,3);
 if(!items.length){wrap.appendChild(el('li','', 'No decisions committed yet.'));return}
 for(const e of items){const li=el('li');const b=el('b','',e.category.toUpperCase()+' / '+timeStamp());li.append(b,document.createTextNode(e.action));wrap.appendChild(li)}
}
function renderInsight(){
 const c=counters[state.opp],fit=fitValue();
 $('counter-read').textContent=c.title+' '+c.reason;
 $('fit-value').textContent=fit.toFixed(1)+'/10';
 $('risk-value').textContent=Math.round(clamp((10-fit)*8+(state.aggression-30)*.35,7,85))+'/100';
 $('next-move').textContent='Suggested test: '+playNames[c.play]+'. '+c.weakness;
}
function renderCourt(){
 state.phase=clamp(state.phase,0,3);
 const p=offenseAt(),n=state.phase<3?coordsAt(state.strategy,state.phase+1):null;
 drawRoutes($('route-layer'),p,n);
 drawPlayers('off-layer','def-layer','ball-layer',p,defenders(state.opp,state.phase,state.aggression),handlers[state.strategy][state.phase],true);
 $('court-system').textContent=playNames[state.strategy];
 $('court-phase').textContent='Frame '+String(state.phase+1).padStart(2,'0')+' / 04 · '+phaseNames[state.strategy][state.phase];
 $('frame-count').textContent=String(state.phase+1).padStart(2,'0')+' / 04';
 $('frame-slider').value=state.phase;
 $$('[data-strategy]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.strategy===state.strategy)));
 $('opp-select').value=state.opp;$('opp-aggression').value=state.aggression;$('agg-value').textContent=state.aggression;
 renderInsight();renderQuickLedger();save();
}
let courtTimer=null,filmTimer=null;
function stopCourt(){if(courtTimer){clearInterval(courtTimer);courtTimer=null;} $('run-action').textContent='Run action'}
function advanceCourt(){
 state.phase=(state.phase+1)%4;renderCourt();
 if(state.phase===3)stopCourt();
}
function selectStrategy(k,record=false){
 if(!positions[k])return;stopCourt();state.strategy=k;state.phase=0;state.custom=null;
 renderCourt();if(record)log('tactics','Play changed: '+playNames[k], 'Coverage: '+state.opp+'.');
}
function simulatePossession(){
 stopCourt();
 const fit=fitValue(),r=rng(),opp=state.opp;
 const failRate=clamp(.07+(state.aggression-50)*.003-(fit-6)*.013,.02,.34);
 const turnover=r<failRate;
 const shooter=state.strategy==='motion'||state.strategy==='zone';
 const makeChance=clamp(.37+(fit-5)*.035-(state.aggression-50)*.0015,.18,.68);
 const shotValue=shooter?3:2;
 const made=!turnover&&rng()<makeChance;
 const points=made?shotValue:0;
 state.possessionCount+=1;state.points+=points;state.phase=3;
 const outcome=turnover?'turnover under pressure':made?'successful '+shotValue+'-point attempt':'missed '+shotValue+'-point attempt';
 const why='Tactical fit '+fit.toFixed(1)+'/10; '+playNames[state.strategy]+' versus '+opp+'; defensive pressure '+state.aggression+'/100.';
 const body='SIMULATED possession '+state.possessionCount+': '+outcome+' ('+points+' pts). '+why+' Seed-based sample only—not an actual game.';
 $('court-outcome').textContent=body;
 log('tactics','Simulated '+outcome,body,'Seeded toy possession model; no validated hit rates or real score.');
 renderCourt();
}
function courtDrag(){
 const board=$('main-court');
 let dragIndex=-1;
 function local(e){
   if(board.createSVGPoint&&board.getScreenCTM()){
    const pt=board.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const matrix=board.getScreenCTM().inverse(),xy=pt.matrixTransform(matrix);
    return [clamp(xy.x,45,955),clamp(xy.y,45,575)];
   }
   const r=board.getBoundingClientRect();return [clamp((e.clientX-r.left)/r.width*1000,45,955),clamp((e.clientY-r.top)/r.height*620,45,575)];
 }
 board.addEventListener('pointerdown',e=>{
   const g=e.target.closest&&e.target.closest('[data-player]');if(!g)return;
   stopCourt();dragIndex=Number(g.getAttribute('data-player'));
   const points=offenseAt();
   state.custom={strategy:state.strategy,frame:state.phase,points};
   try{board.setPointerCapture(e.pointerId)}catch(err){}
 });
 board.addEventListener('pointermove',e=>{
   if(dragIndex<0)return;state.custom.points[dragIndex]=local(e);renderCourt();
 });
 function end(){if(dragIndex<0)return;log('tactics','Court position adjusted','Moved offense '+(dragIndex+1)+' in '+playNames[state.strategy]+' frame '+(state.phase+1)+'.');dragIndex=-1;}
 board.addEventListener('pointerup',end);board.addEventListener('pointercancel',end);
 board.addEventListener('keydown',e=>{
   const g=e.target.closest&&e.target.closest('[data-player]');if(!g)return;
   let delta={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];
   if(!delta)return;e.preventDefault();
   const i=Number(g.getAttribute('data-player'));const points=offenseAt(),p=points[i];
   points[i]=[clamp(p[0]+delta[0],45,955),clamp(p[1]+delta[1],45,575)];
   state.custom={strategy:state.strategy,frame:state.phase,points};renderCourt();
 });
}
function renderFilm(){
 const clip=clips[state.filmClip]||clips[0],t=state.filmFrame;
 const o=coordsAt(clip.strategy,t),d=defenders(clip.coverage,t,57);
 drawRoutes($('film-routes'),o,t<3?coordsAt(clip.strategy,t+1):null);
 drawPlayers('film-off','film-def','film-ball',o,d,handlers[clip.strategy][t],false);
 $('film-scene-title').textContent=clip.title;
 $('film-scene-desc').textContent=clip.strap;
 $('film-scene-read').textContent=clip.frames[t];
 $('film-position').textContent=String(t+1).padStart(2,'0')+' / 04';
 $('film-slider').value=t;
 const buttons=$('clip-buttons');clear(buttons);
 clips.forEach((c,i)=>{
 const b=el('button','film-item'+(i===state.filmClip?' active':''));b.type='button';
 b.append(el('b','',c.title),el('small','',c.strap));
 b.addEventListener('click',()=>{stopFilm();state.filmClip=i;state.filmFrame=0;renderFilm();save();});
 buttons.appendChild(b);
 });
}
function stopFilm(){if(filmTimer){clearInterval(filmTimer);filmTimer=null;}$('film-play').textContent='Play'}
function setFilmFrame(t){state.filmFrame=clamp(t,0,3);renderFilm();save()}
let videoURL=null,videoMarkers=[];
function renderMarkers(){
 const wrap=$('markers');clear(wrap);
 if(!videoMarkers.length){wrap.appendChild(el('p','', 'No annotations yet.'));return;}
 videoMarkers.forEach((m,i)=>{
  const b=el('button','marker',fmtTime(m.time)+'  ·  '+m.note);
  b.type='button';b.addEventListener('click',()=>{const v=$('local-video');if(v.src){v.currentTime=m.time;v.play().catch(()=>{});}});
  wrap.appendChild(b);
 });
}
function download(name,text,mime='text/plain'){
 const blob=new Blob([text],{type:mime+';charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function renderProgram(){
 $('team-overall').textContent=readiness();
 $('program-week').textContent=String(state.week).padStart(2,'0');
 const wins=state.gameResults.filter(g=>g.for>g.against).length;
 const losses=state.gameResults.filter(g=>g.for<g.against).length;
 $('season-record').textContent=wins+'–'+losses;
 const roster=$('roster-list');clear(roster);
 for(const p of state.players){
  const b=el('button','athlete');b.type='button';b.setAttribute('aria-pressed',String(p.id===state.selectedPlayer));
  const jersey=el('span','jersey',p.id.replace(/\D/g,'')),name=el('div');
  name.append(el('strong','',p.id),el('small','',p.role));
  b.append(jersey,name,el('span','rating',String(playerRating(p))));
  b.addEventListener('click',()=>{state.selectedPlayer=p.id;renderProgram();save()});roster.appendChild(b);
 }
 const p=state.players.find(x=>x.id===state.selectedPlayer)||state.players[0];
 $('selected-name').textContent=p.id+' / '+p.role;
 $('player-load').textContent=p.load+'/100';
 $('player-load').classList.toggle('load-warn',p.load>=70);
 const skills=$('player-skills');clear(skills);
 for(const [key,label] of [['shoot','Shooting'],['read','Reads'],['defend','Defense'],['condition','Condition']]){
  const row=el('div','skill'),span=el('span','',label),track=el('div','skill-track'),i=el('i'),value=el('b','',p[key]);
  i.style.width=p[key]+'%';track.appendChild(i);row.append(span,track,value);skills.appendChild(row);
 }
 const fixturesEl=$('schedule-list');clear(fixturesEl);
 fixtures.forEach((f,i)=>{
  const row=el('div','fixture'),left=el('div'),b=el('b','',f.name),sub=el('small','',f.type);
  left.append(b,document.createElement('br'),sub);
  const result=state.gameResults.find(g=>g.fixture===f.id);
  const right=el('div','result',result?result.for+'–'+result.against:i===state.scheduleIndex?'NEXT':'—');
  row.append(left,right);fixturesEl.appendChild(row);
 });
 $('sim-game').disabled=state.scheduleIndex>=fixtures.length;
 $('new-season').disabled=state.scheduleIndex===0&&state.gameResults.length===0;
 renderGraph();save();
}
function recordReadiness(){
 state.readinessHistory.push({week:state.week,season:state.season,readiness:readiness(),time:now()});
 state.readinessHistory=state.readinessHistory.slice(-30);
}
function renderGraph(){
 const board=$('progress-svg');clear(board);
 const data=state.readinessHistory.length?state.readinessHistory:[{readiness:readiness()}];
 for(const val of [40,60,80,100]){
 const y=143-(val-30)*1.5;
 board.appendChild(se('line',{x1:36,y1:y,x2:510,y2:y,stroke:'#49505a','stroke-width':1,'stroke-opacity':.5}));
 const t=se('text',{x:6,y:y+4,fill:'#a7abb1','font-size':10,'font-family':'monospace'});t.textContent=val;board.appendChild(t);
 }
 let pts=data.slice(-16).map((d,i,arr)=>[38+i*(470/Math.max(1,arr.length-1)),143-(d.readiness-30)*1.5]);
 if(pts.length===1)pts=[[38,pts[0][1]],[505,pts[0][1]]];
 board.appendChild(se('polyline',{points:pts.map(x=>x.join(',')).join(' '),fill:'none',stroke:'#e8bf7f','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'}));
 pts.forEach(x=>board.appendChild(se('circle',{cx:x[0],cy:x[1],r:4.5,fill:'#e8bf7f',stroke:'#171717','stroke-width':2})));
}
function trainPlayer(){
 const p=state.players.find(x=>x.id===state.selectedPlayer),skill=$('training-skill').value;
 if(state.trainingCount>=3){$('training-report').textContent='Hold: three training blocks completed this week. Recover or play the next exhibition before adding more load.';return;}
 if(p.load>=70){$('training-report').textContent='Safety hold: workload is too high for another intensity block. Use recovery before continuing.';return;}
 if(!['shoot','read','defend','condition'].includes(skill))return;
 const before=p[skill],gain=1+Math.floor(rng()*3);
 p[skill]=Math.min(98,p[skill]+gain);
 p.load=Math.min(100,p.load+(skill==='condition'?9:13));
 p.xp+=1;state.trainingCount+=1;recordReadiness();
 const msg=p.id+': '+skill+' '+before+' → '+p[skill]+' (+'+(p[skill]-before)+'). Workload '+p.load+'/100. '+state.trainingCount+'/3 weekly blocks.';
 $('training-report').textContent=msg+' Simulated development only; not a validated training outcome.';
 log('development','Training block',msg,'Illustrative skill increments and a local load limit; not medical or athlete performance data.');
 renderProgram();
}
function recoverPlayer(){
 const p=state.players.find(x=>x.id===state.selectedPlayer),before=p.load;
 p.load=Math.max(5,p.load-24);
 recordReadiness();
 const msg=p.id+' recovery: workload '+before+' → '+p.load+'/100. Recovery reduces modeled fatigue but creates no automatic skill gain.';
 $('training-report').textContent=msg;
 log('development','Recovery block',msg,'Simplified load assumption; not clinical guidance.');
 renderProgram();
}
function simulateGame(){
 if(state.scheduleIndex>=fixtures.length){toast('Exhibition schedule complete. Start the next sandbox season.');return;}
 const f=fixtures[state.scheduleIndex],ready=readiness(),fit=fitValue(state.strategy,f.coverage,state.aggression);
 const fatigue=avgLoad();
 const teamScore=Math.round(clamp(30+ready*.61+(fit-6)*2+(rng()-.5)*18,36,104));
 const oppScore=Math.round(clamp(37+f.power*.50+(rng()-.5)*21,36,104));
 const result={fixture:f.id,season:state.season,team:f.name,coverage:f.coverage,strategy:state.strategy,fit,ready,load:Math.round(fatigue),for:teamScore,against:oppScore,time:now(),source:'SIMULATED EXHIBITION'};
 state.gameResults.push(result);state.scheduleIndex++;state.week++;state.trainingCount=0;
 state.players.forEach(p=>p.load=Math.max(8,p.load-12));
 recordReadiness();
 const outcome=teamScore>oppScore?'SIMULATED WIN':teamScore<oppScore?'SIMULATED LOSS':'SIMULATED TIE';
 const msg=outcome+' · '+teamScore+'–'+oppScore+' versus '+f.name+'. '+playNames[result.strategy]+' versus '+f.coverage+'. Fit '+fit+'/10; entry readiness '+ready+'; load '+Math.round(fatigue)+'.';
 $('season-report').textContent=msg+' This is an illustrative game-model result, not a personal coaching victory or prediction.';
 log('game',outcome,msg,'Seeded fictional score model, approximately 30 + readiness × .61 and opponent strength × .5, modified by matchup and variance.');
 renderProgram();
}
function renderEvidence(){
 const list=$('evidence-list'),filter=$('event-filter').value;
 clear(list);
 const events=state.events.filter(e=>filter==='all'||e.category===filter);
 if(!events.length){const li=el('li');li.append(el('small','', 'NO RECORD'),el('p','', 'No local decisions in this category yet.'));list.appendChild(li);}
 for(const e of events){
  const li=el('li'),sm=el('small','',new Date(e.time).toLocaleString()),box=el('div');
  box.append(el('strong','',e.category.toUpperCase()+' / '+e.action),el('p','',e.details),el('p','', 'Basis: '+e.assumptions));
  li.append(sm,box);list.appendChild(li);
 }
 const pb=$('playbook-list');clear(pb);
 if(!state.playbook.length){pb.appendChild(el('p','', 'No saved formations yet. Move an offensive marker and save it from The Court.'));}
 else state.playbook.forEach((v,i)=>{
 const wrap=el('div','fixture'),left=el('div');left.append(el('b','',v.name),el('small','', 'Coverage '+v.coverage+' · '+new Date(v.time).toLocaleString()));
 const btn=el('button','cta secondary','Load');btn.type='button';btn.addEventListener('click',()=>{
  state.strategy=v.strategy;state.opp=v.coverage;state.phase=v.frame;state.custom={strategy:v.strategy,frame:v.frame,points:v.points.map(p=>p.slice())};
  log('tactics','Saved formation loaded',v.name);setScreen('court');renderCourt();toast('Formation loaded into the court.');
 });
 wrap.append(left,btn);pb.appendChild(wrap);
 });
}
function setScreen(id){
 if(!['court','film','program','evidence'].includes(id))return;
 stopCourt();stopFilm();state.screen=id;
 $$('.screen').forEach(s=>s.hidden=s.id!=='screen-'+id);
 $$('[data-screen]').forEach(b=>b.setAttribute('aria-current',b.dataset.screen===id?'page':'false'));
 if(id==='court')renderCourt();
 if(id==='film')renderFilm();
 if(id==='program')renderProgram();
 if(id==='evidence')renderEvidence();
 save();
}
function attach(){
 $$('[data-screen]').forEach(b=>b.addEventListener('click',()=>{setScreen(b.dataset.screen);window.scrollTo({top:0,behavior:'smooth'});}));
 $$('[data-strategy]').forEach(b=>b.addEventListener('click',()=>selectStrategy(b.dataset.strategy,true)));
 $('opp-select').addEventListener('change',e=>{state.opp=e.target.value;renderCourt();log('tactics','Opponent profile changed','Coverage: '+state.opp+'. The suggested counter is a rules-based decision, not opponent data.');});
 $('opp-aggression').addEventListener('input',e=>{state.aggression=Number(e.target.value);renderCourt()});
 $('opp-aggression').addEventListener('change',()=>log('tactics','Defensive pressure adjusted',String(state.aggression)+'/100 simulated scouting input.'));
 $('apply-counter').addEventListener('click',()=>{const play=counters[state.opp].play;selectStrategy(play,true);toast('Counter loaded: '+playNames[play]);});
 $('run-action').addEventListener('click',()=>{
 if(courtTimer){stopCourt();return;}
 state.phase=0;renderCourt();$('run-action').textContent='Pause';
 courtTimer=setInterval(advanceCourt,850);
 });
 $('reset-action').addEventListener('click',()=>{stopCourt();state.phase=0;state.custom=null;renderCourt();$('court-outcome').textContent='Court reset. Run the action to rehearse its four decisions.'});
 $('frame-slider').addEventListener('input',e=>{stopCourt();state.phase=Number(e.target.value);renderCourt()});
 $('sim-possession').addEventListener('click',simulatePossession);
 $('save-play').addEventListener('click',()=>{
 const name=playNames[state.strategy]+' / '+state.opp.toUpperCase()+' / F'+(state.phase+1);
 const obj={name,strategy:state.strategy,coverage:state.opp,frame:state.phase,points:offenseAt().map(p=>p.slice()),time:now()};
 state.playbook.unshift(obj);state.playbook=state.playbook.slice(0,40);
 log('tactics','Formation saved',name+'; position snapshot local only.');toast('Formation saved to the local playbook.');
 });
 courtDrag();
 $('film-prev').addEventListener('click',()=>{stopFilm();setFilmFrame(state.filmFrame-1)});
 $('film-next').addEventListener('click',()=>{stopFilm();setFilmFrame(state.filmFrame+1)});
 $('film-slider').addEventListener('input',e=>{stopFilm();setFilmFrame(Number(e.target.value))});
 $('film-play').addEventListener('click',()=>{
 if(filmTimer){stopFilm();return;}
 state.filmFrame=0;renderFilm();$('film-play').textContent='Pause';
 filmTimer=setInterval(()=>{state.filmFrame=(state.filmFrame+1)%4;renderFilm();if(state.filmFrame===3)stopFilm();},820);
 });
 $('video-upload').addEventListener('change',e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 if(!file.type.startsWith('video/')){toast('Choose a supported video file.');return;}
 if(videoURL)URL.revokeObjectURL(videoURL);
 videoURL=URL.createObjectURL(file);
 const v=$('local-video');v.src=videoURL;v.hidden=false;
 $('video-placeholder').hidden=true;
 videoMarkers=[];renderMarkers();
 log('film','Local video opened','A local video was opened for manual viewing. The file was not uploaded or stored.','Browser-only object URL; no automated video interpretation.');
 });
 $('mark-frame').addEventListener('click',()=>{
 if(!videoURL){toast('Open a local video to mark a timestamp.');return;}
 const note=$('bookmark-desc').value.trim();if(!note){toast('Write a short, anonymous basketball observation.');return;}
 const stamp=$('local-video').currentTime||0;
 videoMarkers.push({time:Math.round(stamp*10)/10,note});videoMarkers.sort((a,b)=>a.time-b.time);
 $('bookmark-desc').value='';renderMarkers();
 log('film','Manual timestamp marked',fmtTime(stamp)+' in an unsaved local video. Notes stay in the current browser session.','Human observation only; annotation content not persisted in the audit ledger.');
 });
 $('export-markers').addEventListener('click',()=>download('APERTURE-Film-Notes.txt',
 'APERTURE ARENA — MANUAL FILM ANNOTATIONS\nNo video was uploaded.\n\n'+videoMarkers.map(m=>fmtTime(m.time)+' | '+m.note).join('\n')));
 $('train').addEventListener('click',trainPlayer);$('recover').addEventListener('click',recoverPlayer);
 $('sim-game').addEventListener('click',simulateGame);
 $('new-season').addEventListener('click',()=>{
 if(!window.confirm('Start a new simulated season? Previous exhibition results remain in the exported local evidence ledger, but the schedule restarts.'))return;
 state.season++;state.scheduleIndex=0;state.gameResults=[];state.trainingCount=0;state.players.forEach(p=>p.load=Math.max(8,p.load-18));
 state.week++;recordReadiness();log('game','New fictional season','Season '+state.season+' initialized; team skills retained, workload reduced.');
 $('season-report').textContent='New sandbox season ready. No verified real-game results are implied.';renderProgram();
 });
 $('event-filter').addEventListener('change',renderEvidence);
 $('export-state').addEventListener('click',()=>{
 download('APERTURE-Arena-Workspace.json',JSON.stringify({exportedAt:now(),notice:'Simulated, local-only basketball intelligence prototype. No real coaching victories are represented.',state},null,2),'application/json');
 });
 $('clear-data').addEventListener('click',()=>{
 if(!window.confirm('Erase your local APERTURE Arena simulation, saved formations, and decision history? Export first if you want a copy.'))return;
 stopCourt();stopFilm();state=defaults();recordReadiness();save();setScreen('court');
 $('court-outcome').textContent='Simulation reset. The next decision belongs to the coach.';toast('Local sandbox reset.');
 });
 window.addEventListener('beforeunload',()=>{if(videoURL)URL.revokeObjectURL(videoURL)});
}
if(!state.readinessHistory.length)recordReadiness();
attach();renderCourt();renderFilm();renderProgram();renderEvidence();setScreen(state.screen);
})();
