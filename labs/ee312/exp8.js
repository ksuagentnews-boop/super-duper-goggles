/* EE312 · Experiment 8 · SPICE Simulation II · MOS Switching Circuits (manual v8.8 pp. 57–65) — PC table.
   Procedure A: common-source / resistive-load inverter (Fig. 8.5): R1 = {RD}, M1 nmos4 N_1u, V2 = 5 V,
   V1 PULSE(0 5 0 0.1n 0.1n 10n 20n 3), .lib mosfet1u.lib, .step param RD 10k 110k 20k, .dc V1 0 5 5m (VTC),
   then .tran 0 60n 0 0.01n. Procedure B: CMOS inverter (Fig. 8.6: M1 N_1u, M2 P_1u), VTC and transient, tPLH.
   Assumptions: mosfet1u.lib is not in docs/: typical 1-µm Level-1 values are used (N_1u VTO 0.7 V, KP 127 µA/V²,
   P_1u VTO −0.7 V, KP 58.6 µA/V², λ 0.02 V⁻¹, Cox 1.73 fF/µm², 0.3 fF/µm overlap, 1.5 fF/µm drain junction) and
   W = L = 1 µm when the MOSFET has no L/W — see docs/ee312/QUESTIONS.md. The file is "already downloaded" on the
   lab PC, so step A1 is only the .lib directive. PLQs 3–5 (Fig. 8.7) are report work. */
EXP_DEFS['ee312/exp8']=(()=>{const H=ENGINE.sheet;
const RDV=[10,30,50,70,90,110];
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A: effect of increasing R<sub>D</sub>:
  <div>${H.sel('q1',[['a','Higher |voltage gain| (steeper VTC transition) as an amplifier, but a longer tPLH (slower rising output: larger RD·C) as a NOT gate'],['b','Lower gain and a shorter tPLH'],['c','No effect on gain; shorter tPLH'],['d','Higher gain and a shorter tPLH']])}</div></li>
<li class="plq">Three advantages of the CMOS inverter (Fig. 8.6) over the resistive-load inverter (Fig. 8.5):
  <div>${H.sel('q2',[['a','(1) almost zero static power (no dc path in either logic state), (2) rail-to-rail output (VOL = 0, VOH = VDD), (3) sharper VTC with larger noise margins and fast, low-resistance pull-up'],['b','It needs fewer transistors, has a resistor pull-up and draws a constant current'],['c','It only works for analog signals'],['d','Its output low level is set by RD']])}</div></li>
<li class="plq">PLQs 3–5 (cascaded inverters of Fig. 8.7, tPHL / tPLH) go in your report.</li></ol>`;
return {pc:true,
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
    g.add(G.s('a_slope')==='inc'&&!!ST.seen.CSdc,'A9 slope vs RD','larger RD → steeper (and you must run the .dc)');g.add(G.s('a_vol')==='dec','A9 VOL vs RD','larger RD → lower VOL');
    g.add(G.s('a_gate')==='not'&&!!ST.seen.CStran,'A13 gate','NOT');g.add(G.s('a_rd')==='110','A14 largest delay','RD = 110 kΩ');
    g.add(G.s('b_gate')==='not'&&!!ST.seen.INVtran,'B12 gate','NOT');const t=tplh();g.add(G.near(v('b_tplh'),t,t*0.25),'B13 tPLH',`≈ ${t.toFixed(1)} ps`);
    g.add(G.s('q1')==='a','PLQ 1');g.add(G.s('q2')==='a','PLQ 2');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'new',t:'Procedure A: ملف mosfet1u.lib محفوظ في Downloads. افتح File › New Schematic.',ok:s=>S().open},
      {dev:'comp',t:'حط قطع Fig. 8.5: R1، و nmos4 (Component) وغيّر اسمه (كليك يمين) إلى <b>N_1u</b>، و V1 و V2 = 5، والأرضي. خلّ قيمة R1 = <b>{RD}</b>.',ok:s=>comps('NM').some(c=>c.model==='N_1u')&&comps('R').some(c=>/^\{rd\}$/i.test(c.val))&&comps('V').length>=2&&comps('GND').length>=1},
      {dev:'label',t:'وصّل القطع وسمّ الـ nodes: <b>in</b> و <b>out</b>.',ok:s=>['in','out'].every(n=>labels().includes(n))},
      {dev:'dir',t:'أضف SPICE directive (S): <b>.lib mosfet1u.lib</b> وبعدها Ctrl+M و <b>.step param RD 10k 110k 20k</b>.',ok:s=>RT.hasLib()&&stepOK()},
      {dev:'comp',t:'كليك يمين على V1 ← PULSE: Vinitial = 0، Von = 5، Tdelay = 0، Trise = 0.1n، Tfall = 0.1n، Ton = 10n، Tperiod = 20n، Ncycles = 3.',ok:s=>pulseOK()},
      {dev:'ana',t:'Edit Simulation Cmd ← DC sweep: V1، Linear، Start 0، Stop 5، Increment 5m.',ok:s=>dcOK()},
      {dev:'run',t:'شغّل المحاكاة.',ok:s=>!!ST.seen.CSdc},
      {dev:'run',t:'اضغط على out عشان تشوف الـ VTC لكل R<sub>D</sub>. جاوب: أثر R<sub>D</sub> على الميل و V<sub>OL</sub>.',ok:s=>ST.seen.CSdc&&tr('V(out)')},
      {dev:'ana',t:'Edit Simulation Cmd ← Transient: Stop time = 60n، Time to start saving data = 0، Maximum Timestep = 0.01n.',ok:s=>tranOK()},
      {dev:'run',t:'شغّل.',ok:s=>!!ST.seen.CStran},
      {dev:'run',t:'اضغط على out ثم in. أي بوابة منطقية؟',ok:s=>s.kind==='CStran'&&tr('V(out)')&&tr('V(in)')},
      {dev:'run',t:'كبّر (اسحب مستطيل) حول المنطقة اللي ينزل فيها الدخل ويطلع الخرج. أي R<sub>D</sub> يعطي أكبر تأخير؟',ok:s=>!!ST.zCStran},
      {dev:'save',t:'احفظ (Ctrl+S).',ok:s=>!!ST.savedA},
      {dev:'new',t:'Procedure B: File › New Schematic.',ok:s=>!!ST.newB},
      {dev:'comp',t:'ركّب Fig. 8.6: nmos4 = <b>N_1u</b> و pmos4 = <b>P_1u</b>، و V2 = 5، و V1 (نفس الـ PULSE)، والأرضي، وسمّ <b>in</b> و <b>out</b>.',ok:s=>ST.newB&&comps('NM').some(c=>c.model==='N_1u')&&comps('PM').some(c=>c.model==='P_1u')&&['in','out'].every(n=>labels().includes(n))&&pulseOK()},
      {dev:'dir',t:'أضف .lib mosfet1u.lib وأمر .dc V1 0 5 0.005، وشغّل واضغط على out (الـ VTC).',ok:s=>ST.seen.INVdc&&tr('V(out)')},
      {dev:'ana',t:'Transient: Stop time = 60n، Maximum Timestep = 0.01n، وشغّل واضغط على out ثم in.',ok:s=>s.kind==='INVtran'&&tr('V(out)')&&tr('V(in)')},
      {dev:'run',t:'كبّر حول نزول الدخل وطلوع الخرج، وقِس t<sub>PLH</sub> وسجّله.',ok:s=>!!ST.zINVtran},
      {dev:'save',t:'احفظ (Ctrl+S).',ok:s=>!!ST.savedB}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.seen={};$('result').innerHTML=''}};
}};})();
