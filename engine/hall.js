/* ======================= 3D HALL ======================= */
const HALL=(()=>{
  const cv=$q('#hallCanvas'),tip=$q('#tip'),prompt=$q('#prompt'),hint=$q('#hallHint');
  const coarse=matchMedia('(pointer:coarse)').matches;
  const P={x:0,z:5.3,y:1.65,yaw:0,pitch:-0.06};
  let R,scene,cam,ok=false,running=true,mode='walk',anim=null,path=[],keys={},last=0,stuck=0,lastD=1e9,hoverB=null,seatB=null;
  const benches=[],pick=[];let floor;
  const EYE=1.65,SPEED=2.3;
  hint.innerHTML=coarse?'طاولتا تجربة 3 و 4 على يمينك ويسارك · اسحب بإصبعك عشان تلتفت · اضغط على الأرض عشان تمشي، وعلى الكرسي عشان تجلس':'تحرّك بـ <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> أو الأسهم · اسحب بالماوس عشان تلتفت · اضغط على الأرض للمشي أو على الكرسي للجلوس';

  function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=R.capabilities.getMaxAnisotropy();return t}
  function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
  const AR='"IBM Plex Sans Arabic", Tahoma, sans-serif',MO='"IBM Plex Mono", Menlo, monospace';
  function std(c,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o))}
  function boxM(w,h,d,mats,x,y,z,shadow=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m}

  /* --- instrument faces --- */
  function panel(g,w,h,title){g.fillStyle='#e3e8ea';g.fillRect(0,0,w,h);g.strokeStyle='#aab6ba';g.lineWidth=6;rr(g,3,3,w-6,h-6,18);g.stroke();g.fillStyle='#3b4a50';g.font=`600 ${h*.07}px ${MO}`;g.fillText(title,w*.05,h*.12)}
  function knob(g,x,y,r,c='#c9d1d5',s='#7d8c92'){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=s;g.lineWidth=r*.18;g.stroke();g.strokeStyle='#55646a';g.lineWidth=r*.15;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-r*.8);g.stroke()}
  const FACES={
    scope:(g,w,h)=>{panel(g,w,h,'GW INSTEK  GDS-1104B');g.fillStyle='#0a0f12';rr(g,w*.04,h*.17,w*.58,h*.72,10);g.fill();
      g.strokeStyle='#1d2c31';g.lineWidth=2;for(let i=1;i<10;i++){const x=w*.04+w*.058*i;g.beginPath();g.moveTo(x,h*.19);g.lineTo(x,h*.87);g.stroke()}for(let j=1;j<8;j++){const y=h*.17+h*.09*j;g.beginPath();g.moveTo(w*.05,y);g.lineTo(w*.61,y);g.stroke()}
      const tr=(col,a,ph)=>{g.strokeStyle=col;g.lineWidth=4;g.beginPath();for(let i=0;i<=200;i++){const x=w*.05+w*.56*i/200,y=h*.53-Math.sin(i/200*Math.PI*4+ph)*h*a;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()};tr('#f2c230',.2,0);tr('#3fd3d8',.11,0);
      ['Measure','Cursor','Acquire','Display','Utility','Help','Autoset','Run/Stop','Default'].forEach((k,i)=>{const x=w*.66+(i%3)*w*.105,y=h*.17+Math.floor(i/3)*h*.11;g.fillStyle=k==='Autoset'?'#f2b632':'#f4f6f7';rr(g,x,y,w*.095,h*.08,6);g.fill()});
      knob(g,w*.7,h*.62,h*.06,'#c9d1d5','#d8a800');knob(g,w*.8,h*.62,h*.06,'#c9d1d5','#1ba9ae');knob(g,w*.91,h*.62,h*.06);knob(g,w*.7,h*.8,h*.06,'#c9d1d5','#d8a800');knob(g,w*.8,h*.8,h*.06,'#c9d1d5','#1ba9ae');knob(g,w*.91,h*.8,h*.06)},
    gen:(g,w,h)=>{panel(g,w,h,'PeakTech 4124');g.fillStyle='#1d3f9e';rr(g,w*.05,h*.18,w*.5,h*.5,8);g.fill();g.fillStyle='#fff';g.font=`600 ${h*.12}px ${MO}`;g.fillText('200.000Hz',w*.08,h*.38);g.fillStyle='#ffe066';g.fillText('6.000Vpp',w*.08,h*.58);
      for(let i=0;i<16;i++){g.fillStyle='#f4f6f7';rr(g,w*.62+(i%4)*w*.085,h*.18+Math.floor(i/4)*h*.12,w*.07,h*.09,5);g.fill()}
      g.fillStyle='#2d3438';rr(g,w*.05,h*.78,w*.12,h*.12,6);g.fill();g.fillStyle='#2c3438';g.beginPath();g.arc(w*.86,h*.82,h*.08,0,7);g.fill();g.fillStyle='#c8a24a';g.beginPath();g.arc(w*.86,h*.82,h*.03,0,7);g.fill()},
    dc:(g,w,h)=>{panel(g,w,h,'DC POWER SUPPLY');g.fillStyle='#200a0a';g.fillRect(w*.06,h*.18,w*.4,h*.24);g.fillRect(w*.54,h*.18,w*.4,h*.24);g.fillStyle='#ff4b3a';g.font=`600 ${h*.17}px ${MO}`;g.textAlign='right';g.fillText('2.00',w*.43,h*.37);g.fillText('0.050',w*.91,h*.37);g.textAlign='left';
      knob(g,w*.17,h*.6,h*.08);knob(g,w*.45,h*.6,h*.08);knob(g,w*.78,h*.6,h*.08);g.fillStyle='#d33';g.beginPath();g.arc(w*.7,h*.85,h*.06,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.arc(w*.86,h*.85,h*.06,0,7);g.fill()},
    xf:(g,w,h)=>{g.fillStyle='#7d4632';g.fillRect(0,0,w,h);g.strokeStyle='#3e1f15';g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.fillStyle='#ffe3c9';g.font=`600 ${h*.08}px ${MO}`;g.fillText('CENTER-TAPPED',w*.07,h*.18);g.fillText('TRANSFORMER',w*.07,h*.29);
      g.font=`500 ${h*.06}px ${MO}`;g.fillStyle='#f2c9ab';g.fillText('220 V → 2 × 6.4 V rms',w*.07,h*.4);[['A','#ff8c2e'],['B','#3cbf5c'],['C','#3f8cff']].forEach(([l,c],i)=>{g.fillStyle=c;g.beginPath();g.arc(w*.82,h*(.3+i*.22),h*.07,0,7);g.fill();g.fillStyle='#fff';g.font=`600 ${h*.08}px ${MO}`;g.fillText(l,w*.68,h*(.33+i*.22))})},
    dim:(g,w,h)=>{panel(g,w,h,'');g.fillStyle='#4a565b';rr(g,w*.06,h*.2,w*.55,h*.6,10);g.fill();for(let i=0;i<6;i++)knob(g,w*(.7+(i%2)*.16),h*(.3+Math.floor(i/2)*.22),h*.06)}
  };
  function instrument(kind,w,h,d,x,z,top){const side=std('#d6dde0',{roughness:.55}),f=std('#fff',{map:tex(512,Math.round(512*h/w),(g,W,H)=>FACES[kind](g,W,H)),roughness:.5});
    const sc=kind==='xf'?std('#6e3b2a'):side;return boxM(w,h,d,[sc,sc,sc,sc,kind==='xf'?std('#fff',{map:f.map}):f,sc],x,top+h/2,z)}
  function boardTex(){return tex(512,340,(g,W,H)=>{g.fillStyle='#c5ced2';g.fillRect(0,0,W,H);for(let i=0;i<35;i++){const cx=40+(i%7)*72,cy=40+Math.floor(i/7)*65;g.fillStyle='#b3bec3';rr(g,cx-26,cy-24,52,48,8);g.fill();g.fillStyle='#38434a';for(let h=0;h<9;h++){g.beginPath();g.arc(cx+((h%3)-1)*14,cy+(Math.floor(h/3)-1)*13,3.2,0,7);g.fill()}}})}
  function sign(txt1,txt2,txt3,active){return tex(1024,300,(g,W,H)=>{g.fillStyle=active?'#2c7a6b':'#b9c4c0';rr(g,8,8,W-16,H-16,40);g.fill();g.fillStyle='#fff';g.font=`600 108px ${MO}`;g.textAlign='center';g.fillText(txt1,W/2,128);
    g.font=`500 46px ${MO}`;g.fillStyle=active?'#d6eae4':'#f4f6f5';g.fillText(txt2,W/2,196);g.direction='rtl';g.font=`600 46px ${AR}`;g.fillStyle='#fff';g.fillText(txt3,W/2,262)})}

  function makeBench(x,z,num,active,exp){
    const top=0.9;const lam=std('#ede8dd',{roughness:.6}),frame=std('#56636a',{roughness:.5,metalness:.3});
    boxM(2.5,0.05,1.05,lam,x,top-0.025,z);[[-1.18,-0.45],[1.18,-0.45],[-1.18,0.45],[1.18,0.45]].forEach(([dx,dz])=>boxM(0.06,top-0.05,0.06,frame,x+dx,(top-0.05)/2,z+dz));
    boxM(2.3,0.5,0.03,std('#cfd8d4'),x,0.5,z-0.48,false);
    boxM(2.5,0.12,0.04,std('#d9e1de'),x,top+0.06,z-0.53);
    if(exp==='exp3'){instrument('gen',0.5,0.22,0.34,x-0.82,z-0.25,top);instrument('dc',0.36,0.22,0.3,x-0.28,z-0.26,top);instrument('scope',0.62,0.34,0.34,x+0.52,z-0.24,top)}
    else if(exp==='exp4'){instrument('xf',0.5,0.32,0.36,x-0.7,z-0.24,top);instrument('scope',0.62,0.34,0.34,x+0.52,z-0.24,top)}
    else{instrument('dim',0.5,0.24,0.34,x-0.6,z-0.25,top);instrument('dim',0.55,0.3,0.34,x+0.45,z-0.24,top)}
    const bb=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.02,0.32),[std('#b9c3c7'),std('#b9c3c7'),std('#fff',{map:boardTex()}),std('#b9c3c7'),std('#b9c3c7'),std('#b9c3c7')]);bb.position.set(x-0.05,top+0.01,z+0.2);bb.receiveShadow=true;scene.add(bb);
    if(active){const cab=(pts,c)=>{const cu=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(cu,30,0.007,6,false),std(c,{roughness:.4}));scene.add(m)};
      cab([[x+0.35,top+0.05,z-0.06],[x+0.25,top+0.01,z+0.05],[x+0.08,top+0.02,z+0.15]],'#2b2f30');cab([[x+0.6,top+0.05,z-0.06],[x+0.45,top+0.01,z+0.12],[x+0.12,top+0.02,z+0.28]],'#2b2f30');
      cab([[x-0.6,top+0.05,z-0.06],[x-0.45,top+0.01,z+0.1],[x-0.22,top+0.02,z+0.16]],'#c8372d')}
    // stool
    const cz=z+0.98,ch=new THREE.Group();const seatM=std(active?'#2f6f63':'#8a9692',{roughness:.5});
    const seat=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.06,28),seatM);seat.position.y=0.62;seat.castShadow=true;ch.add(seat);
    const back=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.2,0.04),seatM);back.position.set(0,0.86,0.2);back.castShadow=true;ch.add(back);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.6,10),frame);pole.position.y=0.3;ch.add(pole);
    const bp=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.26,8),frame);bp.position.set(0,0.74,0.18);ch.add(bp);
    for(let i=0;i<5;i++){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.03,0.04),frame);leg.position.set(Math.cos(i*1.2566)*0.13,0.03,Math.sin(i*1.2566)*0.13);leg.rotation.y=-i*1.2566;ch.add(leg)}
    ch.position.set(x,0,cz);scene.add(ch);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.34,0.42,40),new THREE.MeshBasicMaterial({color:0x2c7a6b,transparent:true,opacity:0}));ring.rotation.x=-Math.PI/2;ring.position.set(x,0.012,cz);scene.add(ring);
    const sw=active?1.5:0.62,shh=active?0.44:0.18;const sg=new THREE.Mesh(new THREE.PlaneGeometry(sw,shh),new THREE.MeshBasicMaterial({map:sign(`Exp ${num}`,active?EXPS[exp].en:'Coming soon',active?EXPS[exp].ar:'قريباً',active),transparent:true}));
    if(active){sg.position.set(x,2.35,z-0.2);[-0.6,0.6].forEach(dx=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.7,4),frame);w.position.set(x+dx,2.92,z-0.2);scene.add(w)})}else{sg.position.set(x,top+0.2,z-0.53)}scene.add(sg);
    const B={x,z,cz,num,active,exp,seatM,ring,box:[x-1.3,x+1.3,z-0.58,z+0.58]};benches.push(B);
    ch.traverse(o=>{if(o.isMesh){o.userData.bench=B;pick.push(o)}});
    return B}

  function build(){
    scene=new THREE.Scene();scene.background=new THREE.Color('#e9eeec');
    cam=new THREE.PerspectiveCamera(62,1,0.05,60);cam.rotation.order='YXZ';
    scene.add(new THREE.HemisphereLight(0xffffff,0xd8cdb8,0.75));
    const dl=new THREE.DirectionalLight(0xffffff,0.55);dl.position.set(3,8,4);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);Object.assign(dl.shadow.camera,{left:-9,right:9,top:8,bottom:-8,far:20});dl.shadow.bias=-0.0006;dl.shadow.radius=3;scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff,0.18));
    // floor
    const ft=tex(512,512,(g,W,H)=>{g.fillStyle='#d9dedb';g.fillRect(0,0,W,H);g.strokeStyle='#c5ccc8';g.lineWidth=3;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*W/4,0);g.lineTo(i*W/4,H);g.stroke();g.beginPath();g.moveTo(0,i*H/4);g.lineTo(W,i*H/4);g.stroke()}
      for(let i=0;i<500;i++){g.fillStyle=`rgba(${120+Math.random()*60|0},${130+Math.random()*50|0},${125+Math.random()*50|0},.08)`;g.fillRect(Math.random()*W,Math.random()*H,3,3)}});
    ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(16/2.4,13/2.4);
    floor=new THREE.Mesh(new THREE.PlaneGeometry(16,13),std('#fff',{map:ft,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    const wallM=std('#e3e9e6',{roughness:.95}),dado=std('#c9d3cf');
    const wall=(w,x,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,3.3),wallM);m.position.set(x,1.65,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);const d=new THREE.Mesh(new THREE.PlaneGeometry(w,0.95),dado);d.position.set(x,0.475,z);d.rotation.y=ry;d.position.x+=Math.sin(ry)*0.005;d.position.z+=Math.cos(ry)*0.005;scene.add(d)};
    wall(16,0,-6.5,0);wall(16,0,6.5,Math.PI);wall(13,-8,0,Math.PI/2);wall(13,8,0,-Math.PI/2);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(16,13),std('#f3f5f4'));ceil.rotation.x=Math.PI/2;ceil.position.y=3.3;scene.add(ceil);
    for(let i=-2;i<=2;i++)for(let j=-1;j<=1;j++){const l=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.5),new THREE.MeshBasicMaterial({color:0xffffff}));l.rotation.x=Math.PI/2;l.position.set(i*3,3.29,j*3.6);scene.add(l)}
    // whiteboard
    const wb=tex(1400,500,(g,W,H)=>{g.fillStyle='#fbfcfc';g.fillRect(0,0,W,H);g.strokeStyle='#9aa6a2';g.lineWidth=18;g.strokeRect(9,9,W-18,H-18);g.fillStyle='#2c7a6b';g.font=`600 74px ${MO}`;g.textAlign='center';g.fillText('EE312 · Basic Electronics Lab',W/2,150);
      g.direction='rtl';g.fillStyle='#1e2a28';g.font=`600 64px ${AR}`;g.fillText('أهلاً بك في محاكي معامل قسم الكهرباء',W/2,270);g.fillStyle='#5d6b67';g.font=`500 48px ${AR}`;g.fillText('امشِ لأي طاولة، واضغط على الكرسي عشان تجلس وتبدأ التجربة',W/2,370);
      g.strokeStyle='#c8372d';g.lineWidth=5;g.beginPath();for(let i=0;i<=200;i++){const x=W*.15+W*.7*i/200,y=440-Math.max(-0.55,Math.min(0.55,Math.sin(i/200*Math.PI*6)))*40;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()});
    const wbm=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.86),new THREE.MeshStandardMaterial({map:wb,roughness:.35}));wbm.position.set(0,2.0,-6.47);scene.add(wbm);
    // windows (left wall)
    for(let i=-1;i<=1;i++){const w=new THREE.Mesh(new THREE.PlaneGeometry(2,1.3),new THREE.MeshBasicMaterial({color:0xd5ebf3}));w.position.set(-7.98,1.85,i*3.4);w.rotation.y=Math.PI/2;scene.add(w);
      const fr=std('#f7f9f8');boxM(0.06,1.42,0.08,fr,-7.96,1.85,i*3.4-1.04,false);boxM(0.06,1.42,0.08,fr,-7.96,1.85,i*3.4+1.04,false);boxM(0.06,0.08,2.16,fr,-7.96,2.55,i*3.4,false);boxM(0.08,0.08,2.16,fr,-7.94,1.16,i*3.4,false);boxM(0.06,1.3,0.05,fr,-7.96,1.85,i*3.4,false)}
    // cabinets (right wall) + poster
    for(let i=-2;i<=2;i++){boxM(0.6,0.9,1.2,std('#dbe2df'),7.68,0.45,i*1.25);boxM(0.64,0.04,1.24,std('#b9c4c0'),7.68,0.92,i*1.25)}
    const ps=tex(700,900,(g,W,H)=>{g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#c43a2e';g.fillRect(0,0,W,140);g.fillStyle='#fff';g.direction='rtl';g.textAlign='center';g.font=`700 64px ${AR}`;g.fillText('قواعد السلامة',W/2,95);
      g.fillStyle='#1e2a28';g.font=`500 40px ${AR}`;g.textAlign='right';['لا توصّل المحوّل قبل ما يشيك المعيد','حدّد التيار بـ 0.05 A','انتبه لقطبية المكثف','ابدأ الإسكوب من Default','افصل الكهرباء قبل أي تعديل'].forEach((t,i)=>{g.fillText('• '+t,W-50,240+i*120)})});
    const pm=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.35),new THREE.MeshStandardMaterial({map:ps}));pm.position.set(7.97,1.85,0);pm.rotation.y=-Math.PI/2;scene.add(pm);
    // door
    boxM(1.1,2.2,0.06,std('#a97c5a'),3.5,1.1,6.47,false);
    // benches
    makeBench(-3.3,0.2,3,true,'exp3');makeBench(3.3,0.2,4,true,'exp4');
    makeBench(-4.6,-3.5,1,false);makeBench(0,-3.5,2,false);makeBench(4.6,-3.5,5,false);
  }

  /* --- movement --- */
  function blocked(x,z){if(x<-7.55||x>7.0||z<-6.1||z>6.1)return true;for(const b of benches){const r=0.28;if(x>b.box[0]-r&&x<b.box[1]+r&&z>b.box[2]-r&&z<b.box[3]+r)return true}return false}
  function moveBy(dx,dz){if(!blocked(P.x+dx,P.z))P.x+=dx;if(!blocked(P.x,P.z+dz))P.z+=dz}
  function segHits(ax,az,bx,bz,b){const r=0.32;const x0=b.box[0]-r,x1=b.box[1]+r,z0=b.box[2]-r,z1=b.box[3]+r;for(let i=0;i<=30;i++){const t=i/30,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(x>x0&&x<x1&&z>z0&&z<z1)return true}return false}
  function planTo(tx,tz){const pts=[];let ax=P.x,az=P.z;for(const b of benches){if(segHits(ax,az,tx,tz,b)){const side=b.x+(ax>=b.x?1:-1)*1.75;const zEdge=az<b.z?b.box[2]-0.6:b.box[3]+0.6;pts.push({x:side,z:az<b.z&&tz>b.z?Math.min(az,zEdge):az});pts.push({x:side,z:tz});ax=side;az=tz}}pts.push({x:tx,z:tz});return pts}
  function walkTo(x,z,then){mode='walk';path=planTo(x,z);path.then=then;stuck=0;lastD=1e9}
  function goSit(B){if(!B.active){toast(`طاولة تجربة ${B.num} قريباً`);return}const ax=B.x,az=B.cz+0.75;if(Math.hypot(P.x-ax,P.z-az)<0.35)sit(B);else walkTo(ax,az,()=>sit(B))}
  function angDiff(a,b){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
  function sit(B){mode='sitting';path=[];seatB=B;const from={...P},to={x:B.x,z:B.cz-0.02,y:1.2,yaw:0,pitch:-0.42};const dy=angDiff(from.yaw,to.yaw);const t0=performance.now(),dur=reduceMotion?1:1500;prompt.hidden=true;tip.hidden=true;
    anim=now=>{const k=Math.min(1,(now-t0)/dur),e=ease(k);P.x=from.x+(to.x-from.x)*e;P.z=from.z+(to.z-from.z)*e;P.yaw=from.yaw+dy*e;P.pitch=from.pitch+(to.pitch-from.pitch)*e;
      const yk=Math.max(0,(k-0.25)/0.75);P.y=from.y+(to.y-from.y)*ease(yk)-Math.sin(Math.min(1,yk)*Math.PI)*0.06;if(k>=1){anim=null;mode='seated';seated(B)}}}
  function seated(B){const X=EXPS[B.exp];$q('#smKicker').textContent=`EE312 · EXPERIMENT ${X.num}`;$q('#smTitle').textContent=X.en;$q('#smSub').textContent=`جلست على طاولة تجربة ${X.num} (${X.ar}). اختر الطور:`;$q('#seatModal').hidden=false;setTimeout(()=>$q('#seatModal button[data-mode]').focus(),50)}
  function standUp(){$q('#hall').hidden=false;$q('#seatModal').hidden=true;resize();running=true;loop0();const B=seatB;if(!B){mode='walk';return}
    P.x=B.x;P.z=B.cz-0.02;P.y=1.2;P.yaw=0;P.pitch=-0.42;mode='sitting';const from={...P},to={x:B.x,z:B.cz+0.8,y:EYE,pitch:-0.08};const t0=performance.now(),dur=reduceMotion?1:1100;
    anim=now=>{const k=Math.min(1,(now-t0)/dur),e=ease(k);P.x=from.x+(to.x-from.x)*e;P.z=from.z+(to.z-from.z)*e;P.y=from.y+(to.y-from.y)*e;P.pitch=from.pitch+(to.pitch-from.pitch)*e;if(k>=1){anim=null;mode='walk';seatB=null}};
    const f=$q('#fade');f.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>f.classList.remove('on')))}
  function chooseMode(m){const B=seatB;$q('#seatModal').hidden=true;const f=$q('#fade');f.classList.add('on');
    setTimeout(()=>{running=false;$q('#hall').hidden=true;BENCH.enter(B.exp,m,true);requestAnimationFrame(()=>f.classList.remove('on'))},reduceMotion?0:360)}
  let toastT;function toast(m){prompt.textContent=m;prompt.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{prompt.hidden=true;toastT=null},1600)}

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
    if(B){B.seatM.emissive.setHex(B.active?0x1a4a40:0x222222);cv.style.cursor='pointer';tip.hidden=false;tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';
      tip.innerHTML=B.active?`اجلس على طاولة تجربة ${B.num}<small>${EXPS[B.exp].en}</small>`:`تجربة ${B.num} · قريباً`}
    else{cv.style.cursor='';tip.hidden=true}}
  function nearest(){let best=null,bd=2.0;for(const b of benches){if(!b.active)continue;const d=Math.hypot(P.x-b.x,P.z-(b.cz+0.7));if(d<bd){bd=d;best=b}}return best}

  /* --- loop --- */
  function resize(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<0.8?80:62;cam.updateProjectionMatrix()}
  function frame(now){if(!running)return;requestAnimationFrame(frame);const dt=Math.min(0.05,(now-(last||now))/1000);last=now;
    if(anim)anim(now);
    else if(mode==='walk'){
      let f=0,s=0,turn=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD)s+=1;if(keys.KeyA)s-=1;if(keys.ArrowLeft||keys.KeyQ)turn+=1;if(keys.ArrowRight)turn-=1;
      if(f||s||turn){path=[];P.yaw+=turn*1.9*dt;const sp=SPEED*dt/(f&&s?1.414:1);const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);moveBy((fx*f+rx*s)*sp,(fz*f+rz*s)*sp)}
      else if(path.length){const t=path[0];const dx=t.x-P.x,dz=t.z-P.z,d=Math.hypot(dx,dz);
        if(d<0.06){path.shift();lastD=1e9;stuck=0;if(!path.length&&path.then){const th=path.then;path.then=null;th()}}
        else{const st=Math.min(d,SPEED*dt);const tyaw=Math.atan2(-dx,-dz);P.yaw+=angDiff(P.yaw,tyaw)*Math.min(1,dt*6);P.pitch+=(-0.06-P.pitch)*Math.min(1,dt*3);const bx=P.x,bz=P.z;moveBy(dx/d*st,dz/d*st);
          if(Math.hypot(P.x-bx,P.z-bz)<st*0.2){stuck+=dt;if(stuck>0.6){P.x=t.x;P.z=t.z;stuck=0}}else stuck=0}}
      P.y+=(EYE-P.y)*Math.min(1,dt*8);
      const B=nearest();if(B&&!toastT){prompt.hidden=false;prompt.textContent=coarse?`اضغط على الكرسي عشان تجلس · تجربة ${B.num}`:`اضغط E أو على الكرسي عشان تجلس · تجربة ${B.num}`}else if(!toastT)prompt.hidden=true}
    const t=now/1000;benches.forEach(b=>{if(!b.active)return;const on=b===hoverB||b===nearest();b.ring.material.opacity+=(((on?0.85:0.35)+Math.sin(t*3)*0.12)-b.ring.material.opacity)*0.15});
    cam.position.set(P.x,P.y,P.z);cam.rotation.set(P.pitch,P.yaw,0);R.render(scene,cam)}
  function loop0(){last=0;requestAnimationFrame(frame)}

  async function init(){
    $q('#quickBtn').onclick=()=>{const q=$q('#quick');q.hidden=!q.hidden;$q('#quickBtn').setAttribute('aria-expanded',!q.hidden)};
    document.querySelectorAll('#quick button,#fallback button').forEach(b=>b.onclick=()=>{$q('#quick').hidden=true;const B=benches.find(x=>x.exp===b.dataset.exp);if(B){P.x=B.x;P.z=B.cz+0.75;P.yaw=0;sit(B)}else{seatB={exp:b.dataset.exp};seated(seatB)}});
    document.querySelectorAll('#seatModal button[data-mode]').forEach(b=>b.onclick=()=>chooseMode(b.dataset.mode));
    $q('#smStand').onclick=()=>{if(ok)standUp();else $q('#seatModal').hidden=true};
    if(!window.THREE){fail();return}
    try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true});}catch(e){fail();return}
    R.setPixelRatio(Math.min(devicePixelRatio,2));R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
    try{await Promise.race([Promise.all([document.fonts.load(`600 40px "IBM Plex Sans Arabic"`),document.fonts.load(`600 40px "IBM Plex Mono"`)]),new Promise(r=>setTimeout(r,1800))])}catch(_){}
    build();ok=true;bindInput();resize();addEventListener('resize',()=>{if(!$q('#hall').hidden)resize()});$q('#hallLoading').hidden=true;loop0();
  }
  function fail(){$q('#hallLoading').hidden=true;$q('#fallback').hidden=false;$q('#hallHint').hidden=true;$q('#quickBtn').hidden=true}
  return {init,standUp:()=>{if(ok)standUp();else{$q('#hall').hidden=false}}};
})();
