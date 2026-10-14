/* EE205 · Experiment 5 · Three Phase AC Circuits (manual pp. 32–40).
   Procedure I: Fig. 7, balanced Y load of three rheostats, Ran = Rbn = Rcn = 100 Ω set with the digital meter, three ac
   ammeters in the lines, VL (L1–L2) and VP (a–n) → readings.
   Procedure II: Fig. 8, one wattmeter in phase A (voltage coil from line A to the neutral n, the transformer's n joined to
   the load's n) → PA, PT = 3 PA vs 3 IA² RA.
   Procedure III: Fig. 9, the wattmeter's voltage coil across lines A and B, its three-phase key → the total power.
   Instruments: the red three-phase transformer (Y, 24 V phase), the rheostats, five Fluke 77 (M1–M3 ammeters in lines
   A, B, C; M4 = VL, M5 = VP and the ohmmeter), one Metrix PX 120. The instructor checks before power.
   Decisions: one PX 120 (the list says two wattmeters; the second belongs to the two-wattmeter method of the background,
   which no procedure uses). Procedure III's title says "single wattmeter": the PX 120's 3Φ (balanced three-wire) key. */
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
return {procs:[{id:'I',title:'Three phase loading (Fig. 7)'},{id:'II',title:'Single wattmeter in phase A (Fig. 8)'},{id:'III',title:'Total power with the 3Φ key (Fig. 9)'}],
sheet,params:()=>({}),
instruments:[
  {type:'xf3'},{type:'rheo',prev:d=>{d.r=[150,85,120]}},
  {type:'hdmm',model:'fluke77',n:1},{type:'hdmm',model:'fluke77',n:2},{type:'hdmm',model:'fluke77',n:3},{type:'hdmm',model:'fluke77',n:4,prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:5,prev:d=>{d.pos=4}},
  {type:'px120',n:1}],
parts:{BR:{t:'BR',lab:''}},
tray:[['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
  /* nodes: transformer A → 0, B → 14, C → 28, n → 20; load a = 4, b = 18, c = 32, load neutral n = 20 */
  const X=k=>RT.leadNet('x3'+k);
  RT.instructor=()=>{const L=['a','b','c','n'].map(X);if(L[0]==null||L[1]==null||L[2]==null)return {ok:false,msg:'وصّل خطوط المحوّل A و B و C للدائرة'};
    const nets=L.filter(x=>x!=null);if(new Set(nets).size<nets.length)return {ok:false,msg:'فيه طرفين من المحوّل على نفس الـ node: short circuit!'};
    const cur=[];RT.meters().forEach(m=>{if(m.D.jack==='A')cur.push([m.hi,m.lo])});const a=RT.leadNet('w1i'),b=RT.leadNet('w1ic');if(a!=null&&b!=null)cur.push([a,b]);
    if(cur.some(([p,q])=>nets.includes(p)&&nets.includes(q)))return {ok:false,msg:'أميتر أو ملف تيار الواطميتر بين خطين من المحوّل! لازم على التوالي مع الحمل'};
    if(RT.inst.rh.value(0)<20||RT.inst.rh.value(1)<20||RT.inst.rh.value(2)<20)return {ok:false,msg:'المقاومات صغيرة مرّة، اضبطها على 100 Ω أول'};return {ok:true}};
  const rh=i=>[RT.leadNet(`r${i}a`),RT.leadNet(`r${i}b`)];
  const star=()=>{const n=N(20);return [[1,4],[2,18],[3,32]].every(([i,x])=>{const [p,q]=rh(i);return (p===N(x)&&q===n)||(q===N(x)&&p===n)})};
  const amm=(a,b)=>K.amm(a,b,'ACI');
  function status(){const st={};const on=RT.S.x3.pwr&&RT.S.x3.ok;st.on=on;const r=[0,1,2].map(i=>RT.inst.rh.value(i));st.r=r;
    st.star=star();st.set100=r.every(v=>Math.abs(v-100)<=0.5);
    if(st.star&&!RT.S.x3.pwr){[['ra',4],['rb',18],['rc',32]].forEach(([k,x],i)=>{const v=K.across('OHM',N(x),N(20),true);if(v!=null&&Math.abs(r[i]-100)<=0.5)ST[k]=v})}
    const lines=X('a')===N(0)&&X('b')===N(14)&&X('c')===N(28);st.lines=lines;
    /* an ammeter in a line, from its leads (its rotary may still be off) */
    const ser=(m,a,b)=>RT.leadNet(`h${m}ma`)===N(a)&&RT.leadNet(`h${m}c`)===N(b)&&N(a)!==N(b);
    const sA=ser(1,0,4)||(RT.leadNet('w1i')===N(0)&&RT.leadNet('w1ic')===N(2)&&ser(1,2,4));
    st.fig7=st.star&&lines&&sA&&ser(2,14,18)&&ser(3,28,32)&&X('n')==null;
    if(st.fig7&&on&&st.set100){const ia=amm(N(0),N(4)),ib=amm(N(14),N(18)),ic=amm(N(28),N(32)),vl=K.across('ACV',N(0),N(14),true),vp=K.across('ACV',N(4),N(20),true);
      if(ia!=null&&ib!=null&&ic!=null&&vl!=null&&vp!=null)Object.assign(ST,{ia,ib,ic,vl,vp})}
    /* Fig. 8: A → wattmeter current (0 → 2) → M1 (2 → 4); voltage coil 2 → n; transformer n on the load n */
    const pw=RT.inst.pw1.reading();st.pw=pw;
    const wI=RT.leadNet('w1i')===N(0)&&RT.leadNet('w1ic')===N(2);
    st.fig8=st.star&&lines&&wI&&ser(1,2,4)&&X('n')===N(20)&&RT.leadNet('w1v')===N(2)&&RT.leadNet('w1vc')===N(20);
    if(st.fig8&&on&&st.set100&&pw.pwr&&!pw.tri){const ia=amm(N(2),N(4));if(ia!=null){ST.pa=pw.P;ST.ia2=ia}}
    /* Fig. 9: no neutral wire, voltage coil across A and B, the 3Φ key */
    st.fig9=st.star&&lines&&wI&&X('n')==null&&RT.leadNet('w1v')===N(2)&&RT.leadNet('w1vc')===N(14);
    if(st.fig9&&on&&st.set100&&pw.pwr&&pw.tri)ST.p3=pw.P;
    st.off=!RT.S.x3.pwr;st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const near=(k,sc,tol,t,u)=>g.add(ST[k]!=null&&G.near(v(k),ST[k]*sc,tol),t,ST[k]!=null?`${(ST[k]*sc).toFixed(2)} ${u}`:'measure it');
    g.proc('I');['ra','rb','rc'].forEach(k=>near(k,1,0.15,k.toUpperCase()+'n','Ω'));near('ia',1e3,0.15,'IA','mA');near('ib',1e3,0.15,'IB','mA');near('ic',1e3,0.15,'IC','mA');near('vl',1,0.015,'VL','V');near('vp',1,0.015,'VP','V');
    g.add(G.near(v('ratio'),v('vl')/v('vp'),0.003)&&G.near(v('ratio'),Math.sqrt(3),0.03),'VL / VP','≈ √3 = 1.732');
    g.proc('II');g.add(ST.pa!=null&&G.near(v('pa'),ST.pa,Math.abs(ST.pa)*0.01+0.01),'PA',ST.pa!=null?`${ST.pa.toFixed(2)} W`:'read the PX 120');g.add(G.near(v('pt'),3*v('pa'),0.03),'PT = 3 PA');
    near('ia2',1e3,0.15,'IA','mA');g.add(G.near(v('pt2'),3*Math.pow(v('ia2')/1e3,2)*100,0.05)||G.near(v('pt2'),3*Math.pow(v('ia2')/1e3,2)*v('ra'),0.05),'PT = 3 IA² RA');
    g.proc('III');g.add(ST.p3!=null&&G.near(v('p3'),ST.p3,Math.abs(ST.p3)*0.01+0.01),'PT (3Φ key)',ST.p3!=null?`${ST.p3.toFixed(2)} W`:'press 3Φ on the PX 120');g.add(G.near(v('pdiff'),(v('p3')-v('pt'))/v('pt')*100,0.2),'difference %');
    g.show($('result'))});
  const F7='labs/ee205/fig/e5-fig7.png',F8='labs/ee205/fig/e5-fig8.png',F9='labs/ee205/fig/e5-fig9.png';
  return {status,
    steps:[
      {dev:'board',fig:F7,figCap:'Fig. 7',t:'Procedure I: ركّب الحمل Y: الثلاث مقاومات المتغيرة من a (node 4)، b (node 18)، c (node 32) للنقطة المشتركة n (node 20).',
        lines:[{t:'R1 red → node 4 (a)',lead:'r1a',at:4},{t:'R1 black → node 20 (n)',lead:'r1b',at:20},{t:'R2 red → node 18 (b)',lead:'r2a',at:18},{t:'R2 black → node 20',lead:'r2b',at:20},{t:'R3 red → node 32 (c)',lead:'r3a',at:32},{t:'R3 black → node 20',lead:'r3b',at:20}],ok:s=>s.star},
      {dev:'rh',t:'2. اضبط R<sub>an</sub> = R<sub>bn</sub> = R<sub>cn</sub> = 100 Ω بالـ DMM: M5 على Ω بين كل طرف (a، b، c) و n، وحرّك الـ slider لين يقرا 100.0 Ω.',lines:[{t:'M5 VΩ → node 4 (a)',lead:'h5v',at:4},{t:'M5 COM → node 20 (n)',lead:'h5c',at:20}],ok:s=>ST.ra!=null&&ST.rb!=null&&ST.rc!=null},
      {dev:'board',fig:F7,figCap:'Fig. 7',t:'1. كمّل Fig. 7: خطوط المحوّل A (node 0)، B (node 14)، C (node 28)، وفي كل خط أميتر على التوالي (M1، M2، M3 على المدخل 300mA). V<sub>L</sub> (M4) بين A و B، و V<sub>P</sub> (M5) بين a و n.',
        lines:[{t:'3φ a (L1) → node 0',lead:'x3a',at:0},{t:'3φ b (L2) → node 14',lead:'x3b',at:14},{t:'3φ c (L3) → node 28',lead:'x3c',at:28},
          {t:'M1 300mA → node 0',lead:'h1ma',at:0},{t:'M1 COM → node 4 (a)',lead:'h1c',at:4},{t:'M2 300mA → node 14',lead:'h2ma',at:14},{t:'M2 COM → node 18 (b)',lead:'h2c',at:18},{t:'M3 300mA → node 28',lead:'h3ma',at:28},{t:'M3 COM → node 32 (c)',lead:'h3c',at:32},
          {t:'M4 VΩ → node 0',lead:'h4v',at:0},{t:'M4 COM → node 14',lead:'h4c',at:14}],ok:s=>s.fig7},
      {dev:'x3',t:'3. ⚠ اضغط «المشرف يتأكد» على المحوّل، وبعدين شغّل الـ supply. M1–M3 على A~، و M4 و M5 على V~.',ok:s=>s.fig7&&s.on},
      {dev:'board',t:'4–5. سجّل قراءات الأميترات الثلاثة و V<sub>L</sub> و V<sub>P</sub> (M5: VΩ → node 4، COM → node 20).',ok:s=>ST.ia!=null},
      {dev:'x3',fig:F8,figCap:'Fig. 8',t:'Procedure II: طفّ المحوّل. حط ملف التيار للـ PX 120 في الخط A (10A → node 0، COM → node 2) و M1 بعده (300mA → node 2، COM → node 4)، وملف الجهد من node 2 للـ n (node 20)، ووصّل n المحوّل بـ node 20.',
        lines:[{t:'W 10A → node 0',lead:'w1i',at:0},{t:'W COM (A) → node 2',lead:'w1ic',at:2},{t:'M1 300mA → node 2',lead:'h1ma',at:2},{t:'W 600V → node 2',lead:'w1v',at:2},{t:'W COM (V) → node 20 (n)',lead:'w1vc',at:20},{t:'3φ n → node 20',lead:'x3n',at:20}],ok:s=>s.fig8},
      {dev:'pw1',t:'2–3. المشرف يتأكد، شغّل المحوّل والـ PX 120، وسجّل P<sub>A</sub> و I<sub>A</sub>. احسب P<sub>T</sub> = 3P<sub>A</sub> و 3I<sub>A</sub>²R<sub>A</sub>.',ok:s=>ST.pa!=null},
      {dev:'x3',fig:F9,figCap:'Fig. 9',t:'Procedure III: طفّ المحوّل، شيل سلك الـ n (3φ n)، وانقل COM ملف الجهد للخط B (node 14).',lines:[{t:'W COM (V) → node 14 (B)',lead:'w1vc',at:14}],ok:s=>s.fig9},
      {dev:'pw1',t:'2–3. المشرف يتأكد وشغّل، واضغط زر 3Φ على الـ PX 120: هذي القدرة الكلية. قارنها بـ Procedure II.',ok:s=>ST.p3!=null},
      {dev:'x3',t:'طفّ المحوّل.',ok:s=>s.off&&ST.p3!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
