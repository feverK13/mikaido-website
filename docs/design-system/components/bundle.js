/* @ds-bundle: {"format":4,"namespace":"Mikaido","components":[]} */
/* Mikaido: знак, піксельні іконки, голограми, ефекти. Ванільний JS, без залежностей. */
(function(){
/* Mikaido mark module: realistic (metal + glass), flat optical sizes, pixel favicon. */
const IRIS=["#5ECAD6","#6B9FD4","#D06AAE","#E87BAD"];
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const VIS="2,8 120,58 238,8 120,106";
const GL1="119,0 131,0 95,120 83,120", GL2="135,0 139,0 103,120 99,120";
/* metal ramps: light from top-left, anisotropic bands like brushed steel */
const METAL={
  graphite:["#9097A3","#F2F4F8","#575C67","#1C1E23","#6E7480","#2B2E35","#121317"],
  silver:["#FFFFFF","#A7ACB6","#F1F3F6","#767C87","#DCE0E5","#5B606A","#C6CBD2"]
};
const LEG={graphite:"#26282E",silver:"#C9CCD3"};
let uid=0;
const stops=a=>a.map((c,i)=>`<stop offset="${(i/(a.length-1)).toFixed(3)}" stop-color="${c}"/>`).join("");
const irisStops=()=>stops(IRIS);
function framePath(x,sw){const w=30-2*sw,h=90-2*sw;return `M${x+2} 44h26a2 2 0 0 1 2 2v86a2 2 0 0 1-2 2h-26a2 2 0 0 1-2-2v-86a2 2 0 0 1 2-2zM${x+sw} ${44+sw}v${h}h${w}v-${h}z`}
function solidPath(x){return `M${x+2} 44h26a2 2 0 0 1 2 2v86a2 2 0 0 1-2 2h-26a2 2 0 0 1-2-2v-86a2 2 0 0 1 2-2z`}

/* flat mark. o: legs outline|solid, sw, leg, mono, bg, line, glint 0|1|2 */
function markFlat(o={}){
  const n=++uid, legs=o.legs||"outline", sw=o.sw||4, mono=o.mono, bg=o.bg||"none", line=o.line;
  const legC=mono||o.leg||LEG.graphite, g=o.glint??2;
  const L=[50,160].map(x=>`<path d="${legs==="solid"&&!line?solidPath(x):framePath(x,line?2.5:sw)}" fill="${legC}" fill-rule="evenodd"/>`).join("");
  let defs=`<clipPath id="c${n}"><polygon points="${VIS}"/></clipPath>`, fill;
  if(line) fill=bg; else if(mono) fill=mono; else {defs+=`<linearGradient id="g${n}" x1="0" y1="0" x2="1" y2=".35">${irisStops()}</linearGradient>`;fill=`url(#g${n})`}
  const vs=line?`stroke="${mono}" stroke-width="2.5" stroke-linejoin="miter"`:"";
  let G="";
  if(g){
    const gf=line?"none":(mono?bg:"#FFFFFF"), go=(mono||line)?1:.62, gs=line?`stroke="${mono}" stroke-width="2"`:"";
    G=`<g clip-path="url(#c${n})"><polygon points="${GL1}" fill="${gf}" ${gs} opacity="${go}"/>${g>1?`<polygon points="${GL2}" fill="${gf}" ${gs} opacity="${go*.7}"/>`:""}</g>`;
  }
  return `<svg viewBox="0 0 240 140" role="img" aria-label="Знак Mikaido"><defs>${defs}</defs>${L}<polygon points="${VIS}" fill="${fill}" ${vs}/>${G}</svg>`;
}

/* realistic mark. o: metal graphite|silver, sw, sheen (pointer light), shadow (contact shadow) */
function markReal(o={}){
  const n=++uid, m=o.metal||"graphite", sw=o.sw||5, dark=m==="silver";
  const vb=o.shadow?"0 0 240 156":"0 0 240 140";
  const frames=[50,160].map(x=>framePath(x,sw)).join("");
  const outerHi=[50,160].map(x=>`M${x+.5} 132V46q0-1.6 1.6-1.6H${x+28}`).join("");
  const innerLo=[50,160].map(x=>`M${x+sw} ${134-sw}H${x+30-sw}V${44+sw}`).join("");
  const defs=`
   <linearGradient id="mt${n}" x1="0" y1="0" x2="1" y2="1">${stops(METAL[m])}</linearGradient>
   <linearGradient id="mv${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".22"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="${dark?.28:.4}"/></linearGradient>
   <filter id="br${n}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="1.6 .012" numOctaves="2" seed="7" result="t"/><feColorMatrix in="t" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 .26" result="g"/><feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>
   <filter id="bl${n}" x="-.2" y="-.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation="2.4"/></filter>
   <filter id="cs${n}" x="-.3" y="-1" width="1.6" height="3"><feGaussianBlur stdDeviation="3"/></filter>
   <clipPath id="lc${n}"><path d="${frames}" clip-rule="evenodd"/></clipPath>
   <clipPath id="vc${n}"><polygon points="${VIS}"/></clipPath>
   <clipPath id="uc${n}"><polygon points="${VIS}"/><path d="${[50,160].map(solidPath).join("")}"/></clipPath>
   <linearGradient id="g${n}" x1="0" y1="0" x2="1" y2=".35">${irisStops()}</linearGradient>
   <linearGradient id="gd${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset=".36" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".68" stop-color="#0A0B14" stop-opacity=".16"/><stop offset="1" stop-color="#0A0B14" stop-opacity=".52"/></linearGradient>
   <linearGradient id="gl${n}" x1="0" y1="0" x2="0" y2="1"><stop offset=".34" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".55" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".8" stop-color="#FFFFFF" stop-opacity=".15"/></linearGradient>
   <linearGradient id="rm${n}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".8"/></linearGradient>
   <linearGradient id="sh${n}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`;
  const shadow=o.shadow?`<ellipse cx="120" cy="138" rx="96" ry="4" fill="#000000" opacity="${dark?.6:.22}" filter="url(#cs${n})"/>`:"";
  const metal=`<g filter="url(#br${n})"><path d="${frames}" fill="url(#mt${n})" fill-rule="evenodd"/><path d="${frames}" fill="url(#mv${n})" fill-rule="evenodd"/></g>
   <path d="${outerHi}" fill="none" stroke="#FFFFFF" stroke-opacity="${dark?.85:.55}" stroke-width=".7"/>
   <path d="${innerLo}" fill="none" stroke="#000000" stroke-opacity=".45" stroke-width=".7"/>
   <g clip-path="url(#lc${n})"><polygon points="${VIS}" transform="translate(0 5)" fill="#000000" opacity=".45" filter="url(#bl${n})"/></g>`;
  const glass=`<polygon points="${VIS}" fill="url(#g${n})"/>
   <g clip-path="url(#vc${n})">
     <polygon points="2,8 120,58 238,8 238,17 120,69 2,17" fill="#FFFFFF" opacity=".13"/>
     <polygon points="${VIS}" fill="url(#gd${n})"/>
     <polygon points="${GL1}" fill="url(#gl${n})"/><polygon points="${GL2}" fill="url(#gl${n})" opacity=".7"/>
   </g>
   <polyline points="2,8 120,58 238,8" fill="none" stroke="url(#rm${n})" stroke-width="1.3" stroke-linejoin="miter"/>
   <polyline points="5,9.6 120,103.4 235,9.6" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width=".7"/>`;
  const sheen=`<g clip-path="url(#uc${n})"><g class="sheen" transform="translate(-170 0)"><polygon points="70,-10 118,-10 76,160 28,160" fill="url(#sh${n})" style="mix-blend-mode:screen"/></g></g>`;
  return `<svg viewBox="${vb}" role="img" aria-label="Знак Mikaido" class="mk-real"><defs>${defs}</defs>${shadow}${metal}${glass}${sheen}</svg>`;
}

/* optical sizes by rendered width */
function markAt(px,o={}){
  const metal=o.metal||"graphite", leg=LEG[metal];
  if(px>=120&&o.real!==false) return markReal({metal,shadow:o.shadow});
  if(px>=96) return markFlat({leg,legs:"outline",sw:4,glint:2});
  if(px>=48) return markFlat({leg,legs:"outline",sw:7,glint:2});
  return markFlat({leg,legs:"solid",glint:1});
}

/* pointer-driven light: one sweep on load, then follows the pointer */
function attachLight(root){
  root.querySelectorAll(".mk-real").forEach(svg=>{
    const g=svg.querySelector(".sheen"); if(!g) return;
    let cur=-170,tgt=-170,raf=0;
    const set=v=>g.setAttribute("transform",`translate(${v.toFixed(1)} 0)`);
    const loop=()=>{cur+=(tgt-cur)*.12;set(cur);raf=Math.abs(tgt-cur)>.3?requestAnimationFrame(loop):0};
    const go=v=>{tgt=v;if(RM){cur=v;set(v);return}if(!raf)raf=requestAnimationFrame(loop)};
    const host=svg.closest("[data-light]")||svg;
    host.addEventListener("pointermove",e=>{const r=svg.getBoundingClientRect();go(-150+((e.clientX-r.left)/r.width)*360)});
    host.addEventListener("pointerleave",()=>go(-170));
    if(!RM){const t0=performance.now();const sweep=t=>{const k=Math.min(1,(t-t0)/1600),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cur=-170+e*450;set(cur);if(k<1)requestAnimationFrame(sweep);else{cur=-170;tgt=-170;set(cur)}};setTimeout(()=>requestAnimationFrame(sweep),400)}
  });
}

/* favicon B: hand-drawn 16×16 pixel grid */
const PIX=["................","................","V..............V","VVV..........VVV",".VVVV......VVVV.","..VVVVV..VVVVV..","...VVVVVVVVVV...","...LVVVVVVVVL...","...LLVVVVVVLL...","...LL.VVVV.LL...","...LL..VV..LL...","...LL......LL...","...LL......LL...","...LL......LL...","................","................"];
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("").toUpperCase()}
function irisAt(t){const s=t*3,i=Math.min(2,Math.floor(s));return mix(IRIS[i],IRIS[i+1],s-i)}
function pixel({leg=LEG.graphite,mono=null,themed=false}={}){
  let r="";
  PIX.forEach((row,y)=>[...row].forEach((ch,x)=>{
    if(ch===".")return;
    if(ch==="L") r+=themed?`<rect class="l" x="${x}" y="${y}" width="1" height="1"/>`:`<rect x="${x}" y="${y}" width="1" height="1" fill="${mono||leg}"/>`;
    else r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${mono||irisAt(x/15)}"/>`;
  }));
  const style=themed?`<style>.l{fill:#26282E}@media (prefers-color-scheme:dark){.l{fill:#C9CCD3}}</style>`:"";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${style}${r}</svg>`;
}

/* Mikaido pixel hologram engine: voxel models, projected onto a pixel grid, drawn with hologram effects. */
const HOLO=(()=>{
  const IR_D=["#5ECAD6","#6B9FD4","#D06AAE","#E87BAD"], IR_L=["#1F95A5","#2C63B0","#A8407F","#C8558E"];
  const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  function iris(t,dark){const P=(dark?IR_D:IR_L).map(hex);t=Math.max(0,Math.min(.999,t))*3;const i=t|0,f=t-i,a=P[i],b=P[i+1];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}
  // --- моделі: масиви [x,y,z,s], s=1 акцентний воксель
  function page(){const v=[];for(let x=0;x<10;x++)for(let y=0;y<14;y++){const b=x===0||x===9||y===0||y===13;
      const head=y>=10&&y<=11&&x>=2&&x<=7, l1=y===8&&x>=2&&x<=8, l2=y===6&&x>=2&&x<=6, btn=y>=2&&y<=3&&x>=2&&x<=4;
      if(b||head||l1||l2)v.push([x-4.5,y-6.5,0,0]);if(btn)v.push([x-4.5,y-6.5,0,1]);if(b)v.push([x-4.5,y-6.5,-1,0])}return v}
  function calendar(){const v=[];for(let x=0;x<12;x++)for(let y=0;y<11;y++){const b=x===0||x===11||y===0||y===10;const hd=y>=8;
      const cell=!b&&!hd&&(x%3!==0)&&(y%3!==1);
      if(b||hd)v.push([x-5.5,y-5,0,0]);else if(cell){const hi=x>=7&&x<=8&&y>=2&&y<=3;v.push([x-5.5,y-5,0,hi?1:0])}
      if(b)v.push([x-5.5,y-5,-1,0])}
    for(const rx of [3,8])for(let y=10;y<13;y++)v.push([rx-5.5,y-5,.5,0]);return v}
  function nodes(){const v=[],C=[[-5,-3,1],[5,-3,1],[0,4,-2]],seen=new Set();
    const add=(x,y,z,s)=>{const k=[Math.round(x),Math.round(y),Math.round(z)].join();if(!seen.has(k)){seen.add(k);v.push([Math.round(x),Math.round(y),Math.round(z),s])}};
    C.forEach((c,i)=>{for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)add(c[0]+x,c[1]+y,c[2]+z,i===2?1:0)});
    [[0,1],[1,2],[2,0]].forEach(([a,b])=>{const A=C[a],B=C[b];for(let t=0;t<=1;t+=.06)add(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t,0)});return v}
  function box(){const v=[];const W=10,H=8,D=8;for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(let z=0;z<D;z++){
      const sh=x===0||x===W-1||y===0||y===H-1||z===0||z===D-1;if(!sh)continue;
      const tape=y===H-1&&(x===4||x===5);v.push([x-4.5,y-3.5,z-3.5,tape?1:0])}
    for(let x=4;x<=5;x++)for(let y=4;y<8;y++)v.push([x-4.5,y-3.5,-3.5-.01,1]);return v}
  const MODELS={page,calendar,nodes,box};
  function edges(vox){const set=new Set(vox.map(p=>p.slice(0,3).map(Math.round).join()));
    return vox.filter(p=>{const [x,y,z]=p.map(Math.round);const h=(a,b,c)=>set.has([a,b,c].join());let full=0;if(h(x+1,y,z)&&h(x-1,y,z))full++;if(h(x,y+1,z)&&h(x,y-1,z))full++;if(h(x,y,z+1)&&h(x,y,z-1))full++;return full<=1})}
  const SYS_RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RM=()=>window.MK_MOTION===true?false:window.MK_MOTION===false?true:SYS_RM;
  const items=[];
  function mount(cv,model,style,opts={}){const vox=MODELS[model](),it={cv,ctx:cv.getContext("2d"),vox:style==="wire"?edges(vox):vox,style,vis:true,seed:Math.random()*1000,a0:-.6,fd:opts.dark,base:opts.base||"beam",scan:!!opts.scan,noGlitch:!!opts.noGlitch};
    items.push(it);new IntersectionObserver(e=>{it.vis=e[0].isIntersecting}).observe(cv);size(it);return it}
  function size(it){const r=it.cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);it.W=Math.max(1,Math.round(r.width*d));it.H=Math.max(1,Math.round(r.height*d));it.cv.width=it.W;it.cv.height=it.H;it.d=d}
  function draw(it,t){const {ctx,W,H,d}=it,dark=it.fd!==undefined?it.fd:document.documentElement.dataset.theme==="dark";
    ctx.clearRect(0,0,W,H);
    const S=Math.max(3,Math.round(Math.min(W,H)/26/ (d>1?1:1)))|0, px=it.style==="wire"?Math.max(2,Math.round(S*.45)):it.style==="dot"?S:S-Math.max(1,Math.round(d));
    const a=RM()?it.a0:it.a0+t*.00045, tilt=.32;
    const ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(tilt),st=Math.sin(tilt);
    const cx=Math.round(W/2),cy=Math.round(H*.46);
    const pts=it.vox.map(p=>{const x1=p[0]*ca+p[2]*sa,z1=-p[0]*sa+p[2]*ca,y1=p[1]*ct-z1*st,dep=p[1]*st+z1*ct;return [cx+Math.round(x1*S),cy-Math.round(y1*S),dep,p[1],p[3]]});
    pts.sort((A,B)=>A[2]-B[2]);
    let ymin=1e9,ymax=-1e9;for(const p of it.vox){ymin=Math.min(ymin,p[1]);ymax=Math.max(ymax,p[1])}
    // основа: beam / shadow / grid / marks / none
    const by=cy+Math.round((ymax-ymin)*.5*S*ct)+S*3, gc=dark?"158,162,174":"93,97,112", dot=Math.max(2,d*2);
    if(it.base==="beam"){
      const beam=ctx.createLinearGradient(0,by,0,cy-(ymax-ymin)*S*.6);const bc=dark?"94,202,214":"44,99,176";beam.addColorStop(0,`rgba(${bc},${dark?.16:.09})`);beam.addColorStop(1,`rgba(${bc},0)`);
      ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(cx-S*3,by);ctx.lineTo(cx+S*3,by);ctx.lineTo(cx+S*9,cy-(ymax-ymin)*S*.6);ctx.lineTo(cx-S*9,cy-(ymax-ymin)*S*.6);ctx.fill();
      ctx.fillStyle=`rgba(${gc},.5)`;for(let i=0;i<28;i++){const an=i/28*Math.PI*2;ctx.fillRect(cx+Math.round(Math.cos(an)*S*7)-1,by+Math.round(Math.sin(an)*S*1.6)-1,dot,dot)}
    }else if(it.base==="shadow"){
      // піксельна тінь самого предмета на підлозі
      const seen=new Set();ctx.fillStyle=`rgba(${gc},${dark?.28:.22})`;
      for(const p of it.vox){const x1=p[0]*ca+p[2]*sa,z1=-p[0]*sa+p[2]*ca;const gx=cx+Math.round(x1*S/2)*2,gy=by-S*2+Math.round(z1*S*.28/2)*2;const k=gx+","+gy;if(seen.has(k))continue;seen.add(k);ctx.fillRect(gx-S/2|0,gy,S,Math.max(2,S*.5|0))}
    }else if(it.base==="grid"){
      // підлога-креслення: сітка точок обертається разом із предметом
      const fy=ymin-1.5;ctx.fillStyle=`rgba(${gc},.8)`;
      for(let gx=-8;gx<=8;gx+=2)for(let gz=-8;gz<=8;gz+=2){const x1=gx*ca+gz*sa,z1=-gx*sa+gz*ca,y1=fy*ct-z1*st;const r=Math.hypot(gx,gz);if(r>8.5)continue;
        ctx.globalAlpha=Math.max(.15,1-r/9);ctx.fillRect(cx+Math.round(x1*S)-1,cy-Math.round(y1*S)-1,dot,dot)}
      ctx.globalAlpha=1;
    }else if(it.base==="marks"){
      // кутові мітки креслення навколо предмета
      let x0=1e9,x9=-1e9,y0=1e9,y9=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);x9=Math.max(x9,q[0]);y0=Math.min(y0,q[1]);y9=Math.max(y9,q[1])}
      const m=S*2,L=S*2,lw=Math.max(1,d);x0-=m;x9+=m;y0-=m;y9+=m;ctx.fillStyle=`rgba(${gc},.8)`;
      for(const [X,Y,sx,sy] of [[x0,y0,1,1],[x9,y0,-1,1],[x0,y9,1,-1],[x9,y9,-1,-1]]){ctx.fillRect(sx>0?X:X-L,Y,L,lw);ctx.fillRect(X,sy>0?Y:Y-L,lw,L)}
      ctx.fillRect(cx-S,(y0+y9)/2|0,S*2,lw);ctx.fillRect(cx,((y0+y9)/2|0)-S,lw,S*2);
    }
    ctx.globalCompositeOperation=dark?"lighter":"source-over";
    const flick=RM()?1:.9+.1*Math.sin(t/140+it.seed);
    const sweep=RM()?.35:((t/3200+it.seed)%1.6)-.3;
    for(const p of pts){const ty=(p[3]-ymin)/((ymax-ymin)||1);const front=(p[2]+8)/16;
      let c, al;
      if(it.style==="dot"){const near=Math.abs(ty-(1-sweep))<.12;c=near||p[4]?iris(ty,dark):(dark?[201,204,211]:[38,40,46]);al=(.45+.5*front)*flick}
      else if(it.style==="wire"){c=p[4]?iris(.75,dark):(dark?[141,182,236]:[44,99,176]);al=(.55+.45*front)*flick}
      else{c=iris(p[4]?.85:ty*.7,dark);al=(.35+.6*front)*flick;if(it.scan){const b=Math.abs(ty-(1-sweep));if(b<.08)al=Math.min(1,al+.45);else if(b<.16)al+=.15}}
      ctx.fillStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${Math.min(1,al).toFixed(3)})`;
      if(it.style==="dot"){ctx.beginPath();ctx.arc(p[0],p[1],px*.36,0,Math.PI*2);ctx.fill()}else ctx.fillRect(p[0]-(px>>1),p[1]-(px>>1),px,px)}
    ctx.globalCompositeOperation="source-over";
    // скан-лінії
    ctx.fillStyle=dark?"rgba(12,13,16,.28)":"rgba(247,248,250,.32)";for(let y=0;y<H;y+=3*d)ctx.fillRect(0,y,W,d);
    // повільний глітч: раз на кілька секунд зсуваємо смугу
    if(!RM()&&!it.noGlitch){const ph=(t+it.seed*7)%5200;if(ph<130){const gy=((it.seed*37+Math.floor(t/5200)*53)%(H*.6))+H*.15|0,gh=Math.round(S*1.5);
      const img=ctx.getImageData(0,gy,W,gh);ctx.clearRect(0,gy,W,gh);ctx.putImageData(img,Math.round(S*(ph<65?1.2:-.6)),gy)}}
  }
  let last=0;
  function loop(t){if(t-last>33){last=t;for(const it of items)if(it.vis&&it.cv.isConnected)draw(it,t)}requestAnimationFrame(loop)}
  addEventListener("resize",()=>{items.forEach(it=>{size(it);draw(it,performance.now())})});
  function start(){items.forEach(it=>draw(it,0));requestAnimationFrame(loop)}
  function redraw(){items.forEach(it=>draw(it,performance.now()))}
  return {mount,start,redraw,models:MODELS,iris,RM,SYS_RM};
})();

const IC5={
calendar:["..X......X..",".XXXXXXXXXX.",".X........X.",".XXXXXXXXXX.",".X........X.",".X.XX.XX..X.",".X........X.",".X.XX.oo..X.",".X........X.",".XXXXXXXXXX.","............","............"],
page:[".XXXXXXX....",".X.....XX...",".X.....X.X..",".X.....XXXX.",".X........X.",".X.XXXXX..X.",".X........X.",".X.XXXXXX.X.",".X........X.",".X.ooo....X.",".X........X.",".XXXXXXXXXX."],
phone:["...XXXXXX...","...X....X...","...X....X...","...X....X...","...X....X...","...X....X...","...X....X...","...X....X...","...XXXXXX...","...X.oo.X...","...XXXXXX...","............"],
chat:["............",".XXXXXXXXXX.",".X........X.",".X.XX.XX..X.",".X........X.",".X.oooo...X.",".X........X.",".XXXX.XXXXX.","....X.X.....","....XX......","....X.......","............"],
bars:["............",".X..........",".X.......oo.",".X.......oo.",".X....XX.oo.",".X....XX.oo.",".X.XX.XX.oo.",".X.XX.XX.oo.",".X.XX.XX.oo.",".XXXXXXXXXX.","............","............"],
search:["............","..XXXX......",".X....X.....","X......X....","X..oo..X....","X..oo..X....",".X....X.....","..XXXXXX....",".......XX...","........XX..",".........XX.","............"],
cart:["............","XX..........",".X..........",".XXXXXXXXXX.",".X.......X..",".X.......X..","..X.....X...","..XXXXXXX...","............","..oo...oo...","..oo...oo...","............"],
box:["............","..XXXXXXXX..",".X...oo...X.","XXXXXooXXXXX","X....oo....X","X....oo....X","X..........X","X..........X","X..........X","XXXXXXXXXXXX","............","............"],
card:["............","............","XXXXXXXXXXXX","X..........X","XXXXXXXXXXXX","XXXXXXXXXXXX","X..........X","X.ooo......X","X..........X","XXXXXXXXXXXX","............","............"],
globe:["....XXXX....","..XX.XX.XX..",".X..X..X..X.",".X..X..X..X.","XXXXXXXXXXXX","X...X..X...X","X...X..X...X","XXXXXXXXXXXX",".X..X..X..X.",".X..X..X..X.","..XX.XX.XX..","....XXXX...."],
server:["............","XXXXXXXXXXXX","X..........X","X.XX.....o.X","X..........X","XXXXXXXXXXXX","X..........X","X.XX.....o.X","X..........X","XXXXXXXXXXXX","............","............"],
shield:[".....XX.....","...XX..XX...",".XX......XX.",".X........X.",".X......o.X.",".X.....o..X.",".X.o..o...X.",".X..oo....X.","..X......X..","...X....X...","....X..X....",".....XX....."],
bell:[".....XX.....","....XXXX....","...X....X...","..X......X..","..X......X..","..X......X..","..X......X..",".X........X.","XXXXXXXXXXXX","............","....oooo....","............"],
report:[".XXXXXXXXX..",".X.......X..",".X.XXXXX.X..",".X.......X..",".X.XXXXX.X..",".X.......X..",".X.XXX...X..",".X.......X..",".X...o.o.X..",".X....o..X..",".XXXXXXXXX..","............"],
arrow:["............","............","......X.....",".......X....","........X...",".XXXXXXXXX..","........X...",".......X....","......X.....","............","............","............"],
check:["............","............","............",".........X..","........X...",".......X....","..X...X.....","...X.X......","....X.......","............","............","............"],
menu:["............","............","XXXXXXXXXXXX","............","............","XXXXXXXXXXXX","............","............","XXXXXXXXXXXX","............","............","............"],
close:["............",".X........X.","..X......X..","...X....X...","....X..X....",".....XX.....",".....XX.....","....X..X....","...X....X...","..X......X..",".X........X.","............"]};

/* піксельні іконки */
const IC7={
close:["............",".X........X.","..X......X..","...X....X...","....X..X....",".....XX.....",".....XX.....","....X..X....","...X....X...","..X......X..",".X........X.","............"],
arrow:["............","............","......X.....",".......X....","........X...",".XXXXXXXXX..","........X...",".......X....","......X.....","............","............","............"],
plus:["............","............",".....X......",".....X......",".....X......","..XXXXXXX...",".....X......",".....X......",".....X......","............","............","............"],
minus:["............","............","............","............","............","..XXXXXXX...","............","............","............","............","............","............"],
check:["............","............","............",".........X..","........X...",".......X....","..X...X.....","...X.X......","....X.......","............","............","............"],
info:["....XXXX....","..XX....XX..",".X...XX...X.",".X........X.","X....XX....X","X....XX....X","X....XX....X","X....XX....X",".X...XX...X.",".X........X.","..XX....XX..","....XXXX...."],
alert:[".....XX.....","....X..X....","....X..X....","...X.XX.X...","...X.XX.X...","..X..XX..X..","..X..XX..X..",".X........X.",".X...XX...X.","X....XX....X","XXXXXXXXXXXX","............"],
theme:["....XXXX....","..XXXX..XX..",".XXXXX....X.",".XXXXX....X.","XXXXXX.....X","XXXXXX.....X","XXXXXX.....X","XXXXXX.....X",".XXXXX....X.",".XXXXX....X.","..XXXX..XX..","....XXXX...."]};
const IC=Object.assign({},IC5,IC7);
const bb=(g)=>{let x0=12,x1=-1,y0=12,y1=-1;g.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=="."){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}}));return [((x0+x1+1)/2-6),((y0+y1+1)/2-6)]};
function pix(n,cls=""){let r="";IC[n].forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==".")r+=`<rect ${c==="o"?'class="o"':""} x="${x}" y="${y}" width="1" height="1"/>`}));const [dx,dy]=bb(IC[n]);return `<svg class="pix ${cls}" viewBox="${dx} ${dy} 12 12" fill="currentColor" aria-hidden="true">${r}</svg>`}




const COARSE=typeof matchMedia!=="undefined"&&matchMedia("(pointer: coarse)").matches;
const MO=()=>window.MK_MOTION!==undefined?window.MK_MOTION!==false:!matchMedia("(prefers-reduced-motion: reduce)").matches;
const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]].map(r=>r.map(v=>(v+.5)/16));
const POOL="░▒▓█/<>#01АБВГҐДЕЄЖЗИІЇЙКЛМН";
/* розшифрування: 900 мс, один раз */
function decode(el,text){const t=text||el.dataset.t||el.textContent;if(!MO()){el.textContent=t;return}const t0=performance.now(),D=900;
 (function f(now){const k=Math.min(1,(now-t0)/D),n=Math.floor(t.length*k);let g="";for(const ch of t.slice(n))g+=ch===" "?" ":POOL[Math.random()*POOL.length|0];
 el.textContent=t.slice(0,n);if(g){const s=document.createElement("span");s.className="mk-g";s.textContent=g;el.appendChild(s)}if(k<1)requestAnimationFrame(f)})(t0)}
/* друк термінала: до 50 знаків, до 3 с */
function type(el,text,{speed}={}){const t=text||el.dataset.t||el.textContent;if(!MO()){el.textContent=t;return Promise.resolve()}const ms=speed||Math.min(60,3000/Math.max(1,t.length));let c=0;el.textContent="";
 return new Promise(res=>{(function st(){el.textContent=t.slice(0,++c);if(c<t.length)setTimeout(st,ms);else res()})()})}
/* піксельне розчинення (Bayer 4×4): 650 мс, телефон 450 мс */
function dissolve(cv,{dur,dir=1,color="#111216",cell,done}={}){dur=dur||(COARSE?450:650);cell=cell||(COARSE?8:6);const W=Math.max(8,Math.round(cv.clientWidth/cell)),H=Math.max(4,Math.round(cv.clientHeight/cell));cv.width=W;cv.height=H;const x=cv.getContext("2d");
 if(!MO()){x.clearRect(0,0,W,H);done&&done();return}const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/dur);x.clearRect(0,0,W,H);x.fillStyle=color;
 for(let i=0;i<W;i++)for(let j=0;j<H;j++){const th=B4[i%4][j%4]*.75+(i/W)*.25;if(dir>0?th>k:th<k)x.fillRect(i,j,1,1)}if(k<1)requestAnimationFrame(f);else{if(dir>0)x.clearRect(0,0,W,H);done&&done()}})(t0)}
/* піксельна смужка-градієнт ірис */
function dither(c,{dark=false,h=3}={}){const w=Math.max(40,Math.round(c.clientWidth/3));c.width=w;c.height=h;const x=c.getContext("2d");x.clearRect(0,0,w,h);
 for(let i=0;i<w;i++)for(let j=0;j<h;j++){const a=1-Math.abs(j-(h-1)/2)/((h-1)/2||1);if(a>B4[i%4][j%4]){const col=HOLO.iris(i/(w-1),dark);x.fillStyle=`rgb(${col[0]|0},${col[1]|0},${col[2]|0})`;x.fillRect(i,j,1,1)}}}
/* піксельний сплеск при натисканні кнопки A */
function burst(e,el){if(!MO())return;const n=COARSE?6:10,r=el.getBoundingClientRect(),x=e.clientX||r.left+r.width/2,y=e.clientY||r.top+r.height/2,C=["#5ECAD6","#6B9FD4","#D06AAE","#E87BAD"];
 for(let k=0;k<n;k++){const a=k/n*Math.PI*2+Math.random()*.4,d=14+Math.random()*12,p=document.createElement("i");p.className="burst";p.style.left=(x-2)+"px";p.style.top=(y-2)+"px";p.style.setProperty("--c",C[k%4]);p.style.setProperty("--dx",Math.cos(a)*d+"px");p.style.setProperty("--dy",Math.sin(a)*d+"px");document.body.appendChild(p);setTimeout(()=>p.remove(),400)}}

window.Mikaido={IC,pix,markAt,markFlat,markReal,pixel,HOLO,decode,type,dissolve,dither,burst,B4,MO};
})();
