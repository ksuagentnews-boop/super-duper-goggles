/* Bank of three slide rheostats (EE205 Exp 5, the three-phase Y load): each one a long cream ventilated housing with the
   winding inside and the black slider block riding on a rail along its top; the front panel carries the red socket (one
   end of the winding), the black socket (the slider) and the green / yellow earth socket (case, not used), as in the lab
   photo. 0 … 330 Ω between red and black, ≈1.5 A. Seen from above, side by side; a scale beside each rail.
   Control: the slider itself is a knob for the bench (wheel / touch drag / tap → big ◀ ▶ pad, 1 Ω per step: keys S1± S2± S3±),
   plus −10 / −1 / +1 / +10 buttons under each one (T1± … = 10 Ω).
   Leads r1a / r1b … r3a / r3b (banana, part of the circuit). Stamps G = 1/R per rheostat (≥ 0.1 Ω contact at the end).
   State S.rh = {r:[R1, R2, R3]} in Ω. value(i) → R of rheostat i (0, 1, 2). */
ENGINE.rheo=function(RT,opt){
const KEY='rh',PFX='r';const W=450,H=500,RMAX=330,UW=130,GAP=20;
const UX=[0,1,2].map(i=>10+i*(UW+GAP));           // left edge of each housing
const Y0=56,Y1=300;                                  // rail: 330 Ω at the top, 0 Ω at the bottom
const jack=i=>{const cx=UX[i]+UW/2;return {a:{x:cx,y:350},b:{x:cx-26,y:420},g:{x:cx+26,y:420}}};
function fresh(){const d={r:[260,180,310]};if(opt.prev)opt.prev(d);return d}
const yOf=R=>Y1-R/RMAX*(Y1-Y0);
function unit(i){const R=RT.S[KEY].r[i],x=UX[i],cx=x+UW/2,J=jack(i);let s='';
  s+=`<rect x="${x}" y="28" width="${UW}" height="${H-76}" rx="6" fill="#e6e0cc" stroke="#9c9478" stroke-width="2"/>`;
  /* ventilation slots on both halves of the top, the rail between them */
  for(let y=40;y<312;y+=8)s+=`<rect x="${x+8}" y="${y}" width="${UW/2-30}" height="3.5" rx="1.5" fill="#bdb59a"/><rect x="${cx+22}" y="${y}" width="${UW/2-30}" height="3.5" rx="1.5" fill="#bdb59a"/>`;
  s+=`<rect x="${cx-12}" y="${Y0-12}" width="24" height="${Y1-Y0+24}" rx="4" fill="#cfc7ab" stroke="#9c9478"/><line x1="${cx}" y1="${Y0-6}" x2="${cx}" y2="${Y1+6}" stroke="#8a826a" stroke-width="2"/>`;
  /* scale beside the rail */
  for(let v=0;v<=RMAX;v+=30){const y=yOf(v);s+=`<line x1="${cx+14}" y1="${y}" x2="${cx+(v%90===0?22:18)}" y2="${y}" stroke="#4a4433" stroke-width="1"/>`;if(v%90===0||v===RMAX)s+=T(cx-16,y+3,String(v),{size:7,fill:'#4a4433',a:'end'})}
  s+=T(cx-16,Y0-16,'Ω',{size:7,fill:'#4a4433',a:'end'});
  /* slider block (the knob of this rheostat) */
  const ys=yOf(R);
  s+=`<rect x="${cx-34}" y="${ys-14}" width="68" height="28" rx="4" fill="#1d1f21" stroke="#000" data-k="knob:${PFX}:S${i+1}" data-knob="${PFX}:S${i+1}" style="cursor:grab"/>`;
  for(let k=-24;k<=24;k+=6)s+=`<line x1="${cx+k}" y1="${ys-9}" x2="${cx+k}" y2="${ys+9}" stroke="#3a3e41" stroke-width="2" pointer-events="none"/>`;
  s+=`<circle cx="${cx}" cy="${ys}" r="9" fill="#2c3033" stroke="#5c6266" stroke-width="1.5" data-k="knob:${PFX}:S${i+1}" data-knob="${PFX}:S${i+1}" style="cursor:grab"/><line x1="${cx+36}" y1="${ys}" x2="${cx+44}" y2="${ys}" stroke="#d22" stroke-width="2" pointer-events="none"/>`;
  /* front panel */
  s+=`<rect x="${x+6}" y="324" width="${UW-12}" height="120" rx="4" fill="#4a4c45" stroke="#2c2d29"/>`;
  s+=`<circle cx="${cx-30}" cy="383" r="13" fill="#2a2c28" stroke="#1a1b19"/><circle cx="${cx-30}" cy="383" r="5" fill="#111"/>`;
  [372,392].forEach(y=>s+=`<path d="M${cx+34} ${y-8} l8 13 h-16z" fill="#e8d22a" stroke="#222" stroke-width=".8"/>`);
  s+=T(cx+16,398,'max 600V~',{size:6,fill:'#e8d22a',a:'end'});
  s+=`<circle cx="${J.a.x}" cy="${J.a.y}" r="11" fill="#c8261c" stroke="#5a0e09" stroke-width="2"/><circle cx="${J.a.x}" cy="${J.a.y}" r="4.5" fill="#3a0b07"/>`;
  s+=`<circle cx="${J.b.x}" cy="${J.b.y}" r="11" fill="#1a1b1c" stroke="#000" stroke-width="2"/><circle cx="${J.b.x}" cy="${J.b.y}" r="4.5" fill="#555"/>`;
  s+=`<circle cx="${J.g.x}" cy="${J.g.y}" r="11" fill="#e8c51c" stroke="#555" stroke-width="2"/><circle cx="${J.g.x}" cy="${J.g.y}" r="5" fill="#2fa04a"/>`;
  s+=T(cx,18,'R'+(i+1)+'  ·  330 Ω  1.5 A',{size:9,fill:'#2f2b20',a:'middle',w:700});
  /* −10 −1 [R] +1 +10 */
  const by=H-40;const btn=(bx,k,l)=>`<rect x="${bx}" y="${by}" width="24" height="24" rx="5" fill="#f4f1e6" stroke="#7d7660" data-k="${PFX}:${k}" style="cursor:pointer"/>`+T(bx+12,by+16,l,{size:l.length>2?7.5:9,fill:'#2f2b20',a:'middle',w:700});
  s+=btn(x,`T${i+1}-`,'−10')+btn(x+26,`S${i+1}-`,'−1')+btn(x+UW-50,`S${i+1}+`,'+1')+btn(x+UW-24,`T${i+1}+`,'+10');
  s+=`<rect x="${x+52}" y="${by+3}" width="${UW-104}" height="18" rx="3" fill="#2a2a22"/>`+T(cx,by+16,R+'Ω',{size:9,fill:'#9cf2a0',a:'middle',w:600});
  return s}
function svg(){return unit(0)+unit(1)+unit(2)}
function key(k){const m=k.match(/^([ST])([1-3])([+-])$/);if(!m)return;const r=RT.S[KEY].r,j=+m[2]-1;
  const n=clamp(r[j]+(m[3]==='+'?1:-1)*(m[1]==='T'?10:1),0,RMAX);if(n!==r[j]){r[j]=n;RT.dirty=true}}
const LEADS=[];[0,1,2].forEach(i=>{const J=jack(i),n=i+1;
  LEADS.push({k:`r${n}a`,label:`R${n} a`,from:J.a,banana:true,circuit:true,pol:'+',tray:`R${n} a`,jn:`rheostat R${n} (red)`});
  LEADS.push({k:`r${n}b`,label:`R${n} b`,from:J.b,banana:true,circuit:true,pol:'-',tray:`R${n} b`,jn:`rheostat R${n} (slider)`})});
return {key:KEY,prefix:PFX,size:[W,H],name:['Rheostats','المقاومات المتغيرة'],fresh,svg,keyFn:key,
  wheel:['S1','S2','S3','T1','T2','T3'],knobInfo:b=>`R${b[1]} = ${RT.S[KEY].r[+b[1]-1]} Ω`,
  value:i=>RT.S[KEY].r[i],leads:LEADS,
  stamp(ck){const L=RT.S.leads;[0,1,2].forEach(i=>{const a=L[`r${i+1}a`],b=L[`r${i+1}b`];if(!a||!b||a.node==null||b.node==null)return;
    ck.els.push({t:'G',a:ck.idx(a.node),b:ck.idx(b.node),g:1/Math.max(0.1,RT.S[KEY].r[i]),box:KEY+(i+1)})})}};
};
ENGINE.rheo.size=[450,500];
