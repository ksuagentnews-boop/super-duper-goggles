/* EE205 · Experiment 6 · Transients in DC Circuits (manual pp. 41–52). Steps follow the manual's procedure, one per numbered step.
   Procedure I: Fig. 9, RC: square wave 0 → +10 V at about 200 Hz, R = 10 kΩ on the decade box (+ the generator's Rs),
   C = 0.047 µF → vc(t) at six times while charging and while discharging (Table 1), τ (Table 2); vR(t), ic(t).
   Procedure II: Fig. 10, RLC: R ≈ 600 Ω (box), 17.5 mH, 0.047 µF → underdamped; raise R until the overshoot just
   vanishes (Rc = 2√(L/C)); raise it further → overdamped; trace the three curves (manual numbers its steps 1 and 3).
   Figures in the lab's rectangle layout (generator on the left, the box along the top, C down the right side, CH I across C).
   Instruments: Metrix MTX 3240 (square, 10 Vpp, offset 5 V = 0 … +10 V), Hameg HM 203-7 (CH I on the capacitor), YEW box.
   Decisions: Rs = 50 Ω (the MTX 3240 output), so τ = (10 kΩ + 50 Ω)·0.047 µF = 0.472 ms; the coil's RL = 17.6 Ω adds to R
   in Procedure II (critical box setting ≈ 2√(L/C) − Rs − RL ≈ 1.15 kΩ). The six times of Table 1 are the student's own
   (Manual «Capture» reads v_c at 0.1, 0.25, 0.5, 0.75, 1, 1.5 ms after the edge). Procedure II's three curves are captured
   into three screen slots added to the sheet. The box's two terminals may go either way round. */
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
<div class="caps3">${H.cap('cu','Under damped (R ≈ 600 Ω)')}${H.cap('cc','Critically damped (R = Rc)')}${H.cap('co','Over damped (R > Rc)')}</div>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
/* the figures' reference wiring, rectangle layout: bottom-left node 22, left column 22–8, top row 8–10, right column
   10–24, bottom row back to 22. Generator on the left (OUT 8, ⏚ 22), the decade box along the top (8–9), C down the right
   side (10–17), CH I across C (10, ⏚ 22). Fig. 10 puts the coil along the top (9–10) between the box and C. */
const GEN=[{lead:'gr',at:8},{lead:'gb',at:22}],BOX=[{lead:'y1H',alt:'y1L',at:8},{lead:'y1L',alt:'y1H',at:9}],RET=[{wire:[17,24]},{wire:[24,23]},{wire:[23,22]}],CH1=[{lead:'c1r',at:10},{lead:'c1b',at:22}];
const figs={'9':{img:'labs/ee205/fig/e6-fig9.png',cap:'Fig. 9 · RC: R = 10 kΩ (decade box), C = 0.047 µF',lines:[...GEN,...BOX,{wire:[9,10]},{part:['C047',10,17]},...RET,...CH1]},
  '10':{img:'labs/ee205/fig/e6-fig10.png',cap:'Fig. 10 · RLC: R (decade box), L = 17.5 mH, C = 0.047 µF',lines:[...GEN,...BOX,{part:['L175',9,10]},{part:['C047',10,17]},...RET,...CH1]}};
return {figs,procs:[{id:'I',title:'RC charging and discharging (Fig. 9, Tables 1, 2)'},{id:'II',title:'RLC: under, critical and over damping (Fig. 10)'}],
sheet,params:()=>({}),cycles:2,sub:12,
instruments:[
  {type:'metrix',prev:{freq:1000,amp:2,wave:'Sine'}},
  {type:'hameg',prev:sc=>{sc.ch[0].vd=0.5;sc.td=5e-5;sc.ch[0].cpl='AC'}},
  {type:'yew',n:1,prev:d=>{d.d=[0,0,0,1,0,0]}}],
parts:PARTS,
tray:[['C047','0.047 µF'],['L175','17.5 mH coil'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  const sc=()=>RT.S.sc;const box=()=>RT.inst.yew1.value();
  const sq=()=>{const g=K.gen();return g.on&&g.wave==='Square'&&Math.abs(g.vpp-10)<0.011&&Math.abs(g.off-5)<0.006&&g.f>=100&&g.f<=500};
  /* the capacitor voltage over one period and where the beam starts (trigger level on CH I) */
  function trace(net){const v=RT.samples(net,300);let mx=-1e9,mn=1e9;v.forEach(x=>{mx=Math.max(mx,x);mn=Math.min(mn,x)});
    const S=sc(),t=S.trig,mean=v.reduce((a,b)=>a+b,0)/v.length,vd=RT.inst.sc.vdEff(0);const Lv=(t.cpl==='DC'?0:mean)+t.level*vd;return {mx,mn,Lv,slope:t.slope}}
  const view=()=>{const S=sc(),ch=S.ch[0];return S.pwr&&!S.xy&&ch.cpl==='DC'&&!ch.var&&!S.tvar&&!S.xmag&&(RT.inst.sc.mode()==='I'||RT.inst.sc.mode()==='DUAL')&&S.trig.src===0&&ch.vd>=1.25&&ch.vd<=5&&S.td>=1e-4&&S.td<=1e-3};
  /* v_c after the generator's rising (charging) or falling (discharging) edge, from the solved period (Fig. 9) */
  const NSMP=1200;
  function edge(rise){const M=RT.match('9');if(!M.ok||!sq()||box()!==10000)return null;const g=RT.leadNet('gr');const vg=RT.samples(g,NSMP),vc=RT.samples(M.net(10),NSMP);
    let i0=-1;for(let i=0;i<NSMP;i++){const p=vg[(i+NSMP-1)%NSMP],q=vg[i];if(rise?(p<5&&q>=5):(p>5&&q<=5)){i0=i;break}}if(i0<0)return null;return {vc,i0,dt:1/K.gen().f/NSMP,half:0.5/K.gen().f}}
  function vcAt(t,rise){const e=edge(rise);if(!e||t>e.half)return null;const u=e.i0-0.5+t/e.dt,k=Math.floor(u),f=u-k;const a=e.vc[((k%NSMP)+NSMP)%NSMP],b=e.vc[(((k+1)%NSMP)+NSMP)%NSMP];return a*(1-f)+b*f}
  /* τ: the time from the edge to 63.2 % of the step (6.32 V charging, 3.68 V discharging) */
  function tauOf(rise){const e=edge(rise);if(!e)return null;const lv=rise?6.32:3.68;for(let j=0;j*e.dt<e.half;j++){const a=e.vc[(e.i0+j-1+NSMP)%NSMP],b=e.vc[(e.i0+j)%NSMP];
      if(rise?(a<lv&&b>=lv):(a>lv&&b<=lv))return (j-0.5+(lv-a)/(b-a))*e.dt}return null}
  const TS=[0.1e-3,0.25e-3,0.5e-3,0.75e-3,1e-3,1.5e-3];
  const put=(id,v)=>{const el=document.getElementById(id);if(el){el.value=v;el.classList.add('captured')}};
  const tRec=(p,rise)=>TS.map((t,i)=>({to:p+'v'+i,label:`v<sub>c</sub>(${+(t*1e3).toFixed(2)} ms)`,unit:'V',dec:2,val:()=>{if(!(rise?ST.charge:ST.dis))return null;const v=vcAt(t,rise);if(v!=null)put(p+'t'+i,+(t*1e3).toFixed(2));return v}}));
  /* the ringing frequency of the underdamped response: two successive upward crossings of the final value after the edge */
  function ring(){const M=RT.match('10');if(!M.ok||!sq())return null;const g=RT.leadNet('gr');const vg=RT.samples(g,NSMP),v=RT.samples(M.net(10),NSMP);let i0=-1;
    for(let i=0;i<NSMP;i++)if(vg[(i+NSMP-1)%NSMP]<5&&vg[i]>=5){i0=i;break}if(i0<0)return null;const dt=1/K.gen().f/NSMP,n=Math.floor(NSMP/2),fin=v[(i0+n-2)%NSMP];const up=[];
    for(let j=1;j<n&&up.length<2;j++){const a=v[(i0+j-1)%NSMP]-fin,b=v[(i0+j)%NSMP]-fin;if(a<0&&b>=0)up.push(j-1+a/(a-b))}return up.length===2?1/((up[1]-up[0])*dt):null}
  function status(){const st={};st.sq=sq();st.box=box();st.r10k=st.box===10000;
    /* Fig. 9 (matched as a circuit): the capacitor's net is the reference node 10 */
    const M9=RT.match('9');st.fig9=M9.ok;
    if(M9.ok&&st.r10k&&st.sq&&view()){const tr=trace(M9.net(10));st.tr=tr;const ch=sc().ch[0];tr.fits=tr.mx/ch.vd+ch.pos<=4.05&&tr.mn/ch.vd+ch.pos>=-4.05;if(tr.fits){
      if(tr.slope==='+'&&tr.Lv>tr.mn&&tr.Lv<tr.mn+1.5)ST.charge=true;
      if(tr.slope==='-'&&tr.Lv<tr.mx&&tr.Lv>tr.mx-1.5)ST.dis=true}}
    /* Fig. 10: the overshoot of v_c over the 10 V step */
    const M10=RT.match('10');st.fig10=M10.ok;
    if(M10.ok&&st.sq&&sc().pwr){const v=RT.samples(M10.net(10),300);const mx=Math.max(...v);const os=(mx-10)/10;st.os=os;const b=st.box;
      if(b>=400&&b<=800&&os>0.05)ST.under=b;
      if(ST.under!=null&&b>=850&&b<=1600&&os<0.01){if(ST.rc==null||b<ST.rc)ST.rc=b}
      if(ST.rc!=null&&b>=1.5*ST.rc&&os<0.002)ST.over=b}
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
  /* "do it for me" helpers (Batch 7 item 3): the Metrix value by its digit cursor and knob, the decade box digit by digit */
  const mtx=async(A,p,target)=>{const g=RT.S.gen;if(!g.pwr)return;await A.press('g:'+{f:'FREQ',a:'AMPL',o:'OFFSET'}[p]);
    for(let i=0;i<400;i++){const cur={f:g.freq,a:g.amp,o:g.off}[p],diff=target-cur;if(Math.abs(diff)<1e-9*Math.max(1,Math.abs(target)))return;
      const lim={f:[-1,6],a:[-3,1],o:[-3,0]}[p];let d=Math.max(lim[0],Math.min(lim[1],Math.floor(Math.log10(Math.abs(diff))+1e-9)));
      if(p==='f'&&cur+Math.sign(diff)*Math.pow(10,d)<0.1)d--;
      if(g.dig[p]!==d){await A.tap(g.dig[p]<d?'g:CL':'g:CR',60);continue}await A.tap(diff>0?'g:KN+':'g:KN-',60)}};
  const boxTo=async(A,v)=>{const d=RT.S.yew1.d;await A.focus('yew1');for(let j=0;j<6;j++){const t=Math.floor(v/Math.pow(10,j))%10;for(let q=0;q<12&&d[j]!==t;q++)await A.tap(`y1:D${j}${d[j]<t?'+':'-'}`,90)}};
  const G0=()=>RT.S.gen,CH=()=>sc().ch[0];
  /* the square wave of both procedures: 0 → +10 V at 200 Hz (AMPL 10 Vpp, OFFSET 5 V) */
  const genSubs=()=>[
    {k:'set',dev:'gen',t:'شغّل الـ generator واختر Square.',ok:()=>G0().pwr&&G0().wave==='Square',do:async A=>{if(!G0().pwr)await A.press('g:PWR');if(G0().wave!=='Square')await A.press('g:Square')},hint:'زر POWER ثم زر الـ square ⊓⊔'},
    {k:'set',dev:'gen',t:'AMPL = 10 Vpp.',ok:()=>Math.abs(G0().amp-10)<0.011,do:A=>mtx(A,'a',10),hint:'اضغط AMPL ولف الـ knob (◀ ▶ يختار الخانة) لين 10.00 Vpp'},
    {k:'set',dev:'gen',t:'OFFSET = 5 V (الموجة من 0 V لـ +10 V).',ok:()=>Math.abs(G0().off-5)<0.006,do:A=>mtx(A,'o',5),hint:'اضغط OFFSET ولف الـ knob لين +5.000 V'},
    {k:'set',dev:'gen',t:'FREQ حوالي 200 Hz.',ok:()=>G0().freq>=100&&G0().freq<=500,do:A=>mtx(A,'f',200),hint:'اضغط FREQ ولف الـ knob لين 200 Hz'},
    {k:'set',dev:'gen',t:'OUTPUT ON.',ok:s=>s.sq,do:async A=>{if(!G0().out)await A.press('g:OUT')},hint:'زر OUTPUT (يولّع الـ LED)'}];
  return {status,
    steps:[
      /* Procedure I (manual p. 50), steps 1–5; every step split into its sub-steps (Batch 7 item 3) */
      {dev:'board',build:'9',t:'Procedure I · 1. وصّل الدائرة Fig. 9، واضبط الـ square wave يتنقّل بين 0 V و +10 V بتردد حوالي 200 Hz، وحط الـ decade resistance box على 10 kΩ. R<sub>s</sub> (المقاومة الداخلية للـ generator) تنضاف لـ R في الحساب.',subs:[
        {k:'build',fig:'9',t:'وصّل الدائرة <bdi dir="ltr">Fig. 9</bdi>: الـ box هو R، و C = 0.047 µF، و CH I على المكثف.'},
        ...genSubs(),
        {k:'set',dev:'yew1',t:'الـ decade box على 10 kΩ (قرص ×10K على الرقم 1 والباقي صفر).',ok:s=>s.r10k,do:A=>boxTo(A,10000),hint:s=>`الـ box الحين ${s.box} Ω: خلّ قرص ×10K على الرقم 1 وكل الباقي صفر`}]},
      {dev:'sc',t:'2. اعرض جهد المكثف على الـ oscilloscope. اختر time base يبين الموجة كاملة (حافة الطلوع والـ steady state). عدّل تردد الـ square wave إذا احتجت. سجّل v<sub>c</sub>(t) عند ست أوقات مختلفة في Table 1، وقِس الـ time constant واكتبه في Table 2.',subs:[
        {k:'set',dev:'sc',t:'شغّل الـ Hameg (POWER).',ok:()=>sc().pwr,do:A=>A.press('s:PWR')},
        {k:'set',dev:'sc',t:'CH I على DC.',ok:()=>CH().cpl==='DC',do:A=>A.until('s:AC1',()=>CH().cpl==='DC',3),hint:'مفتاح AC / DC تحت CH I'},
        {k:'set',dev:'sc',t:'VOLTS/DIV لـ CH I على 2 V/div، و VAR على CAL.',ok:()=>CH().vd>=1.25&&CH().vd<=5&&!CH().var,do:async A=>{await A.until('s:VV1+',()=>!CH().var,12);await A.until(CH().vd<2?'s:V1-':'s:V1+',()=>CH().vd===2,12)},hint:'لف VOLTS/DIV لـ CH I لين 2 V/div'},
        {k:'set',dev:'sc',t:'TIME/DIV على 0.2 ms/div.',ok:()=>sc().td>=1e-4&&sc().td<=1e-3&&!sc().tvar&&!sc().xmag,do:A=>A.until(sc().td<2e-4?'s:TD-':'s:TD+',()=>Math.abs(sc().td-2e-4)<1e-9,20),hint:'لف TIME/DIV لين 0.2 ms/div'},
        {k:'set',dev:'sc',t:'نزّل خط الصفر بـ Y-POS I لأسفل الشاشة عشان تبين الموجة من 0 V لـ 10 V.',ok:()=>CH().pos<=-1&&CH().pos>=-4,do:A=>A.until(CH().pos>-2.6?'s:Y1-':'s:Y1+',()=>Math.abs(CH().pos+2.6)<0.05,40),hint:'لف Y-POS I لين يصير خط الصفر قريب من أسفل الشاشة'},
        {k:'set',dev:'sc',t:'الـ slope على + و LEVEL قريب من 0 V عشان يبدأ الخط من بداية الشحن.',ok:()=>!!ST.charge,do:async A=>{if(sc().trig.slope!=='+')await A.press('s:SLP');await A.until(sc().trig.level>-2.2?'s:LV-':'s:LV+',()=>!!ST.charge,45)},hint:'زر SLOPE على +، ولف LEVEL لليسار لين يبدأ الخط من بداية الطلعة'},
        {k:'rec',t:'سجّل v<sub>c</sub> عند ست أوقات من بداية الشحن، و τ (الوقت لين v<sub>c</sub> = 6.32 V).',ok:()=>!!ST.charge,rec:[...tRec('c',true),{to:'tce',label:'τ (charging)',unit:'ms',dec:3,val:()=>{const t=ST.charge?tauOf(true):null;return t==null?null:t*1e3}}]}]},
      {dev:'sc',t:'3. اعرض موجة التفريغ (discharging) لجهد المكثف على الـ oscilloscope، وعدّل التردد بحيث يبين جزء التناقص كامل لـ v<sub>c</sub>(t). قِس t و v<sub>c</sub>(t) عند ست أوقات في جزء التناقص وسجّلها في Table 1، وقِس الـ time constant واكتبه في Table 2.',subs:[
        {k:'set',dev:'sc',t:'حوّل الـ slope على −.',ok:()=>sc().trig.slope==='-',do:A=>A.press('s:SLP')},
        {k:'set',dev:'sc',t:'ارفع LEVEL قريب من 10 V عشان يبدأ الخط من بداية التفريغ.',ok:()=>!!ST.dis,do:A=>A.until(sc().trig.level<2.2?'s:LV+':'s:LV-',()=>!!ST.dis,45),hint:'لف LEVEL لليمين لين يبدأ الخط من بداية النزلة'},
        {k:'rec',t:'سجّل v<sub>c</sub> عند ست أوقات من بداية التفريغ، و τ (الوقت لين v<sub>c</sub> = 3.68 V).',ok:()=>!!ST.dis,rec:[...tRec('d',false),{to:'tde',label:'τ (discharging)',unit:'ms',dec:3,val:()=>{const t=ST.dis?tauOf(false):null;return t==null?null:t*1e3}}]}]},
      {dev:'sc',t:'4. للحالتين (2) و (3) قارن القيم النظرية لـ v<sub>c</sub>(t) و τ مع المقاسة، وكمّل Table 1 و Table 2.',subs:[
        {k:'set',t:'احسب v<sub>c</sub> النظرية و τ = (R + R<sub>s</sub>)C وقارنها بالمقاسة (حساب في الـ sheet).',ok:()=>!!ST.dis}]},
      {dev:'sc',t:'5. من موجة v<sub>c</sub>(t) في خطوة (2) و (3) للشحن والتفريغ، طلّع موجة v<sub>R</sub>(t) و i<sub>c</sub>(t) لـ R = 10 kΩ.',subs:[
        {k:'rec',t:'سجّل v<sub>R</sub> = E − v<sub>c</sub> و i<sub>c</sub> = v<sub>R</sub>/R لحظة بداية الشحن ولحظة بداية التفريغ.',ok:()=>!!ST.dis,
          rec:[{to:'vr0',label:'v<sub>R</sub>(0<sup>+</sup>) = E − v<sub>c</sub>(0)',unit:'V',dec:2,val:()=>{const v=vcAt(0,true);return v==null?null:10-v}},
            {to:'ic0',label:'i<sub>c</sub>(0<sup>+</sup>) charging',unit:'mA',dec:3,val:()=>{const v=vcAt(0,true);return v==null?null:(10-v)/(10000+RS)*1e3}},
            {to:'id0',label:'i<sub>c</sub>(0<sup>+</sup>) discharging',unit:'mA',dec:3,val:()=>{const v=vcAt(0,false);return v==null?null:-v/(10000+RS)*1e3}}]}]},
      /* Procedure II (manual p. 52), steps 1 and 3 */
      {dev:'board',build:'10',t:'Procedure II · 1. وصّل الدائرة Fig. 10، واضبط الـ square wave بين 0 V و +10 V بتردد حوالي 200 Hz، وحط الـ decade resistance box على قيمة مناسبة مثل 600 Ω، و C = 0.047 µF، عشان تطلع under damped response. R<sub>s</sub> تنضاف لـ R في الحساب.',subs:[
        {k:'build',fig:'10',t:'وصّل الدائرة <bdi dir="ltr">Fig. 10</bdi>: الـ coil 17.5 mH بين الـ box والمكثف، و CH I على المكثف.'},
        ...genSubs(),
        {k:'set',dev:'yew1',t:'الـ decade box على 600 Ω (قرص ×100 على الرقم 6 والباقي صفر).',ok:s=>s.box===600,do:A=>boxTo(A,600),hint:s=>`الـ box الحين ${s.box} Ω: خلّ قرص ×100 على الرقم 6 وكل الباقي صفر`},
        {k:'measure',dev:'sc',t:'اعرض جهد المكثف على الـ Hameg (slope + و LEVEL تحت): تشوف overshoot و ringing (under damped).',ok:()=>ST.under!=null,
          do:async A=>{if(!sc().pwr)await A.press('s:PWR');if(sc().trig.slope!=='+')await A.press('s:SLP');await A.until('s:LV-',()=>sc().trig.level<=-2.2,45)},hint:'شغّل الـ Hameg، و R على 600 Ω'}]},
      {dev:'yew1',t:'3. اعرض جهد المكثف على الـ oscilloscope واختر time base يبين الموجة كاملة. ارفع R لين يختفي الـ overshoot بالضبط: هذي الـ critical resistance (R<sub>c</sub> = 2√(L/C)). ارفع R أكثر عشان تطلع over damped response. ارسم الثلاث منحنيات وسجّل ملاحظاتك.',subs:[
        {k:'rec',t:'سجّل منحنى الـ under damped (R = 600 Ω) وتردد الـ ringing.',ok:()=>ST.under!=null,rec:[{scope:'cu',label:'Under damped'},{to:'fd',label:'Ringing frequency',unit:'Hz',dec:0,val:()=>{const b=box();return b>=400&&b<=800?ring():null},none:'رجّع الـ box على 600 Ω عشان تقيس تردد الـ ringing'}]},
        {k:'set',dev:'yew1',t:'ارفع R شوي شوي (مثلاً 50 Ω كل مرة) لين يختفي الـ overshoot بالضبط.',ok:()=>ST.rc!=null,
          do:async A=>{for(let r=Math.max(700,Math.ceil(box()/50)*50);r<=1600&&ST.rc==null;r+=50){await boxTo(A,r);A.st()}},hint:s=>`الـ box الحين ${s.box} Ω${s.os!=null?` والـ overshoot ${(s.os*100).toFixed(1)} %`:''}: ارفعه 50 Ω كل مرة`},
        {k:'rec',t:'سجّل R<sub>c</sub> (قيمة الـ box) ومنحنى الـ critically damped.',ok:()=>ST.rc!=null,rec:[{to:'rcm',label:'R<sub>c</sub> (box)',unit:'Ω',dec:0,val:()=>ST.rc},{scope:'cc',label:'Critically damped'}]},
        {k:'set',dev:'yew1',t:'ارفع R أكثر (الضعف أو أكثر، مثلاً 3 kΩ): الطلعة أبطأ وبدون overshoot (over damped).',ok:()=>ST.over!=null,do:A=>boxTo(A,3000),hint:'خلّ الـ box على 3 kΩ أو أكثر'},
        {k:'rec',t:'سجّل منحنى الـ over damped.',ok:()=>ST.over!=null,rec:[{scope:'co',label:'Over damped'}]}]}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
