/* EE312 · Experiment 7 · Terminal Characteristics of the Enhancement N-MOSFET (manual v8.8 pp. 51–56).
   Procedure A: VGS(TH) at VRD = 0.25 V (Fig. 7.1a, gate tied to drain, current limit 0.100 A).
   Procedure B: iD–vDS curves (Fig. 7.1b, second supply unit on the gate) at VGS(TH) + 0.15 / 0.30 / 0.45 V,
   VDS = 0.05 … 3 V (Table 7.1). Procedure C: VDD = 10 V, VGS = VGS(TH) + 0.3 V, RD = 270 Ω / 470 Ω / 1 kΩ (Table 7.2).
   Steps follow the manual one by one (A 1–5, B 1–6, C 1–6); build steps are checked by circuit equivalence
   (engine/match.js), the readings by the circuit's topology (no node numbers). The figures' reference wiring is in the
   lab's rectangle layout: VDD down the left column (+ top-left, − bottom-left), the top row to RD, RD down to the drain,
   the IRF620 across the middle row (G D S), the source back along the bottom row; the VGS unit from the gate down to the
   bottom row; DMM 1 across RD, DMM 2 across G–S (Fig. 7.1a) or D–S (Figs. 7.1b/c).
   Assumptions: two MT3805 meters (DMM 1 on RD for VRD, DMM 2 on G–S / D–S; either meter may take either place); the IRF620
   sits on three neighbouring nodes in the order G D S (TO-220 seen from the front); RD values for Procedure C (270 Ω,
   470 Ω) are on the bench although the materials list names only the 1 kΩ; Procedure C step 1 sets VDD and VGS with the
   1 kΩ still in place, step 2 then swaps RD to 270 Ω (the manual's order).
   Batch 7 item 3: every step split into its sub-steps with its own "do it for me" (supply knobs COARSE then FINE, the
   current limit, meters to DCV, the gate–drain tie pulled out, the Table 7.1 sweeps by V_DD with a capture per row). */
EXP_DEFS['ee312/exp7']=(()=>{const H=ENGINE.sheet;
const VDS=[0.05,0.1,0.15,0.3,0.45,0.75,1.5,3];const RDS=[['R270',270],['R470',470],['R1k',1000]];
const t71=`<table class="tbl"><caption>Table 7.1 · I<sub>D</sub> (mA) = V<sub>RD</sub> (V) with R<sub>D</sub> = 1 kΩ</caption>
<tr><th rowspan="2">V<sub>DS</sub> (V)</th>${[1,2,3].map(k=>`<th>V<sub>GS${k}</sub> = V<sub>GS(TH)</sub> + ${(0.15*k).toFixed(2)} V</th>`).join('')}</tr>
<tr>${[1,2,3].map(()=>`<th>I<sub>D</sub> (mA) = V<sub>RD</sub> (V)</th>`).join('')}</tr>
<tr><td>0.00</td><td>0.000</td><td>0.000</td><td>0.000</td></tr>
${VDS.map((v,j)=>`<tr><td>${v.toFixed(2)}</td>${[1,2,3].map(k=>`<td>${H.num(`b${k}_${j}`,'0.001')}</td>`).join('')}</tr>`).join('')}</table>`;
const t72=`<table class="tbl"><caption>Table 7.2 · V<sub>GS</sub> = V<sub>GS(TH)</sub> + 0.3 V, V<sub>DD</sub> = 10 V (fixed)</caption>
<tr><th>R<sub>D</sub></th>${RDS.map(([,r])=>`<th>${r<1000?r+' Ω':'1 kΩ'}</th>`).join('')}</tr>
<tr><th>V<sub>RD</sub> (V)</th>${RDS.map((_,i)=>`<td>${H.num('c_vrd'+i,'0.001')}</td>`).join('')}</tr>
<tr><th>I<sub>D</sub> = V<sub>RD</sub>/R<sub>D</sub> (mA)</th>${RDS.map((_,i)=>`<td>${H.num('c_id'+i,'0.001')}</td>`).join('')}</tr>
<tr><th>V<sub>DS</sub> (V)</th>${RDS.map((_,i)=>`<td>${H.num('c_vds'+i,'0.001')}</td>`).join('')}</tr></table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq" data-proc="B">Plot i<sub>D</sub> (mA) vs. v<sub>DS</sub> (V) for each v<sub>GS</sub> (your Table 7.1). <button class="t" id="plotBtn" type="button">ارسم من جدولك</button><div id="ivplot"></div>
  <div>${H.row('iii. Voltage-controlled current source region:',H.sel('q1c',[['sat','Saturation'],['tri','Triode'],['cut','Cutoff']]))}${H.row('iv. Voltage-controlled resistance region:',H.sel('q1d',[['sat','Saturation'],['tri','Triode'],['cut','Cutoff']]))}</div></li>
<li class="plq" data-proc="B">r<sub>o</sub> = Δv<sub>DS</sub>/Δi<sub>D</sub> between V<sub>DS1</sub> = 1.5 V and V<sub>DS2</sub> = 3 V, for each curve.
  <div>${[1,2,3].map(k=>H.row(`r<sub>o</sub> (V<sub>GS${k}</sub>) =`,H.num('q2_'+k,'0.01'),'kΩ')).join('')}</div></li>
<li class="plq" data-proc="B">r<sub>DS</sub> = Δv<sub>DS</sub>/Δi<sub>D</sub> between V<sub>DS1</sub> = 0 V and V<sub>DS2</sub> = 0.05 V, for each curve.
  <div>${[1,2,3].map(k=>H.row(`r<sub>DS</sub> (V<sub>GS${k}</sub>) =`,H.num('q3_'+k,'0.1'),'Ω')).join('')}</div></li>
<li class="plq" data-proc="B">How do r<sub>o</sub> and r<sub>DS</sub> change with V<sub>OV</sub>?
  <div>${H.sel('q4',[['a','Both decrease as VOV increases (ro = 1/λID with a larger ID; rDS = 1/(kn′(W/L)VOV))'],['b','Both increase as VOV increases'],['c','ro increases, rDS decreases'],['d','Neither depends on VOV']])}</div></li>
<li class="plq">Procedure C:
  <div>${H.row('i. Why does i<sub>D</sub> stay almost constant?',H.sel('q5a',[['a','In saturation iD is set by vGS (current source); vDS has only a weak effect through λ'],['b','The supply is in constant-current (CC) mode'],['c','RD is too small to matter'],['d','The MOSFET is cut off']]))}
  ${H.row('ii. R<sub>D(max)</sub> = (V<sub>DD</sub> − V<sub>OV</sub>) / I<sub>D</sub> =',H.num('q5b','1'),'Ω')}
  ${H.row('iii. Region beyond R<sub>D(max)</sub>:',H.sel('q5c',[['tri','Triode'],['sat','Saturation'],['cut','Cutoff']]))}</div></li></ol>`;
/* the figures' reference wiring (rectangle layout, 7-column panel): VDD + 8, − 22; top row 8–10; RD 10 → 17 (drain);
   IRF620 G 16, D 17, S 18; S 18 → 25 and the bottom row 25–22; VGS unit + on the gate 16, − on 23 */
const FET=[{ic:'IRF620',pins:{G:16,D:17,S:18}},{wire:[8,9]},{wire:[9,10]},{wire:[18,25]},{wire:[25,24]},{wire:[24,23]},{wire:[23,22]},
  {lead:'Lp',alt:'Rp',at:8},{lead:'Lm',alt:'Rm',at:22},{lead:'mh',alt:'m2h',at:10},{lead:'ml',alt:'m2l',at:17}];
const FB=rd=>[...FET,{part:[rd,10,17]},{lead:'Rp',alt:'Lp',at:16},{lead:'Rm',alt:'Lm',at:23},{lead:'m2h',alt:'mh',at:17},{lead:'m2l',alt:'ml',at:24}];
const F71='labs/ee312/fig/fig7-1.png';
const figs={'7.1a':{img:F71,cap:'Fig. 7.1a · gate tied to drain, R<sub>D</sub> = 1 kΩ',lines:[...FET,{part:['R1k',10,17]},{wire:[16,17]},{lead:'m2h',alt:'mh',at:16},{lead:'m2l',alt:'ml',at:23}]},
  '7.1b':{img:F71,cap:'Fig. 7.1b · V<sub>GS</sub> unit between G and S, R<sub>D</sub> = 1 kΩ',lines:FB('R1k')},
  '7.1c-270':{img:F71,cap:'Fig. 7.1c · R<sub>D</sub> = 270 Ω',lines:FB('R270')},
  '7.1c-470':{img:F71,cap:'Fig. 7.1c · R<sub>D</sub> = 470 Ω',lines:FB('R470')},
  '7.1c-1k':{img:F71,cap:'Fig. 7.1c · R<sub>D</sub> = 1 kΩ',lines:FB('R1k')}};
return {figs,procs:[{id:'A',title:'Threshold voltage V<sub>GS(TH)</sub>: Fig. 7.1a'},{id:'B',title:'i<sub>D</sub>–v<sub>DS</sub> curves: Fig. 7.1b (Table 7.1)'},{id:'C',title:'The MOSFET as a current source: Fig. 7.1c (Table 7.2)'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 7 · Terminal Characteristics of Enhancement N-MOSFET</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig7-1.png" alt="Fig. 7.1"></div>
<div class="hint" style="text-align:center">Fig. 7.1 · (a) V<sub>GS(TH)</sub> (b) i<sub>D</sub>–v<sub>DS</sub> (c) current source · IRF620 (TO-220: G D S from the left, front view), R<sub>D</sub> = 1 kΩ</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">جهاز DMM واحد: انقل أطرافه بين R<sub>D</sub> (V<sub>RD</sub>) و D–S (V<sub>DS</sub>) و G–S (V<sub>GS</sub>). V<sub>GS</sub> في Procedure B و C تنحسب من V<sub>GS(TH)</sub> اللي قسته أنت.</p>
<div data-proc="A">${H.row('V<sub>GS(TH)</sub> =',H.num('a_vth','0.001'),'V')}</div>
<div data-proc="B">${t71}</div><div data-proc="C">${t72}</div>${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'psu',prev:d=>{d.u[0].v=12;d.u[0].ilim=0.5;d.u[1].v=5;d.u[1].ilim=1}},
  {type:'dmm',n:1,prev:d=>{d.fn='OHM'}},
  {type:'dmm',n:2,prev:d=>{d.fn='DIODE'}}],
parts:{IRF620:{t:'FET',pkg:'TO220',mark:'IRF620',lab:'IRF620',pins:[{n:'G',dx:0,dy:0,h:1,role:'g'},{n:'D',dx:1,dy:0,h:1,role:'d'},{n:'S',dx:2,dy:0,h:1,role:'s'}],
    stamp:(els,R,inner,p)=>{els.push({t:'FET',d:R.d,g:R.g,s:R.s,m:SOLVER.MODELS.irf620,pid:p.id},{t:'D',a:R.s,b:R.d,f:SOLVER.diodeSi,pid:p.id})}},
  R1k:{t:'R',r:1000,lab:'1kΩ'},R470:{t:'R',r:470,lab:'470Ω'},R270:{t:'R',r:270,lab:'270Ω'},BR:{t:'BR',lab:''}},
tray:[['IRF620','IRF620'],['R1k','1 kΩ'],['R470','470 Ω'],['R270','270 Ω'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,F=SOLVER.MODELS.irf620,A=Math.abs;
  /* reference VGS(TH): gate tied to drain, RD = 1 kΩ, VRD = 0.25 V */
  const vthRef=(()=>{const pt=v=>{const r=SOLVER.point({n:2,els:[{t:'DC',a:0,b:-1,v,ilim:0.1,r:0.02},{t:'G',a:0,b:1,g:1e-3},{t:'G',a:1,b:-1,g:1e-7},{t:'FET',d:1,g:1,s:-1,m:F}],dcs:[0]},0);return [r.x[0]-r.x[1],r.x[1]]};
    let lo=2,hi=5;for(let i=0;i<50;i++){const m=(lo+hi)/2;if(pt(m)[0]<0.25)lo=m;else hi=m}return pt(lo)[1]})();
  const RES=['R1k','R470','R270'];
  /* circuit on the panel: FET pins, the RD between a unit's + and the drain, that unit's − on the source */
  function circuit(){const f=RT.parts('FET');if(f.length!==1)return null;const fet=f[0];const n={d:RT.pinNet(fet,'d'),g:RT.pinNet(fet,'g'),s:RT.pinNet(fet,'s')};if(n.d==null||n.s==null||n.d===n.s)return null;
    const U=[0,1].map(u=>({u,P:RT.leadNet(u?'Rp':'Lp'),N:RT.leadNet(u?'Rm':'Lm')}));const c={n,fet,kind:null};
    for(const x of U){if(x.N!==n.s||x.P==null||x.P===n.d)continue;const rd=RT.between(x.P,n.d).filter(b=>RES.includes(b.p.type));if(rd.length!==1||RT.at(n.d).filter(p=>p!==fet).length!==1)continue;
      c.vdd=x;c.rd=rd[0].p;c.R=RT.PARTS[c.rd.type].r;
      if(n.g===n.d){c.kind='A';break}
      const o=U[1-x.u];if(o.P===n.g&&o.N===n.s&&n.g!=null){c.kind='B';c.vgs=o;break}}
    return c}
  const ST={b:{},c:{}};let st0={};
  /* two meters: DMM 1 on R_D (V_RD), DMM 2 on G–S (V_GS) or D–S (V_DS); any meter on the right nodes counts */
  function status(){const S=RT.S,P=S.psu;const c=circuit();const st={kind:c&&c.kind,c};
    const across=(a,b)=>RT.meterOn(a,b);
    const unitOn=x=>x&&P.pwr&&S.psu.u[x.u].on;st.vddOn=!!(c&&unitOn(c.vdd));st.vgsOn=!!(c&&c.vgs&&unitOn(c.vgs));
    if(c&&c.kind){const n=c.n;const V=RT.nodeV;st.vrd=V(c.vdd.P)-V(n.d);st.vds=V(n.d)-V(n.s);st.vgs=V(n.g)-V(n.s);
      st.ilim=Math.abs(S.psu.u[c.vdd.u].ilim-0.1)<5e-4;
      const onRD=across(c.vdd.P,n.d),onDS=across(n.d,n.s),onGS=across(n.g,n.s);
      if(c.kind==='A'&&st.vddOn&&st.ilim&&A(st.vrd-0.25)<=0.005){if(onRD)ST.vrd=true;if(onGS&&ST.vrd)ST.vth=A(onGS.val)}
      if(c.kind==='B'&&ST.vth!=null&&st.vddOn&&st.vgsOn){
        if(c.R===1000)[1,2,3].forEach(k=>{if(A(st.vgs-(ST.vth+0.15*k))>0.006)return;st.curve=k;const j=VDS.findIndex(v=>A(st.vds-v)<=0.006);if(j<0)return;st.live={k,j,vrd:onRD?A(onRD.val):null};ST.b[k]=ST.b[k]||{};if(onRD){const x=A(onRD.val),o=ST.b[k][j];ST.b[k][j]=o?{lo:Math.min(o.lo,x),hi:Math.max(o.hi,x)}:{lo:x,hi:x}}});
        if(A(st.vgs-(ST.vth+0.3))<=0.006&&A(S.psu.u[c.vdd.u].v-10)<0.006){st.cset=true;const i=RDS.findIndex(x=>x[0]===c.rd.type);ST.c[i]=ST.c[i]||{};if(onRD)ST.c[i].vrd=A(onRD.val);if(onDS)ST.c[i].vds=A(onDS.val)}}}
    const anyOn=P.pwr&&P.u.some(u=>u.on);
    if(ST.vth!=null&&!anyOn)ST.offA=true;
    st.curveDone=k=>VDS.every((_,j)=>ST.b[k]&&ST.b[k][j]!=null);if(st.curveDone(3)&&!anyOn)ST.offB=true;
    st.cDone=i=>ST.c[i]&&ST.c[i].vrd!=null&&ST.c[i].vds!=null;if(st.cDone(2)&&!anyOn)ST.offC=true;
    st0=st;return st}
  function plot(){const W=420,Hh=250,X=v=>36+v/3.1*(W-50),mx=Math.max(1,...[1,2,3].flatMap(k=>VDS.map((_,j)=>G.v(`b${k}_${j}`)).filter(isFinite)))*1.1,Y=i=>Hh-24-i/mx*(Hh-40);
    let s=`<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;background:#fff;border:1px solid var(--line);border-radius:8px;direction:ltr" font-family="IBM Plex Mono, monospace" font-size="10">`;
    s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(3.1)}" y2="${Y(0)}" stroke="#555"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(mx)}" stroke="#555"/>`;
    [0.5,1,1.5,2,2.5,3].forEach(v=>s+=`<text x="${X(v)}" y="${Y(0)+13}" text-anchor="middle">${v}</text>`);s+=`<text x="${X(3.1)-8}" y="${Y(0)-6}" text-anchor="end">vDS (V)</text><text x="${X(0)+4}" y="${Y(mx)+10}">iD (mA)</text>`;
    [[1,'#c43a2e'],[2,'#2c7a6b'],[3,'#2f5fb3']].forEach(([k,col])=>{const pts=[[0,0],...VDS.map((v,j)=>[v,G.v(`b${k}_${j}`)]).filter(p=>isFinite(p[1]))];s+=`<polyline fill="none" stroke="${col}" stroke-width="2" points="${pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')}"/>`;const l=pts[pts.length-1];s+=`<text x="${X(l[0])-4}" y="${Y(l[1])-5}" fill="${col}" text-anchor="end">VGS${k}</text>`});
    $('ivplot').innerHTML=s+'</svg>'}
  $('plotBtn').addEventListener('click',plot);
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const tl=e=>Math.max(0.004,A(e)*0.004);
    g.proc('A');g.add(G.near(v('a_vth'),vthRef,0.01)&&ST.vth!=null&&G.near(v('a_vth'),ST.vth,0.004),'VGS(TH)',`≈ ${vthRef.toFixed(3)} V at VRD = 0.25 V`);
    g.proc('B');[1,2,3].forEach(k=>{const bad=[];VDS.forEach((vd,j)=>{const e=ST.b[k]&&ST.b[k][j];if(e==null){bad.push(`${vd} V: ما انقاس`);return}const x=A(v(`b${k}_${j}`));
      /* with DMM 1 left on R_D, every reading seen while V_DS sat in this row's window counts */if(!(x>=e.lo-tl(e.lo)&&x<=e.hi+tl(e.hi)))bad.push(`${vd} V ≈ ${((e.lo+e.hi)/2).toFixed(3)}`)});
      g.add(!bad.length,`Table 7.1 · VGS${k}`,bad.slice(0,3).join('، ')+(bad.length>3?` … (+${bad.length-3})`:''))});
    g.proc('C');RDS.forEach(([,R],i)=>{const e=ST.c[i]||{};const ok=e.vrd!=null&&e.vds!=null&&G.near(v('c_vrd'+i),e.vrd,tl(e.vrd))&&G.near(v('c_vds'+i),e.vds,tl(e.vds))&&G.near(v('c_id'+i),v('c_vrd'+i)/R*1e3,Math.max(0.004,A(v('c_vrd'+i)/R*1e3)*0.004));
      g.add(ok,`Table 7.2 · RD = ${R} Ω`,e.vrd!=null?`VRD ≈ ${e.vrd.toFixed(3)}, ID = VRD/RD, VDS ≈ ${e.vds!=null?e.vds.toFixed(3):'?'}`:'ما انقاس')});
    g.proc('B');g.add(G.s('q1c')==='sat'&&G.s('q1d')==='tri','PLQ 1','saturation = current source, triode = resistance');
    [1,2,3].forEach(k=>{const id=j=>v(`b${k}_${j}`);const ro=(3-1.5)/(id(7)-id(6));const rds=0.05/(id(0)*1e-3);
      g.add(isFinite(ro)&&ro>0&&G.near(v('q2_'+k),ro,ro*0.03),`PLQ 2 ro (VGS${k})`,`= 1.5 V / (ID(3 V) − ID(1.5 V)) ≈ ${isFinite(ro)?ro.toFixed(2):'?'} kΩ`);
      g.add(isFinite(rds)&&G.near(v('q3_'+k),rds,rds*0.03),`PLQ 3 rDS (VGS${k})`,`= 0.05 V / ID(0.05 V) ≈ ${isFinite(rds)?rds.toFixed(1):'?'} Ω`)});
    g.add(G.s('q4')==='a','PLQ 4');g.proc('C');g.add(G.s('q5a')==='a','PLQ 5 i');
    const idc=v('c_id0')*1e-3,rmax=(10-0.3)/idc;g.add(isFinite(rmax)&&G.near(v('q5b'),rmax,rmax*0.03),'PLQ 5 ii',`= (10 − 0.3) / ID ≈ ${isFinite(rmax)?rmax.toFixed(0):'?'} Ω`);
    g.add(G.s('q5c')==='tri','PLQ 5 iii','triode');
    g.show($('result'))});
  const pts=k=>VDS.filter((_,j)=>ST.b[k]&&ST.b[k][j]!=null).length;
  /* Capture (Manual): Table 7.1 row j of curve k = DMM 1's V_RD while V_DS sits on that row's value */
  const rowRec=k=>VDS.map((vd,j)=>({to:`b${k}_${j}`,val:()=>st0.live&&st0.live.k===k&&st0.live.j===j?st0.live.vrd:null,unit:'V',dec:3,label:`V<sub>DS</sub> = ${vd.toFixed(2)} V`,
    none:`اضبط V<sub>DD</sub> لين V<sub>DS</sub> = ${vd.toFixed(2)} V، والـ DMM على R<sub>D</sub> و D–S`}));
  const cRec=i=>[{to:'c_vrd'+i,val:()=>ST.c[i]&&ST.c[i].vrd,unit:'V',dec:3,label:'V<sub>RD</sub>'},{to:'c_id'+i,val:()=>ST.c[i]&&ST.c[i].vrd!=null?ST.c[i].vrd/RDS[i][1]*1e3:null,unit:'mA',dec:3,label:'I<sub>D</sub>'},
    {to:'c_vds'+i,val:()=>ST.c[i]&&ST.c[i].vds,unit:'V',dec:3,label:'V<sub>DS</sub>'}].map(t=>({...t,none:'خلّ DMM على R<sub>D</sub> و DMM على D–S، والمصدر مضبوط'}));
  /* "do it for me" helpers (Batch 7 item 3): the V_DD unit (the one feeding R_D) and the V_GS unit (Fig. 7.1b), their knobs
     COARSE then FINE (as in Exp 1), and the meters on R_D, D–S and G–S switched on and set to DCV */
  const P=()=>RT.S.psu,uKey=u=>u?'R':'L';
  const VD=()=>{const c=circuit();return c&&c.vdd?c.vdd.u:(RT.leadNet('Rp')!=null&&RT.leadNet('Lp')==null?1:0)};
  const VG=()=>{const c=circuit();return c&&c.vgs?c.vgs.u:1-VD()};
  const knobTo=async(A,u,get,t,tol,done)=>{let fineOnly=false;for(let i=0;i<500;i++){if(done&&done())return;const x=get();if(x==null)return;const e=x-t;if(Math.abs(e)<=tol)return;
      const k='p:'+u+(fineOnly?'VF':'VC')+(e<0?'+':'-');await A.tap(k,fineOnly?35:90);
      if(!fineOnly){const y=get();if(y==null)return;if(Math.abs(y-t)>=Math.abs(e)||Math.sign(y-t)!==Math.sign(e)&&Math.abs(y-t)>tol){if(Math.abs(y-t)>=Math.abs(e))await A.tap('p:'+u+'VC'+(e<0?'-':'+'),90);fineOnly=true}}}};
  const setU=(A,u,v,tol=0.004)=>knobTo(A,uKey(u),()=>P().u[u].v,v,tol);
  const ilimTo=async(A,u,t)=>{const U=P().u[u];for(let q=0;q<200&&Math.abs(U.ilim-t)>=5e-4;q++)await A.tap('p:'+uKey(u)+'I'+(U.ilim<t?'+':'-'),40)};
  const pwrOn=async A=>{if(!P().pwr)await A.press('p:PWR')};
  const unitsOn=async(A,us)=>{await pwrOn(A);for(const u of us)if(!P().u[u].on)await A.press('p:'+uKey(u)+'ON')};
  const pwrOff=async A=>{if(P().pwr)await A.press('p:PWR')};
  const meterAt=(a,b)=>a==null||b==null?null:RT.meters().find(m=>m.hi===a&&m.lo===b||m.hi===b&&m.lo===a);
  const dcvOn=(a,b)=>{const m=meterAt(a,b);return !!m&&m.D.pwr&&m.D.fn==='DCV'};
  const dcv=async(A,a,b)=>{const m=meterAt(a,b);if(!m)return;const p=m.key==='dmm2'?'m2':'m';if(!RT.S[m.key].pwr)await A.press(p+':PWR');if(RT.S[m.key].fn!=='DCV')await A.press(p+':DCV')};
  const nets=()=>{const c=circuit();return c&&c.kind?{rd:[c.vdd.P,c.n.d],ds:[c.n.d,c.n.s],gs:[c.n.g,c.n.s]}:null};
  const onPair=w=>()=>{const n=nets();return !!n&&dcvOn(...n[w])};
  const measPair=(w,fig)=>async A=>{if(!onPair(w)()&&fig)await A.connect(fig);const n=nets();if(n)await dcv(A,...n[w])};
  const vgsSet=k=>s=>s.kind==='B'&&ST.vth!=null&&A(P().u[s.c.vgs.u].v-(ST.vth+0.15*k))<=0.006;
  const vgsTo=k=>A2=>ST.vth==null?null:setU(A2,VG(),+(ST.vth+0.15*k).toFixed(2),0.005);
  /* Table 7.1, one curve: V_DD turned until V_DS sits on each row's value, then DMM 1's V_RD captured */
  const sweep=k=>async A2=>{for(let j=0;j<VDS.length;j++){await knobTo(A2,uKey(VD()),()=>{const s=A2.st();return s.kind==='B'?s.vds:null},VDS[j],0.005,()=>{const s=A2.st();return !!(s.live&&s.live.k===k&&s.live.j===j&&s.live.vrd!=null)});
      A2.st();A2.capture()}};
  const offAll=async A2=>pwrOff(A2);
  return {status,
    steps:[
      /* Procedure A (manual p. 54); every step split into its sub-steps (Batch 7 item 3) */
      {dev:'board',build:'7.1a',t:'Procedure A · 1. وصّل الدائرة Fig. 7.1a واستخدم IRF620 كـ MOSFET.',subs:[
        {k:'build',fig:'7.1a',t:'وصّل الدائرة <bdi dir="ltr">Fig. 7.1a</bdi>: IRF620، الـ gate موصول بالـ drain، R<sub>D</sub> = 1 kΩ.'}]},
      {dev:'psu',t:'2. شغّل الـ dc supply. بـ CURRENT خلّ حد التيار 0.100 A، وبعدها اضغط مفتاح الـ dc على ON.',subs:[
        {k:'set',dev:'psu',t:'شغّل مفتاح ∼ POWER.',ok:()=>P().pwr,do:pwrOn,hint:'مفتاح ∼ POWER تحت يمين المصدر'},
        {k:'set',dev:'psu',t:'بالـ CURRENT خلّ حد التيار 0.100 A.',ok:s=>s.kind==='A'&&s.ilim,do:A2=>ilimTo(A2,VD(),0.1),hint:'لف CURRENT حق الوحدة اللي على الدائرة لين 0.100 A'},
        {k:'set',dev:'psu',t:'شغّل مفتاح الـ dc ⎓ ON.',ok:s=>s.kind==='A'&&s.vddOn&&s.ilim,do:A2=>unitsOn(A2,[VD()]),hint:'مفتاح الـ dc تحت الوحدة'}]},
      {dev:'psu',t:'3. غيّر جهد المصدر لين V<sub>RD</sub> يصير 0.25 V، يعني تيار drain = 250 µA.',subs:[
        {k:'measure',dev:'dmm',t:'الـ DMM اللي على R<sub>D</sub> (DMM 1) على DCV عشان تقرا V<sub>RD</sub>.',ok:onPair('rd'),do:measPair('rd','7.1a'),hint:'شغّل الـ DMM اللي على R<sub>D</sub> واختر DCV'},
        {k:'set',dev:'psu',t:'بالـ COARSE و FINE خلّ V<sub>RD</sub> = 0.25 V.',ok:()=>!!ST.vrd,do:A2=>knobTo(A2,uKey(VD()),()=>{const s=A2.st();return s.kind==='A'?s.vrd:null},0.25,0.005,()=>!!ST.vrd),
          hint:s=>`V<sub>RD</sub> الحين ${s.vrd!=null?s.vrd.toFixed(3)+' V':'؟'}: لف COARSE ثم FINE لين 0.250 V`}]},
      {dev:'dmm2',t:'4. بالـ DMM قيس V<sub>GS</sub> اللي تقابلها وسجّلها: هذي القيمة اسمها في الـ datasheets V<sub>GS(TH)</sub>.',subs:[
        {k:'measure',dev:'dmm2',t:'الـ DMM الثاني (DMM 2) على G–S على DCV.',ok:onPair('gs'),do:measPair('gs','7.1a'),hint:'شغّل الـ DMM اللي بين الـ gate والـ source واختر DCV'},
        {k:'rec',t:'سجّل V<sub>GS(TH)</sub>.',ok:()=>ST.vth!=null,rec:[{to:'a_vth',val:()=>ST.vth,unit:'V',dec:3,label:'V<sub>GS(TH)</sub>'}]}]},
      {dev:'psu',t:'5. طفّ الـ dc power supply.',subs:[
        {k:'set',dev:'psu',t:'طفّ الـ dc supply (∼ POWER).',ok:()=>!!ST.offA,do:offAll,hint:'مفتاح ∼ POWER أو مفتاح الـ dc'}]},
      /* Procedure B (manual p. 55) */
      {dev:'board',build:'7.1b',t:'Procedure B · 1. شيل التوصيلة بين الـ drain والـ gate، ووصّل الوحدة الثانية من الـ dc power supply بين الـ gate والـ source (Fig. 7.1b).',subs:[
        {k:'set',dev:'board',t:'شيل التوصيلة بين الـ drain والـ gate.',ok:()=>{const f=RT.parts('FET');if(f.length!==1)return false;const g=RT.pinNet(f[0],'g'),d=RT.pinNet(f[0],'d');return !!ST.offA&&(g==null||g!==d)},
          do:async A2=>{const f=RT.parts('FET')[0];if(!f){await A2.build('7.1b');return}const S=RT.S,g=RT.pinNet(f,'g'),d=RT.pinNet(f,'d');const tie=(a,b)=>a===g&&b===d||a===d&&b===g;
            S.parts=S.parts.filter(p=>!(RT.PARTS[p.type]&&RT.PARTS[p.type].t==='BR'&&tie(...RT.partNets(p))));S.wires=S.wires.filter(w=>!(w.b!=null&&tie(RT.netOf(w.a),RT.netOf(w.b))));RT.dirty=true;RT.render();
            const g2=RT.pinNet(f,'g');if(g2!=null&&g2===RT.pinNet(f,'d'))await A2.build('7.1b')},hint:'شيل الـ bridging plug (أو السلك) اللي بين الـ gate والـ drain'},
        {k:'connect',fig:'7.1b',t:'وصّل الوحدة الثانية بين الـ gate (+) والـ source (−)، وانقل DMM 2 على D–S.',
          /* the free unit by name (no alt: the V_DD unit's − on the source must not stand in for the gate unit's −) */
          do:async A2=>{const g=uKey(VG());await A2.connect({...figs['7.1b'],lines:figs['7.1b'].lines.map(l=>l.lead==='Rp'&&l.at===16?{lead:g+'p',at:16}:l.lead==='Rm'&&l.at===23?{lead:g+'m',at:23}:l)})}}]},
      {dev:'psu',t:'2. بوحدة من المصدر، اضبط V<sub>GS</sub> على V<sub>GS(TH)</sub> + 0.15 V وثبّتها.',subs:[
        {k:'set',dev:'psu',t:'بوحدة V<sub>GS</sub> (COARSE ثم FINE) خلّ الجهد V<sub>GS(TH)</sub> + 0.15 V.',ok:vgsSet(1),do:vgsTo(1),hint:s=>ST.vth!=null?`المطلوب ${(ST.vth+0.15).toFixed(2)} V على الوحدة اللي بين الـ gate والـ source`:'قيس V<sub>GS(TH)</sub> في Procedure A أول'},
        {k:'set',dev:'psu',t:'شغّل المصدر ومفتاح الـ dc حق الوحدتين.',ok:s=>s.kind==='B'&&s.vgsOn&&s.vddOn&&s.curve===1,do:A2=>unitsOn(A2,[VG(),VD()]),hint:'∼ POWER ومفتاح الـ dc حق كل وحدة'}]},
      {dev:'psu',t:'3. بالوحدة الثانية غيّر V<sub>DD</sub> لين توصل لقيم V<sub>DS</sub> اللي في Table 7.1. لكل V<sub>DS</sub> قيس V<sub>RD</sub> وسجّلها؛ I<sub>D</sub> تطلع من Ohm\'s law.',subs:[
        {k:'measure',dev:'dmm',t:'DMM 1 على R<sub>D</sub> (V<sub>RD</sub>) و DMM 2 على D–S (V<sub>DS</sub>)، الاثنين على DCV.',ok:()=>onPair('rd')()&&onPair('ds')(),do:async A2=>{await measPair('rd','7.1b')(A2);await measPair('ds','7.1b')(A2)},hint:'الـ DMM اللي على R<sub>D</sub> والـ DMM اللي على D–S: شغّلهم واختر DCV'},
        {k:'rec',t:'لكل V<sub>DS</sub> في Table 7.1: اضبط V<sub>DD</sub> وسجّل V<sub>RD</sub>.',ok:()=>pts(1)===VDS.length,rec:rowRec(1),do:sweep(1)}]},
      {dev:'psu',t:'4. زِد V<sub>GS</sub> بـ 0.15 V، وكرّر خطوة 3 و V<sub>GS</sub> ثابتة.',subs:[
        {k:'set',dev:'psu',t:'زِد V<sub>GS</sub> إلى V<sub>GS(TH)</sub> + 0.30 V.',ok:vgsSet(2),do:vgsTo(2),hint:s=>ST.vth!=null?`المطلوب ${(ST.vth+0.3).toFixed(2)} V`:''},
        {k:'rec',t:'لكل V<sub>DS</sub> في Table 7.1: اضبط V<sub>DD</sub> وسجّل V<sub>RD</sub>.',ok:()=>pts(2)===VDS.length,rec:rowRec(2),do:sweep(2)}]},
      {dev:'psu',t:'5. زِد V<sub>GS</sub> بـ 0.15 V ثانية، وكرّر خطوة 3 و V<sub>GS</sub> ثابتة.',subs:[
        {k:'set',dev:'psu',t:'زِد V<sub>GS</sub> إلى V<sub>GS(TH)</sub> + 0.45 V.',ok:vgsSet(3),do:vgsTo(3),hint:s=>ST.vth!=null?`المطلوب ${(ST.vth+0.45).toFixed(2)} V`:''},
        {k:'rec',t:'لكل V<sub>DS</sub> في Table 7.1: اضبط V<sub>DD</sub> وسجّل V<sub>RD</sub>.',ok:()=>pts(3)===VDS.length,rec:rowRec(3),do:sweep(3)}]},
      {dev:'psu',t:'6. طفّ الـ dc power supply.',subs:[
        {k:'set',dev:'psu',t:'طفّ الـ dc supply (∼ POWER).',ok:()=>!!ST.offB,do:offAll,hint:'مفتاح ∼ POWER'}]},
      /* Procedure C (manual p. 55) */
      {dev:'psu',t:'Procedure C · 1. شغّل الـ dc supply. اضبط V<sub>DD</sub> على 10.0 V و V<sub>GS</sub> على V<sub>GS(TH)</sub> + 0.3 V.',subs:[
        {k:'set',dev:'psu',t:'شغّل الـ dc supply (∼ POWER، ومفتاح الـ dc حق الوحدتين).',ok:s=>!!ST.offB&&s.kind==='B'&&s.vddOn&&s.vgsOn,do:A2=>unitsOn(A2,[VD(),VG()]),hint:'∼ POWER ومفتاح الـ dc حق كل وحدة'},
        {k:'set',dev:'psu',t:'V<sub>DD</sub> = 10.0 V (COARSE ثم FINE).',ok:s=>s.kind==='B'&&A(P().u[s.c.vdd.u].v-10)<0.006,do:A2=>setU(A2,VD(),10),hint:'الوحدة اللي على R<sub>D</sub>: لف COARSE لين 10 V وكمّل بالـ FINE'},
        {k:'set',dev:'psu',t:'V<sub>GS</sub> = V<sub>GS(TH)</sub> + 0.3 V.',ok:s=>s.kind==='B'&&s.cset&&s.vddOn,do:vgsTo(2),hint:s=>ST.vth!=null?`المطلوب ${(ST.vth+0.3).toFixed(2)} V على وحدة الـ gate`:''}]},
      {dev:'board',build:'7.1c-270',t:'2. ابدأ بـ R<sub>D</sub> = 270 Ω.',subs:[
        {k:'build',fig:'7.1c-270',t:'بدّل R<sub>D</sub> بـ 270 Ω (<bdi dir="ltr">Fig. 7.1c</bdi>).',ok:s=>s.kind==='B'&&s.cset&&s.c.rd.type==='R270'&&s.vddOn}]},
      {dev:'dmm',t:'3. بالـ digital multimeter قيس V<sub>DS</sub> و V<sub>RD</sub> وسجّلها في Table 7.2. احسب I<sub>D</sub> بـ Ohm\'s law.',subs:[
        {k:'measure',dev:'dmm',t:'DMM 1 على R<sub>D</sub> و DMM 2 على D–S، الاثنين على DCV.',ok:()=>onPair('rd')()&&onPair('ds')(),do:async A2=>{await measPair('rd','7.1c-270')(A2);await measPair('ds','7.1c-270')(A2)},hint:'الـ DMM اللي على R<sub>D</sub> والـ DMM اللي على D–S على DCV'},
        {k:'rec',t:'سجّل V<sub>RD</sub> و I<sub>D</sub> و V<sub>DS</sub> في Table 7.2.',ok:s=>s.cDone(0),rec:cRec(0)}]},
      {dev:'board',build:'7.1c-470',t:'4. غيّر R<sub>D</sub> إلى 470 Ω، وكرّر الخطوة اللي قبل.',subs:[
        {k:'build',fig:'7.1c-470',t:'بدّل R<sub>D</sub> بـ 470 Ω.'},
        {k:'rec',t:'سجّل V<sub>RD</sub> و I<sub>D</sub> و V<sub>DS</sub> في Table 7.2.',ok:s=>s.cDone(1),rec:cRec(1)}]},
      {dev:'board',build:'7.1c-1k',t:'5. غيّر R<sub>D</sub> إلى 1 kΩ، وكرّر خطوة 3.',subs:[
        {k:'build',fig:'7.1c-1k',t:'بدّل R<sub>D</sub> بـ 1 kΩ.'},
        {k:'rec',t:'سجّل V<sub>RD</sub> و I<sub>D</sub> و V<sub>DS</sub> في Table 7.2.',ok:s=>s.cDone(2),rec:cRec(2)}]},
      {dev:'psu',t:'6. طفّ الـ dc supply، وفكّ كل القطع ورجّعها مكانها، ورتّب طاولتك.',subs:[
        {k:'set',dev:'psu',t:'طفّ الـ dc supply (∼ POWER).',ok:()=>!!ST.offC,do:offAll,hint:'مفتاح ∼ POWER'}]}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.b={};ST.c={};$('result').innerHTML='';$('ivplot').innerHTML=''}};
}};})();
