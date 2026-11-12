/* APERTURE P2 - One deterministic registry for five views. No network or storage. */
(()=>{'use strict';
const root=document.getElementById('p2');if(!root)return;
const $=id=>document.getElementById(id),say=(id,value)=>{$(id).textContent=value;};
const registry=[...document.querySelectorAll('#project-grid .project')].map((card,i)=>{
 const anchor=card.querySelector('h3 a[href]');
 if(!anchor)throw Error('Missing project link '+i);
 return Object.freeze({id:'p'+String(i+1).padStart(2,'0'),title:anchor.textContent.trim(),href:anchor.getAttribute('href'),category:card.dataset.category||'Uncategorized',description:card.querySelector('p')?.textContent?.replace(/\s+/g,' ').trim()||'No description',maturity:card.querySelector('.project-bottom span')?.textContent?.trim()||'Unspecified',card});
});
if(!registry.length)return;
const byId=new Map(registry.map(p=>[p.id,p])),views=['command','universe','decisions','execution','evidence'],state={selectedId:registry[0].id,view:'command'},completed=new Map();
const actions=[['Inspect the original public page','Verify what is currently shown and functioning'],['Assess evidence and affected people','Identify assumptions, limitations and possible consequences'],['Prepare human authorization review','No real submissions or execution occur in this demo']];
const hints={Education:'Inspect the learning experience against learner needs.',Sports:'Inspect the coaching or athlete workflow and assumptions.',Systems:'Inspect the system model, inputs and rollback path.',Research:'Inspect methodology, sources and uncertainty.',Operations:'Inspect ownership, controls and evidence.',Partnerships:'Review scope, permissions and written terms.',Reflection:'Inspect privacy, experience and safeguards.'};
const current=()=>byId.get(state.selectedId),checks=()=>completed.get(state.selectedId)||[false,false,false];
function renderRelated(p){
 const target=$('p2-related');target.replaceChildren();
 for(const q of registry.filter(x=>x.category===p.category)){
  const b=document.createElement('button');b.type='button';b.textContent=q.title;b.setAttribute('aria-current',String(q.id===p.id));
  b.addEventListener('click',()=>selectProject(q.id,'universe'));target.append(b);
 }
 const counts=new Map();registry.forEach(q=>counts.set(q.category,(counts.get(q.category)||0)+1));
 const target2=$('p2-categories');target2.replaceChildren();
 for(const [category,count] of [...counts].sort((a,b)=>a[0].localeCompare(b[0]))){
  const line=document.createElement('div');line.className='p2-category';
  const name=document.createElement('span');name.textContent=category;const n=document.createElement('b');n.textContent=String(count);line.append(name,n);target2.append(line);
 }
}
function renderSteps(){
 const box=$('p2-steps');box.replaceChildren();
 const marks=checks();
 actions.forEach(([title,details],i)=>{
  const label=document.createElement('label');label.className='p2-step';
  const input=document.createElement('input');input.type='checkbox';input.checked=marks[i];input.setAttribute('aria-label',title);
  input.addEventListener('change',()=>{const updated=checks().slice();updated[i]=input.checked;completed.set(state.selectedId,updated);renderProgress();say('p2-execution-status','Local planning step updated; no external action occurred.');});
  const body=document.createElement('div'),head=document.createElement('strong'),detail=document.createElement('span');
  head.textContent=String(i+1).padStart(2,'0')+' / '+title;detail.textContent=details;body.append(head,detail);label.append(input,body);box.append(label);
 });
 say('p2-execution-status','Planning progress is temporary to this page and is not a real task execution.');
}
function renderProgress(){say('p2-progress',checks().filter(Boolean).length+' / 3');}
function render(){
 const p=current();
 say('p2-selected-name',p.title);say('p2-selected-category',p.category);say('p2-workbench-selected',p.title+' · '+p.category);
 say('p2-command-title',p.title);say('p2-command-desc',p.description);
 say('p2-next',hints[p.category]||'Inspect the public project and its evidence first.');
 $('p2-command-open').href=p.href;
 say('p2-universe-title',p.category+' · '+registry.filter(q=>q.category===p.category).length+' listings');
 say('p2-decision-title','Review '+p.title);
 say('p2-decision-question','Inspect '+p.title+' now, or hold until adequate evidence is available?');
 say('p2-evidence-title',p.title);say('p2-evidence-category',p.category);
 say('p2-evidence-description',p.description);say('p2-evidence-maturity',p.maturity);
 const link=$('p2-evidence-link');link.href=p.href;link.textContent=p.href;
 $('p2-project').value=p.id;renderProgress();renderRelated(p);renderSteps();
}
function setView(view,focus=false){
 if(!views.includes(view))return;state.view=view;
 for(const v of views){const button=$('p2-tab-'+v),active=v===view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('p2-panel-'+v).hidden=!active;}
 if(focus)$('p2-tab-'+view).focus();
}
function selectProject(id,view){
 if(!byId.has(id))return;state.selectedId=id;render();if(view)setView(view);
 document.dispatchEvent(new CustomEvent('aperture:selection',{detail:{projectId:id,category:current().category}}));
}
const picker=$('p2-project');
for(const p of registry){
 const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.title;picker.append(opt);
 const inspect=document.createElement('button');inspect.type='button';inspect.className='p2-inspect';inspect.textContent='Inspect in Command →';inspect.setAttribute('aria-label','Inspect '+p.title+' in Command');
 inspect.addEventListener('click',()=>{selectProject(p.id,'command');root.scrollIntoView({behavior:'smooth',block:'start'});});p.card.append(inspect);
}
say('p2-registry-count',registry.length);
picker.addEventListener('change',()=>selectProject(picker.value));
const tabs=[...root.querySelectorAll('.p2-tab')];
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>setView(tab.dataset.view));
 tab.addEventListener('keydown',event=>{
  const d=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
  if(!d)return;event.preventDefault();setView(views[(i+d+views.length)%views.length],true);
 });
});
root.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.goto,true)));
$('p2-reset').addEventListener('click',()=>{completed.delete(state.selectedId);renderSteps();renderProgress();say('p2-execution-status','Local plan reset. No external action occurred.');});
const focusCategory={education:'Education',sports:'Sports',governance:'Operations'};
document.querySelectorAll('[data-focus]').forEach(b=>b.addEventListener('click',()=>{
 const p=registry.find(x=>x.category===focusCategory[b.dataset.focus]);if(p)selectProject(p.id,'command');
}));
selectProject(registry[0].id,'command');
window.ApertureP2=Object.freeze({getState:()=>({selectedId:state.selectedId,view:state.view,stepsCompleted:checks().filter(Boolean).length}),selectProject:id=>selectProject(id),setView,registry:()=>registry.map(({card,...p})=>({...p}))});
})();
