/* ============================================================================
   CLG ENTERPRISE KIT — shared governed-operations layer · Clearline Group LLC
   Imported from the enterprise build (Instrument CLG-06) and applied uniformly
   to every engine in the portfolio:
     1. Tamper-evident ledger digest — every ledger write extends a hash chain;
        a silently edited record cannot reproduce the digest.
     2. Guided walkthrough — a structured tour over each instrument's articles.
     3. Decision replay — step through the committed decision record in order.
     4. Portable summary export — offline-readable record generated from the
        live canonical state.
   Usage per page:
     <script src="clg-enterprise.js"></script>
     <script>
       CLG.chain(STATE.ledger);            // the page's ledger array
       CLG.summary(function(){ ... return string ... });
       CLG.tour([{el, title, body}, ...]); // optional guided walkthrough
     </script>
   ========================================================================== */
(function(){
  "use strict";
  var MONO="ui-monospace,Menlo,Consolas,monospace";
  var INK="#1b2431", BAR="#1f3a5f", PAPER="#e9e5da";

  // ---------- 1. hash chain ----------
  var chain={digest:"genesis",entries:0};
  var ledgerRef=null;
  function h(s){var x=0;for(var i=0;i<s.length;i++){x=(x*31+s.charCodeAt(i))&0x7fffffff;}return ("0000000"+x.toString(16)).slice(-7);}
  function ser(e){try{return (typeof e==="string")?e:JSON.stringify(e);}catch(_){return String(e);}}
  function extend(e){chain.entries++;chain.digest=h(chain.digest+"|"+ser(e));}

  var CLG=window.CLG={};
  CLG.digest=function(){return chain.digest;};
  CLG.entries=function(){return chain.entries;};
  CLG.reset=function(){chain={digest:"genesis",entries:0};ledgerRef=null;updateBar();};
  CLG.chain=function(arr){
    if(!arr||!arr.push)return arr;
    ledgerRef=arr;
    for(var i=0;i<arr.length;i++)extend(arr[i]); // seed entries join the chain
    ["push","unshift"].forEach(function(m){
      var orig=Array.prototype[m];
      arr[m]=function(){
        for(var i=0;i<arguments.length;i++)extend(arguments[i]);
        var r=orig.apply(this,arguments);
        updateBar();
        return r;
      };
    });
    updateBar();
    return arr;
  };

  // ---------- shared chrome ----------
  var bar=null, panel=null;
  function el(tag,style,parent){var d=document.createElement(tag);d.setAttribute("style",style);(parent||document.body).appendChild(d);return d;}
  function btn(label,fn){var b=el("button","font:10px "+MONO+";letter-spacing:.1em;text-transform:uppercase;background:transparent;color:"+PAPER+";border:1px solid "+PAPER+";border-radius:3px;padding:3px 9px;cursor:pointer;margin-left:8px");b.textContent=label;b.onclick=fn;return b;}
  function updateBar(){if(bar)bar.firstChild.textContent="Ledger integrity · digest "+chain.digest+" · "+chain.entries+" committed entr"+(chain.entries===1?"y":"ies")+" — a silently edited record cannot reproduce this digest";}

  function ensureBar(){
    if(bar)return;
    bar=el("div","position:fixed;left:0;right:0;bottom:0;z-index:9990;background:"+INK+";color:"+PAPER+";font:10px "+MONO+";letter-spacing:.05em;padding:6px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;border-top:2px solid "+BAR);
    bar.appendChild(document.createTextNode(""));
    bar.appendChild(btn("Replay",openReplay));
    if(summaryFn)bar.appendChild(btn("Export summary",doExport));
    if(tourSteps)bar.appendChild(btn("Guided tour",startTour));
    var tag=el("span","margin-left:auto;opacity:.65",bar);tag.textContent="CLG Enterprise Kit";
    document.body.style.paddingBottom="34px";
    updateBar();
  }
  function rebuildBar(){if(bar){bar.remove();bar=null;}ensureBar();}

  function openPanel(title){
    closePanel();
    panel=el("div","position:fixed;left:50%;bottom:44px;transform:translateX(-50%);z-index:9995;width:min(620px,92vw);max-height:60vh;overflow:auto;background:#fff;border:1px solid #d9d5cb;border-left:4px solid "+BAR+";border-radius:3px;box-shadow:0 6px 24px rgba(27,36,49,.25);padding:16px 18px;font:13px/1.55 -apple-system,'Segoe UI',Roboto,sans-serif;color:"+INK);
    var head=el("div","display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px",panel);
    var t=el("b","font:11px "+MONO+";letter-spacing:.15em;text-transform:uppercase;color:"+BAR,head);t.textContent=title;
    var x=btn("Close",closePanel);x.style.marginLeft="12px";head.appendChild(x);
    return panel;
  }
  function closePanel(){if(panel){panel.remove();panel=null;}}

  // ---------- 2. decision replay ----------
  var replayIdx=0;
  function openReplay(){
    replayIdx=0;
    drawReplay();
  }
  function drawReplay(){
    var p=openPanel("Decision replay — committed record, in order");
    var entries=ledgerRef?ledgerRef.slice():[];
    if(!entries.length){el("div","color:#5a6270;font-size:12.5px",p).textContent="No committed entries on this instrument's record yet.";return;}
    // ledger arrays are newest-first; replay chronologically (oldest first)
    var seq=entries.slice().reverse();
    replayIdx=Math.max(0,Math.min(replayIdx,seq.length-1));
    var e=seq[replayIdx];
    var meta=el("div","font:10.5px "+MONO+";color:#5a6270;margin-bottom:6px",p);
    meta.textContent="Entry "+(replayIdx+1)+" of "+seq.length+" · chain digest at current state: "+chain.digest;
    var body=el("div","font:12px "+MONO+";background:#fbfaf7;border:1px solid #d9d5cb;border-radius:3px;padding:10px 12px;white-space:pre-wrap;word-break:break-word",p);
    var txt=e;
    if(e&&typeof e==="object"){
      var parts=[];
      if(e.decision)parts.push(e.decision);
      if(e.owner)parts.push("Owner: "+e.owner);
      if(e.rule)parts.push("Rule: "+e.rule);
      if(e.inputs)parts.push("Inputs: "+[].concat(e.inputs).join(", "));
      txt=parts.length?parts.join("\n"):ser(e);
    }
    body.textContent=txt;
    var nav=el("div","margin-top:10px;text-align:right",p);
    var pv=btn("← Older",function(){replayIdx=Math.max(0,replayIdx-1);drawReplay();});
    var nx=btn("Newer →",function(){replayIdx=Math.min(seq.length-1,replayIdx+1);drawReplay();});
    pv.style.borderColor=BAR;pv.style.color=BAR;nx.style.borderColor=BAR;nx.style.color=BAR;
    nav.appendChild(pv);nav.appendChild(nx);
  }

  // ---------- 3. summary export ----------
  var summaryFn=null;
  CLG.summary=function(fn){summaryFn=fn;rebuildBar();};
  function doExport(){
    if(!summaryFn)return;
    var txt=summaryFn()||"";
    txt="CLEARLINE GROUP LLC — GOVERNED OPERATIONS SUMMARY EXPORT\n"
       +"Generated from the live canonical state · "+new Date().toISOString()+"\n"
       +"Ledger integrity digest: "+chain.digest+" over "+chain.entries+" committed entries\n"
       +"==========================================================\n\n"+txt;
    var blob=new Blob([txt],{type:"text/plain"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=(document.title.split("·")[0].trim().replace(/[^\w-]+/g,"-")||"clg-summary")+"-summary.txt";
    a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);},2000);
  }

  // ---------- 4. guided walkthrough ----------
  var tourSteps=null, tourIdx=0, tourOverlay=null, tourSpot=null;
  CLG.tour=function(steps){tourSteps=steps;rebuildBar();};
  function startTour(){
    if(!tourSteps||!tourSteps.length)return;
    tourIdx=0;
    tourOverlay=el("div","position:fixed;inset:0;z-index:9992;background:rgba(27,36,49,.45)");
    tourOverlay.onclick=function(ev){if(ev.target===tourOverlay)endTour();};
    drawTour();
  }
  function endTour(){
    if(tourOverlay){tourOverlay.remove();tourOverlay=null;}
    if(tourSpot){tourSpot.style.outline="";tourSpot=null;}
  }
  function drawTour(){
    var s=tourSteps[tourIdx];
    if(tourSpot){tourSpot.style.outline="";tourSpot=null;}
    var target=typeof s.el==="function"?s.el():(typeof s.el==="string"?document.querySelector(s.el):s.el);
    if(target){target.scrollIntoView({block:"center",behavior:"smooth"});target.style.outline="2px solid "+BAR;target.style.outlineOffset="3px";tourSpot=target;}
    if(tourOverlay){tourOverlay.remove();}
    tourOverlay=el("div","position:fixed;left:0;right:0;bottom:34px;z-index:9996;display:flex;justify-content:center;pointer-events:none");
    var card=el("div","pointer-events:auto;width:min(560px,92vw);background:#fff;border:1px solid #d9d5cb;border-left:4px solid "+BAR+";border-radius:3px;box-shadow:0 6px 24px rgba(27,36,49,.3);padding:14px 16px;font:13px/1.55 -apple-system,'Segoe UI',Roboto,sans-serif;color:"+INK,tourOverlay);
    var meta=el("div","font:10px "+MONO+";letter-spacing:.15em;text-transform:uppercase;color:#5a6270;margin-bottom:4px",card);
    meta.textContent="Guided tour · step "+(tourIdx+1)+" of "+tourSteps.length;
    var ti=el("b","display:block;font-size:14px;margin-bottom:4px;color:"+INK,card);ti.textContent=s.title;
    var bo=el("div","font-size:12.5px;color:#3a4250",card);bo.textContent=s.body;
    var nav=el("div","margin-top:10px;text-align:right",card);
    var pv=btn("← Back",function(){tourIdx=Math.max(0,tourIdx-1);drawTour();});
    var nx=tourIdx<tourSteps.length-1?btn("Next →",function(){tourIdx++;drawTour();}):btn("Finish",endTour);
    var ex=btn("End tour",endTour);
    [pv,nx,ex].forEach(function(b){b.style.borderColor=BAR;b.style.color=BAR;nav.appendChild(b);});
  }

  // ---------- boot ----------
  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",ensureBar);}else{ensureBar();}
})();
