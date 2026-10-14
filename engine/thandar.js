/* Thandar TS3022S dual precision dc supply (EE205): two independent 0–30 V / 0–2 A units side by side, each with an LCD
   volts meter and amps meter, VOLTAGE COARSE + FINE, CURRENT LIMIT, an OUTPUT on/off switch and the terminal row
   SENSE − · OUTPUT − · OUTPUT + · SENSE + ; one mains POWER switch. Same contract as the TTi EL302RD (engine/psu.js):
   key 'psu', state S.psu = {pwr, u:[{v,ilim,on},…]}, leads Lp/Lm (left unit +/−) and Rp/Rm (right unit), CV/CC in the
   solver. With the output switch off the meters show the set voltage and the current limit, as on the real unit. */
ENGINE.thandar=function(RT,opt){
const W=560,H=250;const knob=ENGINE.knob;
const UX=[10,284];const SIDE=['L','R'];
const TERM=[{m:{x:96,y:214},p:{x:150,y:214}},{m:{x:370,y:214},p:{x:424,y:214}}];
const RES=Object.assign({c:1,f:0.01},opt.res);
function fresh(){const d={pwr:false,u:[{v:12,ilim:0.5,on:false},{v:5,ilim:1,on:false}]};if(opt.prev)opt.prev(d);return d}
const lcd=(x,y,txt,on,u)=>`<rect x="${x}" y="${y}" width="98" height="36" rx="3" fill="${on?'#c3ccb0':'#8d957c'}" stroke="#2e332a" stroke-width="2"/>`+(on?T(x+80,y+28,txt,{size:23,fill:'#1d2318',a:'end',w:600}):'')+T(x+92,y+29,u,{size:9,fill:'#1d2318',a:'end',w:700});
function unitSVG(u){const d=RT.S.psu,U=d.u[u],x=UX[u],on=d.pwr;const st=RT.psuStat?RT.psuStat(u):null;const live=on&&U.on&&st;
  const V=live?st.v:U.v,I=live?st.i:U.ilim;let s=`<rect x="${x}" y="26" width="266" height="160" rx="8" fill="#e9e6dc" stroke="#c8c2b2"/>`;
  s+=lcd(x+24,36,V.toFixed(2),on,'V')+lcd(x+144,36,I.toFixed(3),on,'A');
  const cc=live&&st.cc;s+=`<circle cx="${x+252}" cy="54" r="4.5" fill="${cc?'#ff3322':'#7a3a3a'}"/>`+(cc?`<circle cx="${x+252}" cy="54" r="9" fill="#ff3322" opacity=".25"/>`:'')+T(x+252,72,'CC',{size:7,fill:'#4a463d',a:'middle'});
  s+=T(x+70,94,'VOLTAGE',{size:8,fill:'#4a463d',a:'middle',w:600})+T(x+40,106,'COARSE',{size:6.5,fill:'#4a463d',a:'middle'})+T(x+102,106,'FINE',{size:6.5,fill:'#4a463d',a:'middle'})+T(x+196,104,'CURRENT LIMIT',{size:7,fill:'#4a463d',a:'middle',w:600});
  const k=SIDE[u];
  s+=knob(x+40,140,15,'#c9c3b4',`p:${k}VC`,'',null,{fill:'#f6f3ec',ang:U.v/30*5-2.5})+knob(x+102,140,13,'#c9c3b4',`p:${k}VF`,'',null,{fill:'#f6f3ec',ang:(U.fk||0)*0.21})+knob(x+196,140,15,'#c9c3b4',`p:${k}I`,'',null,{fill:'#f6f3ec',ang:U.ilim/2*5-2.5});
  return s}
function svg(){const d=RT.S.psu;let s=`<rect width="${W}" height="${H}" rx="10" fill="#dcd8cc" stroke="#9f998a" stroke-width="2"/><rect x="0" y="0" width="${W}" height="18" rx="8" fill="#3b3f42"/>`;
  s+=T(14,13,'THANDAR',{size:9.5,fill:'#f0ede4',w:700})+T(W-14,13,'TS3022S  ·  30V-2A PRECISION DC POWER SUPPLY',{size:8.5,fill:'#f0ede4',a:'end',w:600});
  s+=unitSVG(0)+unitSVG(1);
  s+=`<rect x="6" y="192" width="${W-12}" height="52" rx="6" fill="#e3dfd4" stroke="#c8c2b2"/>`;
  [0,1].forEach(u=>{const t=TERM[u],U=d.u[u],x0=UX[u];
    const post=(x,c,lab)=>`<circle cx="${x}" cy="214" r="10.5" fill="${c}" stroke="#2a2a2a" stroke-width="2"/><circle cx="${x}" cy="214" r="4" fill="#5a5a5a"/>`+T(x,236,lab,{size:6.5,fill:'#4a463d',a:'middle'});
    s+=post(t.m.x-30,'#f2f0ea','SENSE −')+post(t.m.x,'#f2f0ea','OUTPUT −')+post(t.p.x,'#d43a2c','OUTPUT +')+post(t.p.x+30,'#d43a2c','SENSE +');
    const bx=x0+232;s+=T(bx,200,'OUTPUT',{size:6.5,fill:'#4a463d',a:'middle'})+`<rect x="${bx-11}" y="204" width="22" height="26" rx="3" fill="#2b2e30" stroke="#111" data-k="p:${SIDE[u]}ON" style="cursor:pointer"/><rect x="${bx-8}" y="${U.on?207:217}" width="16" height="10" rx="2" fill="#d9d6cf" pointer-events="none"/>`+T(bx+16,212,'ON',{size:6,fill:'#4a463d'})+T(bx+16,229,'OFF',{size:6,fill:'#4a463d'})});
  s+=T(W/2,206,'POWER',{size:7,fill:'#4a463d',a:'middle',w:600})+`<rect x="${W/2-14}" y="210" width="28" height="26" rx="3" fill="#222" stroke="#000" data-k="p:PWR" style="cursor:pointer"/><rect x="${W/2-10}" y="${d.pwr?213:223}" width="20" height="10" rx="2" fill="${d.pwr?'#e74c3c':'#555'}" pointer-events="none"/>`;
  return s}
function key(k){const d=RT.S.psu;
  if(k==='PWR'){d.pwr=!d.pwr;RT.dirty=true;return}
  const m=k.match(/^([LR])(VC|VF|I|ON)([+-]?)$/);if(!m)return;const U=d.u[m[1]==='L'?0:1];const dir=m[3]==='+'?1:-1;
  if(m[2]==='ON'){U.on=!U.on;RT.dirty=true;return}
  if(m[2]==='VC')U.v=clamp(Math.round((U.v+dir*RES.c)*1000)/1000,0,30);
  if(m[2]==='VF'){const f=U.v>=9.9995||U.v+dir*RES.f>=9.9995?Math.max(RES.f,0.01):RES.f;const v=clamp(Math.round((U.v+dir*f)*1000)/1000,0,30);if(v!==U.v)U.fk=(U.fk||0)+dir;U.v=v}   // the FINE pointer turns ≈12° per step
  if(m[2]==='I')U.ilim=clamp(Math.round((U.ilim+dir*0.01)*100)/100,0,2);
  RT.dirty=true}
const LEADS=[{k:'Lm',label:'L −',t:TERM[0].m},{k:'Lp',label:'L +',t:TERM[0].p},{k:'Rm',label:'R −',t:TERM[1].m},{k:'Rp',label:'R +',t:TERM[1].p}];
return {key:'psu',prefix:'p',size:[W,H],name:['Thandar TS3022S','مصدر الجهد المستمر (وحدتين)'],fresh,svg,keyFn:key,
  wheel:['LVC','LVF','LI','RVC','RVF','RI'],
  knobInfo:b=>{const U=RT.S.psu.u[b[0]==='L'?0:1];return (b[0]==='L'?'L ':'R ')+(b.endsWith('I')?U.ilim.toFixed(2)+' A':U.v.toFixed(2)+' V')},
  leads:LEADS.map(l=>({k:l.k,label:l.label,from:l.t,banana:true,pol:l.k.endsWith('m')?'-':'+',tray:`DC ${l.k.endsWith('m')?'−':'+'} (${l.k[0]})`,jn:l.label})),
  stamp(ck){const d=RT.S.psu,L=RT.S.leads;ck.dcs=ck.dcs||[];ck.psu=[null,null];if(!d.pwr)return;
    [0,1].forEach(u=>{const U=d.u[u],p=L[SIDE[u]+'p'],m=L[SIDE[u]+'m'];if(!U.on||p.node==null||m.node==null)return;
      const a=ck.idx(p.node),b=ck.idx(m.node);ck.psu[u]={dc:ck.dcs.length,a,b};ck.dcs.push(ck.els.length);ck.els.push({t:'DC',a,b,v:U.v,ilim:U.ilim,r:0.02})})}};
};
ENGINE.thandar.size=[560,250];
