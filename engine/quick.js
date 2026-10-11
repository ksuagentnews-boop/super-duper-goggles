/* الوصول السريع: three-level menu following the corridor — level → its labs → experiments.
   A lab without experiments jumps to its door in the corridor; an experiment goes straight to its table and sits down.
   Labs and experiments not built yet are greyed out with "قريباً". */
const QUICK=(()=>{
  const el=$q('#quick');let lvl=null,lab=null,anchor=null;
  function place(){if(!anchor)return;const r=anchor.getBoundingClientRect();const w=el.offsetWidth,h=el.offsetHeight;
    let x=r.left;if(x+w>innerWidth-8)x=innerWidth-8-w;x=Math.max(8,x);let y=r.bottom+8;if(y+h>innerHeight-8)y=Math.max(8,innerHeight-8-h);
    el.style.left=x+'px';el.style.top=y+'px'}
  const soon='<span class="soon">قريباً</span>',arrow='<span class="qa">‹</span>';
  function draw(){
    if(lvl==null){el.innerHTML=`<div class="qh"><b>الوصول السريع</b><span>اختر المستوى</span></div><div class="qlist">`+REGISTRY.levels.map(v=>{const n=v.labs.length,b=v.labs.filter(L=>L.built).length;
        return `<button class="qi" data-level="${v.key}" role="menuitem"><span class="qn">${v.key==='elective'?'★':v.key}</span><span class="qt"><b class="ar">${v.ar}</b><small>${n===1?'معمل واحد':n===2?'معملين':n+' معامل'}${b?` · جاهز ${b}`:''} · <span dir="ltr">${v.en}</span></small></span>${arrow}</button>`}).join('')+`</div>`}
    else if(!lab){const v=REGISTRY.level(lvl);
      el.innerHTML=`<div class="qh"><button class="qback" aria-label="رجوع للمستويات">›</button><b>${v.ar}</b><span>${v.en}</span></div><div class="qlist">`+v.labs.map(L=>{const n=L.exps.length,b=L.exps.filter(e=>e.built).length;
        return `<button class="qi${L.built?'':' off'}" data-lab="${L.id}" role="menuitem"><span class="qn">${L.code}</span><span class="qt"><b>${L.title}</b><small>${L.ar}${n?` · ${n} تجارب`:''}${b&&b<n?` · جاهز ${b}`:''}</small></span>${L.built?arrow:soon}</button>`}).join('')+`</div>`}
    else{const L=REGISTRY.lab(lab);
      el.innerHTML=`<div class="qh"><button class="qback" aria-label="رجوع للمعامل">›</button><b>${L.code}</b><span>${L.title}</span></div><div class="qlist">`+L.exps.map(e=>
        `<button class="qi${e.built?'':' off'}" data-exp="${e.id}" role="menuitem" ${e.built?'':'aria-disabled="true"'}><span class="qn">Exp ${e.num}</span><span class="qt"><b>${e.en}</b><small>${e.ar}</small></span>${e.built?arrow:soon}</button>`).join('')+`</div>`}
    el.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{const k=b.dataset.level;lvl=k==='elective'?k:+k;draw()});
    /* a lab with experiments opens its list; one without (not built yet) takes the student to its door */
    el.querySelectorAll('[data-lab]').forEach(b=>b.onclick=()=>{const L=REGISTRY.lab(b.dataset.lab);if(L.exps.length){lab=L.id;draw();return}close();door(L.id)});
    const bk=el.querySelector('.qback');if(bk)bk.onclick=()=>{if(lab)lab=null;else lvl=null;draw()};
    el.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{const e=REGISTRY.exp(b.dataset.exp);if(!e.built){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return}close();go(e.id)});
    requestAnimationFrame(place)}
  const fromBench=f=>{if(!$q('#benchView').hidden){BENCH.leave(true);setTimeout(f,reduceMotion?0:380)}else f()};
  function go(id){fromBench(()=>HALL.goTo(id))}
  function door(id){fromBench(()=>HALL.goLab(id))}
  function open(a){if(!el.hidden&&anchor===a){close();return}anchor=a;lvl=null;lab=null;el.hidden=false;a.setAttribute('aria-expanded','true');draw()}
  function close(){el.hidden=true;if(anchor)anchor.setAttribute('aria-expanded','false');anchor=null}
  document.addEventListener('pointerdown',e=>{if(!el.hidden&&!el.contains(e.target)&&e.target!==anchor)close()},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden){close();e.stopImmediatePropagation()}},true);
  addEventListener('resize',place);
  return {open,close};
})();
