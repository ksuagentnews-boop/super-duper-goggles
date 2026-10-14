/* EE312 · Experiment 8 · SPICE Simulation II · MOS Switching Circuits (manual v8.8 pp. 57–65) — PC table.
   Procedure A: common-source / resistive-load inverter (Fig. 8.5): R1 = {RD}, M1 nmos4 N_1u, V2 = 5 V,
   V1 PULSE(0 5 0 0.1n 0.1n 10n 20n 3), .lib mosfet1u.lib, .step param RD 10k 110k 20k, .dc V1 0 5 5m (VTC),
   then .tran 0 60n 0 0.01n. Procedure B: CMOS inverter (Fig. 8.6: M1 N_1u, M2 P_1u), VTC and transient, tPLH.
   Assumptions: mosfet1u.lib is not in docs/: typical 1-µm Level-1 values are used (N_1u VTO 0.7 V, KP 127 µA/V²,
   P_1u VTO −0.7 V, KP 58.6 µA/V², λ 0.02 V⁻¹, Cox 1.73 fF/µm², 0.3 fF/µm overlap, 1.5 fF/µm drain junction) and
   W = L = 1 µm when the MOSFET has no L/W — see docs/ee312/QUESTIONS.md. The file is "already downloaded" on the
   lab PC, so step A1 ticks by itself. PLQs 3–5 (Fig. 8.7) are report work.
   Steps = the manual's numbered steps (A 1–15, B 1–14); steps that record a value or an answer carry rec (Manual «Capture»
   reads it from the student's own last run); Exam keeps the ok checks and the graded sheet. */
EXP_DEFS['ee312/exp8']=(()=>{const H=ENGINE.sheet;
const RDV=[10,30,50,70,90,110];
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A: effect of increasing R<sub>D</sub>:
  <div>${H.sel('q1',[['a','Higher |voltage gain| (steeper VTC transition) as an amplifier, but a longer tPLH (slower rising output: larger RD·C) as a NOT gate'],['b','Lower gain and a shorter tPLH'],['c','No effect on gain; shorter tPLH'],['d','Higher gain and a shorter tPLH']])}</div></li>
<li class="plq">Three advantages of the CMOS inverter (Fig. 8.6) over the resistive-load inverter (Fig. 8.5):
  <div>${H.sel('q2',[['a','(1) almost zero static power (no dc path in either logic state), (2) rail-to-rail output (VOL = 0, VOH = VDD), (3) sharper VTC with larger noise margins and fast, low-resistance pull-up'],['b','It needs fewer transistors, has a resistor pull-up and draws a constant current'],['c','It only works for analog signals'],['d','Its output low level is set by RD']])}</div></li>
<li class="plq">PLQs 3–5 (cascaded inverters of Fig. 8.7, tPHL / tPLH) go in your report.</li></ol>`;
return {pc:true,procs:[{id:'A',title:'Resistive-load inverter: Fig. 8.5'},{id:'B',title:'CMOS inverter: Fig. 8.6'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 8 · SPICE Simulation II · MOS Switching Circuits</h2>
<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="figbox" style="padding:8px;flex:1;min-width:200px"><img class="figimg" src="labs/ee312/fig/fig8-5.png" alt="Fig. 8.5"></div><div class="figbox" style="padding:8px;flex:1;min-width:200px"><img class="figimg" src="labs/ee312/fig/fig8-6.png" alt="Fig. 8.6"></div></div>
<div class="hint" style="text-align:center">Fig. 8.5 · CS circuit (resistive-load inverter) · Fig. 8.6 · CMOS inverter · <span class="m">C:\\Users\\student\\Downloads\\mosfet1u.lib</span> is already on this PC</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<h3>Procedure A</h3><div class="en">
${H.row('9. Larger R<sub>D</sub> → slope magnitude in the transition region:',H.sel('a_slope',[['inc','increases (higher gain)'],['dec','decreases'],['same','does not change']]))}
${H.row('9. Larger R<sub>D</sub> → V<sub>OL</sub>:',H.sel('a_vol',[['dec','decreases'],['inc','increases'],['same','does not change']]))}
${H.row('13. Logic gate implemented:',H.sel('a_gate',[['not','NOT (inverter)'],['and','AND'],['or','OR'],['buf','Buffer']]))}
${H.row('14. R<sub>D</sub> with the largest propagation delay:',H.sel('a_rd',RDV.map(v=>[String(v),v+' kΩ'])))}</div>
<h3>Procedure B</h3><div class="en">
${H.row('12. Logic gate implemented:',H.sel('b_gate',[['not','NOT (inverter)'],['and','AND'],['or','OR'],['buf','Buffer']]))}
${H.row('13. t<sub>PLH</sub> (50 % of v<sub>in</sub> falling → 50 % of v<sub>out</sub> rising) =',H.num('b_tplh','0.1'),'ps')}</div>
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
onRun(RT,res){EXP8.classify(RT,res)},
setup(RT){
  const G=ENGINE.sheet,A=Math.abs,S=()=>RT.S;
  const SRC=`V2 vdd 0 5
V1 in 0 PULSE(0 5 0 0.1n 0.1n 10n 20n 3)
.lib mosfet1u.lib`;
  const CS=`${SRC}
.step param RD 10k 110k 20k
R1 vdd out {RD}
M1 out in 0 0 N_1u`;
  const INV=`${SRC}
M1 out in 0 0 N_1u
M2 out in vdd vdd P_1u`;
  const DC='\n.dc V1 0 5 5m',TR='\n.tran 0 60n 0 0.01n';
  const DEFS={CSdc:CS+DC,CStran:CS+TR,INVdc:INV+DC,INVtran:INV+TR};
  const REF={};const ref=k=>REF[k]||(REF[k]=RT.sim(DEFS[k]));
  const same=(res,R,expr)=>{const a=RT.evalOn(res,expr),b=RT.evalOn(R,expr);if(!a||!b||a.length!==b.length)return false;
    return a.every((arr,i)=>{const q=b[i];if(arr.length!==q.length)return false;let d=0;q.forEach((v,k)=>d=Math.max(d,A(v-arr[k])));return d<=0.03})};
  const ST={seen:{}};
  window.EXP8={classify(RT,res){let kind=null;const a=res.a;const order=a.kind==='dc'?['CSdc','INVdc']:a.kind==='tran'?['CStran','INVtran']:[];
    for(const k of order){const R=ref(k);if(R.err)continue;if(same(res,R,'V(out)')){kind=k;break}}res.kind=kind;if(kind){ST.seen[kind]=true;ST.zoom0=S().zooms||0}}};
  const tr=e=>S().traces.some(t=>t.expr.toLowerCase()===e.toLowerCase());const labels=()=>S().labels.map(l=>l.name.toLowerCase());
  const comps=t=>S().comps.filter(c=>c.type===t);
  const pulseOK=()=>S().comps.some(c=>c.src&&c.src.kind==='PULSE'&&[0,5,0,0.1e-9,0.1e-9,10e-9,20e-9,3].every((v,i)=>A((SPICE.num(c.src.args[i])||0)-v)<=A(v)*1e-6+1e-15));
  const anaIs=(k,f)=>{const a=RT.analysis();return a&&a.kind===k&&f(a)};
  const dcOK=()=>anaIs('dc',a=>/^v1$/i.test(a.src)&&A(a.from)<1e-12&&A(a.to-5)<1e-9&&A(a.inc-5e-3)<1e-9),tranOK=()=>anaIs('tran',a=>A(a.stop-60e-9)<1e-15&&A(a.max-0.01e-9)<1e-16&&!a.start);
  const stepOK=()=>{const p=RT.stepParam();return p&&p.name==='rd'&&p.vals.length===6&&A(p.vals[0]-1e4)<1&&A(p.vals[5]-1.1e5)<1};
  function status(){const s=S();const st={kind:s.res&&s.res.kind};
    if((st.kind==='CStran'||st.kind==='INVtran')&&(s.zooms||0)>ST.zoom0)ST['z'+st.kind]=true;
    const sv=k=>{if(ST[k+'_0']==null)ST[k+'_0']=s.saved;return s.saved>ST[k+'_0']};
    if(ST.zCStran&&tr('V(in)')&&sv('a'))ST.savedA=true;
    if(ST.savedA){if(ST.n0==null)ST.n0=s.news;if(s.news>ST.n0)ST.newB=true}
    if(ST.zINVtran&&sv('b'))ST.savedB=true;
    return st}
  /* tPLH of the reference CMOS inverter: input falls through 2.5 V at 10.15 ns; output rises through 2.5 V */
  function tplh(){const R=ref('INVtran');const vi=RT.evalOn(R,'V(in)')[0],vo=RT.evalOn(R,'V(out)')[0],xs=R.runs[0].xs;const cross=(v,up,t0)=>{for(let k=1;k<xs.length;k++){if(xs[k]<t0)continue;if(up?(v[k-1]<2.5&&v[k]>=2.5):(v[k-1]>2.5&&v[k]<=2.5))return xs[k-1]+(2.5-v[k-1])/(v[k]-v[k-1])*(xs[k]-xs[k-1])}return NaN};
    const ti=cross(vi,false,5e-9);return (cross(vo,true,ti)-ti)*1e12}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    g.proc('A');g.add(G.s('a_slope')==='inc'&&!!ST.seen.CSdc,'A9 slope vs RD','larger RD → steeper (and you must run the .dc)');g.add(G.s('a_vol')==='dec','A9 VOL vs RD','larger RD → lower VOL');
    g.add(G.s('a_gate')==='not'&&!!ST.seen.CStran,'A13 gate','NOT');g.add(G.s('a_rd')==='110','A14 largest delay','RD = 110 kΩ');
    g.proc('B');g.add(G.s('b_gate')==='not'&&!!ST.seen.INVtran,'B12 gate','NOT');const t=tplh();g.add(G.near(v('b_tplh'),t,t*0.25),'B13 tPLH',`≈ ${t.toFixed(1)} ps`);
    g.proc('A');g.add(G.s('q1')==='a','PLQ 1');g.proc(null);g.add(G.s('q2')==='a','PLQ 2');
    g.show($('result'))});
  /* Capture (Manual): read off the student's own last run */
  const cur=k=>{const r=S().res;return r&&!r.err&&r.runs&&r.kind===k?r:null};
  const cross=(xs,v,up,t0)=>{for(let k=1;k<xs.length;k++){if(xs[k]<t0)continue;if(up?(v[k-1]<2.5&&v[k]>=2.5):(v[k-1]>2.5&&v[k]<=2.5))return xs[k-1]+(2.5-v[k-1])/(v[k]-v[k-1])*(xs[k]-xs[k-1])}return NaN};
  const delays=R=>{const vi=RT.evalOn(R,'V(in)'),vo=RT.evalOn(R,'V(out)');if(!vi||!vo)return null;return vo.map((o,i)=>{const xs=R.runs[i].xs,ti=cross(xs,vi[i],false,5e-9);return cross(xs,o,true,ti)-ti})};
  const vtc=()=>{const R=cur('CSdc');if(!R)return null;const vo=RT.evalOn(R,'V(out)');if(!vo||vo.length<2)return null;
    const sl=vo.map((o,i)=>{const xs=R.runs[i].xs;let m=0;for(let k=1;k<xs.length;k++)m=Math.max(m,Math.abs((o[k]-o[k-1])/(xs[k]-xs[k-1])));return m});
    return {slope:sl[sl.length-1]>sl[0]?'inc':'dec',vol:vo[vo.length-1][vo[vo.length-1].length-1]<vo[0][vo[0].length-1]?'dec':'inc'}};
  const TX={inc:'increases',dec:'decreases',same:'does not change'};
  const gate=k=>()=>{const R=cur(k);if(!R||!tr('V(in)')||!tr('V(out)'))return null;const vi=RT.evalOn(R,'V(in)')[0],vo=RT.evalOn(R,'V(out)')[0],xs=R.runs[0].xs;
    const at=t=>{let k=xs.findIndex(x=>x>=t);return k<0?xs.length-1:k};const a=at(5e-9),b=at(15e-9);return vi[a]>2.5&&vo[a]<2.5&&vi[b]<2.5&&vo[b]>2.5?'not':'buf'};
  const NR='شغّل المحاكاة على دائرة الخطوة أول.';
  return {status,
    steps:[
      /* Procedure A (manual pp. 61–62), steps 1–15 */
      {dev:'new',t:'Procedure A · 1. نزّل الملف اللي فيه الـ SPICE models لـ one-µm process واحفظه: <b>mosfet1u.lib</b> (محفوظ في Downloads في هالكمبيوتر). بتحتاج مساره لمّا تضيف الـ .lib directive.',ok:()=>true},
      {dev:'new',t:'2. افتح LTspice، وروح File › New Schematic.',ok:s=>S().open},
      {dev:'comp',t:'3. حط كل القطع اللي تحتاجها دائرة Fig. 8.5. عشان تجيب الـ N_1u: أضف nmos4، وبعدها كليك يمين على اسمه الافتراضي (NMOS) وغيّره إلى <b>N_1u</b>.',acts:['R1 = <b>{RD}</b>، و M1 (nmos4 = N_1u)، و V1، و V2 = 5، والأرضي.'],
        ok:s=>comps('NM').some(c=>c.model==='N_1u')&&comps('R').some(c=>/^\{rd\}$/i.test(c.val))&&comps('V').length>=2&&comps('GND').length>=1},
      {dev:'label',t:'4. وصّل كل القطع، وسمّ الـ nodes: <b>in</b> و <b>out</b>.',ok:s=>['in','out'].every(n=>labels().includes(n))},
      {dev:'dir',t:'5. عشان تضيف أوامر .lib و .step: Edit › SPICE directive (أو زر S)، واكتب <b>.lib mosfet1u.lib</b> مثل Fig. 8.5، وبعدها Ctrl+M واكتب <b>.step param RD 10k 110k 20k</b>.',ok:s=>RT.hasLib()&&stepOK()},
      {dev:'comp',t:'6. كليك يمين على V1 ← Advanced ← PULSE، وعبّي: Vinitial = 0، Von = 5، Tdelay = 0، Trise = 0.1n، Tfall = 0.1n، Ton = 10n، Tperiod = 20n، Ncycles = 3.',ok:s=>pulseOK()},
      {dev:'ana',t:'7. عشان تضيف DC sweep (.dc): Edit › SPICE analysis، وعبّي: Name of 1st source to sweep = V1، Type of sweep = Linear، Start value = 0، Stop value = 5، Increment = 5m، واضغط OK.',ok:s=>dcOK()},
      {dev:'run',t:'8. شغّل المحاكاة: Simulate › Run (أو أيقونة الـ run).',ok:s=>!!ST.seen.CSdc},
      {dev:'run',t:'9. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف منحنيات الـ VTC.',acts:['كيف تأثّر R<sub>D</sub> في الـ transition region على مقدار الميل (يعني الـ voltage gain)؟','كيف تأثّر R<sub>D</sub> على الـ output low level V<sub>OL</sub>؟'],ok:s=>ST.seen.CSdc&&tr('V(out)'),
        rec:[{to:'a_slope',val:()=>{const v=tr('V(out)')&&vtc();return v?v.slope:null},txt:v=>TX[v],label:'Slope (gain) vs R<sub>D</sub>',none:NR},{to:'a_vol',val:()=>{const v=tr('V(out)')&&vtc();return v?v.vol:null},txt:v=>TX[v],label:'V<sub>OL</sub> vs R<sub>D</sub>',none:NR}]},
      {dev:'ana',t:'10. للـ transient analysis: Edit › SPICE analysis ← Transient، وعبّي: Stop time = 60n، Time to start saving data = 0، Maximum Timestep = 0.01n.',ok:s=>tranOK()},
      {dev:'run',t:'11. اضغط أيقونة الـ run.',ok:s=>!!ST.seen.CStran},
      {dev:'run',t:'12. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف موجات جهد الخرج.',ok:s=>s.kind==='CStran'&&tr('V(out)')},
      {dev:'run',t:'13. حط الماوس على node الـ <b>in</b> واضغط عشان تشوف موجة الدخل. أي logic gate تسوّيها الدائرة؟',ok:s=>s.kind==='CStran'&&tr('V(out)')&&tr('V(in)'),
        rec:[{to:'a_gate',val:gate('CStran'),txt:v=>v==='not'?'NOT (inverter)':'Buffer',label:'Logic gate',none:NR}]},
      {dev:'run',t:'14. بالماوس كبّر (اسحب مستطيل) حول منطقة الانتقال، اللي ينزل فيها الدخل ويطلع الخرج. أي قيمة لـ R<sub>D</sub> تعطي أكبر propagation delay؟',ok:s=>!!ST.zCStran,
        rec:[{to:'a_rd',val:()=>{const R=cur('CStran');const d=R&&delays(R);if(!d||d.length!==RDV.length||d.some(x=>!isFinite(x)))return null;return String(RDV[d.indexOf(Math.max(...d))])},txt:v=>v+' kΩ',label:'R<sub>D</sub> with the largest delay',none:NR}]},
      {dev:'save',t:'15. احفظ الدائرة بـ Ctrl+S.',ok:s=>!!ST.savedA},
      /* Procedure B (manual pp. 63–64), steps 1–14 */
      {dev:'new',t:'Procedure B · 1. روح File › New Schematic.',ok:s=>!!ST.newB},
      {dev:'comp',t:'2. حط كل القطع اللي تحتاجها دائرة Fig. 8.6. للـ N_1u: أضف nmos4 وغيّر اسمه إلى <b>N_1u</b>؛ وللـ P_1u: أضف pmos4 وغيّر اسمه إلى <b>P_1u</b>.',ok:s=>!!ST.newB&&comps('NM').some(c=>c.model==='N_1u')&&comps('PM').some(c=>c.model==='P_1u')&&comps('V').length>=2},
      {dev:'label',t:'3. وصّل كل القطع، وأضف ground (GND)، وسمّ الـ nodes: <b>in</b> و <b>out</b>.',ok:s=>comps('GND').length>=1&&['in','out'].every(n=>labels().includes(n))},
      {dev:'comp',t:'4. اضبط V1 مثل ما سوّيت في Procedure A (نفس الـ PULSE)، و V2 = 5.',ok:s=>pulseOK()},
      {dev:'dir',t:'5. أضف أمر <b>.lib mosfet1u.lib</b> مثل Procedure A.',ok:s=>RT.hasLib()},
      {dev:'ana',t:'6. أضف أمر الـ .dc مثل Procedure A (V1، Linear، 0 → 5، Increment 5m).',ok:s=>dcOK()},
      {dev:'run',t:'7. اضغط أيقونة الـ run.',ok:s=>!!ST.seen.INVdc},
      {dev:'run',t:'8. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف منحنى الـ VTC.',ok:s=>s.kind==='INVdc'&&tr('V(out)')},
      {dev:'ana',t:'9. الحين transient analysis: Edit › SPICE analysis ← Transient، وعبّي: Stop time = 60n، Time to start saving data = 0، Maximum Timestep = 0.01n.',ok:s=>tranOK()},
      {dev:'run',t:'10. اضغط أيقونة الـ run.',ok:s=>!!ST.seen.INVtran},
      {dev:'run',t:'11. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف موجات الخرج.',ok:s=>s.kind==='INVtran'&&tr('V(out)')},
      {dev:'run',t:'12. حط الماوس على node الـ <b>in</b> واضغط عشان تشوف موجة الدخل. أي logic gate تسوّيها الدائرة؟',ok:s=>s.kind==='INVtran'&&tr('V(out)')&&tr('V(in)'),
        rec:[{to:'b_gate',val:gate('INVtran'),txt:v=>v==='not'?'NOT (inverter)':'Buffer',label:'Logic gate',none:NR}]},
      {dev:'run',t:'13. بالماوس كبّر (اسحب مستطيل) حول منطقة الانتقال، اللي ينزل فيها الدخل ويطلع الخرج. أوجد الـ propagation delay لمّا الخرج يتغيّر من low لـ high، يعني t<sub>PLH</sub>.',ok:s=>!!ST.zINVtran,
        rec:[{to:'b_tplh',val:()=>{const R=cur('INVtran');const d=R&&delays(R);return d&&isFinite(d[0])?d[0]*1e12:null},unit:'ps',dec:1,label:'t<sub>PLH</sub>',none:NR}]},
      {dev:'save',t:'14. احفظ الدائرة بـ Ctrl+S.',ok:s=>!!ST.savedB}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.seen={};$('result').innerHTML=''}};
}};})();
