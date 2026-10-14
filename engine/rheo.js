/* The rheostats of EE205 Exp 5 (the Y load): four Leybold slide rheostats (537 3x) side by side, as on the lab table
   (docs/ee205/instruments/rheostat-notes.md). Each one is drawn as two parts, like the real thing:
     · the body seen from above: a long beige ventilated housing, its top split in two halves along the length, the black
       slider carriage riding in the gap — drag it along the rail and the resistance follows (wheel / arrow keys / touch pad:
       1 Ω per step, keys S1± … S4±);
     · the dark-grey end panel facing the student: red 4 mm socket at the top (one end of the winding), the round recessed
       element, «max 500 V», the black socket (the slider) and the green-yellow earth socket (case, not used).
   No buttons or readouts that the real rheostat does not have: the student sets R with the ohmmeter, as in the manual.
   0 … 330 Ω between red and black, ≈1.5 A. Leads r1a / r1b … r3a / r3b (banana, in the circuit); the fourth rheostat's
   sockets take any lead (r4a / r4b, spare). Stamps G = 1/R per rheostat (≥ 0.1 Ω). State S.rh = {r:[R1 … R4]} in Ω. */
ENGINE.rheo=function(RT,opt){
const KEY='rh',PFX='r',RMAX=330,N=4,UW=95,GAP=14,W=N*UW+(N-1)*GAP,H=515;   // 1 unit ≈ 1 mm: 95 wide, 330 long, end panel 160 high
const UX=[...Array(N)].map((_,i)=>i*(UW+GAP));
const B0=12,B1=322;                                    // slider travel along the top (far end … red end)
const PY=338;                                          // end panel top
const jack=i=>{const cx=UX[i]+UW/2;return {a:{x:cx+4,y:PY+30},b:{x:cx-22,y:PY+136},g:{x:cx+22,y:PY+136}}};
function fresh(){const d={r:[260,180,310,120]};if(opt.prev)opt.prev(d);while(d.r.length<N)d.r.push(150);return d}
/* the slider's distance from the red (near) end sets R */
const yOf=R=>B1-R/RMAX*(B1-B0);
function body(i){const R=RT.S[KEY].r[i],x=UX[i],cx=x+UW/2;let s='';
  s+=`<rect x="${x}" y="0" width="${UW}" height="${PY-6}" rx="3" fill="#e4ddc6" stroke="#a49b80" stroke-width="1.5"/>`;
  /* the two halves of the top, each with its rows of ventilation slits along the long sides */
  s+=`<rect x="${x+4}" y="4" width="${UW/2-8}" height="${PY-14}" rx="2" fill="#ebe5d0" stroke="#c2b99d"/><rect x="${cx+4}" y="4" width="${UW/2-8}" height="${PY-14}" rx="2" fill="#ebe5d0" stroke="#c2b99d"/>`;
  for(let y=14;y<PY-18;y+=7)s+=`<rect x="${x+8}" y="${y}" width="22" height="2.6" rx="1.2" fill="#8f8667"/><rect x="${cx+UW/2-30}" y="${y}" width="22" height="2.6" rx="1.2" fill="#8f8667"/>`;
  s+=`<rect x="${cx-4}" y="4" width="8" height="${PY-14}" fill="#5b574b"/>`;                         // the gap the slider rides in
  [[x+12,PY-16],[cx+12,PY-16]].forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="2.4" fill="#b9b092" stroke="#857c62"/>`);
  /* slider carriage: black block with its pale label, astride the gap */
  const ys=yOf(R);
  s+=`<rect x="${cx-27}" y="${ys-22}" width="54" height="44" rx="4" fill="#202224" stroke="#000" data-k="slide:${PFX}:S${i+1}" data-knob="${PFX}:S${i+1}" style="cursor:grab"/>`+
     `<rect x="${cx-30}" y="${ys+10}" width="60" height="9" rx="2" fill="#2e3134" pointer-events="none"/>`+
     `<rect x="${cx-18}" y="${ys-16}" width="36" height="20" rx="1.5" fill="#cfd2cf" opacity=".85" pointer-events="none"/>`+
     [0,1,2].map(k=>`<line x1="${cx-14}" y1="${ys-12+k*5}" x2="${cx+14}" y2="${ys-12+k*5}" stroke="#7d8380" stroke-width=".8" pointer-events="none"/>`).join('');
  s+=`<rect x="${cx-34}" y="${ys-28}" width="68" height="56" fill="transparent" data-k="slide:${PFX}:S${i+1}" data-knob="${PFX}:S${i+1}" style="cursor:grab"/>`;
  return s}
function panel(i){const x=UX[i],cx=x+UW/2,J=jack(i);let s='';
  /* the housing's sheet wraps the dark end plate (a separate part on the drawing, joined only by the shadow line) */
  s+=`<rect x="${x}" y="${PY}" width="${UW}" height="${H-PY-14}" rx="3" fill="#e4ddc6" stroke="#a49b80" stroke-width="1.5"/><rect x="${x+7}" y="${PY+8}" width="${UW-14}" height="${H-PY-30}" rx="2" fill="#4a4b46" stroke="#2c2d2a"/>`;
  s+=`<circle cx="${J.a.x}" cy="${J.a.y}" r="10.5" fill="#c62a20" stroke="#6d140d" stroke-width="2"/><circle cx="${J.a.x}" cy="${J.a.y}" r="4.2" fill="#3a0b07"/>`;
  s+=`<circle cx="${cx-6}" cy="${PY+78}" r="23" fill="#3a3b37" stroke="#2a2b28" stroke-width="2"/><circle cx="${cx-6}" cy="${PY+78}" r="16" fill="#41423e"/><circle cx="${cx-6}" cy="${PY+78}" r="7.5" fill="#151515"/>`;
  s+=T(cx+38,PY+116,'max 500 V',{size:5.6,fill:'#d8c94a',a:'end',w:700});
  s+=`<circle cx="${J.b.x}" cy="${J.b.y}" r="10.5" fill="#1a1b1c" stroke="#000" stroke-width="2"/><circle cx="${J.b.x}" cy="${J.b.y}" r="4.2" fill="#555"/>`;
  s+=`<circle cx="${cx}" cy="${PY+136}" r="4" fill="none" stroke="#c9c6b8" stroke-width=".9"/><path d="M${cx} ${PY+133} v3 M${cx-2.5} ${PY+136} h5 M${cx-1.6} ${PY+137.6} h3.2" stroke="#c9c6b8" stroke-width=".8"/>`;
  s+=`<circle cx="${J.g.x}" cy="${J.g.y}" r="10.5" fill="#e3c81e" stroke="#7a6a10" stroke-width="2"/><circle cx="${J.g.x}" cy="${J.g.y}" r="5" fill="#2c9c46"/><circle cx="${J.g.x}" cy="${J.g.y}" r="2" fill="#174f24"/>`;
  s+=T(cx,H-2,'R'+(i+1),{size:9,fill:'#5c5848',a:'middle',w:700});   // the group's own name for it, on the desk under the rheostat
  return s}
function svg(){let s='';for(let i=0;i<N;i++)s+=body(i)+panel(i);return s}
function set(j,n){const r=RT.S[KEY].r;n=clamp(Math.round(n),0,RMAX);if(n!==r[j]){r[j]=n;RT.dirty=true;return true}return false}
function key(k){const m=k.match(/^([ST])([1-4])([+-])$/);if(!m)return;const j=+m[2]-1;set(j,RT.S[KEY].r[j]+(m[3]==='+'?1:-1)*(m[1]==='T'?10:1))}
/* drag the carriage: it follows the pointer along the rail */
function slideTo(b,p){const m=b.match(/^S([1-4])$/);if(!m)return false;const j=+m[1]-1;return set(j,(B1-clamp(p.y,B0,B1))/(B1-B0)*RMAX)}
const LEADS=[];for(let i=0;i<N;i++){const J=jack(i),n=i+1,sp=i>=3;
  LEADS.push({k:`r${n}a`,label:`R${n} a`,from:J.a,banana:true,circuit:true,pol:'+',tray:`R${n} a`,jn:`rheostat R${n} (red)`,spare:sp});
  LEADS.push({k:`r${n}b`,label:`R${n} b`,from:J.b,banana:true,circuit:true,pol:'-',tray:`R${n} b`,jn:`rheostat R${n} (slider)`,spare:sp})}
return {key:KEY,prefix:PFX,size:[W,H],name:['Rheostats','المقاومات المتغيرة'],fresh,svg,keyFn:key,slideTo,
  wheel:['S1','S2','S3','S4'],knobInfo:b=>`R${b[1]} = ${RT.S[KEY].r[+b[1]-1]} Ω`,
  value:i=>RT.S[KEY].r[i],leads:LEADS,
  stamp(ck){const L=RT.S.leads;for(let i=0;i<N;i++){const a=L[`r${i+1}a`],b=L[`r${i+1}b`];if(!a||!b||a.node==null||b.node==null)continue;
    ck.els.push({t:'G',a:ck.idx(a.node),b:ck.idx(b.node),g:1/Math.max(0.1,RT.S[KEY].r[i]),box:KEY+(i+1)})}}};
};
ENGINE.rheo.size=[422,515];
