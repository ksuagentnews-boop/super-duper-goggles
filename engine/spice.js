/* ======================= PC TABLE · LTspice-style editor and simulator =======================
   Used by the SPICE experiments (EE312 Exp 6 and Exp 8): the student opens a new schematic, places parts on a grid
   (R, C, L, D, voltage sources, GND, op amp, nmos4 / pmos4), wires them, labels nets, adds SPICE directives
   (K, .lib, .step param, .tran, .dc, .op), runs, and probes nodes (click), node pairs (drag) and part currents.
   The simulation is done by the engine solver (SOLVER.newton) on the netlist built from the drawing; nothing is
   pre-computed. ENGINE.runPC(def) is called by BENCH instead of ENGINE.run when def.pc is set.
   Shortcuts as in LTspice: R C L D G, F2 component, F3 wire, F4 label, S directive, F5 delete, Ctrl+R rotate,
   Ctrl+E mirror (schematic) / zoom to fit (waveforms), Esc ends a command. Touch: long-press = right-click. */
const SPICE=(()=>{
  const VT=0.02585;
  /* value with SPICE suffixes: 4.7k 470u 470µ 0.2m 10meg 1n … (trailing units ignored) */
  function num(s,P){if(s==null)return NaN;s=String(s).trim();const pm=s.match(/^\{(\w+)\}$/);if(pm){const v=P&&P[pm[1].toLowerCase()];return v==null?NaN:v}
    const m=s.toLowerCase().replace(/µ/g,'u').match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(meg|[tgkmunpf])?/);if(!m)return NaN;
    const k={t:1e12,g:1e9,meg:1e6,k:1e3,m:1e-3,u:1e-6,n:1e-9,p:1e-12,f:1e-15}[m[2]]||1;return parseFloat(m[1])*k}
  function fmt(v,u=''){if(!isFinite(v))return '?';const a=Math.abs(v);const P=[[1e9,'G'],[1e6,'M'],[1e3,'K'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p'],[1e-15,'f']];
    if(a===0)return '0'+u;for(const [k,p] of P)if(a>=k*0.9995)return +(v/k).toPrecision(4)+p+u;return v.toPrecision(3)+u}
  /* ---- device models (LTspice standard.dio / datasheets) ---- */
  const J=SOLVER.junction;
  const DIODES={
    '1N4148':J({Is:2.52e-9,n:1.752,Rs:0.568,Vb:100,Ib:1e-4,nb:0.1}),
    '1N914':J({Is:2.52e-9,n:1.752,Rs:0.568,Vb:75,Ib:1e-4,nb:0.1}),
    '1N750':J({Is:880.5e-18,n:1,Rs:0.25,Vb:4.7,Ib:20.245e-3,nb:1.6989*VT}),
    '1N5817':J({Is:31.7e-6,n:1.373,Rs:0.051,Vb:22,Ib:1e-3,nb:0.2}),
    'MUR460':J({Is:5.84e-9,n:1.5,Rs:0.035,Vb:600,Ib:1e-5,nb:1}),
    'D':J({Is:1e-14,n:1})};
  /* op amps: macro-model of SOLVER (gm stage, dominant pole, slew, rail clamp, current limit) */
  const opamp=(gbw,sr,A0,voff,ilim)=>{const Cc=300e-12,gm=2*Math.PI*gbw*Cc;return {Rin:2e6,gm,Imax:sr*Cc,G1:gm/A0,Cc,Voff:voff,Vc:0.03,Ic:1e-5,Rout:100,Ilim:ilim,Iq:1e-3}};
  const OPAMPS={OP747:opamp(0.5e6,0.2e6,2e5,1.0,0.025),LT1001:opamp(0.8e6,0.25e6,8e5,1.0,0.025),UniversalOpAmp2:opamp(10e6,10e6,1e5,0.3,0.05)};
  /* Level-1 MOSFETs. N_1u / P_1u stand for mosfet1u.lib (1-µm process; the file itself is not in docs/: typical
     1-µm Level-1 values are used, see docs/ee312/QUESTIONS.md). LTspice's built-in NMOS/PMOS defaults: VTO 0, KP 20 µA/V². */
  const MOS={NMOS:{p:1,VTO:0,KP:20e-6,LAMBDA:0,cox:0,lib:false},PMOS:{p:-1,VTO:0,KP:20e-6,LAMBDA:0,cox:0,lib:false},
    N_1u:{p:1,VTO:0.7,KP:127e-6,LAMBDA:0.02,cox:1.73e-3,cov:0.3e-9,cj:1.5e-9,lib:true},P_1u:{p:-1,VTO:-0.7,KP:58.6e-6,LAMBDA:0.02,cox:1.73e-3,cov:0.3e-9,cj:1.5e-9,lib:true}};
  function level1(M,W,L){const b=M.KP*W/L,vt=Math.abs(M.VTO),s=M.p;
    const nf=(vgs,vds)=>{if(vds<0)return -nf(vgs-vds,-vds);const ov=vgs-vt;if(ov<=0)return 0;const cl=1+M.LAMBDA*vds;return vds<ov?b*(ov*vds-vds*vds/2)*cl:b/2*ov*ov*cl};
    return (vgs,vds)=>s*nf(s*vgs,s*vds)}
  const SINE=a=>t=>{const [vo,va,f,td,th,ph,nc]=a;if(t<td)return vo+va*Math.sin(ph*Math.PI/180);const tt=t-td;if(nc>0&&tt>nc/f)return vo;return vo+va*Math.exp(-th*tt)*Math.sin(2*Math.PI*f*tt+ph*Math.PI/180)};
  const PULSE=a=>t=>{const [v1,v2,td,tr,tf,ton,tp,nc]=a;if(t<td)return v1;const tt=t-td;const c=tp>0?Math.floor(tt/tp):0;if(nc>0&&c>=nc)return v1;const u=tp>0?tt-c*tp:tt;
    if(u<tr)return v1+(v2-v1)*u/(tr||1e-30);if(u<tr+ton)return v2;if(u<tr+ton+tf)return v2-(v2-v1)*(u-tr-ton)/(tf||1e-30);return v1};
  /* ---- symbols: pins in grid units (16 px), drawing in local px ---- */
  const U=16;
  const SYM={
    R:{pins:[[0,0],[0,4]],pre:'R',draw:()=>`<path d="M0 0 V14 l-8 3 l16 6 l-16 6 l16 6 l-16 6 l8 3 V64" class="ln"/>`},
    C:{pins:[[0,0],[0,4]],pre:'C',draw:()=>`<path d="M0 0 V28 M-14 28 H14 M-14 36 H14 M0 36 V64" class="ln"/>`},
    L:{pins:[[0,0],[0,4]],pre:'L',draw:()=>`<path d="M0 0 V12 a6 6 0 0 1 0 12 a6 6 0 0 1 0 12 a6 6 0 0 1 0 12 a6 6 0 0 1 0 4 V64" class="ln"/><circle cx="-8" cy="10" r="2.2" fill="#000"/>`},
    D:{pins:[[0,0],[0,4]],pre:'D',draw:c=>`<path d="M0 0 V22 M-12 22 H12 L0 42 Z M-12 42 H12${c.model==='1N750'||/^BZX/.test(c.model)?' l4 4 M-12 42 l-4 -4':''} M0 42 V64" class="ln"/>`},
    V:{pins:[[0,0],[0,4]],pre:'V',draw:c=>`<path d="M0 0 V14 M0 50 V64" class="ln"/><circle cx="0" cy="32" r="18" class="ln"/>`+(c.src&&c.src.kind!=='DC'?`<path d="M-9 33 q4.5 -12 9 0 t9 0" class="ln"/>`:'')+`<text x="-4" y="25" class="pt">+</text><text x="-4" y="47" class="pt">−</text>`},
    GND:{pins:[[0,0]],pre:'',draw:()=>`<path d="M0 0 V8 M-14 8 H14 L0 22 Z" class="ln"/>`},
    OA:{pins:[[0,0],[0,2],[4,1],[2,-1],[2,3]],pre:'U',roles:['p','m_','o','vp','vn'],draw:()=>`<path d="M0 -8 V40 L64 16 Z" class="ln"/><path d="M32 -16 V0 M32 32 V48 M0 0 H6 M0 32 H6" class="ln"/><text x="9" y="4" class="pt">+</text><text x="9" y="36" class="pt">−</text><text x="35" y="-6" class="ps">+V</text><text x="35" y="46" class="ps">−V</text>`},
    NM:{pins:[[2,0],[0,2],[2,4],[3,2]],pre:'M',roles:['d','g','s','b'],draw:()=>`<path d="M32 0 V16 H18 M32 64 V48 H18 M18 22 V42 M18 12 V20 M18 44 V52 M12 16 V48 M0 32 H12 M18 32 H48 M18 32 l8 -5 v10 z" class="ln"/>`},
    PM:{pins:[[2,4],[0,2],[2,0],[3,2]],pre:'M',roles:['d','g','s','b'],draw:()=>`<path d="M32 0 V16 H18 M32 64 V48 H18 M18 22 V42 M18 12 V20 M18 44 V52 M12 16 V48 M0 32 H8 M18 32 H48 M48 32 l-8 -5 v10 z" class="ln"/><circle cx="10" cy="32" r="0" class="ln"/>`}};
  const tf=(c,[px,py])=>{let x=c.mir?-px:px,y=py;for(let k=0;k<c.rot;k++){const t=x;x=-y;y=t}return [x+c.x,y+c.y]};
  const pivot=c=>{const P=SYM[c.type].pins;return [Math.round(P.reduce((a,p)=>a+p[0],0)/P.length),Math.round(P.reduce((a,p)=>a+p[1],0)/P.length)]};
  const SPICE={DIODES,OPAMPS,MOS,level1,SINE,PULSE};
/* SPICE text (reference circuits of the experiment files): R/C/L/D/V/U/M/K lines and directives */
function parseNetlist(text){const list=[],dirs=[];text.split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{if(l[0]==='.'||/^k/i.test(l)){dirs.push(l);return}const t=l.split(/\s+/);const nm=t[0],k=nm[0].toUpperCase();
    if('RCL'.includes(k))list.push({type:k,name:nm,nodes:[t[1],t[2]],val:t[3]});
    if(k==='D')list.push({type:'D',name:nm,nodes:[t[1],t[2]],model:t[3]});
    if(k==='V'){const rest=t.slice(3).join(' ');const m=rest.match(/^(SINE|PULSE)\((.*)\)$/i);list.push({type:'V',name:nm,nodes:[t[1],t[2]],src:m?{kind:m[1].toUpperCase(),args:m[2].trim().split(/\s+/)}:{kind:'DC',dc:rest}})}
    if(k==='U')list.push({type:'OA',name:nm,nodes:t.slice(1,6),model:t[6]});
    if(k==='M')list.push({type:/^P/i.test(t[5])?'PM':'NM',name:nm,nodes:t.slice(1,5),model:t[5]})});return {list,dirs,gnd:true}}
function dirAnalysis(dirs){let a=null;dirs.forEach(l=>{const t=l.toLowerCase().split(/\s+/);if(t[0]==='.tran'){const v=t.slice(1).map(x=>num(x));a=v.length>=2?{kind:'tran',stop:v[1],start:v[2]||0,max:v[3]||v[1]/1000}:{kind:'tran',stop:v[0],start:0,max:v[0]/1000}}
    if(t[0]==='.dc')a={kind:'dc',src:t[1],from:num(t[2]),to:num(t[3]),inc:num(t[4])};if(t[0]==='.op')a={kind:'op'}});return a}
function dirStep(dirs){for(const l of dirs){const t=l.split(/\s+/);if(t[0].toLowerCase()==='.step'&&t[1]&&t[1].toLowerCase()==='param'&&t[2]){const name=t[2].toLowerCase();
    if((t[3]||'').toLowerCase()==='list')return {name,vals:t.slice(4).map(x=>num(x))};const a=num(t[3]),b=num(t[4]),inc=num(t[5]);const vals=[];if(isFinite(a)&&isFinite(b)&&inc>0)for(let v=a;v<=b+inc*1e-6;v+=inc)vals.push(+v.toPrecision(12));return {name,vals}}}return null}
const dirLib=dirs=>dirs.some(l=>/^\.lib\s+.*mosfet1u/i.test(l));
function compile(net,params){const idx=new Map();const errs=[];let n=0;const node=name=>{if(name==null)return null;if(name==='0')return -1;if(!idx.has(name))idx.set(name,n++);return idx.get(name)};const els=[];const lib=dirLib(net.dirs);
  net.list.forEach(c=>{const nd=c.nodes.map(node);const v=num(c.val,params);
    if(['R','C','L'].includes(c.type)&&!(v>0)){errs.push(`${c.name}: no value (right-click it and type one)`);return}
    if(c.type==='R')els.push({t:'G',a:nd[0],b:nd[1],g:1/v,nm:c.name});if(c.type==='C')els.push({t:'C',a:nd[0],b:nd[1],c:v,nm:c.name});if(c.type==='L')els.push({t:'L',a:nd[0],b:nd[1],l:v,nm:c.name});
    if(c.type==='D'){const f=SPICE.DIODES[c.model||'D'];if(!f){errs.push(`${c.name}: unknown model ${c.model}`);return}els.push({t:'D',a:nd[0],b:nd[1],f,nm:c.name})}
    if(c.type==='V'){const sp=c.src||{kind:'DC',dc:c.val};let fn,dc;if(sp.kind==='SINE'){const q=sp.args.map(x=>num(x)||0);fn=SPICE.SINE(q);dc=q[0]}else if(sp.kind==='PULSE'){fn=SPICE.PULSE(sp.args.map(x=>num(x)||0));dc=fn(0)}else{const d=num(sp.dc);if(!isFinite(d)){errs.push(`${c.name}: no value (right-click it)`);return}fn=()=>d;dc=d}
      els.push({t:'DC',a:nd[0],b:nd[1],v:dc,ilim:1e9,r:1e-3,nm:c.name,fn,dc})}
    if(c.type==='OA'){const m=SPICE.OPAMPS[c.model];if(!m){errs.push(`${c.name}: unknown op amp ${c.model}`);return}const R={};SYM.OA.roles.forEach((r,i)=>R[r]=nd[i]);els.push(Object.assign({t:'OA',m,nm:c.name,y:null},R))}
    if(c.type==='NM'||c.type==='PM'){const M=SPICE.MOS[c.model];if(!M){errs.push(`${c.name}: can't find model "${c.model}"`);return}if(M.lib&&!lib){errs.push(`${c.name}: can't find model "${c.model}" (missing .lib mosfet1u.lib?)`);return}
      if((M.p>0)!==(c.type==='NM')){errs.push(`${c.name}: ${c.model} is not a ${c.type==='NM'?'n':'p'}-channel model`);return}
      const W=num(c.w)||1e-6,L=num(c.l)||1e-6;const R={};SYM[c.type].roles.forEach((r,i)=>R[r]=nd[i]);els.push({t:'FET',d:R.d,g:R.g,s:R.s,m:SPICE.level1(M,W,L),nm:c.name});
      if(M.cox){const cg=2/3*M.cox*W*L+M.cov*W,cd=M.cov*W,cj=M.cj*W;els.push({t:'C',a:R.g,b:R.s,c:cg},{t:'C',a:R.g,b:R.d,c:cd},{t:'C',a:R.d,b:R.b!=null&&R.b!==R.d?R.b:R.s,c:cj})}}});
  /* K Lx Ly 1: perfectly coupled pair → magnetizing Lx + ideal transformer n = √(Ly/Lx) */
  net.dirs.forEach(l=>{const t=l.split(/\s+/);if(!/^k/i.test(t[0]))return;if(t.length<4){errs.push(`${t[0]}: K <L1> <L2> <coupling>`);return}const a=els.find(e=>e.t==='L'&&e.nm.toLowerCase()===t[1].toLowerCase()),b=els.find(e=>e.t==='L'&&e.nm.toLowerCase()===t[2].toLowerCase());
    if(!a||!b){errs.push(`${t[0]}: can't find inductors ${t[1]}, ${t[2]}`);return}Object.assign(b,{t:'XF',pa:a.a,pb:a.b,sa:b.a,sb:b.b,n:Math.sqrt(b.l/a.l),k:num(t[3])})});
  els.forEach(e=>{if(e.t==='OA')e.y=n++;if(e.t==='XF')e.j=n++});
  if(!net.gnd&&net.list.length)errs.push('No ground: place a GND (G) — every circuit needs node 0');
  return {ck:{n,els,dcs:[]},idx,errs}}
function solveAt(ck,x,ctx){return SOLVER.newton(ck,x,ctx,120,5,1e-9)}
/* runs the analysis of a netlist (with .step); returns {a,sp,runs:[{p,xs,X,ck,dt,IL}],idx,names} or {err} */
function simulate(net){const a=dirAnalysis(net.dirs);if(!a)return {err:'No simulation command: Simulate › Edit Simulation Cmd (or a .tran / .dc / .op directive)'};
  const sp=dirStep(net.dirs);const vals=sp?sp.vals:[null];const runs=[];let idx=null;
  for(const v of vals){const P={};if(sp)P[sp.name]=v;const B=compile(net,P);if(B.errs.length)return {err:B.errs[0]};idx=B.idx;const ck=B.ck;const srcs=ck.els.filter(e=>e.t==='DC');
    if(a.kind==='dc'){const sw=srcs.find(e=>e.nm.toLowerCase()===String(a.src).toLowerCase());if(!sw)return {err:`.dc: unknown source ${a.src}`};if(!(a.inc>0))return {err:'.dc: bad increment'};
      srcs.forEach(e=>e.v=e.dc);const xs=[],X=[];let x=null;for(let u=a.from;u<=a.to+a.inc*1e-6;u+=a.inc){sw.v=u;x=solveAt(ck,x,{});xs.push(+u.toPrecision(12));X.push(Float64Array.from(x))}runs.push({p:v,xs,X,ck})}
    else if(a.kind==='op'){srcs.forEach(e=>e.v=e.dc);const x=solveAt(ck,null,{});runs.push({p:v,xs:[0],X:[Float64Array.from(x)],ck})}
    else{if(!(a.stop>0))return {err:'.tran: bad stop time'};const N=Math.min(20000,Math.max(50,Math.ceil(a.stop/Math.min(a.max||a.stop/1000,a.stop/50))));const dt=a.stop/N;
      const vprev=ck.els.map(()=>0);srcs.forEach(e=>e.v=e.fn(0));let x=solveAt(ck,null,{vprev});const V=i=>i==null||i<0?0:x[i];
      ck.els.forEach((e,i)=>{if(e.t==='C')vprev[i]=V(e.a)-V(e.b);if(e.t==='OA')vprev[i]=V(e.y)});
      const xs=[0],X=[Float64Array.from(x)],IL=[ck.els.map(()=>0)];
      for(let k=1;k<=N;k++){const t=k*dt;srcs.forEach(e=>e.v=e.fn(t));x=solveAt(ck,x,{t,dt,vprev});
        ck.els.forEach((e,i)=>{if(e.t==='C')vprev[i]=V(e.a)-V(e.b);else if(e.t==='OA')vprev[i]=V(e.y);else if(e.t==='L')vprev[i]=vprev[i]+dt/e.l*(V(e.a)-V(e.b))});
        xs.push(t);X.push(Float64Array.from(x));IL.push(ck.els.map((e,i)=>e.t==='L'?vprev[i]:0))}
      runs.push({p:v,xs,X,ck,dt,IL})}}
  return {a,sp,runs,idx,names:[...idx.keys()]}}
/* trace values on a result: V(a), V(a,b), I(part) for every run; null if not valid */
function evalOn(R,expr){if(!R||!R.runs)return null;const m=String(expr).match(/^([VI])\(([^,()]+)(?:,([^()]+))?\)$/i);if(!m)return null;
  if(m[1].toUpperCase()==='V'){const ia=m[2]==='0'?-1:R.idx.get(m[2]),ib=m[3]==null||m[3]==='0'?-1:R.idx.get(m[3]);if(ia==null||ib==null)return null;
    return R.runs.map(r=>r.X.map(x=>(ia<0?0:x[ia])-(ib<0?0:x[ib])))}
  const nm=m[2].toLowerCase();const out=R.runs.map(r=>{const ei=r.ck.els.findIndex(e=>e.nm&&e.nm.toLowerCase()===nm);if(ei<0)return null;const e=r.ck.els[ei];const V=(x,i)=>i==null||i<0?0:x[i];
    return r.X.map((x,k)=>{const v=V(x,e.a)-V(x,e.b);if(e.t==='G')return v*e.g;if(e.t==='D')return e.f(v)[0];if(e.t==='C')return k&&r.dt?e.c*(v-(V(r.X[k-1],e.a)-V(r.X[k-1],e.b)))/r.dt:0;
      if(e.t==='L')return r.IL?r.IL[k][ei]:0;if(e.t==='XF')return -x[e.j];if(e.t==='DC')return (v-e.v)/e.r;if(e.t==='FET')return e.m(V(x,e.g)-V(x,e.s),V(x,e.d)-V(x,e.s));return 0})});
  return out.every(Boolean)?out:null}
  return {num,fmt,DIODES,OPAMPS,MOS,level1,SINE,PULSE,SYM,U,tf,pivot,parseNetlist,dirAnalysis,dirStep,dirLib,compile,simulate,evalOn};
})();

ENGINE.runPC=function(def){
'use strict';
const {num,fmt,SYM,U,tf,pivot}=SPICE;
const host=BENCH.el.svgHost;
const RT={S:null,MODE:BENCH.mode,uid:1};
/* ---------- state ---------- */
function fresh(){RT.S={open:false,news:0,saved:0,comps:[],wires:[],labels:[],dirs:[],tool:'sel',ptool:null,prot:0,pmir:false,sel:null,wireA:null,pend:null,
  res:null,traces:[],tsel:null,avg:null,zoom:null,dlg:null,log:[],runs:0,view:{x:-6,y:-4,s:1},hover:null,ghost:null,cnt:{}};RT.uid=1}
const S=()=>RT.S;
/* ---------- nets from the drawing ---------- */
function pinsOf(c){return SYM[c.type].pins.map(p=>tf(c,p))}
function nets(){const s=S();const P=new Map();const key=(x,y)=>x+','+y;const par={};const f=k=>{while(par[k]!==k){par[k]=par[par[k]];k=par[k]}return k};const add=k=>{if(par[k]==null)par[k]=k;return k};const un=(a,b)=>{a=f(add(a));b=f(add(b));if(a!==b)par[a]=b};
  const pts=[];s.comps.forEach(c=>pinsOf(c).forEach(([x,y],i)=>{add(key(x,y));pts.push([x,y])}));s.wires.forEach(w=>{add(key(w.x1,w.y1));add(key(w.x2,w.y2));pts.push([w.x1,w.y1],[w.x2,w.y2])});s.labels.forEach(l=>{add(key(l.x,l.y));pts.push([l.x,l.y])});
  s.wires.forEach(w=>{un(key(w.x1,w.y1),key(w.x2,w.y2));const xa=Math.min(w.x1,w.x2),xb=Math.max(w.x1,w.x2),ya=Math.min(w.y1,w.y2),yb=Math.max(w.y1,w.y2);
    pts.forEach(([x,y])=>{if(x>=xa&&x<=xb&&y>=ya&&y<=yb)un(key(x,y),key(w.x1,w.y1))})});
  s.labels.forEach(l=>un(key(l.x,l.y),'L:'+l.name.toLowerCase()));
  s.comps.forEach(c=>{if(c.type==='GND')un(key(c.x,c.y),'GND')});
  /* names: 0 for ground, the label, else N001 … */
  const names={};let k=1;const rootName={};
  Object.keys(par).forEach(q=>{const r=f(q);if(q==='GND')rootName[r]='0';else if(q.startsWith('L:')&&rootName[r]!=='0'&&!rootName[r])rootName[r]=q.slice(2)});
  const netOf=(x,y)=>{const q=key(x,y);if(par[q]==null)return null;const r=f(q);if(!rootName[r])rootName[r]='N'+String(k++).padStart(3,'0');return rootName[r]};
  /* how many things meet at each point (for junction dots) */
  const deg={};const bump=(x,y)=>{const q=key(x,y);deg[q]=(deg[q]||0)+1};s.wires.forEach(w=>{bump(w.x1,w.y1);bump(w.x2,w.y2)});s.comps.forEach(c=>pinsOf(c).forEach(([x,y])=>bump(x,y)));
  s.wires.forEach(w=>{const xa=Math.min(w.x1,w.x2),xb=Math.max(w.x1,w.x2),ya=Math.min(w.y1,w.y2),yb=Math.max(w.y1,w.y2);Object.keys(deg).forEach(q=>{const [x,y]=q.split(',').map(Number);if((x>xa&&x<xb&&ya===yb&&y===ya)||(y>ya&&y<yb&&xa===xb&&x===xa))deg[q]++})});
  return {netOf,deg,touched:q=>par[q]!=null}}
/* ---------- directives ---------- */
function directives(){const lines=[];S().dirs.forEach(d=>d.text.split('\n').forEach(l=>{l=l.trim();if(l)lines.push(l)}));return lines}
/* ---------- netlist: list of {type,name,nodes:[net names],val,model,src,w,l} ---------- */
function fromSchematic(){const s=S();const N=nets();const list=[];s.comps.forEach(c=>{if(c.type==='GND')return;list.push({type:c.type,name:c.name,nodes:pinsOf(c).map(([x,y])=>N.netOf(x,y)),val:c.val,model:c.model,src:c.src,w:c.w,l:c.l})});
  return {list,dirs:directives(),gnd:s.comps.some(c=>c.type==='GND'),N}}
const analysis=()=>dirAnalysis(directives()),stepParam=()=>dirStep(directives()),hasLib=()=>dirLib(directives());
const {parseNetlist,dirAnalysis,dirStep,dirLib,compile,simulate,evalOn}=SPICE;
function run(){const s=S();s.err=null;const net=fromSchematic();const R=simulate(net);if(R.err){fail(R.err);return}
  s.res=Object.assign(R,{sig:signature(),n:++s.runs});s.traces=s.traces.filter(tr=>evalTrace(tr.expr));s.zoom=null;s.avg=null;s.wavesOpen=true;
  if(def.onRun)def.onRun(RT,s.res);render();BENCH.onRender()}
function fail(m){S().err=m;S().res=null;S().dlg={kind:'err',msg:m};render();BENCH.onRender()}
function signature(){const s=S();return JSON.stringify([s.comps.map(c=>[c.type,c.x,c.y,c.rot,c.mir,c.val,c.model,c.src]),s.wires.map(w=>[w.x1,w.y1,w.x2,w.y2]),s.labels.map(l=>[l.x,l.y,l.name]),directives()])}
const evalTrace=expr=>evalOn(S().res,expr);
/* ---------- DOM ---------- */
host.innerHTML=`<div class="pcapp" id="pcapp" dir="ltr">
 <div class="pc-title"><span class="pc-logo">LT</span><span id="pcTitle">LTspice XVII</span></div>
 <div class="pc-menu" id="pcMenu"></div>
 <div class="pc-tools" id="pcTools"></div>
 <div class="pc-main"><div class="pc-wave" id="pcWave" hidden></div><div class="pc-sch" id="pcSch"></div></div>
 <div class="pc-stat" id="pcStat"></div><div class="pc-dlg" id="pcDlg" hidden></div></div>`;
const app=$('pcapp'),sch=$('pcSch'),wave=$('pcWave'),dlgEl=$('pcDlg');
const MENUS={File:[['new','New Schematic'],['save','Save  (Ctrl+S)']],Edit:[['R','Resistor  (R)'],['C','Capacitor  (C)'],['L','Inductor  (L)'],['D','Diode  (D)'],['comp','Component  (F2)'],['GND','Place GND  (G)'],['label','Label Net  (F4)'],['wire','Draw Wire  (F3)'],['dir','SPICE Directive  (S)'],['ana','SPICE Analysis'],['rot','Rotate  (Ctrl+R)'],['mir','Mirror  (Ctrl+E)'],['del','Delete  (F5)']],Simulate:[['run','Run'],['ana','Edit Simulation Cmd']],View:[['fit','Zoom to Fit']]};
const TOOLS=[['new','🗋','New Schematic'],['save','💾','Save'],['run','🏃','Run'],['fit','⤢','Zoom to fit'],['zin','＋','Zoom in'],['zout','－','Zoom out'],['wire','✎','Wire (F3)'],['GND','⏚','Ground (G)'],['label','A',"Label Net (F4)"],['R','R','Resistor (R)'],['C','C','Capacitor (C)'],['L','L','Inductor (L)'],['D','D','Diode (D)'],['comp','⧉','Component (F2)'],['rot','⟳','Rotate (Ctrl+R)'],['mir','⇋','Mirror (Ctrl+E)'],['del','✂','Delete (F5)'],['dir','.op','SPICE Directive (S)'],['ana','⚙','Edit Simulation Cmd']];
$('pcMenu').innerHTML=Object.keys(MENUS).map(m=>`<div class="pcm"><button data-pm="${m}">${m}</button><div class="pcm-list" hidden>${MENUS[m].map(([k,t])=>`<button data-pc="${k}">${t}</button>`).join('')}</div></div>`).join('');
$('pcTools').innerHTML=TOOLS.map(([k,ic,t])=>`<button data-pc="${k}" title="${t}"><span>${ic}</span></button>`).join('');
app.addEventListener('click',e=>{if(!e.target.isConnected||!e.target.closest('.pc-menu,.pc-tools'))return;const pm=e.target.closest('[data-pm]');if(pm){const l=pm.nextElementSibling;const was=!l.hidden;app.querySelectorAll('.pcm-list').forEach(x=>x.hidden=true);l.hidden=was;return}
  const b=e.target.closest('[data-pc]');app.querySelectorAll('.pcm-list').forEach(x=>x.hidden=true);if(b)act(b.dataset.pc)});
/* ---------- actions ---------- */
const PLACE={R:'R',C:'C',L:'L',D:'D',GND:'GND'};
function act(k){const s=S();
  if(k==='new'){fresh();RT.S.open=true;RT.S.news=s.news+1;RT.S.saved=0;RT.S.runs=s.runs;RT.S.log=s.log;render();BENCH.onRender();return}
  if(!s.open){BENCH.say('افتح File › New Schematic أول');return}
  if(k==='save'){s.saved++;s.savedSig=signature();BENCH.say('💾 Saved Draft'+s.news+'.asc');render();BENCH.onRender();return}
  if(k==='run'){run();return}
  if(k==='zin'||k==='zout'){const v=s.view,f=k==='zin'?1.25:0.8,ns=Math.min(3,Math.max(0.2,v.s*f));const cx=v.x+VW/(2*U*v.s),cy=v.y+VH/(2*U*v.s);v.s=ns;v.x=cx-VW/(2*U*ns);v.y=cy-VH/(2*U*ns);render();return}
  if(k==='fit'){if(s.res&&!wave.hidden){s.zoom=null;s.fitted=(s.fitted||0)+1}fitView();render();BENCH.onRender();return}
  if(PLACE[k]){if(s.tool==='place'&&s.ptool===k)setTool('sel');else setTool('place',k);return}
  if(k==='comp'){openDlg({kind:'comp'});return}
  if(k==='wire'||k==='del'){setTool(s.tool===k?'sel':k);return}
  if(k==='label'){openDlg({kind:'label'});return}
  if(k==='dir'){openDlg({kind:'dir',text:''});return}
  if(k==='ana'){openDlg({kind:'ana'});return}
  if(k==='rot'||k==='mir'){const c=s.tool==='place'?null:s.comps.find(q=>q.id===s.sel);if(s.tool==='place'){if(k==='rot')s.prot=(s.prot+1)%4;else s.pmir=!s.pmir;render();return}
    if(c){turn(c,k);render();BENCH.onRender()}return}}
function turn(c,k){const p=pivot(c);const before=tf(c,p);if(k==='rot')c.rot=(c.rot+1)%4;else c.mir=!c.mir;const after=tf(Object.assign({},c,{x:0,y:0}),p);c.x=before[0]-after[0];c.y=before[1]-after[1]}
function setTool(t,p){const s=S();s.tool=t;s.ptool=p||null;s.wireA=null;s.prot=0;s.pmir=false;render()}
function newComp(type,x,y,extra){const s=S();const pre=SYM[type].pre;const c=Object.assign({id:RT.uid++,type,x,y,rot:s.prot,mir:s.pmir,val:'',model:null},extra||{});
  if(pre){s.cnt[pre]=(s.cnt[pre]||0)+1;c.name=pre+s.cnt[pre]}
  if(type==='R')c.val='R';if(type==='C')c.val='C';if(type==='L')c.val='L';if(type==='D')c.model='D';if(type==='V'){c.src={kind:'DC',dc:''};c.val=''}
  if(type==='NM')c.model='NMOS';if(type==='PM')c.model='PMOS';if(type==='OA')c.model=c.model||'OP747';
  s.comps.push(c);s.sel=c.id;return c}
/* ---------- dialogs ---------- */
function openDlg(d){S().dlg=d;render()}
function closeDlg(){S().dlg=null;render()}
function dlgHTML(d){const s=S();const c=d.id!=null?s.comps.find(q=>q.id===d.id):null;
  const btns=`<div class="pc-db"><button data-dl="ok" class="pri">OK</button><button data-dl="cancel">Cancel</button></div>`;
  if(d.kind==='err')return `<h4>LTspice Error</h4><p class="pc-err">${d.msg}</p><div class="pc-db"><button data-dl="cancel" class="pri">OK</button></div>`;
  if(d.kind==='comp')return `<h4>Select Component Symbol</h4><div class="pc-list">${[['voltage','voltage — independent voltage source'],['OA:OP747','OpAmps › OP747'],['OA:LT1001','OpAmps › LT1001'],['OA:UniversalOpAmp2','OpAmps › UniversalOpAmp2'],['NM','nmos4 — 4-terminal NMOS'],['PM','pmos4 — 4-terminal PMOS'],['R','res'],['C','cap'],['L','ind'],['D','diode']].map(([k,t])=>`<button data-cp="${k}">${t}</button>`).join('')}</div><div class="pc-db"><button data-dl="cancel">Cancel</button></div>`;
  if(d.kind==='label')return `<h4>Net Name</h4><input id="pcIn" value="${d.name||''}" placeholder="e.g. out" autocomplete="off">${btns}`;
  if(d.kind==='dir')return `<h4>Edit Text on the Schematic</h4><p class="pc-h">SPICE directive (Ctrl+M = new line)</p><textarea id="pcIn" rows="4">${d.text||''}</textarea>${btns}`;
  if(d.kind==='ana'){const a=analysis()||{kind:'tran'};const tab=d.tab||a.kind;const T=(k,l)=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`;
    let body='';if(tab==='tran')body=`<label>Stop time <input id="aStop" value="${a.kind==='tran'?fmt(a.stop):''}"></label><label>Time to start saving data <input id="aStart" value="${a.kind==='tran'?fmt(a.start):'0'}"></label><label>Maximum Timestep <input id="aMax" value="${a.kind==='tran'&&a.max?fmt(a.max):''}"></label>`;
    if(tab==='dc')body=`<label>Name of 1st source to sweep <input id="aSrc" value="${a.kind==='dc'?a.src.toUpperCase():''}"></label><label>Type of sweep <select id="aType"><option>Linear</option></select></label><label>Start value <input id="aFrom" value="${a.kind==='dc'?fmt(a.from):''}"></label><label>Stop value <input id="aTo" value="${a.kind==='dc'?fmt(a.to):''}"></label><label>Increment <input id="aInc" value="${a.kind==='dc'?fmt(a.inc):''}"></label>`;
    if(tab==='op')body=`<p class="pc-h">Find the DC operating point solution, treating capacitances as open circuits and inductances as short circuits.</p>`;
    return `<h4>Edit Simulation Command</h4><div class="pc-tabs">${T('tran','Transient')}${T('dc','DC sweep')}${T('op','DC op pnt')}</div><div class="pc-form">${body}</div>${btns}`}
  if(c&&['R','C','L'].includes(c.type))return `<h4>${{R:'Resistor',C:'Capacitor',L:'Inductor'}[c.type]} · ${c.name}</h4><label>${{R:'Resistance [Ω]',C:'Capacitance [F]',L:'Inductance [H]'}[c.type]} <input id="pcIn" value="${/^[RCL]$/.test(c.val)?'':c.val}" autocomplete="off"></label>${btns}`;
  if(c&&c.type==='D')return `<h4>Diode · ${c.name}</h4><p class="pc-h">Pick New Diode</p><div class="pc-list">${Object.keys(SPICE.DIODES).map(m=>`<button data-dm="${m}" class="${c.model===m?'on':''}">${m}${m==='1N750'?' (Zener 4.7 V)':m==='D'?' (default)':''}</button>`).join('')}</div><div class="pc-db"><button data-dl="cancel">Close</button></div>`;
  if(c&&c.type==='V'){const sp=d.src||JSON.parse(JSON.stringify(c.src));d.src=sp;const f=(lab,i)=>`<label>${lab} <input data-ai="${i}" value="${sp.args&&sp.args[i]!=null?sp.args[i]:''}"></label>`;
    let body=`<div class="pc-tabs"><button data-src="DC" class="${sp.kind==='DC'?'on':''}">DC value</button><button data-src="SINE" class="${sp.kind==='SINE'?'on':''}">SINE</button><button data-src="PULSE" class="${sp.kind==='PULSE'?'on':''}">PULSE</button></div><div class="pc-form">`;
    if(sp.kind==='DC')body+=`<label>DC value [V] <input id="pcIn" value="${sp.dc||''}"></label>`;
    if(sp.kind==='SINE')body+=['DC offset[V]','Amplitude[V]','Freq[Hz]','Tdelay[s]','Theta[1/s]','Phi[deg]','Ncycles'].map(f).join('');
    if(sp.kind==='PULSE')body+=['Vinitial[V]','Von[V]','Tdelay[s]','Trise[s]','Tfall[s]','Ton[s]','Tperiod[s]','Ncycles'].map(f).join('');
    return `<h4>Voltage Source · ${c.name}</h4>${body}</div>${btns}`}
  if(c&&(c.type==='NM'||c.type==='PM'))return `<h4>MOSFET · ${c.name}</h4><label>Model name <input id="pcIn" value="${c.model}" autocomplete="off"></label><label>Length (L) <input id="pcL" value="${c.l||''}" placeholder="1u"></label><label>Width (W) <input id="pcW" value="${c.w||''}" placeholder="1u"></label>${btns}`;
  if(c&&c.type==='OA')return `<h4>${c.model} · ${c.name}</h4><p class="pc-h">Op amp macromodel from the LTspice library; pins: +, −, OUT, +V, −V.</p><div class="pc-db"><button data-dl="cancel">Close</button></div>`;
  return ''}
dlgEl.addEventListener('click',e=>{const s=S(),d=s.dlg;if(!d)return;const t=e.target.closest('button');if(!t)return;const c=d.id!=null?s.comps.find(q=>q.id===d.id):null;
  if(t.dataset.tab){d.tab=t.dataset.tab;render();return}
  if(t.dataset.src){d.src.kind=t.dataset.src;d.src.args=t.dataset.src==='SINE'?['0','1','1k','0','0','0','0']:t.dataset.src==='PULSE'?['0','5','0','1n','1n','10n','20n','0']:null;render();return}
  if(t.dataset.dm){c.model=t.dataset.dm;closeDlg();BENCH.onRender();return}
  if(t.dataset.cp){const k=t.dataset.cp;closeDlg();if(k==='voltage')setTool('place','V');else if(k.startsWith('OA:')){setTool('place','OA');s.pmodel=k.slice(3)}else setTool('place',k);return}
  if(t.dataset.dl==='cancel'){closeDlg();return}
  if(t.dataset.dl==='ok'){const v=$('pcIn')?$('pcIn').value.trim():'';
    if(d.kind==='label'){if(!v)return;closeDlg();setTool('label');s.pend={name:v};return}
    if(d.kind==='dir'){if(!v){closeDlg();return}if(d.dirId){const q=s.dirs.find(x=>x.id===d.dirId);q.text=v;closeDlg();BENCH.onRender();return}closeDlg();setTool('dir');s.pend={text:v};return}
    if(d.kind==='ana'){const tab=d.tab||(analysis()||{kind:'tran'}).kind;let line='';const g=id=>$(id)?$(id).value.trim():'';
      if(tab==='tran')line=`.tran 0 ${g('aStop')} ${g('aStart')||'0'}${g('aMax')?' '+g('aMax'):''}`;if(tab==='dc')line=`.dc ${g('aSrc')} ${g('aFrom')} ${g('aTo')} ${g('aInc')}`;if(tab==='op')line='.op';
      const old=s.dirs.find(x=>/^\s*\.(tran|dc|op)\b/im.test(x.text));closeDlg();
      if(old){old.text=old.text.split('\n').map(l=>/^\s*\.(tran|dc|op)\b/i.test(l)?line:l).join('\n');BENCH.onRender();render()}else{setTool('dir');s.pend={text:line}}return}
    if(c&&['R','C','L'].includes(c.type)){c.val=v;closeDlg();BENCH.onRender();return}
    if(c&&c.type==='V'){const sp=d.src;if(sp.kind==='DC')sp.dc=v;else sp.args=[...dlgEl.querySelectorAll('[data-ai]')].map(i=>i.value.trim()||'0');c.src=sp;c.val=sp.kind==='DC'?sp.dc:`${sp.kind}(${sp.args.join(' ')})`;closeDlg();BENCH.onRender();return}
    if(c&&(c.type==='NM'||c.type==='PM')){c.model=v||c.model;c.l=$('pcL').value.trim();c.w=$('pcW').value.trim();closeDlg();BENCH.onRender();return}}});
dlgEl.addEventListener('keydown',e=>{if(e.key==='m'&&e.ctrlKey&&e.target.tagName==='TEXTAREA'){e.preventDefault();const ta=e.target;const p=ta.selectionStart;ta.value=ta.value.slice(0,p)+'\n'+ta.value.slice(p);ta.selectionStart=ta.selectionEnd=p+1}
  if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();const ok=dlgEl.querySelector('[data-dl="ok"]');if(ok)ok.click()}e.stopPropagation()});
/* ---------- schematic view ---------- */
let VW=600,VH=400;
function fitView(){const s=S();const xs=[],ys=[];s.comps.forEach(c=>pinsOf(c).forEach(([x,y])=>{xs.push(x);ys.push(y)}));s.wires.forEach(w=>{xs.push(w.x1,w.x2);ys.push(w.y1,w.y2)});s.dirs.forEach(d=>{xs.push(d.x,d.x+10);ys.push(d.y)});
  if(!xs.length){s.view={x:-6,y:-4,s:1};return}const x0=Math.min(...xs)-3,x1=Math.max(...xs)+3,y0=Math.min(...ys)-3,y1=Math.max(...ys)+3;const sc=Math.min(2,Math.max(0.3,Math.min(VW/((x1-x0)*U),VH/((y1-y0)*U))));
  s.view={s:sc,x:(x0+x1)/2-VW/sc/U/2,y:(y0+y1)/2-VH/sc/U/2}}
const toPx=(gx,gy)=>{const v=S().view;return [(gx-v.x)*U*v.s,(gy-v.y)*U*v.s]};
function toGrid(e,exact){const r=sch.getBoundingClientRect(),v=S().view;const gx=(e.clientX-r.left)/(U*v.s)+v.x,gy=(e.clientY-r.top)/(U*v.s)+v.y;return exact?[gx,gy]:[Math.round(gx),Math.round(gy)]}
function compSVG(c,ghost){const s=S();const sym=SYM[c.type];let tr='';const [ox,oy]=[c.x*U,c.y*U];
  tr=`translate(${ox} ${oy}) rotate(${c.rot*90})${c.mir?' scale(-1 1)':''}`;
  const sel=!ghost&&s.sel===c.id;let t=`<g transform="${tr}" class="${ghost?'ghost':''}${sel?' sel':''}">${sym.draw(c)}${sym.pins.map(([x,y])=>`<rect x="${x*U-2.5}" y="${y*U-2.5}" width="5" height="5" class="pin"/>`).join('')}</g>`;
  if(!ghost&&c.type!=='GND'){const P=pinsOf(c);const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cy=P.reduce((a,p)=>a+p[1],0)/P.length;const vert=c.rot%2===0&&c.type!=='OA';
    const lx=(cx+(vert?1:0.2))*U,ly=(cy+(vert?-0.4:-1.4))*U;t+=`<text x="${lx}" y="${ly}" class="nm">${c.name}</text><text x="${lx}" y="${ly+13}" class="vl">${c.type==='D'||c.type==='NM'||c.type==='PM'||c.type==='OA'?c.model:c.val||''}</text>`;
    /* click area: the body only, never the pin ends (a click on a pin probes / wires the node) */
    const ax=P.map(p=>p[0]),ay=P.map(p=>p[1]);const sp=(a,b)=>b-a<1?[a-0.8,b+0.8]:[a+0.45,b-0.45];const [x0,x1]=sp(Math.min(...ax),Math.max(...ax)),[y0,y1]=sp(Math.min(...ay),Math.max(...ay));
    t+=`<rect x="${x0*U}" y="${y0*U}" width="${(x1-x0)*U}" height="${(y1-y0)*U}" fill="transparent" data-comp="${c.id}"/>`}
  return t}
function schSVG(){const s=S();const v=s.view;const N=nets();let g='';
  const step=U;g+=`<defs><pattern id="pcgrid" width="${U}" height="${U}" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r="0.9" fill="#9aa"/></pattern></defs><rect x="${v.x*U-2000}" y="${v.y*U-2000}" width="6000" height="6000" fill="url(#pcgrid)"/>`;
  s.wires.forEach(w=>g+=`<line x1="${w.x1*U}" y1="${w.y1*U}" x2="${w.x2*U}" y2="${w.y2*U}" class="wire${s.sel===-w.id?' sel':''}"/><line x1="${w.x1*U}" y1="${w.y1*U}" x2="${w.x2*U}" y2="${w.y2*U}" stroke="transparent" stroke-width="10" data-wire="${w.id}"/>`);
  s.comps.forEach(c=>g+=compSVG(c));
  Object.entries(N.deg).forEach(([q,d])=>{if(d>=3){const [x,y]=q.split(',').map(Number);g+=`<rect x="${x*U-3.5}" y="${y*U-3.5}" width="7" height="7" fill="#1b2c86"/>`}});
  s.labels.forEach(l=>{const w=l.name.length*7.6+14;g+=`<g data-label="${l.id}" pointer-events="none"><path d="M${l.x*U} ${l.y*U} l6 -8 h${w} v16 h-${w} z" fill="#fff" stroke="#1b2c86" stroke-width="1.4"/><text x="${l.x*U+12}" y="${l.y*U+4.5}" class="lb">${l.name}</text></g>`});
  s.dirs.forEach(d=>{g+=`<text x="${d.x*U}" y="${d.y*U}" class="dir" data-dir="${d.id}">${d.text.split('\n').map((l,i)=>`<tspan x="${d.x*U}" dy="${i?15:0}">${l.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</tspan>`).join('')}</text>`});
  if(s.tool==='place'&&s.ghost){const gc={type:s.ptool,x:s.ghost[0],y:s.ghost[1],rot:s.prot,mir:s.pmir,src:{kind:'DC'},model:''};g+=compSVG(gc,true)}
  if(s.tool==='wire'&&s.wireA&&s.ghost){const [ax,ay]=s.wireA,[bx,by]=s.ghost;g+=`<path d="M${ax*U} ${ay*U} H${bx*U} V${by*U}" class="wire ghost"/>`}
  if((s.tool==='label'||s.tool==='dir')&&s.ghost&&s.pend){const [x,y]=s.ghost;g+=s.tool==='label'?`<text x="${x*U+10}" y="${y*U+4}" class="lb ghost">${s.pend.name}</text><circle cx="${x*U}" cy="${y*U}" r="4" fill="#1b2c86" opacity=".5"/>`:`<text x="${x*U}" y="${y*U}" class="dir ghost">${s.pend.text.split('\n')[0]}</text>`}
  if(s.hover&&s.res&&s.tool==='sel'){const [x,y]=s.hover.at;g+=`<text x="${x*U+6}" y="${y*U-6}" font-size="18">${s.hover.kind==='I'?'🗜':'🔴'}</text>`}
  if(s.drag&&s.drag.kind==='probe2'&&s.drag.to){g+=`<line x1="${s.drag.at[0]*U}" y1="${s.drag.at[1]*U}" x2="${s.drag.to[0]*U}" y2="${s.drag.to[1]*U}" stroke="#d22" stroke-dasharray="4 3"/>`}
  return `<svg id="pcSvg" width="100%" height="100%" viewBox="${v.x*U} ${v.y*U} ${VW/v.s} ${VH/v.s}"><g>${g}</g></svg>`}
/* ---------- waveform viewer ---------- */
const COL=['#2a5bd7','#d23c2f','#1f9a4c','#c27c0e','#8a3fc7','#11959b','#d0388a','#5a6b2a'];
function nice(a,b,n=6){const span=b-a||1;const raw=span/n;const p=Math.pow(10,Math.floor(Math.log10(raw)));const m=[1,2,5,10].find(k=>k*p>=raw)*p;const out=[];if(!isFinite(m)||m<=0)return out;for(let v=Math.ceil(a/m)*m;v<=b+m*1e-9&&out.length<40;v+=m)out.push(+v.toPrecision(12));return out}
function waveSVG(h){const s=S(),R=s.res;const pl=wave.querySelector('.pc-wplot');const W=wave.clientWidth||600,Hh=Math.max(70,h||(pl&&pl.clientHeight)||150);const L=58,Rm=12,T=8,B=24;const pw=W-L-Rm,ph=Hh-T-B;
  const xs=R.runs[0].xs;let xa=xs[0],xb=xs[xs.length-1];if(s.zoom){xa=s.zoom.x0;xb=s.zoom.x1}
  const data=s.traces.map(tr=>({tr,v:evalTrace(tr.expr)})).filter(d=>d.v);let ya=1e30,yb=-1e30;
  data.forEach(d=>d.v.forEach((arr,ri)=>{const X=R.runs[ri].xs;arr.forEach((y,k)=>{if(X[k]>=xa&&X[k]<=xb){ya=Math.min(ya,y);yb=Math.max(yb,y)}})}));
  if(s.zoom&&s.zoom.y0!=null){ya=s.zoom.y0;yb=s.zoom.y1}if(ya>yb){ya=-1;yb=1}else if(!(yb>ya)){const c=ya;ya=c-1;yb=c+1}else if(!s.zoom||s.zoom.y0==null){const pad=(yb-ya)*0.06;ya-=pad;yb+=pad}
  const X=x=>L+(x-xa)/(xb-xa)*pw,Y=y=>T+(yb-y)/(yb-ya)*ph;s._ax={xa,xb,ya,yb,L,T,pw,ph};
  const xu=R.a.kind==='tran'?'s':'V';let g=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="#000"/>`;
  nice(xa,xb,7).forEach(v=>g+=`<line x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${T+ph}" stroke="#333" stroke-dasharray="2 3"/><text x="${X(v)}" y="${T+ph+15}" class="ax" text-anchor="middle">${fmt(v,xu)}</text>`);
  const yu=data.length&&data.every(d=>/^I/i.test(d.tr.expr))?'A':'V';nice(ya,yb,6).forEach(v=>g+=`<line x1="${L}" y1="${Y(v)}" x2="${L+pw}" y2="${Y(v)}" stroke="#333" stroke-dasharray="2 3"/><text x="${L-5}" y="${Y(v)+4}" class="ax" text-anchor="end">${fmt(v,yu)}</text>`);
  g+=`<clipPath id="wclip"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath><g clip-path="url(#wclip)">`;
  data.forEach((d,di)=>d.v.forEach((arr,ri)=>{const Xs=R.runs[ri].xs;const step=Math.max(1,Math.floor(arr.length/1500));let p='';for(let k=0;k<arr.length;k+=step){if(Xs[k]<xa-(xb-xa)*0.02||Xs[k]>xb+(xb-xa)*0.02)continue;p+=(p?'L':'M')+X(Xs[k]).toFixed(1)+' '+Y(arr[k]).toFixed(1)}
    const col=R.runs.length>1?COL[(di+ri)%COL.length]:COL[d.tr.c%COL.length];g+=`<path d="${p}" fill="none" stroke="${col}" stroke-width="${s.tsel===d.tr.expr?2.6:1.5}"/>`}));
  g+='</g>';if(s.box)g+=`<rect x="${Math.min(s.box.a[0],s.box.b[0])}" y="${Math.min(s.box.a[1],s.box.b[1])}" width="${Math.abs(s.box.b[0]-s.box.a[0])}" height="${Math.abs(s.box.b[1]-s.box.a[1])}" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-dasharray="3 2"/>`;
  if(s.cross){const {px,py}=s.cross;g+=`<line x1="${px}" y1="${T}" x2="${px}" y2="${T+ph}" stroke="#aaa"/><line x1="${L}" y1="${py}" x2="${L+pw}" y2="${py}" stroke="#555"/>`}
  return `<svg id="pcWsvg" width="100%" height="${Hh}">${g}</svg>`}
function waveHTML(){const s=S(),R=s.res;const steps=R.sp?` · .step ${R.sp.name} = ${R.sp.vals.map(v=>fmt(v)).join(', ')}`:'';
  const leg=s.traces.map(tr=>`<span class="pc-tr${s.tsel===tr.expr?' on':''}" data-tr="${tr.expr}" style="color:${R.runs.length>1?'#fff':COL[tr.c%COL.length]}">${tr.expr}<button data-trx="${tr.expr}" title="delete">✕</button><button data-tra="${tr.expr}" title="average (Ctrl+click)">∑</button></span>`).join('');
  let avg='';if(s.avg){const d=evalTrace(s.avg);const ax=s._ax||{};if(d){const r0=R.runs[0];let sm=0,sq=0,c=0,tt=0;const xs=r0.xs;for(let k=1;k<xs.length;k++){if(xs[k]<(ax.xa??-1e30)||xs[k-1]>(ax.xb??1e30))continue;const dx=xs[k]-xs[k-1];const y=(d[0][k]+d[0][k-1])/2;sm+=y*dx;sq+=y*y*dx;tt+=dx;c++}
    s.avgVal={expr:s.avg,avg:sm/tt,rms:Math.sqrt(sq/tt)};avg=`<div class="pc-avg"><b>${s.avg}</b> Interval Start: ${fmt(ax.xa,'s')} End: ${fmt(ax.xb,'s')}<br>Average: ${fmt(sm/tt,/^I/i.test(s.avg)?'A':'V')} · RMS: ${fmt(Math.sqrt(sq/tt),/^I/i.test(s.avg)?'A':'V')}<button data-avgx>✕</button></div>`}}
  const cur=s.cross&&s.cross.txt?`<span class="pc-cur">${s.cross.txt}</span>`:'';
  return `<div class="pc-whead"><span class="pc-legend">${leg||'<i>اضغط على node في الدائرة عشان تعرض جهدها</i>'}</span><span class="pc-wbtn"><button data-wfit>⤢ Zoom Full (Ctrl+E)</button><button data-wclose>✕</button></span></div><div class="pc-sub">${R.a.kind==='tran'?'.tran':R.a.kind==='dc'?'.dc '+R.a.src:'.op'}${steps}${cur}</div>${avg}<div class="pc-wplot"></div>`}
function opTable(){const s=S(),R=s.res;const x=R.runs[0].X[0];return `<table class="pc-op"><tr><th colspan="2">--- Operating Point ---</th></tr>${R.names.filter(n=>!/^\d/.test(n)||n!=='0').map(n=>`<tr><td>V(${n})</td><td>${x[R.idx.get(n)].toFixed(6)}</td></tr>`).join('')}</table>`}
/* ---------- render ---------- */
function render(){const s=S();VW=sch.clientWidth||600;VH=sch.clientHeight||400;
  $('pcTitle').textContent='LTspice XVII'+(s.open?` - [Draft${s.news}.asc]`:'');
  app.querySelectorAll('[data-pc]').forEach(b=>{const k=b.dataset.pc;b.classList.toggle('on',(s.tool==='place'&&s.ptool===k)||(s.tool===k)||(k==='label'&&s.tool==='label')||(k==='dir'&&s.tool==='dir'));b.disabled=!s.open&&k!=='new'});
  if(!s.open){sch.innerHTML=`<div class="pc-empty">File › <b>New Schematic</b></div>`}else sch.innerHTML=schSVG();
  const showW=!!s.res&&s.wavesOpen!==false;wave.hidden=!showW;app.classList.toggle('has-wave',showW);if(showW){wave.innerHTML=waveHTML();const pl=wave.querySelector('.pc-wplot');pl.innerHTML=s.res.a.kind==='op'?opTable():waveSVG(pl.clientHeight)}
  const hint={sel:s.res?'Click a node to plot its voltage · drag node→node for a difference · click a part for its current · right-click (long-press) a part to edit it':'Right-click (long-press) a part to edit its value · drag to move',place:'Click to place · Ctrl+R rotate · Ctrl+E mirror · Esc to end',wire:'Click the start point, then the end point · Esc to end',del:'Click what you want to delete · Esc to end',label:'Click a wire or a pin to attach the label',dir:'Click where to put the directive'}[s.tool];
  $('pcStat').textContent=s.err?'⚠ '+s.err:hint||'';
  /* the dialog is rebuilt only when it changes (a resize must not replace the button under a finger) */
  if(s.dlg){const key=JSON.stringify(s.dlg);if(dlgEl.dataset.key!==key){dlgEl.dataset.key=key;dlgEl.hidden=false;dlgEl.innerHTML=`<div class="pc-dbox">${dlgHTML(s.dlg)}</div>`;const i=dlgEl.querySelector('input,textarea');if(i&&!matchMedia('(pointer:coarse)').matches)setTimeout(()=>i.focus(),0)}}
  else if(dlgEl.dataset.key){dlgEl.dataset.key='';dlgEl.hidden=true;dlgEl.innerHTML=''}
  layoutCard()}
function layoutCard(){const c=BENCH.el.card;const h=BENCH.mode==='manual'&&!c.hidden?c.offsetHeight+16:8;app.style.bottom=h+'px'}
/* ---------- schematic pointer input ---------- */
function hit(e){const t=document.elementFromPoint(e.clientX,e.clientY);if(!t)return {};const c=t.closest('[data-comp]'),w=t.closest('[data-wire]'),l=t.closest('[data-label]'),d=t.closest('[data-dir]');
  return {comp:c&&+c.dataset.comp,wire:w&&+w.dataset.wire,label:l&&+l.dataset.label,dir:d&&+d.dataset.dir}}
function nodeAt(g){const N=nets();const q=g[0]+','+g[1];return N.touched(q)?N.netOf(g[0],g[1]):null}
let press=null,lp=null;const touches=new Map();let pinch=null;
sch.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){const [a,b]=[...touches.values()];const s=S();pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:s.view.s,c:toGrid({clientX:(a[0]+b[0])/2,clientY:(a[1]+b[1])/2},true)};press=null;s.drag=null;clearTimeout(lp)}},true);
sch.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&touches.size===2){const [a,b]=[...touches.values()];const s=S(),v=s.view;const ns=Math.min(3,Math.max(0.2,pinch.s*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));
  const r=sch.getBoundingClientRect(),mx=(a[0]+b[0])/2-r.left,my=(a[1]+b[1])/2-r.top;v.s=ns;v.x=pinch.c[0]-mx/(U*ns);v.y=pinch.c[1]-my/(U*ns);sch.innerHTML=schSVG();e.stopImmediatePropagation()}},true);
const endT=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null};sch.addEventListener('pointerup',endT,true);sch.addEventListener('pointercancel',endT,true);
sch.addEventListener('contextmenu',e=>{e.preventDefault();const h=hit(e);edit(h)});
function edit(h){const s=S();if(h.comp){const c=s.comps.find(q=>q.id===h.comp);if(c&&c.type!=='GND'){s.sel=c.id;openDlg({kind:'part',id:c.id})}}else if(h.dir){const d=s.dirs.find(q=>q.id===h.dir);openDlg({kind:'dir',text:d.text,dirId:d.id})}}
sch.addEventListener('pointerdown',e=>{const s=S();if(!s.open||e.button===2)return;const g=toGrid(e),h=hit(e);press={x:e.clientX,y:e.clientY,g,h,moved:false};
  if(e.pointerType!=='mouse')lp=setTimeout(()=>{if(press&&!press.moved){const hh=press.h;press=null;edit(hh)}},600);
  if(s.tool==='sel'&&h.comp){const c=s.comps.find(q=>q.id===h.comp);s.drag={kind:'move',id:c.id,ox:c.x-g[0],oy:c.y-g[1],sx:c.x,sy:c.y}}
  else if(s.tool==='sel'&&s.res&&nodeAt(g)){s.drag={kind:'probe2',at:g,from:nodeAt(g)}}
  else if(s.tool==='sel'&&!h.comp){s.drag={kind:'pan',sx:e.clientX,sy:e.clientY,vx:s.view.x,vy:s.view.y}}
  try{sch.setPointerCapture(e.pointerId)}catch(_){}});
sch.addEventListener('pointermove',e=>{const s=S();if(!s.open)return;const g=toGrid(e);if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>6){press.moved=true;clearTimeout(lp)}
  if(s.drag&&press&&press.moved){if(s.drag.kind==='move'){const c=s.comps.find(q=>q.id===s.drag.id);c.x=g[0]+s.drag.ox;c.y=g[1]+s.drag.oy}
    else if(s.drag.kind==='pan'){s.view.x=s.drag.vx-(e.clientX-s.drag.sx)/(U*s.view.s);s.view.y=s.drag.vy-(e.clientY-s.drag.sy)/(U*s.view.s)}
    else if(s.drag.kind==='probe2')s.drag.to=g;sch.innerHTML=schSVG();return}
  const old=JSON.stringify([s.ghost,s.hover]);s.ghost=g;
  if(s.tool==='sel'&&s.res){const h=hit(e);s.hover=h.comp?{kind:'I',at:g}:nodeAt(g)?{kind:'V',at:g}:null}else s.hover=null;
  if(JSON.stringify([s.ghost,s.hover])!==old&&s.tool!=='sel'||s.tool==='sel'&&s.res)sch.innerHTML=schSVG()});
sch.addEventListener('pointerup',e=>{clearTimeout(lp);const s=S();if(!s.open||!press)return;const p=press;press=null;const g=toGrid(e);const d=s.drag;s.drag=null;
  if(d&&p.moved){if(d.kind==='move'){BENCH.onRender()}if(d.kind==='probe2'){const b=nodeAt(g);if(b&&b!==d.from)addTrace(`V(${d.from},${b})`)}render();return}
  click(g,p.h,e)});
sch.addEventListener('wheel',e=>{e.preventDefault();const s=S();const [gx,gy]=toGrid(e,true);const k=e.deltaY<0?1.15:1/1.15;const ns=Math.min(3,Math.max(0.25,s.view.s*k));s.view.x=gx-(gx-s.view.x)*s.view.s/ns;s.view.y=gy-(gy-s.view.y)*s.view.s/ns;s.view.s=ns;render()},{passive:false});
function click(g,h,e){const s=S();
  if(s.tool==='place'){const c=newComp(s.ptool,g[0],g[1],s.ptool==='OA'?{model:s.pmodel||'OP747'}:null);render();BENCH.onRender();return}
  if(s.tool==='wire'){if(!s.wireA){s.wireA=g;render();return}const [ax,ay]=s.wireA,[bx,by]=g;if(ax!==bx||ay!==by){if(ax!==bx)s.wires.push({id:RT.uid++,x1:ax,y1:ay,x2:bx,y2:ay});if(ay!==by)s.wires.push({id:RT.uid++,x1:bx,y1:ay,x2:bx,y2:by})}s.wireA=null;render();BENCH.onRender();return}
  if(s.tool==='label'&&s.pend){s.labels.push({id:RT.uid++,x:g[0],y:g[1],name:s.pend.name});s.pend=null;setTool('sel');BENCH.onRender();return}
  if(s.tool==='dir'&&s.pend){s.dirs.push({id:RT.uid++,x:g[0],y:g[1],text:s.pend.text});s.pend=null;setTool('sel');BENCH.onRender();return}
  if(s.tool==='del'){const lb=s.labels.find(l=>l.x===g[0]&&l.y===g[1]);if(lb)s.labels=s.labels.filter(q=>q!==lb);else if(h.comp)s.comps=s.comps.filter(q=>q.id!==h.comp);else if(h.wire)s.wires=s.wires.filter(q=>q.id!==h.wire);else if(h.dir)s.dirs=s.dirs.filter(q=>q.id!==h.dir);render();BENCH.onRender();return}
  if(s.tool==='sel'){if(h.comp){s.sel=h.comp;const c=s.comps.find(q=>q.id===h.comp);if(s.res&&c&&c.name&&!e.ctrlKey)addTrace(`I(${c.name})`);render();return}
    const n=nodeAt(g);if(s.res&&n&&n!=='0'){addTrace(`V(${n})`);return}s.sel=null;render()}}
function addTrace(expr){const s=S();if(!evalTrace(expr)){BENCH.say('ما فيه نتائج لهذا');return}if(!s.traces.some(t=>t.expr===expr))s.traces.push({expr,c:s.traces.length});s.wavesOpen=true;render();BENCH.onRender()}
/* ---------- waveform pointer input ---------- */
wave.addEventListener('click',e=>{const s=S();const t=e.target;
  if(t.dataset.trx!=null){s.traces=s.traces.filter(x=>x.expr!==t.dataset.trx);if(s.avg===t.dataset.trx)s.avg=null;render();BENCH.onRender();return}
  if(t.dataset.tra!=null){s.avg=t.dataset.tra;render();BENCH.onRender();return}
  if(t.closest('[data-tr]')){const ex=t.closest('[data-tr]').dataset.tr;if(e.ctrlKey){s.avg=ex}else s.tsel=s.tsel===ex?null:ex;render();BENCH.onRender();return}
  if(t.dataset.avgx!=null){s.avg=null;render();return}
  if(t.dataset.wfit!=null){s.zoom=null;s.fitted=(s.fitted||0)+1;render();BENCH.onRender();return}
  if(t.dataset.wclose!=null){s.wavesOpen=false;render();return}});
let wbox=null;
wave.addEventListener('pointerdown',e=>{const s=S();if(!s.res||!e.target.closest('#pcWsvg'))return;const r=$('pcWsvg').getBoundingClientRect();wbox={a:[e.clientX-r.left,e.clientY-r.top]};try{wave.setPointerCapture(e.pointerId)}catch(_){}});
wave.addEventListener('pointermove',e=>{const s=S();const sv=$('pcWsvg');if(!s.res||!sv||!s._ax)return;const r=sv.getBoundingClientRect();const px=e.clientX-r.left,py=e.clientY-r.top;const A=s._ax;
  if(wbox){wbox.b=[px,py];s.box=wbox}else s.box=null;
  if(px>=A.L&&px<=A.L+A.pw&&py>=A.T&&py<=A.T+A.ph){const x=A.xa+(px-A.L)/A.pw*(A.xb-A.xa),y=A.yb-(py-A.T)/A.ph*(A.yb-A.ya);s.cross={px,py,txt:` · x = ${fmt(x,s.res.a.kind==='tran'?'s':'V')}  y = ${fmt(y)}`}}else s.cross=null;
  const pl=wave.querySelector('.pc-wplot');if(pl)pl.innerHTML=waveSVG();const sub=wave.querySelector('.pc-sub');if(sub)sub.innerHTML=(s.res.a.kind==='tran'?'.tran':'.dc '+s.res.a.src)+(s.cross?`<span class="pc-cur">${s.cross.txt}</span>`:'')});
wave.addEventListener('pointerup',e=>{const s=S();const b=wbox;wbox=null;s.box=null;if(!b||!b.b||!s._ax){return}const A=s._ax;if(Math.abs(b.b[0]-b.a[0])<8){render();return}
  const xv=px=>A.xa+(clamp(px,A.L,A.L+A.pw)-A.L)/A.pw*(A.xb-A.xa),yv=py=>A.yb-(clamp(py,A.T,A.T+A.ph)-A.T)/A.ph*(A.yb-A.ya);
  const x0=xv(Math.min(b.a[0],b.b[0])),x1=xv(Math.max(b.a[0],b.b[0]));const big=Math.abs(b.b[1]-b.a[1])>12;
  s.zoom={x0,x1,y0:big?yv(Math.max(b.a[1],b.b[1])):null,y1:big?yv(Math.min(b.a[1],b.b[1])):null};s.zooms=(s.zooms||0)+1;render();BENCH.onRender()});
/* ---------- keyboard ---------- */
function onKey(e){if(BENCH.sim!==SIM||BENCH.el.view.hidden)return;const s=S();if(s.dlg||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||''))return;const k=e.key;
  if(k==='Escape'){if(s.tool!=='sel'){setTool('sel');e.preventDefault();e.stopImmediatePropagation()}return}
  if(e.ctrlKey&&(k==='r'||k==='R')){e.preventDefault();act('rot');return}if(e.ctrlKey&&(k==='e'||k==='E')){e.preventDefault();if(s.res&&!wave.hidden&&s.tool==='sel'&&!s.sel){s.zoom=null;s.fitted=(s.fitted||0)+1;render();BENCH.onRender()}else act('mir');return}
  if(e.ctrlKey&&(k==='s'||k==='S')){e.preventDefault();act('save');return}if(e.ctrlKey)return;
  const map={r:'R',c:'C',l:'L',d:'D',g:'GND',F2:'comp',F3:'wire',F4:'label',F5:'del',s:'dir',Delete:'del'};const a=map[k]||map[k.toLowerCase&&k.toLowerCase()];
  if(k==='Delete'&&s.tsel&&s.res){s.traces=s.traces.filter(t=>t.expr!==s.tsel);s.tsel=null;render();BENCH.onRender();return}
  if(a){e.preventDefault();act(a)}}
addEventListener('keydown',onKey);
new ResizeObserver(()=>{if(BENCH.sim===SIM)render()}).observe(app);new ResizeObserver(()=>{if(BENCH.sim===SIM)layoutCard()}).observe(BENCH.el.card);
/* ---------- experiment hooks ---------- */
fresh();
Object.assign(RT,{nets,fromSchematic,run,evalTrace,evalOn,analysis,stepParam,directives,hasLib,pinsOf,act,click,toPx,
  /* client coordinates of a grid point (used by the step checks' "show me" and by the tests) */
  client:(gx,gy)=>{const r=sch.getBoundingClientRect(),v=S().view;return [r.left+(gx-v.x)*U*v.s,r.top+(gy-v.y)*U*v.s]},
  /* simulate SPICE text directly (reference circuits of the experiment), same solver as the editor */
  sim:text=>simulate(parseNetlist(text))});
const X=def.setup(RT);
const SIM={regions:{pc:[0,0,1,1]},names:{pc:['LTspice','الكمبيوتر']},tray:[],icon:()=>'',trayDown:()=>{},isWire:()=>false,armed:()=>null,
  status:X.status||(()=>({})),P:{},steps:X.steps||[],reset(){fresh();X.onReset&&X.onReset();render()},render:()=>render(),RT,pc:true,
  focus(k){const el=app.querySelector(`[data-pc="${k}"]`)||app.querySelector('.pc-tools');if(!el)return;el.classList.add('pc-flash');setTimeout(()=>el.classList.remove('pc-flash'),1400)}};
BENCH.register(SIM);
/* short screens (phone landscape): the step card starts minimised so the editor keeps its room */
if(innerHeight<=520){BENCH.el.card.classList.add('min');BENCH.el.card.dataset.key=''}
render();
};
