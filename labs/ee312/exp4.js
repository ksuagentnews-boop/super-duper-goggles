/* EE312 · Experiment 4 · Rectifiers and Voltage Regulation (approved prototype; to be checked against the manual Fig. 4.2/4.3 in its own session). */
EXP_DEFS['ee312/exp4']={
  sheet:`<div class="paper" id="paper">
  <h2>Experiment 4 · Rectifiers &amp; Voltage Regulation</h2>
    <div class="figbox"><svg id="fig1" viewBox="0 0 440 250"></svg></div>
    <div class="hint" style="text-align:center">Fig. 1 · D1, D2 = 1N4002 · RL = 4.7 kΩ · C = <span data-p="ca"></span> µF (added in step 5)</div>
    <div class="figbox" style="margin-top:8px"><svg id="fig6" viewBox="0 0 440 220"></svg></div>
    <div class="hint" style="text-align:center">Fig. 6 · Regulator: RS = 100 Ω, DZ = 1N4733A, RL across DZ</div>
    <div class="check manual-only" id="live"></div>
  <div class="manual-only">
    <p class="exam-note">سجّل الشاشات وعبّي القراءات والأسئلة، وبعدها اضغط "صحّح إجاباتي".</p>
    <h3>Part A · Unregulated supply</h3>
    <ol class="en">
      <li>Assemble Fig. 1 with RL = 4.7 kΩ and <b>without</b> the capacitor. Connect CH1 to v<sub>S</sub> (terminal A, ground at B) and CH2 to v<sub>o</sub>. Ask the instructor to check, then plug in the transformer.</li>
      <li>Display v<sub>S</sub>(t) and v<sub>o</sub>(t) and capture them on Fig. 2.</li>
    </ol>
    <div class="cap"><button class="t" data-cap="f2">📸 سجّل الشاشة في Fig. 2</button><div class="slot" id="f2">Fig. 2</div></div>
    <div class="row en"><label for="vsm">V<sub>SM</sub> (CH1 Max) =</label><input type="number" step="0.01" id="vsm"> V</div>
    <div class="row en"><label for="vomax">v<sub>o</sub> max (CH2 Max) =</label><input type="number" step="0.01" id="vomax"> V</div>
    <ol class="en" start="3"><li>Remove D2 from the circuit. Capture v<sub>S</sub> and v<sub>o</sub> on Fig. 3, then put D2 back.</li></ol>
    <div class="cap"><button class="t" data-cap="f3">📸 سجّل الشاشة في Fig. 3</button><div class="slot" id="f3">Fig. 3</div></div>
    <div class="row en">Name of the circuit without D2: <select id="name"><option value="">— choose —</option><option value="a">Full-wave rectifier</option><option value="b">Half-wave rectifier</option><option value="c">Bridge rectifier</option><option value="d">Voltage doubler</option></select></div>
    <ol class="en" start="4"><li>With D2 back, display the VTC (XY mode) and capture it on Fig. 4.</li></ol>
    <div class="cap"><button class="t" data-cap="f4">📸 سجّل الشاشة في Fig. 4</button><div class="slot" id="f4">Fig. 4</div></div>
    <ol class="en" start="5"><li>Unplug the transformer, connect C = <span data-p="ca"></span> µF in parallel with RL (negative lead to ground), plug in again. Capture v<sub>S</sub> and v<sub>o</sub> (DC coupling) on Fig. 5.</li></ol>
    <div class="cap"><button class="t" data-cap="f5">📸 سجّل الشاشة في Fig. 5</button><div class="slot" id="f5">Fig. 5</div></div>
    <ol class="en" start="6"><li>Set CH2 to AC coupling and measure the peak-to-peak ripple V<sub>r(pp)</sub> for RL = 4.7 kΩ and RL = 270 Ω.</li></ol>
    <div class="row en"><label for="r1">V<sub>r(pp)</sub> @ 4.7 kΩ =</label><input type="number" step="0.1" id="r1"> mV</div>
    <div class="row en"><label for="r2">V<sub>r(pp)</sub> @ 270 Ω =</label><input type="number" step="0.1" id="r2"> mV</div>

    <h3>Part B · Adding the regulator (Fig. 6)</h3>
    <ol class="en" start="7"><li>Use C = 470 µF. Add RS = 100 Ω and the Zener DZ, with RL across DZ. Move CH2 across RL. Measure V<sub>r(pp)</sub> (AC coupling) for RL = 4.7 kΩ and 270 Ω.</li></ol>
    <div class="row en"><label for="r3">V<sub>r(pp)</sub> @ 4.7 kΩ =</label><input type="number" step="0.1" id="r3"> mV</div>
    <div class="row en"><label for="r4">V<sub>r(pp)</sub> @ 270 Ω =</label><input type="number" step="0.1" id="r4"> mV</div>

    <h3>Questions</h3>
    <ol class="en">
      <li>If C is increased, the ripple: <select id="qc"><option value="">—</option><option value="a">increases</option><option value="b">decreases</option><option value="c">does not change</option></select>
        &nbsp; If RL is reduced, the ripple: <select id="qr"><option value="">—</option><option value="a">increases</option><option value="b">decreases</option><option value="c">does not change</option></select></li>
      <li>Theoretical ripple for C = <span data-p="cth"></span> µF, RL = <span data-p="rlth"></span> Ω using V<sub>r</sub> = V<sub>p</sub>/(2fCR<sub>L</sub>) with V<sub>p</sub> = your v<sub>o</sub> max:
        <div class="row"><input type="number" step="0.01" id="vrth"> V</div></li>
      <li>Peak inverse voltage on each diode (PIV ≈ 2V<sub>SM</sub> − V<sub>D</sub>):
        <div class="row"><input type="number" step="0.1" id="piv"> V</div></li>
      <li>Comment on the regulator:
        <div class="row"><select id="qreg"><option value="">— choose —</option><option value="a">It increases the ripple but fixes the DC level</option><option value="b">It reduces the ripple and makes it much less sensitive to RL</option><option value="c">It has no effect on the ripple</option></select></div></li>
    </ol>
    <div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div>
    <div id="result"></div>
  </div>
</div>
`,
  params:()=>({ca:470,cfgA:'c470',cfgB:'c470b',cth:470,rlth:270}),
  instruments:[
    {type:'xf'},
    {type:'scope',probes:2,prev:sc=>{sc.ch[0].cpl='AC';sc.ch[0].vd=0.5;sc.ch[1].on=true;sc.ch[1].vd=0.2;sc.ch[1].pos=-2;sc.ch[1].inv=true;sc.td=2e-4;sc.meas=[{src:0,src2:1,type:'Max'}];sc.disp.vec=false;sc.trig.src=1;sc.trig.level=3}}],
  parts:{R47:{t:'R',r:4700,lab:'4.7kΩ'},R270:{t:'R',r:270,lab:'270Ω'},R100:{t:'R',r:100,lab:'100Ω'},D:{t:'D',lab:'1N4002'},Z:{t:'Z',lab:'1N4733A'},C10:{t:'C',c:10e-6,lab:'10µF'},C470:{t:'C',c:470e-6,lab:'470µF'},BR:{t:'BR',lab:''}},
  tray:[['D','1N4002'],['C470','470 µF'],['C10','10 µF'],['R47','4.7 kΩ'],['R270','270 Ω'],['R100','100 Ω'],['Z','1N4733A'],['BR','Bridge'],['W','Wire']],
  setup(RT){
const PX=RT.PX;
/* reference configurations; nets: 0 A, 1 C, 2 K (cathodes), 3 R (regulated); -1 = B (ground) */
function refCk(cfg){const els=[{t:'XS',a:0,b:-1,s:1,vp:9,f:60,r:1.5},{t:'XS',a:1,b:-1,s:-1,vp:9,f:60,r:1.5}];
  if(cfg.d1)els.push({t:'D',a:0,b:2,f:SOLVER.diodeSi});if(cfg.d2)els.push({t:'D',a:1,b:2,f:SOLVER.diodeSi});
  if(cfg.c)els.push({t:'C',a:2,b:-1,c:cfg.c});
  if(cfg.reg){els.push({t:'G',a:2,b:3,g:1/100},{t:'D',a:-1,b:3,f:SOLVER.zener},{t:'G',a:3,b:-1,g:1/cfg.rl})}else els.push({t:'G',a:2,b:-1,g:1/cfg.rl});
  els.push({t:'G',a:0,b:-1,g:1e-6});return {n:4,els,p1:0,p2:cfg.reg?3:2}}
const CFG={fw:{d1:1,d2:1,rl:4700},hw1:{d1:1,rl:4700},hw2:{d2:1,rl:4700},c10:{d1:1,d2:1,c:10e-6,rl:4700},c10b:{d1:1,d2:1,c:10e-6,rl:270},c470:{d1:1,d2:1,c:470e-6,rl:4700},c470b:{d1:1,d2:1,c:470e-6,rl:270},reg47:{d1:1,d2:1,c:470e-6,rl:4700,reg:1},reg270:{d1:1,d2:1,c:470e-6,rl:270,reg:1}};
let REFS=null;function refs(){if(!REFS){REFS={};for(const k in CFG)REFS[k]=SOLVER.simulate(refCk(CFG[k]),60,k.startsWith('c')||k.startsWith('reg')?8:3)}return REFS}
/* ---------- checks & grading ---------- */
function match(sim,ref,tol){if(!sim.has2)return false;let mx=0;for(let k=0;k<SOLVER.NS;k++)mx=Math.max(mx,Math.abs(sim.v2[k]-ref.v2[k]));return mx<tol}
function whichCfg(){if(!RT.TB||!RT.S.xf.plugged)return null;const R=refs();
  for(const k of ['fw','hw1','hw2','c10','c10b','c470','c470b','reg47','reg270']){const tol=k.startsWith('c')||k.startsWith('reg')?0.06:0.2;if(match(RT.TB,R[k],tol))return k}return null}
function ch1OK(){if(!RT.TB||!RT.TB.has1||!RT.S.xf.plugged)return false;let mx=0;const R=refs().fw;for(let k=0;k<SOLVER.NS;k++)mx=Math.max(mx,Math.abs(RT.TB.v1[k]-R.v1[k]));return mx<0.3}
function status(){const sc=RT.S.sc;const sg=[RT.dsig(0),RT.dsig(1)];
  const fitC=c=>{const ch=sc.ch[c];const top=sg[c].max/ch.vd+ch.pos,bot=sg[c].min/ch.vd+ch.pos;return top<=4.05&&bot>=-4.05&&(top-bot)>=1.2};
  let fit;if(sc.xy){const c1=sc.ch[0];const l=sg[0].min/c1.vd+c1.pos,r=sg[0].max/c1.vd+c1.pos;fit=sc.pwr&&l>=-5.05&&r<=5.05&&(r-l)>=1.2&&fitC(1)}else{const cyc=10*sc.td*60;fit=sc.pwr&&fitC(0)&&fitC(1)&&cyc>=1&&cyc<=10}
  return {cfg:whichCfg(),ch1:ch1OK(),gnd:RT.S.leads.c1b.node!=null&&RT.S.leads.c2b.node!=null,plug:RT.S.xf.plugged,pwr:sc.pwr,ch:sc.ch[0].on&&sc.ch[1].on,probe:sc.ch.every(c=>c.probe===1&&!c.inv),cpl1:sc.ch[0].cpl,cpl2:sc.ch[1].cpl,xy:sc.xy,fit}}
const CFGNAME={fw:'Full-wave بدون مكثف',hw1:'Half-wave (D1 بس)',hw2:'Half-wave (D2 بس)',c10:'Full-wave + 10 µF',c10b:'Full-wave + 10 µF, RL 270',c470:'Full-wave + 470 µF, RL 4.7k',c470b:'Full-wave + 470 µF, RL 270',reg47:'Regulator, RL 4.7k',reg270:'Regulator, RL 270'};
const CAPS={};
document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;if(RT.dirty)RT.recompute();CAPS[id]=status();const mm=RT.S.sc.msg;RT.S.sc.msg='';const inner=RT.S.sc.run?RT.screenInner():RT.S.sc.frozen;RT.S.sc.msg=mm;
  $(id).innerHTML=`<svg viewBox="12 26 336 286" direction="ltr" font-family="Plex Mono, IBM Plex Mono, monospace"><defs><clipPath id="gridclip"><rect x="22" y="48" width="300" height="200"/></clipPath></defs>${inner}</svg>`}));
function ripple(r){let mx=-1e9,mn=1e9;for(let k=0;k<SOLVER.NS;k++){mx=Math.max(mx,r.v2[k]);mn=Math.min(mn,r.v2[k])}return (mx-mn)*1000}
$('submit').addEventListener('click',()=>{const R=refs();const res=[];let sc=0,tot=0;const add=(ok,t,why)=>{tot++;if(ok)sc++;res.push([ok,t,why])};
  const capOK=(id,cfgs,xy,c2cpl)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];if(!c.plug)pr.push('المحوّل مو موصول');if(!cfgs.includes(c.cfg))pr.push('الدائرة مو المطلوبة لهالخطوة'+(c.cfg?` (كانت: ${CFGNAME[c.cfg]})`:''));if(!c.ch1)pr.push('CH1 مو على vS');if(!c.gnd)pr.push('الأرضي ناقص');if(!c.ch)pr.push('لازم القناتين شغالة');if(!c.probe)pr.push('Probe لازم 1X و Invert OFF');if(c.cpl1!=='DC'||c.cpl2!==c2cpl)pr.push('Coupling لازم DC');if(c.xy!==xy)pr.push(xy?'لازم XY mode':'لازم YT');if(!c.fit)pr.push('الموجة مو واضحة/طالعة برا الشاشة');return [pr.length===0,pr.join('، ')]};
  [['f2',['fw'],false,'Fig. 2 full-wave'],['f3',['hw1','hw2'],false,'Fig. 3 half-wave'],['f4',['fw'],true,'Fig. 4 VTC'],['f5',[PX.cfgA],false,'Fig. 5 with '+PX.ca+' µF']].forEach(([id,cf,xy,t])=>{const [ok,w]=capOK(id,cf,xy,'DC');add(ok,t,w)});
  const num=id=>parseFloat($(id).value);
  const vsm=Math.max(...R.fw.v1),vom=Math.max(...R.fw.v2);
  add(Math.abs(num('vsm')-vsm)<=0.3,'VSM',`≈ ${vsm.toFixed(2)} V`);
  add(Math.abs(num('vomax')-vom)<=0.3,'vo max',`≈ ${vom.toFixed(2)} V (= VSM − VD)`);
  add($('name').value==='b','Name without D2','Half-wave rectifier');
  const rr=[ripple(R[PX.cfgA]),ripple(R[PX.cfgB]),ripple(R.reg47),ripple(R.reg270)];
  [['r1',0],['r2',1],['r3',2],['r4',3]].forEach(([id,i])=>{const v=num(id),e=rr[i];add(Math.abs(v-e)<=Math.max(0.3*e,3),'Vr(pp) '+['4.7k','270Ω','reg 4.7k','reg 270Ω'][i],`≈ ${e.toFixed(1)} mV`)});
  add($('qc').value==='b','Increase C','الـ ripple يقل');add($('qr').value==='a','Reduce RL','الـ ripple يزيد');
  const th=vom/(2*60*PX.cth*1e-6*PX.rlth);add(Math.abs(num('vrth')-th)<=0.08,'Theoretical Vr',`≈ ${th.toFixed(2)} V`);
  const piv=2*vsm-0.6;add(Math.abs(num('piv')-piv)<=1,'PIV',`≈ ${piv.toFixed(1)} V`);
  add($('qreg').value==='b','Regulator comment','يقلل الـ ripple ويقلل تأثره بـ RL');
  $('result').innerHTML=`<div class="result"><b>النتيجة: ${sc} / ${tot}</b>`+res.map(([ok,t,w])=>`<div class="${ok?'good':'bad'}">${ok?'✓':'✗'} <span class="m">${t}</span>${ok?'':' — '+w}</div>`).join('')+`</div>`;$('result').scrollIntoView({behavior:'smooth',block:'nearest'})});

/* ---------- figures ---------- */
(function(){const ink='#1d2a2e';const L=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="2"/>`;
  const di=(x,y,dir,z)=>{const r={right:0,down:90,left:180,up:270}[dir];return `<g transform="translate(${x} ${y}) rotate(${r})"><polygon points="-8,-9 -8,9 8,0" fill="${ink}"/>${z?`<polyline points="12,-13 8,-10 8,10 4,13" fill="none" stroke="${ink}" stroke-width="2.2"/>`:`<line x1="8" y1="-10" x2="8" y2="10" stroke="${ink}" stroke-width="2.2"/>`}</g>`};
  const t=(x,y,s,a='start')=>`<text x="${x}" y="${y}" font-size="13" fill="${ink}" text-anchor="${a}" font-family="Plex Mono, monospace">${s}</text>`;
  const rv=(x,y1,y2)=>{let p=`${x},${y1}`;const n=6,d=(y2-y1)/n;for(let i=0;i<n;i++)p+=` ${x+(i%2?7:-7)},${y1+d*(i+.5)}`;return `<polyline points="${p} ${x},${y2}" fill="none" stroke="${ink}" stroke-width="2"/>`};
  const xfm=()=>{let s='';for(let i=0;i<5;i++)s+=`<path d="M40 ${55+i*28} a12 14 0 0 1 0 28" fill="none" stroke="${ink}" stroke-width="2"/>`;for(let i=0;i<7;i++)s+=`<path d="M92 ${25+i*28} a12 14 0 0 0 0 28" fill="none" stroke="${ink}" stroke-width="2"/>`;return s+L(60,30,60,220)+L(66,30,66,220)+t(16,130,'vP')+t(104,22,'A')+t(104,232,'C')+t(104,128,'B')};
  let s=xfm()+L(92,25,160,25)+di(170,25,'right')+t(162,14,'D1')+L(180,25,380,25)+L(92,221,160,221)+di(170,221,'right')+t(162,244,'D2')+L(180,221,230,221)+L(230,221,230,25);
  s+=L(92,123,120,123)+L(120,123,120,240)+L(120,240,380,240);
  s+=`<g opacity=".55">${L(300,25,300,118)}${L(288,118,312,118)}<path d="M288 128 q12 -7 24 0" fill="none" stroke="${ink}" stroke-width="2"/>${L(300,126,300,240)}${t(316,118,'C')}${t(288,112,'+','end')}</g>`;
  s+=L(360,25,360,95)+rv(360,95,170)+L(360,170,360,240)+t(372,138,'RL')+t(110,80,'vS')+t(110,180,'vS');
  s+=`<circle cx="380" cy="25" r="4" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="380" cy="240" r="4" fill="#fff" stroke="${ink}" stroke-width="2"/>`+t(392,138,'vo');
  $('fig1').innerHTML=s;
  let r=t(10,30,'from rectifier (+C)')+L(10,40,60,40)+`<polyline points="60,40 66,33 76,47 86,33 96,47 106,33 112,40" fill="none" stroke="${ink}" stroke-width="2"/>`+t(70,24,'RS = 100 Ω')+L(112,40,330,40)+L(10,190,330,190);
  r+=L(220,40,220,100)+di(220,110,'up',1)+L(220,120,220,190)+t(234,114,'DZ')+L(300,40,300,80)+rv(300,80,150)+L(300,150,300,190)+t(312,118,'RL')+`<circle cx="330" cy="40" r="4" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="330" cy="190" r="4" fill="#fff" stroke="${ink}" stroke-width="2"/>`+t(340,118,'vo')+t(10,210,'ground (B)');
  $('fig6').innerHTML=r})();
const has=(st,...k)=>k.includes(st.cfg);
return {status:()=>Object.assign(status(),{xfok:RT.S.xf.ok}),
  steps:[
    {dev:'scope',t:'شغّل الإسكوب (POWER).',ok:s=>s.pwr},
    {dev:'board',t:'ركّب Fig. 1 بدون مكثف: اسحب أطراف المحوّل A و B و C للوحة، وحط D1 و D2 (1N4002) و RL = 4.7 kΩ. وصّل CH1 على A و CH2 على vo، و CH1 ⏚ و CH2 ⏚ على B. بعدها اضغط Ask instructor to check في المحوّل.',ok:s=>s.xfok||s.plug},
    {dev:'xf',t:'اضغط Plug in عشان توصّل المحوّل بالكهرباء.',ok:s=>s.plug&&has(s,'fw')&&s.ch1&&s.gnd},
    {dev:'scope',t:'شغّل CH1 و CH2، وخلّ Probe 1X و Coupling = DC، واضغط Autoset (Fig. 2). قِس VSM و vo max بالـ Measure.',ok:s=>has(s,'fw')&&s.ch&&s.probe&&s.cpl1==='DC'&&s.cpl2==='DC'&&s.fit&&!s.xy},
    {dev:'board',t:'شيل D2 وشوف الـ half-wave (Fig. 3)، وبعدها رجّعه مكانه.',ok:s=>has(s,'hw1','hw2')},
    {dev:'scope',t:'مع D2 في مكانه، اعرض الـ VTC: Acquire ← XY ← Triggered XY (Fig. 4).',ok:s=>has(s,'fw')&&s.xy&&s.fit},
    {dev:'board',t:'افصل المحوّل، وأضف C = 470 µF بالتوازي مع RL (السالب على الأرضي)، واطلب الفحص ووصّل من جديد (Fig. 5، رجّع YT).',ok:s=>has(s,'c470')&&!s.xy},
    {dev:'scope',t:'خلّ CH2 على AC coupling (CH2 ← Coupling) وقِس الـ ripple بـ Pk-Pk عند RL = 4.7 kΩ.',ok:s=>has(s,'c470')&&s.cpl2==='AC'},
    {dev:'board',t:'بدّل RL إلى 270 Ω ولاحظ كيف يكبر الـ ripple.',ok:s=>has(s,'c470b')},
    {dev:'board',t:'أضف RS = 100 Ω والزينر DZ، و RL على الزينر، وانقل CH2 على RL (Fig. 6). قارن الـ ripple.',ok:s=>has(s,'reg47','reg270')}
  ],
  onReset(){['f2','f3','f4','f5'].forEach(id=>{$(id).textContent=id.replace('f','Fig. ');delete CAPS[id]});$('result').innerHTML=''}};
  }
};
