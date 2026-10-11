/* Bench runtime: plug-in panel, parts, wires, instrument leads, netlist, analysis, rendering and pointer input.
   ENGINE.run(def) is called when the student sits at a table; def comes from labs/<lab>/<exp>.js. */
ENGINE.run=function(def){
'use strict';
const MODE=BENCH.mode;
const PX=def.params(MODE);
document.querySelectorAll('#benchView [data-p]').forEach(e=>e.textContent=PX[e.dataset.p]);

const RT={S:null,dirty:true,TB:null,DCI:0,DCCC:false,PX,MODE,uid:1};

/* ---------- plug-in panel geometry ---------- */
const BX=230,BY=430,COLS=7,ROWS=5,P=88,NN=COLS*ROWS;
const nodeC=i=>({x:BX+44+(i%COLS)*P,y:BY+44+Math.floor(i/COLS)*P});
const holeOff=h=>({x:((h%3)-1)*19,y:(Math.floor(h/3)-1)*19});
const holeP=(i,h)=>{const c=nodeC(i),o=holeOff(h);return {x:c.x+o.x,y:c.y+o.y}};
const EDGES=[];for(let i=0;i<NN;i++){if(i%COLS<COLS-1)EDGES.push([i,i+1]);if(i+COLS<NN)EDGES.push([i,i+COLS])}
function dirHole(a,b){if(b===a+1)return 5;if(b===a-1)return 3;if(b===a+COLS)return 7;return 1}

/* ---------- instruments ---------- */
const INST=def.instruments.map(spec=>ENGINE[spec.type](RT,spec));
const byKey={},byPrefix={};INST.forEach(i=>{byKey[i.key]=i;byPrefix[i.prefix]=i});
const LEADDEF={};INST.forEach(i=>(i.leads||[]).forEach(l=>LEADDEF[l.k]=l));
const LEADS=Object.keys(LEADDEF);
const PARK={};LEADS.forEach(k=>PARK[k]=LEADDEF[k].park);
const PARTS=def.parts;
const POLAR=t=>['D','Z','C'].includes((PARTS[t]||{}).t);
RT.inst=byKey;

/* ---------- state ---------- */
function fresh(){
  const old=RT.S;
  const S={parts:[],wires:[],leads:{}};
  INST.forEach(i=>S[i.key]=i.fresh());
  Object.assign(S,{sel:null,wireMode:false,wireStart:null,mode:old?old.mode:'practice'});
  LEADS.forEach(k=>S.leads[k]={node:null,hole:null});
  RT.S=S;RT.dirty=true;
}
let drag=null;

/* ---------- netlist from the bench ---------- */
function buildUser(force){
  const S=RT.S;const U=SOLVER.uf(NN+1),E=NN;const L=S.leads;
  S.parts.forEach(p=>{if(PARTS[p.type].t==='BR')U.u(p.a,p.b)});S.wires.forEach(w=>U.u(w.a,w.b));
  LEADS.forEach(k=>{if(LEADDEF[k].earth&&L[k].node!=null)U.u(L[k].node,E)});
  const root=U.f(E);const map=new Map();const idx=n=>{const r=U.f(n);if(r===root)return -1;if(!map.has(r))map.set(r,map.size);return map.get(r)};
  const els=[];
  S.parts.forEach(p=>{const d=PARTS[p.type];if(p.dead)return;
    if(d.t==='R')els.push({t:'G',a:idx(p.a),b:idx(p.b),g:d.g});
    else if(d.t==='D')els.push({t:'D',a:idx(p.a),b:idx(p.b),f:SOLVER.diodeSi});
    else if(d.t==='Z')els.push({t:'D',a:idx(p.a),b:idx(p.b),f:SOLVER.zener});
    else if(d.t==='C')els.push({t:'C',a:idx(p.a),b:idx(p.b),c:d.c,pid:p.id})});
  const ck={n:0,els,p1:null,p2:null,dcIdx:-1,idx};
  INST.forEach(i=>i.stamp&&i.stamp(ck,force));
  ck.n=map.size;return ck;
}
RT.buildUser=buildUser;

/* ---------- analysis ---------- */
function recompute(){
  const S=RT.S;
  if(def.analysis==='transient'){RT.TB=SOLVER.simulate(buildUser(false),RT.sigF(),6);RT.dirty=false;return}
  const ck=buildUser(false);const on=byKey.gen.on();const A=on?S.gen.amp/2:0,o=on?S.gen.off:0;
  const TB=SOLVER.sweep(ck,o-A,o+A,A?121:2);TB.A=A;TB.off=o;RT.TB=TB;
  let s=0;TB.I.forEach(v=>s+=Math.abs(v));RT.DCI=s/TB.I.length;RT.DCCC=TB.cc;RT.dirty=false;
}
function chanSig(ch){
  const S=RT.S,TB=RT.TB;const plugged=ch===0?S.leads.c1r.node!=null:S.leads.c2r.node!=null;const arr=ch===0?TB.v1:TB.v2;
  if(def.analysis==='transient'){const NS=SOLVER.NS;
    const raw=ph=>{if(!plugged)return 0;const u=((ph/(2*Math.PI))%1+1)%1*NS;const i=Math.floor(u)%NS,f=u-Math.floor(u);const a=arr[i],b=arr[(i+1)%NS];return (isNaN(a)?0:a)*(1-f)+(isNaN(b)?0:b)*f};
    const cpl=S.sc.ch[ch].cpl;let mean=0;if(cpl==='AC'){let s=0;for(let k=0;k<NS;k++)s+=raw(2*Math.PI*k/NS);mean=s/NS}
    const fn=ph=>cpl==='GND'?0:raw(ph)-mean;let mx=-1e9,mn=1e9;for(let k=0;k<NS;k++){const v=fn(2*Math.PI*k/NS);mx=Math.max(mx,v);mn=Math.min(mn,v)}
    return {fn,max:mx,min:mn,has:plugged&&(mx-mn)>0.0005}}
  const wv=byKey.gen.wv;
  const A=TB.A,o=TB.off;const raw=ph=>plugged?SOLVER.interp(TB,arr,o+A*wv(ph)):0;
  const cpl=S.sc.ch[ch].cpl;let mean=0;if(cpl==='AC'){let s=0;for(let k=0;k<200;k++)s+=raw(2*Math.PI*k/200);mean=s/200}
  const fn=ph=>cpl==='GND'?0:raw(ph)-mean;let mx=-1e9,mn=1e9;for(let k=0;k<240;k++){const v=fn(2*Math.PI*k/240);mx=Math.max(mx,v);mn=Math.min(mn,v)}
  return {fn,max:mx,min:mn,has:plugged&&(mx-mn)>0.02}}
RT.recompute=recompute;RT.chanSig=chanSig;
RT.sigF=()=>def.analysis==='transient'?byKey.xf.FQ:RT.S.gen.freq;
RT.render=l=>render(l);
RT.dsig=c=>byKey.sc.dsig(c);
RT.screenInner=()=>byKey.sc.screenInner();

/* ---------- board, parts, cables ---------- */
function staticSVG(){let s=`<rect x="${BX}" y="${BY}" width="${COLS*P}" height="${ROWS*P}" rx="12" fill="#c5ced2" stroke="#8d9ca2" stroke-width="2"/>`;
  for(let i=0;i<NN;i++){const c=nodeC(i);s+=`<rect x="${c.x-30}" y="${c.y-30}" width="60" height="60" rx="8" fill="#b3bec3" data-k="node:${i}"/>`;for(let h=0;h<9;h++){const o=holeOff(h);s+=`<circle cx="${c.x+o.x}" cy="${c.y+o.y}" r="4.2" fill="#38434a" pointer-events="none"/>`}}
  if(def.boardCaption)s+=T(BX+8,BY-8,def.boardCaption,{size:12,fill:'#93a6ab'});
  return s}
function partBody(type,L,sel){const h=L/2,d=PARTS[type]||{t:type};let s='';const t=d.t;
  if(t==='BR'){s+=`<rect x="${-h-6}" y="-7" width="${L+12}" height="14" rx="4" fill="#eef2f3" stroke="${sel?CH1:'#7d8c92'}" stroke-width="${sel?3:1.5}"/>`}
  else{s+=`<rect x="${-h-8}" y="-14" width="${L+16}" height="28" rx="5" fill="${t==='C'?'#dfeefb':'#f6f8f9'}" stroke="${sel?CH1:'#7d8c92'}" stroke-width="${sel?3:1.5}"/><line x1="${-h}" y1="0" x2="${h}" y2="0" stroke="#111" stroke-width="2"/>`;
    if(t==='R')s+=`<rect x="-14" y="-6" width="28" height="12" fill="#f6f8f9"/><polyline points="-14,0 -11,-6 -6,6 -1,-6 4,6 9,-6 12,0 14,0" fill="none" stroke="#111" stroke-width="1.8"/>`;
    else if(t==='C')s+=`<rect x="-5" y="-11" width="10" height="22" fill="#dfeefb"/><line x1="-4" y1="-10" x2="-4" y2="10" stroke="#111" stroke-width="2.4"/><path d="M5 -10 q-5 10 0 20" fill="none" stroke="#111" stroke-width="2.4"/><text x="-11" y="-3" font-size="11" fill="#c00" font-weight="700" text-anchor="middle">+</text>`;
    else{s+=`<polygon points="-8,-8 -8,8 7,0" fill="#111"/><line x1="7" y1="-8" x2="7" y2="8" stroke="#111" stroke-width="2.4"/>`;if(t==='Z')s+=`<polyline points="3,-11 7,-8 7,8 11,11" fill="none" stroke="#111" stroke-width="2.2"/>`}}
  s+=`<circle cx="${-h}" cy="0" r="4.5" fill="#c8a24a" stroke="#6b5520"/><circle cx="${h}" cy="0" r="4.5" fill="#c8a24a" stroke="#6b5520"/>`;return s}
function occupied(){const S=RT.S;const occ=new Set();S.parts.forEach(p=>{occ.add(p.a+':'+dirHole(p.a,p.b));occ.add(p.b+':'+dirHole(p.b,p.a))});S.wires.forEach(w=>{occ.add(w.a+':'+w.ha);occ.add(w.b+':'+w.hb)});LEADS.forEach(k=>{const l=S.leads[k];if(l.node!=null)occ.add(l.node+':'+l.hole)});return occ}
function freeHole(node,pref=[4,0,2,6,8,1,3,5,7]){const occ=occupied();for(const h of pref)if(!occ.has(node+':'+h))return h;return null}
function partsSVG(){const S=RT.S;let s='';
  S.wires.forEach(w=>{const a=holeP(w.a,w.ha),b=holeP(w.b,w.hb);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-Math.min(40,Math.hypot(b.x-a.x,b.y-a.y)*0.25);const sel=S.sel===w.id;const d=`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
    s+=`<path d="${d}" fill="none" stroke="#5a4300" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${sel?'#fff2a8':'#e0b000'}" stroke-width="4.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="transparent" stroke-width="16" data-k="wire:${w.id}" style="cursor:pointer"/>`});
  S.parts.forEach(p=>{if(drag&&drag.kind==='move'&&drag.id===p.id&&drag.active)return;const a=holeP(p.a,dirHole(p.a,p.b)),b=holeP(p.b,dirHole(p.b,p.a));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;const L=Math.hypot(b.x-a.x,b.y-a.y);
    s+=`<g transform="translate(${mx} ${my}) rotate(${ang})" data-k="part:${p.id}" style="cursor:grab">${partBody(p.type,L,S.sel===p.id)}</g>`;
    if(p.dead)s+=T(mx,my+5,'💥',{size:20,a:'middle'});
    const lab=PARTS[p.type].lab;if(lab){const vert=Math.abs(ang)>45;s+=T(vert?mx+22:mx,vert?my+4:my-19,lab,{size:9.5,fill:'#22302f',a:vert?'start':'middle',w:600})}});
  const sp=S.parts.find(p=>p.id===S.sel),sw=S.wires.find(w=>w.id===S.sel);
  if(sp||sw){let x,y;if(sp){const a=nodeC(sp.a),b=nodeC(sp.b);x=(a.x+b.x)/2;y=(a.y+b.y)/2-40}else{const a=holeP(sw.a,sw.ha),b=holeP(sw.b,sw.hb);x=(a.x+b.x)/2;y=(a.y+b.y)/2-44}
    const btn=(bx,lab,k,c)=>`<circle cx="${bx}" cy="${y}" r="15" fill="#141c20" stroke="${c}" stroke-width="2" data-k="${k}" style="cursor:pointer"/>`+T(bx,y+5,lab,{size:14,fill:c,a:'middle',w:600});
    s+=sp&&POLAR(sp.type)?btn(x-20,'⇄','tb:flip',CH2)+btn(x+20,'✕','tb:del',RED):btn(x,'✕','tb:del',RED)}
  if(S.wireMode&&S.wireStart!=null){const c=nodeC(S.wireStart);s+=`<rect x="${c.x-32}" y="${c.y-32}" width="64" height="64" rx="9" fill="none" stroke="#e0b000" stroke-width="3" pointer-events="none"/>`}
  return s}
function leadPos(k){const l=RT.S.leads[k];if(drag&&drag.kind==='lead'&&drag.key===k&&drag.active)return {x:drag.x,y:drag.y};if(l.node!=null)return holeP(l.node,l.hole);return PARK[k]}
/* cable drawing kit handed to instruments */
const DRAW={leadPos,
  plug:(k,p,col,dark)=>{const l=RT.S.leads[k];return `<circle cx="${p.x}" cy="${p.y}" r="${l.node!=null?7:9}" fill="${col}" stroke="${dark}" stroke-width="2"/>`+(l.node==null?`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#c8a24a"/>`:'')+`<circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent" data-k="lead:${k}" style="cursor:grab"/>`},
  lead:(a,p,col,dark)=>{const cx=(a.x+p.x)/2,cy=Math.max(a.y,p.y)+28;return `<path d="M${a.x} ${a.y} Q${cx} ${cy} ${p.x} ${p.y}" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/><path d="M${a.x} ${a.y} Q${cx} ${cy} ${p.x} ${p.y}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`},
  coax:(A,kr,kb,lab)=>{const pr=leadPos(kr),pb=leadPos(kb);const M={x:(pr.x+pb.x)/2,y:(pr.y+pb.y)/2};const Sp={x:M.x+(A.x-M.x)*0.3,y:M.y+(A.y-M.y)*0.3-12};const d=`M${A.x} ${A.y} C${A.x} ${A.y+70} ${Sp.x+(A.x-Sp.x)*0.3} ${Sp.y-40} ${Sp.x} ${Sp.y}`;
    return `<path d="${d}" fill="none" stroke="#1e2326" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#4a555b" stroke-width="5" stroke-linecap="round"/><rect x="${Sp.x-7}" y="${Sp.y-7}" width="14" height="14" rx="3" fill="#2b3236"/><text x="${Sp.x}" y="${Sp.y-12}" font-size="10" fill="#93a6ab" text-anchor="middle" pointer-events="none">${lab}</text>`+DRAW.lead(Sp,pr,'#e2453b','#5a1414')+DRAW.lead(Sp,pb,'#30363a','#000')+DRAW.plug(kr,pr,RED,'#7a1b1b')+DRAW.plug(kb,pb,BLK,'#000')}};
function cablesSVG(){return (def.cableOrder||INST.map(i=>i.key)).map(k=>byKey[k].cables?byKey[k].cables(DRAW):'').join('')}
function nearestEdge(x,y){let best=null,bd=34;EDGES.forEach(e=>{const a=nodeC(e[0]),b=nodeC(e[1]);const d=Math.hypot((a.x+b.x)/2-x,(a.y+b.y)/2-y);if(d<bd){bd=d;best=e}});return best}
function nearestNode(x,y){let best=null,bd=40;for(let i=0;i<NN;i++){const c=nodeC(i);const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;best=i}}return best}
function dragSVG(){if(!drag||!drag.active)return '';let s='';
  if(drag.kind==='new'||drag.kind==='move'){const e=nearestEdge(drag.x,drag.y);if(e){const a=nodeC(e[0]),b=nodeC(e[1]);s+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${CH2}" stroke-width="6" opacity=".5" stroke-linecap="round"/>`}
    s+=`<g transform="translate(${drag.x} ${drag.y}) rotate(${e&&e[1]-e[0]===COLS?90:0})" opacity=".9">${partBody(drag.type,52,false)}</g>`}
  if(drag.kind==='lead'){const n=nearestNode(drag.x,drag.y);if(n!=null){const c=nodeC(n);s+=`<rect x="${c.x-32}" y="${c.y-32}" width="64" height="64" rx="9" fill="none" stroke="${CH2}" stroke-width="3"/>`}}
  return s}

/* ---------- render ---------- */
let staticDone=false;
function render(light){
  if(!staticDone){$('Lstatic').innerHTML=staticSVG();staticDone=true}
  if(!light){if(RT.dirty){recompute();INST.forEach(i=>i.postSim&&i.postSim())}$('Ldyn').innerHTML=INST.map(i=>i.svg()).join('');BENCH.onRender()}
  $('Lparts').innerHTML=partsSVG();$('Lcables').innerHTML=cablesSVG();$('Ldrag').innerHTML=dragSVG();
}
function circuitChanged(){RT.dirty=true;INST.forEach(i=>i.onCircuitChange&&i.onCircuitChange())}

/* ---------- pointer interaction ---------- */
const svg=$('bench');
function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM().inverse();const r=p.matrixTransform(m);return {x:r.x,y:r.y}}
svg.addEventListener('pointerdown',e=>{const S=RT.S;const el=e.target.closest('[data-k]');const p=pt(e);
  if(BENCH.view==='ov'){BENCH.ovClick(p);return}
  if(S.armed&&(!el||el.dataset.k.startsWith('node:'))){placeArmed(p);return}
  if(!el){if(S.sel){S.sel=null;render(true)}return}
  const k=el.dataset.k;
  if(k.startsWith('tray:')){const t=k.slice(5);if(t==='W'){S.wireMode=!S.wireMode;S.wireStart=null;S.sel=null;render();return}
    drag={kind:'new',type:t,x:p.x,y:p.y,sx:p.x,sy:p.y,active:true};svg.setPointerCapture(e.pointerId);render(true);return}
  if(k.startsWith('part:')){const id=+k.slice(5);const pr=S.parts.find(q=>q.id===id);drag={kind:'move',id,type:pr.type,x:p.x,y:p.y,sx:p.x,sy:p.y,active:false};svg.setPointerCapture(e.pointerId);return}
  if(k.startsWith('wire:')){S.sel=S.sel===+k.slice(5)?null:+k.slice(5);render(true);return}
  if(k.startsWith('lead:')){drag={kind:'lead',key:k.slice(5),x:p.x,y:p.y,sx:p.x,sy:p.y,active:false};svg.setPointerCapture(e.pointerId);return}
  if(k==='tb:flip'){const pr=S.parts.find(q=>q.id===S.sel);if(pr){const t=pr.a;pr.a=pr.b;pr.b=t;circuitChanged();render()}return}
  if(k==='tb:del'){S.parts=S.parts.filter(q=>q.id!==S.sel);S.wires=S.wires.filter(w=>w.id!==S.sel);S.sel=null;circuitChanged();render();return}
  if(k.startsWith('node:')){const n=+k.slice(5);if(S.wireMode){if(S.wireStart==null)S.wireStart=n;else if(S.wireStart!==n){const pr=[0,2,6,8,4,1,3,5,7];const ha=freeHole(S.wireStart,pr),hb=freeHole(n,pr);if(ha!=null&&hb!=null){S.wires.push({id:RT.uid++,a:S.wireStart,b:n,ha,hb});circuitChanged()}S.wireStart=null}render();return}
    if(S.sel){S.sel=null;render(true)}return}
  const inst=byPrefix[k.split(':')[0]];if(inst){inst.keyFn(k.slice(k.indexOf(':')+1));render()}
});
svg.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);drag.x=p.x;drag.y=p.y;if(!drag.active&&Math.hypot(p.x-drag.sx,p.y-drag.sy)>6){drag.active=true;if(drag.kind==='move')RT.S.sel=null}if(drag.active)render(true)});
function endDrag(){const S=RT.S;if(!drag)return;if(drag.fromTray&&Math.hypot(drag.x-drag.sx,drag.y-drag.sy)<8){S.armed=drag.type;drag=null;BENCH.drawerSync();render(true);return}const d=drag;drag=null;
  if(d.kind==='new'||d.kind==='move'){
    if(d.kind==='move'&&!d.active){S.sel=S.sel===d.id?null:d.id;render(true);return}
    const e=nearestEdge(d.x,d.y);const taken=e&&S.parts.some(q=>q.id!==d.id&&((q.a===e[0]&&q.b===e[1])||(q.a===e[1]&&q.b===e[0])));
    if(d.kind==='move'){const pr=S.parts.find(q=>q.id===d.id);if(e&&!taken){pr.a=e[0];pr.b=e[1]}else if(!e){S.parts=S.parts.filter(q=>q.id!==d.id)}}
    else if(e&&!taken){S.parts.push({id:RT.uid++,type:d.type,a:e[0],b:e[1]})}
    circuitChanged();render();return}
  if(d.kind==='lead'){if(!d.active)return;const l=S.leads[d.key];const n=nearestNode(d.x,d.y);l.node=null;l.hole=null;if(n!=null){const h=freeHole(n);if(h!=null){l.node=n;l.hole=h}}
    if(LEADDEF[d.key].circuit)circuitChanged();else RT.dirty=true;render()}}
svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',()=>{drag=null;render(true)});
const WHEEL=INST.filter(i=>i.wheel&&i.wheel.length).map(i=>`${i.prefix}:(${i.wheel.join('|')})`);
const wheelRe=new RegExp(`^(${WHEEL.join('|')})[c+-]?$`);
svg.addEventListener('wheel',e=>{if(BENCH.view==='ov')return;const el=e.target.closest('[data-k]');if(!el)return;const k=el.dataset.k;const m=k.match(wheelRe);if(!m)return;e.preventDefault();const base=m[1];const dir=e.deltaY<0?'+':'-';
  const inst=byPrefix[base.split(':')[0]];inst.keyFn(base.slice(base.indexOf(':')+1)+dir);render()},{passive:false});

function placeArmed(p){const S=RT.S;let best=null,bd=70;EDGES.forEach(e=>{const a=nodeC(e[0]),b=nodeC(e[1]);const d=Math.hypot((a.x+b.x)/2-p.x,(a.y+b.y)/2-p.y);if(d<bd){bd=d;best=e}});
  if(best&&!S.parts.some(q=>(q.a===best[0]&&q.b===best[1])||(q.a===best[1]&&q.b===best[0]))){S.parts.push({id:RT.uid++,type:S.armed,a:best[0],b:best[1]});circuitChanged()}
  S.armed=null;BENCH.drawerSync();render()}
function trayDown(t,e){const S=RT.S;if(t==='W'){S.wireMode=!S.wireMode;S.wireStart=null;S.sel=null;S.armed=null;BENCH.drawerSync();render();return}
  S.wireMode=false;if(S.armed===t){S.armed=null;BENCH.drawerSync();return}S.armed=null;const p=pt(e);drag={kind:'new',type:t,x:p.x,y:p.y,sx:p.x,sy:p.y,active:true,fromTray:true};try{svg.setPointerCapture(e.pointerId)}catch(_){}BENCH.drawerSync();render(true)}

/* ---------- experiment hooks ---------- */
const X=def.setup(RT);
BENCH.register({
  regions:def.regions,names:def.names,
  tray:def.tray.map(([t,l])=>({t,l})),
  icon:t=>t==='W'?'<svg viewBox="-34 -18 68 36"><path d="M-24 8 q24 -26 48 0" fill="none" stroke="#e0b000" stroke-width="5" stroke-linecap="round"/></svg>':`<svg viewBox="-36 -18 72 36">${partBody(t,40,false)}</svg>`,
  trayDown,isWire:()=>RT.S.wireMode,armed:()=>RT.S&&RT.S.armed,
  status:X.status,P:PX,steps:X.steps,
  reset(){fresh();X.onReset&&X.onReset();render()},
  render:()=>render()
});
fresh();render();
};
