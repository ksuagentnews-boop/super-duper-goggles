/* Shared helpers used by every engine module and experiment file. */
const $q=s=>document.querySelector(s);
const $=id=>document.getElementById(id);
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const RED='#ff5a4f',BLK='#2a2f33',CH1='#f2c230',CH2='#3fd3d8';
const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" font-size="${o.size||11}" fill="${o.fill||'#22302f'}" text-anchor="${o.a||'start'}" font-weight="${o.w||400}" pointer-events="none">${s}</text>`;
const fmtV=v=>{const a=Math.abs(v);return a>=1?v.toFixed(2)+'V':(v*1000).toFixed(1)+'mV'};
const VDS=[0.002,0.005,0.01,0.02,0.05,0.1,0.2,0.5,1,2,5,10];
const TDS=[];[1e-6,1e-5,1e-4,1e-3,1e-2,1e-1].forEach(d=>[1,2,5].forEach(m=>TDS.push(+(d*m).toPrecision(3))));TDS.push(1);
const fmtVd=v=>v>=1?v+'V':(v*1000)+'mV';
const fmtTd=t=>t>=1?t+'s':t>=1e-3?+(t*1e3).toPrecision(3)+'ms':+(t*1e6).toPrecision(3)+'µs';
const fmtTime=s=>{const a=Math.abs(s);if(!isFinite(s))return '?';if(a>=1)return s.toFixed(3)+'s';if(a>=1e-3)return (s*1e3).toFixed(3)+'ms';if(a>=1e-6)return (s*1e6).toFixed(2)+'µs';return (s*1e9).toFixed(1)+'ns'};
/* experiment definitions register here (one file per experiment in labs/<lab>/) */
const ENGINE={};
const EXP_DEFS={};
const BOOT={};
