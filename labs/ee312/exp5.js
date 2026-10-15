/* EE312 · Experiment 5 · The Operational Amplifier as an amplifier and a comparator (manual v8.8 pp. 36–42).
   Procedure A (manual steps 1–14): non-inverting amplifier (Fig. 5.4a: R1 = 1 kΩ, R2 = 10 kΩ then 100 kΩ), 1 kHz 400 mVpp
   sine, gain, bandwidth (output falls to 0.7), clipping at the rails. Procedure B (steps 1–9): comparator with limited
   output (Fig. 5.4b: 1 kΩ, D1 + Zener D2, D3 + D4), CH1/CH2/CH3. Figs 5.5–5.7, PLQs 1–6.
   Built as in the lab slides (docs/ee312/slides/exp5-slides-481.pdf, slides 14–35; the instructor's corrections on slides
   34–35 win over the manual: CH1 200 mV/div, CH2 1 V/div, 500 µs/div, CH3 2 V/div): the Digilent breadboard
   (engine/breadboard.js) with the µA741 (DIP-8) across the centre channel, parts and thin jumpers hole to hole; the two
   EL302RD units at 15 V each (slides 19–20), in series for ±15 V (R + → Vb dark red, L − → Va green, L + → ⏚ orange, R − on
   L + by the blue lead, slide 21), jumpers
   to the rails and the IC (pin 7 = +15 V, pin 4 = −15 V); generator and scope through BNC → mini-grabber leads hooked on
   the bare end of a standing jumper (or on a part's leg).
   Steps = the manual's numbered steps. Build steps are checked by circuit equivalence against the figures below (their
   reference wiring is the slides' layout on the breadboard: IC at columns 12–15, the ground rail between the blocks).
   Assumptions: the 1 kΩ of both figures is on the bench; the Zener of Fig. 5.4b is a 3.6 V type (1N4729A): the slides read
   vO+ ≈ 4.24 V = V_D1 + V_Z; the rectifiers are 1N4001. The ±15 V wiring is the slide's (R unit = +15 V, L unit = −15 V);
   the units swapped is not accepted (the matcher cannot tell a swap from a wrong series connection). The supply setting /
   MT3805 check of slides 19–21 is shown as actions of step A1 and not checked separately (the manual has no step for it);
   the 15 V setting is checked when the supply is switched on (A7, B6). Figures 5.4a/b draw the source v_I, so the
   generator is part of the figure from step 2 (the manual connects it there); the scope channels from step 3. */
EXP_DEFS['ee312/exp5']=(()=>{const H=ENGINE.sheet;
/* the figures' reference wiring on the breadboard (slides 21–23, 31): node ids from the same geometry engine/board.js uses */
/* the lab's power wiring (slides 21, 23, 26, 31; owner, 15 Oct): orange ⏚ lead → ⏚ post, dark red (+15 V) → Vb, green (−15 V)
   → Va, the blue lead stacked from left + to right −; ⏚ → black jumper → the two vertical rails (ground only); Vb / Va →
   jumpers to the + / − rails of the bottom breadboard, linked with jumpers up to the rails around the middle breadboard where
   the µA741 sits: + rail above it → pin 7, − rail below it → pin 4, the + row below it is the ground row */
const BB=ENGINE.breadboard({}),st=(h,c)=>BB.strip(1,h,c-1);   /* column numbers as printed (1…30), middle breadboard */
const B={GND:BB.post('⏚'),VB:BB.post('Vb'),VA:BB.post('Va'),VRL:BB.vrail(0),VRR:BB.vrail(1),GR:BB.rail(5),
  PB:BB.rail(7),NB:BB.rail(6),PU:BB.rail(3),NU:BB.rail(4),
  P7:st(0,13),P6:st(0,14),P2:st(1,13),P3:st(1,14),P4:st(1,15),VO:st(1,19),X:st(1,21),Y:st(1,17)};
const SUP=[{lead:'Lp',at:B.GND},{lead:'Rm',at:B.GND,via:'Lp'},{lead:'Rp',at:B.VB},{lead:'Lm',at:B.VA},
  {wire:[B.GND,B.VRL],col:'black'},{wire:[B.VRL,B.VRR],col:'black'},{wire:[B.VB,B.PB],col:'red'},{wire:[B.VA,B.NB],col:'yellow'},
  {wire:[B.PB,B.PU],col:'red'},{wire:[B.NB,B.NU],col:'yellow'},{wire:[B.VRL,B.GR],col:'black'},
  {ic:'OA741',pins:{'2':B.P2,'3':B.P3,'4':B.P4,'6':B.P6,'7':B.P7}},{wire:[B.PU,B.P7],col:'red'},{wire:[B.NU,B.P4],col:'yellow'}];
const AMP=r2=>[...SUP,{part:['R1k',B.P2,B.GR]},{part:[r2,B.P6,B.P2]}];
const CMP=[...SUP,{wire:[B.P2,B.GR]},{part:['R1k',B.P6,B.VO]},{part:['D4001',B.VO,B.X],pol:true},{part:['Z36',B.GR,B.X],pol:true},{part:['D4001',B.Y,B.VO],pol:true},{part:['D4001',B.GR,B.Y],pol:true}];
const GEN=[{stub:B.P3,n:1},{stub:B.GR,n:1},{lead:'gr',at:B.P3},{lead:'gb',at:B.GR}];
const SC2=[{stub:B.P3,n:2},{stub:B.P6,n:1},{stub:B.GR,n:3},{lead:'c1r',at:B.P3},{lead:'c1b',at:B.GR},{lead:'c2r',at:B.P6},{lead:'c2b',at:B.GR}];
const SC3=[...SC2,{stub:B.VO,n:1},{stub:B.GR,n:4},{lead:'c3r',at:B.VO},{lead:'c3b',at:B.GR}];
const PF='labs/ee312/fig/fig5-4.png';
const figs={'5.4a':{img:PF,cap:'Fig. 5.4a · R<sub>2</sub> = 10 kΩ, ±15 V',lines:AMP('R10k')},
  '5.4a-gen':{img:PF,cap:'Fig. 5.4a · v<sub>I</sub> from the generator on pin 3',lines:[...AMP('R10k'),...GEN]},
  '5.4a-sc':{img:PF,cap:'Fig. 5.4a · CH1 = v<sub>I</sub>, CH2 = v<sub>O</sub>',lines:[...AMP('R10k'),...GEN,...SC2]},
  '5.4a-100k':{img:PF,cap:'Fig. 5.4a · R<sub>2</sub> = 100 kΩ',lines:[...AMP('R100k'),...GEN,...SC2]},
  '5.4b':{img:PF,cap:'Fig. 5.4b · comparator with limited output',lines:CMP},
  '5.4b-gen':{img:PF,cap:'Fig. 5.4b · v<sub>I</sub> from the generator on pin 3',lines:[...CMP,...GEN]},
  '5.4b-sc':{img:PF,cap:'Fig. 5.4b · CH1 = v<sub>I</sub>, CH2 = v<sub>6</sub>, CH3 = v<sub>O</sub>',lines:[...CMP,...GEN,...SC3]}};
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
return {figs,procs:[{id:'A',title:'Non-inverting amplifier: Fig. 5.4a'},{id:'B',title:'Comparator with limited output: Fig. 5.4b'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 5 · The Operational Amplifier as an Amplifier and a Comparator</h2>
<div class="figbox" style="padding:8px"><img class="figimg" src="labs/ee312/fig/fig5-1.png" alt="Fig. 5.1" style="max-width:60%"></div>
<div class="hint" style="text-align:center">Fig. 5.1 · µA741 (DIP-8): 2 = inverting input, 3 = non-inverting input, 4 = −V<sub>EE</sub>, 6 = output, 7 = +V<sub>CC</sub> (1, 5 offset null, 8 NC)</div>
<div class="figbox" style="margin-top:8px;padding:8px"><img class="figimg" src="labs/ee312/fig/fig5-4.png" alt="Fig. 5.4"></div>
<div class="hint" style="text-align:center">Fig. 5.4 · (a) non-inverting amplifier, R<sub>1</sub> = 1 kΩ, R<sub>2</sub> = 10 kΩ then 100 kΩ · (b) comparator: 1 kΩ, D1, D3, D4 = 1N4001, D2 = Zener 1N4729A (3.6 V)</div>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">⚠️ ±15 V: R + على Vb، و L − على Va، و L + على ⏚، و R − فوق plug الـ L + (السلك الأزرق)؛ +15 V → pin 7، و −15 V → pin 4. شغّل المصدر قبل الجنريتر، وطفّ الجنريتر قبل المصدر.</p>
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
/* the supply leads of the lab's table (slide 21) */
leadCol:{Lm:'green',Lp:'orange',Rm:'blue',Rp:'darkred'},
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
  /* ---------- reference circuits (generator 50 Ω, ±15 V, scope probes 1 MΩ) ---------- */
  const SUPC=[{t:'DC',a:3,b:-1,v:15,ilim:1,r:0.02},{t:'DC',a:-1,b:4,v:15,ilim:1,r:0.02}];
  const ampCk=R2=>({n:6,els:[{t:'VS',a:0,r:50},...SUPC,{t:'OA',p:0,m_:2,o:1,vp:3,vn:4,y:5,m:M},{t:'G',a:1,b:2,g:1/R2},{t:'G',a:2,b:-1,g:1e-3},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6}],p1:0,p2:1,dcs:[1,2]});
  const cmpCk=()=>({n:9,els:[{t:'VS',a:0,r:50},...SUPC,{t:'OA',p:0,m_:-1,o:1,vp:3,vn:4,y:5,m:M},{t:'G',a:1,b:6,g:1e-3},{t:'D',a:6,b:7,f:SOLVER.diodeSi},{t:'D',a:-1,b:7,f:SOLVER.MODELS.zener36},
    {t:'D',a:8,b:6,f:SOLVER.diodeSi},{t:'D',a:-1,b:8,f:SOLVER.diodeSi},{t:'G',a:0,b:-1,g:1e-6},{t:'G',a:1,b:-1,g:1e-6},{t:'G',a:6,b:-1,g:1e-6}],p1:0,p2:1,dcs:[1,2]});
  const run=(ck,f)=>SOLVER.simulate(ck,f,6,t=>0.2*Math.sin(2*Math.PI*f*t));
  const ext=(r,i)=>{let mx=-1e9,mn=1e9;r.X.forEach(x=>{mx=Math.max(mx,x[i]);mn=Math.min(mn,x[i])});return {max:mx,min:mn,pp:mx-mn}};
  let REF=null;function refs(){if(REF)return REF;const a10=ext(run(ampCk(10e3),1000),1),a100=ext(run(ampCk(100e3),1000),1);const rc=run(cmpCk(),1000);
    let lo=5e3,hi=300e3;for(let k=0;k<14;k++){const m=Math.sqrt(lo*hi);if(ext(run(ampCk(10e3),m),1).pp/a10.pp>0.7)lo=m;else hi=m}
    REF={a10,a100,v6:ext(rc,1),vo:ext(rc,6),bw:Math.sqrt(lo*hi)};return REF}
  /* ---------- the circuit on the bench, by circuit equivalence with the figures (no node numbers) ---------- */
  const MT=id=>RT.match(id).ok;
  let ST={};const prev={gen:false,psu:false};
  function status(){const S=RT.S,g=S.gen,sc=S.sc,P=S.psu;const st={};
    st.kind=MT('5.4a')?'A10':MT('5.4a-100k')?'A100':MT('5.4b')?'B':null;
    st.gen=st.kind==='A10'?MT('5.4a-gen'):st.kind==='A100'?true:st.kind==='B'?MT('5.4b-gen'):false;
    st.prA=st.kind==='A10'?MT('5.4a-sc'):st.kind==='A100';st.prB=st.kind==='B'&&MT('5.4b-sc');
    if(sc.msg==='Default Setup')ST.def=true;if((sc.msg==='Autoset'||sc.msg==='No signal')&&ST.def)ST.auto=true;
    st.sig=g.pwr&&g.wave==='Sine'&&Math.abs(g.amp-0.4)<5e-4&&Math.abs(g.off)<5e-4;st.f1k=Math.abs(g.freq-1000)<0.01;st.freq=g.freq;
    st.genOn=g.pwr&&g.out;st.psuOn=P.pwr&&P.u.every(u=>u.on&&Math.abs(u.v-15)<0.006);st.psuAny=P.pwr&&P.u.some(u=>u.on);
    if(st.genOn&&!prev.gen)ST.order=st.psuOn;if(!st.genOn)ST.order=false;
    if(!st.psuAny&&prev.psu)ST.offOK=!st.genOn&&!prev.gen;if(st.psuAny&&!prev.psu)ST.offOK=false;
    prev.gen=st.genOn;prev.psu=st.psuAny;
    st.on=st.psuOn&&st.genOn&&st.sig&&st.gen;
    st.chs=sc.pwr&&sc.ch[0].on&&sc.ch[1].on;st.ch3=st.chs&&sc.ch[2].on;
    st.vd=[0,1,2].map(k=>sc.ch[k].vd);st.probe1=sc.ch.slice(0,3).every(ch=>ch.probe===1&&!ch.inv&&ch.cpl==='DC');
    const has=(src,t)=>sc.meas.some(m=>m.src===src&&m.type===t);st.measA=['Pk-Pk','Max','Min'].every(t=>has(1,t));st.measB=['Max','Min'].every(t=>has(2,t));
    const cyc=10*sc.td*g.freq;st.cyc=cyc>=1&&cyc<=10;st.xy=sc.xy;st.pwr=sc.pwr;
    const sg=[0,1,2].map(k=>RT.dsig(k));const fitC=(k,span=1)=>{const ch=sc.ch[k];const t=sg[k].max/ch.vd+ch.pos,b=sg[k].min/ch.vd+ch.pos;return t<=4.6&&b>=-4.6&&(t-b)>=span};
    st.fit2=sc.pwr&&!sc.xy&&st.cyc&&fitC(0)&&fitC(1);st.fit3=st.fit2&&fitC(2,0.5);
    /* the gain at 1 kHz, then the bandwidth search: output pp relative to its 1 kHz value */
    if(st.kind==='A10'&&st.on&&st.f1k&&st.prA){const vi=sg[0].max-sg[0].min,vo=sg[1].max-sg[1].min;if(vi>0.1)ST.g10=vo/vi}
    if(st.kind==='A10'&&st.on&&g.freq>5e3){const o=RT.match('5.4a').net(B.P6);if(o!=null&&o>=0){const v=RT.samples(o,NS);let mx=-1e9,mn=1e9;for(const x of v){mx=Math.max(mx,x);mn=Math.min(mn,x)}const r=(mx-mn)/refs().a10.pp;st.ratio=r;if(r>0.66&&r<0.74)ST.bw=g.freq}}
    if(ST.bw&&st.f1k&&st.kind==='A10')ST.back=true;
    if(st.kind==='A100'&&st.on&&st.f1k)ST.seen100=true;if(st.kind==='B'&&st.on&&st.f1k&&st.prB)ST.seenB=true;
    if(ST.seen100&&ST.offOK&&!st.psuAny)ST.endA=true;if(ST.seenB&&ST.offOK&&!st.psuAny&&!st.genOn)ST.endB=true;
    st.ST=ST;return st}
  const CAPS={};
  document.querySelectorAll('[data-cap]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.cap;G.capture(RT,id);CAPS[id]=status();ST['c'+id.slice(1)]=true;BENCH.onRender()}));
  const capOK=(id,kind,vds,three)=>{const c=CAPS[id];if(!c)return [false,'ما سجّلت الشاشة'];const pr=[];
    if(c.kind!==kind)pr.push({A10:'الدائرة لازم Fig. 5.4a مع R2 = 10 kΩ و ±15 V',A100:'الدائرة لازم Fig. 5.4a مع R2 = 100 kΩ و ±15 V',B:'الدائرة لازم Fig. 5.4b مع ±15 V'}[kind]);
    if(!c.psuOn)pr.push('±15 V مو شغالة صح');if(!c.gen||!c.genOn||!c.sig||!c.f1k)pr.push('الجنريتر: Sine، 1 kHz، 400 mVpp، Offset 0 على pin 3');
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
  /* Capture (Manual): the readings the scope shows, while the circuit of that step runs */
  const sig=(k,f)=>{const s=status();if(!f(s))return null;const d=RT.dsig(k);return d&&d.has!==false?d:null};
  const okA=s=>s.kind==='A10'&&s.on&&s.f1k&&s.prA,okA100=s=>s.kind==='A100'&&s.on&&s.f1k,okB=s=>s.kind==='B'&&s.on&&s.f1k&&s.prB;
  const pp=(k,f)=>{const d=sig(k,f);return d?d.max-d.min:null},mx=(k,f)=>{const d=sig(k,f);return d?d.max:null},mn=(k,f)=>{const d=sig(k,f);return d?d.min:null};
  const NONE='ما فيه إشارة: شغّل المصدر والجنريتر، والدائرة والـ probes مثل الشكل.';
  /* ---------- Batch 7 item 3: the sub-steps and their «do it for me» ---------- */
  /* the lab's power wiring in its order (slide 21, owner): the four banana leads, then the jumpers; each «وصّل لي» lays the
     reference wiring up to that point (cumulative partial figures, not in figs: they are not circuits of the manual) */
  const PW=[{lead:'Lm',at:B.VA},{lead:'Lp',at:B.GND},{lead:'Rm',at:B.GND,via:'Lp'},{lead:'Rp',at:B.VB}];
  const JG=[{wire:[B.GND,B.VRL],col:'black'},{wire:[B.VRL,B.VRR],col:'black'}],JS=[{wire:[B.VB,B.PB],col:'red'},{wire:[B.VA,B.NB],col:'yellow'}],
    JL=[{wire:[B.PB,B.PU],col:'red'},{wire:[B.NB,B.NU],col:'yellow'},{wire:[B.VRL,B.GR],col:'black'}];
  const part=lines=>({lines});
  const same=(a,b)=>{const x=RT.netOf(a);return x!=null&&x===RT.netOf(b)};
  const onPost=(k,p)=>{const n=RT.leadNet(k);return n!=null&&n===RT.netOf(p)};
  const A1ok=f=>()=>f()||MT('5.4a');
  /* the scope leads one channel at a time (the circuit and the generator as in the figure) */
  const C1=k=>[{stub:B.P3,n:2},{stub:B.GR,n:2},{lead:'c1r',at:B.P3},{lead:'c1b',at:B.GR}],C2=[{stub:B.P6,n:1},{stub:B.GR,n:3},{lead:'c2r',at:B.P6},{lead:'c2b',at:B.GR}];
  const FA1=part([...AMP('R10k'),...GEN,...C1()]),FB1=part([...CMP,...GEN,...C1()]),FB2=part([...CMP,...GEN,...C1(),...C2]);
  /* generator keypad: F-key, the digits, the unit key (F1 … F4 of that quantity) */
  const gOn=async A=>{if(!RT.S.gen.pwr)await A.press('g:PWR')};
  const gKey=async(A,fk,str,uk)=>{await gOn(A);if(RT.S.gen.edit)await A.press('g:F5');await A.press('g:'+fk);for(const ch of str)await A.press('g:'+ch);await A.press('g:'+uk)};
  const gFreq=(A,khz)=>gKey(A,'F1',String(khz),'F2'),gAmp=A=>gKey(A,'F2','400','F1'),gOff=A=>gKey(A,'F3','0','F2');
  const gSine=async A=>{await gOn(A);if(RT.S.gen.wave!=='Sine')await A.press('g:Sine')};
  const gAll=async A=>{const g=RT.S.gen;await gSine(A);if(Math.abs(g.freq-1000)>=0.01)await gFreq(A,1);if(Math.abs(g.amp-0.4)>=5e-4)await gAmp(A);if(Math.abs(g.off)>=5e-4)await gOff(A)};
  /* scope: VOLTS/DIV, TIME/DIV, channel keys, Measure › Add Measurement */
  const scOn=async A=>{if(!RT.S.sc.pwr)await A.press('s:PWR')};
  const vdTo=async(A,c,t)=>{await scOn(A);const ch=RT.S.sc.ch[c];if(!ch.on)await A.press('s:CH'+(c+1));for(let i=0;i<16;i++){const v=RT.S.sc.ch[c].vd;if(Math.abs(v-t)<1e-9)return;await A.press(`s:V${c+1}${v<t?'+':'-'}`)}};
  const tdTo=async(A,t)=>{await scOn(A);for(let i=0;i<24;i++){const v=RT.S.sc.td;if(Math.abs(v-t)<1e-12)return;await A.press(`s:H${v>t?'-':'+'}`)}};
  const chOn=async(A,c)=>{await scOn(A);if(!RT.S.sc.ch[c].on)await A.press('s:CH'+(c+1))};
  const VI=['Pk-Pk','Max','Min'];
  const measAdd=async(A,src,type)=>{const sc=RT.S.sc;await chOn(A,src);if(sc.meas.some(m=>m.src===src&&m.type===type))return;
    if(sc.menu!=='measure')await A.press('s:Measure');if(sc.side!=='add')await A.press('s:B0');
    if(sc.msrc!==src){await A.press('s:S3');for(let i=0;i<6&&RT.S.sc.list&&RT.S.sc.list.idx!==src;i++)await A.press('s:VAR+');await A.press('s:SEL')}
    if(!sc.list||sc.list.kind!=='vi')await A.press('s:S0');const want=VI.indexOf(type);for(let i=0;i<16&&RT.S.sc.list&&RT.S.sc.list.idx!==want;i++)await A.press('s:VAR+');
    await A.press('s:SEL');await A.press('s:MOFF');await A.press('s:MOFF')};
  const has=(src,t)=>RT.S.sc.meas.some(m=>m.src===src&&m.type===t);
  /* supply: COARSE while it brings the value closer, then FINE (as in Exp 1) */
  const knobTo=async(A,u,t)=>{const get=()=>RT.S.psu.u[u==='L'?0:1].v;let fineOnly=false;for(let i=0;i<500;i++){const x=get(),e=x-t;if(Math.abs(e)<=0.004)return;
      await A.tap('p:'+u+(fineOnly?'VF':'VC')+(e<0?'+':'-'),fineOnly?35:90);
      if(!fineOnly){const y=get();if(Math.abs(y-t)>=Math.abs(e)||Math.sign(y-t)!==Math.sign(e)&&Math.abs(y-t)>0.004){if(Math.abs(y-t)>=Math.abs(e))await A.tap('p:'+u+'VC'+(e<0?'-':'+'),90);fineOnly=true}}}};
  const v15=u=>Math.abs(RT.S.psu.u[u].v-15)<0.006;
  /* «شغّل الـ power supply، وبعدها الـ waveform generator» (A7, B6): the sub-steps of that manual step */
  const onSubs=kind=>[
    {k:'set',dev:'psu',t:'شغّل مفتاح ∼ POWER حق الـ EL302RD.',ok:()=>RT.S.psu.pwr,do:async A=>{if(!RT.S.psu.pwr)await A.press('p:PWR')}},
    {k:'set',dev:'psu',t:'الوحدة اليسار (L): بالـ COARSE و FINE خلّها 15.00 V.',ok:()=>v15(0),do:A=>knobTo(A,'L',15),hint:'لف COARSE لين قريب من 15 V، وكمّل بالـ FINE لين 15.00 V'},
    {k:'set',dev:'psu',t:'الوحدة اليمين (R): بالـ COARSE و FINE خلّها 15.00 V.',ok:()=>v15(1),do:A=>knobTo(A,'R',15),hint:'لف COARSE لين قريب من 15 V، وكمّل بالـ FINE لين 15.00 V'},
    {k:'set',dev:'psu',t:'شغّل مفتاح الـ dc ⎓ ON للوحدتين: ±15 V على الدائرة.',ok:s=>s.psuOn,do:async A=>{if(!RT.S.psu.u[0].on)await A.press('p:LON');if(!RT.S.psu.u[1].on)await A.press('p:RON')}},
    {k:'set',dev:'gen',t:'بعدها شغّل مخرج الجنريتر (زر CH1).',ok:s=>s.kind===kind&&s.psuOn&&s.genOn&&ST.order,
      do:async A=>{await gOn(A);if(RT.S.gen.out&&!ST.order){await A.press('g:CH1');await A.wait(120)}if(!RT.S.gen.out)await A.press('g:CH1')},
      hint:s=>s.genOn&&!ST.order?'الجنريتر انشغل قبل المصدر: طفّ مخرجه (CH1) وشغّله من جديد بعد ±15 V':s.kind!==kind?'الدائرة مو مثل الشكل':'شغّل مخرج الجنريتر بزر CH1'}];
  const offSubs=end=>[
    {k:'set',dev:'gen',t:'طفّ الـ waveform generator أول (زر CH1).',ok:s=>!s.genOn,do:async A=>{if(RT.S.gen.out)await A.press('g:CH1')}},
    {k:'set',dev:'psu',t:'وبعدها طفّ الـ power supply (∼ POWER).',ok:()=>!!ST[end],do:async A=>{if(RT.S.psu.pwr)await A.press('p:PWR')},
      hint:'الترتيب: الجنريتر أول، وبعدها المصدر. لو طفّيت المصدر قبل، شغّله وطفّه من جديد بعد الجنريتر'}];
  /* bandwidth: raise the frequency (bisection on the keypad) until vO(pp) = 0.7 of its 1 kHz value */
  const bwSearch=async A=>{let lo=10,hi=200;await gOn(A);for(let i=0;i<18&&!ST.bw;i++){const f=Math.round((lo+hi)/2*10)/10;await gFreq(A,f);await A.wait(150);const s=A.st();if(ST.bw)break;if(s.ratio==null)break;if(s.ratio>0.7)lo=f;else hi=f}};
  return {status,
    steps:[
      /* Procedure A (manual p. 40–41), steps 1–14, with the instructor's corrections (slides 34–35) */
      {dev:'board',t:'Procedure A · 1. ركّب الدائرة Fig. 5.4a، وابدأ بـ R<sub>2</sub> = 10 kΩ.',subs:[
        {k:'connect',dev:'psu',t:'الوحدتين على التوالي = ±15 V (slide 21): السلك <b>الأخضر</b> من L − إلى Va.',ok:A1ok(()=>onPost('Lm',B.VA)),do:A=>A.build(part(PW.slice(0,1))),hint:'banana أخضر في − الوحدة اليسار، وطرفه على الـ post الأصفر Va'},
        {k:'connect',dev:'psu',t:'السلك <b>البرتقالي</b> من L + إلى ⏚ (الأرضي).',ok:A1ok(()=>onPost('Lp',B.GND)),do:A=>A.build(part(PW.slice(0,2))),hint:'banana برتقالي في + الوحدة اليسار، وطرفه على الـ post الأسود ⏚'},
        {k:'connect',dev:'psu',t:'السلك <b>الأزرق</b> من R − ويركب فوق plug الـ L + (نقطة الوسط = الأرضي).',ok:A1ok(()=>RT.leadNet('Rm')!=null&&RT.leadNet('Rm')===RT.leadNet('Lp')),do:A=>A.build(part(PW.slice(0,3))),hint:'banana أزرق في − الوحدة اليمين، وطرفه الثاني فوق plug البرتقالي في L +'},
        {k:'connect',dev:'psu',t:'السلك <b>الأحمر الغامق</b> من R + إلى Vb (+15 V).',ok:A1ok(()=>onPost('Rp',B.VB)),do:A=>A.build(part(PW)),hint:'banana أحمر غامق في + الوحدة اليمين، وطرفه على الـ post الأزرق Vb'},
        {k:'connect',dev:'board',t:'jumper أسود من ⏚ إلى الـ rails العمودية (الاثنين أرضي بس).',ok:A1ok(()=>same(B.GND,B.VRL)&&same(B.GND,B.VRR)),do:A=>A.build(part([...PW,...JG])),hint:'jumper من الـ post ⏚ للـ rail العمودي، وjumper بين الـ rail العمودي والثاني'},
        {k:'connect',dev:'board',t:'jumper أحمر من Vb إلى الـ + rail، و jumper أصفر من Va إلى الـ − rail، تحت آخر بريدبورد (slides 23، 31).',ok:A1ok(()=>same(B.VB,B.PB)&&same(B.VA,B.NB)),do:A=>A.build(part([...PW,...JG,...JS])),hint:'+15 V على الـ rail الأحمر (+) و −15 V على الأزرق (−) للبريدبورد اللي تحت'},
        {k:'connect',dev:'board',t:'jumpers بين الـ rails لين البريدبورد اللي فيه الـ µA741: +15 V و −15 V والأرضي.',ok:A1ok(()=>same(B.VB,B.PU)&&same(B.VA,B.NU)&&same(B.GND,B.GR)),do:A=>A.build(part([...PW,...JG,...JS,...JL])),hint:'وصّل الـ + rail بالـ + rail اللي فوقه، والـ − بالـ −، وrail أرضي للبريدبورد الوسط من الـ rail العمودي'},
        {k:'build',fig:'5.4a',t:'الـ µA741 عبر القناة: +15 V → pin 7 و −15 V → pin 4، و R<sub>1</sub> = 1 kΩ من pin 2 للأرضي، و R<sub>2</sub> = 10 kΩ من pin 6 لـ pin 2 (slides 22–23): الدائرة Fig. 5.4a.'}]},
      {fig:PF,figCap:'Fig. 5.4a',dev:'gen',t:'2. بالـ waveform generator، طبّق sinusoid تردده 1 kHz و 400 mVpp على الـ noninverting terminal (pin 3) للـ op amp.',subs:[
        {k:'connect',fig:'5.4a-gen',t:'وصّل الجنريتر (OUT1): الـ hook الأحمر على طرف jumper واقف في عمود pin 3، والأسود على jumper في الأرضي.'},
        {k:'set',dev:'gen',t:'شغّل الجنريتر (زر POWER) واختر Sine.',ok:()=>RT.S.gen.pwr&&RT.S.gen.wave==='Sine',do:gSine},
        {k:'set',dev:'gen',t:'Frequency = 1 kHz (F1، وبعدها الأرقام و kHz).',ok:s=>RT.S.gen.pwr&&s.f1k,do:A=>gFreq(A,1)},
        {k:'set',dev:'gen',t:'Amplitude = 400 mVpp (F2، وبعدها الأرقام و mVpp).',ok:()=>RT.S.gen.pwr&&Math.abs(RT.S.gen.amp-0.4)<5e-4,do:gAmp},
        {k:'set',dev:'gen',t:'Offset = 0 mV (F3، slide 24).',ok:s=>s.sig&&s.f1k,do:gOff}]},
      {fig:PF,figCap:'Fig. 5.4a',dev:'scope',t:'3. شغّل الإسكوب وانتظر ثواني، واضغط Default وبعدها Autoset. اعرض v<sub>I</sub>(t) على CH1 و v<sub>O</sub>(t) على CH2.',subs:[
        {k:'set',dev:'scope',t:'شغّل الإسكوب (POWER) وانتظر ثواني.',ok:s=>s.pwr,do:scOn},
        {k:'set',dev:'scope',t:'اضغط Default.',ok:()=>!!ST.def,do:async A=>{await scOn(A);await A.press('s:Default')}},
        {k:'set',dev:'scope',t:'وبعدها Autoset.',ok:()=>!!ST.auto,do:async A=>{await scOn(A);await A.press('s:Autoset')}},
        {k:'connect',fig:FA1,t:'وصّل CH1 على v<sub>I</sub>: الـ hook الأحمر على jumper في عمود pin 3، والأسود على الأرضي.'},
        {k:'connect',fig:'5.4a-sc',t:'وصّل CH2 على v<sub>O</sub>: الـ hook الأحمر على jumper في عمود pin 6، والأسود على الأرضي.'},
        {k:'set',dev:'scope',t:'اعرض CH2 (زر CH2).',ok:s=>s.chs,do:async A=>{await chOn(A,0);await chOn(A,1)}}]},
      {dev:'scope',t:'4. بمقبض SCALE حق CH1 خلّ الـ vertical sensitivity على 200 mV/div (تصحيح المعيد، slide 34).',subs:[
        {k:'set',dev:'scope',t:'CH1 SCALE = 200 mV/div.',ok:s=>s.chs&&vdIs(s,0,0.2),do:A=>vdTo(A,0,0.2)}]},
      {dev:'scope',t:'5. بمقبض SCALE حق CH2 خلّ الـ vertical sensitivity على 1 V/div (تصحيح المعيد، slide 34).',subs:[
        {k:'set',dev:'scope',t:'CH2 SCALE = 1 V/div.',ok:s=>s.chs&&vdIs(s,1,1),do:A=>vdTo(A,1,1)}]},
      {dev:'scope',t:'6. اضغط Measure ← Add Measurement ← فعّل Source 1 ← بمقبض VARIABLE اختر CH2 واضغط Select ← فعّل V/I ← ظلّل Pk-Pk و Max و Min واضغط Select لكل واحد.',subs:[
        {k:'set',dev:'scope',t:'Measure ← Add Measurement ← Source1 = CH2 ← V/I ← Pk-Pk ← Select.',ok:()=>has(1,'Pk-Pk'),do:A=>measAdd(A,1,'Pk-Pk')},
        {k:'set',dev:'scope',t:'Max ← Select.',ok:()=>has(1,'Max'),do:A=>measAdd(A,1,'Max')},
        {k:'set',dev:'scope',t:'Min ← Select.',ok:()=>has(1,'Min'),do:A=>measAdd(A,1,'Min')}]},
      {dev:'psu',t:'7. شغّل الـ dc power supply، وبعدها الـ waveform generator.',subs:onSubs('A10')},
      {dev:'scope',t:'8. سجّل v<sub>I</sub>(t) و v<sub>O</sub>(t) على Fig. 5.5.',subs:[
        {k:'set',dev:'scope',t:'TIME/DIV = 500 µs/div (slide 35).',ok:()=>Math.abs(RT.S.sc.td-5e-4)<1e-12,do:A=>tdTo(A,5e-4)},
        {k:'rec',t:'سجّل شاشة الإسكوب على Fig. 5.5.',ok:()=>!!CAPS.f55,rec:[{scope:'f55',label:'Fig. 5.5'}]}]},
      {dev:'scope',t:'9. سجّل الـ peak-to-peak للدخل والخرج، واحسب الـ voltage gain: G = V<sub>o(pp)</sub> / V<sub>i(pp)</sub>.',subs:[
        {k:'rec',t:'سجّل v<sub>I(pp)</sub> و v<sub>O(pp)</sub> (Pk-Pk) و G.',ok:s=>okA(s)&&s.measA,
          rec:[{to:'a_vi',val:()=>pp(0,okA),unit:'V',dec:2,label:'v<sub>I(pp)</sub>',none:NONE},{to:'a_vo',val:()=>pp(1,okA),unit:'V',dec:2,label:'v<sub>O(pp)</sub>',none:NONE},
            {to:'a_g',val:()=>{const a=pp(0,okA),b=pp(1,okA);return a&&b!=null?b/a:null},dec:2,label:'G',none:NONE}]}]},
      {dev:'gen',t:'10. ارفع تردد الدخل لين الـ peak للخرج ينزل لـ 0.7 من قيمته عند 1 kHz، وسجّل هالتردد (الـ bandwidth BW) من الجنريتر في Fig. 5.5.',subs:[
        {k:'set',dev:'gen',t:'ارفع الـ Frequency لين v<sub>O(pp)</sub> = 0.7 من قيمته عند 1 kHz.',ok:()=>!!ST.bw,do:bwSearch,hint:s=>s.ratio!=null?`v<sub>O(pp)</sub> الحين ${(s.ratio*100).toFixed(0)} % من قيمته عند 1 kHz: ${s.ratio>0.7?'ارفع':'نزّل'} التردد`:'ارفع التردد فوق 5 kHz والدائرة شغّالة'},
        {k:'rec',t:'سجّل الـ BW و G × BW.',ok:()=>!!ST.bw,
          rec:[{to:'a_bw',val:()=>ST.bw?ST.bw/1e3:null,unit:'kHz',dec:1,label:'BW',none:'لسّا الخرج ما نزل لـ 0.7 من قيمته عند 1 kHz'},{to:'a_gbw',val:()=>ST.bw&&ST.g10?ST.g10*ST.bw/1e3:null,unit:'kHz',dec:1,label:'G × BW'}]}]},
      {dev:'gen',t:'11. نزّل تردد الدخل لين 1 kHz.',subs:[
        {k:'set',dev:'gen',t:'Frequency = 1 kHz.',ok:()=>!!ST.back,do:A=>gFreq(A,1)}]},
      {dev:'board',t:'12. كبّر الـ scale حق CH2 لـ 5 V/div. بدّل الـ 10 kΩ بـ 100 kΩ، وارسم v<sub>I</sub>(t) و v<sub>O</sub>(t) على Fig. 5.6.',subs:[
        {k:'set',dev:'scope',t:'CH2 SCALE = 5 V/div.',ok:s=>vdIs(s,1,5),do:A=>vdTo(A,1,5)},
        {k:'build',fig:'5.4a-100k',t:'بدّل R<sub>2</sub> = 10 kΩ بـ 100 kΩ.'},
        {k:'rec',t:'سجّل شاشة الإسكوب على Fig. 5.6.',ok:()=>!!CAPS.f56,rec:[{scope:'f56',label:'Fig. 5.6'}]}]},
      {dev:'scope',t:'13. خذ الـ upper limiting level V<sub>O+</sub> والـ lower limiting level V<sub>O−</sub> لـ v<sub>O</sub>(t) من Max و Min في الإسكوب، وسجّلها في Fig. 5.6.',subs:[
        {k:'rec',t:'سجّل Max و Min لـ v<sub>I</sub> و v<sub>O</sub>.',ok:s=>okA100(s)&&s.measA,
          rec:[{to:'b_vix',val:()=>mx(0,okA100),unit:'V',dec:2,label:'v<sub>I</sub> Max',none:NONE},{to:'b_vin',val:()=>mn(0,okA100),unit:'V',dec:2,label:'v<sub>I</sub> Min',none:NONE},
            {to:'b_vox',val:()=>mx(1,okA100),unit:'V',dec:2,label:'V<sub>O+</sub>',none:NONE},{to:'b_von',val:()=>mn(1,okA100),unit:'V',dec:2,label:'V<sub>O−</sub>',none:NONE}]}]},
      {dev:'gen',t:'14. طفّ الـ waveform generator وبعدها الـ power supply.',subs:offSubs('endA')},
      /* Procedure B (manual p. 41), steps 1–9 */
      {dev:'board',t:'Procedure B · 1. ركّب الدائرة Fig. 5.4b.',subs:[
        {k:'build',fig:'5.4b',t:'pin 2 على الأرضي، و 1 kΩ من pin 6 لـ v<sub>O</sub>، و D1 + الزينر D2 (كاثود على كاثود) من v<sub>O</sub> للأرضي، و D3 + D4 من الأرضي لـ v<sub>O</sub> (slide 31): الدائرة Fig. 5.4b.'}]},
      {fig:PF,figCap:'Fig. 5.4b',dev:'gen',t:'2. استخدم نفس إشارة الدخل اللي استخدمتها في Procedure A.',subs:[
        {k:'connect',fig:'5.4b-gen',t:'الجنريتر على pin 3 (الـ hook الأحمر) والأرضي (الأسود).'},
        {k:'set',dev:'gen',t:'Sine، و Frequency = 1 kHz، و Amplitude = 400 mVpp، و Offset = 0 mV.',ok:s=>s.sig&&s.f1k,do:gAll}]},
      {fig:PF,figCap:'Fig. 5.4b',dev:'scope',t:'3. وصّل الـ non-inverting input للـ op amp على CH1، وخرج الـ op amp على CH2، وخرج الدائرة كلها على CH3.',subs:[
        {k:'connect',fig:FB1,t:'CH1 على الـ non-inverting input (pin 3).'},
        {k:'connect',fig:FB2,t:'CH2 على خرج الـ op amp (pin 6).'},
        {k:'connect',fig:'5.4b-sc',t:'CH3 على خرج الدائرة v<sub>O</sub>.'},
        {k:'set',dev:'scope',t:'شغّل CH3 في الإسكوب (زر CH3).',ok:s=>s.ch3,do:async A=>{for(const c of [0,1,2])await chOn(A,c)}}]},
      {dev:'scope',t:'4. أضف Max و Min measurement لـ CH3.',subs:[
        {k:'set',dev:'scope',t:'Measure ← Add Measurement ← Source1 = CH3 ← V/I ← Max ← Select.',ok:()=>has(2,'Max'),do:A=>measAdd(A,2,'Max')},
        {k:'set',dev:'scope',t:'Min ← Select.',ok:()=>has(2,'Min'),do:A=>measAdd(A,2,'Min')}]},
      {dev:'scope',t:'5. خلّ الـ scale حق CH3 على 2 V/Div.',subs:[
        {k:'set',dev:'scope',t:'CH3 SCALE = 2 V/div.',ok:s=>s.ch3&&vdIs(s,2,2),do:A=>vdTo(A,2,2)},
        {k:'set',dev:'scope',t:'CH1 SCALE = 200 mV/div (slide 35).',ok:s=>s.ch3&&vdIs(s,0,0.2),do:A=>vdTo(A,0,0.2)},
        {k:'set',dev:'scope',t:'CH2 SCALE = 5 V/div (slide 35).',ok:s=>s.ch3&&vdIs(s,1,5),do:A=>vdTo(A,1,5)}]},
      {dev:'psu',t:'6. شغّل الـ power supply، وبعدها الـ waveform generator.',subs:onSubs('B')},
      {dev:'scope',t:'7. سجّل v<sub>I</sub>(t) و v<sub>6</sub>(t) و v<sub>O</sub>(t) على Fig. 5.7.',subs:[
        {k:'rec',t:'سجّل شاشة الإسكوب على Fig. 5.7.',ok:()=>!!CAPS.f57,rec:[{scope:'f57',label:'Fig. 5.7'}]}]},
      {dev:'scope',t:'8. خذ الـ upper و lower limiting levels لـ v<sub>6</sub>(t) و v<sub>O</sub>(t) من Max و Min في الإسكوب، وسجّلها تحت Fig. 5.7.',subs:[
        {k:'set',dev:'scope',t:'تأكد إن Max و Min لـ CH2 (v<sub>6</sub>) معروضة.',ok:()=>has(1,'Max')&&has(1,'Min'),do:async A=>{await measAdd(A,1,'Max');await measAdd(A,1,'Min')}},
        {k:'rec',t:'سجّل Max و Min لـ v<sub>6</sub> و v<sub>O</sub>.',ok:s=>okB(s)&&s.measB&&has(1,'Max')&&has(1,'Min'),
          rec:[{to:'c_v6x',val:()=>mx(1,okB),unit:'V',dec:2,label:'v<sub>6</sub> Max',none:NONE},{to:'c_v6n',val:()=>mn(1,okB),unit:'V',dec:2,label:'v<sub>6</sub> Min',none:NONE},
            {to:'c_vox',val:()=>mx(2,okB),unit:'V',dec:2,label:'v<sub>O</sub> Max',none:NONE},{to:'c_von',val:()=>mn(2,okB),unit:'V',dec:2,label:'v<sub>O</sub> Min',none:NONE}]}]},
      {dev:'gen',t:'9. طفّ الـ waveform generator وبعدها الـ power supply.',subs:offSubs('endB')}
    ],
    onReset(){ST={};prev.gen=prev.psu=false;['f55','f56','f57'].forEach(id=>{$(id).textContent=id.replace(/f5(\d)/,'Fig. 5.$1');delete CAPS[id]});$('result').innerHTML=''}};
}};})();
