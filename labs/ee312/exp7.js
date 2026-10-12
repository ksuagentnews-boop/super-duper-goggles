/* EE312 · Experiment 7 · Terminal Characteristics of the Enhancement N-MOSFET (manual v8.8 pp. 51–56).
   Procedure A: VGS(TH) at VRD = 0.25 V (Fig. 7.1a, gate tied to drain, current limit 0.100 A).
   Procedure B: iD–vDS curves (Fig. 7.1b, second supply unit on the gate) at VGS(TH) + 0.15 / 0.30 / 0.45 V,
   VDS = 0.05 … 3 V (Table 7.1). Procedure C: VDD = 10 V, VGS = VGS(TH) + 0.3 V, RD = 270 Ω / 470 Ω / 1 kΩ (Table 7.2).
   Assumptions: one MT3805 on the bench (the student moves its leads between RD, D–S and G–S); the IRF620 sits on
   three neighbouring nodes in the order G D S (TO-220 seen from the front); RD values for Procedure C (270 Ω,
   470 Ω) are on the bench although the materials list names only the 1 kΩ. */
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
<li class="plq">Plot i<sub>D</sub> (mA) vs. v<sub>DS</sub> (V) for each v<sub>GS</sub> (your Table 7.1). <button class="t" id="plotBtn" type="button">ارسم من جدولك</button><div id="ivplot"></div>
  <div>${H.row('iii. Voltage-controlled current source region:',H.sel('q1c',[['sat','Saturation'],['tri','Triode'],['cut','Cutoff']]))}${H.row('iv. Voltage-controlled resistance region:',H.sel('q1d',[['sat','Saturation'],['tri','Triode'],['cut','Cutoff']]))}</div></li>
<li class="plq">r<sub>o</sub> = Δv<sub>DS</sub>/Δi<sub>D</sub> between V<sub>DS1</sub> = 1.5 V and V<sub>DS2</sub> = 3 V, for each curve.
  <div>${[1,2,3].map(k=>H.row(`r<sub>o</sub> (V<sub>GS${k}</sub>) =`,H.num('q2_'+k,'0.01'),'kΩ')).join('')}</div></li>
<li class="plq">r<sub>DS</sub> = Δv<sub>DS</sub>/Δi<sub>D</sub> between V<sub>DS1</sub> = 0 V and V<sub>DS2</sub> = 0.05 V, for each curve.
  <div>${[1,2,3].map(k=>H.row(`r<sub>DS</sub> (V<sub>GS${k}</sub>) =`,H.num('q3_'+k,'0.1'),'Ω')).join('')}</div></li>
<li class="plq">How do r<sub>o</sub> and r<sub>DS</sub> change with V<sub>OV</sub>?
  <div>${H.sel('q4',[['a','Both decrease as VOV increases (ro = 1/λID with a larger ID; rDS = 1/(kn′(W/L)VOV))'],['b','Both increase as VOV increases'],['c','ro increases, rDS decreases'],['d','Neither depends on VOV']])}</div></li>
<li class="plq">Procedure C:
  <div>${H.row('i. Why does i<sub>D</sub> stay almost constant?',H.sel('q5a',[['a','In saturation iD is set by vGS (current source); vDS has only a weak effect through λ'],['b','The supply is in constant-current (CC) mode'],['c','RD is too small to matter'],['d','The MOSFET is cut off']]))}
  ${H.row('ii. R<sub>D(max)</sub> = (V<sub>DD</sub> − V<sub>OV</sub>) / I<sub>D</sub> =',H.num('q5b','1'),'Ω')}
  ${H.row('iii. Region beyond R<sub>D(max)</sub>:',H.sel('q5c',[['tri','Triode'],['sat','Saturation'],['cut','Cutoff']]))}</div></li></ol>`;
return {
sheet:`<div class="paper" id="paper">
<h2>Experiment 7 · Terminal Characteristics of Enhancement N-MOSFET</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig7-1.png" alt="Fig. 7.1"></div>
<div class="hint" style="text-align:center">Fig. 7.1 · (a) V<sub>GS(TH)</sub> (b) i<sub>D</sub>–v<sub>DS</sub> (c) current source · IRF620 (TO-220: G D S from the left, front view), R<sub>D</sub> = 1 kΩ</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">جهاز DMM واحد: انقل أطرافه بين R<sub>D</sub> (V<sub>RD</sub>) و D–S (V<sub>DS</sub>) و G–S (V<sub>GS</sub>). V<sub>GS</sub> في Procedure B و C تنحسب من V<sub>GS(TH)</sub> اللي قسته أنت.</p>
${H.row('V<sub>GS(TH)</sub> =',H.num('a_vth','0.001'),'V')}
${t71}${t72}${plq}
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
        if(c.R===1000)[1,2,3].forEach(k=>{if(A(st.vgs-(ST.vth+0.15*k))>0.006)return;st.curve=k;const j=VDS.findIndex(v=>A(st.vds-v)<=0.006);if(j<0)return;ST.b[k]=ST.b[k]||{};if(onRD){const x=A(onRD.val),o=ST.b[k][j];ST.b[k][j]=o?{lo:Math.min(o.lo,x),hi:Math.max(o.hi,x)}:{lo:x,hi:x}}});
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
    g.add(G.near(v('a_vth'),vthRef,0.01)&&ST.vth!=null&&G.near(v('a_vth'),ST.vth,0.004),'VGS(TH)',`≈ ${vthRef.toFixed(3)} V at VRD = 0.25 V`);
    [1,2,3].forEach(k=>{const bad=[];VDS.forEach((vd,j)=>{const e=ST.b[k]&&ST.b[k][j];if(e==null){bad.push(`${vd} V: ما انقاس`);return}const x=A(v(`b${k}_${j}`));
      /* with DMM 1 left on R_D, every reading seen while V_DS sat in this row's window counts */if(!(x>=e.lo-tl(e.lo)&&x<=e.hi+tl(e.hi)))bad.push(`${vd} V ≈ ${((e.lo+e.hi)/2).toFixed(3)}`)});
      g.add(!bad.length,`Table 7.1 · VGS${k}`,bad.slice(0,3).join('، ')+(bad.length>3?` … (+${bad.length-3})`:''))});
    RDS.forEach(([,R],i)=>{const e=ST.c[i]||{};const ok=e.vrd!=null&&e.vds!=null&&G.near(v('c_vrd'+i),e.vrd,tl(e.vrd))&&G.near(v('c_vds'+i),e.vds,tl(e.vds))&&G.near(v('c_id'+i),v('c_vrd'+i)/R*1e3,Math.max(0.004,A(v('c_vrd'+i)/R*1e3)*0.004));
      g.add(ok,`Table 7.2 · RD = ${R} Ω`,e.vrd!=null?`VRD ≈ ${e.vrd.toFixed(3)}, ID = VRD/RD, VDS ≈ ${e.vds!=null?e.vds.toFixed(3):'?'}`:'ما انقاس')});
    g.add(G.s('q1c')==='sat'&&G.s('q1d')==='tri','PLQ 1','saturation = current source, triode = resistance');
    [1,2,3].forEach(k=>{const id=j=>v(`b${k}_${j}`);const ro=(3-1.5)/(id(7)-id(6));const rds=0.05/(id(0)*1e-3);
      g.add(isFinite(ro)&&ro>0&&G.near(v('q2_'+k),ro,ro*0.03),`PLQ 2 ro (VGS${k})`,`= 1.5 V / (ID(3 V) − ID(1.5 V)) ≈ ${isFinite(ro)?ro.toFixed(2):'?'} kΩ`);
      g.add(isFinite(rds)&&G.near(v('q3_'+k),rds,rds*0.03),`PLQ 3 rDS (VGS${k})`,`= 0.05 V / ID(0.05 V) ≈ ${isFinite(rds)?rds.toFixed(1):'?'} Ω`)});
    g.add(G.s('q4')==='a','PLQ 4');g.add(G.s('q5a')==='a','PLQ 5 i');
    const idc=v('c_id0')*1e-3,rmax=(10-0.3)/idc;g.add(isFinite(rmax)&&G.near(v('q5b'),rmax,rmax*0.03),'PLQ 5 ii',`= (10 − 0.3) / ID ≈ ${isFinite(rmax)?rmax.toFixed(0):'?'} Ω`);
    g.add(G.s('q5c')==='tri','PLQ 5 iii','triode');
    g.show($('result'))});
  const pts=k=>VDS.filter((_,j)=>ST.b[k]&&ST.b[k][j]!=null).length;
  return {status,
    steps:[
      {dev:'board',fig:'labs/ee312/fig/fig7-1.png',figCap:'Fig. 7.1',t:'Procedure A: ركّب Fig. 7.1a (الـ gate موصول بالـ drain)، ووصّل الملتيميترين: DMM 1 على R<sub>D</sub> و DMM 2 على G–S.',
        lines:[{t:'IRF620: G → node 15, D → node 16, S → node 17',note:'الوجه المكتوب عليه للأمام',ic:'IRF620',pins:{G:15,D:16,S:17}},{t:'bridging plug: node 15 ↔ node 16',note:'G مع D',wire:[15,16]},
          {t:'R<sub>D</sub> = 1 kΩ: node 16 ↔ node 23',part:['R1k',16,23]},{t:'DC + (L +) → node 23',note:'V<sub>DD</sub>',lead:'Lp',at:23},{t:'DC − (L −) → node 17',note:'على S',lead:'Lm',at:17},
          {t:'DMM 1 HI → node 23',note:'V<sub>RD</sub>',lead:'mh',at:23},{t:'DMM 1 COM → node 16',lead:'ml',at:16},{t:'DMM 2 HI → node 15',note:'V<sub>GS</sub>',lead:'m2h',at:15},{t:'DMM 2 COM → node 17',lead:'m2l',at:17}],ok:s=>s.kind==='A'},
      {dev:'psu',t:'شغّل المصدر، واضبط CURRENT لين حد التيار 0.100 A (يبين على AMPS والـ dc OFF)، وبعدها حوّل مفتاح الـ dc على ON.',ok:s=>s.kind==='A'&&s.vddOn&&s.ilim},
      {dev:'psu',t:'الملتيميترين على DCV. ارفع V<sub>DD</sub> (COARSE ثم FINE) لين DMM 1 يقرا V<sub>RD</sub> = 0.25 V (I<sub>D</sub> = 250 µA).',ok:s=>!!ST.vrd},
      {dev:'dmm2',t:'سجّل V<sub>GS</sub> اللي يقراه DMM 2: هذي V<sub>GS(TH)</sub>.',ok:s=>ST.vth!=null},
      {dev:'psu',t:'طفّ الـ dc.',ok:s=>!!ST.offA},
      {dev:'board',fig:'labs/ee312/fig/fig7-1.png',figCap:'Fig. 7.1',t:'Procedure B: شيل الـ bridging plug بين G و D، ووصّل الوحدة الثانية بين الـ gate والـ source (Fig. 7.1b)، وانقل DMM 2 على D–S.',
        lines:[{t:'DC + (R +) → node 15',note:'V<sub>GS</sub> على G',lead:'Rp',at:15},{t:'DC − (R −) → node 17',note:'على S',lead:'Rm',at:17},{t:'DMM 2 HI → node 16',note:'V<sub>DS</sub>',lead:'m2h',at:16},{t:'DMM 2 COM → node 17',lead:'m2l',at:17}],ok:s=>s.kind==='B'&&ST.offA},
      {dev:'psu',t:`ثبّت V<sub>GS</sub> = V<sub>GS(TH)</sub> + 0.15 V بالوحدة الثانية وشغّلها.`,ok:s=>s.kind==='B'&&s.vgsOn&&s.curve===1},
      {dev:'psu',t:'غيّر V<sub>DD</sub> لين V<sub>DS</sub> (DMM 2) = كل قيمة في Table 7.1، وسجّل V<sub>RD</sub> (DMM 1) لكل وحدة.',ok:s=>pts(1)===VDS.length},
      {dev:'psu',t:'زِد V<sub>GS</sub> بـ 0.15 V (V<sub>GS(TH)</sub> + 0.30 V) وكرّر.',ok:s=>pts(2)===VDS.length},
      {dev:'psu',t:'زِد V<sub>GS</sub> بـ 0.15 V ثانية (V<sub>GS(TH)</sub> + 0.45 V) وكرّر.',ok:s=>pts(3)===VDS.length},
      {dev:'psu',t:'طفّ المصدر.',ok:s=>!!ST.offB},
      {dev:'board',lines:[{t:'R<sub>D</sub> = 270 Ω: node 16 ↔ node 23',part:['R270',16,23]}],t:'Procedure C: بدّل R<sub>D</sub> بـ 270 Ω، وشغّل المصدر: V<sub>DD</sub> = 10.00 V و V<sub>GS</sub> = V<sub>GS(TH)</sub> + 0.3 V.',ok:s=>ST.offB&&s.kind==='B'&&s.cset&&s.c.rd.type==='R270'&&s.vddOn},
      {dev:'dmm',t:'سجّل V<sub>DS</sub> (DMM 2) و V<sub>RD</sub> (DMM 1) في Table 7.2، واحسب I<sub>D</sub>.',ok:s=>s.cDone(0)},
      {dev:'board',lines:[{t:'R<sub>D</sub> = 470 Ω: node 16 ↔ node 23',part:['R470',16,23]}],t:'بدّل R<sub>D</sub> بـ 470 Ω وكرّر.',ok:s=>s.cDone(1)},
      {dev:'board',lines:[{t:'R<sub>D</sub> = 1 kΩ: node 16 ↔ node 23',part:['R1k',16,23]}],t:'بدّل R<sub>D</sub> بـ 1 kΩ وكرّر.',ok:s=>s.cDone(2)},
      {dev:'psu',t:'طفّ المصدر، وفصّل القطع ورتّب طاولتك.',ok:s=>!!ST.offC}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.b={};ST.c={};$('result').innerHTML='';$('ivplot').innerHTML=''}};
}};})();
