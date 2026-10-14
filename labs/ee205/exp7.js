/* EE205 · Experiment 7 · Magnetically Coupled Circuits (manual pp. 53–63).
   Procedure I: Rdc of each coil, R = 1.15 Rdc; coil 1 (1000 turns) on the variable 60 Hz supply at 2 Vrms → V, I → Z, X, L1;
   the same for coil 2 (500 turns) → L2 (Fig. 7).
   Procedure II: coil 1 driven at 2 Vrms, V1, I1 and V2 on coil 2 → XM = V2 / I1, M = XM / ω (Fig. 8).
   Procedure III: coil 2's B joined to the bottom of coil 1, VT across the two tops (Fig. 9) → the dot at A or at B.
   Procedure IV: series aiding (Fig. 10) and opposing at 2 Vrms → Xeq1, Xeq2, M12 = (Xeq1 − Xeq2)/4ω, k = M12/√(L1L2).
   Instruments: the variable ac supply (60 Hz, instructor check before power), four Fluke 77 (M1 V1, M2 V2, M3 VT, M4 ammeter).
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
return {procs:[{id:'I',title:'Self inductance (Fig. 7)'},{id:'II',title:'Mutual inductance (Fig. 8)'},{id:'III',title:'Polarity (Fig. 9)'},{id:'IV',title:'Series aiding / opposing (Fig. 10)'}],
sheet,params:()=>({}),
instruments:[
  {type:'variac',prev:d=>{d.v=3}},
  {type:'hdmm',model:'fluke77',n:1,prev:d=>{d.pos=2}},{type:'hdmm',model:'fluke77',n:2},{type:'hdmm',model:'fluke77',n:3},{type:'hdmm',model:'fluke77',n:4,prev:d=>{d.pos=4}}],
parts:PARTS,
tray:[['UC','2 coils on U-core'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
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
  const F7='labs/ee205/fig/e7-fig7.png',F8='labs/ee205/fig/e7-fig8.png',F9='labs/ee205/fig/e7-fig9.png',F10='labs/ee205/fig/e7-fig10.png';
  return {status,
    steps:[
      {dev:'board',t:'Procedure I: حط الـ coils على الـ U-core في اللوحة (coil 1 = 1000 turns بين node 16 و node 23، coil 2 = 500 turns بين node 17 و node 24).',lines:[{t:'U-core: 1 → node 16, 2 → node 23, A → node 17, B → node 24',ic:'UC',pins:{P1:16,P2:23,A:17,B:24}}],ok:s=>s.uc},
      {dev:'hm4',t:'1. قِس R<sub>dc</sub> لـ coil 1 بـ M4 على Ω (VΩ → node 16، COM → node 23) والمصدر طافي.',lines:[{t:'M4 VΩ → node 16',lead:'h4v',at:16},{t:'M4 COM → node 23',lead:'h4c',at:23}],ok:s=>ST.rdc1!=null},
      {dev:'hm4',t:'3. وقِس R<sub>dc</sub> لـ coil 2 (VΩ → node 17، COM → node 24). احسب R = 1.15 R<sub>dc</sub> لكل واحد.',ok:s=>ST.rdc2!=null},
      {dev:'board',fig:F7,figCap:'Fig. 7',t:'4. ركّب Fig. 7 لـ coil 1: مخرج الـ variac، والأميتر M4 على التوالي (300mA → node 14، COM → node 15)، و bridging plug بين node 15 و node 16. الرجوع من node 23 للـ variac عن طريق node 22. والـ voltmeter M1 على المصدر.',
        lines:[{t:'bridging plug: node 15 ↔ node 16',wire:[15,16]},{t:'bridging plug: node 22 ↔ node 23',wire:[22,23]},{t:'VAR OUT (red) → node 14',lead:'acL',at:14},{t:'VAR OUT (blue) → node 22',lead:'acN',at:22},
          {t:'M4 300mA (red) → node 14',lead:'h4ma',at:14},{t:'M4 COM → node 15',lead:'h4c',at:15},{t:'M1 VΩ → node 14',lead:'h1v',at:14},{t:'M1 COM → node 22',lead:'h1c',at:22}],ok:s=>RT.instructor().ok&&s.uc},
      {dev:'ac',t:'⚠ اضغط «المشرف يتأكد من التوصيل» في هذي البطاقة: المشرف يشيّك التوصيل. بعدها شغّل الـ POWER.',ok:s=>s.on&&RT.S.ac.ok},
      {dev:'ac',t:'5. حوّل M1 على V~ و M4 على A~، واضبط الـ variac لين M1 يقرا 2.00 V. سجّل V و I واحسب Z<sub>1</sub> و X<sub>1</sub> و L<sub>1</sub>.',ok:s=>ST.va!=null},
      {dev:'board',t:'7. كرّر لـ coil 2: طفّ المصدر، انقل COM حق M4 لـ node 17 (A)، وشيل plug node 22 ↔ 23 وانقل الطرف الأزرق للـ variac لـ node 24 (B) مع COM حق M1. اطلب المشرف، شغّل، اضبط 2 V، وسجّل.',ok:s=>ST.vb!=null},
      {dev:'board',fig:F8,figCap:'Fig. 8',t:'Procedure II: رجّع توصيل coil 1 (M4 COM → node 15، plug 15 ↔ 16، plug 22 ↔ 23، الأزرق و M1 COM → node 22)، وحط M2 على V~ على coil 2 (node 17 ↔ node 24). عند 2 V سجّل V<sub>1</sub> و I<sub>1</sub> و V<sub>2</sub>.',
        lines:[{t:'M2 VΩ → node 17 (A)',lead:'h2v',at:17},{t:'M2 COM → node 24 (B)',lead:'h2c',at:24}],ok:s=>ST.v2m!=null},
      {dev:'board',fig:F9,figCap:'Fig. 9',t:'Procedure III: وصّل B بأسفل coil 1 (bridging plug node 23 ↔ node 24)، وحط M3 على V~ بين node 16 (1) و node 17 (A): هذا V<sub>T</sub>. عند 2 V سجّل V<sub>1</sub> و V<sub>2</sub> و V<sub>T</sub>.',
        lines:[{t:'bridging plug: node 23 ↔ node 24',note:'B ↔ 2',wire:[23,24]},{t:'M3 VΩ → node 16',lead:'h3v',at:16},{t:'M3 COM → node 17',lead:'h3c',at:17}],ok:s=>ST.vtp!=null},
      {dev:'board',fig:F10,figCap:'Fig. 10',t:'Procedure IV (aiding): خلّ plug 23 ↔ 24، وشيل plug 22 ↔ 23، وانقل الأزرق و M1 COM لـ node 17 (A): الملفين على التوالي. اطلب المشرف، اضبط 2 V، وسجّل V و I.',ok:s=>ST.vad!=null},
      {dev:'board',t:'4. Opposing: شيل plug 23 ↔ 24، ووصّل node 23 بـ node 17 بسلك (W)، وانقل الأزرق و M1 COM لـ node 24 (B). اطلب المشرف، 2 V، وسجّل V و I. احسب M<sub>12</sub> و k.',ok:s=>ST.vop!=null},
      {dev:'ac',t:'طفّ الـ variac.',ok:s=>s.off&&ST.vop!=null}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
