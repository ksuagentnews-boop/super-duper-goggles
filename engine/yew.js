/* YEW (Yokogawa) Type 2786 decade resistance box (EE205): six dials ×100 kΩ · ×10 kΩ · ×1 kΩ · ×100 Ω · ×10 Ω · ×1 Ω,
   each 0 … 10, the tolerance of each decade printed under its dial (×1 ±0.5 %, ×10 ±0.2 %, ×100 / ×1k ±0.05 %,
   ×10k / ×100k ±0.1 %), binding posts H / L (and G, the case, not used). Max 250 V; residual ≈ 0.03 Ω.
   Every box is one instrument (opt.n → key 'yew1' …, prefix 'y1' …, leads y1H / y1L). The real resistance of each decade is
   inside its tolerance but not exactly nominal (a fixed small deviation per box and dial), so an ohmmeter reading shows
   a small % error like the lab boxes. State S[key] = {d:[×1, ×10, ×100, ×1k, ×10k, ×100k]}. */
ENGINE.yew=function(RT,opt){
const N=opt.n||1,KEY='yew'+N,PFX='y'+N;const knob=ENGINE.knob;
const W=640,H=170;const MUL=['×1Ω','×10Ω','×100Ω','×1kΩ','×10kΩ','×100kΩ'],TOL=[0.5,0.2,0.05,0.05,0.1,0.1];
/* fixed deviation of each decade of this box, as a fraction of its tolerance (−0.6 … +0.6) */
const DEV=TOL.map((t,i)=>{const x=Math.sin((N*7.3+i*3.1)*12.9898)*43758.5453;return t/100*((x-Math.floor(x))*1.2-0.6)});
const nominal=d=>d.reduce((s,v,i)=>s+v*Math.pow(10,i),0);
const actual=d=>0.03+d.reduce((s,v,i)=>s+v*Math.pow(10,i)*(1+DEV[i]),0);
const POST={H:{x:44,y:58},L:{x:44,y:98},G:{x:44,y:138}};
function fresh(){const d={d:[0,0,0,0,0,0]};if(opt.prev)opt.prev(d);return d}
const fmtR=r=>r>=1e3?(r/1e3).toFixed(3).replace(/\.?0+$/,'')+' kΩ':r+' Ω';
function svg(){const D=RT.S[KEY];let s=`<rect width="${W}" height="${H}" rx="8" fill="#bfc0ad" stroke="#7d7f6d" stroke-width="2"/><rect x="6" y="6" width="${W-12}" height="${H-12}" rx="5" fill="#cfcfbe" stroke="#a5a693"/>`;
  s+=T(18,24,'YEW  TYPE 2786 DECADE RESISTANCE BOX',{size:10.5,fill:'#2f3128',w:700})+(opt.n?`<rect x="${W-120}" y="12" width="44" height="17" rx="4" fill="#2f3128"/>`+T(W-98,25,'R'+N,{size:11,fill:'#f0f0e6',a:'middle',w:700}):'');
  s+=`<rect x="${W-70}" y="12" width="58" height="17" rx="3" fill="#20261c"/>`+T(W-16,25,fmtR(nominal(D.d)),{size:9,fill:'#9cf2a0',a:'end',w:600});
  [['H','#f2f0ea'],['L','#1d1f20'],['G','#f2f0ea']].forEach(([k,c])=>{const p=POST[k];s+=`<circle cx="${p.x}" cy="${p.y}" r="11" fill="${c}" stroke="#222" stroke-width="2"/><circle cx="${p.x}" cy="${p.y}" r="4" fill="#666"/>`+T(p.x+18,p.y+4,k,{size:9,fill:'#2f3128',w:700})});
  s+=T(26,H-14,'MAX 250V',{size:7,fill:'#2f3128'});
  for(let j=5;j>=0;j--){const cx=120+(5-j)*88,cy=92;
    for(let v=0;v<=10;v++){const a=(-150+v*30)*Math.PI/180;s+=T(cx+Math.sin(a)*36,cy-Math.cos(a)*36+3,String(v),{size:7,fill:'#2f3128',a:'middle'})}
    s+=T(cx,40,MUL[j],{size:9,fill:'#2f3128',a:'middle',w:700});
    s+=knob(cx,cy,20,'#1a1b1c',`${PFX}:D${j}`,'',null,{fill:'#262728',ang:(-150+D.d[j]*30)*Math.PI/180});
    s+=T(cx,cy+48,'±'+TOL[j]+'%',{size:8,fill:'#2f3128',a:'middle'})}
  return s}
function key(k){const m=k.match(/^D([0-5])([+-])$/);if(!m)return;const d=RT.S[KEY].d;const j=+m[1];d[j]=clamp(d[j]+(m[2]==='+'?1:-1),0,10);RT.dirty=true}
return {key:KEY,prefix:PFX,size:[W,H],name:['YEW 2786 · R'+N,'صندوق المقاومات '+N],fresh,svg,keyFn:key,
  wheel:[0,1,2,3,4,5].map(j=>'D'+j),knobInfo:b=>`${MUL[+b[1]]}: ${RT.S[KEY].d[+b[1]]} → ${fmtR(nominal(RT.S[KEY].d))}`,
  value:()=>nominal(RT.S[KEY].d),actual:()=>actual(RT.S[KEY].d),TOL,
  leads:[{k:PFX+'H',label:'R'+N+' H',from:POST.H,banana:true,circuit:true,pol:'+',tray:'R'+N+' H',jn:`box R${N} H`},{k:PFX+'L',label:'R'+N+' L',from:POST.L,banana:true,circuit:true,pol:'-',tray:'R'+N+' L',jn:`box R${N} L`}],
  stamp(ck){const L=RT.S.leads,a=L[PFX+'H'],b=L[PFX+'L'];if(!a||!b||a.node==null||b.node==null)return;ck.els.push({t:'G',a:ck.idx(a.node),b:ck.idx(b.node),g:1/actual(RT.S[KEY].d),box:KEY})}};
};
ENGINE.yew.size=[640,170];
