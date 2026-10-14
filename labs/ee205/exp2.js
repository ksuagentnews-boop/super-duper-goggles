/* EE205 · Experiment 2 · Root-Mean-Square (RMS) Value, Peak, and Peak-to-Peak Values, Measurements with Oscilloscope
   (manual pp. 17–22). Steps follow the manual's procedures one to one (Batch 6):
   Procedure I (steps 1–8): familiarization with the Hameg (focus, intensity, positions); Fig. 1 dc on CH I (DC coupling) at
   1, 2, 5, 10 V → deflection × V/div; Fig. 2 sine from the generator on CH II (AC coupling) → Vm, T, f, Vrms, DMM on ACV;
   then 10 V dc on CH I + the sine on CH II: DUAL, then ADD.
   Procedure II (steps 1–4): 10 Vpp sine; RMS from the scope (3.535 V) vs the DMM at 100 Hz … 5 kHz → % error.
   Procedure III (steps 1–9): series RL (17.5 mH air-core coil + 100 Ω), e(t) = 10 sin(2π·10³t): RL of the coil; E, VL, VR on
   the DMM; VR (CH I) and E (CH II) on the scope → θ and the leading wave, Lissajous in XY (θ = sin⁻¹ L1/L2); I; ZT = E/I; P, PF.
   Figures (def.figs) are the reference wiring (sources on the left); build steps tick when the bench IS the figure's
   circuit (engine/match.js); the later checks follow the parts and leads (which nets they share), never node numbers.
   Assumptions: Procedure I's sine is not specified: 1 kHz, 4 Vpp is used. Fig. 3's caption says "procedure II" but it
   belongs to Procedure III. e(t) = 10 sin … is set as 20 Vpp on the generator (open circuit; its 50 Ω output then gives
   E < 10 V peak under load, which the DMM measures). The 1000-turn coil has RL ≈ 17.6 Ω (lab video). The decade box of
   the equipment list stands on the table (no step uses it). Step I.3 says "keep your circuit connected", so Fig. 2 is
   built next to Fig. 1 (the figure of step I.4 holds both). Fig. 3 is built with a bridging plug between the generator and
   c (the ammeter takes its place in step 5) and with the Fluke across R as V_R (the last of the three readings of step 2).
   The calculation steps (I.6, III.6–9) have nothing to check on the bench and tick as soon as they are reached. */
EXP_DEFS['ee205/exp2']=(()=>{const H=ENGINE.sheet;
const PARTS={R100:{t:'R',r:100.4,nom:100,lab:'100Ω'},L175:{t:'L',l:0.0175,rs:17.6,lab:'17.5mH'},BR:{t:'BR',lab:''}};
const FQ=[100,1000,2000,3000,4000,5000];
const fig=(f,cap,w=440)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const sheet=`<div class="paper" id="paper">
<h2>Experiment 2 · RMS, Peak and Peak-to-Peak Values · Measurements with the Oscilloscope</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">اقرا من شاشة الـ Hameg (عدد الـ divisions × الـ VOLTS/DIV أو TIME/DIV)، ومن الـ Fluke، وعبّي الجداول وبعدها اضغط "صحّح إجاباتي".</p>
<h3>Procedure I</h3>${fig('e2-fig1.png','Fig. 1: Oscilloscope for measurement of DC Voltage')}
<table class="tbl"><caption>Procedure I · DC on CH I: vertical deflection (div) × V/div = measured voltage</caption><tr><th>DC Supply Voltage</th><th>Measured by Oscilloscope (V)</th></tr>
${[1,2,5,10].map(v=>`<tr><td>${v} V</td><td>${H.num('dc'+v,'0.01',80)}</td></tr>`).join('')}</table>
${fig('e2-fig2.png','Fig. 2: Oscilloscope for measurement of AC voltage')}
<table class="tbl"><caption>Procedure I · Sinusoidal waveform on CH II</caption><tr><th>Peak voltage V<sub>m</sub> (V)</th><th>Period T (ms)</th><th>f = 1/T (Hz)</th><th>V<sub>rms</sub> = V<sub>m</sub>/√2 (V)</th><th>V<sub>rms</sub> by DMM (V)</th></tr>
<tr><td>${H.num('vm','0.01',70)}</td><td>${H.num('tp','0.001',70)}</td><td>${H.num('fq','0.1',80)}</td><td>${H.num('vr','0.001',70)}</td><td>${H.num('vd','0.001',70)}</td></tr></table>
<ol class="en"><li class="plq">Step 8: in ADD mode, how does the displayed signal compare to the 10 V dc plus the sine of step 5?
<div>${H.sel('q8',[['a','The same sine, shifted up by 10 V (dc level + ac signal)'],['b','A sine with 10 V more amplitude'],['c','A flat line at 10 V'],['d','The sine alone (the dc is blocked)']])}</div>
${H.row('V<sub>rms</sub> of the new signal =',H.num('vr8','0.001'),'V')}</li></ol>
<h3>Procedure II</h3>
<table class="tbl"><caption>Procedure II · Comparison between oscilloscope and DMM (10 V peak to peak)</caption><tr><th>V (peak to peak)</th><th>Frequency (Hz)</th><th>RMS Value Using Oscilloscope (V)</th><th>RMS Value Using Digital Multimeter (V)</th><th>% Error</th></tr>
${FQ.map(f=>`<tr><td>10 V</td><td>${f} Hz</td><td>${H.num('r'+f,'0.001',70)}</td><td>${H.num('d'+f,'0.001',70)}</td><td>${H.num('e'+f,'0.01',70)}</td></tr>`).join('')}</table>
<h3>Procedure III</h3>${fig('e2-fig3.png','Fig. 3: Circuit connection for procedure III (series RL, e(t) = 10 sin 2π·10³t V)')}
<div class="row">${H.cap('w3','V<sub>R</sub> (CH I) and E (CH II)')}${H.cap('w4','Lissajous (XY)')}</div>
<table class="tbl"><caption>Procedure III · Series RL circuit measurements</caption>
<tr><td class="l">R<sub>L</sub> of the coil</td><td>${H.num('rl','0.1',80)} Ω</td></tr>
<tr><td class="l">E (DMM, rms)</td><td>${H.num('e3','0.001',80)} V</td></tr>
<tr><td class="l">V<sub>L</sub> (DMM, rms)</td><td>${H.num('vl3','0.001',80)} V</td></tr>
<tr><td class="l">V<sub>R</sub> (DMM, rms)</td><td>${H.num('vr3','0.001',80)} V</td></tr>
<tr><td class="l">Phase angle θ (scope / Lissajous)</td><td>${H.num('th','0.1',80)} °</td></tr>
<tr><td class="l">Leading waveform</td><td>${H.sel('lead',[['e','E leads V<sub>R</sub>'.replace(/<\/?sub>/g,'')],['r','VR leads E'],['n','in phase']])}</td></tr>
<tr><td class="l">I (DMM, rms)</td><td>${H.num('i3','0.01',80)} mA</td></tr>
<tr><td class="l">Z<sub>T</sub> = E / I (measured)</td><td>${H.num('zm','0.1',80)} Ω</td></tr>
<tr><td class="l">Z<sub>T</sub> calculated = √((R + R<sub>L</sub>)² + X<sub>L</sub>²)</td><td>${H.num('zc','0.1',80)} Ω</td></tr>
<tr><td class="l">Average power P = I²(R + R<sub>L</sub>)</td><td>${H.num('p3','0.01',80)} mW</td></tr>
<tr><td class="l">Power factor PF = (R + R<sub>L</sub>) / Z<sub>T</sub></td><td>${H.num('pf','0.001',80)}</td></tr></table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
/* the figures' reference wiring. Fig. 1: DC + node 8 → CH I (node 9), DC − node 22 → CH I ⏚ (node 23). Fig. 2 next to it
   (Fig. 1 stays connected, step I.3): GEN L node 11 → CH II (node 12), GEN N node 25 → CH II ⏚ (node 26).
   Fig. 3 in the rectangle: GEN top-left (node 8), plug 8–9 (the ammeter's place), c = 9, the coil along the top to a = 10,
   R down the right side to b = 17, the bottom row back to GEN ⏚ (node 22); the Fluke across R (V_R) */
const L1=[{lead:'Lp',alt:'Rp',at:8},{wire:[8,9]},{lead:'c1r',at:9},{lead:'Lm',alt:'Rm',at:22},{wire:[22,23]},{lead:'c1b',at:23}];
const L2=[...L1,{lead:'gr',at:11},{wire:[11,12]},{lead:'c2r',at:12},{lead:'gb',at:25},{wire:[25,26]},{lead:'c2b',at:26}];
const L3=[{lead:'gr',at:8},{wire:[8,9]},{part:['L175',9,10]},{part:['R100',10,17]},{wire:[17,24]},{wire:[24,23]},{wire:[23,22]},{lead:'gb',at:22},{lead:'h1v',at:10},{lead:'h1c',at:17}];
const IMG=f=>'labs/ee205/fig/'+f;
const figs={'1':{img:IMG('e2-fig1.png'),cap:'Fig. 1 · Oscilloscope for measurement of DC Voltage',lines:L1},
  '2':{img:IMG('e2-fig2.png'),cap:'Fig. 2 · Oscilloscope for measurement of AC voltage (Fig. 1 stays connected)',lines:L2},
  '3':{img:IMG('e2-fig3.png'),cap:'Fig. 3 · Series RL circuit (the Fluke across R for V<sub>R</sub>)',lines:L3}};
/* the coil alone on the ohmmeter (step III.1) */
const OHML={lines:[{part:['L175',0,1]},{lead:'h1v',at:0},{lead:'h1c',at:1}]};
return {figs,procs:[{id:'I',title:'Familiarization with the oscilloscope (Figs. 1, 2)'},{id:'II',title:'Oscilloscope vs DMM for RMS'},{id:'III',title:'Series RL circuit measurements (Fig. 3)'}],
sheet,params:()=>({}),
instruments:[
  {type:'thandar',procs:['I'],prev:d=>{d.u[0].v=3;d.u[0].ilim=0.2}},
  {type:'metrix',prev:{freq:500,amp:2,wave:'Triangle'}},
  {type:'hameg',prev:sc=>{sc.ch[0].vd=0.5;sc.ch[0].cpl='AC';sc.ch[1].vd=5;sc.td=5e-3;sc.focus=0.6}},
  {type:'hdmm',model:'fluke77',n:1,prev:d=>{d.pos=4}},
  {type:'yew',n:1}],
parts:PARTS,
tray:[['R100','100 Ω'],['L175','17.5 mH coil'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  const sc=()=>RT.S.sc;
  const probe=c=>RT.leadNet(`c${c+1}r`);
  /* reference: series RL behind the generator's 50 Ω */
  const RL=PARTS.L175.rs,XL=2*Math.PI*1000*PARTS.L175.l,Rt=PARTS.R100.r+RL;
  const CAL={zc:Math.hypot(100+RL,XL),th:Math.atan2(XL,100+RL)*180/Math.PI};CAL.pf=(100+RL)/CAL.zc;
  /* a channel shows its trace on screen: calibrated, inside ±4 div */
  const onScreen=(c,v)=>{const ch=sc().ch[c];return sc().pwr&&!ch.var&&Math.abs(v/ch.vd)<=4.05};
  /* Fig. 3 by its parts: the coil c–a and R a–b share a; b is the generator's ground (earth) */
  function topo3(){const L=RT.S.parts.filter(p=>p.type==='L175'),R=RT.S.parts.filter(p=>p.type==='R100');if(L.length!==1||R.length!==1)return null;
    const [l1,l2]=RT.partNets(L[0]),[r1,r2]=RT.partNets(R[0]);let a,c;if(l1!=null&&(l1===r1||l1===r2)){a=l1;c=l2}else if(l2!=null&&(l2===r1||l2===r2)){a=l2;c=l1}else return null;
    const b=r1===a?r2:r1;if(b!==-1||c==null||c===a||c===-1||RT.leadNet('gb')!==-1)return null;return {a,b,c}}
  function status(){const st={};const S=sc(),g=K.gen();st.pwr=S.pwr;st.fl=RT.S.hm1;
    st.knobs=S.pwr&&(S.focus!==RT.inst.sc.fresh().focus||S.intens!==RT.inst.sc.fresh().intens);if(st.knobs)ST.knobs=true;
    /* Procedure I · Fig. 1 */
    const s=K.sup();st.sup=s;st.fig1=RT.match('1').ok;
    if(st.fig1&&S.ch[0].cpl==='GND'&&S.pwr)ST.zero=true;
    st.ch1dc=S.ch[0].cpl==='DC';
    if(st.fig1&&st.ch1dc&&s.on&&!S.xy&&ST.zero){[1,2,5,10].forEach(v=>{if(Math.abs(s.U.v-v)<0.006&&onScreen(0,v))ST['dc'+v]=+s.U.v.toFixed(2)})}
    st.supOff=!s||!s.on;
    /* Fig. 2: the generator on CH II (both by their leads' nets), AC coupling */
    const gn=RT.leadNet('gr');st.fig2=gn!=null&&probe(1)===gn&&RT.leadNet('c2b')!=null;
    st.sine14=g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-4)<0.001&&Math.abs(g.off)<1e-9;
    st.ch2ac=S.ch[1].cpl==='AC';
    if(st.fig2&&st.sine14&&st.ch2ac&&onScreen(1,2)&&(S.ch2sel||S.dual)&&!S.add&&!S.xy)ST.sine={vm:g.vpp/2,T:1000/g.f};
    if(st.fig2&&st.sine14){const v=K.across('ACV',gn,-1,false);if(v!=null&&ST.sine)ST.vrd=v}
    const md=RT.inst.sc.mode();st.mode=md;
    const fig1on=s&&probe(0)!=null&&probe(0)===s.P&&RT.leadNet('c1b')===s.M;
    if(fig1on&&st.fig2&&s.ok&&Math.abs(s.U.v-10)<0.006&&st.sine14&&st.ch1dc){if(md==='DUAL')ST.dual=true;if(md==='ADD'&&ST.dual)ST.add=true}
    /* Procedure II: 10 Vpp sine, scope on it, DMM on ACV */
    const s10=g.on&&g.wave==='Sine'&&Math.abs(g.vpp-10)<0.001&&Math.abs(g.off)<1e-9;st.s10=s10;
    const scOn=[0,1].find(c=>probe(c)===gn&&gn!=null);st.scOnGen=scOn!=null;
    if(s10&&scOn!=null&&onScreen(scOn,5)&&(scOn===1?(S.ch2sel||S.dual||S.add):(!S.ch2sel||S.dual)))ST.pp10=true;
    if(s10&&ST.pp10&&FQ.includes(g.f)){const v=K.across('ACV',gn,-1,false);if(v!=null)ST['d'+g.f]=v}
    /* Procedure III: the coil alone on the ohmmeter; Fig. 3 by its parts (c, a, b) */
    if(RT.match(OHML).ok){const v=K.across('OHM',RT.leadNet('h1v'),RT.leadNet('h1c'));if(v!=null)ST.rl=v}
    st.e20=g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-20)<0.001&&Math.abs(g.off)<1e-9;
    const T=topo3();st.T=T;const run3=T&&st.e20&&gn===T.c;
    if(run3){[['e3',T.c,-1],['vl3',T.c,T.a],['vr3',T.a,-1]].forEach(([k,a,b])=>{const v=K.across('ACV',a,b,false);if(v!=null)ST[k]=v})}
    st.scope3=run3&&probe(0)===T.a&&probe(1)===T.c;
    if(st.scope3&&S.pwr&&(md==='DUAL'||md==='CHOP')&&!S.xy)ST.dual3=true;
    if(st.scope3&&S.pwr&&S.xy)ST.xy=true;
    st.noScope=probe(0)==null&&probe(1)==null;
    if(T&&st.e20&&st.noScope&&gn!==T.c){const v=K.amm(gn,T.c,'ACI');if(v!=null)ST.i3=v}
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,s=G.s;
    g.proc('I');[1,2,5,10].forEach(x=>g.add(G.near(v('dc'+x),x,x*0.03+0.02),`DC ${x} V on the scope`,`≈ ${x} V (deflection × V/div)`));
    g.add(G.near(v('vm'),2,0.08),'Vm','≈ 2 V (4 Vpp)');g.add(G.near(v('tp'),1,0.04),'T','≈ 1 ms');g.add(G.near(v('fq'),1/v('tp')*1e3,2)&&G.near(v('fq'),1000,40),'f = 1/T','≈ 1000 Hz');
    g.add(G.near(v('vr'),v('vm')/Math.SQRT2,0.005),'Vrms = Vm/√2',`≈ ${(2/Math.SQRT2).toFixed(3)} V`);
    g.add(ST.vrd!=null&&G.near(v('vd'),ST.vrd,0.002),'Vrms by DMM',ST.vrd!=null?`${ST.vrd.toFixed(3)} V`:'measure it with the Fluke on V~');
    g.add(s('q8')==='a','Step 8 ADD','the sine shifted up by the 10 V dc');g.add(G.near(v('vr8'),Math.hypot(10,v('vr')),0.01),'Vrms of dc + ac',`√(10² + Vrms²) ≈ ${Math.hypot(10,2/Math.SQRT2).toFixed(3)} V`);
    g.proc('II');FQ.forEach(f=>{g.add(G.near(v('r'+f),10/2/Math.SQRT2,0.05),`${f} Hz scope RMS`,'10 Vpp / (2√2) = 3.535 V');
      g.add(ST['d'+f]!=null&&G.near(v('d'+f),ST['d'+f],0.002),`${f} Hz DMM`,ST['d'+f]!=null?`${ST['d'+f].toFixed(3)} V`:'read the Fluke at this frequency');
      g.add(G.near(v('e'+f),(v('d'+f)-v('r'+f))/v('r'+f)*100,0.05),`${f} Hz % error`,'(DMM − scope) / scope × 100')});
    g.proc('III');g.add(G.near(v('rl'),RL,0.15),'RL',`≈ ${RL} Ω`);
    [['e3','E'],['vl3','VL'],['vr3','VR']].forEach(([k,t])=>g.add(ST[k]!=null&&G.near(v(k),ST[k],0.002),t,ST[k]!=null?`${ST[k].toFixed(3)} V`:'measure it'));
    g.add(G.near(v('th'),CAL.th,3),'θ',`≈ ${CAL.th.toFixed(1)}° (atan XL/(R+RL))`);g.add(s('lead')==='e','leading','E leads VR (the current lags in an RL circuit)');
    g.add(ST.i3!=null&&G.near(v('i3'),ST.i3*1e3,0.02),'I',ST.i3!=null?`${(ST.i3*1e3).toFixed(2)} mA`:'measure it in series');
    g.add(G.near(v('zm'),v('e3')/v('i3')*1e3,0.5),'ZT = E/I');g.add(G.near(v('zc'),CAL.zc,1),'ZT calculated',`≈ ${CAL.zc.toFixed(1)} Ω`);
    g.add(G.near(v('p3'),Math.pow(v('i3')/1e3,2)*(100+v('rl'))*1e3,0.05),'P = I²(R+RL)');g.add(G.near(v('pf'),(100+v('rl'))/v('zc'),0.005),'PF = (R+RL)/ZT',`≈ ${CAL.pf.toFixed(3)}`);
    g.show($('result'))});
  const calc=t=>({dev:'board',t,ok:()=>true});
  return {status,
    steps:[
      /* Procedure I (manual pp. 19–21), steps 1–8 */
      {dev:'sc',t:'Procedure I · 1. شغّل الـ oscilloscope وشوف وظيفة مفاتيح التحكم هذي:',acts:['a) Focus','b) Intensity','c) Horizontal position و vertical position'],ok:s=>ST.knobs},
      {dev:'board',build:'1',t:'2. وصّل الدائرة Fig. 1.',acts:['a) حدّد خط الصفر على الشاشة (GD تحت CH I، والخط على الوسط بـ Y-POS I).','b) خلّ مفتاح channel-1 على dc mode.','c) غيّر جهد الـ supply لين تاخذ القيم اللي في الجدول (1، 2، 5، 10 V)، وعبّي الجدول: vertical deflection (div) × V/div (VAR على CAL).'],
        ok:s=>ST.zero&&[1,2,5,10].every(v=>ST['dc'+v]!=null),rec:[1,2,5,10].map(v=>({to:'dc'+v,val:()=>ST['dc'+v],unit:'V',dec:2,label:`DC ${v} V`}))},
      {dev:'psu',t:'3. طفّ الـ dc voltage supply وخلّ الدائرة موصولة.',ok:s=>s.supOff&&s.fig1&&ST.dc10!=null},
      {dev:'board',build:'2',t:'4. حوّل الـ display mode switch على channel 2 ووصّل الدائرة Fig. 2. استخدم الـ function generator كمصدر AC.',ok:s=>s.mode==='II'},
      {dev:'sc',t:'5. خلّ مدخل channel 2 على ac mode. اعرض إشارة sinusoidal على الـ oscilloscope واحسب ترددها ومقدارها:',acts:['شغّل الـ generator: Sine، FREQ = 1 kHz، AMPL = 4 Vpp، OFFSET = 0، و OUTPUT ON.','CH II على AC، واضبط VOLTS/DIV و TIME/DIV لين تشوف موجة أو موجتين كاملة.','V<sub>m</sub> = vertical deflection × V/div، و T = horizontal deflection × time/div.'],
        ok:s=>!!ST.sine,rec:[{to:'vm',val:()=>ST.sine?ST.sine.vm:null,unit:'V',dec:2,label:'V<sub>m</sub>'},{to:'tp',val:()=>ST.sine?ST.sine.T:null,unit:'ms',dec:3,label:'T'}]},
      calc('6. احسب تردد الإشارة f = 1/T، و الـ V<sub>rms</sub>.'),
      {dev:'hm1',t:'7. استخدم الـ multimeter (ac voltage mode) وقِس الـ V<sub>rms</sub> للإشارة. كيف تقارن هالقيمة بالمحسوبة في (6)؟',acts:['حط الـ Fluke على V~، و VΩ على L (مخرج الـ generator) و COM على N.'],ok:s=>ST.vrd!=null,
        rec:[{to:'vd',val:()=>ST.vrd,unit:'V',dec:3,label:'V<sub>rms</sub> (DMM)'}]},
      {dev:'sc',t:'8. رجّع الـ dc supply على ON لدائرة Fig. 1، ووصّله على channel 1 وحوّل الـ display mode على DUAL (الإشارتين مع بعض على الشاشة). بعدين حوّل على ADD (مجموع channel 1 و 2). كيف تقارن الإشارة بمجموع 10 V dc والإشارة اللي في (5)؟ وكم الـ V<sub>rms</sub> للإشارة الجديدة؟',
        acts:['شغّل الـ supply على 10 V (CH I على DC).','اضغط DUAL.','حرّر DUAL واضغط ADD (DUAL و ADD مع بعض = CHOP).'],ok:s=>ST.add},
      /* Procedure II (manual p. 21), steps 1–4 */
      {dev:'gen',t:'Procedure II · 1. استخدم الـ function generator وطلّع sinusoidal voltage بـ 10 V (peak to peak).',acts:['Sine، AMPL = 10 Vpp، OFFSET = 0، FREQ = 100 Hz، OUTPUT ON.'],ok:s=>s.s10},
      {dev:'sc',t:'2. استخدم الـ oscilloscope وقِس الـ peak to peak (10 V). RMS = 5/√2 = 3.535 V.',acts:['الإشارة على CH II، و VOLTS/DIV على 2 V (5 divisions).'],ok:s=>ST.pp10},
      {dev:'hm1',t:'3. استخدم الـ digital multimeter وقِس الـ RMS.',acts:['الـ Fluke على V~ على مخرج الـ generator.'],ok:s=>FQ.some(f=>ST['d'+f]!=null)},
      {dev:'gen',t:'4. زِد التردد (وخلّ الـ peak to peak ثابت) وسجّل الـ RMS في الجدول:',acts:FQ.map(f=>`${f} Hz`),ok:s=>FQ.every(f=>ST['d'+f]!=null),
        rec:FQ.map(f=>({to:'d'+f,val:()=>ST['d'+f],unit:'V',dec:3,label:`${f} Hz`}))},
      /* Procedure III (manual p. 22), steps 1–9 */
      {dev:'hm1',t:'Procedure III · 1. قِس مقاومة الـ coil، R<sub>L</sub>.',acts:['حط الـ coil (17.5 mH) لحاله على اللوحة، والـ Fluke على Ω عليه.'],ok:s=>ST.rl!=null,rec:[{to:'rl',val:()=>ST.rl,unit:'Ω',dec:1,label:'R<sub>L</sub>'}]},
      {dev:'board',build:'3',t:'2. وصّل الدائرة Fig. 3، وقِس E و V<sub>L</sub> و V<sub>R</sub> بالـ multimeter. ملاحظة: القيم المقاسة هي قيم الـ rms.',
        acts:['اضبط e(t) = 10 sin(2π·10³t): Sine، 1 kHz، AMPL = 20 Vpp، و OUTPUT ON.','الـ Fluke على V~: E (c–b)، و V<sub>L</sub> (c–a)، و V<sub>R</sub> (a–b).'],
        ok:s=>s.e20&&ST.e3!=null&&ST.vl3!=null&&ST.vr3!=null,rec:[['e3','E'],['vl3','V<sub>L</sub>'],['vr3','V<sub>R</sub>']].map(([k,l])=>({to:k,val:()=>ST[k],unit:'V',dec:3,label:l}))},
      {dev:'sc',t:'3. اعرض V<sub>R</sub> و E على الـ oscilloscope. ارسم الموجات.',acts:['CH I على a (V<sub>R</sub>)، و CH II على c (E)، والأرضي على b.','حوّل على DUAL.'],ok:s=>ST.dual3,rec:[{scope:'w3',label:'V<sub>R</sub> و E'}]},
      {dev:'sc',t:'4. قِس الـ phase angle θ، ووضّح أي موجة تسبق. ليش؟',acts:['من الإزاحة بين الموجتين على DUAL.','أو اضغط XY: الـ Lissajous، و θ = sin⁻¹(L<sub>1</sub>/L<sub>2</sub>) (Fig. 3-c).'],ok:s=>ST.xy,rec:[{scope:'w4',label:'Lissajous'}]},
      {dev:'board',t:'5. شيل توصيلة الـ oscilloscope وقِس التيار I اللي يمشي في الدائرة.',acts:['الـ Fluke على A~: شيل الـ plug اللي بين الـ generator و c، وحط الأميتر مكانه (المدخل 300mA على جهة الـ generator، COM على c).'],ok:s=>ST.i3!=null,
        rec:[{to:'i3',val:()=>ST.i3!=null?ST.i3*1e3:null,unit:'mA',dec:2,label:'I'}]},
      calc('6. احسب Z<sub>T</sub> من العلاقة Z<sub>T</sub> = E/I.'),
      calc('7. احسب Z<sub>T</sub> وارسم الـ impedance diagram اللي استخدمته في حسابك.'),
      calc('8. بالـ phasor analysis أثبت إن E = V<sub>R</sub> + V<sub>L</sub>.'),
      calc('9. احسب الـ average power المعطاة والـ power factor لدائرة Fig. 3.')
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
