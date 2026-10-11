/* Bench runtime: layout, plug-in panel, parts, wires, instrument leads, netlist, analysis, rendering and pointer input.
   ENGINE.run(def) is called when the student sits at a table; def comes from labs/<lab>/<exp>.js:
     instruments:[{type:'gen'|'psu'|'scope'|'dmm'|'xf', prev, probes, at?}]   left-to-right on the bench
     parts:{id:{t:'R'|'D'|'Z'|'C'|'BR', r|c, lab}}, tray:[[id,label],…], setup(RT) -> {status, steps, onReset}
   Results always come from the solver (SOLVER.sweep for resistive/diode circuits driven by the generator,
   SOLVER.simulate when capacitors or the transformer are present). */
ENGINE.run=function(def){
'use strict';
const MODE=BENCH.mode;
const PX=def.params(MODE);
document.querySelectorAll('#benchView [data-p]').forEach(e=>e.textContent=PX[e.dataset.p]);
const RT={S:null,dirty:true,TB:null,PX,MODE,uid:1};

/* ---------- layout: instruments around the plug-in panel, lead rack above it ----------
   Every instrument is built in its own frame (0,0) and placed on the desk at POS[key]; the student can move it by its handle.
   Default arrangement: each instrument sits on the side its terminals face (BNCs / jacks on the bottom → top row above the panel,
   on the right → left column, on the left → right column), so every cable runs straight to the panel without crossing another
   cable or passing over another instrument. */
const COLS=def.cols||7,ROWS=def.rows||5,P=88,NN=COLS*ROWS,BW=COLS*P,BH=ROWS*P;
const specs=def.instruments.map(s=>Object.assign({},s,{at:{x:0,y:0}}));
const INST=specs.map(spec=>ENGINE[spec.type](RT,spec));
const byKey={},byPrefix={};INST.forEach(i=>{byKey[i.key]=i;byPrefix[i.prefix]=i});
const LEADDEF={};INST.forEach(i=>(i.leads||[]).forEach(l=>LEADDEF[l.k]=Object.assign({inst:i},l)));
const LEADS=Object.keys(LEADDEF);
const fromOf=k=>{const f=LEADDEF[k].from;return typeof f==='function'?f():f};
const labelOf=k=>{const l=LEADDEF[k].label;return typeof l==='function'?l():l};
const FV={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
const FACE={};INST.forEach(i=>{const fs=(i.leads||[]).map(l=>fromOf(l.k));if(!fs.length){FACE[i.key]='down';return}
  const cx=fs.reduce((t,f)=>t+f.x,0)/fs.length,cy=fs.reduce((t,f)=>t+f.y,0)/fs.length,[w,h]=i.size;
  const d={left:cx,right:w-cx,up:cy,down:h-cy};FACE[i.key]=Object.keys(d).reduce((a,b)=>d[b]<d[a]?b:a)});
const RACK=64,RG=40,CG=70;          // rack row above the panel · gap between instruments · gap between a side column and the panel
let BX=0,BY=0,parkY=-RACK;
/* rack: every parked plug sits in one row above the panel, in the order of the terminals it comes from (so parked cables never cross) */
function parkFor(list){const want=list.map(w=>({k:w.k,x:w.x})).sort((a,b)=>a.x-b.x);
  const lo=BX-40,hi=BX+BW+40,gap=Math.min(56,(hi-lo)/Math.max(1,want.length-1));
  want.forEach(w=>w.x=clamp(w.x,lo,hi));for(let i=1;i<want.length;i++)want[i].x=Math.max(want[i].x,want[i-1].x+gap);
  const over=want.length?want[want.length-1].x-hi:0;if(over>0)for(let i=want.length-1;i>=0;i--){want[i].x-=over;if(i>0&&want[i].x-want[i-1].x>=gap)break}
  for(let i=want.length-2;i>=0;i--)want[i].x=Math.min(want[i].x,want[i+1].x-gap);
  const out={};want.forEach(w=>out[w.k]={x:Math.round(w.x),y:parkY});return out}
const DEF={};{
  const T=[],L=[],R=[];INST.forEach(i=>{const f=FACE[i.key];(f==='right'?L:f==='left'?R:T).push(i)});
  const col=(a,xf)=>{let y=BY;a.forEach(i=>{DEF[i.key]={x:xf(i),y};y+=i.size[1]+RG})};
  col(L,i=>BX-CG-i.size[0]);col(R,()=>BX+BW+CG);
  const row=ord=>{const W=ord.reduce((t,i)=>t+i.size[0],0)+Math.max(0,ord.length-1)*RG;let x=BX+BW/2-W/2;const yb=parkY-22-34;
    ord.forEach(i=>{DEF[i.key]={x:Math.round(x),y:yb-i.size[1]};x+=i.size[0]+RG})};
  /* order of the top row: the one with the shortest cables to the rack */
  const perms=a=>a.length<2?[a]:a.flatMap((x,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[x,...p]));
  let best=null;for(const ord of perms(T)){row(ord);const term=k=>{const f=fromOf(k),p=DEF[LEADDEF[k].inst.key];return {x:f.x+p.x,y:f.y+p.y}};
    const pk=parkFor(LEADS.map(k=>({k,x:term(k).x})));const len=LEADS.reduce((t,k)=>{const a=term(k);return t+Math.hypot(a.x-pk[k].x,a.y-pk[k].y)},0);
    if(!best||len<best.len-1)best={len,ord}}
  row(best?best.ord:T);
  /* shift so the whole desk starts at (20,20) */
  let x0=BX-66,y0=parkY-34;INST.forEach(i=>{x0=Math.min(x0,DEF[i.key].x);y0=Math.min(y0,DEF[i.key].y-36)});
  const dx=20-x0,dy=20-y0;BX+=dx;BY+=dy;parkY+=dy;INST.forEach(i=>{DEF[i.key].x+=dx;DEF[i.key].y+=dy})}
/* the student's arrangement, remembered per experiment (relative to the panel) */
const LSK='eelab:layout:'+(BENCH.exp||'');const POS={};
function loadPos(){INST.forEach(i=>POS[i.key]={...DEF[i.key]});try{const s=JSON.parse(localStorage.getItem(LSK)||'null');if(s)INST.forEach(i=>{const q=s[i.key];if(q&&isFinite(q.x)&&isFinite(q.y))POS[i.key]={x:BX+q.x,y:BY+q.y}})}catch(_){}}
function savePos(){try{const o={};INST.forEach(i=>o[i.key]={x:Math.round(POS[i.key].x-BX),y:Math.round(POS[i.key].y-BY)});localStorage.setItem(LSK,JSON.stringify(o))}catch(_){}}
loadPos();
const termOf=k=>{const f=fromOf(k),p=POS[LEADDEF[k].inst.key];return {x:f.x+p.x,y:f.y+p.y}};
const PARK={};const updPark=()=>Object.assign(PARK,parkFor(LEADS.map(k=>({k,x:termOf(k).x}))));updPark();
const nodeC=i=>({x:BX+44+(i%COLS)*P,y:BY+44+Math.floor(i/COLS)*P});
const holeOff=h=>({x:((h%3)-1)*19,y:(Math.floor(h/3)-1)*19});
const holeP=(i,h)=>{const c=nodeC(i),o=holeOff(h);return {x:c.x+o.x,y:c.y+o.y}};
const EDGES=[];for(let i=0;i<NN;i++){if(i%COLS<COLS-1)EDGES.push([i,i+1]);if(i+COLS<NN)EDGES.push([i,i+COLS])}
function dirHole(a,b){if(b===a+1)return 5;if(b===a-1)return 3;if(b===a+COLS)return 7;return 1}
const regions={},names={};
const updRegions=()=>INST.forEach(i=>{const p=POS[i.key];regions[i.key]=[p.x-6,p.y-34,i.size[0]+12,i.size[1]+40]});
updRegions();INST.forEach(i=>names[i.key]=ENGINE.NAMES[i.key]);
regions.board=[BX-66,parkY-34,BW+132,BY+BH+16-(parkY-34)];names.board=ENGINE.NAMES.board;
RT.inst=byKey;RT.layout={BX,BY,P,COLS,ROWS,parkY,PARK,regions,POS,DEF,FACE};

/* ---------- parts ---------- */
const PARTS=def.parts;
const POLAR=t=>['D','Z','C','LED','GE'].includes((PARTS[t]||{}).t);
/* multi-pin parts (ICs, transistors): def.pins = [{dx,dy,h,role,n}] node offsets from the anchor node p.n,
   the hole each leg goes into and its electrical role; def.pkg picks the drawing */
const MULTI=t=>!!(PARTS[t]&&PARTS[t].pins);
const pinNodes=p=>PARTS[p.type].pins.map(q=>p.n+q.dy*COLS+q.dx);
const fits=(t,n)=>{const ps=PARTS[t].pins;const c=n%COLS,r=Math.floor(n/COLS);return ps.every(q=>c+q.dx>=0&&c+q.dx<COLS&&r+q.dy>=0&&r+q.dy<ROWS)};
const ends=p=>MULTI(p.type)?pinNodes(p):[p.a,p.b];
/* centre of a multi-pin footprint */
function fpC(t,n){const ps=PARTS[t].pins;let x=0,y=0;ps.forEach(q=>{const c=nodeC(n+q.dy*COLS+q.dx);x+=c.x;y+=c.y});return {x:x/ps.length,y:y/ps.length}}

/* ---------- state ---------- */
function fresh(){
  const S={parts:[],wires:[],leads:{},cab:{}};
  INST.forEach(i=>S[i.key]=i.fresh());
  Object.assign(S,{sel:null,wireMode:false,wireStart:null,armed:null});
  LEADS.forEach(k=>S.leads[k]={node:null,hole:null});
  RT.S=S;RT.dirty=true;
}
let drag=null;

/* ---------- netlist from the bench ---------- */
function buildUser(force,opts){
  const S=RT.S;const U=SOLVER.uf(NN+1),E=NN;const L=S.leads;
  S.parts.forEach(p=>{if(PARTS[p.type].t==='BR')U.u(p.a,p.b)});S.wires.forEach(w=>U.u(w.a,w.b));
  LEADS.forEach(k=>{if(LEADDEF[k].earth&&L[k].node!=null)U.u(L[k].node,E)});
  const root=U.f(E);const map=new Map();const idx=n=>{const r=U.f(n);if(r===root)return -1;if(!map.has(r))map.set(r,map.size);return map.get(r)};
  let nIn=0;const inner=()=>{const k='in'+(nIn++);map.set(k,map.size);return map.size-1};
  const els=[];
  S.parts.forEach(p=>{const d=PARTS[p.type];if(p.dead)return;
    if(d.t==='R')els.push({t:'G',a:idx(p.a),b:idx(p.b),g:d.g||1/d.r,pid:p.id});
    else if(['D','Z','GE','LED'].includes(d.t))els.push({t:'D',a:idx(p.a),b:idx(p.b),f:SOLVER.MODELS[d.model||{D:'si',Z:'zener',GE:'ge',LED:'led'}[d.t]],pid:p.id});
    else if(d.t==='C')els.push({t:'C',a:idx(p.a),b:idx(p.b),c:d.c,pid:p.id});
    else if(d.pins){const R={};pinNodes(p).forEach((nd,k)=>{const r=d.pins[k].role;if(r)R[r]=idx(nd)});
      if(d.t==='OA')els.push(Object.assign({t:'OA',y:inner(),m:SOLVER.MODELS[d.model],pid:p.id},R));
      else if(d.stamp)d.stamp(els,R,inner,p)}});
  const ck={n:0,els,p1:null,p2:null,dcs:[],idx,opts};
  INST.forEach(i=>i.stamp&&i.stamp(ck,force,opts));
  ck.n=map.size;return ck;
}
RT.buildUser=buildUser;

/* ---------- analysis ---------- */
function recompute(){
  const S=RT.S;const ck=buildUser(false);const gen=byKey.gen;const genOn=!!(gen&&gen.on());
  if(ck.els.some(e=>e.t==='C'||e.t==='XS'||e.t==='OA')){
    const f=byKey.xf?byKey.xf.FQ:genOn?S.gen.freq:50;
    const vsFn=genOn?(t=>S.gen.off+S.gen.amp/2*gen.wv(2*Math.PI*f*t)):null;
    RT.TB=SOLVER.simulate(ck,f,def.cycles||6,vsFn);
  }else{const A=genOn?S.gen.amp/2:0,o=genOn?S.gen.off:0;RT.TB=SOLVER.sweep(ck,o-A,o+A,A?121:2);RT.TB.A=A;RT.TB.off=o}
  RT.TB.ck=ck;RT.dirty=false;
  INST.forEach(i=>i.measure&&i.measure());
  /* LEDs glow while they carry forward current */
  S.parts.forEach(p=>{if(PARTS[p.type].t==='LED'){p.iw=partIw(p);p.lit=litOf(p.iw.reduce((a,b)=>a+b,0)/p.iw.length)}});
  blinkTimer();
}
/* node voltage over one period (N samples, phase 0…2π) */
function samples(net,N=240){const TB=RT.TB;const out=new Float64Array(N);if(net==null||net<0||!TB)return out;
  if(TB.kind==='tran'){const NS=SOLVER.NS;for(let k=0;k<N;k++)out[k]=TB.X[Math.floor(k*NS/N)][net];return out}
  const col=TB.X.map(x=>x[net]);const wv=byKey.gen?byKey.gen.wv:()=>0;for(let k=0;k<N;k++)out[k]=SOLVER.interp(TB,col,TB.off+TB.A*wv(2*Math.PI*k/N));return out}
function chanSig(ch){
  const S=RT.S,TB=RT.TB;const net=TB&&TB.ck&&TB.ck.probes?TB.ck.probes[ch]:null;const plugged=net!=null;const tran=TB&&TB.kind==='tran';
  let raw;
  if(tran){const NS=SOLVER.NS;raw=ph=>{if(!plugged||net<0)return 0;const u=((ph/(2*Math.PI))%1+1)%1*NS;const i=Math.floor(u)%NS,f=u-Math.floor(u);return TB.X[i][net]*(1-f)+TB.X[(i+1)%NS][net]*f}}
  else{const col=plugged&&net>=0&&TB?TB.X.map(x=>x[net]):null;const wv=byKey.gen?byKey.gen.wv:()=>0;raw=ph=>col?SOLVER.interp(TB,col,TB.off+TB.A*wv(ph)):0}
  const NM=tran?SOLVER.NS:200,NX=tran?SOLVER.NS:240;
  const cpl=S.sc.ch[ch].cpl;let mean=0;if(cpl==='AC'){let s=0;for(let k=0;k<NM;k++)s+=raw(2*Math.PI*k/NM);mean=s/NM}
  const fn=ph=>cpl==='GND'?0:raw(ph)-mean;let mx=-1e9,mn=1e9;for(let k=0;k<NX;k++){const v=fn(2*Math.PI*k/NX);mx=Math.max(mx,v);mn=Math.min(mn,v)}
  return {fn,max:mx,min:mn,has:plugged&&(mx-mn)>(tran?0.0005:0.02)}}
/* live state of one supply unit: actual output voltage, current, CC */
function psuStat(u){const TB=RT.TB,U=RT.S.psu.u[u];if(!TB||!TB.ck||!TB.ck.psu)return {v:U.v,i:0,cc:false};const P=TB.ck.psu[u];if(!P)return {v:U.v,i:0,cc:false};
  const va=samples(P.a,60),vb=samples(P.b,60);let v=0;for(let k=0;k<60;k++)v+=(va[k]-vb[k])/60;
  let i;if(TB.kind==='tran')i=TB.Idc[P.dc];else{i=0;TB.Is.forEach(a=>i+=Math.abs(a[P.dc]||0));i/=TB.Is.length}
  return {v:Math.max(0,v),i:Math.abs(i),cc:!!TB.ccs[P.dc]}}
RT.recompute=recompute;RT.chanSig=chanSig;RT.samples=samples;RT.psuStat=psuStat;
RT.sigF=()=>RT.TB&&RT.TB.kind==='tran'?RT.TB.f:byKey.gen?RT.S.gen.freq:0;
RT.render=l=>render(l);
RT.dsig=c=>byKey.sc.dsig(c);
RT.screenInner=()=>byKey.sc.screenInner();
/* netlist index of a panel node in the last analysis (null = not in the circuit, -1 = earth) */
RT.netOf=node=>{const TB=RT.TB;if(!TB||!TB.ck||node==null)return null;return TB.ck.idx(node)};
/* ---------- helpers for step checks (topology and live readings) ---------- */
const meanOf=a=>{let s=0;for(const v of a)s+=v;return s/a.length};
const live=net=>net!=null&&net<(RT.TB&&RT.TB.ck?RT.TB.ck.n:0);
function nodeV(net){return net===-1?0:live(net)?meanOf(samples(net,60)):0}
function partNets(p){return ends(p).map(RT.netOf)}
/* net of a named pin of a multi-pin part */
function pinNet(p,role){const k=PARTS[p.type].pins.findIndex(q=>q.role===role||q.n===role);return k<0?null:RT.netOf(pinNodes(p)[k])}
function partV(p){if(MULTI(p.type))return 0;const [a,b]=partNets(p);return nodeV(a)-nodeV(b)}
/* LED brightness from its current; with a slow generator (< 20 Hz) it follows the waveform in real time
   (blinking), above that the eye only sees the average */
const litOf=i=>i>4e-4?Math.min(1,0.35+i/0.02):0;
function partIw(p){const [a,b]=partNets(p);const N=60;const out=new Array(N).fill(0);if(!live(a)&&a!==-1||!live(b)&&b!==-1)return out;const d=PARTS[p.type];const f=SOLVER.MODELS[d.model||'led'];
  const va=samples(a,N),vb=samples(b,N);for(let k=0;k<N;k++)out[k]=f((a===-1?0:va[k])-(b===-1?0:vb[k]))[0];return out}
const slowF=()=>{const g=byKey.gen;return g&&g.on()&&RT.TB&&RT.TB.kind!=='tran'&&RT.S.gen.freq<20?RT.S.gen.freq:0};
function litNow(p){const f=slowF();if(!f||!p.iw)return p.lit;const ph=((performance.now()/1000*f)%1+1)%1;return litOf(p.iw[Math.floor(ph*p.iw.length)%p.iw.length])}
let blinkT=null;function blinkTimer(){const need=slowF()&&RT.S.parts.some(p=>p.iw&&Math.max(...p.iw)-Math.min(...p.iw)>4e-4);
  if(need&&!blinkT)blinkT=setInterval(()=>{if(!BENCH.sim||BENCH.sim.RT!==RT){clearInterval(blinkT);blinkT=null;return}if(!drag)$('Lparts').innerHTML=partsSVG()},90);
  if(!need&&blinkT){clearInterval(blinkT);blinkT=null}}
RT.litNow=litNow;
function partI(p){const d=PARTS[p.type];if(d.pins)return 0;const [a,b]=partNets(p);if(!live(a)&&a!==-1||!live(b)&&b!==-1)return 0;const va=samples(a,60),vb=samples(b,60);let s=0;
  const f=d.t==='R'?(v=>v*(d.g||1/d.r)):['D','Z','GE','LED'].includes(d.t)?(v=>SOLVER.MODELS[d.model||{D:'si',Z:'zener',GE:'ge',LED:'led'}[d.t]](v)[0]):()=>0;
  for(let k=0;k<60;k++)s+=f((a===-1?0:va[k])-(b===-1?0:vb[k]));return s/60}
Object.assign(RT,{nodeV,partNets,pinNet,partV,partI,PARTS,
  leadNet:k=>RT.S.leads[k]&&RT.S.leads[k].node!=null?RT.netOf(RT.S.leads[k].node):null,
  parts:type=>RT.S.parts.filter(p=>!type||p.type===type||PARTS[p.type].t===type),
  /* parts whose two ends are exactly the nets a and b; dir=+1 means p.a on a */
  between:(a,b)=>RT.S.parts.filter(p=>{if(MULTI(p.type))return false;const [x,y]=partNets(p);return PARTS[p.type].t!=='BR'&&a!=null&&b!=null&&((x===a&&y===b)||(x===b&&y===a))}).map(p=>({p,dir:partNets(p)[0]===a?1:-1})),
  at:net=>RT.S.parts.filter(p=>PARTS[p.type].t!=='BR'&&partNets(p).includes(net)),
  dmm:()=>byKey.dmm?byKey.dmm.reading():null});

/* ---------- part drawings (top view, real looks: cathode bands, polarity stripes, colour codes) ---------- */
const BANDC=['#111','#7a4a1d','#d22','#f08a1c','#f3d21c','#2a9a3c','#2160c9','#7d3fb8','#8a8f93','#f7f7f7'];
function rBands(r){let e=0,v=r;while(v>=100){v/=10;e++}while(v<10){v*=10;e--}v=Math.round(v);return [Math.floor(v/10),v%10,e]}
/* multi-pin package drawn over its footprint (local coordinates: anchor node centre = 0,0) */
function pkgBody(type,sel,icon){const d=PARTS[type];let s='';
  if(d.pkg==='DIP8'){if(icon)return `<rect x="-30" y="-12" width="60" height="24" rx="3" fill="#1f2224"/><path d="M-30 -5 a5 5 0 0 1 0 10" fill="#3a3f42"/>`+[-21,-7,7,21].map(x=>`<rect x="${x-2.5}" y="-17" width="5" height="5" fill="#b9bec2"/><rect x="${x-2.5}" y="12" width="5" height="5" fill="#b9bec2"/>`).join('')+T(2,4,'741',{size:9,fill:'#d9dcde',a:'middle',w:600});
    const x0=-26,x1=3*P+26,y0=19+7,y1=P-19-7;
    s+=sel?`<rect x="${x0-8}" y="${y0-14}" width="${x1-x0+16}" height="${y1-y0+28}" rx="9" fill="none" stroke="${CH1}" stroke-width="2.5"/>`:'';
    d.pins.forEach(q=>{const x=q.dx*P,top=q.dy===0;const yh=top?19:P-19;s+=`<rect x="${x-4}" y="${top?yh-2:y1}" width="8" height="${top?y0-yh+2:yh-y1+2}" fill="#b9bec2" stroke="#7d868b" stroke-width=".8"/><circle cx="${x}" cy="${yh}" r="3.6" fill="#9aa3a8"/>`+T(x+(top?-9:-9),top?yh+3:yh+3,q.n,{size:7.5,fill:'#5d6a6e',a:'middle'})});
    s+=`<rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" rx="4" fill="#1f2224" stroke="#0c0d0e"/><path d="M${x0} ${(y0+y1)/2-7} a7 7 0 0 1 0 14" fill="#3a3f42"/><circle cx="${x0+12}" cy="${y1-8}" r="3" fill="#3a3f42"/>`;
    s+=T((x0+x1)/2,(y0+y1)/2-1,d.mark||'UA741CN',{size:11,fill:'#d9dcde',a:'middle',w:600})+T((x0+x1)/2,(y0+y1)/2+11,d.mark2||'',{size:7.5,fill:'#9aa1a5',a:'middle'})}
  if(d.pkg==='TO220'||d.pkg==='TO126'){const big=d.pkg==='TO220';const bw=big?60:46;
    if(icon)return `<rect x="${-bw/2}" y="-16" width="${bw}" height="${big?12:0}" rx="2" fill="#c3c8cc"/><rect x="${-bw/2}" y="${big?-6:-12}" width="${bw}" height="${big?16:22}" rx="2" fill="#1f2224"/>`+[-12,0,12].map(x=>`<rect x="${x-2}" y="10" width="4" height="8" fill="#b9bec2"/>`).join('')+T(0,big?6:2,d.mark||'',{size:7.5,fill:'#d9dcde',a:'middle',w:600});
    const yb=-24,yt=big?-66:-58;
    s+=sel?`<rect x="${-P-14}" y="${yt-8}" width="${2*P+28}" height="${-yt+8}" rx="9" fill="none" stroke="${CH1}" stroke-width="2.5"/>`:'';
    d.pins.forEach((q,k)=>{const x=q.dx*P-P,lx=(k-1)*14;s+=`<path d="M${lx} ${yb} L${lx} ${yb+3} L${x} -19" fill="none" stroke="#9aa3a8" stroke-width="3.2" stroke-linecap="round"/><circle cx="${x}" cy="-19" r="3.6" fill="#9aa3a8"/>`+T(x+9,-14,q.n,{size:7.5,fill:'#5d6a6e',a:'middle',w:600})});
    if(big)s+=`<rect x="${-bw/2}" y="${yt}" width="${bw}" height="16" rx="2" fill="#c3c8cc" stroke="#8d969a"/><circle cx="0" cy="${yt+8}" r="4.5" fill="#e9ecea" stroke="#8d969a"/>`;
    s+=`<rect x="${-bw/2}" y="${big?yt+16:yt}" width="${bw}" height="${yb-(big?yt+16:yt)}" rx="2.5" fill="#1f2224" stroke="#0c0d0e"/>`+T(0,yb-8,d.mark||'',{size:9,fill:'#d9dcde',a:'middle',w:600});
    s=`<g transform="translate(${P} 0)">${s}</g>`}
  return s}
function partBody(type,L,sel,lit){const h=L/2,d=PARTS[type]||{t:type};const t=d.t;let s='';if(d.pins)return pkgBody(type,sel,true);
  const legs=(a,b,col='#9aa3a8')=>`<line x1="${-h}" y1="0" x2="${a}" y2="0" stroke="${col}" stroke-width="2.2"/><line x1="${b}" y1="0" x2="${h}" y2="0" stroke="${col}" stroke-width="2.2"/>`;
  const glow=sel?`<rect x="${-h-8}" y="-15" width="${L+16}" height="30" rx="8" fill="none" stroke="${CH1}" stroke-width="2.5"/>`:'';
  if(t==='BR')return `<rect x="${-h-6}" y="-8" width="${L+12}" height="16" rx="5" fill="#f4f6f6" stroke="${sel?CH1:'#9aa6aa'}" stroke-width="${sel?3:1.5}"/><rect x="${-h+4}" y="-4" width="${L-8}" height="8" rx="3" fill="#e2e7e8"/>`+pins();
  if(t==='R'){const [a,b,m]=rBands(d.r||1/d.g);const mc=m>=0?BANDC[m]:m===-1?'#c9a227':'#c0c0c0';
    s+=legs(-14,14)+`<rect x="-15" y="-6" width="30" height="12" rx="5" fill="#e3c9a0" stroke="#a88a5c" stroke-width="1"/>`+[[-10,BANDC[a]],[-5,BANDC[b]],[0,mc],[8,'#c9a227']].map(([x,c])=>`<rect x="${x-1.6}" y="-6" width="3.2" height="12" fill="${c}"/>`).join('')}
  else if(t==='D'){s+=legs(-12,12)+`<rect x="-12" y="-5.5" width="24" height="11" rx="2.5" fill="#1c1d1f"/><rect x="6" y="-5.5" width="3.6" height="11" fill="#b9bec2"/>`}
  else if(t==='Z'){s+=legs(-10,10)+`<rect x="-10" y="-5" width="20" height="10" rx="4" fill="#c63a26" opacity=".95"/><rect x="-8" y="-3" width="16" height="2.4" rx="1" fill="#f08a76" opacity=".7"/><rect x="5" y="-5" width="3" height="10" fill="#111"/>`}
  else if(t==='GE'){s+=legs(-10,10,'#a7a08a')+`<rect x="-10" y="-4.5" width="20" height="9" rx="4" fill="#e9e3c7" opacity=".85" stroke="#b4ab86"/><line x1="-6" y1="0" x2="4" y2="0" stroke="#5a4e2a" stroke-width="1.6"/><rect x="5" y="-4.5" width="2.6" height="9" fill="#2a2a2a"/>`}
  else if(t==='LED'){const col=d.color||'#36c25a';s+=`<line x1="${-h}" y1="0" x2="-4" y2="0" stroke="#9aa3a8" stroke-width="2.2"/><path d="M4 0 L${h-6} 0 L${h-3} -3 L${h} 0" fill="none" stroke="#9aa3a8" stroke-width="2.2"/>`+
    (lit?`<circle r="${12+10*lit}" fill="${col}" opacity="${0.2+0.3*lit}"/>`:'')+`<circle r="9" fill="${col}" opacity="${lit?1:.8}" stroke="#1d5e2c"/><path d="M-6.5 -6.2 A9 9 0 0 1 -6.5 6.2" fill="none" stroke="#1d5e2c" stroke-width="2.4"/><circle cx="2.5" cy="-3" r="2.4" fill="#fff" opacity=".55"/>`}
  else if(t==='C'){const big=(d.c||0)>=1e-4,rad=big?11:7.5;s+=legs(-rad,rad)+`<circle r="${rad}" fill="#2a4f8f" stroke="#17305a"/><path d="M${rad*0.35} ${-rad*0.94} A${rad} ${rad} 0 0 1 ${rad*0.35} ${rad*0.94} Z" fill="#c9d4e6"/>`+
    T(rad*0.66,3,'−',{size:big?9:7,fill:'#17305a',a:'middle',w:700})+`<circle r="${rad*0.45}" fill="none" stroke="#7d93bb" stroke-width="1"/>`}
  return glow+s+pins();
  function pins(){return `<circle cx="${-h}" cy="0" r="4.5" fill="#c8a24a" stroke="#6b5520"/><circle cx="${h}" cy="0" r="4.5" fill="#c8a24a" stroke="#6b5520"/>`}}

/* ---------- board, parts, cables ---------- */
function staticSVG(){let s=`<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="12" fill="#e9ecea" stroke="#b3bcb8" stroke-width="2"/>`;
  for(let i=0;i<NN;i++){const c=nodeC(i);s+=`<rect x="${c.x-30}" y="${c.y-30}" width="60" height="60" rx="8" fill="#dde2df" stroke="#cdd4d0" data-k="node:${i}"/>`;for(let h=0;h<9;h++){const o=holeOff(h);s+=`<circle cx="${c.x+o.x}" cy="${c.y+o.y}" r="4.2" fill="#2f3739" pointer-events="none"/>`}}
  s+=T(BX+8,BY-8,'Plug-in panel · كل مربع node فيه 9 فتحات موصولة',{size:12,fill:'#7d8e93'});
  s+=`<rect x="${regions.board[0]+6}" y="${parkY-22}" width="${regions.board[2]-12}" height="44" rx="10" fill="#d9d1c0" opacity=".55"/>`;
  return s}
function partHoles(p){if(MULTI(p.type))return pinNodes(p).map((n,k)=>n+':'+PARTS[p.type].pins[k].h);return [p.a+':'+dirHole(p.a,p.b),p.b+':'+dirHole(p.b,p.a)]}
function occupied(skip){const S=RT.S;const occ=new Set();S.parts.forEach(p=>{if(p.id!==skip)partHoles(p).forEach(h=>occ.add(h))});S.wires.forEach(w=>{occ.add(w.a+':'+w.ha);occ.add(w.b+':'+w.hb)});LEADS.forEach(k=>{const l=S.leads[k];if(l.node!=null)occ.add(l.node+':'+l.hole)});return occ}
function freeHole(node,pref=[4,0,2,6,8,1,3,5,7]){const occ=occupied();for(const h of pref)if(!occ.has(node+':'+h))return h;return null}
function partsSVG(){const S=RT.S;let s='';
  S.wires.forEach(w=>{const a=holeP(w.a,w.ha),b=holeP(w.b,w.hb);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-Math.min(40,Math.hypot(b.x-a.x,b.y-a.y)*0.25);const sel=S.sel===w.id;const d=`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
    s+=`<path d="${d}" fill="none" stroke="#5a4300" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${sel?'#fff2a8':'#e0b000'}" stroke-width="4.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="transparent" stroke-width="16" data-k="wire:${w.id}" style="cursor:pointer"/>`});
  S.parts.forEach(p=>{if(drag&&drag.kind==='move'&&drag.id===p.id&&drag.active)return;
    if(MULTI(p.type)){const c=nodeC(p.n);s+=`<g transform="translate(${c.x} ${c.y})" data-k="part:${p.id}" style="cursor:grab">${pkgBody(p.type,S.sel===p.id)}</g>`;return}
    const a=holeP(p.a,dirHole(p.a,p.b)),b=holeP(p.b,dirHole(p.b,p.a));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;const L=Math.hypot(b.x-a.x,b.y-a.y);
    s+=`<g transform="translate(${mx} ${my}) rotate(${ang})" data-k="part:${p.id}" style="cursor:grab">${partBody(p.type,L,S.sel===p.id,litNow(p))}</g>`;
    if(p.dead)s+=T(mx,my+5,'💥',{size:20,a:'middle'});
    const lab=PARTS[p.type].lab;if(lab){const vert=Math.abs(ang)>45;s+=T(vert?mx+20:mx,vert?my+4:my-17,lab,{size:9.5,fill:'#22302f',a:vert?'start':'middle',w:600})}});
  return s}
/* selection toolbar (⇄ / ✕) and wire-start marker: drawn above the cables so a plug never hides them */
function toolbarSVG(){const S=RT.S;let s='';
  const sp=S.parts.find(p=>p.id===S.sel),sw=S.wires.find(w=>w.id===S.sel);
  if(sp||sw){let x,y;if(sp&&MULTI(sp.type)){const c=fpC(sp.type,sp.n);x=c.x;y=nodeC(sp.n).y-(PARTS[sp.type].pkg==='DIP8'?34:84)}else if(sp){const a=nodeC(sp.a),b=nodeC(sp.b);x=(a.x+b.x)/2;y=(a.y+b.y)/2-40}else{const a=holeP(sw.a,sw.ha),b=holeP(sw.b,sw.hb);x=(a.x+b.x)/2;y=(a.y+b.y)/2-44}
    const btn=(bx,lab,k,c)=>`<circle cx="${bx}" cy="${y}" r="15" fill="#141c20" stroke="${c}" stroke-width="2" data-k="${k}" style="cursor:pointer"/>`+T(bx,y+5,lab,{size:14,fill:c,a:'middle',w:600});
    s+=sp&&POLAR(sp.type)?btn(x-20,'⇄','tb:flip',CH2)+btn(x+20,'✕','tb:del',RED):btn(x,'✕','tb:del',RED)}
  if(S.wireMode&&S.wireStart!=null){const c=nodeC(S.wireStart);s+=`<rect x="${c.x-32}" y="${c.y-32}" width="64" height="64" rx="9" fill="none" stroke="#e0b000" stroke-width="3" pointer-events="none"/>`}
  return s}
function leadPos(k){const l=RT.S.leads[k];if(drag&&drag.kind==='lead'&&drag.key===k&&drag.active)return {x:drag.x,y:drag.y};if(l.node!=null)return holeP(l.node,l.hole);return PARK[k]}
/* cable colours: neutral by default; the student can colour any lead (right-click / long-press) */
const NEUTRAL={c:'#8d969a',d:'#4f585c'};
const SWATCH={red:{c:'#e2453b',d:'#5a1414',ar:'أحمر'},black:{c:'#30363a',d:'#000',ar:'أسود'},blue:{c:'#2f6bd9',d:'#173a7a',ar:'أزرق'},yellow:{c:'#f0c419',d:'#7a5f00',ar:'أصفر'},green:{c:'#2f9a4c',d:'#164a24',ar:'أخضر'},white:{c:'#f4f4f2',d:'#8a8f93',ar:'أبيض'}};
const colOf=(k,def)=>{const c=RT.S.cab[k];return c==='none'?NEUTRAL:c&&SWATCH[c]?SWATCH[c]:def||NEUTRAL};
const plugs=[];
/* cables: a natural curve that leaves the terminal in the direction it faces and runs into the plug; recomputed on every
   render, so they follow an instrument that is being moved. CAB keeps the geometry (crossing checks, tests). */
const CAB=[];
const addP=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
function curve(a,f,p,kmin=22){const along=(p.x-a.x)*f.x+(p.y-a.y)*f.y;
  const k=Math.max(kmin,clamp(along*0.5,22,90)),k2=clamp(along*0.3,10,26);return [a,{x:a.x+f.x*k,y:a.y+f.y*k},{x:p.x-f.x*k2,y:p.y-f.y*k2},p]}
const bz=c=>`M${c[0].x.toFixed(1)} ${c[0].y.toFixed(1)} C${c[1].x.toFixed(1)} ${c[1].y.toFixed(1)} ${c[2].x.toFixed(1)} ${c[2].y.toFixed(1)} ${c[3].x.toFixed(1)} ${c[3].y.toFixed(1)}`;
const instOf=k=>LEADDEF[k].inst.key;
const clearOf=(ik,f0)=>{const [w,h]=byKey[ik].size,F=FACE[ik];return 18+(F==='down'?h-f0.y:F==='up'?f0.y:F==='right'?w-f0.x:f0.x)};
const DRAW={leadPos,
  plug:(k,p,col,dark)=>{const l=RT.S.leads[k];plugs.push({k,p});return `<circle cx="${p.x}" cy="${p.y}" r="${l.node!=null?7:9}" fill="${col}" stroke="${dark}" stroke-width="2"/>`+(l.node==null?`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#c8a24a"/>`:'')+`<circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent" data-k="lead:${k}" style="cursor:grab"/>`},
  wire:(c,col,dark,k,w=3)=>{const d=bz(c);return `<g data-cab="${k||''}"><path d="${d}" fill="none" stroke="${dark}" stroke-width="${w+2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/></g>`},
  banana:(from,k)=>{const ik=instOf(k);const a=addP(from,POS[ik]);const p=leadPos(k);const c=colOf(k);const cv=curve(a,FV[FACE[ik]],p,clearOf(ik,from));CAB.push({k,grp:k,inst:ik,c:cv});return DRAW.wire(cv,c.c,c.d,k)+DRAW.plug(k,p,c.c,c.d)},
  coax:(A0,kr,kb)=>{const ik=instOf(kr);const A=addP(A0,POS[ik]);const pr=leadPos(kr),pb=leadPos(kb);const M={x:(pr.x+pb.x)/2,y:(pr.y+pb.y)/2};
    const f2=FV[FACE[ik]];const Sp={x:M.x-f2.x*34,y:M.y-f2.y*34};
    const trunk=curve(A,f2,Sp,clearOf(ik,A0));
    const lr=curve(Sp,f2,pr),lb=curve(Sp,f2,pb);CAB.push({k:kr,grp:kr,inst:ik,c:trunk},{k:kr,grp:kr,inst:ik,c:lr,leg:1},{k:kb,grp:kr,inst:ik,c:lb,leg:1});
    const cr=colOf(kr,SWATCH.red),cb=colOf(kb,SWATCH.black);
    return `<g data-cab="${kr}"><path d="${bz(trunk)}" fill="none" stroke="#1e2326" stroke-width="9" stroke-linecap="round"/><path d="${bz(trunk)}" fill="none" stroke="#4a555b" stroke-width="5" stroke-linecap="round"/></g><rect x="${Sp.x-7}" y="${Sp.y-7}" width="14" height="14" rx="3" fill="#2b3236" pointer-events="none"/>`+DRAW.wire(lr,cr.c,cr.d,kr)+DRAW.wire(lb,cb.c,cb.d,kb)+DRAW.plug(kr,pr,cr.c,cr.d)+DRAW.plug(kb,pb,cb.c,cb.d)}};
/* small readable label next to each plug, never overlapping another label or plug */
function labelsSVG(){const boxes=[];const all=plugs.map(q=>({x:q.p.x-10,y:q.p.y-10,w:20,h:20}));let s='';
  const hit=(b,list)=>list.some(o=>b.x<o.x+o.w&&b.x+b.w>o.x&&b.y<o.y+o.h&&b.y+b.h>o.y);
  plugs.forEach(({k,p})=>{const t=labelOf(k);if(!t)return;const w=t.length*6.4+10,h=15;
    const cand=[[0,-24],[0,24],[w/2+14,0],[-w/2-14,0],[w/2+10,-20],[-w/2-10,-20],[w/2+10,20],[-w/2-10,20],[0,-42],[0,42]];
    let b=null;for(const [dx,dy] of cand){const c={x:p.x+dx-w/2,y:p.y+dy-h/2,w,h};if(!hit(c,boxes)&&!hit(c,all.filter(o=>Math.hypot(o.x+10-p.x,o.y+10-p.y)>1))){b=c;break}}
    if(!b)b={x:p.x-w/2,y:p.y-24-h/2,w,h};boxes.push(b);
    s+=`<rect x="${b.x}" y="${b.y}" width="${w}" height="${h}" rx="4" fill="#fffdf7" fill-opacity=".92" stroke="#b9c2c4" stroke-width=".8" pointer-events="none"/>`+T(b.x+w/2,b.y+11,t,{size:9.5,fill:'#26343a',a:'middle',w:600})});
  return s}
function cablesSVG(){plugs.length=0;CAB.length=0;updPark();const body=INST.map(i=>i.cables?i.cables(DRAW):'').join('');return `<g filter="url(#cabShadow)">${body}</g>`+labelsSVG()}
function nearestEdge(x,y){let best=null,bd=34;EDGES.forEach(e=>{const a=nodeC(e[0]),b=nodeC(e[1]);const d=Math.hypot((a.x+b.x)/2-x,(a.y+b.y)/2-y);if(d<bd){bd=d;best=e}});return best}
/* best anchor for a multi-pin part near (x,y): footprint inside the panel, every leg hole free */
function nearestAnchor(t,x,y,skip,lim=90){const occ=occupied(skip);let best=null,bd=lim;for(let n=0;n<NN;n++){if(!fits(t,n))continue;const c=fpC(t,n);const d=Math.hypot(c.x-x,c.y-y);if(d>=bd)continue;
    if(PARTS[t].pins.some(q=>occ.has((n+q.dy*COLS+q.dx)+':'+q.h)))continue;bd=d;best=n}return best}
/* a two-leg part may not push a leg into a hole that is already taken (e.g. under an IC) */
const edgeFree=(e,skip)=>{const occ=occupied(skip);return !occ.has(e[0]+':'+dirHole(e[0],e[1]))&&!occ.has(e[1]+':'+dirHole(e[1],e[0]))};
function nearestNode(x,y){let best=null,bd=40;for(let i=0;i<NN;i++){const c=nodeC(i);const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;best=i}}return best}
function dragSVG(){if(!drag||!drag.active)return '';let s='';
  if((drag.kind==='new'||drag.kind==='move')&&MULTI(drag.type)){const n=nearestAnchor(drag.type,drag.x,drag.y,drag.id);
    if(n!=null)PARTS[drag.type].pins.forEach(q=>{const c=nodeC(n+q.dy*COLS+q.dx);s+=`<rect x="${c.x-32}" y="${c.y-32}" width="64" height="64" rx="9" fill="none" stroke="${CH2}" stroke-width="3" opacity=".6"/>`});
    const c0=n!=null?nodeC(n):{x:drag.x-fpC(drag.type,0).x+nodeC(0).x,y:drag.y-fpC(drag.type,0).y+nodeC(0).y};return s+`<g transform="translate(${c0.x} ${c0.y})" opacity=".85">${pkgBody(drag.type,false)}</g>`}
  if(drag.kind==='new'||drag.kind==='move'){const e=nearestEdge(drag.x,drag.y);if(e){const a=nodeC(e[0]),b=nodeC(e[1]);s+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${CH2}" stroke-width="6" opacity=".5" stroke-linecap="round"/>`}
    s+=`<g transform="translate(${drag.x} ${drag.y}) rotate(${e&&e[1]-e[0]===COLS?90:0})" opacity=".9">${partBody(drag.type,52,false)}</g>`}
  if(drag.kind==='lead'){const n=nearestNode(drag.x,drag.y);if(n!=null){const c=nodeC(n);s+=`<rect x="${c.x-32}" y="${c.y-32}" width="64" height="64" rx="9" fill="none" stroke="${CH2}" stroke-width="3"/>`}}
  return s}

/* ---------- moving instruments: a grab handle on top of each one; dragging it moves the instrument (never its controls) ---------- */
function handleSVG(i){const w=i.size[0],x=w/2-44;return `<g data-k="mv:${i.key}" style="cursor:grab"><rect x="${x}" y="-31" width="88" height="25" rx="12.5" fill="#fffdf7" stroke="#9aa6a9" stroke-width="1.4"/>`+
  `<text x="${x+30}" y="-13" font-size="15" text-anchor="middle" pointer-events="none">✋</text><g fill="#7d898c" pointer-events="none">${[0,1,2].map(r=>[0,1,2].map(c=>`<circle cx="${x+50+c*7}" cy="${-24.5+r*6}" r="1.8"/>`).join('')).join('')}</g></g>`}
function placeInst(k){const g=$('Ldyn').querySelector(`[data-inst="${k}"]`);if(g)g.setAttribute('transform',`translate(${POS[k].x} ${POS[k].y})`)}
function moveInst(k,x,y){showHL(null);POS[k]={x:Math.round(x),y:Math.round(y)};placeInst(k);updRegions();render(true)}
/* back to the default arrangement (animated unless the student asked for reduced motion) */
function resetLayout(){try{localStorage.removeItem(LSK)}catch(_){}const from={};INST.forEach(i=>from[i.key]={...POS[i.key]});
  const done=()=>{INST.forEach(i=>{POS[i.key]={...DEF[i.key]};placeInst(i.key)});updRegions();render(true);BENCH.layoutChanged(true)};
  if(reduceMotion){done();return}const t0=performance.now();
  const step=now=>{const k=ease(Math.min(1,(now-t0)/420));INST.forEach(i=>{const a=from[i.key],b=DEF[i.key];POS[i.key]={x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};placeInst(i.key)});updRegions();render(true);if(k<1)requestAnimationFrame(step);else done()};
  requestAnimationFrame(step)}
const isDefault=()=>INST.every(i=>Math.abs(POS[i.key].x-DEF[i.key].x)<1&&Math.abs(POS[i.key].y-DEF[i.key].y)<1);
/* crossings of the cables as drawn now: cable over cable, cable over another instrument (used by the tests) */
function crossings(){const smp=c=>{const out=[];for(let i=0;i<=28;i++){const t=i/28,u=1-t;out.push({x:u*u*u*c[0].x+3*u*u*t*c[1].x+3*u*t*t*c[2].x+t*t*t*c[3].x,y:u*u*u*c[0].y+3*u*u*t*c[1].y+3*u*t*t*c[2].y+t*t*t*c[3].y})}return out};
  const segX=(p1,p2,p3,p4)=>{const d=(p2.x-p1.x)*(p4.y-p3.y)-(p2.y-p1.y)*(p4.x-p3.x);if(!d)return false;const u=((p3.x-p1.x)*(p4.y-p3.y)-(p3.y-p1.y)*(p4.x-p3.x))/d,v=((p3.x-p1.x)*(p2.y-p1.y)-(p3.y-p1.y)*(p2.x-p1.x))/d;return u>0&&u<1&&v>0&&v<1};
  const C=CAB.map(c=>({...c,pts:smp(c.c)}));const cc=[],ci=[];
  for(let a=0;a<C.length;a++)for(let b=a+1;b<C.length;b++){if(C[a].grp===C[b].grp)continue;const A=C[a].pts,B=C[b].pts;let hit=false;
    for(let i=1;i<A.length-1&&!hit;i++)for(let j=1;j<B.length-1&&!hit;j++)if(segX(A[i],A[i+1],B[j],B[j+1]))hit=true;if(hit)cc.push(C[a].k+'×'+C[b].k)}
  C.forEach(c=>INST.forEach(i=>{if(i.key===c.inst)return;const p=POS[i.key],[w,h]=i.size;if(c.pts.some(q=>q.x>p.x+3&&q.x<p.x+w-3&&q.y>p.y+3&&q.y<p.y+h-3))ci.push(c.k+'/'+i.key)}));
  return {cc:[...new Set(cc)],ci:[...new Set(ci)]}}

/* ---------- render ---------- */
let staticDone=false;
function render(light){
  if(!staticDone){$('Lstatic').innerHTML=staticSVG();staticDone=true}
  if(!light){if(RT.dirty){recompute();INST.forEach(i=>i.postSim&&i.postSim())}if(def.decorate)def.decorate(RT);$('Ldyn').innerHTML=INST.map(i=>`<g data-inst="${i.key}" transform="translate(${POS[i.key].x} ${POS[i.key].y})">${i.svg()}${handleSVG(i)}</g>`).join('');BENCH.onRender()}
  $('Lparts').innerHTML=partsSVG();$('Lcables').innerHTML=cablesSVG();$('Ldrag').innerHTML=toolbarSVG()+dragSVG();
  if(hlEl&&!document.body.contains(hlEl))hlEl=null;
}
function circuitChanged(){RT.dirty=true;INST.forEach(i=>i.onCircuitChange&&i.onCircuitChange())}

/* ---------- pointer interaction ---------- */
const svg=$('bench');
function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM().inverse();const r=p.matrixTransform(m);return {x:r.x,y:r.y}}
/* cables never block what lies under them: a tap on a cable goes to the control below */
function targetOf(e){let t=e.target;if(t&&t.closest&&t.closest('[data-cab]')){const under=document.elementsFromPoint(e.clientX,e.clientY).find(el=>svg.contains(el)&&!el.closest('[data-cab]'));if(under)t=under}return t&&t.closest?t.closest('[data-k]'):null}
let rep=null;const stopRep=()=>{clearTimeout(rep);clearInterval(rep);rep=null};
let press=null;
svg.addEventListener('pointerdown',e=>{const S=RT.S;if(e.button===2)return;closeMenu();const el=targetOf(e);const p=pt(e);
  /* overview: controls, leads, parts and placing work right here; only a tap on a device body (or an idle node) zooms */
  if(BENCH.view==='ov'&&!S.armed&&!S.wireMode&&(!el||el.dataset.k.startsWith('node:'))){BENCH.ovClick(p);return}
  showHL(el,true);
  const cab=e.target.closest&&e.target.closest('[data-cab]');const lk=el&&el.dataset.k.startsWith('lead:')?el.dataset.k.slice(5):cab&&cab.dataset.cab;
  if(lk&&e.pointerType!=='mouse'){press={k:lk,x:e.clientX,y:e.clientY,t:setTimeout(()=>{press=null;drag=null;openMenu(lk,e.clientX,e.clientY)},550)}}
  if(S.armed&&(!el||el.dataset.k.startsWith('node:'))){placeArmed(p);return}
  if(!el){const r=BENCH.regionAt(p);if(r&&r!==BENCH.view){BENCH.focus(r);return}if(S.sel){S.sel=null;render(true)}return}
  const k=el.dataset.k;
  if(k.startsWith('mv:')){const ik=k.slice(3);drag={kind:'inst',key:ik,x:p.x,y:p.y,sx:p.x,sy:p.y,ox:POS[ik].x,oy:POS[ik].y,active:false};svg.setPointerCapture(e.pointerId);svg.classList.add('grabbing');BENCH.clearHover();return}
  if(k.startsWith('part:')){const id=+k.slice(5);const pr=S.parts.find(q=>q.id===id);drag={kind:'move',id,type:pr.type,x:p.x,y:p.y,sx:p.x,sy:p.y,active:false};svg.setPointerCapture(e.pointerId);return}
  if(k.startsWith('wire:')){S.sel=S.sel===+k.slice(5)?null:+k.slice(5);render(true);return}
  if(k.startsWith('lead:')){drag={kind:'lead',key:k.slice(5),x:p.x,y:p.y,sx:p.x,sy:p.y,active:false};svg.setPointerCapture(e.pointerId);return}
  if(k==='tb:flip'){const pr=S.parts.find(q=>q.id===S.sel);if(pr){const t=pr.a;pr.a=pr.b;pr.b=t;circuitChanged();render()}return}
  if(k==='tb:del'){S.parts=S.parts.filter(q=>q.id!==S.sel);S.wires=S.wires.filter(w=>w.id!==S.sel);S.sel=null;circuitChanged();render();return}
  if(k.startsWith('node:')){const n=+k.slice(5);if(S.wireMode){if(S.wireStart==null)S.wireStart=n;else if(S.wireStart!==n){const pr=[0,2,6,8,4,1,3,5,7];const ha=freeHole(S.wireStart,pr),hb=freeHole(n,pr);if(ha!=null&&hb!=null){S.wires.push({id:RT.uid++,a:S.wireStart,b:n,ha,hb});circuitChanged()}S.wireStart=null}render();return}
    if(S.sel){S.sel=null;render(true)}return}
  const inst=byPrefix[k.split(':')[0]];if(!inst)return;const kk=k.slice(k.indexOf(':')+1);inst.keyFn(kk);render();
  /* hold a knob arrow to keep turning */
  if(/[+-]$/.test(kk)){stopRep();rep=setTimeout(()=>{rep=setInterval(()=>{inst.keyFn(kk);render()},70)},380)}
});
svg.addEventListener('pointermove',e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>8){clearTimeout(press.t);press=null}
  if(!drag){if(e.pointerType==='mouse'){const t=targetOf(e);showHL(t&&!(BENCH.view==='ov'&&t.dataset.k.startsWith('node:')&&!RT.S.armed&&!RT.S.wireMode)?t:null)}return}
  const p=pt(e);drag.x=p.x;drag.y=p.y;if(!drag.active&&Math.hypot(p.x-drag.sx,p.y-drag.sy)>6){drag.active=true;if(drag.kind==='move')RT.S.sel=null}
  if(drag.active&&drag.kind==='inst'){moveInst(drag.key,drag.ox+p.x-drag.sx,drag.oy+p.y-drag.sy);return}if(drag.active)render(true)});
function endDrag(){stopRep();if(press){clearTimeout(press.t);press=null}const S=RT.S;if(!drag)return;if(drag.fromTray&&Math.hypot(drag.x-drag.sx,drag.y-drag.sy)<8){S.armed=drag.type;drag=null;BENCH.drawerSync();render(true);return}const d=drag;drag=null;svg.classList.remove('grabbing');
  if(d.kind==='inst'){showHL(null);if(d.active){savePos();BENCH.layoutChanged(false,d.key)}return}
  if(d.kind==='new'||d.kind==='move'){
    if(d.kind==='move'&&!d.active){S.sel=S.sel===d.id?null:d.id;render(true);return}
    if(MULTI(d.type)){const n=nearestAnchor(d.type,d.x,d.y,d.id);if(d.kind==='move'){const pr=S.parts.find(q=>q.id===d.id);if(n!=null)pr.n=n;else if(d.x<BX-20||d.x>BX+BW+20||d.y<BY-20||d.y>BY+BH+20)S.parts=S.parts.filter(q=>q.id!==d.id)}
      else if(n!=null)S.parts.push({id:RT.uid++,type:d.type,n});circuitChanged();render();return}
    const e=nearestEdge(d.x,d.y);const taken=e&&(S.parts.some(q=>q.id!==d.id&&((q.a===e[0]&&q.b===e[1])||(q.a===e[1]&&q.b===e[0])))||!edgeFree(e,d.id));
    if(d.kind==='move'){const pr=S.parts.find(q=>q.id===d.id);if(e&&!taken){pr.a=e[0];pr.b=e[1]}else if(!e){S.parts=S.parts.filter(q=>q.id!==d.id)}}
    else if(e&&!taken){S.parts.push({id:RT.uid++,type:d.type,a:e[0],b:e[1]})}
    circuitChanged();render();return}
  if(d.kind==='lead'){if(!d.active)return;const l=S.leads[d.key];const n=nearestNode(d.x,d.y);l.node=null;l.hole=null;if(n!=null){const h=freeHole(n);if(h!=null){l.node=n;l.hole=h}}
    if(LEADDEF[d.key].circuit)circuitChanged();else RT.dirty=true;render()}}
svg.addEventListener('pointerup',e=>{endDrag();if(e.pointerType!=='mouse')setTimeout(()=>showHL(null),220)});
svg.addEventListener('pointercancel',()=>{stopRep();if(drag&&drag.kind==='inst'&&drag.active)savePos();drag=null;svg.classList.remove('grabbing');render(true)});
svg.addEventListener('pointerleave',()=>{stopRep();if(!drag)showHL(null)});
svg.addEventListener('contextmenu',e=>{e.preventDefault();const cab=e.target.closest&&e.target.closest('[data-cab]');const el=e.target.closest&&e.target.closest('[data-k^="lead:"]');
  const k=el?el.dataset.k.slice(5):cab&&cab.dataset.cab;if(k)openMenu(k,e.clientX,e.clientY)});
const WHEEL=INST.filter(i=>i.wheel&&i.wheel.length).map(i=>`${i.prefix}:(${i.wheel.join('|')})`);
const wheelRe=new RegExp(`^(${WHEEL.join('|')})[c+-]?$`);
svg.addEventListener('wheel',e=>{const el=targetOf(e);if(!el)return;const k=el.dataset.k;const m=k.match(wheelRe);if(!m)return;e.preventDefault();const base=m[1];const dir=e.deltaY<0?'+':'-';
  const inst=byPrefix[base.split(':')[0]];inst.keyFn(base.slice(base.indexOf(':')+1)+dir);render()},{passive:false});

/* white outline on the control the pointer / finger is over */
let hlEl=null;
function showHL(el,touch){const L=$('Lhl2');if(!L)return;if(el===hlEl&&!touch)return;hlEl=el;if(!el){L.innerHTML='';return}
  const r=el.getBoundingClientRect();const m=svg.getScreenCTM().inverse();const tp=(x,y)=>{const q=svg.createSVGPoint();q.x=x;q.y=y;return q.matrixTransform(m)};
  const a=tp(r.left,r.top),b=tp(r.right,r.bottom);const pad=3;const w=b.x-a.x+2*pad,h=b.y-a.y+2*pad;const big=el.dataset.k.startsWith('node:');
  L.innerHTML=`<rect x="${a.x-pad}" y="${a.y-pad}" width="${w}" height="${h}" rx="${Math.min(8,Math.min(w,h)/2)}" fill="${big?'rgba(255,255,255,.12)':'rgba(255,255,255,.18)'}" stroke="#fff" stroke-width="2.4" filter="url(#hlGlow)"/>`}

/* colour menu for cables */
function closeMenu(){const m=$('cabMenu');if(m)m.remove()}
function openMenu(k,x,y){closeMenu();const host=$q('#bstage');const hr=host.getBoundingClientRect();const m=document.createElement('div');m.id='cabMenu';m.className='cabmenu';
  m.innerHTML=`<b>لون السلك · <span class="m">${labelOf(k)||k}</span></b><div>`+Object.entries(SWATCH).map(([id,s])=>`<button data-c="${id}" title="${s.ar}" style="background:${s.c}"></button>`).join('')+`<button data-c="none" class="none" title="بدون لون">∅</button></div>`;
  host.appendChild(m);const mw=m.offsetWidth,mh=m.offsetHeight;m.style.left=clamp(x-hr.left-mw/2,8,hr.width-mw-8)+'px';m.style.top=clamp(y-hr.top-mh-14,8,hr.height-mh-8)+'px';
  m.querySelectorAll('button').forEach(b=>b.onclick=ev=>{ev.stopPropagation();RT.S.cab[k]=b.dataset.c;closeMenu();render(true)})}
document.addEventListener('pointerdown',e=>{const m=$('cabMenu');if(m&&!m.contains(e.target)&&!svg.contains(e.target))closeMenu()},true);

function placeArmed(p){const S=RT.S;if(MULTI(S.armed)){const n=nearestAnchor(S.armed,p.x,p.y,null,120);if(n!=null){S.parts.push({id:RT.uid++,type:S.armed,n});circuitChanged()}S.armed=null;BENCH.drawerSync();render();return}
  let best=null,bd=70;EDGES.forEach(e=>{const a=nodeC(e[0]),b=nodeC(e[1]);const d=Math.hypot((a.x+b.x)/2-p.x,(a.y+b.y)/2-p.y);if(d<bd){bd=d;best=e}});
  if(best&&edgeFree(best)&&!S.parts.some(q=>(q.a===best[0]&&q.b===best[1])||(q.a===best[1]&&q.b===best[0]))){S.parts.push({id:RT.uid++,type:S.armed,a:best[0],b:best[1]});circuitChanged()}
  S.armed=null;BENCH.drawerSync();render()}
function trayDown(t,e){const S=RT.S;if(t==='W'){S.wireMode=!S.wireMode;S.wireStart=null;S.sel=null;S.armed=null;BENCH.drawerSync();render();return}
  S.wireMode=false;if(S.armed===t){S.armed=null;BENCH.drawerSync();return}S.armed=null;const p=pt(e);drag={kind:'new',type:t,x:p.x,y:p.y,sx:p.x,sy:p.y,active:true,fromTray:true};try{svg.setPointerCapture(e.pointerId)}catch(_){}BENCH.drawerSync();render(true)}

/* ---------- experiment hooks ---------- */
const X=def.setup(RT);
BENCH.register({
  regions,names,
  tray:def.tray.map(([t,l])=>({t,l})),
  icon:t=>t==='W'?'<svg viewBox="-34 -18 68 36"><path d="M-24 8 q24 -26 48 0" fill="none" stroke="#e0b000" stroke-width="5" stroke-linecap="round"/></svg>':`<svg viewBox="-36 -18 72 36">${partBody(t,40,false)}</svg>`,
  trayDown,isWire:()=>RT.S.wireMode,armed:()=>RT.S&&RT.S.armed,
  status:X.status||(()=>({})),P:PX,steps:X.steps||[],
  reset(){fresh();X.onReset&&X.onReset();render()},
  render:()=>render(),RT,resetLayout,isDefault,crossings
});
RT.crossings=crossings;RT.resetLayout=resetLayout;
fresh();render();
};
ENGINE.NAMES={gen:['PeakTech 4124','مولّد الإشارات'],psu:['TTi EL302RD','مصدر الجهد المستمر (وحدتين)'],sc:['GW Instek GDS-1104B','راسم الإشارة'],dmm:['MCP MT3805','الملتيميتر'],xf:['Center-tapped Transformer','المحوّل'],dbox:['Decade resistance boxes','صناديق المقاومات'],board:['Plug-in panel','لوحة التوصيل']};
