/* Handheld digital multimeters of the EE205 lab, one module with model variants (opt.model):
     'fluke77'  Fluke 77 (grey holster; color:'yellow' for the yellow-holster ones of Exp 3): 3200 counts, auto range.
                Rotary: OFF · V~ · V⎓ · 300mV⎓ · Ω · ▶|·))) · A⎓ · A~.  Jacks: 10A · 300mA · COM · VΩ▶|.  Keys: RANGE, TOUCH HOLD.
     'goldstar' GoldStar DM-33x (yellow): 4000 counts, auto range, bar graph.
                Rotary: OFF · V · Ω · ·))) · ▶| · Hz · 40mA · 400mA · 10A.  Jacks: 10A · COM · V·Ω·Hz·mA (V and mA share a jack).
                Keys: HOLD · RANGE · MIN MAX · ~/⎓.  Its 40 mA range reads 0.01 mA, so the lab uses it as the ammeter.
     'bk2704'   BK Tool Kit 2704B: 2000 counts (3½ digits), manual ranges on the rotary switch.  Jacks: 10A · mA · COM · VΩ.
   Every jack is its own banana socket: the student plugs the red lead where it belongs (VΩ for volts / ohms, mA or 10 A for
   current) and the black one in COM. A current jack is a small shunt to COM whatever the switch says — an ammeter goes in
   SERIES; across a source it takes a large current and its fuse blows (the jack then reads 0 until the fuse is replaced).
   V jacks load the circuit with 10 MΩ; Ω / ▶| / ·))) inject a test current in their own solve.
   AC volts / amps are average-responding and roll off above their bandwidth (Fluke 77: flat to 1 kHz, ≈ −18 % at 5 kHz;
   the BK 2704B used as the resonance ammeter reads flat to well above 15 kHz, as in the lab).
   State S[key]: {pos, rng (null = auto), hold, mm, fuse:{jack:true}, ac (GoldStar ~)}; derived each measure: pwr, fn, jack.
   Lab access: RT.meters() / meterOn() as for the bench DMMs (leadKeys = [active red lead, COM]); reading().cur for current. */
ENGINE.hdmm=function(RT,opt){
const MODEL=opt.model||'fluke77',N=opt.n||1,KEY='hm'+N,PFX='h'+N;
const M={
  fluke77:{W:250,H:400,name:'Fluke 77',counts:3200,
    pos:[['OFF','OFF'],['ACV','V~'],['DCV','V⎓'],['mV','300mV⎓'],['OHM','Ω'],['DIODE','▶| ·)))'],['DCI','A⎓'],['ACI','A~']],
    jacks:[{j:'a',lab:'10A',sub:'FUSED',sh:0.01,fuse:15,col:'red'},{j:'ma',lab:'300mA',sh:1.8,fuse:0.6,col:'red'},{j:'c',lab:'COM',col:'black'},{j:'v',lab:'VΩ▶|',col:'red'}],
    V:[3.2,32,320,1000],AV:[3.2,32,320,750],MV:[0.32],R:[320,3200,32e3,320e3,3.2e6,32e6],IMA:[0.032,0.32],IA:[10],fc:6000,keys:[['RANGE','RANGE'],['HOLD','TOUCH HOLD']]},
  goldstar:{W:250,H:400,name:'GoldStar DM-332',counts:4000,
    pos:[['OFF','OFF'],['V','≂V'],['OHM','Ω'],['CONT','·)))'],['DIODE','▶|'],['HZ','Hz'],['I40','40mA≂'],['I400','400mA≂'],['I10','10A≂']],
    jacks:[{j:'a',lab:'10A',sub:'FUSED',sh:0.01,fuse:15,col:'red'},{j:'c',lab:'COM',col:'black'},{j:'v',lab:'V·Ω·Hz·mA',sub:'FUSED 400mA',sh:null,fuse:0.5,col:'red'}],
    V:[0.4,4,40,400,1000],AV:[0.4,4,40,400,750],R:[400,4e3,40e3,400e3,4e6,40e6],fc:3000,keys:[['HOLD','HOLD'],['RANGE','RANGE'],['MM','MIN MAX'],['AC','~/⎓']]},
  bk2704:{W:250,H:400,name:'BK 2704B',counts:2000,
    pos:[['OFF','OFF'],['DCV:1000','1000'],['DCV:200','200'],['DCV:20','20'],['DCV:2','2'],['DCV:0.2','200m'],['ACV:750','750'],['ACV:200','200'],['ACV:20','20'],['ACV:2','2'],
      ['DCI:0.002','2m'],['DCI:0.02','20m'],['DCI:0.2','200m'],['DCI:10','10A'],['ACI:0.002','2m'],['ACI:0.02','20m'],['ACI:0.2','200m'],['ACI:10','10A'],
      ['OHM:200','200'],['OHM:2000','2k'],['OHM:20000','20k'],['OHM:200000','200k'],['OHM:2000000','2M'],['OHM:20000000','20M'],['DIODE','▶|·)))']],
    jacks:[{j:'a',lab:'10A',sh:0.01,fuse:15,col:'red'},{j:'ma',lab:'mA',sh:1,fuse:0.25,col:'red'},{j:'c',lab:'COM',col:'black'},{j:'v',lab:'VΩ',col:'red'}],
    fc:100000,keys:[]}};   /* its ac ranges read the lab's resonance runs right up to 15 kHz (video: 18.06 mA at series resonance) */
const D0=M[MODEL];const W=D0.W,H=D0.H;
const yel=opt.color==='yellow'||MODEL==='goldstar';
const JX=D0.jacks.map((q,i)=>({...q,x:Math.round(W*(i+0.5)/D0.jacks.length),y:H-44}));
const jk=j=>JX.find(q=>q.j===j);
const LK=j=>PFX+j;                       // lead key of jack j (each jack its own banana socket)
/* shunt of a current jack for the present switch position (GoldStar: its V·mA jack is a shunt only on 40 / 400 mA) */
function shunt(j){const d=RT.S[KEY];const q=jk(j);if(!q||!d.fuse[j])return null;
  if(MODEL==='goldstar'&&j==='v'){const p=posKey();return p==='I40'?5:p==='I400'?0.5:null}
  if(MODEL==='bk2704'&&j==='ma'){const p=posKey();return /^(DC|AC)I:0\.002/.test(p)?100:/^(DC|AC)I:0\.02$/.test(p)?10:1}
  return q.sh}
const posKey=()=>D0.pos[RT.S[KEY].pos][0];
/* function from the switch: fn ∈ DCV ACV OHM DIODE CONT HZ DCI ACI; red jack the reading uses */
function fnOf(d=RT.S[KEY]){const p=D0.pos[d.pos][0];if(p==='OFF')return {fn:null};
  if(MODEL==='fluke77')return {mV:{fn:'DCV',mv:true},ACV:{fn:'ACV'},DCV:{fn:'DCV'},OHM:{fn:'OHM'},DIODE:{fn:'DIODE'},DCI:{fn:'DCI'},ACI:{fn:'ACI'}}[p];
  if(MODEL==='goldstar'){if(p==='V')return {fn:d.ac?'ACV':'DCV'};if(p==='I40'||p==='I400')return {fn:d.ac?'ACI':'DCI',rjack:'v',fs:p==='I40'?0.04:0.4};if(p==='I10')return {fn:d.ac?'ACI':'DCI',rjack:'a',fs:10};return {fn:p}}
  const [f,r]=p.split(':');return {fn:f,fs:r?+r:null}}
/* which red jack a current reading comes from */
function curJack(){const F=fnOf();if(F.rjack)return F.rjack;if(MODEL==='bk2704')return F.fs===10?'a':'ma';const S=RT.S;
  /* Fluke 77: the A positions read whichever current jack carries the red lead (mA first) */
  return S.jack[LK('ma')]?'ma':S.jack[LK('a')]?'a':'ma'}
function fresh(){const d={pos:0,rng:null,hold:null,mm:null,mmv:null,ac:false,fuse:{},pwr:false,fn:null,jack:'HI',msg:''};D0.jacks.forEach(q=>d.fuse[q.j]=true);if(opt.prev)opt.prev(d,D0);sync(d);return d}
function sync(d){d.pwr=D0.pos[d.pos][0]!=='OFF';const F=fnOf(d);d.fn=F.fn;d.jack=F.fn==='DCI'||F.fn==='ACI'?'A':'HI'}
let RD={val:null,ol:false,fs:1,unit:'V',dec:3};
const meanOf=a=>a.reduce((x,y)=>x+y,0)/a.length;
const acAvg=a=>{const m=meanOf(a);return a.reduce((x,y)=>x+Math.abs(y-m),0)/a.length*1.1107};   // average responding, rms-calibrated
const roll=()=>{const f=RT.sigF?RT.sigF():0;return f>0?1/Math.sqrt(1+Math.pow(f/D0.fc,4)):1};
const net=k=>RT.leadNet(k);
/* auto range: the smallest full scale above |v| (counts), else the top one (OL above it) */
function rangeFor(list,v){const d=RT.S[KEY];if(d.rng!=null)return clamp(d.rng,0,list.length-1);const i=list.findIndex(fs=>Math.abs(v)<fs*0.999);return i<0?list.length-1:i}
function testSolve(i0,vmax){const ck=RT.buildUser(false,{meter:{i0,vmax,key:KEY}});if(!ck.meter)return null;const r=SOLVER.point(ck,0,null);const V=i=>i<0?0:r.x[i];const v=V(ck.meter.a)-V(ck.meter.b);const [i]=SOLVER.ccs({i0,vmax},v);return {v,i}}
function compute(){const d=RT.S[KEY];sync(d);const F=fnOf();RD={val:null,ol:false,fs:1,unit:'',open:false};if(!d.pwr)return;const fn=F.fn;
  const S=RT.S,vin=S.jack[LK('v')],cin=S.jack[LK('c')];
  if(fn==='OHM'||fn==='DIODE'||fn==='CONT'){
    if(fn==='DIODE'||fn==='CONT'){RD.fs=fn==='CONT'?(D0.R?D0.R[0]:200):(MODEL==='fluke77'?3.2:MODEL==='goldstar'?4:2);RD.unit=fn==='CONT'?'Ω':'V';const t=vin&&cin?testSolve(1e-3,3.0):null;
      if(fn==='CONT'){const rr=t&&t.i>1e-12?t.v/t.i:Infinity;if(rr>RD.fs){RD.ol=true;return}RD.val=rr;RD.beep=rr<40;return}
      if(!t||t.v>=Math.min(2.4,RD.fs)){RD.ol=true;return}RD.val=t.v;if(MODEL==='fluke77')RD.beep=t.v<0.1;return}
    const list=F.fs?[F.fs]:D0.R;RD.unit='Ω';
    if(!vin||!cin){RD.ol=true;RD.fs=list[d.rng!=null?clamp(d.rng,0,list.length-1):list.length-1];return}
    const tries=d.rng!=null||F.fs?[F.fs?0:clamp(d.rng,0,list.length-1)]:list.map((_,i)=>i);
    for(const ri of tries){const fs=list[ri];const i0=clamp(0.3/fs,1e-7,1e-3);const t=testSolve(i0,3.0);RD.fs=fs;if(!t)break;const rr=t.i>1e-15?t.v/t.i:Infinity;
      if(t.v<2.9&&Math.abs(rr)<fs*0.999){RD.val=rr;return}}
    RD.ol=true;return}
  if(!RT.TB||!RT.TB.ck)return;
  if(fn==='HZ'){RD.unit='Hz';RD.fs=2e5;const a=net(LK('v')),b=net(LK('c'));if(a==null||b==null){RD.val=0;return}const va=RT.samples(a),vb=RT.samples(b);const v=va.map((x,k)=>x-vb[k]);
    const m=meanOf(v),pp=Math.max(...v)-Math.min(...v);RD.val=pp>0.05?RT.sigF():0;RD.fs=RD.val<4e3?4e3:RD.val<4e4?4e4:4e5;return}
  if(fn==='DCI'||fn==='ACI'){const j=curJack(),q=jk(j);RD.unit='A';const sh=shunt(j);
    const a=net(LK(j)),b=net(LK('c'));let I=[0];if(sh!=null&&a!=null&&b!=null){const va=RT.samples(a),vb=RT.samples(b);I=va.map((x,k)=>(x-vb[k])/sh)}
    const val=fn==='DCI'?meanOf(I):acAvg(I)*roll();
    const list=F.fs?[F.fs]:j==='a'?(D0.IA||[10]):(D0.IMA||[0.4]);const ri=F.fs?0:rangeFor(list,val);RD.fs=list[ri];RD.val=val;if(Math.abs(val)>=RD.fs*1.0001)RD.ol=true;return}
  /* volts */
  RD.unit='V';const a=net(LK('v')),b=net(LK('c'));let v=[0];if(a!=null&&b!=null){const va=RT.samples(a),vb=RT.samples(b);v=va.map((x,k)=>x-vb[k])}
  const val=fn==='DCV'?meanOf(v):acAvg(v)*roll();
  const list=F.mv?D0.MV:F.fs?[F.fs]:fn==='ACV'?D0.AV:D0.V;const ri=F.fs||F.mv?0:rangeFor(list,val);RD.fs=list[ri];RD.val=val;if(Math.abs(val)>=RD.fs*1.0001)RD.ol=true}
/* fuses: a current jack that carried more than its fuse rating opens (checked after every solve) */
function fuseCheck(){const d=RT.S[KEY];if(!RT.TB||!RT.TB.ck)return;let blown=null;
  D0.jacks.forEach(q=>{if(q.fuse==null||!d.fuse[q.j])return;const sh=shunt(q.j);if(sh==null)return;const a=net(LK(q.j)),b=net(LK('c'));if(a==null||b==null)return;
    const va=RT.samples(a,60),vb=RT.samples(b,60);let mx=0;for(let k=0;k<60;k++)mx=Math.max(mx,Math.abs((va[k]-vb[k])/sh));if(mx>q.fuse){d.fuse[q.j]=false;blown=q}});
  if(blown){RT.dirty=true;BENCH.say(`💥 انضرب فيوز الـ ${blown.lab} في ${D0.name}: الأميتر ينركّب على التوالي، مو على طرفي المصدر`);setTimeout(()=>RT.render(),0)}}
/* the display text: digits for the full scale (counts), OL / "1" over range */
function display(){const d=RT.S[KEY];if(!d.pwr)return null;if(d.hold)return d.hold;
  let v=RD.val;if(d.mm&&d.mmv!=null)v=d.mmv;const fs=RD.fs;let unit=RD.unit,k=1;
  if(unit==='Ω'){if(fs>=1e6){k=1e-6;unit='MΩ'}else if(fs>=1e3){k=1e-3;unit='kΩ'}}
  else if(unit==='V'&&fs<1){k=1e3;unit='mV'}else if(unit==='A'&&fs<1){k=1e3;unit='mA'}
  else if(unit==='Hz'&&fs>=1e3){k=1e-3;unit='kHz'}
  const fsk=fs*k;const ip=Math.floor(Math.log10(fsk)+1e-9)+1;const decs=clamp(Math.ceil(Math.log10(D0.counts))-ip,0,4);
  if(RD.ol||v==null){if(RD.ol)return {main:MODEL==='bk2704'?'1   ':'OL',unit,ol:true};return {main:(0).toFixed(decs),unit}}
  const s=(v*k).toFixed(decs);return {main:s,unit,dec:decs,si:+s/k}}
function measure(){compute();fuseCheck();const d=RT.S[KEY];if(d.mm&&RD.val!=null&&!RD.ol){d.mmv=d.mmv==null?RD.val:d.mm==='MAX'?Math.max(d.mmv,RD.val):Math.min(d.mmv,RD.val)}}

/* ---------- drawing ---------- */
const CX=W/2,CY=H*0.52,RR=46;
function posAng(i){const n=D0.pos.length;const span=MODEL==='bk2704'?330:270;return (-span/2+span*i/(n-1))*Math.PI/180}
function svg(){const d=RT.S[KEY];const DSP=display();let s='';
  const body=yel?'#f2b51c':'#5f6458',bodyD=yel?'#b07d05':'#3c3f37',face=MODEL==='bk2704'?'#2a2d2f':yel?'#2c2f31':'#4a4e46';
  s+=`<rect x="0" y="0" width="${W}" height="${H}" rx="26" fill="${body}" stroke="${bodyD}" stroke-width="3"/>`;
  s+=`<rect x="14" y="14" width="${W-28}" height="${H-28}" rx="16" fill="${face}" stroke="#16181a" stroke-width="1.5"/>`;
  // brand
  const brand=MODEL==='fluke77'?'FLUKE 77 MULTIMETER':MODEL==='goldstar'?'GoldStar  DM-332':'BK  TOOL KIT 2704B';
  s+=T(26,34,brand,{size:11,fill:MODEL==='goldstar'?'#f2d36b':'#f0f0ea',w:700})+(opt.n?`<rect x="${W-62}" y="22" width="42" height="16" rx="4" fill="#f0f0ea"/>`+T(W-41,34,'M'+N,{size:11,fill:'#1d2124',a:'middle',w:700}):'');
  // LCD
  const lx=26,ly=44,lw=W-52,lh=76;s+=`<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="5" fill="${d.pwr?'#c9d3b4':'#8e977c'}" stroke="#1c1f1a" stroke-width="2"/>`;
  if(d.pwr&&DSP){const ink='#1e2418';s+=`<text x="${lx+lw-34}" y="${ly+52}" font-size="38" fill="${ink}" text-anchor="end" font-weight="600" pointer-events="none" font-family="'DSEG7 Classic','IBM Plex Mono',monospace">${DSP.main}</text>`+T(lx+lw-6,ly+52,DSP.unit,{size:14,fill:ink,a:'end',w:700});
    const F=fnOf();const tag=(F.fn==='ACV'||F.fn==='ACI'?'AC':F.fn==='DCV'||F.fn==='DCI'?'DC':'')+(d.rng==null&&MODEL!=='bk2704'?'  AUTO':'')+(d.hold?'  H':'')+(d.mm?'  '+d.mm:'')+(RD.beep?'  ·)))':'');
    s+=T(lx+6,ly+15,tag,{size:9,fill:ink,w:700});
    if(MODEL!=='bk2704'){const fr=RD.val!=null&&!RD.ol?Math.min(1,Math.abs(RD.val)/RD.fs):RD.ol?1:0,nb=32;for(let i=0;i<nb;i++)s+=`<rect x="${lx+6+i*((lw-12)/nb)}" y="${ly+lh-12}" width="${(lw-12)/nb-1.5}" height="6" fill="${i<fr*nb?ink:'#b4bea0'}"/>`}
    const blown=D0.jacks.filter(q=>!d.fuse[q.j]);if(blown.length)s+=T(lx+lw-6,ly+15,'FUSE '+blown.map(q=>q.lab).join(' '),{size:8.5,fill:'#8a1c10',a:'end',w:700})}
  // keys
  const ks=D0.keys;ks.forEach(([k,l],i)=>{const kw=(W-52-(ks.length-1)*6)/ks.length,x=26+i*(kw+6);s+=`<rect x="${x}" y="130" width="${kw}" height="20" rx="9" fill="#1f2224" stroke="#0b0c0d" data-k="${PFX}:${k}" style="cursor:pointer"/>`+T(x+kw/2,143.5,l,{size:7.5,fill:'#e8e8e2',a:'middle',w:600})});
  // rotary switch with its positions around
  D0.pos.forEach(([,l],i)=>{const a=posAng(i),r=RR+(MODEL==='bk2704'?14:20);const x=CX+Math.sin(a)*r,y=CY-Math.cos(a)*r;const on=i===d.pos;
    s+=T(x,y+3,l,{size:MODEL==='bk2704'?7:8.5,fill:on?'#ffd75e':'#e8e8e2',a:'middle',w:on?700:500})});
  const a=posAng(d.pos);s+=`<circle cx="${CX}" cy="${CY}" r="${RR*1.35}" fill="transparent" data-k="knob:${PFX}:SW" data-knob="${PFX}:SW"/>`;
  s+=`<circle cx="${CX}" cy="${CY}" r="${RR-6}" fill="#191b1c" stroke="#0b0c0d" stroke-width="3" data-k="knob:${PFX}:SW" data-knob="${PFX}:SW" style="cursor:grab"/>`;
  s+=`<g transform="translate(${CX} ${CY}) rotate(${a*180/Math.PI})" pointer-events="none"><rect x="-9" y="${-RR+4}" width="18" height="${2*RR-8}" rx="8" fill="#2c2f31" stroke="#0b0c0d"/><path d="M0 ${-RR+8} l-5 9 h10z" fill="${yel?'#f2b51c':'#e8e8e2'}"/></g>`;
  s+=`<path d="M${CX-RR-30} ${CY+RR+18} l9 -7 v14 z" fill="#c9cdc6"/><rect x="${CX-RR-40}" y="${CY+RR+5}" width="26" height="26" fill="transparent" data-k="${PFX}:SW-" style="cursor:pointer"/>`;
  s+=`<path d="M${CX+RR+30} ${CY+RR+18} l-9 -7 v14 z" fill="#c9cdc6"/><rect x="${CX+RR+14}" y="${CY+RR+5}" width="26" height="26" fill="transparent" data-k="${PFX}:SW+" style="cursor:pointer"/>`;
  // jacks
  JX.forEach(q=>{const red=q.col==='red';s+=`<circle cx="${q.x}" cy="${q.y}" r="13" fill="${red?'#b52a22':'#1d1f20'}" stroke="#0b0c0d" stroke-width="2"/><circle cx="${q.x}" cy="${q.y}" r="5.5" fill="#0b0c0d"/>`+
    T(q.x,q.y-20,q.lab,{size:q.lab.length>6?6.8:8.5,fill:red?'#ff8f80':'#e8e8e2',a:'middle',w:700})+(q.sub?T(q.x,q.y+25,q.sub,{size:6,fill:'#c9cdc6',a:'middle'}):'')+
    (q.fuse!=null&&!d.fuse[q.j]?`<g data-k="${PFX}:FUSE${q.j}" style="cursor:pointer"><rect x="${q.x-24}" y="${q.y+28}" width="48" height="14" rx="7" fill="#fff4e8" stroke="#c0392b"/>`+T(q.x,q.y+38.5,'🔧 fuse',{size:8,fill:'#8a1c10',a:'middle',w:700})+'</g>':'')});
  return s}
function keyFn(k){const d=RT.S[KEY];const n=D0.pos.length;
  if(k==='SW+'||k==='SW-'){const p=clamp(d.pos+(k==='SW+'?1:-1),0,n-1);if(p!==d.pos){d.pos=p;d.rng=null;d.hold=null;d.mm=null;d.mmv=null;sync(d);RT.dirty=true}return}
  const fm=k.match(/^FUSE(\w+)$/);if(fm){d.fuse[fm[1]]=true;RT.dirty=true;BENCH.say('ركّبت فيوز جديد');return}
  if(!d.pwr)return;
  if(k==='HOLD'){d.hold=d.hold?null:display();return}
  if(k==='RANGE'){const F=fnOf();const list=F.fn==='OHM'?D0.R:F.fn==='ACV'?D0.AV:F.fn==='DCV'?(F.mv?D0.MV:D0.V):F.fn==='DCI'||F.fn==='ACI'?(curJack()==='a'?D0.IA:D0.IMA):null;
    if(!list||list.length<2)return;const cur=d.rng!=null?d.rng:Math.max(0,list.indexOf(RD.fs));d.rng=d.rng!=null&&d.rng>=list.length-1?null:(cur+1)%list.length;RT.dirty=true;return}
  if(k==='MM'){d.mm=d.mm==null?'MAX':d.mm==='MAX'?'MIN':null;d.mmv=null;return}
  if(k==='AC'){d.ac=!d.ac;sync(d);RT.dirty=true}}
const LEADS=JX.map(q=>({k:LK(q.j),label:()=>`${q.lab} M${N}`,from:{x:q.x,y:q.y},banana:true,circuit:q.sh!==undefined||q.j==='v',pol:q.col==='black'?'-':'+',tray:`M${N} ${q.lab}`,jn:`M${N} ${q.lab}`}));
const RJ=()=>{const d=RT.S&&RT.S[KEY];return d&&d.jack==='A'?LK(curJack()):LK('v')};
return {key:KEY,prefix:PFX,size:[W,H],name:[D0.name+(opt.n?' · M'+N:''),MODEL==='goldstar'?'الملتيميتر الأصفر (GoldStar)':'ملتيميتر يدوي'],fresh,svg,keyFn,measure,
  wheel:['SW'],knobInfo:()=>{const d=RT.S[KEY];return D0.pos[d.pos][1]},
  leads:LEADS,
  get leadKeys(){return [RJ(),LK('c')]},
  /* V jack: 10 MΩ (Ω / ▶| test source in its own solve); current jacks: their shunt to COM (fuse intact) */
  stamp(ck,force,opts){const d=RT.S[KEY],L=RT.S.leads;const c=L[LK('c')];if(!c||c.node==null)return;const b=ck.idx(c.node);
    D0.jacks.forEach(q=>{if(q.j==='c')return;const l=L[LK(q.j)];if(!l||l.node==null)return;const a=ck.idx(l.node);
      const sh=shunt(q.j);if(sh!=null){ck.els.push({t:'G',a,b,g:1/sh});return}
      if(q.j!=='v')return;
      if(opts&&opts.meter&&opts.meter.key===KEY){ck.meter={a,b};ck.els.push({t:'CCS',a,b,i0:opts.meter.i0,vmax:opts.meter.vmax});return}
      if(d.pwr)ck.els.push({t:'G',a,b,g:1e-7})})},
  reading:()=>{const d=RT.S[KEY];return {...RD,fn:d.fn,cur:d.jack==='A'?RD.val:null,shown:display()}},
  model:MODEL,D0,display};
};
ENGINE.hdmm.size=[250,400];
