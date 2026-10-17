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
const W=760,H=380;                                    // real front ≈ 285 × 145 mm
const SK=0.87,SX=52-18*SK,SY=44-32*SK;              // the screen's own coordinates (12…348 × 26…312) scaled into the CRT face 52…334 × 44…282
const GX=40,GY=57,DX=28,DY=28,GW=280,GH=224;          // graticule: 10 × 8 div of 28 units (≈ 1 cm)
const CXS=GX+GW/2,CYS=GY+GH/2;
const BNC=[{x:C0.x+416,y:C0.y+338},{x:C0.x+706,y:C0.y+338}];
const HTD=[0.1,0.05,0.02,0.01,5e-3,2e-3,1e-3,5e-4,2e-4,1e-4,5e-5,2e-5,1e-5,5e-6,2e-6,1e-6,5e-7,2e-7];   // TIME/DIV as printed on the dial, anticlockwise → clockwise
const HVD=[20,10,5,2,1,0.5,0.2,0.1,0.05,0.02,0.01,0.005];                                        // VOLTS/DIV, anticlockwise → clockwise
const TCPLS=['AC','DC','HF','LF','~'],TVSS=['OFF','TV:H','TV:V'];
const PH='#f4fff2',GLOW='#c9ffd4';                    // the beam on the teal face: a bright near-white core in a pale green glow
function chNew(on){return {on,vd:0.5,var:0,pos:0,cpl:'DC',inv:false,probe:1}}
function scNew(){return {pwr:false,intens:0.6,focus:0,tr:0,xmag:false,hpos:0,td:1e-3,tvar:0,
  ch:[chNew(true),chNew(false),chNew(false),chNew(false)],ch2sel:false,dual:false,add:false,xy:false,comp:false,
  trig:{src:0,slope:'+',mode:'AT',level:0,cpl:'AC'},run:true,frozen:null,msg:'',meas:[]}}
const S=()=>RT.S.sc;
const vf=v=>1+0.15*v;                                  // VAR off CAL: up to 2.5 × the dial value
const vdEff=c=>S().ch[c].vd*vf(S().ch[c].var||0)/(S().ch[c].mag?5:1);   // ×5 Y MAG.
const tdEff=()=>S().td*vf(S().tvar);
/* which traces the beam draws: 'I', 'II', 'DUAL' (alternate), 'CHOP', 'ADD' */
function mode(){const sc=S();if(sc.dual&&sc.add)return 'CHOP';if(sc.dual)return 'DUAL';if(sc.add)return 'ADD';return sc.ch2sel?'II':'I'}
function syncOn(){const sc=S(),m=mode();sc.ch[0].on=m!=='II';sc.ch[1].on=m!=='I';sc.trig.src=sc.ch2sel?1:0}
function dsig(c){const b=RT.chanSig(c),ch=S().ch[c];const k=(ch.inv?-1:1)*(ch.probe||1);return {fn:ph=>k*b.fn(ph),max:k>0?k*b.max:k*b.min,min:k>0?k*b.min:k*b.max,has:b.has}}
/* trigger: the phase (one period of RT.sigF()) where the source crosses the level with the chosen slope; null = no crossing */
function trigPhase(s,L,slope){let prev=s(-2*Math.PI/1440);
  for(let i=0;i<=1440;i++){const ph=2*Math.PI*i/1440,v=s(ph);if(slope==='+'?(prev<L&&v>=L):(prev>L&&v<=L))return ph;prev=v}return null}
function trigger(sg,ci){const sc=S(),t=sc.trig,src=sg[ci==null?t.src:ci];
  if(t.ext||t.cpl==='~')return {ph:null,ok:false,free:t.mode==='AT'};   // EXT: TRIG. INP. is empty · ~: line trigger, not locked to the generator
  if(!src.has)return {ph:null,ok:false,free:true};
  let mean=0;if(t.cpl!=='DC'){for(let k=0;k<240;k++)mean+=src.fn(2*Math.PI*k/240)/240}
  const s=ph=>src.fn(ph)-mean,L=t.level*vdEff(t.src);
  let ph=trigPhase(s,L,t.slope);if(ph!=null)return {ph,ok:true};
  if(t.mode==='AT'){ph=trigPhase(ph=>src.fn(ph)-(src.max+src.min)/2,0,t.slope);if(ph!=null)return {ph,ok:true}}   // AT: level out of range → triggers on the mean
  return {ph:null,ok:false,free:t.mode==='AT'}}
let uid=0;
function screenInner(){const sc=S();const id='hm'+(uid++);
  const blur=Math.abs(sc.focus)*1.8,I=sc.intens;
  let s=`<defs><radialGradient id="${id}g" cx=".5" cy=".46" r=".62"><stop offset="0" stop-color="#5cbfac"/><stop offset=".7" stop-color="#3f9d8c"/><stop offset="1" stop-color="#2b7467"/></radialGradient>`+
    `<clipPath id="${id}c"><rect x="18" y="32" width="324" height="274" rx="20"/></clipPath>`+(blur>0.05?`<filter id="${id}f" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter>`:'')+`</defs>`;
  s+=`<rect x="12" y="26" width="336" height="286" rx="6" fill="#151a1a"/><rect x="18" y="32" width="324" height="274" rx="20" fill="url(#${id}g)"/>`;
  // internal graticule: 10 × 8 div, 5 subdivisions on the centre lines, dotted 10 % / 90 % rise-time lines
  let g='';for(let i=0;i<=10;i++)g+=`<line x1="${GX+i*DX}" y1="${GY}" x2="${GX+i*DX}" y2="${GY+GH}"/>`;for(let j=0;j<=8;j++)g+=`<line x1="${GX}" y1="${GY+j*DY}" x2="${GX+GW}" y2="${GY+j*DY}"/>`;
  for(let i=0;i<=50;i++){const x=GX+i*DX/5;g+=`<line x1="${x}" y1="${CYS-2.5}" x2="${x}" y2="${CYS+2.5}"/>`}for(let j=0;j<=40;j++){const y=GY+j*DY/5;g+=`<line x1="${CXS-2.5}" y1="${y}" x2="${CXS+2.5}" y2="${y}"/>`}
  s+=`<g stroke="#1e5a50" stroke-opacity=".75" stroke-width=".8">${g}</g><g stroke="#1e5a50" stroke-opacity=".6" stroke-width=".7" stroke-dasharray="1.5 2.5"><line x1="${GX}" y1="${GY+DY*0.4}" x2="${GX+GW}" y2="${GY+DY*0.4}"/><line x1="${GX}" y1="${GY+GH-DY*0.4}" x2="${GX+GW}" y2="${GY+GH-DY*0.4}"/></g>`;
  s+=T(GX+GW-2,GY+GH+13,'%',{size:7,fill:'#1e5a50'})+T(GX+2,GY+GH+13,'HAMEG',{size:6.5,fill:'#1e5a50'});
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
      if(m==='DUAL'&&sc.trig.alt){[0,1].forEach((c,j)=>{const t2=trigger(sg,c);if(t2.ok)traces.push(sweep(fns[j],t2.ph,1));else if(t2.free)traces.push(sweep(fns[j],(performance.now()/97*(j+1))%(2*Math.PI),0.45))})}   // ALT.: each trace triggers on its own channel
      else if(tr.ok)fns.forEach(fn=>traces.push(sweep(fn,tr.ph,1)));
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
/* ---------- front panel: drawn from docs/ee205/instruments/ref/hameg-hm203-7.jpg (layout, labels) with the lab unit's colours
   (black keys, dark grey knobs, blue LEVEL, black dial skirts with red VAR caps); see hameg-notes.md ---------- */
const INK='#23272a',CASE='#d6d1c3',PANEL='#ebe8df',FIELD='#cfccc3';
const LB=(x,y,s,o={})=>T(x,y,s,Object.assign({size:7.2,fill:INK,a:'middle',w:700},o));
/* a latching push key (black on the lab's unit): pressed = sits lower and darker */
const HK=(x,y,k,on,o={})=>{const w=o.w||21,h=o.h||19;return `<rect x="${x-w/2-1}" y="${y-h/2-1}" width="${w+2}" height="${h+3}" rx="2.5" fill="#9d998e"/>`+
  `<rect x="${x-w/2}" y="${y-h/2+(on?1.6:0)}" width="${w}" height="${h-(on?1.6:0)}" rx="2" fill="${on?'#141516':'url(#hmKey)'}" stroke="#0c0c0c" stroke-width=".8" data-k="s:${k}" style="cursor:pointer"/>`+
  (on?'':`<rect x="${x-w/2+2.5}" y="${y-h/2+2}" width="${w-5}" height="2.2" rx="1" fill="#5c5f62" opacity=".7" pointer-events="none"/>`)};
const lampSq=(x,y,on,col,w=13,h=9)=>`<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="1.5" fill="${on?col:'#8a8257'}" stroke="#6d6a60" stroke-width=".8"/>`+(on?`<rect x="${x-w/2-3}" y="${y-h/2-3}" width="${w+6}" height="${h+6}" rx="3" fill="${col}" opacity=".3"/>`:'');
const angOf=(i,n,sweep=300)=>(-sweep/2+sweep*i/(n-1))*Math.PI/180;
/* a knob as on the real panel: fluted body, pointer line; small − / + chevrons beside it (wheel, drag and the touch pad work too) */
function hk(cx,cy,r,key,ang,body='#4b4f52',o={}){let s=`<circle cx="${cx}" cy="${cy}" r="${r*1.7}" fill="transparent" data-k="knob:${key}" data-knob="${key}"/>`;
  s+=`<circle cx="${cx}" cy="${cy+1.6}" r="${r}" fill="#000" opacity=".22"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${body}" stroke="#1b1d1e" stroke-width="1.1" data-k="knob:${key}" data-knob="${key}"/>`;
  for(let k=0;k<12;k++){const a=k*Math.PI/6;s+=`<line x1="${(cx+Math.sin(a)*(r-1.2)).toFixed(1)}" y1="${(cy-Math.cos(a)*(r-1.2)).toFixed(1)}" x2="${(cx+Math.sin(a)*(r-3.2)).toFixed(1)}" y2="${(cy-Math.cos(a)*(r-3.2)).toFixed(1)}" stroke="#fff" stroke-opacity=".16" stroke-width="1.6" pointer-events="none"/>`}
  s+=`<circle cx="${cx-r*0.25}" cy="${cy-r*0.3}" r="${r*0.55}" fill="#fff" opacity=".12" pointer-events="none"/>`;
  s+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.sin(ang)*(r-2)).toFixed(1)}" y2="${(cy-Math.cos(ang)*(r-2)).toFixed(1)}" stroke="${o.pc||'#f2f2ee'}" stroke-width="1.8" stroke-linecap="round" pointer-events="none"/>`;
  if(!o.noArrows){const d=r+7;s+=`<path d="M${cx-d} ${cy} l5 -4 v8 z" fill="#8b877c" pointer-events="none"/><rect x="${cx-d-6}" y="${cy-9}" width="13" height="18" fill="transparent" data-k="${key}-" style="cursor:pointer"/>`+
    `<path d="M${cx+d} ${cy} l-5 -4 v8 z" fill="#8b877c" pointer-events="none"/><rect x="${cx+d-7}" y="${cy-9}" width="13" height="18" fill="transparent" data-k="${key}+" style="cursor:pointer"/>`}
  return s}
/* the big rotary switch: grey dial field with its printed scale, black fluted skirt, white ring and the red VAR cap (its own knob) */
function bigKnob(cx,cy,r,key,idx,n,varKey,varVal,labels,sweep){let s='';
  labels.forEach(([i,t,o])=>{const a=angOf(i,n,sweep),rr=r+(o&&o.r||13);s+=T((cx+Math.sin(a)*rr).toFixed(1),(cy-Math.cos(a)*rr+2.6).toFixed(1),t,Object.assign({size:7.4,fill:INK,a:'middle',w:700},o||{}))});
  for(let i=0;i<n;i++){const a=angOf(i,n,sweep);s+=`<line x1="${(cx+Math.sin(a)*(r+2)).toFixed(1)}" y1="${(cy-Math.cos(a)*(r+2)).toFixed(1)}" x2="${(cx+Math.sin(a)*(r+5)).toFixed(1)}" y2="${(cy-Math.cos(a)*(r+5)).toFixed(1)}" stroke="#77736a" stroke-width="1"/>`}
  const a=angOf(idx,n,sweep);s+=`<circle cx="${cx}" cy="${cy}" r="${r*1.25}" fill="transparent" data-k="knob:s:${key}" data-knob="s:${key}"/>`;
  s+=`<circle cx="${cx}" cy="${cy+2}" r="${r}" fill="#000" opacity=".25"/>`;
  let sk='';for(let k=0;k<16;k++){const b=a+k*Math.PI/8,b2=b+Math.PI/16;sk+=`${k?'L':'M'}${(cx+Math.sin(b)*r).toFixed(1)} ${(cy-Math.cos(b)*r).toFixed(1)}L${(cx+Math.sin(b2)*(r-2.5)).toFixed(1)} ${(cy-Math.cos(b2)*(r-2.5)).toFixed(1)}`}
  s+=`<path d="${sk}Z" fill="#1f2123" stroke="#0b0b0b" stroke-width=".8" data-k="knob:s:${key}" data-knob="s:${key}" style="cursor:pointer"/>`;
  s+=`<path d="M${(cx+Math.sin(a)*(r+1.5)).toFixed(1)} ${(cy-Math.cos(a)*(r+1.5)).toFixed(1)} L${(cx+Math.sin(a-0.2)*(r-6)).toFixed(1)} ${(cy-Math.cos(a-0.2)*(r-6)).toFixed(1)} L${(cx+Math.sin(a+0.2)*(r-6)).toFixed(1)} ${(cy-Math.cos(a+0.2)*(r-6)).toFixed(1)}Z" fill="#e9e7e0" pointer-events="none"/>`;
  const d=r+9;s+=`<path d="M${cx-d-3} ${cy} l5 -4 v8 z" fill="#3c3f42" pointer-events="none"/><path d="M${cx+d+3} ${cy} l-5 -4 v8 z" fill="#3c3f42" pointer-events="none"/><rect x="${cx-d-8}" y="${cy-10}" width="14" height="20" fill="transparent" data-k="s:${key}-" style="cursor:pointer"/><rect x="${cx+d-6}" y="${cy-10}" width="14" height="20" fill="transparent" data-k="s:${key}+" style="cursor:pointer"/>`;
  /* the red VAR cap's own ◀ ▶, under the switch */
  {const y=cy+r+9,x=8;s+=`<path d="M${cx-x-4} ${y} l5 -3.5 v7 z" fill="#b8473e" pointer-events="none"/><path d="M${cx+x+4} ${y} l-5 -3.5 v7 z" fill="#b8473e" pointer-events="none"/><rect x="${cx-x-8}" y="${y-8}" width="12" height="16" fill="transparent" data-k="s:${varKey}-" style="cursor:pointer"/><rect x="${cx+x-4}" y="${y-8}" width="12" height="16" fill="transparent" data-k="s:${varKey}+" style="cursor:pointer"/>`}
  const rv=r*0.46,va=(-135+270*(1-varVal/10))*Math.PI/180;
  s+=`<circle cx="${cx}" cy="${cy}" r="${rv+2.6}" fill="#e8e6df" stroke="#9c988d" stroke-width=".6" pointer-events="none"/>`;
  s+=`<circle cx="${cx}" cy="${cy}" r="${rv}" fill="#d8352b" stroke="#8d1f17" stroke-width="1.2" data-k="knob:s:${varKey}" data-knob="s:${varKey}" style="cursor:pointer"/>`;
  s+=`<path d="M${(cx+Math.sin(va)*(rv-1.5)).toFixed(1)} ${(cy-Math.cos(va)*(rv-1.5)).toFixed(1)} L${(cx+Math.sin(va+2.6)*(rv-3)).toFixed(1)} ${(cy-Math.cos(va+2.6)*(rv-3)).toFixed(1)} L${(cx+Math.sin(va-2.6)*(rv-3)).toFixed(1)} ${(cy-Math.cos(va-2.6)*(rv-3)).toFixed(1)}Z" fill="none" stroke="#fff" stroke-width="1.4" stroke-linejoin="round" pointer-events="none"/>`;
  return s}
/* a slide switch with its position labels at the left (TV SEP., trigger coupling) */
function slide(x,y0,y1,key,labels,cur){let s=`<rect x="${x-5.5}" y="${y0}" width="11" height="${y1-y0}" rx="2" fill="#3c3f41" stroke="#1d1f20" data-k="s:${key}" style="cursor:pointer"/>`;
  const n=labels.length,st=(y1-y0-14)/(n-1);labels.forEach((t,i)=>{s+=T(x-9,y0+7+i*st+2.6,t,{size:6.6,fill:INK,a:'end',w:700})});
  const yy=y0+7+cur*st;s+=`<rect x="${x-7}" y="${yy-7}" width="14" height="14" rx="2" fill="url(#hmKey)" stroke="#0c0c0c" stroke-width=".8" pointer-events="none"/><line x1="${x-4}" y1="${yy}" x2="${x+4}" y2="${yy}" stroke="#888" pointer-events="none"/>`;return s}
const bnc=(x,y,r=17)=>`<circle cx="${x}" cy="${y}" r="${r+2}" fill="#a8a294" opacity=".5"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#hmNut)" stroke="#5f696e" stroke-width="1.2"/>`+
  `<rect x="${x-r-2.5}" y="${y-2}" width="4.5" height="4" rx="1" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/><rect x="${x+r-2}" y="${y-2}" width="4.5" height="4" rx="1" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/>`+
  `<circle cx="${x}" cy="${y}" r="${r*0.62}" fill="#2a3134"/><circle cx="${x}" cy="${y}" r="${r*0.36}" fill="#e9ecec"/><circle cx="${x}" cy="${y}" r="${r*0.14}" fill="#c8a24a"/>`;
const jack4=(x,y,col='#1b1c1d')=>`<circle cx="${x}" cy="${y}" r="9" fill="#b9b4a8"/><circle cx="${x}" cy="${y}" r="7" fill="${col}" stroke="#000" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="2.6" fill="#555"/>`;
function hmSVG(){const sc=S();syncOn();let s=`<g transform="translate(${C0.x} ${C0.y})">`;
  s+=`<defs><linearGradient id="hmKey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d40"/><stop offset="1" stop-color="#1b1d1f"/></linearGradient>`+
     `<radialGradient id="hmNut" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f0f1f1"/><stop offset="1" stop-color="#9ba1a3"/></radialGradient>`+
     `<linearGradient id="hmBz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece8dc"/><stop offset="1" stop-color="#cdc8b9"/></linearGradient></defs>`;
  // case and the tilt-stand arms
  s+=`<rect x="-4" y="${H-30}" width="8" height="${50}" rx="3" fill="#b8b6b0" stroke="#86847e"/><rect x="${W-4}" y="${H-30}" width="8" height="50" rx="3" fill="#b8b6b0" stroke="#86847e"/>`;
  s+=`<rect width="${W}" height="${H}" rx="14" fill="${CASE}" stroke="#9a9586" stroke-width="2"/><rect x="5" y="5" width="${W-10}" height="${H-10}" rx="10" fill="#e3dfd3"/>`;
  // CRT bezel and face
  s+=`<rect x="21" y="12" width="354" height="287" rx="16" fill="url(#hmBz)" stroke="#a9a493" stroke-width="1.5"/><rect x="38" y="30" width="318" height="262" rx="12" fill="#c4bead"/><rect x="47" y="39" width="300" height="248" rx="9" fill="#1d2b28"/>`;
  s+=`<defs><clipPath id="hmFace"><rect x="50" y="42" width="294" height="242" rx="8"/></clipPath></defs><g clip-path="url(#hmFace)"><g transform="translate(${SX} ${SY}) scale(${SK})">${screenInner()}</g></g>`;
  // bottom strip under the screen: HAMEG plate, X-MAG, CAL, COMPONENT TESTER
  s+=`<rect x="21" y="306" width="356" height="64" rx="5" fill="#e7e3d8" stroke="#bdb8aa"/>`;
  s+=`<rect x="27" y="312" width="115" height="52" rx="3" fill="#f1eee6" stroke="#cbc6b8"/>`+T(84,331,'HAMEG',{size:17,fill:'none',a:'middle',w:900,stroke:'#151515',sw:1.3,ls:3})+T(84,346,'20 MHz Oscilloscope',{size:7.6,fill:INK,a:'middle',w:700})+T(84,360,'HM 203-7',{size:10,fill:INK,a:'middle',w:800});
  s+=`<rect x="150" y="312" width="42" height="52" fill="${FIELD}"/>`+LB(171,322,'X-MAG.')+HK(171,338,'XMAG',sc.xmag)+LB(171,358,'x 10',{size:6.8});
  s+=`<rect x="198" y="312" width="66" height="52" fill="${FIELD}"/><rect x="204" y="320" width="22" height="34" rx="3" fill="#9b968a" stroke="#5f5b52"/><rect x="208" y="324" width="14" height="10" rx="1.5" fill="#d8d6d0" stroke="#5f5b52"/><rect x="208" y="340" width="14" height="10" rx="1.5" fill="#d8d6d0" stroke="#5f5b52"/>`+
     LB(246,323,'CAL.')+LB(246,333,'0.2 V',{size:6.6})+LB(246,347,'2 V',{size:6.6})+`<path d="M238 359 h3 v-5 h5 v5 h5 v-5 h3" fill="none" stroke="${INK}" stroke-width="1"/>`;
  s+=`<rect x="278" y="312" width="94" height="52" rx="4" fill="#e3dfd3" stroke="#bdb8aa"/>`+LB(325,322,'COMPONENT')+HK(298,340,'COMP',sc.comp)+jack4(352,340)+LB(325,360,'TESTER');
  // right: upper and lower blocks
  s+=`<rect x="384" y="12" width="370" height="187" rx="6" fill="${PANEL}" stroke="#b9b5a8"/><rect x="384" y="203" width="370" height="170" rx="6" fill="${PANEL}" stroke="#b9b5a8"/>`;
  // POWER, X-Y
  s+=`<rect x="392" y="17" width="78" height="44" rx="3" fill="${FIELD}"/>`+LB(412,26,'POWER')+LB(412,34,'◂on/off ▬',{size:5.6})+`<path d="M455 20 l6 10 h-12 z" fill="none" stroke="${INK}" stroke-width="1"/>`+T(455,29,'!',{size:6,fill:INK,a:'middle',w:800});
  s+=`<rect x="398" y="${sc.pwr?42:40}" width="30" height="15" rx="2" fill="#e8362b" stroke="#8d1f17" data-k="s:PWR" style="cursor:pointer"/>`+lampSq(447,48,sc.pwr,'#ffe14a',15,10);
  s+=LB(479,24,'X - Y')+HK(479,46,'XY',sc.xy);
  // INTENS / TR / FOCUS recess, X-POS, HOLD OFF
  s+=`<rect x="393" y="70" width="82" height="118" rx="4" fill="#f4f2ec" stroke="#c9c5b9"/>`;
  s+=hk(414,97,13,'s:INT',(-135+270*sc.intens)*Math.PI/180,'#2f9a52')+LB(414,121,'INTENS.');
  s+=LB(450,86,'TR',{size:6.6})+`<rect x="440" y="91" width="20" height="14" rx="2" fill="${FIELD}"/><circle cx="450" cy="98" r="4" fill="#5c0d0d" stroke="#2a0606" data-k="knob:s:TR" data-knob="s:TR" style="cursor:pointer"/><line x1="${450-Math.cos(sc.tr)*3}" y1="${98-Math.sin(sc.tr)*3}" x2="${450+Math.cos(sc.tr)*3}" y2="${98+Math.sin(sc.tr)*3}" stroke="#d23" stroke-width="1" pointer-events="none"/>`+
     `<rect x="437" y="89" width="7" height="18" fill="transparent" data-k="s:TR-" style="cursor:pointer"/><rect x="456" y="89" width="7" height="18" fill="transparent" data-k="s:TR+" style="cursor:pointer"/>`;
  s+=LB(414,137,'FOCUS')+hk(414,162,13,'s:FOC',sc.focus*135*Math.PI/180,'#2f9a52');
  s+=`<rect x="484" y="66" width="38" height="46" rx="3" fill="${FIELD}"/>`+LB(503,75,'X-POS.')+hk(503,96,11,'s:XP',sc.hpos/6*135*Math.PI/180);
  s+=LB(499,131,'HOLD')+LB(499,139,'OFF')+`<path d="M484 172 a17 17 0 0 1 4 -18" fill="none" stroke="${INK}" stroke-width="1"/><circle cx="484" cy="173" r="1.6" fill="${INK}"/>`+hk(502,162,11,'s:HO',(-135+270*(sc.hold||0))*Math.PI/180);
  // TV SEP., TRIG. lamp, trigger coupling
  s+=LB(556,24,'TV')+LB(556,32,'SEP.')+slide(556,40,82,'TVS',['OFF','TV:H','TV:V'],TVSS.indexOf(sc.tvsep||'OFF'));
  let tok=false;if(sc.pwr&&!sc.xy&&!sc.comp){const sg=[0,1,2,3].map(dsig);tok=trigger(sg).ok}
  s+=`<rect x="523" y="112" width="20" height="14" rx="2" fill="#b9b4a8"/>`+lampSq(533,119,tok,'#4dff8a',12,7)+LB(557,122,'TRIG.',{size:6.4});
  s+=slide(556,128,186,'TCPL',['AC','DC','HF','LF','~'],TCPLS.indexOf(sc.trig.cpl));
  // TIME/DIV.: dial field, scale, skirt + VAR cap
  const ti=HTD.findIndex(v=>Math.abs(v-sc.td)/v<1e-6);
  s+=LB(631,27,'TIME / DIV.',{size:8})+`<rect x="574" y="35" width="114" height="114" rx="16" fill="${FIELD}"/>`;
  const tl=[[0,'100'],[1,'50'],[2,'20'],[3,'10'],[4,'5'],[5,'2'],[6,'1'],[7,'.5'],[8,'.2'],[9,'.1'],[10,'50'],[11,'20'],[12,'10'],[13,'5'],[14,'2'],[15,'1'],[16,'.5'],[17,'.2']];
  s+=bigKnob(631,94,26,'TD',ti<0?6:ti,HTD.length,'TV',sc.tvar,tl.map(([i,t])=>[i,t,{r:14,size:6.6}]),300);
  s+=T(590,45,'ms',{size:6.4,fill:INK,w:700})+T(668,45,'µs',{size:6.4,fill:INK,w:700})+T(583,98,'V',{size:8,fill:INK,w:800})+T(672,72,'H',{size:8,fill:INK,w:800});
  s+=T(604,145,'ms',{size:6.4,fill:INK,w:700,a:'middle'})+`<circle cx="631" cy="140" r="4" fill="none" stroke="${INK}"/><path d="M629.5 138 l3 2 l-3 2z" fill="${INK}"/>`+LB(631,151,'CAL.',{size:6})+T(658,145,'µs',{size:6.4,fill:INK,w:700,a:'middle'});
  s+=LB(584,160,'+/−')+HK(584,176,'SLP',sc.trig.slope==='-')+LB(609,160,'ALT.')+HK(609,176,'ALT',!!sc.trig.alt)+LB(661,160,'EXT.')+HK(661,176,'EXT',!!sc.trig.ext);
  s+=`<path d="M596 176 h1 M621 176 h28" stroke="#b9b5a8" stroke-width="3"/>`;
  // AT/NORM., LEVEL, TRIG. INP.
  s+=LB(717,27,'AT/NORM.')+HK(717,46,'ATN',sc.trig.mode==='NORM')+LB(716,75,'LEVEL')+hk(716,97,12,'s:LV',clamp(sc.trig.level/6,-1,1)*135*Math.PI/180,'#2f5fb6');
  s+=LB(712,124,'TRIG. INP.',{size:6.8})+T(712,133,'100 Vp max.',{size:5.6,fill:INK,a:'middle'})+bnc(712,160,15)+`<path d="M706 182 h12 M709 185 h6" stroke="${INK}"/>`;
  // vertical block
  [0,1].forEach(c=>{const ch=sc.ch[c],xo=c?706:416,xv=c?631:489,vi=HVD.findIndex(v=>Math.abs(v-ch.vd)/v<1e-6);
    s+=LB(xo,212,c?'Y-POS. II':'Y-POS. I')+hk(xo,229,11,'s:Y'+(c+1),clamp(ch.pos/6,-1,1)*135*Math.PI/180);
    s+=LB(xo,256,c?'CH. II':'CH. I',{size:7.6});
    const kx=c?[693,712]:[405,424],kk=c?['AC2','GD2']:['GD1','AC1'],on=[c?ch.cpl==='AC'||(ch.cpl==='GND'&&ch.acUnder):ch.cpl==='GND',c?ch.cpl==='GND':ch.cpl==='AC'||(ch.cpl==='GND'&&ch.acUnder)];
    s+=`<rect x="${xo-24}" y="262" width="48" height="36" rx="3" fill="#e3dfd3"/>`+T(xo+(c?-4:4),268,c?'AC ▬':'▬ AC',{size:5.6,fill:INK,a:'middle',w:700})+T(xo,276,c?'DC ▪ GD':'GD ▪ DC',{size:5.6,fill:INK,a:'middle',w:700});
    s+=HK(kx[0],289,kk[0],on[0],{w:16,h:15})+HK(kx[1],289,kk[1],on[1],{w:16,h:15});
    s+=LB(xo,307,'INPUT')+T(xo,314,'1 MΩ ∥ 25 pF',{size:5.4,fill:INK,a:'middle'});
    s+=bnc(BNC[c].x-C0.x,BNC[c].y-C0.y,17)+T(xo,366,c?'HOR.  ⏚  INP.':'max.  ⏚  400 Vp',{size:5.6,fill:INK,a:'middle',w:700});
    s+=LB(xv,214,'VOLTS / DIV.',{size:8})+`<rect x="${xv-46}" y="221" width="92" height="88" rx="14" fill="${FIELD}"/>`;
    const vl=[[2,'5'],[3,'2'],[4,'1'],[5,'.5'],[6,'.2'],[7,'.1'],[8,'50'],[9,'20'],[10,'10'],[11,'5']];   // as printed: 10 V and 20 V sit under the knob's edge
    s+=bigKnob(xv,265,22,'V'+(c+1),vi<0?5:vi,HVD.length,'VV'+(c+1),ch.var||0,vl.map(([i,t])=>[i,t,{r:12,size:6.8}]),300);
    s+=T(xv-26,306,'V',{size:7,fill:INK,w:800,a:'middle'})+T(xv+28,306,'mV',{size:7,fill:INK,w:800,a:'middle'});
    const xc=c?576:543;s+=`<circle cx="${xc}" cy="226" r="4" fill="none" stroke="${INK}"/><path d="M${xc-1.5} 224 l3 2 l-3 2z" fill="${INK}"/>`+LB(xc,238,'CAL.',{size:6})+`<path d="M${xc} 270 l3 5 h-6z" fill="${INK}"/>`+LB(xc,284,'VAR.',{size:6})+T(xc,292,'2.5:1',{size:5.6,fill:INK,a:'middle',w:700});
    const xm=c?628:486;s+=`<rect x="${xm-11}" y="317" width="22" height="44" rx="3" fill="#e3dfd3"/>`+LB(xm,324,'x 5',{size:6.4})+`<circle cx="${xm}" cy="${ch.mag?336:335}" r="6" fill="${ch.mag?'#a92219':'#e2382c'}" stroke="#7d1810" data-k="s:YM${c+1}" style="cursor:pointer"/>`+LB(xm,349,'Y',{size:6})+LB(xm,357,'MAG.',{size:6})});
  s+=LB(454,322,'GD')+jack4(454,338)+`<path d="M448 352 h12 M451 355 h6" stroke="${INK}"/>`;
  s+=LB(557,312,'VERT. MODE',{size:7.6})+`<rect x="509" y="318" width="97" height="44" rx="4" fill="none" stroke="#c4c0b4" stroke-width="1.5"/>`;
  s+=LB(525,325,'CH I/II',{size:6.2})+LB(557,325,'DUAL',{size:6.6})+LB(589,325,'ADD',{size:6.6})+HK(525,339,'CH12',sc.ch2sel)+HK(557,339,'DUAL',sc.dual)+HK(589,339,'ADD',sc.add);
  s+=LB(525,357,'TRIG. I/II',{size:5.8})+`<path d="M552 351 v4 h37 v-4" fill="none" stroke="${INK}" stroke-width=".9"/>`+LB(571,359,'CHOP.',{size:5.8});
  s+=LB(660,325,'INV.')+HK(660,341,'INV',sc.ch[1].inv)+LB(660,358,'CH. II',{size:6.2});
  return s+'</g>'}
let msgTimer=null;function flash(m){const sc=S();sc.msg=m;clearTimeout(msgTimer);msgTimer=setTimeout(()=>{if(RT.S.sc)RT.S.sc.msg='';RT.render()},1300);try{if(typeof BENCH!=='undefined'&&BENCH.say)BENCH.say(m)}catch(_){}}
/* step a value list: dir +1 = clockwise = towards the end of the list */
function stepL(arr,v,dir){let i=arr.findIndex(x=>Math.abs(x-v)/Math.abs(x)<1e-6);if(i<0)i=0;return arr[clamp(i+dir,0,arr.length-1)]}
const r1=x=>Math.round(x*100)/100;
function hmKey(k){const sc=S();
  let m=k.match(/^(INT|FOC|TR|XP|HO|TD|TV|LV|V1|V2|VV1|VV2|Y1|Y2)([+-])$/);
  if(m){const d=m[2]==='+'?1:-1;switch(m[1]){
    case 'INT':sc.intens=r1(clamp(sc.intens+d*0.05,0,1));break;
    case 'FOC':sc.focus=r1(clamp(sc.focus+d*0.1,-1,1));break;
    case 'TR':sc.tr=r1(clamp(sc.tr+d*0.1,-1,1));break;
    case 'XP':sc.hpos=r1(clamp(sc.hpos+d*0.2,-6,6));break;
    case 'HO':sc.hold=r1(clamp((sc.hold||0)+d*0.05,0,1));break;
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
    case 'ALT':sc.trig.alt=!sc.trig.alt;break;
    case 'EXT':sc.trig.ext=!sc.trig.ext;break;
    case 'TVS':sc.tvsep=TVSS[(TVSS.indexOf(sc.tvsep||'OFF')+1)%TVSS.length];break;
    case 'YM1':case 'YM2':{const ch=sc.ch[+k[2]-1];ch.mag=!ch.mag;break}
    /* AC/DC and GD are independent push-buttons; GD wins (input grounded) while it is pressed */
    case 'AC1':case 'AC2':case 'GD1':case 'GD2':{const ch=sc.ch[+k[2]-1];const st={ac:ch.cpl==='AC'||(ch.cpl==='GND'&&!!ch.acUnder),gd:ch.cpl==='GND'};
      if(k[0]==='A')st.ac=!st.ac;else st.gd=!st.gd;ch.acUnder=st.ac;ch.cpl=st.gd?'GND':st.ac?'AC':'DC';break}
    default:return}
  syncOn()}
function fresh(){const sc=scNew();if(opt.prev)opt.prev(sc);return sc}
function knobInfo(b){const sc=S();const cal=v=>v>0?' (UNCAL)':'';
  switch(b){case 'INT':return 'INTENS '+Math.round(sc.intens*100)+'%';case 'FOC':return 'FOCUS '+(sc.focus>0?'+':'')+sc.focus.toFixed(1);case 'TR':return 'TRACE ROT. '+sc.tr.toFixed(1);
    case 'XP':return 'X-POS '+sc.hpos.toFixed(1)+' div';case 'HO':return 'HOLD OFF '+Math.round((sc.hold||0)*100)+'%';case 'TD':return fmtTd(sc.td)+'/div'+cal(sc.tvar)+(sc.xmag?' ×10':'');case 'TV':return sc.tvar?'TIME VAR '+vf(sc.tvar).toFixed(2)+'×':'TIME VAR CAL';
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
  wheel:['INT','FOC','TR','XP','HO','TD','TV','LV','V1','V2','VV1','VV2','Y1','Y2']};
};
ENGINE.hameg.size=[760,380];
