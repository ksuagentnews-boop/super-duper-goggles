/* PeakTech 4124 function generator (approved prototype behaviour). State in S.gen.
   F1–F5 pick a parameter and its unit, the keypad types a value. The rotary knob changes the selected parameter
   (last one picked with F1–F5, Amplitude by default) by one step of the digit under the cursor; ◄ ► move the cursor.
   opt: {at:{x,y,s}, prev:{...leftover settings}} */
ENGINE.gen=function(RT,opt){
const G0=Object.assign({s:1.3},opt.at);
const GEN_BNC={x:G0.x+330*G0.s,y:G0.y+182*G0.s};
function fmtFreq(f){let s,u;if(f>=1e6){s=(f/1e6).toFixed(6);u='MHz'}else if(f>=1e3){s=(f/1e3).toFixed(6);u='kHz'}else{s=f.toFixed(4);u='Hz'}const [a,b]=s.split('.');return a+'.'+b.slice(0,3)+','+b.slice(3)+u}
const fmtAmp=a=>a>=1?a.toFixed(3)+'Vpp':(a*1000).toFixed(1)+'mVpp';
const WAVES=['Sine','Square','Ramp'];
function wv(ph){const w=RT.S.gen.wave,s=Math.sin(ph);if(w==='Square')return s>=0?1:-1;if(w==='Ramp')return 2/Math.PI*Math.asin(clamp(s,-1,1));return s}
const EDIT={f:{name:'Frequency',units:[['MHz',1e6],['kHz',1e3],['Hz',1]]},a:{name:'Amplitude',units:[['mVpp',1e-3],['Vpp',1],['mVrms',2*Math.SQRT2*1e-3],['Vrms',2*Math.SQRT2]]},o:{name:'Offset',units:[['mVdc',1e-3],['Vdc',1]]},h:{name:'Hi_Level',units:[['mV',1e-3],['V',1]]},l:{name:'Lo_Level',units:[['mV',1e-3],['V',1]]}};
const fmtLv=v=>Math.abs(v)>=1?v.toFixed(3)+'V':(v*1000).toFixed(1)+'mV';
/* drawn from the lab photo (docs/ee312/instruments/function-generator-PeakTech-4124-lab-photo.png), 440 × 220 units:
   blue corner bumpers, colour LCD with its soft-menu column, F1–F5, USB, keypad, knob + ◀ ▶, Save / Utility / Help,
   the light-blue output area (CH1/2 · Both · DC · CH1 · CH2 · OUT1 / OUT2) and the power + waveform keys along the bottom */
const LCD='font-family="Georgia,\'Times New Roman\',serif"',SANS='font-family="Arial,Helvetica,sans-serif"';
const TL=(x,y,s,o)=>T(x,y,s,o).replace('<text ','<text '+LCD+' '),TS=(x,y,s,o)=>T(x,y,s,o).replace('<text ','<text '+SANS+' ');
const fmtOff=v=>Math.abs(v)>=1?v.toFixed(3)+'V':(v*1000).toFixed(1).replace(/\.0$/,'').replace(/^-0$/,'0')+'mV';
function fmtPer(f){const p=1/f;const [d,u]=p>=1?[1,'s']:p>=1e-3?[1e3,'ms']:p>=1e-6?[1e6,'us']:[1e9,'ns'];return (p*d).toFixed(5)+u}
const FY=i=>77+i*21;   // F1–F5 key centres = soft-menu rows
/* one period of the chosen waveform inside (x0, yc), W wide, ±H high */
function wavePath(w,x0,yc,W,H){if(w==='Square')return `M${x0} ${yc-H}H${x0+W/2}V${yc+H}H${x0+W}`;let d='';
  for(let i=0;i<=60;i++){const s=Math.sin(2*Math.PI*i/60),v=w==='Ramp'?2/Math.PI*Math.asin(clamp(s,-1,1)):s;d+=(i?'L':'M')+(x0+W*i/60).toFixed(1)+' '+(yc-H*v).toFixed(1)}return d}
/* the small icons on the six waveform keys */
const ICON={Sine:'M-6 0c2-6 4-6 6 0s4 6 6 0',Square:'M-6 2h3v-4h6v4h3',Ramp:'M-6 2l3-4 4 4 3-4 2 2',Pulse:'M-6 2h3v-4h2v4h7',Noise:'M-6 0l1.2-2 1 3 1.2-3 1 2 1-1.5 1.2 3 1-3 1.2 2 1.2-1.5 1 1',Arb:'M-6 1c1-4 3-4 4-1s2 2 3-1 3-1 5 1'};
function gkey(x,y,w,h,lab,o={}){const k=o.k?` data-k="g:${o.k}" style="cursor:pointer"`:'',rx=o.rx??h/2;
  return `<rect x="${x-w/2}" y="${y-h/2+1.2}" width="${w}" height="${h}" rx="${rx}" fill="#8f989c" opacity=".55"/>`+
    `<rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="${rx}" fill="${o.fill||'url(#gKey)'}" stroke="${o.stroke||'#8a9397'}" stroke-width=".8"${k}/>`+
    (lab?TS(x,y+(o.size||6.5)*0.36,lab,{size:o.size||6.5,a:'middle',w:o.w||700,fill:o.col||'#3a4448'}):'')}
function bnc(x,y,r){return `<circle cx="${x}" cy="${y}" r="${r+2}" fill="#8b9599" opacity=".5"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gNut)" stroke="#5f696e" stroke-width="1"/>`+
  `<rect x="${x-r-2.2}" y="${y-1.6}" width="3" height="3.2" rx=".8" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/><rect x="${x+r-.8}" y="${y-1.6}" width="3" height="3.2" rx=".8" fill="#9aa3a7" stroke="#5f696e" stroke-width=".5"/>`+
  `<circle cx="${x}" cy="${y}" r="${r*0.66}" fill="#30383c"/><circle cx="${x}" cy="${y}" r="${r*0.4}" fill="#e9ecec"/><circle cx="${x}" cy="${y}" r="${r*0.15}" fill="#c8a24a"/>`}
function genSVG(){const g=RT.S.gen;let s=`<g transform="translate(${G0.x} ${G0.y}) scale(${G0.s})">`;
  s+=`<defs><linearGradient id="gKey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f7f7"/><stop offset="1" stop-color="#d6dadc"/></linearGradient>`+
    `<linearGradient id="gFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eceeee"/><stop offset="1" stop-color="#dcdfe0"/></linearGradient>`+
    `<radialGradient id="gNut" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#eef1f2"/><stop offset="1" stop-color="#9aa3a7"/></radialGradient>`+
    `<radialGradient id="gKnob" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9ced1"/></radialGradient></defs>`;
  // tilt stand peeking out underneath, blue rubber corner bumpers, light-grey front
  s+=`<path d="M64 196H344L338 220H70Z" fill="#cdd1d3" stroke="#aeb4b7"/><rect x="78" y="208" width="252" height="2" fill="#b4babd"/>`;
  [[0,0],[396,0],[0,150],[396,150]].forEach(([x,y])=>s+=`<rect x="${x}" y="${y}" width="44" height="62" rx="13" fill="#3f8fd8" stroke="#2a6fb2" stroke-width="1.2"/>`);
  s+=`<rect x="0" y="40" width="9" height="130" fill="#5aa2e2"/><rect x="431" y="40" width="9" height="130" fill="#5aa2e2"/>`;
  s+=`<rect x="5" y="4" width="430" height="203" rx="11" fill="url(#gFace)" stroke="#b3babd" stroke-width="1.2"/>`;
  // label plate
  s+=`<rect x="22" y="10" width="164" height="14" rx="2" fill="#f6f7f7" stroke="#a7afb2" stroke-width=".8"/>`+
    `<text x="26" y="20.5" ${SANS} font-size="8.6" font-weight="700" font-style="italic" fill="#2f63ad" pointer-events="none">PeakTech<tspan font-size="5.5" dy="-3">®</tspan></text>`+
    TS(70,19.6,'ARBITRARY WAVEFORM GENERATOR',{size:4.4,w:700,fill:'#222'})+`<text x="163" y="21" ${SANS} font-size="9" fill="#2f63ad" pointer-events="none">4124</text>`;
  // LCD
  s+=`<rect x="29" y="39" width="198" height="139" rx="4" fill="#3a4246" stroke="#20272a"/><rect x="34" y="44" width="188" height="129" fill="${g.pwr?'#1f48cc':'#0b1220'}"/>`;
  if(g.pwr){const E=g.edit?EDIT[g.edit]:null,ed=k=>g.edit===k,bf=()=>(g.buf||'')+'▌',sel=g.sel||'a';
    s+=`<rect x="36" y="46" width="22" height="22" fill="#f2a31c"/>`+TS(38.5,65,'CH',{size:4.6,w:700,fill:'#2a1a00'})+TS(51,66,'1',{size:20,w:700,fill:'#1b1200',a:'middle'});
    s+=TL(122,54,E?E.name:'Frequency',{size:7.5,w:700,fill:'#f4f4f4',a:'middle'})+TS(122,69.5,ed('f')?bf():fmtFreq(g.freq),{size:13,fill:ed('f')?'#ffe066':'#ffffff',a:'middle'});
    // waveform window
    s+=`<rect x="34" y="74" width="155" height="72" fill="#0a1226"/>`+TL(37,84,'Load:High Z',{size:5.8,w:700,fill:'#ffffff'});
    s+=TL(49,99,ed('a')?bf():fmtAmp(g.amp),{size:5.4,w:700,fill:ed('a')?'#ffe066':'#ffffff'})+TL(49,108,ed('o')?bf():fmtOff(g.off),{size:5.4,w:700,fill:ed('o')?'#ffe066':'#ffffff'});
    s+=`<path d="M88 95v18M86 97l2-2 2 2M86 111l2 2 2-2" stroke="#e6e6e6" stroke-width=".7" fill="none"/><path d="M94 88v52M96 88v52" stroke="#d0d4dc" stroke-width=".6"/>`;
    s+=`<path d="M98 87H184M98 84v6M184 84v6M98 87l3-1.6v3.2zM184 87l-3-1.6v3.2z" stroke="#e6e6e6" stroke-width=".7" fill="#e6e6e6"/><rect x="124" y="83" width="34" height="8" fill="#0a1226"/>`+TS(141,89.4,fmtPer(g.freq),{size:5.6,fill:'#ffffff',a:'middle'});
    s+=`<line x1="96" y1="117" x2="186" y2="117" stroke="#d8dce4" stroke-width=".7"/><path d="M186 117l-3-1.6v3.2z" fill="#d8dce4"/><path d="${wavePath(g.wave,98,117,86,22)}" fill="none" stroke="#ff7058" stroke-width="1.3"/>`;
    s+=TS(37,141,'◆ ±'+fmtStep(sel,STEP[sel](g)),{size:5,fill:'#7dff9a'});
    // bottom bar: Amplitude · Offset (High / Low level while those are selected)
    const hl=sel==='h'||sel==='l';
    s+=`<rect x="34" y="147" width="155" height="26" fill="#1f48cc"/><rect x="36" y="156" width="77" height="15" fill="#123296"/><rect x="116" y="156" width="72" height="15" fill="#123296"/><line x1="114.5" y1="148" x2="114.5" y2="172" stroke="#7d97e8" stroke-width=".6"/>`;
    s+=TL(75,154,hl?'HighLevel':'Amplitude',{size:6.3,w:700,fill:'#f4f4f4',a:'middle'})+TL(152,154,hl?'LowLevel':'Offset',{size:6.3,w:700,fill:'#f4f4f4',a:'middle'});
    const v1=hl?(ed('h')?bf():fmtLv(g.off+g.amp/2)):(ed('a')?bf():fmtAmp(g.amp)),v2=hl?(ed('l')?bf():fmtLv(g.off-g.amp/2)):(ed('o')?bf():fmtOff(g.off));
    s+=TS(75,168.5,v1,{size:11,fill:(ed('h')||(!hl&&ed('a')))?'#ffe066':'#ffffff',a:'middle'})+TS(152,168.5,v2,{size:11,fill:(ed('l')||(!hl&&ed('o')))?'#ffe066':'#ffffff',a:'middle'});
    // soft-menu column: waveform tab, then one row per F key (units while typing a value)
    s+=`<rect x="190" y="46" width="31" height="14" fill="#f6c400"/>`+TL(205.5,56,g.wave,{size:6.6,fill:'#3a2a00',a:'middle'});
    s+=`<rect x="190" y="62" width="31" height="110" fill="#1838a8"/>`;
    const rows=E?[...E.units.map(u=>[u[0]]),[],[],[],[]].slice(0,4).concat([['Cancel']]):[['Freq','Period'],['Ampl','Hi_Level'],['Offset','Lo_Level'],['Hi_Level'],['Lo_Level']];
    const hi=E?-1:{f:0,a:1,o:2,h:3,l:4}[sel];
    rows.forEach((r,i)=>{const y=FY(i);s+=`<line x1="190" y1="${y+10.5}" x2="221" y2="${y+10.5}" stroke="#6f8ae0" stroke-width=".5"/>`;
      if(i===hi)s+=`<rect x="191" y="${y-9}" width="29" height="18.5" fill="#3a66e8" stroke="#a9bdf6" stroke-width=".5"/>`;
      const c=E?'#ffe066':i>2&&i!==hi?'#9fb2ee':'#ffffff';
      if(r.length===2)s+=TL(205.5,y-1.5,r[0],{size:5.8,w:700,fill:c,a:'middle'})+TL(205.5,y+6.5,r[1],{size:5.2,w:700,fill:c,a:'middle'});
      else if(r.length)s+=TL(205.5,y+2,r[0],{size:5.6,w:700,fill:c,a:'middle'})});
    if(g.err)s+=`<rect x="56" y="98" width="130" height="22" rx="3" fill="#5a1414" stroke="#ffb0a0" stroke-width=".6"/>`+TS(121,113,g.err,{size:8.5,fill:'#fff',a:'middle',w:600});}
  // F1–F5 with their leader lines, USB port under them
  ['F1','F2','F3','F4','F5'].forEach((k,i)=>{const y=FY(i);s+=`<line x1="227" y1="${y}" x2="236" y2="${y}" stroke="#a3abaf" stroke-width="1"/>`+gkey(247,y,20,14,k,{k,rx:4,size:7,col:'#2f383c'})});
  s+=`<rect x="240" y="176" width="9" height="24" rx="1.5" fill="#f4f5f5" stroke="#6f797d"/><rect x="242.6" y="179" width="3.8" height="18" fill="#2b3236"/>`;
  // keypad + knob block
  s+=`<rect x="266" y="43" width="136" height="91" rx="11" fill="#d3d7d9" stroke="#b1b8bb"/>`;
  ['7','8','9','4','5','6','1','2','3','0','.','±'].forEach((k,i)=>{const x=285+(i%3)*26,y=58+Math.floor(i/3)*20.5;s+=gkey(x,y,20,15,k==='±'?'+/-':k,{k,rx:4,size:k==='±'?6.5:8.5,col:'#2f383c'})});
  // rotary knob (grab ring + disk keep data-knob), ↺ ↻ turn keys, ◀ ▶ cursor keys under it (◀ deletes while typing a value)
  const KX=378,KY=72,ka=g.kang||0;
  s+=`<circle cx="${KX}" cy="${KY}" r="30" fill="transparent" data-k="knob:g:KN" data-knob="g:KN"/><circle cx="${KX}" cy="${KY+1.5}" r="20" fill="#8f989c" opacity=".5" pointer-events="none"/>`+
    `<circle cx="${KX}" cy="${KY}" r="19" fill="url(#gKnob)" stroke="#8d969a" stroke-width="3" data-k="knob:g:KN" data-knob="g:KN"/>`;
  for(let i=0;i<24;i++){const a=ka+i*Math.PI/12;s+=`<line x1="${(KX+Math.sin(a)*15.5).toFixed(2)}" y1="${(KY-Math.cos(a)*15.5).toFixed(2)}" x2="${(KX+Math.sin(a)*18).toFixed(2)}" y2="${(KY-Math.cos(a)*18).toFixed(2)}" stroke="#b5bcbf" stroke-width=".8" pointer-events="none"/>`}
  s+=`<circle cx="${KX}" cy="${KY}" r="12" fill="#f3f5f5" stroke="#c3c9cc" pointer-events="none"/><line x1="${KX+Math.sin(ka)*5}" y1="${KY-Math.cos(ka)*5}" x2="${KX+Math.sin(ka)*11}" y2="${KY-Math.cos(ka)*11}" stroke="#55646a" stroke-width="2.2" stroke-linecap="round" pointer-events="none"/>`;
  s+=TS(355,56,'↺',{size:9,fill:'#5d696e',a:'middle'})+`<rect x="348" y="46" width="14" height="14" fill="transparent" data-k="g:KN-" style="cursor:pointer"/>`;
  s+=TS(401,56,'↻',{size:9,fill:'#5d696e',a:'middle'})+`<rect x="394" y="46" width="14" height="13" fill="transparent" data-k="g:KN+" style="cursor:pointer"/>`;
  const typing=!!(g.pwr&&g.edit&&g.buf);
  s+=`<rect x="352" y="111.2" width="42" height="16" rx="8" fill="#8f989c" opacity=".55"/><rect x="352" y="110" width="42" height="16" rx="8" fill="url(#gKey)" stroke="#8a9397" stroke-width=".8"/>`+
    `<rect x="352" y="110" width="21" height="16" rx="8" fill="transparent" data-k="g:${typing?'←':'CL'}" style="cursor:pointer"/><rect x="373" y="110" width="21" height="16" rx="8" fill="transparent" data-k="g:CR" style="cursor:pointer"/>`+
    `<line x1="373" y1="112" x2="373" y2="124" stroke="#a3abaf" stroke-width=".7"/><path d="M359 118l5-3.6v7.2z" fill="#3a4448" pointer-events="none"/><path d="M387 118l-5-3.6v7.2z" fill="#3a4448" pointer-events="none"/>`;
  // Save / Utility / Help (not used in the lab)
  [['Save',72],['Utility',94],['Help',116]].forEach(([l,y])=>s+=gkey(418,y,27,14,'',{})+`<text x="418" y="${y+2.2}" ${SANS} font-size="6" font-weight="700" font-style="italic" fill="#3a4448" text-anchor="middle" pointer-events="none">${l}</text>`);
  // light-blue output area
  s+=`<rect x="266" y="138" width="167" height="66" rx="10" fill="#acd3f2" stroke="#7fb1dc"/><rect x="314" y="140" width="106" height="60" rx="4" fill="none" stroke="#5b8fbf" stroke-width=".7"/>`;
  [['CH1/2',147],['Both',166],['DC',185]].forEach(([l,y])=>s+=gkey(289,y,23,12.5,l,{size:5.4,col:'#2f383c'}));
  const lit=g.pwr&&g.out;
  if(lit)s+=`<rect x="324" y="137.5" width="32" height="18" rx="9" fill="#ff5a5a" opacity=".35"/>`;
  s+=gkey(340,146.5,26,13.5,'CH1',{k:'CH1',size:7,w:400,fill:lit?'#ff4d4d':'url(#gKey)',stroke:lit?'#c42424':'#8a9397',col:lit?'#5e0c0c':'#2f383c'});
  s+=`<rect x="353" y="140.5" width="20" height="12" fill="#2a5cb5" stroke="#e8eef8" stroke-width=".5"/>`+TS(363,145.4,'10 MHz',{size:3.3,fill:'#fff',a:'middle',w:700})+TS(363,150.4,'125 MSa/s',{size:3.1,fill:'#fff',a:'middle',w:700});
  s+=gkey(389,146.5,26,13.5,'CH2',{size:7,w:400,col:'#2f383c'});
  s+=TS(330,164.5,'OUT1',{size:5,fill:'#2f4f6c',a:'middle'})+TS(388,164.5,'OUT2',{size:5,fill:'#2f4f6c',a:'middle'});
  s+=bnc(330,182,13)+bnc(388,182,12);
  // bottom row: ⚠ + power key, then the six waveform keys (sine / square / ramp are the ones the lab uses)
  s+=`<path d="M19 163l6 10.5H13z" fill="none" stroke="#2f383c" stroke-width="1"/>`+TS(19,172.3,'!',{size:7,w:700,fill:'#2f383c',a:'middle'})+
    `<path d="M15.5 180h7M17 180v-2.5h4v2.5M16 182.5h6" stroke="#2f383c" stroke-width=".9" fill="none"/>`;
  s+=gkey(23,195,30,15,'',{k:'PWR',fill:'#e1e4e5',stroke:'#59646a'})+`<rect x="13" y="192" width="20" height="6" rx="3" fill="none" stroke="#6b767b" stroke-width="1.1" pointer-events="none"/>`;
  [['Sine',1],['Square',1],['Ramp',1],['Pulse',0],['Noise',0],['Arb',0]].forEach(([w,live],i)=>{const x=72+i*28,y=196,on=live&&g.pwr&&g.wave===w;
    s+=gkey(x,y,23,13.5,'',live?{k:w,fill:on?'#2f7df5':undefined,stroke:on?'#1b5fcf':undefined}:{})+`<path d="${ICON[w]}" transform="translate(${x} ${y})" fill="none" stroke="${on?'#ffffff':'#3a4448'}" stroke-width="1" pointer-events="none"/>`});
  return s+'</g>'}
let genErrT=null;function genErr(m){RT.S.gen.err=m;clearTimeout(genErrT);genErrT=setTimeout(()=>{RT.S.gen.err='';RT.render()},1400)}
const STEP={f:g=>Math.pow(10,g.dig.f),a:g=>Math.pow(10,g.dig.a),o:g=>Math.pow(10,g.dig.o),h:g=>Math.pow(10,g.dig.o),l:g=>Math.pow(10,g.dig.o)};
const fmtStep=(p,st)=>p==='f'?(st>=1e3?st/1e3+' kHz':st+' Hz'):(st>=1?st+' V':Math.round(st*1000)+' mV');
const DIG={f:[-1,6],a:[-3,0],o:[-3,0]};
/* the knob: one step of the digit under the cursor on the selected parameter */
function knobTurn(g,dir){if(g.edit&&!g.buf){g.sel=g.edit;g.edit=null}if(g.edit)return;const p=g.sel||'a';const st=STEP[p](g);
  if(p==='f')g.freq=clamp(+(g.freq+dir*st).toPrecision(9),0.1,25e6);
  else if(p==='a'){const a=+(g.amp+dir*st).toPrecision(9);if(a<=0.001-1e-12)return;if(a>20){genErr('Ampl limit 20Vpp');return}g.amp=a}
  else{const o=+(g.off+dir*st).toPrecision(9);if(Math.abs(o)+g.amp/2>10){genErr('Out of range');return}g.off=o}
  g.kang=(g.kang||0)+dir*0.35;RT.dirty=true}
function genKey(k){const g=RT.S.gen;if(!g.dig)g.dig={f:0,a:-1,o:-1};if(k==='PWR'){g.pwr=!g.pwr;g.edit=null;if(!g.pwr)g.out=false;RT.dirty=true;return}if(!g.pwr)return;
  if(k==='CH1'){g.out=!g.out;RT.dirty=true;return}
  if(WAVES.includes(k)){g.wave=k;RT.dirty=true;return}
  if(k==='KN+'||k==='KN-'){knobTurn(g,k==='KN+'?1:-1);return}
  if(k==='CL'||k==='CR'){const p=(g.edit&&!g.buf?g.edit:g.sel)||'a',q=p==='h'||p==='l'?'o':p;g.dig[q]=clamp(g.dig[q]+(k==='CL'?1:-1),DIG[q][0],DIG[q][1]);return}
  if(!g.edit){const m={F1:'f',F2:'a',F3:'o',F4:'h',F5:'l'}[k];if(m){g.edit=m;g.sel=m;g.buf=''}return}
  if(/^[0-9]$/.test(k)){if(g.buf.replace('-','').length<9)g.buf+=k;return}
  if(k==='.'){if(!g.buf.includes('.'))g.buf+=(/\d$/.test(g.buf)?'':'0')+'.';return}
  if(k==='±'){g.buf=g.buf.startsWith('-')?g.buf.slice(1):'-'+g.buf;return}
  if(k==='←'){g.buf=g.buf.slice(0,-1);return}
  if(k==='F5'){g.edit=null;return}
  const E=EDIT[g.edit];const u=E.units[{F1:0,F2:1,F3:2,F4:3}[k]];if(!u)return;const v=parseFloat(g.buf);if(isNaN(v)){g.edit=null;return}const val=v*u[1];
  let f=g.freq,a=g.amp,o=g.off;
  if(g.edit==='f'){if(val<=0){genErr('Invalid value');g.edit=null;return}f=clamp(val,0.1,25e6)}
  if(g.edit==='a'){if(val<=0){genErr('Invalid value');g.edit=null;return}a=val}
  if(g.edit==='o')o=val;
  if(g.edit==='h'){const lo=o-a/2;if(val<=lo){genErr('Hi must be > Lo');g.edit=null;return}a=val-lo;o=(val+lo)/2}
  if(g.edit==='l'){const hi=o+a/2;if(val>=hi){genErr('Lo must be < Hi');g.edit=null;return}a=hi-val;o=(hi+val)/2}
  if(a>20){a=20;genErr('Ampl limit 20Vpp')}if(Math.abs(o)+a/2>10){o=Math.sign(o)*(10-a/2);genErr('Out of range')}
  g.freq=f;g.amp=+a.toPrecision(6);g.off=+o.toPrecision(6);g.edit=null;RT.dirty=true}
function fresh(){return Object.assign({pwr:false,out:false,wave:'Square',freq:1000,amp:4,off:0.5,edit:null,buf:'',sel:'a',dig:{f:0,a:-1,o:-1},kang:0},opt.prev||{})}
return {key:'gen',prefix:'g',size:[440*G0.s,220*G0.s],fresh,svg:genSVG,keyFn:genKey,wheel:['KN'],knobInfo:()=>{const g=RT.S.gen,p=g.sel||'a';return p==='f'?fmtFreq(g.freq):p==='o'?'Offset '+fmtLv(g.off):p==='h'?'Hi '+fmtLv(g.off+g.amp/2):p==='l'?'Lo '+fmtLv(g.off-g.amp/2):fmtAmp(g.amp)},wv,
  leads:[{k:'gr',label:'GEN OUT',from:{x:GEN_BNC.x-14,y:GEN_BNC.y},coax:true,grp:'gr',jat:GEN_BNC,tray:'GEN OUT',jn:'CH1 OUT'},{k:'gb',label:'GEN ⏚',from:{x:GEN_BNC.x+14,y:GEN_BNC.y},earth:true,coax:true,grp:'gr'}],
  cables:D=>D.coax(GEN_BNC,'gr','gb','GEN'),
  /* 50 Ω output referenced to earth (its black clip is earthed through the mains plug) */
  stamp(ck,force){const g=RT.S.gen,L=RT.S.leads;const genOn=force||(g.pwr&&g.out);if(L.gr.node!=null&&genOn)ck.els.push({t:'VS',a:ck.idx(L.gr.node),r:50})},
  on:()=>RT.S.gen.pwr&&RT.S.gen.out&&RT.S.leads.gr.node!=null,
  sigF:()=>RT.S.gen.freq};
};
ENGINE.gen.size=[572,286];
