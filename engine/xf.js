/* Center-tapped transformer of Exp 4 (A, B = center tap, C), with the instructor check and the mains plug.
   Secondary: A–B = B–C = 6.4 V rms (9 V peak), 60 Hz. State in S.xf. */
ENGINE.xf=function(RT,opt){
const FQ=60,VP=9.0,XR=1.5;
const XF0=opt.at;
const XT={tA:{x:XF0.x+420,y:XF0.y+80,c:'#ff8c2e',l:'A'},tB:{x:XF0.x+420,y:XF0.y+150,c:'#3cbf5c',l:'B'},tC:{x:XF0.x+420,y:XF0.y+220,c:'#3f8cff',l:'C'}};
function xfSVG(){const x=XF0.x,y=XF0.y,X=RT.S.xf;let s=`<g>`;
  s+=`<rect x="${x}" y="${y}" width="440" height="290" rx="14" fill="#6e3b2a" stroke="#3e1f15" stroke-width="3"/>`;
  s+=`<rect x="${x+16}" y="${y+16}" width="408" height="258" rx="10" fill="#7d4632"/>`;
  s+=T(x+30,y+44,'CENTER-TAPPED TRANSFORMER',{size:15,fill:'#ffe3c9',w:600})+T(x+30,y+66,'Primary 220 V rms · 60 Hz',{size:12,fill:'#f2c9ab'})+T(x+30,y+86,'Secondary: A–B = B–C = 6.4 V rms (vS = 18 Vpp)',{size:12,fill:'#f2c9ab'});
  // symbol
  const cx=x+250;let coil='';for(let i=0;i<6;i++)coil+=`<path d="M${cx-40} ${y+120+i*20} a10 10 0 0 1 0 20" fill="none" stroke="#ffe3c9" stroke-width="2.2"/>`;for(let i=0;i<8;i++)coil+=`<path d="M${cx+30} ${y+100+i*20} a10 10 0 0 0 0 20" fill="none" stroke="#ffe3c9" stroke-width="2.2"/>`;
  s+=coil+`<line x1="${cx-8}" y1="${y+105}" x2="${cx-8}" y2="${y+255}" stroke="#ffe3c9" stroke-width="2"/><line x1="${cx-2}" y1="${y+105}" x2="${cx-2}" y2="${y+255}" stroke="#ffe3c9" stroke-width="2"/>`;
  s+=`<path d="M${cx+30} ${y+100} H${x+410} V${XT.tA.y}" fill="none" stroke="#ffe3c9" stroke-width="1.6"/><path d="M${cx+30} ${y+180} H${x+410}" fill="none" stroke="#ffe3c9" stroke-width="1.6"/><path d="M${cx+30} ${y+260} H${x+410} V${XT.tC.y}" fill="none" stroke="#ffe3c9" stroke-width="1.6"/>`;
  ['tA','tB','tC'].forEach(k=>{const t=XT[k];s+=`<circle cx="${t.x}" cy="${t.y}" r="13" fill="${t.c}" stroke="#1c0d08" stroke-width="3"/>`+T(t.x-24,t.y+5,t.l,{size:15,fill:'#fff',a:'end',w:600})});
  s+=T(x+300,y+186,'center tap',{size:10,fill:'#f2c9ab'});
  // mains plug & buttons
  s+=`<path d="M${x} ${y+250} C${x-20} ${y+300} ${x+30} ${y+340} ${x+70} ${y+345}" fill="none" stroke="#111" stroke-width="6"/>`;
  s+=`<rect x="${x+70}" y="${y+328}" width="${X.plugged?150:150}" height="34" rx="8" fill="${X.plugged?'#3cd070':'#c7d0d4'}" stroke="#7d8c92" data-k="x:PLUG" style="cursor:pointer"/>`+T(x+145,y+350,X.plugged?'🔌 Plugged in (ON)':'🔌 Plug in',{size:12,a:'middle',w:600});
  s+=`<rect x="${x+232}" y="${y+328}" width="210" height="34" rx="8" fill="#eef2f3" stroke="#7d8c92" data-k="x:CHECK" style="cursor:pointer"/>`+T(x+337,y+350,'Ask instructor to check',{size:12,a:'middle',w:600});
  if(X.say){s+=`<rect x="${x}" y="${y+372}" width="760" height="26" rx="6" fill="${X.ok?'#11241a':'#2a1513'}" stroke="${X.ok?'#2e6b44':RED}"/>`+`<text x="${x+750}" y="${y+390}" font-size="13" fill="${X.ok?'#9ff0b4':'#ffb3ab'}" text-anchor="end" direction="rtl" pointer-events="none" font-family="Plex Arabic, IBM Plex Sans Arabic, sans-serif">${X.say}</text>`}
  return s+`</g>`}
function safety(){const ck=RT.buildUser(true);const L=RT.S.leads;
  if(L.tA.node==null||L.tB.node==null||L.tC.node==null)return [false,'المعيد: وصّل أطراف المحوّل الثلاثة A و B و C أول.'];
  const r=SOLVER.simulate(ck,FQ,3);if(r.imax>1.5)return [false,'المعيد: فيه short على المحوّل! راجع التوصيل قبل ما توصله بالكهرباء.'];
  for(const id in r.capMin){if(r.capMin[id]<-0.8)return [false,'المعيد: المكثف معكوس! الطرف السالب لازم يروح للأرضي.']}
  if(L.c1b.node==null||L.c2b.node==null)return [true,'المعيد: الدائرة سليمة، بس لا تنسى أسود CH1 و CH2 على الأرضي (B).'];
  return [true,'المعيد: تمام، تقدر توصّل المحوّل بالكهرباء ✓'];}
function postSim(){if(!RT.S.xf.plugged||!RT.TB)return;const ck=RT.buildUser(false);const r=SOLVER.simulate(ck,FQ,3);
  for(const id in r.capMin){if(r.capMin[id]<-0.8){const p=RT.S.parts.find(q=>q.id===+id);if(p&&!p.dead){p.dead=true;RT.S.xf.say='💥 المكثف انفجر لأنه معكوس! افصل المحوّل وبدّله بمكثف جديد بالاتجاه الصحيح.';RT.S.xf.ok=false;RT.dirty=true;RT.recompute()}}}
  if(r.imax>1.5){RT.S.xf.plugged=false;RT.S.xf.say='⚡ الفيوز ضرب: فيه short على المحوّل. افصل وراجع التوصيل.';RT.S.xf.ok=false;RT.dirty=true;RT.recompute()}}
function xfKey(k){const X=RT.S.xf;if(k==='CHECK'){const [ok,say]=safety();X.ok=ok;X.say=say;if(ok)X.once=true;return}
  if(k==='PLUG'){if(X.plugged){X.plugged=false;X.say='تم فصل المحوّل.';RT.dirty=true;return}if(!X.ok&&!X.once){X.say='لازم المعيد يشيك على الدائرة أول (Ask instructor to check).';return}X.plugged=true;X.say='';RT.dirty=true}}
/* the instructor inspects the circuit once before the first plug-in (manual's caution); later changes are the student's */
function fresh(){return {plugged:false,ok:false,once:false,say:'',blown:null}}
return {key:'xf',prefix:'x',fresh,svg:xfSVG,keyFn:xfKey,wheel:[],FQ,
  size:[770,400],
  leads:['tA','tB','tC'].map(k=>({k,label:XT[k].l,from:XT[k],circuit:true,banana:true})),
  cables:D=>['tA','tB','tC'].map(k=>D.banana(XT[k],k)).join(''),
  stamp(ck,force){const L=RT.S.leads;const on=force||RT.S.xf.plugged;
    if(on&&L.tA.node!=null&&L.tB.node!=null)ck.els.push({t:'XS',a:ck.idx(L.tA.node),b:ck.idx(L.tB.node),s:1,vp:VP,f:FQ,r:XR});
    if(on&&L.tC.node!=null&&L.tB.node!=null)ck.els.push({t:'XS',a:ck.idx(L.tC.node),b:ck.idx(L.tB.node),s:-1,vp:VP,f:FQ,r:XR})},
  onCircuitChange(){RT.S.xf.ok=false},
  postSim,safety};
};
ENGINE.xf.size=[770,400];
