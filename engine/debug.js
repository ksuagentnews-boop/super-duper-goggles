/* ?debug=1 — a small overlay with the real viewport numbers, so one screenshot from a real phone (Safari, or the Claude
   app's preview, which runs the site inside an iframe) shows what the page actually gets. Only this window's own viewport
   is measured (innerWidth / visualViewport / CSS env() insets) — never screen.*, which describes the whole device. */
const DEBUG=(()=>{
  const on=/[?&]debug=1(&|$)/.test(location.search);if(!on)return {on:false,read:()=>null};
  const el=document.createElement('pre');el.id='dbgOverlay';el.setAttribute('dir','ltr');document.body.appendChild(el);
  /* safe-area insets: a probe whose padding is env(safe-area-inset-*) */
  const probe=document.createElement('div');probe.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;'+
    'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(probe);
  const r1=v=>Math.round(v*10)/10,R=r=>r?`${r1(r.x)},${r1(r.y)} ${r1(r.w)}×${r1(r.h)}`:'—';
  let framed='?';try{framed=window.top!==window?'yes':'no'}catch(_){framed='yes (cross-origin)'}
  function read(){const vv=window.visualViewport,cs=getComputedStyle(probe);const o={inner:{w:innerWidth,h:innerHeight},client:{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight},
      vv:vv?{w:r1(vv.width),h:r1(vv.height),x:r1(vv.offsetLeft),y:r1(vv.offsetTop),scale:r1(vv.scale*100)/100}:null,dpr:devicePixelRatio,iframe:framed,
      safe:{t:cs.paddingTop,r:cs.paddingRight,b:cs.paddingBottom,l:cs.paddingLeft},coarse:matchMedia('(pointer:coarse)').matches,orient:innerWidth>innerHeight?'landscape':'portrait'};
    const B=typeof BENCH!=='undefined'?BENCH:null,bv=document.getElementById('benchView');
    if(B&&B.sim&&bv&&!bv.hidden&&!B.sim.pc&&B.svg&&B.vb){const st=B.el.stage.getBoundingClientRect(),pd=B.pads();const m=B.svg.getScreenCTM();
      const scr=r=>r&&m?{x:r[0]*m.a+m.e,y:r[1]*m.d+m.f,w:r[2]*m.a,h:r[3]*m.d}:null;
      const free={x:st.left+pd.left,y:st.top+pd.top,w:st.width-pd.left-(pd.right||0),h:st.height-pd.top-pd.bottom};const cur=scr(B.curRect());
      o.bench={view:B.view,stage:{x:r1(st.left),y:r1(st.top),w:r1(st.width),h:r1(st.height)},free,bbox:scr(B.ovRect),target:cur,
        fill:cur?r1(Math.max(cur.w/free.w,cur.h/free.h)*100):null,avail:B.availArea(),userZoom:!!B.user,vb:B.vb}}
    return o}
  function draw(){const o=read();const L=[`inner ${o.inner.w}×${o.inner.h}   client ${o.client.w}×${o.client.h}   dpr ${o.dpr}   ${o.orient}${o.coarse?' · touch':''}`,
      o.vv?`visualViewport ${o.vv.w}×${o.vv.h} @ ${o.vv.x},${o.vv.y}  scale ${o.vv.scale}`:'visualViewport —',
      `safe-area t ${o.safe.t} r ${o.safe.r} b ${o.safe.b} l ${o.safe.l}   iframe ${o.iframe}`];
    if(o.bench){const b=o.bench;L.push(`bench view ${b.view}${b.userZoom?' (user zoom)':''}   stage ${R({x:b.stage.x,y:b.stage.y,w:b.stage.w,h:b.stage.h})}`,
      `free rect ${R(b.free)}   layout avail ${b.avail.W}×${b.avail.H}`,`fitted bbox ${R(b.bbox)}`,`view target ${R(b.target)}  fill ${b.fill} %`)}
    el.textContent=L.join('\n')}
  setInterval(draw,400);addEventListener('resize',draw);if(window.visualViewport)visualViewport.addEventListener('resize',draw);draw();
  return {on:true,read};
})();
