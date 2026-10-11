/* EE312 · Experiment 1 · Exploring and Testing Junction Diodes (manual v8.8 pp. 8–13).
   Procedure A: MT3805 diode test on the 1N4001, Zener 1N4733A, green LED and Ge diode (Table 1.1).
   Procedure B: Fig. 1.3 with one EL302RD unit (VDD), RS = 100 Ω, the 1N4001 and RL = 100 Ω (Table 1.2).
   Assumptions: "Fig. 1.5a" in step 5 is Fig. 1.3a with the rectifier reversed; one MT3805 whose leads move
   between RS and the diode; the Ge diode is a 1N34A-class point-contact part; PLQ 5 uses 2 × 1.5 V cells. */
EXP_DEFS['ee312/exp1']=(()=>{const H=ENGINE.sheet;
const t11=`<table class="tbl"><caption>Table 1.1 Procedure A · Testing Junction Diodes</caption>
<tr><td class="l" colspan="2">DMM Test-Position Reading in Case of an Open Circuit:</td><td>${H.sel('a_open',[['ovl','OVL.D'],['0','0.000 V'],['2.8','2.800 V']])}</td></tr>
<tr><td class="l" colspan="2">DMM Test-Position Reading in Case of a Reverse-Biased Diode:</td><td>${H.sel('a_rev',[['ovl','OVL.D'],['0','0.000 V'],['0.55','≈ 0.55 V']])}</td></tr>
<tr><th>Type of diode</th><th><i>Expected</i> Forward Voltage Drop</th><th>Measured <i>Forward Voltage</i> Drop (3 decimals)</th></tr>
<tr><td>Rectifier</td><td rowspan="2">~ 0.5 ‒ 0.8 V<br>(made of Si)</td><td>${H.num('a_si')} V</td></tr>
<tr><td>Zener</td><td>${H.num('a_z')} V</td></tr>
<tr><td>LED</td><td>~ 1.5 ‒ 3.5 V</td><td>${H.num('a_led')} V</td></tr>
<tr><td>Germanium</td><td>~ 0.2 ‒ 0.4 V</td><td>${H.num('a_ge')} V</td></tr></table>`;
const t12=`<table class="tbl"><caption>Table 1.2 Procedure B · Measured Data (3 decimals)</caption>
<tr><th colspan="4">Reverse Bias</th></tr>
<tr><td rowspan="3">4 &amp; 5</td><td class="l" colspan="3">Supply Voltage V<sub>DD</sub> = 5 V</td></tr>
<tr><td class="l" colspan="2">The corresponding open-circuit voltage V<sub>OC</sub> =</td><td>${H.num('b_voc')} V</td></tr>
<tr><td class="l" colspan="2">The diode's reverse voltage drop V<sub>rev</sub> =</td><td>${H.num('b_vrev')} V</td></tr>
<tr><th colspan="4">Forward Bias</th></tr>
<tr><th>Step</th><th>Arrangement</th><th>I<sub>D</sub> (mA)</th><th>V<sub>D</sub> (V)</th></tr>
<tr><td>7</td><td>Adjust V<sub>DD</sub> so that V<sub>RS</sub> = 0.1 V</td><td>1</td><td>${H.num('b_vd1')}</td></tr>
<tr><td>8</td><td>Adjust V<sub>DD</sub> so that V<sub>RS</sub> = 1 V</td><td>10</td><td>${H.num('b_vd10')}</td></tr>
<tr><td>9</td><td>Adjust V<sub>DD</sub> so that V<sub>RS</sub> = 2 V</td><td>20</td><td>${H.num('b_vd20')}</td></tr>
<tr><td>7→8</td><td class="l" colspan="2">ΔV<sub>D</sub> associated with increasing I<sub>D</sub> <b>10 times</b> =</td><td>${H.num('b_d1')}</td></tr>
<tr><td>8→9</td><td class="l" colspan="2">ΔV<sub>D</sub> associated with <b>doubling</b> I<sub>D</sub> =</td><td>${H.num('b_d2')}</td></tr>
<tr><th colspan="4">Loading Effect (Forward Biased Diode)</th></tr>
<tr><td rowspan="4">10</td><td class="l" colspan="2">V<sub>D</sub> (no load across the diode) =</td><td>${H.num('b_vdn')}</td></tr>
<tr><td class="l" colspan="2">V<sub>D</sub>′ (100-Ω resistor across the diode) =</td><td>${H.num('b_vdl')}</td></tr>
<tr><td class="l" colspan="2">ΔV<sub>D</sub> = V<sub>D</sub>′ ‒ V<sub>D</sub> =</td><td>${H.num('b_dvl')}</td></tr>
<tr><td class="l" colspan="2">% Change = (ΔV<sub>D</sub> / V<sub>D</sub>) × 100 =</td><td>${H.num('b_pct','0.01')} %</td></tr></table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A: Arrange the values of the forward voltage drop of a rectifier diode, germanium diode and a light emitting diode in an ascending order.
  <div>${H.sel('q1',[['a','Rectifier < Germanium < LED'],['b','Germanium < Rectifier < LED'],['c','LED < Rectifier < Germanium'],['d','Germanium < LED < Rectifier']])}</div></li>
<li class="plq">Procedure B, step 4 and 5: For the circuit shown in Figure 1.3a, what is the relationship between V<sub>DD</sub>, V<sub>OC</sub> and V<sub>rev</sub>?
  <div>${H.sel('q2',[['a','V<sub>OC</sub> = V<sub>rev</sub> = V<sub>DD</sub> (no current flows, so nothing drops across R<sub>S</sub>)'],['b','V<sub>rev</sub> = V<sub>DD</sub> − 0.7 V'],['c','V<sub>OC</sub> = V<sub>DD</sub> / 2'],['d','V<sub>rev</sub> ≈ 0 V']].map(([v,t])=>[v,t.replace(/<\/?sub>/g,'')]))}</div></li>
<li class="plq">Procedure B, steps 7→9: Calculate the expected increment ΔV<sub>D</sub> from 10 mA to 100 mA, and from 100 mA to 200 mA. Based on that, calculate the expected V<sub>D</sub> at 200 mA.
  <div>${H.row('ΔV<sub>D</sub>|10→100 mA =',H.num('q3a'),'V')}${H.row('ΔV<sub>D</sub>|100→200 mA =',H.num('q3b'),'V')}${H.row('V<sub>D</sub>|200 mA =',H.num('q3c'),'V')}</div></li>
<li class="plq">Procedure B, step 10: What is your observation on the percentage change in V<sub>D</sub> between the no-load case and the R<sub>L</sub> = 100 Ω case?
  <div>${H.sel('q4',[['a','V<sub>D</sub> drops by only a few percent: a forward-biased diode keeps its voltage nearly constant'],['b','V<sub>D</sub> halves because R<sub>L</sub> = R<sub>S</sub>'],['c','V<sub>D</sub> rises by about 50 %'],['d','V<sub>D</sub> becomes zero']].map(([v,t])=>[v,t.replace(/<\/?sub>/g,'')]))}</div></li>
<li class="plq">A certain load operates at 2 V and 10 mA. Use standard 1.5 V batteries and the voltage reference circuit of Fig. 1.4 (identical diodes, 0.67 V @ 10 mA).
  <div><img class="figimg" src="labs/ee312/fig/fig1-4.png" alt="Fig. 1.4" style="max-width:360px"></div>
  <div>${H.row('i. Number of series diodes =',H.num('q5n','1',70))}${H.row('Number of 1.5 V cells used =',H.num('q5b','1',70))}${H.row('ii. R<sub>S</sub> =',H.num('q5r','0.1'),'Ω')}
  ${H.row('iii. Final circuit:',H.sel('q5c',[['a','Cells in series → RS → node + ; the diodes in series from node + to ground, the load in parallel with the diodes'],['b','Diodes in series with the load, RS in parallel'],['c','RS in parallel with the load, diodes in series with the cells']]))}</div></li></ol>`;
return {
sheet:`<div class="paper" id="paper">
<h2>Experiment 1 · Exploring and Testing Junction Diodes</h2>
<div class="figbox" style="padding:10px;text-align:center"><img class="figimg" src="labs/ee312/fig/fig1-2.jpg" alt="Fig. 1.2" style="max-width:260px"></div>
<div class="hint" style="text-align:center">Fig. 1.2 · From right: LED, Ge diode, Zener diode and rectifier diode</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig1-3.png" alt="Fig. 1.3"></div>
<div class="hint" style="text-align:center">Fig. 1.3 · Exploring the essence of diode operation · R<sub>S</sub> = R<sub>L</sub> = 100 Ω, D = 1N4001</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">عبّي القراءات من الـ DMM مثل ما تطلع لك (3 خانات عشرية)، وجاوب الأسئلة، وبعدها اضغط "صحّح إجاباتي".</p>
${t11}${t12}${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'psu',prev:d=>{d.u[0].v=12;d.u[0].ilim=0.5;d.u[1].v=3.3;d.u[1].ilim=0.25}},
  {type:'dmm',prev:d=>{d.fn='OHM'}}],
parts:{R100:{t:'R',r:100,lab:'100Ω'},D4001:{t:'D',lab:'1N4001'},Z4733:{t:'Z',lab:'1N4733A'},LED:{t:'LED',lab:'LED'},GE:{t:'GE',lab:'Ge'},BR:{t:'BR',lab:''}},
tray:[['R100','100 Ω'],['D4001','1N4001'],['Z4733','1N4733A'],['LED','LED (green)'],['GE','Ge diode'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const PART_OF={D4001:'si',Z4733:'zener',LED:'led',GE:'ge'};
  /* expected readings from the same device models */
  const diodeTest=m=>{const ck={n:1,els:[{t:'CCS',a:0,b:-1,i0:1e-3,vmax:2.8},{t:'D',a:0,b:-1,f:SOLVER.MODELS[m]}],dcs:[]};return SOLVER.point(ck,0).x[0]};
  const EXP={si:diodeTest('si'),zener:diodeTest('zener'),led:diodeTest('led'),ge:diodeTest('ge')};
  /* Fig. 1.3b: node 0 = supply +, node 1 = anode; DMM 10 MΩ across the diode */
  const fig13=(vdd,rl)=>{const els=[{t:'DC',a:0,b:-1,v:vdd,ilim:0.05,r:0.02},{t:'G',a:0,b:1,g:1/100},{t:'D',a:1,b:-1,f:SOLVER.diodeSi},{t:'G',a:1,b:-1,g:1e-7}];if(rl)els.push({t:'G',a:1,b:-1,g:1/rl});
    const r=SOLVER.point({n:2,els,dcs:[0]},0);return {vrs:r.x[0]-r.x[1],vd:r.x[1]}};
  const vddFor=vrs=>{let lo=0,hi=10;for(let k=0;k<60;k++){const m=(lo+hi)/2;fig13(m).vrs<vrs?lo=m:hi=m}return lo};
  const REF={voc:5*1e7/(1e7+100),vd1:fig13(vddFor(0.1)).vd,vd10:fig13(vddFor(1)).vd,vd20:fig13(vddFor(2)).vd};REF.vdl=fig13(vddFor(2),100).vd;
  let ST={};
  const dmm=()=>RT.dmm()||{};
  const dn=()=>({hi:RT.leadNet('mh'),lo:RT.leadNet('ml')});
  /* the part the DMM leads sit across, with polarity (fwd = HI on the anode) */
  function across(){const {hi,lo}=dn();const b=RT.between(hi,lo);return b.length===1?{type:b[0].p.type,fwd:b[0].dir===1,p:b[0].p}:b.length?{multi:true}:null}
  /* Procedure B topology on whichever supply unit is wired */
  function procB(){const S=RT.S;for(const u of [0,1]){const pk=u?'Rp':'Lp',mk=u?'Rm':'Lm';const P=RT.leadNet(pk),N=RT.leadNet(mk);if(P==null||N==null||P===N)continue;
      const rs=RT.at(P).filter(p=>p.type==='R100').map(p=>{const [a,b]=RT.partNets(p);return {p,X:a===P?b:a}}).find(r=>r.X!==N);if(!rs)continue;
      const X=rs.X,others=RT.at(X).filter(p=>p!==rs.p);const d=RT.between(X,N).filter(x=>x.p.type==='D4001');const rl=RT.between(X,N).filter(x=>x.p.type==='R100');
      const U=S.psu.u[u];return {u,U,P,N,X,rs:rs.p,open:others.length===0,diode:d.length===1&&others.length===d.length+rl.length?d[0]:null,rl:rl.length?rl[0].p:null,on:S.psu.pwr&&U.on}}
    return null}
  function status(){const S=RT.S,d=dmm(),D=S.dmm;const st={};const ac=across();const {hi,lo}=dn();
    st.dmmDiode=D.pwr&&D.fn==='DIODE';st.dmmDCV=D.pwr&&D.fn==='DCV';
    const reading=d.ol?'OVL.D':d.val;
    if(st.dmmDiode&&!ac&&(hi==null||lo==null||hi===lo||RT.at(hi).length+RT.at(lo).length===0)&&d.ol)ST.open=true;
    if(st.dmmDiode&&ac&&!ac.multi&&PART_OF[ac.type]&&D.jack==='HI'){if(ac.type==='D4001'&&!ac.fwd&&d.ol)ST.revSi=true;if(ac.fwd&&!d.ol)ST['f_'+ac.type]=d.val}
    const B=procB();st.B=B;
    if(B){const vrs=RT.partV(B.rs);st.vrs=vrs;const meter=(a,b)=>(hi===a&&lo===b);
      st.figA=B.open&&meter(B.X,B.N);st.unitOK=B.on&&Math.abs(B.U.v-5)<0.006&&B.U.ilim<=0.0501;
      if(st.figA&&st.unitOK&&st.dmmDCV&&d.val>4.9){ST.voc=d.val}
      if(B.diode&&B.diode.dir===-1&&meter(B.X,B.N)&&st.unitOK&&st.dmmDCV&&d.val>4.9){ST.vrev=d.val}
      st.fwd=B.diode&&B.diode.dir===1;
      [[0.1,'1'],[1,'10'],[2,'20']].forEach(([t,k])=>{const ok=st.fwd&&!B.rl&&B.on&&Math.abs(vrs-t)<=0.006;
        if(ok&&st.dmmDCV&&meter(B.P,B.X)&&Math.abs(d.val-t)<=0.006)ST['rs'+k]=true;
        if(ok&&ST['rs'+k]&&st.dmmDCV&&meter(B.X,B.N))ST['vd'+k]=d.val});
      if(st.fwd&&B.rl&&B.on&&ST.vd20!=null&&st.dmmDCV&&meter(B.X,B.N)&&Math.abs(B.U.v-ST.vdd20)<0.02)ST.vdl=d.val;
      if(ST.vd20!=null&&!B.rl&&st.fwd&&Math.abs(vrs-2)<=0.006)ST.vdd20=B.U.v}
    if(ST.vdl!=null&&(!S.psu.pwr||(B&&!B.U.on)))ST.off=true;
    st.ST=ST;return st}
  const G=ENGINE.sheet;
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    g.add(G.s('a_open')==='ovl','Table 1.1 open circuit','OVL.D');g.add(G.s('a_rev')==='ovl','Table 1.1 reverse-biased','OVL.D');
    [['a_si','si','Rectifier'],['a_z','zener','Zener'],['a_led','led','LED'],['a_ge','ge','Germanium']].forEach(([id,m,t])=>g.add(G.near(v(id),EXP[m],0.006),`VF ${t}`,`≈ ${EXP[m].toFixed(3)} V`));
    g.add(G.near(v('b_voc'),REF.voc,0.01),'VOC',`≈ ${REF.voc.toFixed(3)} V`);g.add(G.near(v('b_vrev'),REF.voc,0.01),'Vrev',`≈ ${REF.voc.toFixed(3)} V`);
    [['b_vd1','vd1','1'],['b_vd10','vd10','10'],['b_vd20','vd20','20']].forEach(([id,k,ma])=>g.add(G.near(v(id),REF[k],0.008),`VD @ ${ma} mA`,`≈ ${REF[k].toFixed(3)} V`));
    const d1=v('b_vd10')-v('b_vd1'),d2=v('b_vd20')-v('b_vd10');
    g.add(G.near(v('b_d1'),d1,0.002)&&G.near(v('b_d1'),REF.vd10-REF.vd1,0.015),'ΔVD 7→8',`= VD(10 mA) − VD(1 mA) ≈ ${(REF.vd10-REF.vd1).toFixed(3)} V`);
    g.add(G.near(v('b_d2'),d2,0.002)&&G.near(v('b_d2'),REF.vd20-REF.vd10,0.012),'ΔVD 8→9',`= VD(20 mA) − VD(10 mA) ≈ ${(REF.vd20-REF.vd10).toFixed(3)} V`);
    g.add(G.near(v('b_vdn'),REF.vd20,0.008),'VD no load',`= VD at 20 mA ≈ ${REF.vd20.toFixed(3)} V`);g.add(G.near(v('b_vdl'),REF.vdl,0.008),"VD′ with RL",`≈ ${REF.vdl.toFixed(3)} V`);
    const dv=v('b_vdl')-v('b_vdn');g.add(G.near(v('b_dvl'),dv,0.002)&&dv<0,'ΔVD (load)',`= VD′ − VD ≈ ${(REF.vdl-REF.vd20).toFixed(3)} V`);
    g.add(G.near(v('b_pct'),dv/v('b_vdn')*100,0.1),'% change',`≈ ${((REF.vdl-REF.vd20)/REF.vd20*100).toFixed(2)} %`);
    g.add(G.s('q1')==='b','PLQ 1','Germanium < Rectifier < LED');g.add(G.s('q2')==='a','PLQ 2','VOC = Vrev = VDD');
    g.add(G.near(v('q3a'),d1,0.003),'PLQ 3 ΔVD 10→100 mA','one decade more current ≈ the same ΔVD as 1→10 mA');
    g.add(G.near(v('q3b'),d2,0.003),'PLQ 3 ΔVD 100→200 mA','doubling the current ≈ the same ΔVD as 10→20 mA');
    g.add(G.near(v('q3c'),v('b_vd10')+d1+d2,0.004),'PLQ 3 VD @ 200 mA','= VD(10 mA) + ΔVD(10→100) + ΔVD(100→200)');
    g.add(G.s('q4')==='a','PLQ 4','a forward-biased diode keeps its voltage nearly constant (a few % change)');
    g.add(v('q5n')===3,'PLQ 5 i','3 diodes × 0.67 V ≈ 2 V');g.add(v('q5b')===2,'PLQ 5 cells','2 × 1.5 V = 3 V (the smallest battery above 2 V)');
    g.add(G.near(v('q5r'),(3-3*0.67)/0.02,1.5),'PLQ 5 ii RS','RS = (3 − 2.01) / (10 mA load + 10 mA diodes) ≈ 49.5 Ω');g.add(G.s('q5c')==='a','PLQ 5 iii');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'dmm',t:'Procedure A: شغّل الـ MT3805 (POWER) وحوّله على وضع اختبار الدايود ▶|.',ok:s=>s.dmmDiode},
      {dev:'dmm',t:'والأطراف مفتوحة (مو موصولة على شي)، شوف قراءة الـ open circuit وسجّلها في Table 1.1.',ok:s=>ST.open},
      {dev:'board',t:'حط الـ 1N4001 بين nodeين، ووصّل HI و COM على طرفيه بحيث القراءة تبقى نفس قراءة الـ open circuit (يعني HI على الكاثود، عند الحلقة الرمادية).',ok:s=>ST.revSi},
      {dev:'board',t:'اعكس التوصيل (HI على الأنود): الـ DMM يعطيك الـ forward voltage drop. سجّله في Table 1.1.',ok:s=>ST.f_D4001!=null},
      {dev:'board',t:'كرّر مع باقي الدايودات: الزينر 1N4733A، والـ LED، والـ Ge diode، وسجّل الـ forward drop لكل واحد.',ok:s=>ST.f_Z4733!=null&&ST.f_LED!=null&&ST.f_GE!=null},
      {dev:'board',t:'Procedure B: ركّب Fig. 1.3a: + الوحدة ← RS = 100 Ω ← node فاضية (open circuit)، و − الوحدة. الـ DMM: HI على طرف RS الفاضي و COM على − الوحدة.',ok:s=>s.figA},
      {dev:'dmm',t:'حوّل الـ DMM على DCV.',ok:s=>s.figA&&s.dmmDCV},
      {dev:'psu',t:'شغّل ∼POWER. ومفتاح الـ dc على OFF (PRESET): اضبط CURRENT على 0.05 A، و COARSE و FINE على 5 V، وبعدين حوّل الـ dc على ON.',ok:s=>s.figA&&s.unitOK},
      {dev:'dmm',t:'سجّل V<sub>OC</sub> اللي يقراه الـ DMM في Table 1.2.',ok:s=>ST.voc!=null},
      {dev:'board',t:'حط الـ 1N4001 معكوس مكان الـ open circuit (الكاثود جهة RS)، والـ DMM على الدايود، وسجّل V<sub>rev</sub>.',ok:s=>ST.vrev!=null},
      {dev:'psu',t:'طفّ مفتاح الـ dc، واقلب الدايود (Fig. 1.3b: الأنود جهة RS).',ok:s=>s.B&&s.fwd&&!s.B.on},
      {dev:'psu',t:'شغّل الـ dc، وحط الـ DMM على RS، ونزّل/ارفع V<sub>DD</sub> بالـ COARSE و FINE لين V<sub>RS</sub> = 0.1 V (I<sub>D</sub> = 1 mA). بعدها انقل الأطراف على الدايود وسجّل V<sub>D</sub>.',ok:s=>ST.vd1!=null},
      {dev:'psu',t:'ارفع V<sub>DD</sub> لين V<sub>RS</sub> = 1 V (10 mA)، وسجّل V<sub>D</sub>.',ok:s=>ST.vd10!=null},
      {dev:'psu',t:'ارفع V<sub>DD</sub> لين V<sub>RS</sub> = 2 V (20 mA)، وسجّل V<sub>D</sub>.',ok:s=>ST.vd20!=null},
      {dev:'board',t:'بدون ما تغيّر V<sub>DD</sub>: حط R<sub>L</sub> = 100 Ω بالتوازي مع الدايود، وسجّل V<sub>D</sub>′.',ok:s=>ST.vdl!=null},
      {dev:'psu',t:'طفّ الـ dc supply (وفصّل القطع ورتّب طاولتك).',ok:s=>ST.off}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
