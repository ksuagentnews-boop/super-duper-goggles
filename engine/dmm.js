/* MCP MT3805 bench digital multimeter (True RMS, 5½ digits, 220 000 counts).
   Keys: ·))) ▶| Hz ⊣⊢ Ω ACV DCV ACI DCI · RANGE+ / AUTO (EXIT) / RANGE− · HOLD RCL STO MAX MIN REL Δ AC+DC SET RST.
   Jacks: Ω 4-wire SENSE (HI/LO), V·Ω·▶|·Hz (HI), COM (LO), A (10 A fused). The red lead sits in HI or in A.
   Readings come from the circuit solver: V modes load the circuit with 10 MΩ; Ω / ▶| / ·))) inject a test current
   (▶| = 1 mA, 2.8 V open-circuit, 0–2 V range: an open or reverse-biased junction reads OVL.D as on the lab meter); A is a 10 mΩ shunt.
   State in S.dmm. Leads: mh (red, HI or A jack), ml (black, COM). */
ENGINE.dmm=function(RT,opt){
const M0=opt.at,W=480,H=232;
const J={HI:{x:440,y:64},A:{x:440,y:168},COM:{x:440,y:116},SH:{x:392,y:64},SL:{x:392,y:116}};
const abs=p=>({x:M0.x+p.x,y:M0.y+p.y});
const RANGES={
  DCV:[[0.2,'200mV',1e3,'mV'],[2,'2V',1,'V'],[20,'20V',1,'V'],[200,'200V',1,'V'],[1000,'1000V',1,'V']],
  ACV:[[0.2,'200mV',1e3,'mV'],[2,'2V',1,'V'],[20,'20V',1,'V'],[200,'200V',1,'V'],[750,'750V',1,'V']],
  DCI:[[0.02,'20mA',1e3,'mA'],[0.2,'200mA',1e3,'mA'],[2,'2A',1,'A'],[10,'10A',1,'A']],
  ACI:[[0.02,'20mA',1e3,'mA'],[0.2,'200mA',1e3,'mA'],[2,'2A',1,'A'],[10,'10A',1,'A']],
  OHM:[[200,'200Ω',1,'Ω',1e-3],[2e3,'2kΩ',1e-3,'kΩ',1e-3],[2e4,'20kΩ',1e-3,'kΩ',1e-4],[2e5,'200kΩ',1e-3,'kΩ',1e-5],[2e6,'2MΩ',1e-6,'MΩ',1e-6],[2e7,'20MΩ',1e-6,'MΩ',1e-7]],
  CONT:[[200,'200Ω',1,'Ω',1e-3]],
  DIODE:[[2,'2V',1,'V']],
  HZ:[[2e5,'Auto',1,'Hz']],
  CAP:[[2e-9,'2nF',1e9,'nF'],[2e-8,'20nF',1e9,'nF'],[2e-7,'200nF',1e9,'nF'],[2e-6,'2µF',1e6,'µF'],[2e-5,'20µF',1e6,'µF'],[2e-4,'200µF',1e6,'µF'],[2e-3,'2mF',1e3,'mF']]};
const FNAME={DCV:'DCV',ACV:'ACV',DCI:'DCI',ACI:'ACI',OHM:'OHM',CONT:'CONT',DIODE:'DIODE',HZ:'FREQ',CAP:'CAP'};
function fresh(){const d={pwr:false,fn:'DCV',auto:true,rng:1,jack:'HI',hold:null,rel:null,mm:null,mmv:null,acdc:false,sto:null,rcl:false,fuse:true,msg:''};if(opt.prev)opt.prev(d);return d}
let RD={val:null,ol:false,rng:1,beep:false};          // last computed reading (not part of the saved state)

/* ---------- reading ---------- */
const meanOf=a=>a.reduce((x,y)=>x+y,0)/a.length;
const acRms=a=>{const m=meanOf(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/a.length)};
const totRms=a=>Math.sqrt(a.reduce((x,y)=>x+y*y,0)/a.length);
function nets(ck){const L=RT.S.leads,d=RT.S.dmm;const h=L.mh,l=L.ml;if(h.node==null||l.node==null)return null;return {hi:ck.idx(h.node),lo:ck.idx(l.node)}}
/* test-source measurement (Ω, ▶|, ·)))): separate dc solve with the meter source in the circuit */
function testSolve(i0,vmax){const ck=RT.buildUser(false,{meter:{i0,vmax}});if(!ck.meter)return null;const r=SOLVER.point(ck,0,null);const V=i=>i<0?0:r.x[i];
  const v=V(ck.meter.a)-V(ck.meter.b);const [i]=SOLVER.ccs({i0,vmax},v);return {v,i}}
function compute(){const d=RT.S.dmm;RD={val:null,ol:false,rng:d.rng,beep:false};if(!d.pwr)return;
  const fn=d.fn,R=RANGES[fn];
  const pickR=v=>{if(!d.auto)return clamp(d.rng,0,R.length-1);let i=R.findIndex(r=>Math.abs(v)<=r[0]*1.1);return i<0?R.length-1:i};
  if(fn==='OHM'||fn==='CONT'||fn==='DIODE'){
    if(d.jack!=='HI'){RD.ol=true;RD.rng=d.auto?(fn==='OHM'?R.length-1:0):d.rng;return}
    if(fn==='DIODE'){const t=testSolve(1e-3,2.8);RD.rng=0;if(!t||t.v>=2.2){RD.ol=true;return}RD.val=t.v;return}
    const list=fn==='CONT'?[0]:d.auto?R.map((_,i)=>i):[clamp(d.rng,0,R.length-1)];
    for(const ri of list){const t=testSolve(R[ri][4],3.0);RD.rng=ri;if(!t)break;const rr=t.i>1e-15?t.v/t.i:Infinity;
      if(t.v<2.9&&Math.abs(rr)<=R[ri][0]*1.1){RD.val=rr;if(fn==='CONT')RD.beep=rr<30;return}}
    RD.ol=true;return}
  if(fn==='CAP'){if(d.jack!=='HI'){RD.ol=true;return}const ck=RT.buildUser(false);const n=nets(ck);if(!n){RD.val=0;RD.rng=0;return}
    let c=0,other=false;ck.els.forEach(e=>{const on=(e.a===n.hi&&e.b===n.lo)||(e.a===n.lo&&e.b===n.hi);if(e.t==='C'&&on)c+=e.c;else if(on)other=true});
    if(other){RD.ol=true;return}RD.val=c;RD.rng=pickR(c);if(c>R[R.length-1][0]*1.1)RD.ol=true;return}
  const TB=RT.TB;if(!TB||!TB.ck)return;const ck=TB.ck;const n=nets(ck);
  if(fn==='DCI'||fn==='ACI'){if(d.jack!=='A'||!n||!d.fuse){RD.val=0;RD.rng=pickR(0);return}
    const vs=RT.samples(n.hi),vl=RT.samples(n.lo);const I=vs.map((v,k)=>(v-vl[k])/0.01);
    const val=fn==='DCI'?meanOf(I):(d.acdc?totRms(I):acRms(I));RD.rng=pickR(val);RD.val=val;
    if(Math.max(...I.map(Math.abs))>10.5){d.fuse=false;d.msg='FUSE'}
    if(Math.abs(val)>R[RD.rng][0]*1.1){RD.ol=true}return}
  if(d.jack!=='HI'||!n){RD.val=0;RD.rng=pickR(0);return}
  const vs=RT.samples(n.hi),vl=RT.samples(n.lo);const V=vs.map((v,k)=>v-vl[k]);
  if(fn==='HZ'){const f=RT.sigF();RD.rng=0;RD.val=acRms(V)>0.01&&f>0?f:0;return}
  const val=fn==='DCV'?meanOf(V):(d.acdc?totRms(V):acRms(V));RD.rng=pickR(val);RD.val=val;if(Math.abs(val)>R[RD.rng][0]*1.1)RD.ol=true}
function fmt(val,r){const fs=r[0]*r[2];const n=val*r[2];const id=Math.floor(Math.log10(fs)+1e-9)+1;const dec=Math.max(0,6-id);
  const a=Math.abs(n).toFixed(dec);const [ip,fp]=a.split('.');return (n<0?'-':' ')+ip.padStart(id,'0')+(fp!=null?'.'+fp:'')}
function display(){const d=RT.S.dmm;const R=RANGES[d.fn];const r=R[clamp(RD.rng,0,R.length-1)];
  if(d.rcl&&d.sto)return {main:d.sto.main,unit:d.sto.unit,r};
  if(d.hold)return d.hold;
  if(RD.ol||RD.val==null&&d.fn!=='HZ')return RD.ol?{main:d.fn==='DIODE'?'OVL.D':'OVL',unit:'',r}:{main:fmt(0,r),unit:r[3],r};
  let v=RD.val;if(d.mm!=null&&d.mmv!=null)v=d.mmv;if(d.rel!=null)v-=d.rel;
  return {main:fmt(v,r),unit:r[3],r}}

/* ---------- drawing ---------- */
function svg(){const d=RT.S.dmm;let s=`<g transform="translate(${M0.x} ${M0.y})">`;
  s+=`<rect x="-10" y="6" width="20" height="${H-12}" rx="8" fill="#1f6fc0"/><rect x="${W-10}" y="6" width="20" height="${H-12}" rx="8" fill="#1f6fc0"/>`;
  s+=`<rect width="${W}" height="${H}" rx="14" fill="#30363a" stroke="#1d2124" stroke-width="2"/>`;
  s+=T(18,22,'MCP',{size:12,fill:'#e9eef0',w:700})+T(52,22,'MT3805',{size:10,fill:'#c9d3d8',w:600});
  // LCD
  s+=`<rect x="16" y="30" width="300" height="94" rx="4" fill="${d.pwr?'#a7cfe2':'#5d6b70'}" stroke="#1d2124" stroke-width="2"/>`;
  if(d.pwr){const D=display();const ink='#14323f';
    const top=[FNAME[d.fn]+(d.fn==='ACV'||d.fn==='ACI'?(d.acdc?' AC+DC':''):''),d.auto?'AUTO':'MAN',D.r[1],'Normal','RS232'];
    s+=T(24,46,top[0],{size:11,fill:ink})+`<rect x="88" y="35" width="42" height="15" fill="${d.auto?ink:'none'}" stroke="${ink}"/>`+T(109,46,top[1],{size:10,fill:d.auto?'#a7cfe2':ink,a:'middle'})+
      T(170,46,top[2],{size:10,fill:ink,a:'middle'})+T(250,46,top[3],{size:10,fill:ink,a:'middle'})+T(306,46,top[4],{size:9,fill:ink,a:'end'});
    s+=`<text x="232" y="94" font-size="31" fill="${ink}" text-anchor="end" font-weight="600" pointer-events="none" style="white-space:pre">${D.main}</text>`+T(240,94,D.unit,{size:20,fill:ink,w:600});
    const now=new Date(),p2=x=>String(x).padStart(2,'0');
    s+=T(24,117,`${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())} ${p2(now.getMonth()+1)}-${p2(now.getDate())}-${now.getFullYear()}`,{size:9.5,fill:ink});
    const flags=[d.hold&&'HOLD',d.rel!=null&&'REL',d.mm&&d.mm,d.rcl&&'RCL',RD.beep&&'·)))',!d.fuse&&'FUSE'].filter(Boolean).join(' ');
    if(flags)s+=`<rect x="${306-flags.length*6.4-6}" y="104" width="${flags.length*6.4+6}" height="15" fill="${ink}"/>`+T(303,115,flags,{size:9.5,fill:'#a7cfe2',a:'end',w:600});
    if(d.msg)s+=`<rect x="90" y="56" width="150" height="22" rx="3" fill="#14323f"/>`+T(165,71,d.msg,{size:10,fill:'#a7cfe2',a:'middle',w:600})}
  s+=T(312,136,'True RMS Multimeter',{size:7.5,fill:'#c9d3d8',a:'end'});
  // range keys
  s+=T(32,140,'RANGE+',{size:6.5,fill:'#c9d3d8',a:'middle'})+key(20,144,24,20,'m:RUP','△')+key(20,170,24,20,'m:AUTO','AUTO',{size:6.5})+key(20,196,24,20,'m:RDN','▽')+T(32,226,'RANGE−',{size:6.5,fill:'#c9d3d8',a:'middle'});
  // function keys
  [['CONT','·)))'],['DIODE','▶|'],['HZ','Hz'],['CAP','⊣⊢'],['OHM','Ω'],['ACV','ACV'],['DCV','DCV'],['ACI','ACI'],['DCI','DCI']].forEach(([k,l],i)=>{const cx=70+i*28;const on=d.pwr&&d.fn===k;
    s+=`<circle cx="${cx}" cy="156" r="11" fill="${on?'#4c5a61':'#22282b'}" stroke="${on?'#a7cfe2':'#11161a'}" stroke-width="1.5" data-k="m:${k}" style="cursor:pointer"/>`+T(cx,159.5,l,{size:l.length>2?6.8:8.5,fill:'#e9eef0',a:'middle',w:600})});
  s+=T(62,180,'EXIT',{size:6.5,fill:'#c9d3d8'});
  [['HOLD','HOLD','#7aa7d6'],['RCL','RCL'],['STO','STO'],['MAXMIN','MAX MIN'],['REL','REL Δ'],['ACDC','AC+DC','#f2a634'],['SET','SET'],['RST','RST']].forEach(([k,l,c],i)=>{const x=56+i*32+(i>=5?14:0);
    s+=key(x,196,28,15,'m:'+k,l,{fill:c||'#22282b',size:6,ink:c?'#1d2124':'#e9eef0'})});
  s+=`<circle cx="${56+5*32+4}" cy="204" r="2.5" fill="#11161a"/>`+T(56+5*32+4,222,'CAL',{size:6,fill:'#c9d3d8',a:'middle'});
  // jacks
  s+=`<rect x="360" y="30" width="108" height="190" rx="8" fill="#262b2e"/>`;
  s+=T(392,44,'Ω 4 WIRE',{size:6,fill:'#c9d3d8',a:'middle'})+T(392,51,'SENSE',{size:6,fill:'#c9d3d8',a:'middle'})+T(440,44,'V·)))Ω',{size:6.5,fill:'#c9d3d8',a:'middle'})+T(440,51,'▶| ⊣⊢ Hz',{size:6,fill:'#c9d3d8',a:'middle'});
  const jack=(p,col,k,lab)=>`<circle cx="${p.x}" cy="${p.y}" r="12" fill="${col}" stroke="#111" stroke-width="2" ${k?`data-k="${k}" style="cursor:pointer"`:''}/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#111" pointer-events="none"/>`+(lab?T(p.x+(p.x<420?-17:17),p.y+3,lab,{size:7,fill:'#e9eef0',a:p.x<420?'end':'start'}):'');
  s+=jack(J.SH,'#b52a22','','HI')+jack(J.SL,'#222','','LO')+jack(J.HI,'#b52a22','m:JHI','HI')+jack(J.COM,'#222','','')+T(440,140,'COM',{size:7,fill:'#e9eef0',a:'middle'})+jack(J.A,'#b52a22','m:JA','A');
  s+=T(440,194,'MAX 10A',{size:6,fill:'#c9d3d8',a:'middle'})+T(440,201,'FUSED',{size:6,fill:'#c9d3d8',a:'middle'});
  // power (rear switch, drawn on the side)
  s+=`<rect x="372" y="186" width="34" height="26" rx="4" fill="${d.pwr?'#3a8f55':'#555c60'}" stroke="#11161a" data-k="m:PWR" style="cursor:pointer"/>`+T(389,203,d.pwr?'ON':'OFF',{size:8,fill:'#fff',a:'middle',w:600})+T(389,183,'POWER',{size:6,fill:'#c9d3d8',a:'middle'});
  return s+'</g>'}
function key(x,y,w,h,k,l,o={}){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${o.fill||'#22282b'}" stroke="#11161a" data-k="${k}" style="cursor:pointer"/>`+T(x+w/2,y+h/2+3,l,{size:o.size||8,fill:o.ink||'#e9eef0',a:'middle',w:600})}

let msgT=null;function flash(m){const d=RT.S.dmm;d.msg=m;clearTimeout(msgT);msgT=setTimeout(()=>{RT.S.dmm.msg='';RT.render()},1200)}
function keyFn(k){const d=RT.S.dmm;
  if(k==='PWR'){const on=!d.pwr;Object.assign(d,{pwr:on,hold:null,rel:null,mm:null,mmv:null,rcl:false});if(on){d.fn='DCV';d.auto=true}RT.dirty=true;return}
  if(k==='JHI'||k==='JA'){const want=k==='JHI'?'HI':'A';if(d.jack!==want){d.jack=want;RT.dirty=true}return}
  if(!d.pwr)return;
  if(RANGES[k]){d.fn=k;d.auto=true;d.rng=0;d.hold=null;d.rel=null;d.mm=null;d.mmv=null;d.rcl=false;RT.dirty=true;return}
  const R=RANGES[d.fn];
  switch(k){
    case 'RUP':case 'RDN':{if(R.length<2)return;const cur=d.auto?RD.rng:d.rng;d.auto=false;d.rng=clamp(cur+(k==='RUP'?1:-1),0,R.length-1);RT.dirty=true;return}
    case 'AUTO':if(d.rcl){d.rcl=false;return}d.auto=true;RT.dirty=true;return;
    case 'HOLD':d.hold=d.hold?null:display();return;
    case 'REL':d.rel=d.rel!=null?null:(RD.ol||RD.val==null?null:RD.val);return;
    case 'MAXMIN':d.mm=d.mm==null?'MAX':d.mm==='MAX'?'MIN':null;d.mmv=d.mm?RD.val:null;return;
    case 'STO':{const D=display();d.sto={main:D.main,unit:D.unit};flash('STORED');return}
    case 'RCL':if(!d.sto){flash('NO DATA');return}d.rcl=!d.rcl;return;
    case 'ACDC':if(d.fn==='ACV'||d.fn==='ACI'){d.acdc=!d.acdc;RT.dirty=true}return;
    case 'SET':flash('SET: not used here');return;
    case 'RST':Object.assign(d,{fn:'DCV',auto:true,rng:1,hold:null,rel:null,mm:null,mmv:null,rcl:false,acdc:false});RT.dirty=true;return}}
function measure(){compute();const d=RT.S.dmm;if(d.mm&&RD.val!=null){d.mmv=d.mmv==null?RD.val:d.mm==='MAX'?Math.max(d.mmv,RD.val):Math.min(d.mmv,RD.val)}}
const redFrom=()=>abs(RT.S&&RT.S.dmm.jack==='A'?J.A:J.HI);
return {key:'dmm',prefix:'m',size:[W,H],fresh,svg,keyFn,measure,
  leads:[{k:'mh',label:()=>RT.S&&RT.S.dmm.jack==='A'?'A':'HI',from:redFrom,banana:true,pol:'+'},{k:'ml',label:'COM',from:abs(J.COM),banana:true,pol:'-'}],
  cables:D=>D.banana(redFrom(),'mh')+D.banana(abs(J.COM),'ml'),
  /* V modes: 10 MΩ input; A jack: 10 mΩ shunt; Ω / ▶| test source only in its own solve (opts.meter) */
  stamp(ck,force,opts){const d=RT.S.dmm,L=RT.S.leads;if(L.mh.node==null||L.ml.node==null)return;const a=ck.idx(L.mh.node),b=ck.idx(L.ml.node);
    if(d.jack==='A'){if(d.fuse)ck.els.push({t:'G',a,b,g:100});return}
    if(opts&&opts.meter){ck.meter={a,b};ck.els.push({t:'CCS',a,b,i0:opts.meter.i0,vmax:opts.meter.vmax});return}
    if(d.pwr&&['DCV','ACV','HZ'].includes(d.fn))ck.els.push({t:'G',a,b,g:1e-7})},
  reading:()=>({...RD,fn:RT.S.dmm.fn,shown:RT.S.dmm.pwr?display():null})};
};
ENGINE.dmm.size=[480,232];
