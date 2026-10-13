/* EE205 · Experiment 3 · Thevenin's and Maximum Power Transfer Theorems (manual pp. 23–26).
   Procedure I: Fig. 6a (5 V 1 kHz, 1 kΩ series, 3.3 kΩ shunt, 96 mH = the 17.5 mH coil with its iron core, 10 kΩ load)
   → VR, IR; remove the 10 kΩ → ETH = Va-b; ZTH by shorting the supply (calculated); Fig. 6b (generator at ETH, ZTH made of
   the decade box + the iron-core coil) → VR, IR, compare.
   Procedure II: Fig. 7: 5 V 1 kHz, 100 Ω + 17.5 mH (air core) + RD (decade box = R + RL) + C, C = 0.1, 0.47, 0.57, 1, 1.1,
   1.2, 1.47, 4.7, 22 µF (combinations in parallel) → Va-b, |Xc|, P = Va-b² / RD (Table 1); P vs |Xc|.
   Instruments: Metrix MTX 3240, two Fluke 77 (yellow holsters, as on the table photo: M1 voltmeter, M2 ammeter), YEW box.
   Decisions: "5 V" is 5 V rms of the generator EMF (AMPL = 14.14 Vpp); with it Va-b at 0.47 µF is 1.61 V, as read in the
   lab video (1.606 V). The coil's RL = 17.6 Ω; with the iron core it is 96 mH (PLAN). ZTH in rectangular form is
   calculated with the source shorted; the generator's own 50 Ω may be left out or included (both accepted). In Fig. 6b
   ZTH's real part is set on the decade box (Rth − RL ≈ 767 Ω) in series with the iron-core coil. */
EXP_DEFS['ee205/exp3']=(()=>{const H=ENGINE.sheet;
const PARTS={R100:{t:'R',r:100.3,nom:100,lab:'100Ω'},R1k:{t:'R',r:996,nom:1000,lab:'1kΩ'},R3k3:{t:'R',r:3291,nom:3300,lab:'3.3kΩ'},R10k:{t:'R',r:9930,nom:10000,lab:'10kΩ'},
  L175:{t:'L',l:0.0175,rs:17.6,lab:'17.5mH'},L96:{t:'L',l:0.096,rs:17.6,core:true,lab:'96mH (core)'},
  C01:{t:'C',c:0.1e-6,np:true,mark:'0.1µ',lab:'0.1µF'},C047:{t:'C',c:0.47e-6,np:true,mark:'.47µ',lab:'0.47µF'},C1:{t:'C',c:1e-6,np:true,mark:'1µ',lab:'1µF'},
  C47:{t:'C',c:4.7e-6,np:true,mark:'4.7µ',col:'#c98a3a',lab:'4.7µF'},C22:{t:'C',c:22e-6,np:true,mark:'22µ',col:'#b8742c',lab:'22µF'},BR:{t:'BR',lab:''}};
const CS=[['c01',0.1],['c047',0.47],['c057',0.57],['c1',1],['c11',1.1],['c12',1.2],['c147',1.47],['c47',4.7],['c22',22]];
const W=2*Math.PI*1000,XL=W*0.0175,RL=17.6;
const fig=(f,cap,w=460)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const sheet=`<div class="paper" id="paper">
<h2>Experiment 3 · Thevenin's and Maximum Power Transfer Theorems</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القراءات rms من الـ Fluke. احسب بالقيم الاسمية، وبعدين اضغط "صحّح إجاباتي".</p>
<h3>Procedure I</h3>${fig('e3-fig6.png','Fig. 6: Circuits for procedure I')}
<table class="tbl"><caption>Procedure I · Thevenin's theorem</caption>
<tr><td class="l">Fig. 6a: V<sub>R</sub> (V)</td><td>${H.num('vr1','0.001',80)}</td></tr>
<tr><td class="l">Fig. 6a: I<sub>R</sub> (mA)</td><td>${H.num('ir1','0.01',80)}</td></tr>
<tr><td class="l">E<sub>TH</sub> = V<sub>a-b</sub> with the 10 kΩ removed (V)</td><td>${H.num('eth','0.001',80)}</td></tr>
<tr><td class="l">Z<sub>TH</sub> = R + jX (source shorted): R (Ω)</td><td>${H.num('zr','0.1',80)}</td></tr>
<tr><td class="l">Z<sub>TH</sub>: X (Ω)</td><td>${H.num('zx','0.1',80)}</td></tr>
<tr><td class="l">Fig. 6b: V<sub>R</sub> (V)</td><td>${H.num('vr2','0.001',80)}</td></tr>
<tr><td class="l">Fig. 6b: I<sub>R</sub> (mA)</td><td>${H.num('ir2','0.01',80)}</td></tr></table>
<h3>Procedure II</h3>${fig('e3-fig7.png','Fig. 7: Circuit for Procedure II',380)}
<table class="tbl"><caption>Table 1 (Procedure II) · R<sub>D</sub> = R + R<sub>L</sub></caption><tr><td class="l" colspan="3">R<sub>D</sub> set on the decade box (Ω)</td><td>${H.num('rd','1',70)}</td></tr>
<tr><td class="l" colspan="3">Z<sub>TH</sub> of Fig. 7 seen by R<sub>D</sub> + C (rectangular): R (Ω)</td><td>${H.num('z7r','0.1',70)}</td></tr>
<tr><td class="l" colspan="3">Z<sub>TH</sub>: X (Ω)</td><td>${H.num('z7x','0.1',70)}</td></tr>
<tr><th>Combination of capacitors</th><th>V<sub>a-b</sub> (V)</th><th>|X<sub>C</sub>| (Ω)</th><th>P (mW)</th></tr>
${CS.map(([k,c])=>`<tr><td>${c} µF</td><td>${H.num(k+'v','0.001',70)}</td><td>${H.num(k+'x','0.1',70)}</td><td>${H.num(k+'p','0.01',70)}</td></tr>`).join('')}</table>
<ol class="en"><li class="plq">Procedure II, step 6: From the graph of P vs |X<sub>C</sub>|, where is the maximum power transferred?
<div>${H.sel('q6',[['a','When |XC| ≈ XL (≈ 110 Ω, C ≈ 1.47 µF): the load is the conjugate of ZTH'],['b','At the largest capacitor (22 µF)'],['c','At the smallest capacitor (0.1 µF)'],['d','The power does not depend on C']])}</div></li></ol>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
return {procs:[{id:'I',title:"Thevenin's theorem (Fig. 6)"},{id:'II',title:'Maximum power transfer (Fig. 7, Table 1)'}],
sheet,params:()=>({}),
instruments:[
  {type:'metrix',prev:{freq:2000,amp:5,wave:'Sine'}},
  {type:'hdmm',model:'fluke77',color:'yellow',n:1,prev:d=>{d.pos=2}},
  {type:'hdmm',model:'fluke77',color:'yellow',n:2},
  {type:'yew',n:1,prev:d=>{d.d=[0,0,1,0,0,0]}}],
parts:PARTS,
tray:[['R100','100 Ω'],['R1k','1 kΩ'],['R3k3','3.3 kΩ'],['R10k','10 kΩ'],['L175','17.5 mH coil'],['L96','coil + iron core (96 mH)'],['C01','0.1 µF'],['C047','0.47 µF'],['C1','1 µF'],['C47','4.7 µF'],['C22','22 µF'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
  /* complex helpers for the calculated values */
  const c=(r,i)=>({r,i}),add=(a,b)=>c(a.r+b.r,a.i+b.i),mul=(a,b)=>c(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),div=(a,b)=>{const d=b.r*b.r+b.i*b.i;return c((a.r*b.r+a.i*b.i)/d,(a.i*b.r-a.r*b.i)/d)},par=(a,b)=>div(mul(a,b),add(a,b));
  const CAL={};{const z=par(c(1000,0),c(3300,0));CAL.zr=z.r+RL;CAL.zx=W*0.096;CAL.zr50=par(c(1050,0),c(3300,0)).r+RL;CAL.z7r=100+RL;CAL.z7x=XL}
  const vpp5=5*2*Math.SQRT2;
  const g5=()=>{const g=K.gen();return g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-vpp5)<0.02&&Math.abs(g.off)<1e-9};
  const capSum=(a,b)=>RT.between(a,b).filter(x=>RT.PARTS[x.p.type].t==='C').reduce((s,x)=>s+RT.PARTS[x.p.type].c,0)*1e6;
  function status(){const st={};const g=K.gen(),gn=RT.leadNet('gr');st.g=g;st.g5=g5();
    const box=RT.inst.yew1,bH=RT.leadNet('y1H'),bL=RT.leadNet('y1L');st.box=box.value();
    /* Procedure I · Fig. 6a: gen 1, 1k 1–2, 3.3k 2–9, coil (core) 2–3, plug 3–4 (IR), 10k 4–11; ground bus 9–10–11 (gen black) */
    const gnd=N(9)===-1&&N(10)===-1&&N(11)===-1&&RT.leadNet('gb')===-1;st.gnd=gnd;
    const front=gn===N(1)&&K.has('R1k',1,2)&&K.has('R3k3',2,9);st.front=front;
    st.coil=K.has('L96',2,3);const load=K.has('R10k',4,11);st.load=load;
    st.fig6a=gnd&&front&&st.coil&&load&&N(3)===N(4);
    if(st.fig6a&&st.g5){const v=K.across('ACV',N(4),-1);if(v!=null)ST.vr1=v}
    st.ammR=K.ammOn(N(3),N(4));
    if(gnd&&front&&st.coil&&load&&st.g5){const i=K.amm(N(3),N(4),'ACI');if(i!=null&&!ST.thev)ST.ir1=i}
    st.open=gnd&&front&&st.coil&&!load&&RT.at(N(3)).length<=1;
    if(st.open&&st.g5){const v=K.across('ACV',N(3),-1);if(v!=null)ST.eth=v}
    /* Fig. 6b: generator at ETH (rms) on node 1, box between 1 and 2, the same coil and load; no 1k, no 3.3k */
    const eth=ST.eth;st.gEth=eth!=null&&g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp/(2*Math.SQRT2)-eth)<0.02;
    st.fig6b=gnd&&gn===N(1)&&!K.has('R1k',1,2)&&!K.has('R3k3',2,9)&&((bH===N(1)&&bL===N(2))||(bL===N(1)&&bH===N(2)))&&st.coil&&load&&st.box>=700&&st.box<=800;
    if(st.fig6b&&st.gEth){ST.thev=true;if(N(3)===N(4)){const v=K.across('ACV',N(4),-1);if(v!=null)ST.vr2=v}const i=K.amm(N(3),N(4),'ACI');if(i!=null)ST.ir2=i}
    /* Procedure II · Fig. 7: gen 15, 100 Ω 15–16, coil (air) 16–17 = a, box RD a → b = 24, caps from the b bus (24-25-26) to the ground bus (31-32-33) */
    const gnd7=N(31)===-1&&RT.leadNet('gb')===-1;
    st.fig7=gnd7&&gn===N(15)&&K.has('R100',15,16)&&K.has('L175',16,17)&&((bH===N(17)&&bL===N(24))||(bL===N(17)&&bH===N(24)));
    st.rd=st.box;st.rdOK=Math.abs(st.box-(100+RL))<=1;
    st.C=st.fig7?capSum(N(24),-1):0;
    if(st.fig7&&st.rdOK&&st.g5){const v=K.across('ACV',N(17),N(24),true);if(v!=null)CS.forEach(([k,cv])=>{if(Math.abs(st.C-cv)<1e-6)ST[k]=v})}
    st.genOff=!g.out||!g.pwr;
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const gr=G.grader(),v=G.v,s=G.s;const rd=k=>ST[k]!=null;
    gr.proc('I');[['vr1','VR (Fig. 6a)',1],['eth','ETH',1],['vr2','VR (Fig. 6b)',1]].forEach(([k,t])=>gr.add(rd(k)&&G.near(v(k),ST[k],0.002),t,rd(k)?`${ST[k].toFixed(3)} V`:'measure it'));
    [['ir1','IR (Fig. 6a)'],['ir2','IR (Fig. 6b)']].forEach(([k,t])=>gr.add(rd(k)&&G.near(v(k),ST[k]*1e3,0.011),t,rd(k)?`${(ST[k]*1e3).toFixed(2)} mA`:'measure it in series'));
    gr.add(G.near(v('zr'),CAL.zr,3)||G.near(v('zr'),CAL.zr50,3),'ZTH real part',`(1 k ∥ 3.3 k) + RL ≈ ${CAL.zr.toFixed(1)} Ω`);gr.add(G.near(v('zx'),CAL.zx,3),'ZTH imaginary part',`ωL = ${CAL.zx.toFixed(1)} Ω`);
    gr.proc('II');gr.add(Math.abs(v('rd')-(100+RL))<=1,'RD = R + RL',`≈ ${Math.round(100+RL)} Ω`);gr.add(G.near(v('z7r'),CAL.z7r,1)||G.near(v('z7r'),CAL.z7r+50,1),'ZTH (Fig. 7) real',`R + RL ≈ ${CAL.z7r.toFixed(1)} Ω`);
    gr.add(G.near(v('z7x'),CAL.z7x,1),'ZTH (Fig. 7) imaginary',`XL ≈ ${CAL.z7x.toFixed(1)} Ω`);
    CS.forEach(([k,cv])=>{gr.add(rd(k)&&G.near(v(k+'v'),ST[k],0.002),`${cv} µF Va-b`,rd(k)?`${ST[k].toFixed(3)} V`:'measure it');const xc=1/(W*cv*1e-6);
      gr.add(G.near(v(k+'x'),xc,xc*0.005+0.1),`${cv} µF |Xc|`,`1/(ωC) = ${xc.toFixed(1)} Ω`);gr.add(G.near(v(k+'p'),v(k+'v')*v(k+'v')/v('rd')*1e3,0.05),`${cv} µF P`,'Va-b² / RD')});
    gr.add(s('q6')==='a','Step 6 maximum power','|XC| = XL: the load is the conjugate of ZTH');
    gr.show($('result'))});
  const F6='labs/ee205/fig/e3-fig6.png',F7='labs/ee205/fig/e3-fig7.png';
  return {status,
    steps:[
      {dev:'board',fig:F6,figCap:'Fig. 6a',t:'Procedure I: ركّب Fig. 6a. الأرضي (b) هو node 9 و 10 و 11 (bridging plugs)، و a = node 3. بين node 3 و node 4 bridging plug مكان الأميتر بعدين. حط الـ iron core في الـ coil (96 mH).',
        lines:[{t:'1 kΩ: node 1 ↔ node 2',part:['R1k',1,2]},{t:'3.3 kΩ: node 2 ↔ node 9',part:['R3k3',2,9]},{t:'coil + iron core (96 mH): node 2 ↔ node 3',part:['L96',2,3]},{t:'bridging plug: node 3 ↔ node 4',wire:[3,4]},
          {t:'10 kΩ: node 4 ↔ node 11',part:['R10k',4,11]},{t:'bridging plug: node 9 ↔ node 10',wire:[9,10]},{t:'bridging plug: node 10 ↔ node 11',wire:[10,11]},{t:'GEN OUT red → node 1',lead:'gr',at:1},{t:'GEN ⏚ black → node 9 (b)',lead:'gb',at:9}],ok:s=>s.fig6a},
      {dev:'gen',t:'شغّل الـ generator: Sine، 1 kHz، و 5 V rms يعني AMPL = 14.14 Vpp (الـ Metrix يعرض Vpp)، و OUTPUT ON.',ok:s=>s.fig6a&&s.g5},
      {dev:'hm1',t:'1. قِس V<sub>R</sub> على الـ 10 kΩ بـ M1 على V~ (VΩ → node 4، COM → node 11).',lines:[{t:'M1 VΩ → node 4',lead:'h1v',at:4},{t:'M1 COM → node 11',lead:'h1c',at:11}],ok:s=>ST.vr1!=null},
      {dev:'hm2',t:'وقِس I<sub>R</sub>: شيل الـ plug بين node 3 و node 4 وحط M2 على A~ مكانه (300mA → node 3، COM → node 4). رجّع الـ plug بعدها.',lines:[{t:'M2 300mA (red) → node 3',lead:'h2ma',at:3},{t:'M2 COM → node 4',lead:'h2c',at:4}],ok:s=>ST.ir1!=null},
      {dev:'board',t:'2. شيل الأميتر ورجّع الـ plug، وبعدين افصل الـ 10 kΩ (شيله): قِس V<sub>a-b</sub> بـ M1 (VΩ → node 3، COM → الأرضي). هذا E<sub>TH</sub>.',ok:s=>ST.eth!=null},
      {dev:'board',t:'3. احسب Z<sub>TH</sub> وأنت قاصر المصدر: (1 kΩ ∥ 3.3 kΩ) + R<sub>L</sub> + jωL. اكتبه rectangular في الجدول.',ok:s=>ST.eth!=null},
      {dev:'yew1',fig:F6,figCap:'Fig. 6b',t:'4. ركّب Fig. 6b: شيل الـ 1 kΩ والـ 3.3 kΩ، وحط الـ decade box مكان الجزء الحقيقي من Z<sub>TH</sub> (≈ 767 Ω) بين node 1 و node 2 مع نفس الـ coil، ورجّع الـ 10 kΩ.',
        lines:[{t:'R1 H → node 1',lead:'y1H',at:1},{t:'R1 L → node 2',lead:'y1L',at:2},{t:'10 kΩ: node 4 ↔ node 11',part:['R10k',4,11]}],ok:s=>s.fig6b},
      {dev:'gen',t:'اضبط الـ generator على E<sub>TH</sub> اللي قسته (AMPL = E<sub>TH</sub> × 2√2 Vpp)، وقِس V<sub>R</sub> و I<sub>R</sub> مرة ثانية وقارنها بالخطوة 1.',ok:s=>ST.vr2!=null&&ST.ir2!=null},
      {dev:'gen',t:'Procedure II: طفّ الـ OUTPUT، وفضّ دائرة Procedure I (القطع وأطراف الـ box والـ generator).',ok:s=>s.genOff&&!RT.S.parts.length},
      {dev:'board',fig:F7,figCap:'Fig. 7',t:'ركّب Fig. 7: a = node 17، b = node 24 (bus 24-25-26)، والأرضي bus 31-32-33. R<sub>D</sub> هو الـ decade box بين a و b، والمكثفات من b للأرضي.',
        lines:[{t:'100 Ω: node 15 ↔ node 16',part:['R100',15,16]},{t:'17.5 mH coil (air core): node 16 ↔ node 17',part:['L175',16,17]},{t:'R1 (R<sub>D</sub>) H → node 17 (a)',lead:'y1H',at:17},{t:'R1 L → node 24 (b)',lead:'y1L',at:24},
          {t:'bridging plug: node 24 ↔ node 25',wire:[24,25]},{t:'bridging plug: node 25 ↔ node 26',wire:[25,26]},{t:'bridging plug: node 31 ↔ node 32',wire:[31,32]},{t:'bridging plug: node 32 ↔ node 33',wire:[32,33]},
          {t:'GEN OUT red → node 15',lead:'gr',at:15},{t:'GEN ⏚ black → node 31',lead:'gb',at:31}],ok:s=>s.fig7},
      {dev:'yew1',t:'1. اضبط R<sub>D</sub> = R + R<sub>L</sub> (100 + R<sub>L</sub>، يعني ≈ 118 Ω) على الـ decade box، وشغّل الـ generator (5 V rms، 1 kHz).',ok:s=>s.fig7&&s.rdOK&&s.g5},
      {dev:'hm1',t:'حط M1 على V~ على R<sub>D</sub> (VΩ → node 17، COM → node 24).',lines:[{t:'M1 VΩ → node 17 (a)',lead:'h1v',at:17},{t:'M1 COM → node 24 (b)',lead:'h1c',at:24}],ok:s=>K.across('ACV',N(17),N(24),true)!=null},
      ...CS.map(([k,cv],i)=>({dev:'board',t:`2. C = <b>${cv} µF</b>${cv===0.57?' (0.47 + 0.1 على التوازي)':cv===1.1?' (1 + 0.1)':cv===1.2?' (1 + 0.1 + 0.1)':cv===1.47?' (1 + 0.47)':''}: حط المكثفات بين الـ b bus والأرضي (node 24 ↔ 31، node 25 ↔ 32، node 26 ↔ 33)، وسجّل V<sub>a-b</sub>.`,ok:s=>ST[k]!=null})),
      {dev:'gen',t:'3–6. احسب Z<sub>TH</sub> و |X<sub>C</sub>| و P = V<sub>a-b</sub>²/R<sub>D</sub> لكل قيمة وارسم P ضد |X<sub>C</sub>|. بعدين طفّ الـ generator.',ok:s=>s.genOff&&CS.every(([k])=>ST[k]!=null)}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
