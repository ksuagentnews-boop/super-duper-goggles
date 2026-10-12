/* ======================= 3D HALL =======================
   First-person scenes (Three.js r128), built only from the lab registry (labs/index.js):
   - corridor of the EE department ordered by study level (level signs, doors facing each other, each with its sign),
     ending in the electives courtyard;
   - lab room: room.rows × room.cols tables filled with the lab's experiments in order (row 1 nearest the
     whiteboard, left to right), a sign above every table, each table carrying its `bench` instruments,
     and an exit door back to the corridor.
   The site opens at the corridor entrance. Desktop: WASD / arrows + mouse drag.
   Touch: drag to look, tap floor to walk, tap a chair (or a door) to walk there. */
const HALL=(()=>{
  const cv=$q('#hallCanvas'),tip=$q('#tip'),prompt=$q('#prompt'),hint=$q('#hallHint');
  const coarse=matchMedia('(pointer:coarse)').matches;
  const P={x:0,z:6.6,y:1.65,yaw:0,pitch:-0.06};
  let R,scene,cam,ok=false,running=true,mode='walk',anim=null,path=[],keys={},last=0,stuck=0,hoverB=null,seatB=null;
  const benches=[],pick=[],doors=[],floors=[];
  const CUR={kind:null,lab:null};
  const EYE=1.65,SPEED=2.4;
  let ROOM={x0:-12,x1:12,z0:-8.5,z1:8.5,pad:[0.45,0.95,0.4,0.4]};
  const HINT_ROOM=coarse?'اسحب بإصبعك عشان تلتفت · اضغط على الأرض عشان تمشي، وعلى الكرسي عشان تجلس':'اضغط في المشهد عشان تتحكم بالماوس (حرّك الماوس للالتفات) · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> أو الأسهم للمشي · <kbd>ESC</kbd> يطلع الماوس';
  const HINT_LOCK='حرّك الماوس عشان تلتفت · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> للمشي · اضغط (أو <kbd>E</kbd>) على الكرسي اللي تحت العلامة عشان تجلس · <kbd>ESC</kbd> يطلع الماوس';
  const HINT_CORR=coarse?'اسحب بإصبعك عشان تلتفت · اضغط على الأرض عشان تمشي، وعلى باب المعمل عشان تدخله · ⚡ الوصول السريع يختصر المشوار':'اضغط في المشهد عشان تتحكم بالماوس · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> للمشي · اضغط على باب المعمل اللي تحت العلامة عشان تدخله · <kbd>ESC</kbd> يطلع الماوس';

  function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=R.capabilities.getMaxAnisotropy();return t}
  function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
  const AR='"IBM Plex Sans Arabic", Tahoma, sans-serif',MO='"IBM Plex Mono", Menlo, monospace';
  function std(c,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o))}
  function boxM(w,h,d,mats,x,y,z,shadow=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m}

  /* --- instrument faces --- */
  function panel(g,w,h,title,bg='#e3e8ea'){g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle='#aab6ba';g.lineWidth=6;rr(g,3,3,w-6,h-6,18);g.stroke();g.fillStyle='#3b4a50';g.font=`600 ${h*.07}px ${MO}`;g.fillText(title,w*.05,h*.12)}
  function knob(g,x,y,r,c='#c9d1d5',s='#7d8c92'){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=s;g.lineWidth=r*.18;g.stroke();g.strokeStyle='#55646a';g.lineWidth=r*.15;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-r*.8);g.stroke()}
  const FACES={
    scope:(g,w,h)=>{panel(g,w,h,'GW INSTEK  GDS-1104B');g.fillStyle='#0a0f12';rr(g,w*.04,h*.17,w*.5,h*.66,10);g.fill();
      g.strokeStyle='#1d2c31';g.lineWidth=2;for(let i=1;i<10;i++){const x=w*.04+w*.05*i;g.beginPath();g.moveTo(x,h*.19);g.lineTo(x,h*.81);g.stroke()}for(let j=1;j<8;j++){const y=h*.17+h*.0825*j;g.beginPath();g.moveTo(w*.05,y);g.lineTo(w*.53,y);g.stroke()}
      const tr=(col,a,ph)=>{g.strokeStyle=col;g.lineWidth=4;g.beginPath();for(let i=0;i<=200;i++){const x=w*.05+w*.48*i/200,y=h*.5-Math.sin(i/200*Math.PI*4+ph)*h*a;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()};tr('#f2c230',.2,0);tr('#3fd3d8',.11,0);
      ['Measure','Cursor','Acquire','Display','Utility','Help','Autoset','Run/Stop','Default'].forEach((k,i)=>{const x=w*.58+(i%3)*w*.075,y=h*.15+Math.floor(i/3)*h*.09;g.fillStyle=k==='Autoset'?'#f2b632':'#f4f6f7';rr(g,x,y,w*.065,h*.065,5);g.fill()});
      ['#d8a800','#1ba9ae','#c2389e','#2f6bd9'].forEach((c,i)=>{knob(g,w*(.6+i*.075),h*.56,h*.04,'#c9d1d5',c);knob(g,w*(.6+i*.075),h*.72,h*.045,'#c9d1d5',c);g.fillStyle='#2c3438';g.beginPath();g.arc(w*(.6+i*.075),h*.9,h*.035,0,7);g.fill()});
      knob(g,w*.93,h*.56,h*.045);knob(g,w*.93,h*.72,h*.045);g.fillStyle='#2d3438';rr(g,w*.04,h*.86,w*.08,h*.08,5);g.fill()},
    gen:(g,w,h)=>{panel(g,w,h,'PeakTech 4124');g.fillStyle='#1d3f9e';rr(g,w*.05,h*.18,w*.5,h*.5,8);g.fill();g.fillStyle='#fff';g.font=`600 ${h*.12}px ${MO}`;g.fillText('1.000kHz',w*.08,h*.38);g.fillStyle='#ffe066';g.fillText('4.000Vpp',w*.08,h*.58);
      for(let i=0;i<16;i++){g.fillStyle='#f4f6f7';rr(g,w*.62+(i%4)*w*.085,h*.18+Math.floor(i/4)*h*.12,w*.07,h*.09,5);g.fill()}
      g.fillStyle='#2d3438';rr(g,w*.05,h*.78,w*.12,h*.12,6);g.fill();g.fillStyle='#2c3438';g.beginPath();g.arc(w*.86,h*.82,h*.08,0,7);g.fill();g.fillStyle='#c8a24a';g.beginPath();g.arc(w*.86,h*.82,h*.03,0,7);g.fill()},
    psu:(g,w,h)=>{panel(g,w,h,'TTi  EL302RD  DUAL POWER SUPPLY','#e7e3d8');
      [0,1].forEach(u=>{const x0=w*(.04+u*.48);g.fillStyle='#160606';rr(g,x0,h*.18,w*.44,h*.24,6);g.fill();g.fillStyle='#ff3b2a';g.font=`600 ${h*.15}px ${MO}`;g.textAlign='right';g.fillText(u?'5.00':'12.00',x0+w*.2,h*.36);g.fillText(u?'1.000':'0.500',x0+w*.42,h*.36);g.textAlign='left';
        knob(g,x0+w*.07,h*.58,h*.07,'#f4f1ea','#b7b0a0');knob(g,x0+w*.19,h*.58,h*.07,'#f4f1ea','#b7b0a0');knob(g,x0+w*.36,h*.58,h*.07,'#f4f1ea','#b7b0a0');
        g.fillStyle='#222';g.beginPath();g.arc(x0+w*.14,h*.85,h*.05,0,7);g.fill();g.fillStyle='#d43a2c';g.beginPath();g.arc(x0+w*.24,h*.85,h*.05,0,7);g.fill();g.fillStyle='#d9d6ce';g.beginPath();g.arc(x0+w*.36,h*.85,h*.045,0,7);g.fill()});
      g.fillStyle='#f7f7f4';rr(g,w*.015,h*.74,w*.05,h*.18,4);g.fill()},
    dmm:(g,w,h)=>{g.fillStyle='#30363a';g.fillRect(0,0,w,h);g.fillStyle='#1f6fc0';g.fillRect(0,0,w*.03,h);g.fillRect(w*.97,0,w*.03,h);g.fillStyle='#e9eef0';g.font=`700 ${h*.1}px ${MO}`;g.fillText('MCP MT3805',w*.06,h*.14);
      g.fillStyle='#a7cfe2';rr(g,w*.06,h*.2,w*.6,h*.38,6);g.fill();g.fillStyle='#14323f';g.font=`600 ${h*.18}px ${MO}`;g.fillText('0.00000 V',w*.1,h*.48);
      for(let i=0;i<9;i++){g.fillStyle='#22282b';g.beginPath();g.arc(w*(.12+i*.065),h*.72,h*.05,0,7);g.fill()}
      [['#b52a22',.78,.28],['#222',.78,.5],['#b52a22',.78,.72],['#b52a22',.88,.28],['#222',.88,.5]].forEach(([c,x,y])=>{g.fillStyle=c;g.beginPath();g.arc(w*x,h*y,h*.06,0,7);g.fill()})},
    xf:(g,w,h)=>{g.fillStyle='#7d4632';g.fillRect(0,0,w,h);g.strokeStyle='#3e1f15';g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.fillStyle='#ffe3c9';g.font=`600 ${h*.08}px ${MO}`;g.fillText('CENTER-TAPPED',w*.07,h*.18);g.fillText('TRANSFORMER',w*.07,h*.29);
      g.font=`500 ${h*.06}px ${MO}`;g.fillStyle='#f2c9ab';g.fillText('220 V → 2 × 6.4 V rms',w*.07,h*.4);[['A','#ff8c2e'],['B','#3cbf5c'],['C','#3f8cff']].forEach(([l,c],i)=>{g.fillStyle=c;g.beginPath();g.arc(w*.82,h*(.3+i*.22),h*.07,0,7);g.fill();g.fillStyle='#fff';g.font=`600 ${h*.08}px ${MO}`;g.fillText(l,w*.68,h*(.33+i*.22))})},
    pc:(g,w,h)=>{g.fillStyle='#1c2326';g.fillRect(0,0,w,h);g.fillStyle='#f3f3f0';g.fillRect(w*.03,h*.05,w*.94,h*.88);g.fillStyle='#dfe4e6';g.fillRect(w*.03,h*.05,w*.94,h*.09);
      g.fillStyle='#1c2326';g.font=`600 ${h*.055}px ${MO}`;g.fillText('LTspice — Draft1.asc',w*.06,h*.115);g.strokeStyle='#1a5fb4';g.lineWidth=4;
      g.beginPath();g.moveTo(w*.2,h*.35);g.lineTo(w*.7,h*.35);g.moveTo(w*.2,h*.75);g.lineTo(w*.7,h*.75);g.moveTo(w*.2,h*.35);g.lineTo(w*.2,h*.75);g.moveTo(w*.7,h*.35);g.lineTo(w*.7,h*.75);g.stroke();
      g.fillStyle='#1a5fb4';g.beginPath();g.arc(w*.2,h*.55,h*.07,0,7);g.fill();g.fillStyle='#f3f3f0';g.font=`600 ${h*.06}px ${MO}`;g.fillText('~',w*.185,h*.57);g.fillStyle='#1c2326';g.fillText('.tran 50m',w*.3,h*.88)},
    dbox:(g,w,h)=>{g.fillStyle='#1e2224';g.fillRect(0,0,w,h);g.fillStyle='#e9eef0';g.font=`600 ${h*.11}px ${MO}`;g.fillText('DECADE RESISTANCE',w*.06,h*.18);for(let i=0;i<5;i++){knob(g,w*(.12+i*.19),h*.55,h*.12,'#3a4246','#c9d1d5');g.fillStyle='#e9eef0';g.font=`500 ${h*.08}px ${MO}`;g.fillText(['×1','×10','×100','×1k','×10k'][i],w*(.07+i*.19),h*.86)}}
  };
  function instrument(kind,w,h,d,x,z,top){const side=std(kind==='dmm'||kind==='dbox'?'#2f3538':kind==='psu'?'#d9d4c8':'#d6dde0',{roughness:.55}),f=std('#fff',{map:tex(512,Math.round(512*h/w),(g,W,H)=>FACES[kind](g,W,H)),roughness:.5});
    const sc=kind==='xf'?std('#6e3b2a'):side;return boxM(w,h,d,[sc,sc,sc,sc,f,sc],x,top+h/2,z)}
  const SIZE={gen:[0.44,0.2,0.3],psu:[0.42,0.2,0.3],scope:[0.54,0.27,0.3],dmm:[0.32,0.13,0.28],xf:[0.46,0.3,0.34],dbox:[0.24,0.11,0.17]};
  function boardTex(){return tex(512,340,(g,W,H)=>{g.fillStyle='#e6eae8';g.fillRect(0,0,W,H);for(let i=0;i<35;i++){const cx=40+(i%7)*72,cy=40+Math.floor(i/7)*65;g.fillStyle='#d7ddda';rr(g,cx-26,cy-24,52,48,8);g.fill();g.fillStyle='#2f3739';for(let h=0;h<9;h++){g.beginPath();g.arc(cx+((h%3)-1)*14,cy+(Math.floor(h/3)-1)*13,3.2,0,7);g.fill()}}})}
  function sign(e){const L=e.lab;return tex(1024,300,(g,W,H)=>{g.fillStyle=e.built?'#2c7a6b':'#8fa29c';rr(g,8,8,W-16,H-16,40);g.fill();g.fillStyle='#fff';g.textAlign='center';g.font=`600 96px ${MO}`;g.fillText(`Exp ${e.num}`,W/2,118);
    let fs=44;g.font=`500 ${fs}px ${MO}`;while(g.measureText(e.en).width>W-90&&fs>24){fs-=2;g.font=`500 ${fs}px ${MO}`}g.fillStyle='#e6f3ef';g.fillText(e.en,W/2,186);
    g.direction='rtl';g.font=`600 46px ${AR}`;g.fillStyle='#fff';g.fillText(e.ar,W/2,258);
    g.direction='ltr';g.textAlign='left';g.font=`600 30px ${MO}`;g.fillStyle='rgba(255,255,255,.75)';g.fillText(L.code,40,64);
    if(!e.built){g.fillStyle='#fff';rr(g,W-200,30,160,52,26);g.fill();g.fillStyle='#5d6b67';g.direction='rtl';g.textAlign='center';g.font=`600 32px ${AR}`;g.fillText('قريباً',W-120,68)}})}

  function makeBench(x,z,e){
    const top=0.9;const lam=std('#ede8dd',{roughness:.6}),frame=std('#56636a',{roughness:.5,metalness:.3});
    boxM(2.5,0.05,1.05,lam,x,top-0.025,z);[[-1.18,-0.45],[1.18,-0.45],[-1.18,0.45],[1.18,0.45]].forEach(([dx,dz])=>boxM(0.06,top-0.05,0.06,frame,x+dx,(top-0.05)/2,z+dz));
    boxM(2.3,0.5,0.03,std('#cfd8d4'),x,0.5,z-0.48,false);
    boxM(2.5,0.12,0.04,std('#d9e1de'),x,top+0.06,z-0.53);
    const kinds=e.bench.filter(k=>k!=='dbox'&&k!=='pc');
    if(e.bench.includes('pc')){
      const mon=instrument('pc',0.62,0.4,0.04,x,z-0.32,top+0.12);boxM(0.06,0.12,0.06,frame,x,top+0.06,z-0.32);boxM(0.26,0.015,0.18,frame,x,top+0.008,z-0.32);
      boxM(0.48,0.02,0.16,std('#2a3034'),x-0.05,top+0.01,z+0.12);boxM(0.07,0.025,0.11,std('#2a3034'),x+0.34,top+0.012,z+0.14);
      boxM(0.2,0.42,0.42,std('#2a3034'),x+0.95,top+0.21,z-0.2)}
    else{const gap=0.06;let tot=kinds.reduce((s,k)=>s+SIZE[k][0],0)+gap*(kinds.length-1);let cx=x-tot/2;
      kinds.forEach(k=>{const [w,h,d]=SIZE[k];instrument(k,w,h,d,cx+w/2,z-0.26,top);cx+=w+gap});
      if(e.bench.includes('dbox')){instrument('dbox',...SIZE.dbox,x-0.95,z+0.2,top);instrument('dbox',...SIZE.dbox,x-0.68,z+0.2,top)}
      const bb=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.02,0.32),[std('#c3cbc8'),std('#c3cbc8'),std('#fff',{map:boardTex()}),std('#c3cbc8'),std('#c3cbc8'),std('#c3cbc8')]);bb.position.set(x+0.05,top+0.01,z+0.2);bb.receiveShadow=true;scene.add(bb)}
    // stool
    const cz=z+0.98,ch=new THREE.Group();const seatM=std(e.built?'#2f6f63':'#8a9692',{roughness:.5});
    const seat=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.06,28),seatM);seat.position.y=0.62;seat.castShadow=true;ch.add(seat);
    const back=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.2,0.04),seatM);back.position.set(0,0.86,0.2);back.castShadow=true;ch.add(back);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.6,10),frame);pole.position.y=0.3;ch.add(pole);
    const bp=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.26,8),frame);bp.position.set(0,0.74,0.18);ch.add(bp);
    for(let i=0;i<5;i++){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.04),frame);leg.position.set(Math.cos(i*1.2566)*0.13,0.03,Math.sin(i*1.2566)*0.13);leg.rotation.y=-i*1.2566;ch.add(leg)}
    ch.position.set(x,0,cz);scene.add(ch);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.34,0.42,40),new THREE.MeshBasicMaterial({color:e.built?0x2c7a6b:0x8a9692,transparent:true,opacity:0}));ring.rotation.x=-Math.PI/2;ring.position.set(x,0.012,cz);scene.add(ring);
    // hanging sign, readable from both sides
    const sm=new THREE.MeshBasicMaterial({map:sign(e),transparent:true});
    [0,Math.PI].forEach(r=>{const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.44),sm);sg.position.set(x,2.98,z-0.2+(r?-0.004:0.004));sg.rotation.y=r;scene.add(sg)});
    /* hung just under the ceiling so no sign hides the whiteboard from the aisles */
    [-0.6,0.6].forEach(dx=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.1,4),frame);w.position.set(x+dx,3.25,z-0.2);scene.add(w)});
    const B={x,z,cz,num:e.num,e,built:e.built,seatM,ring,box:[x-1.3,x+1.3,z-0.58,z+0.58]};benches.push(B);
    ch.traverse(o=>{if(o.isMesh){o.userData.bench=B;pick.push(o)}});
    return B}

  /* ---------- scenes ---------- */
  function freshScene(shadows=true,bg='#e9eeec'){
    if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const ms=o.material?[].concat(o.material):[];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});
    benches.length=0;pick.length=0;doors.length=0;floors.length=0;hoverB=null;
    scene=new THREE.Scene();scene.background=new THREE.Color(bg);
    scene.add(new THREE.HemisphereLight(0xffffff,0xd8cdb8,0.75));
    const dl=new THREE.DirectionalLight(0xffffff,0.55);dl.position.set(3,9,4);dl.castShadow=shadows;dl.shadow.mapSize.set(2048,2048);Object.assign(dl.shadow.camera,{left:-13,right:13,top:10,bottom:-10,far:24});dl.shadow.bias=-0.0006;dl.shadow.radius=3;scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff,0.18));
  }
  function floorAndWalls(floorCol,wallCol){
    const W=ROOM.x1-ROOM.x0,D=ROOM.z1-ROOM.z0,cx=(ROOM.x0+ROOM.x1)/2,cz=(ROOM.z0+ROOM.z1)/2;
    const ft=tex(512,512,(g,Wt,Ht)=>{g.fillStyle=floorCol;g.fillRect(0,0,Wt,Ht);g.strokeStyle='#c5ccc8';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*Wt/4,0);g.lineTo(i*Wt/4,Ht);g.stroke();g.beginPath();g.moveTo(0,i*Ht/4);g.lineTo(Wt,i*Ht/4);g.stroke()}
      for(let i=0;i<500;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${130+Math.random()*50|0},${125+Math.random()*50|0},.08)`;g.fillRect(Math.random()*Wt,Math.random()*Ht,3,3)}});
    ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(W/2.4,D/2.4);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std('#fff',{map:ft,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.set(cx,0,cz);floor.receiveShadow=true;scene.add(floor);floors.push(floor);
    const wallM=std(wallCol,{roughness:.95}),dado=std('#c9d3cf');
    const wall=(w,x,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.3),wallM);m.position.set(x,1.65,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);const d=new THREE.Mesh(new THREE.PlaneGeometry(w,0.95),dado);d.position.set(x,0.475,z);d.rotation.y=ry;d.position.x+=Math.sin(ry)*0.005;d.position.z+=Math.cos(ry)*0.005;scene.add(d)};
    wall(W,cx,ROOM.z0,0);wall(W,cx,ROOM.z1,Math.PI);wall(D,ROOM.x0,cz,Math.PI/2);wall(D,ROOM.x1,cz,-Math.PI/2);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std('#f3f5f4'));ceil.rotation.x=Math.PI/2;ceil.position.set(cx,3.3,cz);scene.add(ceil);
  }
  /* text that always fits its sign */
  function fit(c,t,w,px,fam,maxW){let n=px;c.font=`${w} ${n}px ${fam}`;while(c.measureText(t).width>maxW&&n>12){n-=2;c.font=`${w} ${n}px ${fam}`}}
  /* a door in a wall (ry = which way it faces; front = where the student stands to use it).
     o.closed: a lab not built yet (closed door with a "قريباً" plate, never opens); o.kind: 'lab' | 'exit' */
  function door(x,z,ry,label,sub,ar,go,front,o={}){const muted=!!o.closed;
    const g=new THREE.Group();const fr=std('#e9ecea'),wood=std(muted?'#b9a48f':'#a97c5a',{roughness:.6});
    const panel=new THREE.Mesh(new THREE.BoxGeometry(1.1,2.2,0.06),wood);panel.position.set(0,1.1,0);g.add(panel);
    [[-0.6,1.12,0.08,2.3],[0.6,1.12,0.08,2.3]].forEach(([dx,y,w,h])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.12),fr);m.position.set(dx,y,0);g.add(m)});
    const top=new THREE.Mesh(new THREE.BoxGeometry(1.28,0.08,0.12),fr);top.position.set(0,2.27,0);g.add(top);
    const win=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.6),new THREE.MeshBasicMaterial({color:muted?0xc4cdd0:0xcfe6ee}));win.position.set(0.2,1.5,0.032);g.add(win);
    const hd=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.03,0.05),std('#9aa3a8',{metalness:.6,roughness:.3}));hd.position.set(-0.38,1.05,0.05);g.add(hd);
    if(muted){const pm=new THREE.MeshBasicMaterial({map:tex(320,150,(c,Wt,Ht)=>{c.fillStyle='#f6f1e4';rr(c,4,4,Wt-8,Ht-8,16);c.fill();c.strokeStyle='#8a7a62';c.lineWidth=5;c.stroke();
        c.textAlign='center';c.direction='rtl';c.fillStyle='#5a4a35';c.font=`700 58px ${AR}`;c.fillText('قريباً',Wt/2,74);c.direction='ltr';c.font=`500 28px ${MO}`;c.fillStyle='#7a6a52';c.fillText('Coming soon',Wt/2,120)})});
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.215),pm);pl.position.set(-0.12,1.32,0.035);g.add(pl)}
    if(label){const sm=new THREE.MeshBasicMaterial({map:tex(800,260,(c,Wt,Ht)=>{c.fillStyle=muted?'#8fa29c':'#2c7a6b';rr(c,6,6,Wt-12,Ht-12,30);c.fill();c.fillStyle='#fff';c.textAlign='center';c.font=`700 100px ${MO}`;c.fillText(label,Wt/2,112);
        fit(c,sub,500,40,MO,Wt-60);c.fillStyle='#e6f3ef';c.fillText(sub,Wt/2,172);c.direction='rtl';fit(c,ar,600,40,AR,Wt-60);c.fillStyle='#fff';c.fillText(ar,Wt/2,228)}),transparent:true});
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.49),sm);sg.position.set(0,2.72,0.07);g.add(sg)}
    g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
    const D={x,z,ry,front,go,label,sub,ar,closed:muted,kind:o.kind||'lab',lab:o.lab,court:!!o.court};doors.push(D);g.traverse(o2=>{if(o2.isMesh){o2.userData.door=D;pick.push(o2)}});return D}
  /* --- the EE department corridor, generated from the registry only ---
     Entrance at z = 0, the student looks down the corridor (−z). A hanging sign marks each study level (5 → 8); after it
     come that level's doors, facing each other in pairs. After Level 8 a wide gateway signed "الاختيارية · Electives"
     opens into a square courtyard whose left, front and right walls carry the elective doors (n → split over the three
     walls, the courtyard grows with n); a "عد إلى المقدمة" stand in its middle takes the student back to the entrance. */
  const CW=2.4,START={x:0,z:-0.9};let COURT=null;
  function wallP(w,x,z,ry,wallM,dado,h=3.3){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),wallM);m.position.set(x,h/2,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);
    const d=new THREE.Mesh(new THREE.PlaneGeometry(w,0.95),dado);d.position.set(x+Math.sin(ry)*0.005,0.475,z+Math.cos(ry)*0.005);d.rotation.y=ry;scene.add(d)}
  function floorRect(x0,x1,z0,z1,col,line,tile){const W=x1-x0,D=z1-z0;const ft=tex(512,512,(g,Wt,Ht)=>{g.fillStyle=col;g.fillRect(0,0,Wt,Ht);g.strokeStyle=line;g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*Wt/4,0);g.lineTo(i*Wt/4,Ht);g.stroke();g.beginPath();g.moveTo(0,i*Ht/4);g.lineTo(Wt,i*Ht/4);g.stroke()}
      for(let i=0;i<500;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${130+Math.random()*50|0},${125+Math.random()*50|0},.08)`;g.fillRect(Math.random()*Wt,Math.random()*Ht,3,3)}});
    ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(W/tile,D/tile);const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std('#fff',{map:ft,roughness:.9}));f.rotation.x=-Math.PI/2;f.position.set((x0+x1)/2,0,(z0+z1)/2);f.receiveShadow=true;scene.add(f);floors.push(f);return f}
  /* hanging two-sided sign (level marks, gateway) */
  function hangSign(x,z,w,h,y,ar,en,col='#2c7a6b'){const t=tex(1200,Math.round(1200*h/w),(g,Wt,Ht)=>{g.fillStyle='#fbfcfc';rr(g,6,6,Wt-12,Ht-12,26);g.fill();g.fillStyle=col;rr(g,6,6,Wt-12,Ht*0.16,14);g.fill();g.fillRect(6,Ht*0.1,Wt-12,Ht*0.06);
      g.textAlign='center';g.direction='rtl';g.fillStyle='#1e2a28';fit(g,ar,700,Ht*0.36,AR,Wt-80);g.fillText(ar,Wt/2,Ht*0.58);g.direction='ltr';g.fillStyle=col;fit(g,en,600,Ht*0.2,MO,Wt-80);g.fillText(en,Wt/2,Ht*0.86)});
    const m=new THREE.MeshBasicMaterial({map:t});[0,Math.PI].forEach(ry=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(x,y,z+(ry?-0.012:0.012));p.rotation.y=ry;scene.add(p)});
    const rod=std('#9aa3a8',{metalness:.5,roughness:.4});[-1,1].forEach(sx=>boxM(0.025,3.3-(y+h/2),0.025,rod,x+sx*w*0.38,(3.3+y+h/2)/2,z,false))}
  function buildCorridor(){
    const main=REGISTRY.levels.filter(v=>v.key!=='elective'),E=(REGISTRY.level('elective')||{labs:[]}).labs;
    /* plan along the corridor: d = distance from the entrance */
    const plan=[];let d=7.0;
    main.forEach(v=>{plan.push({v,d});const n=v.labs.length;v.labs.forEach((Lb,i)=>plan.push({Lb,d:d+2.1+Math.floor(i/2)*3.0,side:i%2?1:-1}));d+=2.1+Math.max(1,Math.ceil(n/2))*3.0+0.3});
    const dG=d,n=E.length,b=Math.floor(n/3),rm=n%3,cnt=rm===0?[b,b,b]:rm===1?[b,b+1,b]:[b+1,b,b+1];
    const S=n?Math.max(12,Math.max(...cnt)*3.2+3.6):0,zF=-(dG+S);
    ROOM={x0:n?-S/2:-CW,x1:n?S/2:CW,z0:n?zF:-dG,z1:0,pad:[.45,.45,.45,.45],rects:[[-CW,CW,-dG-(n?1.2:0),0]].concat(n?[[-S/2,S/2,zF,-dG]]:[]),obst:[]};
    freshScene(false,'#e9eeec');
    const wallM=std('#e8ece6',{roughness:.95}),dado=std('#c9d3cf');
    floorRect(-CW,CW,-dG,0,'#d8dcd6','#c5ccc8',2.4);
    wallP(dG,-CW,-dG/2,Math.PI/2,wallM,dado);wallP(dG,CW,-dG/2,-Math.PI/2,wallM,dado);wallP(2*CW,0,0,Math.PI,wallM,dado);
    if(!n)wallP(2*CW,0,-dG,0,wallM,dado);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(2*CW,dG),std('#f3f5f4'));ceil.rotation.x=Math.PI/2;ceil.position.set(0,3.3,-dG/2);scene.add(ceil);
    for(let z=-6;z>-dG;z-=9){const pl=new THREE.PointLight(0xfff6e8,0.25,11,2);pl.position.set(0,3.0,z);scene.add(pl)}
    for(let z=-2;z>-dG;z-=3.4){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.45),new THREE.MeshBasicMaterial({color:0xffffff}));l.rotation.x=Math.PI/2;l.position.set(0,3.29,z);scene.add(l)}
    /* department banner near the entrance */
    const ban=tex(1400,330,(g,Wt,Ht)=>{g.fillStyle='#fbfcfc';g.fillRect(0,0,Wt,Ht);g.fillStyle='#2c7a6b';g.fillRect(0,0,Wt,22);g.textAlign='center';g.direction='rtl';g.fillStyle='#1e2a28';g.font=`700 88px ${AR}`;g.fillText('قسم الهندسة الكهربائية',Wt/2,140);
      g.direction='ltr';g.font=`500 46px ${MO}`;g.fillStyle='#2c7a6b';g.fillText('Electrical Engineering Department',Wt/2,218);g.font=`500 34px ${MO}`;g.fillStyle='#5d6b67';g.fillText('College of Engineering · King Saud University',Wt/2,290)});
    const bm=new THREE.Mesh(new THREE.PlaneGeometry(2.6,0.61),new THREE.MeshBasicMaterial({map:ban}));bm.position.set(0,2.92,-4.0);scene.add(bm);
    /* level signs and their doors */
    let li=0;plan.forEach(it=>{if(it.v){/* alternate sides: seen from the entrance the level signs never stack */hangSign((li++%2?1:-1)*1.18,-it.d,2.0,0.5,2.52,it.v.ar,it.v.en);return}
      const Lb=it.Lb,x=it.side*(CW-0.035),z=-it.d;
      door(x,z,it.side>0?-Math.PI/2:Math.PI/2,Lb.code,Lb.title,Lb.ar,()=>show('room',Lb.id),{x:it.side*1.2,z},{closed:!Lb.built,lab:Lb.id})});
    COURT=null;
    if(n){/* gateway + electives courtyard */
      const cz=-(dG+S/2);COURT={S,dG,cz};
      floorRect(-S/2,S/2,zF,-dG,'#e2ddd2','#cfc7b7',1.6);
      const cw=std('#ece7dc',{roughness:.95}),cd=std('#cfc8b9');const side=S/2-CW;
      wallP(side,-(CW+side/2),-dG,Math.PI,cw,cd,4);wallP(side,CW+side/2,-dG,Math.PI,cw,cd,4);
      wallP(S,-S/2,cz,Math.PI/2,cw,cd,4);wallP(S,S/2,cz,-Math.PI/2,cw,cd,4);wallP(S,0,zF,0,cw,cd,4);
      const cc=new THREE.Mesh(new THREE.PlaneGeometry(S,S),std('#f3f5f4'));cc.rotation.x=Math.PI/2;cc.position.set(0,4,cz);scene.add(cc);
      const panelM=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.6),panelM);l.rotation.x=Math.PI/2;l.position.set(i*S/3.4,3.99,cz+j*S/3.4);scene.add(l)}
      const pl=new THREE.PointLight(0xfff6e8,0.3,S*1.3,2);pl.position.set(0,3.6,cz);scene.add(pl);
      const fr=std('#cbd5d1');boxM(0.5,4,0.6,fr,-CW-0.25,2,-dG,false);boxM(0.5,4,0.6,fr,CW+0.25,2,-dG,false);boxM(2*CW+1,0.5,0.6,fr,0,3.55,-dG,false);
      hangSign(0,-dG+0.4,3.6,0.86,2.72,'الاختيارية','Electives · Elective Labs');
      /* elective doors: left wall (from the gateway inwards), front wall (left to right), right wall (front to back) */
      let k=0;const place=(c,fn)=>{for(let i=0;i<c;i++){const Lb=E[k++];fn(Lb,(i+1)/(c+1))}};
      const mk=(Lb,x,z,ry,fx,fz)=>door(x,z,ry,Lb.code,Lb.title,Lb.ar,()=>show('room',Lb.id),{x:fx,z:fz},{closed:!Lb.built,lab:Lb.id,court:true});
      place(cnt[0],(Lb,t)=>{const z=-dG-S*t;mk(Lb,-S/2+0.035,z,Math.PI/2,-S/2+1.2,z)});
      place(cnt[1],(Lb,t)=>{const x=-S/2+S*t;mk(Lb,x,zF+0.035,0,x,zF+1.2)});
      place(cnt[2],(Lb,t)=>{const z=zF+S*t;mk(Lb,S/2-0.035,z,-Math.PI/2,S/2-1.2,z)});
      /* planters in the corners */
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const px=sx*(S/2-1.1),pz=cz+sz*(S/2-1.1);boxM(0.9,0.5,0.9,std('#b9b2a2'),px,0.25,pz);const t=new THREE.Mesh(new THREE.SphereGeometry(0.55,14,10),std('#7fa58a'));t.position.set(px,0.95,pz);scene.add(t);ROOM.obst.push([px-0.5,px+0.5,pz-0.5,pz+0.5])});
      /* "عد إلى المقدمة" stand in the middle */
      const st=tex(700,360,(g,Wt,Ht)=>{g.fillStyle='#2c7a6b';rr(g,6,6,Wt-12,Ht-12,30);g.fill();g.fillStyle='#fff';g.textAlign='center';g.direction='rtl';g.font=`700 82px ${AR}`;g.fillText('↩ عد إلى المقدمة',Wt/2,170);g.direction='ltr';g.font=`500 38px ${MO}`;g.fillStyle='#d9efe9';g.fillText('Back to the entrance',Wt/2,260)});
      const sm=new THREE.MeshBasicMaterial({map:st});const D={x:0,z:cz,ry:0,front:{x:0,z:cz+1},go:toEntrance,label:'BACK',sub:'Back to the entrance',ar:'عد إلى المقدمة',kind:'stand'};doors.push(D);
      const parts=[];const ped=boxM(0.7,1.0,0.5,std('#dfe5e2'),0,0.5,cz);parts.push(ped);
      [0,Math.PI].forEach(ry=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.67),sm);p.position.set(0,1.55,cz+(ry?-0.02:0.02));p.rotation.y=ry;scene.add(p);parts.push(p)});
      parts.push(boxM(0.06,0.4,0.06,std('#9aa3a8'),0,1.1,cz,false));
      parts.forEach(m=>{m.userData.door=D;pick.push(m)});ROOM.obst.push([-0.5,0.5,cz-0.4,cz+0.4]);
    }
    CUR.kind='corridor';CUR.lab=null;
  }
  /* back to the corridor entrance with a short fade (from the courtyard stand) */
  function toEntrance(){P.x=START.x;P.z=START.z;P.y=EYE;P.yaw=0;P.pitch=0.06;path=[];mode='walk'}
  function buildRoom(Lb){
    const {rows,cols}=Lb.room;const SX=4.2,SZ=5;
    const colX=[...Array(cols).keys()].map(c=>(c-(cols-1)/2)*SX),rowZ=[...Array(rows).keys()].map(r=>r*SZ-(rows-1)*SZ/2-0.4);
    const hx=cols*SX/2+1.5;ROOM={x0:-hx,x1:hx,z0:rowZ[0]-5.6,z1:rowZ[rows-1]+6.4,pad:[0.45,0.95,0.4,0.4]};
    freshScene();floorAndWalls('#d9dedb','#e3e9e6');
    const W=ROOM.x1-ROOM.x0,D=ROOM.z1-ROOM.z0;
    for(let i=-Math.floor(W/7);i<=Math.floor(W/7);i++)for(let j=-Math.floor(D/7);j<=Math.floor(D/7);j++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.5),new THREE.MeshBasicMaterial({color:0xffffff}));l.rotation.x=Math.PI/2;l.position.set(i*3.4,3.29,j*3.4);scene.add(l)}
    // whiteboard
    const wb=tex(1400,500,(g,Wt,Ht)=>{g.fillStyle='#fbfcfc';g.fillRect(0,0,Wt,Ht);g.strokeStyle='#9aa6a2';g.lineWidth=18;g.strokeRect(9,9,Wt-18,Ht-18);g.fillStyle='#2c7a6b';g.font=`600 74px ${MO}`;g.textAlign='center';g.fillText(`${Lb.code} · ${Lb.title}`,Wt/2,150);
      g.direction='rtl';g.fillStyle='#1e2a28';g.font=`600 64px ${AR}`;g.fillText('أهلاً بك في محاكي معامل قسم الكهرباء',Wt/2,270);g.fillStyle='#5d6b67';g.font=`500 46px ${AR}`;g.fillText('امشِ لأي طاولة واضغط على الكرسي، أو استخدم الوصول السريع',Wt/2,370);
      g.strokeStyle='#c8372d';g.lineWidth=5;g.beginPath();for(let i=0;i<=200;i++){const x=Wt*.15+Wt*.7*i/200,y=440-Math.max(-0.55,Math.min(0.55,Math.sin(i/200*Math.PI*6)))*40;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()});
    const wbm=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.86),new THREE.MeshStandardMaterial({map:wb,roughness:.35}));wbm.position.set(0,1.82,ROOM.z0+0.03);scene.add(wbm);
    // windows (left wall)
    for(let i=-1;i<=1;i++){const z=i*4.2;const w=new THREE.Mesh(new THREE.PlaneGeometry(2,1.3),new THREE.MeshBasicMaterial({color:0xd5ebf3}));w.position.set(ROOM.x0+0.02,1.85,z);w.rotation.y=Math.PI/2;scene.add(w);
      const fr=std('#f7f9f8'),X=ROOM.x0+0.04;boxM(0.06,1.42,0.08,fr,X,1.85,z-1.04,false);boxM(0.06,1.42,0.08,fr,X,1.85,z+1.04,false);boxM(0.06,0.08,2.16,fr,X,2.55,z,false);boxM(0.08,0.08,2.16,fr,X+0.02,1.16,z,false);boxM(0.06,1.3,0.05,fr,X,1.85,z,false)}
    // cabinets (right wall) + safety poster
    for(let i=-Math.floor(D/4);i<=Math.floor(D/4);i++){if(Math.abs(i*1.25)>D/2-1.4)continue;boxM(0.6,0.9,1.2,std('#dbe2df'),ROOM.x1-0.32,0.45,i*1.25+(i>0?1.4:i<0?-1.4:0));boxM(0.64,0.04,1.24,std('#b9c4c0'),ROOM.x1-0.32,0.92,i*1.25+(i>0?1.4:i<0?-1.4:0))}
    const ps=tex(700,900,(g,Wt,Ht)=>{g.fillStyle='#fff';g.fillRect(0,0,Wt,Ht);g.fillStyle='#c43a2e';g.fillRect(0,0,Wt,140);g.fillStyle='#fff';g.direction='rtl';g.textAlign='center';g.font=`700 64px ${AR}`;g.fillText('قواعد السلامة',Wt/2,95);
      g.fillStyle='#1e2a28';g.font=`500 40px ${AR}`;g.textAlign='right';['لا توصّل المحوّل قبل ما يشيك المعيد','حدّد التيار قبل ما تشغّل الـ dc','انتبه لقطبية المكثف والدايود','ابدأ الإسكوب من Default','افصل الكهرباء قبل أي تعديل'].forEach((t,i)=>{g.fillText('• '+t,Wt-50,240+i*120)})});
    const pm=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.35),new THREE.MeshStandardMaterial({map:ps}));pm.position.set(ROOM.x1-0.03,1.85,0);pm.rotation.y=-Math.PI/2;scene.add(pm);
    // exit door to the corridor
    const ex=Math.min(4.5,ROOM.x1-2);door(ex,ROOM.z1-0.035,Math.PI,'EXIT','EE Department · Corridor','الممر',()=>show('corridor',null,Lb.id),{x:ex,z:ROOM.z1-1.1},{kind:'exit'});
    // tables: experiments fill the rows in order, row 1 nearest the whiteboard, left to right
    Lb.exps.forEach((e,i)=>{const r=Math.floor(i/cols);if(r<rows)makeBench(colX[i%cols],rowZ[r],e)});
    CUR.kind='room';CUR.lab=Lb.id;
  }

  /* --- movement --- */
  function blocked(x,z,r=0.28){const pd=ROOM.pad;
    if(ROOM.rects){const q=0.45;if(!ROOM.rects.some(a=>x>a[0]+q&&x<a[1]-q&&z>a[2]+q&&z<a[3]-q))return true;if(ROOM.obst.some(b=>x>b[0]-r&&x<b[1]+r&&z>b[2]-r&&z<b[3]+r))return true}
    else if(x<ROOM.x0+pd[0]||x>ROOM.x1-pd[1]||z<ROOM.z0+pd[2]||z>ROOM.z1-pd[3])return true;for(const b of benches){if(x>b.box[0]-r&&x<b.box[1]+r&&z>b.box[2]-r&&z<b.box[3]+r)return true}return false}
  function moveBy(dx,dz){if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz}
  const clear=(ax,az,bx,bz)=>{const n=Math.ceil(Math.hypot(bx-ax,bz-az)/0.08);for(let i=1;i<=n;i++){const t=i/n;if(blocked(ax+(bx-ax)*t,az+(bz-az)*t,0.32))return false}return true};
  /* grid A* around the tables, then shortcut to the farthest visible waypoint */
  function planTo(tx,tz){
    if(clear(P.x,P.z,tx,tz))return [{x:tx,z:tz}];
    const C=0.2,X0=ROOM.x0,Z0=ROOM.z0,NX=Math.round((ROOM.x1-ROOM.x0)/C),NZ=Math.round((ROOM.z1-ROOM.z0)/C);
    const id=(i,j)=>j*(NX+1)+i,cx=x=>clamp(Math.round((x-X0)/C),0,NX),cz=z=>clamp(Math.round((z-Z0)/C),0,NZ);
    const free=new Uint8Array((NX+1)*(NZ+1));for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++)free[id(i,j)]=blocked(X0+i*C,Z0+j*C,0.32)?0:1;
    const s=id(cx(P.x),cz(P.z)),g=id(cx(tx),cz(tz));free[s]=1;free[g]=1;
    const gs=new Float32Array(free.length).fill(1e9),from=new Int32Array(free.length).fill(-1),done=new Uint8Array(free.length);
    const heap=[];const push=(k,f)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
    const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top};
    const gi=g%(NX+1),gj=Math.floor(g/(NX+1));const H=k=>Math.hypot(k%(NX+1)-gi,Math.floor(k/(NX+1))-gj);
    gs[s]=0;push(s,H(s));
    while(heap.length){const [,k]=pop();if(done[k])continue;done[k]=1;if(k===g)break;const i=k%(NX+1),j=Math.floor(k/(NX+1));
      for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>NX||nj>NZ)continue;const n=id(ni,nj);if(!free[n]||done[n])continue;
        if(di&&dj&&(!free[id(i+di,j)]||!free[id(i,j+dj)]))continue;const ng=gs[k]+(di&&dj?1.4142:1);if(ng<gs[n]){gs[n]=ng;from[n]=k;push(n,ng+H(n))}}}
    if(from[g]<0&&g!==s)return [{x:tx,z:tz}];
    const pts=[];for(let k=g;k!==s&&k>=0;k=from[k])pts.unshift({x:X0+(k%(NX+1))*C,z:Z0+Math.floor(k/(NX+1))*C});pts[pts.length-1]={x:tx,z:tz};
    const out=[];let ax=P.x,az=P.z,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!clear(ax,az,pts[j].x,pts[j].z))j--;out.push(pts[j]);ax=pts[j].x;az=pts[j].z;i=j+1}
    return out}
  function walkTo(x,z,then){mode='walk';path=planTo(x,z);path.then=then;stuck=0}
  function goSit(B){if(!B.built){toast(`تجربة ${B.num} قريباً`);return}const ax=B.x,az=B.cz+0.75;if(Math.hypot(P.x-ax,P.z-az)<0.35)sit(B);else walkTo(ax,az,()=>sit(B))}
  function angDiff(a,b){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
  function sit(B){if(document.pointerLockElement)document.exitPointerLock();mode='sitting';path=[];seatB=B;const from={...P},to={x:B.x,z:B.cz-0.02,y:1.2,yaw:0,pitch:-0.42};const dy=angDiff(from.yaw,to.yaw);const t0=performance.now(),dur=reduceMotion?1:1500;prompt.hidden=true;tip.hidden=true;
    anim=now=>{const k=Math.min(1,(now-t0)/dur),e=ease(k);P.x=from.x+(to.x-from.x)*e;P.z=from.z+(to.z-from.z)*e;P.yaw=from.yaw+dy*e;P.pitch=from.pitch+(to.pitch-from.pitch)*e;
      const yk=Math.max(0,(k-0.25)/0.75);P.y=from.y+(to.y-from.y)*ease(yk)-Math.sin(Math.min(1,yk)*Math.PI)*0.06;if(k>=1){anim=null;mode='seated';seated(B)}}}
  function seated(B){const e=B.e;$q('#smKicker').textContent=`${e.lab.code} · EXPERIMENT ${e.num}`;$q('#smTitle').textContent=e.en;$q('#smSub').textContent=`جلست على طاولة تجربة ${e.num} (${e.ar}). اختر الطور:`;$q('#seatModal').hidden=false;setTimeout(()=>$q('#seatModal button[data-mode]').focus(),50)}
  function standUp(){$q('#hall').hidden=false;$q('#seatModal').hidden=true;resize();running=true;loop0();const B=seatB;if(!B||!B.box){mode='walk';seatB=null;return}
    P.x=B.x;P.z=B.cz-0.02;P.y=1.2;P.yaw=0;P.pitch=-0.42;mode='sitting';const from={...P},to={x:B.x,z:B.cz+0.8,y:EYE,pitch:-0.08};const t0=performance.now(),dur=reduceMotion?1:1100;
    anim=now=>{const k=Math.min(1,(now-t0)/dur),e=ease(k);P.x=from.x+(to.x-from.x)*e;P.z=from.z+(to.z-from.z)*e;P.y=from.y+(to.y-from.y)*e;P.pitch=from.pitch+(to.pitch-from.pitch)*e;if(k>=1){anim=null;mode='walk';seatB=null}};
    const f=$q('#fade');f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')))}
  function chooseMode(m){const B=seatB;$q('#seatModal').hidden=true;const f=$q('#fade');f.classList.add('on');
    setTimeout(()=>{running=false;$q('#hall').hidden=true;BENCH.enter(B.e.id,m,true);requestAnimationFrame(()=>f.classList.remove('on'))},reduceMotion?0:360)}
  let toastT;function toast(m){prompt.textContent=m;prompt.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{prompt.hidden=true;toastT=null},1600)}
  /* switch scene: 'room' of a lab, or the 'corridor' (fromLab = the lab whose door we came out of) */
  function show(kind,labId,fromLab,initial){
    if(kind==='room'){buildRoom(REGISTRY.lab(labId));STATS.lab(labId)}else buildCorridor();
    path=[];anim=null;mode='walk';seatB=null;P.y=EYE;P.pitch=-0.06;P.yaw=0;
    if(kind==='room'){if(initial){P.x=0;P.z=ROOM.z1-1.9}else{const d=doors[0];P.x=d.front.x;P.z=d.front.z-0.3}}
    else{/* back out of a lab: in front of its own door, looking down the corridor (or at the courtyard's middle) */
      const D=fromLab&&doors.find(d=>d.lab===fromLab);
      if(D){P.x=D.front.x;P.z=D.front.z;P.yaw=D.court?Math.atan2(-(0-P.x),-(COURT.cz-P.z)):0}else{P.x=START.x;P.z=START.z;P.pitch=0.06}}
    const L=kind==='room'?REGISTRY.lab(labId):null;
    $q('.brand span').textContent=L?`${L.code} · ${L.title}`:'EE Department · الممر';
    hint.innerHTML=kind==='room'?HINT_ROOM:HINT_CORR;tip.hidden=true;prompt.hidden=true;resize()}
  const soon=D=>toast(`${D.label} · ${D.ar} — قريباً`);
  function enterDoor(D){if(D.closed){soon(D);return}mode='sitting';const f=$q('#fade');f.classList.add('on');setTimeout(()=>{D.go();requestAnimationFrame(()=>f.classList.remove('on'))},reduceMotion?0:360)}
  function goDoor(D){if(D.closed){soon(D);return}if(D.kind==='stand'){enterDoor(D);return}if(Math.hypot(P.x-D.front.x,P.z-D.front.z)<0.6)enterDoor(D);else walkTo(D.front.x,D.front.z,()=>enterDoor(D))}
  function nearDoor(){let best=null,bd=1.3;for(const d of doors){const q=Math.hypot(P.x-d.front.x,P.z-d.front.z);if(q<bd){bd=q;best=d}}return best}
  /* quick access: straight to the table, sit-down animation, then the mode modal */
  function goTo(id){const e=REGISTRY.exp(id);if(!e||!e.built)return;$q('#hall').hidden=false;
    if(!ok){seatB={e};seated(seatB);return}
    if(CUR.kind!=='room'||CUR.lab!==e.lab.id)show('room',e.lab.id);
    const B=benches.find(b=>b.e.id===id);anim=null;path=[];P.x=B.x;P.z=B.cz+0.75;P.y=EYE;P.yaw=0;P.pitch=-0.08;resume();sit(B)}
  /* quick access to a lab door (labs without experiments): stand in front of it, looking at it */
  function goLab(id){const Lb=REGISTRY.lab(id);if(!Lb)return;$q('#hall').hidden=false;if(!ok)return;
    if(CUR.kind!=='corridor')show('corridor');const D=doors.find(d=>d.lab===id);if(!D)return;
    resume();anim=null;path=[];P.x=D.front.x;P.z=D.front.z;P.y=EYE;P.yaw=D.ry;P.pitch=0.05;if(D.closed)soon(D)}
  function resume(){$q('#hall').hidden=false;$q('#seatModal').hidden=true;if(!ok)return;resize();if(!running){running=true;loop0()}mode='walk'}

  /* --- input --- */
  const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
  function hit(e,objs){const r=cv.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);return ray.intersectObjects(objs,false)[0]}
  let down=null;
  /* desktop: game-style mouse look. The first click locks the pointer; then moving the mouse turns the view,
     a crosshair marks the centre, click (or E) acts on what is under it, ESC releases the mouse. Touch stays drag-to-look. */
  const cross=$q('#crosshair');const locked=()=>document.pointerLockElement===cv;const CENTER={clientX:0,clientY:0};
  const centerEv=()=>{const r=cv.getBoundingClientRect();CENTER.clientX=r.left+r.width/2;CENTER.clientY=r.top+r.height/2;return CENTER};
  function lockHover(){if(!locked()||mode!=='walk'){return}const e=centerEv();const h=hit(e,pick);setHover(h?h.object.userData.bench:null,e,h?h.object.userData.door:null)}
  function lockClick(){if(mode!=='walk')return;const e=centerEv();const h=hit(e,pick);if(h){const u=h.object.userData;if(u.bench){unlock();goSit(u.bench)}else if(u.door)goDoor(u.door);return}
    const f=hit(e,floors);if(f&&Math.hypot(f.point.x-P.x,f.point.z-P.z)<9&&!blocked(f.point.x,f.point.z))walkTo(f.point.x,f.point.z)}
  function unlock(){if(locked())document.exitPointerLock()}
  function bindInput(){
    document.addEventListener('pointerlockchange',()=>{const on=locked();cross.hidden=!on;hint.innerHTML=on?HINT_LOCK:CUR.kind==='room'?HINT_ROOM:HINT_CORR;if(!on)setHover(null)});
    cv.addEventListener('mousemove',e=>{if(!locked()||mode!=='walk')return;const s=0.0024;P.yaw-=e.movementX*s;P.pitch=Math.max(-1.1,Math.min(0.9,P.pitch-e.movementY*s));lockHover()});
    cv.addEventListener('pointerdown',e=>{if(mode!=='walk')return;
      let lockReq=false;if(!coarse&&e.pointerType==='mouse'&&e.button===0){if(locked()){lockClick();return}try{const r=cv.requestPointerLock();lockReq=true;if(r&&r.catch)r.catch(()=>{})}catch(_){}}
      down={x:e.clientX,y:e.clientY,yaw:P.yaw,pitch:P.pitch,drag:false,id:e.pointerId,lockReq};try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.focus()});
    cv.addEventListener('pointermove',e=>{if(down&&e.pointerId===down.id){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!down.drag&&Math.hypot(dx,dy)>7)down.drag=true;
        if(down.drag){const s=coarse?0.0055:0.0042;P.yaw=down.yaw+dx*s;P.pitch=Math.max(-1.1,Math.min(0.9,down.pitch+dy*s*0.85));cv.style.cursor='grabbing'}return}
      if(coarse||mode!=='walk')return;const h=hit(e,pick);setHover(h?h.object.userData.bench:null,e,h?h.object.userData.door:null)});
    const up=e=>{if(!down)return;const d=down;down=null;cv.style.cursor='';/* the click that takes the mouse only locks it (as in games); if the browser refuses the lock it acts as before */
      if(d.drag||mode!=='walk'||locked()||(d.lockReq&&document.pointerLockElement!==null))return;if(d.lockReq){setTimeout(()=>{if(!locked())up2(e)},120);return}up2(e)};const up2=e=>{
      const h=hit(e,pick);if(h){const u=h.object.userData;if(u.bench)goSit(u.bench);else if(u.door)goDoor(u.door);return}
      const f=hit(e,floors);if(f){let tx=f.point.x,tz=f.point.z;if(blocked(tx,tz)){for(const b of benches){const r=0.4;if(tx>b.box[0]-r&&tx<b.box[1]+r&&tz>b.box[2]-r&&tz<b.box[3]+r){tz=tz<b.z?b.box[2]-0.5:b.box[3]+0.5}}}if(!blocked(tx,tz))walkTo(tx,tz)}};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{down=null});
    cv.addEventListener('pointerleave',()=>{if(!down)setHover(null)});
    addEventListener('keydown',e=>{if($q('#hall').hidden)return;if(!$q('#seatModal').hidden){if(e.key==='Escape')standUp();return}keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
      if(e.code==='KeyE'&&mode==='walk'&&locked()){const h=hit(centerEv(),pick);if(h&&h.object.userData.bench){unlock();goSit(h.object.userData.bench);return}if(h&&h.object.userData.door){goDoor(h.object.userData.door);return}}
      if(e.code==='KeyE'&&mode==='walk'){const D=nearDoor();if(D){enterDoor(D);return}const B=nearest();if(B)goSit(B)}});
    addEventListener('keyup',e=>{keys[e.code]=false});
    addEventListener('blur',()=>{keys={}});
  }
  function setHover(B,e,D){if(hoverB&&hoverB!==B){hoverB.seatM.emissive.setHex(0)}hoverB=B;
    if(!B&&D){cv.style.cursor='pointer';tip.hidden=false;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';tip.innerHTML=D.kind==='exit'?'ارجع للممر<small>EE Department</small>':D.kind==='stand'?'عد إلى المقدمة<small>Back to the entrance</small>':D.closed?`${D.label} · قريباً<small>${D.sub}</small>`:`ادخل معمل ${D.label}<small>${D.sub}</small>`;return}
    if(B){B.seatM.emissive.setHex(B.built?0x1a4a40:0x222222);cv.style.cursor='pointer';tip.hidden=false;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';
      tip.innerHTML=B.built?`اجلس على طاولة تجربة ${B.num}<small>${B.e.en}</small>`:`تجربة ${B.num} · قريباً<small>${B.e.en}</small>`}
    else{cv.style.cursor='';tip.hidden=true}}
  function nearest(){let best=null,bd=1.6;for(const b of benches){const d=Math.hypot(P.x-b.x,P.z-(b.cz+0.7));if(d<bd){bd=d;best=b}}return best}

  /* --- loop --- */
  function resize(){if(!R)return;const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<0.8?80:62;cam.updateProjectionMatrix()}
  let looping=false;
  function frame(now){if(!running){looping=false;return}requestAnimationFrame(frame);const dt=Math.min(0.05,(now-(last||now))/1000);last=now;
    if(anim)anim(now);
    else if(mode==='walk'){
      let f=0,s=0,turn=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD)s+=1;if(keys.KeyA)s-=1;if(keys.ArrowLeft||keys.KeyQ)turn+=1;if(keys.ArrowRight)turn-=1;
      if(f||s||turn){path=[];P.yaw+=turn*1.9*dt;const sp=(CUR.kind==='corridor'?3.2:SPEED)*dt/(f&&s?1.414:1);const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);moveBy((fx*f+rx*s)*sp,(fz*f+rz*s)*sp)}
      else if(path.length){const t=path[0];const dx=t.x-P.x,dz=t.z-P.z,d=Math.hypot(dx,dz);
        if(d<0.06){path.shift();stuck=0;if(!path.length&&path.then){const th=path.then;path.then=null;th()}}
        else{const st=Math.min(d,(CUR.kind==='corridor'?3.4:SPEED)*dt);const tyaw=Math.atan2(-dx,-dz);P.yaw+=angDiff(P.yaw,tyaw)*Math.min(1,dt*6);P.pitch+=(-0.06-P.pitch)*Math.min(1,dt*3);const bx=P.x,bz=P.z;moveBy(dx/d*st,dz/d*st);
          if(Math.hypot(P.x-bx,P.z-bz)<st*0.2){stuck+=dt;if(stuck>0.6){P.x=t.x;P.z=t.z;stuck=0}}else stuck=0}}
      P.y+=(EYE-P.y)*Math.min(1,dt*8);
      const ND=nearDoor();if(ND&&!toastT){prompt.hidden=false;prompt.textContent=ND.kind==='exit'?(coarse?'اضغط على الباب عشان ترجع للممر':'اضغط E أو على الباب عشان ترجع للممر'):ND.kind==='stand'?(coarse?'اضغط على اللوحة عشان ترجع للمقدمة':'اضغط E أو على اللوحة عشان ترجع للمقدمة'):ND.closed?`${ND.label} · ${ND.ar} — قريباً`:(coarse?`اضغط على الباب عشان تدخل ${ND.label}`:`اضغط E أو على الباب عشان تدخل ${ND.label}`)}
      const B=ND?null:nearest();if(ND){}else if(B&&!toastT){prompt.hidden=false;prompt.textContent=B.built?(coarse?`اضغط على الكرسي عشان تجلس · تجربة ${B.num}`:`اضغط E أو على الكرسي عشان تجلس · تجربة ${B.num}`):`تجربة ${B.num} · قريباً`}else if(!toastT)prompt.hidden=true}
    const t=now/1000;benches.forEach(b=>{const on=b===hoverB||b===nearest();b.ring.material.opacity+=(((on?0.85:b.built?0.35:0.12)+Math.sin(t*3)*0.1)-b.ring.material.opacity)*0.15});
    cam.position.set(P.x,P.y,P.z);cam.rotation.set(P.pitch,P.yaw,0);if(locked()&&mode==='walk'&&(now|0)%4===0)lockHover();R.render(scene,cam)}
  /* one render loop at a time, never two */
  function loop0(){last=0;if(looping)return;looping=true;requestAnimationFrame(frame)}

  async function init(){
    $q('#quickBtn').onclick=()=>QUICK.open($q('#quickBtn'));
    $q('#fallbackQuick').onclick=()=>QUICK.open($q('#fallbackQuick'));
    document.querySelectorAll('#seatModal button[data-mode]').forEach(b=>b.onclick=()=>chooseMode(b.dataset.mode));
    $q('#smStand').onclick=()=>{if(ok)standUp();else{$q('#seatModal').hidden=true;seatB=null}};
    if(!window.THREE){fail();return}
    try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true});}catch(e){fail();return}
    R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
    try{await Promise.race([Promise.all([document.fonts.load(`600 40px "IBM Plex Sans Arabic"`),document.fonts.load(`600 40px "IBM Plex Mono"`)]),new Promise(r=>setTimeout(r,1800))])}catch(_){}
    cam=new THREE.PerspectiveCamera(62,1,0.05,70);cam.rotation.order='YXZ';
    show('corridor',null,null,true);
    ok=true;bindInput();resize();addEventListener('resize',()=>{if(!$q('#hall').hidden)resize()});$q('#hallLoading').hidden=true;loop0();
  }
  function fail(){$q('#hallLoading').hidden=true;$q('#fallback').hidden=false;$q('#hallHint').hidden=true;$q('#quickBtn').hidden=true}
  return {init,goTo,goLab,resume,pause:()=>{running=false},standUp:()=>{if(ok)standUp();else{$q('#hall').hidden=false;$q('#seatModal').hidden=true}},debug:{P,lockClick,locked,benches:()=>benches,doors:()=>doors,cur:()=>({...CUR}),show,planTo,blocked,goDoor,court:()=>COURT,START}};
})();
