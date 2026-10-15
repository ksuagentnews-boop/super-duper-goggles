/* ======================= BENCH SHELL =======================
   Seated view of one table: overview of the instruments, tap a device to zoom on it, parts bag, live step checker.
   Three modes (Batch 6): 'manual' (follows the lab manual step by step, live checks, readings recorded by «Capture», no grading),
   'exam' (the same steps; the student types the readings and answers, graded; the helpers cost marks) and
   and 'free' (same table and instruments, no steps and no checks). */
const BENCH={
  view:'ov',mode:'manual',lastGuided:'manual',helpers:{build:0,do:0,hint:0,skip:0},
  /* Manual and Exam both follow the steps; Free has none */
  guided(){return this.mode!=='free'},
  /* Exam: the score is out of the experiment's graded steps (the steps that record something), else def.marks / 10 */
  marks(){const d=EXP_DEFS[this.exp]||{};if(d.marks)return d.marks;const n=((this.sim&&this.sim.steps)||[]).filter(s=>s.rec).length;return n||10},paint:null,lineLog:[],exp:null,sim:null,done:[],drawer:false,vb:null,anim:0,built:null,
  el:{},
  init(){
    const E=this.el={view:$q('#benchView'),stage:$q('#bstage'),svgHost:$q('#svgHost'),paperHost:$q('#paperHost'),zoomUI:$q('#zoomUI'),zEn:$q('#zEn'),zAr:$q('#zAr'),
      ovHint:$q('#ovHint'),bagBtn:$q('#bagBtn'),bagAr:$q('#bagAr'),drawer:$q('#drawer'),bag:$q('#bag'),dHint:$q('#dHint'),card:$q('#stepCard'),toast:$q('#toast')};
    $q('#zBack').onclick=()=>this.back();
    E.bagBtn.onclick=()=>this.setDrawer(!this.drawer);
    $q('#dClose').onclick=()=>this.setDrawer(!this.drawer);
    $q('#bPanelBtn').onclick=()=>this.togglePanel();
    $q('#bPanelClose').onclick=()=>this.togglePanel(false);
    $q('#bLabOnly').onclick=()=>this.labOnly(true);$q('#labShow').onclick=()=>this.labOnly(false);
    $q('#bReset').onclick=()=>{this.sim.reset();this.done=[];this.sim.render();this.say('بدأت من جديد')};
    $q('#bSwitch').onclick=()=>{this.enter(this.exp,this.mode==='free'?this.lastGuided:'free',true)};
    /* paint bucket: open → pick a swatch → tap wires; ✕ or the bucket again leaves the mode */
    $q('#pBucket').onclick=()=>this.setPaint(this.paint===null?(this.lastPaint||'red'):null);
    $q('#pSw').querySelectorAll('button').forEach(b=>b.onclick=()=>this.setPaint(b.dataset.c==='x'?null:b.dataset.c));
    /* «✥ تحريك»: move mode shows the ✥ handles on every instrument; a tap on a device body then does not zoom */
    $q('#bMove').onclick=()=>this.setMove(!this.moveMode);
    $q('#bLayout').onclick=()=>{if(this.sim&&this.sim.resetLayout){this.sim.resetLayout();this.say('رجعت الأجهزة لترتيبها الافتراضي')}};
    $q('#bQuick').onclick=()=>QUICK.open($q('#bQuick'));
    $q('#bStand').onclick=()=>this.leave();
    addEventListener('keydown',e=>{if(E.view.hidden)return;if(e.key==='Escape'){if(this.view!=='ov')this.back()}});
    /* iPhone: size the bench to the visual viewport and re-fit on resize / rotation / toolbar changes */
    const vv=window.visualViewport;const sync=()=>{if(vv){const st=E.view.style;st.top=vv.offsetTop+'px';st.left=vv.offsetLeft+'px';st.width=vv.width+'px';st.height=vv.height+'px'}if(!E.view.hidden)requestAnimationFrame(()=>this.refit(false))};
    addEventListener('resize',sync);addEventListener('orientationchange',()=>setTimeout(sync,250));if(vv){vv.addEventListener('resize',sync);vv.addEventListener('scroll',sync)}this._vvSync=sync;sync();
    this.panelDefault();this.gestures();this.bagTouch();
    /* the stage can change size without a window resize (iOS toolbars, the host app's bars, the sheet panel): refit then too */
    if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(E.view.hidden)return;const {W,H}=this.stageSize();E.view.classList.toggle('tall',H>W*1.1);if(this._to&&!this.user){const t=this.fit(this.curRect());if(t)this._to=t}else this.refit(false)});[E.stage,E.drawer,E.card].forEach(x=>x&&ro.observe(x))}
  },
  sheetOverlay(){return matchMedia('(max-width:900px),(max-height:520px),(pointer:coarse) and (max-width:1400px)').matches},
  panelDefault(){const mob=BENCH.sheetOverlay();this.el.view.classList.toggle('panel-closed',!mob&&false);this.el.view.classList.remove('panel-open')},
  togglePanel(force){const v=this.el.view,mob=BENCH.sheetOverlay();
    if(mob){const open=force!==undefined?force:!v.classList.contains('panel-open');v.classList.toggle('panel-open',open)}
    else{const closed=force!==undefined?!force:!v.classList.contains('panel-closed');v.classList.toggle('panel-closed',closed);this.dockCard();if(this.sim&&this.guided())this.drawStepCard();requestAnimationFrame(()=>this.refit(false))}},
  /* «المعمل بس»: the right-hand page (manual sheet, and the step card in Manual) slides away so only the bench shows; a
     small tab brings it back (in Manual it shows the current step); remembered for the session */
  labOnly(on,quiet){const v=this.el.view;if(on===undefined){try{on=sessionStorage.getItem('eelab:labonly')==='1'}catch(_){on=false}}
    else try{sessionStorage.setItem('eelab:labonly',on?'1':'0')}catch(_){}
    const bp=$q('#bpanel');if(quiet){bp.style.transition='none';requestAnimationFrame(()=>requestAnimationFrame(()=>bp.style.transition=''))}
    v.classList.toggle('lab-only',on);if(on)v.classList.remove('panel-open');if(!this.sheetOverlay())v.classList.toggle('panel-closed',on);
    this.dockCard&&this.dockCard();this.labChip();if(!quiet){this.refit(false);setTimeout(()=>this.refit(false),320)}},
  labChip(){const b=$q('#labShow'),t=$q('#labShowT'),on=this.el.view.classList.contains('lab-only');b.hidden=!on||!this.sim||!!this.sim.pc&&this.mode!=='manual';if(!on||!this.sim)return;
    if(this.guided()&&this.sim.steps){const i=this.cur(),n=this.sim.steps.length,k=this.el.card.querySelector('.num');t.textContent=i>=n?'خلصت الخطوات':`الخطوة ${k?k.textContent:i+1}`}else t.textContent='المانيوال'},
  /* exp = registry id, e.g. 'ee312/exp3'; the experiment file is loaded on first use */
  enter(exp,mode,force){
    const E=this.el;E.view.hidden=false;HALL.pause();
    if(!force&&this.built===exp+'|'+mode){this.refit(false);return}
    if(!EXP_DEFS[exp]){REGISTRY.load(exp).then(()=>this.enter(exp,mode,true)).catch(()=>{this.say('تعذّر تحميل التجربة');this.leave()});return}
    this.exp=exp;this.mode=mode;if(mode!=='free')this.lastGuided=mode;this.helpers={build:0,do:0,hint:0,skip:0};this.caps={};this.subDone={};this.built=exp+'|'+mode;this.lineLog=[];STATS.start(exp,mode);this.view='ov';this.setUser(false);this.done=[];this.sim=null;this.setMove(false);this.devZoom();
    E.view.dataset.mode=mode;
    /* the parts box stays open next to the board (its arrow collapses it); none on PC tables or benches without parts */
    const hasBag=!EXP_DEFS[exp].pc&&!!(EXP_DEFS[exp].tray&&EXP_DEFS[exp].tray.length);E.view.classList.toggle('no-wires',!(EXP_DEFS[exp].tray||[]).some(t=>t[0]==='W'||(EXP_DEFS[exp].parts[t[0]]||{}).t==='BR'));this.setPaint(null,true);E.view.classList.toggle('no-bag',!hasBag);/* portrait phones: the box starts folded (its arrow opens it) so the desk keeps the width */const bagOpen=hasBag&&innerWidth>=520;this.drawer=bagOpen;E.view.classList.toggle('drawer-open',bagOpen);$q('#dClose').textContent=bagOpen?'◂':'▸';
    E.svgHost.innerHTML='';E.paperHost.innerHTML='';const PC=!!EXP_DEFS[exp].pc;E.view.classList.toggle('pc-mode',PC);
    if(!PC)E.svgHost.appendChild(document.getElementById('tpl-svg').content.cloneNode(true));
    E.paperHost.innerHTML=EXP_DEFS[exp].sheet;
    const X=REGISTRY.exp(exp);$q('#bTitle').textContent=X.lab.code+' · تجربة '+X.num;$q('#bSub').textContent=X.en;
    const chip=$q('#bChip');chip.textContent={free:'الطور الحر',exam:'الاختبار',manual:'المانيوال'}[mode];chip.classList.toggle('exam',mode==='free');chip.classList.toggle('test',mode==='exam');
    $q('#bSwitch').textContent=mode==='free'?(this.lastGuided==='exam'?'بدّل للاختبار':'بدّل للمانيوال'):'بدّل للحر';
    /* Manual: the sheet fills itself from the captures (read-only, no grading); Exam: the student types and it is graded */
    if(mode==='manual')E.paperHost.querySelectorAll('input,select,textarea').forEach(i=>{if(i.tagName==='SELECT')i.disabled=true;else i.readOnly=true;i.classList.add('capin')});
    this.svg=PC?null:document.getElementById('bench');this.hl=PC?{innerHTML:''}:document.getElementById('Lhl');
    if(!PC){this.svg.addEventListener('pointermove',e=>this.hover(e));this.svg.addEventListener('pointerleave',()=>{if(this.view==='ov')this.hl.innerHTML=''})}
    this._bagShown=false;
    this.labOnly(undefined,true);
    if(PC){this.view='pc';ENGINE.runPC(EXP_DEFS[exp])}else ENGINE.run(EXP_DEFS[exp]);
    /* small screens: the step card starts folded so the overview gets the height */
    E.card.classList.toggle('min',!PC&&(innerHeight<=500||innerWidth<=600));E.card.dataset.key='';
    if(this._vvSync)this._vvSync();this.ui();this.syncLayoutBtn();
    requestAnimationFrame(()=>{this.refit(false)});
  },
  leave(toHall){STATS.endSeat();this.setDrawer(false,true);this.el.view.hidden=true;if(toHall)HALL.resume();else HALL.standUp()},
  register(sim){this.sim=sim;this.procInit();this.calcOv();
    const bag=this.el.bag;bag.innerHTML='';
    sim.tray.forEach(({t,l})=>{const b=document.createElement('button');b.className='bag-item';b.dataset.t=t;b.innerHTML=sim.icon(t)+`<small>${l}</small>`;
      b.addEventListener('pointerdown',e=>{e.preventDefault();if(e.pointerType==='mouse')sim.trayDown(t,e)});b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sim.trayDown(t,{clientX:0,clientY:0,pointerId:0});}});bag.appendChild(b)});
  },
  /* «العلبة» on touch: a swipe up/down scrolls it (with momentum), a sideways move or a short hold lifts the part out,
     a tap arms it; a slim scrollbar strip on its inner edge thickens when touched, its thumb drags and its track jumps */
  bagTouch(){const bag=this.el.bag,bar=$q('#bagBar'),th=bar.firstElementChild;let g=null,fl=0;
    const sync=()=>{const ch=bag.clientHeight,sh=bag.scrollHeight;bar.style.top=bag.offsetTop+'px';bar.style.height=ch+'px';bar.classList.toggle('none',sh<=ch+1);
      const h=Math.max(36,ch*ch/Math.max(sh,1)),y=(sh>ch?bag.scrollTop/(sh-ch):0)*(ch-h);th.style.height=h+'px';th.style.transform=`translateY(${y}px)`;return {ch,sh,h}};
    this.bagSync=sync;bag.addEventListener('scroll',sync,{passive:true});if(window.ResizeObserver)new ResizeObserver(sync).observe(bag);
    const fling=v=>{cancelAnimationFrame(fl);let last=performance.now();const step=now=>{const dt=now-last;last=now;bag.scrollTop-=v*dt;v*=Math.pow(0.994,dt);if(Math.abs(v)>0.02)fl=requestAnimationFrame(step)};fl=requestAnimationFrame(step)};
    const lift=e=>{const it=g.item;clearTimeout(g.t);g=null;it.classList.remove('hold');this.sim&&this.sim.trayDown(it.dataset.t,e)};
    bag.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||!this.sim)return;e.preventDefault();cancelAnimationFrame(fl);
      const item=e.target.closest('.bag-item');g={x:e.clientX,y:e.clientY,st:bag.scrollTop,item,mode:null,id:e.pointerId,v:0,ly:e.clientY,lt:performance.now()};
      try{bag.setPointerCapture(e.pointerId)}catch(_){}
      if(item){g.t=setTimeout(()=>{if(g&&!g.mode&&g.item){g.item.classList.add('hold');try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}lift(g.ev||e)}},300)}});
    bag.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;g.ev=e;const dx=e.clientX-g.x,dy=e.clientY-g.y;
      if(!g.mode&&Math.hypot(dx,dy)>8){if(g.item&&Math.abs(dx)>Math.abs(dy)){lift(e);return}g.mode='scroll';clearTimeout(g.t);bar.classList.add('on')}
      if(g.mode==='scroll'&&g.item&&e.clientX>this.el.drawer.getBoundingClientRect().right+12){bag.scrollTop=g.st;bar.classList.remove('on');lift(e);return}/* scrolled, then pulled out sideways: it was a part being taken out */
      if(g.mode==='scroll'){bag.scrollTop=g.st-dy;const now=performance.now(),dt=Math.max(1,now-g.lt);g.v=0.7*g.v+0.3*((e.clientY-g.ly)/dt);g.ly=e.clientY;g.lt=now}});
    const up=e=>{if(!g||e.pointerId!==g.id)return;clearTimeout(g.t);const G=g;g=null;bar.classList.remove('on');
      if(G.mode==='scroll'){if(performance.now()-G.lt<80&&Math.abs(G.v)>0.15)fling(G.v)}else if(G.item&&e.type==='pointerup'&&this.sim)this.sim.trayTap(G.item.dataset.t)};
    bag.addEventListener('pointerup',up);bag.addEventListener('pointercancel',up);
    /* the strip: drag the thumb, tap the track to jump there */
    let b=null;bar.addEventListener('click',e=>e.stopPropagation());/* a tap target in its own right: touch adjustment must not hand the tap to a part beside it */
    bar.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();cancelAnimationFrame(fl);const {ch,sh,h}=sync();if(sh<=ch)return;bar.classList.add('on');
      const r=bar.getBoundingClientRect(),tr=th.getBoundingClientRect();try{bar.setPointerCapture(e.pointerId)}catch(_){}
      if(e.clientY<tr.top||e.clientY>tr.bottom){const f=Math.min(1,Math.max(0,(e.clientY-r.top-h/2)/(ch-h)));bag.scrollTo({top:f*(sh-ch),behavior:'smooth'});b={y:e.clientY,st:f*(sh-ch),k:(sh-ch)/(ch-h)}}
      else b={y:e.clientY,st:bag.scrollTop,k:(sh-ch)/(ch-h)}});
    bar.addEventListener('pointermove',e=>{if(!b)return;if(Math.abs(e.clientY-b.y)>3)bag.scrollTop=b.st+(e.clientY-b.y)*b.k});
    const bu=()=>{b=null;bar.classList.remove('on')};bar.addEventListener('pointerup',bu);bar.addEventListener('pointercancel',bu)},
  setPaint(c,quiet){this.paint=c;const on=c!==null;$q('#pSw').hidden=!on;$q('#pBucket').setAttribute('aria-pressed',on);
    $q('#pSw').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));if(this.svg)this.svg.classList.toggle('painting',on);
    if(c)this.lastPaint=c;if(quiet)return;if(on&&this.sim&&this.sim.render)this.sim.render();/* the wires' tap areas widen while painting */
    if(on)this.say(c?`اضغط على سلك أو bridging plug عشان تلوّنه ${(({black:'أسود',red:'أحمر',blue:'أزرق',grey:'رمادي',yellow:'أصفر',green:'أخضر'})[c]||'')}، والسلك الجديد ياخذ نفس اللون`:'اختر لون، وبعدها اضغط على السلك اللي تبي تلوّنه');else if(this.sim&&this.sim.render)this.sim.render()},
  calcOv(){const R=this.sim.regions;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const k in R){const r=R[k];x0=Math.min(x0,r[0]);y0=Math.min(y0,r[1]);x1=Math.max(x1,r[0]+r[2]);y1=Math.max(y1,r[1]+r[3])}
    this.ovRect=[x0,y0,x1-x0,y1-y0]},
  /* an instrument was moved (k) or the default arrangement restored: the overview takes in the new desk; the camera only
     follows when something left the visible area (or on a reset) */
  clearHover(){this._hk=null;if(this.hl)this.hl.innerHTML=''},
  layoutChanged(reset,k){if(!this.sim||this.sim.pc)return;this.clearHover();this.calcOv();this.syncLayoutBtn();if(this.view!=='ov'&&!reset)return;
    const v=this.vb,r=k&&this.sim.regions[k];const out=!v||!r||r[0]<v.x||r[1]<v.y||r[0]+r[2]>v.x+v.w||r[1]+r[3]>v.y+v.h;if(reset)this.refit(true,true);else if(out&&!this.user)this.refit(true)},
  syncLayoutBtn(){const b=$q('#bLayout');if(b)b.classList.toggle('dim',!!(this.sim&&this.sim.isDefault&&this.sim.isDefault()))},
  drawerSync(){if(!this.sim)return;const a=this.sim.armed(),w=this.sim.isWire();
    this.el.bag.querySelectorAll('.bag-item').forEach(b=>b.classList.toggle('on',b.dataset.t===a||(b.dataset.t==='W'&&w)));
    this.el.dHint.textContent=w?'وضع السلك: اضغط على node ثم node ثانية على اللوحة':a?'اضغط بين nodeين متجاورين على اللوحة عشان تركّب القطعة':'اسحب القطعة للوحة، أو اضغطها ثم اضغط بين nodeين'},
  /* ---- view / camera ---- */
  /* the stage as the student really sees it: the bench is sized to the visual viewport (iOS toolbars, the host app's
     bar) and keeps out of the safe areas (CSS), so the stage box is the visible area */
  stageSize(){return {W:this.el.stage.clientWidth,H:this.el.stage.clientHeight}},
  /* what the overview may use: the hint and the tool buttons float over the desk and take no space */
  /* the free area of the stage: minus the parts box (left), the step card (bottom), the zoom chip (top) and the bench tools —
     a column on the right in landscape, a row on top on tall screens — so nothing on the desk ever sits under them */
  tools(){const t=$q('#benchView .btools');if(!t||this.el.view.classList.contains('devzoom')||(this.sim&&this.sim.pc)||getComputedStyle(t).display==='none')return {right:0,top:0};
    const tall=this.el.view.classList.contains('tall'),r=t.getBoundingClientRect();return tall?{right:0,top:r.height+10}:{right:r.width+10,top:0}},
  pads(){const T=this.tools();let top=this.view==='ov'?8:this.el.view.classList.contains('devzoom')?(this.stageSize().H<520?40:56):60;top=Math.max(top,T.top);let bottom=8;
    let cr=0;if(this.guided()&&!this.el.card.hidden&&this.el.card.classList.contains('in-stage'))cr=this.el.card.offsetWidth+12;
    const left=this.el.view.classList.contains('no-bag')||this.el.view.classList.contains('devzoom')?0:this.el.drawer.offsetWidth+8;
    return {top,bottom,left,right:Math.max(T.right,cr)}},
  /* free area of the overview in px (used by the layout search before anything is drawn) */
  availArea(){const {W,H}=this.stageSize();const small=innerHeight<=500||innerWidth<=600;const bag=!this.el.view.classList.contains('no-bag');
    const left=bag?(this.drawer?(small?104:136)+(matchMedia('(pointer:coarse)').matches?12:0):42):0;const docked=this.guided()&&!this.el.view.classList.contains('lab-only')&&(this.sheetOverlay()||this.el.view.classList.contains('panel-closed'));const card=docked?(this.el.card.classList.contains('min')?(small?150:200):Math.min(small?250:330,W*0.36)):0;const tall=H>W*1.1,tr=tall?0:(small?70:96),tt=tall?52:0;return {W:Math.max(200,W-left-16-Math.max(tr,card)),H:Math.max(150,H-16-tt)}},
  fit(r){const {W,H}=this.stageSize();if(!W||!H)return null;const {top,bottom,left,right}=this.pads();const m=Math.min(12,W*0.015);
    /* ≈4 % margin around what is on the desk */
    const mg=this.el.view.classList.contains('devzoom')?0:0.02,mx=r[2]*mg,my=r[3]*mg;r=[r[0]-mx,r[1]-my,r[2]+2*mx,r[3]+2*my];
    const aw=Math.max(60,W-2*m-left-right),ah=Math.max(60,H-top-bottom);const s=Math.max(r[2]/aw,r[3]/ah);const vw=W*s,vh=H*s;
    const cx=left+m+aw/2,cy=top+ah/2;return {x:r[0]+r[2]/2-cx*s,y:r[1]+r[3]/2-cy*s,w:vw,h:vh}},
  setVB(v){{const {W,H}=this.stageSize();if(W&&H)this.el.view.classList.toggle('tall',H>W*1.1)}this.vb=v;this.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);if(this._tmk||this.el.view.classList.contains('devzoom'))this.syncTouchMenu();if(this.sim&&this.sim.RT&&this.sim.RT.camera)this.sim.RT.camera()},
  /* a smooth camera move (≈380 ms ease); the target may be updated while it runs (e.g. the parts box hides as a device
     zoom starts and the free area grows), so the move never ends in a jump */
  animTo(to){if(!to)return;cancelAnimationFrame(this.anim);this._to=to;if(!this.vb||reduceMotion){this.setVB(to);this._to=null;return}const from={...this.vb},t0=performance.now(),dur=380;
    const step=now=>{const k=ease(Math.min(1,(now-t0)/dur)),t=this._to;if(!t)return;this.setVB({x:from.x+(t.x-from.x)*k,y:from.y+(t.y-from.y)*k,w:from.w+(t.w-from.w)*k,h:from.h+(t.h-from.h)*k});if(k<1)this.anim=requestAnimationFrame(step);else this._to=null};this.anim=requestAnimationFrame(step)},
  /* focus: the device plus a margin of context (about a quarter of its size on each side), never closer than that */
  curRect(){if(this.view==='ov')return this.ovRect;
    /* board zoom: the plug-in panel itself at ≈90 % of the free area (the parts box stays; the lead tray is a pan away) */
    if(this.view==="board"&&this.sim.boardRect){const r=this.sim.boardRect,m=0.015;return [r[0]-r[2]*m,r[1]-r[3]*m-16,r[2]*(1+2*m),r[3]*(1+2*m)+16]}
    const r=this.sim.regions[this.view];if(this.el.view.classList.contains('devzoom')){/* the device body itself, edge to edge (≈97 % of the limiting side) */const b=(this.sim.bodyRect&&this.sim.bodyRect(this.view))||r,m=0.016;return [b[0]-b[2]*m,b[1]-b[3]*m,b[2]*(1+2*m),b[3]*(1+2*m)]}const small=this.stageSize().H<520,f=small?0.1:0.26;const mx=Math.max(small?24:70,r[2]*f),my=Math.max(small?20:60,r[3]*f);return [r[0]-mx,r[1]-my,r[2]+2*mx,r[3]+2*my]},
  /* free pan & zoom (like a map): pinch / wheel between the fitted view and ≈4× closer, drag on empty desk to pan a little
     past the edges; double-tap or «عرض كامل» refits. The camera is the SVG viewBox, so nothing is laid out again. */
  refit(anim,force){if(!this.sim||!this.svg)return;if(this.user&&!force){const c=this.clampVB(this.vb);c&&this.setVB(c);return}this.setUser(false);
    const t=this.fit(this.curRect());if(anim)this.animTo(t);else if(this._to)this._to=t;else{cancelAnimationFrame(this.anim);t&&this.setVB(t)}},
  setUser(on){this.user=on;const b=$q('#bFit');if(b)b.hidden=!on||!!(this.sim&&this.sim.pc)},
  clampVB(v){const f=this.fit(this.curRect());if(!f||!v)return v;const w=clamp(v.w,f.w/4,f.w),h=w*f.h/f.w;let cx=v.x+v.w/2,cy=v.y+v.h/2;const mx=f.w*0.08,my=f.h*0.08;
    cx=clamp(cx,f.x+w/2-mx,f.x+f.w-w/2+mx);cy=clamp(cy,f.y+h/2-my,f.y+f.h-h/2+my);return {x:cx-w/2,y:cy-h/2,w,h}},
  toSvg(cx,cy){const r=this.svg.getBoundingClientRect(),v=this.vb;return {x:v.x+(cx-r.left)/r.width*v.w,y:v.y+(cy-r.top)/r.height*v.h,fx:(cx-r.left)/r.width,fy:(cy-r.top)/r.height}},
  zoomAt(cx,cy,k,base){const v=base||this.vb;if(!v)return;const r=this.svg.getBoundingClientRect(),fx=(cx-r.left)/r.width,fy=(cy-r.top)/r.height;const P={x:v.x+fx*v.w,y:v.y+fy*v.h};
    const w=v.w/k,h=v.h/k;cancelAnimationFrame(this.anim);const n=this.clampVB({x:P.x-fx*w,y:P.y-fy*h,w,h});this.setVB(n);const f=this.fit(this.curRect());this.setUser(!!f&&n.w<f.w*0.995)},
  panBy(dx,dy,base){const v=base||this.vb,r=this.svg.getBoundingClientRect();cancelAnimationFrame(this.anim);this.setVB(this.clampVB({x:v.x-dx/r.width*v.w,y:v.y-dy/r.height*v.h,w:v.w,h:v.h}));if(this.vb.w<this.fit(this.curRect()).w*0.995)this.setUser(true)},
  fitAll(){this.setUser(false);this.refit(true,true)},
  /* one finger on empty desk: pan once it moves, otherwise a tap (double-tap = refit) */
  panStart(e,onTap){this.pan={id:e.pointerId,x:e.clientX,y:e.clientY,vb:{...this.vb},moved:false,onTap};try{this.svg.setPointerCapture(e.pointerId)}catch(_){}},
  gestures(){const st=this.el.stage,P=new Map();let pinch=null;
    st.addEventListener('pointerdown',e=>{if(!this.sim||this.sim.pc)return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(P.size===2){const [a,b]=[...P.values()];this.pan=null;if(this.sim.RT&&this.sim.RT.cancelDrag)this.sim.RT.cancelDrag();
        pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,mx:(a.x+b.x)/2,my:(a.y+b.y)/2,vb:{...this.vb}};e.stopPropagation();e.preventDefault()}
      else if(P.size>2){e.stopPropagation()}},true);
    st.addEventListener('pointermove',e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&P.size>=2){const [a,b]=[...P.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        this.zoomAt(pinch.mx,pinch.my,d/pinch.d,pinch.vb);this.panBy(mx-pinch.mx,my-pinch.my,this.vb);e.stopPropagation();return}
      if(pinch){e.stopPropagation();return}
      const p=this.pan;if(p&&p.id===e.pointerId){const dx=e.clientX-p.x,dy=e.clientY-p.y;if(!p.moved&&Math.hypot(dx,dy)>8)p.moved=true;if(p.moved){this.panBy(dx,dy,p.vb);e.stopPropagation()}}},true);
    const up=e=>{P.delete(e.pointerId);if(pinch){if(P.size===0)pinch=null;e.stopPropagation();return}
      const p=this.pan;if(p&&p.id===e.pointerId){this.pan=null;if(p.moved){e.stopPropagation();return}
        const now=performance.now(),last=this._tap;this._tap={t:now,x:e.clientX,y:e.clientY};
        if(last&&now-last.t<320&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<30&&this.user){this._tap=null;this.fitAll();return}p.onTap&&p.onTap()}};
    st.addEventListener('pointerup',up,true);st.addEventListener('pointercancel',up,true);
    st.addEventListener('wheel',e=>{if(!this.sim||this.sim.pc||e.defaultPrevented)return;e.preventDefault();this.zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*(e.ctrlKey?0.01:0.0018)))},{passive:false});
    $q('#bFit').onclick=()=>this.fitAll()},
  /* the overview hint: once per session, small, then it fades away */
  hintOnce(ov){const h=this.el.ovHint;let seen=false;try{seen=sessionStorage.getItem('eelab:hint')==='1'}catch(_){}
    if(!ov||seen||this._hintShown||matchMedia('(pointer:coarse)').matches){h.hidden=true;return}h.hidden=false;h.classList.remove('fade');if(h.clientWidth<160){h.hidden=true;return}this._hintShown=true;h.classList.remove('fade');try{sessionStorage.setItem('eelab:hint','1')}catch(_){}
    clearTimeout(this._hintT);this._hintT=setTimeout(()=>{h.classList.add('fade');setTimeout(()=>{h.hidden=true},700)},4200)},
  ui(){const E=this.el,ov=this.view==='ov';if(this.sim&&this.sim.pc){E.zoomUI.hidden=true;E.ovHint.hidden=true;E.bagBtn.hidden=true;this.drawStepCard();return}E.zoomUI.hidden=ov;E.bagBtn.hidden=true;
    if(this._lastView!==this.view){this._lastView=this.view;this.sim.RT&&this.sim.RT.closePad&&this.sim.RT.closePad()}/* a view change closes the knob buttons */
    E.ovHint.textContent=innerWidth<600&&innerHeight>innerWidth?'اقلب الجوال بالعرض، واضغط على أي جهاز':matchMedia('(pointer:coarse)').matches?'الأزرار شغّالة من هنا · جسم الجهاز يقرّب · «تحريك» تحرّك الأجهزة':'الأزرار والأسلاك شغّالة من هنا · اضغط على جسم الجهاز عشان تقرّب · «✥ تحريك» عشان تحرّك الأجهزة';
    this.hintOnce(ov);
    if(!ov){const n=this.sim.names[this.view];E.zEn.textContent=n[0];E.zAr.textContent=n[1]}
    if(ov)this.hl.innerHTML='';else this.hl.innerHTML='';
    this.drawStepCard()},
  regionAt(p){const R=this.sim.regions;for(const k of Object.keys(R).reverse()){if(k==='rack')continue;const r=R[k];if(p.x>=r[0]&&p.x<=r[0]+r[2]&&p.y>=r[1]&&p.y<=r[1]+r[3])return k}return null},
  ovClick(p){if(this.moveMode)return;const k=this.regionAt(p);if(k){this._hk=null;this.focus(k)}},
  moveMode:false,
  setMove(on){this.moveMode=!!on;this.el.view.classList.toggle('movemode',this.moveMode);const b=$q('#bMove');if(b)b.setAttribute('aria-pressed',String(this.moveMode));if(this.sim&&this.sim.RT&&this.sim.RT.camera)this.sim.RT.camera();
    if(this.moveMode)this.say('وضع التحريك: اسحب أي جهاز من مقبض ✥ · اضغط «تحريك» مرة ثانية للرجوع')},
  focus(k){if(this.sim&&this.sim.pc){this.sim.focus(k);return}if(!this.sim||!this.sim.regions[k])return;this.view=k;this.devZoom();this.ui();this.refit(true,true)},
  /* close device zoom: the device alone at ≈90 % of the screen; the box, hints, tools, board and the other instruments hide */
  devZoom(){setTimeout(()=>this.syncTouchMenu(),0);const k=this.view,on=k!=='ov'&&k!=='board'&&!(this.sim&&this.sim.pc);const E=this.el;E.view.classList.toggle('devzoom',on);
    let st=document.getElementById('zoomStyle');if(!st){st=document.createElement('style');st.id='zoomStyle';document.head.appendChild(st)}
    st.textContent=on?`#benchView.devzoom .Linst>g:not([data-inst="${k}"]),#benchView.devzoom #Lcables g[data-cabof]:not([data-cabof="${k}"]),#benchView.devzoom #Lcables .cablbl,#benchView.devzoom #Lcables .ltray{opacity:0;pointer-events:none}`:'';
    const c=E.card;if(on&&c&&!c.hidden&&(innerHeight<=520||innerWidth<=600)&&!c.classList.contains('min')){c.classList.add('min');c.dataset.key='';this._unminCard=true}
    else if(!on&&this._unminCard){this._unminCard=false;if(c){c.classList.remove('min');c.dataset.key=''}}},
  back(){if(this.sim&&this.sim.pc)return;this.view='ov';this.devZoom();this.ui();this.refit(true,true)},
  /* open / collapse the side parts box */
  setDrawer(open,silent){if(this.el.view.classList.contains('no-bag'))return;this.drawer=open;const E=this.el;E.view.classList.toggle('drawer-open',open);$q('#dClose').textContent=open?'◂':'▸';
    if(!silent)setTimeout(()=>this.refit(true),20)},
  hover(e){if(this.view!=='ov'||!this.sim)return;if(this.svg.classList.contains('grabbing')){this.clearHover();return}const ctl=e.target&&e.target.closest&&e.target.closest('[data-k]');if(ctl&&!ctl.dataset.k.startsWith('node:')){if(this._hk){this._hk=null;this.hl.innerHTML=''}this.svg.style.cursor='pointer';return}const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(this.svg.getScreenCTM().inverse());const k=this.regionAt(q);
    if(k===this._hk)return;this._hk=k;if(!k){this.hl.innerHTML='';this.svg.style.cursor='';return}this.svg.style.cursor='zoom-in';
    const r=this.sim.regions[k],n=this.sim.names[k];const w=Math.max(n[0].length*9.2+40,150);
    this.hl.innerHTML=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="16" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="4" filter="url(#hlGlow)"/><rect x="${r[0]+r[2]/2-w/2}" y="${r[1]-38}" width="${w}" height="32" rx="16" fill="#fff" stroke="#c9d3d0"/><text x="${r[0]+r[2]/2}" y="${r[1]-16.5}" text-anchor="middle" font-size="16" font-weight="600" fill="#1e2a28">${n[0]} 🔍</text>`},
  say(m){const t=this.el.toast;t.textContent=m;t.classList.add('on');clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove('on'),1800)},
  /* ---- procedures: every step belongs to the procedure named at its start ("Procedure A: …") until the next one;
     Manual mode asks which procedures this term runs (all ticked); steps, sheet sections ([data-proc]) and grading
     rows (grader.proc) of the others are left out ---- */
  procInit(){const sim=this.sim,def=EXP_DEFS[this.exp]||{};const raw=sim.rawSteps||sim.steps;let cur=null;
    raw.forEach(s=>{const m=/^\s*(?:<[^>]+>\s*)*Procedure\s+([A-Z]|[IVX]+)\b/.exec(s.t||'');if(m)cur=m[1];if(!s.proc)s.proc=cur});
    const ids=[...new Set(raw.map(s=>s.proc).filter(Boolean))];
    /* sheet: tables whose caption names a procedure and PLQs that start with "Procedure X" belong to it; PLQ numbers stay fixed */
    const ph=this.el.paperHost;ph.querySelectorAll('ol').forEach(ol=>[...ol.children].forEach((li,i)=>{if(li.tagName==='LI'&&!li.hasAttribute('value'))li.value=i+1}));
    ph.querySelectorAll('h3').forEach(h=>{const m=/^Procedure\s+([IVX]+|[A-Z])\b/.exec(h.textContent.trim());if(!m||!ids.includes(m[1])||h.dataset.proc)return;h.dataset.proc=m[1];
      for(let e=h.nextElementSibling;e&&!/^H[23]$/.test(e.tagName)&&!e.querySelector('#submit');e=e.nextElementSibling)if(!e.dataset.proc)e.dataset.proc=m[1]});
    ph.querySelectorAll('table,li.plq').forEach(e=>{if(e.dataset.proc||e.closest('[data-proc]'))return;const t=(e.tagName==='TABLE'?(e.caption?e.caption.textContent:''):e.textContent.trim().slice(0,24))||'';
      const m=(e.tagName==='TABLE'?/\bProcedure\s+([IVX]+|[A-Z])\b/:/^Procedure\s+([IVX]+|[A-Z])\b/).exec(t);if(m&&ids.includes(m[1]))e.dataset.proc=m[1]});
    this.procs=ids.map(id=>({id,title:((def.procs||[]).find(p=>p.id===id)||{}).title||''}));this.rawSteps=raw;this.procSel=new Set(ids);this.applyProcs();
    const pp=$q('#procPick');pp.hidden=true;if(this.guided()&&ids.length>1)this.showProcPick()},
  applyProcs(){const sim=this.sim,sel=this.procSel;const keep=this.rawSteps.filter(s=>!s.proc||sel.has(s.proc)).map(s=>({...s,lines:s.lines&&s.lines.slice()}));
    sim.steps=sim.prep?sim.prep(keep):keep;this.done=[];
    this.el.paperHost.querySelectorAll('[data-proc]').forEach(e=>e.classList.toggle('proc-off',!sel.has(e.dataset.proc)))},
  showProcPick(){const pp=$q('#procPick'),list=$q('#ppList');
    list.innerHTML=this.procs.map(p=>`<label class="pp-i"><input type="checkbox" value="${p.id}" ${this.procSel.has(p.id)?'checked':''}><b>Procedure&nbsp;${p.id}</b>${p.title?` <span dir="ltr">${p.title}</span>`:''}</label>`).join('');
    BIDI.fix(list);const go=$q('#ppGo');const sync=()=>{go.disabled=!list.querySelector('input:checked')};list.onchange=sync;sync();
    go.onclick=()=>{const sel=new Set([...list.querySelectorAll('input:checked')].map(i=>i.value));if(!sel.size)return;this.procSel=sel;pp.hidden=true;this.applyProcs();this.drawSteps();this.drawStepCard();this.onRender()};
    pp.hidden=false},
  procNext(a,b){const el=$q('#procNext');el.innerHTML=`<b>خلصت Procedure ${a}</b> ← ننتقل لـ Procedure ${b}`;BIDI.fix(el);el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
    clearTimeout(this._pn);this._pn=setTimeout(()=>{el.hidden=true},2600);el.onclick=()=>{el.hidden=true}},
  /* ---- practice stepper ---- */
  /* touch: an open instrument menu (scope Measure, Acquire, Cursor, soft keys, measurement list) as a large list over its
     screen while the device is zoomed; a row = the same soft key / list item */
  syncTouchMenu(){const el=$q('#tmenu');if(!el)return;const on=this.el.view.classList.contains('devzoom')&&matchMedia('(pointer:coarse)').matches&&this.sim&&this.sim.touchMenu;
    const m=on?this.sim.touchMenu(this.view):null;if(!m){el.hidden=true;this._tmk='';return}
    const c=this.svg.getScreenCTM(),st=this.el.stage.getBoundingClientRect();let x=m.rect[0]*c.a+c.e-st.left,y=m.rect[1]*c.d+c.f-st.top,w=m.rect[2]*c.a,h=m.rect[3]*c.d;
    /* exactly over the screen, never over the keys around it; the rows scroll if there are many */const W=w,H=h;
    Object.assign(el.style,{left:x+'px',top:y+'px',width:W+'px',maxHeight:H+'px'});const key=m.title+'|'+m.items.map(i=>i.label+(i.on?'*':'')).join('|');this._tm=m;
    if(key!==this._tmk){this._tmk=key;el.innerHTML=`<div class="tm-t">${m.title}</div>`+m.items.map((it,i)=>`<button data-i="${i}" class="${it.on?'on':''}${it.side?' sd':''}">${it.label}</button>`).join('');
      el.querySelectorAll('button').forEach(b=>b.onclick=()=>{const it=this._tm.items[+b.dataset.i];if(it)this._tm.press(it)})}
    el.hidden=false},
  onRender(){if(!this.sim)return;
    /* per-procedure instruments: the current step's procedure decides what stands on the table (Free mode: everything) */
    {const R=this.sim.RT;if(R&&R.setProc){const S=this.sim.steps||[];const s=this.guided()&&S.length?S[Math.min(this.cur(),S.length-1)]:null;const p=s&&s.proc||null;
      if(R.procOf()!==p&&R.setProc(p)!==false&&R.procOf()===p)return}}
    this.drawerSync();this.syncTouchMenu();if(!this.guided())return;
    const st=this.sim.status(),S=this.sim.steps;let just=-1;
    for(let i=0;i<S.length;i++){if(this.done[i])continue;if(this.stepOk(S[i],st)){this.done[i]=true;just=i;
        /* a build step that ticks with one of its lines not matching the board means the lines are wrong (tests read this) */
        if(S[i].lines){const miss=S[i].lines.filter(l=>!this.sim.lineDone(l)).map(l=>l.t);if(miss.length)this.lineLog.push({step:i+1,miss})}}else break}
    this.drawSteps();this.drawStepCard();
    if(just>=0){const nx=S[this.cur()];{const R=this.sim.RT,p=nx&&nx.proc||null;if(R&&R.setProc&&R.procOf()!==p)setTimeout(()=>{if(this.sim&&this.sim.RT===R)this.onRender()})}if(nx&&S[just].proc&&nx.proc&&nx.proc!==S[just].proc)this.procNext(S[just].proc,nx.proc);const all=this.done.filter(Boolean).length===S.length;if(all)STATS.done(this.exp);this.say(all?'🎉 خلصت كل خطوات التجربة':'✓ تمت الخطوة '+(just+1));const c=this.el.card;c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash')}},
  cur(){const S=this.sim.steps;for(let i=0;i<S.length;i++)if(!this.done[i])return i;return S.length},
  drawSteps(){const el=document.getElementById('live');if(!el)return;const S=this.sim.steps,c=this.cur(),n=this.done.filter(Boolean).length;
    el.innerHTML=`<div class="sh"><b>خطوات التجربة</b><span dir="ltr">${n} / ${S.length}</span></div><div class="prog"><i style="width:${n/S.length*100}%"></i></div>`+
      S.map((s,i)=>(s.proc&&this.procs.length>1&&(i===0||S[i-1].proc!==s.proc)?`<div class="ph">Procedure ${s.proc}${((this.procs.find(p=>p.id===s.proc)||{}).title)?' · '+this.procs.find(p=>p.id===s.proc).title:''}</div>`:'')+`<div class="step ${this.done[i]?'done':i===c?'cur':'todo'}"><span class="m">${this.done[i]?'✓':i+1}</span><span class="x">${s.t}</span>${i===c?`<button class="eye" data-dev="${s.dev}">وريني</button>`:''}</div>`).join('');
    el.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{this.focus(b.dataset.dev);if(BENCH.sheetOverlay())this.togglePanel(false)})},
  /* ---- Batch 6: a step ticks from the live state; a build step («وصّل الدائرة Fig. X», step.build = figure id) when the
     bench IS the figure's circuit (engine/match.js); in Manual a recording step (step.rec) when its captures are taken ---- */
  stepKey(s){return (s.proc||'')+'|'+s.t},
  /* ---- Batch 7 item 3: every manual step is split into its sub-steps, exactly as the manual says them. A sub-step:
     {k, t, fig, ok, do, hint, rec}
       k 'build'   build the figure (checked as a circuit, Batch 6) · «وصّل لي» builds it
         'connect' connect instrument leads (the figure fig with them) · «وصّل لي» plugs in only the missing leads
         'measure' a meter / probe on its points with its function and range · «قِس لي»
         'set'     a knob, key or menu of an instrument · «اضبط لي»
         'rec'     record (Manual: Capture into the sheet) · «سجّل لي»
       ok(st)  done on the bench (build / connect: the figure matches, and ok if given)
       do(A)   the action played on the bench, animated: A.press(key, n), A.until(key, st => …, max), A.build(fig),
               A.connect(fig), A.wait(ms), A.st()
       hint    string or st => string: what is still missing.
     A sub-step ticks green the moment it is done and stays ticked; the step is done when all are. Steps without subs get
     them from their old fields (build → one 'build' sub-step, then one for the rest of the step: rec / ok). ---- */
  subsOf(s){if(s._sub&&s._sub.src===s.subs)return s._sub.L;let L;
    const figCap=f=>{const F=this.sim.RT&&this.sim.RT.figs&&this.sim.RT.figs[f];const c=F&&F.cap?F.cap.split(' · ')[0]:'Fig. '+f;return c};
    if(s.subs)L=s.subs.map(x=>typeof x==='string'?{t:x}:{...x});
    else{L=[];if(s.build)L.push({k:'build',fig:s.build});
      if(s.rec)L.push({k:'rec',rec:s.rec,ok:s.ok,legacy:true,t:''});else if(s.ok||!s.build)L.push({k:'set',ok:s.ok,legacy:true,t:''})}
    L.forEach((x,j)=>{if(!x.k)x.k=x.rec?'rec':x.fig?'connect':'set';if(x.k==='build'&&!x.fig)x.fig=s.build;if(x.k==='connect'&&!x.fig)x.fig=s.build;
      if(x.t==null)x.t=x.k==='build'?`وصّل الدائرة <bdi dir="ltr">${figCap(x.fig)}</bdi>`:x.k==='rec'?'سجّل القراءة':'';
      if(x.k==='rec'&&!x.rec&&s.rec)x.rec=s.rec});
    s._sub={src:s.subs,L};return L},
  subKey(s,j){return this.stepKey(s)+'#'+j},
  capsOf(s,j){const L=this.subsOf(s),k=j==null||(L[j]&&L[j].legacy)?this.stepKey(s):this.subKey(s,j);return this.caps[k]||(this.caps[k]=[])},
  capsDone(s,j){const L=this.subsOf(s);if(j==null)j=L.findIndex(x=>x.k==='rec');const x=L[j];if(!x||!x.rec)return true;const c=this.capsOf(s,j);return c.enough||c.length>=x.rec.length},
  subOk(s,j,st){const x=this.subsOf(s)[j],RT=this.sim.RT;if(!x)return true;
    if(x.k==='build'||x.k==='connect'){const m=RT&&RT.match&&x.fig?RT.match(x.fig).ok:true;return m&&(x.ok?!!x.ok(st):true)}
    if(x.k==='rec')return this.mode==='manual'?this.capsDone(s,j):(x.ok?!!x.ok(st):true);
    return x.ok?!!x.ok(st):true},
  subState(s,st){const k=this.stepKey(s),D=this.subDone[k]||(this.subDone[k]=new Set()),L=this.subsOf(s);
    /* in order: a sub-step ticks when it is current and done (one done earlier ticks as soon as it becomes current) */
    if(st)for(let j=0;j<L.length;j++){if(D.has(j))continue;if(this.subOk(s,j,st))D.add(j);else break}return {D,L,cur:L.findIndex((_,j)=>!D.has(j))}},
  stepOk(s,st){if(s.skipped)return true;const {D,L}=this.subState(s,st);return D.size>=L.length},
  /* Capture: the next target of the sub-step — the scope screen into its figure box, or a reading into its table cell */
  capture(s,j){const RT=this.sim.RT,L=this.subsOf(s);if(j==null)j=L.findIndex((x,i)=>x.k==='rec'&&!this.capsDone(s,i));if(j<0)j=L.findIndex(x=>x.k==='rec');const x=L[j];if(!x||!x.rec)return;
    const c=this.capsOf(s,j),t=x.rec[c.length];if(!t){this.say('سجّلت كل المطلوب في هذي الخطوة');return}
    if(t.scope){ENGINE.sheet.capture(RT,t.scope);const el=document.getElementById(t.scope);c.push({html:`<div class="capsc">${el?el.innerHTML:''}</div>`+(t.label?`<span>${t.label}</span>`:'')})}
    else{const v=t.val?t.val():null;if(v==null||(typeof v==='number'&&!isFinite(v))){this.say(t.none||'ما فيه قراءة الحين: شغّل الجهاز ووصّله مثل المطلوب');return}
      const txt=typeof v==='number'?(t.dec!=null?v.toFixed(t.dec):+v.toPrecision(4)+''):String(v);const el=t.to&&document.getElementById(t.to);if(el){el.value=typeof v==='number'?txt:v;el.classList.add('captured');el.dispatchEvent(new Event('change',{bubbles:true}))}
      c.push({html:`${t.label?`<span>${t.label}</span> `:''}<bdi dir="ltr">${t.txt?t.txt(v):txt}${t.unit?' '+t.unit:''}</bdi>`})}
    this.say('📸 تسجيل '+c.length);const k=this.el.card;k.dataset.key='';this.onRender()},
  /* the figure the current step works on: its own, or the last build step's before it (same procedure) */
  figFor(i){const S=this.sim.steps;for(let j=i;j>=0;j--){const L=this.subsOf(S[j]);const f=[...L].reverse().find(x=>x.fig);if(f)return f.fig;if(S[j].build)return S[j].build;if(j<i&&S[j].proc!==S[i].proc)break}return null},
  /* «تلميح» for a sub-step: what is wrong with the circuit (and where), or what that sub-step still wants */
  hintFor(i,j){const S=this.sim.steps,s=S[i],RT=this.sim.RT;this.helpers.hint++;const L=this.subsOf(s);if(j==null){j=this.subState(s).cur;if(j<0)j=0}const x=L[j]||{};const st=this.sim.status();
    /* the sub-step's own hint first (what this sub-step still wants); without one, what is wrong with the circuit */
    if(x.hint&&!x.legacy){const m=typeof x.hint==='function'?x.hint(st):x.hint;if(m){this.say('💡 '+m);const d=x.dev||s.dev;if(d&&d!=='board'&&this.view!==d)this.focus(d);return}}
    const f=x.fig||this.figFor(i);
    if(f&&RT&&RT.hint){const h=RT.hint(f);if(h){this.say('💡 '+h.msg);this.showSpot(h.at);return}}
    const m=typeof x.hint==='function'?x.hint(st):x.hint||(x.legacy?(typeof s.hint==='function'?s.hint(st):s.hint):null);
    if(m){this.say('💡 '+m);const d=x.dev||s.dev;if(d&&d!=='board'&&this.view!==d)this.focus(d);return}
    if(x.k==='rec'){this.say(this.mode==='manual'?'💡 اضغط «📸 Capture» (أو «سجّل لي») عشان تسجّل القراءة':'💡 اكتب القراءة في الـ sheet');return}
    const txt=(x.t||s.t||'').replace(/<[^>]+>/g,'').slice(0,110);this.say(f&&RT.match(f).ok?'💡 الدائرة صحيحة ✓ — باقي: '+txt:'💡 باقي: '+txt);const d=x.dev||s.dev;if(d&&d!=='board'&&!s.build&&this.view!==d)this.focus(d)},
  showSpot(at){const sim=this.sim;if(!at||!sim.setGuide)return;const RT=sim.RT;let g=null;
    if(at.lead)g={nodes:[],jacks:[at.lead],flash:true};
    else if(at.part!=null||at.type){const p=RT.S.parts.find(q=>at.part!=null?q.id===at.part:q.type===at.type);if(p)g={nodes:p.n!=null?[p.n]:[p.a,p.b],jacks:[],flash:true}}
    if(g){if(this.view!=='ov'&&this.view!=='board')this.back();setTimeout(()=>sim.setGuide(g),reduceMotion?0:300);clearTimeout(this._spot);this._spot=setTimeout(()=>sim.setGuide(null),4200)}},
  /* "do it for me" of a sub-step: played on the bench, animated, so the student sees how it is done */
  doName(x){return {build:'🔧 وصّل لي',connect:'🔧 وصّل لي',measure:'📏 قِس لي',set:'🎛 اضبط لي',rec:'📸 سجّل لي'}[x.k]||'▶ سوّها لي'},
  async doSub(i,j){const S=this.sim.steps,s=S[i],x=this.subsOf(s)[j],RT=this.sim.RT;if(!x||this._doing)return;this._doing=true;const c=this.el.card;
    const ms=reduceMotion||this.fast?0:260,wait=t=>new Promise(r=>setTimeout(r,ms?t:0));
    const focusKey=k=>{const d=RT.devOf&&RT.devOf(k);if(d&&this.view!==d&&d!=='board')this.focus(d)};
    const A={st:()=>this.sim.status(),RT,wait,
      press:async(k,n=1)=>{focusKey(k);if(ms)await wait(this.view==='ov'?0:380);for(let q=0;q<n;q++){RT.press(k);this.onRender();await wait(ms)}},
      until:async(k,cond,max=40)=>{focusKey(k);if(ms)await wait(380);for(let q=0;q<max&&!cond(this.sim.status());q++){RT.press(k);this.onRender();await wait(ms*0.7)}},
      build:async f=>{if(this.view!=='board')this.focus('board');await wait(380);await RT.buildFig(f,ms?110:0)},
      connect:async f=>{await RT.connectFig(f,ms)},focus:async d=>{if(this.view!==d)this.focus(d);await wait(380)},
      tap:async(k,t=70)=>{focusKey(k);RT.press(k);this.onRender();await new Promise(r=>setTimeout(r,ms?t:0))},
      jack:async(t,k='dmm')=>{if(this.view!==k)this.focus(k);await wait(380);RT.jackPut(t,k);this.onRender();await wait(ms)},
      capture:()=>this.capture(s,j)};
    try{
      if(x.k==='build'){this.helpers.build++;this.say('🔧 «وصّل لي»: الدائرة تتركّب قدامك');await A.build(x.fig)}
      else if(x.k==='connect'&&!x.do){this.helpers.build++;this.say('🔧 «وصّل لي»: الأسلاك تنشبك قدامك');await A.connect(x.fig)}
      else if(x.k==='rec'&&!x.do){this.helpers.do++;A.capture()}
      else if(x.do){this.helpers[x.k==='connect'?'build':'do']++;this.say(this.doName(x)+'…');await x.do(A)}
      else this.say('💡 هذي سوّها بنفسك: '+(x.t||'').replace(/<[^>]+>/g,''))}
    finally{this._doing=false;c.dataset.key='';this.onRender()}},
  /* step card: in the right-hand column (Batch 7): header, the manual's step text, the figure of a build step, then the
     sub-steps, each with ✓ when done and its own "do it for me" and «تلميح»; the captures of a recording sub-step (Manual) */
  dockCard(){const c=this.el.card;if(!c)return;const panel=$q('#bpanel'),stage=$q('#bstage');
    const inPanel=!this.sheetOverlay()&&!this.el.view.classList.contains('panel-closed')&&!this.el.view.classList.contains('lab-only');
    const host=inPanel?panel:stage;if(c.parentNode!==host){if(inPanel)panel.insertBefore(c,$q('#paperHost'));else stage.insertBefore(c,$q('#labShow'));c.dataset.key=''}
    c.classList.toggle('in-panel',inPanel);c.classList.toggle('in-stage',!inPanel);
    requestAnimationFrame(()=>{const w=!inPanel&&!c.hidden&&!this.el.view.classList.contains('lab-only')&&this.guided()?c.offsetWidth+12:0;this.el.view.style.setProperty('--cardw',w+'px')})},
  drawStepCard(){const c=this.el.card;setTimeout(()=>this.labChip());if(!this.sim||!this.guided()){c.hidden=true;return}c.hidden=false;this.dockCard();
    const S=this.sim.steps,i=this.cur(),all=i>=S.length;const min=c.classList.contains('min');const RT=this.sim.RT||{};const s=S[i];
    /* the instructor check of the mains sources (EE205): a button in the card while a source waits for it */
    const LK=((RT&&RT.locks)||[]).filter(l=>RT.S[l.key]),lkOk=LK.length&&LK.every(l=>l.isOk());
    const chk=!all&&LK.length&&(!lkOk||/المشرف/.test(s.t))?(lkOk?'<span class="chkok">✓ المشرف شيّك التوصيل</span>':'<button class="chk" id="scChk">👨‍🏫 المشرف يتأكد من التوصيل</button>'):'';
    const SS=all?null:this.subState(s),capsK=all?'':SS.L.map((x,j)=>x.k==='rec'?this.capsOf(s,j).length:'').join(',');
    const key=this.built+'|'+all+'|'+i+'|'+(s?this.stepKey(s):'')+'|'+this.view+'|'+min+'|'+chk+'|'+capsK+'|'+(SS?[...SS.D].join(','):'')+'|'+(this._skipAsk===i?1:0)+'|'+c.className;if(c.dataset.key===key)return;c.dataset.key=key;
    if(all){const man=this.mode==='manual';c.innerHTML=`<div class="num done">✓</div><div class="body"><div class="k">خلصت خطوات ${man?'المانيوال':'الاختبار'} 🎉</div><div class="t">${man?'كل الخطوات تمت، والـ sheet تعبّت من تسجيلاتك: افتحها واقراها.':'كل الخطوات تمت. كمّل الـ sheet (الشاشات والقراءات والأسئلة) واضغط "صحّح" عشان تشوف درجتك.'}</div><div class="acts"><button class="go" id="scSheet">افتح الـ sheet</button></div></div>`;
      BIDI.fix(c);c.querySelector('#scSheet').onclick=()=>{this.togglePanel(true);const r=$q('#submit');if(r&&!man)r.scrollIntoView({block:'center'})};return}
    if(this.sim.setGuide&&!this._spot)this.sim.setGuide(null);
    const L=SS.L,D=SS.D,cj=SS.cur;
    const bf=L.find(x=>x.k==='build'),F=bf&&RT.figs?RT.figs[bf.fig]:null,img=F?F.img:s.fig,cap=F?F.cap:s.figCap;
    const fig=img?`<div class="sfig in"><img class="figimg" src="${img}" alt="${cap||'Figure'}"><span>🔍</span>${cap?`<div class="fcap"><bdi dir="ltr">${cap}</bdi></div>`:''}</div>`:'';
    const ex=this.mode==='exam',cost=v=>ex?` <small>(−${v})</small>`:'';const NUM='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
    const shown=L.filter(x=>x.t);
    const subs=shown.length?`<ol class="subs">${L.map((x,j)=>{if(!x.t)return '';const ok=D.has(j),cur=j===cj;const n=NUM[shown.indexOf(x)]||'•';
      const caps=x.k==='rec'&&this.mode==='manual'?this.capsOf(s,j):[];
      const recUI=x.k==='rec'&&this.mode==='manual'&&(cur||caps.length)?`<div class="caps">${caps.map((q,m)=>`<div class="capi"><b>تسجيل ${m+1}</b>${q.html}</div>`).join('')}</div>`+(ok?'':`<div class="acts cap-acts"><button class="go"${cur?' id="scCap"':''} data-cap="${j}">📸 Capture${x.rec&&x.rec.length>1?` (${Math.min(caps.length+1,x.rec.length)} من ${x.rec.length})`:''}</button>${caps.length&&x.rec&&caps.length<x.rec.length?`<button${cur?' id="scEnough"':''} data-enough="${j}">اكتفِ بهذه التسجيلات وانتقل</button>`:''}</div>`):'';
      const btns=ok?'':`<div class="sbtn"><button class="sdo"${cur&&(x.k==='build'||x.k==='connect')?' id="scBuild"':cur?' id="scDo"':''} data-do="${j}">${this.doName(x)}${cost(1)}</button><button class="shint"${cur?' id="scHint"':''} data-hint="${j}">💡 تلميح${cost(0.5)}</button></div>`;
      return `<li class="${ok?'ok':cur?'cur':'todo'}"><div class="sl"><span class="n">${ok?'✓':n}</span><span class="lt">${x.t}</span></div>${btns}${recUI}</li>`}).join('')}</ol>`:'';
    const acts=!s.subs&&s.acts&&s.acts.length?`<ol class="sacts">${s.acts.map(a=>`<li>${a}</li>`).join('')}</ol>`:'';
    const noSubBtns=!shown.length||shown.length<L.length?`<div class="acts help">${L.filter(x=>!x.t).map(x=>{const j=L.indexOf(x);if(D.has(j))return '';return `<button${j===cj?' id="scDo"':''} data-do="${j}">${this.doName(x)}${cost(1)}</button><button${j===cj&&!shown.length?' id="scHint"':''} data-hint="${j}">💡 تلميح${cost(0.5)}</button>`}).join('')}</div>`:'';
    const legacyRec=L.find((x,j)=>!x.t&&x.k==='rec')&&this.mode==='manual'?(()=>{const j=L.findIndex(x=>!x.t&&x.k==='rec');const caps=this.capsOf(s,j);const x=L[j];return `<div class="caps">${caps.map((q,m)=>`<div class="capi"><b>تسجيل ${m+1}</b>${q.html}</div>`).join('')}</div>`+(D.has(j)?'':`<div class="acts cap-acts"><button class="go" id="scCap" data-cap="${j}">📸 Capture${x.rec.length>1?` (${Math.min(caps.length+1,x.rec.length)} من ${x.rec.length})`:''}</button>${caps.length&&caps.length<x.rec.length?`<button id="scEnough" data-enough="${j}">اكتفِ بهذه التسجيلات وانتقل</button>`:''}</div>`)})():'';
    const help=`<div class="acts help"><button id="scSkip">${this._skipAsk===i?'⚠ متأكد؟ تخطّي':'⏭ تخطّي الخطوة'+cost(1)}</button></div>`;
    const h0=c.offsetHeight;const PS=s.proc?S.filter(x=>x.proc===s.proc):S,pi=PS.indexOf(s)+1;
    c.innerHTML=`<div class="num">${pi}</div><div class="body"><div class="k">${s.proc&&this.procs.length>1?`Procedure ${s.proc} · `:''}الخطوة ${pi} من ${PS.length}</div><div class="t">${s.t}</div>${acts}${fig}${subs}${legacyRec}${noSubBtns}<div class="acts">${chk}<button class="go" id="scGo">وريني وين</button><button id="scAll">كل الخطوات</button></div>${help}</div><button class="mini" id="scMin" aria-label="${min?'توسيع':'تصغير'}">${min?'▴':'▾'}</button><button class="mini" id="scHide" title="أخفِ الصفحة، خلّ المعمل بس" aria-label="أخفِ الصفحة">⟩</button>`;
    BIDI.fix(c);if(Math.abs(c.offsetHeight-h0)>8&&this.view)requestAnimationFrame(()=>this.refit(true));
    {const cu=c.querySelector('.subs li.cur');if(cu&&c.classList.contains('in-panel')===false&&cu.scrollIntoView)cu.scrollIntoView({block:'nearest'})}
    const small=()=>innerHeight<=500||innerWidth<=600;const on=(id,f)=>{const b=c.querySelector(id);if(b)b.onclick=f};
    on('#scGo',()=>{if(small()&&!c.classList.contains('min')&&c.classList.contains('in-stage')===false){c.classList.add('min');c.dataset.key='';this.drawStepCard()}const x=L[cj]||{};this.focus(x.k==='build'||x.k==='connect'||s.build&&cj<1?'board':x.dev||s.dev)});
    on('#scAll',()=>this.togglePanel(true));
    on('#scChk',()=>{LK.filter(l=>!l.isOk()).forEach(l=>l.check());c.dataset.key='';RT.render()});
    c.querySelectorAll('[data-do]').forEach(b=>b.onclick=()=>this.doSub(i,+b.dataset.do));
    c.querySelectorAll('[data-hint]').forEach(b=>b.onclick=()=>this.hintFor(i,+b.dataset.hint));
    c.querySelectorAll('[data-cap]').forEach(b=>b.onclick=()=>this.capture(s,+b.dataset.cap));
    c.querySelectorAll('[data-enough]').forEach(b=>b.onclick=()=>{this.capsOf(s,+b.dataset.enough).enough=true;c.dataset.key='';this.onRender()});
    on('#scSkip',()=>{if(this._skipAsk!==i){this._skipAsk=i;c.dataset.key='';this.drawStepCard();clearTimeout(this._sk);this._sk=setTimeout(()=>{this._skipAsk=null;c.dataset.key='';this.drawStepCard()},3500);return}
      this._skipAsk=null;this.helpers.skip++;s.skipped=true;this.say('⏭ تخطّيت الخطوة');c.dataset.key='';this.onRender()});
    c.querySelector('#scHide').onclick=()=>this.labOnly(true);
    c.querySelector('#scMin').onclick=()=>{c.classList.toggle('min');c.dataset.key='';this.drawStepCard();this.refit(true)}}
};
