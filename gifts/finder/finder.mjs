import {findCatalogGifts} from "../../chatgpt-gift-studio/public/find-gifts.mjs";

const get=id=>document.getElementById(id);
const form=get("finder");
const embedded=new URLSearchParams(location.search).get("embed")==="1";
if(embedded) document.documentElement.classList.add("embedded");
const examples={
  robot:{interests:"robotics and coding",recipient:"child",budget:0,occasion:"holiday"},
  basketball:{interests:"basketball coach appreciation",recipient:"coach",budget:15,occasion:"thanks"},
  family:{interests:"family history and storytelling",recipient:"grandparent",budget:15,occasion:"birthday"}
};
function elem(tag,text,className){
  const e=document.createElement(tag);
  if(text)e.textContent=text;
  if(className)e.className=className;
  return e;
}
function link(text,url){
  const a=elem("a",text);a.href=url;
  if(embedded){a.target="_blank";a.rel="noopener noreferrer";}
  return a;
}
function giftCard(item) {
  const li=elem("li","","item");
  li.append(elem("h3",item.title),elem("span",item.priceUsd===0?"Free":"$"+item.priceUsd+" USD","price"),elem("p",item.why),elem("p",item.nextStep));
  const actions=elem("div","","actions");
  actions.append(link("Open item",item.url));
  if(item.previewUrl)actions.append(link("See the 3D preview",item.previewUrl));
  const share=elem("button","Copy kit link","share");share.type="button";
  share.addEventListener("click",async()=>{
    try{
      await navigator.clipboard.writeText(item.url);
      get("copy-status").textContent="Copied the link to "+item.title+".";
    }catch{
      let field=li.querySelector(".url");
      if(!field){
        const label=elem("label","Select and copy this kit link","share-field");
        field=elem("input","","url");field.readOnly=true;field.type="url";field.value=item.url;
        label.append(field);li.append(label);
      }
      field.focus();field.select();
      get("copy-status").textContent="The kit link is selected for copying.";
    }
  });
  actions.append(share);li.append(actions);return li;
}
function search(focus=false){
  const raw=get("budget").value.trim();
  const args={recipient:get("recipient").value,interests:get("interest").value.trim(),occasion:get("moment").value,limit:3};
  if(raw!=="")args.budgetUsd=Number(raw);
  const {recommendations}=findCatalogGifts(args);
  get("results").replaceChildren(...recommendations.map(giftCard));
  get("summary").textContent=recommendations.length+" "+(recommendations.length===1?"match":"matches")+
    (raw===""?" at listed prices.":Number(raw)===0?" at no cost.":" up to $"+Number(raw)+" USD.");
  get("copy-status").textContent="";
  if(focus)get("results-title").focus();
}
form.addEventListener("submit",e=>{e.preventDefault();if(form.reportValidity())search(true);});
get("examples").addEventListener("click",e=>{
  const key=e.target.closest("button")?.dataset.example;
  if(!key || !Object.hasOwn(examples,key))return;
  const q=examples[key];
  get("interest").value=q.interests;get("recipient").value=q.recipient;get("moment").value=q.occasion;get("budget").value=q.budget;
  search(true);
});
form.hidden=false;get("examples").hidden=false;search();
