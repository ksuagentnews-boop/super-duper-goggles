/* Metrix PX 120 single / three-phase power meter (EE205 Exp 4, 5): blue holster, three-line LCD, six keys, round
   OFF / ON switch, four banana inputs — current 10A + COM (a 5 mΩ shunt: the meter goes in SERIES with the load) and
   voltage 600V + COM (1 MΩ, across the load). The jacks are drawn on the bottom edge so the bench layout points them at
   the plug-in panel (on the real meter they sit on its top end).
   Readings from one period of the four nets (N = 300 samples, the solver's own step, so the N/12 and N/4 shifts are exact):
     single phase   Vrms, Irms, P = mean(v·i), S = V·I, Q = ±√(S² − P²) (sign of mean(v[k − N/4]·i[k]): + = LAG), PF = P/S.
     3Φ (balanced three-wire, Exp 5 Fig. 9: current in line A, voltage across A–B):
                    P3 = √3·mean(vAB[k − N/12]·i[k])   (vAN(t) = vAB(t − T/12)/√3, so P3 = 3·mean(vAN·i)),
                    S3 = √3·V·I, Q3 = ±√(S3² − P3²) with the sign of √3·mean(vAB[k − N/12 − N/4]·i[k]), PF = P3/S3.
   Over range: I > 10 A or V > 600 V → "OL". f = RT.sigF().
   Keys: ON/OFF switch (PWR), HOLD, DISPLAY (page V·A·W → VA·var·PF → Hz·PF·W), 3Φ, ☼ backlight, Hz, PF (jump to a page).
   State S[key] = {pwr, page, tri, hold, light, fn:'PW', jack:'PW'} (fn / jack keep it out of RT.meterOn's DCV / DCI lookups).
   reading() → {pwr, V, I, P, S, Q, PF, lag, f, tri, ol, hold}. */
ENGINE.px120=function(RT,opt){
const N0=opt.n||1,KEY='pw'+N0,PFX='w'+N0;const W=300,H=380,NS=300;
const RSH=0.005,RV=1e6;
const J={i:{x:46,y:342,lab:'10A',red:true},ic:{x:106,y:342,lab:'COM'},v:{x:194,y:342,lab:'600V',red:true},vc:{x:254,y:342,lab:'COM'}};
function fresh(){const d={pwr:false,page:0,tri:false,hold:null,light:false,fn:'PW',jack:'PW'};if(opt.prev)opt.prev(d);return d}
let RD={V:0,I:0,P:0,S:0,Q:0,PF:0,lag:true,f:0,ol:false};
const net=k=>RT.leadNet(k);
function compute(){const d=RT.S[KEY];RD={V:0,I:0,P:0,S:0,Q:0,PF:0,lag:true,f:0,ol:false};if(!d.pwr||!RT.TB)return;
  const sm=n=>n==null?null:RT.samples(n,NS);
  const a=sm(net(PFX+'i')),b=sm(net(PFX+'ic')),c=sm(net(PFX+'v')),e=sm(net(PFX+'vc'));
  const i=new Float64Array(NS),v=new Float64Array(NS);
  if(a&&b)for(let k=0;k<NS;k++)i[k]=(a[k]-b[k])/RSH;
  if(c&&e)for(let k=0;k<NS;k++)v[k]=c[k]-e[k];
  const rms=x=>{let s=0;for(let k=0;k<NS;k++)s+=x[k]*x[k];return Math.sqrt(s/NS)};
  const lagd=sh=>{let s=0;for(let k=0;k<NS;k++)s+=v[((k-sh)%NS+NS)%NS]*i[k];return s/NS};
  const V=rms(v),I=rms(i);let P,S,q;
  if(d.tri){const r3=Math.sqrt(3);P=r3*lagd(NS/12);S=r3*V*I;q=r3*lagd(NS/12+NS/4)}
  else{P=lagd(0);S=V*I;q=lagd(NS/4)}
  const Qm=Math.sqrt(Math.max(0,S*S-P*P));const lag=q>=0;
  RD={V,I,P,S,Q:lag?Qm:-Qm,PF:S>1e-12?clamp(P/S,-1,1):0,lag,f:V>0.05||I>1e-4?RT.sigF():0,ol:I>10||V>600}}
function measure(){compute()}
/* about four significant digits, like the PX 120's 4-digit lines */
function fmt(x,unit){const a=Math.abs(x);if(a>=1e4)return [(x/1e3).toFixed(a>=1e5?1:2),'k'+unit];
  if(a>0&&a<1&&unit!=='Hz'){const m=x*1e3,b=Math.abs(m);return [m.toFixed(b<10?3:b<100?2:1),'m'+unit]}
  const dec=a<10?3:a<100?2:a<1000?1:0;return [x.toFixed(dec),unit]}
function lines(){const d=RT.S[KEY];const R=d.hold||RD;
  if(R.ol)return [['OL','V'],['OL','A'],['OL','W']];
  const pf=[Math.abs(R.PF).toFixed(3),R.S>1e-9?(R.lag?'LAG':'LEAD'):''];
  if(d.page===1)return [fmt(R.S,'VA'),fmt(R.Q,'var'),pf];
  if(d.page===2)return [fmt(R.f,'Hz'),pf,fmt(R.P,'W')];
  return [fmt(R.V,'V'),fmt(R.I,'A'),fmt(R.P,'W')]}
function svg(){const d=RT.S[KEY];let s='';
  s+=`<rect width="${W}" height="${H}" rx="34" fill="#1f5fd0" stroke="#123b86" stroke-width="3"/>`;
  s+=`<rect x="16" y="14" width="${W-32}" height="${H-28}" rx="20" fill="#3b4045" stroke="#1b1e21" stroke-width="1.5"/>`;
  /* LCD: three lines */
  const lx=34,ly=28,lw=W-68,lh=124;const bg=!d.pwr?'#8f9784':d.light?'#d8ecc6':'#c6cfb4';
  s+=`<rect x="${lx-6}" y="${ly-6}" width="${lw+12}" height="${lh+12}" rx="8" fill="#5a6066" stroke="#25292c"/>`;
  s+=`<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="4" fill="${bg}" stroke="#2a2f26" stroke-width="1.5"/>`;
  if(d.pwr){const ink='#1d2318';const L=lines();
    L.forEach(([val,u],j)=>{const y=ly+40+j*36;s+=`<text x="${lx+lw-52}" y="${y}" font-size="30" fill="${ink}" text-anchor="end" font-weight="600" pointer-events="none" font-family="'DSEG7 Classic','IBM Plex Mono',monospace">${val}</text>`+T(lx+lw-6,y,u,{size:u.length>3?10:13,fill:ink,a:'end',w:700})});
    s+=T(lx+6,ly+13,(d.tri?'3Φ':'1Φ')+(d.hold?'  HOLD':'')+'  AC',{size:9,fill:ink,w:700});}
  /* keys: two rows of three (green top-left, blue bottom-left, as on the meter) */
  const KS=[['HOLD','HOLD','#3fb04a'],['DISP','DISPLAY','#d9dcd6'],['TRI','3Φ','#d9dcd6'],['LIGHT','☼','#2f7fe0'],['HZ','Hz','#d9dcd6'],['PF','PF','#d9dcd6']];
  KS.forEach(([k,l,c],j)=>{const x=40+(j%3)*78,y=168+Math.floor(j/3)*36;const on=(k==='TRI'&&d.tri)||(k==='HOLD'&&d.hold)||(k==='LIGHT'&&d.light);
    s+=`<rect x="${x}" y="${y}" width="64" height="24" rx="8" fill="${c}" stroke="${on?'#ffd75e':'#15181a'}" stroke-width="${on?2.5:1.2}" data-k="${PFX}:${k}" style="cursor:pointer"/>`+T(x+32,y+16,l,{size:9,fill:c==='#d9dcd6'?'#22272a':'#fff',a:'middle',w:700})});
  /* round OFF / ON switch */
  const cx=150,cy=268;s+=`<circle cx="${cx}" cy="${cy}" r="30" fill="#17191b" stroke="#000" stroke-width="2" data-k="${PFX}:PWR" style="cursor:pointer"/>`;
  s+=`<g transform="translate(${cx} ${cy}) rotate(${d.pwr?35:-35})" pointer-events="none"><rect x="-7" y="-26" width="14" height="52" rx="6" fill="#2c3033" stroke="#000"/><path d="M0 -22 l-4 8 h8z" fill="#e8e8e2"/></g>`;
  s+=T(cx-34,cy-24,'OFF',{size:8,fill:d.pwr?'#c9cdc6':'#ffd75e',a:'middle',w:700})+T(cx+34,cy-24,'ON',{size:8,fill:d.pwr?'#ffd75e':'#c9cdc6',a:'middle',w:700});
  s+=T(36,276,'metrix',{size:13,fill:'#e8e8e2',w:700})+T(W-36,272,'PX 120',{size:12,fill:'#e8e8e2',a:'end',w:700})+T(W-36,284,'POWER METER',{size:6.5,fill:'#c9cdc6',a:'end'})+
    (opt.n?`<rect x="36" y="288" width="34" height="16" rx="4" fill="#f0f0ea"/>`+T(53,300,'W'+N0,{size:10,fill:'#1d2124',a:'middle',w:700}):'');
  /* input jacks */
  s+=`<path d="M76 316 h-56 M76 316 h56 M224 316 h-56 M224 316 h56" stroke="#9aa3a8" stroke-width="1"/>`+T(76,312,'I  (A)',{size:7.5,fill:'#e8e8e2',a:'middle',w:700})+T(224,312,'U  (V)',{size:7.5,fill:'#e8e8e2',a:'middle',w:700});
  Object.values(J).forEach(q=>{s+=`<circle cx="${q.x}" cy="${q.y}" r="12" fill="${q.red?'#b52a22':'#1d1f20'}" stroke="#0b0c0d" stroke-width="2"/><circle cx="${q.x}" cy="${q.y}" r="5" fill="#0b0c0d"/>`+T(q.x,q.y-17,q.lab,{size:8,fill:q.red?'#ff9a8c':'#e8e8e2',a:'middle',w:700})});
  s+=T(150,H-24,'CAT III 600V',{size:6.5,fill:'#c9cdc6',a:'middle'});
  return s}
function keyFn(k){const d=RT.S[KEY];
  if(k==='PWR'){d.pwr=!d.pwr;d.hold=null;RT.dirty=true;return}
  if(!d.pwr)return;
  if(k==='HOLD'){d.hold=d.hold?null:{...RD};return}
  if(k==='DISP'){d.page=(d.page+1)%3;return}
  if(k==='HZ'){d.page=2;return}
  if(k==='PF'){d.page=1;return}
  if(k==='LIGHT'){d.light=!d.light;return}
  if(k==='TRI'){d.tri=!d.tri;d.hold=null;RT.dirty=true}}
const LEADS=[['i','+'],['ic','-'],['v','+'],['vc','-']].map(([j,pol])=>{const q=J[j],grp=j[0]==='i'?'I':'U';
  return {k:PFX+j,label:`W${N0} ${q.lab}`,from:{x:q.x,y:q.y},banana:true,circuit:true,pol,tray:`W${N0} ${grp} ${q.lab}`,jn:`W${N0} ${grp==='I'?'current':'voltage'} ${q.lab}`}});
return {key:KEY,prefix:PFX,size:[W,H],name:['Metrix PX 120 · W'+N0,'الواطميتر'],fresh,svg,keyFn,measure,
  leads:LEADS,leadKeys:[PFX+'v',PFX+'vc'],
  /* current path: 5 mΩ shunt 10A → COM; voltage path: 1 MΩ 600V → COM */
  stamp(ck){const L=RT.S.leads;const two=(x,y,g)=>{const a=L[PFX+x],b=L[PFX+y];if(!a||!b||a.node==null||b.node==null)return;ck.els.push({t:'G',a:ck.idx(a.node),b:ck.idx(b.node),g,box:KEY})};
    two('i','ic',1/RSH);two('v','vc',1/RV)},
  reading:()=>{const d=RT.S[KEY];const R=d.hold||RD;return {pwr:d.pwr,V:R.V,I:R.I,P:R.P,S:R.S,Q:R.Q,PF:R.PF,lag:R.lag,f:R.f,tri:d.tri,ol:R.ol,hold:!!d.hold,fn:'PW',val:null,live:{...RD}}}};
};
ENGINE.px120.size=[300,380];
