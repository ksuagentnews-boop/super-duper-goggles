/* Mains-level sources of the EE205 lab and the fluorescent lamp, with the instructor check of the manual
   («Get the connection checked by the instructor and let him energize the circuit for you»):
     ENGINE.mains   the bench socket with a switched outlet, 127 V 60 Hz (Exp 4). Leads acL (L, red) / acN (N, black).
     ENGINE.variac  the variable ac supply (beige box, 60 Hz): 0 … 24 V on the variable output (knob), the two fixed
                    12 V~ jacks drawn (Exp 7). Leads acL / acN on the variable output.
     ENGINE.xf3     the red three-phase transformer, Y secondary a · b · c · n, 24 V phase (41.6 V line), 60 Hz (Exp 5).
                    Leads x3a, x3b, x3c, x3n.
     ENGINE.lamp    110 V 20 W fluorescent fixture with its ballast (an inductive load: R + L in series, PF ≈ 0.6 lagging
                    at 127 V), terminals L / N (leads lpL / lpN).
   Every source starts locked: «المشرف يتأكد» (key CHK) asks the instructor, who checks the circuit with the experiment's
   RT.instructor() (Manual) and then the POWER switch works. Changing the circuit while checked switches the source off and
   locks it again (moving a voltmeter does not count). A short trips the breaker (> 10 A). State S[key] = {pwr, ok, sig, …}. */
(()=>{
/* the circuit as the instructor saw it: parts, wires and every lead except voltmeter-only ones */
function sig(RT){const S=RT.S;const meterV=new Set();const L=S.leads;
  /* a handheld meter whose current jacks carry no lead is a voltmeter: its leads do not change the circuit */
  Object.keys(L).forEach(k=>{const m=k.match(/^(h\d+)c$/);if(!m)return;const p=m[1];if(!(L[p+'ma']&&L[p+'ma'].node!=null)&&!(L[p+'a']&&L[p+'a'].node!=null)){meterV.add(p+'v');meterV.add(p+'c')}});
  Object.keys(S.leads).forEach(k=>{if(/^w\d+vc?$/.test(k))meterV.add(k)});
  return JSON.stringify([S.parts.map(p=>[p.type,p.a,p.b,p.n]),S.wires.map(w=>[w.a,w.b]),Object.keys(S.leads).filter(k=>!meterV.has(k)).map(k=>[k,S.leads[k].node])])}
/* Manual mode only: in Free mode there is no instructor at the table and the source switches freely (the breaker still trips).
   The «المشرف يتأكد من التوصيل» button lives in the Manual step card (bench.js reads RT.locks), not on the instrument. */
const manual=()=>typeof BENCH!=='undefined'&&BENCH.mode==='manual';
function lock(RT,key,name){const L={
  key,name,isOk:()=>!!(RT.S[key]&&RT.S[key].ok),
  check(){const d=RT.S[key];if(d.ok){BENCH.say('المشرف شيّك قبل، تقدر تشغّل');return}
    const r=RT.instructor?RT.instructor():{ok:true,msg:''};
    if(!r.ok){BENCH.say('👨‍🏫 المشرف: '+(r.msg||'التوصيل مو صحيح، راجعه مع الشكل'));return}
    d.ok=true;d.sig=sig(RT);BENCH.say('👨‍🏫 المشرف: التوصيل سليم، شغّل '+name)},
  power(){const d=RT.S[key];if(!d.ok&&manual()){BENCH.say('⚠ لازم المشرف يتأكد من التوصيل قبل التشغيل: اضغط «المشرف يتأكد من التوصيل» في بطاقة الخطوة');return}d.pwr=!d.pwr;RT.dirty=true},
  watch(){const d=RT.S[key];if(!d.ok||!manual())return;if(sig(RT)!==d.sig){const was=d.pwr;d.ok=false;d.pwr=false;RT.dirty=true;
      if(was)BENCH.say('⚠ غيّرت التوصيل والمصدر شغّال: انطفى للسلامة، اطلب من المشرف يتأكد مرة ثانية');setTimeout(()=>RT.render(),0)}},
  trip(I){const d=RT.S[key];if(d.pwr&&I>10){d.pwr=false;RT.dirty=true;BENCH.say('💥 فصل القاطع: تيار كبير (short circuit)');setTimeout(()=>RT.render(),0)}}};
  (RT.locks=RT.locks||[]).push(L);return L}
const rms=a=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/a.length)};
const post=(x,y,col,lab)=>`<circle cx="${x}" cy="${y}" r="11" fill="${col}" stroke="#111" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#555"/>`+(lab?T(x,y+24,lab,{size:9,a:'middle',w:700,fill:'#2f3128'}):'');
/* source current of an XS element (for the breaker): from the solve */
function srcI(RT,a,b,r,vp,ph){const TB=RT.TB;if(!TB||!TB.X||a==null||b==null)return 0;const N=TB.X.length;let mx=0;
  for(let k=0;k<N;k++){const x=TB.X[k],va=a<0?0:x[a],vb=b<0?0:x[b];const v=vp*Math.sin(2*Math.PI*k/N+(ph||0));mx=Math.max(mx,Math.abs((va-vb-v)/r))}return mx/Math.SQRT2}

/* ---------- bench socket 127 V 60 Hz ---------- */
ENGINE.mains=function(RT,opt){const KEY='ac',P='a',W=300,H=210,V=opt.v||127,F=60;const L=lock(RT,KEY,'المصدر');
  const J={L:{x:230,y:150},N:{x:180,y:150}};
  function fresh(){return {pwr:false,ok:false,sig:''}}
  function svg(){const d=RT.S[KEY];let s=`<rect width="${W}" height="${H}" rx="10" fill="#d7d2c4" stroke="#8f8a7c" stroke-width="2"/><rect x="10" y="10" width="${W-20}" height="${H-20}" rx="6" fill="#e9e5da" stroke="#b6b0a2"/>`;
    s+=T(22,34,`AC SOURCE · ${V} V ~ ${F} Hz`,{size:12,w:700,fill:'#2f3128'})+T(22,52,'Bench outlet (instructor controlled)',{size:9,fill:'#5c584d'});
    s+=`<rect x="24" y="70" width="70" height="104" rx="8" fill="#b9b4a6" stroke="#77736a"/><rect x="38" y="${d.pwr?82:122}" width="42" height="40" rx="5" fill="${d.pwr?'#e74c3c':'#5c5f60'}" stroke="#222" data-k="${P}:PWR" style="cursor:pointer"/>`+T(59,190,d.pwr?'ON':'OFF',{size:10,a:'middle',w:700,fill:d.pwr?'#b0281a':'#3b3f42'});
    s+=`<circle cx="120" cy="96" r="7" fill="${d.pwr?'#ff4433':'#6b3a3a'}"/>`+(d.pwr?`<circle cx="120" cy="96" r="13" fill="#ff4433" opacity=".25"/>`:'');
    s+=post(J.N.x,J.N.y,'#1d1f20','N')+post(J.L.x,J.L.y,'#d43a2c','L')+T(205,128,'OUTPUT',{size:8,a:'middle',fill:'#5c584d'});return s}
  function keyFn(k){if(k==='PWR')L.power();if(k==='CHK')L.check()}
  return {key:KEY,prefix:P,size:[W,H],name:['AC source 127 V 60 Hz','مصدر التيار المتردد'],fresh,svg,keyFn,
    leads:[{k:'acL',label:'L ~',from:J.L,banana:true,circuit:true,pol:'+',tray:'AC L',jn:'AC L'},{k:'acN',label:'N ~',from:J.N,banana:true,circuit:true,pol:'-',tray:'AC N',jn:'AC N'}],
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr||l.acL.node==null||l.acN.node==null)return;const a=ck.idx(l.acL.node),b=ck.idx(l.acN.node);ck.els.push({t:'XS',a,b,s:1,vp:V*Math.SQRT2,f:F,r:0.3});ck.ac={a,b}},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.ac;if(c)L.trip(srcI(RT,c.a,c.b,0.3,V*Math.SQRT2))},V,F};
};
ENGINE.mains.size=[300,210];

/* ---------- variable ac supply (Exp 7) ---------- */
ENGINE.variac=function(RT,opt){const KEY='ac',P='a',W=450,H=262,F=60,VMAX=20;const L=lock(RT,KEY,'المصدر');
  /* Leybold 521 35 «variable extra low voltage transformer S» as in the lab (cream case, red rocker, old L-in-a-circle logo;
     docs/ee205/instruments/variac-notes.md). Field 1: fuse 1.8 A, fixed 12 V ~ (two black sockets, leads ac12a / ac12b,
     spare). Field 2: fuse 6 A, the variable 0 … 20 V ~ output (two black sockets: the experiment's leads acL / acN).
     The silver pointer knob sets it. Field 3: 0 … 20 V ⎓ through the printed bridge (blue − / red +; drawn, not wired in
     this simulator: no experiment uses it). */
  const J={L:{x:236,y:186},N:{x:199,y:186},A:{x:92,y:186},B:{x:126,y:186}};const KX=278,KY=113,INK='#2d2d2b';
  function fresh(){const d={pwr:false,ok:false,sig:'',v:0};if(opt.prev)opt.prev(d);return d}
  const sock=(p,col='#1c1c1c',ring='#3a3a3a')=>`<circle cx="${p.x}" cy="${p.y}" r="12" fill="${ring}"/><circle cx="${p.x}" cy="${p.y}" r="10" fill="${col}" stroke="#000" stroke-width=".8"/><circle cx="${p.x}" cy="${p.y}" r="6.5" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/><circle cx="${p.x}" cy="${p.y}" r="3.2" fill="#555"/>`;
  const fuse=(x,y)=>`<circle cx="${x}" cy="${y}" r="12" fill="#b9bcbd" stroke="#6f7273" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="8.5" fill="#161616"/><circle cx="${x-2.5}" cy="${y-2.5}" r="2.5" fill="#fff" opacity=".12"/>`;
  function svg(){const d=RT.S[KEY];let s='';
    // feet, cream case with the carrying slot on top, light front panel
    s+=`<rect x="92" y="${H-14}" width="22" height="14" rx="2" fill="#1d1d1d"/><rect x="${W-114}" y="${H-14}" width="22" height="14" rx="2" fill="#1d1d1d"/>`;
    s+=`<rect x="160" y="-8" width="130" height="16" rx="5" fill="#4d4f50" stroke="#2c2d2e"/>`;
    s+=`<rect width="${W}" height="${H-10}" rx="12" fill="#e9e2cc" stroke="#a8a08a" stroke-width="2"/><rect x="7" y="13" width="${W-14}" height="${H-34}" rx="4" fill="#f1ecdc" stroke="#cbc3ab" stroke-width="1.2"/>`;
    // the three grey fields
    s+=`<rect x="36" y="70" width="124" height="118" rx="6" fill="#c9c9c4"/><rect x="154" y="70" width="118" height="118" rx="6" fill="#c9c9c4"/><rect x="278" y="70" width="121" height="118" rx="6" fill="#c9c9c4"/>`;
    s+=`<rect x="154" y="70" width="118" height="118" rx="6" fill="none" stroke="#f1ecdc" stroke-width="3"/><rect x="278" y="70" width="121" height="118" rx="6" fill="none" stroke="#f1ecdc" stroke-width="3"/>`;
    // red rocker, top-left, over the first field's corner
    s+=`<rect x="37" y="48" width="38" height="46" rx="3" fill="#151515" data-k="${P}:PWR" style="cursor:pointer"/><rect x="43" y="54" width="26" height="34" rx="2" fill="${d.pwr?'#e84a2c':'#b9301c'}" pointer-events="none"/>`+
       `<rect x="43" y="${d.pwr?54:71}" width="26" height="17" rx="2" fill="${d.pwr?'#ff6a45':'#a4281a'}" pointer-events="none"/>`+(d.pwr?`<rect x="40" y="51" width="32" height="40" rx="3" fill="#ff5a33" opacity=".25" pointer-events="none"/>`:'');
    // field 1: fuse 1.8 A, 12 V ~
    s+=fuse(134,111)+T(135,134,'1.8A',{size:8,fill:INK,a:'middle'})+T(105,157,'12V',{size:8.5,fill:INK,a:'middle'})+T(92,176,'~',{size:9,fill:INK,a:'middle'})+T(126,176,'~',{size:9,fill:INK,a:'middle'})+sock(J.A)+sock(J.B);
    // field 2: fuse 6 A, the variable ac output, the printed bridge diagram to the dc output
    s+=fuse(174,111)+T(174,134,'6A',{size:8,fill:INK,a:'middle'});
    s+=`<path d="M199 165 V146 H265 M284 146 H352 V165 M236 165 V159 H265 M284 159 H312 V165" fill="none" stroke="${INK}" stroke-width="1"/>`+
       `<rect x="265" y="141" width="19" height="22" fill="#d8d8d4" stroke="${INK}" stroke-width="1"/><path d="M269 152 h11 M274 147 l5 5 l-5 5 z M279 147 v10" fill="none" stroke="${INK}" stroke-width="1"/>`;
    s+=T(224,156,'0...20V',{size:8,fill:INK,a:'middle'})+T(334,156,'0...20V',{size:8,fill:INK,a:'middle'})+T(199,176,'~',{size:9,fill:INK,a:'middle'})+T(236,176,'~',{size:9,fill:INK,a:'middle'})+sock(J.N)+sock(J.L);
    // field 3: dc − (blue) / + (red)
    s+=T(310,175,'−',{size:10,fill:INK,a:'middle',w:700})+T(348,175,'+',{size:10,fill:INK,a:'middle',w:700})+sock({x:310,y:186},'#2f5fd0','#1f3e8c')+sock({x:348,y:186},'#d43a2c','#8a2016');
    // the silver pointer knob (variable output) with its dots
    for(let k=0;k<7;k++){const a=(-135+k*45)*Math.PI/180;s+=`<circle cx="${(KX+Math.sin(a)*35).toFixed(1)}" cy="${(KY-Math.cos(a)*35).toFixed(1)}" r="1.5" fill="${INK}"/>`}
    const ang=(d.v/VMAX*270-135)*Math.PI/180;
    s+=`<circle cx="${KX}" cy="${KY}" r="40" fill="transparent" data-k="knob:${P}:V" data-knob="${P}:V"/><circle cx="${KX}" cy="${KY+3}" r="25" fill="#000" opacity=".22"/>`+
       `<circle cx="${KX}" cy="${KY}" r="25" fill="#e4e5e3" stroke="#8d9091" stroke-width="1.5" data-k="knob:${P}:V" data-knob="${P}:V" style="cursor:pointer"/>`+
       `<circle cx="${KX}" cy="${KY}" r="21" fill="#f4f4f2" pointer-events="none"/><line x1="${(KX-Math.sin(ang)*6).toFixed(1)}" y1="${(KY+Math.cos(ang)*6).toFixed(1)}" x2="${(KX+Math.sin(ang)*20).toFixed(1)}" y2="${(KY-Math.cos(ang)*20).toFixed(1)}" stroke="#222" stroke-width="2.2" stroke-linecap="round" pointer-events="none"/>`;
    s+=`<rect x="${KX-48}" y="${KY-12}" width="16" height="24" fill="transparent" data-k="${P}:V-" style="cursor:pointer"/><rect x="${KX+32}" y="${KY-12}" width="16" height="24" fill="transparent" data-k="${P}:V+" style="cursor:pointer"/>`+
       `<path d="M${KX-44} ${KY} l5 -4 v8 z" fill="#8b877c" pointer-events="none"/><path d="M${KX+44} ${KY} l-5 -4 v8 z" fill="#8b877c" pointer-events="none"/>`;
    // thin red line, the old Leybold logo bottom-left, the product text bottom-right
    s+=`<line x1="36" y1="199" x2="399" y2="199" stroke="#b7462f" stroke-width="1.6"/>`;
    s+=`<rect x="34" y="206" width="24" height="22" rx="3" fill="#f7f4ea" stroke="#1b1b1b" stroke-width="2"/><path d="M41 211 v12 h10" fill="none" stroke="#1b1b1b" stroke-width="3"/>`;
    s+=T(398,212,'521 35',{size:6.4,fill:INK,a:'end'})+T(398,220,'KLEINSPANNUNGS-STELLTRAFO S',{size:6.4,fill:INK,a:'end'})+T(398,228,'VARIABLE EXTRA LOW VOLTAGE TRANSFORMER S',{size:6.4,fill:INK,a:'end'});
    return s}
  function keyFn(k){const d=RT.S[KEY];if(k==='PWR')L.power();if(k==='CHK')L.check();if(k==='V+'||k==='V-'){d.v=clamp(Math.round((d.v+(k==='V+'?0.05:-0.05))*100)/100,0,VMAX);RT.dirty=true}}
  return {key:KEY,prefix:P,size:[W,H],name:['Variable AC supply','مصدر الجهد المتردد المتغيّر'],fresh,svg,keyFn,wheel:['V'],knobInfo:()=>'≈ '+RT.S[KEY].v.toFixed(2)+' V ~',
    leads:[{k:'acL',label:'0…20V ~',from:J.L,banana:true,circuit:true,pol:'+',tray:'AC out ~',jn:'VAR OUT ~'},{k:'acN',label:'0…20V ~',from:J.N,banana:true,circuit:true,pol:'-',tray:'AC out ~',jn:'VAR OUT ~'},
      {k:'ac12a',label:'12V ~',from:J.A,banana:true,circuit:true,pol:'+',tray:'12 V ~',jn:'12 V ~',spare:true},{k:'ac12b',label:'12V ~',from:J.B,banana:true,circuit:true,pol:'-',tray:'12 V ~',jn:'12 V ~',spare:true}],
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr)return;
      if(l.ac12a&&l.ac12b&&l.ac12a.node!=null&&l.ac12b.node!=null)ck.els.push({t:'XS',a:ck.idx(l.ac12a.node),b:ck.idx(l.ac12b.node),s:1,vp:12*Math.SQRT2,f:F,r:0.3});
      if(l.acL.node==null||l.acN.node==null)return;const a=ck.idx(l.acL.node),b=ck.idx(l.acN.node);ck.els.push({t:'XS',a,b,s:1,vp:d.v*Math.SQRT2,f:F,r:0.3});ck.ac={a,b,vp:d.v*Math.SQRT2}},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.ac;if(c)L.trip(srcI(RT,c.a,c.b,0.3,c.vp))}};
};
ENGINE.variac.size=[460,250];

/* ---------- three-phase transformer, Y secondary (Exp 5) ---------- */
ENGINE.xf3=function(RT,opt){const KEY='x3',P='x',W=300,H=345,F=60,VP=opt.vp||24,R=0.6;const L=lock(RT,KEY,'المحوّل');
  /* Leybold-Heraeus three-phase extra-low voltage transformer (old red housing, docs/ee205/instruments/threephase-notes.md):
     two printed star / delta diagrams, each with four black 4 mm sockets L1 · L2 · L3 · N. Right: 23 V / 40 V (the experiment's
     leads x3a, x3b, x3c, x3n); left: 6 V / 10 V (spare sockets: any banana lead plugs in, leads x3a6 … x3n6). The two N are joined. */
  const TRI=[{t:{x:92,y:196},bl:{x:46,y:258},br:{x:124,y:272},n:{x:86,y:238},vl:'6 V',vd:'10 V',suf:'6',vp:VP*6/23},
             {t:{x:200,y:208},bl:{x:150,y:272},br:{x:232,y:282},n:{x:192,y:250},vl:'23 V',vd:'40 V',suf:'',vp:VP}];
  const J={};TRI.forEach(t=>{J['a'+t.suf]=t.t;J['b'+t.suf]=t.br;J['c'+t.suf]=t.bl;J['n'+t.suf]=t.n});
  const PH={a:0,b:-2*Math.PI/3,c:2*Math.PI/3};const INK='#1d1d1b';
  function fresh(){return {pwr:false,ok:false,sig:''}}
  const sock=p=>`<circle cx="${p.x}" cy="${p.y}" r="10" fill="#d9d3c0"/><circle cx="${p.x}" cy="${p.y}" r="8.6" fill="#1a1a1a" stroke="#000" stroke-width="1"/><circle cx="${p.x-2.5}" cy="${p.y-3}" r="3.5" fill="#fff" opacity=".12"/><circle cx="${p.x}" cy="${p.y}" r="3.4" fill="#4b4b4b"/>`;
  const seg=(a,b,dash)=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${INK}" stroke-width="1.6"${dash?' stroke-dasharray="5 3.5"':''}/>`;
  const vlab=(a,b,t,dx=0,dy=0)=>T(((a.x+b.x)/2+dx).toFixed(1),((a.y+b.y)/2+dy+2).toFixed(1),t,{size:5.6,fill:INK,a:'middle',w:700});
  function svg(){const d=RT.S[KEY];let s='';
    // red housing seen from the front, the grey carrying handle in its recess on top
    s+=`<rect x="100" y="-12" width="100" height="22" rx="6" fill="#55595b" stroke="#2c2e2f"/><rect x="108" y="-8" width="84" height="8" rx="3" fill="#7b8082"/>`;
    s+=`<rect width="${W}" height="${H}" rx="16" fill="#e8452c" stroke="#9c2716" stroke-width="2"/><rect x="5" y="4" width="${W-10}" height="10" rx="5" fill="#f26a4f" opacity=".6"/>`;
    s+=`<rect x="13" y="20" width="${W-26}" height="${H-34}" rx="4" fill="#ebe6d4" stroke="#b5ad97" stroke-width="1.5"/>`;
    // mains rocker: white rocker in a black square frame
    s+=`<rect x="28" y="38" width="26" height="60" rx="2.5" fill="#121212" data-k="${P}:PWR" style="cursor:pointer"/><rect x="32.5" y="43" width="17" height="50" rx="2" fill="#f2f1ec" stroke="#9b9a95" pointer-events="none"/>`+
       (d.pwr?`<rect x="32.5" y="43" width="17" height="23" rx="2" fill="#d2d0c8" pointer-events="none"/>`:`<rect x="32.5" y="70" width="17" height="23" rx="2" fill="#d2d0c8" pointer-events="none"/>`);
    // three-phase supply mark and the transformer symbol, top right
    s+=T(232,58,'~',{size:10,fill:INK,a:'middle',w:700})+T(232,65,'~',{size:10,fill:INK,a:'middle',w:700})+T(232,72,'~',{size:10,fill:INK,a:'middle',w:700})+T(250,68,'∼V',{size:9,fill:INK,a:'middle',w:700});
    const tc=(x,y,dir)=>{let q=`<line x1="${x}" y1="${y}" x2="${x+dir*26}" y2="${y}" stroke="${INK}" stroke-width="1.4"/>`;for(let k=0;k<3;k++)q+=`<line x1="${x+dir*(6+k*6)-3}" y1="${y+5}" x2="${x+dir*(6+k*6)+3}" y2="${y-5}" stroke="${INK}" stroke-width="1.3"/>`;return q};
    s+=`<circle cx="224" cy="106" r="9" fill="none" stroke="${INK}" stroke-width="1.4"/><circle cx="237" cy="106" r="9" fill="none" stroke="${INK}" stroke-width="1.4"/>`+tc(215,106,-1)+tc(246,106,1);
    // rating
    s+=T(118,150,'I',{size:8,fill:INK,w:700})+T(123,152,'max',{size:4.8,fill:INK,w:700})+T(160,146,'4 A',{size:7,fill:INK,a:'end',w:700})+
       `<path d="M163 140 l3.5 3.5 l3.5 -3.5 M166.5 143.5 v3.5" fill="none" stroke="${INK}" stroke-width="1"/>`+T(160,156,'2.3 A',{size:7,fill:INK,a:'end',w:700})+`<path d="M163 156 l3.5 -6 l3.5 6 z" fill="none" stroke="${INK}" stroke-width="1"/>`;
    // the two printed star / delta diagrams, N joined across, ⚠ and the pilot lamp between them
    s+=seg(TRI[0].n,TRI[1].n,false);
    TRI.forEach(t=>{s+=seg(t.t,t.bl,false)+seg(t.t,t.br,false)+seg(t.bl,t.br,true)+seg(t.n,t.t,true)+seg(t.n,t.bl,true)+seg(t.n,t.br,true);
      s+=vlab(t.t,t.bl,t.vd,-13,-1)+vlab(t.t,t.br,t.vd,13,-1)+vlab(t.bl,t.br,t.vd,0,10)+vlab(t.n,t.t,t.vl,8,0)+vlab(t.n,t.bl,t.vl,-1,-7)+vlab(t.n,t.br,t.vl,4,-8);
      const lb=(p,q,dy)=>T(p.x,p.y+dy,q,{size:5.4,fill:INK,a:'middle',w:700});s+=lb(t.t,'L1',-12)+lb(t.br,'L2',16)+lb(t.bl,'L3',16)+lb(t.n,'N',16);
      [t.t,t.bl,t.br,t.n].forEach(p=>s+=sock(p))});
    s+=`<path d="M142 214 l9 15 h-18 z" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`+T(142,227,'!',{size:9,fill:INK,a:'middle',w:800});
    s+=`<circle cx="142" cy="242" r="3.8" fill="${d.pwr?'#ff3020':'#6a1d16'}" stroke="#3a0d08"/>`+(d.pwr?`<circle cx="142" cy="242" r="9" fill="#ff3020" opacity=".3"/>`:'');
    // black name band: Leybold-Heraeus mark at the left, the product name at the right
    s+=`<rect x="13" y="${H-42}" width="${W-26}" height="28" fill="#121212"/><rect x="20" y="${H-38}" width="15" height="15" rx="1" fill="#f4f4f0"/><path d="M23.5 ${H-26} v-8.5 l4 5 l4 -5 v8.5" fill="none" stroke="#121212" stroke-width="1.4"/>`;
    s+=T(40,H-27,'LEYBOLD-HERAEUS',{size:6,fill:'#f4f4f0',w:700})+T(W-20,H-29,'Drehstrom-Kleinspannungs-Transformator  521 29',{size:5,fill:'#f4f4f0',a:'end',w:700})+T(W-20,H-20,'three-phase extra-low voltage transformer',{size:5,fill:'#f4f4f0',a:'end',w:700});
    return s}
  function keyFn(k){if(k==='PWR')L.power();if(k==='CHK')L.check()}
  const LK=['a','b','c','n'].flatMap(k=>['',  '6'].map(sf=>({k:'x3'+k+sf,sf,ph:k})));
  return {key:KEY,prefix:P,size:[W,H],name:['Three-phase transformer','المحوّل ثلاثي الطور'],fresh,svg,keyFn,
    leads:LK.map(({k,sf,ph})=>({k,label:(ph==='n'?'N':'L'+(ph.charCodeAt(0)-96))+(sf?' 6 V':''),from:J[ph+sf],banana:true,circuit:true,pol:ph==='n'?'-':'+',tray:'3φ '+ph,jn:'3φ '+ph+(sf?' (6 V)':''),spare:!!sf})),
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr)return;ck.x3=[];
      /* the star point is inside: N is a terminal on it, wired or not; the two N sockets are joined on the panel */
      const nn=[l.x3n,l.x3n6].map(q=>q&&q.node!=null?ck.idx(q.node):null).filter(x=>x!=null);const n=nn.length?nn[0]:ck.inner();
      if(nn.length>1&&nn[1]!==n)ck.els.push({t:'G',a:n,b:nn[1],g:1e3});
      TRI.forEach(t=>['a','b','c'].forEach(k=>{const q=l['x3'+k+t.suf];if(!q||q.node==null)return;const a=ck.idx(q.node);ck.els.push({t:'XS',a,b:n,s:1,vp:t.vp*Math.SQRT2,f:F,r:R,ph:PH[k]});ck.x3.push({a,b:n,ph:PH[k],vp:t.vp})}))},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.x3;if(c)c.forEach(q=>L.trip(srcI(RT,q.a,q.b,R,q.vp*Math.SQRT2,q.ph)))},VP};
};
ENGINE.xf3.size=[360,320];

/* ---------- fluorescent lamp 110 V 20 W with its ballast ---------- */
ENGINE.lamp=function(RT,opt){const KEY='lamp',P='l',W=720,H=110,RL=opt.r||263,LL=opt.l||0.931;
  const J={L:{x:W-60,y:78},N:{x:W-110,y:78}};
  function fresh(){return {lit:0}}
  function svg(){const d=RT.S[KEY];const lit=d.lit;let s=`<rect width="${W}" height="${H}" rx="10" fill="#f4f4f1" stroke="#b8b8b0" stroke-width="2"/>`;
    s+=`<rect x="22" y="18" width="${W-180}" height="34" rx="17" fill="${lit?`rgba(255,255,236,${0.7+0.3*lit})`:'#e9ece9'}" stroke="#c9ccc6"/>`+(lit?`<rect x="10" y="8" width="${W-156}" height="54" rx="27" fill="#fffbe0" opacity="${0.35*lit}"/>`:'');
    s+=`<rect x="12" y="22" width="14" height="26" rx="3" fill="#cfd2cc"/><rect x="${W-162}" y="22" width="14" height="26" rx="3" fill="#cfd2cc"/>`;
    s+=T(30,82,'FLUORESCENT LAMP 110 V 20 W · ballast (inductive load)',{size:10,w:700,fill:'#3b3f42'});
    s+=post(J.N.x,J.N.y,'#1d1f20','N')+post(J.L.x,J.L.y,'#d43a2c','L');return s}
  return {key:KEY,prefix:P,size:[W,H],name:['Fluorescent lamp 110 V 20 W','لمبة الفلورسنت'],fresh,svg,keyFn:()=>{},
    leads:[{k:'lpL',label:'lamp L',from:J.L,banana:true,circuit:true,pol:'+',tray:'lamp L',jn:'lamp L'},{k:'lpN',label:'lamp N',from:J.N,banana:true,circuit:true,pol:'-',tray:'lamp N',jn:'lamp N'}],
    /* R + L in series through an internal node of the netlist */
    stamp(ck){const l=RT.S.leads;if(l.lpL.node==null||l.lpN.node==null)return;const a=ck.idx(l.lpL.node),b=ck.idx(l.lpN.node),m=ck.inner();
      ck.els.push({t:'G',a,b:m,g:1/RL},{t:'L',a:m,b,l:LL});ck.lamp={a,b}},
    measure(){const d=RT.S[KEY],c=RT.TB&&RT.TB.ck&&RT.TB.ck.lamp;let lit=0;if(c&&c.a!=null){const va=RT.samples(c.a,60),vb=RT.samples(c.b,60);const v=rms(va.map((x,k)=>x-vb[k]));lit=v>80?Math.min(1,(v-80)/40):0}
      if(Math.abs(lit-d.lit)>0.02){d.lit=lit}},R:RL,L:LL};
};
ENGINE.lamp.size=[720,110];
})();
