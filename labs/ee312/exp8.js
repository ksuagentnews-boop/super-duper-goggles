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
  /* ---------- Batch 7 item 3: «do it for me» on the PC. The app's own state is changed one item at a time and redrawn, so
     the student sees the parts, wires, labels and directives appear (menu commands go through RT.act). L = the reference
     drawing of a figure: comps {type,x,y,rot,name}, wires [[x1,y1,x2,y2]], labels {name,x,y}. ---------- */
  const PC=(()=>{const draw=()=>{BENCH.sim.render();BENCH.onRender()};const lc=x=>String(x||'').toLowerCase();
    const find=d=>RT.S.comps.find(q=>d.name?lc(q.name)===lc(d.name):q.type===d.type&&q.x===d.x&&q.y===d.y);
    const mk=d=>{const s=RT.S;let c=find(d);if(c)return c;c={id:RT.uid++,type:d.type,x:d.x,y:d.y,rot:d.rot||0,mir:false,val:'',model:null};
      const p=SPICE.SYM[d.type].pre;if(p){c.name=d.name||p+((s.cnt[p]||0)+1);const n=+c.name.slice(p.length);s.cnt[p]=Math.max(s.cnt[p]||0,isFinite(n)?n:0)}
      if(d.type==='R')c.val='R';if(d.type==='C')c.val='C';if(d.type==='L')c.val='L';if(d.type==='D')c.model='D';if(d.type==='V')c.src={kind:'DC',dc:''};
      if(d.type==='NM')c.model='NMOS';if(d.type==='PM')c.model='PMOS';if(d.type==='OA')c.model=d.model||'OP747';s.comps.push(c);return c};
    const setv=(c,d)=>{if(d.val!=null)c.val=d.val;if(d.model)c.model=d.model;if(d.dc!=null){c.src={kind:'DC',dc:String(d.dc)};c.val=String(d.dc)}
      if(d.wave){c.src={kind:d.wave,args:d.args.map(String)};c.val=`${d.wave}(${c.src.args.join(' ')})`}};
    const P={draw,find,
      /* the parts of the list that are not there yet, one by one at their reference place */
      place:async(A,list)=>{for(const d of list){if(find(d))continue;mk(d);draw();await A.wait(160)}},
      /* every part of the drawing to its reference place (made when missing), then the wires of the drawing instead of the old ones */
      wire:async(A,L)=>{L.comps.forEach(d=>{const c=mk(d);c.x=d.x;c.y=d.y;c.rot=d.rot||0;c.mir=false});RT.S.wires=[];draw();await A.wait(160);
        for(const [x1,y1,x2,y2] of L.wires){RT.S.wires.push({id:RT.uid++,x1,y1,x2,y2});draw();await A.wait(110)}},
      label:async(A,list)=>{for(const l of list){if(RT.S.labels.some(q=>lc(q.name)===lc(l.name)))continue;RT.S.labels.push({id:RT.uid++,x:l.x,y:l.y,name:l.name});draw();await A.wait(160)}},
      value:async(A,name,props)=>{const c=find({name});if(!c)return;setv(c,props);draw();await A.wait(200)},
      dir:async(A,text,x,y)=>{if(RT.directives().some(l=>lc(l)===lc(text)))return;RT.S.dirs.push({id:RT.uid++,x,y,text});draw();await A.wait(200)},
      /* Edit › SPICE Analysis › OK: the analysis line replaces the old .tran / .dc / .op line */
      ana:async(A,line,x,y)=>{const s=RT.S;const old=s.dirs.find(q=>/^\s*\.(tran|dc|op)\b/im.test(q.text));
        if(old)old.text=old.text.split('\n').map(l=>/^\s*\.(tran|dc|op)\b/i.test(l)?line:l).join('\n');else s.dirs.push({id:RT.uid++,x,y,text:line});draw();await A.wait(200)},
      act:async(A,k)=>{RT.S.tool='sel';RT.act(k);await A.wait(200)},
      run:async A=>{RT.S.tool='sel';RT.S.dlg=null;RT.run();await A.wait(250)},
      trace:async(A,e)=>{const s=RT.S;if(!RT.evalTrace(e))return;if(!s.traces.some(t=>lc(t.expr)===lc(e)))s.traces.push({expr:e,c:s.traces.length});s.wavesOpen=true;draw();await A.wait(220)},
      untrace:async(A,e)=>{const s=RT.S;s.traces=s.traces.filter(t=>lc(t.expr)!==lc(e));if(lc(s.avg)===lc(e))s.avg=null;draw();await A.wait(200)},
      zoom:async(A,x0,x1)=>{const s=RT.S;s.wavesOpen=true;s.zoom={x0,x1,y0:null,y1:null};s.zooms=(s.zooms||0)+1;draw();await A.wait(250)},
      avg:async(A,e)=>{RT.S.avg=e;draw();await A.wait(250)},
      fit:async A=>{const s=RT.S;s.zoom=null;s.fitted=(s.fitted||0)+1;draw();await A.wait(200)},
      /* every pin of the drawing is joined to another pin or to ground (nothing left dangling) */
      wired:()=>{const N=RT.fromSchematic();const cnt={};N.list.forEach(e=>e.nodes.forEach(n=>{if(n!=null)cnt[n]=(cnt[n]||0)+1}));
        return N.list.length>1&&N.list.every(e=>e.nodes.every(n=>n!=null&&(n==='0'||cnt[n]>=2)))}};
    return P})();
  /* the reference drawings (the layout tests/exp/ee312-exp8.mjs draws): Fig. 8.5 and Fig. 8.6 */
  const G4=(...p)=>p.map(([x,y])=>({type:'GND',x,y}));
  const C85=[{type:'V',name:'V1',x:0,y:4},{type:'V',name:'V2',x:10,y:-2},{type:'R',name:'R1',x:6,y:-2},{type:'NM',name:'M1',x:4,y:2}],GN85=G4([10,2],[6,6],[0,8]);
  const L85={comps:[...C85,...GN85],wires:[[6,-2,10,-2],[7,4,7,6],[7,6,6,6],[0,4,4,4]]};
  const C86=[{type:'V',name:'V1',x:0,y:2},{type:'V',name:'V2',x:10,y:-4},{type:'NM',name:'M1',x:4,y:0},{type:'PM',name:'M2',x:4,y:-4}],GN86=G4([0,6],[10,0],[6,4]);
  const L86={comps:[...C86,...GN86],wires:[[6,-4,10,-4],[7,-2,7,-4],[7,2,7,4],[7,4,6,4],[4,-2,2,-2],[2,-2,2,2],[2,2,4,2],[0,2,2,2]]};
  const ofN=(L,...n)=>L.filter(d=>n.includes(d.name));
  const v5=()=>comps('V').some(c=>c.src&&c.src.kind==='DC'&&A(SPICE.num(c.src.dc)-5)<1e-9);
  const PULSE=[0,5,0,'0.1n','0.1n','10n','20n',3];
  const pulseDo=async A=>{const v=comps('V').find(c=>!(c.src&&c.src.kind==='DC'&&SPICE.num(c.src.dc)===5))||byName('V1');if(v)await PC.value(A,v.name,{wave:'PULSE',args:PULSE})};
  const byName=n=>S().comps.find(c=>c.name&&c.name.toLowerCase()===n.toLowerCase());
  const PULSET='Vinitial = 0 V، Von = 5 V، Tdelay = 0 s، Trise = 0.1 ns، Tfall = 0.1 ns، Ton = 10 ns، Tperiod = 20 ns، Ncycles = 3 دورات';
  const DCT='Name of 1st source to sweep = V1، Type of sweep = Linear، Start value = 0 V، Stop value = 5 V، Increment = 5 mV';
  const TRT='Stop time = 60 ns، Time to start saving data = 0 s، Maximum Timestep = 0.01 ns';
  const runS=(ok,fig)=>({k:'set',dev:'run',t:'اضغط أيقونة الـ run.',ok,do:PC.run,hint:`اضغط Run؛ لو ما تحقق، قارن الدائرة والقيم والأوامر مع ${fig}`});
  const trS=(e,ok,t)=>({k:'set',dev:'run',t,ok,do:A=>PC.trace(A,e)});
  const zoomS=ok=>({k:'set',dev:'run',t:'اسحب مستطيل حول منطقة الانتقال (الدخل ينزل والخرج يطلع، حول 10 ns).',ok,do:A=>PC.zoom(A,9e-9,13e-9)});
  return {status,
    steps:[
      /* Procedure A (manual pp. 61–62), steps 1–15 */
      {dev:'new',t:'Procedure A · 1. نزّل الملف اللي فيه الـ SPICE models لـ one-µm process واحفظه: <b>mosfet1u.lib</b> (محفوظ في Downloads في هالكمبيوتر). بتحتاج مساره لمّا تضيف الـ .lib directive.',subs:[
        {k:'set',dev:'new',t:'الملف mosfet1u.lib موجود في Downloads.',ok:()=>true}]},
      {dev:'new',t:'2. افتح LTspice، وروح File › New Schematic.',subs:[{k:'set',dev:'new',t:'File › New Schematic.',ok:()=>S().open,do:async A=>{if(!RT.S.open)await PC.act(A,'new')}}]},
      {dev:'comp',t:'3. حط كل القطع اللي تحتاجها دائرة Fig. 8.5. عشان تجيب الـ N_1u: أضف nmos4، وبعدها كليك يمين على اسمه الافتراضي (NMOS) وغيّره إلى <b>N_1u</b>.',subs:[
        {k:'set',dev:'R',t:'R1 = <b>{RD}</b>.',ok:()=>comps('R').some(c=>/^\{rd\}$/i.test(c.val)),do:async A=>{await PC.place(A,ofN(C85,'R1'));await PC.value(A,'R1',{val:'{RD}'})}},
        {k:'set',dev:'comp',t:'M1: nmos4، وغيّر اسمه إلى N_1u.',ok:()=>comps('NM').some(c=>c.model==='N_1u'),do:async A=>{await PC.place(A,ofN(C85,'M1'));await PC.value(A,'M1',{model:'N_1u'})}},
        {k:'set',dev:'comp',t:'V1، و V2 = 5 V.',ok:()=>comps('V').length>=2&&v5(),do:async A=>{await PC.place(A,ofN(C85,'V1','V2'));await PC.value(A,'V2',{dc:5})}},
        {k:'set',dev:'GND',t:'الأرضي (GND).',ok:()=>comps('GND').length>=1,do:A=>PC.place(A,GN85)}]},
      {dev:'label',t:'4. وصّل كل القطع، وسمّ الـ nodes: <b>in</b> و <b>out</b>.',subs:[
        {k:'set',dev:'wire',t:'وصّل كل القطع مثل Fig. 8.5.',ok:()=>PC.wired(),do:A=>PC.wire(A,L85),hint:'فيه طرف قطعة مو موصول بشي: كل طرف لازم يلاقي طرف ثاني أو wire أو GND'},
        {k:'set',dev:'label',t:'سمّ الـ nodes: in و out.',ok:()=>['in','out'].every(n=>labels().includes(n)),do:A=>PC.label(A,[{name:'in',x:0,y:4},{name:'out',x:6,y:2}])}]},
      {dev:'dir',t:'5. عشان تضيف أوامر .lib و .step: Edit › SPICE directive (أو زر S)، واكتب <b>.lib mosfet1u.lib</b> مثل Fig. 8.5، وبعدها Ctrl+M واكتب <b>.step param RD 10k 110k 20k</b>.',subs:[
        {k:'set',dev:'dir',t:'<b>.lib mosfet1u.lib</b>',ok:()=>RT.hasLib(),do:A=>PC.dir(A,'.lib mosfet1u.lib',14,-2)},
        {k:'set',dev:'dir',t:'<b>.step param RD 10k 110k 20k</b>',ok:()=>stepOK(),do:A=>PC.dir(A,'.step param RD 10k 110k 20k',14,-1)}]},
      {dev:'comp',t:`6. كليك يمين على V1 ← Advanced ← PULSE، وعبّي: ${PULSET}.`,subs:[{k:'set',dev:'comp',t:`V1 › PULSE: ${PULSET}.`,ok:()=>pulseOK(),do:pulseDo}]},
      {dev:'ana',t:`7. عشان تضيف DC sweep (.dc): Edit › SPICE analysis، وعبّي: ${DCT}، واضغط OK.`,subs:[{k:'set',dev:'ana',t:`DC sweep: ${DCT}.`,ok:()=>dcOK(),do:A=>PC.ana(A,'.dc V1 0 5 5m',14,4)}]},
      {dev:'run',t:'8. شغّل المحاكاة: Simulate › Run (أو أيقونة الـ run).',subs:[runS(()=>!!ST.seen.CSdc,'Fig. 8.5')]},
      {dev:'run',t:'9. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف منحنيات الـ VTC.',subs:[
        trS('V(out)',()=>ST.seen.CSdc&&tr('V(out)'),'اضغط على out: V(out) (منحنى لكل R<sub>D</sub>).'),
        {k:'rec',t:'كيف تأثّر R<sub>D</sub> على مقدار الميل في الـ transition region (الـ voltage gain)، وعلى الـ output low level V<sub>OL</sub>؟',ok:()=>ST.seen.CSdc&&tr('V(out)'),
          rec:[{to:'a_slope',val:()=>{const v=tr('V(out)')&&vtc();return v?v.slope:null},txt:v=>TX[v],label:'Slope (gain) vs R<sub>D</sub>',none:NR},{to:'a_vol',val:()=>{const v=tr('V(out)')&&vtc();return v?v.vol:null},txt:v=>TX[v],label:'V<sub>OL</sub> vs R<sub>D</sub>',none:NR}]}]},
      {dev:'ana',t:`10. للـ transient analysis: Edit › SPICE analysis ← Transient، وعبّي: ${TRT}.`,subs:[{k:'set',dev:'ana',t:`Transient: ${TRT}.`,ok:()=>tranOK(),do:A=>PC.ana(A,'.tran 0 60n 0 0.01n',14,4)}]},
      {dev:'run',t:'11. اضغط أيقونة الـ run.',subs:[runS(()=>!!ST.seen.CStran,'Fig. 8.5')]},
      {dev:'run',t:'12. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف موجات جهد الخرج.',subs:[trS('V(out)',s=>s.kind==='CStran'&&tr('V(out)'),'اضغط على out: V(out).')]},
      {dev:'run',t:'13. حط الماوس على node الـ <b>in</b> واضغط عشان تشوف موجة الدخل. أي logic gate تسوّيها الدائرة؟',subs:[
        trS('V(in)',s=>s.kind==='CStran'&&tr('V(out)')&&tr('V(in)'),'اضغط على in: V(in).'),
        {k:'rec',t:'أي logic gate؟',ok:s=>s.kind==='CStran'&&tr('V(out)')&&tr('V(in)'),rec:[{to:'a_gate',val:gate('CStran'),txt:v=>v==='not'?'NOT (inverter)':'Buffer',label:'Logic gate',none:NR}]}]},
      {dev:'run',t:'14. بالماوس كبّر (اسحب مستطيل) حول منطقة الانتقال، اللي ينزل فيها الدخل ويطلع الخرج. أي قيمة لـ R<sub>D</sub> تعطي أكبر propagation delay؟',subs:[
        zoomS(()=>!!ST.zCStran),
        {k:'rec',t:'أي R<sub>D</sub> تعطي أكبر delay؟',ok:()=>!!ST.zCStran,rec:[{to:'a_rd',val:()=>{const R=cur('CStran');const d=R&&delays(R);if(!d||d.length!==RDV.length||d.some(x=>!isFinite(x)))return null;return String(RDV[d.indexOf(Math.max(...d))])},txt:v=>v+' kΩ',label:'R<sub>D</sub> with the largest delay',none:NR}]}]},
      {dev:'save',t:'15. احفظ الدائرة بـ Ctrl+S.',subs:[{k:'set',dev:'save',t:'Ctrl+S (File › Save).',ok:()=>!!ST.savedA,do:A=>PC.act(A,'save')}]},
      /* Procedure B (manual pp. 63–64), steps 1–14 */
      {dev:'new',t:'Procedure B · 1. روح File › New Schematic.',subs:[{k:'set',dev:'new',t:'File › New Schematic.',ok:()=>!!ST.newB,do:A=>PC.act(A,'new')}]},
      {dev:'comp',t:'2. حط كل القطع اللي تحتاجها دائرة Fig. 8.6. للـ N_1u: أضف nmos4 وغيّر اسمه إلى <b>N_1u</b>؛ وللـ P_1u: أضف pmos4 وغيّر اسمه إلى <b>P_1u</b>.',subs:[
        {k:'set',dev:'comp',t:'M1: nmos4 = N_1u.',ok:()=>!!ST.newB&&comps('NM').some(c=>c.model==='N_1u'),do:async A=>{await PC.place(A,ofN(C86,'M1'));await PC.value(A,'M1',{model:'N_1u'})}},
        {k:'set',dev:'comp',t:'M2: pmos4 = P_1u.',ok:()=>!!ST.newB&&comps('PM').some(c=>c.model==='P_1u'),do:async A=>{await PC.place(A,ofN(C86,'M2'));await PC.value(A,'M2',{model:'P_1u'})}},
        {k:'set',dev:'comp',t:'المصدرين V1 و V2.',ok:()=>!!ST.newB&&comps('V').length>=2,do:A=>PC.place(A,ofN(C86,'V1','V2'))}]},
      {dev:'label',t:'3. وصّل كل القطع، وأضف ground (GND)، وسمّ الـ nodes: <b>in</b> و <b>out</b>.',subs:[
        {k:'set',dev:'wire',t:'وصّل كل القطع مثل Fig. 8.6.',ok:()=>!!ST.newB&&PC.wired(),do:A=>PC.wire(A,L86),hint:'فيه طرف قطعة مو موصول بشي: كل طرف لازم يلاقي طرف ثاني أو wire أو GND'},
        {k:'set',dev:'GND',t:'أضف الـ ground (GND).',ok:()=>comps('GND').length>=1,do:A=>PC.place(A,GN86)},
        {k:'set',dev:'label',t:'سمّ الـ nodes: in و out.',ok:()=>['in','out'].every(n=>labels().includes(n)),do:A=>PC.label(A,[{name:'in',x:0,y:2},{name:'out',x:6,y:0}])}]},
      {dev:'comp',t:'4. اضبط V1 مثل ما سوّيت في Procedure A (نفس الـ PULSE)، و V2 = 5 V.',subs:[
        {k:'set',dev:'comp',t:`V1 › PULSE: ${PULSET}.`,ok:()=>pulseOK(),do:pulseDo},
        {k:'set',dev:'comp',t:'V2 = 5 V.',ok:()=>v5(),do:A=>PC.value(A,'V2',{dc:5})}]},
      {dev:'dir',t:'5. أضف أمر <b>.lib mosfet1u.lib</b> مثل Procedure A.',subs:[{k:'set',dev:'dir',t:'<b>.lib mosfet1u.lib</b>',ok:()=>RT.hasLib(),do:A=>PC.dir(A,'.lib mosfet1u.lib',14,-2)}]},
      {dev:'ana',t:'6. أضف أمر الـ .dc مثل Procedure A (V1، Linear، 0 → 5 V، Increment = 5 mV).',subs:[{k:'set',dev:'ana',t:`DC sweep: ${DCT}.`,ok:()=>dcOK(),do:A=>PC.ana(A,'.dc V1 0 5 5m',14,3)}]},
      {dev:'run',t:'7. اضغط أيقونة الـ run.',subs:[runS(()=>!!ST.seen.INVdc,'Fig. 8.6')]},
      {dev:'run',t:'8. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف منحنى الـ VTC.',subs:[trS('V(out)',s=>s.kind==='INVdc'&&tr('V(out)'),'اضغط على out: V(out).')]},
      {dev:'ana',t:`9. الحين transient analysis: Edit › SPICE analysis ← Transient، وعبّي: ${TRT}.`,subs:[{k:'set',dev:'ana',t:`Transient: ${TRT}.`,ok:()=>tranOK(),do:A=>PC.ana(A,'.tran 0 60n 0 0.01n',14,3)}]},
      {dev:'run',t:'10. اضغط أيقونة الـ run.',subs:[runS(()=>!!ST.seen.INVtran,'Fig. 8.6')]},
      {dev:'run',t:'11. حط الماوس على node الـ <b>out</b> واضغط عشان تشوف موجات الخرج.',subs:[trS('V(out)',s=>s.kind==='INVtran'&&tr('V(out)'),'اضغط على out: V(out).')]},
      {dev:'run',t:'12. حط الماوس على node الـ <b>in</b> واضغط عشان تشوف موجة الدخل. أي logic gate تسوّيها الدائرة؟',subs:[
        trS('V(in)',s=>s.kind==='INVtran'&&tr('V(out)')&&tr('V(in)'),'اضغط على in: V(in).'),
        {k:'rec',t:'أي logic gate؟',ok:s=>s.kind==='INVtran'&&tr('V(out)')&&tr('V(in)'),rec:[{to:'b_gate',val:gate('INVtran'),txt:v=>v==='not'?'NOT (inverter)':'Buffer',label:'Logic gate',none:NR}]}]},
      {dev:'run',t:'13. بالماوس كبّر (اسحب مستطيل) حول منطقة الانتقال، اللي ينزل فيها الدخل ويطلع الخرج. أوجد الـ propagation delay لمّا الخرج يتغيّر من low لـ high، يعني t<sub>PLH</sub>.',subs:[
        zoomS(()=>!!ST.zINVtran),
        {k:'rec',t:'سجّل t<sub>PLH</sub>.',ok:()=>!!ST.zINVtran,rec:[{to:'b_tplh',val:()=>{const R=cur('INVtran');const d=R&&delays(R);return d&&isFinite(d[0])?d[0]*1e12:null},unit:'ps',dec:1,label:'t<sub>PLH</sub>',none:NR}]}]},
      {dev:'save',t:'14. احفظ الدائرة بـ Ctrl+S.',subs:[{k:'set',dev:'save',t:'Ctrl+S (File › Save).',ok:()=>!!ST.savedB,do:A=>PC.act(A,'save')}]}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.seen={};$('result').innerHTML=''}};
}};})();
