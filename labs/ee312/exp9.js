/* EE312 · Experiment 9 · The BJT CE Circuit with Emphasis on Switching (manual v8.8 pp. 66–72).
   Procedure A: VTC of the CE circuit (Fig. 9.2a: RB = 27 kΩ, RC = 2.7 kΩ, VCC = 5 V, VI from the second unit),
   Table 9.2 (VO = 4.9 … 0.1 V: VBE, VI measured; VBC, mode, IB, IC, IE calculated).
   Procedure B: LED switch (Fig. 9.2b): design RC, IB, RB (eqs 9.3–9.5), two decade boxes, square VControl
   0 / 5 V at 0.2, 2 and 60 Hz. PLQs 1–6.
   Assumptions: the Table 9.2 values follow the manual (the slides list 4.950/2.500/1.500 instead); the first row's
   VBC is −5.000 V (the manual prints 5.000); BD137 legs E C B from the left (TO-225 front view); the LED is the
   green 5 mm LED of Exp 1 (≈ 2 V at 10 mA); the supply knobs move 0.1 V (COARSE) and 1 mV (FINE) per step here
   (the real pots are continuous) so VO can be set within ±8 mV of the table values. */
EXP_DEFS['ee312/exp9']=(()=>{const H=ENGINE.sheet;
const VO=[4.9,4.5,3.5,3.4,2,1,0.5,0.2,0.1];
const MODES=[['cut','Cutoff'],['act','Active'],['sat','Saturation']];
const t92=`<table class="tbl"><caption>Table 9.2 Measured Data (rounded to 3 decimal places) · V<sub>CC</sub> = 5 V, R<sub>B</sub> = 27 kΩ, R<sub>C</sub> = 2.7 kΩ</caption>
<tr><th>V<sub>CE</sub> = V<sub>O</sub> (V)</th><th>V<sub>BE</sub> (V)</th><th>V<sub>I</sub> (V)</th><th>V<sub>BC</sub> = V<sub>BE</sub> − V<sub>CE</sub> (V)</th><th>Mode</th><th>I<sub>B</sub> (mA)</th><th>I<sub>C</sub> (mA)</th><th>I<sub>E</sub> (mA)</th></tr>
<tr><td>5.000</td><td>0.000</td><td>0.000</td><td>−5.000</td><td>Cutoff</td><td>0.000</td><td>0.000</td><td>0.000</td></tr>
${VO.map((v,j)=>`<tr><td>${v.toFixed(3)}</td><td>${H.num('vbe'+j,'0.001',70)}</td><td>${H.num('vi'+j,'0.001',70)}</td><td>${H.num('vbc'+j,'0.001',70)}</td><td>${H.sel('md'+j,MODES)}</td><td>${H.num('ib'+j,'0.001',70)}</td><td>${H.num('ic'+j,'0.001',70)}</td><td>${H.num('ie'+j,'0.001',70)}</td></tr>`).join('')}</table>`;
const design=`<h3>Procedure B · Design (I<sub>LED</sub> = 10 mA, V<sub>LED</sub> ≈ 2 V, V<sub>CC</sub> = 5 V, β<sub>forced</sub> = 10, V<sub>Control,Hi</sub> = 5 V)</h3><div class="en">
${H.row('1. R<sub>C</sub> = (V<sub>CC</sub> − V<sub>LED</sub> − 0.2) / I<sub>Csat</sub> =',H.num('d_rc','0.1'),'Ω')}${H.row('2. I<sub>B</sub> = I<sub>Csat</sub> / β<sub>forced</sub> =',H.num('d_ib','0.001'),'mA')}
${H.row('3. R<sub>B</sub> = (V<sub>Control,Hi</sub> − 0.7) / I<sub>B</sub> =',H.num('d_rb','1'),'Ω')}${H.row('Current carried by the controlling source ≈',H.num('d_is','0.001'),'mA')}
${H.row('Nearest standard R<sub>C</sub> (Appendix F) =',H.num('d_rcs','0.1'),'Ω')}${H.row('Nearest standard R<sub>B</sub> =',H.num('d_rbs','1'),'Ω')}
${H.row('Why is the switching not noticeable at 60 Hz?',H.sel('d_60',[['a','The eye cannot follow 60 on/off cycles per second (persistence of vision): the LED looks steadily lit'],['b','The BJT cannot switch at 60 Hz'],['c','The LED is off at 60 Hz'],['d','The generator cannot give a square wave at 60 Hz']]))}</div>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Complete the calculations in Table 9.2 (graded with the table).</li>
<li class="plq">Plot v<sub>O</sub> vs. v<sub>I</sub> and label the three modes. <button class="t" id="plotBtn" type="button">ارسم من جدولك</button><div id="ivplot"></div></li>
<li class="plq">Which mode can be used for voltage amplification (slope magnitude)?
  <div>${H.sel('q3',[['act','Active: |ΔvO/ΔvI| is large there'],['sat','Saturation: the slope is largest'],['cut','Cutoff: vO is constant']])}</div></li>
<li class="plq">From Table 9.2, when v<sub>O</sub> changes from 3.5 to 3.4 V:
  <div>${H.row('G<sub>V</sub> = Δv<sub>O</sub>/Δv<sub>I</sub> =',H.num('q4g','0.01'))}${H.row('A<sub>V</sub> = Δv<sub>O</sub>/Δv<sub>BE</sub> =',H.num('q4a','0.1'))}</div></li>
<li class="plq">Why is |G<sub>V</sub>| usually less than |A<sub>V</sub>|?
  <div>${H.sel('q5',[['a','Only part of ΔvI appears across the base-emitter junction: most of it drops on RB (ΔvBE = ΔvI · rπ/(RB + rπ))'],['b','Because the collector current is larger than the base current'],['c','Because RC is smaller than RB'],['d','They are always equal']])}</div></li>
<li class="plq">Blue LED (3.4 V at 30 mA), β<sub>forced</sub> = 10: required R<sub>C</sub> and R<sub>B</sub>, and the nearest standard values (Appendix F).
  <div>${H.row('R<sub>C</sub> =',H.num('q6rc','0.01'),'Ω')}${H.row('R<sub>B</sub> =',H.num('q6rb','0.1'),'Ω')}${H.row('Standard R<sub>C</sub> =',H.num('q6rcs','0.1'),'Ω')}${H.row('Standard R<sub>B</sub> =',H.num('q6rbs','1'),'Ω')}</div></li></ol>`;
return {
sheet:`<div class="paper" id="paper">
<h2>Experiment 9 · The BJT CE Circuit with Emphasis on Switching</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig9-2.png" alt="Fig. 9.2"></div>
<div class="hint" style="text-align:center">Fig. 9.2 · (a) CE circuit: R<sub>B</sub> = 27 kΩ, R<sub>C</sub> = 2.7 kΩ, V<sub>CC</sub> = 5 V · (b) LED switch with two decade boxes · BD137 legs: E C B</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">Procedure A: وحدة V<sub>CC</sub> = 5 V ووحدة V<sub>I</sub>، والسالب للوحدتين على الـ emitter. حرّك V<sub>I</sub> (FINE) لين الـ DMM على C–E يقرأ V<sub>O</sub> المطلوب، وبعدها انقل الأطراف وقِس V<sub>BE</sub> و V<sub>I</sub>.</p>
${t92}${design}${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'gen',prev:{wave:'Sine',freq:1000,amp:0.4,off:0}},
  {type:'psu',res:{c:0.1,f:0.001},prev:d=>{d.u[0].v=10;d.u[0].ilim=0.1;d.u[1].v=3.2;d.u[1].ilim=0.5}},
  {type:'scope',probes:2},
  {type:'dmm',n:1,prev:d=>{d.fn='DIODE'}},
  {type:'dmm',n:2,prev:d=>{d.fn='OHM'}},
  {type:'dbox',prev:d=>{d.a=[0,0,7,2,0];d.b=[0,0,0,1,0]}}],
parts:{BD137:{t:'BJT',pkg:'TO126',mark:'BD137',lab:'BD137',pins:[{n:'E',dx:0,dy:0,h:1,role:'e'},{n:'C',dx:1,dy:0,h:1,role:'c'},{n:'B',dx:2,dy:0,h:1,role:'b'}],
    stamp:(els,R,inner,p)=>{els.push({t:'BJT',c:R.c,b:R.b,e:R.e,m:SOLVER.MODELS.bd137,pid:p.id})}},
  R27k:{t:'R',r:27e3,lab:'27kΩ'},R2k7:{t:'R',r:2700,lab:'2.7kΩ'},LED:{t:'LED',lab:'LED'},BR:{t:'BR',lab:''}},
tray:[['BD137','BD137'],['R27k','27 kΩ'],['R2k7','2.7 kΩ'],['LED','LED'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,A=Math.abs,DB=RT.inst.dbox;
  const units=()=>[0,1].map(u=>({u,P:RT.leadNet(u?'Rp':'Lp'),N:RT.leadNet(u?'Rm':'Lm'),U:RT.S.psu.u[u],on:RT.S.psu.pwr&&RT.S.psu.u[u].on}));
  const has=(t,a,b)=>a!=null&&b!=null&&RT.between(a,b).some(x=>x.p.type===t);
  const boxOn=(k,a,b)=>{const x=RT.leadNet('d'+k+'1'),y=RT.leadNet('d'+k+'2');return a!=null&&b!=null&&x!=null&&y!=null&&((x===a&&y===b)||(x===b&&y===a))};
  const led=(an,ca)=>RT.parts('LED').some(p=>{const [a,b]=RT.partNets(p);return a===an&&b===ca});
  function circuit(){const q=RT.parts('BJT');if(q.length!==1)return null;const n={c:RT.pinNet(q[0],'c'),b:RT.pinNet(q[0],'b'),e:RT.pinNet(q[0],'e')};if([n.c,n.b,n.e].some(x=>x==null)||n.c===n.e||n.b===n.e)return null;
    const c={n,q:q[0],kind:null};const U=units();
    const vcc=U.find(x=>x.N===n.e&&has('R2k7',x.P,n.c)),vi=U.find(x=>x.N===n.e&&has('R27k',x.P,n.b));
    if(vcc&&vi&&vcc!==vi){c.kind='A';c.vcc=vcc;c.vi=vi;return c}
    const gr=RT.leadNet('gr');
    for(const v2 of U.filter(x=>x.N===n.e&&x.P!=null&&x.P!==n.c))if(n.e===-1&&gr!=null&&gr>=0){for(const [kc,kb] of [['A','B'],['B','A']]){if(!boxOn(kb,gr,n.b))continue;
        const bc=[RT.leadNet('d'+kc+'1'),RT.leadNet('d'+kc+'2')];
        const ok=bc.some((x,i)=>{const y=bc[1-i];return (x===v2.P&&y!=null&&led(y,n.c))||(y===n.c&&x!=null&&led(v2.P,x))});
        if(ok){c.kind='B';c.vcc=v2;c.rc=DB.value(kc.toLowerCase());c.rb=DB.value(kb.toLowerCase());return c}}}
    return c}
  const ST={vbe:{},vi:{}};
  /* two meters: DMM 1 on C–E (v_O), DMM 2 on B–E (v_BE) and then on V_I; any meter on the right nodes counts */
  function status(){const S=RT.S,g=S.gen;const c=circuit();const st={kind:c&&c.kind,c};
    const across=(a,b)=>RT.meterOn(a,b);
    if(c&&c.kind){const V=RT.nodeV,n=c.n;st.vcc5=c.vcc.on&&A(c.vcc.U.v-5)<0.003;st.vo=V(n.c)-V(n.e);
      if(c.kind==='A'&&st.vcc5&&c.vi.on){const j=VO.findIndex(v=>A(st.vo-v)<=0.008);st.row=j;
        /* a row is set while the DMM reads VO on C–E; the meter then moves to B–E and to VI (its 10 MΩ slightly loads the
           base, so VO itself moves a little) — readings count as long as VI is not touched */
        if(across(n.c,n.e)){if(j>=0)ST.set={j,vi:c.vi.U.v};else if(ST.set&&A(c.vi.U.v-ST.set.vi)>=1e-9)ST.set=null}
        if(ST.set&&A(c.vi.U.v-ST.set.vi)<1e-9){const k=ST.set.j;const qb=across(n.b,n.e),qi=across(c.vi.P,n.e);if(qb)ST.vbe[k]=A(qb.val);if(qi)ST.vi[k]=A(qi.val)}}
      if(c.kind==='B'){const p=RT.parts('LED')[0];const iw=p&&p.iw||[0];st.ledMax=Math.max(...iw);st.ledMin=Math.min(...iw);
        const sq=g.pwr&&g.out&&g.wave==='Square'&&A(g.off+g.amp/2-5)<0.002&&A(g.off-g.amp/2)<0.002;st.sq=sq;
        const blink=sq&&st.vcc5&&st.ledMax>0.008&&st.ledMin<1e-4;st.blink=blink;
        if(blink&&A(g.freq-0.2)<1e-4)ST.f02=true;if(blink&&ST.f02&&A(g.freq-2)<1e-4)ST.f2=true;if(blink&&ST.f2&&A(g.freq-60)<1e-3)ST.f60=true}}
    st.rows=j=>j.every(i=>ST.vbe[i]!=null&&ST.vi[i]!=null);
    st.boxes=[DB.value('a'),DB.value('b')].sort((a,b)=>a-b);st.boxOK=A(st.boxes[0]-280)<=3&&A(st.boxes[1]-4300)<=50;
    st.design=G.near(G.v('d_rc'),280,1)&&G.near(G.v('d_ib'),1,0.01)&&G.near(G.v('d_rb'),4300,10);
    if(ST.f60&&!(g.pwr&&g.out)&&!(S.psu.pwr&&S.psu.u.some(u=>u.on)))ST.end=true;
    return st}
  function plot(){const pts=[[0,5],...VO.map((v,j)=>[G.v('vi'+j),v]).filter(p=>isFinite(p[0]))].sort((a,b)=>a[0]-b[0]);const W=420,Hh=240,xm=Math.max(1.4,...pts.map(p=>p[0]))*1.05,X=v=>36+v/xm*(W-50),Y=v=>Hh-24-v/5.2*(Hh-40);
    let s=`<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;background:#fff;border:1px solid var(--line);border-radius:8px;direction:ltr" font-family="IBM Plex Mono, monospace" font-size="10">`;
    s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(xm)}" y2="${Y(0)}" stroke="#555"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(5.2)}" stroke="#555"/>`;
    for(let v=0.2;v<xm;v+=0.2)s+=`<text x="${X(v)}" y="${Y(0)+13}" text-anchor="middle">${v.toFixed(1)}</text>`;[1,2,3,4,5].forEach(v=>s+=`<text x="${X(0)-4}" y="${Y(v)+3}" text-anchor="end">${v}</text>`);
    s+=`<polyline fill="none" stroke="#c43a2e" stroke-width="2" points="${pts.map(p=>X(p[0])+','+Y(p[1])).join(' ')}"/><text x="${X(xm)-4}" y="${Y(0)-6}" text-anchor="end">vI (V)</text><text x="${X(0)+4}" y="${Y(5.2)+10}">vO (V)</text>`;
    s+=`<text x="${X(0.15)}" y="${Y(4.7)}" fill="#2c7a6b">cutoff</text><text x="${X(0.66)}" y="${Y(2.6)}" fill="#2c7a6b">active</text><text x="${X(xm*0.8)}" y="${Y(0.4)}" fill="#2c7a6b">saturation</text></svg>`;$('ivplot').innerHTML=s}
  $('plotBtn').addEventListener('click',plot);$('paper').addEventListener('change',()=>BENCH.onRender());
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const tl=(e,f=0.003)=>Math.max(0.002,A(e)*f);
    VO.forEach((vo,j)=>{const bad=[];const eb=ST.vbe[j],ei=ST.vi[j];if(eb==null||ei==null){g.add(false,`Table 9.2 · VO = ${vo}`,'ما انقاس');return}
      if(!G.near(v('vbe'+j),eb,tl(eb)))bad.push(`VBE ≈ ${eb.toFixed(3)}`);if(!G.near(v('vi'+j),ei,tl(ei)))bad.push(`VI ≈ ${ei.toFixed(3)}`);
      const vbc=v('vbe'+j)-vo;if(!G.near(v('vbc'+j),vbc,0.002))bad.push(`VBC = VBE − VO ≈ ${vbc.toFixed(3)}`);
      const md=v('vbe'+j)<0.5?'cut':vbc>=0.4?'sat':'act';if(G.s('md'+j)!==md)bad.push(`mode: ${MODES.find(m=>m[0]===md)[1]} (Table 9.1)`);
      const ib=(v('vi'+j)-v('vbe'+j))/27,ic=(5-vo)/2.7;if(!G.near(v('ib'+j),ib,tl(ib,0.01)))bad.push(`IB ≈ ${ib.toFixed(3)} mA`);if(!G.near(v('ic'+j),ic,tl(ic)))bad.push(`IC ≈ ${ic.toFixed(3)} mA`);
      if(!G.near(v('ie'+j),v('ib'+j)+v('ic'+j),0.002))bad.push('IE = IB + IC');g.add(!bad.length,`Table 9.2 · VO = ${vo.toFixed(3)} V`,bad.join('، '))});
    g.add(G.near(v('d_rc'),280,1),'B1 RC','= (5 − 2 − 0.2) / 10 mA = 280 Ω');g.add(G.near(v('d_ib'),1,0.01),'B2 IB','= 10 mA / 10 = 1 mA');g.add(G.near(v('d_rb'),4300,10),'B3 RB','= (5 − 0.7) / 1 mA = 4.3 kΩ');
    g.add(G.near(v('d_is'),1,0.05),'B current of the controlling source','≈ IB ≈ 1 mA');
    g.add([270,280].some(x=>G.near(v('d_rcs'),x,0.5))&&[4300,4320].some(x=>G.near(v('d_rbs'),x,1)),'B standard values','RC: 280 (E96) or 270 (E24); RB: 4.32 k (E96) or 4.3 k (E24)');
    g.add(G.s('d_60')==='a','B 60 Hz');g.add(!!ST.f02&&!!ST.f2&&!!ST.f60,'B circuit tested at 0.2, 2 and 60 Hz');
    g.add(G.s('q3')==='act','PLQ 3','active');
    const i35=VO.indexOf(3.5),i34=VO.indexOf(3.4);const gv=-0.1/(v('vi'+i34)-v('vi'+i35)),av=-0.1/(v('vbe'+i34)-v('vbe'+i35));
    g.add(isFinite(gv)&&G.near(v('q4g'),gv,A(gv)*0.03),'PLQ 4 GV',`= −0.1 / ΔVI ≈ ${isFinite(gv)?gv.toFixed(2):'?'}`);g.add(isFinite(av)&&G.near(v('q4a'),av,A(av)*0.03),'PLQ 4 AV',`= −0.1 / ΔVBE ≈ ${isFinite(av)?av.toFixed(1):'?'}`);
    g.add(G.s('q5')==='a','PLQ 5');
    g.add(G.near(v('q6rc'),140/3,0.1)&&G.near(v('q6rb'),4300/3,1),'PLQ 6 RC, RB','RC = (5 − 3.4 − 0.2)/30 mA ≈ 46.67 Ω; RB = (5 − 0.7)/3 mA ≈ 1433.3 Ω');
    g.add([46.4,47].some(x=>G.near(v('q6rcs'),x,0.05))&&[1430,1500].some(x=>G.near(v('q6rbs'),x,1)),'PLQ 6 standard','RC: 46.4 Ω (E96) or 47 Ω (E24); RB: 1.43 kΩ (E96) or 1.5 kΩ (E24)');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'board',fig:'labs/ee312/fig/fig9-2.png',figCap:'Fig. 9.2',
        lines:[{t:'BD137: E → node 15, C → node 16, B → node 17',note:'الوجه المكتوب عليه للأمام',ic:'BD137',pins:{E:15,C:16,B:17}},{t:'R<sub>C</sub> = 2.7 kΩ: node 16 ↔ node 23',part:['R2k7',16,23]},{t:'R<sub>B</sub> = 27 kΩ: node 17 ↔ node 24',part:['R27k',17,24]},
          {t:'DC + (L +) → node 23',note:'V<sub>CC</sub>',lead:'Lp',at:23},{t:'DC − (L −) → node 15',note:'على E',lead:'Lm',at:15},{t:'DC + (R +) → node 24',note:'V<sub>I</sub>',lead:'Rp',at:24},{t:'DC − (R −) → node 15',lead:'Rm',at:15}],
        t:'Procedure A: ركّب Fig. 9.2a: الـ BD137 (E C B)، R<sub>C</sub> = 2.7 kΩ من + وحدة V<sub>CC</sub> للـ collector، و R<sub>B</sub> = 27 kΩ من + وحدة V<sub>I</sub> للـ base، والسالب للوحدتين على الـ emitter.',ok:s=>s.kind==='A'},
      {dev:'psu',t:'شغّل المصدر: V<sub>CC</sub> = 5.00 V، ووحدة V<sub>I</sub> تبدأ من 0 V، وشغّل الـ dc للوحدتين.',ok:s=>s.kind==='A'&&s.vcc5&&s.c.vi.on},
      {dev:'psu',fig:'labs/ee312/fig/fig9-2.png',figCap:'Fig. 9.2',lines:[{t:'DMM 1 HI → node 16',note:'v<sub>O</sub> = v<sub>CE</sub>',lead:'mh',at:16},{t:'DMM 1 COM → node 15',lead:'ml',at:15},{t:'DMM 2 HI → node 17',note:'v<sub>BE</sub> (وبعدها node 24 لـ V<sub>I</sub>)',lead:'m2h',at:17},{t:'DMM 2 COM → node 15',lead:'m2l',at:15}],t:'الملتيميترين على DCV: DMM 1 على C–E و DMM 2 على B–E. ارفع V<sub>I</sub> لين DMM 1 يقرا V<sub>O</sub> = 4.900 V ثم 4.500 V، وفي كل مرة سجّل V<sub>BE</sub> من DMM 2، وبعدها انقل HI حق DMM 2 لـ node 24 وسجّل V<sub>I</sub>.',ok:s=>s.rows([0,1])},
      {dev:'psu',t:'كمّل: V<sub>O</sub> = 3.500 و 3.400 V.',ok:s=>s.rows([2,3])},
      {dev:'psu',t:'كمّل: V<sub>O</sub> = 2.000 و 1.000 و 0.500 V.',ok:s=>s.rows([4,5,6])},
      {dev:'psu',t:'كمّل: V<sub>O</sub> = 0.200 و 0.100 V (الـ FINE بشويش).',ok:s=>s.rows([7,8])},
      {dev:'board',t:'Procedure B: احسب R<sub>C</sub> و I<sub>B</sub> و R<sub>B</sub> (eq. 9.3–9.5) واكتبهم في الـ sheet.',ok:s=>s.design},
      {dev:'dbox',t:'اضبط صندوقي المقاومات: واحد على R<sub>C</sub> = 280 Ω والثاني على R<sub>B</sub> = 4.3 kΩ.',ok:s=>s.boxOK},
      {dev:'board',fig:'labs/ee312/fig/fig9-2.png',figCap:'Fig. 9.2',
        lines:[{t:'LED: anode → node 23, cathode → node 16',note:'الرجل الطويلة جهة V<sub>CC</sub> (شيل R<sub>C</sub> و R<sub>B</sub>)',part:['LED',23,16],pol:true},{t:'DC + (L +) → node 30',lead:'Lp',at:30},
          {t:'R<sub>C</sub> box: A1 → node 30, A2 → node 23',note:'صندوق A',lead:'dA1',at:30},{t:'A2 → node 23',lead:'dA2',at:23},{t:'GEN OUT → node 25',lead:'gr',at:25},
          {t:'R<sub>B</sub> box: B1 → node 25',note:'صندوق B',lead:'dB1',at:25},{t:'B2 → node 17',note:'على B',lead:'dB2',at:17},{t:'GEN ⏚ → node 15',note:'على E',lead:'gb',at:15}],
        t:'ركّب Fig. 9.2b: صندوق R<sub>C</sub> والـ LED (الأنود جهة V<sub>CC</sub>) للـ collector، وصندوق R<sub>B</sub> من GEN OUT للـ base، والـ emitter على الأرضي (GEN ⏚ و − الـ V<sub>CC</sub>). V<sub>CC</sub> = 5 V شغّال.',ok:s=>s.kind==='B'&&s.vcc5},
      {dev:'gen',t:'الجنريتر: Square، Hi_Level (F4) = 5 V و Lo_Level (F5) = 0 V، والتردد 0.2 Hz، وشغّل CH1. لاحظ الـ LED يولّع ويطفي.',ok:s=>!!ST.f02},
      {dev:'gen',t:'غيّر التردد لـ 2 Hz.',ok:s=>!!ST.f2},
      {dev:'gen',t:'غيّر التردد لـ 60 Hz: ليش ما تلاحظ الـ switching؟ جاوب في الـ sheet.',ok:s=>!!ST.f60},
      {dev:'gen',t:'طفّ مخرج الجنريتر والمصدر، ورتّب طاولتك.',ok:s=>!!ST.end}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.vbe={};ST.vi={};$('result').innerHTML='';$('ivplot').innerHTML=''}};
}};})();
