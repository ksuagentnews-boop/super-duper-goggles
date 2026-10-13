/* GW Instek GDS-1104B oscilloscope, 4 channels (approved prototype behaviour, extended to CH3/CH4).
   RT supplies: S (state, scope state in S.sc), chanSig(c), sigF(), dirty, recompute(), render().
   opt: {at:{x,y}, prev(sc), probes:n} — position on the bench, the previous group's leftover settings,
   and how many BNC probe cables lie on this table (default 2). */
ENGINE.scope=function(RT,opt){
const C0=opt.at;
/* panel layout after the real GDS-1104B: LCD + soft keys on the left; VARIABLE, function keys, Autoset column,
   HORIZONTAL row, four VERTICAL columns (POSITION / CH / SCALE) with Math·Ref·Bus, TRIGGER column; POWER and CH1–CH4 BNCs in the bottom strip */
const COLX=[466,540,670,744];
const SX=14,SY=26;                                   // where the screen's own coordinates (12…348 × 26…312) sit on the panel
const SC_BNC=COLX.map(x=>({x:C0.x+x,y:C0.y+408}));
const CHC=[CH1,CH2,CH3,CH4],RING=['#d8a800','#1ba9ae','#c2389e','#2f6bd9'],SYM=['①','②','③','④'];
const NCH=4,ALL=[0,1,2,3];
const W=890,H=440;
const GX=22,GY=48,GW=300,GH=200,DX=30,DY=25;
const VI_LIST=['Pk-Pk','Max','Min','Amplitude','High','Low','Mean','Cycle Mean','RMS','Cycle RMS','Area','Cycle Area','ROVShoot','FOVShoot','RPREShoot','FPREShoot'];
const TIME_LIST=['Frequency','Period','RiseTime','FallTime','+Width','-Width','Duty Cycle','+Pulses','-Pulses','+Edges','-Edges'];
const DELAY_LIST=['Phase','FRR','FRF','FFR','FFF','LRR','LRF','LFR','LFF'];
const SRC_LIST=['CH1','CH2','CH3','CH4','Math','Ref1'];
function chNew(on){return {on,vd:2,pos:0,cpl:'DC',inv:false,probe:1,bw:'Full',exp:'Ground'}}
function scNew(){return {pwr:false,ch:[chNew(true),chNew(false),chNew(false),chNew(false)],td:5e-5,hpos:0,xy:false,menu:null,side:null,list:null,msrc:0,msrc2:1,meas:[],run:true,frozen:null,msg:'',
  trig:{src:0,slope:'+',mode:'Auto',level:0,cpl:'DC'},cur:{mode:null,sel:0,h:[-2,2],v:[1,-1],src:0},disp:{vec:true,grat:'Full',pers:false},acq:'Sample',rec:'10k'}}
function dsig(c){const b=RT.chanSig(c),ch=RT.S.sc.ch[c];const k=(ch.inv?-1:1)*ch.probe;return {fn:ph=>k*b.fn(ph),max:k>0?k*b.max:k*b.min,min:k>0?k*b.min:k*b.max,has:b.has}}
function chVDS(c){return VDS.map(v=>+(v*RT.S.sc.ch[c].probe).toPrecision(3))}
function trigPhase(sg){const t=RT.S.sc.trig,s=sg[t.src];if(!s.has)return null;const L=t.level;let prev=s.fn(-2*Math.PI/1440);
  for(let i=0;i<=1440;i++){const ph=2*Math.PI*i/1440,v=s.fn(ph);if(t.slope==='+'?(prev<L&&v>=L):(prev>L&&v<=L))return ph;prev=v}return null}
function measure(m,sg){const c=m.src;if(c>3)return '?';const s=sg[c],f=RT.sigF(),sc=RT.S.sc;const N=720;const per=[];for(let i=0;i<N;i++)per.push(s.fn(2*Math.PI*i/N));
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
    case 'Phase':{const c2=m.src2;if(c2>3)return '?';const s2=sg[c2];const ph=sx=>{let re=0,im=0;for(let i=0;i<N;i++){const v=sx.fn(2*Math.PI*i/N);re+=v*Math.cos(2*Math.PI*i/N);im+=v*Math.sin(2*Math.PI*i/N)}return Math.atan2(re,im)};if(!has||!s2.has)return '?';let d=(ph(s2)-ph(s))*180/Math.PI;while(d>180)d-=360;while(d<-180)d+=360;return d.toFixed(2)+'°'}
    default:return '?'}}
function listItems(){const sc=RT.S.sc,l=sc.list;if(!l)return [];
  if(l.kind==='vi')return VI_LIST;if(l.kind==='time')return TIME_LIST;if(l.kind==='delay')return DELAY_LIST;if(l.kind==='src1'||l.kind==='src2')return SRC_LIST;
  if(l.kind==='rem')return sc.meas.map(m=>`CH${m.src+1} ${m.type}`);return []}
function listTitle(k){return {vi:'V/I Measurements',time:'Time Measurements',delay:'Delay Measurements',src1:'Source1',src2:'Source2',rem:'Remove Measurement'}[k]}
function menuLabels(){const sc=RT.S.sc;let b=null,sd=null;
  if(/^ch[1-4]$/.test(sc.menu||'')){const c=sc.ch[+sc.menu[2]-1];b=['Coupling\n'+c.cpl,'Invert\n'+(c.inv?'ON':'OFF'),'Bandwidth\n'+c.bw,'Expand\nBy '+c.exp,'Probe\n'+c.probe+'X Voltage']}
  else if(sc.menu==='measure'){b=['Add\nMeasurement','Remove\nMeasurement','Gating\nScreen','Display\nAll OFF','High-Low\nAuto'];
    if(sc.side==='add')sd=['V/I','Time','Delay','Source1\n'+SRC_LIST[sc.msrc],'Source2\n'+SRC_LIST[sc.msrc2]];if(sc.side==='rem')sd=['Select\nMeasurement','Remove\nAll','','','']}
  else if(sc.menu==='acquire'){b=['Mode\n'+sc.acq,'XY\n'+(sc.xy?'Triggered XY':'OFF (YT)'),'Record\nLength '+sc.rec,'',''];if(sc.side==='xy')sd=['OFF (YT)','Triggered\nXY','','','']}
  else if(sc.menu==='display'){b=['Display\n'+(sc.disp.vec?'Vector':'Dot'),'Persistence\n'+(sc.disp.pers?'ON':'OFF'),'Intensity\n50%','Graticule\n'+sc.disp.grat,'']}
  else if(sc.menu==='cursor'){const u=sc.cur;b=['H Cursor\n'+(u.mode==='H'?'ON':'OFF'),'V Cursor\n'+(u.mode==='V'?'ON':'OFF'),'Source\nCH'+(u.src+1),'Select\n'+['①','②','①②'][u.sel],'']}
  else if(sc.menu==='trig'){const t=sc.trig;b=['Type\nEdge','Source\nCH'+(t.src+1),'Slope\n'+(t.slope==='+'?'↑ Rising':'↓ Falling'),'Mode\n'+t.mode,'Coupling\n'+t.cpl]}
  else if(sc.menu==='utility'){b=['Language\nEnglish','System\nInfo','Hardcopy\nMenu','Probe\nComp.','']}
  return {b,sd}}
function screenInner(){const sc=RT.S.sc;let s=`<rect x="12" y="26" width="336" height="286" fill="#05090b"/>`;if(!sc.pwr)return s;
  const sg=ALL.map(dsig);const f=RT.sigF();const cy=GY+GH/2,cx=GX+GW/2;
  let ph0=0,trig='Trig\'d';if(!sc.xy){const tp=trigPhase(sg);if(tp==null){trig=sc.trig.mode==='Auto'?'Auto':'Trig?';ph0=(performance.now()/97)%(2*Math.PI)}else ph0=tp}
  s+=T(18,40,'GW INSTEK',{size:9,fill:'#7ea1ab'})+T(180,40,sc.xy?'':trig,{size:9,fill:trig==='Trig\'d'?'#7dff9a':'#ffb347',a:'middle'})+T(342,40,(sc.run?'Run':'Stop')+(sc.xy?' · XY':''),{size:9,fill:sc.run?'#7dff9a':'#ff6b5b',a:'end'});
  const g=sc.disp.grat;
  if(g==='Full'||g==='Grid'){for(let i=0;i<=10;i++)s+=`<line x1="${GX+i*DX}" y1="${GY}" x2="${GX+i*DX}" y2="${GY+GH}" stroke="${i===5&&g==='Full'?'#3b4c53':'#1b272c'}" stroke-dasharray="2 3"/>`;for(let j=0;j<=8;j++)s+=`<line x1="${GX}" y1="${GY+j*DY}" x2="${GX+GW}" y2="${GY+j*DY}" stroke="${j===4&&g==='Full'?'#3b4c53':'#1b272c'}" stroke-dasharray="2 3"/>`}
  if(g==='Cross'){s+=`<line x1="${cx}" y1="${GY}" x2="${cx}" y2="${GY+GH}" stroke="#3b4c53" stroke-dasharray="2 3"/><line x1="${GX}" y1="${cy}" x2="${GX+GW}" y2="${cy}" stroke="#3b4c53" stroke-dasharray="2 3"/>`}
  s+=`<rect x="${GX}" y="${GY}" width="${GW}" height="${GH}" fill="none" stroke="#2a3a40"/>`;
  const draw=(pts,col)=>{if(sc.disp.vec){let d='';pts.forEach((p,i)=>{d+=(i?'L':'M')+p[0].toFixed(1)+' '+clamp(p[1],GY-30,GY+GH+30).toFixed(1)});return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.7" clip-path="url(#gridclip)"/>`}
    return `<g clip-path="url(#gridclip)" fill="${col}">`+pts.filter((p,i)=>i%2===0).map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.1"/>`).join('')+`</g>`};
  if(!sc.xy){if(trig!=='Trig?'){const N=700;
    ALL.forEach(c=>{const ch=sc.ch[c];if(!ch.on)return;const pts=[];for(let i=0;i<=N;i++){const u=i/N;const t=(u-0.5)*10*sc.td+sc.hpos;const v=sg[c].fn(ph0+2*Math.PI*f*t);pts.push([GX+u*GW,cy-(v/ch.vd+ch.pos)*DY])}s+=draw(pts,CHC[c])})}
    ALL.forEach(c=>{const ch=sc.ch[c];if(!ch.on)return;const my=clamp(cy-ch.pos*DY,GY,GY+GH);s+=`<path d="M${GX-9} ${my-6} l8 6 l-8 6 z" fill="${CHC[c]}"/>`+T(GX-7,my+3.5,c+1,{size:8,fill:'#000',w:600})});
    const tc=sc.ch[sc.trig.src];const ty=clamp(cy-(sc.trig.level/tc.vd+tc.pos)*DY,GY,GY+GH);s+=`<path d="M${GX+GW+9} ${ty-5} l-8 5 l8 5 z" fill="${CHC[sc.trig.src]}"/>`;
    const tx0=clamp(cx-sc.hpos/sc.td*DX,GX,GX+GW);s+=`<path d="M${tx0-5} ${GY-7} l5 7 l5 -7 z" fill="#ff9f43"/>`;
  }else{const c1=sc.ch[0],c2=sc.ch[1];const pts=[];for(let i=0;i<=400;i++){const ph=2*Math.PI*i/400;pts.push([clamp(cx+(sg[0].fn(ph)/c1.vd+c1.pos)*DX,GX-30,GX+GW+30),cy-(sg[1].fn(ph)/c2.vd+c2.pos)*DY])}s+=draw(pts,CH2)}
  // cursors
  const u=sc.cur;if(u.mode){const ch=sc.ch[u.src];const col=CHC[u.src];let txt='';
    if(u.mode==='V'){u.v.forEach((d,i)=>{const y=cy-d*DY;s+=`<line x1="${GX}" y1="${y}" x2="${GX+GW}" y2="${y}" stroke="#ff9f43" stroke-dasharray="${u.sel===i||u.sel===2?'0':'4 3'}" stroke-width="1.2"/>`});const v=u.v.map(d=>(d-ch.pos)*ch.vd);txt=`V1 ${fmtV(v[0])}  V2 ${fmtV(v[1])}  Δ ${fmtV(v[0]-v[1])}`}
    else{u.h.forEach((d,i)=>{const x=cx+d*DX;s+=`<line x1="${x}" y1="${GY}" x2="${x}" y2="${GY+GH}" stroke="#ff9f43" stroke-dasharray="${u.sel===i||u.sel===2?'0':'4 3'}" stroke-width="1.2"/>`});const t=u.h.map(d=>d*sc.td+sc.hpos);txt=`T1 ${fmtTime(t[0])}  T2 ${fmtTime(t[1])}  Δ ${fmtTime(t[1]-t[0])}`}
    s+=`<rect x="${GX+4}" y="${GY+4}" width="230" height="16" rx="3" fill="#0d1b20" stroke="#ff9f43" stroke-width=".8"/>`+T(GX+10,GY+15,txt,{size:8.5,fill:'#ffcf99'})}
  let info='';sc.ch.forEach((ch,c)=>{if(ch.on)info+=`<tspan fill="${CHC[c]}">${SYM[c]} ${fmtVd(ch.vd)} ${ch.cpl}${ch.probe>1?' x10':''}${ch.inv?' ⇅':''}</tspan>  `});
  s+=`<text x="18" y="259" font-size="9" fill="#d9e6e8" pointer-events="none">${info}<tspan fill="#d9e6e8">${sc.xy?'XY':fmtTd(sc.td)}</tspan>${!sc.xy?`<tspan fill="#ffb347">  ${sc.trig.slope==='+'?'↑':'↓'}CH${sc.trig.src+1} ${fmtV(sc.trig.level)}</tspan>`:''}${sg.some(x=>x.has)&&f>0?`<tspan fill="#9fb">  ${f.toFixed(2)}Hz</tspan>`:''}</text>`;
  sc.meas.forEach((m,k)=>{const col=CHC[m.src]||CH1;s+=T(16+(k%4)*83,270+Math.floor(k/4)*11,`${SYM[m.src]}${m.type} ${measure(m,sg)}`,{size:7.8,fill:col,w:600})});
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
  const key=(x,y,w,h,k,l,o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx??4}" fill="${o.fill||'#f4f6f7'}" stroke="${o.st||'#9aa7ad'}" data-k="s:${k}" style="cursor:pointer"/>`+(l?T(x+w/2,y+h/2+3.5,l,{size:o.size||8.6,fill:o.ink||'#22303a',a:'middle',w:o.w||500}):'');
  // body, brand
  s+=`<rect width="${W}" height="${H}" rx="16" fill="#e7ebec" stroke="#a9b6bb" stroke-width="2"/><rect x="6" y="${H-62}" width="${W-12}" height="56" rx="10" fill="#dde2e4"/>`;
  s+=T(22,30,'GW',{size:15,fill:'#22303a',w:700})+T(46,30,'INSTEK',{size:15,fill:'#22303a',w:700})+T(112,30,'GDS-1104B',{size:13,fill:'#22303a',w:600})+T(206,22,'Digital Storage Oscilloscope',{size:7.5,fill:'#55646a'})+T(206,33,'100 MHz  1 GSa/s',{size:7.5,fill:'#55646a'})+`<rect x="330" y="17" width="34" height="16" rx="3" fill="#d4552a"/>`+T(347,29,'VPO',{size:9,fill:'#fff',a:'middle',w:700});
  // LCD with bezel
  s+=`<rect x="${SX+4}" y="${SY+18}" width="358" height="304" rx="9" fill="#262d31"/><g transform="translate(${SX} ${SY})">${sc.run||!sc.frozen?screenInner():sc.frozen}</g>`;
  // side soft keys (and the Hardcopy key above them), bottom soft keys, Menu Off
  s+=`<rect x="381" y="${SY+22}" width="20" height="12" rx="3" fill="#59656b" data-k="s:Hard" style="cursor:pointer"/>`;
  for(let i=0;i<5;i++)s+=`<rect x="380" y="${SY+52+i*44}" width="22" height="32" rx="5" fill="#59656b" stroke="#3a4448" data-k="s:S${i}" style="cursor:pointer"/>`;
  for(let i=0;i<5;i++)s+=`<rect x="${SX+20+i*66}" y="${SY+326}" width="56" height="15" rx="5" fill="#59656b" stroke="#3a4448" data-k="s:B${i}" style="cursor:pointer"/>`;
  s+=`<rect x="380" y="${SY+326}" width="22" height="15" rx="4" fill="#8b979c" data-k="s:MOFF" style="cursor:pointer"/>`+T(391,SY+351,'Menu',{size:6.5,fill:'#3b4a50',a:'middle'});
  // right panel: VARIABLE + Select
  s+=`<rect x="414" y="16" width="${W-428}" height="${H-86}" rx="10" fill="#edf0f1" stroke="#c6d0d3"/>`;
  s+=sKnob(452,62,17,'#7d8c92','s:VAR','VARIABLE')+key(431,98,42,17,'SEL','Select');
  // function keys block
  s+=`<rect x="496" y="24" width="252" height="70" rx="8" fill="#3a434a"/>`;
  [['Measure','Cursor','APP','Acquire'],['Display','Help','Save/Recall','Utility']].forEach((r,ri)=>r.forEach((k,ci)=>{s+=key(503+ci*61,31+ri*31,56,23,k,k,{size:k.length>8?7:8.2})}));
  // Autoset · Run/Stop · Single · Default
  [['Autoset','#3d86cf','#fff'],['Run/Stop',null],['Single',null],['Default',null]].forEach(([k,f,ink],i)=>{s+=key(800,26+i*29,62,22,k,k,{fill:f||'#f4f6f7',ink:ink||'#22303a',w:f?700:500})});
  // HORIZONTAL
  s+=`<rect x="496" y="104" width="292" height="74" rx="8" fill="none" stroke="#c6d0d3"/>`+T(642,116,'HORIZONTAL',{size:7.5,fill:'#3b4a50',a:'middle',w:600});
  s+=key(506,122,48,17,'Search','Search',{size:7.5})+key(506,146,48,17,'SetClr','Set/Clear',{size:7.5});
  s+=sKnob(628,148,11,'#7d8c92','s:HP','POSITION','',true)+sKnob(730,146,14,'#7d8c92','s:H','SCALE',sc.pwr?fmtTd(sc.td)+'/div':'');
  // VERTICAL: POSITION / CH key / SCALE per channel, Math · Ref · Bus in the middle
  s+=`<rect x="424" y="188" width="364" height="174" rx="8" fill="none" stroke="#c6d0d3"/>`+T(606,200,'VERTICAL',{size:7.5,fill:'#3b4a50',a:'middle',w:600});
  ALL.forEach(c=>{const x=COLX[c];const on=sc.pwr&&sc.ch[c].on;s+=sKnob(x,224,11,RING[c],`s:P${c+1}P`,'POSITION','',true);
    s+=`<rect x="${x-18}" y="252" width="36" height="20" rx="5" fill="${on?CHC[c]:'#f4f6f7'}" stroke="${RING[c]}" stroke-width="1.6" data-k="s:CH${c+1}" style="cursor:pointer"/>`+T(x,266,'CH'+(c+1),{size:9,a:'middle',w:600});
    s+=sKnob(x,308,14,RING[c],`s:V${c+1}`,'SCALE',on?fmtVd(sc.ch[c].vd)+'/div':'')});
  [['Math','M','#c2389e'],['Ref','R','#3b4a50'],['Bus','B','#2f6bd9']].forEach(([k,l,c],i)=>{const y=226+i*30;s+=`<circle cx="605" cy="${y}" r="10" fill="#f4f6f7" stroke="${c}" stroke-width="1.6" data-k="s:${k}" style="cursor:pointer"/>`+T(605,y+3.5,l,{size:9,fill:c,a:'middle',w:700})});
  // TRIGGER
  s+=`<rect x="796" y="188" width="74" height="174" rx="8" fill="none" stroke="#c6d0d3"/>`+T(833,200,'TRIGGER',{size:7.5,fill:'#3b4a50',a:'middle',w:600});
  s+=sKnob(833,226,11,'#ff9f43','s:LV','LEVEL','',true)+key(811,258,44,18,'TRIG','Menu')+key(811,284,44,18,'Half','50%')+key(811,310,44,22,'Force','Force-Trig',{size:7});
  // bottom strip: POWER, USB, probe compensation, CH1–CH4 inputs
  s+=`<rect x="22" y="${H-46}" width="44" height="30" rx="15" fill="#e9eef0" stroke="#7d8c92" stroke-width="2" data-k="s:PWR" style="cursor:pointer"/><circle cx="44" cy="${H-31}" r="8" fill="${sc.pwr?'#cfe9d6':'#c9d1d5'}" stroke="#55646a" pointer-events="none"/>`+T(84,H-28,'POWER',{size:9,fill:'#3b4a50',w:600})+`<circle cx="128" cy="${H-31}" r="3.5" fill="${sc.pwr?'#46e070':'#8a9396'}"/>`;
  s+=`<rect x="292" y="${H-42}" width="16" height="22" rx="2" fill="#2d3438"/><rect x="296" y="${H-38}" width="8" height="5" fill="#9aa"/>`+T(330,H-34,'2V⎍',{size:7,fill:'#3b4a50'})+`<path d="M330 ${H-24} v8 M346 ${H-24} v8" stroke="#55646a" stroke-width="2"/>`;
  SC_BNC.forEach((p,i)=>{const x=p.x-C0.x,y=p.y-C0.y;s+=T(x,y-18,'CH'+(i+1),{size:9,fill:'#3b4a50',a:'middle',w:600})+`<circle cx="${x}" cy="${y}" r="13" fill="#c9d1d5" stroke="#5d6a6f" stroke-width="2"/><circle cx="${x}" cy="${y}" r="8" fill="#2c3438" stroke="${RING[i]}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="3" fill="#c8a24a"/>`});
  s+=T(606,H-12,'300V CAT I · 1MΩ // 16pF',{size:6.5,fill:'#55646a',a:'middle'});
  return s+'</g>'}
let msgTimer=null;function flash(m){RT.S.sc.msg=m;clearTimeout(msgTimer);msgTimer=setTimeout(()=>{RT.S.sc.msg='';RT.render()},1300)}
function step(arr,v,dir){let i=arr.findIndex(x=>Math.abs(x-v)/v<1e-6);if(i<0)i=arr.findIndex(x=>x>=v);if(i<0)i=arr.length-1;return arr[clamp(i+dir,0,arr.length-1)]}
function autoset(){if(RT.dirty)RT.recompute();const sc=RT.S.sc;const sg=ALL.map(dsig);if(!sg.some(x=>x.has)){flash('No signal');return}
  ALL.forEach(c=>{const ch=sc.ch[c];if(!ch.on||!sg[c].has)return;const pk=Math.max(Math.abs(sg[c].max),Math.abs(sg[c].min));ch.vd=chVDS(c).find(v=>pk/v<=3.3)||chVDS(c).slice(-1)[0];ch.pos=0});
  const f=RT.sigF();if(f>0)sc.td=TDS.find(t=>10*t>=2/f)||1;sc.hpos=0;const ts=Math.max(0,sg.findIndex(x=>x.has));sc.trig.src=ts;sc.trig.slope='+';sc.trig.level=+((sg[ts].max+sg[ts].min)/2).toFixed(3);
  sc.xy=false;sc.menu=null;sc.side=null;sc.list=null;flash('Autoset')}
function listSelect(){const sc=RT.S.sc,l=sc.list,it=listItems();if(!l||!it.length)return;const v=it[l.idx];
  if(l.kind==='src1'||l.kind==='src2'){if(l.idx>3){flash(v+': no signal');return}if(l.kind==='src1')sc.msrc=l.idx;else sc.msrc2=l.idx;sc.list=null;return}
  if(l.kind==='rem'){sc.meas.splice(l.idx,1);if(!sc.meas.length)sc.list=null;else l.idx=Math.min(l.idx,sc.meas.length-1);return}
  if(!sc.meas.some(m=>m.src===sc.msrc&&m.type===v)){sc.meas.push({src:sc.msrc,src2:sc.msrc2,type:v});if(sc.meas.length>8)sc.meas.shift();flash('Added '+v)}}
function scKey(k){const sc=RT.S.sc;if(k==='PWR'){sc.pwr=!sc.pwr;sc.menu=null;sc.side=null;sc.list=null;return}if(!sc.pwr)return;
  const openMenu=m=>{sc.menu=m;sc.side=null;sc.list=null};
  const chm=c=>{const ch=sc.ch[c],name='ch'+(c+1);if(!ch.on){ch.on=true;openMenu(name)}else if(sc.menu===name){ch.on=false;sc.menu=null}else openMenu(name)};
  const kn=(key,dir)=>{
    if(key==='VAR'){if(sc.list){const n=listItems().length;if(n)sc.list.idx=(sc.list.idx+dir+n)%n}else if(sc.cur.mode){const u=sc.cur,arr=u.mode==='V'?u.v:u.h,lim=u.mode==='V'?4:5;[0,1].forEach(i=>{if(u.sel===i||u.sel===2)arr[i]=clamp(Math.round((arr[i]+dir*0.1)*10)/10,-lim,lim)})}return}
    if(key==='LV'){const tc=sc.ch[sc.trig.src];sc.trig.level=+(sc.trig.level+dir*tc.vd*0.2).toFixed(4);return}
    if(/^P[1-4]P$/.test(key)){const c=+key[1]-1;sc.ch[c].pos=clamp(Math.round((sc.ch[c].pos+dir*0.2)*10)/10,-4,4);return}
    if(/^V[1-4]$/.test(key)){const c=+key[1]-1;sc.ch[c].vd=step(chVDS(c),sc.ch[c].vd,dir);return}
    if(key==='H'){sc.td=step(TDS,sc.td,dir);return}
    if(key==='HP'){sc.hpos=+(sc.hpos+dir*sc.td*0.5).toPrecision(6);return}};
  let m=k.match(/^(VAR|LV|P[1-4]P|V[1-4]|H|HP)([+-])$/);if(m){kn(m[1],m[2]==='+'?1:-1);return}
  m=k.match(/^(LV|P[1-4]P|HP)c$/);if(m){if(m[1]==='LV'){const sg=dsig(sc.trig.src);sc.trig.level=+((sg.max+sg.min)/2).toFixed(3)}else if(m[1]==='HP')sc.hpos=0;else sc.ch[+m[1][1]-1].pos=0;return}
  switch(k){
    case 'CH1':chm(0);return;case 'CH2':chm(1);return;case 'CH3':chm(2);return;case 'CH4':chm(3);return;
    case 'Measure':openMenu('measure');return;case 'Acquire':openMenu('acquire');return;case 'Display':openMenu('display');return;case 'Cursor':openMenu('cursor');return;case 'Utility':openMenu('utility');return;case 'TRIG':openMenu('trig');return;
    case 'Help':flash('Help: press a key to see info');return;
    case 'MOFF':if(sc.list)sc.list=null;else if(sc.side)sc.side=null;else sc.menu=null;return;
    case 'SEL':listSelect();return;
    case 'Autoset':autoset();return;
    case 'Default':{const p=sc.pwr;RT.S.sc=scNew();RT.S.sc.pwr=p;flash('Default Setup');return}
    case 'Run/Stop':sc.run=!sc.run;sc.frozen=sc.run?null:screenInner();return
    case 'Single':sc.run=false;sc.frozen=screenInner();flash('Single');return
    case 'Half':{const sg=dsig(sc.trig.src);sc.trig.level=+((sg.max+sg.min)/2).toFixed(3);return}
    case 'Hard':case 'APP':case 'Save/Recall':case 'Search':case 'SetClr':case 'Math':case 'Ref':case 'Bus':case 'Force':flash('Not needed here');return}
  if(k[0]==='B'){const i=+k[1];
    if(/^ch[1-4]$/.test(sc.menu||'')){const c=+sc.menu[2]-1,ch=sc.ch[c];
      if(i===0)ch.cpl={DC:'AC',AC:'GND',GND:'DC'}[ch.cpl];if(i===1)ch.inv=!ch.inv;if(i===2)ch.bw=ch.bw==='Full'?'20MHz':'Full';if(i===3)ch.exp=ch.exp==='Ground'?'Center':'Ground';
      if(i===4){ch.probe=ch.probe===1?10:1;ch.vd=+(ch.vd*(ch.probe===10?10:0.1)).toPrecision(3)}}
    else if(sc.menu==='measure'){sc.list=null;if(i===0)sc.side='add';if(i===1)sc.side='rem';if(i>=2)flash('Not needed here')}
    else if(sc.menu==='acquire'){if(i===0)sc.acq={Sample:'Peak Detect','Peak Detect':'Average',Average:'Sample'}[sc.acq];if(i===1)sc.side='xy';if(i===2)sc.rec=sc.rec==='10k'?'1M':'10k'}
    else if(sc.menu==='display'){if(i===0)sc.disp.vec=!sc.disp.vec;if(i===1)sc.disp.pers=!sc.disp.pers;if(i===3)sc.disp.grat={Full:'Grid',Grid:'Cross',Cross:'Frame',Frame:'Full'}[sc.disp.grat]}
    else if(sc.menu==='cursor'){const u=sc.cur;if(i===0)u.mode=u.mode==='H'?null:'H';if(i===1)u.mode=u.mode==='V'?null:'V';if(i===2)u.src=(u.src+1)%NCH;if(i===3)u.sel=(u.sel+1)%3}
    else if(sc.menu==='trig'){const t=sc.trig;if(i===1)t.src=(t.src+1)%NCH;if(i===2)t.slope=t.slope==='+'?'-':'+';if(i===3)t.mode=t.mode==='Auto'?'Normal':'Auto';if(i===4)t.cpl=t.cpl==='DC'?'AC':'DC'}
    else if(sc.menu==='utility')flash('Not needed here');return}
  if(k[0]==='S'){const i=+k[1];
    if(sc.side==='add'){const kinds=['vi','time','delay','src1','src2'];sc.list={kind:kinds[i],idx:i===3?sc.msrc:i===4?sc.msrc2:0}}
    else if(sc.side==='rem'){if(i===0)sc.list={kind:'rem',idx:0};if(i===1){sc.meas=[];sc.list=null}}
    else if(sc.side==='xy'){if(i===0)sc.xy=false;if(i===1)sc.xy=true}}
}
function fresh(){const sc=scNew();if(opt.prev)opt.prev(sc);return sc}
const NP=opt.probes||2;const PR=[...Array(NP).keys()];
return {key:'sc',prefix:'s',bnc:SC_BNC,size:[W,H],
  leads:[].concat(...PR.map(c=>[{k:`c${c+1}r`,label:'CH'+(c+1),from:{x:SC_BNC[c].x-14,y:SC_BNC[c].y},coax:true,grp:`c${c+1}r`,jat:SC_BNC[c],tray:`CH${c+1} probe`,jn:`CH${c+1}`},{k:`c${c+1}b`,label:`CH${c+1} ⏚`,from:{x:SC_BNC[c].x+14,y:SC_BNC[c].y},earth:true,coax:true,grp:`c${c+1}r`}])),
  cables:D=>PR.map(c=>D.coax(SC_BNC[c],`c${c+1}r`,`c${c+1}b`,'CH'+(c+1))).join(''),
  /* each plugged probe loads its node with 1 MΩ to earth */
  stamp(ck){const L=RT.S.leads;ck.probes=ALL.map(c=>{const l=L[`c${c+1}r`];if(!l||l.node==null)return null;const p=ck.idx(l.node);if(p>=0)ck.els.push({t:'G',a:p,b:-1,g:1e-6});return p});ck.p1=ck.probes[0];ck.p2=ck.probes[1]},
  /* on touch, the open menu as a large list over the screen (same keys / items as the soft keys and the list) */
  touchMenu(){const sc=RT.S.sc;if(!sc.pwr||!(sc.menu||sc.list))return null;const scr=[C0.x+SX+4,C0.y+SY+18,358,304];
    if(sc.list){const it=listItems();return {rect:scr,title:listTitle(sc.list.kind),items:it.map((x,k)=>({label:x,on:k===sc.list.idx,act:()=>{sc.list.idx=k;listSelect()}})).concat([{label:'✕ Menu Off',key:'MOFF'}])}}
    const {b,sd}=menuLabels();const one=l=>l.replace('\n',' · ');const items=[];
    (sd||[]).forEach((l,i)=>{if(l)items.push({label:one(l),key:'S'+i,side:true})});(b||[]).forEach((l,i)=>{if(l)items.push({label:one(l),key:'B'+i})});
    items.push({label:'✕ Menu Off',key:'MOFF'});const nm={measure:'Measure',acquire:'Acquire',display:'Display',cursor:'Cursor',trig:'Trigger',utility:'Utility'}[sc.menu]||(sc.menu||'').toUpperCase();
    return {rect:scr,title:nm+(sc.side?' · '+{add:'Add Measurement',rem:'Remove Measurement',xy:'XY'}[sc.side]:''),items}},
  fresh,scNew,chNew,svg:scopeSVG,screenInner,dsig,chVDS,flash,autoset,keyFn:scKey,
  wheel:['P1P','P2P','P3P','P4P','V1','V2','V3','V4','HP','H','VAR','LV']};
};
ENGINE.scope.size=[890,440];
