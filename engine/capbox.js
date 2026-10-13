/* Capacitor decade box "Boîte de capacités BC05 · Capacitor box" (EE205 Exp 4): cream case, five black dials with grey
   caps — ×1 µF · ×0.1 µF · ×0.01 µF · ×0.001 µF · ×100 pF, each 0 … 10 (max 11.111 µF) — two black sockets and the
   green / yellow earth socket (case, not used) between the 4th and 5th dial, as in the lab photo. Working voltage 250 V~.
   Leads qa / qb (banana, part of the circuit). Stamps one C of the set value when both leads are on the board; at 0 it is
   open (nothing stamped). State S.cb = {d:[×100pF, ×0.001µF, ×0.01µF, ×0.1µF, ×1µF]} (d[i] counts 10^i × 100 pF).
   value() → µF. */
ENGINE.capbox=function(RT,opt){
const KEY='cb',PFX='q';const knob=ENGINE.knob;const W=640,H=170;
const MUL=['×100pF','×0.001µF','×0.01µF','×0.1µF','×1µF'];
const KX=[580,400,288,176,64];                       // dial centres, ×100 pF on the right … ×1 µF on the left
const POST={a:{x:468,y:76},b:{x:508,y:76},g:{x:488,y:124}};
function fresh(){const d={d:[0,0,0,0,0]};if(opt.prev)opt.prev(d);return d}
const uF=d=>d.reduce((s,v,i)=>s+v*1e-4*Math.pow(10,i),0);
const fmtC=c=>c<=0?'0':c<0.01?+(c*1e6).toFixed(0)+' pF':c<1?+(c*1e3).toFixed(1)+' nF':+c.toFixed(4)+' µF';
function svg(){const D=RT.S[KEY];let s=`<rect width="${W}" height="${H}" rx="8" fill="#e9e1c4" stroke="#a89d78" stroke-width="2"/><rect x="5" y="5" width="${W-10}" height="${H-10}" rx="6" fill="#f2ebd2" stroke="#d3c8a3"/>`;
  s+=T(140,26,'BOITE de CAPACITES  BC05',{size:11,fill:'#2f2b20',w:700})+T(140,40,'CAPACITOR BOX',{size:10,fill:'#2f2b20',w:700});
  s+=`<path d="M432 18 l9 15 h-18z" fill="none" stroke="#2f2b20" stroke-width="1.5"/>`+T(432,31,'!',{size:9,fill:'#2f2b20',a:'middle',w:700})+T(448,30,'250 V~',{size:8,fill:'#2f2b20'});
  s+=`<rect x="${W-112}" y="12" width="96" height="18" rx="3" fill="#2a2a22"/>`+T(W-20,25,fmtC(uF(D.d)),{size:10,fill:'#9cf2a0',a:'end',w:600});
  [['a','#1d1f20'],['b','#1d1f20'],['g','#e8c51c']].forEach(([k,c])=>{const p=POST[k];s+=`<circle cx="${p.x}" cy="${p.y}" r="12" fill="${c}" stroke="#222" stroke-width="2"/><circle cx="${p.x}" cy="${p.y}" r="${k==='g'?5.5:4.5}" fill="${k==='g'?'#2fa04a':'#555'}"/>`});
  for(let j=0;j<5;j++){const cx=KX[j],cy=100;
    for(let v=0;v<=10;v++){const a=(-150+v*30)*Math.PI/180;s+=T(cx+Math.sin(a)*46,cy-Math.cos(a)*46+3,String(v),{size:7,fill:'#2f2b20',a:'middle'})}
    s+=T(cx,cy+60,MUL[j],{size:9,fill:'#2f2b20',a:'middle',w:700});
    s+=knob(cx,cy,20,'#15161a',`${PFX}:D${j}`,'',null,{fill:'#b9bcbd',ang:(-150+D.d[j]*30)*Math.PI/180})}
  return s}
function key(k){const m=k.match(/^D([0-4])([+-])$/);if(!m)return;const d=RT.S[KEY].d;const j=+m[1];d[j]=clamp(d[j]+(m[2]==='+'?1:-1),0,10);RT.dirty=true}
return {key:KEY,prefix:PFX,size:[W,H],name:['Capacitor decade box BC05','صندوق المكثفات'],fresh,svg,keyFn:key,
  wheel:[0,1,2,3,4].map(j=>'D'+j),knobInfo:b=>`${MUL[+b[1]]}: ${RT.S[KEY].d[+b[1]]} → ${fmtC(uF(RT.S[KEY].d))}`,
  value:()=>uF(RT.S[KEY].d),
  leads:[{k:'qa',label:'C box',from:POST.a,banana:true,circuit:true,pol:'+',tray:'C box',jn:'C box'},{k:'qb',label:'C box',from:POST.b,banana:true,circuit:true,pol:'-',tray:'C box',jn:'C box'}],
  stamp(ck){const L=RT.S.leads,a=L.qa,b=L.qb;if(!a||!b||a.node==null||b.node==null)return;const c=uF(RT.S[KEY].d)*1e-6;if(c<=0)return;
    ck.els.push({t:'C',a:ck.idx(a.node),b:ck.idx(b.node),c,box:KEY})}};
};
ENGINE.capbox.size=[640,170];
