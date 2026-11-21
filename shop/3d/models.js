(() => {
  "use strict";

  // Coordinates are in studio units. All construction helpers place the bottom
  // of a solid on y; the preview renderer receives the center and full extents.
  function scene(background, ground) {
    const objects = [];
    function put(type, x, bottom, z, w, h, d, color, ry = 0) {
      objects.push({type, x, y:bottom + h / 2, z, w, h, d, color, ry});
    }
    return {
      background, ground, objects,
      box: (...args) => put("box", ...args),
      drum: (...args) => put("cylinder", ...args),
      ball: (...args) => put("sphere", ...args),
      cone: (...args) => put("cone", ...args)
    };
  }

  const ink = "#283546", ivory = "#f9edcf", brass = "#eab966";
  const metal = "#9aabae", bark = "#805a46", leaf = "#518b66";
  const themes = ["#df7357", "#509b96", "#8c75b2"];
  function line(s, x1, z1, x2, z2, bottom, width, height, color) {
    const dx = x2 - x1, dz = z2 - z1;
    s.box((x1+x2)/2, bottom, (z1+z2)/2, Math.hypot(dx,dz), height, width, color, -Math.atan2(dz,dx)*180/Math.PI);
  }
  function hoop(s, x, z, bottom, radius, width, height, color, from = 0, to = 2*Math.PI) {
    const n = Math.ceil(12 * (to-from)/(2*Math.PI));
    for(let i=0; i<n; i++) {
      const a=from+i*(to-from)/n, b=from+(i+1)*(to-from)/n;
      line(s,x+radius*Math.cos(a), z+radius*Math.sin(a), x+radius*Math.cos(b), z+radius*Math.sin(b),bottom,width,height,color);
    }
  }
  function tree(s, x, z, bottom, size = 1, color = leaf) {
    s.drum(x,bottom,z,.15*size,.58*size,.15*size,bark);
    s.ball(x,bottom+.40*size,z,.72*size,.79*size,.72*size,color);
  }
  function bench(s, x, z, bottom) {
    [-.30,.30].forEach(t=>s.box(x+t,bottom,z,.09,.22,.25,ink));
    s.box(x,bottom+.22,z,.82,.11,.31,bark);
  }
  function easelCard(s, x, z, bottom, w, h, paper, color, mark) {
    s.box(x,bottom,z,w,h,.10,paper);
    const front=z+.061;
    if(mark===0) {
      s.ball(x-w*.18,bottom+h*.48,front,w*.42,h*.35,.06,color);
      s.box(x+w*.18,bottom+h*.35,front,w*.17,h*.35,.06,brass);
    } else if(mark===1) {
      for(let j=0;j<3;j++) s.box(x+w*(-.27+.27*j),bottom+h*.17,front,w*.15,h*(.28+j*.16),.05,j===1?brass:color);
    } else {
      s.box(x,bottom+h*.60,front,w*.69,h*.12,.06,color);
      s.ball(x+w*.15,bottom+h*.22,front,w*.25,h*.27,.06,brass);
    }
    s.box(x,bottom-.055,z,w*1.04,.055,.34,ink);
  }
  function giftBox(s,x,z,y,w,h,d,paper,ribbon) {
    s.box(x,y,z,w,h,d,paper);
    s.box(x,y+h,z,w*1.05,.13,d*1.05,paper);
    s.box(x,y+h+.13,z,w*.16,.025,d*1.06,ribbon);
    s.box(x,y+h+.16,z,w*1.055,.025,d*.16,ribbon);
    s.box(x,y,z+d/2+.012,w*.16,h+.13,.026,ribbon);
    s.ball(x-w*.12,y+h+.16,z,w*.32,.23,d*.18,ribbon);
    s.ball(x+w*.12,y+h+.16,z,w*.32,.23,d*.18,ribbon);
  }

  function mirror(s,x,z,base,w,h,frame) {
    s.box(x,base,z,w,h,.19,frame);
    s.box(x,base+.13,z+.11,w-.24,h-.25,.06,"#badcea");
    s.box(x-w*.17,base+h*.63,z+.151,w*.32,.07,.03,ivory);
  }
  function cosmeticBrush(s,x,z,height,tip) {
    s.drum(x,.06,z,.16,height*.57,.16,ink);
    s.drum(x,height*.57+.06,z,.20,height*.19,.20,metal);
    s.ball(x,height*.76+.06,z,.4,height*.27,.4,tip);
  }
  function lipstick(s,x,z,height,color) {
    s.drum(x,.06,z,.42,height*.48,.42,ink);
    s.drum(x,.06+height*.48,z,.35,height*.19,.35,brass);
    s.drum(x,.06+height*.67,z,.27,height*.22,.27,color);
    s.ball(x,.06+height*.84,z,.27,height*.17,.27,color);
  }
  function house(s,x,z,base,size,color,roof) {
    const h=size*.85;
    s.box(x,base,z,size,h,size*.84,color);
    s.cone(x,base+h,z,size*1.43,size*.52,size*1.20,roof);
    s.box(x+.17*size,base,z+size*.428,size*.2,h*.64,.045,ink);
    s.box(x-.22*size,base+h*.48,z+size*.428,size*.22,h*.23,.045,"#d6ebe2");
  }
  function tower(s,x,z,base,w,h,color) {
    s.box(x,base,z,w,h,w*.82,color);
    s.box(x,base+h,z,w*1.05,.10,w*.86,ink);
    for(let j=1;j<=3;j++) {
      s.box(x,base+h*j/4,z+w*.42,w*.71,.07,.045,"#d8e9e3");
    }
  }
  function steps(s,x,z,width,tiers,depth,color) {
    for(let i=0;i<tiers;i++) s.box(x,0,z-i*depth,width,.25+(i*.34),depth,color);
  }
  function board(s,x,z,width,base,screenColor) {
    s.box(x-.36*width,.01,z,.14,base,.18,ink);
    s.box(x+.36*width,.01,z,.14,base,.18,ink);
    s.box(x,base,z,width,width*.62,.18,ink);
    s.box(x,base+.1,z+.111,width*.88,width*.49,.055,screenColor);
  }
  function hoopStation(s,x,z,base,scale) {
    s.box(x,base,z,.16*scale,2.05*scale,.16*scale,ink);
    s.box(x,base+1.64*scale,z+.08*scale,.98*scale,.72*scale,.12*scale,"#e6edf0");
    s.box(x,base+1.74*scale,z+.15*scale,.40*scale,.33*scale,.04*scale,ink);
    s.box(x,base+1.80*scale,z+.18*scale,.31*scale,.22*scale,.03*scale,ivory);
    hoop(s,x,z+.42*scale,base+1.69*scale,.23*scale,.064*scale,.065*scale,"#d95f3f");
  }
  function robot(s,x,z,y,color,size) {
    s.box(x,y,z,.82*size,.55*size,.54*size,color);
    s.box(x,y+.55*size,z,.67*size,.42*size,.50*size,ivory);
    [-.19,.19].forEach(d=>s.box(x+d*size,y+.70*size,z+.26*size,.10*size,.10*size,.04*size,ink));
    [-.52,.52].forEach(d=>s.ball(x+d*size,y+.14*size,z,.24*size,.31*size,.48*size,ink));
    s.drum(x,y+.97*size,z,.055*size,.19*size,.055*size,ink);
    s.ball(x,y+1.13*size,z,.15*size,.13*size,.15*size,color);
  }

  function beauty([look,palette,time],accent) {
    const s=scene("#f5e9e0","#ddc6b7");
    const shades=[["#d9808d","#b35872","#edacaf","#9c5069"],["#eca17e","#ce744e","#f1ba89","#ad684a"],["#a96b97","#8a486f","#c879a2","#753958"]][palette];
    s.box(-.7,.02,.1,3.95,.23,2.75,ink);
    mirror(s,-.7,-1.15,.22,3.84,1.85,accent);
    const rows=look+1, cols=3;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=-1.93+c*1.18,z=-.42+(r+.5)*1.62/rows;
      s.drum(x,.25,z,.88,.075,Math.min(.88,1.38/rows),brass);
      s.drum(x,.32,z,.77,.055,Math.min(.76,1.18/rows),shades[(c+r)%4]);
    }
    lipstick(s,1.98,.83,1.22+look*.25,shades[look]);
    for(let i=0;i<=time;i++) cosmeticBrush(s,1.72+(i%2)*.55,-.73+Math.floor(i/2)*.6,1.42+i*.31,shades[(i+2)%4]);
    if(time===2) {s.drum(2.77,.06,.34,.63,.55,.63,accent);s.drum(2.77,.61,.34,.66,.12,.66,ivory);}
    return s;
  }

  function city([layout,focus,density],accent) {
    const s=scene("#e1eee5","#a9c4ad"), asphalt="#66737a", lawn="#96bb83";
    s.box(0,0,0,7.45,.2,5.5,"#b2b5a7");s.box(0,.2,0,7.35,.07,5.42,lawn);
    const road=(x,z,w,d)=>s.box(x,.27,z,w,.07,d,asphalt);
    road(0,1.15,7.24,.62);
    if(layout===0){road(-1.15,-.03,.57,5.25);road(1.42,-.03,.57,5.25);}
    if(layout===1){s.box(0,.27,-.24,3.40,.08,1.64,"#709761");road(-1.83,-.1,.46,2.67);road(1.83,-.1,.46,2.67);road(0,-1.19,3.98,.42);tree(s,.25,-.4,.35,1.05);}
    if(layout===2){s.box(-.64,.27,-.05,1.03,.08,5.20,"#65a6b1");s.box(-.64,.35,1.15,1.35,.12,.63,asphalt);[-.36,.36].forEach(d=>s.box(-.64,.47,1.15+d,1.37,.1,.055,ivory));}
    [-2.67,2.72].forEach((x,i)=>{
      if(density===0)house(s,x,-1.52,.28,1.14,i?ivory:accent,bark);
      else {tower(s,x,-1.52,.28,1.06,1.1+density*.63, i?ivory:accent);if(density===2)tower(s,x+.67,-.42,.28,.56,1.74,metal);}
    });
    if(focus===0) {[-2.55,0,2.52].forEach(x=>house(s,x,2.06,.28,.73,ivory,accent));}
    if(focus===1) {[-2.55,-1.42,.22,1.36,2.63].forEach((x,i)=>tree(s,x,2.06,.28,.87+i%2*.1));bench(s,.79,2.06,.28);}
    if(focus===2){s.box(1.91,.35,1.13,1.55,.46,.43,accent);s.box(1.91,.65,1.36,1.24,.14,.04,"#d4edf1");[-2.45,.49].forEach(x=>{s.box(x,.29,2.02,.1,.64,.12,ink);s.box(x,.93,2.02,.74,.12,.46,brass);});}
    for(const x of [-3,-1.9,.29,2.76])s.box(x,.35,1.14,.40,.018,.045,ivory);
    return s;
  }

  function model([space,layout,finish],accent) {
    const material=["#c09463","#9da5a6","#88a88d"][finish];
    const s=scene("#e9e7e0","#c4bfb3");s.box(0,0,0,6.85,.22,4.82,material);
    s.box(0,.22,-2.30,6.85,1.56,.15,ivory);s.box(-3.35,.22,0,.15,1.12,4.67,ivory);
    const centerX=[-.65,-.37,-1.40][layout], centerZ=[.08,-.57,-1.06][layout];
    s.box(centerX,.22,centerZ+.44,3.67,.04,2.09,accent);
    const table=(x,z,w)=>{[-.35,.35].forEach(d=>s.box(x+d*w,.24,z,.17,.64,.43,ink));s.box(x,.89,z,w,.12,.77,material);};
    const chair=(x,z)=>{s.drum(x,.26,z,.28,.45,.28,ink);s.box(x,.71,z,.67,.16,.61,accent);s.box(x,.87,z+.23,.66,.55,.12,accent);};
    if(space===0){s.box(centerX,.27,centerZ,2.7,.46,.93,ink);s.box(centerX,.73,centerZ-.26,2.72,.65,.28,accent);[-.65,.65].forEach(t=>s.box(centerX+t,.74,centerZ+.09,1.24,.17,.62,accent));table(centerX,centerZ+1.04,1.27);}
    else{table(centerX,centerZ,2.45);s.box(centerX,1.01,centerZ,.11,.19,.13,ink);s.box(centerX,1.20,centerZ,1.25,.72,.13,ink);s.box(centerX,1.27,centerZ+.075,1.09,.54,.03,space===1?"#add1ca":"#a793de");chair(centerX,centerZ+.92);if(space===2){s.box(centerX+.88,.25,centerZ,.40,.68,.49,ink);s.drum(centerX+.88,.93,centerZ,.33,.055,.36,accent);s.box(centerX,1.02,centerZ+.23,.85,.04,.20,metal);}}
    if(layout===1){chair(1.78,.51);table(1.84,-.58,1.16);}
    if(layout===2){s.box(1.1,.23,-1.99,2.52,1.08,.34,material);[-.63,.10,.89].forEach((v,i)=>s.box(1.1+v,.48,-1.77,.26,.59-i*.08,.19,i===1?accent:ink));}
    s.drum(2.51,.22,1.22,.59,.15,.59,material);s.drum(2.51,.37,1.22,.085,1.33,.085,brass);s.cone(2.51,1.68,1.22,.76,.53,.76,ivory);
    return s;
  }

  function sports([focus,group,setting],accent) {
    const s=scene("#e5eaf0","#b7c3bd"), wood=["#a8a09b","#c99369","#b67e56"][setting];
    const length=[4.4,5.0,6.9][setting],depth=[3.38,3.95,4.18][setting];
    s.box(0,0,0,length,.18,depth,wood);
    for(const sign of [-1,1]){s.box(0,.18,sign*(depth/2-.14),length-.23,.025,.05,ivory);s.box(sign*(length/2-.14),.18,0,.05,.025,depth-.23,ivory);}
    hoopStation(s,-length*.30,-depth*.39,.19, .8);
    if(setting===2){hoopStation(s,length*.30,-depth*.39,.19,.8);s.box(0,.20,0,.05,.017,depth-.27,ivory);hoop(s,0,0,.20,.54,.04,.017,ivory);}
    const players=[1,2,5][group];
    const positions=[[-.90,.49],[.80,-.02],[1.37,1.18],[-1.50,1.27],[.12,.97]];
    positions.slice(0,players).forEach(([x,z],i)=>{s.drum(x,.21,z,.40,.1,.40,ivory);s.cone(x,.31,z,.31,.46,.31,i%2?ink:accent);s.ball(x,.70,z,.20,.22,.20,i%2?ink:accent);});
    if(focus===0){for(let i=0;i<3;i++)s.box(-.64+.47*i,.216,.29-.13*i,.23,.025,.055,ivory,15);s.ball(-.58,.31,.39,.22,.22,.22,"#db843a");}
    if(focus===1){for(let i=0;i<3;i++)s.ball(-.98+i*.14,.53+i*.39,.33-i*.59,.21,.21,.21,"#e5863a");hoop(s,-.9,.5,.22,.45,.045,.017,accent);}
    if(focus===2){for(let i=0;i<4;i++)s.cone(-1.25+i*.72,.21,1.48,.25,.37,.25,"#ef9352");line(s,-1.25,1.15,.96,1.15,.214,.06,.025,ivory);}
    return s;
  }

  function gift([format,audience,presentation],accent) {
    const s=scene("#f4e9db","#cbb8a4");s.box(0,0,0,6.18,.14,3.92,"#d8c5ad");
    const total=audience+1, spacing=[0,2.18,1.77][audience],w=audience===2?1.38:1.64;
    for(let i=0;i<total;i++){
      const x=(i-(total-1)/2)*spacing,z=0, paper=[ivory,"#e8d6bc","#e5dbe4"][i];
      const h=format===2?.20:.08, count=format===1?5:format===2?2:1;
      let surface=.15;
      if(presentation===2){giftBox(s,x,z,.15,w+.33,.55,1.38,accent,brass);surface=1.08;}
      for(let k=0;k<count;k++) s.box(x+k*.018,surface+k*h,z,w,h,1.18,k%2?paper:accent,presentation===0?k*3:0);
      const y=surface+count*h;
      if(presentation===1){easelCard(s,x,-.47,y+.055,w,1.36,paper,accent,format);s.box(x,y,.36,w*.85,.035,.25,paper);}
      else{s.box(x,y,z,w*.87,.033,.94,paper);s.box(x,y+.035,z-.29,w*.60,.02,.12,accent);s.drum(x-w*.17,y+.035,z+.12,w*.31,.025,.35,brass);}
      if(format===0 && presentation!==1){
        s.box(x+w*.31,y+.04,z-.29,w*.13,.035,.16,brass);
        s.box(x+w*.15,y+.04,z+.16,w*.23,.022,.045,ink);
        s.box(x+w*.15,y+.04,z+.26,w*.23,.022,.045,ink);
      }
      if(format===2){s.box(x-w*.44,surface,z,.10,count*h+.05,1.19,ink);for(let k=0;k<3;k++)s.drum(x-w*.45,y+.04,-.41+k*.4,.15,.06,.14,brass);}
    }
    return s;
  }

  function game([world,rule,scale],accent) {
    const s=scene("#dae5ec","#a4acbd"),extent=3.6+scale*.90;
    s.box(0,0,0,extent+.4,.24,extent*.76+.4,ink);
    s.box(0,.24,0,extent,.09,extent*.76,["#6d9281","#766b88","#6f9fa4"][world]);
    const width=extent/2,depth=extent*.38, n=3+scale, step=extent/n;
    if(world===0) {
      for(let i=0;i<n;i++) {const x=-width+(i+.5)*step,side=i%2?-1:1;
        s.box(x,.33,side*depth*.39,.20,.59,depth*.95,ivory);
        if(i%2===0)s.box(x+step*.16,.33,side*depth*.79,step*.49,.59,.16,ivory);
      }
    }
    if(world===1) {
      for(let i=0;i<n;i++) {const x=-width+(i+.5)*step;
        s.box(x,.33,-depth*.63,step*.64,.70,.48,["#b9988a","#c4b5a1"][i%2]);
        s.cone(x,1.03,-depth*.63,step*.85,.43,.73,accent);
        s.box(x,.34,-depth*.63+.25,.19,.46,.035,ink);
      }
    }
    if(world===2) {
      for(let i=0;i<n;i++) {const x=-width+step*(i+.5);s.box(x,.33,-depth*.49,step*.69,.27+(i%3)*.22,.62,["#a9bc82","#e2c88b","#97b7af"][i%3]);}
      s.box(0,.33,.05,extent*.92,.045,.38,"#65acbd");
    }
    if(rule===0){for(let i=0;i<n;i++)s.drum(-width+step*(i+.55),.35,depth*.59,.29,.18,.29,brass);}
    if(rule===1){line(s,-width*.66,depth*.58,0,depth*.27,.35,.10,.045,ivory);line(s,0,depth*.27,width*.64,depth*.70,.35,.10,.045,ivory);line(s,0,depth*.27,width*.64,-depth*.04,.35,.10,.045,ivory);[-.04,.70].forEach((v,i)=>s.cone(width*.64,.41,depth*v,.34,.43,.34,i===0?brass:accent));}
    if(rule===2){s.box(.1,.35,depth*.56,extent*.50,.16,.48,ink);[-.23,.23].forEach((v,i)=>s.box(extent*v,.51,depth*.56,.31,.3+i*.32,.36,i?accent:brass));}
    s.drum(-width*.77,.34,depth*.82,.31,.07,.31,ivory);s.cone(-width*.77,.41,depth*.82,.27,.4,.27,accent);
    return s;
  }

  function art([theme,display,frame],accent) {
    const s=scene("#f3eee4","#c5bcab"),timber=["#292e32","#b58b60","#eeeade"][frame];
    s.box(0,0,0,6.7,.22,3.06,"#b7aa92");
    s.box(0,.22,-.93,6.6,3.42,.22,"#dbd7c9");
    function picture(x,y,w,h,subject) {
      const z=-.72;
      s.box(x,y,z,w,h,.18,timber);s.box(x,y+.12,z+.10,w-.24,h-.24,.065,ivory);
      const pz=z+.15;
      if(subject===0) {
        s.box(x,y+h*.22,pz,w*.67,h*.54,.055,accent);
        s.box(x,y+h*.22,pz+.034,w*.035,h*.54,.025,ivory);
        s.ball(x,y+h*.39,pz+.06,w*.22,h*.22,.035,brass);
      }else{
        s.box(x-w*.18,y+h*.18,pz,w*.23,h*.56,.055,accent);
        s.ball(x+w*.11,y+h*.40,pz+.035,w*.43,h*.39,.055,brass);
        s.box(x+w*.13,y+h*.22,pz+.05,w*.31,h*.11,.055,ink);
      }
    }
    const positions=[[[0,.73,3.65,2.31]],[[-2,.86,1.48,2.08],[0,.86,1.48,2.08],[2,.86,1.48,2.08]],[[-1.93,.49,1.63,1.36],[-1.93,1.97,1.63,1.18],[.11,.81,1.71,2.01],[2.07,1.11,1.45,1.69]]][display];
    positions.forEach(([x,y,w,h],i)=>{
      picture(x,y,w,h,theme===2?i%2:theme);
      if(theme===2 && (i===0 || display===0))s.ball(x+w*.19,y+h*.57,-.51,w*.22,h*.19,.08,"#a67ca7");
    });
    bench(s,0,.88,.23);
    return s;
  }

  function workflow([scope,map,review],accent) {
    const s=scene("#e3e8eb","#b8c3c5");s.box(0,0,0,7.0,.17,4.30,"#d0d3c8");
    const n=scope+3, xs=Array.from({length:n},(_,i)=>-2.65+i*5.30/(n-1));
    // Each edge is a raised strip, with the station disks sitting above the intersections.
    let nodes=xs.map((x,i)=>[x,map===0?.22:map===1?(i>0&&i<n-1?-.73:.24):-.72]);
    function connections(a,b){line(s,a[0],a[1],b[0],b[1],.18,.12,.07,ink);}
    for(let i=1;i<n;i++)connections(nodes[i-1],nodes[i]);
    const alternate=[];
    if(map===1){const fork=[-.08,1.03];connections(nodes[0],fork);connections(fork,nodes[n-1]);alternate.push(fork);}
    if(map===2){for(let i=0;i<n;i++){const p=[xs[i],.82];if(i>0)connections(alternate[i-1],p);alternate.push(p);}connections(nodes[0],alternate[0]);connections(nodes[n-1],alternate[n-1]);}
    nodes.concat(alternate).forEach(([x,z],i)=>{s.drum(x,.21,z,.71,.14,.71,metal);s.box(x,.35,z,.47,.31+scope*.1,.42,i===0?brass:accent);});
    for(let i=0;i<=review;i++){
      const x=-2.51+i*1.22,z=1.67;
      s.drum(x,.18,z,.25,.09,.25,ink);s.drum(x,.27,z,.075,1.00,.075,ink);
      s.box(x+.19,.89,z,.39,.37,.07,brass);s.box(x+.19,.99,z+.05,.22,.045,.03,ink);
    }
    return s;
  }

  function seasonal([occasion,style,display],accent) {
    const s=scene("#f2e7dc","#cdbbb2"),papers=["#eadfca","#363b61","#b6c9a8"];
    const bg=papers[style], radius=display===2?2.42:2.16;
    s.drum(0,0,0,radius*2,.16,radius*1.55,"#cba984");
    const bottom=display===2?.53:.22,w=display===1?1.70:2.65,h=2.08;
    if(display===2){s.box(0,.16,0,3.59,.31,2.07,accent);s.box(0,.47,0,3.70,.09,2.14,brass);}
    const x=display===1?-.81:0;
    easelCard(s,x,-.14,bottom+.055,w,h,bg,accent,occasion);
    if(display===1){s.box(.79,bottom+.055,-.24,1.56,h,.13,ivory,-19);s.box(1.02,bottom+.67,.09,.54,.07,.07,brass,-19);s.box(1.02,bottom+.84,.09,.54,.07,.07,brass,-19);}
    // Paper folds, stars, or a plant sprig sit on the face of the card.
    if(style===0){s.box(x,bottom+1.63,-.03,w*.68,.082,.05,brass);s.box(x,bottom+.58,-.03,w*.6,.062,.05,ivory);}
    if(style===1){[[-.32,.9],[.23,.77],[.31,.32],[-.30,.21]].forEach(([tx,ty],i)=>{s.box(x+w*tx,bottom+h*ty,-.038,.07,.20,.05,i%2?ivory:brass);s.box(x+w*tx,bottom+h*ty+.06,-.007,.19,.07,.05,i%2?ivory:brass);});}
    if(style===2){s.box(x+w*.28,bottom+.53,-.03,.06,1.04,.05,leaf);for(let i=0;i<4;i++)s.ball(x+w*.28+(i%2?.10:-.10),bottom+.64+i*.20,-.008,.24,.14,.055,leaf);}
    if(occasion===0){s.box(-.09,bottom+.02,.98,1.46,.08,.47,ivory);s.box(-.12,bottom+.10,.98,.73,.03,.08,accent);}
    if(occasion===1){[-.53,.02,.55].forEach((tx,i)=>{s.cone(tx,bottom+.01,.99,.43,.60+i%2*.19,.43,i%2?brass:accent);s.ball(tx,bottom+.63+i%2*.19,.99,.13,.13,.13,ivory);});}
    if(occasion===2)robot(s,-.08,.90,bottom+.01,accent,.71);
    return s;
  }

  function broadcast([feature,shot,set],accent) {
    const s=scene("#dce3ec","#acbac4");
    // Wider shots include more surrounding set and move the camera visibly downstage.
    const width=[4.76,5.68,6.66][shot],depth=[3.18,3.87,4.70][shot];
    s.box(0,0,0,width,.18,depth,["#ba8860","#49576b","#76878c"][set]);
    const z=-depth*.32;
    if(set===0){s.box(0,.18,0,.052,.025,depth-.14,ivory);hoop(s,0,0,.185,.62,.05,.022,ivory);hoopStation(s,-width*.31,z,.18,.64);}
    if(set===1){s.box(0,.18,-.32,2.46,.78,.77,ink);s.box(0,.96,-.32,2.62,.13,.92,accent);s.box(0,.42,.08,1.51,.31,.045,metal);}
    if(set===2){[-1,1].forEach(x=>{s.box(x,.18,-.23,.72,.59,.68,accent);s.box(x,.76,-.47,.72,.60,.17,accent);});s.drum(0,.19,-.25,.49,.60,.49,ivory);}
    board(s,.53,z,1.91,.68,["#749f9c","#8075a4","#a98a70"][feature]);
    const front=z+.155;
    if(feature===0){s.ball(.53,1.29,front,.38,.40,.065,ivory);s.box(.53,.94,front,.60,.31,.055,accent);}
    if(feature===1){s.box(.11,1.05,front,.35,.36,.055,ivory);s.box(.85,1.05,front,.35,.36,.055,brass);s.box(.49,1.15,front,.16,.08,.055,ink);}
    if(feature===2){for(let i=0;i<4;i++)s.box(-.07+i*.34,.94,front,.21,.20+i*.12,.055,i%2?ivory:accent);}
    const cameraZ=[.64,1.25,1.83][shot],cx=width*.26;
    s.drum(cx,.19,cameraZ,.70,.12,.63,ink);s.drum(cx,.31,cameraZ,.14,.69,.14,metal);
    s.box(cx,1.00,cameraZ,.54,.40,.48,ink);s.box(cx,1.06,cameraZ-.25,.31,.25,.29,metal);
    s.box(cx,1.39,cameraZ,.26,.15,.15,accent);
    if(shot>=1){s.drum(-width*.38,.19,.34,.36,.09,.36,ink);s.drum(-width*.38,.28,.34,.10,1.42,.10,metal);s.box(-width*.38,1.70,.34,.57,.48,.20,ivory);}
    if(shot===2){steps(s,1.98,-1.48,1.48,2,.40,ink);}
    return s;
  }

  const models = {beauty, city, model, sports, gift, game, art, workflow, seasonal, broadcast};
  function build(type, options = [], accentColor) {
    if(!Object.hasOwn(models,type)) throw new RangeError("Unknown product model: " + String(type));
    const indices=[0,1,2].map(i => Number.isInteger(options?.[i]) && options[i]>=0 && options[i]<=2 ? options[i] : 0);
    const accent=typeof accentColor==="string" && /^#[0-9a-f]{6}$/i.test(accentColor) ? accentColor : themes[indices[0]];
    const {background,ground,objects}=models[type](indices,accent);
    return {background,ground,objects};
  }
  window.PreferenceModels=Object.freeze({build});
})();
