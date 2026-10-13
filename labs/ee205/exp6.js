/* EE205 · Experiment 6 · Transients in DC Circuits (manual pp. 41–52).
   Procedure I: Fig. 9, RC: square wave 0 → +10 V at about 200 Hz, R = 10 kΩ on the decade box (+ the generator's Rs),
   C = 0.047 µF → vc(t) at six times while charging and while discharging (Table 1), τ (Table 2); vR(t), ic(t).
   Procedure II: Fig. 10, RLC: R ≈ 600 Ω (box), 17.5 mH, 0.047 µF → underdamped; raise R until the overshoot just
   vanishes (Rc = 2√(L/C)); raise it further → overdamped; trace the three curves.
   Instruments: Metrix MTX 3240 (square, 10 Vpp, offset 5 V = 0 … +10 V), Hameg HM 203-7 (CH I on the capacitor), YEW box.
   Decisions: Rs = 50 Ω (the MTX 3240 output), so τ = (10 kΩ + 50 Ω)·0.047 µF = 0.472 ms; the coil's RL = 17.6 Ω adds to R
   in Procedure II (critical box setting ≈ 2√(L/C) − Rs − RL ≈ 1.15 kΩ). The six times of Table 1 are the student's own. */
EXP_DEFS['ee205/exp6']=(()=>{const H=ENGINE.sheet;
const PARTS={C047:{t:'C',c:0.047e-6,np:true,mark:'47n',lab:'0.047µF'},L175:{t:'L',l:0.0175,rs:17.6,lab:'17.5mH'},BR:{t:'BR',lab:''}};
const RS=50,C=0.047e-6,L=0.0175,RL=17.6,TAU=(10000+RS)*C,RC=2*Math.sqrt(L/C);
const fig=(f,cap,w=460)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const row=i=>`<tr>${i===0?'<td rowspan="6">R = 10 kΩ<br>C = 0.047 µF</td>':''}<td>${H.num('ct'+i,'0.01',58)}</td><td>${H.num('cv'+i,'0.01',58)}</td><td>${H.num('cth'+i,'0.01',58)}</td><td>${H.num('cd'+i,'0.1',58)}</td><td>${H.num('dt'+i,'0.01',58)}</td><td>${H.num('dv'+i,'0.01',58)}</td><td>${H.num('dth'+i,'0.01',58)}</td><td>${H.num('dd'+i,'0.1',58)}</td></tr>`;
const sheet=`<div class="paper" id="paper">
<h2>Experiment 6 · Transients in DC Circuits</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">اقرا الأوقات (ms) والجهود (V) من شاشة الـ Hameg: t = عدد الـ divisions × TIME/DIV. النظري: شحن v<sub>c</sub> = 10(1 − e<sup>−t/τ</sup>)، تفريغ v<sub>c</sub> = 10 e<sup>−t/τ</sup>، و τ = (R + R<sub>s</sub>)C.</p>
<h3>Procedure I</h3>${fig('e6-fig9.png','Fig. 9: Experimental setup (RC)')}
<table class="tbl"><caption>Table 1 (Procedure I): Experimental and theoretical values of v<sub>c</sub>(t)</caption>
<tr><th rowspan="2">Circuit Element</th><th colspan="4">Charging Mode</th><th colspan="4">Discharging Mode</th></tr>
<tr><th>Time (ms)</th><th>v<sub>c</sub> Exp. (V)</th><th>v<sub>c</sub> Theor. (V)</th><th>% Diff.</th><th>Time (ms)</th><th>v<sub>c</sub> Exp. (V)</th><th>v<sub>c</sub> Theor. (V)</th><th>% Diff.</th></tr>
${[0,1,2,3,4,5].map(row).join('')}</table>
<table class="tbl"><caption>Table 2 (Procedure I): Time constants of the RC circuit (ms)</caption>
<tr><th rowspan="2">Circuit Element</th><th colspan="3">Charging Mode</th><th colspan="3">Discharging Mode</th></tr>
<tr><th>Experimental</th><th>Theoretical</th><th>error %</th><th>Experimental</th><th>Theoretical</th><th>error %</th></tr>
<tr><td>R = 10 kΩ, C = 0.047 µF</td><td>${H.num('tce','0.001',62)}</td><td>${H.num('tct','0.001',62)}</td><td>${H.num('tcr','0.1',58)}</td><td>${H.num('tde','0.001',62)}</td><td>${H.num('tdt','0.001',62)}</td><td>${H.num('tdr','0.1',58)}</td></tr></table>
<ol class="en"><li class="plq">Step 5: from v<sub>c</sub>(t), v<sub>R</sub>(t) = E − v<sub>c</sub>(t) while charging and i<sub>c</sub> = v<sub>R</sub> / R.
${H.row('v<sub>R</sub>(0<sup>+</sup>) charging =',H.num('vr0','0.01'),'V')}${H.row('i<sub>c</sub>(0<sup>+</sup>) charging =',H.num('ic0','0.001'),'mA')}${H.row('i<sub>c</sub>(0<sup>+</sup>) discharging =',H.num('id0','0.001'),'mA')}</li></ol>
<h3>Procedure II</h3>${fig('e6-fig10.png','Fig. 10: Experimental setup (RLC)')}
<table class="tbl"><caption>Procedure II · Second-order RLC circuit (L = 17.5 mH, C = 0.047 µF)</caption>
<tr><td class="l">Box R at which the overshoot just vanishes (Ω)</td><td>${H.num('rcm','1',80)}</td></tr>
<tr><td class="l">Total R at that point = R + R<sub>L</sub> + R<sub>s</sub> (Ω)</td><td>${H.num('rct','1',80)}</td></tr>
<tr><td class="l">Theoretical R<sub>c</sub> = 2√(L/C) (Ω)</td><td>${H.num('rcth','1',80)}</td></tr>
<tr><td class="l">Ringing frequency seen at R ≈ 600 Ω (Hz)</td><td>${H.num('fd','1',80)}</td></tr>
<tr><td class="l">Observation</td><td>${H.sel('obs',[['a','R < Rc: overshoot and ringing (underdamped); R = Rc: fastest rise without overshoot (critically damped); R > Rc: slower rise without overshoot (overdamped)'],['b','The overshoot grows as R increases'],['c','R has no effect on the response']])}</td></tr></table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
return {procs:[{id:'I',title:'RC charging and discharging (Fig. 9, Tables 1, 2)'},{id:'II',title:'RLC: under, critical and over damping (Fig. 10)'}],
sheet,params:()=>({}),cycles:2,sub:12,
instruments:[
  {type:'metrix',prev:{freq:1000,amp:2,wave:'Sine'}},
  {type:'hameg',prev:sc=>{sc.ch[0].vd=0.5;sc.td=5e-5;sc.ch[0].cpl='AC'}},
  {type:'yew',n:1,prev:d=>{d.d=[0,0,0,1,0,0]}}],
parts:PARTS,
tray:[['C047','0.047 µF'],['L175','17.5 mH coil'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
  const sc=()=>RT.S.sc;const box=()=>RT.inst.yew1.value();
  const sq=()=>{const g=K.gen();return g.on&&g.wave==='Square'&&Math.abs(g.vpp-10)<0.011&&Math.abs(g.off-5)<0.006&&g.f>=100&&g.f<=500};
  const bL=()=>RT.leadNet('y1L'),bH=()=>RT.leadNet('y1H');
  /* the capacitor voltage over one period and where the beam starts (trigger level on CH I) */
  function trace(net){const v=RT.samples(net,300);let mx=-1e9,mn=1e9;v.forEach(x=>{mx=Math.max(mx,x);mn=Math.min(mn,x)});
    const S=sc(),t=S.trig,mean=v.reduce((a,b)=>a+b,0)/v.length,vd=RT.inst.sc.vdEff(0);const Lv=(t.cpl==='DC'?0:mean)+t.level*vd;return {mx,mn,Lv,slope:t.slope}}
  const view=()=>{const S=sc(),ch=S.ch[0];return S.pwr&&!S.xy&&ch.cpl==='DC'&&!ch.var&&!S.tvar&&!S.xmag&&(RT.inst.sc.mode()==='I'||RT.inst.sc.mode()==='DUAL')&&S.trig.src===0&&ch.vd>=1.25&&ch.vd<=5&&S.td>=1e-4&&S.td<=1e-3};
  function status(){const st={};const gn=RT.leadNet('gr');st.sq=sq();st.box=box();
    /* Fig. 9: gen 1, box 1 → 2, C 2–9, gen ⏚ 9, CH I on 2 */
    const boxIn=(a,b)=>(bH()===N(a)&&bL()===N(b))||(bL()===N(a)&&bH()===N(b));
    st.fig9=gn===N(1)&&boxIn(1,2)&&K.has('C047',2,9)&&N(9)===-1&&RT.leadNet('c1r')===N(2);
    st.r10k=st.box===10000;
    if(st.fig9&&st.r10k&&st.sq&&view()){const tr=trace(N(2));st.tr=tr;const ch=sc().ch[0];tr.fits=tr.mx/ch.vd+ch.pos<=4.05&&tr.mn/ch.vd+ch.pos>=-4.05;if(tr.fits){
      if(tr.slope==='+'&&tr.Lv>tr.mn&&tr.Lv<tr.mn+1.5)ST.charge=true;
      if(tr.slope==='-'&&tr.Lv<tr.mx&&tr.Lv>tr.mx-1.5)ST.dis=true}}
    /* Fig. 10: gen 1, box 1 → 2, coil 2–3, C 3–10, gen ⏚ 9 with plug 9–10, CH I on 3 */
    st.fig10=gn===N(1)&&boxIn(1,2)&&K.has('L175',2,3)&&K.has('C047',3,10)&&N(10)===-1&&N(9)===-1&&RT.leadNet('c1r')===N(3);
    if(st.fig10&&st.sq&&sc().pwr){const v=RT.samples(N(3),300);const mx=Math.max(...v);const os=(mx-10)/10;st.os=os;const b=st.box;
      if(b>=400&&b<=800&&os>0.05)ST.under=b;
      if(ST.under!=null&&b>=850&&b<=1600&&os<0.01){if(ST.rc==null||b<ST.rc)ST.rc=b}
      if(ST.rc!=null&&b>=1.5*ST.rc&&os<0.002)ST.over=b}
    st.genOff=!RT.S.gen.out||!RT.S.gen.pwr;
    st.ST=ST;return st}
  const th=(t,ch)=>ch?10*(1-Math.exp(-t/TAU)):10*Math.exp(-t/TAU);
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,s=G.s;
    g.proc('I');[['c',true,'charging'],['d',false,'discharging']].forEach(([p,ch,nm])=>{const ts=new Set();
      for(let i=0;i<6;i++){const t=v(p+(p==='c'?'t':'t')+i)/1e3,ex=v(p+'v'+i),the=v(p+'th'+i);const okT=isFinite(t)&&t>0&&t<=2.5e-3&&!ts.has(t);ts.add(t);
        g.add(okT&&G.near(the,th(t,ch),0.03),`Table 1 ${nm} row ${i+1}: theoretical`,okT?`10${ch?'(1 − e':' e'}^(−t/τ) = ${th(t,ch).toFixed(2)} V at t = ${(t*1e3).toFixed(2)} ms`:'six different times within half a period');
        g.add(okT&&G.near(ex,th(t,ch),0.35),`Table 1 ${nm} row ${i+1}: experimental`,'read v<sub>c</sub> at that time on the scope'.replace(/<\/?sub>/g,''));
        g.add(G.near(v(p+'d'+i),(ex-the)/the*100,Math.abs((ex-the)/the*100)*0.02+0.2),`Table 1 ${nm} row ${i+1}: % difference`)}});
    [['tc','charging'],['td','discharging']].forEach(([k,nm])=>{g.add(G.near(v(k+'e'),TAU*1e3,TAU*1e3*0.1),`τ ${nm} experimental`,`≈ ${(TAU*1e3).toFixed(3)} ms (63 % / 37 % point)`);
      g.add(G.near(v(k+'t'),TAU*1e3,0.006)||G.near(v(k+'t'),0.47,0.002),`τ ${nm} theoretical`,`(R + Rs)C = ${(TAU*1e3).toFixed(3)} ms`);g.add(G.near(v(k+'r'),(v(k+'e')-v(k+'t'))/v(k+'t')*100,0.3),`τ ${nm} error %`)});
    g.add(G.near(v('vr0'),10,0.05),'vR(0+)','= E = 10 V');g.add(G.near(v('ic0'),10/(10000+RS)*1e3,0.01)||G.near(v('ic0'),1,0.002),'ic(0+) charging','E/(R + Rs) ≈ 0.995 mA');g.add(G.near(v('id0'),-10/(10000+RS)*1e3,0.01)||G.near(v('id0'),-1,0.002),'ic(0+) discharging','−E/(R + Rs) (opposite direction)');
    g.proc('II');g.add(ST.rc!=null&&G.near(v('rcm'),ST.rc,1),'Rc (box)',ST.rc!=null?`${ST.rc} Ω (where you saw the overshoot vanish)`:'find it on the scope');
    g.add(G.near(v('rct'),v('rcm')+RL+RS,2),'total R','box + RL + Rs');g.add(G.near(v('rcth'),RC,2),'Rc theoretical',`2√(L/C) = ${RC.toFixed(0)} Ω`);
    const fd=Math.sqrt(1/(L*C)-Math.pow((600+RL+RS)/(2*L),2))/(2*Math.PI);g.add(G.near(v('fd'),fd,fd*0.1),'ringing frequency',`≈ ${fd.toFixed(0)} Hz (ωd = √(1/LC − α²))`);
    g.add(s('obs')==='a','observation');
    g.show($('result'))});
  const F9='labs/ee205/fig/e6-fig9.png',F10='labs/ee205/fig/e6-fig10.png';
  return {status,
    steps:[
      {dev:'board',fig:F9,figCap:'Fig. 9',t:'Procedure I: ركّب Fig. 9: الـ decade box هو R بين node 1 و node 2، و C = 0.047 µF بين node 2 والأرضي (node 9). CH I على المكثف.',
        lines:[{t:'R1 H → node 1',lead:'y1H',at:1},{t:'R1 L → node 2',lead:'y1L',at:2},{t:'C = 0.047 µF: node 2 ↔ node 9',part:['C047',2,9]},{t:'GEN OUT red → node 1',lead:'gr',at:1},{t:'GEN ⏚ black → node 9',lead:'gb',at:9},
          {t:'CH I red → node 2',lead:'c1r',at:2},{t:'CH I ⏚ → node 9',lead:'c1b',at:9}],ok:s=>s.fig9},
      {dev:'yew1',t:'1. اضبط الـ decade box على 10 kΩ (×10K على 1 والباقي صفر).',ok:s=>s.fig9&&s.r10k},
      {dev:'gen',t:'اضبط الـ generator: Square، FREQ ≈ 200 Hz، AMPL = 10 Vpp و OFFSET = 5 V (يعني من 0 لـ +10 V)، و OUTPUT ON.',ok:s=>s.fig9&&s.sq},
      {dev:'sc',t:'2. اعرض v<sub>c</sub> على CH I (DC، 2 V/div، VAR على CAL)، ونزّل خط الصفر بـ Y-POS I لأسفل الشاشة عشان تبين الموجة كلها من 0 لـ 10 V. اختر TIME/DIV يبين حافة الشحن كاملة (مثلاً 0.2 ms/div)، والـ slope على + و LEVEL تحت (قريب من 0 V) عشان يبدأ الخط من بداية الشحن. سجّل v<sub>c</sub> عند ست أوقات و τ (عند 6.32 V).',ok:s=>ST.charge},
      {dev:'sc',t:'3. للتفريغ: حوّل الـ slope على − وارفع LEVEL قريب من 10 V عشان يبدأ الخط من بداية التفريغ. سجّل ست قراءات و τ (عند 3.68 V).',ok:s=>ST.dis},
      {dev:'gen',t:'4–5. احسب القيم النظرية (τ = (R + R<sub>s</sub>)C)، وارسم v<sub>R</sub>(t) و i<sub>c</sub>(t). وبعدين طفّ الـ OUTPUT.',ok:s=>s.genOff&&ST.dis},
      {dev:'board',fig:F10,figCap:'Fig. 10',t:'Procedure II: ركّب Fig. 10: شيل المكثف من node 2، وحط الـ coil بين node 2 و node 3 والمكثف بين node 3 و node 10، و bridging plug بين node 9 و node 10. انقل CH I على node 3.',
        lines:[{t:'17.5 mH coil: node 2 ↔ node 3',part:['L175',2,3]},{t:'C = 0.047 µF: node 3 ↔ node 10',part:['C047',3,10]},{t:'bridging plug: node 9 ↔ node 10',wire:[9,10]},{t:'CH I red → node 3',lead:'c1r',at:3}],ok:s=>s.fig10},
      {dev:'yew1',t:'1. حط الـ decade box على 600 Ω وشغّل الـ OUTPUT (نفس الـ square wave): تشوف overshoot و ringing (underdamped).',ok:s=>ST.under!=null},
      {dev:'yew1',t:'3. ارفع R شوي شوي لين يختفي الـ overshoot بالضبط: هذا الـ critical resistance (قارنه بـ R<sub>c</sub> = 2√(L/C) بعد ما تضيف R<sub>L</sub> و R<sub>s</sub>).',ok:s=>ST.rc!=null},
      {dev:'yew1',t:'ارفع R أكثر (مثلاً الضعف أو أكثر): overdamped، الطلعة أبطأ وبدون overshoot. ارسم الثلاث منحنيات وسجّل ملاحظاتك.',ok:s=>ST.over!=null},
      {dev:'gen',t:'طفّ الـ generator.',ok:s=>s.genOff&&ST.over!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
