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
  const chk='اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة (Get the connection checked by the instructor).';
  return {status,
    steps:[
      /* Procedure I (manual p. 38–39), steps 1–5 */
      {dev:'board',build:'7',t:'Procedure I · 1. وصّل الدائرة مثل Fig. 7.'},
      {dev:'rh',t:'2. اضبط R<sub>an</sub> = R<sub>bn</sub> = R<sub>cn</sub> = 100 Ω باستخدام الـ digital meter.',
        acts:['حط M5 على Ω بين a و n، وحرّك الـ slider لين يقرا 100.0 Ω.','نفس الشي بين b و n، وبين c و n.','رجّع M5 بين a و n مثل Fig. 7.'],ok:s=>ST.ra!=null&&ST.rb!=null&&ST.rc!=null,
        rec:[{to:'ra',val:()=>ST.ra,unit:'Ω',dec:1,label:'R<sub>an</sub>'},{to:'rb',val:()=>ST.rb,unit:'Ω',dec:1,label:'R<sub>bn</sub>'},{to:'rc',val:()=>ST.rc,unit:'Ω',dec:1,label:'R<sub>cn</sub>'}]},
      {dev:'x3',t:'3. شغّل الـ supply.',acts:[chk,'شغّل المحوّل (POWER).'],ok:s=>s.fig7&&s.on},
      {dev:'hm1',t:'4. راقب قراءات الأميترات الثلاثة وسجّلها.',acts:['حط M1 و M2 و M3 على A~.'],ok:s=>ST.ia!=null,
        rec:[{to:'ia',val:()=>ST.ia!=null?ST.ia*1e3:null,unit:'mA',dec:1,label:'I<sub>A</sub>'},{to:'ib',val:()=>ST.ib!=null?ST.ib*1e3:null,unit:'mA',dec:1,label:'I<sub>B</sub>'},{to:'ic',val:()=>ST.ic!=null?ST.ic*1e3:null,unit:'mA',dec:1,label:'I<sub>C</sub>'}]},
      {dev:'hm4',t:'5. سجّل قراءات الـ voltmeters.',acts:['حط M4 (V<sub>L</sub>) و M5 (V<sub>P</sub>) على V~.'],ok:s=>ST.vl!=null,
        rec:[{to:'vl',val:()=>ST.vl,unit:'V',dec:2,label:'V<sub>L</sub>'},{to:'vp',val:()=>ST.vp,unit:'V',dec:2,label:'V<sub>P</sub>'}]},
      /* Procedure II (manual pp. 39–40), steps 1–5 */
      {dev:'board',build:'8',t:'Procedure II · 1. وصّل الدائرة مثل Fig. 8، بدون ما تغيّر قيم المقاومات اللي ضبطتها للحمل المتزن.',ok:s=>s.set100},
      {dev:'x3',t:'2. شغّل الـ supply.',acts:[chk,'شغّل المحوّل (POWER).'],ok:s=>s.fig8&&s.on},
      {dev:'pw1',t:'3. خذ قراءة القدرة في phase A.',acts:['شغّل الـ PX 120 (1Φ)، وحط M1 على A~.'],ok:s=>ST.pa!=null,
        rec:[{to:'pa',val:()=>ST.pa,unit:'W',dec:2,label:'P<sub>A</sub>'},{to:'ia2',val:()=>ST.ia2!=null?ST.ia2*1e3:null,unit:'mA',dec:1,label:'I<sub>A</sub>'}]},
      {dev:'pw1',t:'4. احسب القدرة الكلية: اضرب القدرة في phase A في 3.',ok:s=>ST.pa!=null},
      {dev:'pw1',t:'5. قارن القدرة الكلية اللي طلعت مع اللي تطلع من P<sub>T</sub> = 3 I<sub>A</sub>² R<sub>A</sub>.',ok:s=>ST.pa!=null},
      /* Procedure III (manual p. 40), steps 1–3 */
      {dev:'board',build:'9',t:'Procedure III · 1. وصّل الواطميتر عشان يقيس القدرة في دائرة التجربة السابقة مثل Fig. 9.',ok:s=>s.set100},
      {dev:'pw1',t:'2. خذ قراءة القدرة الكلية للثلاث phases بالضغط على الزر الخاص (3Φ) في الواطميتر.',acts:[chk,'شغّل المحوّل (POWER).','اضغط 3Φ على الـ PX 120.'],ok:s=>ST.p3!=null,
        rec:[{to:'p3',val:()=>ST.p3,unit:'W',dec:2,label:'P<sub>T</sub> (3Φ)'}]},
      {dev:'pw1',t:'3. قارن هذي القدرة الكلية باللي طلعت بطريقة الواطميتر الواحد فوق.',ok:s=>ST.p3!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
