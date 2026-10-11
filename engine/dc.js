/* Single-unit DC power supply of the prototype (to be replaced by the TTi EL302RD). State in S.dc. */
ENGINE.knob=function(cx,cy,r,col,key,label,val){let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#c9d1d5" stroke="${col}" stroke-width="3" ${key.endsWith('P')?`data-k="${key}c" style="cursor:pointer"`:''}/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-r+3}" stroke="#55646a" stroke-width="2" pointer-events="none"/>`;
  s+=`<path d="M${cx-r-14} ${cy} l9 -7 v14 z" fill="#55646a"/><rect x="${cx-r-18}" y="${cy-11}" width="16" height="22" fill="transparent" data-k="${key}-" style="cursor:pointer"/>`;
  s+=`<path d="M${cx+r+14} ${cy} l-9 -7 v14 z" fill="#55646a"/><rect x="${cx+r+2}" y="${cy-11}" width="16" height="22" fill="transparent" data-k="${key}+" style="cursor:pointer"/>`;
  s+=T(cx,cy+r+12,label,{size:8,fill:'#3b4a50',a:'middle'});if(val!=null)s+=T(cx,cy+r+23,val,{size:9,fill:'#1d2a2e',a:'middle',w:600});return s};
ENGINE.dc=function(RT,opt){
const D0=opt.at;const knob=ENGINE.knob;
const DC_T={r:{x:D0.x+200,y:D0.y+172},b:{x:D0.x+245,y:D0.y+172}};
function dcSVG(){const d=RT.S.dc;let s=`<g transform="translate(${D0.x} ${D0.y})">`;
  s+=`<rect width="280" height="210" rx="12" fill="#dfe5e8" stroke="#9fb0b6" stroke-width="2"/>`+T(14,18,'DC POWER SUPPLY',{size:10,fill:'#3b4a50',w:600});
  const on=d.pwr;s+=`<rect x="16" y="28" width="116" height="42" fill="#200a0a"/><rect x="148" y="28" width="116" height="42" fill="#200a0a"/>`;
  if(on){s+=T(124,58,d.v.toFixed(2),{size:24,fill:'#ff4b3a',a:'end',w:600})+T(256,58,(d.out?RT.DCI:d.ilim).toFixed(3),{size:24,fill:'#ff4b3a',a:'end',w:600})}
  s+=T(74,82,'VOLTS',{size:8,fill:'#3b4a50',a:'middle'})+T(206,82,'AMPS',{size:8,fill:'#3b4a50',a:'middle'});
  s+=`<circle cx="160" cy="80" r="4" fill="${on&&d.out&&!RT.DCCC?'#46e070':'#555'}"/>`+T(167,83,'CV',{size:7.5,fill:'#3b4a50'})+`<circle cx="236" cy="80" r="4" fill="${on&&d.out&&RT.DCCC?'#ff4b3a':'#555'}"/>`+T(243,83,'CC',{size:7.5,fill:'#3b4a50'});
  s+=knob(48,120,14,'#8a9aa0','d:VC','COARSE')+knob(128,120,14,'#8a9aa0','d:VF','FINE')+knob(218,120,14,'#8a9aa0','d:I','CURRENT');
  s+=`<rect x="16" y="168" width="48" height="24" rx="5" fill="#2d3438" data-k="d:PWR" style="cursor:pointer"/>`+T(40,184,'POWER',{size:8.5,fill:'#e8eef0',a:'middle'})+`<circle cx="72" cy="180" r="4" fill="${on?'#46e070':'#555'}"/>`;
  s+=`<rect x="90" y="168" width="60" height="24" rx="5" fill="${on&&d.out?'#3cd070':'#c7d0d4'}" stroke="#9fb0b6" data-k="d:OUT" style="cursor:pointer"/>`+T(120,184,'OUTPUT',{size:9,a:'middle',w:600});
  s+=`<circle cx="200" cy="172" r="11" fill="#d33" stroke="#7a1b1b" stroke-width="2"/><circle cx="245" cy="172" r="11" fill="#222" stroke="#000" stroke-width="2"/>`+T(200,200,'+',{size:11,a:'middle',w:600})+T(245,200,'−',{size:11,a:'middle',w:600});
  return s+'</g>'}
function dcKey(k){const d=RT.S.dc;if(k==='PWR'){d.pwr=!d.pwr;if(!d.pwr)d.out=false;RT.dirty=true;return}if(!d.pwr)return;
  if(k==='OUT'){d.out=!d.out;RT.dirty=true;return}
  const st={'VC-':-1,'VC+':1,'VF-':-0.01,'VF+':0.01}[k];if(st){d.v=clamp(Math.round((d.v+st)*100)/100,0,30);RT.dirty=true;return}
  if(k==='I-'||k==='I+'){d.ilim=clamp(Math.round((d.ilim+(k==='I+'?0.01:-0.01))*100)/100,0.01,2);RT.dirty=true}}
function fresh(){return Object.assign({pwr:false,out:false,v:5,ilim:0.1},opt.prev||{})}
return {key:'dc',prefix:'d',fresh,svg:dcSVG,keyFn:dcKey,wheel:['VC','VF','I'],
  leads:[{k:'dr',park:opt.park.dr},{k:'db',park:opt.park.db}],
  cables:D=>{const pr=D.leadPos('dr'),pb=D.leadPos('db');const P=opt.park;return D.lead(DC_T.r,pr,'#e2453b','#5a1414')+D.lead(DC_T.b,pb,'#30363a','#000')+D.plug('dr',pr,RED,'#7a1b1b')+D.plug('db',pb,BLK,'#000')+
    `<text x="${(P.dr.x+P.db.x)/2}" y="${P.dr.y+28}" font-size="10" fill="#93a6ab" text-anchor="middle" pointer-events="none">DC</text>`},
  stamp(ck){const d=RT.S.dc,L=RT.S.leads;if(d.pwr&&d.out&&L.dr.node!=null&&L.db.node!=null){ck.dcIdx=ck.els.length;ck.els.push({t:'DC',a:ck.idx(L.dr.node),b:ck.idx(L.db.node),v:d.v,ilim:d.ilim,r:0.02})}}};
};
