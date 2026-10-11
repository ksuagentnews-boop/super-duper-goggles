/* EE312 · Experiment 10 · The Common Emitter Amplifier (manual v8.8 pp. 73–78).
   Procedure A: measure RC, RE, R1, R2 with the DMM (Ω), build Fig. 10.1 (VCC = 12 V, R1 = 47 kΩ, R2 = 27 kΩ,
   RC = 5.6 kΩ, RE = 4.7 kΩ, BD137), measure VBE, VBC, VCE, VR1, VR2, VRC, VRE (Fig. 10.3), Table 10.1.
   Procedure B: Fig. 10.2 (C1 = C2 = 2.2 µF, CE = 470 µF), 1 kHz sine 20 mVpp then 200 mVpp, Pk-Pk on CH1/CH2,
   Figs 10.4 / 10.5, phase, Av. PLQs 1–4 (5–6 are LTspice work for the report).
   Assumptions: resistors are at their nominal values (the DMM reads them exactly); the transient starts from the
   dc operating point (the supply has been on for a while); the electrolytics' + sides go to the base, the collector
   and the emitter (their dc potentials); a reversed electrolytic with more than 1 V across it bursts. */
EXP_DEFS['ee312/exp10']=(()=>{const H=ENGINE.sheet;
const t101=`<table class="tbl"><caption>Table 10.1</caption>
<tr><th>R<sub>C</sub></th><td>${H.num('t_rc','0.001',80)} kΩ</td><th>R<sub>E</sub></th><td>${H.num('t_re','0.001',80)} kΩ</td><th>R<sub>1</sub></th><td>${H.num('t_r1','0.001',80)} kΩ</td><th>R<sub>2</sub></th><td>${H.num('t_r2','0.001',80)} kΩ</td></tr>
<tr><th>I<sub>C</sub></th><td>${H.num('t_ic','0.0001',80)} mA</td><th>I<sub>E</sub></th><td>${H.num('t_ie','0.0001',80)} mA</td><th>I<sub>R1</sub></th><td>${H.num('t_i1','0.0001',80)} mA</td><th>I<sub>R2</sub></th><td>${H.num('t_i2','0.0001',80)} mA</td></tr>
<tr><th>I<sub>B</sub></th><td colspan="3">${H.num('t_ib','0.0001',80)} mA</td><th>β ≡ I<sub>C</sub>/I<sub>B</sub></th><td>${H.num('t_beta','0.1',80)}</td><th>α ≡ β/(β+1)</th><td>${H.num('t_alpha','0.0001',80)}</td></tr>
<tr><th colspan="2">A<sub>v</sub> = −I<sub>C</sub>R<sub>C</sub>/V<sub>T</sub> =</th><td colspan="2">${H.num('t_avt','0.1',80)}</td><th colspan="2">A<sub>v</sub> = V<sub>o(pp)</sub>/V<sub>i(pp)</sub> =</th><td colspan="2">${H.num('t_avm','0.1',80)}</td></tr>
<tr><td colspan="8">Verify that (V<sub>BE</sub> ≥ 0.5) and (V<sub>BC</sub> &lt; 0.4) (active mode): ${H.sel('t_act',[['y','Yes: VBE ≥ 0.5 V and VBC < 0.4 V → active mode'],['n','No: the BJT is saturated'],['c','No: the BJT is cut off']])}</td></tr></table>`;
const f103=`<table class="tbl"><caption>Fig. 10.3 · measured dc voltages</caption><tr>${['V<sub>BE</sub>','V<sub>BC</sub>','V<sub>CE</sub>','V<sub>R1</sub>','V<sub>R2</sub>','V<sub>RC</sub>','V<sub>RE</sub>'].map(x=>`<th>${x}</th>`).join('')}</tr>
<tr>${['be','bc','ce','r1','r2','rc','re'].map(k=>`<td>${H.num('v_'+k,'0.001',72)}</td>`).join('')}</tr></table>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Complete all the calculations in Table 10.1 (graded with the table).</li>
<li class="plq">Verify from Fig. 10.3:
  <div>${H.row('i. V<sub>R1</sub> + V<sub>R2</sub> =',H.num('q2a','0.001'),'V')}${H.row('ii. V<sub>RC</sub> + V<sub>CE</sub> + V<sub>RE</sub> =',H.num('q2b','0.001'),'V')}${H.row('iii. V<sub>BE</sub> − V<sub>BC</sub> =',H.num('q2c','0.001'),'V (= V<sub>CE</sub>)')}</div></li>
<li class="plq">Effect of increasing the input amplitude (200 mVpp) on v<sub>O</sub>(t); is the BJT linear?
  <div>${H.sel('q3',[['a','vO is distorted (unequal half-cycles, flattened near cutoff / saturation): the small-signal condition vbe ≪ VT is violated, so the BJT is not linear'],['b','vO is a larger undistorted sine: the BJT stays linear'],['c','vO becomes zero'],['d','Only the phase changes']])}</div></li>
<li class="plq">Bias design (Appendix H.5, Fig. 10.6a: V<sub>CC</sub> = 15 V, V<sub>BE(on)</sub> = 0.7 V) for I<sub>E</sub> = TN mA, E96 resistors:
  <div>${H.row('Your table number TN =',H.num('q4tn','1',60))}${H.row('R<sub>E</sub> =',H.num('q4re','1'),'Ω')}${H.row('R<sub>C</sub> =',H.num('q4rc','1'),'Ω')}${H.row('I<sub>R2</sub> (0.1 I<sub>E</sub> … 0.3 I<sub>E</sub>) =',H.num('q4i2','0.001'),'mA')}${H.row('R<sub>2</sub> =',H.num('q4r2','1'),'Ω')}${H.row('R<sub>1</sub> =',H.num('q4r1','1'),'Ω')}</div></li>
<li class="plq">PLQs 5–6 (LTspice .op and .tran of your design with a 2N2222) go in your report.</li></ol>`;
const E96=[100,102,105,107,110,113,115,118,121,124,127,130,133,137,140,143,147,150,154,158,162,165,169,174,178,182,187,191,196,200,205,210,215,221,226,232,237,243,249,255,261,267,274,280,287,294,301,309,316,324,332,340,348,357,365,374,383,392,402,412,422,432,442,453,464,475,487,499,511,523,536,549,562,576,590,604,619,634,649,665,681,698,715,732,750,768,787,806,825,845,866,887,909,931,953,976];
const nearE96=x=>{const e=Math.floor(Math.log10(x))-2;let best=null;[e-1,e,e+1].forEach(k=>E96.forEach(m=>{const v=m*Math.pow(10,k);if(best==null||Math.abs(Math.log(v/x))<Math.abs(Math.log(best/x)))best=v}));return best};
return {
sheet:`<div class="paper" id="paper">
<h2>Experiment 10 · The Common Emitter Amplifier</h2>
<div style="display:flex;gap:8px;flex-wrap:wrap"><div class="figbox" style="padding:8px;flex:1;min-width:200px"><img class="figimg" src="labs/ee312/fig/fig10-1.png" alt="Fig. 10.1"></div><div class="figbox" style="padding:8px;flex:1;min-width:200px"><img class="figimg" src="labs/ee312/fig/fig10-2.png" alt="Fig. 10.2"></div></div>
<div class="hint" style="text-align:center">Fig. 10.1 dc circuit · Fig. 10.2 complete amplifier: V<sub>CC</sub> = 12 V, R<sub>1</sub> = 47 kΩ, R<sub>2</sub> = 27 kΩ, R<sub>C</sub> = 5.6 kΩ, R<sub>E</sub> = 4.7 kΩ, C<sub>1</sub> = C<sub>2</sub> = 2.2 µF, C<sub>E</sub> = 470 µF · BD137 legs E C B</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">قِس كل مقاومة بالـ DMM (Ω) وهي لحالها قبل التركيب. انتبه لقطبية المكثفات الكيميائية: الطرف + جهة الـ base والـ collector والـ emitter.</p>
${f103}${t101}
${H.cap('f104','Fig. 10.4')}${H.row('Phase difference between v<sub>i</sub> and v<sub>o</sub>:',H.sel('ph',[['180','180° (inverting)'],['0','0°'],['90','90°']]))}
${H.cap('f105','Fig. 10.5')}
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'gen',prev:{wave:'Square',freq:0.2,amp:5,off:2.5}},
  {type:'psu',prev:d=>{d.u[0].v=5;d.u[0].ilim=0.1;d.u[1].v=1.2;d.u[1].ilim=0.5}},
  {type:'scope',probes:2,prev:sc=>{sc.ch[0].vd=0.5;sc.ch[1].on=true;sc.ch[1].vd=0.2;sc.ch[1].cpl='AC';sc.td=0.5}},
  {type:'dmm',prev:d=>{d.fn='DCV'}}],
parts:{BD137:{t:'BJT',pkg:'TO126',mark:'BD137',lab:'BD137',pins:[{n:'E',dx:0,dy:0,h:1,role:'e'},{n:'C',dx:1,dy:0,h:1,role:'c'},{n:'B',dx:2,dy:0,h:1,role:'b'}],
    stamp:(els,R,inner,p)=>{els.push({t:'BJT',c:R.c,b:R.b,e:R.e,m:SOLVER.MODELS.bd137,pid:p.id})}},
  R47k:{t:'R',r:47e3,lab:'47kΩ'},R27k:{t:'R',r:27e3,lab:'27kΩ'},R5k6:{t:'R',r:5600,lab:'5.6kΩ'},R4k7:{t:'R',r:4700,lab:'4.7kΩ'},
  C2u2:{t:'C',c:2.2e-6,lab:'2.2µF'},C470:{t:'C',c:470e-6,lab:'470µF'},BR:{t:'BR',lab:''}},
tray:[['BD137','BD137'],['R47k','47 kΩ'],['R27k','27 kΩ'],['R5k6','5.6 kΩ'],['R4k7','4.7 kΩ'],['C2u2','2.2 µF'],['C470','470 µF'],['BR','Bridging plug'],['W','Wire']],
cycles:6,
decorate(RT){const TB=RT.TB;if(!TB||!TB.capMin)return;let boom=false;
  /* a terminal tied to nothing else has no defined potential: such a capacitor never charges */
  const leadOn=net=>['Lp','Lm','Rp','Rm','gr','c1r','c2r','mh','ml'].some(k=>RT.leadNet(k)===net);const tied=net=>net===-1||RT.at(net).length>1||leadOn(net);
  RT.S.parts.forEach(p=>{if(RT.PARTS[p.type].t==='C'&&!p.dead&&TB.capMin[p.id]!=null&&TB.capMin[p.id]<-1&&RT.partNets(p).every(tied)){p.dead=true;boom=true}});
  if(boom){BENCH.say('💥 مكثف كيميائي انفجر لأنه معكوس! طفّ المصدر وبدّله بالاتجاه الصحيح (+ جهة الجهد الأعلى).');RT.dirty=true;RT.recompute()}},
setup(RT){
  const G=ENGINE.sheet,A=Math.abs;const RS=['R5k6','R4k7','R47k','R27k'];
  const has=(t,a,b)=>a!=null&&b!=null&&RT.between(a,b).some(x=>x.p.type===t);
  const cap=(t,pos,neg)=>pos!=null&&neg!=null&&RT.between(pos,neg).some(x=>x.p.type===t&&x.dir===1&&!x.p.dead);
  function circuit(){const q=RT.parts('BJT');if(q.length!==1)return null;const n={c:RT.pinNet(q[0],'c'),b:RT.pinNet(q[0],'b'),e:RT.pinNet(q[0],'e')};if([n.c,n.b,n.e].some(x=>x==null))return null;
    for(const u of [0,1]){const P=RT.leadNet(u?'Rp':'Lp'),N=RT.leadNet(u?'Rm':'Lm');if(P==null||N==null||P===N)continue;
      if(!(has('R47k',P,n.b)&&has('R27k',n.b,N)&&has('R5k6',P,n.c)&&has('R4k7',n.e,N)))continue;
      const U=RT.S.psu.u[u],c={n,P,N,u,on:RT.S.psu.pwr&&U.on&&A(U.v-12)<0.006,kind:'DC'};
      const X=RT.leadNet('gr');const out=RT.parts('C2u2').filter(p=>!p.dead).map(p=>RT.partNets(p)).find(([a,b])=>a===n.c&&b!=null&&b>=0&&b!==n.c);const Y=out&&out[1];
      if(N===-1&&cap('C470',n.e,N)&&X!=null&&X>=0&&cap('C2u2',n.b,X)&&Y!=null&&RT.at(Y).length===1){c.kind='AC';c.X=X;c.Y=Y}
      return c}
    return null}
  const ST={r:{},v:{}};
  function status(){const S=RT.S,D=S.dmm,g=S.gen,sc=S.sc,r=RT.dmm()||{};const c=circuit();const st={kind:c&&c.kind,c,on:!!(c&&c.on)};
    const ok=D.pwr&&D.jack==='HI'&&r.val!=null&&!r.ol;const hi=RT.leadNet('mh'),lo=RT.leadNet('ml');const across=(a,b)=>a!=null&&b!=null&&((hi===a&&lo===b)||(hi===b&&lo===a));
    /* resistor measured alone (nothing else on its two nodes) */
    if(ok&&D.fn==='OHM'&&hi!=null&&lo!=null&&hi!==lo){const b=RT.between(hi,lo);if(b.length===1&&RS.includes(b[0].p.type)&&RT.at(hi).length===1&&RT.at(lo).length===1)ST.r[b[0].p.type]=r.val}
    if(ok&&D.fn==='DCV'&&c&&c.kind==='DC'&&c.on){const n=c.n,v=A(r.val);
      if(across(n.b,n.e))ST.v.be=v;if(hi===n.b&&lo===n.c)ST.v.bc=r.val;if(hi===n.c&&lo===n.b)ST.v.bc=-r.val;if(across(n.c,n.e))ST.v.ce=v;
      if(across(c.P,n.b))ST.v.r1=v;if(across(n.b,c.N))ST.v.r2=v;if(across(c.P,n.c))ST.v.rc=v;if(across(n.e,c.N))ST.v.re=v}
    st.rAll=RS.every(t=>ST.r[t]!=null);st.vAll=['be','bc','ce','r1','r2','rc','re'].every(k=>ST.v[k]!=null);
    if(sc.msg==='Default Setup')ST.def=true;if((sc.msg==='Autoset'||sc.msg==='No signal')&&ST.def)ST.auto=true;
    st.sig=g.pwr&&g.out&&g.wave==='Sine'&&A(g.freq-1000)<0.01&&A(g.off)<5e-4;st.amp=g.amp;
    st.probes=!!(c&&c.kind==='AC'&&RT.leadNet('c1r')===c.X&&RT.leadNet('c2r')===c.Y&&RT.leadNet('c1b')===-1&&RT.leadNet('c2b')===-1);
    st.chs=sc.pwr&&sc.ch[0].on&&sc.ch[1].on;st.meas=[0,1].every(k=>sc.meas.some(m=>m.src===k&&m.type==='Pk-Pk'));
    const sg=[RT.dsig(0),RT.dsig(1)];st.pp=[sg[0].max-sg[0].min,sg[1].max-sg[1].min];
    const fitC=k=>{const ch=sc.ch[k];const t=sg[k].max/ch.vd+ch.pos,b=sg[k].min/ch.vd+ch.pos;return t<=4.3&&b>=-4.3&&(t-b)>=1};const cyc=10*sc.td*g.freq;
    st.fit=sc.pwr&&!sc.xy&&cyc>=1&&cyc<=10&&fitC(0)&&fitC(1);st.probe1=sc.ch.slice(0,2).every(ch=>ch.probe===1&&!ch.inv);
    if(ST.c105&&!(g.pwr&&g.out)&&!(S.psu.pwr&&S.psu.u.some(u=>u.on)))ST.end=true;
    return st}
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();ST['c'+id.slice(1)]=true;BENCH.onRender()}));
  const capOK=(id,amp)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];if(c.kind!=='AC'||!c.on)pr.push('الدائرة لازم Fig. 10.2 و VCC = 12 V شغّال');if(!c.sig||A(c.amp-amp)>5e-4)pr.push(`الجنريتر: Sine، 1 kHz، ${amp*1000} mVpp`);
    if(!c.probes)pr.push('CH1 على v<sub>i</sub> و CH2 على v<sub>o</sub>');if(!c.chs||!c.fit||!c.probe1)pr.push('الموجتين لازم تبان واضحة على الشاشة');return [!pr.length,pr.join('، ')]};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const tl=(e,f=0.003)=>Math.max(0.002,A(e)*f);
    const rk={t_rc:'R5k6',t_re:'R4k7',t_r1:'R47k',t_r2:'R27k'};g.add(Object.entries(rk).every(([id,t])=>ST.r[t]!=null&&G.near(v(id),ST.r[t]/1e3,tl(ST.r[t]/1e3,0.002))),'Table 10.1 resistors (DMM)',Object.entries(rk).map(([id,t])=>`${t}: ${ST.r[t]!=null?(ST.r[t]/1e3).toFixed(3)+' kΩ':'ما انقاس'}`).join('، '));
    const vk=['be','bc','ce','r1','r2','rc','re'];g.add(vk.every(k=>ST.v[k]!=null&&G.near(v('v_'+k),ST.v[k],tl(ST.v[k]))),'Fig. 10.3 dc voltages',vk.map(k=>`V${k.toUpperCase()} ≈ ${ST.v[k]!=null?ST.v[k].toFixed(3):'?'}`).join('، '));
    const ic=v('v_rc')/v('t_rc'),ie=v('v_re')/v('t_re'),i1=v('v_r1')/v('t_r1'),i2=v('v_r2')/v('t_r2'),ib=v('t_i1')-v('t_i2');
    g.add(G.near(v('t_ic'),ic,tl(ic))&&G.near(v('t_ie'),ie,tl(ie))&&G.near(v('t_i1'),i1,tl(i1))&&G.near(v('t_i2'),i2,tl(i2)),'Table 10.1 IC, IE, IR1, IR2','Ohm’s law with your measured R and V');
    g.add(G.near(v('t_ib'),ib,Math.max(0.0002,A(ib)*0.01)),'Table 10.1 IB','= IR1 − IR2 (KCL)');
    const beta=v('t_ic')/v('t_ib');g.add(G.near(v('t_beta'),beta,A(beta)*0.01+0.1)&&G.near(v('t_alpha'),v('t_beta')/(v('t_beta')+1),0.0005),'Table 10.1 β, α','β = IC/IB, α = β/(β+1)');
    const avt=-v('t_ic')*v('t_rc')/0.0259;g.add(G.near(A(v('t_avt')),A(avt),A(avt)*0.04),'Av (eq. 10.5)',`= −IC·RC/VT ≈ ${avt.toFixed(1)}`);
    const c4=CAPS.f104;const avm=c4?c4.pp[1]/c4.pp[0]:NaN;g.add(isFinite(avm)&&avm>10&&G.near(A(v('t_avm')),avm,avm*0.03),'Av measured',`= Vo(pp)/Vi(pp) ≈ ${isFinite(avm)?avm.toFixed(1):'?'} (Fig. 10.4)`);
    g.add(G.s('t_act')==='y'&&v('v_be')>=0.5&&v('v_bc')<0.4,'Active mode check');
    [['f104',0.02,'Fig. 10.4'],['f105',0.2,'Fig. 10.5']].forEach(([id,a,t])=>{const [ok,w]=capOK(id,a);g.add(ok,t,w)});g.add(G.s('ph')==='180','Phase','180°');
    g.add(G.near(v('q2a'),v('v_r1')+v('v_r2'),0.002)&&G.near(v('q2b'),v('v_rc')+v('v_ce')+v('v_re'),0.002)&&G.near(v('q2c'),v('v_be')-v('v_bc'),0.002)&&G.near(v('q2a'),12,0.15)&&G.near(v('q2b'),12,0.15)&&G.near(v('q2c'),v('v_ce'),0.02),'PLQ 2','sums ≈ VCC = 12 V and VBE − VBC ≈ VCE');
    g.add(G.s('q3')==='a','PLQ 3');
    const tn=v('q4tn'),IE=tn*1e-3,re=5/IE,i2d=v('q4i2')*1e-3,r2=5.7/i2d,r1=9.3/i2d;const e96=(x,ref)=>isFinite(x)&&A(x-nearE96(ref))<=0.5;
    g.add(Number.isInteger(tn)&&tn>=1&&tn<=10,'PLQ 4 TN','your table number');
    g.add(e96(v('q4re'),re)&&e96(v('q4rc'),re),'PLQ 4 RE = RC',`VE = VCC/3 = 5 V → RE = 5 V / ${tn} mA ≈ ${re.toFixed(0)} Ω → E96 ${nearE96(re)} Ω`);
    g.add(i2d>=0.1*IE-1e-12&&i2d<=0.3*IE+1e-12&&e96(v('q4r2'),r2)&&e96(v('q4r1'),r1),'PLQ 4 R1, R2',`VB = 5.7 V: R2 = VB/IR2, R1 = (15 − VB)/IR2 → E96 ${isFinite(r2)?nearE96(r2):'?'} / ${isFinite(r1)?nearE96(r1):'?'} Ω`);
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'dmm',t:'Procedure A: الـ DMM على Ω: قِس كل مقاومة (5.6k، 4.7k، 47k، 27k) وهي لحالها على اللوحة، وسجّلها في Table 10.1.',ok:s=>s.rAll},
      {dev:'board',t:'ركّب Fig. 10.1: R<sub>1</sub> = 47 kΩ من V<sub>CC</sub> للـ base، R<sub>2</sub> = 27 kΩ من الـ base للأرضي، R<sub>C</sub> = 5.6 kΩ من V<sub>CC</sub> للـ collector، R<sub>E</sub> = 4.7 kΩ من الـ emitter للأرضي. المصدر 12.00 V وشغّله.',ok:s=>s.kind==='DC'&&s.on},
      {dev:'dmm',t:'الـ DMM على DCV: قِس V<sub>BE</sub> و V<sub>BC</sub> (الأحمر على B) و V<sub>CE</sub> و V<sub>R1</sub> و V<sub>R2</sub> و V<sub>RC</sub> و V<sub>RE</sub> وسجّلها على Fig. 10.3.',ok:s=>s.vAll},
      {dev:'board',t:'Procedure B: ركّب Fig. 10.2: C<sub>1</sub> = 2.2 µF من GEN OUT للـ base، C<sub>2</sub> = 2.2 µF من الـ collector لـ v<sub>o</sub>، C<sub>E</sub> = 470 µF على R<sub>E</sub> (+ جهة الـ emitter). GEN ⏚ على الأرضي.',ok:s=>s.kind==='AC'&&s.on},
      {dev:'scope',t:'شغّل الإسكوب، Default وبعدها Autoset. CH1 على v<sub>i</sub> و CH2 على v<sub>o</sub> (الأسود على الأرضي)، وشغّل CH2.',ok:s=>ST.auto&&s.probes&&s.chs},
      {dev:'gen',t:'الجنريتر: Sine، 1 kHz، 20 mVpp، Offset 0، وشغّل CH1.',ok:s=>s.kind==='AC'&&s.sig&&A(s.amp-0.02)<5e-4},
      {dev:'scope',t:'أضف Pk-Pk لـ CH1 و CH2 (Measure ← Add Measurement).',ok:s=>s.meas},
      {dev:'scope',t:'اضبط الـ SCALE والـ time/div، وصوّر v<sub>i</sub>(t) و v<sub>o</sub>(t) في Fig. 10.4. كم فرق الطور؟ احسب A<sub>v</sub> وسجّله.',ok:s=>!!CAPS.f104},
      {dev:'gen',t:'ارفع V<sub>i(p-p)</sub> لـ 200 mV، وصوّر في Fig. 10.5.',ok:s=>!!CAPS.f105},
      {dev:'gen',t:'طفّ الجنريتر والمصدر، وفصّل القطع.',ok:s=>!!ST.end}
    ],
    onReset(){for(const k in ST)delete ST[k];ST.r={};ST.v={};['f104','f105'].forEach(id=>{$(id).textContent=id==='f104'?'Fig. 10.4':'Fig. 10.5';delete CAPS[id]});$('result').innerHTML=''}};
}};})();
