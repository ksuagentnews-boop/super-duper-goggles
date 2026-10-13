/* TTi EL302RD dual power supply: left and right units (0–30 V, 0–2 A each), one ~POWER switch.
   Each unit: VOLTS / AMPS displays, COARSE + FINE voltage knobs, CURRENT (limit) knob, CC lamp, − / + terminals
   and its own dc switch with positions ON and OFF (PRESET). With the dc switch OFF the meters show the preset
   voltage and current limit (that is how the limit is set before switching on); with it ON they show the actual output.
   State in S.psu = {pwr, u:[{v,ilim,on},{v,ilim,on}]}. Leads: Lp/Lm (left +/−), Rp/Rm (right +/−). */
ENGINE.psu=function(RT,opt){
const P0=opt.at,W=520,H=250;const knob=ENGINE.knob;
const UX=[14,264];                                  // unit panel x (local)
const TERM=[{p:{x:140,y:212},m:{x:100,y:212}},{p:{x:340,y:212},m:{x:300,y:212}}];
const SIDE=['L','R'];
/* knob resolution per press: the real COARSE / FINE pots are continuous; opt.res lets an experiment use finer steps */
const RES=Object.assign({c:1,f:0.01},opt.res);
const abs=p=>({x:P0.x+p.x,y:P0.y+p.y});
function fresh(){const d={pwr:false,u:[{v:12,ilim:0.5,on:false},{v:5,ilim:1,on:false}]};if(opt.prev)opt.prev(d);return d}
const disp=(x,y,txt,on)=>`<rect x="${x}" y="${y}" width="104" height="40" rx="3" fill="#1a0707"/>`+(on?T(x+98,y+31,txt,{size:25,fill:'#ff3b2a',a:'end',w:600}):T(x+98,y+31,'88.88',{size:25,fill:'#2a1010',a:'end',w:600}));
function unitSVG(u){const d=RT.S.psu,U=d.u[u],x=UX[u],on=d.pwr;const st=RT.psuStat?RT.psuStat(u):null;
  const live=on&&U.on&&st;const V=live?st.v:U.v,I=live?st.i:U.ilim;
  let s=`<rect x="${x}" y="30" width="242" height="140" rx="10" fill="#efece4" stroke="#c9c3b5"/>`;
  s+=`<rect x="${x+8}" y="36" width="226" height="52" rx="5" fill="#120404"/>`+disp(x+12,40,V.toFixed(2),on).replace('#1a0707','#120404')+disp(x+122,40,I.toFixed(3),on).replace('#1a0707','#120404');
  s+=T(x+70,98,'VOLTS',{size:7.5,fill:'#5c564b',a:'middle'})+T(x+180,98,'AMPS',{size:7.5,fill:'#5c564b',a:'middle'});
  s+=T(x+72,112,'COARSE — VOLTAGE — FINE',{size:7,fill:'#5c564b',a:'middle'})+T(x+190,112,'CURRENT',{size:7,fill:'#5c564b',a:'middle'});
  const cc=live&&st.cc;s+=`<circle cx="${x+156}" cy="109" r="4" fill="${cc?'#ff2a1a':'#5a2020'}" stroke="#2a0d0d"/>`+(cc?`<circle cx="${x+156}" cy="109" r="8" fill="#ff2a1a" opacity=".25"/>`:'')+T(x+146,112,'CC',{size:7,fill:'#5c564b',a:'end'});
  const k=SIDE[u];
  s+=knob(x+40,140,13,'#b7b0a0',`p:${k}VC`,'',null,{fill:'#f4f1ea',ang:U.v/30*5-2.5})+knob(x+104,140,13,'#b7b0a0',`p:${k}VF`,'',null,{fill:'#f4f1ea',ang:((U.v*100)%100)/100*5-2.5})+knob(x+190,140,13,'#b7b0a0',`p:${k}I`,'',null,{fill:'#f4f1ea',ang:U.ilim/2*5-2.5});
  return s}
function svg(){const d=RT.S.psu;let s=`<g transform="translate(${P0.x} ${P0.y})">`;
  s+=`<rect width="${W}" height="${H}" rx="14" fill="#e4e0d6" stroke="#b4ae9f" stroke-width="2"/>`;
  s+=`<rect x="14" y="8" width="26" height="14" rx="2" fill="#1f4fa0"/>`+T(27,19,'TTi',{size:9,fill:'#fff',a:'middle',w:600})+T(48,19,'EL302RD  DUAL POWER SUPPLY',{size:10,fill:'#3d382f',w:600});
  s+=unitSVG(0)+unitSVG(1);
  s+=`<rect x="8" y="178" width="${W-16}" height="64" rx="8" fill="#ebe8e0" stroke="#cfc9bb"/>`;
  // ~POWER rocker
  s+=T(40,192,'∼ POWER',{size:8,fill:'#3d382f',a:'middle'})+`<rect x="24" y="198" width="32" height="34" rx="4" fill="${d.pwr?'#f7f7f4':'#dcdad3'}" stroke="#77736a" data-k="p:PWR" style="cursor:pointer"/>`+
    `<rect x="28" y="${d.pwr?202:214}" width="24" height="14" rx="2" fill="${d.pwr?'#cfd2cc':'#efeee9'}" pointer-events="none"/>`+T(62,206,'I',{size:8,fill:'#3d382f'})+T(62,230,'O',{size:8,fill:'#3d382f'});
  [0,1].forEach(u=>{const t=TERM[u],U=d.u[u];
    s+=T((t.m.x+t.p.x)/2,192,'−  30V 2A  +',{size:7.5,fill:'#3d382f',a:'middle'});
    s+=`<circle cx="${t.m.x}" cy="${t.m.y}" r="11" fill="#222" stroke="#000" stroke-width="2"/><circle cx="${t.m.x}" cy="${t.m.y}" r="4" fill="#666"/>`;
    s+=`<circle cx="${t.p.x}" cy="${t.p.y}" r="11" fill="#d43a2c" stroke="#7a1b1b" stroke-width="2"/><circle cx="${t.p.x}" cy="${t.p.y}" r="4" fill="#7a1b1b"/>`;
    const sx=t.p.x+34;s+=`<rect x="${sx}" y="196" width="22" height="12" rx="2" fill="#2b2b2b"/>`+T(sx+11,218,'SENSE',{size:5.5,fill:'#3d382f',a:'middle'});
    const bx=t.p.x+82;s+=T(bx,192,'⎓ ON',{size:7,fill:'#3d382f',a:'middle'})+`<circle cx="${bx}" cy="${212}" r="11" fill="${U.on?'#f2f1ec':'#d9d6ce'}" stroke="#6f6b62" stroke-width="2" data-k="p:${SIDE[u]}ON" style="cursor:pointer"/>`+
      (U.on?`<circle cx="${bx}" cy="212" r="6" fill="#c9c6bd" pointer-events="none"/>`:'')+T(bx,236,u?'OFF (PRESET)':'OFF',{size:6.5,fill:'#3d382f',a:'middle'})+
      `<circle cx="${bx+8}" cy="195" r="2.5" fill="${d.pwr&&U.on?'#ff3b2a':'#7a3a3a'}"/>`});
  s+=`<circle cx="${W-34}" cy="212" r="11" fill="#2f8f4a" stroke="#174a26" stroke-width="2"/><circle cx="${W-34}" cy="212" r="4" fill="#174a26"/>`+T(W-34,238,'⏚',{size:11,fill:'#3d382f',a:'middle'});
  return s+'</g>'}
function key(k){const d=RT.S.psu;
  if(k==='PWR'){d.pwr=!d.pwr;RT.dirty=true;return}
  const m=k.match(/^([LR])(VC|VF|I|ON)([+-]?)$/);if(!m)return;const U=d.u[m[1]==='L'?0:1];const dir=m[3]==='+'?1:-1;
  if(m[2]==='ON'){U.on=!U.on;RT.dirty=true;return}
  if(m[2]==='VC')U.v=clamp(Math.round((U.v+dir*RES.c)*1000)/1000,0,30);
  if(m[2]==='VF')U.v=clamp(Math.round((U.v+dir*RES.f)*1000)/1000,0,30);
  if(m[2]==='I')U.ilim=clamp(Math.round((U.ilim+dir*0.01)*100)/100,0,2);
  RT.dirty=true}
const LEADS=[{k:'Lm',label:'L −',t:TERM[0].m},{k:'Lp',label:'L +',t:TERM[0].p},{k:'Rm',label:'R −',t:TERM[1].m},{k:'Rp',label:'R +',t:TERM[1].p}];
return {key:'psu',prefix:'p',size:[W,H],fresh,svg,keyFn:key,
  wheel:['LVC','LVF','LI','RVC','RVF','RI'],
  leads:LEADS.map(l=>({k:l.k,label:l.label,from:abs(l.t),banana:true,pol:l.k.endsWith('m')?'-':'+',tray:`DC ${l.k.endsWith('m')?'−':'+'} (${l.k[0]})`,jn:l.label})),
  cables:D=>LEADS.map(l=>D.banana(abs(l.t),l.k)).join(''),
  /* each unit is a floating source between its + and − terminals (output resistance 20 mΩ) */
  stamp(ck){const d=RT.S.psu,L=RT.S.leads;ck.dcs=ck.dcs||[];ck.psu=[null,null];
    if(!d.pwr)return;
    [0,1].forEach(u=>{const U=d.u[u],p=L[SIDE[u]+'p'],m=L[SIDE[u]+'m'];if(!U.on||p.node==null||m.node==null)return;
      const a=ck.idx(p.node),b=ck.idx(m.node);ck.psu[u]={dc:ck.dcs.length,a,b};ck.dcs.push(ck.els.length);ck.els.push({t:'DC',a,b,v:U.v,ilim:U.ilim,r:0.02})})}};
};
ENGINE.psu.size=[520,250];
