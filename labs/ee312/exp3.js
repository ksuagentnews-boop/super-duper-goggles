/* EE312 · Experiment 3 · Limiting Circuits (manual v8.8 pp. 21–27).
   Procedure A: antiparallel-diode double limiter (Fig. 3.4a: D1 from vO to ground, D3–D2 in series the other way).
   Procedure B: double-anode Zener limiter (Fig. 3.4b). PeakTech 4124 (amplitude raised with its knob) + GDS-1104B
   (Default, Autoset, SCALE, Measure CH2 Max/Min, Triggered XY). Figs 3.6a/b and 3.7a/b captured, PLQs 1–6.
   Steps follow the manual's procedure (A 1–20, B 1–12) one by one; the circuit is checked by circuit equivalence
   (figures in the lab's rectangle layout: the generator on the left column, R along the top, the diode branches down
   to the bottom row; Fig. 3.4a alone, then with the generator (step 2), then with the scope probes (step 5)).
   Assumptions: Fig. 3.4a needs three 1N4001 (D1, D2, D3) although the materials list says two; step 3 also asks for
   Offset 0 (the previous group left an offset); both probe grounds on the circuit's ground (step 5);
   PLQ "draw an equivalent circuit" answers are chosen from constant-drop models with their numbers. */
EXP_DEFS['ee312/exp3']=(()=>{const H=ENGINE.sheet;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A, 500 mV<sub>p-p</sub> input: is there any difference between v<sub>I</sub>(t) and v<sub>O</sub>(t)? Why?
  <div>${H.sel('q1',[['a','No: |vI| ≤ 0.25 V is below the diodes\' cut-in, no diode conducts, so vO = vI'],['b','Yes: the positive half is clipped at 0.25 V'],['c','Yes: vO is inverted'],['d','Yes: vO is half of vI because of R']])}</div></li>
<li class="plq">Procedure A: equivalent circuit for the upper limiting level V<sub>O+</sub> (constant-drop model).
  <div>${H.sel('q2',[['a','D1 ON → a constant drop VD1 from vO to ground; D2, D3 OFF; VO+ = VD1'],['b','D2 and D3 ON; VO+ = VD2 + VD3'],['c','All diodes OFF; VO+ = vI'],['d','D1 ON; VO+ = 2 VD1']])}</div>
  <div>${H.row('Constant drop used for D1 =',H.num('q2v','0.01'),'V')}</div></li>
<li class="plq">Procedure A: equivalent circuit for the lower limiting level V<sub>O−</sub>.
  <div>${H.sel('q3',[['a','D2 and D3 ON in series, D1 OFF; VO− = −(VD2 + VD3)'],['b','D1 ON; VO− = −VD1'],['c','D3 ON only; VO− = −VD3'],['d','All OFF; VO− = vI']])}</div>
  <div>${H.row('Constant drop used for each of D2, D3 =',H.num('q3v','0.01'),'V')}</div></li>
<li class="plq">Procedure B, 4 V<sub>p-p</sub> input: is there any difference between v<sub>I</sub>(t) and v<sub>O</sub>(t)? Why?
  <div>${H.sel('q4',[['a','No: ±2 V is far below VZ + VD ≈ 5.5 V, both Zeners stay OFF, so vO = vI'],['b','Yes: clipped at ±0.7 V'],['c','Yes: clipped at +5.1 V only'],['d','Yes: vO = 0']])}</div></li>
<li class="plq">Procedure B: equivalent circuit for V<sub>O+</sub>.
  <div>${H.sel('q5',[['a','D1 in breakdown (VZ1) in series with D2 forward (VD2); VO+ = VZ1 + VD2'],['b','D1 forward and D2 in breakdown; VO+ = VD1 + VZ2'],['c','VO+ = VZ1 only'],['d','VO+ = VZ1 + VZ2']])}</div>
  <div>${H.row('VZ used =',H.num('q5z','0.01'),'V')}${H.row('VD used =',H.num('q5d','0.01'),'V')}</div></li>
<li class="plq">Procedure B: equivalent circuit for V<sub>O−</sub>.
  <div>${H.sel('q6',[['a','D1 forward (VD1) in series with D2 in breakdown (VZ2); VO− = −(VD1 + VZ2)'],['b','D1 in breakdown, D2 forward; VO− = −(VZ1 + VD2)'],['c','VO− = −VZ2 only'],['d','VO− = −(VD1 + VD2)']])}</div></li></ol>`;
/* the figures' reference wiring, in the lab's rectangle layout (bottom-left node 22, left column 22–8, top row 8–11,
   right column 11–25, bottom row back to 22): GEN OUT on the left side (vI = 8, ground = 22), R along the top (8–9),
   vO = top row 9–11; Fig. 3.4a: D1 down the inner column (10 → 17, plug 17–24), D3 (18 → 11) over D2 (25 → 18) down
   the right column; Fig. 3.4b: D1 (18 → 11) over D2 (18 → 25), anodes together; CH1 on vI, CH2 on vO, grounds below */
const TOP=[{part:['R1k',8,9]},{wire:[9,10]},{wire:[10,11]}],BOT=[{wire:[25,24]},{wire:[24,23]},{wire:[23,22]}];
const A=[...TOP,{part:['D4001',10,17],pol:true},{wire:[17,24]},{part:['D4001',18,11],pol:true},{part:['D4001',25,18],pol:true},...BOT];
const B=[...TOP,{part:['Z4733',18,11],pol:true},{part:['Z4733',18,25],pol:true},...BOT];
const GEN=[{lead:'gr',at:8},{lead:'gb',at:22}],SC=[{lead:'c1r',at:8},{lead:'c1b',at:22},{lead:'c2r',at:11},{lead:'c2b',at:25}];
const FIG='labs/ee312/fig/fig3-4.png';
const figs={'3.4a':{img:FIG,cap:'Fig. 3.4a · antiparallel-diode double limiter',lines:A},
  '3.4a-gen':{img:FIG,cap:'Fig. 3.4a · v<sub>I</sub> from CH1 of the generator',lines:[...A,...GEN]},
  '3.4a-ch1':{img:FIG,cap:'Fig. 3.4a · CH1 on v<sub>I</sub>',lines:[...A,...GEN,...SC.slice(0,2)]},
  '3.4a-sc':{img:FIG,cap:'Fig. 3.4a · CH1 on v<sub>I</sub>, CH2 on v<sub>O</sub>',lines:[...A,...GEN,...SC]},
  '3.4b':{img:FIG,cap:'Fig. 3.4b · double-anode Zener limiter',lines:[...B,...GEN,...SC]}};
return {figs,procs:[{id:'A',title:'Antiparallel-diode double limiter: Fig. 3.4a'},{id:'B',title:'Double-anode Zener limiter: Fig. 3.4b'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 3 · Limiting Circuits</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig3-4.png" alt="Fig. 3.4"></div>
<div class="hint" style="text-align:center">Fig. 3.4 · (a) D1, D2, D3 = 1N4001 · (b) D1, D2 = 1N4733A · R = 1 kΩ · v<sub>I</sub> from CH1 of the PeakTech 4124</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">سجّل القراءات من قياسات الإسكوب (Max / Min)، وصوّر الشاشات في مكانها، وجاوب الأسئلة.</p>
<h3>Procedure A · Antiparallel-diode double limiter</h3>
${H.row('Step 13 · Upper limiting level V<sub>O+</sub> (1.5 V<sub>p-p</sub>) =',H.num('a_vop'),'V')}
${H.row('Step 16 · Lower limiting level V<sub>O−</sub> (4 V<sub>p-p</sub>) =',H.num('a_vom'),'V')}
${H.cap('f36a','Fig. 3.6a')}${H.cap('f36b','Fig. 3.6b')}
<h3>Procedure B · Double-anode Zener limiter</h3>
${H.cap('f37a','Fig. 3.7a')}
${H.row('Step 7 · Upper limiting level V<sub>O+</sub> (15 V<sub>p-p</sub>) =',H.num('b_vop'),'V')}
${H.row('Step 8 · Lower limiting level V<sub>O−</sub> (15 V<sub>p-p</sub>) =',H.num('b_vom'),'V')}
${H.cap('f37b','Fig. 3.7b')}
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'gen',prev:{wave:'Square',freq:1000,amp:4,off:0.5}},
  {type:'scope',probes:2,prev:sc=>{sc.ch[0].probe=10;sc.ch[0].vd=50;sc.ch[1].on=false;sc.ch[1].vd=0.5;sc.ch[1].pos=1;sc.ch[1].cpl='AC';sc.td=5e-5;sc.xy=true;sc.meas=[{src:0,src2:1,type:'Pk-Pk'}];sc.trig.level=1.2;sc.disp.grat='Frame'}}],
parts:{R1k:{t:'R',r:1000,lab:'1kΩ'},D4001:{t:'D',lab:'1N4001'},Z4733:{t:'Z',lab:'1N4733A'},BR:{t:'BR',lab:''}},
tray:[['R1k','1 kΩ'],['D4001','1N4001'],['Z4733','1N4733A'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,Si=SOLVER.diodeSi,Zn=SOLVER.zener;
  /* reference circuits: node 0 = vI (generator 50 Ω), node 1 = vO; probes 1 MΩ */
  const REF={A:{n:3,els:[{t:'VS',a:0,r:50},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:1,b:-1,f:Si},{t:'D',a:2,b:1,f:Si},{t:'D',a:-1,b:2,f:Si},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[]},
             B:{n:3,els:[{t:'VS',a:0,r:50},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:2,b:1,f:Zn},{t:'D',a:2,b:-1,f:Zn},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[]}};
  const lim=(c,app)=>{const t=SOLVER.sweep(REF[c],-app/2,app/2,121);return {max:Math.max(...t.v2),min:Math.min(...t.v2)}};
  const L={A15:lim('A',1.5),A4:lim('A',4),A05:lim('A',0.5),B15:lim('B',15),B4:lim('B',4)};
  let ST={};
  /* which limiter is on the panel: circuit equivalence with the figures (any layout) */
  function status(){const S=RT.S,g=S.gen,sc=S.sc;const st={};
    const mA=RT.match('3.4a').ok,mAg=RT.match('3.4a-gen').ok,mAs=RT.match('3.4a-sc').ok,mB=RT.match('3.4b').ok;
    st.kind=mAs||mAg||mA?'A':mB?'B':null;st.gen=mAg||mAs;
    if(sc.msg==='Default Setup')ST.def=true;if(sc.msg==='Autoset'&&ST.def)ST.auto=true;
    st.sine=g.wave==='Sine'&&Math.abs(g.freq-200)<0.01&&Math.abs(g.off)<0.0005;st.amp=g.amp;st.out=g.pwr&&g.out;
    st.probes=mAs||mB;st.ch2=sc.pwr&&sc.ch[0].on&&sc.ch[1].on;
    const vds=[sc.ch[0].vd,sc.ch[1].vd];st.vd=v=>Math.abs(vds[0]-v)<1e-9&&Math.abs(vds[1]-v)<1e-9;st.pos0=sc.ch[0].pos===0&&sc.ch[1].pos===0;
    const cyc=10*sc.td*g.freq;st.cyc=cyc>=1&&cyc<=10;st.xy=sc.xy;st.pwr=sc.pwr;st.probe1=sc.ch.every(ch=>ch.probe===1&&!ch.inv)&&sc.ch[0].cpl==='DC'&&sc.ch[1].cpl==='DC';
    st.meas=['Max','Min'].every(t=>sc.meas.some(m=>m.src===1&&m.type===t));
    const sg=[RT.dsig(0),RT.dsig(1)];const fitC=k=>{const ch=sc.ch[k];const t=sg[k].max/ch.vd+ch.pos,b=sg[k].min/ch.vd+ch.pos;return t<=4.05&&b>=-4.05&&(t-b)>=1.0};
    st.fit=sc.pwr&&(sc.xy?(()=>{const c1=sc.ch[0];const l=sg[0].min/c1.vd+c1.pos,r=sg[0].max/c1.vd+c1.pos;return l>=-5.05&&r<=5.05&&(r-l)>=1&&fitC(1)})():fitC(0)&&fitC(1)&&st.cyc);
    const amp=g.amp,a=x=>Math.abs(amp-x)<0.0005;st.a=a;
    if(st.kind==='A'&&a(4)&&st.out)ST.a4=true;if(ST.a4&&st.out&&a(4)&&st.vd(0.5))ST.v500=true;
    if(ST.xyA&&!sc.xy)ST.ytA=true;if(st.kind==='A'&&sc.xy&&st.pos0&&a(4))ST.xyA=ST.xyA||sc.xy;
    if(ST.ytA&&!st.out)ST.genOffB=true;
    if(st.kind==='B'&&sc.xy&&a(15))ST.xyB=true;if(ST.xyB&&!sc.xy)ST.ytB=true;if(ST.ytB&&!g.pwr&&!sc.pwr)ST.endB=true;
    /* the CH2 Max / Min the scope shows (Measure), for «Capture» */
    st.mx=sc.pwr&&st.meas&&st.probes&&st.out?sg[1].max:null;st.mn=sc.pwr&&st.meas&&st.probes&&st.out?sg[1].min:null;
    st.ST=ST;return st}
  const meas=(w,lab,cond)=>({val:()=>{const s=status();return cond(s)?s[w]:null},unit:'V',dec:2,label:lab,none:'لازم الإسكوب شغّال و Measure فيه Max و Min للـ CH2، والإشارة بالسعة المطلوبة'});
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();BENCH.onRender()}));
  const capOK=(id,kind,amp,vd,xy)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];
    if(c.kind!==kind)pr.push(kind==='A'?'الدائرة مو Fig. 3.4a':'الدائرة مو Fig. 3.4b');if(!c.probes)pr.push('CH1 لازم على vI و CH2 على vO مع الأرضي');if(!c.out||!c.sine)pr.push('الجنريتر: Sine، 200 Hz، Offset 0، و CH1 شغّال');
    if(!c.a(amp))pr.push(`السعة لازم ${amp} Vpp`);if(!c.vd(vd))pr.push(`SCALE القناتين ${vd>=1?vd+' V':vd*1000+' mV'}/div`);if(c.xy!==xy)pr.push(xy?'لازم Triggered XY':'لازم YT');if(!c.probe1)pr.push('Probe 1X و Coupling DC');if(!c.fit)pr.push('الموجة مو واضحة على الشاشة');
    return [!pr.length,pr.join('، ')]};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    g.proc('A');g.add(G.near(v('a_vop'),L.A15.max,0.03),'A · VO+ (1.5 Vpp)',`≈ ${L.A15.max.toFixed(2)} V`);g.add(G.near(v('a_vom'),L.A4.min,0.03),'A · VO− (4 Vpp)',`≈ ${L.A4.min.toFixed(2)} V`);
    [['f36a','A',4,0.5,false,'Fig. 3.6a'],['f36b','A',4,0.5,true,'Fig. 3.6b'],['f37a','B',15,2,false,'Fig. 3.7a'],['f37b','B',15,2,true,'Fig. 3.7b']].forEach(([id,k,a,vd,xy,t])=>{const [ok,w]=capOK(id,k,a,vd,xy);g.proc(k);g.add(ok,t,w)});
    g.proc('B');g.add(G.near(v('b_vop'),L.B15.max,0.05),'B · VO+ (15 Vpp)',`≈ ${L.B15.max.toFixed(2)} V`);g.add(G.near(v('b_vom'),L.B15.min,0.05),'B · VO− (15 Vpp)',`≈ ${L.B15.min.toFixed(2)} V`);
    g.proc('A');g.add(G.s('q1')==='a','PLQ 1','no diode conducts at ±0.25 V');g.add(G.s('q2')==='a','PLQ 2 circuit','D1 ON, VO+ = VD1');g.add(G.near(v('q2v'),v('a_vop'),0.06),'PLQ 2 VD1','≈ your VO+');
    g.add(G.s('q3')==='a','PLQ 3 circuit','VO− = −(VD2 + VD3)');g.add(G.near(v('q3v'),Math.abs(v('a_vom'))/2,0.06),'PLQ 3 VD','≈ |VO−| / 2');
    g.proc('B');g.add(G.s('q4')==='a','PLQ 4','±2 V < VZ + VD');g.add(G.s('q5')==='a','PLQ 5 circuit','VO+ = VZ1 + VD2');g.add(G.near(v('q5z')+v('q5d'),v('b_vop'),0.08)&&v('q5z')>4.5&&v('q5z')<5.3,'PLQ 5 VZ + VD','VZ ≈ 4.8–5 V, VD ≈ 0.65 V, sum ≈ your VO+');
    g.add(G.s('q6')==='a','PLQ 6 circuit','VO− = −(VD1 + VZ2)');
    g.show($('result'))});
  /* "do it for me" helpers (Batch 7 item 3): the scope's SCALE / time base / Measure menu and the generator's knob */
  const SC=()=>RT.S.sc,GN=()=>RT.S.gen,eq=(a,b)=>Math.abs(a-b)<1e-9;
  const vdTo=(c,t)=>async A=>{for(let i=0;i<24;i++){const vd=SC().ch[c].vd;if(eq(vd,t))return;await A.press(`s:V${c+1}${vd<t?'+':'-'}`)}};
  const cycTo=async A=>{for(let i=0;i<30;i++){const c=10*SC().td*GN().freq;if(c>=1&&c<=10)return;await A.press(c<1?'s:H+':'s:H-')}};
  /* Measure → Add Measurement → Source 1 = CH2, then a V/I item, each by the VARIABLE knob and Select */
  const VI=['Pk-Pk','Max','Min'];
  const measMenu=async A=>{const s=SC();if(s.menu!=='measure')await A.press('s:Measure');if(SC().side!=='add')await A.press('s:B0')};
  const src2=async A=>{await measMenu(A);if(SC().msrc===1)return;await A.press('s:S3');await A.until('s:VAR+',()=>!!SC().list&&SC().list.idx===1,8);await A.press('s:SEL')};
  const addMeas=type=>async A=>{await src2(A);const i=VI.indexOf(type);await A.press('s:S0');await A.until('s:VAR+',()=>!!SC().list&&SC().list.idx===i,20);await A.press('s:SEL')};
  const hasM=t=>SC().meas.some(m=>m.src===1&&m.type===t);
  /* the generator knob on the amplitude: F2 (Ampl) selects it, ◄ ► pick the digit, the knob turns it */
  const ampTo=t=>async A=>{if(GN().sel!=='a')await A.press('g:F2');for(let i=0;i<200;i++){const g=GN(),d=t-g.amp;if(Math.abs(d)<0.0005)return;
      const w=Math.max(-3,Math.min(0,Math.floor(Math.log10(Math.abs(d))+1e-9)));if(g.dig.a!==w){await A.tap(g.dig.a<w?'g:CL':'g:CR',60);continue}await A.tap(d>0?'g:KN+':'g:KN-',90)}};
  const keys=ks=>async A=>{for(const k of ks)await A.press('g:'+k)};
  const xyOn=async A=>{if(SC().menu!=='acquire')await A.press('s:Acquire');if(SC().side!=='xy')await A.press('s:B1');await A.press('s:S1')};
  const ytOn=async A=>{if(SC().menu!=='acquire')await A.press('s:Acquire');if(SC().side!=='xy')await A.press('s:B1');await A.press('s:S0')};
  const centre=async A=>{if(SC().ch[0].pos!==0)await A.press('s:P1Pc');if(SC().ch[1].pos!==0)await A.press('s:P2Pc')};
  /* a screen recorded into its figure box (Manual: Capture; Exam: the same as the sheet's own capture button) */
  const scr=(id,t)=>({k:'rec',dev:'scope',t,ok:()=>!!CAPS[id],rec:[{scope:id,label:'Fig. '+id.replace(/f3(\d)(\w)/,'3.$1$2')}],do:async A=>{A.capture();CAPS[id]=status()}});
  return {status,
    steps:[
      /* Procedure A (manual pp. 23–24), steps 1–20; every step split into its sub-steps (Batch 7 item 3) */
      {dev:'board',build:'3.4a',t:'Procedure A · 1. ركّب الدائرة Fig. 3.4a.',subs:[
        {k:'build',fig:'3.4a',t:'ركّب الدائرة <bdi dir="ltr">Fig. 3.4a</bdi>: R = 1 kΩ و D1، D2، D3 = 1N4001.'}]},
      {dev:'board',t:'2. استخدم coaxial cable عشان توصّل مدخل الدائرة بمخرج channel one (CH1) في الـ waveform generator.',subs:[
        {k:'connect',fig:'3.4a-gen',t:'وصّل coaxial cable من CH1 OUT في الجنريتر: الأحمر على v<sub>I</sub> والأسود على الأرضي.'}]},
      {dev:'gen',t:'3. شغّل الجنريتر. خلّ نوع الإشارة sinusoidal، والتردد 200 Hz، والسعة 500 mV<sub>p-p</sub>.',subs:[
        {k:'set',dev:'gen',t:'شغّل الجنريتر (زر POWER).',ok:()=>GN().pwr,do:A=>A.press('g:PWR'),hint:'زر POWER تحت يسار الجنريتر'},
        {k:'set',dev:'gen',t:'اختر الموجة sine (زر ∿).',ok:()=>GN().pwr&&GN().wave==='Sine',do:A=>A.press('g:Sine'),hint:'زر الـ sine في صف أزرار الموجات تحت'},
        {k:'set',dev:'gen',t:'التردد 200 Hz: اضغط F1 (Freq)، اكتب الرقم، واضغط F3 (Hz).',ok:()=>GN().pwr&&eq(GN().freq,200),do:keys(['F1','2','0','0','F3']),hint:'F1 ← الأرقام من الـ keypad ← F3 = Hz'},
        {k:'set',dev:'gen',t:'السعة 500 mV<sub>p-p</sub>: اضغط F2 (Ampl)، اكتب الرقم، واضغط F1 (mVpp).',ok:s=>s.a(0.5),do:keys(['F2','5','0','0','F1']),hint:'F2 ← الأرقام من الـ keypad ← F1 = mVpp'},
        {k:'set',dev:'gen',t:'تأكد إن الـ Offset = 0 mV: اضغط F3 (Offset)، اكتب 0 mV، واضغط F2 (mV).',ok:s=>s.gen&&s.sine&&s.a(0.5),do:keys(['F3','0','F2']),hint:'F3 ← صفر من الـ keypad ← F2 = mV'}]},
      {dev:'gen',t:'4. اضغط مفتاح CH1 في الجنريتر عشان تشغّله.',subs:[
        {k:'set',dev:'gen',t:'اضغط مفتاح CH1 (يولّع أحمر).',ok:s=>s.gen&&s.out&&s.sine,do:async A=>{if(!GN().out)await A.press('g:CH1')},hint:'مفتاح CH1 جنب مخارج الـ BNC'}]},
      {dev:'board',t:'5. بـ coaxial cable وصّل مدخل الدائرة بـ CH1 في الإسكوب، وبكيبل ثاني وصّل مخرج الدائرة بـ CH2. الأسود (ground) للكيبلين على الـ reference node (الأرضي).',subs:[
        {k:'connect',fig:'3.4a-ch1',t:'وصّل CH1 على v<sub>I</sub>: الأحمر على مدخل الدائرة والأسود على الأرضي.'},
        {k:'connect',fig:'3.4a-sc',t:'وصّل CH2 على v<sub>O</sub>: الأحمر على مخرج الدائرة والأسود على الأرضي.'}]},
      {dev:'scope',t:'6. شغّل الإسكوب، اضغط Default وبعدها Autoset.',subs:[
        {k:'set',dev:'scope',t:'شغّل الإسكوب (زر POWER).',ok:()=>SC().pwr,do:A=>A.press('s:PWR')},
        {k:'set',dev:'scope',t:'اضغط Default.',ok:()=>!!ST.def,do:A=>A.press('s:Default'),hint:'زر Default فوق يمين الإسكوب'},
        {k:'set',dev:'scope',t:'اضغط Autoset.',ok:s=>s.pwr&&!!ST.auto,do:A=>A.press('s:Autoset'),hint:'زر Autoset فوق يمين الإسكوب، بعد Default'}]},
      {dev:'scope',t:'7. لو CH2 مو شغّال، اضغط مفتاح CH2 عشان تشغّله.',subs:[
        {k:'set',dev:'scope',t:'شغّل CH2 (زر CH2).',ok:s=>s.ch2&&!!ST.auto,do:async A=>{if(!SC().ch[1].on)await A.press('s:CH2')}}]},
      {dev:'scope',t:'8. اضغط على مقابض POSITION للقناتين عشان صفر الـ input والـ output يكون على خط الوسط.',subs:[
        {k:'set',dev:'scope',t:'اضغط مقبض POSITION للـ CH1.',ok:s=>s.ch2&&SC().ch[0].pos===0,do:A=>A.press('s:P1Pc')},
        {k:'set',dev:'scope',t:'اضغط مقبض POSITION للـ CH2.',ok:s=>s.ch2&&s.pos0,do:A=>A.press('s:P2Pc')}]},
      {dev:'scope',t:'9. بمقابض SCALE للـ CH1 و CH2 خلّ كل قناة 200 mV/div.',subs:[
        {k:'set',dev:'scope',t:'SCALE للـ CH1 على 200 mV/div.',ok:s=>eq(SC().ch[0].vd,0.2)&&s.pos0,do:vdTo(0,0.2),hint:'لف SCALE العمودي للـ CH1 لين 200 mV/div'},
        {k:'set',dev:'scope',t:'SCALE للـ CH2 على 200 mV/div.',ok:s=>s.vd(0.2)&&s.pos0,do:vdTo(1,0.2),hint:'لف SCALE العمودي للـ CH2 لين 200 mV/div'}]},
      {dev:'scope',t:'10. عشان يطلع عدد مناسب من الدورات، اضبط الـ time/div بمقبض SCALE في الـ Horizontal Controls.',subs:[
        {k:'set',dev:'scope',t:'لف SCALE الأفقي لين يطلع على الشاشة من دورة إلى 10 دورات.',ok:s=>s.vd(0.2)&&s.cyc,do:cycTo,hint:'التردد 200 Hz: الدورة 5 ms، فخلّ الـ time/div بين 500 µs/div و 5 ms/div'}]},
      {dev:'scope',t:'11. Measure ← Add Measurement ← Source 1: بالـ VARIABLE اختر CH2 ← Select ← V/I: بالـ VARIABLE اختر Max ← Select ← Min ← Select. وبعدها Menu OFF مرتين.',subs:[
        {k:'set',dev:'scope',t:'Measure ← Add Measurement ← Source 1: بالـ VARIABLE اختر CH2 ← Select.',ok:()=>SC().pwr&&SC().msrc===1||hasM('Max')&&hasM('Min'),do:src2,hint:'Measure ← Add Measurement (أول زر تحت) ← Source 1 (الزر الرابع يمين) ← لف VARIABLE لين CH2 ← Select'},
        {k:'set',dev:'scope',t:'V/I: بالـ VARIABLE اختر Max ← Select.',ok:()=>hasM('Max'),do:addMeas('Max'),hint:'V/I (أول زر يمين) ← لف VARIABLE لين Max ← Select'},
        {k:'set',dev:'scope',t:'بالـ VARIABLE اختر Min ← Select.',ok:s=>s.meas,do:addMeas('Min'),hint:'لف VARIABLE لين Min ← Select'},
        {k:'set',dev:'scope',t:'اضغط Menu OFF مرتين.',ok:s=>s.meas&&!SC().list&&!SC().side,do:A=>A.until('s:MOFF',()=>!SC().list&&!SC().side,3),hint:'زر Menu OFF تحت يمين الشاشة'}]},
      {dev:'gen',t:'12. بمقبض الجنريتر ارفع سعة الإشارة شوي شوي لين توصل 1.5 V<sub>p-p</sub>.',subs:[
        {k:'set',dev:'gen',t:'اضغط F2 (Ampl) عشان المقبض يتحكم في السعة.',ok:()=>GN().sel==='a',do:A=>A.press('g:F2')},
        {k:'set',dev:'gen',t:'لف المقبض لين السعة 1.5 V<sub>p-p</sub> (◄ ► تغيّر الخانة).',ok:s=>s.meas&&s.a(1.5)&&s.out,do:ampTo(1.5),hint:'◄ ► عشان الخانة تصير خانة الـ 0.1 V، ولف المقبض يمين'}]},
      {dev:'scope',t:'13. سجّل الـ Max للـ output، يعني الـ upper limiting level V<sub>O+</sub>.',subs:[
        {k:'rec',dev:'scope',t:'سجّل CH2 Max = V<sub>O+</sub>.',ok:s=>s.kind==='A'&&s.meas&&s.a(1.5)&&s.out,rec:[{to:'a_vop',...meas('mx','V<sub>O+</sub>',s=>s.kind==='A'&&s.a(1.5))}]}]},
      {dev:'gen',t:'14. بمقبض الجنريتر ارفع السعة شوي شوي لين توصل 4 V<sub>p-p</sub>.',subs:[
        {k:'set',dev:'gen',t:'لف المقبض لين السعة 4 V<sub>p-p</sub>.',ok:()=>!!ST.a4,do:ampTo(4),hint:'F2 (Ampl)، ◄ ► لخانة الـ 1 V، ولف المقبض يمين'}]},
      {dev:'scope',t:'15. بمقابض SCALE خلّ القناتين CH1 و CH2 على 500 mV/div.',subs:[
        {k:'set',dev:'scope',t:'SCALE للـ CH1 على 500 mV/div.',ok:()=>!!ST.a4&&eq(SC().ch[0].vd,0.5),do:vdTo(0,0.5),hint:'لف SCALE العمودي للـ CH1 لين 500 mV/div'},
        {k:'set',dev:'scope',t:'SCALE للـ CH2 على 500 mV/div.',ok:()=>!!ST.v500,do:vdTo(1,0.5),hint:'لف SCALE العمودي للـ CH2 لين 500 mV/div'}]},
      {dev:'scope',t:'16. سجّل الـ Min للـ output، يعني الـ lower limiting level V<sub>O−</sub>.',subs:[
        {k:'rec',dev:'scope',t:'سجّل CH2 Min = V<sub>O−</sub>.',ok:()=>!!ST.v500,rec:[{to:'a_vom',...meas('mn','V<sub>O−</sub>',s=>s.kind==='A'&&s.a(4))}]}]},
      {dev:'scope',t:'17. سجّل v<sub>I</sub>(t) و v<sub>O</sub>(t) على Fig. 3.6a.',subs:[scr('f36a','صوّر الشاشة في <bdi dir="ltr">Fig. 3.6a</bdi>.')]},
      {dev:'scope',t:'18. عشان تطلع الـ voltage transfer characteristic حط الإسكوب على XY mode.',subs:[
        {k:'set',dev:'scope',t:'اضغط Acquire ← اختر XY من القائمة اللي تحت ← Triggered XY من القائمة اليمين.',ok:s=>s.kind==='A'&&s.xy,do:xyOn,hint:'Acquire ← XY (الزر الثاني تحت) ← Triggered XY (الزر الثاني يمين)'},
        {k:'set',dev:'scope',t:'اضغط على POSITION للـ CH1 و CH2 عشان الـ characteristic يتمركز عند (0, 0).',ok:()=>!!ST.xyA,do:centre,hint:'اضغط مقبض POSITION لكل قناة'}]},
      {dev:'scope',t:'19. سجّل الـ VTC اللي على الشاشة على Fig. 3.6b.',subs:[scr('f36b','صوّر الـ VTC في <bdi dir="ltr">Fig. 3.6b</bdi>.')]},
      {dev:'scope',t:'20. طفّ الـ XY mode: اختر OFF (YT) من القائمة اليمين.',subs:[
        {k:'set',dev:'scope',t:'اختر OFF (YT) من القائمة اليمين.',ok:()=>!!ST.ytA,do:ytOn,hint:'Acquire ← XY ← OFF (YT) (أول زر يمين)'}]},
      /* Procedure B (manual p. 25), steps 1–12 */
      {dev:'gen',t:'Procedure B · 1. طفّ الـ waveform generator.',subs:[
        {k:'set',dev:'gen',t:'طفّ مخرج الجنريتر (مفتاح CH1).',ok:()=>!!ST.genOffB,do:async A=>{if(GN().out)await A.press('g:CH1')}}]},
      {dev:'board',build:'3.4b',t:'2. ركّب الدائرة Fig. 3.4b.',subs:[
        {k:'build',fig:'3.4b',t:'ركّب الدائرة <bdi dir="ltr">Fig. 3.4b</bdi>: الـ Zener D1 و D2 = 1N4733A (الأنودين مع بعض) مكان الدايودات.'}]},
      {dev:'scope',t:'3. بمقابض SCALE خلّ CH1 و CH2 كل وحدة 2 V/div.',subs:[
        {k:'set',dev:'scope',t:'SCALE للـ CH1 على 2 V/div.',ok:s=>s.kind==='B'&&eq(SC().ch[0].vd,2),do:vdTo(0,2),hint:'لف SCALE العمودي للـ CH1 لين 2 V/div'},
        {k:'set',dev:'scope',t:'SCALE للـ CH2 على 2 V/div.',ok:s=>s.kind==='B'&&s.vd(2),do:vdTo(1,2),hint:'لف SCALE العمودي للـ CH2 لين 2 V/div'}]},
      {dev:'gen',t:'4. شغّل الـ waveform generator.',subs:[
        {k:'set',dev:'gen',t:'شغّل مخرج الجنريتر (مفتاح CH1).',ok:s=>s.kind==='B'&&s.out,do:async A=>{if(!GN().pwr)await A.press('g:PWR');if(!GN().out)await A.press('g:CH1')}}]},
      {dev:'gen',t:'5. ارفع سعة الـ input شوي شوي لين توصل 15 V<sub>p-p</sub>.',subs:[
        {k:'set',dev:'gen',t:'لف المقبض لين السعة 15 V<sub>p-p</sub>.',ok:s=>s.kind==='B'&&s.out&&s.a(15),do:ampTo(15),hint:'F2 (Ampl)، ◄ ► لخانة الـ 1 V، ولف المقبض يمين'}]},
      {dev:'scope',t:'6. سجّل v<sub>I</sub>(t) و v<sub>O</sub>(t) على Fig. 3.7a.',subs:[scr('f37a','صوّر الشاشة في <bdi dir="ltr">Fig. 3.7a</bdi>.')]},
      {dev:'scope',t:'7. سجّل الـ Max للـ output، يعني الـ upper limiting level V<sub>O+</sub>.',subs:[
        {k:'rec',dev:'scope',t:'سجّل CH2 Max = V<sub>O+</sub>.',ok:s=>s.kind==='B'&&s.meas&&s.a(15)&&s.out,rec:[{to:'b_vop',...meas('mx','V<sub>O+</sub>',s=>s.kind==='B'&&s.a(15))}]}]},
      {dev:'scope',t:'8. سجّل الـ Min للـ output، يعني الـ lower limiting level V<sub>O−</sub>.',subs:[
        {k:'rec',dev:'scope',t:'سجّل CH2 Min = V<sub>O−</sub>.',ok:s=>s.kind==='B'&&s.meas&&s.a(15)&&s.out,rec:[{to:'b_vom',...meas('mn','V<sub>O−</sub>',s=>s.kind==='B'&&s.a(15))}]}]},
      {dev:'scope',t:'9. كرّر خطوة 18 من Procedure A عشان تطلع الـ voltage transfer characteristic لهذي الدائرة.',subs:[
        {k:'set',dev:'scope',t:'اضغط Acquire ← XY ← Triggered XY.',ok:s=>s.kind==='B'&&s.xy,do:xyOn,hint:'Acquire ← XY (الزر الثاني تحت) ← Triggered XY (الزر الثاني يمين)'},
        {k:'set',dev:'scope',t:'اضغط على POSITION للـ CH1 و CH2 عشان الـ characteristic يتمركز عند (0, 0).',ok:s=>!!ST.xyB&&s.pos0,do:centre,hint:'اضغط مقبض POSITION لكل قناة'}]},
      {dev:'scope',t:'10. سجّل الـ VTC اللي على الشاشة على Fig. 3.7b.',subs:[scr('f37b','صوّر الـ VTC في <bdi dir="ltr">Fig. 3.7b</bdi>.')]},
      {dev:'scope',t:'11. طفّ الـ XY mode: اختر OFF (YT) من القائمة اليمين.',subs:[
        {k:'set',dev:'scope',t:'اختر OFF (YT) من القائمة اليمين.',ok:()=>!!ST.ytB,do:ytOn,hint:'Acquire ← XY ← OFF (YT) (أول زر يمين)'}]},
      {dev:'gen',t:'12. طفّ الـ waveform generator، وبعدها طفّ الإسكوب. فكّ الدائرة ورجّع كل القطع والكيبلات مكانها.',subs:[
        {k:'set',dev:'gen',t:'طفّ الجنريتر (زر POWER).',ok:()=>!!ST.ytB&&!GN().pwr,do:async A=>{if(GN().pwr)await A.press('g:PWR')}},
        {k:'set',dev:'scope',t:'طفّ الإسكوب (زر POWER).',ok:()=>!!ST.endB,do:async A=>{if(SC().pwr)await A.press('s:PWR')}}]}
    ],
    onReset(){ST={};['f36a','f36b','f37a','f37b'].forEach(id=>{$(id).textContent=id.replace(/f3(\d)(\w)/,'Fig. 3.$1$2');delete CAPS[id]});$('result').innerHTML=''}};
}};})();
