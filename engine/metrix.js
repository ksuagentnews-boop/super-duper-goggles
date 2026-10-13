/* Metrix MTX 3240 function generator (2 MHz, EE205 tables). State in RT.S.gen, same contract as engine/gen.js.
   Drawn from the lab photos (docs/ee205/instruments/exp2/3/6/8-table.jpg), 560 × 300 units: blue side bumpers and bottom
   bezel, grey top band with the metrix logo, dark-grey key face, a backlit LCD in the middle, the waveform keys (sine,
   triangle, square) and OUTPUT ON/OFF in the left column, the sweep / burst keys in the right column, the jog wheel with
   CURSOR ◀ ▶ beside it, DUTY · AMPL/LEVEL · OFFSET under the left half and FREQ · SWEEP keys under the right half, and the
   connector strip along the bottom (OUTPUT 50 Ω is the live BNC; the others are drawn only).
   There is no keypad: FREQ / AMPL / OFFSET / DUTY pick the parameter, CURSOR ◀ ▶ pick the digit (the LCD underlines it)
   and the wheel changes that digit. amp = open-circuit (EMF) Vpp behind 50 Ω, 20 mVpp … 20 Vpp; |offset| + amp/2 ≤ 10 V;
   0.1 Hz … 2 MHz. opt: {at:{x,y,s}, prev:{...leftover settings}} */
ENGINE.metrix=function(RT,opt){
const G0=Object.assign({s:1},opt.at);
const W=560,H=300;
const BNC0={x:92,y:274};
const OUT_BNC={x:G0.x+BNC0.x*G0.s,y:G0.y+BNC0.y*G0.s};
const WAVES=['Sine','Triangle','Square'];
const FMAX=2e6,FMIN=0.1,AMIN=0.02,AMAX=20,VLIM=10;
function wv(ph){const g=RT.S.gen,w=g.wave;
  if(w==='Square'){const d=(g.duty||50)/100,u=ph/(2*Math.PI);return u-Math.floor(u)<d?1:-1}
  if(w==='Triangle')return 2/Math.PI*Math.asin(clamp(Math.sin(ph),-1,1));return Math.sin(ph)}
const MONO=`font-family="'DejaVu Sans Mono','Courier New',monospace"`,SANS='font-family="Arial,Helvetica,sans-serif"';
const TM=(x,y,s,o)=>T(x,y,s,o).replace('<text ','<text '+MONO+' '),TS=(x,y,s,o)=>T(x,y,s,o).replace('<text ','<text '+SANS+' ');
/* parameter → digit range of the cursor (exponent of the step in base units) */
const DIG={f:[-1,6],a:[-3,1],o:[-3,0]};
const fUnit=f=>f>=1e6?[1e6,'MHz',6]:f>=1e3?[1e3,'kHz',3]:[1,'Hz',1];
/* value text with the cursor digit: v in base units shown in unit U with dec decimals, k = exponent of the step */
function digits(v,U,dec,k,signed){const e=Math.round(k-Math.log10(U)),d=Math.max(dec,-e);let s=Math.abs(v/U).toFixed(d);
  const p=s.indexOf('.')<0?s.length:s.indexOf('.');let i=e>=0?p-1-e:p-e;while(i<0){s='0'+s;i++}
  return signed?{s:(v<0?'−':'+')+s,i:i+1}:{s,i}}
const fmtF=f=>{const [U,u,d]=fUnit(f);return (f/U).toFixed(d)+' '+u};
const fmtA=a=>a.toFixed(3)+' Vpp',fmtO=o=>(o<0?'−':'+')+Math.abs(o).toFixed(3)+' V';
/* small waveform icons (keys and LCD), centred on 0,0, ±7 wide */
const ICON={Sine:'M-7 0c2.3-7 4.7-7 7 0s4.7 7 7 0',Triangle:'M-7 0l3.5-5 7 10 3.5-5',Square:'M-7 4h3.5v-8h7v8h3.5'};
function key(x,y,w,h,l1,l2,k,o={}){const kk=k?` data-k="g:${k}" style="cursor:pointer"`:'';
  let s=`<rect x="${x-w/2}" y="${y-h/2+1.6}" width="${w}" height="${h}" rx="3.5" fill="#22282b" opacity=".7"/>`+
    `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="3.5" fill="${o.fill||'url(#mxKey)'}" stroke="#2a3033" stroke-width=".8"${kk}/>`;
  if(o.icon)s+=`<path d="${ICON[o.icon]}" transform="translate(${x} ${y-(l2?2:0)}) scale(1.05)" fill="none" stroke="${o.ink||'#f2f4f4'}" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>`;
  else if(l1)s+=TS(x,l2?y-1:y+2.6,l1,{size:o.size||7,a:'middle',w:700,fill:o.ink||'#eef1f1'});
  if(l2)s+=TS(x,o.icon?y+8:y+7,l2,{size:o.size2||5.6,a:'middle',w:700,fill:o.ink2||'#9fd89a'});
  if(o.led!=null)s+=`<circle cx="${x+w/2-4.5}" cy="${y-h/2+4.5}" r="2" fill="${o.led?'#5dff6a':'#2d3a2f'}" stroke="#151a17" stroke-width=".5" pointer-events="none"/>`;
  return s}
function bnc(x,y,r){return `<circle cx="${x}" cy="${y}" r="${r+2.4}" fill="#14181a"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#mxNut)" stroke="#5f696e" stroke-width="1"/>`+
  `<rect x="${x-r-2.2}" y="${y-1.6}" width="3" height="3.2" rx=".8" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/><rect x="${x+r-.8}" y="${y-1.6}" width="3" height="3.2" rx=".8" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/>`+
  `<circle cx="${x}" cy="${y}" r="${r*0.66}" fill="#30383c"/><circle cx="${x}" cy="${y}" r="${r*0.4}" fill="#e9ecec"/><circle cx="${x}" cy="${y}" r="${r*0.15}" fill="#c8a24a"/>`}
/* one LCD line: label, value with the cursor digit underlined when this parameter is selected, unit */
function lcdRow(p,y,lab,v,unit,size,x0,lx=130){const g=RT.S.gen,sel=g.sel===p,cw=size*0.602;let s='';
  if(sel)s+=TS(lx-9,y-size*0.28,'▶',{size:7,fill:'#1b2a1a'});
  s+=TS(lx,y-(size>16?size*0.36:0),lab,{size:7.6,w:700,fill:'#26361f'});
  s+=TM(x0,y,v.s,{size,fill:'#14210f',w:700});
  if(sel&&v.i!=null)s+=`<rect x="${(x0+v.i*cw-0.4).toFixed(1)}" y="${y+2}" width="${(cw*0.95).toFixed(1)}" height="${size>16?2.4:1.8}" fill="#14210f"/>`;
  s+=TS(x0+v.s.length*cw+4,y,unit,{size:size>16?11:8.5,w:700,fill:'#26361f'});return s}
function svg(){const g=RT.S.gen;let s=`<g transform="translate(${G0.x} ${G0.y}) scale(${G0.s})">`;
  s+=`<defs><linearGradient id="mxKey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6367"/><stop offset="1" stop-color="#3a4245"/></linearGradient>`+
    `<linearGradient id="mxBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d3fb4"/><stop offset=".35" stop-color="#3f6cec"/><stop offset=".7" stop-color="#2a52d4"/><stop offset="1" stop-color="#1a37a0"/></linearGradient>`+
    `<linearGradient id="mxBez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a66ea"/><stop offset="1" stop-color="#1c3cae"/></linearGradient>`+
    `<linearGradient id="mxTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa3a8"/><stop offset="1" stop-color="#7f898e"/></linearGradient>`+
    `<radialGradient id="mxNut" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eef1f2"/><stop offset="1" stop-color="#8a9397"/></radialGradient>`+
    `<radialGradient id="mxWheel" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#7a8489"/><stop offset="1" stop-color="#4b5458"/></radialGradient></defs>`;
  // grey base with the connector strip, blue bumpers on both sides, grey top band, dark-grey key face, blue bottom bezel
  s+=`<rect x="22" y="236" width="516" height="64" rx="8" fill="#8f989c" stroke="#6d777b"/><rect x="44" y="256" width="472" height="42" rx="3" fill="#262c2f" stroke="#15191b"/>`;
  s+=`<rect x="44" y="0" width="472" height="70" rx="20" fill="url(#mxTop)" stroke="#6e787d"/>`;
  s+=`<rect x="0" y="6" width="76" height="246" rx="30" fill="url(#mxBlue)" stroke="#16308c" stroke-width="1.2"/><rect x="484" y="6" width="76" height="246" rx="30" fill="url(#mxBlue)" stroke="#16308c" stroke-width="1.2"/>`;
  s+=`<path d="M14 40c2-16 8-26 18-30" stroke="#a9c0ff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/><path d="M498 40c2-16 8-26 18-30" stroke="#a9c0ff" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
  s+=`<rect x="54" y="44" width="452" height="190" rx="6" fill="#5c6569" stroke="#3c4447" stroke-width="1.2"/>`;
  s+=`<rect x="26" y="228" width="508" height="30" rx="12" fill="url(#mxBez)" stroke="#16308c"/><path d="M40 232H520" stroke="#93b0ff" stroke-width="1.2" opacity=".6"/>`;
  // logo on the top band, model plate on the bezel
  s+=`<text x="280" y="33" ${SANS} font-size="17" font-weight="700" font-style="italic" fill="#8c1c2a" text-anchor="middle" pointer-events="none" letter-spacing=".5">metrix</text>`;
  s+=`<rect x="392" y="233" width="112" height="21" rx="3" fill="#183294" stroke="#7d9cf2" stroke-width=".6"/>`+
    `<text x="448" y="244.5" ${SANS} font-size="9.5" font-weight="700" fill="#ffffff" text-anchor="middle" pointer-events="none"><tspan font-style="italic">metrix</tspan> MTX 3240</text>`+
    TS(448,251.5,'2 MHz FUNCTION GENERATOR',{size:4.4,w:700,fill:'#c9d6ff',a:'middle'});
  // power key: the round key on the bezel
  s+=`<circle cx="86" cy="243" r="11.5" fill="#132a80" opacity=".7"/><circle cx="86" cy="242" r="10.5" fill="${g.pwr?'#3a63e0':'#2a4cc4'}" stroke="#9cb4ff" stroke-width="1" data-k="g:PWR" style="cursor:pointer"/>`+
    `<path d="M82.3 238.6a5 5 0 1 0 7.4 0M86 236v5.5" stroke="#e8eeff" stroke-width="1.4" fill="none" stroke-linecap="round" pointer-events="none"/>`;
  if(g.pwr)s+=`<circle cx="101" cy="236" r="1.8" fill="#7dff8a" pointer-events="none"/>`;
  // LCD
  s+=`<rect x="110" y="52" width="330" height="112" rx="5" fill="#2a3032" stroke="#181c1e"/><rect x="117" y="59" width="316" height="98" rx="2" fill="${g.pwr?'#b5c6a2':'#2b322c'}"/>`;
  if(g.pwr){s+=`<rect x="117" y="59" width="316" height="98" rx="2" fill="none" stroke="#8fa47c" stroke-width="1.2"/>`;
    s+=`<rect x="124" y="63" width="20" height="13" rx="1.5" fill="#22331d"/><path d="${ICON[g.wave]||ICON.Sine}" transform="translate(134 69.5) scale(.75)" fill="none" stroke="#c4d6ae" stroke-width="1.6" pointer-events="none"/>`;
    s+=TS(149,73.5,g.wave.toUpperCase(),{size:9,w:700,fill:'#1b2a17'});
    s+=g.out?`<rect x="362" y="63" width="64" height="13" rx="1.5" fill="#1d2c18"/>`+TS(394,73,'OUTPUT ON',{size:7.6,w:700,fill:'#c8dcb0',a:'middle'})
      :`<rect x="362" y="63" width="64" height="13" rx="1.5" fill="none" stroke="#3b4f33" stroke-width=".8"/>`+TS(394,73,'OUTPUT OFF',{size:7.6,w:700,fill:'#3b4f33',a:'middle'});
    s+=TS(300,73,'Z out 50 Ω',{size:6.5,fill:'#3b4f33',a:'middle'});
    const [U,u,d]=fUnit(g.freq);
    s+=lcdRow('f',103,'FREQ',digits(g.freq,U,d,g.dig.f,false),u,22,170);
    s+=lcdRow('a',127,'AMPL',digits(g.amp,1,3,g.dig.a,false),'Vpp',13,170);
    s+=lcdRow('o',148,'OFFSET',digits(g.off,1,3,g.dig.o,true),'V',13,170);
    if(g.wave==='Square')s+=lcdRow('d',127,'DUTY',{s:String(Math.round(g.duty)),i:null},'%',13,358,326);
    s+=TS(426,150,'◆ ±'+stepTxt(),{size:6.2,fill:'#2c3f26',a:'end'});
    if(g.err)s+=`<rect x="196" y="112" width="160" height="22" rx="2" fill="#1d2c18"/>`+TS(276,127,g.err,{size:9,w:700,fill:'#d8ecbf',a:'middle'})}
  // left column: waveform keys + OUTPUT ON/OFF
  WAVES.forEach((w,i)=>{const on=g.pwr&&g.wave===w;s+=key(86,72+i*26,38,21,'',null,w,{icon:w,led:g.pwr?on:false})});
  s+=key(86,150,38,21,'OUTPUT','ON/OFF','OUT',{size:6.2,size2:5.4,ink2:'#ff8f7a',led:!!(g.pwr&&g.out)});
  // right column: sweep / burst keys (not used in the lab, drawn only)
  [['FREQ','EXT'],['SWEEP','ON/OFF'],['SWEEP','LIN/LOG'],['BURST','MODE']].forEach(([a,b],i)=>s+=key(474,72+i*26,40,21,a,b,null,{size:6.2,size2:5.2}));
  // middle row: ATTEN / LOCAL (drawn only), CURSOR ◀ ▶
  s+=key(166,181,40,19,'ATTEN','0/−20dB',null,{size:6,size2:5})+key(212,181,40,19,'LOCAL','RS232',null,{size:6,size2:5});
  s+=key(354,181,40,19,'CURSOR','◀','CL',{size:6,size2:7.5,ink2:'#ffffff'})+key(400,181,40,19,'CURSOR','▶','CR',{size:6,size2:7.5,ink2:'#ffffff'});
  // bottom row: DUTY · AMPL/LEVEL · OFFSET | FREQ · SWEEP F.MAX · SWEEP TIME
  s+=key(104,212,42,21,'DUTY',null,'DUTY',{size:6.8,led:g.pwr?g.sel==='d':false});
  s+=key(150,212,42,21,'AMPL','LEVEL','AMPL',{size:6.6,size2:5.4,led:g.pwr?g.sel==='a':false});
  s+=key(196,212,42,21,'OFFSET',null,'OFFSET',{size:6.6,led:g.pwr?g.sel==='o':false});
  s+=key(364,212,42,21,'FREQ',null,'FREQ',{size:6.8,led:g.pwr?g.sel==='f':false});
  s+=key(410,212,42,21,'SWEEP','F.MAX',null,{size:6.2,size2:5.4})+key(456,212,42,21,'SWEEP','TIME',null,{size:6.2,size2:5.4});
  // jog wheel (ENGINE.knob gives the grab ring, the disk and the ◀ ▶ hit areas; the look is drawn over it)
  const KX=280,KY=198,ka=g.kang||0;
  s+=`<circle cx="${KX}" cy="${KY}" r="31" fill="#4f585c" stroke="#3a4245" stroke-width="1"/>`;
  s+=ENGINE.knob(KX,KY,21,'#3a4245','g:KN',null,null,{fill:'url(#mxWheel)',ang:ka});
  s+=`<path d="M${KX-37} ${KY}l7-5.5v11z" fill="#c9d0d3" pointer-events="none"/><path d="M${KX+37} ${KY}l-7-5.5v11z" fill="#c9d0d3" pointer-events="none"/>`;
  s+=`<circle cx="${KX}" cy="${KY}" r="11" fill="#566064" stroke="#3a4245" stroke-width="1" pointer-events="none"/><circle cx="${KX+Math.sin(ka)*15.5}" cy="${KY-Math.cos(ka)*15.5}" r="2.4" fill="#3a4245" pointer-events="none"/>`;
  // connector strip: OUTPUT 50 Ω (live), two small sockets, VCF IN, SYNC TTL OUT, FREQ EXT IN (drawn only)
  s+=bnc(BNC0.x,BNC0.y,10)+TS(108,293,'OUTPUT 50 Ω',{size:6,w:700,fill:'#e8ecee'});
  [164,190].forEach(x=>s+=`<circle cx="${x}" cy="274" r="7" fill="#101315" stroke="#4a5357"/><circle cx="${x}" cy="274" r="2.4" fill="#2b3134"/>`);
  s+=TS(177,294,'AM · FM IN',{size:5.2,fill:'#b9c2c6',a:'middle'});
  s+=bnc(236,274,9)+TS(236,294,'VCF IN',{size:5.2,fill:'#b9c2c6',a:'middle'});
  s+=TS(310,268,'MAX 10 V',{size:4.6,fill:'#8e989c',a:'middle'})+TS(310,276,'⚠ 50 Ω',{size:4.6,fill:'#8e989c',a:'middle'});
  s+=bnc(384,274,9)+TS(384,294,'SYNC OUT TTL',{size:5.2,fill:'#b9c2c6',a:'middle'});
  s+=bnc(452,274,9)+TS(452,294,'FREQ EXT IN',{size:5.2,fill:'#b9c2c6',a:'middle'});
  return s+'</g>'}
let errT=null;function err(m){RT.S.gen.err=m;clearTimeout(errT);errT=setTimeout(()=>{RT.S.gen.err='';RT.render()},1400)}
function stepTxt(){const g=RT.S.gen,p=g.sel;if(p==='d')return '1 %';const st=Math.pow(10,g.dig[p]);
  if(p==='f')return st>=1e6?st/1e6+' MHz':st>=1e3?st/1e3+' kHz':st+' Hz';return st>=1?st+' V':Math.round(st*1000)+' mV'}
const r4=x=>Math.round(x*1e4)/1e4;
/* the wheel: one step of the digit under the cursor on the selected parameter */
function turn(g,dir){const p=g.sel;
  if(p==='d'){if(g.wave!=='Square')return;g.duty=clamp(Math.round(g.duty)+dir,20,80)}
  else{const st=Math.pow(10,g.dig[p]);
    if(p==='f'){const f=Math.round((g.freq+dir*st)*1e3)/1e3;if(f<FMIN-1e-9||f>FMAX+1e-6){err(f>FMAX?'FREQ MAX 2 MHz':'FREQ MIN 0.1 Hz');return}g.freq=f}
    else if(p==='a'){const a=r4(g.amp+dir*st);if(a<AMIN-1e-9){err('AMPL MIN 20 mVpp');return}if(a>AMAX+1e-9){err('AMPL MAX 20 Vpp');return}if(Math.abs(g.off)+a/2>VLIM+1e-9){err('AMPL + OFFSET > 10 V');return}g.amp=a}
    else{const o=r4(g.off+dir*st);if(Math.abs(o)+g.amp/2>VLIM+1e-9){err('OFFSET LIMIT');return}g.off=Math.abs(o)<1e-9?0:o}}
  g.kang=(g.kang||0)+dir*0.3;RT.dirty=true}
function keyFn(k){const g=RT.S.gen;if(!g.dig)g.dig={f:2,a:0,o:-1};if(!g.sel)g.sel='f';if(g.duty==null)g.duty=50;
  if(k==='PWR'){g.pwr=!g.pwr;if(!g.pwr)g.out=false;g.err='';RT.dirty=true;return}
  if(!g.pwr)return;
  if(k==='OUT'){g.out=!g.out;RT.dirty=true;return}
  if(WAVES.includes(k)){g.wave=k;if(k!=='Square'&&g.sel==='d')g.sel='f';RT.dirty=true;return}
  const P={FREQ:'f',AMPL:'a',OFFSET:'o',DUTY:'d'}[k];
  if(P){if(P==='d'&&g.wave!=='Square'){err('DUTY: SQUARE ONLY');return}g.sel=P;return}
  if(k==='CL'||k==='CR'){const p=g.sel;if(p==='d')return;g.dig[p]=clamp(g.dig[p]+(k==='CL'?1:-1),DIG[p][0],DIG[p][1]);return}
  if(k==='KN+'||k==='KN-'){turn(g,k==='KN+'?1:-1);return}}
function fresh(){const g=Object.assign({pwr:false,out:false,wave:'Sine',freq:1000,amp:1,off:0,duty:50,sel:'f',dig:{f:2,a:0,o:-1},kang:0,err:''},opt.prev||{});
  if(g.wave==='Ramp')g.wave='Triangle';if(!WAVES.includes(g.wave))g.wave='Sine';
  g.amp=clamp(g.amp,AMIN,AMAX);g.freq=clamp(g.freq,FMIN,FMAX);if(Math.abs(g.off)+g.amp/2>VLIM)g.off=Math.sign(g.off)*(VLIM-g.amp/2);
  g.dig=Object.assign({f:2,a:0,o:-1},g.dig||{});if(!['f','a','o','d'].includes(g.sel))g.sel='f';return g}
function knobInfo(){const g=RT.S.gen;if(!g.pwr)return 'OFF';return g.sel==='a'?'AMPL '+fmtA(g.amp):g.sel==='o'?'OFFSET '+fmtO(g.off):g.sel==='d'?'DUTY '+Math.round(g.duty)+' %':'FREQ '+fmtF(g.freq)}
return {key:'gen',prefix:'g',size:[W*G0.s,H*G0.s],name:['Metrix MTX 3240','مولّد الإشارات'],fresh,svg,keyFn,wheel:['KN'],knobInfo,wv,
  leads:[{k:'gr',label:'GEN OUT',from:{x:OUT_BNC.x-14,y:OUT_BNC.y},coax:true,grp:'gr',jat:OUT_BNC,tray:'GEN OUT',jn:'OUTPUT 50Ω'},{k:'gb',label:'GEN ⏚',from:{x:OUT_BNC.x+14,y:OUT_BNC.y},earth:true,coax:true,grp:'gr'}],
  cables:D=>D.coax(OUT_BNC,'gr','gb','GEN'),
  /* 50 Ω output referenced to earth (its black clip is earthed through the mains plug) */
  stamp(ck,force){const g=RT.S.gen,L=RT.S.leads;const on=force||(g.pwr&&g.out);if(L.gr.node!=null&&on)ck.els.push({t:'VS',a:ck.idx(L.gr.node),r:50})},
  on:()=>RT.S.gen.pwr&&RT.S.gen.out&&RT.S.leads.gr.node!=null,
  sigF:()=>RT.S.gen.freq};
};
ENGINE.metrix.size=[560,300];
