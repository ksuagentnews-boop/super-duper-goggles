/* ======================= BENCH SHELL ======================= */
const BENCH={
  view:'ov',mode:'practice',exp:null,sim:null,done:[],drawer:false,vb:null,anim:0,built:null,
  el:{},
  init(){
    const E=this.el={view:$q('#benchView'),stage:$q('#bstage'),svgHost:$q('#svgHost'),paperHost:$q('#paperHost'),zoomUI:$q('#zoomUI'),zEn:$q('#zEn'),zAr:$q('#zAr'),
      ovHint:$q('#ovHint'),bagBtn:$q('#bagBtn'),bagAr:$q('#bagAr'),drawer:$q('#drawer'),bag:$q('#bag'),dHint:$q('#dHint'),card:$q('#stepCard'),toast:$q('#toast')};
    $q('#zBack').onclick=()=>this.back();
    E.bagBtn.onclick=()=>this.setDrawer(!this.drawer);
    $q('#dClose').onclick=()=>this.setDrawer(false);
    $q('#bPanelBtn').onclick=()=>this.togglePanel();
    $q('#bPanelClose').onclick=()=>this.togglePanel(false);
    $q('#bReset').onclick=()=>{if(this.mode==='exam'){this.enter(this.exp,'exam',true);this.say('نموذج جديد بقيم جديدة')}else{this.sim.reset();this.done=[];this.sim.render();this.say('بدأت من جديد')}};
    $q('#bSwitch').onclick=()=>{this.enter(this.exp,this.mode==='exam'?'practice':'exam',true)};
    $q('#bStand').onclick=()=>this.leave();
    addEventListener('keydown',e=>{if(E.view.hidden)return;if(e.key==='Escape'){if(this.drawer)this.setDrawer(false);else if(this.view!=='ov')this.back()}});
    addEventListener('resize',()=>{if(!E.view.hidden)this.refit(false)});
    this.panelDefault();
  },
  panelDefault(){const mob=innerWidth<=900;this.el.view.classList.toggle('panel-closed',!mob&&false);this.el.view.classList.remove('panel-open')},
  togglePanel(force){const v=this.el.view,mob=innerWidth<=900;
    if(mob){const open=force!==undefined?force:!v.classList.contains('panel-open');v.classList.toggle('panel-open',open)}
    else{const closed=force!==undefined?!force:!v.classList.contains('panel-closed');v.classList.toggle('panel-closed',closed);requestAnimationFrame(()=>this.refit(false))}},
  enter(exp,mode,force){
    const E=this.el;E.view.hidden=false;
    if(!force&&this.built===exp+'|'+mode){this.refit(false);return}
    this.exp=exp;this.mode=mode;this.built=exp+'|'+mode;this.view='ov';this.done=[];this.drawer=false;this.sim=null;
    E.view.dataset.mode=mode;E.view.classList.remove('drawer-open');
    E.svgHost.innerHTML='';E.paperHost.innerHTML='';
    E.svgHost.appendChild(document.getElementById('tpl-svg').content.cloneNode(true));
    E.paperHost.innerHTML=EXP_DEFS[EXPS[exp].def].sheet;
    const X=EXPS[exp];$q('#bTitle').textContent='EE312 · تجربة '+X.num;$q('#bSub').textContent=X.en;
    const chip=$q('#bChip');chip.textContent=mode==='exam'?'طور الاختبار':'طور التدريب';chip.classList.toggle('exam',mode==='exam');
    $q('#bSwitch').textContent=mode==='exam'?'بدّل للتدريب':'بدّل للاختبار';
    $q('#bReset').textContent=mode==='exam'?'↺ نموذج جديد':'↺ من جديد';
    this.svg=document.getElementById('bench');this.hl=document.getElementById('Lhl');
    this.svg.addEventListener('pointermove',e=>this.hover(e));
    this.svg.addEventListener('pointerleave',()=>{if(this.view==='ov')this.hl.innerHTML=''});
    BOOT[exp]();
    if(mode==='exam'&&innerWidth<=900)this.togglePanel(true);
    this.ui();
    requestAnimationFrame(()=>{this.refit(false)});
  },
  leave(){this.setDrawer(false,true);this.el.view.hidden=true;HALL.standUp()},
  register(sim){this.sim=sim;
    const R=sim.regions;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const k in R){const r=R[k];x0=Math.min(x0,r[0]);y0=Math.min(y0,r[1]);x1=Math.max(x1,r[0]+r[2]);y1=Math.max(y1,r[1]+r[3])}
    this.ovRect=[x0,y0,x1-x0,y1-y0];
    const bag=this.el.bag;bag.innerHTML='';
    sim.tray.forEach(({t,l})=>{const b=document.createElement('button');b.className='bag-item';b.dataset.t=t;b.innerHTML=sim.icon(t)+`<small>${l}</small>`;
      b.addEventListener('pointerdown',e=>{e.preventDefault();sim.trayDown(t,e)});b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sim.trayDown(t,{clientX:0,clientY:0,pointerId:0});}});bag.appendChild(b)});
  },
  drawerSync(){if(!this.sim)return;const a=this.sim.armed(),w=this.sim.isWire();
    this.el.bag.querySelectorAll('.bag-item').forEach(b=>b.classList.toggle('on',b.dataset.t===a||(b.dataset.t==='W'&&w)));
    this.el.dHint.textContent=w?'وضع السلك: اضغط على node ثم node ثانية على اللوحة':a?'اضغط بين nodeين متجاورين على اللوحة عشان تركّب القطعة':'اسحب القطعة للوحة، أو اضغطها ثم اضغط بين nodeين'},
  /* ---- view / camera ---- */
  stageSize(){return {W:this.el.stage.clientWidth,H:this.el.stage.clientHeight}},
  pads(){const top=this.view==='ov'?52:60;let bottom=14;
    if(this.view==='board'&&this.drawer)bottom+=this.el.drawer.offsetHeight;
    if(this.mode==='practice'&&!this.el.card.hidden)bottom+=this.el.card.offsetHeight+10;
    return {top,bottom}},
  fit(r){const {W,H}=this.stageSize();if(!W||!H)return null;const {top,bottom}=this.pads();const m=Math.min(18,W*0.03);
    const aw=Math.max(60,W-2*m),ah=Math.max(60,H-top-bottom);const s=Math.max(r[2]/aw,r[3]/ah);const vw=W*s,vh=H*s;
    return {x:r[0]+r[2]/2-vw/2,y:r[1]-top*s-(ah*s-r[3])/2,w:vw,h:vh}},
  setVB(v){this.vb=v;this.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`)},
  animTo(to){if(!to)return;cancelAnimationFrame(this.anim);if(!this.vb||reduceMotion){this.setVB(to);return}const from={...this.vb},t0=performance.now(),dur=560;
    const step=now=>{const k=ease(Math.min(1,(now-t0)/dur));this.setVB({x:from.x+(to.x-from.x)*k,y:from.y+(to.y-from.y)*k,w:from.w+(to.w-from.w)*k,h:from.h+(to.h-from.h)*k});if(k<1)this.anim=requestAnimationFrame(step)};this.anim=requestAnimationFrame(step)},
  curRect(){return this.view==='ov'?this.ovRect:this.sim.regions[this.view]},
  refit(anim){if(!this.sim)return;const t=this.fit(this.curRect());if(anim)this.animTo(t);else{cancelAnimationFrame(this.anim);t&&this.setVB(t)}},
  ui(){const E=this.el,ov=this.view==='ov';E.zoomUI.hidden=ov;E.ovHint.hidden=!ov;E.bagBtn.hidden=this.view!=='board';
    if(!ov){const n=this.sim.names[this.view];E.zEn.textContent=n[0];E.zAr.textContent=n[1]}
    if(ov)this.hl.innerHTML='';else this.hl.innerHTML='';
    E.ovHint.textContent=innerWidth<600&&innerHeight>innerWidth?'اقلب الجوال بالعرض، واضغط على أي جهاز':matchMedia('(pointer:coarse)').matches?'اضغط على أي جهاز عشان تقرّب عليه':'اضغط على أي جهاز عشان تقرّب عليه · ESC للرجوع';
    this.drawStepCard()},
  regionAt(p){const R=this.sim.regions;for(const k of Object.keys(R).reverse()){const r=R[k];if(p.x>=r[0]&&p.x<=r[0]+r[2]&&p.y>=r[1]&&p.y<=r[1]+r[3])return k}return null},
  ovClick(p){const k=this.regionAt(p);if(k)this.focus(k)},
  focus(k){if(!this.sim||!this.sim.regions[k])return;this.view=k;if(k!=='board')this.setDrawer(false,true);this.ui();this.refit(true);
    if(k==='board'&&!this._bagShown){this._bagShown=true;setTimeout(()=>{if(this.view==='board'&&!this.drawer)this.setDrawer(true)},450)}},
  back(){this.setDrawer(false,true);this.view='ov';this.ui();this.refit(true)},
  setDrawer(open,silent){this.drawer=open;const E=this.el;if(innerWidth<700&&this.mode==='practice'){E.card.classList.toggle('min',open);E.card.dataset.key=''}E.view.classList.toggle('drawer-open',open);E.bagBtn.setAttribute('aria-expanded',open);E.bagAr.textContent=open?'▾':'▸';
    E.view.style.setProperty('--dhpx',E.drawer.offsetHeight+'px');
    if(!silent)setTimeout(()=>this.refit(true),20)},
  hover(e){if(this.view!=='ov'||!this.sim)return;const p=this.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(this.svg.getScreenCTM().inverse());const k=this.regionAt(q);
    if(k===this._hk)return;this._hk=k;if(!k){this.hl.innerHTML='';this.svg.style.cursor='';return}this.svg.style.cursor='zoom-in';
    const r=this.sim.regions[k],n=this.sim.names[k];const w=Math.max(n[0].length*9.2+40,150);
    this.hl.innerHTML=`<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="16" fill="rgba(44,122,107,.07)" stroke="#2c7a6b" stroke-width="3"/><rect x="${r[0]+r[2]/2-w/2}" y="${r[1]+r[3]-44}" width="${w}" height="34" rx="17" fill="#2c7a6b"/><text x="${r[0]+r[2]/2}" y="${r[1]+r[3]-21.5}" text-anchor="middle" font-size="16" font-weight="600" fill="#fff">${n[0]} 🔍</text>`},
  say(m){const t=this.el.toast;t.textContent=m;t.classList.add('on');clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove('on'),1800)},
  /* ---- practice stepper ---- */
  onRender(){if(!this.sim)return;this.drawerSync();if(this.mode!=='practice')return;
    const st=this.sim.status(),S=this.sim.steps;let just=-1;
    for(let i=0;i<S.length;i++){if(this.done[i])continue;if(S[i].ok(st)){this.done[i]=true;just=i}else break}
    this.drawSteps();this.drawStepCard();
    if(just>=0){const all=this.done.filter(Boolean).length===S.length;this.say(all?'🎉 خلصت كل خطوات التجربة':'✓ تمت الخطوة '+(just+1));const c=this.el.card;c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash')}},
  cur(){const S=this.sim.steps;for(let i=0;i<S.length;i++)if(!this.done[i])return i;return S.length},
  drawSteps(){const el=document.getElementById('live');if(!el)return;const S=this.sim.steps,c=this.cur(),n=this.done.filter(Boolean).length;
    el.innerHTML=`<div class="sh"><b>خطوات التجربة</b><span>${n} / ${S.length}</span></div><div class="prog"><i style="width:${n/S.length*100}%"></i></div>`+
      S.map((s,i)=>`<div class="step ${this.done[i]?'done':i===c?'cur':'todo'}"><span class="m">${this.done[i]?'✓':i+1}</span><span class="x">${s.t}</span>${i===c?`<button class="eye" data-dev="${s.dev}">وريني</button>`:''}</div>`).join('');
    el.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{this.focus(b.dataset.dev);if(innerWidth<=900)this.togglePanel(false)})},
  drawStepCard(){const c=this.el.card;if(!this.sim||this.mode!=='practice'){c.hidden=true;return}c.hidden=false;
    const S=this.sim.steps,i=this.cur(),all=i>=S.length;const min=c.classList.contains('min');
    const key=all+'|'+i+'|'+this.view;if(c.dataset.key===key)return;c.dataset.key=key;
    if(all){c.innerHTML=`<div class="num done">✓</div><div class="body"><div class="k">خلصت التجربة 🎉</div><div class="t">كل الخطوات تمت. جرّب طور الاختبار: نفس المانيوال بقيم مختلفة، ويصحّح لك.</div><div class="acts"><button class="go" id="scExam">ابدأ الاختبار</button></div></div>`;
      c.querySelector('#scExam').onclick=()=>this.enter(this.exp,'exam',true);return}
    const s=S[i];const here=this.view===s.dev;
    c.innerHTML=`<div class="num">${i+1}</div><div class="body"><div class="k">الخطوة ${i+1} من ${S.length}</div><div class="t">${s.t}</div><div class="acts">${here?'':`<button class="go" id="scGo">وريني وين</button>`}<button id="scAll">كل الخطوات</button></div></div><button class="mini" id="scMin" aria-label="تصغير">${min?'▴':'▾'}</button>`;
    const g=c.querySelector('#scGo');if(g)g.onclick=()=>this.focus(s.dev);
    c.querySelector('#scAll').onclick=()=>this.togglePanel(true);
    c.querySelector('#scMin').onclick=()=>{c.classList.toggle('min');c.dataset.key='';this.drawStepCard();this.refit(true)}}
};
