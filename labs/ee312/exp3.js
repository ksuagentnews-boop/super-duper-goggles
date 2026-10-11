/* EE312 · Experiment 3 · Limiting Circuits (prototype circuit from an old exam; to be rebuilt from the manual Fig. 3.4a/b). */
EXP_DEFS['ee312/exp3']={
  sheet:`<div class="paper" id="paper">
  <h2 class="practice-only">Experiment 3 · Limiting Circuits</h2>
  <h2 class="exam-only">Exam · Experiment 3 <span class="ver">نموذج <span data-p="ver"></span></span></h2>
  <div class="figbox"><svg id="fig1" viewBox="0 0 430 270"></svg></div>
  <div class="hint" style="text-align:center">Fig. 1 · R = 1 kΩ, D1 &amp; D2 = 1N4001 (Si), DZ = 1N4733A (Zener), V1 = <span data-p="v1"></span> V (DC power supply)</div>
  <div class="check practice-only" id="live"></div>
  <div class="exam-only">
    <p class="exam-note">نفس المانيوال، لكن القيم تتغير كل مرة تدخل فيها. سجّل الشاشات وعبّي الإجابات، وبعدها اضغط "صحّح إجاباتي".</p>
    <h3>Q1</h3>
    <ol class="en">
      <li>Connect the circuit in Fig. 1. Take V1 = <span data-p="v1"></span> V from the DC power supply (current limit 0.05 A). Connect CH1 of the oscilloscope to v<sub>i</sub> and CH2 to v<sub>o</sub>.</li>
      <li>Set the input to <span data-p="a1"></span> V (peak-to-peak), f = <span data-p="f"></span> Hz.</li>
      <li>Display the waveforms of v<sub>i</sub> and v<sub>o</sub> and capture them on Fig. 2.</li>
    </ol>
    <div class="cap"><button class="t" data-cap="f2">📸 سجّل الشاشة في Fig. 2</button><div class="slot" id="f2">Fig. 2</div></div>
    <ol class="en" start="4"><li>Display the VTC and capture it on Fig. 3.</li></ol>
    <div class="cap"><button class="t" data-cap="f3">📸 سجّل الشاشة في Fig. 3</button><div class="slot" id="f3">Fig. 3</div></div>
    <ol class="en" start="5"><li>Determine the upper limiting level V<sub>o+</sub> and write its value.</li></ol>
    <div class="row en"><label for="vop">V<sub>o+</sub> =</label><input type="number" step="0.01" id="vop"> V</div>
    <ol class="en" start="6"><li>Increase the input to <span data-p="a2"></span> V peak-to-peak.</li><li>Display v<sub>i</sub> and v<sub>o</sub> and capture them on Fig. 4.</li></ol>
    <div class="cap"><button class="t" data-cap="f4">📸 سجّل الشاشة في Fig. 4</button><div class="slot" id="f4">Fig. 4</div></div>
    <ol class="en" start="8"><li>Display the VTC and capture it on Fig. 5.</li></ol>
    <div class="cap"><button class="t" data-cap="f5">📸 سجّل الشاشة في Fig. 5</button><div class="slot" id="f5">Fig. 5</div></div>
    <ol class="en" start="9"><li>Determine the lower limiting level V<sub>o−</sub>.</li></ol>
    <div class="row en"><label for="vom">V<sub>o−</sub> =</label><input type="number" step="0.01" id="vom"> V</div>
    <ol class="en" start="10"><li>Write the breakdown voltage of the Zener diode in terms of V<sub>o−</sub>, and compute it.</li></ol>
    <div class="row en"><select id="vzf"><option value="">— choose —</option><option value="a">VZ = |Vo−| + VD2</option><option value="b">VZ = |Vo−| − VD2</option><option value="c">VZ = |Vo−| − V1 − VD1</option><option value="d">VZ = |Vo−|</option></select>
      <label for="vz">VZ =</label><input type="number" step="0.01" id="vz"> V</div>
    <h3>Q2</h3>
    <ol class="en">
      <li>Your observation on Fig. 2:
        <div class="row"><select id="obs"><option value="">— choose —</option><option value="a">Both halves are clipped</option><option value="b">Only the positive half is clipped at ≈ V1 + VD1; the negative half passes unchanged</option><option value="c">Only the negative half is clipped</option><option value="d">No clipping: vo = vi</option></select></div></li>
      <li>State of each diode (<span data-p="a2"></span> Vpp case):
        <div class="row"><b style="min-width:110px">Positive phase</b> D1 <select id="p1"></select> D2 <select id="p2"></select> DZ <select id="pz"></select></div>
        <div class="row"><b style="min-width:110px">Negative phase</b> D1 <select id="n1"></select> D2 <select id="n2"></select> DZ <select id="nz"></select></div></li>
      <li>Why is the negative half not clipped in Fig. 2?
        <div class="row"><select id="why"><option value="">— choose —</option><option value="a">Because D2 is reverse biased all the time</option><option value="b">Because the negative peak (−<span data-p="a1h"></span> V) is smaller in magnitude than VZ + VD2, so DZ does not break down</option><option value="c">Because V1 blocks the negative half</option><option value="d">Because the scope is AC coupled</option></select></div></li>
    </ol>
    <div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div>
    <div id="result"></div>
  </div>
</div>
`,
  params:MODE=>{const VER=Math.random().toString(36).slice(2,6).toUpperCase();
    return MODE==='exam'?(()=>{const v1=pick([1.5,2,2.5,3]);const f=pick([100,200,500,1000]);const a1=pick([5,6,7,8,9].filter(a=>a/2>=v1+1&&a/2<=4.6));const a2=pick([14,16,18,20]);return {v1,f,a1,a2,a1h:a1/2,vop:(v1+0.6).toFixed(1),ver:VER}})():{v1:2,f:200,a1:6,a2:16,a1h:3,vop:'2.6',ver:'—'}},
  analysis:'sweep',
  instruments:[
    {type:'gen',at:{x:20,y:20,s:1.3},park:{gr:{x:395,y:388},gb:{x:450,y:388}}},
    {type:'dc',at:{x:530,y:20},park:{dr:{x:690,y:388},db:{x:760,y:388}}},
    {type:'scope',at:{x:820,y:20},park:{c1r:{x:888,y:468},c1b:{x:888,y:538},c2r:{x:888,y:648},c2b:{x:888,y:718}},
      prev:sc=>{sc.ch[0].probe=10;sc.ch[0].vd=50;sc.ch[1].on=false;sc.ch[1].vd=0.5;sc.ch[1].pos=1;sc.ch[1].cpl='AC';sc.td=5e-5;sc.xy=true;sc.meas=[{src:0,src2:1,type:'Pk-Pk'}];sc.trig.level=1.2;sc.disp.grat='Frame'}}],
  cableOrder:['gen','sc','dc'],
  boardCaption:'Plug-in panel (كل مربع = node فيه 9 فتحات موصولة)',
  parts:{R:{t:'R',g:1e-3,lab:'1kΩ'},D:{t:'D',lab:'1N4001'},Z:{t:'Z',lab:'Zener'},BR:{t:'BR',lab:''}},
  tray:[['R','1 kΩ resistor'],['D','Si diode 1N4001'],['Z','Zener 1N4733A'],['BR','Bridging plug'],['W','Wire (tap 2 nodes)']],
  regions:{gen:[16,16,502,294],dc:[526,16,288,218],scope:[816,16,578,393],board:[215,372,712,508]},
  names:{gen:['PeakTech 4124','مولّد الإشارات'],dc:['DC Power Supply','مصدر الجهد المستمر'],scope:['GW Instek GDS-1104B','راسم الإشارة'],board:['Plug-in panel','لوحة التوصيل']},
  setup(RT){
const PX=RT.PX;
/* reference circuit of Fig. 1 */
function buildRef(){ // nets: 0 vi, 1 vo, 2 X, 3 Y ; -1 ground
  return {n:4,els:[{t:'VS',a:0,r:50},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:1,b:2,f:SOLVER.diodeSi},{t:'DC',a:2,b:-1,v:PX.v1,ilim:1,r:0.02},{t:'D',a:3,b:1,f:SOLVER.diodeSi},{t:'D',a:3,b:-1,f:SOLVER.zener},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcIdx:3};
}
const VSCHK=[-8,-6,-4,-2.5,-1,0,1,2.5,4,6,8];
function respond(ck){let x=null;return VSCHK.map(v=>{const r=SOLVER.point(ck,v,x);x=r.x;return r})}
let REF=null;function ref(){if(!REF){const ck=buildRef();REF=respond(ck);const t6=SOLVER.sweep(ck,-PX.a1/2,PX.a1/2,61),t16=SOLVER.sweep(ck,-PX.a2/2,PX.a2/2,81);REF.vop=Math.max(...t6.v2);REF.vom=Math.min(...t16.v2);REF.vd2=REF.vom; }return REF}
function status(){const L=RT.S.leads,g=RT.S.gen,d=RT.S.dc,sc=RT.S.sc;const R=ref();
  const st={pwr:g.pwr&&d.pwr&&sc.pwr,dc:d.pwr&&d.out&&Math.abs(d.v-PX.v1)<0.005&&d.ilim<=0.05+1e-9,dcv:Math.abs(d.v-PX.v1)<0.005,gnd:['gb','c1b','c2b'].every(k=>L[k].node!=null),
    f:Math.abs(g.freq-PX.f)<0.5&&g.wave==='Sine'&&Math.abs(g.off)<0.005,probe:sc.ch.every(c=>c.probe===1&&!c.inv),a6:Math.abs(g.amp-PX.a1)<0.05,a16:Math.abs(g.amp-PX.a2)<0.05,out:g.pwr&&g.out,ch:sc.ch[0].on&&sc.ch[1].on,cpl:sc.ch[0].cpl==='DC'&&sc.ch[1].cpl==='DC'};
  st.circ=false;st.ch1=false;
  if(L.gr.node!=null&&L.c2r.node!=null&&RT.S.dc.pwr&&RT.S.dc.out){const U=respond(RT.buildUser(true));st.circ=U.every((u,i)=>u.v2!=null&&Math.abs(u.v2-R[i].v2)<0.12);st.ch1=L.c1r.node!=null&&U.every((u,i)=>u.v1!=null&&Math.abs(u.v1-R[i].v1)<0.12)}
  // fit on screen
  const sg=[RT.dsig(0),RT.dsig(1)];const fitC=c=>{const ch=sc.ch[c];const top=sg[c].max/ch.vd+ch.pos,bot=sg[c].min/ch.vd+ch.pos;return top<=4.05&&bot>=-4.05&&(top-bot)>=1.5};
  if(sc.xy){const c1=sc.ch[0];const l=sg[0].min/c1.vd+c1.pos,r=sg[0].max/c1.vd+c1.pos;st.fit=sc.pwr&&l>=-5.05&&r<=5.05&&(r-l)>=1.5&&fitC(1)}else{const cyc=10*sc.td*g.freq;st.fit=sc.pwr&&fitC(0)&&fitC(1)&&cyc>=1&&cyc<=10}
  st.xy=sc.xy;return st}
function updateLive(){BENCH.onRender()}
const CAPS={};
document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;if(RT.dirty)RT.recompute();const st=status();CAPS[id]={st,amp:RT.S.gen.amp,freq:RT.S.gen.freq};const mm=RT.S.sc.msg;RT.S.sc.msg='';const inner=RT.S.sc.run?RT.screenInner():RT.S.sc.frozen;RT.S.sc.msg=mm;$(id).innerHTML=`<svg viewBox="12 26 336 286" direction="ltr" font-family="Plex Mono, IBM Plex Mono, monospace"><defs><clipPath id="gridclip"><rect x="22" y="48" width="300" height="200"/></clipPath></defs>${inner}</svg>`}));
const STATES=['— ','ON (forward)','OFF','Breakdown'];['p1','p2','pz','n1','n2','nz'].forEach(id=>{$(id).innerHTML=STATES.map((s,i)=>`<option value="${i}">${s}</option>`).join('')});
$('submit').addEventListener('click',()=>{const R=ref();const res=[];let sc=0,tot=0;const add=(ok,t,why)=>{tot++;if(ok)sc++;res.push([ok,t,why])};
  const capOK=(id,xy,amp)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const s=c.st;const pr=[];if(!s.circ)pr.push('الدائرة أو CH2 غلط');if(!s.ch1)pr.push('CH1 مو على vi');if(!s.gnd)pr.push('الأرضي ناقص');if(!(Math.abs(c.amp-amp)<0.05))pr.push(`السعة لازم ${amp} Vpp`);if(!s.f)pr.push(`الجنريتر لازم Sine و ${PX.f} Hz و Offset 0`);if(!s.probe)pr.push('Probe لازم 1X و Invert OFF');if(!s.out)pr.push('مخرج الجنريتر مطفي');if(!s.ch)pr.push('لازم القناتين شغالة');if(!s.cpl)pr.push('Coupling لازم DC');if(s.xy!==xy)pr.push(xy?'لازم XY mode':'لازم YT (مو XY)');if(!s.fit)pr.push('الموجة مو واضحة/طالعة برا الشاشة (عدّل SCALE أو time/div)');return [pr.length===0,pr.join('، ')]};
  [['f2',false,PX.a1,`Fig. 2 (${PX.a1} Vpp, YT)`],['f3',true,PX.a1,`Fig. 3 (VTC, ${PX.a1} Vpp)`],['f4',false,PX.a2,`Fig. 4 (${PX.a2} Vpp, YT)`],['f5',true,PX.a2,`Fig. 5 (VTC, ${PX.a2} Vpp)`]].forEach(([id,xy,a,t])=>{const [ok,w]=capOK(id,xy,a);add(ok,t,w)});
  const vop=parseFloat($('vop').value),vom=parseFloat($('vom').value),vz=parseFloat($('vz').value);
  add(Math.abs(vop-R.vop)<=0.12,'Vo+',`المتوقع ≈ ${R.vop.toFixed(2)} V (= V1 + VD1)`);
  add(Math.abs(vom-R.vom)<=0.15,'Vo−',`المتوقع ≈ ${R.vom.toFixed(2)} V (= −(VZ + VD2))`);
  add($('vzf').value==='b','VZ formula','VZ = |Vo−| − VD2');
  add(vz>=4.8&&vz<=5.35,'VZ value',`≈ ${(Math.abs(R.vom)-0.6).toFixed(2)} V (|Vo−| − 0.6)`);
  add($('obs').value==='b','Q2.1 observation',`النص الموجب ينقص عند V1 + VD1 ≈ ${PX.vop} V، والسالب كامل`);
  const exp={p1:1,p2:2,pz:2,n1:2,n2:1,nz:3};Object.entries(exp).forEach(([id,v])=>add(+$(id).value===v,`Q2.2 ${id[0]==='p'?'positive':'negative'} ${id.slice(1)==='1'?'D1':id.slice(1)==='2'?'D2':'DZ'}`,`الصح: ${STATES[v]}`));
  add($('why').value==='b','Q2.3 why',`لأن −${PX.a1h} V أصغر من VZ + VD2 ≈ 5.6 V`);
  $('result').innerHTML=`<div class="result"><b>النتيجة: ${sc} / ${tot}</b>`+res.map(([ok,t,w])=>`<div class="${ok?'good':'bad'}">${ok?'✓':'✗'} <span class="m">${t}</span>${ok?'':' — '+w}</div>`).join('')+`</div>`;
  $('result').scrollIntoView({behavior:'smooth',block:'nearest'})});

/* ================= Fig. 1 schematic ================= */
(function(){const ink='#1d2a2e';const L=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="2"/>`;
  const di=(x,y,dir,z)=>{const r={right:0,down:90,left:180,up:270}[dir];return `<g transform="translate(${x} ${y}) rotate(${r})"><polygon points="-8,-9 -8,9 8,0" fill="${ink}"/>${z?`<polyline points="12,-13 8,-10 8,10 4,13" fill="none" stroke="${ink}" stroke-width="2.2"/>`:`<line x1="8" y1="-10" x2="8" y2="10" stroke="${ink}" stroke-width="2.2"/>`}</g>`};
  const t=(x,y,s,a='start')=>`<text x="${x}" y="${y}" font-size="13" fill="${ink}" text-anchor="${a}" font-family="Plex Mono, monospace">${s}</text>`;
  let s=`<circle cx="40" cy="135" r="15" fill="none" stroke="${ink}" stroke-width="2"/><path d="M32 135 q4 -9 8 0 t8 0" fill="none" stroke="${ink}" stroke-width="2"/>`+t(10,140,'vi')+t(36,114,'+');
  s+=L(40,30,40,120)+L(40,150,40,240)+L(40,30,90,30)+`<polyline points="90,30 95,23 105,37 115,23 125,37 135,23 140,30" fill="none" stroke="${ink}" stroke-width="2"/>`+t(115,16,'R = 1 kΩ','middle')+L(140,30,400,30)+L(40,240,400,240);
  s+=L(210,30,210,70)+di(210,80,'down')+L(210,90,210,140)+t(224,85,'D1');
  s+=L(198,148,222,148)+L(204,156,216,156)+t(228,156,'V1 = '+PX.v1+' V')+t(190,150,'+','end')+L(210,140,210,148)+L(210,156,210,240);
  s+=L(310,30,310,70)+di(310,80,'up')+L(310,90,310,140)+t(324,85,'D2');
  s+=L(310,140,310,170)+di(310,180,'down',1)+L(310,190,310,240)+t(324,185,'DZ');
  s+=`<circle cx="210" cy="30" r="3.5" fill="${ink}"/><circle cx="310" cy="30" r="3.5" fill="${ink}"/><circle cx="210" cy="240" r="3.5" fill="${ink}"/><circle cx="310" cy="240" r="3.5" fill="${ink}"/>`;
  s+=`<circle cx="400" cy="30" r="5" fill="#fff" stroke="${ink}" stroke-width="2"/><circle cx="400" cy="240" r="5" fill="#fff" stroke="${ink}" stroke-width="2"/>`+t(395,140,'vo')+t(392,58,'+')+t(392,225,'−');
  $('fig1').innerHTML=s})();
return {status,
  steps:[
    {dev:'gen',t:'شغّل الأجهزة الثلاثة: اضغط POWER في الجنريتر والـ DC supply والإسكوب.',ok:s=>s.pwr},
    {dev:'dc',t:`اضبط الـ DC supply على ${PX.v1} V بمقبضي COARSE و FINE، وخلّ CURRENT ≤ 0.05 A، وبعدها شغّل OUTPUT.`,ok:s=>s.dc},
    {dev:'board',t:'ركّب دائرة Fig. 1 على اللوحة: R و D1 و D2 و DZ، والـ DC supply مكان V1. وصّل أحمر الجنريتر على vi، وأحمر CH2 على vo.',ok:s=>s.circ},
    {dev:'board',t:'وصّل أحمر CH1 على vi، وكل الأسود (الجنريتر و CH1 و CH2) على الأرضي.',ok:s=>s.ch1&&s.gnd},
    {dev:'gen',t:`اضبط الجنريتر: Sine، و f = ${PX.f} Hz (F1)، و Amplitude = ${PX.a1} Vpp (F2)، و Offset = 0 (F3)، وشغّل زر CH1.`,ok:s=>s.f&&s.a6&&s.out},
    {dev:'scope',t:'في الإسكوب: اضغط Default، وشغّل CH2، وتأكد إن Coupling = DC و Probe 1X.',ok:s=>s.ch&&s.cpl&&s.probe},
    {dev:'scope',t:'اضغط Autoset أو اضبط SCALE و TIME/DIV لين تطلع الموجتين كاملة على الشاشة (Fig. 2).',ok:s=>s.fit&&!s.xy&&s.a6},
    {dev:'scope',t:'اعرض الـ VTC: Acquire ← XY ← Triggered XY (Fig. 3). لاحظ مستوى القص الموجب.',ok:s=>s.xy&&s.fit&&s.a6},
    {dev:'gen',t:`ارفع السعة إلى ${PX.a2} Vpp وشوف القص السالب عند −(VZ + VD2) (Fig. 4 و 5).`,ok:s=>s.a16&&s.fit}
  ],
  onReset(){['f2','f3','f4','f5'].forEach(id=>{$(id).textContent=id.replace('f','Fig. ');delete CAPS[id]});$('result').innerHTML=''}};
  }
};
