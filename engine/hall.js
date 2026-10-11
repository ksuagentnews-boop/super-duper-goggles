/* ======================= 3D HALL =======================
   First-person lab room (Three.js r128). Two rows of five tables: row 1 = Exp 1–5 (front, near the whiteboard),
   row 2 = Exp 6–10, left to right. A sign hangs above every table; each table carries its experiment's instruments
   (from REGISTRY bench lists). Desktop: WASD / arrows + mouse drag. Touch: drag to look, tap floor to walk,
   tap a chair to walk there and sit. */
const HALL=(()=>{
  const cv=$q('#hallCanvas'),tip=$q('#tip'),prompt=$q('#prompt'),hint=$q('#hallHint');
  const coarse=matchMedia('(pointer:coarse)').matches;
  const P={x:0,z:6.6,y:1.65,yaw:0,pitch:-0.06};
  let R,scene,cam,ok=false,running=true,mode='walk',anim=null,path=[],keys={},last=0,stuck=0,hoverB=null,seatB=null;
  const benches=[],pick=[];let floor;
  const EYE=1.65,SPEED=2.4;
  const ROOM={x0:-12,x1:12,z0:-8.5,z1:8.5};
  const ROWZ=[-2.9,2.1],COLX=[-8.4,-4.2,0,4.2,8.4];
  hint.innerHTML=coarse?'اسحب بإصبعك عشان تلتفت · اضغط على الأرض عشان تمشي، وعلى الكرسي عشان تجلس':'تحرّك بـ <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> أو الأسهم · اسحب بالماوس عشان تلتفت · اضغط على الأرض للمشي أو على الكرسي للجلوس';

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
  const SIZE={gen:[0.44,0.2,0.3],psu:[0.42,0.2,0.3],scope:[0.5,0.27,0.3],dmm:[0.32,0.13,0.28],xf:[0.46,0.3,0.34],dbox:[0.24,0.11,0.17]};
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
    [0,Math.PI].forEach(r=>{const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.44),sm);sg.position.set(x,2.35,z-0.2+(r?-0.004:0.004));sg.rotation.y=r;scene.add(sg)});
    [-0.6,0.6].forEach(dx=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.7,4),frame);w.position.set(x+dx,2.92,z-0.2);scene.add(w)});
    const B={x,z,cz,num:e.num,e,built:e.built,seatM,ring,box:[x-1.3,x+1.3,z-0.58,z+0.58]};benches.push(B);
    ch.traverse(o=>{if(o.isMesh){o.userData.bench=B;pick.push(o)}});
    return B}

  function build(){
    scene=new THREE.Scene();scene.background=new THREE.Color('#e9eeec');
    cam=new THREE.PerspectiveCamera(62,1,0.05,70);cam.rotation.order='YXZ';
    scene.add(new THREE.HemisphereLight(0xffffff,0xd8cdb8,0.75));
    const dl=new THREE.DirectionalLight(0xffffff,0.55);dl.position.set(3,9,4);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);Object.assign(dl.shadow.camera,{left:-13,right:13,top:10,bottom:-10,far:24});dl.shadow.bias=-0.0006;dl.shadow.radius=3;scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff,0.18));
    const W=ROOM.x1-ROOM.x0,D=ROOM.z1-ROOM.z0;
    const ft=tex(512,512,(g,Wt,Ht)=>{g.fillStyle='#d9dedb';g.fillRect(0,0,Wt,Ht);g.strokeStyle='#c5ccc8';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*Wt/4,0);g.lineTo(i*Wt/4,Ht);g.stroke();g.beginPath();g.moveTo(0,i*Ht/4);g.lineTo(Wt,i*Ht/4);g.stroke()}
      for(let i=0;i<500;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${130+Math.random()*50|0},${125+Math.random()*50|0},.08)`;g.fillRect(Math.random()*Wt,Math.random()*Ht,3,3)}});
    ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(W/2.4,D/2.4);
    floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std('#fff',{map:ft,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    const wallM=std('#e3e9e6',{roughness:.95}),dado=std('#c9d3cf');
    const wall=(w,x,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.3),wallM);m.position.set(x,1.65,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);const d=new THREE.Mesh(new THREE.PlaneGeometry(w,0.95),dado);d.position.set(x,0.475,z);d.rotation.y=ry;d.position.x+=Math.sin(ry)*0.005;d.position.z+=Math.cos(ry)*0.005;scene.add(d)};
    wall(W,0,ROOM.z0,0);wall(W,0,ROOM.z1,Math.PI);wall(D,ROOM.x0,0,Math.PI/2);wall(D,ROOM.x1,0,-Math.PI/2);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),std('#f3f5f4'));ceil.rotation.x=Math.PI/2;ceil.position.y=3.3;scene.add(ceil);
    for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.5),new THREE.MeshBasicMaterial({color:0xffffff}));l.rotation.x=Math.PI/2;l.position.set(i*3.4,3.29,j*3.4);scene.add(l)}
    // whiteboard
    const wb=tex(1400,500,(g,Wt,Ht)=>{g.fillStyle='#fbfcfc';g.fillRect(0,0,Wt,Ht);g.strokeStyle='#9aa6a2';g.lineWidth=18;g.strokeRect(9,9,Wt-18,Ht-18);g.fillStyle='#2c7a6b';g.font=`600 74px ${MO}`;g.textAlign='center';g.fillText('EE312 · Basic Electronics Lab',Wt/2,150);
      g.direction='rtl';g.fillStyle='#1e2a28';g.font=`600 64px ${AR}`;g.fillText('أهلاً بك في محاكي معامل قسم الكهرباء',Wt/2,270);g.fillStyle='#5d6b67';g.font=`500 46px ${AR}`;g.fillText('امشِ لأي طاولة واضغط على الكرسي، أو استخدم الوصول السريع',Wt/2,370);
      g.strokeStyle='#c8372d';g.lineWidth=5;g.beginPath();for(let i=0;i<=200;i++){const x=Wt*.15+Wt*.7*i/200,y=440-Math.max(-0.55,Math.min(0.55,Math.sin(i/200*Math.PI*6)))*40;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()});
    const wbm=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.86),new THREE.MeshStandardMaterial({map:wb,roughness:.35}));wbm.position.set(0,2.0,ROOM.z0+0.03);scene.add(wbm);
    // windows (left wall)
    for(let i=-1;i<=1;i++){const z=i*4.2;const w=new THREE.Mesh(new THREE.PlaneGeometry(2,1.3),new THREE.MeshBasicMaterial({color:0xd5ebf3}));w.position.set(ROOM.x0+0.02,1.85,z);w.rotation.y=Math.PI/2;scene.add(w);
      const fr=std('#f7f9f8'),X=ROOM.x0+0.04;boxM(0.06,1.42,0.08,fr,X,1.85,z-1.04,false);boxM(0.06,1.42,0.08,fr,X,1.85,z+1.04,false);boxM(0.06,0.08,2.16,fr,X,2.55,z,false);boxM(0.08,0.08,2.16,fr,X+0.02,1.16,z,false);boxM(0.06,1.3,0.05,fr,X,1.85,z,false)}
    // cabinets (right wall) + safety poster
    for(let i=-3;i<=3;i++){boxM(0.6,0.9,1.2,std('#dbe2df'),ROOM.x1-0.32,0.45,i*1.25+(i>0?1.4:i<0?-1.4:0));boxM(0.64,0.04,1.24,std('#b9c4c0'),ROOM.x1-0.32,0.92,i*1.25+(i>0?1.4:i<0?-1.4:0))}
    const ps=tex(700,900,(g,Wt,Ht)=>{g.fillStyle='#fff';g.fillRect(0,0,Wt,Ht);g.fillStyle='#c43a2e';g.fillRect(0,0,Wt,140);g.fillStyle='#fff';g.direction='rtl';g.textAlign='center';g.font=`700 64px ${AR}`;g.fillText('قواعد السلامة',Wt/2,95);
      g.fillStyle='#1e2a28';g.font=`500 40px ${AR}`;g.textAlign='right';['لا توصّل المحوّل قبل ما يشيك المعيد','حدّد التيار قبل ما تشغّل الـ dc','انتبه لقطبية المكثف والدايود','ابدأ الإسكوب من Default','افصل الكهرباء قبل أي تعديل'].forEach((t,i)=>{g.fillText('• '+t,Wt-50,240+i*120)})});
    const pm=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.35),new THREE.MeshStandardMaterial({map:ps}));pm.position.set(ROOM.x1-0.03,1.85,0);pm.rotation.y=-Math.PI/2;scene.add(pm);
    // door
    boxM(1.1,2.2,0.06,std('#a97c5a'),4.5,1.1,ROOM.z1-0.03,false);
    // tables: row 1 = Exp 1–5 (front), row 2 = Exp 6–10
    REGISTRY.labs[0].exps.forEach((e,i)=>makeBench(COLX[i%5],ROWZ[Math.floor(i/5)],e));
  }

  /* --- movement --- */
  function blocked(x,z,r=0.28){if(x<ROOM.x0+0.45||x>ROOM.x1-0.95||z<ROOM.z0+0.4||z>ROOM.z1-0.4)return true;for(const b of benches){if(x>b.box[0]-r&&x<b.box[1]+r&&z>b.box[2]-r&&z<b.box[3]+r)return true}return false}
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
  function sit(B){mode='sitting';path=[];seatB=B;const from={...P},to={x:B.x,z:B.cz-0.02,y:1.2,yaw:0,pitch:-0.42};const dy=angDiff(from.yaw,to.yaw);const t0=performance.now(),dur=reduceMotion?1:1500;prompt.hidden=true;tip.hidden=true;
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
  /* quick access: straight to the table, sit-down animation, then the mode modal */
  function goTo(id){const e=REGISTRY.exp(id);if(!e||!e.built)return;$q('#hall').hidden=false;
    if(!ok){seatB={e};seated(seatB);return}
    const B=benches.find(b=>b.e.id===id);anim=null;path=[];P.x=B.x;P.z=B.cz+0.75;P.y=EYE;P.yaw=0;P.pitch=-0.08;resume();sit(B)}
  function resume(){$q('#hall').hidden=false;$q('#seatModal').hidden=true;if(!ok)return;resize();if(!running){running=true;loop0()}mode='walk'}

  /* --- input --- */
  const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
  function hit(e,objs){const r=cv.getBoundingClientRect();v2.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v2,cam);return ray.intersectObjects(objs,false)[0]}
  let down=null;
  function bindInput(){
    cv.addEventListener('pointerdown',e=>{if(mode!=='walk')return;down={x:e.clientX,y:e.clientY,yaw:P.yaw,pitch:P.pitch,drag:false,id:e.pointerId};try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.focus()});
    cv.addEventListener('pointermove',e=>{if(down&&e.pointerId===down.id){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!down.drag&&Math.hypot(dx,dy)>7)down.drag=true;
        if(down.drag){const s=coarse?0.0055:0.0042;P.yaw=down.yaw+dx*s;P.pitch=Math.max(-1.1,Math.min(0.9,down.pitch+dy*s*0.85));cv.style.cursor='grabbing'}return}
      if(coarse||mode!=='walk')return;const h=hit(e,pick);const B=h?h.object.userData.bench:null;setHover(B,e)});
    const up=e=>{if(!down)return;const d=down;down=null;cv.style.cursor='';if(d.drag||mode!=='walk')return;
      const h=hit(e,pick);if(h){goSit(h.object.userData.bench);return}
      const f=hit(e,[floor]);if(f){let tx=f.point.x,tz=f.point.z;if(blocked(tx,tz)){for(const b of benches){const r=0.4;if(tx>b.box[0]-r&&tx<b.box[1]+r&&tz>b.box[2]-r&&tz<b.box[3]+r){tz=tz<b.z?b.box[2]-0.5:b.box[3]+0.5}}}if(!blocked(tx,tz))walkTo(tx,tz)}};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',()=>{down=null});
    cv.addEventListener('pointerleave',()=>{if(!down)setHover(null)});
    addEventListener('keydown',e=>{if($q('#hall').hidden)return;if(!$q('#seatModal').hidden){if(e.key==='Escape')standUp();return}keys[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
      if(e.code==='KeyE'&&mode==='walk'){const B=nearest();if(B)goSit(B)}});
    addEventListener('keyup',e=>{keys[e.code]=false});
    addEventListener('blur',()=>{keys={}});
  }
  function setHover(B,e){if(hoverB&&hoverB!==B){hoverB.seatM.emissive.setHex(0)}hoverB=B;
    if(B){B.seatM.emissive.setHex(B.built?0x1a4a40:0x222222);cv.style.cursor='pointer';tip.hidden=false;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';
      tip.innerHTML=B.built?`اجلس على طاولة تجربة ${B.num}<small>${B.e.en}</small>`:`تجربة ${B.num} · قريباً<small>${B.e.en}</small>`}
    else{cv.style.cursor='';tip.hidden=true}}
  function nearest(){let best=null,bd=1.6;for(const b of benches){const d=Math.hypot(P.x-b.x,P.z-(b.cz+0.7));if(d<bd){bd=d;best=b}}return best}

  /* --- loop --- */
  function resize(){if(!R)return;const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<0.8?80:62;cam.updateProjectionMatrix()}
  function frame(now){if(!running)return;requestAnimationFrame(frame);const dt=Math.min(0.05,(now-(last||now))/1000);last=now;
    if(anim)anim(now);
    else if(mode==='walk'){
      let f=0,s=0,turn=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD)s+=1;if(keys.KeyA)s-=1;if(keys.ArrowLeft||keys.KeyQ)turn+=1;if(keys.ArrowRight)turn-=1;
      if(f||s||turn){path=[];P.yaw+=turn*1.9*dt;const sp=SPEED*dt/(f&&s?1.414:1);const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);moveBy((fx*f+rx*s)*sp,(fz*f+rz*s)*sp)}
      else if(path.length){const t=path[0];const dx=t.x-P.x,dz=t.z-P.z,d=Math.hypot(dx,dz);
        if(d<0.06){path.shift();stuck=0;if(!path.length&&path.then){const th=path.then;path.then=null;th()}}
        else{const st=Math.min(d,SPEED*dt);const tyaw=Math.atan2(-dx,-dz);P.yaw+=angDiff(P.yaw,tyaw)*Math.min(1,dt*6);P.pitch+=(-0.06-P.pitch)*Math.min(1,dt*3);const bx=P.x,bz=P.z;moveBy(dx/d*st,dz/d*st);
          if(Math.hypot(P.x-bx,P.z-bz)<st*0.2){stuck+=dt;if(stuck>0.6){P.x=t.x;P.z=t.z;stuck=0}}else stuck=0}}
      P.y+=(EYE-P.y)*Math.min(1,dt*8);
      const B=nearest();if(B&&!toastT){prompt.hidden=false;prompt.textContent=B.built?(coarse?`اضغط على الكرسي عشان تجلس · تجربة ${B.num}`:`اضغط E أو على الكرسي عشان تجلس · تجربة ${B.num}`):`تجربة ${B.num} · قريباً`}else if(!toastT)prompt.hidden=true}
    const t=now/1000;benches.forEach(b=>{const on=b===hoverB||b===nearest();b.ring.material.opacity+=(((on?0.85:b.built?0.35:0.12)+Math.sin(t*3)*0.1)-b.ring.material.opacity)*0.15});
    cam.position.set(P.x,P.y,P.z);cam.rotation.set(P.pitch,P.yaw,0);R.render(scene,cam)}
  function loop0(){last=0;requestAnimationFrame(frame)}

  async function init(){
    $q('#quickBtn').onclick=()=>QUICK.open($q('#quickBtn'));
    $q('#fallbackQuick').onclick=()=>QUICK.open($q('#fallbackQuick'));
    document.querySelectorAll('#seatModal button[data-mode]').forEach(b=>b.onclick=()=>chooseMode(b.dataset.mode));
    $q('#smStand').onclick=()=>{if(ok)standUp();else{$q('#seatModal').hidden=true;seatB=null}};
    if(!window.THREE){fail();return}
    try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true});}catch(e){fail();return}
    R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
    try{await Promise.race([Promise.all([document.fonts.load(`600 40px "IBM Plex Sans Arabic"`),document.fonts.load(`600 40px "IBM Plex Mono"`)]),new Promise(r=>setTimeout(r,1800))])}catch(_){}
    build();ok=true;bindInput();resize();addEventListener('resize',()=>{if(!$q('#hall').hidden)resize()});$q('#hallLoading').hidden=true;loop0();
  }
  function fail(){$q('#hallLoading').hidden=true;$q('#fallback').hidden=false;$q('#hallHint').hidden=true;$q('#quickBtn').hidden=true}
  return {init,goTo,resume,standUp:()=>{if(ok)standUp();else{$q('#hall').hidden=false;$q('#seatModal').hidden=true}},debug:{P,benches:()=>benches,planTo}};
})();
