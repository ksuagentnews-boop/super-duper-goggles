/* GW Instek GDS-1104B oscilloscope (approved prototype behaviour).
   RT supplies: S (state, scope state in S.sc), chanSig(c), sigF(), dirty, recompute(), render().
   opt: {at:{x,y}, prev(sc)} — position on the bench and the previous group's leftover settings. */
ENGINE.scope=function(RT,opt){
const C0=opt.at;
const SC_BNC=[{x:C0.x+410,y:C0.y+352},{x:C0.x+470,y:C0.y+352}];
const GX=22,GY=48,GW=300,GH=200,DX=30,DY=25;
const VI_LIST=['Pk-Pk','Max','Min','Amplitude','High','Low','Mean','Cycle Mean','RMS','Cycle RMS','Area','Cycle Area','ROVShoot','FOVShoot','RPREShoot','FPREShoot'];
const TIME_LIST=['Frequency','Period','RiseTime','FallTime','+Width','-Width','Duty Cycle','+Pulses','-Pulses','+Edges','-Edges'];
const DELAY_LIST=['Phase','FRR','FRF','FFR','FFF','LRR','LRF','LFR','LFF'];
const SRC_LIST=['CH1','CH2','CH3','CH4','Math','Ref1'];
function chNew(on){return {on,vd:2,pos:0,cpl:'DC',inv:false,probe:1,bw:'Full',exp:'Ground'}}
function scNew(){return {pwr:false,ch:[chNew(true),chNew(false)],td:5e-5,hpos:0,xy:false,menu:null,side:null,list:null,msrc:0,msrc2:1,meas:[],run:true,frozen:null,msg:'',
  trig:{src:0,slope:'+',mode:'Auto',level:0,cpl:'DC'},cur:{mode:null,sel:0,h:[-2,2],v:[1,-1],src:0},disp:{vec:true,grat:'Full',pers:false},acq:'Sample',rec:'10k'}}
function dsig(c){const b=RT.chanSig(c),ch=RT.S.sc.ch[c];const k=(ch.inv?-1:1)*ch.probe;return {fn:ph=>k*b.fn(ph),max:k>0?k*b.max:k*b.min,min:k>0?k*b.min:k*b.max,has:b.has}}
function chVDS(c){return VDS.map(v=>+(v*RT.S.sc.ch[c].probe).toPrecision(3))}
function trigPhase(sg){const t=RT.S.sc.trig,s=sg[t.src];if(!s.has)return null;const L=t.level;let prev=s.fn(-2*Math.PI/1440);
  for(let i=0;i<=1440;i++){const ph=2*Math.PI*i/1440,v=s.fn(ph);if(t.slope==='+'?(prev<L&&v>=L):(prev>L&&v<=L))return ph;prev=v}return null}
function measure(m,sg){const c=m.src;if(c>1)return '?';const s=sg[c],f=RT.sigF(),sc=RT.S.sc;const N=720;const per=[];for(let i=0;i<N;i++)per.push(s.fn(2*Math.PI*i/N));
  const win=[];const ph0=0;for(let i=0;i<N;i++){const t=-5*sc.td+10*sc.td*i/N;win.push(s.fn(ph0+2*Math.PI*f*t))}
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,rms=a=>Math.sqrt(a.reduce((x,y)=>x+y*y,0)/a.length);
  const mx=Math.max(...per),mn=Math.min(...per),T=f>0?1/f:NaN,has=s.has&&(mx-mn)>0.02;
  const lvl=p=>mn+(mx-mn)*p;
  const cross=(L,up,start=0)=>{for(let k=1;k<=2*N;k++){const i=(start+k)%N,j=(start+k-1)%N;if(up?(per[j]<L&&per[i]>=L):(per[j]>L&&per[i]<=L))return start+k}return null};
  switch(m.type){
    case 'Max':case 'High':return fmtV(mx);case 'Min':case 'Low':return fmtV(mn);case 'Pk-Pk':case 'Amplitude':return fmtV(mx-mn);
    case 'Mean':return fmtV(mean(win));case 'Cycle Mean':return fmtV(mean(per));case 'RMS':return fmtV(rms(win));case 'Cycle RMS':return fmtV(rms(per));
    case 'Area':return (mean(win)*10*sc.td*1e3).toFixed(3)+'mVs';case 'Cycle Area':return has?(mean(per)*T*1e3).toFixed(3)+'mVs':'?';
    case 'ROVShoot':case 'FOVShoot':case 'RPREShoot':case 'FPREShoot':return has?'0.00%':'?';
    case 'Frequency':return has?f.toFixed(3)+'Hz':'?';case 'Period':return has?fmtTime(T):'?';
    case 'RiseTime':case 'FallTime':{if(!has)return '?';const up=m.type==='RiseTime';const a=cross(lvl(up?0.1:0.9),up),b=a==null?null:cross(lvl(up?0.9:0.1),up,a%N);return a==null||b==null?'?':fmtTime((b-a)/N*T)}
    case '+Width':case '-Width':case 'Duty Cycle':{if(!has)return '?';const mid=lvl(0.5);const hi=per.filter(v=>v>=mid).length/N;if(m.type==='Duty Cycle')return (hi*100).toFixed(2)+'%';return fmtTime((m.type==='+Width'?hi:1-hi)*T)}
    case '+Pulses':case '-Pulses':case '+Edges':case '-Edges':return has?String(Math.round(10*sc.td*f)):'?';
    case 'Phase':{const c2=m.src2;if(c2>1)return '?';const s2=sg[c2];const ph=sx=>{let re=0,im=0;for(let i=0;i<N;i++){const v=sx.fn(2*Math.PI*i/N);re+=v*Math.cos(2*Math.PI*i/N);im+=v*Math.sin(2*Math.PI*i/N)}return Math.atan2(re,im)};if(!has||!s2.has)return '?';let d=(ph(s2)-ph(s))*180/Math.PI;while(d>180)d-=360;while(d<-180)d+=360;return d.toFixed(2)+'°'}
    default:return '?'}}
function listItems(){const sc=RT.S.sc,l=sc.list;if(!l)return [];
  if(l.kind==='vi')return VI_LIST;if(l.kind==='time')return TIME_LIST;if(l.kind==='delay')return DELAY_LIST;if(l.kind==='src1'||l.kind==='src2')return SRC_LIST;
  if(l.kind==='rem')return sc.meas.map(m=>`CH${m.src+1} ${m.type}`);return []}
function listTitle(k){return {vi:'V/I Measurements',time:'Time Measurements',delay:'Delay Measurements',src1:'Source1',src2:'Source2',rem:'Remove Measurement'}[k]}
function menuLabels(){const sc=RT.S.sc;let b=null,sd=null;
  if(sc.menu==='ch1'||sc.menu==='ch2'){const c=sc.ch[sc.menu==='ch1'?0:1];b=['Coupling\n'+c.cpl,'Invert\n'+(c.inv?'ON':'OFF'),'Bandwidth\n'+c.bw,'Expand\nBy '+c.exp,'Probe\n'+c.probe+'X Voltage']}
  else if(sc.menu==='measure'){b=['Add\nMeasurement','Remove\nMeasurement','Gating\nScreen','Display\nAll OFF','High-Low\nAuto'];
    if(sc.side==='add')sd=['V/I','Time','Delay','Source1\n'+SRC_LIST[sc.msrc],'Source2\n'+SRC_LIST[sc.msrc2]];if(sc.side==='rem')sd=['Select\nMeasurement','Remove\nAll','','','']}
  else if(sc.menu==='acquire'){b=['Mode\n'+sc.acq,'XY\n'+(sc.xy?'Triggered XY':'OFF (YT)'),'Record\nLength '+sc.rec,'',''];if(sc.side==='xy')sd=['OFF (YT)','Triggered\nXY','','','']}
  else if(sc.menu==='display'){b=['Display\n'+(sc.disp.vec?'Vector':'Dot'),'Persistence\n'+(sc.disp.pers?'ON':'OFF'),'Intensity\n50%','Graticule\n'+sc.disp.grat,'']}
  else if(sc.menu==='cursor'){const u=sc.cur;b=['H Cursor\n'+(u.mode==='H'?'ON':'OFF'),'V Cursor\n'+(u.mode==='V'?'ON':'OFF'),'Source\nCH'+(u.src+1),'Select\n'+['①','②','①②'][u.sel],'']}
  else if(sc.menu==='trig'){const t=sc.trig;b=['Type\nEdge','Source\nCH'+(t.src+1),'Slope\n'+(t.slope==='+'?'↑ Rising':'↓ Falling'),'Mode\n'+t.mode,'Coupling\n'+t.cpl]}
  else if(sc.menu==='utility'){b=['Language\nEnglish','System\nInfo','Hardcopy\nMenu','Probe\nComp.','']}
  return {b,sd}}
function screenInner(){const sc=RT.S.sc;let s=`<rect x="12" y="26" width="336" height="286" fill="#05090b"/>`;if(!sc.pwr)return s;
  const sg=[dsig(0),dsig(1)];const f=RT.sigF();const cy=GY+GH/2,cx=GX+GW/2;
  let ph0=0,trig='Trig\'d';if(!sc.xy){const tp=trigPhase(sg);if(tp==null){trig=sc.trig.mode==='Auto'?'Auto':'Trig?';ph0=(performance.now()/97)%(2*Math.PI)}else ph0=tp}
  s+=T(18,40,'GW INSTEK',{size:9,fill:'#7ea1ab'})+T(180,40,sc.xy?'':trig,{size:9,fill:trig==='Trig\'d'?'#7dff9a':'#ffb347',a:'middle'})+T(342,40,(sc.run?'Run':'Stop')+(sc.xy?' · XY':''),{size:9,fill:sc.run?'#7dff9a':'#ff6b5b',a:'end'});
  const g=sc.disp.grat;
  if(g==='Full'||g==='Grid'){for(let i=0;i<=10;i++)s+=`<line x1="${GX+i*DX}" y1="${GY}" x2="${GX+i*DX}" y2="${GY+GH}" stroke="${i===5&&g==='Full'?'#3b4c53':'#1b272c'}" stroke-dasharray="2 3"/>`;for(let j=0;j<=8;j++)s+=`<line x1="${GX}" y1="${GY+j*DY}" x2="${GX+GW}" y2="${GY+j*DY}" stroke="${j===4&&g==='Full'?'#3b4c53':'#1b272c'}" stroke-dasharray="2 3"/>`}
  if(g==='Cross'){s+=`<line x1="${cx}" y1="${GY}" x2="${cx}" y2="${GY+GH}" stroke="#3b4c53" stroke-dasharray="2 3"/><line x1="${GX}" y1="${cy}" x2="${GX+GW}" y2="${cy}" stroke="#3b4c53" stroke-dasharray="2 3"/>`}
  s+=`<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="none" stroke="#2a3a40"/>`;
  const draw=(pts,col)=>{if(sc.disp.vec){let d='';pts.forEach((p,i)=>{d+=(i?'L':'M')+p[0].toFixed(1)+' '+clamp(p[1],GY-30,GY+GH+30).toFixed(1)});return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.7" clip-path="url(#gridclip)"/>`}
    return `<g clip-path="url(#gridclip)" fill="${col}">`+pts.filter((p,i)=>i%2===0).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.1"/>`).join('')+`</g>`};
  if(!sc.xy){if(trig!=='Trig?'){const N=700;
    [0,1].forEach(c=>{const ch=sc.ch[c];if(!ch.on)return;const pts=[];for(let i=0;i<=N;i++){const u=i/N;const t=(u-0.5)*10*sc.td+sc.hpos;const v=sg[c].fn(ph0+2*Math.PI*f*t);pts.push([GX+u*GW,cy-(v/ch.vd+ch.pos)*DY])}s+=draw(pts,c?CH2:CH1)})}
    [0,1].forEach(c=>{const ch=sc.ch[c];if(!ch.on)return;const my=clamp(cy-ch.pos*DY,GY,GY+GH);s+=`<path d="M${GX-9} ${my-6} l8 6 l-8 6 z" fill="${c?CH2:CH1}"/>`+T(GX-7,my+3.5,c+1,{size:8,fill:'#000',w:600})});
    const tc=sc.ch[sc.trig.src];const ty=clamp(cy-(sc.trig.level/tc.vd+tc.pos)*DY,GY,GY+GH);s+=`<path d="M${GX+GW+9} ${ty-5} l-8 5 l8 5 z" fill="${sc.trig.src?CH2:CH1}"/>`;
    const tx0=clamp(cx-sc.hpos/sc.td*DX,GX,GX+GW);s+=`<path d="M${tx0-5} ${GY-7} l5 7 l5 -7 z" fill="#ff9f43"/>`;
  }else{const c1=sc.ch[0],c2=sc.ch[1];const pts=[];for(let i=0;i<=400;i++){const ph=2*Math.PI*i/400;pts.push([clamp(cx+(sg[0].fn(ph)/c1.vd+c1.pos)*DX,GX-30,GX+GW+30),cy-(sg[1].fn(ph)/c2.vd+c2.pos)*DY])}s+=draw(pts,CH2)}
  // cursors
  const u=sc.cur;if(u.mode){const ch=sc.ch[u.src];const col=u.src?CH2:CH1;let txt='';
    if(u.mode==='V'){u.v.forEach((d,i)=>{const y=cy-d*DY;s+=`<line x1="${GX}" y1="${y}" x2="${GX+GW}" y2="${y}" stroke="#ff9f43" stroke-dasharray="${u.sel===i||u.sel===2?'0':'4 3'}" stroke-width="1.2"/>`});const v=u.v.map(d=>(d-ch.pos)*ch.vd);txt=`V1 ${fmtV(v[0])}  V2 ${fmtV(v[1])}  Δ ${fmtV(v[0]-v[1])}`}
    else{u.h.forEach((d,i)=>{const x=cx+d*DX;s+=`<line x1="${x}" y1="${GY}" x2="${x}" y2="${GY+GH}" stroke="#ff9f43" stroke-dasharray="${u.sel===i||u.sel===2?'0':'4 3'}" stroke-width="1.2"/>`});const t=u.h.map(d=>d*sc.td+sc.hpos);txt=`T1 ${fmtTime(t[0])}  T2 ${fmtTime(t[1])}  Δ ${fmtTime(t[1]-t[0])}`}
    s+=`<rect x="${GX+4}" y="${GY+4}" width="230" height="16" rx="3" fill="#0d1b20" stroke="#ff9f43" stroke-width=".8"/>`+T(GX+10,GY+15,txt,{size:8.5,fill:'#ffcf99'})}
  let info='';sc.ch.forEach((ch,c)=>{if(ch.on)info+=`<tspan fill="${c?CH2:CH1}">${c?'②':'①'} ${fmtVd(ch.vd)} ${ch.cpl}${ch.probe>1?' x10':''}${ch.inv?' ⇅':''}</tspan>  `});
  s+=`<text x="18" y="259" font-size="9" fill="#d9e6e8" pointer-events="none">${info}<tspan fill="#d9e6e8">${sc.xy?'XY':fmtTd(sc.td)}</tspan>${!sc.xy?`<tspan fill="#ffb347">  ${sc.trig.slope==='+'?'↑':'↓'}CH${sc.trig.src+1} ${fmtV(sc.trig.level)}</tspan>`:''}${sg[0].has&&f>0?`<tspan fill="#9fb">  ${f.toFixed(2)}Hz</tspan>`:''}</text>`;
  sc.meas.forEach((m,k)=>{const col=m.src?CH2:CH1;s+=T(16+(k%4)*83,270+Math.floor(k/4)*11,`${m.src?'②':'①'}${m.type} ${measure(m,sg)}`,{size:7.8,fill:col,w:600})});
  const {b,sd}=menuLabels();
  if(b)b.forEach((l,i)=>{const x=16+i*66;if(!l)return;const [l1,l2]=l.split('\n');s+=`<rect x="${x}" y="284" width="62" height="26" rx="3" fill="#16303a" stroke="#2c5560"/>`+T(x+31,294,l1,{size:7.5,fill:'#9fd',a:'middle'})+(l2?T(x+31,306,l2,{size:7.6,fill:'#fff',a:'middle',w:600}):'')});
  if(sd)sd.forEach((l,i)=>{if(!l)return;const y=50+i*44;const [l1,l2]=l.split('\n');s+=`<rect x="278" y="${y}" width="68" height="36" rx="3" fill="#16303a" stroke="#2c5560"/>`+T(312,y+(l2?14:22),l1,{size:8.5,fill:'#fff',a:'middle',w:600})+(l2?T(312,y+28,l2,{size:8.5,fill:'#9fd',a:'middle'}):'')});
  if(sc.list){const it=listItems();const PS=7;const pg=Math.floor(sc.list.idx/PS),np=Math.max(1,Math.ceil(it.length/PS));
    s+=`<rect x="40" y="52" width="232" height="196" rx="4" fill="#0e2a31" stroke="#3fd3d8"/>`+T(50,67,listTitle(sc.list.kind),{size:9.5,fill:'#fff',w:600})+T(262,67,`${pg+1}/${np}`,{size:9,fill:'#9fd',a:'end'});
    it.slice(pg*PS,pg*PS+PS).forEach((x,i)=>{const k=pg*PS+i,y=76+i*22;const on=k===sc.list.idx;s+=`<rect x="46" y="${y}" width="220" height="19" rx="3" fill="${on?'#3fd3d8':'#13363e'}"/>`+T(54,y+13.5,x,{size:9.5,fill:on?'#05202a':'#d9f2f4',w:on?600:400})});
    if(!it.length)s+=T(156,120,'(empty)',{size:10,fill:'#9fd',a:'middle'});
    s+=T(156,244,'VARIABLE to move · Select to choose',{size:7.5,fill:'#9fd',a:'middle'})}
  if(sc.msg)s+=`<rect x="100" y="132" width="160" height="28" rx="5" fill="#1d3a40" stroke="${CH2}"/>`+T(180,150,sc.msg,{size:10,fill:'#fff',a:'middle',w:600});
  return s}
function sKnob(cx,cy,r,col,key,label,val,center){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#c9d1d5" stroke="${col}" stroke-width="3" ${center?`data-k="${key}c" style="cursor:pointer"`:''}/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r+3}" stroke="#55646a" stroke-width="2" pointer-events="none"/>`;
  s+=`<path d="M${cx-r-14} ${cy} l9 -7 v14 z" fill="#55646a"/><rect x="${cx-r-18}" y="${cy-11}" width="16" height="22" fill="transparent" data-k="${key}-" style="cursor:pointer"/>`;
  s+=`<path d="M${cx+r+14} ${cy} l-9 -7 v14 z" fill="#55646a"/><rect x="${cx+r+2}" y="${cy-11}" width="16" height="22" fill="transparent" data-k="${key}+" style="cursor:pointer"/>`;
  s+=T(cx,cy+r+11,label,{size:7.5,fill:'#3b4a50',a:'middle'});if(val)s+=T(cx,cy+r+21,val,{size:8.5,fill:'#1d2a2e',a:'middle',w:600});return s}
function scopeSVG(){const sc=RT.S.sc;let s=`<g transform="translate(${C0.x} ${C0.y})">`;
  s+=`<rect width="570" height="385" rx="14" fill="#dfe5e8" stroke="#9fb0b6" stroke-width="2"/>`+T(16,18,'GW INSTEK  GDS-1104B',{size:11,fill:'#3b4a50',w:600});
  s+=`<rect x="8" y="22" width="344" height="294" rx="5" fill="#0a0f12"/>`+(sc.run||!sc.frozen?screenInner():sc.frozen);
  for(let i=0;i<5;i++){const y=50+i*44;s+=`<rect x="355" y="${y+2}" width="12" height="32" rx="3" fill="#c7d0d4" stroke="#9fb0b6" data-k="s:S${i}" style="cursor:pointer"/>`}
  for(let i=0;i<5;i++){const x=16+i*66;s+=`<rect x="${x+4}" y="322" width="54" height="14" rx="3" fill="#c7d0d4" stroke="#9fb0b6" data-k="s:B${i}" style="cursor:pointer"/>`}
  s+=`<rect x="352" y="322" width="16" height="14" rx="3" fill="#8b979c" data-k="s:MOFF" style="cursor:pointer"/>`+T(360,346,'Menu Off',{size:6.5,fill:'#3b4a50',a:'middle'});
  const K=[['Measure','Cursor','Acquire'],['Display','Utility','Help'],['Autoset','Run/Stop','Default']];
  K.forEach((r,ri)=>r.forEach((k,ci)=>{const x=380+ci*60,y=24+ri*26;s+=`<rect x="${x}" y="${y}" width="54" height="20" rx="4" fill="${k==='Autoset'?'#f2b632':'#eef2f3'}" stroke="#9fb0b6" data-k="s:${k}" style="cursor:pointer"/>`+T(x+27,y+14,k,{size:8.8,a:'middle'})}));
  s+=sKnob(402,122,11,'#7d8c92','s:VAR','VARIABLE')+`<rect x="436" y="112" width="42" height="20" rx="4" fill="#eef2f3" stroke="#9fb0b6" data-k="s:SEL" style="cursor:pointer"/>`+T(457,126,'Select',{size:8.8,a:'middle'});
  s+=T(535,106,'TRIGGER',{size:7.5,fill:'#3b4a50',a:'middle'})+sKnob(535,124,11,'#ff9f43','s:LV','LEVEL','',true)+`<rect x="516" y="150" width="38" height="15" rx="3" fill="#eef2f3" stroke="#9fb0b6" data-k="s:TRIG" style="cursor:pointer"/>`+T(535,161,'Menu',{size:8,a:'middle'});
  s+=T(440,176,'VERTICAL',{size:7.5,fill:'#3b4a50',a:'middle'})+T(535,176,'HORIZONTAL',{size:7.5,fill:'#3b4a50',a:'middle'});
  s+=sKnob(410,196,12,'#d8a800','s:P1P','POSITION','',true)+sKnob(470,196,12,'#1ba9ae','s:P2P','POSITION','',true)+sKnob(535,196,12,'#7d8c92','s:HP','POSITION','',true);
  s+=sKnob(410,250,12,'#d8a800','s:V1','SCALE',sc.pwr?fmtVd(sc.ch[0].vd)+'/div':'')+sKnob(470,250,12,'#1ba9ae','s:V2','SCALE',sc.pwr?fmtVd(sc.ch[1].vd)+'/div':'')+sKnob(535,250,12,'#7d8c92','s:H','SCALE',sc.pwr?fmtTd(sc.td)+'/div':'');
  [[0,393],[1,453]].forEach(([c,x])=>{const on=sc.pwr&&sc.ch[c].on;s+=`<rect x="${x}" y="292" width="34" height="18" rx="3" fill="${on?(c?'#3fd3d8':'#f2c230'):'#eef2f3'}" stroke="#9fb0b6" data-k="s:CH${c+1}" style="cursor:pointer"/>`+T(x+17,305,'CH'+(c+1),{size:9,a:'middle',w:600})});
  SC_BNC.forEach((p,i)=>{const x=p.x-C0.x,y=p.y-C0.y;s+=`<circle cx="${x}" cy="${y}" r="12" fill="#2c3438" stroke="${i?'#1ba9ae':'#d8a800'}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4" fill="#c8a24a"/>`+T(x,y+26,'CH'+(i+1),{size:8.5,fill:'#3b4a50',a:'middle'})});
  s+=`<rect x="16" y="346" width="50" height="24" rx="5" fill="#2d3438" data-k="s:PWR" style="cursor:pointer"/>`+T(41,362,'POWER',{size:8.5,fill:'#e8eef0',a:'middle'})+`<circle cx="76" cy="358" r="4" fill="${sc.pwr?'#46e070':'#555'}"/>`;
  return s+'</g>'}
let msgTimer=null;function flash(m){RT.S.sc.msg=m;clearTimeout(msgTimer);msgTimer=setTimeout(()=>{RT.S.sc.msg='';RT.render()},1300)}
function step(arr,v,dir){let i=arr.findIndex(x=>Math.abs(x-v)/v<1e-6);if(i<0)i=arr.findIndex(x=>x>=v);if(i<0)i=arr.length-1;return arr[clamp(i+dir,0,arr.length-1)]}
function autoset(){if(RT.dirty)RT.recompute();const sc=RT.S.sc;const sg=[dsig(0),dsig(1)];if(!sg[0].has&&!sg[1].has){flash('No signal');return}
  [0,1].forEach(c=>{const ch=sc.ch[c];if(!ch.on||!sg[c].has)return;const pk=Math.max(Math.abs(sg[c].max),Math.abs(sg[c].min));ch.vd=chVDS(c).find(v=>pk/v<=3.3)||chVDS(c).slice(-1)[0];ch.pos=0});
  const f=RT.sigF();if(f>0)sc.td=TDS.find(t=>10*t>=2/f)||1;sc.hpos=0;const ts=sg[0].has?0:1;sc.trig.src=ts;sc.trig.slope='+';sc.trig.level=+((sg[ts].max+sg[ts].min)/2).toFixed(3);
  sc.xy=false;sc.menu=null;sc.side=null;sc.list=null;flash('Autoset')}
function listSelect(){const sc=RT.S.sc,l=sc.list,it=listItems();if(!l||!it.length)return;const v=it[l.idx];
  if(l.kind==='src1'||l.kind==='src2'){if(l.idx>1){flash(v+': no signal');return}if(l.kind==='src1')sc.msrc=l.idx;else sc.msrc2=l.idx;sc.list=null;return}
  if(l.kind==='rem'){sc.meas.splice(l.idx,1);if(!sc.meas.length)sc.list=null;else l.idx=Math.min(l.idx,sc.meas.length-1);return}
  if(!sc.meas.some(m=>m.src===sc.msrc&&m.type===v)){sc.meas.push({src:sc.msrc,src2:sc.msrc2,type:v});if(sc.meas.length>8)sc.meas.shift();flash('Added '+v)}}
function scKey(k){const sc=RT.S.sc;if(k==='PWR'){sc.pwr=!sc.pwr;sc.menu=null;sc.side=null;sc.list=null;return}if(!sc.pwr)return;
  const openMenu=m=>{sc.menu=m;sc.side=null;sc.list=null};
  const chm=c=>{const ch=sc.ch[c],name='ch'+(c+1);if(!ch.on){ch.on=true;openMenu(name)}else if(sc.menu===name){ch.on=false;sc.menu=null}else openMenu(name)};
  const kn=(key,dir)=>{
    if(key==='VAR'){if(sc.list){const n=listItems().length;if(n)sc.list.idx=(sc.list.idx+dir+n)%n}else if(sc.cur.mode){const u=sc.cur,arr=u.mode==='V'?u.v:u.h,lim=u.mode==='V'?4:5;[0,1].forEach(i=>{if(u.sel===i||u.sel===2)arr[i]=clamp(Math.round((arr[i]+dir*0.1)*10)/10,-lim,lim)})}return}
    if(key==='LV'){const tc=sc.ch[sc.trig.src];sc.trig.level=+(sc.trig.level+dir*tc.vd*0.2).toFixed(4);return}
    if(key==='P1P'||key==='P2P'){const c=+key[1]-1;sc.ch[c].pos=clamp(Math.round((sc.ch[c].pos+dir*0.2)*10)/10,-4,4);return}
    if(key==='V1'||key==='V2'){const c=+key[1]-1;sc.ch[c].vd=step(chVDS(c),sc.ch[c].vd,dir);return}
    if(key==='H'){sc.td=step(TDS,sc.td,dir);return}
    if(key==='HP'){sc.hpos=+(sc.hpos+dir*sc.td*0.5).toPrecision(6);return}};
  let m=k.match(/^(VAR|LV|P1P|P2P|V1|V2|H|HP)([+-])$/);if(m){kn(m[1],m[2]==='+'?1:-1);return}
  m=k.match(/^(LV|P1P|P2P|HP)c$/);if(m){if(m[1]==='LV'){const sg=dsig(sc.trig.src);sc.trig.level=+((sg.max+sg.min)/2).toFixed(3)}else if(m[1]==='HP')sc.hpos=0;else sc.ch[+m[1][1]-1].pos=0;return}
  switch(k){
    case 'CH1':chm(0);return;case 'CH2':chm(1);return;
    case 'Measure':openMenu('measure');return;case 'Acquire':openMenu('acquire');return;case 'Display':openMenu('display');return;case 'Cursor':openMenu('cursor');return;case 'Utility':openMenu('utility');return;case 'TRIG':openMenu('trig');return;
    case 'Help':flash('Help: press a key to see info');return;
    case 'MOFF':if(sc.list)sc.list=null;else if(sc.side)sc.side=null;else sc.menu=null;return;
    case 'SEL':listSelect();return;
    case 'Autoset':autoset();return;
    case 'Default':{const p=sc.pwr;RT.S.sc=scNew();RT.S.sc.pwr=p;flash('Default Setup');return}
    case 'Run/Stop':sc.run=!sc.run;sc.frozen=sc.run?null:screenInner();return}
  if(k[0]==='B'){const i=+k[1];
    if(sc.menu==='ch1'||sc.menu==='ch2'){const c=sc.menu==='ch1'?0:1,ch=sc.ch[c];
      if(i===0)ch.cpl={DC:'AC',AC:'GND',GND:'DC'}[ch.cpl];if(i===1)ch.inv=!ch.inv;if(i===2)ch.bw=ch.bw==='Full'?'20MHz':'Full';if(i===3)ch.exp=ch.exp==='Ground'?'Center':'Ground';
      if(i===4){ch.probe=ch.probe===1?10:1;ch.vd=+(ch.vd*(ch.probe===10?10:0.1)).toPrecision(3)}}
    else if(sc.menu==='measure'){sc.list=null;if(i===0)sc.side='add';if(i===1)sc.side='rem';if(i>=2)flash('Not needed here')}
    else if(sc.menu==='acquire'){if(i===0)sc.acq={Sample:'Peak Detect','Peak Detect':'Average',Average:'Sample'}[sc.acq];if(i===1)sc.side='xy';if(i===2)sc.rec=sc.rec==='10k'?'1M':'10k'}
    else if(sc.menu==='display'){if(i===0)sc.disp.vec=!sc.disp.vec;if(i===1)sc.disp.pers=!sc.disp.pers;if(i===3)sc.disp.grat={Full:'Grid',Grid:'Cross',Cross:'Frame',Frame:'Full'}[sc.disp.grat]}
    else if(sc.menu==='cursor'){const u=sc.cur;if(i===0)u.mode=u.mode==='H'?null:'H';if(i===1)u.mode=u.mode==='V'?null:'V';if(i===2)u.src=1-u.src;if(i===3)u.sel=(u.sel+1)%3}
    else if(sc.menu==='trig'){const t=sc.trig;if(i===1)t.src=1-t.src;if(i===2)t.slope=t.slope==='+'?'-':'+';if(i===3)t.mode=t.mode==='Auto'?'Normal':'Auto';if(i===4)t.cpl=t.cpl==='DC'?'AC':'DC'}
    else if(sc.menu==='utility')flash('Not needed here');return}
  if(k[0]==='S'){const i=+k[1];
    if(sc.side==='add'){const kinds=['vi','time','delay','src1','src2'];sc.list={kind:kinds[i],idx:i===3?sc.msrc:i===4?sc.msrc2:0}}
    else if(sc.side==='rem'){if(i===0)sc.list={kind:'rem',idx:0};if(i===1){sc.meas=[];sc.list=null}}
    else if(sc.side==='xy'){if(i===0)sc.xy=false;if(i===1)sc.xy=true}}
}
function fresh(){const sc=scNew();if(opt.prev)opt.prev(sc);return sc}
return {key:'sc',prefix:'s',bnc:SC_BNC,
  leads:[{k:'c1r',park:opt.park.c1r},{k:'c1b',park:opt.park.c1b,earth:true},{k:'c2r',park:opt.park.c2r},{k:'c2b',park:opt.park.c2b,earth:true}],
  cables:D=>D.coax(SC_BNC[0],'c1r','c1b','CH1')+D.coax(SC_BNC[1],'c2r','c2b','CH2'),
  stamp(ck){const L=RT.S.leads;const p1=L.c1r.node!=null?ck.idx(L.c1r.node):null,p2=L.c2r.node!=null?ck.idx(L.c2r.node):null;
    if(p1!=null&&p1>=0)ck.els.push({t:'G',a:p1,b:-1,g:1e-6});if(p2!=null&&p2>=0)ck.els.push({t:'G',a:p2,b:-1,g:1e-6});ck.p1=p1;ck.p2=p2},
  fresh,scNew,chNew,svg:scopeSVG,screenInner,dsig,chVDS,flash,autoset,keyFn:scKey,
  wheel:['P1P','P2P','V1','V2','HP','H','VAR','LV']};
};
