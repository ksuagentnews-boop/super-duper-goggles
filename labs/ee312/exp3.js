/* EE312 · Experiment 3 · Limiting Circuits (manual v8.8 pp. 21–27).
   Procedure A: antiparallel-diode double limiter (Fig. 3.4a: D1 from vO to ground, D3–D2 in series the other way).
   Procedure B: double-anode Zener limiter (Fig. 3.4b). PeakTech 4124 (amplitude raised with its knob) + GDS-1104B
   (Default, Autoset, SCALE, Measure CH2 Max/Min, Triggered XY). Figs 3.6a/b and 3.7a/b captured, PLQs 1–6.
   Assumptions: Fig. 3.4a needs three 1N4001 (D1, D2, D3) although the materials list says two;
   PLQ "draw an equivalent circuit" answers are chosen from constant-drop models with their numbers. */
EXP_DEFS['ee312/exp3']=(()=>{const H=ENGINE.sheet;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A, 500 mV<sub>p-p</sub> input: is there any difference between v<sub>I</sub>(t) and v<sub>O</sub>(t)? Why?
  <div>${H.sel('q1',[['a','No: |vI| ≤ 0.25 V is below the diodes\' cut-in, no diode conducts, so vO = vI'],['b','Yes: the positive half is clipped at 0.25 V'],['c','Yes: vO is inverted'],['d','Yes: vO is half of vI because of R']])}</div></li>
<li class="plq">Procedure A: equivalent circuit for the upper limiting level V<sub>O+</sub> (constant-drop model).
  <div>${H.sel('q2',[['a','D1 ON → a constant drop VD1 from vO to ground; D2, D3 OFF; VO+ = VD1'],['b','D2 and D3 ON; VO+ = VD2 + VD3'],['c','All diodes OFF; VO+ = vI'],['d','D1 ON; VO+ = 2 VD1']])}</div>
  <div>${H.row('Constant drop used for D1 =',H.num('q2v','0.01'),'V')}</div></li>
<li class="plq">Procedure A: equivalent circuit for the lower limiting level V<sub>O−</sub>.
  <div>${H.sel('q3',[['a','D2 and D3 ON in series, D1 OFF; VO− = −(VD2 + VD3)'],['b','D1 ON; VO− = −VD1'],['c','D3 ON only; VO− = −VD3'],['d','All OFF; VO− = vI']])}</div>
  <div>${H.row('Constant drop used for each of D2, D3 =',H.num('q3v','0.01'),'V')}</div></li>
<li class="plq">Procedure B, 4 V<sub>p-p</sub> input: is there any difference between v<sub>I</sub>(t) and v<sub>O</sub>(t)? Why?
  <div>${H.sel('q4',[['a','No: ±2 V is far below VZ + VD ≈ 5.5 V, both Zeners stay OFF, so vO = vI'],['b','Yes: clipped at ±0.7 V'],['c','Yes: clipped at +5.1 V only'],['d','Yes: vO = 0']])}</div></li>
<li class="plq">Procedure B: equivalent circuit for V<sub>O+</sub>.
  <div>${H.sel('q5',[['a','D1 in breakdown (VZ1) in series with D2 forward (VD2); VO+ = VZ1 + VD2'],['b','D1 forward and D2 in breakdown; VO+ = VD1 + VZ2'],['c','VO+ = VZ1 only'],['d','VO+ = VZ1 + VZ2']])}</div>
  <div>${H.row('VZ used =',H.num('q5z','0.01'),'V')}${H.row('VD used =',H.num('q5d','0.01'),'V')}</div></li>
<li class="plq">Procedure B: equivalent circuit for V<sub>O−</sub>.
  <div>${H.sel('q6',[['a','D1 forward (VD1) in series with D2 in breakdown (VZ2); VO− = −(VD1 + VZ2)'],['b','D1 in breakdown, D2 forward; VO− = −(VZ1 + VD2)'],['c','VO− = −VZ2 only'],['d','VO− = −(VD1 + VD2)']])}</div></li></ol>`;
return {procs:[{id:'A',title:'Antiparallel-diode double limiter: Fig. 3.4a'},{id:'B',title:'Double-anode Zener limiter: Fig. 3.4b'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 3 · Limiting Circuits</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig3-4.png" alt="Fig. 3.4"></div>
<div class="hint" style="text-align:center">Fig. 3.4 · (a) D1, D2, D3 = 1N4001 · (b) D1, D2 = 1N4733A · R = 1 kΩ · v<sub>I</sub> from CH1 of the PeakTech 4124</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">سجّل القراءات من قياسات الإسكوب (Max / Min)، وصوّر الشاشات في مكانها، وجاوب الأسئلة.</p>
<h3>Procedure A · Antiparallel-diode double limiter</h3>
${H.row('Step 13 · Upper limiting level V<sub>O+</sub> (1.5 V<sub>p-p</sub>) =',H.num('a_vop'),'V')}
${H.row('Step 16 · Lower limiting level V<sub>O−</sub> (4 V<sub>p-p</sub>) =',H.num('a_vom'),'V')}
${H.cap('f36a','Fig. 3.6a')}${H.cap('f36b','Fig. 3.6b')}
<h3>Procedure B · Double-anode Zener limiter</h3>
${H.cap('f37a','Fig. 3.7a')}
${H.row('Step 7 · Upper limiting level V<sub>O+</sub> (15 V<sub>p-p</sub>) =',H.num('b_vop'),'V')}
${H.row('Step 8 · Lower limiting level V<sub>O−</sub> (15 V<sub>p-p</sub>) =',H.num('b_vom'),'V')}
${H.cap('f37b','Fig. 3.7b')}
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'gen',prev:{wave:'Square',freq:1000,amp:4,off:0.5}},
  {type:'scope',probes:2,prev:sc=>{sc.ch[0].probe=10;sc.ch[0].vd=50;sc.ch[1].on=false;sc.ch[1].vd=0.5;sc.ch[1].pos=1;sc.ch[1].cpl='AC';sc.td=5e-5;sc.xy=true;sc.meas=[{src:0,src2:1,type:'Pk-Pk'}];sc.trig.level=1.2;sc.disp.grat='Frame'}}],
parts:{R1k:{t:'R',r:1000,lab:'1kΩ'},D4001:{t:'D',lab:'1N4001'},Z4733:{t:'Z',lab:'1N4733A'},BR:{t:'BR',lab:''}},
tray:[['R1k','1 kΩ'],['D4001','1N4001'],['Z4733','1N4733A'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet,Si=SOLVER.diodeSi,Zn=SOLVER.zener;
  /* reference circuits: node 0 = vI (generator 50 Ω), node 1 = vO; probes 1 MΩ */
  const REF={A:{n:3,els:[{t:'VS',a:0,r:50},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:1,b:-1,f:Si},{t:'D',a:2,b:1,f:Si},{t:'D',a:-1,b:2,f:Si},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[]},
             B:{n:3,els:[{t:'VS',a:0,r:50},{t:'G',a:0,b:1,g:1e-3},{t:'D',a:2,b:1,f:Zn},{t:'D',a:2,b:-1,f:Zn},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[]}};
  const lim=(c,app)=>{const t=SOLVER.sweep(REF[c],-app/2,app/2,121);return {max:Math.max(...t.v2),min:Math.min(...t.v2)}};
  const L={A15:lim('A',1.5),A4:lim('A',4),A05:lim('A',0.5),B15:lim('B',15),B4:lim('B',4)};
  const VCHK=[-7.5,-4,-2,-1,-0.6,-0.3,0,0.3,0.6,1,2,4,7.5];
  const resp=ck=>{let x=null;return VCHK.map(v=>{const r=SOLVER.point(ck,v,x);x=r.x;return r.x})};
  const RA=resp(REF.A).map(x=>x[1]),RB=resp(REF.B).map(x=>x[1]);
  let ST={};
  /* which limiter is on the panel: generator forced on, vO = far end of the 1 kΩ from GEN OUT */
  function circuit(){const S=RT.S;if(S.leads.gr.node==null||S.leads.gb.node==null)return null;const ck=RT.buildUser(true);const I=ck.idx(S.leads.gr.node);
    const rs=S.parts.filter(p=>p.type==='R1k').map(p=>[ck.idx(p.a),ck.idx(p.b)]).find(([a,b])=>a===I||b===I);if(!rs)return null;const O=rs[0]===I?rs[1]:rs[0];if(O<0||O>=ck.n)return null;
    const R=resp(ck).map(x=>x[O]);const near=ref=>R.every((v,i)=>Math.abs(v-ref[i])<0.06);
    return {kind:near(RA)?'A':near(RB)?'B':null,O,I,ck}}
  function status(){const S=RT.S,g=S.gen,sc=S.sc,Ld=S.leads;const st={};const c=circuit();st.kind=c&&c.kind;
    if(sc.msg==='Default Setup')ST.def=true;if(sc.msg==='Autoset'&&ST.def)ST.auto=true;
    st.sine=g.wave==='Sine'&&Math.abs(g.freq-200)<0.01&&Math.abs(g.off)<0.0005;st.amp=g.amp;st.out=g.pwr&&g.out;
    const pr=c&&c.kind?[Ld.c1r.node!=null&&c.ck.idx(Ld.c1r.node)===c.I,Ld.c2r.node!=null&&c.ck.idx(Ld.c2r.node)===c.O]:[false,false];
    st.probes=pr[0]&&pr[1]&&Ld.c1b.node!=null&&Ld.c2b.node!=null;st.ch2=sc.pwr&&sc.ch[0].on&&sc.ch[1].on;
    const vds=[sc.ch[0].vd,sc.ch[1].vd];st.vd=v=>Math.abs(vds[0]-v)<1e-9&&Math.abs(vds[1]-v)<1e-9;st.pos0=sc.ch[0].pos===0&&sc.ch[1].pos===0;
    const cyc=10*sc.td*g.freq;st.cyc=cyc>=1&&cyc<=10;st.xy=sc.xy;st.pwr=sc.pwr;st.probe1=sc.ch.every(ch=>ch.probe===1&&!ch.inv)&&sc.ch[0].cpl==='DC'&&sc.ch[1].cpl==='DC';
    st.meas=['Max','Min'].every(t=>sc.meas.some(m=>m.src===1&&m.type===t));
    const sg=[RT.dsig(0),RT.dsig(1)];const fitC=k=>{const ch=sc.ch[k];const t=sg[k].max/ch.vd+ch.pos,b=sg[k].min/ch.vd+ch.pos;return t<=4.05&&b>=-4.05&&(t-b)>=1.0};
    st.fit=sc.pwr&&(sc.xy?(()=>{const c1=sc.ch[0];const l=sg[0].min/c1.vd+c1.pos,r=sg[0].max/c1.vd+c1.pos;return l>=-5.05&&r<=5.05&&(r-l)>=1&&fitC(1)})():fitC(0)&&fitC(1)&&st.cyc);
    const amp=g.amp,a=x=>Math.abs(amp-x)<0.0005;st.a=a;
    if(st.kind==='A'&&a(4)&&st.out)ST.a4=true;if(ST.a4&&st.out&&a(4)&&st.vd(0.5))ST.v500=true;
    if(ST.xyA&&!sc.xy)ST.ytA=true;if(st.kind==='A'&&sc.xy&&st.pos0&&a(4))ST.xyA=ST.xyA||sc.xy;
    if(ST.ytA&&!st.out)ST.genOffB=true;
    if(st.kind==='B'&&sc.xy&&a(15))ST.xyB=true;if(ST.xyB&&!sc.xy)ST.ytB=true;if(ST.ytB&&!g.pwr&&!sc.pwr)ST.endB=true;
    st.ST=ST;return st}
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();BENCH.onRender()}));
  const capOK=(id,kind,amp,vd,xy)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];
    if(c.kind!==kind)pr.push(kind==='A'?'الدائرة مو Fig. 3.4a':'الدائرة مو Fig. 3.4b');if(!c.probes)pr.push('CH1 لازم على vI و CH2 على vO مع الأرضي');if(!c.out||!c.sine)pr.push('الجنريتر: Sine، 200 Hz، Offset 0، و CH1 شغّال');
    if(!c.a(amp))pr.push(`السعة لازم ${amp} Vpp`);if(!c.vd(vd))pr.push(`SCALE القناتين ${vd>=1?vd+' V':vd*1000+' mV'}/div`);if(c.xy!==xy)pr.push(xy?'لازم Triggered XY':'لازم YT');if(!c.probe1)pr.push('Probe 1X و Coupling DC');if(!c.fit)pr.push('الموجة مو واضحة على الشاشة');
    return [!pr.length,pr.join('، ')]};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;
    g.proc('A');g.add(G.near(v('a_vop'),L.A15.max,0.03),'A · VO+ (1.5 Vpp)',`≈ ${L.A15.max.toFixed(2)} V`);g.add(G.near(v('a_vom'),L.A4.min,0.03),'A · VO− (4 Vpp)',`≈ ${L.A4.min.toFixed(2)} V`);
    [['f36a','A',4,0.5,false,'Fig. 3.6a'],['f36b','A',4,0.5,true,'Fig. 3.6b'],['f37a','B',15,2,false,'Fig. 3.7a'],['f37b','B',15,2,true,'Fig. 3.7b']].forEach(([id,k,a,vd,xy,t])=>{const [ok,w]=capOK(id,k,a,vd,xy);g.proc(k);g.add(ok,t,w)});
    g.proc('B');g.add(G.near(v('b_vop'),L.B15.max,0.05),'B · VO+ (15 Vpp)',`≈ ${L.B15.max.toFixed(2)} V`);g.add(G.near(v('b_vom'),L.B15.min,0.05),'B · VO− (15 Vpp)',`≈ ${L.B15.min.toFixed(2)} V`);
    g.proc('A');g.add(G.s('q1')==='a','PLQ 1','no diode conducts at ±0.25 V');g.add(G.s('q2')==='a','PLQ 2 circuit','D1 ON, VO+ = VD1');g.add(G.near(v('q2v'),v('a_vop'),0.06),'PLQ 2 VD1','≈ your VO+');
    g.add(G.s('q3')==='a','PLQ 3 circuit','VO− = −(VD2 + VD3)');g.add(G.near(v('q3v'),Math.abs(v('a_vom'))/2,0.06),'PLQ 3 VD','≈ |VO−| / 2');
    g.proc('B');g.add(G.s('q4')==='a','PLQ 4','±2 V < VZ + VD');g.add(G.s('q5')==='a','PLQ 5 circuit','VO+ = VZ1 + VD2');g.add(G.near(v('q5z')+v('q5d'),v('b_vop'),0.08)&&v('q5z')>4.5&&v('q5z')<5.3,'PLQ 5 VZ + VD','VZ ≈ 4.8–5 V, VD ≈ 0.65 V, sum ≈ your VO+');
    g.add(G.s('q6')==='a','PLQ 6 circuit','VO− = −(VD1 + VZ2)');
    g.show($('result'))});
  return {status,
    steps:[
      {dev:'board',fig:'labs/ee312/fig/fig3-4.png',figCap:'Fig. 3.4',t:'Procedure A: ركّب Fig. 3.4a بالترتيب (الأرضي = nodes 8 و 9 و 15).',
        lines:[{t:'R = 1 kΩ: node 0 ↔ node 1',part:['R1k',0,1]},{t:'bridging plug: node 8 ↔ node 15',note:'الأرضي',wire:[8,15]},{t:'bridging plug: node 8 ↔ node 9',wire:[8,9]},
          {t:'D1 (1N4001): anode → node 1, cathode → node 8',part:['D4001',1,8],pol:true},{t:'D3 (1N4001): anode → node 2, cathode → node 1',part:['D4001',2,1],pol:true},{t:'D2 (1N4001): anode → node 9, cathode → node 2',part:['D4001',9,2],pol:true},
          {t:'GEN OUT → node 0',note:'v<sub>I</sub>',lead:'gr',at:0},{t:'GEN ⏚ → node 15',lead:'gb',at:15}],ok:s=>s.kind==='A'},
      {dev:'gen',t:'شغّل الجنريتر: Sine، و F1 ← 200 ← F3 (Hz)، و F2 ← 500 ← F1 (mVpp). وخلّ Offset = 0.',ok:s=>s.kind==='A'&&s.sine&&s.a(0.5)},
      {dev:'gen',t:'اضغط مفتاح CH1 في الجنريتر عشان يطلع الإشارة.',ok:s=>s.kind==='A'&&s.out&&s.sine},
      {dev:'board',fig:'labs/ee312/fig/fig3-4.png',figCap:'Fig. 3.4',t:'وصّل الإسكوب: CH1 على v<sub>I</sub> و CH2 على v<sub>O</sub>، والأسود على الأرضي.',
        lines:[{t:'CH1 → node 0',note:'v<sub>I</sub>',lead:'c1r',at:0},{t:'CH1 ⏚ → node 15',lead:'c1b',at:15},{t:'CH2 → node 1',note:'v<sub>O</sub>',lead:'c2r',at:1},{t:'CH2 ⏚ → node 9',lead:'c2b',at:9}],ok:s=>s.probes},
      {dev:'scope',t:'شغّل الإسكوب، واضغط Default وبعدها Autoset.',ok:s=>s.pwr&&ST.auto},
      {dev:'scope',t:'شغّل CH2 لو مو شغّال.',ok:s=>s.ch2&&ST.auto},
      {dev:'scope',t:'اضغط على مقبض POSITION للقناتين عشان الصفر يكون على خط الوسط.',ok:s=>s.ch2&&s.pos0},
      {dev:'scope',t:'خلّ SCALE للقناتين على 200 mV/div.',ok:s=>s.vd(0.2)&&s.pos0},
      {dev:'scope',t:'اضبط الـ SCALE الأفقي (time/div) لين يطلع عدد مناسب من الدورات.',ok:s=>s.vd(0.2)&&s.cyc},
      {dev:'scope',t:'Measure ← Add Measurement ← Source1 = CH2 (VARIABLE ثم Select) ← V/I ← Max (Select) ← Min (Select). وبعدها Menu Off مرتين.',ok:s=>s.meas},
      {dev:'gen',t:'اضغط F2 (Ampl) عشان المقبض يتحكم في السعة، وبعدها لفّ مقبض الجنريتر الدوّار وارفعها شوي شوي لين 1.5 V<sub>p-p</sub> (◄ ► تغيّر الخانة). سجّل Max (V<sub>O+</sub>).',ok:s=>s.meas&&s.a(1.5)&&s.out},
      {dev:'gen',t:'كمّل بالمقبض لين 4 V<sub>p-p</sub>.',ok:s=>ST.a4},
      {dev:'scope',t:'خلّ SCALE للقناتين 500 mV/div، وسجّل Min (V<sub>O−</sub>).',ok:s=>ST.v500},
      {dev:'scope',t:'صوّر v<sub>I</sub>(t) و v<sub>O</sub>(t) في Fig. 3.6a.',ok:s=>!!CAPS.f36a},
      {dev:'scope',t:'Acquire ← XY ← Triggered XY، واضغط POSITION للقناتين عشان الـ VTC يتمركز عند (0, 0).',ok:s=>ST.xyA},
      {dev:'scope',t:'صوّر الـ VTC في Fig. 3.6b.',ok:s=>!!CAPS.f36b},
      {dev:'scope',t:'طفّ الـ XY: اختر OFF (YT).',ok:s=>ST.ytA},
      {dev:'gen',t:'Procedure B: طفّ مخرج الجنريتر (CH1).',ok:s=>ST.genOffB},
      {dev:'board',fig:'labs/ee312/fig/fig3-4.png',figCap:'Fig. 3.4',t:'شيل D1 و D2 و D3، وركّب Fig. 3.4b: زينرين 1N4733A ظهر لظهر (الأنودين مع بعض).',
        lines:[{t:'D1 (1N4733A): anode → node 2, cathode → node 1',part:['Z4733',2,1],pol:true},{t:'D2 (1N4733A): anode → node 2, cathode → node 9',part:['Z4733',2,9],pol:true}],ok:s=>ST.genOffB&&s.kind==='B'},
      {dev:'scope',t:'خلّ SCALE للقناتين 2 V/div.',ok:s=>s.kind==='B'&&s.vd(2)},
      {dev:'gen',t:'شغّل مخرج الجنريتر، وارفع السعة شوي شوي لين 15 V<sub>p-p</sub>.',ok:s=>s.kind==='B'&&s.out&&s.a(15)},
      {dev:'scope',t:'صوّر v<sub>I</sub>(t) و v<sub>O</sub>(t) في Fig. 3.7a، وسجّل Max و Min (V<sub>O+</sub> و V<sub>O−</sub>).',ok:s=>!!CAPS.f37a},
      {dev:'scope',t:'نفس خطوة 18: Triggered XY، وصوّر الـ VTC في Fig. 3.7b.',ok:s=>!!CAPS.f37b},
      {dev:'scope',t:'طفّ الـ XY (OFF YT)، وبعدها طفّ الجنريتر والإسكوب.',ok:s=>ST.endB}
    ],
    onReset(){ST={};['f36a','f36b','f37a','f37b'].forEach(id=>{$(id).textContent=id.replace(/f3(\d)(\w)/,'Fig. 3.$1$2');delete CAPS[id]});$('result').innerHTML=''}};
}};})();
