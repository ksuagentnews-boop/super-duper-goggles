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

/* ---------- layout: instruments in a row, lead rack, plug-in panel ---------- */
const COLS=def.cols||7,ROWS=def.rows||5,P=88,NN=COLS*ROWS,BW=COLS*P,BH=ROWS*P;
const specs=def.instruments.map(s=>Object.assign({},s));
{let x=20;specs.forEach(sp=>{const sz=ENGINE[sp.type].size;if(!sp.at)sp.at={x,y:20};x=Math.max(x,sp.at.x+sz[0]+28)})}
const INST=specs.map(spec=>ENGINE[spec.type](RT,spec));
const totalW=Math.max(...INST.map((i,k)=>specs[k].at.x+i.size[0]))+20;
const instBottom=Math.max(...INST.map((i,k)=>specs[k].at.y+i.size[1]));
const parkY=instBottom+70,BY=parkY+64,BX=Math.round(Math.max(40,totalW/2-BW/2));
const nodeC=i=>({x:BX+44+(i%COLS)*P,y:BY+44+Math.floor(i/COLS)*P});
const holeOff=h=>({x:((h%3)-1)*19,y:(Math.floor(h/3)-1)*19});
const holeP=(i,h)=>{const c=nodeC(i),o=holeOff(h);return {x:c.x+o.x,y:c.y+o.y}};
const EDGES=[];for(let i=0;i<NN;i++){if(i%COLS<COLS-1)EDGES.push([i,i+1]);if(i+COLS<NN)EDGES.push([i,i+COLS])}
function dirHole(a,b){if(b===a+1)return 5;if(b===a-1)return 3;if(b===a+COLS)return 7;return 1}

const byKey={},byPrefix={};INST.forEach(i=>{byKey[i.key]=i;byPrefix[i.prefix]=i});
const LEADDEF={};INST.forEach(i=>(i.leads||[]).forEach(l=>LEADDEF[l.k]=Object.assign({inst:i},l)));
const LEADS=Object.keys(LEADDEF);
const fromOf=k=>{const f=LEADDEF[k].from;return typeof f==='function'?f():f};
const labelOf=k=>{const l=LEADDEF[k].label;return typeof l==='function'?l():l};
/* lead rack: every plug parks in one row above the panel, close to where its cable comes from */
const PARK={};{
  const want=LEADS.map(k=>({k,x:fromOf(k).x})).sort((a,b)=>a.x-b.x);
  const lo=BX-40,hi=BX+BW+40,gap=Math.min(56,(hi-lo)/Math.max(1,want.length-1));
  want.forEach(w=>w.x=clamp(w.x,lo,hi));for(let i=1;i<want.length;i++)want[i].x=Math.max(want[i].x,want[i-1].x+gap);
  const over=want.length?want[want.length-1].x-hi:0;if(over>0)for(let i=want.length-1;i>=0;i--){want[i].x-=over;if(i>0&&want[i].x-want[i-1].x>=gap)break}
  for(let i=want.length-2;i>=0;i--)want[i].x=Math.min(want[i].x,want[i+1].x-gap);
  want.forEach(w=>PARK[w.k]={x:Math.round(w.x),y:parkY})}
const regions={},names={};
INST.forEach((i,k)=>{const a=specs[k].at;regions[i.key]=[a.x-6,a.y-6,i.size[0]+12,i.size[1]+12];names[i.key]=ENGINE.NAMES[i.key]});
{const xs=Object.values(PARK).map(p=>p.x);const x0=Math.min(BX-16,...xs.map(x=>x-26)),x1=Math.max(BX+BW+16,...xs.map(x=>x+26));regions.board=[x0,parkY-34,x1-x0,BY+BH+16-(parkY-34)];names.board=ENGINE.NAMES.board}
RT.inst=byKey;RT.layout={BX,BY,P,COLS,ROWS,parkY,PARK,regions};

/* ---------- parts ---------- */
const PARTS=def.parts;
const POLAR=t=>['D','Z','C','LED','GE'].includes((PARTS[t]||{}).t);

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
  const els=[];
  S.parts.forEach(p=>{const d=PARTS[p.type];if(p.dead)return;
    if(d.t==='R')els.push({t:'G',a:idx(p.a),b:idx(p.b),g:d.g||1/d.r,pid:p.id});
    else if(['D','Z','GE','LED'].includes(d.t))els.push({t:'D',a:idx(p.a),b:idx(p.b),f:SOLVER.MODELS[d.model||{D:'si',Z:'zener',GE:'ge',LED:'led'}[d.t]],pid:p.id});
    else if(d.t==='C')els.push({t:'C',a:idx(p.a),b:idx(p.b),c:d.c,pid:p.id})});
  const ck={n:0,els,p1:null,p2:null,dcs:[],idx,opts};
  INST.forEach(i=>i.stamp&&i.stamp(ck,force,opts));
  ck.n=map.size;return ck;
}
RT.buildUser=buildUser;

/* ---------- analysis ---------- */
function recompute(){
  const S=RT.S;const ck=buildUser(false);const gen=byKey.gen;const genOn=!!(gen&&gen.on());
  if(ck.els.some(e=>e.t==='C'||e.t==='XS')){
    const f=byKey.xf?byKey.xf.FQ:genOn?S.gen.freq:50;
    const vsFn=genOn?(t=>S.gen.off+S.gen.amp/2*gen.wv(2*Math.PI*f*t)):null;
    RT.TB=SOLVER.simulate(ck,f,def.cycles||6,vsFn);
  }else{const A=genOn?S.gen.amp/2:0,o=genOn?S.gen.off:0;RT.TB=SOLVER.sweep(ck,o-A,o+A,A?121:2);RT.TB.A=A;RT.TB.off=o}
  RT.TB.ck=ck;RT.dirty=false;
  INST.forEach(i=>i.measure&&i.measure());
  /* LEDs glow while they carry forward current */
  S.parts.forEach(p=>{if(PARTS[p.type].t==='LED'){const i=partI(p);p.lit=i>4e-4?Math.min(1,0.35+i/0.02):0}});
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
function partNets(p){return [RT.netOf(p.a),RT.netOf(p.b)]}
function partV(p){const [a,b]=partNets(p);return nodeV(a)-nodeV(b)}
function partI(p){const d=PARTS[p.type];const [a,b]=partNets(p);if(!live(a)&&a!==-1||!live(b)&&b!==-1)return 0;const va=samples(a,60),vb=samples(b,60);let s=0;
  const f=d.t==='R'?(v=>v*(d.g||1/d.r)):['D','Z','GE','LED'].includes(d.t)?(v=>SOLVER.MODELS[d.model||{D:'si',Z:'zener',GE:'ge',LED:'led'}[d.t]](v)[0]):()=>0;
  for(let k=0;k<60;k++)s+=f((a===-1?0:va[k])-(b===-1?0:vb[k]));return s/60}
Object.assign(RT,{nodeV,partNets,partV,partI,PARTS,
  leadNet:k=>RT.S.leads[k]&&RT.S.leads[k].node!=null?RT.netOf(RT.S.leads[k].node):null,
  parts:type=>RT.S.parts.filter(p=>!type||p.type===type||PARTS[p.type].t===type),
  /* parts whose two ends are exactly the nets a and b; dir=+1 means p.a on a */
  between:(a,b)=>RT.S.parts.filter(p=>{const [x,y]=partNets(p);return PARTS[p.type].t!=='BR'&&a!=null&&b!=null&&((x===a&&y===b)||(x===b&&y===a))}).map(p=>({p,dir:partNets(p)[0]===a?1:-1})),
  at:net=>RT.S.parts.filter(p=>PARTS[p.type].t!=='BR'&&partNets(p).includes(net)),
  dmm:()=>byKey.dmm?byKey.dmm.reading():null});

/* ---------- part drawings (top view, real looks: cathode bands, polarity stripes, colour codes) ---------- */
const BANDC=['#111','#7a4a1d','#d22','#f08a1c','#f3d21c','#2a9a3c','#2160c9','#7d3fb8','#8a8f93','#f7f7f7'];
function rBands(r){let e=0,v=r;while(v>=100){v/=10;e++}while(v<10){v*=10;e--}v=Math.round(v);return [Math.floor(v/10),v%10,e]}
function partBody(type,L,sel,lit){const h=L/2,d=PARTS[type]||{t:type};const t=d.t;let s='';
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
function occupied(){const S=RT.S;const occ=new Set();S.parts.forEach(p=>{occ.add(p.a+':'+dirHole(p.a,p.b));occ.add(p.b+':'+dirHole(p.b,p.a))});S.wires.forEach(w=>{occ.add(w.a+':'+w.ha);occ.add(w.b+':'+w.hb)});LEADS.forEach(k=>{const l=S.leads[k];if(l.node!=null)occ.add(l.node+':'+l.hole)});return occ}
function freeHole(node,pref=[4,0,2,6,8,1,3,5,7]){const occ=occupied();for(const h of pref)if(!occ.has(node+':'+h))return h;return null}
function partsSVG(){const S=RT.S;let s='';
  S.wires.forEach(w=>{const a=holeP(w.a,w.ha),b=holeP(w.b,w.hb);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-Math.min(40,Math.hypot(b.x-a.x,b.y-a.y)*0.25);const sel=S.sel===w.id;const d=`M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
    s+=`<path d="${d}" fill="none" stroke="#5a4300" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${sel?'#fff2a8':'#e0b000'}" stroke-width="4.5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="transparent" stroke-width="16" data-k="wire:${w.id}" style="cursor:pointer"/>`});
  S.parts.forEach(p=>{if(drag&&drag.kind==='move'&&drag.id===p.id&&drag.active)return;const a=holeP(p.a,dirHole(p.a,p.b)),b=holeP(p.b,dirHole(p.b,p.a));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;const L=Math.hypot(b.x-a.x,b.y-a.y);
    s+=`<g transform="translate(${mx} ${my}) rotate(${ang})" data-k="part:${p.id}" style="cursor:grab">${partBody(p.type,L,S.sel===p.id,p.lit)}</g>`;
    if(p.dead)s+=T(mx,my+5,'💥',{size:20,a:'middle'});
    const lab=PARTS[p.type].lab;if(lab){const vert=Math.abs(ang)>45;s+=T(vert?mx+20:mx,vert?my+4:my-17,lab,{size:9.5,fill:'#22302f',a:vert?'start':'middle',w:600})}});
  const sp=S.parts.find(p=>p.id===S.sel),sw=S.wires.find(w=>w.id===S.sel);
  if(sp||sw){let x,y;if(sp){const a=nodeC(sp.a),b=nodeC(sp.b);x=(a.x+b.x)/2;y=(a.y+b.y)/2-40}else{const a=holeP(sw.a,sw.ha),b=holeP(sw.b,sw.hb);x=(a.x+b.x)/2;y=(a.y+b.y)/2-44}
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
const DRAW={leadPos,
  plug:(k,p,col,dark)=>{const l=RT.S.leads[k];plugs.push({k,p});return `<circle cx="${p.x}" cy="${p.y}" r="${l.node!=null?7:9}" fill="${col}" stroke="${dark}" stroke-width="2"/>`+(l.node==null?`<circle cx="${p.x}" cy="${p.y}" r="3" fill="#c8a24a"/>`:'')+`<circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent" data-k="lead:${k}" style="cursor:grab"/>`},
  lead:(a,p,col,dark,k)=>{const cx=(a.x+p.x)/2,cy=Math.max(a.y,p.y)+28;const d=`M${a.x} ${a.y} Q${cx} ${cy} ${p.x} ${p.y}`;return `<g data-cab="${k||''}"><path d="${d}" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/></g>`},
  banana:(from,k)=>{const p=leadPos(k);const c=colOf(k);return DRAW.lead(from,p,c.c,c.d,k)+DRAW.plug(k,p,c.c,c.d)},
  coax:(A,kr,kb,lab)=>{const pr=leadPos(kr),pb=leadPos(kb);const M={x:(pr.x+pb.x)/2,y:(pr.y+pb.y)/2};const Sp={x:M.x+(A.x-M.x)*0.3,y:M.y+(A.y-M.y)*0.3-12};const d=`M${A.x} ${A.y} C${A.x} ${A.y+70} ${Sp.x+(A.x-Sp.x)*0.3} ${Sp.y-40} ${Sp.x} ${Sp.y}`;
    const cr=colOf(kr,SWATCH.red),cb=colOf(kb,SWATCH.black);
    return `<g data-cab="${kr}"><path d="${d}" fill="none" stroke="#1e2326" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#4a555b" stroke-width="5" stroke-linecap="round"/></g><rect x="${Sp.x-7}" y="${Sp.y-7}" width="14" height="14" rx="3" fill="#2b3236" pointer-events="none"/>`+DRAW.lead(Sp,pr,cr.c,cr.d,kr)+DRAW.lead(Sp,pb,cb.c,cb.d,kb)+DRAW.plug(kr,pr,cr.c,cr.d)+DRAW.plug(kb,pb,cb.c,cb.d)}};
/* small readable label next to each plug, never overlapping another label or plug */
function labelsSVG(){const boxes=[];const all=plugs.map(q=>({x:q.p.x-10,y:q.p.y-10,w:20,h:20}));let s='';
  const hit=(b,list)=>list.some(o=>b.x<o.x+o.w&&b.x+b.w>o.x&&b.y<o.y+o.h&&b.y+b.h>o.y);
  plugs.forEach(({k,p})=>{const t=labelOf(k);if(!t)return;const w=t.length*6.4+10,h=15;
    const cand=[[0,-24],[0,24],[w/2+14,0],[-w/2-14,0],[w/2+10,-20],[-w/2-10,-20],[w/2+10,20],[-w/2-10,20],[0,-42],[0,42]];
    let b=null;for(const [dx,dy] of cand){const c={x:p.x+dx-w/2,y:p.y+dy-h/2,w,h};if(!hit(c,boxes)&&!hit(c,all.filter(o=>Math.hypot(o.x+10-p.x,o.y+10-p.y)>1))){b=c;break}}
    if(!b)b={x:p.x-w/2,y:p.y-24-h/2,w,h};boxes.push(b);
    s+=`<rect x="${b.x}" y="${b.y}" width="${w}" height="${h}" rx="4" fill="#fffdf7" fill-opacity=".92" stroke="#b9c2c4" stroke-width=".8" pointer-events="none"/>`+T(b.x+w/2,b.y+11,t,{size:9.5,fill:'#26343a',a:'middle',w:600})});
  return s}
function cablesSVG(){plugs.length=0;const body=INST.map(i=>i.cables?i.cables(DRAW):'').join('');return `<g filter="url(#cabShadow)">${body}</g>`+labelsSVG()}
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
  if(!light){if(RT.dirty){recompute();INST.forEach(i=>i.postSim&&i.postSim())}if(def.decorate)def.decorate(RT);$('Ldyn').innerHTML=INST.map(i=>i.svg()).join('');BENCH.onRender()}
  $('Lparts').innerHTML=partsSVG();$('Lcables').innerHTML=cablesSVG();$('Ldrag').innerHTML=dragSVG();
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
  if(BENCH.view==='ov'){BENCH.ovClick(p);return}
  showHL(el,true);
  const cab=e.target.closest&&e.target.closest('[data-cab]');const lk=el&&el.dataset.k.startsWith('lead:')?el.dataset.k.slice(5):cab&&cab.dataset.cab;
  if(lk&&e.pointerType!=='mouse'){press={k:lk,x:e.clientX,y:e.clientY,t:setTimeout(()=>{press=null;drag=null;openMenu(lk,e.clientX,e.clientY)},550)}}
  if(S.armed&&(!el||el.dataset.k.startsWith('node:'))){placeArmed(p);return}
  if(!el){const r=BENCH.regionAt(p);if(r&&r!==BENCH.view){BENCH.focus(r);return}if(S.sel){S.sel=null;render(true)}return}
  const k=el.dataset.k;
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
  if(!drag){if(e.pointerType==='mouse'&&BENCH.view!=='ov')showHL(targetOf(e));return}
  const p=pt(e);drag.x=p.x;drag.y=p.y;if(!drag.active&&Math.hypot(p.x-drag.sx,p.y-drag.sy)>6){drag.active=true;if(drag.kind==='move')RT.S.sel=null}if(drag.active)render(true)});
function endDrag(){stopRep();if(press){clearTimeout(press.t);press=null}const S=RT.S;if(!drag)return;if(drag.fromTray&&Math.hypot(drag.x-drag.sx,drag.y-drag.sy)<8){S.armed=drag.type;drag=null;BENCH.drawerSync();render(true);return}const d=drag;drag=null;
  if(d.kind==='new'||d.kind==='move'){
    if(d.kind==='move'&&!d.active){S.sel=S.sel===d.id?null:d.id;render(true);return}
    const e=nearestEdge(d.x,d.y);const taken=e&&S.parts.some(q=>q.id!==d.id&&((q.a===e[0]&&q.b===e[1])||(q.a===e[1]&&q.b===e[0])));
    if(d.kind==='move'){const pr=S.parts.find(q=>q.id===d.id);if(e&&!taken){pr.a=e[0];pr.b=e[1]}else if(!e){S.parts=S.parts.filter(q=>q.id!==d.id)}}
    else if(e&&!taken){S.parts.push({id:RT.uid++,type:d.type,a:e[0],b:e[1]})}
    circuitChanged();render();return}
  if(d.kind==='lead'){if(!d.active)return;const l=S.leads[d.key];const n=nearestNode(d.x,d.y);l.node=null;l.hole=null;if(n!=null){const h=freeHole(n);if(h!=null){l.node=n;l.hole=h}}
    if(LEADDEF[d.key].circuit)circuitChanged();else RT.dirty=true;render()}}
svg.addEventListener('pointerup',e=>{endDrag();if(e.pointerType!=='mouse')setTimeout(()=>showHL(null),220)});
svg.addEventListener('pointercancel',()=>{stopRep();drag=null;render(true)});
svg.addEventListener('pointerleave',()=>{stopRep();if(!drag)showHL(null)});
svg.addEventListener('contextmenu',e=>{e.preventDefault();if(BENCH.view==='ov')return;const cab=e.target.closest&&e.target.closest('[data-cab]');const el=e.target.closest&&e.target.closest('[data-k^="lead:"]');
  const k=el?el.dataset.k.slice(5):cab&&cab.dataset.cab;if(k)openMenu(k,e.clientX,e.clientY)});
const WHEEL=INST.filter(i=>i.wheel&&i.wheel.length).map(i=>`${i.prefix}:(${i.wheel.join('|')})`);
const wheelRe=new RegExp(`^(${WHEEL.join('|')})[c+-]?$`);
svg.addEventListener('wheel',e=>{if(BENCH.view==='ov')return;const el=targetOf(e);if(!el)return;const k=el.dataset.k;const m=k.match(wheelRe);if(!m)return;e.preventDefault();const base=m[1];const dir=e.deltaY<0?'+':'-';
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

function placeArmed(p){const S=RT.S;let best=null,bd=70;EDGES.forEach(e=>{const a=nodeC(e[0]),b=nodeC(e[1]);const d=Math.hypot((a.x+b.x)/2-p.x,(a.y+b.y)/2-p.y);if(d<bd){bd=d;best=e}});
  if(best&&!S.parts.some(q=>(q.a===best[0]&&q.b===best[1])||(q.a===best[1]&&q.b===best[0]))){S.parts.push({id:RT.uid++,type:S.armed,a:best[0],b:best[1]});circuitChanged()}
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
  render:()=>render(),RT
});
fresh();render();
};
ENGINE.NAMES={gen:['PeakTech 4124','مولّد الإشارات'],psu:['TTi EL302RD','مصدر الجهد المستمر (وحدتين)'],sc:['GW Instek GDS-1104B','راسم الإشارة'],dmm:['MCP MT3805','الملتيميتر'],xf:['Center-tapped Transformer','المحوّل'],board:['Plug-in panel','لوحة التوصيل']};
