/* ======================= BENCH SHELL =======================
   Seated view of one table: overview of the instruments, tap a device to zoom on it, parts bag, live step checker.
   Two modes: 'manual' (follows the lab manual step by step, live checks, manual sheet graded at the end)
   and 'free' (same table and instruments, no steps and no checks). */
const BENCH={
  view:'ov',mode:'manual',paint:null,lineLog:[],exp:null,sim:null,done:[],drawer:false,vb:null,anim:0,built:null,
  el:{},
  init(){
    const E=this.el={view:$q('#benchView'),stage:$q('#bstage'),svgHost:$q('#svgHost'),paperHost:$q('#paperHost'),zoomUI:$q('#zoomUI'),zEn:$q('#zEn'),zAr:$q('#zAr'),
      ovHint:$q('#ovHint'),bagBtn:$q('#bagBtn'),bagAr:$q('#bagAr'),drawer:$q('#drawer'),bag:$q('#bag'),dHint:$q('#dHint'),card:$q('#stepCard'),toast:$q('#toast')};
    $q('#zBack').onclick=()=>this.back();
    E.bagBtn.onclick=()=>this.setDrawer(!this.drawer);
    $q('#dClose').onclick=()=>this.setDrawer(!this.drawer);
    $q('#bPanelBtn').onclick=()=>this.togglePanel();
    $q('#bPanelClose').onclick=()=>this.togglePanel(false);
    $q('#bReset').onclick=()=>{this.sim.reset();this.done=[];this.sim.render();this.say('بدأت من جديد')};
    $q('#bSwitch').onclick=()=>{this.enter(this.exp,this.mode==='free'?'manual':'free',true)};
    /* paint bucket: open → pick a swatch → tap wires; ✕ or the bucket again leaves the mode */
    $q('#pBucket').onclick=()=>this.setPaint(this.paint===null?'':null);
    $q('#pSw').querySelectorAll('button').forEach(b=>b.onclick=()=>this.setPaint(b.dataset.c==='x'?null:b.dataset.c));
    $q('#bLayout').onclick=()=>{if(this.sim&&this.sim.resetLayout){this.sim.resetLayout();this.say('رجعت الأجهزة لترتيبها الافتراضي')}};
    $q('#bQuick').onclick=()=>QUICK.open($q('#bQuick'));
    $q('#bStand').onclick=()=>this.leave();
    addEventListener('keydown',e=>{if(E.view.hidden)return;if(e.key==='Escape'){if(this.view!=='ov')this.back()}});
    /* iPhone: size the bench to the visual viewport and re-fit on resize / rotation / toolbar changes */
    const vv=window.visualViewport;const sync=()=>{if(vv){const st=E.view.style;st.top=vv.offsetTop+'px';st.left=vv.offsetLeft+'px';st.width=vv.width+'px';st.height=vv.height+'px'}if(!E.view.hidden)requestAnimationFrame(()=>this.refit(false))};
    addEventListener('resize',sync);addEventListener('orientationchange',()=>setTimeout(sync,250));if(vv){vv.addEventListener('resize',sync);vv.addEventListener('scroll',sync)}this._vvSync=sync;sync();
    this.panelDefault();this.gestures();
    /* the stage can change size without a window resize (iOS toolbars, the host app's bars, the sheet panel): refit then too */
    if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(E.view.hidden)return;const {W,H}=this.stageSize();E.view.classList.toggle('tall',H>W*1.1);if(this._to&&!this.user){const t=this.fit(this.curRect());if(t)this._to=t}else this.refit(false)});[E.stage,E.drawer,E.card].forEach(x=>x&&ro.observe(x))}
  },
  sheetOverlay(){return matchMedia('(max-width:900px),(max-height:520px),(pointer:coarse) and (max-width:1400px)').matches},
  panelDefault(){const mob=BENCH.sheetOverlay();this.el.view.classList.toggle('panel-closed',!mob&&false);this.el.view.classList.remove('panel-open')},
  togglePanel(force){const v=this.el.view,mob=BENCH.sheetOverlay();
    if(mob){const open=force!==undefined?force:!v.classList.contains('panel-open');v.classList.toggle('panel-open',open)}
    else{const closed=force!==undefined?!force:!v.classList.contains('panel-closed');v.classList.toggle('panel-closed',closed);requestAnimationFrame(()=>this.refit(false))}},
  /* exp = registry id, e.g. 'ee312/exp3'; the experiment file is loaded on first use */
  enter(exp,mode,force){
    const E=this.el;E.view.hidden=false;HALL.pause();
    if(!force&&this.built===exp+'|'+mode){this.refit(false);return}
    if(!EXP_DEFS[exp]){REGISTRY.load(exp).then(()=>this.enter(exp,mode,true)).catch(()=>{this.say('تعذّر تحميل التجربة');this.leave()});return}
    this.exp=exp;this.mode=mode;this.built=exp+'|'+mode;this.lineLog=[];STATS.start(exp,mode);this.view='ov';this.setUser(false);this.done=[];this.sim=null;this.devZoom();
    E.view.dataset.mode=mode;
    /* the parts box stays open next to the board (its arrow collapses it); none on PC tables or benches without parts */
    const hasBag=!EXP_DEFS[exp].pc&&!!(EXP_DEFS[exp].tray&&EXP_DEFS[exp].tray.length);E.view.classList.toggle('no-wires',!(EXP_DEFS[exp].tray||[]).some(t=>t[0]==='W'));this.setPaint(null);E.view.classList.toggle('no-bag',!hasBag);/* portrait phones: the box starts folded (its arrow opens it) so the desk keeps the width */const bagOpen=hasBag&&innerWidth>=520;this.drawer=bagOpen;E.view.classList.toggle('drawer-open',bagOpen);$q('#dClose').textContent=bagOpen?'◂':'▸';
    E.svgHost.innerHTML='';E.paperHost.innerHTML='';const PC=!!EXP_DEFS[exp].pc;E.view.classList.toggle('pc-mode',PC);
    if(!PC)E.svgHost.appendChild(document.getElementById('tpl-svg').content.cloneNode(true));
    E.paperHost.innerHTML=EXP_DEFS[exp].sheet;
    const X=REGISTRY.exp(exp);$q('#bTitle').textContent=X.lab.code+' · تجربة '+X.num;$q('#bSub').textContent=X.en;
    const chip=$q('#bChip');chip.textContent=mode==='free'?'الطور الحر':'المانيوال';chip.classList.toggle('exam',mode==='free');
    $q('#bSwitch').textContent=mode==='free'?'بدّل للمانيوال':'بدّل للحر';
    this.svg=PC?null:document.getElementById('bench');this.hl=PC?{innerHTML:''}:document.getElementById('Lhl');
    if(!PC){this.svg.addEventListener('pointermove',e=>this.hover(e));this.svg.addEventListener('pointerleave',()=>{if(this.view==='ov')this.hl.innerHTML=''})}
    this._bagShown=false;
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
      b.addEventListener('pointerdown',e=>{e.preventDefault();sim.trayDown(t,e)});b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sim.trayDown(t,{clientX:0,clientY:0,pointerId:0});}});bag.appendChild(b)});
  },
  setPaint(c){this.paint=c;const on=c!==null;$q('#pSw').hidden=!on;$q('#pBucket').setAttribute('aria-pressed',on);
    $q('#pSw').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));if(this.svg)this.svg.classList.toggle('painting',on);
    if(on&&!c)this.say('اختر لون، وبعدها اضغط على السلك اللي تبي تلوّنه')},
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
    if(this.mode==='manual'&&!this.el.card.hidden)bottom+=this.el.card.offsetHeight+8;
    const left=this.el.view.classList.contains('no-bag')||this.el.view.classList.contains('devzoom')?0:this.el.drawer.offsetWidth+8;
    return {top,bottom,left,right:T.right}},
  /* free area of the overview in px (used by the layout search before anything is drawn) */
  availArea(){const {W,H}=this.stageSize();const small=innerHeight<=500||innerWidth<=600;const bag=!this.el.view.classList.contains('no-bag');
    const left=bag?(this.drawer?(small?104:136):42):0;const card=this.mode==='manual'?(small?64:150):0;const tall=H>W*1.1,tr=tall?0:(small?70:96),tt=tall?52:0;return {W:Math.max(200,W-left-16-tr),H:Math.max(150,H-16-card-tt)}},
  fit(r){const {W,H}=this.stageSize();if(!W||!H)return null;const {top,bottom,left,right}=this.pads();const m=Math.min(12,W*0.015);
    /* ≈4 % margin around what is on the desk */
    const mg=this.el.view.classList.contains('devzoom')?0:0.02,mx=r[2]*mg,my=r[3]*mg;r=[r[0]-mx,r[1]-my,r[2]+2*mx,r[3]+2*my];
    const aw=Math.max(60,W-2*m-left-right),ah=Math.max(60,H-top-bottom);const s=Math.max(r[2]/aw,r[3]/ah);const vw=W*s,vh=H*s;
    const cx=left+m+aw/2,cy=top+ah/2;return {x:r[0]+r[2]/2-cx*s,y:r[1]+r[3]/2-cy*s,w:vw,h:vh}},
  setVB(v){{const {W,H}=this.stageSize();if(W&&H)this.el.view.classList.toggle('tall',H>W*1.1)}this.vb=v;this.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);if(this._tmk||this.el.view.classList.contains('devzoom'))this.syncTouchMenu()},
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
    if(!ov||seen||this._hintShown){h.hidden=true;return}this._hintShown=true;h.hidden=false;h.classList.remove('fade');try{sessionStorage.setItem('eelab:hint','1')}catch(_){}
    clearTimeout(this._hintT);this._hintT=setTimeout(()=>{h.classList.add('fade');setTimeout(()=>{h.hidden=true},700)},4200)},
  ui(){const E=this.el,ov=this.view==='ov';if(this.sim&&this.sim.pc){E.zoomUI.hidden=true;E.ovHint.hidden=true;E.bagBtn.hidden=true;this.drawStepCard();return}E.zoomUI.hidden=ov;E.bagBtn.hidden=true;this.hintOnce(ov);
    if(!ov){const n=this.sim.names[this.view];E.zEn.textContent=n[0];E.zAr.textContent=n[1]}
    if(ov)this.hl.innerHTML='';else this.hl.innerHTML='';
    E.ovHint.textContent=innerWidth<600&&innerHeight>innerWidth?'اقلب الجوال بالعرض، واضغط على أي جهاز':matchMedia('(pointer:coarse)').matches?'الأزرار شغّالة من هنا · ✥ تحرّك الجهاز · جسمه يقرّب':'الأزرار والأسلاك شغّالة من هنا · اسحب ✥ عشان تحرّك الجهاز · اضغط على جسمه عشان تقرّب';
    this.drawStepCard()},
  regionAt(p){const R=this.sim.regions;for(const k of Object.keys(R).reverse()){const r=R[k];if(p.x>=r[0]&&p.x<=r[0]+r[2]&&p.y>=r[1]&&p.y<=r[1]+r[3])return k}return null},
  ovClick(p){const k=this.regionAt(p);if(k){this._hk=null;this.focus(k)}},
  focus(k){if(this.sim&&this.sim.pc){this.sim.focus(k);return}if(!this.sim||!this.sim.regions[k])return;this.view=k;this.devZoom();this.ui();this.refit(true,true)},
  /* close device zoom: the device alone at ≈90 % of the screen; the box, hints, tools, board and the other instruments hide */
  devZoom(){setTimeout(()=>this.syncTouchMenu(),0);const k=this.view,on=k!=='ov'&&k!=='board'&&!(this.sim&&this.sim.pc);const E=this.el;E.view.classList.toggle('devzoom',on);
    let st=document.getElementById('zoomStyle');if(!st){st=document.createElement('style');st.id='zoomStyle';document.head.appendChild(st)}
    st.textContent=on?`#benchView.devzoom #Ldyn>g:not([data-inst="${k}"]),#benchView.devzoom #Lcables g[data-cabof]:not([data-cabof="${k}"]),#benchView.devzoom #Lcables .cablbl,#benchView.devzoom #Lcables .ltray{opacity:0;pointer-events:none}`:'';
    const c=E.card;if(on&&c&&!c.hidden&&(innerHeight<=520||innerWidth<=600)&&!c.classList.contains('min')){c.classList.add('min');c.dataset.key='';this._unminCard=true}
    else if(!on&&this._unminCard){this._unminCard=false;if(c){c.classList.remove('min');c.dataset.key=''}}},
  back(){if(this.sim&&this.sim.pc)return;this.view='ov';this.devZoom();this.ui();this.refit(true,true)},
  /* open / collapse the side parts box */
  setDrawer(open,silent){if(this.el.view.classList.contains('no-bag'))return;this.drawer=open;const E=this.el;E.view.classList.toggle('drawer-open',open);$q('#dClose').textContent=open?'◂':'▸';
    if(!silent)setTimeout(()=>this.refit(true),20)},
  hover(e){if(this.view!=='ov'||!this.sim)return;if(this.svg.classList.contains('grabbing')){this.clearHover();return}const ctl=e.target&&e.target.closest&&e.target.closest('[data-k]');if(ctl&&!ctl.dataset.k.startsWith('node:')){if(this._hk){this._hk=null;this.hl.innerHTML=''}this.svg.style.cursor='pointer';return}const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(this.svg.getScreenCTM().inverse());const k=this.regionAt(q);
    if(k===this._hk)return;this._hk=k;if(!k){this.hl.innerHTML='';this.svg.style.cursor='';return}this.svg.style.cursor='zoom-in';
    const r=this.sim.regions[k],n=this.sim.names[k];const w=Math.max(n[0].length*9.2+40,150);
    this.hl.innerHTML=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="16" fill="rgba(255,255,255,.14)" stroke="#fff" stroke-width="4" filter="url(#hlGlow)"/><rect x="${r[0]+r[2]/2-w/2}" y="${r[1]+r[3]-44}" width="${w}" height="34" rx="17" fill="#fff" stroke="#c9d3d0"/><text x="${r[0]+r[2]/2}" y="${r[1]+r[3]-21.5}" text-anchor="middle" font-size="16" font-weight="600" fill="#1e2a28">${n[0]} 🔍</text>`},
  say(m){const t=this.el.toast;t.textContent=m;t.classList.add('on');clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove('on'),1800)},
  /* ---- procedures: every step belongs to the procedure named at its start ("Procedure A: …") until the next one;
     Manual mode asks which procedures this term runs (all ticked); steps, sheet sections ([data-proc]) and grading
     rows (grader.proc) of the others are left out ---- */
  procInit(){const sim=this.sim,def=EXP_DEFS[this.exp]||{};const raw=sim.rawSteps||sim.steps;let cur=null;
    raw.forEach(s=>{const m=/^\s*(?:<[^>]+>\s*)*Procedure\s+([A-Z]|[IVX]+)\b/.exec(s.t||'');if(m)cur=m[1];if(!s.proc)s.proc=cur});
    const ids=[...new Set(raw.map(s=>s.proc).filter(Boolean))];
    /* sheet: tables whose caption names a procedure and PLQs that start with "Procedure X" belong to it; PLQ numbers stay fixed */
    const ph=this.el.paperHost;ph.querySelectorAll('ol').forEach(ol=>[...ol.children].forEach((li,i)=>{if(li.tagName==='LI'&&!li.hasAttribute('value'))li.value=i+1}));
    ph.querySelectorAll('h3').forEach(h=>{const m=/^Procedure\s+([A-Z])\b/.exec(h.textContent.trim());if(!m||!ids.includes(m[1])||h.dataset.proc)return;h.dataset.proc=m[1];
      for(let e=h.nextElementSibling;e&&!/^H[23]$/.test(e.tagName)&&!e.querySelector('#submit');e=e.nextElementSibling)if(!e.dataset.proc)e.dataset.proc=m[1]});
    ph.querySelectorAll('table,li.plq').forEach(e=>{if(e.dataset.proc||e.closest('[data-proc]'))return;const t=(e.tagName==='TABLE'?(e.caption?e.caption.textContent:''):e.textContent.trim().slice(0,24))||'';
      const m=(e.tagName==='TABLE'?/\bProcedure\s+([A-Z])\b/:/^Procedure\s+([A-Z])\b/).exec(t);if(m&&ids.includes(m[1]))e.dataset.proc=m[1]});
    this.procs=ids.map(id=>({id,title:((def.procs||[]).find(p=>p.id===id)||{}).title||''}));this.rawSteps=raw;this.procSel=new Set(ids);this.applyProcs();
    const pp=$q('#procPick');pp.hidden=true;if(this.mode==='manual'&&ids.length>1)this.showProcPick()},
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
  onRender(){if(!this.sim)return;this.drawerSync();this.syncTouchMenu();if(this.mode!=='manual')return;
    const st=this.sim.status(),S=this.sim.steps;let just=-1;
    for(let i=0;i<S.length;i++){if(this.done[i])continue;if(S[i].ok(st)){this.done[i]=true;just=i;
        /* a build step that ticks with one of its lines not matching the board means the lines are wrong (tests read this) */
        if(S[i].lines){const miss=S[i].lines.filter(l=>!this.sim.lineDone(l)).map(l=>l.t);if(miss.length)this.lineLog.push({step:i+1,miss})}}else break}
    this.drawSteps();this.drawStepCard();
    if(just>=0){const nx=S[this.cur()];if(nx&&S[just].proc&&nx.proc&&nx.proc!==S[just].proc)this.procNext(S[just].proc,nx.proc);const all=this.done.filter(Boolean).length===S.length;if(all)STATS.done(this.exp);this.say(all?'🎉 خلصت كل خطوات التجربة':'✓ تمت الخطوة '+(just+1));const c=this.el.card;c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash')}},
  cur(){const S=this.sim.steps;for(let i=0;i<S.length;i++)if(!this.done[i])return i;return S.length},
  drawSteps(){const el=document.getElementById('live');if(!el)return;const S=this.sim.steps,c=this.cur(),n=this.done.filter(Boolean).length;
    el.innerHTML=`<div class="sh"><b>خطوات التجربة</b><span dir="ltr">${n} / ${S.length}</span></div><div class="prog"><i style="width:${n/S.length*100}%"></i></div>`+
      S.map((s,i)=>(s.proc&&this.procs.length>1&&(i===0||S[i-1].proc!==s.proc)?`<div class="ph">Procedure ${s.proc}${((this.procs.find(p=>p.id===s.proc)||{}).title)?' · '+this.procs.find(p=>p.id===s.proc).title:''}</div>`:'')+`<div class="step ${this.done[i]?'done':i===c?'cur':'todo'}"><span class="m">${this.done[i]?'✓':i+1}</span><span class="x">${s.t}</span>${i===c?`<button class="eye" data-dev="${s.dev}">وريني</button>`:''}</div>`).join('');
    el.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{this.focus(b.dataset.dev);if(BENCH.sheetOverlay())this.togglePanel(false)})},
  /* step card: header, text, for build steps one connection per line (ticks itself, the current one glows on the
     board), the manual figure beside it (tap → full screen); folded to one line by default on small screens */
  drawStepCard(){const c=this.el.card;if(!this.sim||this.mode!=='manual'){c.hidden=true;return}c.hidden=false;
    const S=this.sim.steps,i=this.cur(),all=i>=S.length;const min=c.classList.contains('min');
    const s=S[i],L=!all&&s.lines&&!this.sim.pc?s.lines:null;const done=L?L.map(l=>this.sim.lineDone(l)):[];const cur=L?done.indexOf(false):-1;
    if(this.sim.setGuide)this.sim.setGuide(L&&cur>=0?this.sim.lineSpots(L[cur]):null);
    const key=this.built+'|'+all+'|'+i+'|'+this.view+'|'+done.join('')+'|'+min;if(c.dataset.key===key)return;c.dataset.key=key;
    if(all){c.innerHTML=`<div class="num done">✓</div><div class="body"><div class="k">خلصت خطوات المانيوال 🎉</div><div class="t">كل الخطوات تمت. كمّل الـ sheet (الشاشات والقراءات والأسئلة) واضغط "صحّح" عشان تشوف درجتك.</div><div class="acts"><button class="go" id="scSheet">افتح الـ sheet</button></div></div>`;
      BIDI.fix(c);c.querySelector('#scSheet').onclick=()=>{this.togglePanel(true);const r=$q('#submit');if(r)r.scrollIntoView({block:'center'})};return}
    const here=this.view===(L?'board':s.dev)&&!this.sim.pc;const CN='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
    const lines=L?`<ol class="wl">${L.map((l,j)=>`<li class="${done[j]?'ok':j===cur?'cur':''}"><span class="n">${CN[j]||j+1}</span><span class="lt"><bdi dir="ltr">${l.t}</bdi>${l.note?` <span class="nt">(${l.note})</span>`:''}</span>${done[j]?'<span class="tk">✓</span>':''}</li>`).join('')}</ol>`:'';
    const fig=s.fig?`<div class="sfig"><img class="figimg" src="${s.fig}" alt="${s.figCap||'Figure'}"><span>🔍</span></div>`:'';
    c.classList.toggle('has-lines',!!L);const h0=c.offsetHeight;
    const PS=s.proc?S.filter(x=>x.proc===s.proc):S,pi=PS.indexOf(s)+1;
    c.innerHTML=`<div class="num">${pi}</div><div class="body"><div class="k">${s.proc&&this.procs.length>1?`Procedure ${s.proc} · `:''}الخطوة ${pi} من ${PS.length}</div><div class="t">${s.t}</div>${lines}<div class="acts"><button class="go" id="scGo">وريني وين</button><button id="scAll">كل الخطوات</button></div></div>${fig}<button class="mini" id="scMin" aria-label="${min?'توسيع':'تصغير'}">${min?'▴':'▾'}</button>`;
    BIDI.fix(c);{const wl=c.querySelector('.wl'),cl=wl&&wl.querySelector('li.cur');if(cl)wl.scrollTop=Math.max(0,cl.offsetTop-wl.offsetTop-30)}if(Math.abs(c.offsetHeight-h0)>8&&this.view)requestAnimationFrame(()=>this.refit(true));
    const small=()=>innerHeight<=500||innerWidth<=600;
    c.querySelector('#scGo').onclick=()=>{if(small()&&!c.classList.contains('min')){c.classList.add('min');c.dataset.key='';this.drawStepCard()}if(L){const ln=cur>=0&&(L[cur].lead||L[cur].jack);if(ln){if(this.view!=='ov')this.back()}else if(!here)this.focus('board');if(cur>=0)setTimeout(()=>this.sim.setGuide({...this.sim.lineSpots(L[cur]),flash:true}),reduceMotion?0:420)}else this.focus(s.dev)};
    c.querySelector('#scAll').onclick=()=>this.togglePanel(true);
    c.querySelector('#scMin').onclick=()=>{c.classList.toggle('min');c.dataset.key='';this.drawStepCard();this.refit(true)}}
};
