/* EE205 · Experiment 4 · Power Factor Improvement (manual pp. 27–31).
   Steps follow the manual's procedure 1–6. Fig. 4 is defined once (def.figs) in the lab's rectangle layout: the wall
   socket's L / N on the left column (L top, N bottom), the PX 120 current coil and the ammeter along the top row, the lamp
   down the right column, the neutral back along the bottom row; the switch S (a bridging plug) and the capacitor box across
   the free nodes inside; the voltmeter and the wattmeter's voltage coil across the source. The build step ticks when the
   bench IS Fig. 4 (engine/match.js), whatever nodes are used; the readings follow the matched nets.
   Step 1 carries the manual's «Get the connection checked by the instructor and let him energize the circuit for you»
   («المشرف يتأكد من التوصيل», Manual / Exam only).
   Instruments: the wall socket (no ac supply on the table: the mains lead plugs into the wall), lamp, Metrix PX 120, two
   Fluke 77 (either may be the voltmeter or the ammeter on its 300 mA jack), BC05 box.
   Decisions: the lamp with its ballast is a linear R + L load: R = 263 Ω, L = 0.931 H (22 W, PF 0.60 lagging at 127 V,
   0.29 A — a typical 20 W tube + choke); C for PF = 1 is then 4.84 µF, inside the table's range as the manual expects.
   The switch S is the bridging plug that joins the capacitor box to the load; it is part of Fig. 4 from the start and
   "C not connected" (step 2) is the box with all dials at 0 (open), so the circuit is not changed after the instructor's
   check. The voltage coil's + is on the source side of the current coil (the figure draws both + at L1). Step 4's
   "increase C in steps" covers the table's 2.0, 3.0, 3.2 … 6.0 µF rows; steps 5–6 are calculations on the sheet. */
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
/* Fig. 4, rectangle layout: A (L line) 0–7 · B (between the current coil and the ammeter) 1 · lamp side 2–3–4–11 ·
   S node 10 (switch S = plug 3 ↔ 10) · neutral 14–21–22–23–24–25–18 and 17 */
const FIG4=[{lead:'acL',at:7},{lead:'acN',at:14},{wire:[0,7]},{wire:[14,21]},
  {lead:'h2ma',alt:'h1ma',at:1},{lead:'h2c',alt:'h1c',at:2},{lead:'w1i',at:0},{lead:'w1ic',at:1},{wire:[2,3]},{wire:[3,4]},{wire:[4,11]},
  {lead:'lpL',at:11},{lead:'lpN',at:18},{wire:[21,22]},{wire:[22,23]},{wire:[23,24]},{wire:[24,25]},{wire:[25,18]},
  {wire:[3,10]},{lead:'qa',at:10},{lead:'qb',at:17},{wire:[17,24]},
  {lead:'w1v',at:0},{lead:'w1vc',at:21},{lead:'h1v',alt:'h2v',at:7},{lead:'h1c',alt:'h2c',at:14}];
const figs={'4':{img:'labs/ee205/fig/e4-fig4.png',cap:'Fig. 4 · Experimental set up',lines:FIG4}};
return {figs,sheet,params:()=>({}),
instruments:[
  {type:'mains'},{type:'lamp'},{type:'px120',n:1},
  {type:'hdmm',model:'fluke77',n:1,prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:2},
  {type:'capbox',prev:d=>{d.d=[0,0,0,2,1]}}],
parts:{BR:{t:'BR',lab:''}},
tray:[['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};const W=2*Math.PI*60;
  const LR=263,LX=W*0.931,V0=127;const T={};{const z=Math.hypot(LR,LX);T.I=V0/z;T.P=T.I*T.I*LR;T.pf=LR/z;T.c=LX/(W*z*z)*1e6}
  const src=()=>({L:RT.leadNet('acL'),N:RT.leadNet('acN'),on:RT.S.ac.pwr});
  const curPaths=()=>{const out=[];RT.meters().forEach(m=>{if(m.D.jack==='A')out.push([m.hi,m.lo])});const a=RT.leadNet('w1i'),b=RT.leadNet('w1ic');if(a!=null&&b!=null)out.push([a,b]);return out};
  RT.instructor=()=>{const s=src();if(s.L==null||s.N==null)return {ok:false,msg:'وصّل المصدر (L و N) للدائرة'};if(s.L===s.N)return {ok:false,msg:'المصدر مقصور!'};
    if(curPaths().some(([a,b])=>(a===s.L&&b===s.N)||(a===s.N&&b===s.L)))return {ok:false,msg:'فيه أميتر أو ملف تيار الواطميتر على طرفي المصدر! لازم على التوالي'};
    const lL=RT.leadNet('lpL'),lN=RT.leadNet('lpN');if(lL==null||lN==null)return {ok:false,msg:'اللمبة مو موصولة'};
    if(!RT.match('4').ok){const h=RT.hint('4');return {ok:false,msg:h?h.msg:'التوصيل مختلف عن Fig. 4'}}return {ok:true}};
  /* the ammeter of the matched Fig. 4: a meter on its current jack from net B (after the wattmeter) to the lamp side */
  function status(){const st={};const s=src();st.s=s;st.on=s.on&&RT.S.ac.ok;const pw=RT.inst.pw1.reading();st.pw=pw;
    const M=RT.match('4');st.fig4=M.ok;const C=RT.inst.cb.value();st.C=C;
    if(M.ok&&st.on&&pw.pwr){const amm=RT.meters().find(m=>m.D.jack==='A'&&m.hi===M.net(1)&&m.lo===M.net(2));
      const V=K.across('ACV',M.net(0),M.net(14),true),I=amm&&amm.D.fn==='ACI'?K.shown(amm):null;
      if(V!=null&&I!=null){const k=CL.find(x=>Math.abs(x-C)<1e-6);if(k!=null)ST[key(k)]={V,I,P:pw.P,PF:pw.PF}}}
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
  const rd=(c,f)=>{const r=ST[key(c)];return r?r[f]:null};
  return {status,
    steps:[
      {dev:'board',build:'4',t:'1. وصّل الدائرة مثل Fig. 4. «Get the connection checked by the instructor and let him energize the circuit for you»: المشرف يتأكد من التوصيل وبعدها تشغّلها.',
        acts:['اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة.','إذا التوصيل سليم ركّب فيش السلك في الفيش الجداري (اضغط على الفيش).','شغّل الـ PX 120، وحط الـ voltmeter على V~ والـ ammeter على A~.'],ok:s=>s.on},
      {dev:'cb',t:'2. سجّل قراءة الـ voltmeter والـ ammeter والـ wattmeter قبل ما توصّل المكثف (كل أقراص الصندوق على 0).',ok:s=>!!ST[key(0)],
        rec:[{to:'c0v',val:()=>rd(0,'V'),unit:'V',dec:1,label:'C not connected V'},{to:'c0i',val:()=>rd(0,'I'),unit:'A',dec:4,label:'C not connected I'},{to:'c0p',val:()=>rd(0,'P'),unit:'W',dec:2,label:'C not connected P'}]},
      {dev:'cb',t:'3. وصّل المكثف على الخط بسعة 1 µF (قرص ×1µF على 1)، وسجّل قراءة الـ voltmeter والـ ammeter والـ wattmeter مرة ثانية.',ok:s=>!!ST[key(1)],
        rec:[{to:'c1v',val:()=>rd(1,'V'),unit:'V',dec:1,label:'C = 1.0 µF V'},{to:'c1i',val:()=>rd(1,'I'),unit:'A',dec:4,label:'C = 1.0 µF I'},{to:'c1p',val:()=>rd(1,'P'),unit:'W',dec:2,label:'C = 1.0 µF P'}]},
      {dev:'cb',t:'4. زِد قيمة المكثف خطوة خطوة (2.0 و 3.0 µF، وبعدين من 3.2 لـ 6.0 µF كل 0.2 µF) وسجّل القراءات لين توصل لنقطة يكون فيها التيار أقل شي.',ok:s=>s.done,
        rec:[{to:'c2v',val:()=>rd(2.0,'V'),unit:'V',dec:1,label:'C = 2.0 µF V'},{to:'c2i',val:()=>rd(2.0,'I'),unit:'A',dec:4,label:'C = 2.0 µF I'},{to:'c2p',val:()=>rd(2.0,'P'),unit:'W',dec:2,label:'C = 2.0 µF P'},{to:'c3v',val:()=>rd(3.0,'V'),unit:'V',dec:1,label:'C = 3.0 µF V'},{to:'c3i',val:()=>rd(3.0,'I'),unit:'A',dec:4,label:'C = 3.0 µF I'},{to:'c3p',val:()=>rd(3.0,'P'),unit:'W',dec:2,label:'C = 3.0 µF P'},{to:'c3_2v',val:()=>rd(3.2,'V'),unit:'V',dec:1,label:'C = 3.2 µF V'},{to:'c3_2i',val:()=>rd(3.2,'I'),unit:'A',dec:4,label:'C = 3.2 µF I'},{to:'c3_2p',val:()=>rd(3.2,'P'),unit:'W',dec:2,label:'C = 3.2 µF P'},{to:'c3_4v',val:()=>rd(3.4,'V'),unit:'V',dec:1,label:'C = 3.4 µF V'},{to:'c3_4i',val:()=>rd(3.4,'I'),unit:'A',dec:4,label:'C = 3.4 µF I'},{to:'c3_4p',val:()=>rd(3.4,'P'),unit:'W',dec:2,label:'C = 3.4 µF P'},{to:'c3_6v',val:()=>rd(3.6,'V'),unit:'V',dec:1,label:'C = 3.6 µF V'},{to:'c3_6i',val:()=>rd(3.6,'I'),unit:'A',dec:4,label:'C = 3.6 µF I'},{to:'c3_6p',val:()=>rd(3.6,'P'),unit:'W',dec:2,label:'C = 3.6 µF P'},{to:'c3_8v',val:()=>rd(3.8,'V'),unit:'V',dec:1,label:'C = 3.8 µF V'},{to:'c3_8i',val:()=>rd(3.8,'I'),unit:'A',dec:4,label:'C = 3.8 µF I'},{to:'c3_8p',val:()=>rd(3.8,'P'),unit:'W',dec:2,label:'C = 3.8 µF P'},{to:'c4v',val:()=>rd(4.0,'V'),unit:'V',dec:1,label:'C = 4.0 µF V'},{to:'c4i',val:()=>rd(4.0,'I'),unit:'A',dec:4,label:'C = 4.0 µF I'},{to:'c4p',val:()=>rd(4.0,'P'),unit:'W',dec:2,label:'C = 4.0 µF P'},{to:'c4_2v',val:()=>rd(4.2,'V'),unit:'V',dec:1,label:'C = 4.2 µF V'},{to:'c4_2i',val:()=>rd(4.2,'I'),unit:'A',dec:4,label:'C = 4.2 µF I'},{to:'c4_2p',val:()=>rd(4.2,'P'),unit:'W',dec:2,label:'C = 4.2 µF P'},{to:'c4_4v',val:()=>rd(4.4,'V'),unit:'V',dec:1,label:'C = 4.4 µF V'},{to:'c4_4i',val:()=>rd(4.4,'I'),unit:'A',dec:4,label:'C = 4.4 µF I'},{to:'c4_4p',val:()=>rd(4.4,'P'),unit:'W',dec:2,label:'C = 4.4 µF P'},{to:'c4_6v',val:()=>rd(4.6,'V'),unit:'V',dec:1,label:'C = 4.6 µF V'},{to:'c4_6i',val:()=>rd(4.6,'I'),unit:'A',dec:4,label:'C = 4.6 µF I'},{to:'c4_6p',val:()=>rd(4.6,'P'),unit:'W',dec:2,label:'C = 4.6 µF P'},{to:'c4_8v',val:()=>rd(4.8,'V'),unit:'V',dec:1,label:'C = 4.8 µF V'},{to:'c4_8i',val:()=>rd(4.8,'I'),unit:'A',dec:4,label:'C = 4.8 µF I'},{to:'c4_8p',val:()=>rd(4.8,'P'),unit:'W',dec:2,label:'C = 4.8 µF P'},{to:'c5v',val:()=>rd(5.0,'V'),unit:'V',dec:1,label:'C = 5.0 µF V'},{to:'c5i',val:()=>rd(5.0,'I'),unit:'A',dec:4,label:'C = 5.0 µF I'},{to:'c5p',val:()=>rd(5.0,'P'),unit:'W',dec:2,label:'C = 5.0 µF P'},{to:'c5_2v',val:()=>rd(5.2,'V'),unit:'V',dec:1,label:'C = 5.2 µF V'},{to:'c5_2i',val:()=>rd(5.2,'I'),unit:'A',dec:4,label:'C = 5.2 µF I'},{to:'c5_2p',val:()=>rd(5.2,'P'),unit:'W',dec:2,label:'C = 5.2 µF P'},{to:'c5_4v',val:()=>rd(5.4,'V'),unit:'V',dec:1,label:'C = 5.4 µF V'},{to:'c5_4i',val:()=>rd(5.4,'I'),unit:'A',dec:4,label:'C = 5.4 µF I'},{to:'c5_4p',val:()=>rd(5.4,'P'),unit:'W',dec:2,label:'C = 5.4 µF P'},{to:'c5_6v',val:()=>rd(5.6,'V'),unit:'V',dec:1,label:'C = 5.6 µF V'},{to:'c5_6i',val:()=>rd(5.6,'I'),unit:'A',dec:4,label:'C = 5.6 µF I'},{to:'c5_6p',val:()=>rd(5.6,'P'),unit:'W',dec:2,label:'C = 5.6 µF P'},{to:'c5_8v',val:()=>rd(5.8,'V'),unit:'V',dec:1,label:'C = 5.8 µF V'},{to:'c5_8i',val:()=>rd(5.8,'I'),unit:'A',dec:4,label:'C = 5.8 µF I'},{to:'c5_8p',val:()=>rd(5.8,'P'),unit:'W',dec:2,label:'C = 5.8 µF P'},{to:'c6v',val:()=>rd(6.0,'V'),unit:'V',dec:1,label:'C = 6.0 µF V'},{to:'c6i',val:()=>rd(6.0,'I'),unit:'A',dec:4,label:'C = 6.0 µF I'},{to:'c6p',val:()=>rd(6.0,'P'),unit:'W',dec:2,label:'C = 6.0 µF P'}]},
      {dev:'cb',t:'5. للمبة بدون مكثف: احسب الـ load resistance R، والـ inductive reactance X<sub>L</sub>، والـ impedance Z<sub>L</sub>، والـ phase angle θ<sub>L</sub> والـ PF. احسب قيمة C اللي تخلّي PF = 1.',ok:s=>!!ST[key(0)]},
      {dev:'cb',t:'6. احسب الـ PF لكل قيمة C وكمّل Table 1. طلّع قيمة C اللي تعطي أعلى PF، وقارنها باللي حسبتها في خطوة 5.',ok:s=>s.done}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
