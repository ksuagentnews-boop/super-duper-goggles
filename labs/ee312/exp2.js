/* EE312 · Experiment 2 · Terminal Characteristics of Junction Diodes (manual v8.8 pp. 14–20).
   Fig. 2.3a (reverse, VBB) and Fig. 2.3b (forward, VFF): one EL302RD unit, RS = 1 kΩ, the 1N4001 and the 1N4733A,
   one MT3805 moved between RS (VRS = ID in mA) and the diode (VD). Table 2.2 and PLQs 1–5.
   Assumptions: reverse-bias readings are compared by magnitude (the sign depends on how the meter leads sit);
   PLQ 1's MATLAB plot is replaced by a plot drawn from the student's own table; Eq. 2.2 uses VT = 26 mV. */
EXP_DEFS['ee312/exp2']=(()=>{const H=ENGINE.sheet;
const REV=[25,20,15,10,7,5,4,3],FWD=[0.3,0.4,0.5,0.55,0.6,0.65,0.75,1.7,10.7,20.7];
const key=(t,b,v)=>`${t}_${b}_${String(v).replace('.','p')}`;
const cells=(b,v)=>['D4001','Z4733'].map(t=>`<td>${H.num(key(t,b,v)+'_vd')}</td><td>${H.num(key(t,b,v)+'_vrs')}</td>`).join('');
const t22=`<table class="tbl"><caption>Table 2.2 Measured Data for plotting the i-v curve (Rounded Off to 3 Decimal Places)</caption>
<tr><th rowspan="2">Bias Condition</th><th>dc Supply Voltage</th><th colspan="2">Rectifier Diode</th><th colspan="2">Zener Diode</th></tr>
<tr><th>V<sub>BB</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th></tr>
${REV.map((v,i)=>`<tr>${i?'':`<td rowspan="${REV.length+1}" style="writing-mode:vertical-rl;transform:rotate(180deg)">Reverse Biasing Case (Fig 2.3a)</td>`}<td>${v}</td>${cells('R',v)}</tr>`).join('')}
<tr><td>2</td><td>-2</td><td>0.00</td><td>-2</td><td>0.00</td></tr>
<tr><td style="background:#ccd3d1"></td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
<tr><th></th><th>V<sub>FF</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th><th>V<sub>D</sub> (V)</th><th>I<sub>D</sub> (mA) = V<sub>RS</sub> (V)</th></tr>
${FWD.map((v,i)=>`<tr>${i?'':`<td rowspan="${FWD.length}" style="writing-mode:vertical-rl;transform:rotate(180deg)">Forward Biasing Case (Fig 2.3b)</td>`}<td>${v}</td>${cells('F',v)}</tr>`).join('')}</table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Plot I<sub>D</sub> vs. V<sub>D</sub> for both diodes and label the three regions. Find the cut-in voltage of the rectifier diode.
  <div><button class="t" id="plotBtn">📈 ارسم I<sub>D</sub>–V<sub>D</sub> من جدولك</button></div><div id="ivplot"></div>
  <div>${H.row('Cut-in voltage of the rectifier ≈',H.num('q1c','0.01'),'V')}</div></li>
<li class="plq">Use the forward measurements at V<sub>FF</sub> = 10.7 V and 1.7 V and Eq. (2.2) to calculate n for the rectifier diode; then use Eq. (2.1) to calculate I<sub>S</sub>.
  <div>${H.row('n =',H.num('q2n','0.001'))}${H.row('I<sub>S</sub> =',H.num('q2is','any',120),'nA')}</div></li>
<li class="plq">Calculate r<sub>Z</sub> from the Zener readings at V<sub>BB</sub> = 15 V and 20 V (absolute values), then V<sub>Z0</sub> using the values at V<sub>BB</sub> = 20 V.
  <div>${H.row('r<sub>Z</sub> =',H.num('q3r','0.01'),'Ω')}${H.row('V<sub>Z0</sub> =',H.num('q3v'),'V')}</div></li>
<li class="plq">Replace the Zener in Fig. 2.3a by its linearized model (r<sub>Z</sub>, V<sub>Z0</sub>). For V<sub>BB</sub> = 25 V calculate I<sub>Z</sub>, then V<sub>Z</sub> = V<sub>Z0</sub> + I<sub>Z</sub> × r<sub>Z</sub>.
  <div>${H.row('I<sub>Z</sub> =',H.num('q4i'),'mA')}${H.row('V<sub>Z</sub> =',H.num('q4v'),'V')}</div></li>
<li class="plq">Load line V<sub>FF</sub> = I<sub>D</sub> × R<sub>S</sub> + V<sub>D</sub> for V<sub>FF</sub> = 10.7 V on the rectifier's i-v curve: find the dc operating point (V<sub>DQ</sub>, I<sub>DQ</sub>) and compare it with your measurement.
  <div>${H.row('V<sub>DQ</sub> =',H.num('q5v'),'V')}${H.row('I<sub>DQ</sub> =',H.num('q5i'),'mA')}
  ${H.row('Comparison:',H.sel('q5c',[['a','The operating point agrees with the measured VD and ID at VFF = 10.7 V'],['b','IDQ = 10.7 mA because the diode drop can be ignored'],['c','The load line never meets the curve']]))}</div></li></ol>`;
return {
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
  /* series loop on a supply unit: RS on one terminal, the diode between RS and the other terminal */
  function loop(){const S=RT.S;for(const u of [0,1]){const P=RT.leadNet(u?'Rp':'Lp'),N=RT.leadNet(u?'Rm':'Lm');if(P==null||N==null||P===N)continue;
      for(const [T1,T2] of [[P,N],[N,P]]){for(const rs of RT.at(T1).filter(p=>p.type==='R1k')){const [a,b]=RT.partNets(rs);const X=a===T1?b:a;if(X===T2)continue;
        const ds=RT.between(X,T2).filter(x=>MOD[x.p.type]);if(ds.length!==1||RT.at(X).length!==2)continue;const d=ds[0];
        /* forward when current from + enters the anode */
        const fwd=T1===P?d.dir===1:d.dir===-1;const U=S.psu.u[u];return {u,U,P,N,X,T1,T2,rs,d:d.p,type:d.p.type,fwd,on:S.psu.pwr&&U.on}}}}
    return null}
  function snap(v,list){return list.find(x=>Math.abs(x-v)<0.006)}
  /* Fig. 2.3 draws two meters: DMM 1 on R_S (V_RS), DMM 2 on the diode (V_D); any meter on the right nodes counts */
  function status(){const S=RT.S,M=RT.meters();const L=loop();const st={L,dcv:M.some(m=>m.D.pwr&&m.D.fn==='DCV'&&m.D.jack==='HI')};
    if(L&&L.on){const b=L.fwd?'F':'R';const v=snap(L.U.v,L.fwd?FWD:REV);
      if(v!=null&&L.U.ilim<=0.0501){const k=key(L.type,b,v);const qd=RT.meterOn(L.X,L.T2),qr=RT.meterOn(L.T1,L.X);
        if(qd)ST[k+'_vd']=qd.val;if(qr)ST[k+'_vrs']=qr.val}}
    if(L&&!L.on&&ST._revAll&&!L.fwd)ST.offA=true;
    const all=(t,b,list)=>list.every(v=>ST[key(t,b,v)+'_vd']!=null&&ST[key(t,b,v)+'_vrs']!=null);
    st.revR=all('D4001','R',REV);st.revZ=all('Z4733','R',REV);if(st.revR&&st.revZ)ST._revAll=true;
    st.fwdR=all('D4001','F',FWD);st.fwdZ=all('Z4733','F',FWD);if(st.fwdR&&st.fwdZ)ST._fwdAll=true;
    if(ST._fwdAll&&(!S.psu.pwr||(L&&!L.on)))ST.offB=true;
    st.has=(t,b,v)=>ST[key(t,b,v)+'_vd']!=null&&ST[key(t,b,v)+'_vrs']!=null;
    return st}
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
    [['D4001','R','Rectifier · reverse',REV],['Z4733','R','Zener · reverse',REV],['D4001','F','Rectifier · forward',FWD],['Z4733','F','Zener · forward',FWD]].forEach(([t,b,lab,list])=>{const bad=[];
      list.forEach(V=>['vd','vrs'].forEach(w=>{const k=key(t,b,V)+'_'+w,e=EXPV[k],x=v(k);if(!(isFinite(x)&&A(A(x)-A(e))<=tol(e,w)))bad.push(`${V} V ${w==='vd'?'VD':'VRS'} ≈ ${e.toFixed(3)}`)}));
      g.add(!bad.length,`Table 2.2 ${lab}`,bad.slice(0,4).join('، ')+(bad.length>4?` … (+${bad.length-4})`:''))});
    g.add(v('q1c')>=0.45&&v('q1c')<=0.7,'PLQ 1 cut-in voltage','≈ 0.5–0.65 V where the current starts to rise');
    const k=x=>key('D4001','F',x);const V1=A(v(k(1.7)+'_vd')),I1=A(v(k(1.7)+'_vrs'))*1e-3,V2=A(v(k(10.7)+'_vd')),I2=A(v(k(10.7)+'_vrs'))*1e-3;
    const n=(V2-V1)/(0.026*Math.log(I2/I1)),Is=I2/Math.exp(V2/(n*0.026))*1e9;
    g.add(G.near(v('q2n'),n,Math.max(0.02,n*0.02)),'PLQ 2 n',`= (VD2 − VD1) / (VT ln(ID2/ID1)) ≈ ${isFinite(n)?n.toFixed(3):'?'} from your table`);
    g.add(isFinite(Is)&&G.near(v('q2is'),Is,Is*0.15),'PLQ 2 IS',`= ID / e^(VD/(n·VT)) ≈ ${isFinite(Is)?Is.toPrecision(3):'?'} nA`);
    const z=x=>key('Z4733','R',x);const Vz15=A(v(z(15)+'_vd')),Iz15=A(v(z(15)+'_vrs')),Vz20=A(v(z(20)+'_vd')),Iz20=A(v(z(20)+'_vrs'));
    const rz=(Vz20-Vz15)/((Iz20-Iz15)*1e-3),vz0=Vz20-Iz20*1e-3*rz;
    g.add(G.near(v('q3r'),rz,Math.max(0.3,rz*0.05)),'PLQ 3 rZ',`= ΔVZ/ΔIZ ≈ ${rz.toFixed(2)} Ω`);g.add(G.near(v('q3v'),vz0,0.01),'PLQ 3 VZ0',`= VZ − IZ·rZ ≈ ${vz0.toFixed(3)} V`);
    const iz=(25-vz0)/(1000+rz)*1e3,vz=vz0+iz*1e-3*rz;g.add(G.near(v('q4i'),iz,0.05),'PLQ 4 IZ',`= (25 − VZ0)/(RS + rZ) ≈ ${iz.toFixed(3)} mA`);g.add(G.near(v('q4v'),vz,0.01),'PLQ 4 VZ',`≈ ${vz.toFixed(3)} V`);
    g.add(G.near(v('q5v'),V2,0.03),'PLQ 5 VDQ',`≈ ${isFinite(V2)?V2.toFixed(3):'?'} V`);g.add(G.near(v('q5i'),(10.7-V2),0.1),'PLQ 5 IDQ',`= (10.7 − VDQ)/1 kΩ ≈ ${(10.7-V2).toFixed(2)} mA`);
    g.add(G.s('q5c')==='a','PLQ 5 comparison');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'board',fig:'labs/ee312/fig/fig2-3.png',figCap:'Fig. 2.3',t:'Procedure A: ركّب Fig. 2.3a بالـ 1N4001 reverse biased (الكاثود جهة R<sub>S</sub> و +).',
        lines:[{t:'R<sub>S</sub> = 1 kΩ: node 14 ↔ node 15',part:['R1k',14,15]},{t:'1N4001: cathode → node 15, anode → node 22',note:'الحلقة جهة R<sub>S</sub>',part:['D4001',22,15],pol:true},
          {t:'DC + (L +) → node 14',note:'الوحدة اليسار',lead:'Lp',at:14},{t:'DC − (L −) → node 22',lead:'Lm',at:22}],ok:s=>s.L&&s.L.type==='D4001'&&!s.L.fwd},
      {dev:'psu',t:'شغّل ∼POWER، واضبط CURRENT على 0.05 A و V<sub>BB</sub> = 25 V، وبعدها حوّل الـ dc على ON.',ok:s=>s.L&&!s.L.fwd&&s.L.on&&Math.abs(s.L.U.v-25)<0.006&&s.L.U.ilim<=0.0501},
      {dev:'board',fig:'labs/ee312/fig/fig2-3.png',figCap:'Fig. 2.3',t:'وصّل الملتيميترين مثل Fig. 2.3 (الاثنين على DCV): DMM 1 يقيس V<sub>RS</sub> و DMM 2 يقيس V<sub>D</sub>. سجّلهم في Table 2.2.',
        lines:[{t:'DMM 1 HI → node 14',note:'V<sub>RS</sub>',lead:'mh',at:14},{t:'DMM 1 COM → node 15',lead:'ml',at:15},{t:'DMM 2 HI → node 22',note:'V<sub>D</sub>',lead:'m2h',at:22},{t:'DMM 2 COM → node 15',lead:'m2l',at:15}],ok:s=>s.has('D4001','R',25)},
      {dev:'board',t:'بدّل الـ 1N4001 بالزينر 1N4733A (نفس الاتجاه)، وسجّل V<sub>D</sub> (DMM 2) و V<sub>RS</sub> (DMM 1).',
        lines:[{t:'1N4733A: cathode → node 15, anode → node 22',note:'الحلقة جهة R<sub>S</sub>',part:['Z4733',22,15],pol:true}],ok:s=>s.has('Z4733','R',25)},
      {dev:'psu',t:'كرّر للقيم الباقية من V<sub>BB</sub> (20، 15، 10، 7، 5، 4، 3 V) للدايودين.',ok:s=>ST._revAll},
      {dev:'psu',t:'طفّ مفتاح الـ dc.',ok:s=>ST.offA||ST._fwdAll},
      {dev:'board',fig:'labs/ee312/fig/fig2-3.png',figCap:'Fig. 2.3',t:'Procedure B: اعكس طرفي الوحدة بس عشان يصير Fig. 2.3b (forward bias). الملتيميترات تبقى مكانها.',
        lines:[{t:'DC + (L +) → node 22',lead:'Lp',at:22},{t:'DC − (L −) → node 14',lead:'Lm',at:14}],ok:s=>s.L&&s.L.fwd},
      {dev:'psu',t:'اضبط V<sub>FF</sub> = 0.3 V بمقابض VOLTAGE، وشغّل الـ dc، وسجّل V<sub>RS</sub> (DMM 1) و V<sub>D</sub> (DMM 2) للـ 1N4001.',ok:s=>s.has('D4001','F',0.3)},
      {dev:'board',t:'بدّل بالزينر وسجّل V<sub>RS</sub> و V<sub>D</sub>.',ok:s=>s.has('Z4733','F',0.3)},
      {dev:'psu',t:'كرّر لباقي قيم V<sub>FF</sub> (0.4 … 20.7 V) للدايودين.',ok:s=>ST._fwdAll},
      {dev:'psu',t:'طفّ الـ dc supply (وفصّل القطع ورتّب طاولتك).',ok:s=>ST.offB}
    ],

    onReset(){ST={};$('result').innerHTML='';$('ivplot').innerHTML=''}};
}};})();
