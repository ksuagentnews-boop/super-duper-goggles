/* Two resistance decade boxes (Exp 9 Procedure B: RC and RB). Each box: five decade switches ×1 … ×10k Ω (0–9 each,
   0 – 99 999 Ω), a value readout and two binding posts. Residual (all switches at 0) ≈ 0.02 Ω.
   State in S.dbox = {a:[d0..d4], b:[…]} (d0 = ×1). Leads: A1/A2 (box A), B1/B2 (box B). */
ENGINE.dbox=function(RT,opt){
const B0=opt.at,W=700,H=210,BW=340;const knob=ENGINE.knob;const MUL=['×1','×10','×100','×1k','×10k'];
const BOX=['a','b'];const post=(i,j)=>({x:B0.x+i*(BW+20)+BW-70+j*44,y:B0.y+H-34});
const value=d=>d.reduce((s,v,i)=>s+v*Math.pow(10,i),0);
const fmtR=r=>r>=1000?(r/1000).toFixed(3).replace(/\.?0+$/,'')+' kΩ':r+' Ω';
function fresh(){const d={a:[0,0,0,0,0],b:[0,0,0,0,0]};if(opt.prev)opt.prev(d);return d}
function svg(){const D=RT.S.dbox;let s=`<g transform="translate(${B0.x} ${B0.y})">`;
  BOX.forEach((k,i)=>{const x=i*(BW+20),d=D[k];
    s+=`<rect x="${x}" y="0" width="${BW}" height="${H}" rx="12" fill="#23282b" stroke="#0d1012" stroke-width="2"/>`+T(x+14,22,'DECADE RESISTANCE BOX · '+k.toUpperCase(),{size:10.5,fill:'#e9eef0',w:600});
    s+=`<rect x="${x+BW-112}" y="10" width="100" height="20" rx="3" fill="#0d1a12"/>`+T(x+BW-16,25,fmtR(value(d)),{size:12,fill:'#7dff9a',a:'end',w:600});
    for(let j=0;j<5;j++){const cx=x+38+(4-j)*66,cy=82;s+=knob(cx,cy,13,'#9aa6aa',`b:${k.toUpperCase()}${j}`,MUL[j],String(d[j]),{fill:'#3a4246',lc:'#c9d1d5',ang:d[j]/9*5-2.5})}
    s+=T(x+14,H-30,'0.1 % · max 1 W',{size:8.5,fill:'#9aa6aa'});
    [0,1].forEach(j=>{const p=post(i,j);s+=`<circle cx="${p.x-B0.x}" cy="${p.y-B0.y}" r="11" fill="${j?'#222':'#d43a2c'}" stroke="#000" stroke-width="2"/><circle cx="${p.x-B0.x}" cy="${p.y-B0.y}" r="4" fill="#888"/>`})});
  return s+'</g>'}
function key(kk){const m=kk.match(/^([AB])([0-4])([+-])$/);if(!m)return;const d=RT.S.dbox[m[1].toLowerCase()];const j=+m[2];d[j]=clamp(d[j]+(m[3]==='+'?1:-1),0,9);RT.dirty=true}
const LEADS=[];BOX.forEach((k,i)=>[0,1].forEach(j=>LEADS.push({k:'d'+k.toUpperCase()+(j+1),label:k.toUpperCase()+(j+1),t:post(i,j),box:k})));
return {key:'dbox',prefix:'b',size:[W,H],fresh,svg,keyFn:key,
  wheel:['A0','A1','A2','A3','A4','B0','B1','B2','B3','B4'],value:k=>value(RT.S.dbox[k]),
  leads:LEADS.map(l=>({k:l.k,label:l.label,from:l.t,banana:true,circuit:true,pol:l.k.endsWith('2')?'-':'+'})),
  cables:D=>LEADS.map(l=>D.banana(l.t,l.k)).join(''),
  stamp(ck){const L=RT.S.leads;BOX.forEach(k=>{const a=L['d'+k.toUpperCase()+'1'],b=L['d'+k.toUpperCase()+'2'];if(a.node==null||b.node==null)return;
    ck.els.push({t:'G',a:ck.idx(a.node),b:ck.idx(b.node),g:1/(value(RT.S.dbox[k])+0.02),box:k})})}};
};
ENGINE.dbox.size=[700,210];
