/* EE312 · Experiment 2 · Terminal Characteristics of Junction Diodes (manual v8.8 pp. 14–20).
   Fig. 2.3a (reverse, VBB) and Fig. 2.3b (forward, VFF): one EL302RD unit, RS = 1 kΩ, the 1N4001 then the 1N4733A,
   two MT3805 as Fig. 2.3 draws them (DMM 1 on RS: VRS = ID in mA, DMM 2 on the diode: VD; either meter may take either
   place). Table 2.2 and PLQs 1–5. Steps follow the manual's procedure (A 1–6, B 1–5) one by one; figures in the lab's
   rectangle layout (supply on the left column, RS and D down the right column, the meters on them).
   Assumptions: in Fig. 2.3a the supply's + goes to the diode's cathode and RS stays on the anode side (exactly as drawn),
   so the reverse readings come out negative; they are compared by magnitude. Procedure B step 1 starts again with the
   rectifier (step 4 then "replaces the rectifier diode with a Zener"). PLQ 1's MATLAB plot is replaced by a plot drawn
   from the student's own table; Eq. 2.2 uses VT = 26 mV. */
EXP_DEFS['ee312/exp2']=(()=>{const H=ENGINE.sheet;
const REV=[25,20,15,10,7,5,4,3],FWD=[0.3,0.4,0.5,0.55,0.6,0.65,0.75,1.7,10.7,20.7];
const key=(t,b,v)=>`${t}_${b}_${String(v).replace('.','p')}`;
const cells=(b,v)=>['D4001','Z4733'].map(t=>`<td>${H.num(key(t,b,v)+'_vd')}</td><td>${H.num(key(t,b,v)+'_vrs')}</td>`).join('');
const t22=`<table class="tbl"><caption>Table 2.2 Measured Data for plotting the i-v curve (Rounded Off to 3 Decimal Places)</caption>
<tr><th rowspan="2">Bias Condition</th><th>dc Supply Voltage</th><th colspan="2">Rectifier Diode</th><th colspan="2">Zener Diode</th></tr>
<tr><th>V<sub>BB</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th></tr>
${REV.map((v,i)=>`<tr data-proc="A">${i?'':`<td rowspan="${REV.length+1}" style="writing-mode:vertical-rl;transform:rotate(180deg)">Reverse Biasing Case (Fig 2.3a)</td>`}<td>${v}</td>${cells('R',v)}</tr>`).join('')}
<tr data-proc="A"><td>2</td><td>-2</td><td>0.00</td><td>-2</td><td>0.00</td></tr>
<tr><td style="background:#ccd3d1"></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
<tr data-proc="B"><th></th><th>V<sub>FF</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th></tr>
${FWD.map((v,i)=>`<tr data-proc="B">${i?'':`<td rowspan="${FWD.length}" style="writing-mode:vertical-rl;transform:rotate(180deg)">Forward Biasing Case (Fig 2.3b)</td>`}<td>${v}</td>${cells('F',v)}</tr>`).join('')}</table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Plot I<sub>D</sub> vs. V<sub>D</sub> for both diodes and label the three regions. Find the cut-in voltage of the rectifier diode.
  <div><button class="t" id="plotBtn">📈 ارسم I<sub>D</sub>–V<sub>D</sub> من جدولك</button></div><div id="ivplot"></div>
  <div>${H.row('Cut-in voltage of the rectifier ≈',H.num('q1c','0.01'),'V')}</div></li>
<li class="plq" data-proc="B">Use the forward measurements at V<sub>FF</sub> = 10.7 V and 1.7 V and Eq. (2.2) to calculate n for the rectifier diode; then use Eq. (2.1) to calculate I<sub>S</sub>.
  <div>${H.row('n =',H.num('q2n','0.001'))}${H.row('I<sub>S</sub> =',H.num('q2is','any',120),'nA')}</div></li>
<li class="plq" data-proc="A">Calculate r<sub>Z</sub> from the Zener readings at V<sub>BB</sub> = 15 V and 20 V (absolute values), then V<sub>Z0</sub> using the values at V<sub>BB</sub> = 20 V.
  <div>${H.row('r<sub>Z</sub> =',H.num('q3r','0.01'),'Ω')}${H.row('V<sub>Z0</sub> =',H.num('q3v'),'V')}</div></li>
<li class="plq" data-proc="A">Replace the Zener in Fig. 2.3a by its linearized model (r<sub>Z</sub>, V<sub>Z0</sub>). For V<sub>BB</sub> = 25 V calculate I<sub>Z</sub>, then V<sub>Z</sub> = V<sub>Z0</sub> + I<sub>Z</sub> × r<sub>Z</sub>.
  <div>${H.row('I<sub>Z</sub> =',H.num('q4i'),'mA')}${H.row('V<sub>Z</sub> =',H.num('q4v'),'V')}</div></li>
<li class="plq" data-proc="B">Load line V<sub>FF</sub> = I<sub>D</sub> × R<sub>S</sub> + V<sub>D</sub> for V<sub>FF</sub> = 10.7 V on the rectifier's i-v curve: find the dc operating point (V<sub>DQ</sub>, I<sub>DQ</sub>) and compare it with your measurement.
  <div>${H.row('V<sub>DQ</sub> =',H.num('q5v'),'V')}${H.row('I<sub>DQ</sub> =',H.num('q5i'),'mA')}
  ${H.row('Comparison:',H.sel('q5c',[['a','The operating point agrees with the measured VD and ID at VFF = 10.7 V'],['b','IDQ = 10.7 mA because the diode drop can be ignored'],['c','The load line never meets the curve']]))}</div></li></ol>`;
/* the figures' reference wiring, in the lab's rectangle layout (bottom-left node 22, left column 22–8, top row 8–10,
   right column 10–24, bottom row back to 22): the supply on the left side (Fig. 2.3a: − at the top, + at the bottom;
   Fig. 2.3b: + at the top), RS down the right column (10–17) and the diode under it (17–24, anode up);
   DMM 1 on RS (+ at the top), DMM 2 on the diode (+ on the anode) */
const RING=[{wire:[8,9]},{wire:[9,10]},{part:['R1k',10,17]},{wire:[24,23]},{wire:[23,22]}];
const DMMS=[{lead:'mh',alt:'m2h',at:10},{lead:'ml',alt:'m2l',at:17},{lead:'m2h',alt:'mh',at:17},{lead:'m2l',alt:'ml',at:24}];
const fig23=(rev,t)=>[...(rev?[{lead:'Lm',alt:'Rm',at:8},{lead:'Lp',alt:'Rp',at:22}]:[{lead:'Lp',alt:'Rp',at:8},{lead:'Lm',alt:'Rm',at:22}]),...RING,{part:[t,17,24],pol:true},...DMMS];
const FIG='labs/ee312/fig/fig2-3.png';
const figs={'2.3a':{img:FIG,cap:'Fig. 2.3a · reverse bias, the rectifier 1N4001',lines:fig23(true,'D4001')},
  '2.3a-Z':{img:FIG,cap:'Fig. 2.3a · reverse bias, the Zener 1N4733A',lines:fig23(true,'Z4733')},
  '2.3b':{img:FIG,cap:'Fig. 2.3b · forward bias, the rectifier 1N4001',lines:fig23(false,'D4001')},
  '2.3b-Z':{img:FIG,cap:'Fig. 2.3b · forward bias, the Zener 1N4733A',lines:fig23(false,'Z4733')}};
return {figs,procs:[{id:'A',title:'Reverse bias: Fig. 2.3a (Table 2.2)'},{id:'B',title:'Forward bias: Fig. 2.3b (Table 2.2)'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 2 · Terminal Characteristics of Junction Diodes</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig2-3.png" alt="Fig. 2.3"></div>
<div class="hint" style="text-align:center">Fig. 2.3 · R<sub>S</sub> = 1 kΩ, D = 1N4001 then 1N4733A · (a) reverse bias V<sub>BB</sub> · (b) forward bias V<sub>FF</sub></div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig2-2.png" alt="Fig. 2.2"></div>
<div class="hint" style="text-align:center">Fig. 2.2 · Zener breakdown and its linearized model V<sub>Z</sub> = V<sub>Z0</sub> + I<sub>Z</sub>·r<sub>Z</sub> · Eq. (2.2): n = (V<sub>D2</sub> − V<sub>D1</sub>) / (V<sub>T</sub> ln(I<sub>D2</sub>/I<sub>D1</sub>)), V<sub>T</sub> ≅ 26 mV</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">انقل أطراف الـ DMM بين RS والدايود، وسجّل كل قراءة مثل ما تطلع (3 خانات عشرية). في الـ reverse تقدر تكتب القيمة بإشارتها أو بدونها.</p>
${t22}${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'psu',prev:d=>{d.u[0].v=5;d.u[0].ilim=0.05;d.u[1].v=12;d.u[1].ilim=0.4}},
  {type:'dmm',n:1,prev:d=>{d.fn='DIODE'}},
  {type:'dmm',n:2,prev:d=>{d.fn='OHM'}}],
parts:{R1k:{t:'R',r:1000,lab:'1kΩ'},D4001:{t:'D',lab:'1N4001'},Z4733:{t:'Z',lab:'1N4733A'},BR:{t:'BR',lab:''}},
tray:[['R1k','1 kΩ'],['D4001','1N4001'],['Z4733','1N4733A'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,MOD={D4001:'si',Z4733:'zener'};
  /* expected readings: unit (0.02 Ω) – 1 kΩ – diode loop; the 10 MΩ meter sits across the measured element */
  function ref(type,fwd,V,what){const f=SOLVER.MODELS[MOD[type]];const s=fwd?1:-1;
    const els=[{t:'DC',a:0,b:-1,v:V,ilim:0.05,r:0.02},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:fwd?1:-1,b:fwd?-1:1,f}];
    els.push(what==='vd'?{t:'G',a:1,b:-1,g:1e-7}:{t:'G',a:0,b:1,g:1e-7});
    const r=SOLVER.point({n:2,els,dcs:[0]},0);return what==='vd'?s*r.x[1]:r.x[0]-r.x[1]}
  const EXPV={};['D4001','Z4733'].forEach(t=>{REV.forEach(v=>['vd','vrs'].forEach(w=>EXPV[key(t,'R',v)+'_'+w]=ref(t,false,v,w)));FWD.forEach(v=>['vd','vrs'].forEach(w=>EXPV[key(t,'F',v)+'_'+w]=ref(t,true,v,w)))});
  let ST={};
  /* the matched figure (circuit equivalence, any layout): the unit whose + lead is on the figure's + net,
     the diode's nets (anode / cathode) and RS's nets as the figure orients them */
  const FIGS=[['2.3a','D4001',false],['2.3a-Z','Z4733',false],['2.3b','D4001',true],['2.3b-Z','Z4733',true]];
  function loop(){const S=RT.S;for(const [id,type,fwd] of FIGS){const M=RT.match(id);if(!M.ok)continue;const P=M.net(fwd?8:22);
      for(const u of [0,1]){if(RT.leadNet(u?'Rp':'Lp')!==P)continue;const U=S.psu.u[u];
        return {id,u,U,type,fwd,rsT:M.net(10),X:M.net(17),K:M.net(24),on:S.psu.pwr&&U.on}}}
    return null}
  function snap(v,list){return list.find(x=>Math.abs(x-v)<0.006)}
  /* Fig. 2.3 draws two meters: DMM 1 on R_S (V_RS), DMM 2 on the diode (V_D), + leads as drawn */
  function status(){const S=RT.S,M=RT.meters();const L=loop();const st={L,dcv:M.some(m=>m.D.pwr&&m.D.fn==='DCV'&&m.D.jack==='HI')};
    if(L&&L.on){const b=L.fwd?'F':'R';const v=snap(L.U.v,L.fwd?FWD:REV);
      if(v!=null&&L.U.ilim<=0.0501){const k=key(L.type,b,v);const qd=RT.meterOn(L.X,L.K,true),qr=RT.meterOn(L.rsT,L.X,true);
        if(qd&&qr){ST[k+'_vd']=qd.val;ST[k+'_vrs']=qr.val}}}
    if(L&&!L.on&&ST._revAll&&!L.fwd)ST.offA=true;
    const all=(t,b,list)=>list.every(v=>ST[key(t,b,v)+'_vd']!=null&&ST[key(t,b,v)+'_vrs']!=null);
    st.revR=all('D4001','R',REV);st.revZ=all('Z4733','R',REV);if(st.revR&&st.revZ)ST._revAll=true;
    st.fwdR=all('D4001','F',FWD);st.fwdZ=all('Z4733','F',FWD);if(st.fwdR&&st.fwdZ)ST._fwdAll=true;
    if(ST._fwdAll&&(!S.psu.pwr||(L&&!L.on)))ST.offB=true;
    st.has=(t,b,v)=>ST[key(t,b,v)+'_vd']!=null&&ST[key(t,b,v)+'_vrs']!=null;
    return st}
  /* Manual-mode «Capture» targets: the readings of one row (V_D on DMM 2, V_RS on DMM 1), taken when that row was set */
  const recRow=(t,b,v)=>{const k=key(t,b,v),nm=t==='D4001'?'1N4001':'1N4733A',sv=(b==='R'?'V<sub>BB</sub>':'V<sub>FF</sub>')+' = '+v+' V',
      none=`اضبط ${b==='R'?'V_BB':'V_FF'} = ${v} V والـ ${nm} في الدائرة والـ dc ON`;
    return [{to:k+'_vd',val:()=>ST[k+'_vd']==null?null:ST[k+'_vd'],unit:'V',dec:3,label:`${nm} · ${sv} · V<sub>D</sub>`,none},{to:k+'_vrs',val:()=>ST[k+'_vrs']==null?null:ST[k+'_vrs'],unit:'V',dec:3,label:`${nm} · ${sv} · V<sub>RS</sub>`,none}]};
  const recRows=(b,list)=>list.flatMap(v=>[...recRow('D4001',b,v),...recRow('Z4733',b,v)]);
  /* PLQ 1: plot the student's own table */
  function plot(){const pts={D4001:[],Z4733:[]};['D4001','Z4733'].forEach(t=>{[...REV.map(v=>['R',v]),...FWD.map(v=>['F',v])].forEach(([b,v])=>{const vd=G.v(key(t,b,v)+'_vd'),id=G.v(key(t,b,v)+'_vrs');
      if(isFinite(vd)&&isFinite(id))pts[t].push(b==='R'?[-Math.abs(vd),-Math.abs(id)]:[vd,id])});pts[t].push([0,0],[-2,0]);pts[t].sort((a,b)=>a[0]-b[0])});
    const W=420,Hh=260,x0=-26,x1=1.2,y0=-25,y1=25;const X=v=>30+(v-x0)/(x1-x0)*(W-40),Y=i=>Hh-20-(i-y0)/(y1-y0)*(Hh-30);
    let s=`<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;background:#fff;border:1px solid var(--line);border-radius:8px;direction:ltr" font-family="IBM Plex Mono, monospace" font-size="10">`;
    s+=`<line x1="${X(x0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(0)}" stroke="#555"/><line x1="${X(0)}" y1="${Y(y0)}" x2="${X(0)}" y2="${Y(y1)}" stroke="#555"/>`;
    [-25,-20,-15,-10,-5].forEach(v=>s+=`<text x="${X(v)}" y="${Y(0)+12}" text-anchor="middle">${v}</text>`);[-20,-10,10,20].forEach(i=>s+=`<text x="${X(0)+4}" y="${Y(i)+3}">${i} mA</text>`);
    [['D4001','#c43a2e'],['Z4733','#2c7a6b']].forEach(([t,c])=>{s+=`<polyline fill="none" stroke="${c}" stroke-width="2" points="${pts[t].map(p=>X(p[0])+','+Y(p[1])).join(' ')}"/>`});
    s+=`<text x="${W-150}" y="16" fill="#c43a2e">● 1N4001</text><text x="${W-150}" y="30" fill="#2c7a6b">● 1N4733A</text><text x="${X(-12)}" y="${Y(-20)}">breakdown</text><text x="${X(-12)}" y="${Y(3)}">reverse</text><text x="${X(0.1)}" y="${Y(18)}">forward</text></svg>`;
    $('ivplot').innerHTML=s}
  $('plotBtn').addEventListener('click',plot);
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,A=Math.abs;
    const tol=(e,w)=>w==='vd'?Math.max(0.006,A(e)*0.003):Math.max(0.006,A(e)*0.005);
    [['D4001','R','Rectifier · reverse',REV],['Z4733','R','Zener · reverse',REV],['D4001','F','Rectifier · forward',FWD],['Z4733','F','Zener · forward',FWD]].forEach(([t,b,lab,list])=>{const bad=[];g.proc(b==='R'?'A':'B');
      list.forEach(V=>['vd','vrs'].forEach(w=>{const k=key(t,b,V)+'_'+w,e=EXPV[k],x=v(k);if(!(isFinite(x)&&A(A(x)-A(e))<=tol(e,w)))bad.push(`${V} V ${w==='vd'?'VD':'VRS'} ≈ ${e.toFixed(3)}`)}));
      g.add(!bad.length,`Table 2.2 ${lab}`,bad.slice(0,4).join('، ')+(bad.length>4?` … (+${bad.length-4})`:''))});
    g.proc(null);g.add(v('q1c')>=0.45&&v('q1c')<=0.7,'PLQ 1 cut-in voltage','≈ 0.5–0.65 V where the current starts to rise');
    const k=x=>key('D4001','F',x);const V1=A(v(k(1.7)+'_vd')),I1=A(v(k(1.7)+'_vrs'))*1e-3,V2=A(v(k(10.7)+'_vd')),I2=A(v(k(10.7)+'_vrs'))*1e-3;
    const n=(V2-V1)/(0.026*Math.log(I2/I1)),Is=I2/Math.exp(V2/(n*0.026))*1e9;
    g.proc('B');g.add(G.near(v('q2n'),n,Math.max(0.02,n*0.02)),'PLQ 2 n',`= (VD2 − VD1) / (VT ln(ID2/ID1)) ≈ ${isFinite(n)?n.toFixed(3):'?'} from your table`);
    g.add(isFinite(Is)&&G.near(v('q2is'),Is,Is*0.15),'PLQ 2 IS',`= ID / e^(VD/(n·VT)) ≈ ${isFinite(Is)?Is.toPrecision(3):'?'} nA`);
    const z=x=>key('Z4733','R',x);const Vz15=A(v(z(15)+'_vd')),Iz15=A(v(z(15)+'_vrs')),Vz20=A(v(z(20)+'_vd')),Iz20=A(v(z(20)+'_vrs'));
    const rz=(Vz20-Vz15)/((Iz20-Iz15)*1e-3),vz0=Vz20-Iz20*1e-3*rz;
    g.proc('A');g.add(G.near(v('q3r'),rz,Math.max(0.3,rz*0.05)),'PLQ 3 rZ',`= ΔVZ/ΔIZ ≈ ${rz.toFixed(2)} Ω`);g.add(G.near(v('q3v'),vz0,0.01),'PLQ 3 VZ0',`= VZ − IZ·rZ ≈ ${vz0.toFixed(3)} V`);
    const iz=(25-vz0)/(1000+rz)*1e3,vz=vz0+iz*1e-3*rz;g.add(G.near(v('q4i'),iz,0.05),'PLQ 4 IZ',`= (25 − VZ0)/(RS + rZ) ≈ ${iz.toFixed(3)} mA`);g.add(G.near(v('q4v'),vz,0.01),'PLQ 4 VZ',`≈ ${vz.toFixed(3)} V`);
    g.proc('B');g.add(G.near(v('q5v'),V2,0.03),'PLQ 5 VDQ',`≈ ${isFinite(V2)?V2.toFixed(3):'?'} V`);g.add(G.near(v('q5i'),(10.7-V2),0.1),'PLQ 5 IDQ',`= (10.7 − VDQ)/1 kΩ ≈ ${(10.7-V2).toFixed(2)} mA`);
    g.add(G.s('q5c')==='a','PLQ 5 comparison');
    g.show($('result'))});
  return {status,
    steps:[
      /* Procedure A (manual p. 18), steps 1–6 */
      {dev:'board',build:'2.3a',t:'Procedure A · 1. وصّل الدائرة Fig. 2.3a، في البداية بالـ rectifier diode.'},
      {dev:'psu',t:'2. شغّل الـ dc supply بمفتاح ∼ POWER.',acts:['بالـ CURRENT خلّ حد التيار 0.05 A.','بالـ COARSE و FINE خلّ الجهد V<sub>BB</sub> = 25 V.','شغّل مفتاح الـ dc ⎓ ON.'],
        ok:s=>s.L&&!s.L.fwd&&s.L.on&&Math.abs(s.L.U.v-25)<0.006&&s.L.U.ilim<=0.0501},
      {dev:'dmm',t:'3. بالـ DMM قِس V<sub>D</sub> و V<sub>RS</sub> وسجّلهم في Table 2.2 (3 خانات عشرية). لاحظ إن V<sub>RS</sub> بالـ V = I<sub>D</sub> بالـ mA.',
        ok:s=>s.has('D4001','R',25),rec:recRow('D4001','R',25)},
      {dev:'board',build:'2.3a-Z',t:'4. بدّل الـ rectifier diode بـ Zener diode، وسجّل V<sub>D</sub> و V<sub>RS</sub> في الجدول.',ok:s=>s.has('Z4733','R',25),rec:recRow('Z4733','R',25)},
      {dev:'psu',t:'5. كرّر الخطوات اللي فوق لباقي قيم V<sub>BB</sub> في الجدول (20، 15، 10، 7، 5، 4، 3 V).',ok:s=>ST._revAll,rec:recRows('R',REV.slice(1))},
      {dev:'psu',t:'6. طفّ مفتاح الـ dc في الـ power supply.',ok:s=>ST.offA||ST._fwdAll},
      /* Procedure B (manual p. 18), steps 1–5 */
      {dev:'board',build:'2.3b',t:'Procedure B · 1. غيّر توصيل المصدر بس عشان تصير الدائرة Fig. 2.3b.'},
      {dev:'psu',t:'2. بمقابض الـ VOLTAGE في الـ dc power supply خلّ الجهد 0.3 V.',ok:s=>s.L&&s.L.fwd&&Math.abs(s.L.U.v-0.3)<0.006},
      {dev:'psu',t:'3. شغّل مفتاح الـ dc. سجّل قراءات الملتيميتر للمقاومة والدايود في Table 2.2.',ok:s=>s.has('D4001','F',0.3),rec:recRow('D4001','F',0.3)},
      {dev:'board',build:'2.3b-Z',t:'4. بدّل الـ rectifier diode بـ Zener diode وقِس وسجّل V<sub>RS</sub> و V<sub>D</sub>. كرّر الخطوات اللي فوق لباقي قيم V<sub>FF</sub> في الجدول.',
        ok:s=>ST._fwdAll,rec:[...recRow('Z4733','F',0.3),...recRows('F',FWD.slice(1))]},
      {dev:'psu',t:'5. طفّ الـ dc supply، وفكّ القطع، ورتّب طاولتك.',ok:s=>ST.offB}
    ],

    onReset(){ST={};$('result').innerHTML='';$('ivplot').innerHTML=''}};
}};})();
