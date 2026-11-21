(() => {
  "use strict";

  const radians = Math.PI / 180;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const finite = (n, fallback) => Number.isFinite(n) ? n : fallback;

  function rgb(value, fallback) {
    let hex = typeof value === "string" ? value.trim().replace(/^#/, "") : "";
    if (/^[a-f\d]{3}$/i.test(hex)) hex = Array.from(hex, c => c + c).join("");
    if (!/^[a-f\d]{6}$/i.test(hex)) hex = fallback;
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  }

  // Unit meshes have their centers at the origin and occupy one unit per axis.
  function makeMesh(type) {
    const points = [], triangles = [];
    function vertex(x, y, z, nx, ny, nz) {
      points.push([x, y, z, nx, ny, nz]);
      return points.length - 1;
    }
    function quad(a, b, c, d) { triangles.push([a, b, c], [a, c, d]); }

    if (type === "box") {
      const sides = [
        [[1,0,0], [[1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1]]],
        [[-1,0,0], [[-1,-1,1],[-1,-1,-1],[-1,1,-1],[-1,1,1]]],
        [[0,1,0], [[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1]]],
        [[0,-1,0], [[-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1]]],
        [[0,0,1], [[-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1]]],
        [[0,0,-1], [[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,-1]]]
      ];
      for (const [normal, corners] of sides) {
        const indices = corners.map(([x,y,z]) => vertex(x / 2, y / 2, z / 2, ...normal));
        quad(...indices);
      }
    } else if (type === "sphere") {
      const slices = 24, stacks = 14;
      for (let j = 0; j <= stacks; j++) {
        const phi = j * Math.PI / stacks;
        for (let i = 0; i < slices; i++) {
          const theta = i * 2 * Math.PI / slices;
          const x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta);
          vertex(x / 2, y / 2, z / 2, x, y, z);
        }
      }
      for (let j = 0; j < stacks; j++) for (let i = 0; i < slices; i++) {
        const a = j * slices + i, b = j * slices + ((i + 1) % slices);
        quad(a, b, b + slices, a + slices);
      }
    } else {
      const slices = 32;
      const bottom = vertex(0, -.5, 0, 0, -1, 0);
      const top = vertex(0, .5, 0, 0, 1, 0);
      const rings = [];
      for (let i = 0; i < slices; i++) {
        const angle = i * 2 * Math.PI / slices, x = Math.cos(angle), z = Math.sin(angle);
        rings.push([
          vertex(x / 2, -.5, z / 2, x, type === "cone" ? .5 : 0, z),
          vertex(type === "cone" ? 0 : x / 2, .5, type === "cone" ? 0 : z / 2, x, type === "cone" ? .5 : 0, z),
          vertex(x / 2, -.5, z / 2, 0, -1, 0),
          vertex(x / 2, .5, z / 2, 0, 1, 0)
        ]);
      }
      for (let i = 0; i < slices; i++) {
        const a = rings[i], b = rings[(i + 1) % slices];
        triangles.push([bottom, a[2], b[2]]);
        if (type === "cone") triangles.push([a[0], b[0], a[1]]);
        else {
          triangles.push([top, a[3], b[3]]);
          quad(a[0], b[0], b[1], a[1]);
        }
      }
    }
    return {points, triangles};
  }
  const shapes = Object.fromEntries(["box", "cylinder", "sphere", "cone"].map(type => [type, makeMesh(type)]));

  function assemble(spec) {
    const vertices = [], faces = [];
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    function add(type, x, y, z, w, h, d, hue, angle, subject) {
      const mesh = shapes[type], first = vertices.length;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      for (const [a,b,c,u,v,q] of mesh.points) {
        const px = x + a * w * cos + c * d * sin, py = y + b * h, pz = z - a * w * sin + c * d * cos;
        // Inverse-transpose scaling keeps lighting correct on flattened and stretched objects.
        const nx = u / w * cos + q / d * sin, ny = v / h, nz = -u / w * sin + q / d * cos;
        const light = Math.max(0, (-.44 * nx + .83 * ny + .34 * nz) / (Math.hypot(nx, ny, nz) || 1));
        vertices.push([px, py, pz, .61 + .45 * light]);
        if (subject) {
          lo[0] = Math.min(lo[0], px); hi[0] = Math.max(hi[0], px);
          lo[1] = Math.min(lo[1], py); hi[1] = Math.max(hi[1], py);
          lo[2] = Math.min(lo[2], pz); hi[2] = Math.max(hi[2], pz);
        }
      }
      for (const [a,b,c] of mesh.triangles) faces.push([first + a, first + b, first + c, hue]);
    }
    for (const obj of (Array.isArray(spec.objects) ? spec.objects : []).slice(0, 280)) {
      if (!obj || !Object.hasOwn(shapes, obj.type)) continue;
      const size = [obj.w,obj.h,obj.d].map(n => clamp(finite(n, 1), .004, 1000));
      const pos = [obj.x,obj.y,obj.z].map(n => clamp(finite(n, 0), -1000, 1000));
      add(obj.type, ...pos, ...size, rgb(obj.color, "6aa39a"), finite(obj.ry, 0) * radians, true);
    }
    if (!vertices.length) return {vertices, faces, center:[0,0,0], radius:1, bg:rgb(spec.background, "e5e4dc")};
    const cx = (lo[0] + hi[0]) / 2, cz = (lo[2] + hi[2]) / 2;
    const floor = Math.min(lo[1], 0);
    const width = Math.max(hi[0] - lo[0], .25), depth = Math.max(hi[2] - lo[2], .25);
    if (spec.ground) {
      const thickness = Math.max(width, depth) * .012;
      // A rounded display base sits just below the lowest contact point.
      add("cylinder", cx, floor - thickness / 2 - .001, cz, width * 1.43, thickness, depth * 1.43, rgb(spec.ground, "aebbb4"), 0, false);
    }
    const cy = ((spec.ground ? floor : lo[1]) + hi[1]) / 2;
    let radius = 0;
    for (const [x,y,z] of vertices) radius = Math.max(radius, Math.hypot(x-cx, y-cy, z-cz));
    return {vertices, faces, center:[cx,cy,cz], radius:Math.max(.1,radius), bg:rgb(spec.background, "e5e4dc")};
  }

  // Perspective-correct reciprocal depth resolves even intersecting or nested objects.
  function triangle(a, b, c, color, image, depth, width, height) {
    const [ax,ay,az,al] = a, [bx,by,bz,bl] = b, [cx,cy,cz,cl] = c;
    const area = (bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
    if (Math.abs(area) < .015) return;
    const x0 = Math.max(0, Math.ceil(Math.min(ax,bx,cx) - .5)), x1 = Math.min(width-1, Math.floor(Math.max(ax,bx,cx) - .5));
    const y0 = Math.max(0, Math.ceil(Math.min(ay,by,cy) - .5)), y1 = Math.min(height-1, Math.floor(Math.max(ay,by,cy) - .5));
    if (x0 > x1 || y0 > y1) return;
    const dU = (by-cy) / area, dV = (cy-ay) / area;
    const lA=al*az, lB=bl*bz, lC=cl*cz;
    const [r,g,blue]=color;
    for (let y=y0; y<=y1; y++) {
      const sy=y+.5;
      let u=((bx-x0-.5)*(cy-sy)-(by-sy)*(cx-x0-.5))/area;
      let v=((cx-x0-.5)*(ay-sy)-(cy-sy)*(ax-x0-.5))/area;
      for (let x=x0,i=y*width+x0;x<=x1;x++,i++,u+=dU,v+=dV) {
        const w=1-u-v;
        if (u < -.000001 || v < -.000001 || w < -.000001) continue;
        const inv=u*az+v*bz+w*cz;
        if (inv <= depth[i]) continue;
        depth[i]=inv;
        const shade=(u*lA+v*lB+w*lC)/inv, p=i*4;
        image[p]=r*shade;image[p+1]=g*shade;image[p+2]=blue*shade;
      }
    }
  }

  function mount(canvas, onViewChange) {
    if (!canvas || typeof canvas.getContext !== "function") throw new TypeError("A canvas is required.");
    let ctx;
    try {ctx=canvas.getContext("2d",{alpha:false});} catch {}
    let yaw=28, pitch=22, magnification=1, mesh=assemble({}), queued=0, disposed=false;
    let bitmap=null, depth=null;
    const pointers=new Map(), removers=[];
    const raf = typeof requestAnimationFrame === "function" ? cb=>requestAnimationFrame(cb) : cb=>setTimeout(cb,16);
    const cancel = typeof cancelAnimationFrame === "function" ? id=>cancelAnimationFrame(id) : id=>clearTimeout(id);
    const notify=()=>{if (typeof onViewChange === "function") onViewChange({yaw,tilt:pitch,zoom:magnification,available:Boolean(ctx)});};
    function draw() {
      queued=0;
      if (disposed || !ctx) return;
      const bounds=canvas.getBoundingClientRect();
      if (bounds.width<1 || bounds.height<1) return;
      const pixelRatio=Math.min(2, window.devicePixelRatio || 1, Math.sqrt(650000/(bounds.width*bounds.height)));
      const width=Math.max(1,Math.round(bounds.width*pixelRatio)),height=Math.max(1,Math.round(bounds.height*pixelRatio));
      if (canvas.width!==width) canvas.width=width;
      if (canvas.height!==height) canvas.height=height;
      if (!bitmap || bitmap.width!==width || bitmap.height!==height) {
        bitmap=ctx.createImageData(width,height);depth=new Float32Array(width*height);
      }
      const pixels=bitmap.data,[r,g,b]=mesh.bg;
      for (let i=0;i<pixels.length;i+=4) { pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;pixels[i+3]=255; }
      depth.fill(0);
      if (mesh.vertices.length) {
        const [ox,oy,oz]=mesh.center, distance=mesh.radius*3.6;
        const sy=Math.sin(yaw*radians),cy=Math.cos(yaw*radians),sp=Math.sin(pitch*radians),cp=Math.cos(pitch*radians);
        let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
        const projected=mesh.vertices.map(([x,y,z,light])=>{
          x-=ox;y-=oy;z-=oz;
          const forward=sy*x+cy*z,inv=1/(distance-(cp*forward+sp*y));
          const px=(cy*x-sy*z)*inv,py=(sp*forward-cp*y)*inv;
          xmin=Math.min(xmin,px);xmax=Math.max(xmax,px);ymin=Math.min(ymin,py);ymax=Math.max(ymax,py);
          return [px,py,inv,light];
        });
        const scale=magnification*Math.min(width*.87/Math.max(.001,xmax-xmin),height*.83/Math.max(.001,ymax-ymin));
        const mx=(xmin+xmax)/2,my=(ymin+ymax)/2;
        for(const p of projected){p[0]=width*.5+(p[0]-mx)*scale;p[1]=height*.5+(p[1]-my)*scale;}
        for(const [a,b,c,color] of mesh.faces) triangle(projected[a],projected[b],projected[c],color,pixels,depth,width,height);
      }
      ctx.putImageData(bitmap,0,0);
    }
    function schedule() {if(!disposed && ctx && !queued) queued=raf(draw);}
    function update(dx,dy,multiplier) {
      yaw=((yaw+finite(dx,0))%360+360)%360;
      pitch=clamp(pitch+finite(dy,0),-10,72);
      magnification=clamp(magnification*(multiplier>0 && Number.isFinite(multiplier)?multiplier:1),.6,2.4);
      schedule();notify();
    }
    const api={
      render(spec){if(disposed)return;mesh=assemble(spec && typeof spec==="object"?spec:{});schedule();},
      rotate(degrees){update(degrees,0,1);},
      tilt(degrees){update(0,degrees,1);},
      zoom(factor){update(0,0,factor);},
      reset(){yaw=28;pitch=22;magnification=1;schedule();notify();},
      destroy(){disposed=true;cancel(queued);observer?.disconnect();for(const remove of removers)remove();pointers.clear();fallback?.remove();canvas.style.touchAction=originalTouch;}
    };
    const originalTouch=canvas.style.touchAction;
    let fallback=null, observer=null;
    function listen(target,event,handler,options) {
      target.addEventListener(event,handler,options);
      removers.push(()=>target.removeEventListener(event,handler,options));
    }
    if (!ctx) {
      fallback=document.createElement("p");fallback.setAttribute("role","status");
      fallback.textContent="The 3D view is unavailable in this browser. Explore the kit details below.";
      canvas.insertAdjacentElement("afterend",fallback);notify();return api;
    }
    if (!canvas.hasAttribute("tabindex")) canvas.tabIndex=0;
    if (!canvas.hasAttribute("aria-label")) canvas.setAttribute("aria-label","Interactive 3D kit. Use arrow keys to rotate, plus and minus to zoom, and Home to reset.");
    canvas.style.touchAction="none";
    listen(canvas,"keydown",e=>{
      if(e.ctrlKey||e.altKey||e.metaKey)return;
      switch(e.key){
        case "ArrowLeft":api.rotate(-12);break;case "ArrowRight":api.rotate(12);break;
        case "ArrowUp":api.tilt(8);break;case "ArrowDown":api.tilt(-8);break;
        case "+":case "=":api.zoom(1.15);break;case "-":case "_":api.zoom(1/1.15);break;
        case "Home":api.reset();break;default:return;
      }
      e.preventDefault();
    });
    function span() {
      const [a,b]=pointers.values();return a && b?Math.hypot(a.x-b.x,a.y-b.y):0;
    }
    listen(canvas,"pointerdown",e=>{
      if(e.button!==0 || pointers.size>=2)return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      try{canvas.setPointerCapture(e.pointerId);}catch{}
    });
    listen(canvas,"pointermove",e=>{
      const previous=pointers.get(e.pointerId);
      if(!previous)return;
      const before=span();
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size===2){const after=span();if(before>3 && after>3)api.zoom(after/before);}
      else update((e.clientX-previous.x)*.65,(e.clientY-previous.y)*.4,1);
    });
    for(const event of ["pointerup","pointercancel","lostpointercapture"])listen(canvas,event,e=>pointers.delete(e.pointerId));
    listen(canvas,"wheel",e=>{
      if(!e.ctrlKey&&!e.metaKey)return;
      e.preventDefault();api.zoom(Math.exp(-clamp(e.deltaY,-120,120)*.008));
    },{passive:false});
    if(typeof ResizeObserver==="function"){observer=new ResizeObserver(schedule);observer.observe(canvas);}
    else listen(window,"resize",schedule);
    schedule();notify();return api;
  }

  window.PreferenceScene = Object.freeze({mount});
})();
