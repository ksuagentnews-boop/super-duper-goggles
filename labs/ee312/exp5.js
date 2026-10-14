/* EE312 · Experiment 5 · The Operational Amplifier as an amplifier and a comparator (manual v8.8 pp. 36–42).
   Procedure A: non-inverting amplifier (Fig. 5.4a: R1 = 1 kΩ, R2 = 10 kΩ then 100 kΩ), 1 kHz 400 mVpp sine,
   CH1 100 mV/div, CH2 500 mV/div, gain, bandwidth (output falls to 0.7), clipping at the rails (CH2 5 V/div).
   Procedure B: comparator with limited output (Fig. 5.4b: 1 kΩ, D1 + Zener D2, D3 + D4), CH1/CH2/CH3, CH3 2 V/div.
   Figs 5.5–5.7, PLQs 1–6.
   Built as in the lab slides (docs/ee312/slides/exp5-slides-481.pdf, slides 14–35; the instructor's corrections win over
   the manual): the Digilent breadboard (engine/breadboard.js) with the µA741 (DIP-8) across the centre channel, parts and
   thin jumpers hole to hole; the two EL302RD units at 15 V each, checked with the MT3805, in series for ±15 V (R + → Vc,
   L − → Va, L + and R − → ⏚) with banana leads to the binding posts, jumpers to the rails and the IC (pin 7 = +15 V, pin 4
   = −15 V); generator and scope through BNC → mini-grabber leads hooked on the bare end of a standing jumper.
   Scope: Default, Autoset, CH1 200 mV/div, CH2 1 V/div (5 V/div for Fig. 5.6 and 5.7), CH3 2 V/div, 500 µs/div.
   Assumptions: the 1 kΩ of both figures is on the bench; the Zener of Fig. 5.4b is a 3.6 V type (1N4729A): the slides read
   vO+ ≈ 4.24 V = V_D1 + V_Z; the rectifiers are 1N4001. */
EXP_DEFS['ee312/exp5']=(()=>{const H=ENGINE.sheet;
const PINS=[{n:'1',dx:0,dy:1,h:1},{n:'2',dx:1,dy:1,h:1,role:'m_'},{n:'3',dx:2,dy:1,h:1,role:'p'},{n:'4',dx:3,dy:1,h:1,role:'vn'},
  {n:'5',dx:3,dy:0,h:7},{n:'6',dx:2,dy:0,h:7,role:'o'},{n:'7',dx:1,dy:0,h:7,role:'vp'},{n:'8',dx:0,dy:0,h:7}];
const mm=(id,lab)=>`<tr><th>${lab}</th><td>${H.num(id+'x','0.01')} V</td><td>${H.num(id+'n','0.01')} V</td></tr>`;
const plq=`<h3>Post Lab Questions (PLQs)</h3><ol class="en">
<li class="plq">Procedure A: closed-loop gain for R<sub>2</sub> = 10 kΩ from eq. 5.2 vs. the theoretical gain of eq. 5.1. Cause of the difference?
  <div>${H.row('Theoretical G = 1 + R<sub>2</sub>/R<sub>1</sub> =',H.num('q1g','0.01'))}
  ${H.sel('q1c',[['a','Finite open-loop gain A of the real op amp (and resistor tolerances): G = (1 + R2/R1) / (1 + (1 + R2/R1)/A)'],['b','The op amp input terminals draw a large current'],['c','The ±15 V power rails reduce the gain at any signal level'],['d','There can be no difference at all']])}</div></li>
<li class="plq">Procedure A: gain-bandwidth product for R<sub>2</sub> = 10 kΩ.
  <div>${H.row('G × BW =',H.num('q2','0.1'),'kHz')}</div></li>
<li class="plq">Procedure A: cause of clipping with R<sub>2</sub> = 100 kΩ, and how the limiting levels relate to the ±15 V rails.
  <div>${H.sel('q3a',[['a','G·vI(peak) = 101 × 0.2 V ≈ 20 V is more than the output can swing inside the ±15 V rails, so vO saturates'],['b','The 100 kΩ resistor overheats'],['c','The generator itself clips at 400 mVpp'],['d','The scope CH2 input saturates at 5 V/div']])}
  ${H.sel('q3b',[['a','A little inside the rails: |VO±| ≈ 14 V (about 1 V below ±15 V, ≈ 93 % of the rails)'],['b','Exactly equal to ±15 V'],['c','Equal to ±0.7 V'],['d','Twice the rail voltage']])}</div></li>
<li class="plq">Procedure A: the lab op amp vs. the ideal op amp model (bandwidth, output swing).
  <div>${H.sel('q4',[['a','Real: finite bandwidth (BW ≈ GBW / G, tens of kHz at G = 11) and an output swing limited to ≈ ±14 V; ideal: infinite bandwidth and unlimited swing'],['b','Both have infinite bandwidth; only the swing differs'],['c','Both are identical'],['d','The real one has a larger bandwidth than the ideal one']])}</div></li>
<li class="plq">Procedure B: justify the upper limiting levels of v<sub>6</sub>(t) and v<sub>O</sub>(t).
  <div>${H.sel('q5',[['a','v2 > v1 → the op amp saturates high (v6 ≈ VCC − 1.2 V while it sources ≈ 10 mA through 1 kΩ); D1 and the Zener D2 conduct, so vO ≈ VD1 + VZ2 ≈ 0.7 + 3.5 V'],['b','v6 = +15 V exactly and vO = +15 V'],['c','vO = VD3 + VD4 ≈ 1.4 V'],['d','vO = VZ2 only']])}</div></li>
<li class="plq">Procedure B: justify the lower limiting levels of v<sub>6</sub>(t) and v<sub>O</sub>(t).
  <div>${H.sel('q6',[['a','v1 > v2 → the op amp saturates low (v6 ≈ VEE + 1.8 V while it sinks ≈ 12 mA); D3 and D4 conduct, so vO ≈ −(VD3 + VD4) ≈ −1.4 V'],['b','vO = −(0.7 + VZ2)'],['c','v6 = −15 V exactly and vO = −15 V'],['d','vO = 0 V because the diodes block']])}</div></li></ol>`;
return {procs:[{id:'A',title:'Non-inverting amplifier: Fig. 5.4a'},{id:'B',title:'Comparator with limited output: Fig. 5.4b'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 5 · The Operational Amplifier as an Amplifier and a Comparator</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig5-1.png" alt="Fig. 5.1" style="max-width:60%"></div>
<div class="hint" style="text-align:center">Fig. 5.1 · µA741 (DIP-8): 2 = inverting input, 3 = non-inverting input, 4 = −V<sub>EE</sub>, 6 = output, 7 = +V<sub>CC</sub> (1, 5 offset null, 8 NC)</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig5-4.png" alt="Fig. 5.4"></div>
<div class="hint" style="text-align:center">Fig. 5.4 · (a) non-inverting amplifier, R<sub>1</sub> = 1 kΩ, R<sub>2</sub> = 10 kΩ then 100 kΩ · (b) comparator: 1 kΩ, D1, D3, D4 = 1N4001, D2 = Zener 1N4729A (3.6 V)</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">⚠️ ±15 V: R + على Vc، و L − على Va، و L + و R − على ⏚ (البريدبورد)، و Vc → pin 7، و Va → pin 4. شغّل المصدر قبل الجنريتر، وطفّ الجنريتر قبل المصدر.</p>
<div data-proc="A">${H.cap('f55','Fig. 5.5')}
<table class="tbl"><caption>Figure 5.5 (R<sub>2</sub> = 10 kΩ)</caption><tr><th>v<sub>I(pp)</sub></th><td>${H.num('a_vi','0.01')} V</td><th>G</th><td>${H.num('a_g','0.01')}</td></tr>
<tr><th>v<sub>O(pp)</sub></th><td>${H.num('a_vo','0.01')} V</td><th></th><td></td></tr>
<tr><th>BW</th><td>${H.num('a_bw','0.1')} kHz</td><th>G × BW</th><td>${H.num('a_gbw','0.1')} kHz</td></tr></table>
${H.cap('f56','Fig. 5.6')}
<table class="tbl"><caption>Figure 5.6 (R<sub>2</sub> = 100 kΩ)</caption><tr><th></th><th>v<sub>I</sub></th><th>v<sub>O</sub></th></tr>
<tr><th>Max.</th><td>${H.num('b_vix','0.01')} V</td><td>${H.num('b_vox','0.01')} V</td></tr><tr><th>Min.</th><td>${H.num('b_vin','0.01')} V</td><td>${H.num('b_von','0.01')} V</td></tr></table>
</div><div data-proc="B">${H.cap('f57','Fig. 5.7')}
<table class="tbl"><caption>Figure 5.7</caption><tr><th></th><th>v<sub>6</sub></th><th>v<sub>O</sub></th></tr>
<tr><th>Max.</th><td>${H.num('c_v6x','0.01')} V</td><td>${H.num('c_vox','0.01')} V</td></tr><tr><th>Min.</th><td>${H.num('c_v6n','0.01')} V</td><td>${H.num('c_von','0.01')} V</td></tr></table></div>
${plq}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
board:'breadboard',
instruments:[
  {type:'gen',prev:{wave:'Square',freq:500,amp:2,off:0.2}},
  {type:'psu',prev:d=>{d.u[0].v=5;d.u[0].ilim=0.05;d.u[1].v=12;d.u[1].ilim=0.5}},
  {type:'scope',probes:3,prev:sc=>{sc.ch[0].vd=2;sc.ch[0].cpl='AC';sc.ch[1].on=true;sc.ch[1].vd=0.2;sc.ch[2].on=false;sc.td=1e-4;sc.meas=[{src:0,src2:1,type:'Mean'}];sc.trig.src=1}},
  {type:'dmm',n:1,prev:d=>{d.fn='OHM'}},{type:'dmm',n:2,prev:d=>{d.fn='ACV'}}],
parts:{OA741:{t:'OA',model:'ua741',pkg:'DIP8',pins:PINS,mark:'UA741CN',mark2:'µA741 · DIP-8',lab:'µA741'},
  R1k:{t:'R',r:1000,lab:'1kΩ'},R10k:{t:'R',r:10e3,lab:'10kΩ'},R100k:{t:'R',r:100e3,lab:'100kΩ'},D4001:{t:'D',lab:'1N4001'},Z36:{t:'Z',model:'zener36',lab:'1N4729A'}},
tray:[['OA741','µA741'],['R1k','1 kΩ'],['R10k','10 kΩ'],['R100k','100 kΩ'],['D4001','1N4001'],['Z36','Zener 3.6 V'],['W','Jumper wire'],['JP','Jumper for a hook']],
setup(RT){
  const G=ENGINE.sheet,NS=SOLVER.NS,M=SOLVER.MODELS.ua741;
  const BB=RT.layout.BB,st=(b,h,c)=>BB.strip(b,h,c-1);   /* column numbers as printed (1…30) */
  const B={GND:BB.post('⏚'),VC:BB.post('Vc'),VA:BB.post('Va'),VRL:BB.vrail(0),VRR:BB.vrail(1),GR:BB.rail(2),
    P7:st(0,0,13),P6:st(0,0,14),P2:st(0,1,13),P3:st(0,1,14),P4:st(0,1,15),VO:st(0,1,19),X:st(0,1,21),Y:st(0,1,17)};
  /* ---------- reference circuits (generator 50 Ω, ±15 V, scope probes 1 MΩ) ---------- */
  const SUP=[{t:'DC',a:3,b:-1,v:15,ilim:1,r:0.02},{t:'DC',a:-1,b:4,v:15,ilim:1,r:0.02}];
  const ampCk=R2=>({n:6,els:[{t:'VS',a:0,r:50},...SUP,{t:'OA',p:0,m_:2,o:1,vp:3,vn:4,y:5,m:M},{t:'G',a:1,b:2,g:1/R2},{t:'G',a:2,b:-1,g:1e-3},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[1,2]});
  const cmpCk=()=>({n:9,els:[{t:'VS',a:0,r:50},...SUP,{t:'OA',p:0,m_:-1,o:1,vp:3,vn:4,y:5,m:M},{t:'G',a:1,b:6,g:1e-3},{t:'D',a:6,b:7,f:SOLVER.diodeSi},{t:'D',a:-1,b:7,f:SOLVER.MODELS.zener36},
    {t:'D',a:8,b:6,f:SOLVER.diodeSi},{t:'D',a:-1,b:8,f:SOLVER.diodeSi},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6},{t:'G',a:6,b:-1,g:1e-6}],p1:0,p2:1,dcs:[1,2]});
  const run=(ck,f)=>SOLVER.simulate(ck,f,6,t=>0.2*Math.sin(2*Math.PI*f*t));
  const ext=(r,i)=>{let mx=-1e9,mn=1e9;r.X.forEach(x=>{mx=Math.max(mx,x[i]);mn=Math.min(mn,x[i])});return {max:mx,min:mn,pp:mx-mn}};
  let REF=null;function refs(){if(REF)return REF;const a10=ext(run(ampCk(10e3),1000),1),a100=ext(run(ampCk(100e3),1000),1);const rc=run(cmpCk(),1000);
    let lo=5e3,hi=300e3;for(let k=0;k<14;k++){const m=Math.sqrt(lo*hi);if(ext(run(ampCk(10e3),m),1).pp/a10.pp>0.7)lo=m;else hi=m}
    REF={a10,a100,v6:ext(rc,1),vo:ext(rc,6),bw:Math.sqrt(lo*hi)};return REF}
  /* ---------- topology from the live netlist ---------- */
  const between=(t,a,b,dir)=>a!=null&&b!=null&&RT.between(a,b).some(x=>x.p.type===t&&(dir==null||x.dir===dir));
  const dio=(t,an,ca)=>RT.parts(t).some(p=>{const [a,b]=RT.partNets(p);return a===an&&b===ca});
  /* the circuit's ground: earth once a scope / generator ground hook is on it, before that the ⏚ post where L + and R − meet */
  const gnd=()=>{const ln=k=>RT.leadNet(k);if(ln('Lp')!=null&&ln('Lp')===ln('Rm'))return ln('Lp');if(ln('Lm')!=null&&ln('Lm')===ln('Rp'))return ln('Lm');return -1};
  function supplies(oa){const ln=k=>RT.leadNet(k),g=gnd();const vp=RT.pinNet(oa,'vp'),vn=RT.pinNet(oa,'vn');if(vp==null||vn==null||vp===vn)return false;
    return (ln('Rp')===vp&&ln('Rm')===g&&ln('Lp')===g&&ln('Lm')===vn)||(ln('Lp')===vp&&ln('Lm')===g&&ln('Rp')===g&&ln('Rm')===vn)}
  function circuit(){const oa=RT.parts('OA')[0];if(!oa||RT.parts('OA').length>1)return null;const n={};const g=gnd();['p','m_','o','vp','vn'].forEach(r=>n[r]=RT.pinNet(oa,r));
    const c={oa,n,sup:supplies(oa),gen:RT.leadNet('gr')!=null&&RT.leadNet('gr')===n.p&&n.p!=null&&n.p>=0,kind:null};
    const atO=RT.at(n.o).filter(p=>p!==oa),atM=RT.at(n.m_).filter(p=>p!==oa);
    if(n.m_>=0&&n.m_!==g&&n.o>=0&&between('R1k',n.m_,g)&&atO.length===1&&atM.length===2){if(between('R10k',n.o,n.m_))c.kind='A10';if(between('R100k',n.o,n.m_))c.kind='A100'}
    if(n.m_===g&&atO.length===1&&atO[0].type==='R1k'){const [a,b]=RT.partNets(atO[0]);const X=a===n.o?b:a;
      if(X!=null&&X>=0&&X!==g){const pos=RT.parts('D4001').some(p=>{const [a2,b2]=RT.partNets(p);return a2===X&&b2>=0&&b2!==X&&b2!==g&&dio('Z36',g,b2)})||RT.parts('Z36').some(p=>{const [a2,b2]=RT.partNets(p);return b2===X&&a2>=0&&a2!==g&&dio('D4001',a2,g)});
        const neg=RT.parts('D4001').some(p=>{const [a2,b2]=RT.partNets(p);return b2===X&&a2>=0&&a2!==X&&a2!==g&&dio('D4001',g,a2)});
        if(pos&&neg&&RT.at(X).length===3){c.kind='B';c.X=X}}}
    return c}
  let ST={};const prev={gen:false,psu:false};
  function status(){const S=RT.S,g=S.gen,sc=S.sc,P=S.psu;const c=circuit();const st={kind:c&&c.kind,sup:!!(c&&c.sup),gen:!!(c&&c.gen)};
    if(sc.msg==='Default Setup')ST.def=true;if((sc.msg==='Autoset'||sc.msg==='No signal')&&ST.def)ST.auto=true;
    st.sig=g.pwr&&g.wave==='Sine'&&Math.abs(g.amp-0.4)<5e-4&&Math.abs(g.off)<5e-4;st.f1k=Math.abs(g.freq-1000)<0.01;st.freq=g.freq;
    st.genOn=g.pwr&&g.out;st.psuOn=P.pwr&&P.u.every(u=>u.on&&Math.abs(u.v-15)<0.006);st.psuAny=P.pwr&&P.u.some(u=>u.on);
    if(st.genOn&&!prev.gen)ST.order=st.psuOn;if(!st.genOn)ST.order=false;
    if(!st.psuAny&&prev.psu)ST.offOK=!st.genOn&&!prev.gen;if(st.psuAny&&!prev.psu)ST.offOK=false;
    prev.gen=st.genOn;prev.psu=st.psuAny;
    const ln=k=>RT.leadNet(k);const n=c?c.n:{};
    st.gnd=['c1b','c2b','gb'].every(k=>ln(k)===-1);st.gnd3=st.gnd&&ln('c3b')===-1;
    st.prA=!!c&&ln('c1r')===n.p&&n.p>=0&&ln('c2r')===n.o&&n.o>=0&&st.gnd;
    st.prB=!!c&&c.kind==='B'&&ln('c1r')===n.p&&ln('c2r')===n.o&&ln('c3r')===c.X&&st.gnd3;
    st.chs=sc.pwr&&sc.ch[0].on&&sc.ch[1].on;st.ch3=st.chs&&sc.ch[2].on;
    st.vd=[0,1,2].map(k=>sc.ch[k].vd);st.probe1=sc.ch.slice(0,3).every(ch=>ch.probe===1&&!ch.inv&&ch.cpl==='DC');
    const has=(src,t)=>sc.meas.some(m=>m.src===src&&m.type===t);st.measA=['Pk-Pk','Max','Min'].every(t=>has(1,t));st.measB=['Max','Min'].every(t=>has(2,t));
    const cyc=10*sc.td*g.freq;st.cyc=cyc>=1&&cyc<=10;st.xy=sc.xy;st.pwr=sc.pwr;
    const sg=[0,1,2].map(k=>RT.dsig(k));const fitC=(k,span=1)=>{const ch=sc.ch[k];const t=sg[k].max/ch.vd+ch.pos,b=sg[k].min/ch.vd+ch.pos;return t<=4.6&&b>=-4.6&&(t-b)>=span};
    st.fit2=sc.pwr&&!sc.xy&&st.cyc&&fitC(0)&&fitC(1);st.fit3=st.fit2&&fitC(2,0.5);
    /* bandwidth search: output pp relative to its 1 kHz value */
    if(c&&c.kind==='A10'&&st.genOn&&st.sig&&st.psuOn&&g.freq>5e3&&c.n.o>=0){const v=RT.samples(c.n.o,NS);let mx=-1e9,mn=1e9;for(const x of v){mx=Math.max(mx,x);mn=Math.min(mn,x)}const r=(mx-mn)/refs().a10.pp;st.ratio=r;if(r>0.66&&r<0.74)ST.bw=g.freq}
    if(ST.bw&&st.f1k&&st.kind==='A10')ST.back=true;
    if(ST.c56&&ST.offOK&&!st.psuAny)ST.endA=true;if(ST.c57&&ST.offOK&&!st.psuAny&&!st.genOn)ST.endB=true;
    /* power distribution on the breadboard and the MT3805 check of each rail (slides 19–21) */
    const N=RT.netOf;st.dist=ln('Rp')!=null&&ln('Rp')===N(B.VC)&&N(B.VC)===N(B.VRL)&&ln('Lm')!=null&&ln('Lm')===N(B.VA)&&N(B.VA)===N(B.VRR)&&ln('Lp')!=null&&ln('Lp')===ln('Rm')&&ln('Lp')===N(B.GND)&&N(B.GND)===N(B.GR);
    if(st.psuOn&&st.dist){const p=RT.meterOn(N(B.VC),N(B.GND),true),m=RT.meterOn(N(B.VA),N(B.GND),true);if(p&&Math.abs(p.val-15)<0.05)ST.dmP=p.val;if(m&&Math.abs(m.val+15)<0.05)ST.dmN=m.val}
    st.ST=ST;return st}
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();ST['c'+id.slice(1)]=true;BENCH.onRender()}));
  const capOK=(id,kind,vds,three)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];
    if(c.kind!==kind)pr.push({A10:'الدائرة لازم Fig. 5.4a مع R2 = 10 kΩ',A100:'الدائرة لازم Fig. 5.4a مع R2 = 100 kΩ',B:'الدائرة لازم Fig. 5.4b'}[kind]);
    if(!c.sup||!c.psuOn)pr.push('±15 V مو موصّلة/شغالة صح');if(!c.gen||!c.genOn||!c.sig||!c.f1k)pr.push('الجنريتر: Sine، 1 kHz، 400 mVpp، Offset 0 على pin 3');
    if(!(three?c.prB:c.prA))pr.push(three?'CH1 على pin 3، CH2 على pin 6، CH3 على v<sub>O</sub>':'CH1 على v<sub>I</sub> (pin 3) و CH2 على v<sub>O</sub> (pin 6)');
    vds.forEach((v,k)=>{if(v!=null&&Math.abs(c.vd[k]-v)>1e-9)pr.push(`CH${k+1} SCALE ${v>=1?v+' V':v*1000+' mV'}/div`)});
    if(!c.probe1)pr.push('Probe 1X، Invert OFF، Coupling DC');if(c.xy)pr.push('لازم YT');if(!(three?c.fit3:c.fit2))pr.push('الموجة مو واضحة/عدد الدورات مو مناسب');
    return [!pr.length,pr.join('، ')]};
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const R=refs();
    [['f55','A10',[0.2,1],false,'Fig. 5.5'],['f56','A100',[0.2,5],false,'Fig. 5.6'],['f57','B',[0.2,5,2],true,'Fig. 5.7']].forEach(([id,k,vd,t3,t])=>{const [ok,w]=capOK(id,k,vd,t3);g.proc(k==='B'?'B':'A');g.add(ok,t,w)});
    g.proc('A');g.add(G.near(v('a_vi'),0.4,0.01),'Fig. 5.5 vI(pp)','= 400 mV');g.add(G.near(v('a_vo'),R.a10.pp,0.04),'Fig. 5.5 vO(pp)',`≈ ${R.a10.pp.toFixed(2)} V`);
    g.add(G.near(v('a_g'),v('a_vo')/v('a_vi'),0.06)&&G.near(v('a_g'),11,0.3),'Fig. 5.5 G','= vO(pp) / vI(pp) ≈ 11');
    g.add(G.near(v('a_bw'),R.bw/1e3,R.bw/1e3*0.08),'Fig. 5.5 BW',`≈ ${(R.bw/1e3).toFixed(1)} kHz (vO(pp) = 0.7 × its 1 kHz value)`);
    g.add(G.near(v('a_gbw'),v('a_g')*v('a_bw'),Math.abs(v('a_g')*v('a_bw'))*0.02+0.1),'Fig. 5.5 G × BW','= G × BW');
    g.add(G.near(v('b_vix'),0.2,0.01)&&G.near(v('b_vin'),-0.2,0.01),'Fig. 5.6 vI Max / Min','= ±0.2 V');
    g.add(G.near(v('b_vox'),R.a100.max,0.06)&&G.near(v('b_von'),R.a100.min,0.06),'Fig. 5.6 VO+ / VO−',`≈ ${R.a100.max.toFixed(2)} / ${R.a100.min.toFixed(2)} V`);
    g.proc('B');g.add(G.near(v('c_v6x'),R.v6.max,0.08)&&G.near(v('c_v6n'),R.v6.min,0.08),'Fig. 5.7 v6 Max / Min',`≈ ${R.v6.max.toFixed(2)} / ${R.v6.min.toFixed(2)} V`);
    g.add(G.near(v('c_vox'),R.vo.max,0.05)&&G.near(v('c_von'),R.vo.min,0.05),'Fig. 5.7 vO Max / Min',`≈ ${R.vo.max.toFixed(2)} / ${R.vo.min.toFixed(2)} V`);
    g.proc('A');g.add(G.near(v('q1g'),11,0.01)&&G.s('q1c')==='a','PLQ 1','G = 1 + 10k/1k = 11; finite A');
    g.add(G.near(v('q2'),v('a_gbw'),Math.abs(v('a_gbw'))*0.02+0.1)&&v('q2')>0,'PLQ 2','= G × BW of Fig. 5.5');
    g.add(G.s('q3a')==='a'&&G.s('q3b')==='a','PLQ 3','saturation ≈ 1 V inside the rails');g.add(G.s('q4')==='a','PLQ 4');g.proc('B');g.add(G.s('q5')==='a','PLQ 5');g.add(G.s('q6')==='a','PLQ 6');
    g.show($('result'))});
  const vdIs=(s,k,v)=>Math.abs(s.vd[k]-v)<1e-9;
  /* breadboard holes and groups used by the steps (block 1, the µA741 across the channel at columns 12–15, notch left) */
  const nm=n=>BB.nodeName(n),hn=(n,h)=>BB.holeName(n,h);
  const PF='labs/ee312/fig/fig5-4.png';
  return {status,
    steps:[
      {dev:'board',fig:PF,figCap:'Fig. 5.4',
        lines:[{t:'R + (right unit +) → Vc post',note:'+15 V',lead:'Rp',at:B.VC},{t:'L − (left unit −) → Va post',note:'−15 V',lead:'Lm',at:B.VA},{t:'L + → ⏚ post',note:'common = ground',lead:'Lp',at:B.GND},{t:'R − → ⏚ post',lead:'Rm',at:B.GND},
          {t:'jumper: Vc post → left vertical rail',note:'+15 V rail',wire:[B.VC,B.VRL]},{t:'jumper: Va post → right vertical rail',note:'−15 V rail',wire:[B.VA,B.VRR]},{t:'jumper: ⏚ post → the blue − rail row under the block',note:'ground rail',wire:[B.GND,B.GR]}],
        t:'Procedure A: توزيع الجهد (slide 21): الوحدتين على التوالي = ±15 V والنقطة المشتركة أرضي. بالـ banana: R + على Vc، و L − على Va، و L + و R − على ⏚. وبسلك jumper من كل post للـ rail حقه.',ok:s=>s.dist},
      {dev:'psu',t:'شغّل ∼POWER، واضبط كل وحدة على 15.00 V (COARSE ثم FINE) وحد التيار 0.1 A تقريباً، وحوّل مفتاح ⎓ ON للوحدتين.',ok:s=>s.dist&&s.psuOn},
      {dev:'dmm',fig:PF,figCap:'Fig. 5.4',lines:[{t:'DMM HI (red) → Vc post',lead:'mh',alt:'m2h',at:B.VC},{t:'DMM COM (black) → ⏚ post',lead:'ml',alt:'m2l',at:B.GND}],
        t:'تأكّد من الـ rail الأول بالـ MT3805 (slide 19): DCV، و HI على Vc و COM على ⏚. لازم يقرا +15.00 V.',ok:s=>ST.dmP!=null},
      {dev:'dmm',lines:[{t:'DMM HI (red) → Va post',lead:'mh',alt:'m2h',at:B.VA}],t:'والـ rail الثاني (slide 20): انقل HI على Va. لازم يقرا −15.00 V.',ok:s=>ST.dmN!=null},
      {dev:'psu',t:'طفّ مفتاحي ⎓ قبل ما تركّب الدائرة.',ok:s=>!s.psuAny&&ST.dmN!=null},
      {dev:'board',fig:PF,figCap:'Fig. 5.4',
        lines:[{t:'µA741: notch to the left, across the channel: pins 8…5 in row F, pins 1…4 in row E, columns 12–15',note:'pin 2 = −، pin 3 = +، pin 6 = output',ic:'OA741',pins:{'2':B.P2,'3':B.P3,'4':B.P4,'6':B.P6,'7':B.P7}},
          {t:'jumper: left rail (+15 V) → column 13 (row G…J)',note:'pin 7',wire:[B.VRL,B.P7]},{t:'jumper: right rail (−15 V) → column 15 (row A…D)',note:'pin 4',wire:[B.VRR,B.P4]},
          {t:'R<sub>1</sub> = 1 kΩ: column 13 (row A…D) ↔ ground rail',note:'pin 2 للأرضي',part:['R1k',B.P2,B.GR]},{t:'R<sub>2</sub> = 10 kΩ: column 14 (row G…J) ↔ column 13 (row A…D)',note:'من pin 6 لـ pin 2، فوق الـ IC',part:['R10k',B.P6,B.P2]}],
        t:'ركّب Fig. 5.4a (slides 22–23): الـ µA741 على البريدبورد عبر القناة، و +15 V على pin 7 و −15 V على pin 4 بسلكين jumper، و R<sub>1</sub> = 1 kΩ من pin 2 للأرضي، و R<sub>2</sub> = 10 kΩ من pin 6 لـ pin 2.',ok:s=>s.kind==='A10'&&s.sup},
      {dev:'gen',fig:PF,figCap:'Fig. 5.4',lines:[{t:'jumper for a hook: column 14 (row A…D)',note:'pin 3 = v<sub>I</sub>',stub:B.P3,n:1},{t:'jumper for a hook: ground rail',stub:B.GR,n:1},
          {t:'GEN OUT hook → jumper on pin 3',lead:'gr',at:B.P3},{t:'GEN ⏚ hook → jumper on the ground rail',lead:'gb',at:B.GR}],
        t:'الجنريتر (slide 24): شغّله، Sine، و F1 ← 1 ← F2 (kHz)، و F2 ← 400 ← F1 (mVpp)، و Offset = 0. الـ hook الأحمر يتعلّق على طرف سلك jumper واقف في عمود pin 3، والأسود على jumper في الأرضي.',ok:s=>s.kind==='A10'&&s.gen&&s.sig&&s.f1k},
      {dev:'scope',fig:PF,figCap:'Fig. 5.4',lines:[{t:'jumper for a hook: column 14 (row A…D)',note:'CH1 على v<sub>I</sub>',stub:B.P3,n:2},{t:'jumper for a hook: column 14 (row G…J)',note:'pin 6 = v<sub>O</sub>',stub:B.P6,n:1},{t:'2 jumpers for hooks: ground rail',stub:B.GR,n:3},
          {t:'CH1 hook → jumper on pin 3',lead:'c1r',at:B.P3},{t:'CH1 ⏚ hook → ground rail',lead:'c1b',at:B.GR},{t:'CH2 hook → jumper on pin 6',lead:'c2r',at:B.P6},{t:'CH2 ⏚ hook → ground rail',lead:'c2b',at:B.GR}],
        t:'شغّل الإسكوب، واضغط Default وبعدها Autoset. CH1 على v<sub>I</sub> (pin 3) و CH2 على v<sub>O</sub> (pin 6)، والـ hooks السوداء على الأرضي، وشغّل CH2.',ok:s=>s.pwr&&ST.auto&&s.prA&&s.chs},
      {dev:'scope',t:'SCALE حق CH1 على 200 mV/div.',ok:s=>s.chs&&vdIs(s,0,0.2)},
      {dev:'scope',t:'SCALE حق CH2 على 1 V/div.',ok:s=>s.chs&&vdIs(s,1,1)},
      {dev:'scope',t:'SCALE الأفقي (TIME/DIV) على 500 µs/div.',ok:s=>s.chs&&Math.abs(RT.S.sc.td-5e-4)<1e-9},
      {dev:'scope',t:'Measure ← Add Measurement ← Source1 = CH2 (VARIABLE ثم Select) ← V/I ← أضف Pk-Pk و Max و Min (كل وحدة Select). وبعدها Menu Off مرتين.',ok:s=>s.measA},
      {dev:'psu',t:'شغّل مفتاحي ⎓ (الوحدتين على 15.00 V)، وبعدها شغّل مخرج الجنريتر (CH1). الترتيب مهم: المصدر أول.',ok:s=>s.psuOn&&s.genOn&&ST.order&&s.kind==='A10'},
      {dev:'scope',t:'صوّر v<sub>I</sub>(t) و v<sub>O</sub>(t) في Fig. 5.5 (slide 27). سجّل v<sub>I(pp)</sub> و v<sub>O(pp)</sub> واحسب G.',ok:s=>!!CAPS.f55},
      {dev:'gen',t:'ارفع تردد الجنريتر (F1 أو المقبض) لين v<sub>O(pp)</sub> ينزل لـ 0.7 من قيمته عند 1 kHz (slide 28). سجّل التردد (BW) في Fig. 5.5.',ok:s=>!!ST.bw},
      {dev:'gen',t:'رجّع التردد لـ 1 kHz.',ok:s=>ST.back},
      {dev:'board',fig:PF,figCap:'Fig. 5.4',lines:[{t:'R<sub>2</sub> = 100 kΩ: column 14 (row G…J) ↔ column 13 (row A…D)',note:'مكان الـ 10 kΩ',part:['R100k',B.P6,B.P2]}],t:'خلّ SCALE حق CH2 على 5 V/div، وبدّل الـ 10 kΩ بـ 100 kΩ (slide 29)، وصوّر في Fig. 5.6.',ok:s=>!!CAPS.f56},
      {dev:'scope',t:'سجّل V<sub>O+</sub> و V<sub>O−</sub> من Max و Min حق CH2 في Fig. 5.6 (slide 30).',ok:s=>!!CAPS.f56&&s.measA},
      {dev:'gen',t:'طفّ مخرج الجنريتر أول، وبعدها طفّ المصدر.',ok:s=>ST.endA},
      {dev:'board',fig:PF,figCap:'Fig. 5.4',
        lines:[{t:'jumper: column 13 (row A…D) → ground rail',note:'pin 2 للأرضي (شيل R<sub>1</sub> و R<sub>2</sub>)',wire:[B.P2,B.GR]},{t:'R = 1 kΩ: column 14 (row G…J) ↔ column 19 (row A…D)',note:'من pin 6 لـ v<sub>O</sub>',part:['R1k',B.P6,B.VO]},
          {t:'D1 (1N4001): anode → column 19, cathode (band) → column 21',part:['D4001',B.VO,B.X],pol:true},{t:'D2 Zener: cathode (band) → column 21, anode → ground rail',note:'كاثود على كاثود',part:['Z36',B.GR,B.X],pol:true},
          {t:'D3 (1N4001): anode → column 17, cathode (band) → column 19',part:['D4001',B.Y,B.VO],pol:true},{t:'D4 (1N4001): anode → ground rail, cathode (band) → column 17',part:['D4001',B.GR,B.Y],pol:true}],
        t:'Procedure B: ركّب Fig. 5.4b (slide 31): pin 2 على الأرضي، و 1 kΩ من pin 6 لـ v<sub>O</sub> (عمود 19)، و D1 + الزينر D2 كاثود على كاثود من v<sub>O</sub> للأرضي، و D3 + D4 من الأرضي لـ v<sub>O</sub>.',ok:s=>s.kind==='B'&&s.sup},
      {dev:'gen',t:'نفس إشارة Procedure A: Sine، 1 kHz، 400 mVpp على pin 3.',ok:s=>s.kind==='B'&&s.gen&&s.sig&&s.f1k},
      {dev:'board',fig:PF,figCap:'Fig. 5.4',lines:[{t:'jumper for a hook: column 19 (row A…D)',note:'v<sub>O</sub>',stub:B.VO,n:1},{t:'jumper for a hook: ground rail',stub:B.GR,n:4},{t:'CH3 hook → jumper on v<sub>O</sub>',lead:'c3r',at:B.VO},{t:'CH3 ⏚ hook → ground rail',lead:'c3b',at:B.GR}],
        t:'CH1 على pin 3 (v<sub>I</sub>)، و CH2 على pin 6 (v<sub>6</sub>)، و CH3 على v<sub>O</sub> بـ hook على jumper، والأسود على الأرضي. وشغّل CH3 في الإسكوب.',ok:s=>s.prB&&s.ch3},
      {dev:'scope',t:'أضف Max و Min لـ CH3 (Source1 = CH3).',ok:s=>s.measB},
      {dev:'scope',t:'SCALE: CH1 200 mV/div، و CH2 5 V/div، و CH3 2 V/div (slide 35).',ok:s=>s.ch3&&vdIs(s,0,0.2)&&vdIs(s,1,5)&&vdIs(s,2,2)},
      {dev:'psu',t:'شغّل المصدر وبعدها الجنريتر.',ok:s=>s.kind==='B'&&s.psuOn&&s.genOn&&ST.order},
      {dev:'scope',t:'صوّر v<sub>I</sub>(t) و v<sub>6</sub>(t) و v<sub>O</sub>(t) في Fig. 5.7 (slide 33).',ok:s=>!!CAPS.f57},
      {dev:'scope',t:'سجّل Max و Min حق v<sub>6</sub> (CH2) و v<sub>O</sub> (CH3) تحت Fig. 5.7.',ok:s=>!!CAPS.f57&&s.measA&&s.measB},
      {dev:'gen',t:'طفّ الجنريتر وبعدها المصدر.',ok:s=>ST.endB}
    ],
    onReset(){ST={};prev.gen=prev.psu=false;['f55','f56','f57'].forEach(id=>{$(id).textContent=id.replace(/f5(\d)/,'Fig. 5.$1');delete CAPS[id]});$('result').innerHTML=''}};
}};})();
