/* APERTURE interactive product preview. Coordinates are model units. */
(function () {
  'use strict';
  const tau = Math.PI * 2;
  const segments = 40;
  function build(shape) {
    const faces = [];
    function surface(rings, material) {
      for (let j = 1; j < rings.length; j++) {
        for (let i = 0; i < rings[j].length; i++) {
          const k = (i + 1) % rings[j].length;
          faces.push({points: [rings[j-1][i], rings[j-1][k], rings[j][k], rings[j][i]], material: typeof material === 'function' ? material(j,i) : material});
        }
      }
    }
    function ring(y, width, depth, ripple=0) {
      return Array.from({length:segments}, (_,i) => {
        const a = i*tau/segments;
        return [width*Math.sin(a), y, depth*Math.cos(a)*(1+ripple*Math.cos(6*a))];
      });
    }
    if (shape === 'shirt') {
      const profile = [[1.34,.92,.38,.09],[1.27,.92,.38,.09],[.78,.89,.39,.08],[.22,.91,.43,.06],[-.44,.99,.48,.035],[-.84,1.02,.44,.025],[-1.09,.94,.36,.025],[-1.24,.36,.255,0],[-1.19,.30,.20,0]];
      const rings = profile.map(([y,w,d,r],j)=>ring(y,w,d,r).map(([x,yy,z])=>[x, yy+(j>=7 ? Math.max(0,z)*.9 : 0), z]));
      surface(rings,j=>j===8?'ink':'base');
      for(const sign of [-1,1]) {
        const sleeve = [[.83,-.89,.37,.39],[1.07,-.78,.38,.38],[1.26,-.58,.36,.35],[1.40,-.42,.34,.33],[1.45,-.37,.34,.33]];
        surface(sleeve.map(([x,y,r,d])=>Array.from({length:segments},(_,i)=>{
          const a=i*tau/segments;
          return [sign*(x+r*.62*Math.cos(a)),y-r*.78*Math.cos(a),d*Math.sin(a)];
        })),j=>j===4?'ink':'base');
      }
     } else if (shape === 'lipstick') {
      const levels = [[1.32,.02],[1.32,.48],[1.24,.50],[.22,.50],[.20,.48],[.18,.46],[-.21,.46],[-.23,.34],[-.61,.34],[-1.22,.32],[-1.29,.27],[-1.31,.02]];
      surface(levels.map(([y,r],j)=>ring(y,r,r).map(([x,yy,z])=>[x,yy+(j>=9 ? x*.75 : 0),z])),j=>j>=8?'base':j>=5?'ink':'case');
    } else if (shape === 'ball') {
      const rings = Array.from({length:33},(_,j)=>{
        const a=(j/32-.5)*Math.PI;
        return ring(Math.sin(a)*1.22,Math.cos(a)*1.22,Math.cos(a)*1.22);
      });
      surface(rings,(j,i)=>j===16||i%10===0?'ink':'base');
    } else if(shape === 'mug') {
      surface([[1.0,.01,.01],[1,.77,.77],[.87,.84,.84],[-.95,.91,.91],[-.97,.84,.84],[-.82,.83,.83],[.8,.70,.7],[.8,.01,.01]].map(a=>ring(...a)),j=>j===4?'ink':'base');
      const handle=Array.from({length:22},(_,j)=>{
        const a=-Math.PI/2+j*Math.PI/21;
        return Array.from({length:14},(_,i)=>{
          const b=i*tau/14;
          return [.79+(.57+.11*Math.cos(b))*Math.cos(a),-.02+(.65+.11*Math.cos(b))*Math.sin(a),.12*Math.sin(b)];
        });
      });
      surface(handle,'base');
    } else {
      const corners=y=>[[-1,y,-.76],[1,y,-.76],[1,y,.76],[-1,y,.76]];
      const levels=[-.85,-.70,-.61,.85].map(corners);
      surface(levels,j=>j===2?'ink':'base');
      faces.push({points:levels[0],material:'base'},{points:levels[3],material:'base'});
    }
    return faces;
  }
  function mount(canvas, initial={}) {
    const ctx=canvas?.getContext('2d');
    if(!ctx) return null;
    let model={shape:'shirt',color:'#223c74',ink:'#ffffff',number:'23',...initial};
    let mesh=build(model.shape), yaw=-.24, pitch=-.09, drag=null;
    function paint(){
      const w=canvas.clientWidth||360, h=canvas.clientHeight||330, dpr=Math.min(window.devicePixelRatio||1,2);
      if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
        canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
      }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const scale=Math.min(w/3.9,h/3.4), cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      function project([x,y,z]){
        const a=x*cy+z*sy,b=z*cy-x*sy,c=y*cp-b*sp,d=b*cp+y*sp;
        const s=scale*8/(8-d);return [w/2+a*s,h*.51+c*s,d];
      }
      const shadow=ctx.createRadialGradient(w/2,h*.93,0,w/2,h*.93,w*.32);
      shadow.addColorStop(0,'rgba(39,54,43,.18)');shadow.addColorStop(1,'rgba(39,54,43,0)');
      ctx.save();ctx.translate(0,h*.93);ctx.scale(1,.12);ctx.translate(0,-h*.93);ctx.fillStyle=shadow;ctx.fillRect(0,h*.93-w*.4,w,w*.8);ctx.restore();
      function rgb(hex){
        let value=String(hex).replace('#','');if(value.length===3)value=[...value].map(c=>c+c).join('');
        return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16)||0);
      }
      const colors={base:rgb(model.color),ink:rgb(model.ink),case:[43,43,48]};
      const layers=mesh.map(face=>{
        const p=face.points.map(project);
        return {p,z:p.reduce((a,pt)=>a+pt[2],0)/p.length,material:face.material};
      });
      if(model.shape==='shirt'){
        for(const side of [1,-1]){
          if(side*cy<.22) continue;
          const center=project([0,.05,.49*side]),x=project([side*.65,.05,.39*side]),y=project([0,.7,.48*side]);
          layers.push({z:center[2]+.035, print:{center,x,y,side}});
        }
      }
      layers.sort((a,b)=>a.z-b.z);
      for(const layer of layers){
        if(layer.print){
          const {center:c,x,y,side}=layer.print;
          ctx.save();ctx.transform((x[0]-c[0])/65,(x[1]-c[1])/65,(y[0]-c[0])/65,(y[1]-c[1])/65,c[0],c[1]);
          ctx.textAlign='center';ctx.fillStyle=model.ink;
          if(side===1){ctx.font='800 10px system-ui';ctx.fillText('APERTURE',0,-31);}
          ctx.font='900 65px system-ui';ctx.fillText(String(model.number??''),0,25);ctx.restore();continue;
        }
        const p=layer.p; // Compute the normal in screen-aligned model space to shade curved surfaces.
        const q=p.map(([x,y,z])=>[(x-w/2)*(8-z)/(8*scale),(y-h*.51)*(8-z)/(8*scale),z]);
        const a=q[0],b=q[1],c=q[2],u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);
        let nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0];
        const len=Math.hypot(nx,ny,nz)||1, sign=nz<0?-1:1;
        const lighting=.54+.50*Math.max(0,sign*(-.49*nx-.55*ny+.67*nz)/len);
        ctx.fillStyle='rgb('+colors[layer.material].map(x=>Math.min(255,Math.round(x*lighting+7))).join(',')+')';
        ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
        ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.55;ctx.stroke();
      }
    }
    function rotate(delta){yaw+=delta;paint();}
    canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.015;pitch=Math.max(-.65,Math.min(.65,pitch+(drag.y-e.clientY)*.006));drag.x=e.clientX;drag.y=e.clientY;paint();});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null;});
    canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();rotate(e.key==='ArrowLeft'?-.22:.22);}});
    if(window.ResizeObserver)new ResizeObserver(paint).observe(canvas);else window.addEventListener('resize',paint);
    paint();return {update(opts){const previous=model.shape;model={...model,...opts};if(previous!==model.shape)mesh=build(model.shape);paint();},rotate,front(){yaw=0;pitch=-.09;paint();},back(){yaw=Math.PI;pitch=-.09;paint();}};
  }
  window.ApertureProductViewer={mount};
})();