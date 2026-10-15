/* EE312 · Experiment 1 · Exploring and Testing Junction Diodes (manual v8.8 pp. 8–13).
   Procedure A: MT3805 diode test on the 1N4001, Zener 1N4733A, green LED and Ge diode (Table 1.1).
   Procedure B: Fig. 1.3 with one EL302RD unit (VDD), RS = 100 Ω, the 1N4001 and RL = 100 Ω (Table 1.2).
   Part A as in the lab: the diode's legs go straight into the DMM's HI / COM jacks (tap to flip).
   Assumptions: "Fig. 1.5a" in step 5 is Fig. 1.3a with the rectifier reversed; two MT3805 meters as in Fig. 1.3 (DMM 1 on RS,
   DMM 2 on the diode); the Ge diode is a 1N34A-class point-contact part; PLQ 5 uses 2 × 1.5 V cells. */
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
/* the figures' reference wiring, in the lab's rectangle layout (bottom-left node 22, left column 22–8, top row 8–10,
   right column 10–24, bottom row back to 22): DC + top-left, R_S along the top, the diode down the right side;
   DMM 1 on R_S, DMM 2 across the diode (Fig. 1.3 draws both; either meter may take either place) */
const SUP=[{lead:'Lp',alt:'Rp',at:8},{lead:'Lm',alt:'Rm',at:22}],RS=[{part:['R100',8,9]},{wire:[9,10]},{wire:[17,24]},{wire:[24,23]},{wire:[23,22]}];
const V2=[{lead:'m2h',alt:'mh',at:10},{lead:'m2l',alt:'ml',at:17}],V1=[{lead:'mh',alt:'m2h',at:8},{lead:'ml',alt:'m2l',at:9}];
const FIG='labs/ee312/fig/fig1-3.png';
const figs={'1.3a':{img:FIG,cap:'Fig. 1.3a · open circuit',lines:[...SUP,...RS,...V2]},
  '1.5a':{img:FIG,cap:'Fig. 1.5a · the 1N4001 reversed',lines:[...SUP,...RS,{part:['D4001',17,10],pol:true},...V2]},
  '1.3b':{img:FIG,cap:'Fig. 1.3b',lines:[...SUP,...RS,{part:['D4001',10,17],pol:true},...V2,...V1]},
  '1.3b-RL':{img:FIG,cap:'Fig. 1.3b · R<sub>L</sub> = 100 Ω across the diode',lines:[...SUP,...RS,{part:['D4001',10,17],pol:true},{wire:[10,11]},{part:['R100',11,18]},{wire:[17,18]},...V2,...V1]}};
return {figs,procs:[{id:'A',title:'Testing junction diodes with the DMM (Table 1.1)'},{id:'B',title:'The diode in a circuit: Fig. 1.3 (Table 1.2)'}],
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
  {type:'dmm',n:1,prev:d=>{d.fn='OHM'}},
  {type:'dmm',n:2,prev:d=>{d.fn='ACV'}}],
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
  /* two bench meters (Fig. 1.3 draws both): any meter may do Procedure A; in Procedure B the steps put DMM 1 on R_S
     (V_RS) and DMM 2 on the diode (V_OC, V_rev, V_D) — the checks accept whichever meter sits on the right nodes */
  function acrossM(m){const b=RT.between(m.hi,m.lo);return b.length===1?{type:b[0].p.type,fwd:b[0].dir===1,p:b[0].p}:b.length?{multi:true}:null}
  /* Procedure B topology on whichever supply unit is wired */
  function procB(){const S=RT.S;for(const u of [0,1]){const pk=u?'Rp':'Lp',mk=u?'Rm':'Lm';const P=RT.leadNet(pk),N=RT.leadNet(mk);if(P==null||N==null||P===N)continue;
      const rs=RT.at(P).filter(p=>p.type==='R100').map(p=>{const [a,b]=RT.partNets(p);return {p,X:a===P?b:a}}).find(r=>r.X!==N);if(!rs)continue;
      const X=rs.X,others=RT.at(X).filter(p=>p!==rs.p);const d=RT.between(X,N).filter(x=>x.p.type==='D4001');const rl=RT.between(X,N).filter(x=>x.p.type==='R100');
      const U=S.psu.u[u];return {u,U,P,N,X,rs:rs.p,open:others.length===0,diode:d.length===1&&others.length===d.length+rl.length?d[0]:null,rl:rl.length?rl[0].p:null,on:S.psu.pwr&&U.on}}
    return null}
  function status(){const S=RT.S,M=RT.meters();const st={};
    st.dmmDiode=M.some(m=>m.D.pwr&&m.D.fn==='DIODE');st.dmmDCV=M.some(m=>m.D.pwr&&m.D.fn==='DCV');
    st.jdIn=M.some(m=>m.D.jd);
    M.forEach(m=>{const D=m.D,d=m.r;if(!(D.pwr&&D.fn==='DIODE'))return;
      /* the lab's way: the diode's legs straight in HI / COM (anode in HI = forward) */
      const jd=D.jd;if(jd){if(PART_OF[jd.type]){if(jd.type==='D4001'&&jd.flip&&d.ol)ST.revSi=true;if(!jd.flip&&!d.ol)ST['f_'+jd.type]=d.val}return}
      const ac=acrossM(m),hi=m.hi,lo=m.lo;
      if(!ac&&(hi==null||lo==null||hi===lo||RT.at(hi).length+RT.at(lo).length===0)&&d.ol)ST.open=true;
      if(ac&&!ac.multi&&PART_OF[ac.type]&&D.jack==='HI'){if(ac.type==='D4001'&&!ac.fwd&&d.ol)ST.revSi=true;if(ac.fwd&&!d.ol)ST['f_'+ac.type]=d.val}});
    const B=procB();st.B=B;
    if(B){const vrs=RT.partV(B.rs);st.vrs=vrs;const on=(a,b)=>M.some(m=>m.hi===a&&m.lo===b);const rd=(a,b)=>{const q=RT.meterOn(a,b,true);return q?q.val:null};
      st.figA=B.open&&on(B.X,B.N);st.unitOK=B.on&&Math.abs(B.U.v-5)<0.006&&B.U.ilim<=0.0501;
      const vx=rd(B.X,B.N),vr=rd(B.P,B.X);st.vxDCV=vx!=null;
      if(st.figA&&st.unitOK&&vx!=null&&vx>4.9){ST.voc=vx}
      if(B.diode&&B.diode.dir===-1&&st.unitOK&&vx!=null&&vx>4.9){ST.vrev=vx}
      st.fwd=B.diode&&B.diode.dir===1;
      [[0.1,'1'],[1,'10'],[2,'20']].forEach(([t,k])=>{const ok=st.fwd&&!B.rl&&B.on&&Math.abs(vrs-t)<=0.006;
        if(ok&&vr!=null&&Math.abs(vr-t)<=0.006)ST['rs'+k]=true;
        if(ok&&ST['rs'+k]&&vx!=null)ST['vd'+k]=vx});
      if(st.fwd&&B.rl&&B.on&&ST.vd20!=null&&vx!=null&&Math.abs(B.U.v-ST.vdd20)<0.02)ST.vdl=vx;
      if(ST.vd20!=null&&!B.rl&&st.fwd&&Math.abs(vrs-2)<=0.006)ST.vdd20=B.U.v}
    if(ST.vdl!=null&&(!S.psu.pwr||(B&&!B.U.on)))ST.off=true;
    st.ST=ST;return st}
  const G=ENGINE.sheet;
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    g.proc('A');g.add(G.s('a_open')==='ovl','Table 1.1 open circuit','OVL.D');g.add(G.s('a_rev')==='ovl','Table 1.1 reverse-biased','OVL.D');
    [['a_si','si','Rectifier'],['a_z','zener','Zener'],['a_led','led','LED'],['a_ge','ge','Germanium']].forEach(([id,m,t])=>g.add(G.near(v(id),EXP[m],0.006),`VF ${t}`,`≈ ${EXP[m].toFixed(3)} V`));
    g.proc('B');g.add(G.near(v('b_voc'),REF.voc,0.01),'VOC',`≈ ${REF.voc.toFixed(3)} V`);g.add(G.near(v('b_vrev'),REF.voc,0.01),'Vrev',`≈ ${REF.voc.toFixed(3)} V`);
    [['b_vd1','vd1','1'],['b_vd10','vd10','10'],['b_vd20','vd20','20']].forEach(([id,k,ma])=>g.add(G.near(v(id),REF[k],0.008),`VD @ ${ma} mA`,`≈ ${REF[k].toFixed(3)} V`));
    const d1=v('b_vd10')-v('b_vd1'),d2=v('b_vd20')-v('b_vd10');
    g.add(G.near(v('b_d1'),d1,0.002)&&G.near(v('b_d1'),REF.vd10-REF.vd1,0.015),'ΔVD 7→8',`= VD(10 mA) − VD(1 mA) ≈ ${(REF.vd10-REF.vd1).toFixed(3)} V`);
    g.add(G.near(v('b_d2'),d2,0.002)&&G.near(v('b_d2'),REF.vd20-REF.vd10,0.012),'ΔVD 8→9',`= VD(20 mA) − VD(10 mA) ≈ ${(REF.vd20-REF.vd10).toFixed(3)} V`);
    g.add(G.near(v('b_vdn'),REF.vd20,0.008),'VD no load',`= VD at 20 mA ≈ ${REF.vd20.toFixed(3)} V`);g.add(G.near(v('b_vdl'),REF.vdl,0.008),"VD′ with RL",`≈ ${REF.vdl.toFixed(3)} V`);
    const dv=v('b_vdl')-v('b_vdn');g.add(G.near(v('b_dvl'),dv,0.002)&&dv<0,'ΔVD (load)',`= VD′ − VD ≈ ${(REF.vdl-REF.vd20).toFixed(3)} V`);
    g.add(G.near(v('b_pct'),dv/v('b_vdn')*100,0.1),'% change',`≈ ${((REF.vdl-REF.vd20)/REF.vd20*100).toFixed(2)} %`);
    g.proc('A');g.add(G.s('q1')==='b','PLQ 1','Germanium < Rectifier < LED');g.proc('B');g.add(G.s('q2')==='a','PLQ 2','VOC = Vrev = VDD');
    g.add(G.near(v('q3a'),d1,0.003),'PLQ 3 ΔVD 10→100 mA','one decade more current ≈ the same ΔVD as 1→10 mA');
    g.add(G.near(v('q3b'),d2,0.003),'PLQ 3 ΔVD 100→200 mA','doubling the current ≈ the same ΔVD as 10→20 mA');
    g.add(G.near(v('q3c'),v('b_vd10')+d1+d2,0.004),'PLQ 3 VD @ 200 mA','= VD(10 mA) + ΔVD(10→100) + ΔVD(100→200)');
    g.add(G.s('q4')==='a','PLQ 4','a forward-biased diode keeps its voltage nearly constant (a few % change)');
    g.proc(null);g.add(v('q5n')===3,'PLQ 5 i','3 diodes × 0.67 V ≈ 2 V');g.add(v('q5b')===2,'PLQ 5 cells','2 × 1.5 V = 3 V (the smallest battery above 2 V)');
    g.add(G.near(v('q5r'),(3-3*0.67)/0.02,1.5),'PLQ 5 ii RS','RS = (3 − 2.01) / (10 mA load + 10 mA diodes) ≈ 49.5 Ω');g.add(G.s('q5c')==='a','PLQ 5 iii');
    g.show($('result'))});
  /* "do it for me" helpers: the supply unit wired into the circuit, its voltage by COARSE then FINE, V_RS by the same knobs */
  const U=()=>RT.leadNet('Rp')!=null&&RT.leadNet('Lp')==null?'R':'L';
  /* turn COARSE while it brings the value closer, then FINE (a COARSE step that overshoots is turned back) */
  const knobTo=async(A,u,get,t,tol,done)=>{let fineOnly=false;for(let i=0;i<500;i++){if(done&&done())return;const x=get();if(x==null)return;const e=x-t;if(Math.abs(e)<=tol)return;
      const k='p:'+u+(fineOnly?'VF':'VC')+(e<0?'+':'-');await A.tap(k,fineOnly?35:90);
      if(!fineOnly){const y=get();if(y==null)return;if(Math.abs(y-t)>=Math.abs(e)||Math.sign(y-t)!==Math.sign(e)&&Math.abs(y-t)>tol){if(Math.abs(y-t)>=Math.abs(e))await A.tap('p:'+u+'VC'+(e<0?'-':'+'),90);fineOnly=true}}}};
  const volts=(A,v)=>{const u=U();return knobTo(A,u,()=>RT.S.psu.u[u==='L'?0:1].v,v,0.004)};
  const tune=(A,t)=>{const u=U(),k='rs'+{0.1:'1',1:'10',2:'20'}[t];return knobTo(A,u,()=>{const m=rsM();return m&&m.D.fn==='DCV'?status().vrs:null},t,0.004,()=>!!ST[k])};
  /* the meter on the circuit (Fig. 1.3a draws one: DMM 1 or DMM 2), the one across R_S (Fig. 1.3b) */
  const rsM=()=>{const B=procB();return B?RT.meters().find(m=>m.hi===B.P&&m.lo===B.X||m.hi===B.X&&m.lo===B.P):null};
  const MM=()=>RT.leadNet('m2h')!=null?{key:'dmm2',p:'m2'}:RT.leadNet('mh')!=null?{key:'dmm',p:'m'}:null;
  return {status,
    steps:[
      /* Procedure A (manual p. 10), steps 1–5; every step split into its sub-steps (Batch 7 item 3) */
      {dev:'dmm',t:'Procedure A · 1. حوّل الـ DMM على وضع اختبار الدايود (diode-test ▶|).',subs:[
        {k:'set',dev:'dmm',t:'شغّل الـ DMM (زر POWER).',ok:()=>RT.meters().some(m=>m.D.pwr),do:async A=>{if(!RT.S.dmm.pwr)await A.press('m:PWR')},hint:'زر POWER تحت يمين الـ DMM'},
        {k:'set',dev:'dmm',t:'اختر diode-test ▶|.',ok:s=>s.dmmDiode,do:A=>A.press('m:DIODE'),hint:'زر ▶| في صف الوظائف'}]},
      {dev:'dmm',t:'2. شوف قراءة الـ DMM والمداخل فاضية (open circuit) وسجّلها في Table 1.1.',subs:[
        {k:'measure',dev:'dmm',t:'خلّ مداخل الـ DMM فاضية: الشاشة تقرا OVL.D (open circuit).',ok:()=>!!ST.open,do:async A=>{if(RT.S.dmm.jd)await A.press('m:JDOUT')},hint:'شيل أي دايود أو سلك من مداخل الـ DMM وخلّه على ▶|'},
        {k:'rec',t:'سجّل القراءة في Table 1.1 (Open circuit).',ok:()=>!!ST.open,rec:[{to:'a_open',val:()=>ST.open?'ovl':null,txt:()=>'OVL.D',label:'Open circuit',none:'فضّ مداخل الـ DMM وخلّه على ▶|'}]}]},
      {dev:'dmm',t:'3. حط أي دايود (Fig. 1.2) بين المدخل الأحمر والأسود للـ DMM (V·Ω و COM) بحيث يبقى يقرا نفس قراءة الـ open circuit: الكاثود يكون على الأحمر.',subs:[
        {k:'measure',dev:'dmm',t:'حط الـ 1N4001 من «العلبة» في مداخل الـ DMM (HI و COM).',ok:()=>RT.meters().some(m=>m.D.jd&&m.D.jd.type==='D4001'),do:async A=>{if(RT.S.dmm.jd)await A.press('m:JDOUT');await A.jack('D4001')},hint:'اسحب الـ 1N4001 من «العلبة» وأفلته على مداخل الـ DMM'},
        {k:'set',dev:'dmm',t:'اقلبه لين يصير الكاثود (الحلقة) في HI: الشاشة OVL.D.',ok:()=>!!ST.revSi,do:A=>A.until('m:JDFLIP',()=>!!ST.revSi,2),hint:'اضغط على الدايود اللي في المداخل عشان تقلبه'},
        {k:'rec',t:'سجّل القراءة في Table 1.1 (Reverse-biased).',ok:()=>!!ST.revSi,rec:[{to:'a_rev',val:()=>ST.revSi?'ovl':null,txt:()=>'OVL.D',label:'Reverse-biased'}]}]},
      {dev:'dmm',t:'4. اعكس توصيل الدايود: الـ DMM يعطيك الـ forward voltage drop. سجّله في Table 1.1 وتأكد إنه في المدى المكتوب.',subs:[
        {k:'set',dev:'dmm',t:'اعكس الدايود: الأنود في HI.',ok:()=>ST.f_D4001!=null,do:A=>A.until('m:JDFLIP',()=>ST.f_D4001!=null,2),hint:'اضغط على الدايود عشان تقلبه'},
        {k:'rec',t:'سجّل الـ forward drop في Table 1.1 (Rectifier).',ok:()=>ST.f_D4001!=null,rec:[{to:'a_si',val:()=>ST.f_D4001,unit:'V',dec:3,label:'Rectifier'}]}]},
      {dev:'dmm',t:'5. كرّر خطوة 3 و 4 لباقي أنواع الدايودات.',subs:[
        {k:'measure',dev:'dmm',t:'الزينر 1N4733A: الأنود في HI.',ok:()=>ST.f_Z4733!=null,do:async A=>{if(RT.S.dmm.jd)await A.press('m:JDOUT');await A.jack('Z4733');if(ST.f_Z4733==null)await A.press('m:JDFLIP')},hint:'حط الـ 1N4733A في المداخل، الحلقة (الكاثود) في COM'},
        {k:'measure',dev:'dmm',t:'الـ LED (الرجل الطويلة = الأنود في HI؛ يضوي خفيف).',ok:()=>ST.f_LED!=null,do:async A=>{if(RT.S.dmm.jd)await A.press('m:JDOUT');await A.jack('LED');if(ST.f_LED==null)await A.press('m:JDFLIP')},hint:'حط الـ LED في المداخل، الرجل الطويلة في HI'},
        {k:'measure',dev:'dmm',t:'الـ Ge diode: الأنود في HI.',ok:()=>ST.f_GE!=null,do:async A=>{if(RT.S.dmm.jd)await A.press('m:JDOUT');await A.jack('GE');if(ST.f_GE==null)await A.press('m:JDFLIP')},hint:'حط الـ Ge diode في المداخل، الحلقة في COM'},
        {k:'set',dev:'dmm',t:'اضغط «شيل» عشان تفضّى مداخل الـ DMM.',ok:s=>!s.jdIn,do:A=>A.press('m:JDOUT')},
        {k:'rec',t:'سجّل الثلاث قراءات في Table 1.1.',ok:()=>ST.f_Z4733!=null&&ST.f_LED!=null&&ST.f_GE!=null,rec:[{to:'a_z',val:()=>ST.f_Z4733,unit:'V',dec:3,label:'Zener'},{to:'a_led',val:()=>ST.f_LED,unit:'V',dec:3,label:'LED'},{to:'a_ge',val:()=>ST.f_GE,unit:'V',dec:3,label:'Germanium'}]}]},
      /* Procedure B (manual p. 11), steps 1–11 */
      {dev:'board',build:'1.3a',t:'Procedure B · 1. وصّل الدائرة Fig. 1.3a، في البداية بالـ DMM بس على الـ open circuit (بدون دايود).',subs:[{k:'build',fig:'1.3a',t:'وصّل الدائرة <bdi dir="ltr">Fig. 1.3a</bdi>: R<sub>S</sub> = 100 Ω والـ DMM على الـ open circuit.'}]},
      {dev:'dmm2',t:'2. تأكد إن الـ DMM على قياس الجهد المستمر (DCV).',subs:[
        {k:'set',t:'شغّل الـ DMM اللي على الدائرة (زر POWER).',ok:()=>{const m=MM();return !!m&&RT.S[m.key].pwr},do:async A=>{const m=MM();if(m&&!RT.S[m.key].pwr)await A.press(m.p+':PWR')}},
        {k:'set',t:'اختر DCV.',ok:s=>s.figA&&s.vxDCV,do:async A=>{const m=MM();if(m)await A.press(m.p+':DCV')},hint:'زر DCV في صف الوظائف'}]},
      {dev:'psu',t:'3. شغّل الـ dc supply بمفتاح ∼ POWER.',subs:[
        {k:'set',dev:'psu',t:'شغّل مفتاح ∼ POWER.',ok:()=>RT.S.psu.pwr,do:A=>A.press('p:PWR')},
        {k:'set',dev:'psu',t:'بالـ CURRENT خلّ حد التيار 0.05 A.',ok:s=>{const B=s.B;return !!B&&B.U.ilim<=0.0501},do:A=>A.until('p:'+U()+'I-',s=>!!s.B&&s.B.U.ilim<=0.0501,80),hint:'لف CURRENT لليسار لين 0.05 A'},
        {k:'set',dev:'psu',t:'بالـ COARSE و FINE خلّ الجهد 5 V.',ok:s=>{const B=s.B;return !!B&&Math.abs(B.U.v-5)<0.006},do:A=>volts(A,5),hint:'لف COARSE لين قريب من 5 V، وكمّل بالـ FINE'},
        {k:'set',dev:'psu',t:'شغّل مفتاح الـ dc ⎓ ON.',ok:s=>s.figA&&s.unitOK,do:A=>A.press('p:'+U()+'ON')}]},
      {dev:'dmm2',t:'4. سجّل قراءة الـ DMM للـ open-circuit voltage V<sub>OC</sub> في Table 1.2.',subs:[{k:'rec',t:'سجّل V<sub>OC</sub>.',ok:()=>ST.voc!=null,rec:[{to:'b_voc',val:()=>ST.voc,unit:'V',dec:3,label:'V<sub>OC</sub>'}]}]},
      {dev:'board',build:'1.5a',t:'5. وصّل الـ rectifier diode بالعكس (Fig. 1.5a)، وسجّل الـ reverse voltage drop V<sub>rev</sub> على الدايود.',subs:[
        {k:'build',fig:'1.5a',t:'وصّل الـ 1N4001 بالعكس (<bdi dir="ltr">Fig. 1.5a</bdi>) والـ DMM عليه.'},
        {k:'rec',t:'سجّل V<sub>rev</sub>.',ok:()=>ST.vrev!=null,rec:[{to:'b_vrev',val:()=>ST.vrev,unit:'V',dec:3,label:'V<sub>rev</sub>'}]}]},
      {dev:'board',build:'1.3b',t:'6. طفّ مفتاح الـ dc. اقلب الدايود (Fig. 1.3b).',subs:[
        {k:'set',dev:'psu',t:'طفّ مفتاح الـ dc ⎓ ON.',ok:s=>!!s.B&&!s.B.on||!RT.S.psu.pwr,do:A=>A.press('p:'+U()+'ON')},
        {k:'build',fig:'1.3b',t:'اقلب الدايود (<bdi dir="ltr">Fig. 1.3b</bdi>).',ok:s=>!!s.B&&!s.B.on}]},
      {dev:'psu',t:'7. شغّل مفتاح الـ dc. اضبط جهد المصدر لين الجهد على المقاومة V<sub>RS</sub> = 0.1 V (التيار 1 mA). سجّل الـ forward drop V<sub>D</sub> في Table 1.2.',subs:[
        {k:'set',dev:'psu',t:'شغّل مفتاح الـ dc ⎓ ON.',ok:s=>!!s.B&&s.B.on,do:A=>A.press('p:'+U()+'ON')},
        {k:'measure',t:'الـ DMM اللي على R<sub>S</sub> على DCV عشان تقرا V<sub>RS</sub>.',ok:()=>{const m=rsM();return !!m&&m.D.pwr&&m.D.fn==='DCV'},do:async A=>{const m=rsM();if(!m)return;const p=m.key==='dmm2'?'m2':'m';if(!m.D.pwr)await A.press(p+':PWR');if(m.D.fn!=='DCV')await A.press(p+':DCV')},hint:'الـ DMM اللي على R<sub>S</sub> (Fig. 1.3b): شغّله واختر DCV'},
        {k:'set',dev:'psu',t:'اضبط جهد المصدر لين V<sub>RS</sub> = 0.1 V.',ok:()=>!!ST.rs1,do:A=>tune(A,0.1),hint:s=>`V<sub>RS</sub> الحين ${s.vrs!=null?s.vrs.toFixed(3)+' V':'؟'}: لف FINE لين 0.100 V`},
        {k:'rec',t:'سجّل V<sub>D</sub> @ 1 mA.',ok:()=>ST.vd1!=null,rec:[{to:'b_vd1',val:()=>ST.vd1,unit:'V',dec:3,label:'V<sub>D</sub> @ 1 mA'}]}]},
      {dev:'psu',t:'8. ارفع جهد المصدر لين V<sub>RS</sub> = 1 V (التيار 10 mA). سجّل V<sub>D</sub> الجديدة.',subs:[
        {k:'set',dev:'psu',t:'ارفع الجهد لين V<sub>RS</sub> = 1 V.',ok:()=>!!ST.rs10,do:A=>tune(A,1),hint:s=>`V<sub>RS</sub> الحين ${s.vrs!=null?s.vrs.toFixed(3)+' V':'؟'}: لف COARSE ثم FINE لين 1.000 V`},
        {k:'rec',t:'سجّل V<sub>D</sub> @ 10 mA.',ok:()=>ST.vd10!=null,rec:[{to:'b_vd10',val:()=>ST.vd10,unit:'V',dec:3,label:'V<sub>D</sub> @ 10 mA'}]}]},
      {dev:'psu',t:'9. ارفع جهد المصدر أكثر لين V<sub>RS</sub> = 2 V (التيار 20 mA). سجّل V<sub>D</sub> الجديدة.',subs:[
        {k:'set',dev:'psu',t:'ارفع الجهد لين V<sub>RS</sub> = 2 V.',ok:()=>!!ST.rs20,do:A=>tune(A,2),hint:s=>`V<sub>RS</sub> الحين ${s.vrs!=null?s.vrs.toFixed(3)+' V':'؟'}: لف COARSE ثم FINE لين 2.000 V`},
        {k:'rec',t:'سجّل V<sub>D</sub> @ 20 mA (وهي نفسها V<sub>D</sub> بدون حمل).',ok:()=>ST.vd20!=null,rec:[{to:'b_vd20',val:()=>ST.vd20,unit:'V',dec:3,label:'V<sub>D</sub> @ 20 mA'},{to:'b_vdn',val:()=>ST.vd20,unit:'V',dec:3,label:'V<sub>D</sub> (no load)'}]}]},
      {dev:'board',build:'1.3b-RL',t:'10. وصّل مقاومة 100 Ω (R<sub>L</sub>) بالتوازي مع الدايود. سجّل V<sub>D</sub>′ في Table 1.2.',subs:[
        {k:'build',fig:'1.3b-RL',t:'وصّل R<sub>L</sub> = 100 Ω بالتوازي مع الدايود.'},
        {k:'rec',t:'سجّل V<sub>D</sub>′.',ok:()=>ST.vdl!=null,rec:[{to:'b_vdl',val:()=>ST.vdl,unit:'V',dec:3,label:'V<sub>D</sub>′'}]}]},
      {dev:'psu',t:'11. طفّ الـ dc supply، وفكّ القطع، ورتّب طاولتك.',subs:[{k:'set',dev:'psu',t:'طفّ مفتاح الـ dc ⎓ ON.',ok:()=>!!ST.off,do:A=>A.press('p:'+U()+'ON')}]}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
