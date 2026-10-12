/* Figure viewer: every manual figure (img.figimg), step figure and captured scope screen opens full-screen on tap,
   with pinch-zoom / wheel zoom, drag to pan, double-tap to reset; ✕, ESC or a tap on the backdrop closes it. */
const FIG=(()=>{
  const el=document.createElement('div');el.id='figView';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML='<div class="fv-bar"><span class="fv-cap" id="fvCap"></span><button class="fv-x" id="fvX" aria-label="إغلاق">✕</button></div><div class="fv-stage" id="fvStage"><div class="fv-in" id="fvIn"></div></div><div class="fv-hint">قرّب بإصبعين أو بعجلة الماوس · اسحب للتحريك · اضغط مرتين للرجوع</div>';
  document.body.appendChild(el);
  const stage=el.querySelector('#fvStage'),inner=el.querySelector('#fvIn');let z=1,tx=0,ty=0;const pts=new Map();let pinch=null,pan=null,lastTap=0;
  const apply=()=>{inner.style.transform=`translate(${tx}px,${ty}px) scale(${z})`};
  const reset=()=>{z=1;tx=0;ty=0;apply()};
  function zoomAt(f,cx,cy){const r=stage.getBoundingClientRect();const ox=cx-r.left-r.width/2,oy=cy-r.top-r.height/2;const nz=clamp(z*f,1,8);const k=nz/z;tx=ox-(ox-tx)*k;ty=oy-(oy-ty)*k;z=nz;if(z===1){tx=0;ty=0}apply()}
  function open(node,cap){inner.innerHTML='';if(typeof node==='string'){const i=new Image();i.src=node;i.alt=cap||'';inner.appendChild(i)}else{const c=node.cloneNode(true);c.removeAttribute('style');c.removeAttribute('class');inner.appendChild(c)}
    el.querySelector('#fvCap').textContent=cap||'';reset();el.hidden=false}
  function close(){el.hidden=true;inner.innerHTML='';pts.clear();pinch=pan=null}
  el.querySelector('#fvX').onclick=close;
  stage.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
  stage.addEventListener('pointerdown',e=>{stage.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z};pan=null}else{pan={x:e.clientX,y:e.clientY,tx,ty,moved:false}}});
  stage.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size>=2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(pinch.z*d/pinch.d/z,(a.x+b.x)/2,(a.y+b.y)/2)}
    else if(pan){const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>4)pan.moved=true;if(z>1){tx=pan.tx+dx;ty=pan.ty+dy;apply()}}});
  const up=e=>{const wasPan=pan;pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){pan=null;
      if(wasPan&&!wasPan.moved){const now=Date.now();if(now-lastTap<320){z>1?reset():zoomAt(2.5,e.clientX,e.clientY);lastTap=0}else{lastTap=now;if(e.target===stage&&z===1)setTimeout(()=>{if(lastTap===now)close()},330)}}}};
  stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
  addEventListener('keydown',e=>{if(!el.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}},true);
  /* any figure on the page opens here */
  document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
    const img=t.closest('img.figimg');if(img){e.preventDefault();open(img.currentSrc||img.src,img.alt);return}
    const sv=t.closest('.slot svg, .figzoom');if(sv){e.preventDefault();const s=sv.matches('svg')?sv:sv.querySelector('svg,img');if(!s)return;s.tagName==='IMG'?open(s.src,s.alt):open(s,sv.closest('.slot')?.id||'')}});
  return {open,close,isOpen:()=>!el.hidden};
})();
