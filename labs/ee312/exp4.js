/* EE312 · Experiment 4 · Rectifiers and Voltage Regulation (manual v8.8 pp. 28–35).
   Procedure A: center-tapped full-wave rectifier (Fig. 4.2, D1/D2 = 1N4002, RL = 4.7 kΩ), D2 removed through its
   bridging plug, VTC, C = 10 µF then 470 µF, CH2 AC ripple, RL = 270 Ω.
   Procedure B: shunt regulator (Fig. 4.3: RS = 100 Ω, DZ, RL across DZ). Figs 4.4–4.8, Table 4.1, PLQs 1–5.
   Assumptions: the lab transformer gives 6.4 V rms per half (VSM ≈ 9 V); the Zener (not named) is the 1N4733A
   used in Exp 2/3; the instructor inspects the circuit once, before the first plug-in; PLQ 5 uses the table number
   the student enters (TN) and f = 60 Hz as in Appendix H. */
EXP_DEFS['ee312/exp4']=(()=>{const H=ENGINE.sheet;
/* Appendix D rectifier diodes (part, VRRM, IF(avg)) */
const APPD=[['1N4001',50,1],['1N4002',100,1],['1N4003',200,1],['1N4004',400,1],['1S310',50,0.5],['1S311',100,0.5],['ERA3804',400,0.5],['1N5391',50,1.5],['1N5392',100,1.5],['1N5393',200,1.5],['BY296',100,2],['BY297',200,2],['BYV27-50',50,2],['BYV27-100',100,2],['1N5400',50,3],['1N5401',100,3],['1N5402',200,3],['1N4719',50,3],['1N4720',100,3],['1N4721',200,3],['MUR405',50,4],['MUR410',100,4],['MUR420',200,4],['1N3879',50,6],['1N3880',100,6],['1N3881',200,6],['1N3882',300,6],['MUR805',50,8],['MUR810',100,8],['1N1200',100,12],['1N1202',200,12],['1N1204',400,12]];
const t41=`<table class="tbl"><caption>Table 4.1</caption><tr><th>Step</th><th colspan="2">Case</th><th>Output Voltage Ripple V<sub>r(pp)</sub></th></tr>
<tr><td>17</td><td rowspan="3">No Voltage Regulator<br>Procedure A</td><td>C = 470 µF, R<sub>L</sub> = 4.7 kΩ</td><td>${H.num('r1','0.1')} mV</td></tr>
<tr><td>18</td><td>C = 470 µF, R<sub>L</sub> = 270 Ω</td><td>${H.num('r2','0.1')} mV</td></tr>
<tr><td>19</td><td>ΔV<sub>r(pp)</sub> =</td><td>${H.num('r3','0.1')} mV</td></tr>
<tr><td>8</td><td rowspan="3">With Voltage Regulator<br>Procedure B</td><td>C = 470 µF, R<sub>L</sub> = 4.7 kΩ</td><td>${H.num('r4','0.1')} mV</td></tr>
<tr><td>9</td><td>C = 470 µF, R<sub>L</sub> = 270 Ω</td><td>${H.num('r5','0.1')} mV</td></tr>
<tr><td>10</td><td>ΔV<sub>r(pp)</sub> =</td><td>${H.num('r6','0.1')} mV</td></tr></table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A: effect of removing D2? Name of the new circuit?
  <div>${H.sel('q1',[['a','vO keeps only one half-cycle of vS: a half-wave rectifier'],['b','vO becomes a pure dc: a voltage regulator'],['c','vO doubles: a voltage doubler'],['d','No change: still a full-wave rectifier']])}</div></li>
<li class="plq">Procedure A: how does V<sub>r(pp)</sub> change if (i) C is increased, (ii) R<sub>L</sub> is reduced?
  <div>${H.row('(i)',H.sel('q2a',[['dec','decreases'],['inc','increases'],['same','does not change']]))}${H.row('(ii)',H.sel('q2b',[['dec','decreases'],['inc','increases'],['same','does not change']]))}</div></li>
<li class="plq">Procedure B: the regulator's ability to reduce the ripple for R<sub>L</sub> = 270 Ω compared with the unregulated case?
  <div>${H.sel('q3',[['a','The regulated ripple is a small fraction of the unregulated one: the Zener absorbs most of the ripple (rZ ≪ RS)'],['b','The regulator increases the ripple'],['c','The ripple is the same with and without the regulator']])}</div></li>
<li class="plq">Procedure B: the regulator's ability to reduce the change in ripple when R<sub>L</sub> varies?
  <div>${H.sel('q4',[['a','ΔVr(pp) with the regulator is much smaller than without it: the output ripple hardly depends on RL'],['b','ΔVr(pp) is larger with the regulator'],['c','Both changes are equal']])}</div></li>
<li class="plq">Design (Appendix H.2) a supply for a dc load I<sub>L</sub> = 20·TN mA (TN = your table number); transformer V<sub>S</sub> = 15 V (rms) per half.
  <div>${H.row('Your table number TN =',H.num('q5tn','1',60))}${H.row('a. V<sub>SM</sub> =',H.num('q5a','0.01'),'V')}${H.row('b. C (V<sub>r(pp)</sub> = 0.075 V<sub>SM</sub>) =',H.num('q5b','0.1'),'µF')}
  ${H.row('c. V<sub>RRM</sub> ≅ 4 V<sub>S(rms)</sub> =',H.num('q5c','0.1'),'V')}${H.row('d. I<sub>F(avg)</sub> = 1.5 i<sub>Dav</sub> =',H.num('q5d','0.001'),'A')}
  ${H.row('e. Diode from Appendix D:',H.sel('q5e',APPD.map(([p,v,i])=>[p,`${p} · ${v} V ${i} A`])))}</div></li></ol>`;
return {
sheet:`<div class="paper" id="paper">
<h2>Experiment 4 · Rectifiers and Voltage Regulation</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig4-2.png" alt="Fig. 4.2"></div>
<div class="hint" style="text-align:center">Fig. 4.2 · D1, D2 = 1N4002 · R<sub>L</sub> = 4.7 kΩ (then 270 Ω) · C = 10 µF then 470 µF</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig4-3.png" alt="Fig. 4.3"></div>
<div class="hint" style="text-align:center">Fig. 4.3 · Simple regulated supply: R<sub>S</sub> = 100 Ω, D<sub>Z</sub> = 1N4733A, R<sub>L</sub> across D<sub>Z</sub></div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">⚠️ لا توصّل المحوّل بالكهرباء قبل ما يشيك المعيد على الدائرة. صوّر الشاشات في مكانها، وسجّل الـ ripple من قياس Pk-Pk لـ CH2 (AC).</p>
${H.cap('f44','Fig. 4.4')}${H.cap('f45','Fig. 4.5')}${H.cap('f46','Fig. 4.6')}${H.cap('f47','Fig. 4.7')}${H.cap('f48','Fig. 4.8')}
${t41}${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'xf'},
  {type:'scope',probes:2,prev:sc=>{sc.ch[0].cpl='AC';sc.ch[0].vd=0.5;sc.ch[1].on=true;sc.ch[1].vd=0.2;sc.ch[1].pos=-2;sc.ch[1].inv=true;sc.td=2e-4;sc.meas=[{src:0,src2:1,type:'Max'}];sc.disp.vec=false;sc.trig.src=1;sc.trig.level=3}}],
parts:{R47:{t:'R',r:4700,lab:'4.7kΩ'},R270:{t:'R',r:270,lab:'270Ω'},R100:{t:'R',r:100,lab:'100Ω'},D:{t:'D',lab:'1N4002'},Z:{t:'Z',lab:'1N4733A'},C10:{t:'C',c:10e-6,lab:'10µF'},C470:{t:'C',c:470e-6,lab:'470µF'},BR:{t:'BR',lab:''}},
tray:[['D','1N4002'],['C470','470 µF'],['C10','10 µF'],['R47','4.7 kΩ'],['R270','270 Ω'],['R100','100 Ω'],['Z','1N4733A'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,NS=SOLVER.NS;
  /* reference configurations; nets: 0 A, 1 C, 2 K (cathodes), 3 regulated node; -1 = B (center tap, ground) */
  function refCk(cfg){const els=[{t:'XS',a:0,b:-1,s:1,vp:9,f:60,r:1.5},{t:'XS',a:1,b:-1,s:-1,vp:9,f:60,r:1.5}];
    if(cfg.d1)els.push({t:'D',a:0,b:2,f:SOLVER.diodeSi});if(cfg.d2)els.push({t:'D',a:1,b:2,f:SOLVER.diodeSi});
    if(cfg.c)els.push({t:'C',a:2,b:-1,c:cfg.c});
    if(cfg.reg){els.push({t:'G',a:2,b:3,g:1/100},{t:'D',a:-1,b:3,f:SOLVER.zener},{t:'G',a:3,b:-1,g:1/cfg.rl})}else els.push({t:'G',a:2,b:-1,g:1/cfg.rl});
    els.push({t:'G',a:0,b:-1,g:1e-6},{t:'G',a:cfg.reg?3:2,b:-1,g:1e-6});return {n:4,els,p1:0,p2:cfg.reg?3:2,dcs:[]}}
  const CFG={fw:{d1:1,d2:1,rl:4700},hw1:{d1:1,rl:4700},hw2:{d2:1,rl:4700},c10:{d1:1,d2:1,c:10e-6,rl:4700},c10b:{d1:1,d2:1,c:10e-6,rl:270},c470:{d1:1,d2:1,c:470e-6,rl:4700},c470b:{d1:1,d2:1,c:470e-6,rl:270},reg47:{d1:1,d2:1,c:470e-6,rl:4700,reg:1},reg270:{d1:1,d2:1,c:470e-6,rl:270,reg:1}};
  let REFS=null;const refs=()=>{if(!REFS){REFS={};for(const k in CFG)REFS[k]=SOLVER.simulate(refCk(CFG[k]),60,6)}return REFS};
  const ripple=r=>{let mx=-1e9,mn=1e9;for(let k=0;k<NS;k++){mx=Math.max(mx,r.v2[k]);mn=Math.min(mn,r.v2[k])}return (mx-mn)*1000};
  const match=(sim,ref,tol)=>{if(!sim||!sim.v2||!sim.has2)return false;let mx=0;for(let k=0;k<NS;k++)mx=Math.max(mx,Math.abs(sim.v2[k]-ref.v2[k]));return mx<tol};
  function whichCfg(){const TB=RT.TB;if(!TB||TB.kind!=='tran'||!RT.S.xf.plugged)return null;const R=refs();
    for(const k of Object.keys(CFG)){const tol=k[0]==='c'||k[0]==='r'?0.06:0.2;if(match(TB,R[k],tol))return k}return null}
  const ch1OK=cfg=>{const TB=RT.TB;if(!TB||TB.kind!=='tran'||!TB.has1||!RT.S.xf.plugged)return false;let mx=0;const R=refs()[cfg||'fw'];for(let k=0;k<NS;k++)mx=Math.max(mx,Math.abs(TB.v1[k]-R.v1[k]));return mx<0.3};
  let ST={};
  function status(){const S=RT.S,sc=S.sc;const sg=[RT.dsig(0),RT.dsig(1)];const cfg=whichCfg();
    if(sc.msg==='Default Setup')ST.def=true;if((sc.msg==='Autoset'||sc.msg==='No signal')&&ST.def)ST.auto=true;
    const fitC=(c,span=0.4)=>{const ch=sc.ch[c];const t=sg[c].max/ch.vd+ch.pos,b=sg[c].min/ch.vd+ch.pos;return t<=4.05&&b>=-4.05&&(t-b)>=span};
    const cyc=10*sc.td*60;const fit=sc.pwr&&(sc.xy?(()=>{const c1=sc.ch[0];const l=sg[0].min/c1.vd+c1.pos,r=sg[0].max/c1.vd+c1.pos;return l>=-5.05&&r<=5.05&&(r-l)>=1&&fitC(1,0)})():fitC(0)&&fitC(1,0)&&cyc>=1&&cyc<=10);
    const vds=[sc.ch[0].vd,sc.ch[1].vd];
    const st={cfg,ch1:ch1OK(cfg),gnd:S.leads.c1b.node!=null&&S.leads.c2b.node!=null,plug:S.xf.plugged,xfok:S.xf.ok||S.xf.once,pwr:sc.pwr,ch:sc.ch[0].on&&sc.ch[1].on,probe:sc.ch.every(c=>c.probe===1&&!c.inv),
      cpl1:sc.ch[0].cpl,cpl2:sc.ch[1].cpl,xy:sc.xy,fit,pos0:sc.ch[0].pos===0&&sc.ch[1].pos===0,v5:vds[0]===5&&vds[1]===5,cyc:cyc>=1&&cyc<=10,
      meas:sc.meas.some(m=>m.src===0&&['Pk-Pk','Max'].includes(m.type))&&sc.meas.some(m=>m.src===1&&['Pk-Pk','Max'].includes(m.type))};
    if(ST.c44&&(cfg==='hw1'||cfg==='hw2'))ST.hw=true;
    if(cfg==='fw'&&sc.xy&&st.pos0)ST.xy=true;if(ST.xy&&!sc.xy)ST.yt=true;
    if(cfg==='c470'&&st.cpl2==='AC'&&sc.msg==='Autoset')ST.acA=true;if(ST.acA&&cfg==='c470b'&&st.cpl2==='AC')ST.r270=true;
    if(ST.r270&&!S.xf.plugged)ST.unplugA=true;
    if(ST.unplugA&&cfg==='reg47'&&st.cpl2==='DC'&&sc.msg==='Autoset')ST.dcB=true;
    if(ST.c48&&cfg==='reg47'&&st.cpl2==='AC'&&sc.msg==='Autoset')ST.acB=true;if(ST.acB&&cfg==='reg270'&&st.cpl2==='AC')ST.reg270=true;
    if(ST.reg270&&!S.xf.plugged&&!sc.pwr)ST.end=true;
    st.ST=ST;return st}
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();ST['c'+id.slice(1)]=true;BENCH.onRender()}));
  const capOK=(id,cfgs,xy,v5,cpl2='DC')=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];if(!c.plug)pr.push('المحوّل مو موصول');
    if(!cfgs.includes(c.cfg))pr.push('الدائرة مو المطلوبة لهالشكل');if(!c.ch1)pr.push('CH1 لازم على vS (طرف A)');if(!c.gnd)pr.push('الأرضي ناقص');if(!c.ch)pr.push('لازم القناتين شغالة');
    if(!c.probe)pr.push('Probe 1X و Invert OFF');if(c.cpl1!=='DC'||c.cpl2!==cpl2)pr.push(`Coupling: CH1 DC و CH2 ${cpl2}`);if(c.xy!==xy)pr.push(xy?'لازم XY':'لازم YT');if(v5&&!c.v5)pr.push('SCALE 5 V/div للقناتين');if(!c.fit)pr.push('الموجة مو واضحة/طالعة برا الشاشة');
    return [!pr.length,pr.join('، ')]};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const R=refs();
    [['f44',['fw'],false,true,'Fig. 4.4 full-wave'],['f45',['fw'],true,true,'Fig. 4.5 VTC'],['f46',['c10'],false,true,'Fig. 4.6 C = 10 µF'],['f47',['c470'],false,true,'Fig. 4.7 C = 470 µF'],['f48',['reg47'],false,false,'Fig. 4.8 regulator']].forEach(([id,c,xy,v5,t])=>{const [ok,w]=capOK(id,c,xy,v5);g.add(ok,t,w)});
    const rr={r1:ripple(R.c470),r2:ripple(R.c470b),r4:ripple(R.reg47),r5:ripple(R.reg270)};rr.r3=rr.r2-rr.r1;rr.r6=rr.r5-rr.r4;
    [['r1','Vr(pp) 470 µF, 4.7 kΩ'],['r2','Vr(pp) 470 µF, 270 Ω'],['r4','Vr(pp) regulator, 4.7 kΩ'],['r5','Vr(pp) regulator, 270 Ω']].forEach(([id,t])=>g.add(G.near(v(id),rr[id],Math.max(0.6,rr[id]*0.06)),t,`≈ ${rr[id].toFixed(1)} mV`));
    g.add(G.near(v('r3'),v('r2')-v('r1'),0.15),'ΔVr(pp) A','= Vr(270 Ω) − Vr(4.7 kΩ)');g.add(G.near(v('r6'),v('r5')-v('r4'),0.15),'ΔVr(pp) B','= Vr(270 Ω) − Vr(4.7 kΩ)');
    g.add(G.s('q1')==='a','PLQ 1','half-wave rectifier');g.add(G.s('q2a')==='dec'&&G.s('q2b')==='inc','PLQ 2','bigger C → less ripple; smaller RL → more ripple');
    g.add(G.s('q3')==='a','PLQ 3');g.add(G.s('q4')==='a','PLQ 4');
    const tn=v('q5tn'),IL=0.02*tn,VSM=15*Math.SQRT2,Vr=0.075*VSM,C=IL/(120*Vr)*1e6,iD=IL*(1+Math.PI*Math.sqrt(VSM/(2*Vr))),IF=1.5*iD,VRRM=60;
    g.add(tn>=1&&tn<=10&&Number.isInteger(tn),'PLQ 5 TN','your table number (1–10)');
    g.add(G.near(v('q5a'),VSM,0.02),'PLQ 5a VSM','= √2 × 15 ≈ 21.21 V');g.add(G.near(v('q5b'),C,C*0.02),'PLQ 5b C',`= IL / (120 · 0.075 VSM) ≈ ${C.toFixed(1)} µF`);
    g.add(G.near(v('q5c'),VRRM,0.5),'PLQ 5c VRRM','≅ 4 · VS(rms) = 60 V');g.add(G.near(v('q5d'),IF,IF*0.02),'PLQ 5d IF(avg)',`= 1.5 · IL(1 + π√(VSM/2Vr)) ≈ ${IF.toFixed(3)} A`);
    const okParts=APPD.filter(([p,vr,i])=>vr>=VRRM&&i>=IF);const minI=Math.min(...okParts.map(x=>x[2]));const best=okParts.filter(x=>x[2]===minI);const minV=Math.min(...best.map(x=>x[1]));
    g.add(best.filter(x=>x[1]===minV).some(x=>x[0]===G.s('q5e')),'PLQ 5e diode',`ratings just above ${VRRM} V / ${IF.toFixed(2)} A: ${best.filter(x=>x[1]===minV).map(x=>x[0]).join(' or ')}`);
    g.show($('result'))});
  return {status:()=>status(),
    steps:[
      {dev:'board',t:'Procedure A: ركّب Fig. 4.2 بدون مكثف و R<sub>L</sub> = 4.7 kΩ: أطراف المحوّل A و B (center tap = الأرضي) و C على اللوحة، D1 و D2 (1N4002) — خلّ D2 يوصل للطرف C عن طريق bridging plug. وصّل CH1 على A و CH2 على v<sub>O</sub>، والأرضيات على B. بعدها اضغط Ask instructor to check في المحوّل.',ok:s=>s.xfok},
      {dev:'scope',t:'شغّل الإسكوب، واضغط Default وبعدها Autoset.',ok:s=>s.pwr&&ST.auto},
      {dev:'xf',t:'وصّل المحوّل بالكهرباء (Plug in).',ok:s=>s.plug&&s.cfg==='fw'&&s.ch1&&s.gnd},
      {dev:'scope',t:'شغّل CH2 لو مو شغّال، واضغط POSITION للقناتين عشان الصفر على خط الوسط.',ok:s=>s.ch&&s.pos0&&s.plug},
      {dev:'scope',t:'خلّ SCALE للقناتين 5 V/div، والـ time/div على عدد مناسب من الدورات.',ok:s=>s.v5&&s.cyc&&s.plug},
      {dev:'scope',t:'Measure ← Add Measurement ← V/I: أضف Pk-Pk أو Max لـ CH1، وبعدها Source1 = CH2 وأضف Pk-Pk أو Max. وبعدها Menu Off مرتين.',ok:s=>s.meas},
      {dev:'scope',t:'صوّر v<sub>S</sub>(t) و v<sub>O</sub>(t) في Fig. 4.4.',ok:s=>!!CAPS.f44},
      {dev:'board',t:'شيل الـ bridging plug اللي بين D2 والمحوّل ولاحظ v<sub>O</sub>، وبعدها رجّعه.',ok:s=>ST.hw&&s.cfg==='fw'},
      {dev:'scope',t:'Acquire ← XY ← Triggered XY، واضغط POSITION للقناتين، وصوّر الـ VTC في Fig. 4.5.',ok:s=>!!CAPS.f45},
      {dev:'scope',t:'طفّ الـ XY: OFF (YT).',ok:s=>ST.yt},
      {dev:'board',t:'حط مكثف 10 µF بالتوازي مع R<sub>L</sub> (السالب على الأرضي)، وصوّر في Fig. 4.6.',ok:s=>!!CAPS.f46},
      {dev:'board',t:'بدّله بمكثف 470 µF، وصوّر في Fig. 4.7.',ok:s=>!!CAPS.f47},
      {dev:'scope',t:'اضغط CH2 وغيّر Coupling (أول زر تحت) إلى AC، واضغط Autoset. سجّل V<sub>r(pp)</sub> في Table 4.1.',ok:s=>ST.acA},
      {dev:'board',t:'بدّل الـ 4.7 kΩ بـ 270 Ω وسجّل V<sub>r(pp)</sub>، وبعدها احسب ΔV<sub>r(pp)</sub>.',ok:s=>ST.r270},
      {dev:'xf',t:'Procedure B: افصل المحوّل من الكهرباء.',ok:s=>ST.unplugA},
      {dev:'board',t:'أضف المنظّم (Fig. 4.3): R<sub>S</sub> = 100 Ω والزينر، وانقل R<sub>L</sub> (4.7 kΩ) بالتوازي مع D<sub>Z</sub>، وانقل CH2 على R<sub>L</sub>. وصّل المحوّل من جديد، وخلّ CH2 على DC واضغط Autoset.',ok:s=>ST.dcB},
      {dev:'scope',t:'صوّر v<sub>S</sub>(t) و v<sub>O</sub>(t) في Fig. 4.8.',ok:s=>!!CAPS.f48},
      {dev:'scope',t:'خلّ CH2 على AC واضغط Autoset، وسجّل V<sub>r(pp)</sub>.',ok:s=>ST.acB},
      {dev:'board',t:'بدّل R<sub>L</sub> بـ 270 Ω وسجّل V<sub>r(pp)</sub>، واحسب ΔV<sub>r(pp)</sub> وقارنه بـ Procedure A.',ok:s=>ST.reg270},
      {dev:'xf',t:'افصل المحوّل، وطفّ الإسكوب.',ok:s=>ST.end}
    ],
    onReset(){ST={};['f44','f45','f46','f47','f48'].forEach(id=>{$(id).textContent=id.replace(/f4(\d)/,'Fig. 4.$1');delete CAPS[id]});$('result').innerHTML=''}};
}};})();
