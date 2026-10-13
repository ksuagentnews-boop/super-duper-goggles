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
function lock(RT,key,name){return {
  check(){const d=RT.S[key];if(d.ok){BENCH.say('المشرف شيّك قبل، تقدر تشغّل');return}
    const r=RT.instructor?RT.instructor():{ok:true,msg:''};
    if(!r.ok){BENCH.say('👨‍🏫 المشرف: '+(r.msg||'التوصيل مو صحيح، راجعه مع الشكل'));return}
    d.ok=true;d.sig=sig(RT);BENCH.say('👨‍🏫 المشرف: التوصيل سليم، شغّل '+name)},
  power(){const d=RT.S[key];if(!d.ok){BENCH.say('⚠ لازم المشرف يتأكد من التوصيل قبل التشغيل: اضغط «المشرف يتأكد»');return}d.pwr=!d.pwr;RT.dirty=true},
  watch(){const d=RT.S[key];if(!d.ok)return;if(sig(RT)!==d.sig){const was=d.pwr;d.ok=false;d.pwr=false;RT.dirty=true;
      if(was)BENCH.say('⚠ غيّرت التوصيل والمصدر شغّال: انطفى للسلامة، اطلب من المشرف يتأكد مرة ثانية');setTimeout(()=>RT.render(),0)}},
  trip(I){const d=RT.S[key];if(d.pwr&&I>10){d.pwr=false;RT.dirty=true;BENCH.say('💥 فصل القاطع: تيار كبير (short circuit)');setTimeout(()=>RT.render(),0)}}}}
const chkBtn=(x,y,ok,pfx)=>`<g data-k="${pfx}:CHK" style="cursor:pointer"><rect x="${x}" y="${y}" width="128" height="30" rx="8" fill="${ok?'#d6efe0':'#fff4dc'}" stroke="${ok?'#2c7a6b':'#c58a1a'}" stroke-width="1.6"/>`+T(x+64,y+19.5,ok?'✓ المشرف شيّك':'👨‍🏫 المشرف يتأكد',{size:11,a:'middle',w:700,fill:ok?'#1f5b50':'#7a5200'})+'</g>';
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
    s+=chkBtn(150,64,d.ok,P);
    s+=post(J.N.x,J.N.y,'#1d1f20','N')+post(J.L.x,J.L.y,'#d43a2c','L')+T(205,128,'OUTPUT',{size:8,a:'middle',fill:'#5c584d'});return s}
  function keyFn(k){if(k==='PWR')L.power();if(k==='CHK')L.check()}
  return {key:KEY,prefix:P,size:[W,H],name:['AC source 127 V 60 Hz','مصدر التيار المتردد'],fresh,svg,keyFn,
    leads:[{k:'acL',label:'L ~',from:J.L,banana:true,circuit:true,pol:'+',tray:'AC L',jn:'AC L'},{k:'acN',label:'N ~',from:J.N,banana:true,circuit:true,pol:'-',tray:'AC N',jn:'AC N'}],
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr||l.acL.node==null||l.acN.node==null)return;const a=ck.idx(l.acL.node),b=ck.idx(l.acN.node);ck.els.push({t:'XS',a,b,s:1,vp:V*Math.SQRT2,f:F,r:0.3});ck.ac={a,b}},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.ac;if(c)L.trip(srcI(RT,c.a,c.b,0.3,V*Math.SQRT2))},V,F};
};
ENGINE.mains.size=[300,210];

/* ---------- variable ac supply (Exp 7) ---------- */
ENGINE.variac=function(RT,opt){const KEY='ac',P='a',W=460,H=250,F=60,VMAX=24;const L=lock(RT,KEY,'المصدر');const knob=ENGINE.knob;
  const J={L:{x:400,y:196},N:{x:356,y:196}};
  function fresh(){const d={pwr:false,ok:false,sig:'',v:0};if(opt.prev)opt.prev(d);return d}
  function svg(){const d=RT.S[KEY];let s=`<rect width="${W}" height="${H}" rx="14" fill="#e9e3d2" stroke="#a49d8a" stroke-width="2"/><rect x="0" y="0" width="${W}" height="26" rx="12" fill="#d8d0bb"/>`;
    s+=T(18,18,'VARIABLE AC SUPPLY  ·  60 Hz',{size:11,w:700,fill:'#3b372d'});
    s+=`<rect x="22" y="44" width="30" height="40" rx="4" fill="#3b3f42" stroke="#111" data-k="${P}:PWR" style="cursor:pointer"/><rect x="26" y="${d.pwr?48:64}" width="22" height="16" rx="3" fill="${d.pwr?'#e74c3c':'#7a2a22'}" pointer-events="none"/>`+T(37,100,'POWER',{size:7.5,a:'middle',fill:'#3b372d'});
    s+=`<rect x="70" y="40" width="${W-90}" height="96" rx="8" fill="#ddd6c4" stroke="#bdb5a1"/>`;
    s+=post(100,196,'#1d1f20','')+post(150,196,'#1d1f20','')+T(125,170,'12 V ~',{size:9,a:'middle',w:700,fill:'#3b372d'});
    s+=knob(300,90,22,'#8f8a7c',`${P}:V`,'',null,{fill:'#f6f3ec',ang:(d.v/VMAX*270-135)*Math.PI/180});
    for(let i=0;i<=12;i++){const a=(i/12*270-135)*Math.PI/180;s+=`<line x1="${300+Math.sin(a)*28}" y1="${90-Math.cos(a)*28}" x2="${300+Math.sin(a)*33}" y2="${90-Math.cos(a)*33}" stroke="#3b372d" stroke-width="1" pointer-events="none"/>`;if(i%3===0)s+=T(300+Math.sin(a)*42,90-Math.cos(a)*42+3,String(i*2),{size:7.5,a:'middle',fill:'#3b372d'})}
    s+=T(300,134,'0 … 24 V ~',{size:8.5,a:'middle',fill:'#3b372d'});
    s+=post(J.N.x,J.N.y,'#2f5fd0','')+post(J.L.x,J.L.y,'#d43a2c','')+T(378,170,'VARIABLE OUTPUT',{size:8.5,a:'middle',w:700,fill:'#3b372d'});
    s+=`<circle cx="62" cy="64" r="6" fill="${d.pwr?'#ff4433':'#6b3a3a'}"/>`;
    s+=chkBtn(150,148,d.ok,P);return s}
  function keyFn(k){const d=RT.S[KEY];if(k==='PWR')L.power();if(k==='CHK')L.check();if(k==='V+'||k==='V-'){d.v=clamp(Math.round((d.v+(k==='V+'?0.05:-0.05))*100)/100,0,VMAX);RT.dirty=true}}
  return {key:KEY,prefix:P,size:[W,H],name:['Variable AC supply','مصدر الجهد المتردد المتغيّر'],fresh,svg,keyFn,wheel:['V'],knobInfo:()=>'≈ '+RT.S[KEY].v.toFixed(2)+' V ~',
    leads:[{k:'acL',label:'~ OUT',from:J.L,banana:true,circuit:true,pol:'+',tray:'AC out (red)',jn:'VAR OUT'},{k:'acN',label:'~ OUT',from:J.N,banana:true,circuit:true,pol:'-',tray:'AC out (blue)',jn:'VAR OUT −'}],
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr||l.acL.node==null||l.acN.node==null)return;const a=ck.idx(l.acL.node),b=ck.idx(l.acN.node);ck.els.push({t:'XS',a,b,s:1,vp:d.v*Math.SQRT2,f:F,r:0.3});ck.ac={a,b,vp:d.v*Math.SQRT2}},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.ac;if(c)L.trip(srcI(RT,c.a,c.b,0.3,c.vp))}};
};
ENGINE.variac.size=[460,250];

/* ---------- three-phase transformer, Y secondary (Exp 5) ---------- */
ENGINE.xf3=function(RT,opt){const KEY='x3',P='x',W=360,H=320,F=60,VP=opt.vp||24,R=0.6;const L=lock(RT,KEY,'المحوّل');
  const J={a:{x:70,y:270},b:{x:140,y:270},c:{x:210,y:270},n:{x:290,y:270}};const PH={a:0,b:-2*Math.PI/3,c:2*Math.PI/3};
  function fresh(){return {pwr:false,ok:false,sig:''}}
  function svg(){const d=RT.S[KEY];let s=`<rect width="${W}" height="${H}" rx="12" fill="#e2482f" stroke="#8e2414" stroke-width="2.5"/><rect x="14" y="14" width="${W-28}" height="${H-28}" rx="6" fill="#f2f0ea" stroke="#b9b3a5"/>`;
    s+=T(28,40,'3-PHASE TRANSFORMER',{size:12,w:700,fill:'#2f3128'})+T(28,58,`Y secondary · ${VP} V phase · ${(VP*Math.sqrt(3)).toFixed(1)} V line · 60 Hz`,{size:9,fill:'#5c584d'});
    s+=`<rect x="${W-70}" y="28" width="36" height="52" rx="5" fill="#3b3f42" stroke="#111" data-k="${P}:PWR" style="cursor:pointer"/><rect x="${W-65}" y="${d.pwr?32:54}" width="26" height="22" rx="3" fill="${d.pwr?'#e74c3c':'#7a2a22'}" pointer-events="none"/>`+T(W-52,94,'POWER',{size:7.5,a:'middle',fill:'#2f3128'});
    /* the Y symbol */const cx=150,cy=150;['a','b','c'].forEach((k,i)=>{const ang=-Math.PI/2+i*2*Math.PI/3;s+=`<line x1="${cx}" y1="${cy}" x2="${cx+Math.cos(ang)*58}" y2="${cy+Math.sin(ang)*58}" stroke="#2f3128" stroke-width="2"/>`+T(cx+Math.cos(ang)*72,cy+Math.sin(ang)*72+4,k,{size:12,a:'middle',w:700,fill:'#2f3128'})});
    s+=`<circle cx="${cx}" cy="${cy}" r="4" fill="#2f3128"/>`+T(cx+14,cy+16,'n',{size:12,w:700,fill:'#2f3128'});
    s+=`<circle cx="${W-52}" cy="118" r="6" fill="${d.pwr?'#ff4433':'#6b3a3a'}"/>`;
    s+=chkBtn(W-158,190,d.ok,P);
    s+=post(J.a.x,J.a.y,'#1d1f20','a (L1)')+post(J.b.x,J.b.y,'#1d1f20','b (L2)')+post(J.c.x,J.c.y,'#1d1f20','c (L3)')+post(J.n.x,J.n.y,'#2f5fd0','n');return s}
  function keyFn(k){if(k==='PWR')L.power();if(k==='CHK')L.check()}
  return {key:KEY,prefix:P,size:[W,H],name:['Three-phase transformer','المحوّل ثلاثي الطور'],fresh,svg,keyFn,
    leads:['a','b','c','n'].map(k=>({k:'x3'+k,label:k==='n'?'n':k.toUpperCase()+' (L'+(k.charCodeAt(0)-96)+')',from:J[k],banana:true,circuit:true,pol:k==='n'?'-':'+',tray:'3φ '+k,jn:'3φ '+k})),
    stamp(ck){const d=RT.S[KEY],l=RT.S.leads;if(!d.pwr||l.x3n.node==null)return;const n=ck.idx(l.x3n.node);ck.x3=[];
      ['a','b','c'].forEach(k=>{const q=l['x3'+k];if(q.node==null)return;const a=ck.idx(q.node);ck.els.push({t:'XS',a,b:n,s:1,vp:VP*Math.SQRT2,f:F,r:R,ph:PH[k]});ck.x3.push({a,b:n,ph:PH[k]})})},
    measure(){L.watch();const c=RT.TB&&RT.TB.ck&&RT.TB.ck.x3;if(c)c.forEach(q=>L.trip(srcI(RT,q.a,q.b,R,VP*Math.SQRT2,q.ph)))},VP};
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
