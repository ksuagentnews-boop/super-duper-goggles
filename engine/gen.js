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
function genSVG(){const g=RT.S.gen;let s=`<g transform="translate(${G0.x} ${G0.y}) scale(${G0.s})">`;
  s+=`<rect width="440" height="220" rx="14" fill="#dfe5e8" stroke="#9fb0b6" stroke-width="2"/>`+T(18,20,'PeakTech 4124 · Function Generator',{size:11,fill:'#3b4a50'});
  s+=`<rect x="16" y="28" width="200" height="124" rx="5" fill="${g.pwr?'#1d3f9e':'#0b1220'}"/>`;
  if(g.pwr){const E=g.edit?EDIT[g.edit]:null;const lab=E?[...E.units.map(u=>u[0]),'','','',''].slice(0,4).concat(['Cancel']):['Freq','Ampl','Offset','Hi_Level','Lo_Level'];
    lab.forEach((l,i)=>{if(l)s+=T(212,44+i*24,l,{size:8.8,fill:E?'#ffe066':'#b9c8ff',a:'end'})});
    const ed=k=>g.edit===k,bf=()=>(g.buf||'')+'▌';
    s+=T(22,42,'Frequency',{size:8.5,fill:'#b9c8ff'})+T(22,60,ed('f')?bf():fmtFreq(g.freq),{size:13,fill:ed('f')?'#ffe066':'#fff',w:600});
    s+=T(22,76,'Amplitude',{size:8.5,fill:'#b9c8ff'})+T(22,94,ed('a')?bf():fmtAmp(g.amp),{size:13,fill:'#ffe066',w:600});
    s+=T(22,111,'Offset '+(ed('o')?bf():fmtLv(g.off)),{size:9.5,fill:ed('o')?'#ffe066':'#fff'});
    s+=T(22,127,'Hi '+(ed('h')?bf():fmtLv(g.off+g.amp/2))+'  Lo '+(ed('l')?bf():fmtLv(g.off-g.amp/2)),{size:9,fill:(ed('h')||ed('l'))?'#ffe066':'#c9d6ff'});
    s+=T(22,145,g.wave+' · Load High Z',{size:8.5,fill:'#b9c8ff'})+T(150,42,g.out?'CH1 ON':'CH1 OFF',{size:8.5,fill:g.out?'#7dff9a':'#8fa3ff',a:'end'});
    {const p=g.sel||'a',st=STEP[p](g),y={f:60,a:94,o:111,h:127,l:127}[p];s+=T(214,y,'◆ ±'+fmtStep(p,st),{size:7.5,fill:'#7dff9a',a:'end'})}
    if(g.err)s+=`<rect x="40" y="70" width="150" height="24" rx="4" fill="#5a1414"/>`+T(115,86,g.err,{size:10,fill:'#fff',a:'middle',w:600});}
  ['F1','F2','F3','F4','F5'].forEach((k,i)=>{const y=30+i*24;s+=`<rect x="222" y="${y}" width="36" height="19" rx="4" fill="#c7d0d4" stroke="#9fb0b6" data-k="g:${k}" style="cursor:pointer"/>`+T(240,y+13,k,{size:10,a:'middle'})});
  ['7','8','9','←','4','5','6','','1','2','3','','0','.','±',''].forEach((k,i)=>{if(!k)return;const x=264+(i%4)*29,y=30+Math.floor(i/4)*24;s+=`<rect x="${x}" y="${y}" width="25" height="19" rx="4" fill="${k==='←'?'#c7d0d4':'#eef2f3'}" stroke="#9fb0b6" data-k="g:${k}" style="cursor:pointer"/>`+T(x+12.5,y+13,k,{size:10,a:'middle'})});
  WAVES.forEach((w,i)=>{const x=80+i*44;const on=g.pwr&&g.wave===w;s+=`<rect x="${x}" y="160" width="40" height="18" rx="4" fill="${on?'#ffd34d':'#eef2f3'}" stroke="#9fb0b6" data-k="g:${w}" style="cursor:pointer"/>`+T(x+20,173,w,{size:8.5,a:'middle'})});
  s+=`<rect x="224" y="168" width="44" height="24" rx="5" fill="${g.pwr&&g.out?'#3cd070':'#c7d0d4'}" stroke="#9fb0b6" data-k="g:CH1" style="cursor:pointer"/>`+T(246,184,'CH1',{size:10.5,a:'middle',w:600});
  s+=`<rect x="20" y="186" width="44" height="22" rx="5" fill="#2d3438" data-k="g:PWR" style="cursor:pointer"/>`+T(42,201,'POWER',{size:8.5,fill:'#e8eef0',a:'middle'})+`<circle cx="72" cy="197" r="4" fill="${g.pwr?'#46e070':'#555'}"/>`;
  // rotary knob and cursor keys
  s+=`<circle cx="410" cy="62" r="21" fill="#e9eef0" stroke="#7d8c92" stroke-width="3"/><circle cx="410" cy="62" r="13" fill="#d3dadd"/><line x1="410" y1="62" x2="${410+Math.sin((g.kang||0))*17}" y2="${62-Math.cos((g.kang||0))*17}" stroke="#55646a" stroke-width="2.5" pointer-events="none"/>`;
  s+=`<path d="M383 62 l8 -7 v14 z" fill="#55646a"/><rect x="380" y="50" width="14" height="24" fill="transparent" data-k="g:KN-" style="cursor:pointer"/><path d="M437 62 l-8 -7 v14 z" fill="#55646a"/><rect x="426" y="50" width="14" height="24" fill="transparent" data-k="g:KN+" style="cursor:pointer"/>`;
  s+=`<rect x="388" y="96" width="20" height="16" rx="3" fill="#eef2f3" stroke="#9fb0b6" data-k="g:CL" style="cursor:pointer"/>`+T(398,108,'◄',{size:9,a:'middle'})+`<rect x="412" y="96" width="20" height="16" rx="3" fill="#eef2f3" stroke="#9fb0b6" data-k="g:CR" style="cursor:pointer"/>`+T(422,108,'►',{size:9,a:'middle'});
  s+=`<circle cx="330" cy="182" r="15" fill="#2c3438" stroke="#7d8c92" stroke-width="3"/><circle cx="330" cy="182" r="5" fill="#c8a24a"/>`+T(330,160,'CH1 OUT',{size:9.5,fill:'#3b4a50',a:'middle'});
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
return {key:'gen',prefix:'g',size:[440*G0.s,220*G0.s],fresh,svg:genSVG,keyFn:genKey,wheel:['KN'],wv,
  leads:[{k:'gr',label:'GEN OUT',from:{x:GEN_BNC.x-14,y:GEN_BNC.y},coax:true},{k:'gb',label:'GEN ⏚',from:{x:GEN_BNC.x+14,y:GEN_BNC.y},earth:true,coax:true}],
  cables:D=>D.coax(GEN_BNC,'gr','gb','GEN'),
  /* 50 Ω output referenced to earth (its black clip is earthed through the mains plug) */
  stamp(ck,force){const g=RT.S.gen,L=RT.S.leads;const genOn=force||(g.pwr&&g.out);if(L.gr.node!=null&&genOn)ck.els.push({t:'VS',a:ck.idx(L.gr.node),r:50})},
  on:()=>RT.S.gen.pwr&&RT.S.gen.out&&RT.S.leads.gr.node!=null,
  sigF:()=>RT.S.gen.freq};
};
ENGINE.gen.size=[572,286];
