/* EE205 · Experiment 3 · Thevenin's and Maximum Power Transfer Theorems (manual pp. 23–26). Steps follow the manual's
   procedures one to one (Batch 6):
   Procedure I (steps 1–4): Fig. 6a (5 V 1 kHz, 1 kΩ series, 3.3 kΩ shunt, 96 mH = the 17.5 mH coil with its iron core,
   10 kΩ load) → VR, IR; remove the 10 kΩ → ETH = Va-b; ZTH by shorting the source (calculated); Fig. 6b (generator at ETH,
   ZTH made of the decade box + the iron-core coil) → VR, IR, compare.
   Procedure II (steps 1–6): Fig. 7: 5 V 1 kHz, 100 Ω + 17.5 mH (air core) + RD (decade box = R + RL) + C, C = 0.1, 0.47,
   0.57, 1, 1.1, 1.2, 1.47, 4.7, 22 µF (combinations in parallel) → Va-b, |Xc|, P = Va-b² / RD (Table 1); P vs |Xc|.
   Instruments: Metrix MTX 3240, two Fluke 77 (yellow holsters, as on the table photo: M1 voltmeter, M2 ammeter), YEW box.
   Figures (def.figs) are the reference wiring in the lab's rectangle layout (generator top-left node 8, its ground bottom-
   left node 22); build steps tick when the bench IS the figure's circuit (engine/match.js); the measurement set-ups
   (E_TH open circuit, every capacitor combination of Table 1) are matched the same way, never by node number.
   Decisions: "5 V" is 5 V rms of the generator EMF (AMPL = 14.14 Vpp); with it Va-b at 0.47 µF is 1.61 V, as read in the
   lab video (1.606 V). The coil's RL = 17.6 Ω; with the iron core it is 96 mH (PLAN). ZTH in rectangular form is
   calculated with the source shorted; the generator's own 50 Ω may be left out or included (both accepted). In Fig. 6b
   ZTH's real part is set on the decade box (Rth − RL ≈ 767 Ω) in series with the iron-core coil. Figs. 6a/6b draw V_R and
   I_R: M1 sits across the 10 kΩ and M2 (A~, 300 mA jack) in series between a and the 10 kΩ, as part of the figure;
   "isolate the 10 kΩ" (step I.2) takes the load branch out (the 10 kΩ and M2). Fig. 7 draws V_a-b: M1 across R_D; it is
   built with the first capacitor of Table 1 (0.1 µF). The calculation steps (I.3, II.3–6) have nothing to check on the
   bench and tick as soon as they are reached. */
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
/* the figures' reference wiring (rectangle: top row 8–11, right column down to row 3, bottom row back to 22).
   Fig. 6a: GEN 8, 1 kΩ 8–9, the 3.3 kΩ down 9–16, the iron-core coil 9–10 (a = 10), M2 in series a → 11, the 10 kΩ down
   11–18, M1 across it, the bottom bus 16–23, 18–25–24–23–22 = b (GEN ⏚). Fig. 6b: the box (Z_TH real part) in place of the
   1 kΩ, no 3.3 kΩ. Fig. 7: GEN 8, 100 Ω 8–9, the air-core coil 9–10 (a), R_D (box) a → 17 (b), C b → 24, back to 22. */
const GEN=[{lead:'gr',at:8},{lead:'gb',at:22}],BUS=[{wire:[18,25]},{wire:[25,24]},{wire:[24,23]},{wire:[23,22]}];
const LOAD=[{lead:'h2ma',at:10},{lead:'h2c',at:11},{part:['R10k',11,18]},{lead:'h1v',at:11},{lead:'h1c',at:18}];
const L6a=[...GEN,{part:['R1k',8,9]},{part:['R3k3',9,16]},{wire:[16,23]},{part:['L96',9,10]},...LOAD,...BUS];
const L6b=[...GEN,{lead:'y1H',alt:'y1L',at:8},{lead:'y1L',alt:'y1H',at:9},{part:['L96',9,10]},...LOAD,...BUS];
const ETH={lines:[...GEN,{part:['R1k',8,9]},{part:['R3k3',9,16]},{wire:[16,23]},{part:['L96',9,10]},{lead:'h1v',at:10},{lead:'h1c',at:23},{wire:[23,22]}]};
const L7=c=>[...GEN,{part:['R100',8,9]},{part:['L175',9,10]},{lead:'y1H',alt:'y1L',at:10},{lead:'y1L',alt:'y1H',at:17},{lead:'h1v',at:10},{lead:'h1c',at:17},
  ...c.map((t,i)=>[[17,24],[18,25],[16,23]][i]).flatMap((ab,i)=>[{part:[c[i],ab[0],ab[1]]}]),...(c.length>1?[{wire:[17,18]},{wire:[24,25]}]:[]),...(c.length>2?[{wire:[16,17]}]:[]),{wire:[24,23]},{wire:[23,22]}];
const IMG=f=>'labs/ee205/fig/'+f;
const figs={'6a':{img:IMG('e3-fig6.png'),cap:'Fig. 6a · M1 across the 10 kΩ (V<sub>R</sub>), M2 in series (I<sub>R</sub>)',lines:L6a},
  '6b':{img:IMG('e3-fig6.png'),cap:'Fig. 6b · Thevenin equivalent: E<sub>TH</sub>, Z<sub>TH</sub> = decade box + iron-core coil',lines:L6b},
  '7':{img:IMG('e3-fig7.png'),cap:'Fig. 7 · Circuit for Procedure II (C = 0.1 µF first, M1 across R<sub>D</sub>)',lines:L7(['C01'])}};
/* Table 1: Fig. 7 with each capacitor combination (caps in parallel between b and ground) */
const COMBO={c01:['C01'],c047:['C047'],c057:['C047','C01'],c1:['C1'],c11:['C1','C01'],c12:['C1','C01','C01'],c147:['C1','C047'],c47:['C47'],c22:['C22']};
const CF={};for(const k in COMBO)CF[k]={lines:L7(COMBO[k])};
return {figs,procs:[{id:'I',title:"Thevenin's theorem (Fig. 6)"},{id:'II',title:'Maximum power transfer (Fig. 7, Table 1)'}],
sheet,params:()=>({}),
instruments:[
  {type:'metrix',prev:{freq:2000,amp:5,wave:'Sine'}},
  {type:'hdmm',model:'fluke77',color:'yellow',n:1,prev:d=>{d.pos=2}},
  {type:'hdmm',model:'fluke77',color:'yellow',n:2,procs:['I']},
  {type:'yew',n:1,prev:d=>{d.d=[0,0,1,0,0,0]}}],
parts:PARTS,
tray:[['R100','100 Ω'],['R1k','1 kΩ'],['R3k3','3.3 kΩ'],['R10k','10 kΩ'],['L175','17.5 mH coil'],['L96','coil + iron core (96 mH)'],['C01','0.1 µF'],['C047','0.47 µF'],['C1','1 µF'],['C47','4.7 µF'],['C22','22 µF'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  /* complex helpers for the calculated values */
  const c=(r,i)=>({r,i}),add=(a,b)=>c(a.r+b.r,a.i+b.i),mul=(a,b)=>c(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),div=(a,b)=>{const d=b.r*b.r+b.i*b.i;return c((a.r*b.r+a.i*b.i)/d,(a.i*b.r-a.r*b.i)/d)},par=(a,b)=>div(mul(a,b),add(a,b));
  const CAL={};{const z=par(c(1000,0),c(3300,0));CAL.zr=z.r+RL;CAL.zx=W*0.096;CAL.zr50=par(c(1050,0),c(3300,0)).r+RL;CAL.z7r=100+RL;CAL.z7x=XL}
  const vpp5=5*2*Math.SQRT2;
  const g5=()=>{const g=K.gen();return g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-vpp5)<0.02&&Math.abs(g.off)<1e-9};
  const M1=()=>RT.meters().find(m=>m.key==='hm1'),M2=()=>RT.meters().find(m=>m.key==='hm2');
  const volts=()=>{const m=M1();return m&&m.D.pwr&&m.D.fn==='ACV'&&m.D.jack==='HI'?K.shown(m):null};
  const amps=()=>{const m=M2();return m&&m.D.pwr&&m.D.fn==='ACI'&&m.D.jack==='A'?K.shown(m):null};
  function status(){const st={};const g=K.gen();st.g=g;st.g5=g5();
    st.box=RT.inst.yew1.value();
    /* Procedure I · Fig. 6a (M1 on V_R, M2 in series for I_R) */
    st.fig6a=RT.match('6a').ok;
    if(st.fig6a&&st.g5&&!ST.thev){const v=volts(),i=amps();if(v!=null)ST.vr1=v;if(i!=null)ST.ir1=i}
    /* E_TH: the load branch out, M1 across a–b */
    if(st.g5&&RT.match(ETH).ok){const v=volts();if(v!=null)ST.eth=v}
    /* Fig. 6b: the generator at E_TH (rms), the box ≈ R_TH − R_L */
    const eth=ST.eth;st.gEth=eth!=null&&g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp/(2*Math.SQRT2)-eth)<0.02;
    st.boxTh=st.box>=700&&st.box<=800;st.fig6b=RT.match('6b').ok;
    if(st.fig6b&&st.boxTh&&st.gEth){ST.thev=true;const v=volts(),i=amps();if(v!=null)ST.vr2=v;if(i!=null)ST.ir2=i}
    /* Procedure II · Fig. 7 with each capacitor combination of Table 1, R_D = R + R_L */
    st.rd=st.box;st.rdOK=Math.abs(st.box-(100+RL))<=1;
    if(st.rdOK&&st.g5){const v=volts();if(v!=null)for(const k in CF)if(RT.match(CF[k]).ok)ST[k]=v}
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
  const calc=t=>({dev:'board',t,ok:()=>true});
  return {status,
    steps:[
      /* Procedure I (manual p. 24), steps 1–4 */
      {dev:'board',build:'6a',t:'Procedure I · 1. وصّل الدائرة Fig. 6a، وقِس V<sub>R</sub> و I<sub>R</sub>.',
        acts:['حط الـ iron core في الـ coil (96 mH).','شغّل الـ generator: Sine، 1 kHz، و 5 V rms يعني AMPL = 14.14 Vpp (الـ Metrix يعرض Vpp)، و OUTPUT ON.','M1 على V~ على الـ 10 kΩ (V<sub>R</sub>)، و M2 على A~ (المدخل 300mA) على التوالي بين a والـ 10 kΩ (I<sub>R</sub>).'],
        ok:s=>s.g5&&ST.vr1!=null&&ST.ir1!=null,rec:[{to:'vr1',val:()=>ST.vr1,unit:'V',dec:3,label:'V<sub>R</sub>'},{to:'ir1',val:()=>ST.ir1!=null?ST.ir1*1e3:null,unit:'mA',dec:2,label:'I<sub>R</sub>'}]},
      {dev:'hm1',t:'2. افصل الـ 10 kΩ عن الدائرة وقِس الجهد بين الطرفين (a-b). هذا الجهد هو E<sub>TH</sub>.',acts:['شيل فرع الـ load: الـ 10 kΩ وأطراف M2.','M1 (V~) بين a والأرضي b.'],ok:s=>ST.eth!=null,
        rec:[{to:'eth',val:()=>ST.eth,unit:'V',dec:3,label:'E<sub>TH</sub>'}]},
      calc('3. احسب Z<sub>TH</sub> وأنت قاصر المصدر (shorting the supply): (1 kΩ ∥ 3.3 kΩ) + R<sub>L</sub> + jωL، واكتبه rectangular.'),
      {dev:'board',build:'6b',t:'4. ركّب الـ Thevenin\'s equivalent لدائرة Fig. 6a بإدخال E<sub>TH</sub> و Z<sub>TH</sub> مثل Fig. 6b، وقِس I<sub>R</sub> و V<sub>R</sub>. قارنها بالخطوة (1).',
        acts:['Z<sub>TH</sub>: الـ decade box على الجزء الحقيقي ناقص R<sub>L</sub> (≈ 767 Ω) على التوالي مع نفس الـ coil بالـ iron core.','رجّع الـ 10 kΩ مع M1 و M2 مثل Fig. 6a.','اضبط الـ generator على E<sub>TH</sub> اللي قسته (AMPL = E<sub>TH</sub> × 2√2 Vpp).'],
        ok:s=>s.boxTh&&s.gEth&&ST.vr2!=null&&ST.ir2!=null,rec:[{to:'vr2',val:()=>ST.vr2,unit:'V',dec:3,label:'V<sub>R</sub>'},{to:'ir2',val:()=>ST.ir2!=null?ST.ir2*1e3:null,unit:'mA',dec:2,label:'I<sub>R</sub>'}]},
      /* Procedure II (manual pp. 25–26), steps 1–6 */
      {dev:'board',build:'7',t:'Procedure II · 1. ركّب دائرة Fig. 7. خلّ R<sub>D</sub> = R + R<sub>L</sub>.',acts:['R<sub>D</sub> على الـ decade box: 100 + R<sub>L</sub> ≈ 118 Ω.','شغّل الـ generator: 5 V rms (14.14 Vpp)، 1 kHz.'],ok:s=>s.rdOK&&s.g5},
      {dev:'board',t:'2. بدّل الـ capacitor combinations مثل Table 1 وقِس V<sub>a-b</sub> لكل combination.',
        acts:CS.map(([k,cv])=>`${cv} µF${cv===0.57?' (0.47 + 0.1 على التوازي)':cv===1.1?' (1 + 0.1)':cv===1.2?' (1 + 0.1 + 0.1)':cv===1.47?' (1 + 0.47)':''}`),
        ok:s=>CS.every(([k])=>ST[k]!=null),rec:CS.map(([k,cv])=>({to:k+'v',val:()=>ST[k],unit:'V',dec:3,label:`${cv} µF`}))},
      calc('3. احسب Z<sub>TH</sub> لدائرة Fig. 7 وسجّله بالـ rectangular form.'),
      calc('4. احسب X<sub>C</sub> لكل combination وسجّلها في Table 1.'),
      calc('5. احسب الـ power المنقولة للـ load: P = V<sub>a-b</sub>² / R<sub>D</sub>. كرّر لكل الـ combinations وسجّلها في Table 1.'),
      calc('6. ارسم P ضد |X<sub>C</sub>| وحدّد نقطة الـ maximum power transfer على الرسم. وش تستنتج؟')
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
