/* الوصول السريع: two-level menu (labs → experiments). Picking an experiment goes straight to its table and sits down.
   Experiments not built yet are greyed out with "قريباً". */
const QUICK=(()=>{
  const el=$q('#quick');let lab=null,anchor=null;
  function place(){if(!anchor)return;const r=anchor.getBoundingClientRect();const w=el.offsetWidth,h=el.offsetHeight;
    let x=r.left;if(x+w>innerWidth-8)x=innerWidth-8-w;x=Math.max(8,x);let y=r.bottom+8;if(y+h>innerHeight-8)y=Math.max(8,innerHeight-8-h);
    el.style.left=x+'px';el.style.top=y+'px'}
  function draw(){
    if(!lab){el.innerHTML=`<div class="qh"><b>الوصول السريع</b><span>اختر المعمل</span></div>`+REGISTRY.labs.map(L=>{const n=L.exps.length,b=L.exps.filter(e=>e.built).length;
        return `<button class="qi" data-lab="${L.id}" role="menuitem"><span class="qn">${L.code}</span><span class="qt"><b>${L.title}</b><small>${L.ar} · ${n} تجارب${b<n?` · جاهز ${b}`:''}</small></span><span class="qa">‹</span></button>`}).join('')}
    else{const L=REGISTRY.labs.find(x=>x.id===lab);
      el.innerHTML=`<div class="qh"><button class="qback" aria-label="رجوع للمعامل">›</button><b>${L.code}</b><span>${L.title}</span></div><div class="qlist">`+L.exps.map(e=>
        `<button class="qi${e.built?'':' off'}" data-exp="${e.id}" role="menuitem" ${e.built?'':'aria-disabled="true"'}><span class="qn">Exp ${e.num}</span><span class="qt"><b>${e.en}</b><small>${e.ar}</small></span>${e.built?'<span class="qa">‹</span>':'<span class="soon">قريباً</span>'}</button>`).join('')+`</div>`}
    el.querySelectorAll('[data-lab]').forEach(b=>b.onclick=()=>{lab=b.dataset.lab;draw()});
    const bk=el.querySelector('.qback');if(bk)bk.onclick=()=>{lab=null;draw()};
    el.querySelectorAll('[data-exp]').forEach(b=>b.onclick=()=>{const e=REGISTRY.exp(b.dataset.exp);if(!e.built){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return}close();go(e.id)});
    requestAnimationFrame(place)}
  function go(id){if(!$q('#benchView').hidden){BENCH.leave(true);setTimeout(()=>HALL.goTo(id),reduceMotion?0:380)}else HALL.goTo(id)}
  function open(a){if(!el.hidden&&anchor===a){close();return}anchor=a;lab=null;el.hidden=false;a.setAttribute('aria-expanded','true');draw()}
  function close(){el.hidden=true;if(anchor)anchor.setAttribute('aria-expanded','false');anchor=null}
  document.addEventListener('pointerdown',e=>{if(!el.hidden&&!el.contains(e.target)&&e.target!==anchor)close()},true);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden){close();e.stopImmediatePropagation()}},true);
  addEventListener('resize',place);
  return {open,close};
})();
