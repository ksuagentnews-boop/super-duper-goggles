/* EE205 · Experiment 4 · Power Factor Improvement (manual pp. 27–31).
   Fig. 4: the bench ac source (127 V 60 Hz), the PX 120 wattmeter (current coil in the line, voltage coil across the source),
   an ammeter in series, a voltmeter, the capacitor decade box (with its switch S) across the fluorescent lamp (110 V 20 W +
   ballast). The instructor checks the connection and energizes the circuit. V, I, P without C, then C = 1.0, 2.0, 3.0,
   3.2 … 6.0 µF → V, I, P, PF (Table 1); the minimum current; R, XL, ZL, θL, PF of the lamp; C for PF = 1.
   Instruments: bench source, lamp, Metrix PX 120, two Fluke 77 (M1 voltmeter, M2 ammeter on its 300 mA jack), BC05 box.
   Decisions: the lamp with its ballast is a linear R + L load: R = 263 Ω, L = 0.931 H (22 W, PF 0.60 lagging at 127 V,
   0.29 A — a typical 20 W tube + choke); C for PF = 1 is then 4.84 µF, inside the table's range as the manual expects.
   The switch S is the bridging plug that joins the capacitor box to the load; with all dials at 0 the box is open
   ("C not connected"). */
EXP_DEFS['ee205/exp4']=(()=>{const H=ENGINE.sheet;
const CL=[0,1,2,3];for(let c=3.2;c<=6.001;c+=0.2)CL.push(+c.toFixed(1));
const key=c=>'c'+String(c).replace('.','_');
const sheet=`<div class="paper" id="paper">
<h2>Experiment 4 · Power Factor Improvement</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القراءات من الـ Fluke (V، I) والـ PX 120 (P). PF = P / (V·I). عبّي واضغط "صحّح إجاباتي".</p>
<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/e4-fig4.png" alt="Fig. 4" style="max-width:460px;width:100%"></div><div class="hint" style="text-align:center">Fig. 4: Experimental set up</div>
<table class="tbl"><caption>Table 1: Readings of Voltmeter, Ammeter, and Wattmeter with different value of C</caption><tr><th>C (µF)</th><th>V (V)</th><th>I (A)</th><th>P (W)</th><th>PF</th></tr>
${CL.map(c=>`<tr><td>${c?c.toFixed(1):'<i>C not connected</i>'}</td><td>${H.num(key(c)+'v','0.1',64)}</td><td>${H.num(key(c)+'i','0.001',64)}</td><td>${H.num(key(c)+'p','0.01',64)}</td><td>${H.num(key(c)+'f','0.001',64)}</td></tr>`).join('')}</table>
<table class="tbl"><caption>Step 5: the lamp without capacitor</caption>
<tr><td class="l">R = P / I²</td><td>${H.num('lr','0.1',80)} Ω</td></tr><tr><td class="l">Z<sub>L</sub> = V / I</td><td>${H.num('lz','0.1',80)} Ω</td></tr>
<tr><td class="l">X<sub>L</sub> = √(Z<sub>L</sub>² − R²)</td><td>${H.num('lx','0.1',80)} Ω</td></tr><tr><td class="l">θ<sub>L</sub></td><td>${H.num('lt','0.1',80)} °</td></tr>
<tr><td class="l">PF = cos θ<sub>L</sub></td><td>${H.num('lpf','0.001',80)}</td></tr><tr><td class="l">C for PF = 1: C = X<sub>L</sub> / (ω Z<sub>L</sub>²)</td><td>${H.num('lc','0.01',80)} µF</td></tr></table>
<table class="tbl"><caption>Step 6</caption><tr><td class="l">C with the minimum current / highest PF (from Table 1)</td><td>${H.num('cbest','0.1',80)} µF</td></tr></table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
return {sheet,params:()=>({}),
instruments:[
  {type:'mains'},{type:'lamp'},{type:'px120',n:1},
  {type:'hdmm',model:'fluke77',n:1,prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:2},
  {type:'capbox',prev:d=>{d.d=[0,0,0,2,1]}}],
parts:{BR:{t:'BR',lab:''}},
tray:[['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};const W=2*Math.PI*60;
  const LR=263,LX=W*0.931,V0=127;const T={};{const z=Math.hypot(LR,LX);T.I=V0/z;T.P=T.I*T.I*LR;T.pf=LR/z;T.c=LX/(W*z*z)*1e6}
  const src=()=>({L:RT.leadNet('acL'),N:RT.leadNet('acN'),on:RT.S.ac.pwr});
  const curPaths=()=>{const out=[];RT.meters().forEach(m=>{if(m.D.jack==='A')out.push([m.hi,m.lo])});const a=RT.leadNet('w1i'),b=RT.leadNet('w1ic');if(a!=null&&b!=null)out.push([a,b]);return out};
  RT.instructor=()=>{const s=src();if(s.L==null||s.N==null)return {ok:false,msg:'وصّل المصدر (L و N) للدائرة'};if(s.L===s.N)return {ok:false,msg:'المصدر مقصور!'};
    if(curPaths().some(([a,b])=>(a===s.L&&b===s.N)||(a===s.N&&b===s.L)))return {ok:false,msg:'فيه أميتر أو ملف تيار الواطميتر على طرفي المصدر! لازم على التوالي'};
    const lL=RT.leadNet('lpL'),lN=RT.leadNet('lpN');if(lL==null||lN==null)return {ok:false,msg:'اللمبة مو موصولة'};
    if(lL===s.L)return {ok:false,msg:'التيار لازم يمر في الواطميتر والأميتر قبل اللمبة'};return {ok:true}};
  function status(){const st={};const s=src();st.s=s;st.on=s.on&&RT.S.ac.ok;const pw=RT.inst.pw1.reading();st.pw=pw;
    /* Fig. 4: L → W current coil (node 1 → 2) → ammeter (2 → 3) → lamp L (3); lamp N, source N on node 10; W voltage across 1 – 10;
       the box from node 4 (switch S = plug 3 ↔ 4) to node 11 (plug 10 ↔ 11) */
    const w=RT.leadNet('w1i')===N(1)&&RT.leadNet('w1ic')===N(2)&&RT.leadNet('w1v')===N(1)&&RT.leadNet('w1vc')===N(10);
    const amm=RT.meters().find(m=>m.D.jack==='A'&&m.hi===N(2)&&m.lo===N(3));
    st.fig4=s.L===N(1)&&s.N===N(10)&&w&&RT.leadNet('h2ma')===N(2)&&RT.leadNet('h2c')===N(3)&&RT.leadNet('lpL')===N(3)&&RT.leadNet('lpN')===N(10)&&RT.leadNet('qa')===N(4)&&RT.leadNet('qb')===N(11)&&N(10)===N(11);
    st.S=N(3)===N(4);const C=RT.inst.cb.value();st.C=C;
    if(st.fig4&&st.on&&pw.pwr){const V=K.across('ACV',N(1),N(10),true),I=amm?K.shown(amm):null;
      if(V!=null&&I!=null&&amm&&amm.D.fn==='ACI'){const c=st.S?C:0;const k=CL.find(x=>Math.abs(x-c)<1e-6);if(k!=null)ST[key(k)]={V,I,P:pw.P,PF:pw.PF}}}
    st.done=CL.every(c=>ST[key(c)]);st.off=!s.on;st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    CL.forEach(c=>{const k=key(c),r=ST[k],lab=c?c.toFixed(1)+' µF':'no C';
      g.add(r&&G.near(v(k+'v'),r.V,0.15),`${lab} V`,r?`${r.V.toFixed(1)} V`:'measure it');g.add(r&&G.near(v(k+'i'),r.I,0.0015),`${lab} I`,r?`${r.I.toFixed(4)} A`:'measure it');
      g.add(r&&G.near(v(k+'p'),r.P,Math.abs(r.P)*0.01+0.02),`${lab} P`,r?`${r.P.toFixed(2)} W`:'read the PX 120');g.add(G.near(v(k+'f'),v(k+'p')/(v(k+'v')*v(k+'i')),0.006),`${lab} PF`,'P / (V·I)')});
    const r0=ST[key(0)];g.add(r0&&G.near(v('lr'),v(key(0)+'p')/Math.pow(v(key(0)+'i'),2),2),'R = P/I²',`≈ ${LR} Ω`);g.add(G.near(v('lz'),v(key(0)+'v')/v(key(0)+'i'),2),'ZL = V/I');
    g.add(G.near(v('lx'),Math.sqrt(Math.max(0,v('lz')**2-v('lr')**2)),2),'XL',`≈ ${LX.toFixed(0)} Ω`);g.add(G.near(v('lpf'),v('lr')/v('lz'),0.006),'PF = R/ZL',`≈ ${T.pf.toFixed(2)} lagging`);
    g.add(G.near(Math.cos(v('lt')*Math.PI/180),v('lpf'),0.01),'θL = cos⁻¹ PF');g.add(G.near(v('lc'),v('lx')/(W*v('lz')**2)*1e6,0.05),'C for PF = 1',`≈ ${T.c.toFixed(2)} µF`);
    const best=CL.filter(c=>ST[key(c)]).reduce((b,c)=>b==null||ST[key(c)].I<ST[key(b)].I?c:b,null);g.add(best!=null&&Math.abs(v('cbest')-best)<0.11,'C with the minimum current',best!=null?`${best} µF in your table`:'');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'board',fig:'labs/ee205/fig/e4-fig4.png',figCap:'Fig. 4',t:'1. ركّب Fig. 4: المصدر L على node 1 و N على node 10. ملف التيار للواطميتر من node 1 لـ node 2 وبعده الأميتر (M2، مدخل 300mA) من node 2 لـ node 3، واللمبة من node 3 لـ node 10. ملف الجهد للواطميتر و الـ voltmeter (M1) على المصدر. صندوق المكثفات من node 4 لـ node 11 (الـ switch S = plug بين node 3 و node 4).',
        lines:[{t:'AC L → node 1',lead:'acL',at:1},{t:'AC N → node 10',lead:'acN',at:10},{t:'W 10A → node 1',lead:'w1i',at:1},{t:'W COM (A) → node 2',lead:'w1ic',at:2},{t:'W 600V → node 1',lead:'w1v',at:1},{t:'W COM (V) → node 10',lead:'w1vc',at:10},
          {t:'M2 300mA (red) → node 2',lead:'h2ma',at:2},{t:'M2 COM → node 3',lead:'h2c',at:3},{t:'lamp L → node 3',lead:'lpL',at:3},{t:'lamp N → node 10',lead:'lpN',at:10},
          {t:'M1 VΩ → node 1',lead:'h1v',at:1},{t:'M1 COM → node 10',lead:'h1c',at:10},{t:'C box → node 4',lead:'qa',at:4},{t:'C box → node 11',lead:'qb',at:11},{t:'bridging plug: node 10 ↔ node 11',wire:[10,11]},{t:'switch S: bridging plug node 3 ↔ node 4',wire:[3,4]}],ok:s=>s.fig4},
      {dev:'ac',t:'⚠ «Get the connection checked by the instructor»: اضغط «المشرف يتأكد» على المصدر، وإذا التوصيل سليم شغّل الـ POWER. شغّل الـ PX 120، و M1 على V~، و M2 على A~.',ok:s=>s.fig4&&s.on},
      {dev:'cb',t:'2. بدون مكثف (صفّر كل أقراص الصندوق): سجّل V و I و P.',ok:s=>!!ST[key(0)]},
      {dev:'cb',t:'3. حط C = 1.0 µF على الصندوق (قرص ×1µF على 1) وسجّل V و I و P، وبعدين 2.0 و 3.0 µF.',ok:s=>[1,2,3].every(c=>ST[key(c)])},
      {dev:'cb',t:'4. زِد C من 3.2 لـ 6.0 µF كل 0.2 µF (قرص ×0.1µF) وسجّل القراءات: لاحظ وين يصير التيار أقل شي.',ok:s=>s.done},
      {dev:'ac',t:'5–6. احسب R و X<sub>L</sub> و Z<sub>L</sub> و θ<sub>L</sub> و PF للمبة بدون مكثف، والـ C اللي يخلّي PF = 1، والـ PF لكل C. بعدين طفّ المصدر.',ok:s=>s.done&&s.off}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
