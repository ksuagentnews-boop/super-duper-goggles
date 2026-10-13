/* Hameg HM 203-7 analog dual-trace oscilloscope (20 MHz), as on the EE205 benches (docs/ee205/instruments/exp2-table.jpg, exp6-table.jpg).
   Same contract as engine/scope.js: key 'sc', prefix 's', state in RT.S.sc, two coax inputs CH I / CH II (leads c1r/c1b, c2r/c2b),
   screenInner() drawn in the screen's own coordinates 12…348 × 26…312 (sheet captures wrap it in that viewBox).
   An analog scope has no on-screen readouts: what the student sees is the green CRT beam over the 8 × 10 div graticule.
   Controls (keys s:…): PWR, XMAG (×10), XY, COMP (component tester), ATN (AT/NORM), SLP (+/−), TCPL (AC/DC/HF/LF),
   CH12 (CH I/II · TRIG I/II), DUAL (alternate; DUAL + ADD = chop), ADD (CH I + CH II), INV (INVERT CH II),
   AC1/GD1, AC2/GD2 (input coupling AC/DC and GND per channel), TSRC (alias of CH12 for the trigger source);
   knobs (± and wheel): INT, FOC, TR, XP (X-POS), TD (TIME/DIV), TV (time VAR), LV (trigger LEVEL), V1/V2 (VOLTS/DIV),
   VV1/VV2 (VOLTS/DIV VAR), Y1/Y2 (Y-POS). Clockwise ('+') = faster sweep, more sensitive VOLTS/DIV, VAR towards CAL.
   opt: {at:{x,y}, prev(sc)} — position on the bench and the previous group's leftover settings. */
ENGINE.hameg=function(RT,opt){
const C0=opt.at||{x:0,y:0};
const W=760,H=440;
const SX=10,SY=0;                                     // the screen's own coordinates (12…348 × 26…312) sit at panel 22…358 × 26…312
const GX=40,GY=57,DX=28,DY=28,GW=280,GH=224;          // graticule: 10 × 8 div of 28 units (≈ 1 cm)
const CXS=GX+GW/2,CYS=GY+GH/2;
const BNC=[{x:C0.x+404,y:C0.y+412},{x:C0.x+730,y:C0.y+412}];
const HTD=[0.2,0.1,0.05,0.02,0.01,5e-3,2e-3,1e-3,5e-4,2e-4,1e-4,5e-5,2e-5,1e-5,5e-6,2e-6,1e-6,5e-7];   // TIME/DIV, anticlockwise → clockwise
const HVD=[20,10,5,2,1,0.5,0.2,0.1,0.05,0.02,0.01,0.005];                                        // VOLTS/DIV, anticlockwise → clockwise
const TCPLS=['AC','DC','HF','LF'];
const PH='#8dffb4',GLOW='#38ff84';
function chNew(on){return {on,vd:0.5,var:0,pos:0,cpl:'DC',inv:false,probe:1}}
function scNew(){return {pwr:false,intens:0.6,focus:0,tr:0,xmag:false,hpos:0,td:1e-3,tvar:0,
  ch:[chNew(true),chNew(false),chNew(false),chNew(false)],ch2sel:false,dual:false,add:false,xy:false,comp:false,
  trig:{src:0,slope:'+',mode:'AT',level:0,cpl:'AC'},run:true,frozen:null,msg:'',meas:[]}}
const S=()=>RT.S.sc;
const vf=v=>1+0.15*v;                                  // VAR off CAL: up to 2.5 × the dial value
const vdEff=c=>S().ch[c].vd*vf(S().ch[c].var||0);
const tdEff=()=>S().td*vf(S().tvar);
/* which traces the beam draws: 'I', 'II', 'DUAL' (alternate), 'CHOP', 'ADD' */
function mode(){const sc=S();if(sc.dual&&sc.add)return 'CHOP';if(sc.dual)return 'DUAL';if(sc.add)return 'ADD';return sc.ch2sel?'II':'I'}
function syncOn(){const sc=S(),m=mode();sc.ch[0].on=m!=='II';sc.ch[1].on=m!=='I';sc.trig.src=sc.ch2sel?1:0}
function dsig(c){const b=RT.chanSig(c),ch=S().ch[c];const k=(ch.inv?-1:1)*(ch.probe||1);return {fn:ph=>k*b.fn(ph),max:k>0?k*b.max:k*b.min,min:k>0?k*b.min:k*b.max,has:b.has}}
/* trigger: the phase (one period of RT.sigF()) where the source crosses the level with the chosen slope; null = no crossing */
function trigPhase(s,L,slope){let prev=s(-2*Math.PI/1440);
  for(let i=0;i<=1440;i++){const ph=2*Math.PI*i/1440,v=s(ph);if(slope==='+'?(prev<L&&v>=L):(prev>L&&v<=L))return ph;prev=v}return null}
function trigger(sg){const sc=S(),t=sc.trig,src=sg[t.src];
  if(!src.has)return {ph:null,ok:false,free:true};
  let mean=0;if(t.cpl!=='DC'){for(let k=0;k<240;k++)mean+=src.fn(2*Math.PI*k/240)/240}
  const s=ph=>src.fn(ph)-mean,L=t.level*vdEff(t.src);
  let ph=trigPhase(s,L,t.slope);if(ph!=null)return {ph,ok:true};
  if(t.mode==='AT'){ph=trigPhase(ph=>src.fn(ph)-(src.max+src.min)/2,0,t.slope);if(ph!=null)return {ph,ok:true}}   // AT: level out of range → triggers on the mean
  return {ph:null,ok:false,free:t.mode==='AT'}}
let uid=0;
function screenInner(){const sc=S();const id='hm'+(uid++);
  const blur=Math.abs(sc.focus)*1.8,I=sc.intens;
  let s=`<defs><radialGradient id="${id}g" cx=".5" cy=".46" r=".62"><stop offset="0" stop-color="${sc.pwr?'#2d5551':'#284845'}"/><stop offset=".75" stop-color="#1c3735"/><stop offset="1" stop-color="#122321"/></radialGradient>`+
    `<clipPath id="${id}c"><rect x="18" y="32" width="324" height="274" rx="20"/></clipPath>`+(blur>0.05?`<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter>`:'')+`</defs>`;
  s+=`<rect x="12" y="26" width="336" height="286" rx="6" fill="#151a1a"/><rect x="18" y="32" width="324" height="274" rx="20" fill="url(#${id}g)"/>`;
  // internal graticule: 10 × 8 div, 5 subdivisions on the centre lines, dotted 10 % / 90 % rise-time lines
  let g='';for(let i=0;i<=10;i++)g+=`<line x1="${GX+i*DX}" y1="${GY}" x2="${GX+i*DX}" y2="${GY+GH}"/>`;for(let j=0;j<=8;j++)g+=`<line x1="${GX}" y1="${GY+j*DY}" x2="${GX+GW}" y2="${GY+j*DY}"/>`;
  for(let i=0;i<=50;i++){const x=GX+i*DX/5;g+=`<line x1="${x}" y1="${CYS-2.5}" x2="${x}" y2="${CYS+2.5}"/>`}for(let j=0;j<=40;j++){const y=GY+j*DY/5;g+=`<line x1="${CXS-2.5}" y1="${y}" x2="${CXS+2.5}" y2="${y}"/>`}
  s+=`<g stroke="#8fc1b6" stroke-opacity=".5" stroke-width=".6">${g}</g><g stroke="#8fc1b6" stroke-opacity=".38" stroke-width=".6" stroke-dasharray="1.5 2.5"><line x1="${GX}" y1="${GY+DY*0.4}" x2="${GX+GW}" y2="${GY+DY*0.4}"/><line x1="${GX}" y1="${GY+GH-DY*0.4}" x2="${GX+GW}" y2="${GY+GH-DY*0.4}"/></g>`;
  s+=T(GX+GW-2,GY+GH+13,'%',{size:7,fill:'#8fc1b6'})+T(GX+2,GY+GH+13,'HAMEG',{size:6.5,fill:'#6f9a92'});
  if(sc.pwr&&I>0.01){
    const traces=[];const dv=(v,c)=>v/vdEff(c);
    const yOf=d=>CYS-d*DY;
    if(sc.comp){traces.push({pts:[[GX-10,CYS],[GX+GW+10,CYS]]})}
    else if(sc.xy){const s0=dsig(0),s1=dsig(1);const pts=[];for(let i=0;i<=400;i++){const ph=2*Math.PI*i/400;pts.push([CXS+(dv(s0.fn(ph),0)+sc.hpos)*DX,yOf(dv(s1.fn(ph),1)+sc.ch[1].pos)])}
      const flat=pts.every(p=>Math.abs(p[0]-pts[0][0])<0.3&&Math.abs(p[1]-pts[0][1])<0.3);traces.push(flat?{dot:pts[0]}:{pts})}
    else{const sg=[0,1,2,3].map(dsig),f=RT.sigF(),m=mode(),tr=trigger(sg),M=sc.xmag?10:1,td=tdEff();
      /* beam x (div from the left edge) = sweep time / td magnified around the centre, shifted by X-POS */
      const sweep=(fnDiv,ph0,op)=>{const pts=[];const N=500;for(let i=0;i<=N;i++){const xd=-1+i*12/N;const t=((xd-sc.hpos-5)/M+5)*td;if(t<0||t>10*td)continue;pts.push([GX+xd*DX,yOf(fnDiv(ph0+2*Math.PI*f*t))])}return {pts,op}};
      const fns=[];if(m==='I'||m==='DUAL'||m==='CHOP')fns.push(ph=>dv(sg[0].fn(ph),0)+sc.ch[0].pos);if(m==='II'||m==='DUAL'||m==='CHOP')fns.push(ph=>dv(sg[1].fn(ph),1)+sc.ch[1].pos);
      if(m==='ADD')fns.push(ph=>dv(sg[0].fn(ph),0)+dv(sg[1].fn(ph),1)+sc.ch[0].pos+sc.ch[1].pos);
      if(tr.ok)fns.forEach(fn=>traces.push(sweep(fn,tr.ph,1)));
      else if(tr.free){const r=performance.now()/97,moving=(m==='II'?[1]:m==='I'?[0]:[0,1]).some(c=>sg[c].has)&&f>0;
        fns.forEach(fn=>moving?[0,1,2].forEach(k=>traces.push(sweep(fn,(r*(k+1)*1.37)%(2*Math.PI),0.45))):traces.push(sweep(fn,0,1)))}}
    const rot=sc.tr*1.2;let b=`<g clip-path="url(#${id}c)" transform="rotate(${rot.toFixed(2)} ${CXS} ${CYS})">`;
    const core=1.3*(1+Math.abs(sc.focus)*1.6),op=Math.min(1,0.25+0.85*I);
    traces.forEach(t=>{const o=op*(t.op??1);
      if(t.dot){b+=`<circle cx="${t.dot[0].toFixed(1)}" cy="${t.dot[1].toFixed(1)}" r="${(4+5*I).toFixed(1)}" fill="${GLOW}" opacity="${(0.25*o).toFixed(2)}"/><circle cx="${t.dot[0].toFixed(1)}" cy="${t.dot[1].toFixed(1)}" r="${(1.6+blur).toFixed(1)}" fill="${PH}" opacity="${o.toFixed(2)}"${blur>0.05?` filter="url(#${id}f)"`:''}/>`;return}
      if(t.pts.length<2)return;let d='';t.pts.forEach((p,i)=>{d+=(i?'L':'M')+p[0].toFixed(1)+' '+clamp(p[1],-200,600).toFixed(1)});
      b+=`<path d="${d}" fill="none" stroke="${GLOW}" stroke-width="${(3.5+4*I).toFixed(1)}" stroke-opacity="${(0.16*o).toFixed(2)}" stroke-linejoin="round"/>`+
        `<path d="${d}" fill="none" stroke="${PH}" stroke-width="${core.toFixed(2)}" stroke-opacity="${o.toFixed(2)}" stroke-linejoin="round"${blur>0.05?` filter="url(#${id}f)"`:''}/>`});
    s+=b+'</g>'}
  s+=`<rect x="18" y="32" width="324" height="274" rx="20" fill="none" stroke="#0b1312" stroke-width="3"/><path d="M40 44 Q180 34 320 44" stroke="#fff" stroke-opacity=".035" stroke-width="8" fill="none"/>`;
  return s}
/* ---------- front panel ---------- */
const HK=(x,y,w,h,k,on,o={})=>`<rect x="${x-w/2}" y="${y-h/2+1.5}" width="${w}" height="${h}" rx="2.5" fill="#7c7a72" opacity=".5"/>`+
  `<rect x="${x-w/2}" y="${y-h/2+(on?1.2:0)}" width="${w}" height="${h}" rx="2.5" fill="${on?'#9b9a93':(o.fill||'url(#hmKey)')}" stroke="#6e6c66" stroke-width=".9" data-k="s:${k}" style="cursor:pointer"/>`+
  (on?`<rect x="${x-w/2+3}" y="${y-h/2+2.5}" width="${w-6}" height="2" rx="1" fill="#5d5c57" pointer-events="none"/>`:'');
const LB=(x,y,s,o={})=>T(x,y,s,Object.assign({size:7,fill:'#2b2f33',a:'middle',w:600},o));
const lamp=(x,y,on,col='#ff4b3a')=>`<circle cx="${x}" cy="${y}" r="3.6" fill="${on?col:'#7d4a44'}" stroke="#4a4a46" stroke-width=".7"/>`+(on?`<circle cx="${x}" cy="${y}" r="7" fill="${col}" opacity=".25"/>`:'');
const angOf=(i,n)=>(-135+270*i/(n-1))*Math.PI/180;
/* a big rotary switch with its red VAR cap in the centre: ring of detent marks, the dial (ENGINE.knob), the cap (its own knob) and ◂ VAR ▸ under it */
function bigKnob(cx,cy,r,key,label,idx,n,varKey,varVal,marks){let s='';
  for(let i=0;i<n;i++){const a=angOf(i,n),x1=cx+Math.sin(a)*(r+4),y1=cy-Math.cos(a)*(r+4),x2=cx+Math.sin(a)*(r+8),y2=cy-Math.cos(a)*(r+8);s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#3b3e40" stroke-width="1"/>`}
  (marks||[]).forEach(([i,t])=>{const a=angOf(i,n);s+=T((cx+Math.sin(a)*(r+16)).toFixed(1),(cy-Math.cos(a)*(r+16)+2.5).toFixed(1),t,{size:6,fill:'#2b2f33',a:'middle'})});
  s+=ENGINE.knob(cx,cy,r,'#5d6164',`s:${key}`,'','',{ang:angOf(idx,n),fill:'#d9d7d0'});
  const va=(-135+270*(1-varVal/10))*Math.PI/180,rv=r*0.4;
  s+=`<circle cx="${cx}" cy="${cy}" r="${rv}" fill="#d0342a" stroke="#8d2018" stroke-width="2" data-k="knob:s:${varKey}" data-knob="s:${varKey}" style="cursor:pointer"/><line x1="${cx}" y1="${cy}" x2="${(cx+Math.sin(va)*(rv-2)).toFixed(1)}" y2="${(cy-Math.cos(va)*(rv-2)).toFixed(1)}" stroke="#fff" stroke-width="1.6" pointer-events="none"/>`;
  s+=`<path d="M${cx-24} ${cy+r+20} l7 -5 v10 z" fill="#8d2018"/><rect x="${cx-34}" y="${cy+r+10}" width="20" height="20" fill="transparent" data-k="s:${varKey}-" style="cursor:pointer"/>`+
     `<path d="M${cx+24} ${cy+r+20} l-7 -5 v10 z" fill="#8d2018"/><rect x="${cx+14}" y="${cy+r+10}" width="20" height="20" fill="transparent" data-k="s:${varKey}+" style="cursor:pointer"/>`+
     T(cx,cy+r+23,'VAR',{size:6.5,fill:'#8d2018',a:'middle',w:700});
  if(label)s+=LB(cx,cy-r-24,label,{size:7.5});return s}
function hmSVG(){const sc=S();syncOn();let s=`<g transform="translate(${C0.x} ${C0.y})">`;
  s+=`<defs><linearGradient id="hmKey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f6f1"/><stop offset="1" stop-color="#d6d4cc"/></linearGradient>`+
     `<radialGradient id="hmNut" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f0f1f1"/><stop offset="1" stop-color="#9ba1a3"/></radialGradient></defs>`;
  // case, frame, screen bezel
  s+=`<rect width="${W}" height="${H}" rx="12" fill="#c9c6bd" stroke="#8f8c84" stroke-width="2"/><rect x="5" y="5" width="${W-10}" height="${H-10}" rx="9" fill="#dedbd2"/>`;
  s+=`<rect x="14" y="14" width="360" height="314" rx="14" fill="#4a4d4c" stroke="#2f3231" stroke-width="2"/><rect x="18" y="18" width="352" height="306" rx="11" fill="#2a2d2d"/>`;
  [[24,22],[364,22],[24,320],[364,320]].forEach(([x,y])=>s+=`<circle cx="${x}" cy="${y}" r="2.6" fill="#8a8c8a" stroke="#3a3c3b" stroke-width=".6"/>`);
  s+=`<g transform="translate(${SX} ${SY})">${screenInner()}</g>`;
  // under the screen: HAMEG plate, model, CAL output, component tester
  s+=`<rect x="22" y="344" width="92" height="26" rx="2" fill="#1d2f5c"/>`+T(68,362,'HAMEG',{size:15,fill:'#f1f1ec',a:'middle',w:700})+T(126,354,'Oscilloscope HM 203-7',{size:7.5,fill:'#2b2f33',w:600})+T(126,366,'20 MHz · dual trace',{size:6.5,fill:'#55595b'});
  s+=LB(254,350,'CAL.',{size:6.5})+LB(254,359,'0.2 V ⎍ 1 kHz',{size:5.5,w:400})+`<circle cx="254" cy="374" r="5" fill="#c8a24a" stroke="#6b5a2e"/><circle cx="254" cy="374" r="1.8" fill="#6b5a2e"/>`;
  s+=LB(312,350,'COMPONENT',{size:6})+LB(312,358,'TESTER',{size:6})+HK(300,374,20,16,'COMP',sc.comp)+`<circle cx="330" cy="374" r="6" fill="#2c3133" stroke="#111"/><circle cx="330" cy="374" r="2.2" fill="#c8a24a"/>`;
  s+=T(24,396,'Made in Germany',{size:6,fill:'#6a6d6e'})+T(24,410,'⏚ 1 MΩ ∥ 25 pF · max. 400 V',{size:6,fill:'#6a6d6e'});
  // right side: upper block (beam, time base, trigger) and lower block (vertical)
  s+=`<rect x="384" y="14" width="366" height="214" rx="6" fill="#ecebe5" stroke="#b4b1a8"/><rect x="384" y="234" width="366" height="132" rx="6" fill="#ecebe5" stroke="#b4b1a8"/>`;
  // POWER + lamp, INTENS, FOCUS, TR
  s+=LB(408,28,'POWER',{fill:'#b3261e'})+`<rect x="396" y="34" width="24" height="18" rx="3" fill="#7c7a72" opacity=".5"/><rect x="396" y="${sc.pwr?34:32}" width="24" height="18" rx="3" fill="#c7362c" stroke="#7e1d16" data-k="s:PWR" style="cursor:pointer"/>`+lamp(432,42,sc.pwr,'#58e070');
  s+=ENGINE.knob(418,96,12,'#5d6164','s:INT','INTENS',null,{ang:(-135+270*sc.intens)*Math.PI/180,fill:'#d9d7d0'});
  s+=ENGINE.knob(418,160,12,'#5d6164','s:FOC','FOCUS',null,{ang:sc.focus*135*Math.PI/180,fill:'#d9d7d0'});
  s+=`<circle cx="418" cy="208" r="6" fill="#bdbab2" stroke="#5d6164" data-k="knob:s:TR" data-knob="s:TR"/><line x1="${418-Math.cos(sc.tr)*5}" y1="${208-Math.sin(sc.tr)*5}" x2="${418+Math.cos(sc.tr)*5}" y2="${208+Math.sin(sc.tr)*5}" stroke="#3b3e40" stroke-width="1.4" pointer-events="none"/>`+
     `<rect x="396" y="198" width="12" height="20" fill="transparent" data-k="s:TR-" style="cursor:pointer"/><rect x="428" y="198" width="12" height="20" fill="transparent" data-k="s:TR+" style="cursor:pointer"/>`+T(400,212,'◂',{size:8,fill:'#55595b'})+T(431,212,'▸',{size:8,fill:'#55595b'})+LB(450,211,'TR',{size:6.5});
  // X-MAG, X-POS, X-Y
  s+=LB(486,28,'X-MAG. x10')+HK(486,42,26,16,'XMAG',sc.xmag);
  s+=ENGINE.knob(486,96,12,'#5d6164','s:XP','X-POS.',null,{ang:sc.hpos/5*135*Math.PI/180,fill:'#d9d7d0'});
  s+=LB(486,150,'X-Y')+HK(486,164,26,16,'XY',sc.xy);
  s+=LB(486,192,'(CH I = X)',{size:5.5,w:400});
  // TIME/DIV with its VAR cap, UNCAL lamp
  const ti=HTD.findIndex(v=>Math.abs(v-sc.td)/v<1e-6);
  s+=bigKnob(584,96,28,'TD','TIME / DIV.',ti<0?7:ti,HTD.length,'TV',sc.tvar,[[0,'.2s'],[7,'1ms'],[10,'.1ms'],[17,'.5µs']]);
  s+=lamp(548,176,sc.tvar>0)+T(556,178,'UNCAL',{size:6,fill:'#2b2f33',w:600});
  // TRIGGER
  s+=`<rect x="654" y="22" width="88" height="198" rx="5" fill="none" stroke="#b4b1a8"/>`+LB(698,32,'TRIGGER',{size:7});
  s+=ENGINE.knob(698,62,12,'#5d6164','s:LV','LEVEL',null,{ang:clamp(sc.trig.level/6,-1,1)*135*Math.PI/180,fill:'#d9d7d0'});
  let tok=false;if(sc.pwr&&!sc.xy&&!sc.comp){const sg=[0,1,2,3].map(dsig);tok=trigger(sg).ok}
  s+=lamp(730,44,tok,'#58e070')+T(722,52,'TR',{size:5.5,fill:'#2b2f33'});
  s+=LB(676,112,'AT/NORM',{size:6})+HK(676,126,30,16,'ATN',sc.trig.mode==='NORM');
  s+=LB(720,112,'+/−',{size:6})+HK(720,126,30,16,'SLP',sc.trig.slope==='-');
  s+=LB(698,156,'TRIG. COUPL.',{size:6})+`<rect x="664" y="162" width="68" height="16" rx="2" fill="#bdbab2" stroke="#6e6c66" data-k="s:TCPL" style="cursor:pointer"/>`;
  TCPLS.forEach((t,i)=>{const x=672+i*17;s+=T(x,192,t,{size:5.5,fill:'#2b2f33',a:'middle'});if(t===sc.trig.cpl)s+=`<rect x="${x-6}" y="164" width="12" height="12" rx="1.5" fill="#3b3e40" pointer-events="none"/>`});
  s+=T(698,208,`TRIG. ${sc.trig.src?'II':'I'}`,{size:6,fill:'#55595b',a:'middle'});
  // vertical: Y-POS I, VOLTS/DIV I, VOLTS/DIV II, Y-POS II
    s+=ENGINE.knob(410,296,12,'#5d6164','s:Y1','Y-POS. I',null,{ang:clamp(sc.ch[0].pos/6,-1,1)*135*Math.PI/180,fill:'#d9d7d0'});
  s+=ENGINE.knob(724,296,12,'#5d6164','s:Y2','Y-POS. II',null,{ang:clamp(sc.ch[1].pos/6,-1,1)*135*Math.PI/180,fill:'#d9d7d0'});
  [0,1].forEach(c=>{const cx=c?636:500,ch=sc.ch[c];const vi=HVD.findIndex(v=>Math.abs(v-ch.vd)/v<1e-6);
    s+=bigKnob(cx,300,24,'V'+(c+1),'',vi<0?5:vi,HVD.length,'VV'+(c+1),ch.var||0,[[0,'20V'],[5,'.5'],[8,'50m'],[11,'5mV']]);
    s+=LB(cx,248,`VOLTS/DIV. CH ${c?'II':'I'}`,{size:6.5})+lamp(cx+(c?-46:46),262,(ch.var||0)>0)+T(cx+(c?-46:46),254,'UNCAL',{size:5,fill:'#2b2f33',a:'middle'})});
  // bottom strip: CH I input (HOR. INP. X), AC/DC, GD, mode keys, INVERT, GD, AC/DC, CH II input
  s+=`<rect x="384" y="372" width="366" height="62" rx="6" fill="#d3d0c7" stroke="#b4b1a8"/>`;
  s+=LB(404,385,'CH I (X)',{size:6.5})+LB(730,385,'CH II (Y)',{size:6.5});
  const keys=[[438,'AC/DC','AC1',sc.ch[0].cpl==='AC'],[470,'GD','GD1',sc.ch[0].cpl==='GND'],[512,'CH I/II','CH12',sc.ch2sel],[546,'DUAL','DUAL',sc.dual],[580,'ADD','ADD',sc.add],[618,'INV. II','INV',sc.ch[1].inv],[662,'GD','GD2',sc.ch[1].cpl==='GND'],[694,'AC/DC','AC2',sc.ch[1].cpl==='AC']];
  keys.forEach(([x,l,k,on])=>{s+=LB(x,388,l,{size:5.5})+HK(x,406,26,18,k,on)});
  s+=T(512,427,'TRIG. I/II',{size:5,fill:'#55595b',a:'middle'})+T(580,427,'CHOP = DUAL+ADD',{size:5,fill:'#55595b',a:'middle'});
  BNC.forEach((p,i)=>{const x=p.x-C0.x,y=p.y-C0.y;s+=`<circle cx="${x}" cy="${y}" r="15" fill="#8b9599" opacity=".45"/><circle cx="${x}" cy="${y}" r="13" fill="url(#hmNut)" stroke="#5f696e" stroke-width="1.2"/>`+
    `<rect x="${x-15.5}" y="${y-2}" width="4" height="4" rx="1" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/><rect x="${x+11.5}" y="${y-2}" width="4" height="4" rx="1" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/>`+
    `<circle cx="${x}" cy="${y}" r="8.5" fill="#30383c"/><circle cx="${x}" cy="${y}" r="5" fill="#e9ecec"/><circle cx="${x}" cy="${y}" r="2" fill="#c8a24a"/>`});
  s+=`<circle cx="745" cy="120" r="7" fill="url(#hmNut)" stroke="#5f696e"/><circle cx="745" cy="120" r="3" fill="#30383c"/>`;
  return s+'</g>'}
let msgTimer=null;function flash(m){const sc=S();sc.msg=m;clearTimeout(msgTimer);msgTimer=setTimeout(()=>{if(RT.S.sc)RT.S.sc.msg='';RT.render()},1300);try{if(typeof BENCH!=='undefined'&&BENCH.say)BENCH.say(m)}catch(_){}}
/* step a value list: dir +1 = clockwise = towards the end of the list */
function stepL(arr,v,dir){let i=arr.findIndex(x=>Math.abs(x-v)/Math.abs(x)<1e-6);if(i<0)i=0;return arr[clamp(i+dir,0,arr.length-1)]}
const r1=x=>Math.round(x*100)/100;
function hmKey(k){const sc=S();
  let m=k.match(/^(INT|FOC|TR|XP|TD|TV|LV|V1|V2|VV1|VV2|Y1|Y2)([+-])$/);
  if(m){const d=m[2]==='+'?1:-1;switch(m[1]){
    case 'INT':sc.intens=r1(clamp(sc.intens+d*0.05,0,1));break;
    case 'FOC':sc.focus=r1(clamp(sc.focus+d*0.1,-1,1));break;
    case 'TR':sc.tr=r1(clamp(sc.tr+d*0.1,-1,1));break;
    case 'XP':sc.hpos=r1(clamp(sc.hpos+d*0.2,-6,6));break;
    case 'TD':sc.td=stepL(HTD,sc.td,d);break;
    case 'TV':sc.tvar=clamp(sc.tvar-d,0,10);break;
    case 'LV':sc.trig.level=r1(clamp(sc.trig.level+d*0.2,-8,8));break;
    case 'V1':case 'V2':{const ch=sc.ch[+m[1][1]-1];ch.vd=stepL(HVD,ch.vd,d);break}
    case 'VV1':case 'VV2':{const ch=sc.ch[+m[1][2]-1];ch.var=clamp((ch.var||0)-d,0,10);break}
    case 'Y1':case 'Y2':{const ch=sc.ch[+m[1][1]-1];ch.pos=r1(clamp(ch.pos+d*0.2,-6,6));break}}
    return}
  switch(k){
    case 'PWR':sc.pwr=!sc.pwr;break;
    case 'XMAG':sc.xmag=!sc.xmag;break;
    case 'XY':sc.xy=!sc.xy;break;
    case 'COMP':sc.comp=!sc.comp;if(sc.comp&&sc.pwr)flash('Component tester: open test jacks → horizontal line');break;
    case 'ATN':sc.trig.mode=sc.trig.mode==='AT'?'NORM':'AT';break;
    case 'SLP':sc.trig.slope=sc.trig.slope==='+'?'-':'+';break;
    case 'TCPL':sc.trig.cpl=TCPLS[(TCPLS.indexOf(sc.trig.cpl)+1)%TCPLS.length];break;
    case 'CH12':case 'TSRC':sc.ch2sel=!sc.ch2sel;break;
    case 'DUAL':sc.dual=!sc.dual;break;
    case 'ADD':sc.add=!sc.add;break;
    case 'INV':sc.ch[1].inv=!sc.ch[1].inv;break;
    /* AC/DC and GD are independent push-buttons; GD wins (input grounded) while it is pressed */
    case 'AC1':case 'AC2':case 'GD1':case 'GD2':{const ch=sc.ch[+k[2]-1];const st={ac:ch.cpl==='AC'||(ch.cpl==='GND'&&!!ch.acUnder),gd:ch.cpl==='GND'};
      if(k[0]==='A')st.ac=!st.ac;else st.gd=!st.gd;ch.acUnder=st.ac;ch.cpl=st.gd?'GND':st.ac?'AC':'DC';break}
    default:return}
  syncOn()}
function fresh(){const sc=scNew();if(opt.prev)opt.prev(sc);return sc}
function knobInfo(b){const sc=S();const cal=v=>v>0?' (UNCAL)':'';
  switch(b){case 'INT':return 'INTENS '+Math.round(sc.intens*100)+'%';case 'FOC':return 'FOCUS '+(sc.focus>0?'+':'')+sc.focus.toFixed(1);case 'TR':return 'TRACE ROT. '+sc.tr.toFixed(1);
    case 'XP':return 'X-POS '+sc.hpos.toFixed(1)+' div';case 'TD':return fmtTd(sc.td)+'/div'+cal(sc.tvar)+(sc.xmag?' ×10':'');case 'TV':return sc.tvar?'TIME VAR '+vf(sc.tvar).toFixed(2)+'×':'TIME VAR CAL';
    case 'LV':return 'LEVEL '+sc.trig.level.toFixed(1);case 'V1':case 'V2':{const ch=sc.ch[+b[1]-1];return `CH ${b[1]==='1'?'I':'II'} ${fmtVd(ch.vd)}/div`+cal(ch.var||0)}
    case 'VV1':case 'VV2':{const ch=sc.ch[+b[2]-1];return (ch.var?'VAR '+vf(ch.var).toFixed(2)+'×':'VAR CAL')}
    case 'Y1':case 'Y2':return `Y-POS ${b[1]==='1'?'I':'II'} ${sc.ch[+b[1]-1].pos.toFixed(1)} div`}return b}
return {key:'sc',prefix:'s',name:['Hameg HM 203-7','راسم الإشارة التماثلي'],bnc:BNC,size:[W,H],
  leads:[0,1].flatMap(c=>{const n=c?'CH II':'CH I',p=BNC[c];return [{k:`c${c+1}r`,label:n,from:{x:p.x-14,y:p.y},coax:true,grp:`c${c+1}r`,jat:p,tray:n+' probe',jn:n},{k:`c${c+1}b`,label:n+' ⏚',from:{x:p.x+14,y:p.y},earth:true,coax:true,grp:`c${c+1}r`}]}),
  cables:D=>[0,1].map(c=>D.coax(BNC[c],`c${c+1}r`,`c${c+1}b`,c?'CH II':'CH I')).join(''),
  /* each plugged input loads its node with 1 MΩ to earth */
  stamp(ck){const L=RT.S.leads;const pr=[0,1].map(c=>{const l=L[`c${c+1}r`];if(!l||l.node==null)return null;const p=ck.idx(l.node);if(p>=0)ck.els.push({t:'G',a:p,b:-1,g:1e-6});return p});
    ck.probes=[pr[0],pr[1],null,null];ck.p1=pr[0];ck.p2=pr[1]},
  touchMenu:()=>null,knobInfo,fresh,scNew,chNew,svg:hmSVG,screenInner,dsig,flash,keyFn:hmKey,mode,vdEff,tdEff,HTD,HVD,
  wheel:['INT','FOC','TR','XP','TD','TV','LV','V1','V2','VV1','VV2','Y1','Y2']};
};
ENGINE.hameg.size=[760,440];
