/* EE205 · Experiment 1 · Introduction to Measurement of Resistors, Current and Voltage Divider Rules, and Δ-Y
   Transformation Rule (manual pp. 9–16).
   Procedure I: Table 2 (three colour-coded resistors: colour code vs ohmmeter) and Table 3 (YEW decade box at
   4 Ω ×1, 50 Ω ×10, 700 Ω ×100, 5 kΩ ×1K, 30 kΩ ×10K: reading, tolerance, % error).
   Procedure II: Fig. 5, E = 10 V, R1 = 4.7 kΩ, R2 = 1 kΩ, R3 = 2.2 kΩ in series → V1, V2, V3, E (Table 4).
   Procedure III: Fig. 6, E = 10 V, 1 kΩ ∥ 4.7 kΩ ∥ 2.2 kΩ → I1, I2, I3, IT with the GoldStar in series (Table 5).
   Procedure IV: Fig. 7 bridge (a-c 220, a-b 470, c-b 10 k, c-d 220, b-d 1 k), E = 15 V → ID; Δ abc → Y (Ra, Rb, Rc on
   the three decade boxes), Fig. 8 → IY.
   Instruments (each procedure brings its own, see `procs` below): Thandar TS3022S, Fluke 77 (M1: ohmmeter / voltmeter), GoldStar DM-33x (M2:
   ammeter, as in the lab video), three YEW 2786 boxes.
   Assumptions: the three "colour code resistors" of Procedure I are 330 Ω, 6.8 kΩ and 56 kΩ (5 %, gold band); the parts
   are real (each a little off its nominal value, inside 5 %); "simulated" values of Procedure IV are the calculated
   ones (no PSpice on this bench); the Δ→Y values are set on the boxes to the nearest ohm. */
EXP_DEFS['ee205/exp1']=(()=>{const H=ENGINE.sheet;
const PARTS={RC1:{t:'R',r:333.4,nom:330,lab:'Resistor 1'},RC2:{t:'R',r:6744,nom:6800,lab:'Resistor 2'},RC3:{t:'R',r:56620,nom:56000,lab:'Resistor 3'},
  R220:{t:'R',r:218.7,nom:220,lab:'220Ω'},R470:{t:'R',r:466.2,nom:470,lab:'470Ω'},R1k:{t:'R',r:994.1,nom:1000,lab:'1kΩ'},R2k2:{t:'R',r:2213,nom:2200,lab:'2.2kΩ'},
  R4k7:{t:'R',r:4726,nom:4700,lab:'4.7kΩ'},R10k:{t:'R',r:9874,nom:10000,lab:'10kΩ'},BR:{t:'BR',lab:''}};
const COLS=[['a','Orange · Orange · Brown · Gold'],['b','Blue · Grey · Red · Gold'],['c','Green · Blue · Orange · Gold'],['d','Orange · Orange · Red · Gold'],['e','Blue · Grey · Orange · Gold'],['f','Green · Blue · Red · Gold']];
const BOX=[['b4','×1',4,0.5],['b50','×10',50,0.2],['b700','×100',700,0.05],['b5k','×1K',5000,0.05],['b30k','×10K',30000,0.1]];
const t2=`<table class="tbl"><caption>Table 2 (Procedure I): Resistance measurement by color code and by ohmmeter</caption>
<tr><th>Resistor</th><th>Colors</th><th>Value by Calculation (Ω)</th><th>Value by Measurement (Ω)</th></tr>
${[1,2,3].map(i=>`<tr><td>${i}</td><td>${H.sel('c'+i,COLS)}</td><td>${H.num('cv'+i,'1',90)}</td><td>${H.num('cm'+i,'0.1',90)}</td></tr>`).join('')}</table>`;
const t3=`<table class="tbl"><caption>Table 3 (Procedure I): Resistance measurement and calculation of tolerance and errors</caption>
<tr><th>Readings</th><th>Decade Box Range</th><th>Assigned Resistance</th><th>Ohmmeter Reading (Ω)</th><th>Tolerance ± (Ω)</th><th>% Error</th></tr>
${BOX.map(([k,r,v],i)=>`<tr><td>${i+1}.</td><td>${r}</td><td>${v>=1000?v/1000+' kΩ':v+' Ω'}</td><td>${H.num(k,'0.1',80)}</td><td>${H.num(k+'t','0.001',70)}</td><td>${H.num(k+'e','0.01',70)}</td></tr>`).join('')}</table>`;
const t4=`<table class="tbl"><caption>Table 4 (Procedure II): Results for verification of voltage division rule · E = 10 V</caption>
<tr><th></th><th>V<sub>1</sub> (V)</th><th>V<sub>2</sub> (V)</th><th>V<sub>3</sub> (V)</th><th>V<sub>Total</sub> (V)</th></tr>
<tr><td class="l">By Measurement</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'m','0.001',70)}</td>`).join('')}</tr>
<tr><td class="l">By Calculation</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'c','0.001',70)}</td>`).join('')}</tr>
<tr><td class="l">% Error</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'e','0.01',70)}</td>`).join('')}</tr></table>`;
const t5=`<table class="tbl"><caption>Table 5 (Procedure III): Results for verification of current divider rule · E = 10 V</caption>
<tr><th></th><th>I<sub>1</sub> (mA)</th><th>I<sub>2</sub> (mA)</th><th>I<sub>3</sub> (mA)</th><th>I<sub>T</sub> (mA)</th></tr>
<tr><td class="l">By Measurement</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'m','0.01',70)}</td>`).join('')}</tr>
<tr><td class="l">By Calculation</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'c','0.01',70)}</td>`).join('')}</tr>
<tr><td class="l">% Errors</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'e','0.01',70)}</td>`).join('')}</tr></table>`;
const t6=`<table class="tbl"><caption>Procedure IV: Δ-Y Transformation · E = 15 V</caption>
<tr><td class="l">I<sub>D</sub> calculated (any method except Δ-Y)</td><td>${H.num('idc','0.01',80)} mA</td></tr>
<tr><td class="l">I<sub>D</sub> measured (Fig. 7)</td><td>${H.num('idm','0.01',80)} mA</td></tr>
<tr><td class="l">R<sub>a</sub> (equivalent Y of Δ abc)</td><td>${H.num('ra','0.01',80)} Ω</td></tr>
<tr><td class="l">R<sub>b</sub></td><td>${H.num('rb','0.01',80)} Ω</td></tr>
<tr><td class="l">R<sub>c</sub></td><td>${H.num('rc','0.01',80)} Ω</td></tr>
<tr><td class="l">I<sub>Y</sub> measured (Fig. 8)</td><td>${H.num('iym','0.01',80)} mA</td></tr>
<tr><td class="l">I<sub>Y</sub> calculated</td><td>${H.num('iyc','0.01',80)} mA</td></tr></table>`;
const fig=(f,cap,w=420)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
return {procs:[{id:'I',title:'Resistance measurement (Tables 2, 3)'},{id:'II',title:'Voltage divider rule (Fig. 5, Table 4)'},{id:'III',title:'Current divider rule (Fig. 6, Table 5)'},{id:'IV',title:'Δ-Y transformation (Figs. 7, 8)'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 1 · Measurement of Resistors, Voltage &amp; Current Divider Rules, Δ-Y Transformation</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">عبّي القراءات مثل ما تطلع لك على الأجهزة، واحسب القيم النظرية من القيم الاسمية للقطع، وبعدها اضغط "صحّح إجاباتي". % Error = (measured − calculated) / calculated × 100.</p>
<h3>Procedure I</h3>${t2}${t3}
<h3>Procedure II</h3>${fig('e1-fig5.png','Fig. 5: Circuit to verify voltage division rule')}${t4}
<h3>Procedure III</h3>${fig('e1-fig6.png','Fig. 6: Circuit to verify current division rule')}${t5}
<h3>Procedure IV</h3>${fig('e1-fig7.png','Fig. 7: Δ - Y Circuit',360)}${fig('e1-fig8.png','Fig. 8: Δ - Y Circuit',360)}${t6}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'thandar',procs:['II','III','IV'],prev:d=>{d.u[0].v=12;d.u[0].ilim=0.5;d.u[1].v=5;d.u[1].ilim=0.2}},
  {type:'hdmm',model:'fluke77',n:1,procs:['I','II'],prev:d=>{d.pos=2}},
  {type:'hdmm',model:'goldstar',n:2,procs:['III','IV']},
  {type:'yew',n:1,procs:['I','IV'],prev:d=>{d.d=[3,2,0,1,0,0]}},{type:'yew',n:2,procs:['IV']},{type:'yew',n:3,procs:['IV'],prev:d=>{d.d=[0,0,5,0,0,0]}}],
parts:PARTS,
tray:[['RC1','Resistor 1'],['RC2','Resistor 2'],['RC3','Resistor 3'],['R220','220 Ω'],['R470','470 Ω'],['R1k','1 kΩ'],['R2k2','2.2 kΩ'],['R4k7','4.7 kΩ'],['R10k','10 kΩ'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const N=n=>RT.netOf(n),G=ENGINE.sheet;let ST={};
  const nom=t=>PARTS[t].nom;
  /* reference circuits with the real part values and the meters' own resistances */
  function dc(n,res,E,amm){/* res: [a,b,R]; source + on node 0, − on earth; returns node voltages */
    const els=[{t:'DC',a:0,b:-1,v:E,ilim:2,r:0.02}];res.forEach(([a,b,r])=>els.push({t:'G',a,b,g:1/r}));return SOLVER.point({n,els,dcs:[0]},0).x}
  const A=t=>PARTS[t].r,SH40=5,SH400=0.5;
  const REF={};
  {const x=dc(4,[[0,1,A('R4k7')],[1,2,A('R1k')],[2,-1,A('R2k2')]],10);REF.v1=x[0]-x[1];REF.v2=x[1]-x[2];REF.v3=x[2];REF.vt=x[0]}
  {const Rs=['R1k','R4k7','R2k2'];Rs.forEach((t,k)=>{const r=Rs.map(q=>A(q)+(q===t?SH40:0));const g=r.reduce((s,v)=>s+1/v,0);const vb=10/(1+0.02*g);REF['i'+(k+1)]=vb/r[k]});
    const rp=1/Rs.reduce((s,q)=>s+1/A(q),0);REF.it=10/(rp+SH40+0.02)}
  const bridge=(rac,rab,rcb,rcd,rbd,E,sh)=>{/* nodes: 0 = supply +, 1 = a, 2 = b, 3 = c; d = earth */const x=dc(4,[[0,1,sh],[1,3,rac],[1,2,rab],[3,2,rcb],[3,-1,rcd],[2,-1,rbd]],E);return (x[0]-x[1])/sh};
  REF.id=bridge(A('R220'),A('R470'),A('R10k'),A('R220'),A('R1k'),15,SH400);
  const CAL={};{const S=10000+470+220;CAL.ra=470*220/S;CAL.rb=10000*470/S;CAL.rc=220*10000/S;
    const rp=1/(1/(CAL.rc+220)+1/(CAL.rb+1000));CAL.id=15/(CAL.ra+rp)*1e3;
    CAL.v1=10*4.7/7.9;CAL.v2=10*1/7.9;CAL.v3=10*2.2/7.9;CAL.vt=10;CAL.i1=10;CAL.i2=10/4.7;CAL.i3=10/2.2;CAL.it=CAL.i1+CAL.i2+CAL.i3}
  /* meters: the shown value (SI) of a meter in a function across two nets (HI on a) */
  const shown=m=>m.r.shown&&!m.r.ol&&m.r.shown.si!=null?m.r.shown.si:null;
  const across=(fn,a,b,both)=>{if(a==null||b==null||a===b)return null;for(const m of RT.meters()){if(!m.D.pwr||m.D.fn!==fn)continue;const v=shown(m);if(v==null)continue;
      if(m.hi===a&&m.lo===b)return v;if(both&&m.hi===b&&m.lo===a)return v}return null};
  const amm=(a,b)=>{for(const m of RT.meters()){if(!m.D.pwr||m.D.jack!=='A'||m.D.fn!=='DCI')continue;if(m.hi===a&&m.lo===b&&a!==b){const v=shown(m);if(v!=null)return v}}return null};
  const ammOn=(a,b)=>RT.meters().some(m=>m.D.jack==='A'&&m.hi===a&&m.lo===b&&a!=null&&a!==b);
  function sup(E){for(const u of [0,1]){const P=RT.leadNet(u?'Rp':'Lp'),M=RT.leadNet(u?'Rm':'Lm');if(P==null||M==null)continue;const U=RT.S.psu.u[u];
      return {P,M,U,ok:RT.S.psu.pwr&&U.on&&Math.abs(U.v-E)<0.006}}return null}
  const has=(t,a,b)=>RT.between(N(a),N(b)).some(x=>x.p.type===t);
  const lone=(a,b)=>{const p=RT.between(a,b);return p.length===1&&RT.at(a).length===1&&RT.at(b).length===1?p[0].p.type:null};
  const box=k=>{const i=RT.inst['yew'+k];return {v:i.value(),H:RT.leadNet('y'+k+'H'),L:RT.leadNet('y'+k+'L')}};
  function status(){const st={};const M=RT.meters();const fl=RT.S.hm1,gs=RT.S.hm2;
    st.flOhm=fl.pwr&&fl.fn==='OHM';st.flV=fl.pwr&&fl.fn==='DCV';st.gs40=gs.pos===6;st.gs400=gs.pos===7;
    st.parts=RT.S.parts.length;st.clear=!RT.S.parts.length&&!RT.S.wires.length;
    /* Procedure I: one resistor alone between the ohmmeter's leads */
    const m1=M.find(m=>m.key==='hm1');if(m1&&m1.D.fn==='OHM'&&m1.hi!=null&&m1.lo!=null&&m1.hi!==m1.lo){const t=lone(m1.hi,m1.lo);const v=shown(m1);
      if(t&&/^RC/.test(t)&&v!=null)ST['r'+t]=v;
      /* a decade box alone on the meter's leads */
      [1,2,3].forEach(k=>{const b=box(k);if(!((b.H===m1.hi&&b.L===m1.lo)||(b.H===m1.lo&&b.L===m1.hi))||RT.between(m1.hi,m1.lo).length)return;st.boxOn=k;
        BOX.forEach(([key,,val])=>{if(b.v===val&&v!=null)ST[key]=v})})}
    /* Procedure II: Fig. 5 */
    const s10=sup(10);st.s10=s10;
    st.fig5=has('R4k7',7,8)&&has('R1k',8,9)&&has('R2k2',9,10)&&s10&&s10.P===N(7)&&s10.M===N(10);
    if(st.fig5&&s10.ok){[['v1',7,8],['v2',8,9],['v3',9,10],['vt',7,10]].forEach(([k,a,b])=>{const v=across('DCV',N(a),N(b));if(v!=null)ST[k]=v})}
    /* Procedure III: Fig. 6 (bus 16-17-18, branches 23/24/25 → 30/31/32) */
    const bot=N(30);st.fig6=has('R1k',23,30)&&has('R4k7',24,31)&&has('R2k2',25,32)&&N(30)===N(31)&&N(31)===N(32)&&s10&&s10.M===bot&&s10.P===N(15);
    st.fig6closed=st.fig6&&N(15)===N(16)&&N(16)===N(17)&&N(17)===N(18)&&N(16)===N(23)&&N(17)===N(24)&&N(18)===N(25);
    if(st.fig6&&s10.ok&&st.gs40){
      [['i1',16,23],['i2',17,24],['i3',18,25]].forEach(([k,a,b],j)=>{const others=[[16,23],[17,24],[18,25]].filter((_,q)=>q!==j).every(([x,y])=>N(x)===N(y));
        if(others&&N(15)===N(16)&&N(16)===N(17)&&N(17)===N(18)){const v=amm(N(a),N(b));if(v!=null)ST[k]=v}});
      if(N(16)===N(23)&&N(17)===N(24)&&N(18)===N(25)&&N(16)===N(17)&&N(17)===N(18)){const v=amm(N(15),N(16));if(v!=null)ST.it=v}}
    st.ammI=[[16,23],[17,24],[18,25],[15,16]].map(([a,b])=>ammOn(N(a),N(b)));
    /* Procedure IV: Fig. 7 (a = 9, b = 10/17, c = 16, d = 23/24; + on node 2, ammeter 2 → 9) */
    const s15=sup(15);st.s15=s15;
    const dRest=has('R220',16,23)&&has('R1k',17,24)&&N(10)===N(17)&&N(23)===N(24)&&s15&&s15.M===N(23)&&s15.P===N(2);st.dRest=dRest;
    st.fig7=dRest&&has('R220',9,16)&&has('R470',9,10)&&has('R10k',16,17);
    if(st.fig7&&s15.ok&&st.gs400){const v=amm(N(2),N(9));if(v!=null)ST.id=v}
    const b1=box(1),b2=box(2),b3=box(3);const n=N(12);
    st.ySet=Math.abs(b1.v-CAL.ra)<=1&&Math.abs(b2.v-CAL.rb)<=1&&Math.abs(b3.v-CAL.rc)<=1;
    st.fig8=dRest&&!has('R220',9,16)&&!has('R470',9,10)&&!has('R10k',16,17)&&[[b1,9],[b2,10],[b3,16]].every(([b,x])=>(b.H===n&&b.L===N(x))||(b.L===n&&b.H===N(x)))&&n!==N(9);
    if(st.fig8&&st.ySet&&s15.ok&&st.gs400){const v=amm(N(2),N(9));if(v!=null)ST.iy=v}
    st.off=!RT.S.psu.pwr||!RT.S.psu.u.some(U=>U.on);
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,s=G.s;
    g.proc('I');[['RC1','a'],['RC2','b'],['RC3','c']].forEach(([t,c],i)=>{const k=i+1;g.add(s('c'+k)===c,`Table 2 · Resistor ${k} colors`,COLS.find(q=>q[0]===c)[1]);
      g.add(v('cv'+k)===nom(t),`Table 2 · Resistor ${k} by calculation`,`${nom(t)} Ω`);
      g.add(G.near(v('cm'+k),A(t),A(t)*0.004+0.15),`Table 2 · Resistor ${k} measured`,`≈ ${A(t).toFixed(1)} Ω on the ohmmeter`)});
    BOX.forEach(([k,r,val,tol])=>{const rd=v(k);g.add(G.near(rd,val,val*tol/100+val*0.004+0.15),`Table 3 · ${r} reading`,`≈ ${val} Ω`);
      g.add(G.near(v(k+'t'),val*tol/100,val*tol/100*0.01+1e-4),`Table 3 · ${r} tolerance`,`± ${(val*tol/100).toPrecision(3)} Ω (${tol} %)`);
      g.add(G.near(v(k+'e'),(rd-val)/val*100,0.02),`Table 3 · ${r} % error`,'(reading − box) / box × 100')});
    g.proc('II');['v1','v2','v3','vt'].forEach(k=>{g.add(G.near(v(k+'m'),REF[k],Math.abs(REF[k])*0.003+0.003),`Table 4 · ${k.toUpperCase()} measured`,`≈ ${REF[k].toFixed(3)} V`);
      g.add(G.near(v(k+'c'),CAL[k],0.006),`Table 4 · ${k.toUpperCase()} calculated`,`${CAL[k].toFixed(3)} V`);g.add(G.near(v(k+'e'),(v(k+'m')-v(k+'c'))/v(k+'c')*100,0.05),`Table 4 · ${k.toUpperCase()} % error`)});
    g.proc('III');['i1','i2','i3','it'].forEach(k=>{g.add(G.near(v(k+'m'),REF[k]*1e3,REF[k]*1e3*0.004+0.02),`Table 5 · ${k.toUpperCase()} measured`,`≈ ${(REF[k]*1e3).toFixed(2)} mA`);
      g.add(G.near(v(k+'c'),CAL[k],0.02),`Table 5 · ${k.toUpperCase()} calculated`,`${CAL[k].toFixed(2)} mA`);g.add(G.near(v(k+'e'),(v(k+'m')-v(k+'c'))/v(k+'c')*100,0.05),`Table 5 · ${k.toUpperCase()} % error`)});
    g.proc('IV');g.add(G.near(v('idc'),CAL.id,0.1),'ID calculated',`${CAL.id.toFixed(2)} mA`);g.add(G.near(v('idm'),REF.id*1e3,REF.id*1e3*0.005+0.1),'ID measured',`≈ ${(REF.id*1e3).toFixed(1)} mA`);
    g.add(G.near(v('ra'),CAL.ra,0.02),'Ra',`${CAL.ra.toFixed(2)} Ω`);g.add(G.near(v('rb'),CAL.rb,0.02),'Rb',`${CAL.rb.toFixed(2)} Ω`);g.add(G.near(v('rc'),CAL.rc,0.02),'Rc',`${CAL.rc.toFixed(2)} Ω`);
    g.add(ST.iy!=null&&G.near(v('iym'),ST.iy*1e3,0.06),'IY measured',ST.iy!=null?`${(ST.iy*1e3).toFixed(1)} mA (your reading)`:'measure Fig. 8 first');
    g.add(G.near(v('iyc'),CAL.id,0.1),'IY calculated','= ID calculated (Y is equivalent to Δ)');
    g.show($('result'))});
  const F5='labs/ee205/fig/e1-fig5.png',F6='labs/ee205/fig/e1-fig6.png',F7='labs/ee205/fig/e1-fig7.png',F8='labs/ee205/fig/e1-fig8.png';
  const ohmStep=(t,k,n)=>({dev:'board',t:`${k===1?'Procedure I (Table 2): ':''}حط <b>Resistor ${k}</b> لحاله على اللوحة بين node 0 و node 1، اقرا ألوانه وسجّلها مع قيمته من الـ color code، وبعدين سجّل قراءة الـ ohmmeter.${k>1?' (شيل المقاومة اللي قبلها)':''}`,
    lines:[{t:`Resistor ${k}: node 0 ↔ node 1`,part:[t,0,1]},...(k===1?[{t:'M1 VΩ (red) → node 0',lead:'h1v',at:0},{t:'M1 COM (black) → node 1',lead:'h1c',at:1}]:[])],ok:s=>ST['r'+t]!=null});
  return {status,
    steps:[
      {dev:'hm1',t:'Procedure I: شغّل الـ Fluke 77 (M1) بلف الـ rotary switch على Ω (الـ ohmmeter).',ok:s=>s.flOhm},
      ohmStep('RC1',1),ohmStep('RC2',2),ohmStep('RC3',3),
      {dev:'board',t:'شيل المقاومة، ووصّل الـ decade box R1 (YEW 2786) على نفس الـ nodes: طرف H على node 0 و L على node 1.',lines:[{t:'R1 H → node 0',lead:'y1H',at:0},{t:'R1 L → node 1',lead:'y1L',at:1}],ok:s=>s.boxOn===1&&!s.parts},
      ...BOX.map(([k,r,val,tol],i)=>({dev:'yew1',t:`Table 3 · reading ${i+1}: صفّر كل الأقراص واضبط قرص <b>${r}</b> بس لين يصير الصندوق ${val>=1000?val/1000+' kΩ':val+' Ω'}، وسجّل قراءة الـ ohmmeter. التسامح المكتوب تحت القرص ±${tol}%.`,ok:s=>ST[k]!=null})),
      {dev:'board',t:'Procedure II: فضّ اللوحة (شيل القطع والأسلاك)، وفصّل أطراف الـ decade box.',ok:s=>s.clear&&!s.boxOn},
      {dev:'board',fig:F5,figCap:'Fig. 5',t:'ركّب Fig. 5: الثلاث مقاومات على التوالي مع المصدر.',lines:[{t:'R1 = 4.7 kΩ: node 7 ↔ node 8',part:['R4k7',7,8]},{t:'R2 = 1 kΩ: node 8 ↔ node 9',part:['R1k',8,9]},{t:'R3 = 2.2 kΩ: node 9 ↔ node 10',part:['R2k2',9,10]},
        {t:'DC + (L +) → node 7',note:'الوحدة اليسار أو اليمين',lead:'Lp',alt:'Rp',at:7},{t:'DC − (L −) → node 10',lead:'Lm',alt:'Rm',at:10}],ok:s=>s.fig5},
      {dev:'psu',t:'شغّل الـ POWER، واضبط الوحدة على E = 10.00 V (COARSE ثم FINE) والـ CURRENT LIMIT على 0.1 A تقريباً، وحوّل الـ OUTPUT على ON.',ok:s=>s.fig5&&s.s10.ok},
      {dev:'hm1',t:'حوّل M1 على V⎓ وقِس V<sub>1</sub> (VΩ على node 7، COM على node 8). سجّلها في Table 4.',lines:[{t:'M1 VΩ → node 7',lead:'h1v',at:7},{t:'M1 COM → node 8',lead:'h1c',at:8}],ok:s=>ST.v1!=null},
      {dev:'board',t:'قِس V<sub>2</sub> على R2 (VΩ → node 8، COM → node 9) و V<sub>3</sub> على R3 (VΩ → node 9، COM → node 10).',ok:s=>ST.v2!=null&&ST.v3!=null},
      {dev:'board',t:'قِس E = V<sub>Total</sub> (VΩ → node 7، COM → node 10)، وكمّل Table 4 بالحسابات من الـ voltage division rule.',ok:s=>ST.vt!=null},
      {dev:'psu',t:'Procedure III: حوّل الـ OUTPUT على OFF وفضّ اللوحة.',ok:s=>s.clear&&(!s.s10||!s.s10.ok)},
      {dev:'board',fig:F6,figCap:'Fig. 6',t:'ركّب Fig. 6: الثلاث مقاومات على التوازي. كل فرع موصول بالـ bus بـ bridging plug عشان تقدر تحط الأميتر مكانه.',
        lines:[{t:'R1 = 1 kΩ: node 23 ↔ node 30',part:['R1k',23,30]},{t:'R2 = 4.7 kΩ: node 24 ↔ node 31',part:['R4k7',24,31]},{t:'R3 = 2.2 kΩ: node 25 ↔ node 32',part:['R2k2',25,32]},
          {t:'bridging plug: node 30 ↔ node 31',wire:[30,31]},{t:'bridging plug: node 31 ↔ node 32',wire:[31,32]},{t:'bridging plug: node 16 ↔ node 17',wire:[16,17]},{t:'bridging plug: node 17 ↔ node 18',wire:[17,18]},
          {t:'bridging plug: node 16 ↔ node 23',note:'فرع I<sub>1</sub>',wire:[16,23]},{t:'bridging plug: node 17 ↔ node 24',note:'فرع I<sub>2</sub>',wire:[17,24]},{t:'bridging plug: node 18 ↔ node 25',note:'فرع I<sub>3</sub>',wire:[18,25]},
          {t:'bridging plug: node 15 ↔ node 16',note:'خط I<sub>T</sub>',wire:[15,16]},{t:'DC + → node 15',lead:'Lp',alt:'Rp',at:15},{t:'DC − → node 32',lead:'Lm',alt:'Rm',at:32}],ok:s=>s.fig6closed},
      {dev:'psu',t:'رجّع الـ OUTPUT على ON (E = 10 V).',ok:s=>s.fig6&&s.s10.ok},
      {dev:'hm2',t:'شغّل الـ GoldStar (M2) على <b>40mA</b> (عشان دقته 0.01 mA). الأميتر ينركّب على <b>التوالي</b>: شيل الـ plug اللي بين node 16 و node 23، وحط الأميتر مكانه: V·Ω·mA → node 16 و COM → node 23. سجّل I<sub>1</sub>.',
        lines:[{t:'M2 V·Ω·Hz·mA (red) → node 16',lead:'h2v',at:16},{t:'M2 COM (black) → node 23',lead:'h2c',at:23}],ok:s=>ST.i1!=null},
      {dev:'board',t:'رجّع الـ plug بين node 16 و node 23، وانقل الأميتر لفرع R2: شيل plug node 17 ↔ node 24، والأحمر → node 17، و COM → node 24. سجّل I<sub>2</sub>.',ok:s=>ST.i2!=null},
      {dev:'board',t:'بنفس الطريقة: رجّع plug الفرع الثاني، وحط الأميتر مكان plug node 18 ↔ node 25 (الأحمر → node 18). سجّل I<sub>3</sub>.',ok:s=>ST.i3!=null},
      {dev:'board',t:'رجّع plug الفرع الثالث، وحط الأميتر مكان plug node 15 ↔ node 16 (الأحمر → node 15، COM → node 16): هذا I<sub>T</sub>. كمّل Table 5.',ok:s=>ST.it!=null},
      {dev:'psu',t:'Procedure IV: حوّل الـ OUTPUT على OFF، وطلّع أطراف الأميتر، وفضّ اللوحة.',ok:s=>s.clear&&!s.ammI.some(Boolean)&&(!s.s10||!s.s10.ok)},
      {dev:'board',fig:F7,figCap:'Fig. 7',t:'ركّب Fig. 7: a = node 9، b = node 10 (وامتداده node 17)، c = node 16، d = node 23 (وامتداده node 24). الأميتر على التوالي مع المصدر بين node 2 و a.',
        lines:[{t:'220 Ω (a-c): node 9 ↔ node 16',part:['R220',9,16]},{t:'470 Ω (a-b): node 9 ↔ node 10',part:['R470',9,10]},{t:'bridging plug: node 10 ↔ node 17',note:'b',wire:[10,17]},{t:'10 kΩ (c-b): node 16 ↔ node 17',part:['R10k',16,17]},
          {t:'220 Ω (c-d): node 16 ↔ node 23',part:['R220',16,23]},{t:'bridging plug: node 23 ↔ node 24',note:'d',wire:[23,24]},{t:'1 kΩ (b-d): node 17 ↔ node 24',part:['R1k',17,24]},
          {t:'DC + → node 2',lead:'Lp',alt:'Rp',at:2},{t:'DC − → node 23',lead:'Lm',alt:'Rm',at:23},{t:'M2 V·Ω·mA (red) → node 2',lead:'h2v',at:2},{t:'M2 COM → node 9',note:'a',lead:'h2c',at:9}],ok:s=>s.fig7},
      {dev:'hm2',t:'احسب I<sub>D</sub> بأي طريقة غير Δ-Y. حوّل M2 على <b>400mA</b> (التيار أكثر من 40 mA)، واضبط المصدر على E = 15.00 V وشغّل الـ OUTPUT. سجّل I<sub>D</sub>.',ok:s=>ST.id!=null},
      {dev:'yew1',t:'احسب الـ Y المكافئ لـ Δ abc (R<sub>a</sub>، R<sub>b</sub>، R<sub>c</sub>) واضبطها على الصناديق لأقرب Ω: R<sub>a</sub> على R1، R<sub>b</sub> على R2، R<sub>c</sub> على R3.',ok:s=>s.ySet},
      {dev:'board',fig:F8,figCap:'Fig. 8',t:'حوّل الدائرة لـ Fig. 8: شيل مقاومات الـ Δ (220 a-c، 470 a-b، 10 kΩ c-b)، ونقطة الـ Y هي node 12: كل صندوق بين node 12 وطرفه.',
        lines:[{t:'R1 (R<sub>a</sub>) H → node 12',lead:'y1H',at:12},{t:'R1 L → node 9 (a)',lead:'y1L',at:9},{t:'R2 (R<sub>b</sub>) H → node 12',lead:'y2H',at:12},{t:'R2 L → node 10 (b)',lead:'y2L',at:10},{t:'R3 (R<sub>c</sub>) H → node 12',lead:'y3H',at:12},{t:'R3 L → node 16 (c)',lead:'y3L',at:16}],ok:s=>s.fig8},
      {dev:'hm2',t:'بنفس E = 15 V سجّل I<sub>Y</sub> من M2 وقارنه بـ I<sub>D</sub>.',ok:s=>ST.iy!=null},
      {dev:'psu',t:'طفّ الـ OUTPUT والـ POWER ورجّع الأقراص للصفر.',ok:s=>s.off}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
