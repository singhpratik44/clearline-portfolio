/* APERTURE Gift Lab — deterministic catalog rendering; all payment URLs from verified Stripe source. */
(() => {
  'use strict';
  const original=[
    {sku:'game',name:'Game Inventor Quest Deck',price:900,category:'Games',emoji:'🎮',color:'#c7e6ff',age:'Ages 8–13',description:'Eight original paper-based game design missions, from characters to playtesting.',activityCount:8,kind:'kit'},
    {sku:'birthday',name:'Birthday Game Party Kit',price:1200,category:'Birthday',emoji:'🎉',color:'#fbe3cc',age:'Ages 7–12',description:'Eight creative birthday stations and an easy-to-follow host plan.',activityCount:8,kind:'kit'},
    {sku:'space',name:'Space Explorer STEM Missions',price:1200,category:'Pathways',emoji:'🪐',color:'#dcd7fa',age:'Ages 8–13',description:'Eight paper-based moon base, rover, code and science adventures.',activityCount:8,kind:'kit'},
    {sku:'family',name:'Family Logic Game Night',price:1500,category:'Games',emoji:'🧩',color:'#e9e6c1',age:'Ages 7+ with family',description:'Ten logic puzzles, hints and a full answer key for family play.',activityCount:10,kind:'kit'},
    {sku:'bundle',name:'Ultimate Kids Creator Gift Bundle',price:2900,category:'Bundles',emoji:'🎁',color:'#d5f7cc',age:'4 original workbooks',description:'The four original games, birthday, space and family puzzle workbooks.',activityCount:34,kind:'bundle'}
  ];
  const added=[...(window.APERTURE_GIFT_LAB_V2?.products||[]),...(window.APERTURE_GIFT_LAB_SPORTS?.products||[]),...(window.APERTURE_GIFT_LAB_BASKETBALL?.products||[]),...(window.APERTURE_GIFT_LAB_BASKETBALL_EXTRA?.products||[])];
  const links=window.APERTURE_GIFT_CHECKOUT||{};
  const products=[...original,...added].filter(p=>typeof links[p.sku]==='string'&&links[p.sku].startsWith('https://buy.stripe.com/'));
  const featured=['basketball-coach-ops','basketball-tactics-library','basketball-gifts-collection','defensive-iq','coach-season','basketball-iq','all-sports-bundle','coach-practice','basketball-ultimate','athlete-mindset-kids','team-captain','coach-appreciation','all-vault','confidence-kids','sikh-seva','birthday-story','coding-pathway','birthday','game','growth-bundle','faith-bundle','pathways-bundle','classroom-party','achievement-awards'];
  products.sort((a,b)=>{const ar=featured.indexOf(a.sku),br=featured.indexOf(b.sku);return (ar===-1?1000:ar)-(br===-1?1000:br)||a.name.localeCompare(b.name)});
  const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const grid=document.getElementById('gift-grid'), count=document.getElementById('gift-results'), search=document.getElementById('gift-search'), age=document.getElementById('gift-audience');
  if(!grid||!count||!search||!age)return;
  const filters=document.querySelectorAll('[data-gift-filter]');
  let chosen='All';
  const kids=new Set(['game','birthday','space','family','birthday-story','classroom-party','achievement-awards','confidence-kids','motivation-kids','coding-pathway','basketball-pathway','stem-pathway','arts-pathway','sikh-seva','christian-courage','interfaith-kindness','family-heritage','basketball-iq','rookie-hoop','hoop-gift-cards','basketball-party','athlete-mindset-kids','soccer-creator','multi-sport','season-keepsake','family-sports-night']);
  const teens=new Set(['classroom-party','confidence-teens','dream-90','coding-pathway','basketball-pathway','stem-pathway','arts-pathway','sikh-seva','christian-courage','interfaith-kindness','family-heritage','mindful-moments','adult-purpose','basketball-iq','basketball-playbook','defensive-iq','three-on-three','girl-hoopers','pickup-hoops','athlete-mindset-teens','captain-leadership','basketball-party','soccer-creator','multi-sport','sports-film','season-keepsake']);
  const adults=new Set(['mindful-moments','adult-purpose','dream-90','sikh-seva','christian-courage','interfaith-kindness','family-heritage','coach-practice','coach-season','basketball-camp','scout-observation','team-culture','sports-film','coach-appreciation']);
  const families=new Set(['family','birthday','birthday-story','classroom-party','achievement-awards','sikh-seva','christian-courage','interfaith-kindness','family-heritage','party-bundle','faith-bundle','basketball-party','rookie-hoop','hoop-gift-cards','family-sports-night','season-keepsake','coach-appreciation']);
  function matchesAudience(p,v){if(v==='All')return true;if(p.kind==='bundle')return true;return ({Kids:kids,Teens:teens,Adults:adults,Family:families}[v]||new Set()).has(p.sku)}
  function card(p){
    const label=p.kind==='bundle'?'Collection':p.category;
    const activities=p.activityCount+' original activities';
    const bundle=p.kind==='bundle';
    return '<article class="gift-card '+(p.sku==='all-vault'?'vault':'')+'" data-category="'+esc(p.category)+'" id="'+esc(p.sku)+'"><div class="cover" style="--cover:'+esc(p.color)+'"><div class="cover-top"><span>APERTURE / GIFT LAB</span><span>'+esc(label.toUpperCase())+'</span></div><div class="art" aria-hidden="true">'+esc(p.emoji)+'</div><span class="cover-title">'+esc(p.name)+'</span><span class="cover-bottom">'+esc(activities)+'</span></div><div class="card-body"><div class="kicker">'+esc(p.category.toUpperCase())+' · '+esc(p.age)+'</div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="features"><span>✓ '+(bundle?'Choose & print each included book':'Print-ready activity pages')+'</span><span>✓ Personal-use digital license · <a href="terms.html#license">terms</a></span><span>✓ Customizable gift dedication</span><span>✓ Digital PDF via browser print</span></div><div class="buy-row"><strong>$'+(p.price/100).toFixed(0)+'<small> one-time</small></strong><a class="buy" href="'+esc(links[p.sku])+'" rel="noopener" aria-label="Buy '+esc(p.name)+' for $'+(p.price/100).toFixed(0)+' with Stripe">Get digital gift →</a></div><p class="license-note">One-time digital license, not copyright ownership. <a href="terms.html" aria-label="Digital use license and refund terms for this gift">License, refunds &amp; privacy</a>. Current printable material is publicly reachable; paid checkout is not exclusive access.</p></div></article>';
  }
  function render(){
    const q=search.value.trim().toLocaleLowerCase('en');
    const currentAge=age.value;
    const shown=products.filter(p=>(chosen==='All'||p.category===chosen||chosen==='Bundles'&&p.kind==='bundle')&&matchesAudience(p,currentAge)&&(!q||[p.name,p.description,p.age,p.category].join(' ').toLocaleLowerCase('en').includes(q)));
    grid.innerHTML=shown.map(card).join('');
    count.textContent=shown.length+' of '+products.length+' gift editions';
    document.getElementById('gift-empty').hidden=shown.length>0;
  }
  filters.forEach(el=>el.addEventListener('click',()=>{chosen=el.dataset.giftFilter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===el)));render()}));
  search.addEventListener('input',render);
  age.addEventListener('change',render);
  render();
})();
