(function(){
  'use strict';
  const endpoint='https://aperture-gift-delivery.onrender.com/classicx/traffic.gif';
  const params=new URLSearchParams(location.search);
  const source=(params.get('utm_source')||params.get('ref')||'direct').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32)||'direct';
  function track(event){
    if(!['visit','free_sample','shop','checkout','arcade','replay','team_license'].includes(event))return;
    const pixel=new Image();
    pixel.src=endpoint+'?e='+encodeURIComponent(event)+'&s='+encodeURIComponent(source)+'&t='+Date.now();
  }
  track('visit');
  document.addEventListener('click',function(e){
    const a=e.target.closest('a,button,summary');
    if(!a)return;
    const href=(a.getAttribute('href')||'').toLowerCase();
    const label=(a.textContent||'').toLowerCase();
    if(href.includes('buy.stripe.com'))track('checkout');
    else if(href.includes('free-play.html'))track('free_sample');
    else if(href.includes('subject=classicx')||label.includes('team licens'))track('team_license');
    else if(href.includes('#shop'))track('shop');
    else if(href.includes('#arcade'))track('arcade');
    else if(label.includes('replay')||label.includes('preview'))track('replay');
  },{capture:true});
})();