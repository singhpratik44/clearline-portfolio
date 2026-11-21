(() => {
  'use strict';
  const STORAGE = 'aperture-academy-studio-v1';
  const FORMAT = 'aperture-creator-studio';
  const kinds = ['Game', 'Interactive story', 'Simulation', 'Tool or invention'];
  const media = ['APERTURE studio', 'APERTURE maze editor', 'Scratch blocks', 'Python', 'Web code', 'Paper or physical materials'];
  const fields = {title:80, idea:900, goal:700, scene:1200, first:100, firstResult:900, second:100, secondResult:900, workUrl:1000, prediction:600, observed:700, revision:700, credit:80, sources:700};
  const sceneFields = ['scene','first','firstResult','second','secondResult'];
  const tracks = {game:'Game',story:'Interactive story',simulation:'Simulation'};
  const fallbackTitles = ['Make a world someone can play','Build a rule you can explain','Move your idea into Scratch','Design a decision with consequences','Make a world that remembers','Read your world as Python data','Ask a question with code','Remix with credit and care','Ship an original prototype','Host a studio arcade'];
  const $ = id => document.getElementById(id);
  const text = (value, max=900) => typeof value === 'string' ? value.trim().slice(0,max) : '';
  const valid = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const own = (value,key) => Object.prototype.hasOwnProperty.call(value,key);
  const query = new URLSearchParams(location.search);
  const unitNumber = Number(query.get('unit'));
  const unitIndex = Number.isInteger(unitNumber) && unitNumber >= 1 && unitNumber <= 10 ? unitNumber - 1 : -1;
  const requestedTrack = query.get('track');
  const knownTrack = own(tracks,requestedTrack) ? requestedTrack : '';
  const safeUrl = value => {
    try {const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : '';} catch {return '';}
  };
  const make = (tag,content) => {const node = document.createElement(tag); if(content !== undefined)node.textContent=content;return node;};
  const say = message => {$('notice').textContent=message;};
  const empty = () => ({
    ...Object.fromEntries(Object.keys(fields).map(key=>[key,''])),
    kind:tracks[knownTrack]||'Game', medium:media[0], versions:[], milestoneNotes:Array(10).fill(''),
    ancestry:[], before:'', after:'', includeNotes:false, includeLink:false
  });
  function takeScene(o) {return Object.fromEntries(sceneFields.map(k=>[k,text(o[k],fields[k])]));}
  function version(o) {
    if (!valid(o) || !text(o.id,70) || !valid(o.scene)) return null;
    return {id:text(o.id,70),title:text(o.title,80),note:text(o.note,220),scene:takeScene(o.scene),url:safeUrl(text(o.url,1000))};
  }
  function credits(list) {
    if(!Array.isArray(list)) return [];
    return [...new Set(list.map(s=>text(s,240)).filter(Boolean))];
  }
  function cleanProject(input, strict=false) {
    if(!valid(input) || (strict && (!own(input,'kind') || !own(input,'title') || typeof input.title!=='string')))throw Error('This file does not contain a project.');
    const result=empty();
    for(const [k,max] of Object.entries(fields)) result[k]=text(input[k],max);
    result.kind=kinds.includes(input.kind)?input.kind:kinds[0];
    result.medium=media.includes(input.medium)?input.medium:media[0];
    result.ancestry=credits(input.ancestry);
    result.milestoneNotes=Array.from({length:10},(_,i)=>text(input.milestoneNotes?.[i],600));
    const seen=new Set();
    result.versions=(Array.isArray(input.versions)?input.versions:[]).slice(0,30).map(version).filter(v=>v&&!seen.has(v.id)&&seen.add(v.id));
    result.before=text(input.before,70);result.after=text(input.after,70);
    result.includeNotes=input.includeNotes===true;result.includeLink=input.includeLink===true;
    return result;
  }
  function fileFor(project,type) {
    if(type==='backup')return {format:FORMAT,version:1,type,project};
    return {format:FORMAT,version:1,type:'remix',project:{
      kind:project.kind,medium:project.medium,title:project.title,...takeScene(project),credit:project.credit,
      sources:project.sources,ancestry:project.ancestry
    }};
  }
  function readFileObject(file) {
    if(!valid(file)||file.format!==FORMAT||file.version!==1||!['remix','backup'].includes(file.type))throw Error('Choose an APERTURE Studio backup or remix JSON file.');
    const p=cleanProject(file.project,true);
    if(file.type==='backup')return p;
    const next=empty();
    Object.assign(next,takeScene(p),{kind:p.kind,medium:p.medium,title:('Remix of '+(p.title||'Untitled project')).slice(0,80)});
    const source=(p.title||'Untitled project')+' by '+(p.credit||'anonymous creator');
    next.ancestry=credits([...p.ancestry,source]);
    next.sources=p.sources;
    return next;
  }
  function readyScene(s) {return sceneFields.every(k=>!!text(s[k],fields[k]));}
  let project=empty(), storageIssue='', retainedInvalid=false,turn=0,active='plan';
  try {
    const stored=localStorage.getItem(STORAGE);
    if(stored){try{project=cleanProject(JSON.parse(stored),true);}
      catch{retainedInvalid=true;storageIssue='The saved project could not be read. Download a backup of new work or open a valid project file to replace it.';}}
  }catch{storageIssue='This browser cannot save here. Download a backup before you leave.';}
  function save() {
    if(retainedInvalid){$('save-status').textContent=storageIssue;return;}
    try{localStorage.setItem(STORAGE,JSON.stringify(project));$('save-status').textContent='Saved on this device.';}
    catch{$('save-status').textContent='This browser could not save. Download your backup before leaving.';}
  }
  function curriculumUrl() {
    const url=new URL('../index.html',location.href); const currentTrack=Object.keys(tracks).find(k=>tracks[k]===project.kind)||knownTrack;
    if(unitIndex>=0)url.searchParams.set('unit',String(unitIndex+1));
    if(currentTrack)url.searchParams.set('track',currentTrack);
    return url.href;
  }
  function links() {
    for(const a of document.querySelectorAll('[data-curriculum]'))a.href=curriculumUrl();
  }
  function fill() {
    for(const k of [...Object.keys(fields),'kind','medium'])$(k).value=project[k];
    $('include-notes').checked=project.includeNotes;$('include-link').checked=project.includeLink;
    $('version-note').value='';$('rehearsal').hidden=true;
    links();renderMilestones();refresh();
  }
  function openPane(id,focus=true) {
    if(!['plan','build','test','share'].includes(id))return;
    active=id;
    for(const pane of document.querySelectorAll('.pane'))pane.hidden=pane.id!==id;
    for(const tab of document.querySelectorAll('[data-tab]')){
      if(tab.dataset.tab===id)tab.setAttribute('aria-current','step');else tab.removeAttribute('aria-current');
    }
    $('notice').textContent=''; refresh();
    if(focus)$(id+'-heading').focus();
  }
  function coaches() {
    const mood=project.kind==='Simulation'?'What would change if you doubled just one input?':project.kind==='Interactive story'?'What choice would tell the reader something about your character?':'What will make the first choice interesting to someone new?';
    const prompts=project.idea.trim() ? [mood,'Point to the moment when a player gets to decide. What could happen either way?', 'What could you leave out and still show someone your idea today?'] :
      ['What do you wish you could play, explore, or change? Pick one small part to try first.',mood,'Imagine handing it to a friend for ten seconds. What could they do?'];
    $('plan-coach').textContent=prompts[turn%prompts.length];
    $('test-coach').textContent=project.observed.trim()?'What did the player actually do? Point to one detail in the scene that might explain it. Change just that detail, or explain why you kept it.':
      project.prediction.trim()?'Before you explain anything, watch which choice the tester tries first. What surprised you?':'Predict one action and let your partner try. Which detail do you think they will notice?';
  }
  function sceneInto(container,s,link='',forShow=false){
    container.replaceChildren();
    if(readyScene(s)){
      const setup=make('p',s.scene),buttons=make('div'),output=make('p');buttons.className='actions';output.className='outcome';output.setAttribute('role','status');
      for(const [name,result] of [['first','firstResult'],['second','secondResult']]){
        const button=make('button',s[name]);button.type='button';button.onclick=()=>{output.textContent=s[result];};buttons.append(button);
      }
      container.append(setup,buttons,output);
    } else container.append(make('p',forShow?'The creator shared the project as a link.':'Add a scene, two actions and both outcomes in Build to play them here.'));
    const url=safeUrl(link);
    if(url){const a=make('a','Open linked project ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';container.append(a);}
  }
  function playPanel() {
    const p=$('player');p.replaceChildren(make('h3','Play the current scene'));
    const area=make('div');p.append(area);sceneInto(area,project,project.workUrl);
  }
  function renderMilestones(){
    const root=$('milestones');root.replaceChildren();
    const units=Array.isArray(window.ApertureUnits)?window.ApertureUnits:[];
    for(let i=0;i<10;i++){
      const u=units[i]||{},box=make('div');box.className='unit';box.id='milestone-'+(i+1);
      const title=u.title||fallbackTitles[i];
      box.append(make('h3',(i+1)+'. '+title));
      if(Array.isArray(u.evidence)&&typeof u.evidence[0]==='string')box.append(make('p',u.evidence[0]));
      const url=new URL(curriculumUrl());url.searchParams.set('unit',String(i+1));
      const lesson=make('a','Open unit '+(i+1));lesson.href=url.href;box.append(lesson);
      const label=make('label','My evidence for '+title);const area=make('textarea');area.rows=2;area.maxLength=600;area.value=project.milestoneNotes[i];area.placeholder='I made… I tested… I noticed…';
      area.oninput=()=>{project.milestoneNotes[i]=area.value;save();};
      label.append(area);box.append(label);root.append(box);
    }
  }
  function selectedVersions(){
    const v=project.versions;
    return {before:v.find(x=>x.id===project.before)||v[0],after:v.find(x=>x.id===project.after)||v[v.length-1]};
  }
  function compareInto(root){
    root.replaceChildren();
    const versions=selectedVersions();
    if(!versions.before){root.textContent='Save a version in Build to start your collection.';return;}
    for(const [key,caption] of [['before','First draft'],['after','Later version']]){
      if(key==='after'&&versions.before.id===versions.after.id){root.append(make('p','Save and select a different version to compare revisions.'));continue;}
      const v=versions[key], card=make('div');card.className='comparison';
      card.append(make('strong',caption+' · '+(v.title||'Untitled')),make('p',v.note));
      if(v.scene.scene)card.append(make('p',v.scene.scene));
      if(v.scene.first)card.append(make('p',v.scene.first+' → '+v.scene.firstResult));
      if(v.scene.second)card.append(make('p',v.scene.second+' → '+v.scene.secondResult));
      root.append(card);
    }
  }
  function portfolio(){
    $('version-list').textContent=project.versions.length+' saved '+(project.versions.length===1?'version':'versions')+' on this device.';
    const current=selectedVersions();
    for(const key of ['before','after']){
      const el=$(key);el.replaceChildren();if(!project.versions.length)el.add(new Option('No saved versions yet',''));
      project.versions.forEach((v,i)=>el.add(new Option('Version '+(i+1)+' · '+v.note,v.id)));
      el.value=current[key]?.id||'';el.disabled=!project.versions.length;
    }
    $('credit-note').textContent=project.ancestry.length?'Remixed from '+project.ancestry.join(' → '):'This project starts with your idea. A shared remix keeps the original creator’s credit.';
    compareInto($('compare'));
  }
  function mediumGuide() {
    const target=$('medium-guide');
    const steps={
      'APERTURE studio':['Use the two actions below to make a playable scene.'],
      'APERTURE maze editor':['Build your maze, copy its share link and paste it below.','Open maze editor','../../game-creator/index.html'],
      'Scratch blocks':['Start with one sprite, one event, and one action. Use a shared project URL if you want people to open it.','Open Scratch editor','https://scratch.mit.edu/projects/editor/'],
      'Python':['Make one rule print a visible result. The maze lab lets you start with a program built from your own board.','Open the Python mission','../../game-creator/index.html#mission-python'],
      'Web code':['Start with one button and a response. You can include a link to your published project.'],
      'Paper or physical materials':['Sketch a scene on a card. Let a partner pick an action, then reveal what happens on the back. Record those choices here.']
    };
    const [instruction,label,url]=steps[project.medium]||steps[media[0]];
    target.replaceChildren(make('span',instruction+' '));
    if(url){const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';target.append(a);}
  }
  function refresh(){coaches();if(active==='build')mediumGuide();if(active==='test')playPanel();if(active==='share')portfolio();}
  function download(name,content,type) {
    const a=make('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function backup(){
    download('aperture-private-backup.json',JSON.stringify(fileFor(project,'backup'),null,2),'application/json');
    say('Backup downloaded. It includes your private notes and all saved versions.');
  }
  function studioField(k){
    const el=$(k); el.oninput=()=>{project[k]=el.value;save();if(k==='kind'){links();renderMilestones();}coaches();$('rehearsal').hidden=true;};
  }
  for(const k of [...Object.keys(fields),'kind','medium'])studioField(k);
  for(const button of document.querySelectorAll('[data-tab],[data-next]'))button.onclick=()=>openPane(button.dataset.tab||button.dataset.next);
  $('next-prompt').onclick=()=>{turn++;coaches();};
  $('backup').onclick=backup;
  function hasWork() {
    return Object.keys(fields).some(k=>text(project[k],fields[k])) || project.versions.length>0 || project.milestoneNotes.some(Boolean) || retainedInvalid;
  }
  $('new-project').onclick=()=>{
    if(hasWork()&&!confirm('Start a blank project on this device? Download your backup first to keep your current project.'))return;
    project=empty();retainedInvalid=false;save();fill();openPane('plan');say('New project opened.');
  };
  $('import').onclick=()=>$('file').click();
  $('file').onchange=async()=>{
    const chosen=$('file').files[0];if(!chosen)return;
    try{
      if(chosen.size>2_000_000)throw Error('Choose a project file smaller than 2 MB.');
      const file=JSON.parse(await chosen.text()),candidate=readFileObject(file);
      if(hasWork()&&!confirm('Opening this file replaces the project in this browser. Download my backup first if you want to keep it. Continue?'))return;
      project=candidate;retainedInvalid=false;storageIssue='';save();fill();openPane('plan');
      say(file.type==='remix'?'Remix opened with credit. Change the scene to make your version.':'Backup opened with your saved versions and notes.');
    }catch(err){say(err instanceof SyntaxError?'This is not valid JSON. Your current project is unchanged.':(err.message||'Could not open that project.'));}
    finally{$('file').value='';}
  };
  $('snapshot').onclick=()=>{
    const note=text($('version-note').value,220);
    if(!note){say('Write what to remember about this version first.');$('version-note').focus();return;}
    if(!readyScene(project)&&!safeUrl(project.workUrl)){say('Complete both scene choices or add a valid HTTPS project link before saving a version.');return;}
    if(project.versions.length>=30){say('You have 30 versions. Download a backup to keep them, then open a remix file to start a new collection.');return;}
    const v={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),title:project.title,note,scene:takeScene(project),url:safeUrl(project.workUrl)};
    project.versions.push(v);if(!project.before)project.before=v.id;project.after=v.id;save();$('version-note').value='';say('Saved version '+project.versions.length+'. See it in Share.');
  };
  for(const k of ['before','after'])$(k).onchange=()=>{project[k]=$(k).value;save();compareInto($('compare'));};
  for(const [id,key] of [['include-notes','includeNotes'],['include-link','includeLink']])$(id).onchange=()=>{project[key]=$(id).checked;save();$('rehearsal').hidden=true;};
  $('remix').onclick=()=>{
    if(!readyScene(project)){say('Finish your two-choice scene in Build to share a playable remix file.');return;}
    download('aperture-remix.json',JSON.stringify(fileFor(project,'remix'),null,2),'application/json');
    say('Remix file downloaded. Share it with a creator who wants to change your scene.');
  };
  function canShow(){if(readyScene(project)||(project.includeLink&&safeUrl(project.workUrl)))return true;say('Finish your scene, or add a valid HTTPS link in Build and choose to include it in your showcase.');return false;}
  $('preview').onclick=()=>{if(!canShow())return;$('rehearsal').hidden=false;sceneInto($('arcade-preview'),project,project.includeLink?project.workUrl:'',true);};
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function htmlScene(scene){
    if(!readyScene(scene))return '';
    const choice=(a,b)=>'<details><summary>'+esc(scene[a])+'</summary><p>'+esc(scene[b])+'</p></details>';
    return '<p>'+esc(scene.scene)+'</p>'+choice('first','firstResult')+choice('second','secondResult');
  }
  function htmlPortfolio(p){
    const versions=selectedVersions(),history=[];
    if(versions.before)history.push(['First draft',versions.before]);
    if(versions.after&&versions.after.id!==versions.before?.id)history.push(['Later version',versions.after]);
    const url=p.includeLink?safeUrl(p.workUrl):'';
    const attribution=[...p.ancestry,p.sources].filter(Boolean).map(esc).join(' · ');
    const notes=p.includeNotes?[['My prediction',p.prediction],['What the tester noticed',p.observed],['What I changed or kept',p.revision]].filter(x=>x[1]).map(([k,v])=>'<h3>'+k+'</h3><p>'+esc(v)+'</p>').join(''):'';
    const workLink=u=>'<p><a target="_blank" rel="noopener noreferrer" href="'+esc(u)+'">Open linked project ↗</a></p>';
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(p.title||'My family arcade')+'</title><style>body{font:18px/1.5 system-ui;color:#17372d;background:#faf9f4;max-width:42rem;margin:auto;padding:2rem}h1{line-height:1.05;font-size:2.6rem}p{white-space:pre-wrap;overflow-wrap:anywhere}section,details{background:white;border:1px solid #b9c9be;border-radius:.6rem;padding:1rem;margin:1rem 0}summary{cursor:pointer;font-weight:bold}a{color:#165e46}@media print{body{font-size:12pt;padding:0}details>*{display:block!important}section{break-inside:avoid}details{margin:.2rem}}</style></head><body><main><p>APERTURE · Family Arcade</p><h1>'+esc(p.title||'My project')+'</h1><p>Created by '+esc(p.credit||'anonymous creator')+'</p><p>Creator, introduce one decision. Guest, try a choice. Together, name one detail you noticed.</p><section><h2>Play my project</h2>'+htmlScene(p)+(url?workLink(url):'')+'</section>'+
      history.map(([name,v])=>'<section><h2>'+name+'</h2><p>'+esc(v.note)+'</p>'+htmlScene(v.scene)+(p.includeLink&&safeUrl(v.url)?workLink(v.url):'')+'</section>').join('')+
      (notes?'<section><h2>My playtest</h2>'+notes+'</section>':'')+(attribution?'<section><h2>Credits</h2><p>'+attribution+'</p></section>':'')+'</main></body></html>';
  }
  $('showcase').onclick=()=>{if(!canShow())return;download('aperture-family-arcade.html',htmlPortfolio(project),'text/html;charset=utf-8');say('Family arcade downloaded. Open it to play, present, or print.');};
  fill();openPane(unitIndex>=0?'build':'plan',false);
  if(storageIssue)$('save-status').textContent=storageIssue;
  if(unitIndex>=0){const milestone=$('milestone-'+(unitIndex+1));milestone.closest('details').open=true; milestone.scrollIntoView({block:'start'});milestone.querySelector('textarea').focus({preventScroll:true});}
})();
