/* EE205 · Experiment 4 · Power Factor Improvement (manual pp. 27–31).
   Steps follow the manual's procedure 1–6. Fig. 4 is defined once (def.figs) in the lab's rectangle layout: the wall
   socket's L / N on the left column (L top, N bottom), the PX 120 current coil and the ammeter along the top row, the lamp
   down the right column, the neutral back along the bottom row; the switch S (a bridging plug) and the capacitor box across
   the free nodes inside; the voltmeter and the wattmeter's voltage coil across the source. The build step ticks when the
   bench IS Fig. 4 (engine/match.js), whatever nodes are used; the readings follow the matched nets.
   Step 1 carries the manual's «Get the connection checked by the instructor and let him energize the circuit for you»
   («المشرف يتأكد من التوصيل», Manual / Exam only) as its own sub-step (chk:true): the card shows the button from that
   sub-step on, not while the circuit is still being built. Every step is split into its sub-steps (Batch 7 item 3).
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
  const recC=c=>{const k=key(c),lab=c?`C = ${c.toFixed(1)} µF`:'C not connected';return [{to:k+'v',val:()=>rd(c,'V'),unit:'V',dec:1,label:lab+' V'},{to:k+'i',val:()=>rd(c,'I'),unit:'A',dec:4,label:lab+' I'},{to:k+'p',val:()=>rd(c,'P'),unit:'W',dec:2,label:lab+' P'}]};
  /* the instructor check (Batch 7 item 3): its button shows in the card from the sub-step that asks for it (chk:true) on —
     not while the circuit is still being built before it */
  const LKa=(RT.locks||[]).find(l=>l.key==='ac');
  if(LKa){const real=LKa.isOk;LKa.isOk=()=>real()||!atChk()}
  function atChk(){try{const S=BENCH.sim.steps,i=BENCH.cur(),s=S[i];if(!s)return false;const SS=BENCH.subState(s);
      if(SS.L.slice(0,SS.cur+1).some(x=>x.chk))return true;for(let j=i-1;j>=0&&S[j].proc===s.proc;j--)if((S[j].subs||[]).some(x=>x.chk))return true;return false}catch(e){return false}}
  /* "do it for me" helpers: the matched Fig. 4's voltmeter (across the source) and ammeter (after the current coil), the
     Fluke's rotary switch turned to its position, the capacitor box's dials */
  const vM=()=>{const M=RT.match('4');if(!M.ok)return null;const a=M.net(0),b=M.net(14);return RT.meters().find(m=>m.D.jack==='HI'&&(m.hi===a&&m.lo===b||m.hi===b&&m.lo===a))||null};
  const aM=()=>{const M=RT.match('4');if(!M.ok)return null;return RT.meters().find(m=>m.D.jack==='A'&&m.hi===M.net(1)&&m.lo===M.net(2))||null};
  const sw=async(A,m,pos)=>{if(!m)return;const p='h'+m.key.slice(2);const d=RT.S[m.key];await A.until(p+':SW'+(d.pos<pos?'+':'-'),()=>RT.S[m.key].pos===pos,8)};
  const want=c=>[0,0,0,Math.round(c*10)%10,Math.floor(c+1e-9)];
  const setC=async(A,c)=>{const w=want(c);for(let j=0;j<5;j++){const d=RT.S.cb.d;if(d[j]!==w[j])await A.until('q:D'+j+(d[j]<w[j]?'+':'-'),()=>RT.S.cb.d[j]===w[j],12)}};
  const isC=c=>Math.abs(RT.inst.cb.value()-c)<1e-6;
  const C4=CL.filter(c=>c>=2);
  /* step 4: every C of the table set in turn and its three readings captured (Manual) */
  const sweep=async(A,j)=>{for(const c of C4){if(!ST[key(c)]){await setC(A,c);A.st()}
    const s=BENCH.sim.steps[BENCH.cur()],caps=s?BENCH.capsOf(s,j):[];const n=3*(C4.indexOf(c)+1);while(caps.length<n){const q=caps.length;A.capture();if(caps.length===q)break}}};
  const chkT='اطلب من المشرف يتأكد من التوصيل: اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة.';
  return {status,
    steps:[
      {dev:'board',build:'4',t:'1. وصّل الدائرة مثل Fig. 4. «Get the connection checked by the instructor and let him energize the circuit for you».',subs:[
        {k:'build',fig:'4',t:'وصّل الدائرة <bdi dir="ltr">Fig. 4</bdi> (مع المفتاح S وصندوق المكثفات).'},
        {k:'set',chk:true,dev:'ac',t:chkT,ok:()=>!!RT.S.ac.ok,do:A=>A.press('a:CHK'),hint:'بعد ما تكمّل Fig. 4 اضغط «المشرف يتأكد من التوصيل»؛ إذا رفض، اقرا سببه وصلّحه'},
        {k:'set',dev:'ac',t:'ركّب فيش السلك في الفيش الجداري (127 V ~ 60 Hz): اضغط على الفيش.',ok:s=>s.on,do:A=>A.press('a:PWR'),hint:'اضغط على فيش السلك الأسود عشان يدخل في الفيش الجداري'},
        {k:'set',dev:'pw1',t:'شغّل الـ PX 120 (زر POWER).',ok:s=>!!s.pw.pwr,do:A=>A.press('w1:PWR'),hint:'زر POWER في الـ PX 120'},
        {k:'measure',t:'حط الـ voltmeter (الـ Fluke اللي على المصدر) على V~.',ok:()=>{const m=vM();return !!m&&m.D.fn==='ACV'},do:A=>sw(A,vM(),1),hint:'لف مفتاح الـ Fluke اللي على L و N لين V~'},
        {k:'measure',t:'حط الـ ammeter (الـ Fluke اللي على التوالي، مدخل 300 mA) على A~.',ok:()=>{const m=aM();return !!m&&m.D.fn==='ACI'},do:A=>sw(A,aM(),7),hint:'لف مفتاح الـ Fluke اللي على التوالي لين A~'}]},
      {dev:'cb',t:'2. سجّل قراءة الـ voltmeter والـ ammeter والـ wattmeter قبل ما توصّل المكثف (كل أقراص الصندوق على 0 µF).',subs:[
        {k:'set',dev:'cb',t:'لف أقراص صندوق المكثفات لين C = 0 µF (المكثف مو موصول).',ok:()=>isC(0),do:A=>setC(A,0),hint:'كل الأقراص على 0 µF'},
        {k:'rec',t:'سجّل V و I و P (C not connected) في Table 1.',ok:()=>!!ST[key(0)],rec:recC(0)}]},
      {dev:'cb',t:'3. وصّل المكثف على الخط بسعة 1 µF (قرص ×1µF على 1 µF)، وسجّل قراءة الـ voltmeter والـ ammeter والـ wattmeter مرة ثانية.',subs:[
        {k:'set',dev:'cb',t:'لف قرص ×1µF لين C = 1.0 µF.',ok:()=>isC(1),do:A=>setC(A,1),hint:'قرص ×1µF على 1 µF وباقي الأقراص على 0 µF'},
        {k:'rec',t:'سجّل V و I و P (C = 1.0 µF) في Table 1.',ok:()=>!!ST[key(1)],rec:recC(1)}]},
      {dev:'cb',t:'4. زِد قيمة المكثف خطوة خطوة (2.0 و 3.0 µF، وبعدين من 3.2 µF إلى 6.0 µF كل 0.2 µF) وسجّل القراءات لين توصل لنقطة يكون فيها التيار أقل شي.',subs:[
        {k:'rec',dev:'cb',t:'لكل قيمة C (2.0 µF، 3.0 µF، 3.2 µF … 6.0 µF): لف أقراص الصندوق عليها وسجّل V و I و P في Table 1.',ok:s=>s.done,rec:C4.flatMap(recC),do:A=>sweep(A,0),
          hint:s=>{const c=C4.find(c=>!ST[key(c)]);return c!=null?`الحين C = ${s.C.toFixed(1)} µF: لف الأقراص لين C = ${c.toFixed(1)} µF`:'كل القيم جاهزة: سجّلها'}}]},
      {dev:'cb',t:'5. للمبة بدون مكثف: احسب الـ load resistance R، والـ inductive reactance X<sub>L</sub>، والـ impedance Z<sub>L</sub>، والـ phase angle θ<sub>L</sub> والـ PF. احسب قيمة C اللي تخلّي PF = 1.',subs:[
        {k:'set',t:'احسب في الـ sheet: R = P / I²، Z<sub>L</sub> = V / I، X<sub>L</sub> = √(Z<sub>L</sub>² − R²)، θ<sub>L</sub>، PF = cos θ<sub>L</sub>، و C = X<sub>L</sub> / (ω Z<sub>L</sub>²).',ok:()=>!!ST[key(0)]}]},
      {dev:'cb',t:'6. احسب الـ PF لكل قيمة C وكمّل Table 1. طلّع قيمة C اللي تعطي أعلى PF، وقارنها باللي حسبتها في خطوة 5.',subs:[
        {k:'set',t:'احسب PF = P / (V·I) لكل صف في Table 1، واكتب قيمة C اللي تعطي أقل تيار وأعلى PF.',ok:s=>s.done}]}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
