/* EE312 · Experiment 6 · SPICE Simulation I (manual v8.8 pp. 43–50) — PC table with the LTspice-style simulator.
   Procedure A: unregulated bridge supply (Fig. 6.1): V1 SINE(0 311 60 0 0 0 12), R1 = 20 Ω, L1 = 400 mH, L2 = 1 mH,
   K1 L1 L2 1, R2 = 2 Ω, D1–D4 = 1N4148, R3 = 4.7 kΩ, .tran 0 0.2 0 0.2m; VSM, PIV, C1 = 470 µF (then 10 µF),
   I(D1) surge and average, load 270 Ω. Procedure B: regulator (Fig. 6.2: R4 = 100 Ω, D5 = 1N750), Vout(dc) at 4.7 kΩ
   and 270 Ω. Procedure C: comparator with a limiter (Fig. 6.4: OP747, ±15 V, Vin SINE(0 1 1000 0 0 0 3), R1 = 1 kΩ,
   D1–D4 1N4148, then D2 flipped as a 1N750), .tran 0 3m 0 3u, I(R1).
   Assumptions: "R1 → 270 Ω" in A16 and "R1 back to 4.7 kΩ" in B1 mean the 4.7 kΩ load (R3 in Fig. 6.1); A16 keeps
   C1 = 470 µF (10 µF also accepted); the circuit is recognised by its simulated waveforms at the labelled nets
   (s1, s2, out / in, ic_out, out), so part names and drawing positions are free. PLQ Q1/Q2 are report work
   (Q2 needs an .ac analysis, which this simulator does not offer).
   Steps = the manual's numbered steps (A 1–16, B 1–3, C 1–10), several actions of one step shown line by line; steps that
   record a value carry rec (Manual «Capture» reads it from the student's own last run / waveform viewer); Exam keeps the
   ok checks and the graded sheet. C6 includes the run (the manual's step 8 says "run again"). */
EXP_DEFS['ee312/exp6']=(()=>{const H=ENGINE.sheet;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Q1a: a limiter with 1.4 V ≥ … −1.4 V ≤ v<sub>O</sub> ≤ 5.4 V from Si diodes (0.7 V) and one Zener (V<sub>Z</sub> = 4.7 V):
  <div>${H.row('Branch A (upper level):',H.sel('q1a',[['a','one Si diode in series with the Zener (reverse-biased): 0.7 + 4.7 = 5.4 V'],['b','two Si diodes in series'],['c','the Zener alone'],['d','three Si diodes']]))}
  ${H.row('Branch B (lower level):',H.sel('q1b',[['a','two Si diodes in series, opposite direction: −(0.7 + 0.7) = −1.4 V'],['b','one Si diode'],['c','the Zener forward-biased alone'],['d','a Si diode and the Zener']]))}</div></li>
<li class="plq">Q1b–d and Q2 (LTspice transient of your limiter, AC analysis of Fig. 6.6) go in your report.</li></ol>`;
return {pc:true,procs:[{id:'A',title:'Unregulated bridge supply: Fig. 6.1'},{id:'B',title:'Zener regulator: Fig. 6.2'},{id:'C',title:'Comparator with a limiter: Fig. 6.4'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 6 · SPICE Simulation I</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig6-1.png" alt="Fig. 6.1"></div><div class="hint" style="text-align:center">Fig. 6.1 · Bridge rectifier circuit</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig6-2.png" alt="Fig. 6.2"></div><div class="hint" style="text-align:center">Fig. 6.2 · Regulated power supply</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig6-4.png" alt="Fig. 6.4" style="max-width:70%"></div><div class="hint" style="text-align:center">Fig. 6.4 · Comparator with a limiter</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القيم تقراها من الـ waveform viewer: حط الماوس على المنحنى (يطلع x و y فوق)، وكبّر بسحب مستطيل، و Ctrl+click (أو زر ∑) على اسم المنحنى يعطيك المتوسط.</p>
<h3>Procedure A</h3><div class="en">
${H.row('9. V<sub>SM</sub> (peak of V(s1,s2)) =',H.num('a_vsm','0.01'),'V')}${H.row('10. PIV of D1 (peak of |V(s1,out)|) =',H.num('a_piv','0.01'),'V')}
${H.row('10. Is PIV at least 25 % below V<sub>RRM</sub> = 100 V (1N4148)?',H.sel('a_pivok',[['y','Yes'],['n','No']]))}
${H.row('11. Ripple with C1 = 470 µF vs 10 µF:',H.sel('a_rip',[['a','470 µF gives a much smaller ripple than 10 µF'],['b','10 µF gives the smaller ripple'],['c','no difference']]))}
${H.row('12. Surge (peak) of I(D1) with C1 = 470 µF =',H.num('a_surge','0.001'),'A')}${H.row('Is I<sub>FSM</sub> = 2 A ≥ 1.5 × surge?',H.sel('a_surgeok',[['y','Yes'],['n','No: a surge resistor is needed']]))}
${H.row('13. Average I(D1) in steady state =',H.num('a_iavg','0.01'),'mA')}${H.row('Is it ≤ 0.7 I<sub>F(AV)</sub> = 105 mA?',H.sel('a_iavgok',[['y','Yes'],['n','No']]))}
${H.row('16. With the load 270 Ω the ripple:',H.sel('a_270',[['a','increases'],['b','decreases'],['c','does not change']]))}</div>
<h3>Procedure B</h3><div class="en">${H.row('1. V<sub>out</sub>(dc), R<sub>L</sub> = 4.7 kΩ =',H.num('b_v47','0.001'),'V')}${H.row('2. V<sub>out</sub>(dc), R<sub>L</sub> = 270 Ω =',H.num('b_v270','0.001'),'V')}</div>
<h3>Procedure C</h3><div class="en">${H.row('6. With four 1N4148, v<sub>out</sub> limits: max =',H.num('c_max','0.01'),'V')}${H.row('min =',H.num('c_min','0.01'),'V')}
${H.row('8. With D2 = 1N750 (flipped): max =',H.num('c_zmax','0.01'),'V')}${H.row('min =',H.num('c_zmin','0.01'),'V')}
${H.row('8. Compared with Exp 5 Procedure B:',H.sel('c_cmp',[['a','Same shape: upper level ≈ VD + VZ, lower level ≈ −2VD'],['b','Completely different'],['c','No limiting at all']]))}
${H.row('9. Maximum op-amp output current I(R1) =',H.num('c_imax','0.01'),'mA')}${H.row('Below 20 mA?',H.sel('c_iok',[['y','Yes'],['n','No']]))}</div>
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
/* every run is compared with the reference circuits (same solver, SPICE text) */
onRun(RT,res){EXP6.classify(RT,res)},
setup(RT){
  const G=ENGINE.sheet,A=Math.abs,S=()=>RT.S;
  const SEC=`V1 p 0 SINE(0 311 60 0 0 0 12)
R1 p a 20
L1 a 0 400m
L2 b s2 1m
R2 b s1 2
K1 L1 L2 1
D1 s1 X 1N4148
D3 s2 X 1N4148
D4 0 s1 1N4148
D2 0 s2 1N4148
.tran 0 0.2 0 0.2m`;
  const unreg=(c,rl)=>SEC.replace(/X/g,'out')+`\nR3 out 0 ${rl}`+(c?`\nC1 out 0 ${c}`:'');
  const reg=rl=>SEC.replace(/X/g,'x')+`\nC1 x 0 470u\nR4 x out 100\nD5 0 out 1N750\nR3 out 0 ${rl}`;
  const CMP=z=>`V1 vp 0 15
V2 0 vn 15
V3 in 0 SINE(0 1 1000 0 0 0 3)
U1 in 0 ic_out vp vn OP747
R1 ic_out out 1000
D1 out m 1N4148
${z?'D2 0 m 1N750':'D2 m 0 1N4148'}
D3 n out 1N4148
D4 0 n 1N4148
.tran 0 3m 0 3u`;
  const DEFS={A0:[unreg(null,'4.7k'),['V(out)','V(s1,s2)']],A470:[unreg('470u','4.7k'),['V(out)','V(s1,s2)']],A10:[unreg('10u','4.7k'),['V(out)']],A270:[unreg('470u','270'),['V(out)']],A270b:[unreg('10u','270'),['V(out)']],
    B47:[reg('4.7k'),['V(out)']],B270:[reg('270'),['V(out)']],C:[CMP(false),['V(out)','V(ic_out)']],CZ:[CMP(true),['V(out)','V(ic_out)']]};
  const REF={};const ref=k=>REF[k]||(REF[k]=RT.sim(DEFS[k][0]));
  const same=(res,R,expr)=>{const a=RT.evalOn(res,expr),b=RT.evalOn(R,expr);if(!a||!b||a.length!==b.length)return false;
    return a.every((arr,i)=>{const q=b[i];if(arr.length!==q.length)return false;let mx=-1e9,mn=1e9,d=0;q.forEach((v,k)=>{mx=Math.max(mx,v);mn=Math.min(mn,v);d=Math.max(d,A(v-arr[k]))});return d<=0.01*(mx-mn)+0.02})};
  const ST={seen:{},kinds:[],rip:{}};
  window.EXP6={classify(RT,res){let kind=null;const order=res.a.kind==='tran'&&A(res.a.stop-0.2)<1e-9?['A0','A470','A10','A270','A270b','B47','B270']:res.a.kind==='tran'&&A(res.a.stop-3e-3)<1e-12?['C','CZ']:[];
    for(const k of order){const R=ref(k);if(R.err)continue;if(DEFS[k][1].every(e=>same(res,R,e))){kind=k;break}}res.kind=kind;if(kind){ST.seen[kind]=true;ST.kinds.push(kind);if(/^A/.test(kind))ST.rip[kind]=pk(res,'V(out)',0.1)-pk(res,'V(out)',0.1,true)}ST.last=kind}};
  const tr=e=>S().traces.some(t=>t.expr.toLowerCase()===e.toLowerCase());
  const labels=()=>S().labels.map(l=>l.name.toLowerCase());
  const comps=t=>S().comps.filter(c=>c.type===t);const val=(c,v)=>c&&A(SPICE.num(c.val)-v)<=v*1e-6;const byName=n=>S().comps.find(c=>c.name&&c.name.toLowerCase()===n.toLowerCase());
  const srcIs=(c,args)=>c&&c.src&&c.src.kind==='SINE'&&args.every((v,i)=>A((SPICE.num(c.src.args[i])||0)-v)<=A(v)*1e-6+1e-12);
  const dirHas=re=>RT.directives().some(l=>re.test(l));
  const ana=(stop,max)=>{const a=RT.analysis();return a&&a.kind==='tran'&&A(a.stop-stop)<stop*1e-6&&A((a.max||0)-max)<max*1e-6&&!a.start};
  function status(){const s=S(),st={};st.open=s.open;st.res=s.res;st.kind=s.res&&s.res.kind;st.fresh=s.res&&s.res.sig===JSON.stringify([s.comps.map(c=>[c.type,c.x,c.y,c.rot,c.mir,c.val,c.model,c.src]),s.wires.map(w=>[w.x1,w.y1,w.x2,w.y2]),s.labels.map(l=>[l.x,l.y,l.name]),RT.directives()]);
    if(st.kind==='A470'&&tr('I(D1)')&&s.zooms>0&&s.avg&&s.avg.toLowerCase()==='i(d1)')ST.avgD1=true;if(ST.avgD1&&s.fitted>(ST.fit0??(ST.fit0=s.fitted||0)))ST.fitted=true;
    if(st.kind==='B270'&&s.saved>(ST.sv0??-1))ST.savedB=true;if(!ST.seen.B270)ST.sv0=s.saved;
    if(ST.seen.B270&&s.news>(ST.news0??(ST.news0=s.news)))ST.newC=true;
    if(st.kind==='CZ'&&tr('I(R1)'))ST.iR1=true;if(ST.iR1)ST.svC0=ST.svC0??s.saved;if(ST.iR1&&s.saved>ST.svC0)ST.savedC=true;
    return st}
  const pk=(R,e,from=0,neg)=>{const v=RT.evalOn(R,e);if(!v)return NaN;const xs=R.runs[0].xs;let m=neg?1e9:-1e9;v[0].forEach((y,k)=>{if(xs[k]>=from)m=neg?Math.min(m,y):Math.max(m,y)});return m};
  const avg=(R,e,from)=>{const v=RT.evalOn(R,e)[0],xs=R.runs[0].xs;let sm=0,t=0;for(let k=1;k<xs.length;k++)if(xs[k-1]>=from){const dt=xs[k]-xs[k-1];sm+=(v[k]+v[k-1])/2*dt;t+=dt}return sm/t};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const r0=ref('A0'),r470=ref('A470'),rb47=ref('B47'),rb270=ref('B270'),rc=ref('C'),rz=ref('CZ');
    const vsm=pk(r0,'V(s1,s2)'),piv=-pk(r0,'V(s1,out)',0,true),surge=pk(r470,'I(D1)'),iav=avg(r470,'I(D1)',0.1)*1e3,vb47=avg(rb47,'V(out)',0.1),vb270=avg(rb270,'V(out)',0.1);
    g.proc('A');g.add(G.near(v('a_vsm'),vsm,vsm*0.02)&&!!ST.seen.A0,'A9 VSM',`≈ ${vsm.toFixed(2)} V`);g.add(G.near(v('a_piv'),piv,piv*0.02),'A10 PIV',`≈ ${piv.toFixed(2)} V`);g.add(G.s('a_pivok')==='y','A10 PIV vs VRRM','PIV ≈ 16 V ≪ 75 V');
    g.add(G.s('a_rip')==='a'&&ST.seen.A470&&ST.seen.A10,'A11 ripple','470 µF → smaller ripple (and you must run both)');
    g.add(G.near(v('a_surge'),surge,surge*0.1),'A12 surge',`≈ ${surge.toFixed(2)} A`);g.add(G.s('a_surgeok')==='y','A12 IFSM','2 A ≥ 1.5 × surge');
    g.add(G.near(v('a_iavg'),iav,iav*0.1),'A13 average I(D1)',`≈ ${iav.toFixed(2)} mA`);g.add(G.s('a_iavgok')==='y','A13 IF(AV)');
    g.add(G.s('a_270')==='a'&&(ST.seen.A270||ST.seen.A270b),'A16 load 270 Ω','ripple increases');
    g.proc('B');g.add(G.near(v('b_v47'),vb47,0.02)&&ST.seen.B47,'B1 Vout(dc) 4.7 kΩ',`≈ ${vb47.toFixed(3)} V`);g.add(G.near(v('b_v270'),vb270,0.02)&&ST.seen.B270,'B2 Vout(dc) 270 Ω',`≈ ${vb270.toFixed(3)} V`);
    g.proc('C');g.add(G.near(v('c_max'),pk(rc,'V(out)'),0.03)&&G.near(v('c_min'),pk(rc,'V(out)',0,true),0.03),'C6 limits (1N4148)',`≈ ${pk(rc,'V(out)').toFixed(2)} / ${pk(rc,'V(out)',0,true).toFixed(2)} V`);
    g.add(G.near(v('c_zmax'),pk(rz,'V(out)'),0.03)&&G.near(v('c_zmin'),pk(rz,'V(out)',0,true),0.03)&&ST.seen.CZ,'C8 limits (1N750)',`≈ ${pk(rz,'V(out)').toFixed(2)} / ${pk(rz,'V(out)',0,true).toFixed(2)} V`);
    g.add(G.s('c_cmp')==='a','C8 comparison');const im=pk(rz,'I(R1)')*1e3;g.add(G.near(v('c_imax'),im,im*0.05)&&G.s('c_iok')==='y','C9 I(R1) max',`≈ ${im.toFixed(2)} mA (< 20 mA)`);
    g.proc(null);g.add(G.s('q1a')==='a'&&G.s('q1b')==='a','PLQ Q1a');
    g.show($('result'))});
  /* Capture (Manual): the values the student reads off the waveform viewer, from his own last run */
  const cur=(...k)=>{const r=S().res;return r&&!r.err&&r.runs&&k.includes(r.kind)?r:null};
  const fin=x=>isFinite(x)?x:null;
  const vsm=()=>{const r=cur('A0','A470','A10','A270','A270b');return r?fin(pk(r,'V(s1,s2)')):null};
  const piv=()=>{const r=cur('A0','A470','A10','A270','A270b');return r?fin(-pk(r,'V(s1,out)',0,true)):null};
  const surge=()=>{const r=cur('A470');return r?fin(pk(r,'I(D1)')):null};
  const iavg=()=>{const a=S().avgVal;return ST.avgD1&&a&&/^i\(d1\)$/i.test(a.expr)?a.avg*1e3:null};
  const vdc=k=>{const r=cur(k);try{return r?fin(avg(r,'V(out)',0.1)):null}catch(e){return null}};
  const lim=(k,neg)=>{const r=cur(k);return r?fin(pk(r,'V(out)',0,neg)):null};
  const imax=()=>{const r=cur('CZ');return r&&ST.iR1?fin(pk(r,'I(R1)')*1e3):null};
  const yn=(f,t)=>()=>{const x=f();return x==null?null:t(x)?'y':'n'},YN=v=>v==='y'?'Yes':'No';
  const NR='شغّل المحاكاة على دائرة الخطوة أول (Simulate › Run).';
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
  /* the reference drawings (the layout tests/exp/ee312-exp6.mjs draws): Fig. 6.1, with C1, Fig. 6.2, Fig. 6.4 */
  const G4=(...p)=>p.map(([x,y])=>({type:'GND',x,y}));
  const C61=[{type:'V',name:'V1',x:0,y:0},{type:'R',name:'R1',x:0,y:0,rot:3},{type:'R',name:'R2',x:8,y:0,rot:3},{type:'R',name:'R3',x:32,y:4},{type:'L',name:'L1',x:4,y:0},{type:'L',name:'L2',x:8,y:0},
    {type:'D',name:'D1',x:12,y:0},{type:'D',name:'D2',x:20,y:-4},{type:'D',name:'D3',x:20,y:0},{type:'D',name:'D4',x:12,y:-4}],GN61=G4([0,4],[4,4],[16,-4],[32,8]);
  const W61=[[8,4,8,6],[8,6,22,6],[22,6,22,0],[22,0,20,0],[12,-4,20,-4],[12,4,20,4],[20,4,32,4]];
  const L61={comps:[...C61,...GN61],wires:W61},CAP=[{type:'C',name:'C1',x:28,y:4},...G4([28,8])],L61C={comps:[...C61,...GN61,...CAP],wires:W61};
  const REG=[{type:'R',name:'R4',x:28,y:4,rot:3},{type:'D',name:'D5',x:36,y:8,rot:2},...G4([36,8])];
  const L62={comps:[...L61C.comps,...REG],wires:[...W61.filter(w=>w.join()!=='20,4,32,4'),[20,4,28,4],[32,4,36,4]]};
  const C64=[{type:'OA',name:'U1',x:10,y:0,model:'OP747'},{type:'V',name:'V1',x:12,y:-1,rot:2},{type:'V',name:'V2',x:12,y:7,rot:2},{type:'V',name:'V3',x:6,y:0},{type:'R',name:'R1',x:14,y:1,rot:3},
    {type:'D',name:'D1',x:18,y:1},{type:'D',name:'D2',x:18,y:5},{type:'D',name:'D3',x:22,y:5,rot:2},{type:'D',name:'D4',x:22,y:9,rot:2}],GN64=G4([10,2],[6,4],[12,-5],[12,7],[18,9],[22,9]);
  const L64={comps:[...C64,...GN64],wires:[[6,0,10,0],[18,1,22,1]]};
  const ofT=(L,...t)=>L.filter(d=>t.includes(d.type));
  const dcIs=(c,v)=>c&&c.src&&c.src.kind==='DC'&&A(SPICE.num(c.src.dc)-v)<1e-9;
  const D2rev=()=>{const e=RT.fromSchematic().list.find(x=>/^d2$/i.test(x.name||''));return !!e&&e.nodes[0]==='0'};
  const runHint=k=>`اضغط Run؛ لو ما تحقق، قارن الدائرة والقيم مع ${k}`;
  return {status,
    steps:[
      /* Procedure A (manual pp. 45–46), steps 1–16 */
      {dev:'new',t:'Procedure A · 1. افتح LTspice، وروح File › New Schematic.',subs:[
        {k:'set',dev:'new',t:'File › New Schematic.',ok:s=>s.open,do:async A=>{if(!RT.S.open)await PC.act(A,'new')}}]},
      {dev:'R',t:'2. أول شي حط كل القطع اللي تحتاجها دائرة Fig. 6.1 على الـ schematic، ما عدا المكثف. عشان تضيف coupling coefficient بين الملفين: Edit › SPICE directive واكتب <b>K1 L1 L2 1</b>.',subs:[
        {k:'set',dev:'comp',t:'مصدر الجهد V1 (Component › voltage).',ok:()=>comps('V').length>=1,do:A=>PC.place(A,ofT(C61,'V'))},
        {k:'set',dev:'R',t:'المقاومات R1 و R2 و R3.',ok:()=>comps('R').length>=3,do:A=>PC.place(A,ofT(C61,'R'))},
        {k:'set',dev:'L',t:'الملفين L1 و L2.',ok:()=>comps('L').length>=2,do:A=>PC.place(A,ofT(C61,'L'))},
        {k:'set',dev:'D',t:'الدايودات D1–D4.',ok:()=>comps('D').length>=4,do:A=>PC.place(A,ofT(C61,'D'))},
        {k:'set',dev:'dir',t:'Edit › SPICE directive: <b>K1 L1 L2 1</b>.',ok:()=>dirHas(/^k1\s+l1\s+l2\s+1$/i),do:A=>PC.dir(A,'K1 L1 L2 1',25,-3)}]},
      {dev:'GND',t:'3. أضف circuit ground (GND)، ووصّل كل القطع (F3)، وسمّ الـ nodes: <b>S1</b> و <b>S2</b> و <b>out</b> (Label Net، F4).',subs:[
        {k:'set',dev:'GND',t:'أضف الـ GND.',ok:()=>comps('GND').length>=1,do:A=>PC.place(A,GN61)},
        {k:'set',dev:'wire',t:'وصّل كل القطع بالـ wires (F3) مثل Fig. 6.1.',ok:()=>PC.wired(),do:A=>PC.wire(A,L61),hint:'فيه طرف قطعة مو موصول بشي: كل طرف لازم يلاقي طرف ثاني أو wire أو GND'},
        {k:'set',dev:'label',t:'سمّ الـ nodes: S1 و S2 و out (Label Net، F4).',ok:()=>['s1','s2','out'].every(n=>labels().includes(n)),do:A=>PC.label(A,[{name:'S1',x:12,y:0},{name:'S2',x:20,y:0},{name:'out',x:32,y:4}])}]},
      {dev:'R',t:'4. عشان تغيّر قيمة قطعة: كليك يمين عليها واكتب القيمة (meg = 1e6، k = 1e3، m = 1e-3، u = 1e-6، n = 1e-9، p = 1e-12).',subs:[
        {k:'set',dev:'R',t:'R1 = 20 Ω، و R2 = 2 Ω، و R3 = 4.7 kΩ (اكتب 4.7k).',ok:()=>val(byName('R1'),20)&&val(byName('R2'),2)&&val(byName('R3'),4700),
          do:async A=>{await PC.value(A,'R1',{val:'20'});await PC.value(A,'R2',{val:'2'});await PC.value(A,'R3',{val:'4.7k'})}},
        {k:'set',dev:'L',t:'L1 = 400 mH (اكتب 400m)، و L2 = 1 mH (اكتب 1m).',ok:()=>val(byName('L1'),0.4)&&val(byName('L2'),1e-3),
          do:async A=>{await PC.value(A,'L1',{val:'400m'});await PC.value(A,'L2',{val:'1m'})}},
        {k:'set',dev:'D',t:'D1–D4 = 1N4148 (Pick New Diode).',ok:()=>comps('D').length>=4&&comps('D').every(d=>d.model==='1N4148'),
          do:async A=>{for(const d of comps('D'))await PC.value(A,d.name,{model:'1N4148'})}}]},
      {dev:'comp',t:'5. كليك يمين على مصدر الجهد وعبّي: DC offset = 0 V، Amplitude = 311 V، Freq = 60 Hz، Tdelay = 0 s، Theta = 0 s⁻¹، Phi = 0°، Ncycles = 12 دورة.',subs:[
        {k:'set',dev:'comp',t:'V1 › SINE: DC offset = 0 V، Amplitude = 311 V، Freq = 60 Hz، Tdelay = 0 s، Theta = 0 s⁻¹، Phi = 0°، Ncycles = 12 دورة.',ok:()=>srcIs(byName('V1'),[0,311,60,0,0,0,12]),
          do:A=>PC.value(A,'V1',{wave:'SINE',args:[0,311,60,0,0,0,12]})}]},
      {dev:'ana',t:'6. روح Edit › SPICE analysis وعبّي: Stop time = 0.2 s، Time to start saving data = 0 s، Maximum Timestep = 0.2 ms.',subs:[
        {k:'set',dev:'ana',t:'Transient: Stop time = 0.2 s، Time to start saving data = 0 s، Maximum Timestep = 0.2 ms.',ok:()=>ana(0.2,0.2e-3),do:A=>PC.ana(A,'.tran 0 0.2 0 0.2m',33,-3)}]},
      {dev:'run',t:'7. شغّل المحاكاة: Simulate › Run.',subs:[{k:'set',dev:'run',t:'Simulate › Run.',ok:()=>!!ST.seen.A0,do:PC.run,hint:runHint('Fig. 6.1')}]},
      {dev:'run',t:'8. اضغط على node الـ <b>out</b> في الـ schematic عشان تعرض موجة جهد الخرج.',subs:[{k:'set',dev:'run',t:'اضغط على node الـ out: V(out).',ok:()=>ST.seen.A0&&tr('V(out)'),do:A=>PC.trace(A,'V(out)')}]},
      {dev:'run',t:'9. عشان تعرض جهد الـ secondary winding: حط الماوس على S1، واضغط وأنت ساحب لين S2 وفك. كم الـ peak amplitude لهالموجة (V<sub>SM</sub>)؟',subs:[
        {k:'set',dev:'run',t:'اسحب من S1 إلى S2: V(S1,S2).',ok:()=>tr('V(s1,s2)'),do:A=>PC.trace(A,'V(s1,s2)')},
        {k:'rec',t:'سجّل V<sub>SM</sub>.',ok:()=>tr('V(s1,s2)'),rec:[{to:'a_vsm',val:vsm,unit:'V',dec:2,label:'V<sub>SM</sub>',none:'اعرض V(s1,s2) من آخر run لدائرة Fig. 6.1'}]}]},
      {dev:'run',t:'10. بنفس الطريقة اعرض الفرق على D1: V(S1, out). كم الـ peak inverse voltage PIV لـ D1؟ لازم يكون أقل من الـ V<sub>RRM</sub> بـ 25 % على الأقل (Fig. 6.3).',subs:[
        {k:'set',dev:'run',t:'اسحب من S1 إلى out: V(S1,out).',ok:()=>tr('V(s1,out)'),do:A=>PC.trace(A,'V(s1,out)')},
        {k:'rec',t:'سجّل الـ PIV وقارنه بـ 0.75 V<sub>RRM</sub>.',ok:()=>tr('V(s1,out)'),rec:[{to:'a_piv',val:piv,unit:'V',dec:2,label:'PIV',none:NR},{to:'a_pivok',val:yn(piv,x=>x<=0.75*100),txt:YN,label:'PIV ≤ 0.75 V<sub>RRM</sub>',none:NR}]}]},
      {dev:'C',t:'11. وصّل المكثف مثل Fig. 6.1 (C1 = 470 µF)، وأعد المحاكاة وشوف أثره على الـ ripple. وجرّب سعة أقل (10 µF مثلاً).',subs:[
        {k:'set',dev:'C',t:'وصّل C1 = 470 µF (اكتب 470u) بين out والأرضي.',ok:()=>comps('C').some(c=>val(c,470e-6))||!!ST.seen.A470,do:async A=>{await PC.place(A,CAP);await PC.value(A,'C1',{val:'470u'})}},
        {k:'set',dev:'run',t:'أعد المحاكاة (Run).',ok:()=>!!ST.seen.A470,do:PC.run,hint:runHint('Fig. 6.1 مع C1 = 470 µF')},
        {k:'set',dev:'C',t:'غيّر C1 = 10 µF (اكتب 10u) وأعد المحاكاة.',ok:()=>!!ST.seen.A10,do:async A=>{await PC.value(A,'C1',{val:'10u'});await PC.run(A)}},
        {k:'rec',t:'سجّل أثر السعة على الـ ripple.',ok:()=>ST.seen.A470&&ST.seen.A10,
          rec:[{to:'a_rip',val:()=>ST.rip.A470!=null&&ST.rip.A10!=null?(ST.rip.A470<ST.rip.A10?'a':'b'):null,txt:v=>v==='a'?'470 µF → smaller ripple':'10 µF → smaller ripple',label:'Ripple',none:'شغّل بـ 470 µF وبـ 10 µF'}]}]},
      {dev:'run',t:'12. حط الماوس على D1 (يتحوّل لشكل clamp meter) واضغط: يطلع تيار الدايود. لاحظ الـ surge في بداية المحاكاة؛ الدايود لازم يكون I<sub>FSM</sub> حقه 1.5 مرة الـ surge.',subs:[
        {k:'set',dev:'C',t:'رجّع C1 = 470 µF وشغّل.',ok:s=>s.kind==='A470',do:async A=>{await PC.value(A,'C1',{val:'470u'});await PC.run(A)}},
        {k:'set',dev:'run',t:'اضغط على D1: I(D1).',ok:s=>s.kind==='A470'&&tr('I(D1)'),do:A=>PC.trace(A,'I(D1)')},
        {k:'rec',t:'سجّل الـ surge وقارنه بـ I<sub>FSM</sub>.',ok:s=>s.kind==='A470'&&tr('I(D1)'),rec:[{to:'a_surge',val:surge,unit:'A',dec:3,label:'Surge I(D1)',none:'شغّل بـ C1 = 470 µF واعرض I(D1)'},{to:'a_surgeok',val:yn(surge,x=>2>=1.5*x),txt:YN,label:'I<sub>FSM</sub> ≥ 1.5 × surge'}]}]},
      {dev:'run',t:'13. في نافذة الموجات اسحب الماوس بشكل قطري عشان تعرض الدورات المستقرة بس (بدون الـ surge). اضغط Ctrl مع كليك على I(D1) (أو ∑): يطلع المتوسط. لازم ما يزيد عن 0.7 I<sub>F(AV)</sub>.',subs:[
        {k:'set',dev:'run',t:'اسحب مستطيل على الدورات المستقرة (بدون الـ surge).',ok:s=>s.kind==='A470'&&(RT.S.zooms||0)>0,do:A=>PC.zoom(A,0.11,0.196)},
        {k:'set',dev:'run',t:'Ctrl + كليك على I(D1) (أو ∑): المتوسط.',ok:()=>!!ST.avgD1,do:A=>PC.avg(A,'I(D1)')},
        {k:'rec',t:'سجّل متوسط I(D1) وقارنه بـ 0.7 I<sub>F(AV)</sub>.',ok:()=>!!ST.avgD1,rec:[{to:'a_iavg',val:iavg,unit:'mA',dec:2,label:'Average I(D1)',none:'كبّر على الدورات المستقرة واطلب متوسط I(D1)'},{to:'a_iavgok',val:yn(iavg,x=>x<=105),txt:YN,label:'≤ 0.7 I<sub>F(AV)</sub>'}]}]},
      {dev:'run',t:'14. اضغط Ctrl+E (أو ⤢ Zoom Full) عشان ترجع للعرض الأصلي.',subs:[{k:'set',dev:'run',t:'Ctrl+E (⤢ Zoom Full).',ok:()=>!!ST.fitted,do:PC.fit}]},
      {dev:'run',t:'15. احذف منحنيات I(D1) و V(S1,out).',subs:[
        {k:'set',dev:'run',t:'احذف I(D1) (✕ جنب اسمه).',ok:()=>ST.fitted&&!tr('I(D1)'),do:A=>PC.untrace(A,'I(D1)')},
        {k:'set',dev:'run',t:'احذف V(S1,out).',ok:()=>ST.fitted&&!tr('V(s1,out)'),do:A=>PC.untrace(A,'V(s1,out)')}]},
      {dev:'R',t:'16. نزّل قيمة الحمل (R3 = 4.7 kΩ) إلى 270 Ω وأعد المحاكاة، وشوف أثرها على الـ ripple في الخرج.',subs:[
        {k:'set',dev:'R',t:'R3 = 270 Ω.',ok:()=>val(byName('R3'),270)||ST.seen.A270||ST.seen.A270b,do:A=>PC.value(A,'R3',{val:'270'})},
        {k:'set',dev:'run',t:'أعد المحاكاة (Run).',ok:()=>ST.seen.A270||ST.seen.A270b,do:PC.run,hint:runHint('Fig. 6.1 مع R3 = 270 Ω')},
        {k:'rec',t:'سجّل أثر الحمل على الـ ripple.',ok:()=>ST.seen.A270||ST.seen.A270b,
          rec:[{to:'a_270',val:()=>{const r=ST.rip.A270??ST.rip.A270b,b=ST.rip.A470??ST.rip.A10;return r!=null&&b!=null?(r>b?'a':'b'):null},txt:v=>v==='a'?'increases':'decreases',label:'Ripple with 270 Ω',none:'شغّل بالحمل 270 Ω'}]}]},
      /* Procedure B (manual p. 47), steps 1–3 */
      {dev:'R',t:'Procedure B · 1. أضف voltage regulator لدائرة الـ dc supply مثل Fig. 6.2 (R4 = 100 Ω و D5 = 1N750). رجّع الحمل لـ 4.7 kΩ وأعد المحاكاة. اقرا وسجّل قيمة الـ dc لـ v<sub>out</sub>(t).',subs:[
        {k:'set',dev:'R',t:'أضف الـ regulator مثل Fig. 6.2: R4 = 100 Ω و D5 = 1N750.',ok:()=>val(byName('R4'),100)&&comps('D').some(d=>d.model==='1N750')||!!ST.seen.B47,
          do:async A=>{await PC.wire(A,L62);await PC.value(A,'C1',{val:'470u'});await PC.value(A,'R4',{val:'100'});await PC.value(A,'D5',{model:'1N750'})}},
        {k:'set',dev:'R',t:'رجّع الحمل R3 = 4.7 kΩ.',ok:()=>val(byName('R3'),4700)||!!ST.seen.B47,do:A=>PC.value(A,'R3',{val:'4.7k'})},
        {k:'set',dev:'run',t:'أعد المحاكاة (Run).',ok:()=>!!ST.seen.B47,do:PC.run,hint:runHint('Fig. 6.2 مع R3 = 4.7 kΩ')},
        {k:'rec',t:'سجّل V<sub>out</sub>(dc).',ok:()=>!!ST.seen.B47,rec:[{to:'b_v47',val:()=>vdc('B47'),unit:'V',dec:3,label:'V<sub>out</sub>(dc), 4.7 kΩ',none:NR}]}]},
      {dev:'R',t:'2. نزّل الحمل لـ 270 Ω وأعد المحاكاة، وشوف أثره على الـ ripple. اقرا وسجّل قيمة الـ dc لـ v<sub>out</sub>(t).',subs:[
        {k:'set',dev:'R',t:'R3 = 270 Ω.',ok:()=>val(byName('R3'),270)||!!ST.seen.B270,do:A=>PC.value(A,'R3',{val:'270'})},
        {k:'set',dev:'run',t:'أعد المحاكاة (Run).',ok:()=>!!ST.seen.B270,do:PC.run,hint:runHint('Fig. 6.2 مع R3 = 270 Ω')},
        {k:'rec',t:'سجّل V<sub>out</sub>(dc).',ok:()=>!!ST.seen.B270,rec:[{to:'b_v270',val:()=>vdc('B270'),unit:'V',dec:3,label:'V<sub>out</sub>(dc), 270 Ω',none:NR}]}]},
      {dev:'save',t:'3. احفظ الـ schematic قبل ما تسكّر البرنامج (File › Save).',subs:[{k:'set',dev:'save',t:'File › Save.',ok:()=>!!ST.savedB,do:A=>PC.act(A,'save')}]},
      /* Procedure C (manual p. 48), steps 1–10 */
      {dev:'new',t:'Procedure C · 1. روح File › New Schematic.',subs:[{k:'set',dev:'new',t:'File › New Schematic.',ok:()=>!!ST.newC,do:A=>PC.act(A,'new')}]},
      {dev:'comp',t:'2. حط كل القطع اللي تحتاجها دائرة Fig. 6.4 على الـ schematic، ومعها circuit ground.',subs:[
        {k:'set',dev:'comp',t:'الـ OP747 (Component › OpAmps).',ok:()=>!!ST.newC&&comps('OA').length>=1,do:A=>PC.place(A,ofT(C64,'OA'))},
        {k:'set',dev:'comp',t:'V1 = 15 V و V2 = 15 V للـ ±15 V.',ok:()=>!!ST.newC&&comps('V').filter(c=>dcIs(c,15)).length>=2,
          do:async A=>{await PC.place(A,C64.filter(d=>d.name==='V1'||d.name==='V2'));for(const n of ['V1','V2'])await PC.value(A,n,{dc:15})}},
        {k:'set',dev:'comp',t:'مصدر الدخل Vin (V3).',ok:()=>!!ST.newC&&comps('V').length>=3,do:A=>PC.place(A,ofT(C64,'V'))},
        {k:'set',dev:'R',t:'R1 = 1 kΩ.',ok:()=>!!ST.newC&&comps('R').some(c=>val(c,1000)),do:async A=>{await PC.place(A,ofT(C64,'R'));await PC.value(A,'R1',{val:'1000'})}},
        {k:'set',dev:'D',t:'D1–D4 = 1N4148.',ok:()=>!!ST.newC&&comps('D').filter(d=>d.model==='1N4148').length>=4,do:async A=>{await PC.place(A,ofT(C64,'D'));for(const d of comps('D'))await PC.value(A,d.name,{model:'1N4148'})}},
        {k:'set',dev:'GND',t:'الـ circuit ground (GND).',ok:()=>!!ST.newC&&comps('GND').length>=1,do:A=>PC.place(A,GN64)}]},
      {dev:'label',t:'3. وصّل كل القطع، وسمّ الـ nodes: <b>in</b> و <b>IC_out</b> و <b>out</b>.',subs:[
        {k:'set',dev:'wire',t:'وصّل كل القطع مثل Fig. 6.4.',ok:()=>PC.wired(),do:A=>PC.wire(A,L64),hint:'فيه طرف قطعة مو موصول بشي: كل طرف لازم يلاقي طرف ثاني أو wire أو GND'},
        {k:'set',dev:'label',t:'سمّ الـ nodes: in و IC_out و out.',ok:()=>['in','ic_out','out'].every(n=>labels().includes(n)),do:A=>PC.label(A,[{name:'in',x:6,y:0},{name:'IC_out',x:14,y:1},{name:'out',x:22,y:1}])}]},
      {dev:'comp',t:'4. كليك يمين على مصدر الدخل وعبّي: DC offset = 0 V، Amplitude = 1 V، Freq = 1 kHz (1000 Hz)، Tdelay = 0 s، Theta = 0 s⁻¹، Phi = 0°، Ncycles = 3 دورات.',subs:[
        {k:'set',dev:'comp',t:'Vin › SINE: DC offset = 0 V، Amplitude = 1 V، Freq = 1000 Hz، Tdelay = 0 s، Theta = 0 s⁻¹، Phi = 0°، Ncycles = 3 دورات.',ok:()=>S().comps.some(c=>srcIs(c,[0,1,1000,0,0,0,3])),
          do:async A=>{const v=comps('V').find(c=>!dcIs(c,15))||byName('V3');if(v)await PC.value(A,v.name,{wave:'SINE',args:[0,1,1000,0,0,0,3]})}}]},
      {dev:'ana',t:'5. روح Edit › SPICE analysis وعبّي: Stop time = 3 ms، Time to start saving data = 0 s، Maximum Timestep = 3 µs.',subs:[
        {k:'set',dev:'ana',t:'Transient: Stop time = 3 ms، Time to start saving data = 0 s، Maximum Timestep = 3 µs.',ok:()=>ana(3e-3,3e-6),do:A=>PC.ana(A,'.tran 0 3m 0 3u',26,-4)}]},
      {dev:'run',t:'6. شغّل، واضغط على nodes الـ in و IC_out و out بالترتيب عشان تعرض موجاتها.',subs:[
        {k:'set',dev:'run',t:'Simulate › Run.',ok:()=>!!ST.seen.C,do:PC.run,hint:runHint('Fig. 6.4')},
        {k:'set',dev:'run',t:'اضغط على in: V(in).',ok:()=>ST.seen.C&&tr('V(in)'),do:A=>PC.trace(A,'V(in)')},
        {k:'set',dev:'run',t:'اضغط على IC_out: V(IC_out).',ok:()=>ST.seen.C&&tr('V(ic_out)'),do:A=>PC.trace(A,'V(ic_out)')},
        {k:'set',dev:'run',t:'اضغط على out: V(out).',ok:()=>ST.seen.C&&tr('V(out)'),do:A=>PC.trace(A,'V(out)')},
        {k:'rec',t:'سجّل أعلى وأقل قيمة لـ v<sub>out</sub>.',ok:()=>ST.seen.C&&tr('V(in)')&&tr('V(ic_out)')&&tr('V(out)'),
          rec:[{to:'c_max',val:()=>lim('C'),unit:'V',dec:2,label:'v<sub>out</sub> max',none:NR},{to:'c_min',val:()=>lim('C',true),unit:'V',dec:2,label:'v<sub>out</sub> min',none:NR}]}]},
      {dev:'rot',t:'7. اقلب D2 (Ctrl+R مرتين)، وبعدها غيّر موديله إلى 1N750 (Zener diode).',subs:[
        {k:'set',dev:'rot',t:'اختر D2 واضغط Ctrl+R مرتين.',ok:()=>D2rev()||!!ST.seen.CZ,do:async A=>{const d=byName('D2');if(!d)return;RT.S.tool='sel';RT.S.sel=d.id;for(let i=0;i<2&&!D2rev();i++)await PC.act(A,'rot')}},
        {k:'set',dev:'D',t:'D2 = 1N750.',ok:()=>{const d=byName('D2');return !!d&&d.model==='1N750'},do:A=>PC.value(A,'D2',{model:'1N750'})}]},
      {dev:'run',t:'8. أعد المحاكاة. قارن موجة الخرج باللي طلعت لك في Procedure B من تجربة الـ op amp (Exp 5).',subs:[
        {k:'set',dev:'run',t:'أعد المحاكاة (Run).',ok:()=>!!ST.seen.CZ,do:PC.run,hint:runHint('Fig. 6.4 مع D2 = 1N750 مقلوب')},
        {k:'rec',t:'سجّل حدود v<sub>out</sub> وقارنها بـ Exp 5.',ok:()=>!!ST.seen.CZ,
          rec:[{to:'c_zmax',val:()=>lim('CZ'),unit:'V',dec:2,label:'v<sub>out</sub> max',none:NR},{to:'c_zmin',val:()=>lim('CZ',true),unit:'V',dec:2,label:'v<sub>out</sub> min',none:NR},
            {to:'c_cmp',val:()=>cur('CZ')?'a':null,txt:()=>'Same shape: VD + VZ / −2VD',label:'vs Exp 5',none:NR}]}]},
      {dev:'run',t:'9. حط الماوس على R1 (يتحوّل لشكل clamp meter) واضغط: تطلع موجة تيار خرج الـ op amp. كم أعلى قيمة؟ تأكد إنها أقل من 20 mA.',subs:[
        {k:'set',dev:'run',t:'اضغط على R1: I(R1).',ok:()=>!!ST.iR1,do:A=>PC.trace(A,'I(R1)')},
        {k:'rec',t:'سجّل أعلى قيمة لـ I(R1).',ok:()=>!!ST.iR1,rec:[{to:'c_imax',val:imax,unit:'mA',dec:2,label:'I(R1) max',none:'اعرض I(R1) بعد الـ run'},{to:'c_iok',val:yn(imax,x=>x<20),txt:YN,label:'< 20 mA'}]}]},
      {dev:'save',t:'10. احفظ الـ schematic قبل ما تسكّر البرنامج.',subs:[{k:'set',dev:'save',t:'File › Save.',ok:()=>!!ST.savedC,do:A=>PC.act(A,'save')}]}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.seen={};ST.kinds=[];ST.rip={};$('result').innerHTML=''}};
}};})();
