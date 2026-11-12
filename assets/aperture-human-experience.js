(()=>{'use strict';if(document.getElementById('aperture-wellbeing'))return;
const css=document.createElement('style');css.textContent=`
#aperture-wellbeing{font:15px/1.55 system-ui,sans-serif;position:relative;max-width:1100px;margin:26px auto;padding:18px;color:#153229;background:#f0f8ef;border:1px solid #bfd7c7;border-radius:18px;box-sizing:border-box}
#aperture-wellbeing *{box-sizing:border-box}#aperture-wellbeing h2{font:700 clamp(20px,3vw,27px)/1.2 system-ui,sans-serif;letter-spacing:0;text-transform:none;color:#153229;margin:4px 0 10px}#aperture-wellbeing p{color:#28483a;margin:7px 0 12px}
#aperture-wellbeing .ap-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:12px}
#aperture-wellbeing .ap-card{padding:14px;background:white;border:1px solid #d6e8dd;border-radius:14px}
#aperture-wellbeing label{display:block;color:#153229;font:600 13px system-ui;margin:10px 0 5px}
#aperture-wellbeing input,#aperture-wellbeing select,#aperture-wellbeing textarea{width:100%;padding:9px;color:#153229;background:#fff;border:1px solid #a3bdb1;border-radius:8px;font:14px system-ui}
#aperture-wellbeing button{background:#174f3a;color:white;border:0;border-radius:9px;padding:10px 13px;font:600 13px system-ui;cursor:pointer}
#aperture-wellbeing button:focus-visible{outline:3px solid #bf8f25}#aperture-wellbeing .ap-mini{font-size:12px;color:#526c5b}
#aperture-wellbeing #ap-result{white-space:pre-wrap;background:#e2f3e6;padding:12px;border-radius:10px;margin-top:10px;color:#153229}
`;document.head.append(css);
const section=document.createElement('section');section.id='aperture-wellbeing';section.setAttribute('aria-label','Positive action studio');
section.innerHTML=`<div class="ap-mini">APERTURE / HUMAN EXPERIENCE</div><h2>Find your next good step.</h2><p>Build with clarity, care, courage and dignity. Make room for wonder, protect your well-being, and choose one useful act of service.</p>
<div class="ap-grid">
<div class="ap-card"><strong>Immediate idea framing</strong><label for="ap-idea">What's on your mind?</label><textarea id="ap-idea" rows="2" placeholder="A small idea or challenge…"></textarea><label for="ap-impact">What matters most?</label><select id="ap-impact"><option>Help someone</option><option>Create something beautiful</option><option>Improve my health and comfort</option><option>Learn and grow</option><option>Protect nature and resources</option></select><button id="ap-frame">Frame my next step</button></div>
<div class="ap-card"><strong>Body & beauty, with respect</strong><p>Your worth is not measured by appearance. Beauty can mean comfort, creativity, rest and self-expression.</p><label for="ap-care">Choose a gentle practice</label><select id="ap-care"><option>Rest and hydrate</option><option>Gentle movement within my comfort</option><option>Choose a look that feels like me</option><option>Practice gratitude for what my body does</option></select><button id="ap-care-button">Build a care reminder</button></div>
<div class="ap-card"><strong>Strength for today</strong><p>Let courage be steady, not loud. Speak truthfully, stay humble, treat others equally and help without expecting recognition.</p><button id="ap-strength">Give me a strength prompt</button><p class="ap-mini">Reflection is optional. These prompts don't replace professional support.</p></div></div>
<div id="ap-result" role="status" aria-live="polite" hidden></div>
`;
(document.querySelector('main')||document.body).append(section);
const el=id=>section.querySelector('#'+id);const show=s=>{el('ap-result').hidden=false;el('ap-result').textContent=s};
el('ap-frame').onclick=()=>{let idea=el('ap-idea').value.trim().slice(0,250)||'a useful idea';let impact=el('ap-impact').value;show('IDEA: '+idea+'\nINTENTION: '+impact+'\nFIRST 10-MINUTE STEP: Write down who this helps, the smallest test you can run today, and one sign that it worked.\nSAFETY CHECK: Is it honest, kind, reversible and respectful of others?\nTHEN: Ask one person what would make it more useful.')};
el('ap-care-button').onclick=()=>show('TODAY’S CARE REMINDER: '+el('ap-care').value+'.\nYou can adapt this to your needs. Your body deserves respect at every stage.');
const prompts=['Courage: Do one difficult but helpful thing with care.','Humility: Ask what you might be missing before deciding.','Service: Make someone else’s day easier without expecting reward.','Truth: Choose the accurate answer over the impressive one.','Equality: Design for the person who is often left out.','Wonder: Notice one beautiful detail and let it inspire a question.'];
let index=0;el('ap-strength').onclick=()=>show(prompts[index++%prompts.length]);
})();