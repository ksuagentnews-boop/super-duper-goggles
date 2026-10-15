/* EE205 · Experiment 5 · Three Phase AC Circuits (manual pp. 32–40).
   Steps follow the manual: Procedure I 1–5 (Fig. 7), Procedure II 1–5 (Fig. 8), Procedure III 1–3 (Fig. 9). The three
   figures are defined once (def.figs) in one layout that looks like the figures: the transformer's lines on the left column
   (A top, B middle, C bottom), each line running right through its ammeter / wattmeter to its load terminal (a top row,
   b middle row, c bottom row), the star point n down the right-hand column, the rheostats from a, b, c to n; the meters'
   leads come from above. Build steps tick when the bench IS the figure (engine/match.js), whatever nodes are used;
   readings follow the matched nets, the rheostats are set from their own leads (topology, no node numbers).
   Instruments: the red three-phase transformer (Y, 24 V phase), the rheostats, five Fluke 77 (M1–M3 ammeters in lines
   A, B, C; M4 = VL and M5 = VP and the ohmmeter, either may take either place) in Procedure I; the PX 120 and M1 (IA) in
   Procedures II and III. The instructor checks before power («المشرف يتأكد من التوصيل», Manual / Exam only).
   Decisions: one PX 120 (the list says two wattmeters; the second belongs to the two-wattmeter method of the background,
   which no procedure uses). Procedure III's title says "single wattmeter": the PX 120's 3Φ (balanced three-wire) key,
   modelled with the current coil in line A and the voltage coil across A–B (engine/px120.js); the scanned Fig. 9 draws the
   voltage leads down to lines B and C and the current coil's com on the transformer side — read here as the PX 120's
   documented 3Φ connection (current + from A, voltage + on A, com on B). Fig. 8's voltage + is on line A (both + drawn at
   L1). Fig. 9 has no ammeter and no neutral wire, as drawn. A rheostat may be wired either way round (red / slider). */
EXP_DEFS['ee205/exp5']=(()=>{const H=ENGINE.sheet;
const fig=(f,cap,w=420)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const tr=(l,id,u,st='0.001')=>`<tr><td class="l">${l}</td><td>${H.num(id,st,80)} ${u}</td></tr>`;
const sheet=`<div class="paper" id="paper">
<h2>Experiment 5 · Three-Phase AC Circuits</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القراءات من الـ Fluke (rms) والـ PX 120. عبّي واضغط "صحّح إجاباتي".</p>
<h3>Procedure I</h3>${fig('e5-fig7.png','Fig. 7: Three-phase balanced load')}
<table class="tbl"><caption>Procedure I · Three phase loading</caption>${tr('R<sub>an</sub> (DMM)','ra','Ω','0.1')}${tr('R<sub>bn</sub> (DMM)','rb','Ω','0.1')}${tr('R<sub>cn</sub> (DMM)','rc','Ω','0.1')}
${tr('I<sub>A</sub>','ia','mA','0.1')}${tr('I<sub>B</sub>','ib','mA','0.1')}${tr('I<sub>C</sub>','ic','mA','0.1')}${tr('V<sub>L</sub>','vl','V','0.01')}${tr('V<sub>P</sub>','vp','V','0.01')}${tr('V<sub>L</sub> / V<sub>P</sub>','ratio','','0.001')}</table>
<h3>Procedure II</h3>${fig('e5-fig8.png','Fig. 8: Measuring three-phase power using a single wattmeter')}
<table class="tbl"><caption>Procedure II · Single wattmeter in phase A</caption>${tr('P<sub>A</sub> (wattmeter)','pa','W','0.01')}${tr('P<sub>T</sub> = 3 P<sub>A</sub>','pt','W','0.01')}${tr('I<sub>A</sub>','ia2','mA','0.1')}${tr('P<sub>T</sub> = 3 I<sub>A</sub>² R<sub>A</sub>','pt2','W','0.01')}</table>
<h3>Procedure III</h3>${fig('e5-fig9.png','Fig. 9: Measuring the three-phase power using a single wattmeter (3Φ key)')}
<table class="tbl"><caption>Procedure III · Three-phase total power</caption>${tr('P<sub>T</sub> (3Φ key)','p3','W','0.01')}${tr('Difference from Procedure II (P<sub>T</sub> = 3 P<sub>A</sub>)','pdiff','%','0.1')}</table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
/* reference layout: A 0 (Fig. 7) / 7 (Figs. 8, 9) · a 1–2–3–4 · B 14 · b 15–16–17 · C 28 · c 29–30–31–32 · n 10–11–18–25 (+ 21–24 for the
   transformer's n in Fig. 8) · Fig. 8: X (between the wattmeter and M1) 0 */
const RH=(i,x,n)=>[{lead:`r${i}a`,alt:`r${i}b`,at:x},{lead:`r${i}b`,alt:`r${i}a`,at:n}];
const LOAD=[{wire:[1,2]},{wire:[2,3]},{wire:[3,4]},{wire:[15,16]},{wire:[16,17]},{wire:[29,30]},{wire:[30,31]},{wire:[31,32]},{wire:[10,11]},{wire:[11,18]},{wire:[18,25]},
  ...RH(1,4,11),...RH(2,17,18),...RH(3,32,25)];
const figs={
  '7':{img:'labs/ee205/fig/e5-fig7.png',cap:'Fig. 7 · Three-phase balanced load',lines:[{lead:'x3a',at:0},{lead:'x3b',at:14},{lead:'x3c',at:28},...LOAD,
    {lead:'h1ma',at:0},{lead:'h1c',at:1},{lead:'h2ma',at:14},{lead:'h2c',at:15},{lead:'h3ma',at:28},{lead:'h3c',at:29},
    {lead:'h4v',alt:'h5v',at:0},{lead:'h4c',alt:'h5c',at:14},{lead:'h5v',alt:'h4v',at:3},{lead:'h5c',alt:'h4c',at:10}]},
  /* Procedure I step 2: Fig. 7 with M5 moved across b–n / c–n to set R_bn / R_cn («قِس لي») */
  '7b':{img:'labs/ee205/fig/e5-fig7.png',cap:'Fig. 7 · M5 across b–n',lines:[{lead:'x3a',at:0},{lead:'x3b',at:14},{lead:'x3c',at:28},...LOAD,
    {lead:'h1ma',at:0},{lead:'h1c',at:1},{lead:'h2ma',at:14},{lead:'h2c',at:15},{lead:'h3ma',at:28},{lead:'h3c',at:29},
    {lead:'h4v',at:0},{lead:'h4c',at:14},{lead:'h5v',at:17},{lead:'h5c',at:18}]},
  '7c':{img:'labs/ee205/fig/e5-fig7.png',cap:'Fig. 7 · M5 across c–n',lines:[{lead:'x3a',at:0},{lead:'x3b',at:14},{lead:'x3c',at:28},...LOAD,
    {lead:'h1ma',at:0},{lead:'h1c',at:1},{lead:'h2ma',at:14},{lead:'h2c',at:15},{lead:'h3ma',at:28},{lead:'h3c',at:29},
    {lead:'h4v',at:0},{lead:'h4c',at:14},{lead:'h5v',at:32},{lead:'h5c',at:25}]},
  '8':{img:'labs/ee205/fig/e5-fig8.png',cap:'Fig. 8 · Measuring three-phase power using a single wattmeter',lines:[{lead:'x3a',at:7},{lead:'x3n',at:21},{wire:[21,22]},{wire:[22,23]},{wire:[23,24]},{wire:[24,25]},
    {lead:'x3b',at:15},{lead:'x3c',at:29},...LOAD,{lead:'w1i',at:7},{lead:'w1ic',at:0},{lead:'h1ma',at:0},{lead:'h1c',at:1},{lead:'w1v',at:7},{lead:'w1vc',at:10}]},
  '9':{img:'labs/ee205/fig/e5-fig9.png',cap:'Fig. 9 · Measuring the three-phase power using a single wattmeter',lines:[{lead:'x3a',at:7},{lead:'x3b',at:15},{lead:'x3c',at:29},...LOAD,
    {lead:'w1i',at:7},{lead:'w1ic',at:1},{lead:'w1v',at:7},{lead:'w1vc',at:15}]}};
return {figs,procs:[{id:'I',title:'Three phase loading (Fig. 7)'},{id:'II',title:'Single wattmeter in phase A (Fig. 8)'},{id:'III',title:'Total power with the 3Φ key (Fig. 9)'}],
sheet,params:()=>({}),
instruments:[
  {type:'xf3'},{type:'rheo',prev:d=>{d.r=[150,85,120]}},
  {type:'hdmm',model:'fluke77',n:1},{type:'hdmm',model:'fluke77',n:2,procs:['I']},{type:'hdmm',model:'fluke77',n:3,procs:['I']},{type:'hdmm',model:'fluke77',n:4,procs:['I'],prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:5,procs:['I'],prev:d=>{d.pos=4}},
  {type:'px120',n:1,procs:['II','III']}],
parts:{BR:{t:'BR',lab:''}},
tray:[['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  const X=k=>RT.leadNet('x3'+k);
  const curFig=()=>{try{return BENCH.figFor(BENCH.cur())}catch(e){return null}};
  RT.instructor=()=>{const L=['a','b','c','n'].map(X);if(L[0]==null||L[1]==null||L[2]==null)return {ok:false,msg:'وصّل خطوط المحوّل A و B و C للدائرة'};
    const nets=L.filter(x=>x!=null);if(new Set(nets).size<nets.length)return {ok:false,msg:'فيه طرفين من المحوّل على نفس الـ node: short circuit!'};
    const cur=[];RT.meters().forEach(m=>{if(m.D.jack==='A')cur.push([m.hi,m.lo])});const a=RT.leadNet('w1i'),b=RT.leadNet('w1ic');if(a!=null&&b!=null)cur.push([a,b]);
    if(cur.some(([p,q])=>nets.includes(p)&&nets.includes(q)))return {ok:false,msg:'أميتر أو ملف تيار الواطميتر بين خطين من المحوّل! لازم على التوالي مع الحمل'};
    if(RT.inst.rh.value(0)<20||RT.inst.rh.value(1)<20||RT.inst.rh.value(2)<20)return {ok:false,msg:'المقاومات صغيرة مرّة، اضبطها على 100 Ω أول'};
    const f=curFig();if(f&&!RT.match(f).ok){const h=RT.hint(f);return {ok:false,msg:h?h.msg:'التوصيل مختلف عن الشكل'}}return {ok:true}};
  /* rheostat i between its own two leads' nets (the red end and the slider) */
  const rh=i=>[RT.leadNet(`r${i}a`),RT.leadNet(`r${i}b`)];
  const amm=(a,b)=>K.amm(a,b,'ACI');
  function status(){const st={};const on=RT.S.x3.pwr&&RT.S.x3.ok;st.on=on;const r=[0,1,2].map(i=>RT.inst.rh.value(i));st.r=r;
    st.set100=r.every(v=>Math.abs(v-100)<=0.5);
    /* Procedure I step 2: each rheostat measured on Ω across its own terminals, the transformer off */
    if(!RT.S.x3.pwr)[['ra',1],['rb',2],['rc',3]].forEach(([k,i])=>{const [p,q]=rh(i);const v=K.across('OHM',p,q,true);if(v!=null&&Math.abs(r[i-1]-100)<=0.5)ST[k]=v});
    const M7=RT.match('7'),M8=RT.match('8'),M9=RT.match('9');st.fig7=M7.ok;st.fig8=M8.ok;st.fig9=M9.ok;
    if(M7.ok&&on&&st.set100){const n=M7.net;const ia=amm(n(0),n(1)),ib=amm(n(14),n(15)),ic=amm(n(28),n(29));if(ia!=null&&ib!=null&&ic!=null)Object.assign(ST,{ia,ib,ic});
      const vl=K.across('ACV',n(0),n(14),true),vp=K.across('ACV',n(3),n(10),true);if(vl!=null&&vp!=null)Object.assign(ST,{vl,vp})}
    const pw=RT.inst.pw1.reading();st.pw=pw;
    if(M8.ok&&on&&st.set100&&pw.pwr&&!pw.tri){const ia=amm(M8.net(0),M8.net(1));if(ia!=null){ST.pa=pw.P;ST.ia2=ia}}
    if(M9.ok&&on&&st.set100&&pw.pwr&&pw.tri)ST.p3=pw.P;
    st.off=!RT.S.x3.pwr;st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const near=(k,sc,tol,t,u)=>g.add(ST[k]!=null&&G.near(v(k),ST[k]*sc,tol),t,ST[k]!=null?`${(ST[k]*sc).toFixed(2)} ${u}`:'measure it');
    g.proc('I');['ra','rb','rc'].forEach(k=>near(k,1,0.15,k.toUpperCase()+'n','Ω'));near('ia',1e3,0.15,'IA','mA');near('ib',1e3,0.15,'IB','mA');near('ic',1e3,0.15,'IC','mA');near('vl',1,0.015,'VL','V');near('vp',1,0.015,'VP','V');
    g.add(G.near(v('ratio'),v('vl')/v('vp'),0.003)&&G.near(v('ratio'),Math.sqrt(3),0.03),'VL / VP','≈ √3 = 1.732');
    g.proc('II');g.add(ST.pa!=null&&G.near(v('pa'),ST.pa,Math.abs(ST.pa)*0.01+0.01),'PA',ST.pa!=null?`${ST.pa.toFixed(2)} W`:'read the PX 120');g.add(G.near(v('pt'),3*v('pa'),0.03),'PT = 3 PA');
    near('ia2',1e3,0.15,'IA','mA');g.add(G.near(v('pt2'),3*Math.pow(v('ia2')/1e3,2)*100,0.05)||G.near(v('pt2'),3*Math.pow(v('ia2')/1e3,2)*v('ra'),0.05),'PT = 3 IA² RA');
    g.proc('III');g.add(ST.p3!=null&&G.near(v('p3'),ST.p3,Math.abs(ST.p3)*0.01+0.01),'PT (3Φ key)',ST.p3!=null?`${ST.p3.toFixed(2)} W`:'press 3Φ on the PX 120');g.add(G.near(v('pdiff'),(v('p3')-v('pt'))/v('pt')*100,0.2),'difference %');
    g.show($('result'))});
  /* the instructor check (Batch 7 item 3): its button shows in the card from the sub-step that asks for it (chk:true) on,
     within the same procedure — not while the procedure's circuit is still being built */
  const LKx=(RT.locks||[]).find(l=>l.key==='x3');
  if(LKx){const real=LKx.isOk;LKx.isOk=()=>real()||!atChk()}
  function atChk(){try{const S=BENCH.sim.steps,i=BENCH.cur(),s=S[i];if(!s)return false;const SS=BENCH.subState(s);
      if(SS.L.slice(0,SS.cur+1).some(x=>x.chk))return true;for(let j=i-1;j>=0&&S[j].proc===s.proc;j--)if((S[j].subs||[]).some(x=>x.chk))return true;return false}catch(e){return false}}
  /* "do it for me" helpers: a Fluke's rotary switch to its position, a rheostat's slider to 100 Ω (10 Ω then 1 Ω steps),
     the meter on Ω across rheostat i, the transformer switched off / on */
  const sw=async(A,n,pos)=>{const k='hm'+n,d=RT.S[k];if(!d||d.pos===pos)return;await A.until('h'+n+':SW'+(d.pos<pos?'+':'-'),()=>RT.S[k].pos===pos,8)};
  const setRh=async(A,i)=>{const r=()=>RT.S.rh.r[i-1];for(let q=0;q<40&&Math.abs(r()-100)>=10;q++)await A.tap('r:T'+i+(r()<100?'+':'-'),70);
    if(r()!==100)await A.until('r:S'+i+(r()<100?'+':'-'),()=>r()===100,12)};
  const ohm=i=>{const [p,q]=rh(i);if(p==null||q==null||p===q)return null;return RT.meters().find(m=>m.D.pwr&&m.D.fn==='OHM'&&m.D.jack==='HI'&&(m.hi===p&&m.lo===q||m.hi===q&&m.lo===p))||null};
  const xOff=async A=>{if(RT.S.x3.pwr)await A.press('x:PWR')};
  const ohmOk=i=>()=>!RT.S.x3.pwr&&!!ohm(i);
  const chkT='اطلب من المشرف يتأكد من التوصيل: اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة.';
  const chkS=()=>({k:'set',chk:true,dev:'x3',t:chkT,ok:()=>!!RT.S.x3.ok,do:A=>A.press('x:CHK'),hint:'بعد ما تكمّل الشكل اضغط «المشرف يتأكد من التوصيل»؛ إذا رفض، اقرا سببه وصلّحه'});
  const pwrS=f=>({k:'set',dev:'x3',t:'شغّل المحوّل (POWER).',ok:s=>s['fig'+f]&&s.on,do:A=>A.press('x:PWR'),hint:'مفتاح POWER (الـ rocker) فوق يسار المحوّل'});
  return {status,
    steps:[
      /* Procedure I (manual p. 38–39), steps 1–5; every step split into its sub-steps (Batch 7 item 3) */
      {dev:'board',build:'7',t:'Procedure I · 1. وصّل الدائرة مثل Fig. 7.',subs:[{k:'build',fig:'7',t:'وصّل الدائرة <bdi dir="ltr">Fig. 7</bdi>.'}]},
      {dev:'rh',t:'2. اضبط R<sub>an</sub> = R<sub>bn</sub> = R<sub>cn</sub> = 100 Ω باستخدام الـ digital meter.',subs:[
        {k:'measure',dev:'hm5',t:'المحوّل طافي: حط M5 على Ω بين a و n.',ok:ohmOk(1),do:async A=>{await xOff(A);if(!ohm(1)){const M=RT.match('7');if(!M.ok)await A.build('7')}await sw(A,5,4)},hint:'طفّ المحوّل، ولف مفتاح M5 على Ω وأطرافه بين a و n'},
        {k:'set',dev:'rh',t:'حرّك الـ slider حق R1 لين M5 يقرا R<sub>an</sub> = 100.0 Ω.',ok:()=>ST.ra!=null,do:A=>setRh(A,1),hint:()=>`R1 الحين ${RT.S.rh.r[0]} Ω: حرّك الـ slider لين 100 Ω`},
        {k:'measure',dev:'hm5',t:'انقل أطراف M5 بين b و n.',ok:ohmOk(2),do:async A=>{await xOff(A);if(!ohm(2))await A.build('7b');await sw(A,5,4)},hint:'الطرف الأحمر على b والأسود على n، و M5 على Ω'},
        {k:'set',dev:'rh',t:'حرّك الـ slider حق R2 لين R<sub>bn</sub> = 100.0 Ω.',ok:()=>ST.rb!=null,do:A=>setRh(A,2),hint:()=>`R2 الحين ${RT.S.rh.r[1]} Ω: حرّك الـ slider لين 100 Ω`},
        {k:'measure',dev:'hm5',t:'انقل أطراف M5 بين c و n.',ok:ohmOk(3),do:async A=>{await xOff(A);if(!ohm(3))await A.build('7c');await sw(A,5,4)},hint:'الطرف الأحمر على c والأسود على n، و M5 على Ω'},
        {k:'set',dev:'rh',t:'حرّك الـ slider حق R3 لين R<sub>cn</sub> = 100.0 Ω.',ok:()=>ST.rc!=null,do:A=>setRh(A,3),hint:()=>`R3 الحين ${RT.S.rh.r[2]} Ω: حرّك الـ slider لين 100 Ω`},
        {k:'connect',fig:'7',t:'رجّع M5 بين a و n مثل <bdi dir="ltr">Fig. 7</bdi>.',do:A=>A.build('7')},
        {k:'rec',t:'سجّل R<sub>an</sub> و R<sub>bn</sub> و R<sub>cn</sub>.',ok:()=>ST.ra!=null&&ST.rb!=null&&ST.rc!=null,rec:[{to:'ra',val:()=>ST.ra,unit:'Ω',dec:1,label:'R<sub>an</sub>'},{to:'rb',val:()=>ST.rb,unit:'Ω',dec:1,label:'R<sub>bn</sub>'},{to:'rc',val:()=>ST.rc,unit:'Ω',dec:1,label:'R<sub>cn</sub>'}]}]},
      {dev:'x3',t:'3. شغّل الـ supply.',subs:[chkS(),pwrS('7')]},
      {dev:'hm1',t:'4. راقب قراءات الأميترات الثلاثة وسجّلها.',subs:[
        {k:'measure',dev:'hm1',t:'حط M1 و M2 و M3 على A~.',ok:()=>ST.ia!=null,do:async A=>{for(const n of [1,2,3])await sw(A,n,7)},hint:'لف مفاتيح M1 و M2 و M3 لين A~'},
        {k:'rec',t:'سجّل I<sub>A</sub> و I<sub>B</sub> و I<sub>C</sub>.',ok:()=>ST.ia!=null,rec:[{to:'ia',val:()=>ST.ia!=null?ST.ia*1e3:null,unit:'mA',dec:1,label:'I<sub>A</sub>'},{to:'ib',val:()=>ST.ib!=null?ST.ib*1e3:null,unit:'mA',dec:1,label:'I<sub>B</sub>'},{to:'ic',val:()=>ST.ic!=null?ST.ic*1e3:null,unit:'mA',dec:1,label:'I<sub>C</sub>'}]}]},
      {dev:'hm4',t:'5. سجّل قراءات الـ voltmeters.',subs:[
        {k:'measure',dev:'hm4',t:'حط M4 (V<sub>L</sub>) و M5 (V<sub>P</sub>) على V~.',ok:()=>ST.vl!=null,do:async A=>{await sw(A,4,1);await sw(A,5,1)},hint:'لف مفتاحي M4 و M5 لين V~'},
        {k:'rec',t:'سجّل V<sub>L</sub> و V<sub>P</sub>.',ok:()=>ST.vl!=null,rec:[{to:'vl',val:()=>ST.vl,unit:'V',dec:2,label:'V<sub>L</sub>'},{to:'vp',val:()=>ST.vp,unit:'V',dec:2,label:'V<sub>P</sub>'}]}]},
      /* Procedure II (manual pp. 39–40), steps 1–5 */
      {dev:'board',build:'8',t:'Procedure II · 1. وصّل الدائرة مثل Fig. 8، بدون ما تغيّر قيم المقاومات اللي ضبطتها للحمل المتزن.',subs:[
        {k:'build',fig:'8',t:'وصّل الدائرة <bdi dir="ltr">Fig. 8</bdi> (المقاومات باقية على 100 Ω).',ok:s=>s.set100,hint:s=>s.set100?null:'رجّع المقاومات الثلاث على 100 Ω'}]},
      {dev:'x3',t:'2. شغّل الـ supply.',subs:[chkS(),pwrS('8')]},
      {dev:'pw1',t:'3. خذ قراءة القدرة في phase A.',subs:[
        {k:'set',dev:'pw1',t:'شغّل الـ PX 120 على 1Φ (زر POWER، والـ 3Φ مطفي).',ok:s=>!!s.pw.pwr&&!s.pw.tri,do:async A=>{if(!RT.S.pw1.pwr)await A.press('w1:PWR');if(RT.S.pw1.tri)await A.press('w1:TRI')},hint:'زر POWER في الـ PX 120، والـ 3Φ مو مضغوط'},
        {k:'measure',dev:'hm1',t:'حط M1 على A~.',ok:()=>ST.pa!=null,do:A=>sw(A,1,7),hint:'لف مفتاح M1 لين A~'},
        {k:'rec',t:'سجّل P<sub>A</sub> و I<sub>A</sub>.',ok:()=>ST.pa!=null,rec:[{to:'pa',val:()=>ST.pa,unit:'W',dec:2,label:'P<sub>A</sub>'},{to:'ia2',val:()=>ST.ia2!=null?ST.ia2*1e3:null,unit:'mA',dec:1,label:'I<sub>A</sub>'}]}]},
      {dev:'pw1',t:'4. احسب القدرة الكلية: اضرب القدرة في phase A في 3.',subs:[{k:'set',t:'احسب في الـ sheet: P<sub>T</sub> = 3 P<sub>A</sub>.',ok:()=>ST.pa!=null}]},
      {dev:'pw1',t:'5. قارن القدرة الكلية اللي طلعت مع اللي تطلع من P<sub>T</sub> = 3 I<sub>A</sub>² R<sub>A</sub>.',subs:[{k:'set',t:'احسب في الـ sheet: P<sub>T</sub> = 3 I<sub>A</sub>² R<sub>A</sub> وقارنها.',ok:()=>ST.pa!=null}]},
      /* Procedure III (manual p. 40), steps 1–3 */
      {dev:'board',build:'9',t:'Procedure III · 1. وصّل الواطميتر عشان يقيس القدرة في دائرة التجربة السابقة مثل Fig. 9.',subs:[
        {k:'build',fig:'9',t:'وصّل الدائرة <bdi dir="ltr">Fig. 9</bdi> (المقاومات باقية على 100 Ω).',ok:s=>s.set100,hint:s=>s.set100?null:'رجّع المقاومات الثلاث على 100 Ω'}]},
      {dev:'pw1',t:'2. خذ قراءة القدرة الكلية للثلاث phases بالضغط على الزر الخاص (3Φ) في الواطميتر.',subs:[chkS(),pwrS('9'),
        {k:'set',dev:'pw1',t:'شغّل الـ PX 120 واضغط 3Φ.',ok:()=>ST.p3!=null,do:async A=>{if(!RT.S.pw1.pwr)await A.press('w1:PWR');if(!RT.S.pw1.tri)await A.press('w1:TRI')},hint:'زر 3Φ في الـ PX 120'},
        {k:'rec',t:'سجّل P<sub>T</sub> (3Φ).',ok:()=>ST.p3!=null,rec:[{to:'p3',val:()=>ST.p3,unit:'W',dec:2,label:'P<sub>T</sub> (3Φ)'}]}]},
      {dev:'pw1',t:'3. قارن هذي القدرة الكلية باللي طلعت بطريقة الواطميتر الواحد فوق.',subs:[{k:'set',t:'احسب في الـ sheet الفرق بين P<sub>T</sub> (3Φ) و P<sub>T</sub> = 3 P<sub>A</sub> بالـ %.',ok:()=>ST.p3!=null}]}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
