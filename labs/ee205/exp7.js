/* EE205 · Experiment 7 · Magnetically Coupled Circuits (manual pp. 53–63). Steps follow the manual's procedure, one per numbered step.
   Procedure I: Rdc of each coil, R = 1.15 Rdc; coil 1 (1000 turns) on the variable 60 Hz supply at 2 Vrms → V, I → Z, X, L1;
   the same for coil 2 (500 turns) → L2 (Fig. 7).
   Procedure II: coil 1 driven at 2 Vrms, V1, I1 and V2 on coil 2 → XM = V2 / I1, M = XM / ω (Fig. 8).
   Procedure III: coil 2's B joined to the bottom of coil 1, VT across the two tops (Fig. 9) → the dot at A or at B.
   Procedure IV: series aiding (Fig. 10) and opposing at 2 Vrms → Xeq1, Xeq2, M12 = (Xeq1 − Xeq2)/4ω, k = M12/√(L1L2).
   Instruments: the variable ac supply (60 Hz, instructor check before power: «المشرف يتأكد من التوصيل», Manual / Exam only),
   four Fluke 77 (M1 V1, M2 V2, M3 VT, M4 ammeter).
   Figures in the lab's rectangle layout: the supply on the left (8 / 22), M1 across it, the ammeter M4 along the top (8 → 9),
   the U-core at node 10 (coil 1 = 10–17 down the middle, coil 2 = A 11 – B 18 on the right; Fig. 7b: U-core at node 17,
   coil 2 down the right side), returns along the bottom row.
   Assumptions: the U-core and its coils go on the board in step I.1 (the manual measures Rdc there); a separate instructor
   check step follows the first Fig. 7 build (each later power-on asks for the check from the step card); Fig. 7b = Fig. 7
   with coil 2 on the source (step I.7 "Repeat for coil 2"); Fig. 9 has no ammeter (as drawn); Fig. 10b = the opposing
   connection of step IV.4.
   Decisions: the two coils on the U-core with its yoke: coil 1 Rdc = 17.6 Ω, L1 = 1.715 H; coil 2 Rdc = 5.2 Ω, L2 = 0.429 H;
   M = 0.781 H (k = 0.91). These reproduce the lab video at 5 V (I1 7.76 mA, V2 2.285 V, VT = V1 + V2 = 7.5 V → the dot
   at B) and its R2 = 5.2 Ω. The manual lists two ammeters and three voltmeters; one ammeter is enough for every step, so the
   table has four meters (the table photo shows three). */
EXP_DEFS['ee205/exp7']=(()=>{const H=ENGINE.sheet;
const W=2*Math.PI*60,RD1=17.6,RD2=5.2,L1=1.715,L2=0.429,M=0.781;
const PARTS={UC:{t:'X',lab:'coils on U-core',pkg:'UCORE',n1:'1000 Wdg',n2:'500 Wdg',
    pins:[{dx:0,dy:0,h:4,role:'P1',n:'1'},{dx:0,dy:1,h:4,role:'P2',n:'2'},{dx:1,dy:0,h:4,role:'A',n:'A'},{dx:1,dy:1,h:4,role:'B',n:'B'}],
    /* coil 1 = 1 → 2 (dot on 1), coil 2 = B → A (dot on B), each with its winding resistance */
    stamp(els,R,inner){const m1=inner(),m2=inner(),j1=inner(),j2=inner();els.push({t:'G',a:R.P1,b:m1,g:1/RD1},{t:'G',a:R.B,b:m2,g:1/RD2},{t:'MC',a:m1,b:R.P2,c:m2,d:R.A,l1:L1,l2:L2,m:M,j1,j2})}},
  BR:{t:'BR',lab:''}};
const fig=(f,cap,w=420)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const tr=(l,id,u,st='0.001')=>`<tr><td class="l">${l}</td><td>${H.num(id,st,80)} ${u}</td></tr>`;
const sheet=`<div class="paper" id="paper">
<h2>Experiment 7 · Magnetically Coupled Circuits</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القراءات rms من الـ Fluke عند 2 V<sub>rms</sub> و 60 Hz (ω = 377 rad/s). عبّي القيم واضغط "صحّح إجاباتي".</p>
<h3>Procedure I</h3>${fig('e7-fig7.png','Fig. 7: Measuring the self inductance of a coil')}
<table class="tbl"><caption>Procedure I · Self inductance</caption>
${tr('R<sub>dc</sub> of coil 1','rdc1','Ω','0.1')}${tr('R<sub>1</sub> = 1.15 R<sub>dc</sub>','r1','Ω','0.01')}${tr('Coil 1: V','va','V')}${tr('Coil 1: I','ia','mA','0.01')}${tr('Z<sub>1</sub> = V/I','z1','Ω','0.1')}${tr('X<sub>1</sub> = √(Z<sub>1</sub>² − R<sub>1</sub>²)','x1','Ω','0.1')}${tr('L<sub>1</sub> = X<sub>1</sub>/ω','l1','H')}
${tr('R<sub>dc</sub> of coil 2','rdc2','Ω','0.1')}${tr('R<sub>2</sub> = 1.15 R<sub>dc</sub>','r2','Ω','0.01')}${tr('Coil 2: V','vb','V')}${tr('Coil 2: I','ib','mA','0.01')}${tr('Z<sub>2</sub>','z2','Ω','0.1')}${tr('X<sub>2</sub>','x2','Ω','0.1')}${tr('L<sub>2</sub>','l2','H')}</table>
<h3>Procedure II</h3>${fig('e7-fig8.png','Fig. 8: Determination of the mutual inductance')}
<table class="tbl"><caption>Procedure II · Mutual inductance</caption>${tr('V<sub>1</sub>','v1m','V')}${tr('I<sub>1</sub>','i1m','mA','0.01')}${tr('V<sub>2</sub>','v2m','V')}${tr('X<sub>M</sub> = V<sub>2</sub>/I<sub>1</sub>','xm','Ω','0.1')}${tr('M = X<sub>M</sub>/ω','mm','H')}</table>
<h3>Procedure III</h3>${fig('e7-fig9.png','Fig. 9: Determination of the polarity')}
<table class="tbl"><caption>Procedure III · Polarity</caption>${tr('V<sub>1</sub>','v1p','V')}${tr('V<sub>2</sub>','v2p','V')}${tr('V<sub>T</sub>','vtp','V')}
<tr><td class="l">The dot of coil 2 is at</td><td>${H.sel('dot',[['A','A (VT = V1 − V2)'],['B','B (VT = V1 + V2)']])}</td></tr></table>
<h3>Procedure IV</h3>${fig('e7-fig10.png','Fig. 10: Series-connected magnetically-coupled coils (adding)')}
<table class="tbl"><caption>Procedure IV · Series aiding and opposing</caption>${tr('Aiding: V','vad','V')}${tr('Aiding: I','iad','mA','0.01')}${tr('X<sub>eq1</sub> = √((V/I)² − (R<sub>1</sub> + R<sub>2</sub>)²)','xe1','Ω','0.1')}
${tr('Opposing: V','vop','V')}${tr('Opposing: I','iop','mA','0.01')}${tr('X<sub>eq2</sub>','xe2','Ω','0.1')}${tr('M<sub>12</sub> = (X<sub>eq1</sub> − X<sub>eq2</sub>)/4ω','m12','H')}${tr('k = M<sub>12</sub>/√(L<sub>1</sub>L<sub>2</sub>)','kk','')}</table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
/* the figures' reference wiring (rectangle layout; U-core pins: P1 = 1 (dot), P2 = 2, A, B (dot)) */
const SRC=[{lead:'acL',at:8},{lead:'acN',at:22},{lead:'h1v',at:8},{lead:'h1c',at:22}],AMM=[{lead:'h4ma',at:8},{lead:'h4c',at:9}],UCX={ic:'UC',pins:{P1:10,A:11,P2:17,B:18}};
const BOT=[{wire:[17,24]},{wire:[24,23]},{wire:[23,22]}],F='labs/ee205/fig/';
const figs={
  '7':{img:F+'e7-fig7.png',cap:'Fig. 7 · coil 1 on the 60 Hz source (A in series, V across the source)',lines:[UCX,...SRC,...AMM,{wire:[9,10]},...BOT]},
  '7b':{img:F+'e7-fig7.png',cap:'Fig. 7 · repeated for coil 2 (A → B)',lines:[{ic:'UC',pins:{P1:17,A:18,P2:24,B:25}},...SRC,...AMM,{wire:[9,10]},{wire:[10,11]},{wire:[11,18]},{wire:[25,32]},{wire:[32,31]},{wire:[31,30]},{wire:[30,29]},{wire:[29,22]}]},
  '8':{img:F+'e7-fig8.png',cap:'Fig. 8 · V<sub>2</sub> on coil 2',lines:[UCX,...SRC,...AMM,{wire:[9,10]},...BOT,{lead:'h2v',at:11},{lead:'h2c',at:18}]},
  '9':{img:F+'e7-fig9.png',cap:'Fig. 9 · B joined to coil 1, V<sub>T</sub> across 1 and A',lines:[UCX,...SRC,{wire:[8,9]},{wire:[9,10]},...BOT,{wire:[17,18]},{lead:'h2v',at:11},{lead:'h2c',at:18},{lead:'h3v',at:10},{lead:'h3c',at:11}]},
  '10':{img:F+'e7-fig10.png',cap:'Fig. 10 · series aiding (2 joined to B)',lines:[UCX,...SRC,...AMM,{wire:[9,10]},{wire:[17,18]},{wire:[11,12]},{wire:[12,19]},{wire:[19,26]},{wire:[26,25]},{wire:[25,24]},{wire:[24,23]},{wire:[23,22]}]},
  '10b':{img:F+'e7-fig10.png',cap:'Fig. 10 · the coils connected in opposition (2 joined to A)',lines:[UCX,...SRC,...AMM,{wire:[9,10]},{wire:[17,11]},{wire:[18,25]},{wire:[25,24]},{wire:[24,23]},{wire:[23,22]}]}};
return {figs,procs:[{id:'I',title:'Self inductance (Fig. 7)'},{id:'II',title:'Mutual inductance (Fig. 8)'},{id:'III',title:'Polarity (Fig. 9)'},{id:'IV',title:'Series aiding / opposing (Fig. 10)'}],
sheet,params:()=>({}),
instruments:[
  {type:'variac',prev:d=>{d.v=3}},
  {type:'hdmm',model:'fluke77',n:1,prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:2},{type:'hdmm',model:'fluke77',n:3},{type:'hdmm',model:'fluke77',n:4,prev:d=>{d.pos=4}}],
parts:PARTS,
tray:[['UC','2 coils on U-core'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  const uc=()=>RT.S.parts.find(p=>p.type==='UC');
  const pin=r=>{const p=uc();return p?RT.pinNet(p,r):null};
  const src=()=>({L:RT.leadNet('acL'),N:RT.leadNet('acN'),on:RT.S.ac.pwr});
  const acv=(a,b)=>K.across('ACV',a,b,true),aci=(a,b)=>{for(const m of RT.meters()){if(m.D.pwr&&m.D.jack==='A'&&m.D.fn==='ACI'&&((m.hi===a&&m.lo===b)||(m.hi===b&&m.lo===a))){const v=K.shown(m);if(v!=null)return v}}return null};
  /* the series ammeter between the source's live side and a net, or a plain join */
  const fedFrom=(s,net)=>{if(net==null||s.L==null)return {ok:false};if(net===s.L)return {ok:true,i:null};for(const m of RT.meters())if(m.D.jack==='A'&&((m.hi===s.L&&m.lo===net)||(m.lo===s.L&&m.hi===net)))return {ok:true,i:aci(m.hi,m.lo),amm:true};return {ok:false}};
  RT.instructor=()=>{const s=src();if(s.L==null||s.N==null)return {ok:false,msg:'وصّل مخرج الـ variac للدائرة أول'};if(s.L===s.N)return {ok:false,msg:'المخرج مقصور (short circuit)'};
    if(RT.meters().some(m=>m.D.jack==='A'&&((m.hi===s.L&&m.lo===s.N)||(m.hi===s.N&&m.lo===s.L))))return {ok:false,msg:'الأميتر على طرفي المصدر! ركّبه على التوالي'};
    if(!uc())return {ok:false,msg:'ما فيه coils على اللوحة'};return {ok:true}};
  const T={};T.z1=Math.hypot(RD1,W*L1);T.z2=Math.hypot(RD2,W*L2);T.x1=W*L1;T.x2=W*L2;T.xm=W*M;T.xe1=W*(L1+L2+2*M);T.xe2=W*(L1+L2-2*M);T.k=M/Math.sqrt(L1*L2);
  function status(){const st={};const s=src();st.s=s;const P1=pin('P1'),P2=pin('P2'),A=pin('A'),B=pin('B');st.uc=!!uc();
    const v2ok=v=>v!=null&&Math.abs(v-2)<=0.03;
    const Vs=s.L!=null&&s.N!=null?acv(s.L,s.N):null;st.Vs=Vs;st.on=s.on;
    /* Rdc with the supply off */
    if(!s.on&&st.uc){const r1=K.across('OHM',P1,P2,true),r2=K.across('OHM',A,B,true);if(r1!=null)ST.rdc1=r1;if(r2!=null)ST.rdc2=r2}
    /* coil 1 alone on the source (through the ammeter); coil 2 open (or on a voltmeter only) */
    const f1=st.uc&&s.on&&P2===s.N&&fedFrom(s,P1).ok&&![P1,P2].includes(A)&&![P1,P2].includes(B)&&A!==B;st.c1=f1;
    if(f1&&v2ok(Vs)){const f=fedFrom(s,P1);if(f.i!=null&&acv(A,B)==null){ST.va=Vs;ST.ia=f.i}
      const v2=acv(A,B);if(f.i!=null&&v2!=null){ST.v1m=Vs;ST.i1m=f.i;ST.v2m=v2}}
    /* coil 2 alone */
    const f2=st.uc&&s.on&&((B===s.N&&fedFrom(s,A).ok)||(A===s.N&&fedFrom(s,B).ok))&&![A,B].includes(P1)&&![A,B].includes(P2)&&P1!==P2;st.c2=f2;
    if(f2&&v2ok(Vs)){const f=fedFrom(s,B===s.N?A:B);if(f.i!=null){ST.vb=Vs;ST.ib=f.i}}
    /* Fig. 9: coil 1 on the source, B joined to 2, VT across 1 and A */
    st.fig9=st.uc&&s.on&&P2===s.N&&fedFrom(s,P1).ok&&B===P2&&A!==P1&&A!==P2;
    if(st.fig9&&v2ok(Vs)){const v1=acv(P1,P2)!=null?acv(P1,P2):Vs,v2=acv(A,B),vt=acv(P1,A);if(v2!=null&&vt!=null){ST.v1p=v1;ST.v2p=v2;ST.vtp=vt}}
    /* series: 2 joined to B (aiding) or to A (opposing), the source across 1 and the free end */
    const ser=(join,end)=>st.uc&&s.on&&P2===join&&join!==s.N&&end===s.N&&fedFrom(s,P1).ok&&join!==P1;
    st.aid=ser(B,A);st.opp=ser(A,B);
    if(st.aid&&v2ok(Vs)){const i=fedFrom(s,P1).i;if(i!=null){ST.vad=Vs;ST.iad=i}}
    if(st.opp&&v2ok(Vs)){const i=fedFrom(s,P1).i;if(i!=null){ST.vop=Vs;ST.iop=i}}
    st.off=!s.on;st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,s=G.s;const rd=(k,sc=1,u='')=>[ST[k]!=null&&G.near(v(k),ST[k]*sc,Math.abs(ST[k]*sc)*0.003+(sc>1?0.011:0.0011)),ST[k]!=null?`${(ST[k]*sc).toFixed(sc>1?2:3)} ${u}`:'measure it'];
    const add=(k,t,sc,u)=>{const r=rd(k,sc,u);g.add(r[0],t,r[1])};
    g.proc('I');add('rdc1','Rdc coil 1',1,'Ω');g.add(G.near(v('r1'),1.15*v('rdc1'),0.02),'R1 = 1.15 Rdc');add('va','coil 1 V',1,'V');add('ia','coil 1 I',1e3,'mA');
    g.add(G.near(v('z1'),v('va')/v('ia')*1e3,1),'Z1 = V/I',`≈ ${T.z1.toFixed(0)} Ω`);g.add(G.near(v('x1'),Math.sqrt(Math.max(0,v('z1')**2-v('r1')**2)),1),'X1');g.add(G.near(v('l1'),v('x1')/W,0.002)&&G.near(v('l1'),L1,L1*0.03),'L1',`≈ ${L1} H`);
    add('rdc2','Rdc coil 2',1,'Ω');g.add(G.near(v('r2'),1.15*v('rdc2'),0.02),'R2 = 1.15 Rdc');add('vb','coil 2 V',1,'V');add('ib','coil 2 I',1e3,'mA');
    g.add(G.near(v('z2'),v('vb')/v('ib')*1e3,0.5),'Z2 = V/I',`≈ ${T.z2.toFixed(1)} Ω`);g.add(G.near(v('x2'),Math.sqrt(Math.max(0,v('z2')**2-v('r2')**2)),0.5),'X2');g.add(G.near(v('l2'),v('x2')/W,0.002)&&G.near(v('l2'),L2,L2*0.03),'L2',`≈ ${L2} H`);
    g.proc('II');add('v1m','V1',1,'V');add('i1m','I1',1e3,'mA');add('v2m','V2',1,'V');g.add(G.near(v('xm'),v('v2m')/v('i1m')*1e3,1),'XM = V2/I1',`≈ ${T.xm.toFixed(0)} Ω`);g.add(G.near(v('mm'),v('xm')/W,0.002)&&G.near(v('mm'),M,M*0.04),'M',`≈ ${M} H`);
    g.proc('III');add('v1p','V1',1,'V');add('v2p','V2',1,'V');add('vtp','VT',1,'V');g.add(s('dot')==='B','dot','VT = V1 + V2 → the dot is at B');
    g.proc('IV');add('vad','aiding V',1,'V');add('iad','aiding I',1e3,'mA');g.add(G.near(v('xe1'),Math.sqrt(Math.max(0,(v('vad')/v('iad')*1e3)**2-(v('r1')+v('r2'))**2)),3),'Xeq1',`≈ ${T.xe1.toFixed(0)} Ω`);
    add('vop','opposing V',1,'V');add('iop','opposing I',1e3,'mA');g.add(G.near(v('xe2'),Math.sqrt(Math.max(0,(v('vop')/v('iop')*1e3)**2-(v('r1')+v('r2'))**2)),2),'Xeq2',`≈ ${T.xe2.toFixed(0)} Ω`);
    g.add(G.near(v('m12'),(v('xe1')-v('xe2'))/(4*W),0.002)&&G.near(v('m12'),M,M*0.05),'M12',`≈ ${M} H`);g.add(G.near(v('kk'),v('m12')/Math.sqrt(v('l1')*v('l2')),0.01),'k',`≈ ${T.k.toFixed(2)}`);
    g.show($('result'))});
  return {status,
    steps:[
      /* Procedure I (manual pp. 60–61), steps 1–7 */
      {dev:'hm4',t:'Procedure I · 1. قِس المقاومة R<sub>dc</sub> لـ coil 1 بالـ multimeter: هذي الـ dc resistance لـ coil 1.',
        acts:['حط الـ 2 coils على الـ U-core في اللوحة (coil 1 = 1000 turns: 1 و 2، coil 2 = 500 turns: A و B).','الملتيميتر على Ω: VΩ على 1 و COM على 2، والمصدر طافي.'],ok:s=>ST.rdc1!=null,
        rec:[{to:'rdc1',label:'R<sub>dc</sub> coil 1',unit:'Ω',dec:1,val:()=>ST.rdc1}]},
      {dev:'hm4',t:'2. احسب الـ ac resistance لـ coil 1: R<sub>1</sub> = 1.15 R<sub>dc</sub> (زيادة 15 % بسبب الـ skin effect).',ok:s=>ST.rdc1!=null},
      {dev:'hm4',t:'3. بنفس الطريقة طلّع R<sub>2</sub>، الـ ac resistance لـ coil 2 (قِس R<sub>dc</sub> بين A و B).',ok:s=>ST.rdc2!=null,
        rec:[{to:'rdc2',label:'R<sub>dc</sub> coil 2',unit:'Ω',dec:1,val:()=>ST.rdc2}]},
      {dev:'board',build:'7',t:'4. وصّل coil 1 على مصدر جهد متغير 60 Hz مثل Fig. 7 (coil 1: 1000 turns، coil 2: 500 turns).'},
      {dev:'ac',t:'⚠ «Get the connection checked by the instructor»: اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة، وبعدين شغّل الـ POWER.',ok:s=>s.on&&RT.S.ac.ok},
      {dev:'ac',t:'5. اضبط الجهد المطبّق على 2 V<sub>rms</sub>، وخذ قراءة الأميتر والفولتميتر.',acts:['M1 على V~ و M4 على A~.','لفّ الـ variac لين M1 يقرا 2.00 V.'],ok:s=>ST.va!=null,
        rec:[{to:'va',label:'V',unit:'V',dec:3,val:()=>ST.va},{to:'ia',label:'I',unit:'mA',dec:2,val:()=>ST.ia!=null?ST.ia*1e3:null}]},
      {dev:'ac',t:'6. احسب الـ self inductance لـ coil 1: Z<sub>1</sub> = V/I = √(R<sub>1</sub>² + X<sub>1</sub>²)، و X<sub>1</sub> = √(Z<sub>1</sub>² − R<sub>1</sub>²)، و L<sub>1</sub> = X<sub>1</sub>/ω.',ok:s=>ST.va!=null},
      {dev:'board',build:'7b',t:'7. كرّر لـ coil 2 عشان تطلع L<sub>2</sub>.',acts:['طفّ المصدر ووصّل coil 2 (A و B) مكان coil 1 في Fig. 7.','المشرف يتأكد، شغّل، واضبط 2 V<sub>rms</sub>، وسجّل V و I.'],ok:s=>ST.vb!=null,
        rec:[{to:'vb',label:'V',unit:'V',dec:3,val:()=>ST.vb},{to:'ib',label:'I',unit:'mA',dec:2,val:()=>ST.ib!=null?ST.ib*1e3:null}]},
      /* Procedure II (manual p. 62), steps 1–3 */
      {dev:'board',build:'8',t:'Procedure II · 1. وصّل الدائرة Fig. 8، و coil 2 مقترن مغناطيسياً مع coil 1.'},
      {dev:'ac',t:'2. اضبط الجهد المطبّق على 2 V<sub>rms</sub>، وخذ القراءات V<sub>1</sub> و I<sub>1</sub> و V<sub>2</sub>.',acts:['المشرف يتأكد وشغّل الـ POWER.','M2 على V~، واضبط الـ variac لين M1 = 2.00 V.'],ok:s=>ST.v2m!=null,
        rec:[{to:'v1m',label:'V<sub>1</sub>',unit:'V',dec:3,val:()=>ST.v1m},{to:'i1m',label:'I<sub>1</sub>',unit:'mA',dec:2,val:()=>ST.i1m!=null?ST.i1m*1e3:null},{to:'v2m',label:'V<sub>2</sub>',unit:'V',dec:3,val:()=>ST.v2m}]},
      {dev:'ac',t:'3. احسب الـ mutual inductance: X<sub>M</sub> = V<sub>2</sub>/I<sub>1</sub>، و M = X<sub>M</sub>/ω.',ok:s=>ST.v2m!=null},
      /* Procedure III (manual pp. 62–63), steps 1–3 */
      {dev:'board',build:'9',t:'Procedure III · 1. وصّل الدائرة الكهربائية Fig. 9.'},
      {dev:'ac',t:'2. والجهد المحدد مطبّق على coil 1، خذ قراءة V<sub>T</sub>.',acts:['المشرف يتأكد وشغّل الـ POWER.','M3 على V~، واضبط 2.00 V على M1، وسجّل V<sub>1</sub> و V<sub>2</sub> و V<sub>T</sub>.'],ok:s=>ST.vtp!=null,
        rec:[{to:'v1p',label:'V<sub>1</sub>',unit:'V',dec:3,val:()=>ST.v1p},{to:'v2p',label:'V<sub>2</sub>',unit:'V',dec:3,val:()=>ST.v2p},{to:'vtp',label:'V<sub>T</sub>',unit:'V',dec:3,val:()=>ST.vtp}]},
      {dev:'ac',t:'3. إذا V<sub>T</sub> هو الفرق بين V<sub>1</sub> و V<sub>2</sub>، النقطة (dot) تنحط عند A، وإلا تنحط عند B.',ok:s=>ST.vtp!=null},
      /* Procedure IV (manual p. 63), steps 1–7 */
      {dev:'board',build:'10',t:'Procedure IV · 1. حسب الـ polarity اللي طلّعتها، وصّل الدائرة Fig. 10.'},
      {dev:'ac',t:'2. اضبط جهد المصدر على 2 V<sub>rms</sub> وخذ قراءة الجهد والتيار.',acts:['المشرف يتأكد وشغّل الـ POWER.','اضبط الـ variac لين M1 = 2.00 V.'],ok:s=>ST.vad!=null,
        rec:[{to:'vad',label:'V (aiding)',unit:'V',dec:3,val:()=>ST.vad},{to:'iad',label:'I (aiding)',unit:'mA',dec:2,val:()=>ST.iad!=null?ST.iad*1e3:null}]},
      {dev:'ac',t:'3. احسب الـ equivalent impedance في هذي الحالة: X<sub>eq1</sub> = √((V/I)² − (R<sub>1</sub> + R<sub>2</sub>)²) = ω(L<sub>1</sub> + L<sub>2</sub> + 2M).',ok:s=>ST.vad!=null},
      {dev:'board',build:'10b',t:'4. كرّر خطوة 1 و 2 بس والـ 2 coils موصّلة بالعكس (in opposition): X<sub>eq2</sub> = ω(L<sub>1</sub> + L<sub>2</sub> − 2M).',acts:['طفّ المصدر، ووصّل 2 بـ A بدال B، و B يرجع للمصدر.','المشرف يتأكد، شغّل، 2 V<sub>rms</sub>، وسجّل V و I.'],ok:s=>ST.vop!=null,
        rec:[{to:'vop',label:'V (opposing)',unit:'V',dec:3,val:()=>ST.vop},{to:'iop',label:'I (opposing)',unit:'mA',dec:2,val:()=>ST.iop!=null?ST.iop*1e3:null}]},
      {dev:'ac',t:'5. طلّع الـ mutual inductance: M<sub>12</sub> = (X<sub>eq1</sub> − X<sub>eq2</sub>)/4ω.',ok:s=>ST.vop!=null},
      {dev:'ac',t:'6. قارنها بالقيمة اللي طلعت قبل (Procedure II) وعلّق على أي فرق بينهم.',ok:s=>ST.vop!=null},
      {dev:'ac',t:'7. احسب الـ coupling coefficient: k = M<sub>12</sub>/√(L<sub>1</sub>L<sub>2</sub>).',ok:s=>ST.vop!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
