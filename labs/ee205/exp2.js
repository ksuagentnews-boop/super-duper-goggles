/* EE205 · Experiment 2 · Root-Mean-Square (RMS) Value, Peak, and Peak-to-Peak Values, Measurements with Oscilloscope
   (manual pp. 17–22).
   Procedure I: familiarization with the Hameg (focus, intensity, positions); Fig. 1 dc on CH I (DC coupling) at 1, 2, 5,
   10 V → deflection × V/div; Fig. 2 sine from the generator on CH II (AC coupling) → Vm, T, f, Vrms, DMM on ACV; then
   10 V dc on CH I + the sine on CH II: DUAL, then ADD.
   Procedure II: 10 Vpp sine; RMS from the scope (3.535 V) vs the DMM at 100 Hz … 5 kHz → % error.
   Procedure III: series RL (17.5 mH air-core coil + 100 Ω), e(t) = 10 sin(2π·10³t): RL of the coil; E, VL, VR on the DMM;
   VR (CH I) and E (CH II) on the scope → θ and the leading wave, Lissajous in XY (θ = sin⁻¹ L1/L2); I; ZT = E/I; P, PF.
   Assumptions: Procedure I's sine is not specified: 1 kHz, 4 Vpp is used. Fig. 3's caption says "procedure II" but it
   belongs to Procedure III. e(t) = 10 sin … is set as 20 Vpp on the generator (open circuit; its 50 Ω output then gives
   E < 10 V peak under load, which the DMM measures). The 1000-turn coil has RL ≈ 17.6 Ω (lab video). The decade box of
   the equipment list stands on the table (no step uses it). */
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
return {procs:[{id:'I',title:'Familiarization with the oscilloscope (Figs. 1, 2)'},{id:'II',title:'Oscilloscope vs DMM for RMS'},{id:'III',title:'Series RL circuit measurements (Fig. 3)'}],
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
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
  const sc=()=>RT.S.sc;
  const probe=c=>RT.leadNet(`c${c+1}r`);
  /* reference: series RL behind the generator's 50 Ω */
  const RL=PARTS.L175.rs,XL=2*Math.PI*1000*PARTS.L175.l,Rt=PARTS.R100.r+RL;
  const CAL={zc:Math.hypot(100+RL,XL),th:Math.atan2(XL,100+RL)*180/Math.PI};CAL.pf=(100+RL)/CAL.zc;
  /* a channel shows its trace on screen: calibrated, inside ±4 div */
  const onScreen=(c,v)=>{const ch=sc().ch[c];return sc().pwr&&!ch.var&&Math.abs(v/ch.vd)<=4.05};
  function status(){const st={};const S=sc(),g=K.gen();st.pwr=S.pwr;st.fl=RT.S.hm1;
    st.knobs=S.pwr&&(S.focus!==RT.inst.sc.fresh().focus||S.intens!==RT.inst.sc.fresh().intens);if(st.knobs)ST.knobs=true;
    /* Procedure I · Fig. 1 */
    const s=K.sup();st.sup=s;st.fig1=s&&probe(0)!=null&&probe(0)===s.P&&RT.leadNet('c1b')!=null&&RT.leadNet('c1b')===s.M;
    if(st.fig1&&S.ch[0].cpl==='GND'&&S.pwr)ST.zero=true;
    st.ch1dc=S.ch[0].cpl==='DC';
    if(st.fig1&&st.ch1dc&&s.on&&!S.xy){[1,2,5,10].forEach(v=>{if(Math.abs(s.U.v-v)<0.006&&onScreen(0,v))ST['dc'+v]={vd:S.ch[0].vd}})}
    st.supOff=!s||!s.on;
    /* Fig. 2: generator on CH II, AC coupling */
    const gn=RT.leadNet('gr');st.fig2=gn!=null&&probe(1)===gn&&RT.leadNet('c2b')!=null;
    st.sine14=g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-4)<0.001&&Math.abs(g.off)<1e-9;
    st.ch2ac=S.ch[1].cpl==='AC';
    if(st.fig2&&st.sine14&&st.ch2ac&&onScreen(1,2)&&(S.ch2sel||S.dual)&&!S.add&&!S.xy)ST.sine=true;
    if(st.fig2&&st.sine14){const v=K.across('ACV',gn,-1,false);if(v!=null&&ST.sine)ST.vrd=v}
    const md=RT.inst.sc.mode();st.mode=md;
    if(st.fig1&&st.fig2&&s.ok&&Math.abs(s.U.v-10)<0.006&&st.sine14&&st.ch1dc){if(md==='DUAL')ST.dual=true;if(md==='ADD'&&ST.dual)ST.add=true}
    /* Procedure II: 10 Vpp sine, scope on it, DMM on ACV */
    const s10=g.on&&g.wave==='Sine'&&Math.abs(g.vpp-10)<0.001&&Math.abs(g.off)<1e-9;st.s10=s10;
    const scOn=[0,1].find(c=>probe(c)===gn&&gn!=null);st.scOnGen=scOn!=null;
    if(s10&&scOn!=null&&onScreen(scOn,5)&&(scOn===1?(S.ch2sel||S.dual||S.add):(!S.ch2sel||S.dual)))ST.pp10=true;
    if(s10&&ST.pp10&&FQ.includes(g.f)){const v=K.across('ACV',gn,-1,false);if(v!=null)ST['d'+g.f]=v}
    /* Procedure III · Fig. 3: c = 15 (generator through the plug 8 ↔ 15), a = 16, b = 23 (earth) */
    st.coilAlone=RT.between(N(15),N(16)).length===1&&K.has('L175',15,16)&&RT.at(N(15)).length===1&&RT.at(N(16)).length===1;
    if(st.coilAlone){const v=K.across('OHM',N(15),N(16),true);if(v!=null)ST.rl=v}
    st.fig3=K.has('L175',15,16)&&K.has('R100',16,23)&&gn!=null&&RT.leadNet('gb')!=null&&N(23)===-1&&(gn===N(15)||(gn===N(8)&&(N(8)===N(15)||K.ammOn(N(8),N(15)))));
    st.e20=g.on&&g.wave==='Sine'&&g.f===1000&&Math.abs(g.vpp-20)<0.001&&Math.abs(g.off)<1e-9;
    const run3=st.fig3&&st.e20&&N(8)===N(15);
    if(run3){[['e3',15,-1],['vl3',15,16],['vr3',16,-1]].forEach(([k,a,b])=>{const v=K.across('ACV',N(a),b===-1?-1:N(b),false);if(v!=null)ST[k]=v})}
    st.scope3=run3&&probe(0)===N(16)&&probe(1)===N(15);
    if(st.scope3&&S.pwr&&(md==='DUAL'||md==='CHOP')&&!S.xy)ST.dual3=true;
    if(st.scope3&&S.pwr&&S.xy)ST.xy=true;
    st.noScope=probe(0)==null&&probe(1)==null;
    if(st.fig3&&st.e20&&st.noScope){const v=K.amm(N(8),N(15),'ACI');if(v!=null)ST.i3=v}
    st.genOff=!g.out||!g.pwr;
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
  const F1='labs/ee205/fig/e2-fig1.png',F2='labs/ee205/fig/e2-fig2.png',F3='labs/ee205/fig/e2-fig3.png';
  return {status,
    steps:[
      {dev:'sc',t:'Procedure I: شغّل الـ Hameg (POWER)، وجرّب أزرار FOCUS و INTENS و X-POS / Y-POS وشوف وش تسوي بالخط على الشاشة.',ok:s=>ST.knobs},
      {dev:'board',fig:F1,figCap:'Fig. 1',t:'ركّب Fig. 1: الـ dc supply على CH I.',lines:[{t:'CH I: red clip → node 2',lead:'c1r',at:2},{t:'CH I ⏚: black clip → node 9',lead:'c1b',at:9},{t:'DC + → node 2',lead:'Lp',alt:'Rp',at:2},{t:'DC − → node 9',lead:'Lm',alt:'Rm',at:9}],ok:s=>s.fig1},
      {dev:'sc',t:'a) حدّد خط الصفر: اضغط GD تحت CH I وحط الخط على وسط الشاشة بـ Y-POS I.',ok:s=>ST.zero},
      {dev:'sc',t:'b) رجّع CH I على DC (GD مطفي و AC/DC على DC).',ok:s=>ST.zero&&s.ch1dc&&s.fig1},
      {dev:'psu',t:'c) شغّل الـ supply على 1 V، واضبط VOLTS/DIV لين يبان الخط بانحراف واضح (VAR على CAL). سجّل: عدد الـ divisions × V/div.',ok:s=>ST.dc1!=null},
      {dev:'psu',t:'كرّر لـ 2 V و 5 V و 10 V (غيّر VOLTS/DIV إذا طلع الخط من الشاشة).',ok:s=>ST.dc2!=null&&ST.dc5!=null&&ST.dc10!=null},
      {dev:'psu',t:'3. طفّ الـ supply (OUTPUT OFF) وخلّ الدائرة موصولة.',ok:s=>s.supOff&&ST.dc10!=null},
      {dev:'board',fig:F2,figCap:'Fig. 2',t:'4. ركّب Fig. 2: الـ function generator على CH II.',lines:[{t:'GEN OUT: red clip (L) → node 4',lead:'gr',at:4},{t:'GEN ⏚: black clip (N) → node 11',lead:'gb',at:11},{t:'CH II: red clip → node 4',lead:'c2r',at:4},{t:'CH II ⏚: black clip → node 11',lead:'c2b',at:11}],ok:s=>s.fig2},
      {dev:'gen',t:'شغّل الـ generator: Sine، FREQ = 1 kHz، AMPL = 4 Vpp، OFFSET = 0، و OUTPUT ON.',ok:s=>s.fig2&&s.sine14},
      {dev:'sc',t:'5. حوّل الـ mode على CH II (زر CH I/II)، و CH II على AC. اضبط VOLTS/DIV و TIME/DIV لين تشوف موجة أو موجتين كاملة، واقرا V<sub>m</sub> و T واحسب f و V<sub>rms</sub>.',ok:s=>ST.sine},
      {dev:'hm1',t:'7. حط الـ Fluke على V~ وقِس V<sub>rms</sub> على مخرج الـ generator (VΩ → node 4، COM → node 11). قارنه بالمحسوب.',lines:[{t:'Fluke VΩ → node 4',lead:'h1v',at:4},{t:'Fluke COM → node 11',lead:'h1c',at:11}],ok:s=>ST.vrd!=null},
      {dev:'sc',t:'8. رجّع الـ supply على ON بـ 10 V على CH I (DC)، وحوّل الـ mode على DUAL: تشوف الإشارتين مع بعض.',ok:s=>ST.dual},
      {dev:'sc',t:'بعدين حرّر DUAL واضغط ADD (DUAL و ADD مع بعض = CHOP): الشاشة تعرض مجموع CH I + CH II. قارنه بـ 10 V dc + الموجة، واحسب V<sub>rms</sub> للإشارة الجديدة.',ok:s=>ST.add},
      {dev:'gen',t:'Procedure II: طفّ الـ supply وشيل أطرافه وأطراف CH I. اضبط الـ generator على Sine بـ 10 Vpp (FREQ = 100 Hz)، وخلّ الـ scope يقيس الـ peak to peak (10 V) على CH II: حط VOLTS/DIV على 2 V.',ok:s=>ST.pp10&&s.supOff},
      ...FQ.map(f=>({dev:'gen',t:`قِس الـ RMS بالـ Fluke (V~) على ${f} Hz وسجّله، والـ RMS من الـ scope = 10/(2√2) = 3.535 V (الـ Vpp ثابت).`,ok:s=>ST['d'+f]!=null})),
      {dev:'board',t:'Procedure III: طفّ الـ OUTPUT، وفكّ أطراف Procedure II. حط الـ coil (17.5 mH) لحاله بين node 15 و node 16، وقِس R<sub>L</sub> بالـ Fluke على Ω.',lines:[{t:'17.5 mH coil: node 15 ↔ node 16',part:['L175',15,16]},{t:'Fluke VΩ → node 15',lead:'h1v',at:15},{t:'Fluke COM → node 16',lead:'h1c',at:16}],ok:s=>ST.rl!=null},
      {dev:'board',fig:F3,figCap:'Fig. 3',t:'ركّب Fig. 3: c = node 15، a = node 16، b = node 23 (الأرضي). الـ generator يدخل على node 8 وفيه bridging plug لـ node 15 (مكان الأميتر بعدين).',
        lines:[{t:'100 Ω: node 16 ↔ node 23',part:['R100',16,23]},{t:'bridging plug: node 8 ↔ node 15',wire:[8,15]},{t:'GEN OUT red → node 8',lead:'gr',at:8},{t:'GEN ⏚ black → node 23 (b)',lead:'gb',at:23}],ok:s=>s.fig3},
      {dev:'gen',t:'اضبط e(t) = 10 sin(2π·10³t): Sine، 1 kHz، AMPL = 20 Vpp، و OUTPUT ON.',ok:s=>s.fig3&&s.e20},
      {dev:'hm1',t:'2. بالـ Fluke على V~ قِس E (node 15 ↔ node 23)، و V<sub>L</sub> (node 15 ↔ node 16)، و V<sub>R</sub> (node 16 ↔ node 23). القراءات rms.',ok:s=>ST.e3!=null&&ST.vl3!=null&&ST.vr3!=null},
      {dev:'board',fig:F3,figCap:'Fig. 3',t:'3. اعرض V<sub>R</sub> على CH I و E على CH II (الأرضي على b)، وحوّل على DUAL.',lines:[{t:'CH I red → node 16 (a)',lead:'c1r',at:16},{t:'CH I ⏚ → node 23 (b)',lead:'c1b',at:23},{t:'CH II red → node 15 (c)',lead:'c2r',at:15},{t:'CH II ⏚ → node 23 (b)',lead:'c2b',at:23}],ok:s=>ST.dual3},
      {dev:'sc',t:'4. قِس الـ phase angle θ ووش الموجة اللي تسبق. بعدين اضغط XY: الـ Lissajous، و θ = sin⁻¹(L<sub>1</sub>/L<sub>2</sub>).',ok:s=>ST.xy},
      {dev:'board',t:'5. شيل أطراف الـ scope، وقِس I: شيل الـ plug بين node 8 و node 15 وحط الـ Fluke مكانه على A~ (المدخل 300mA → node 8، COM → node 15).',lines:[{t:'Fluke 300mA (red) → node 8',lead:'h1ma',at:8},{t:'Fluke COM → node 15',lead:'h1c',at:15}],ok:s=>ST.i3!=null},
      {dev:'gen',t:'6–9. احسب Z<sub>T</sub> = E/I و Z<sub>T</sub> النظري والـ P والـ PF، وبعدين طفّ الـ generator.',ok:s=>s.genOff&&ST.i3!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
