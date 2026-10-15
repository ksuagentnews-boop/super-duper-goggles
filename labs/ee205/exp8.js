/* EE205 · Experiment 8 · Resonance in Series and Parallel Circuits (manual pp. 64–75). Steps follow the manual's procedure,
   one per numbered step.
   Procedure I: Fig. 6, series 100 Ω + 17.5 mH + 4.7 µF → E, I, VR, VL, VC, Z = E/I, θ, P, PF.
   Procedure II: Fig. 7, 4.7 µF ∥ 100 Ω ∥ 17.5 mH → E, I, IR, IC, IL, ZL, Z, θ (10 Ω in series, CRO), the phase between
   IC and IL (10 Ω in series with each).
   Procedure III: Fig. 8, series 100 Ω + 17.5 mH + 10 nF, V fixed at 2 Vrms, 7.5 → 15 kHz in 500 Hz steps → I, P = I²R
   (Table 1) → fos, f1, f2, B, Qo.
   Procedure IV: Fig. 9, 5 kΩ ∥ 4.38 mH ∥ 0.1 µF, V = 2 Vrms, 6 → 9 kHz in 200 Hz steps → I, Z = V/I (Table 2) → fop, f1,
   f2, B, Qo.
   Instruments: Metrix MTX 3240, Hameg HM 203-7 (CRO), Fluke 77 (voltmeter), BK 2704B (ammeter, as on the table photo).
   Figures in the lab's rectangle layout: the generator on the left (OUT 8, ⏚ 22), the voltmeter (Fluke, or CH I in III / IV)
   across it, the ammeter along the top (8 → 9), series parts along the top and down the right side, parallel branches
   hanging from the top bus (plugs 9–16, 10–17, 11–18 where the ammeter goes) onto the bottom bus 23-24-25.
   Assumptions: Figs. 6 and 7 draw no meters; the manual's step measures E and I, so Fig. 6 carries the BK in series and the
   Fluke across E, and Fig. 7 the Fluke across E with plugs in the four ammeter places (the BK goes into each in turn and
   the plug back). "Fig. 7 · 10 Ω with C and L" is the circuit of step II.4. Readings across parts and through branches are
   checked by topology (which part, which net), never by panel node numbers.
   Decisions: Procedures I and II give no source values: E = 2 Vrms at 1 kHz (the lab video's Procedure II readings
   IR 20.17, I 48.1, IC 60.9 mA are exactly what 2 Vrms at 1 kHz gives). Coil resistances: 17.5 mH (1000 turns) 17.6 Ω,
   4.38 mH (500 turns) 5.2 Ω (videos). In Procedures III and IV the handheld voltmeter cannot follow 7.5–15 kHz, so
   V = 2 Vrms is held with the CRO (5.66 Vpp on CH I); the BK ammeter reads flat at these frequencies as the lab's did. */
EXP_DEFS['ee205/exp8']=(()=>{const H=ENGINE.sheet;
const PARTS={R10:{t:'R',r:10.02,nom:10,lab:'10Ω'},R100:{t:'R',r:100.2,nom:100,lab:'100Ω'},R5k:{t:'R',r:4985,nom:5000,lab:'5kΩ'},
  L175:{t:'L',l:0.0175,rs:17.6,lab:'17.5mH'},L438:{t:'L',l:4.38e-3,rs:5.2,lab:'4.38mH'},
  C47:{t:'C',c:4.7e-6,np:true,mark:'4.7µ',col:'#c98a3a',lab:'4.7µF'},C1:{t:'C',c:1e-6,np:true,mark:'1µ',lab:'1µF'},C01:{t:'C',c:0.1e-6,np:true,mark:'0.1µ',lab:'0.1µF'},C10n:{t:'C',c:10e-9,np:true,mark:'10n',lab:'10nF'},BR:{t:'BR',lab:''}};
const F3=[];for(let f=7500;f<=15000;f+=500)F3.push(f);const F4=[];for(let f=6000;f<=9000;f+=200)F4.push(f);
const fig=(f,cap,w=400)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
const tr=(l,id,u,st='0.001')=>`<tr><td class="l">${l}</td><td>${H.num(id,st,80)} ${u}</td></tr>`;
const fk=f=>(f/1000).toFixed(3)+' kHz';
const sheet=`<div class="paper" id="paper">
<h2>Experiment 8 · Resonance in Series and Parallel Circuits</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">القراءات rms. احسب بالقيم الاسمية (R<sub>L</sub> للـ coil من عندك)، وبعدين اضغط "صحّح إجاباتي".</p>
<h3>Procedure I</h3>${fig('e8-fig6.png','Fig. 6: Series resonance (E = 2 Vrms, 1 kHz)')}
<table class="tbl"><caption>Procedure I · Series RLC circuit</caption>${tr('E','e1','V')}${tr('I','i1','mA','0.01')}${tr('V<sub>R</sub>','vr1','V')}${tr('V<sub>L</sub>','vl1','V')}${tr('V<sub>C</sub>','vc1','V')}
${tr('Z = E / I','z1','Ω','0.1')}${tr('θ (impedance diagram)','th1','°','0.1')}${tr('Average power P = I²R','p1','mW','0.01')}${tr('Power factor PF = cos θ','pf1','','0.001')}</table>
<h3>Procedure II</h3>${fig('e8-fig7.png','Fig. 7: Parallel resonance (E = 2 Vrms, 1 kHz)')}
<table class="tbl"><caption>Procedure II · Parallel RLC circuit</caption>${tr('E','e2','V')}${tr('I','i2','mA','0.01')}${tr('I<sub>R</sub>','ir2','mA','0.01')}${tr('I<sub>C</sub>','ic2','mA','0.01')}${tr('I<sub>L</sub>','il2','mA','0.01')}
${tr('Z<sub>L</sub> = E / I<sub>L</sub>','zl2','Ω','0.1')}${tr('Z = E / I','z2','Ω','0.1')}${tr('θ (CRO, 10 Ω in series)','th2','°','0.1')}${tr('F<sub>P</sub> = cos θ','pf2','','0.001')}${tr('P = I<sub>R</sub>² R','p2','mW','0.01')}${tr('Phase between I<sub>C</sub> and I<sub>L</sub> (CRO)','cl2','°','0.1')}</table>
<h3>Procedure III</h3>${fig('e8-fig8.png','Fig. 8: Series resonance (100 Ω, 17.5 mH, 10 nF)')}
<table class="tbl"><caption>Table 1 (Procedure III) · V = 2 V<sub>rms</sub></caption><tr><th>Frequency Setting</th><th>I (mA)</th><th>P = I²R (mW)</th></tr>
${F3.map(f=>`<tr><td>${fk(f)}</td><td>${H.num('s'+f,'0.01',70)}</td><td>${H.num('sp'+f,'0.001',70)}</td></tr>`).join('')}</table>
<table class="tbl"><caption>Procedure III · From the P(f) plot vs theory</caption><tr><th></th><th>f<sub>os</sub> (Hz)</th><th>f<sub>1</sub> (Hz)</th><th>f<sub>2</sub> (Hz)</th><th>B (Hz)</th><th>Q<sub>o</sub></th></tr>
<tr><td class="l">Measured</td>${['fos','f1s','f2s','bs','qs'].map(k=>`<td>${H.num(k,'1',66)}</td>`).join('')}</tr><tr><td class="l">Theoretical</td>${['fost','f1st','f2st','bst','qst'].map(k=>`<td>${H.num(k,'1',66)}</td>`).join('')}</tr></table>
<h3>Procedure IV</h3>${fig('e8-fig9.png','Fig. 9: Parallel resonance (5 kΩ, 4.38 mH, 0.1 µF)')}
<table class="tbl"><caption>Table 2 (Procedure IV) · V = 2 V<sub>rms</sub></caption><tr><th>Frequency Setting</th><th>I (mA)</th><th>Z = V/I (Ω)</th></tr>
${F4.map(f=>`<tr><td>${fk(f)}</td><td>${H.num('q'+f,'0.001',70)}</td><td>${H.num('qz'+f,'1',70)}</td></tr>`).join('')}</table>
<table class="tbl"><caption>Procedure IV · From the Z(f) plot vs theory</caption><tr><th></th><th>f<sub>op</sub> (Hz)</th><th>f<sub>1</sub> (Hz)</th><th>f<sub>2</sub> (Hz)</th><th>B (Hz)</th><th>Q<sub>o</sub></th></tr>
<tr><td class="l">Measured</td>${['fop','f1p','f2p','bp','qp'].map(k=>`<td>${H.num(k,'1',66)}</td>`).join('')}</tr><tr><td class="l">Theoretical</td>${['fopt','f1pt','f2pt','bpt','qpt'].map(k=>`<td>${H.num(k,'1',66)}</td>`).join('')}</tr></table>
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`;
/* the figures' reference wiring (rectangle layout, bottom-left node 22, top row 8–11, right column 11–25) */
const GN=[{lead:'gr',at:8},{lead:'gb',at:22}],FL=[{lead:'h1v',at:8},{lead:'h1c',at:22}],CR=[{lead:'c1r',at:8},{lead:'c1b',at:22}],BK=[{lead:'h2ma',at:8},{lead:'h2c',at:9}];
const SER=(r,l,c)=>[{part:[r,9,10]},{part:[l,10,11]},{part:[c,11,18]},{wire:[18,25]},{wire:[25,24]},{wire:[24,23]},{wire:[23,22]}];
const BUS=[{wire:[9,10]},{wire:[10,11]},{wire:[9,16]},{wire:[10,17]},{wire:[11,18]}],PAR=(r,l,c)=>[{part:[c,16,23]},{part:[r,17,24]},{part:[l,18,25]}],FG='labs/ee205/fig/';
const figs={
  '6':{img:FG+'e8-fig6.png',cap:'Fig. 6 · series RLC (E = 2 Vrms, 1 kHz; the BK in series, the Fluke across E)',lines:[...GN,...FL,...BK,...SER('R100','L175','C47')]},
  '7':{img:FG+'e8-fig7.png',cap:'Fig. 7 · parallel RLC (E = 2 Vrms, 1 kHz; plugs where the ammeter goes, the Fluke across E)',lines:[...GN,...FL,{wire:[8,9]},...BUS,...PAR('R100','L175','C47'),{wire:[23,24]},{wire:[24,25]},{wire:[22,23]}]},
  '7cl':{img:FG+'e8-fig7.png',cap:'Fig. 7 · 10 Ω in series with C and with L (CH I across the one under C, CH II under L)',lines:[...GN,...FL,{wire:[8,9]},...BUS,...PAR('R100','L175','C47'),
    {part:['R10',23,30]},{part:['R10',25,32]},{wire:[24,31]},{wire:[22,29]},{wire:[29,30]},{wire:[30,31]},{wire:[31,32]},{lead:'c1r',at:23},{lead:'c1b',at:22},{lead:'c2r',at:25},{lead:'c2b',at:22}]},
  '8':{img:FG+'e8-fig8.png',cap:'Fig. 8 · series resonance (100 Ω, 17.5 mH, 10 nF; V on CH I)',lines:[...GN,...CR,...BK,...SER('R100','L175','C10n')]},
  '9':{img:FG+'e8-fig9.png',cap:'Fig. 9 · parallel resonance (5 kΩ, 4.38 mH, 0.1 µF; V on CH I)',lines:[...GN,...CR,...BK,...BUS,...PAR('R5k','L438','C01'),{wire:[23,24]},{wire:[24,25]},{wire:[22,23]}]}};
return {figs,procs:[{id:'I',title:'Series RLC circuit (Fig. 6)'},{id:'II',title:'Parallel RLC circuit (Fig. 7)'},{id:'III',title:'Series resonance (Fig. 8, Table 1)'},{id:'IV',title:'Parallel resonance (Fig. 9, Table 2)'}],
sheet,params:()=>({}),
instruments:[
  {type:'metrix',prev:{freq:5000,amp:3,wave:'Sine'}},
  {type:'hameg',procs:['II','III','IV'],prev:sc=>{sc.ch[0].vd=0.2;sc.td=1e-3}},
  {type:'hdmm',model:'fluke77',n:1,procs:['I','II'],prev:d=>{d.pos=2}},
  {type:'hdmm',model:'bk2704',n:2}],
parts:PARTS,
tray:[['R10','10 Ω'],['R100','100 Ω'],['R5k','5 kΩ'],['L175','17.5 mH coil'],['L438','4.38 mH coil'],['C47','4.7 µF'],['C1','1 µF'],['C01','0.1 µF'],['C10n','10 nF'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),G=ENGINE.sheet;let ST={};
  const W1=2*Math.PI*1000;
  /* theory (nominal values, coil resistances included) */
  const c=(r,i)=>({r,i}),add=(a,b)=>c(a.r+b.r,a.i+b.i),inv=a=>{const d=a.r*a.r+a.i*a.i;return c(a.r/d,-a.i/d)},abs=a=>Math.hypot(a.r,a.i),arg=a=>Math.atan2(a.i,a.r)*180/Math.PI;
  const ZL1=c(17.6,W1*0.0175),ZC1=c(0,-1/(W1*4.7e-6));
  const T={};{const Z=add(add(c(100,0),ZL1),ZC1);T.z1=abs(Z);T.th1=arg(Z);const Y=add(add(inv(ZC1),c(0.01,0)),inv(ZL1));T.z2=1/abs(Y);T.th2=arg(Y);T.zl2=abs(ZL1);
    T.cl2=Math.abs(arg(inv(ZC1))-arg(inv(ZL1)));
    T.fos=1/(2*Math.PI*Math.sqrt(0.0175*10e-9));T.bs=117.6/(2*Math.PI*0.0175);T.qs=T.fos/T.bs;T.f1s=T.fos-T.bs/2;T.f2s=T.fos+T.bs/2;
    T.fop=1/(2*Math.PI*Math.sqrt(4.38e-3*0.1e-6));const Rp=1/(1/5000+5.2*0.1e-6/4.38e-3);T.bp=1/(2*Math.PI*Rp*0.1e-6);T.qp=T.fop/T.bp;T.f1p=T.fop-T.bp/2;T.f2p=T.fop+T.bp/2}
  const genV=()=>{const gn=RT.leadNet('gr');if(gn==null||gn<0)return 0;const v=RT.samples(gn,300);const m=v.reduce((a,b)=>a+b,0)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)*(b-m),0)/v.length)};
  const sine=f=>{const g=K.gen();return g.on&&g.wave==='Sine'&&g.f===f&&Math.abs(g.off)<1e-9};
  const v2=()=>Math.abs(genV()-2)<=0.05;
  const ACV=(a,b)=>K.across('ACV',a,b,true),ACI=(a,b)=>{const i=K.amm(a,b,'ACI');return i!=null?i:K.amm(b,a,'ACI')};
  /* topology, never panel nodes: the nets of the one part of a type, a part between two nets */
  const one=t=>{const ps=RT.S.parts.filter(p=>p.type===t);return ps.length===1?RT.partNets(ps[0]):null};
  const has=(t,a,b)=>a!=null&&b!=null&&RT.between(a,b).some(x=>x.p.type===t);
  /* a series chain source → (ammeter) → r → l → c → ground: {r0, x, y} (x = r–l, y = l–c) */
  function chain(r,l,c){const R=one(r),L=one(l),C=one(c);if(!R||!L||!C)return null;const x=R.find(n=>L.includes(n)),y=L.find(n=>C.includes(n));if(x==null||y==null||x===y)return null;
    const r0=R[0]===x?R[1]:R[0],c0=C[0]===y?C[1]:C[0];if(c0!==-1||r0===x||r0===-1)return null;return {r0,x,y}}
  /* parallel branches of the given types: each part's bottom is ground (or a net with a 10 Ω to ground), the tops meet on the bus T */
  const gndish=n=>n===-1||has('R10',n,-1);
  function branches(types){const out=[];for(const t of types){const P=one(t);if(!P)return null;const g0=gndish(P[0]),g1=gndish(P[1]);if(g0===g1)return null;out.push(g0?{t,top:P[1],bot:P[0]}:{t,top:P[0],bot:P[1]})}
    const cnt={};out.forEach(b=>cnt[b.top]=(cnt[b.top]||0)+1);const T=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];if(cnt[T]<2)return null;return {B:out,T}}
  /* the phase (°) between two node voltages, from their fundamental phasors */
  function phasor(net){const N=360,v=RT.samples(net,N);let re=0,im=0;for(let k=0;k<N;k++){re+=v[k]*Math.cos(2*Math.PI*k/N);im-=v[k]*Math.sin(2*Math.PI*k/N)}return Math.atan2(im,re)*180/Math.PI}
  const phase=(a,b)=>{let d=Math.abs(phasor(a)-phasor(b))%360;return d>180?360-d:d};
  function status(){const st={};const g=RT.leadNet('gr'),gb=RT.leadNet('gb');st.v=genV();st.v2=v2();const sc=RT.S.sc,md=RT.inst.sc.mode();const dual=sc.pwr&&(md==='DUAL'||md==='CHOP')&&!sc.xy;
    /* Procedure I · Fig. 6: E, VR, VL, VC with the Fluke wherever it sits, I with the BK in series */
    const c6=g!=null&&gb===-1?chain('R100','L175','C47'):null;st.c6=c6;
    if(c6&&(c6.r0===g||K.ammOn(g,c6.r0))&&sine(1000)&&st.v2){[['e1',g,-1],['vr1',c6.r0,c6.x],['vl1',c6.x,c6.y],['vc1',c6.y,-1]].forEach(([k,a,b])=>{const v=ACV(a,b);if(v!=null)ST[k]=v});
      if(c6.r0!==g){const i=ACI(g,c6.r0);if(i!=null)ST.i1=i}}
    /* Procedure II · Fig. 7: the BK in the main line or in one branch (plugs elsewhere), θ with 10 Ω under the bus, IC vs IL with 10 Ω under C and L */
    const b7=g!=null&&gb===-1?branches(['C47','R100','L175']):null;
    if(b7&&sine(1000)){const {B,T}=b7,bot=k=>B.find(b=>b.t===k).bot,top=k=>B.find(b=>b.t===k).top;const allBot=B.every(b=>b.bot===-1),closed=g===T&&B.every(b=>b.top===T);
      st.closed7=closed&&allBot;
      if(st.v2&&allBot){if(st.closed7){const v=ACV(T,-1);if(v!=null)ST.e2=v}
        const open=[g!==T?['i2',g,T]:null,...B.map(b=>b.top!==T?[{C47:'ic2',R100:'ir2',L175:'il2'}[b.t],T,b.top]:null)].filter(Boolean);
        if(open.length===1){const [k,a,c]=open[0];const i=K.ammOn(a,c)?ACI(a,c):null;if(i!=null)ST[k]=i}}
      const Bn=bot('C47');st.thc=closed&&Bn!==-1&&B.every(b=>b.bot===Bn)&&has('R10',Bn,-1);
      if(st.thc&&RT.leadNet('c1r')===T&&RT.leadNet('c2r')===Bn&&dual){ST.th2=true;st.th=phase(T,Bn)}
      const cb=bot('C47'),lb=bot('L175');st.clc=closed&&bot('R100')===-1&&cb!==-1&&lb!==-1&&cb!==lb&&has('R10',cb,-1)&&has('R10',lb,-1);
      if(st.clc&&RT.leadNet('c1r')===cb&&RT.leadNet('c2r')===lb&&dual){ST.cl2=true;st.cl=phase(cb,lb)}}
    /* Procedure III · Fig. 8: the BK in series from the source */
    const c8=g!=null&&gb===-1?chain('R100','L175','C10n'):null;
    if(c8&&c8.r0!==g&&K.ammOn(g,c8.r0)&&st.v2){const f=K.gen().f;if(sine(f)&&F3.includes(f)){const i=ACI(g,c8.r0);if(i!=null)ST['s'+f]=i}}
    /* Procedure IV · Fig. 9: the BK in the main line, the three branches between the bus and ground */
    const b9=g!=null&&gb===-1?branches(['R5k','L438','C01']):null;
    if(b9&&b9.B.every(b=>b.bot===-1&&b.top===b9.T)&&b9.T!==g&&K.ammOn(g,b9.T)&&st.v2){const f=K.gen().f;if(sine(f)&&F4.includes(f)){const i=ACI(g,b9.T);if(i!=null)ST['p'+f]=i}}
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const rd=(k,sc=1,u='',id=k)=>[ST[k]!=null&&G.near(v(id),ST[k]*sc,Math.abs(ST[k]*sc)*0.003+0.011),ST[k]!=null?`${(ST[k]*sc).toFixed(sc>1?2:3)} ${u}`:'measure it'];
    g.proc('I');[['e1','E','V'],['vr1','VR','V'],['vl1','VL','V'],['vc1','VC','V']].forEach(([k,t,u])=>g.add(...rd(k,1,u).slice(0,1),t,rd(k,1,u)[1]));g.add(...rd('i1',1e3,'mA').slice(0,1),'I',rd('i1',1e3,'mA')[1]);
    g.add(G.near(v('z1'),v('e1')/v('i1')*1e3,0.5),'Z = E/I');g.add(G.near(v('th1'),T.th1,2),'θ',`≈ ${T.th1.toFixed(1)}° (inductive above f0 = 555 Hz)`);
    g.add(G.near(v('p1'),Math.pow(v('i1')/1e3,2)*100*1e3,0.05)||G.near(v('p1'),Math.pow(v('i1')/1e3,2)*117.6*1e3,0.05),'P = I²R');g.add(G.near(v('pf1'),Math.cos(T.th1*Math.PI/180),0.02),'PF',`cos θ ≈ ${Math.cos(T.th1*Math.PI/180).toFixed(3)}`);
    g.proc('II');g.add(...rd('e2',1,'V').slice(0,1),'E',rd('e2',1,'V')[1]);[['i2','I'],['ir2','IR'],['ic2','IC'],['il2','IL']].forEach(([k,t])=>g.add(rd(k,1e3,'mA')[0],t,rd(k,1e3,'mA')[1]));
    g.add(G.near(v('zl2'),v('e2')/v('il2')*1e3,0.5),'ZL = E/IL',`≈ ${T.zl2.toFixed(1)} Ω`);g.add(G.near(v('z2'),v('e2')/v('i2')*1e3,0.5),'Z = E/I',`≈ ${T.z2.toFixed(1)} Ω`);
    g.add(ST.th2&&G.near(Math.abs(v('th2')),Math.abs(T.th2),5),'θ on the CRO',ST.th2?`≈ ${Math.abs(T.th2).toFixed(0)}° (I leads E: capacitive)`:'show E and the 10 Ω voltage on the CRO');
    g.add(G.near(v('pf2'),Math.cos(v('th2')*Math.PI/180),0.02),'Fp = cos θ');g.add(G.near(v('p2'),Math.pow(v('ir2')/1e3,2)*100*1e3,0.05),'P = IR² R');
    g.add(ST.cl2&&G.near(v('cl2'),T.cl2,8),'IC vs IL phase',ST.cl2?`≈ ${T.cl2.toFixed(0)}° (almost opposite)`:'show both 10 Ω voltages on the CRO');
    g.proc('III');F3.forEach(f=>{g.add(rd('s'+f,1e3,'mA')[0],`Table 1 · ${fk(f)} I`,rd('s'+f,1e3,'mA')[1]);g.add(G.near(v('sp'+f),Math.pow(v('s'+f)/1e3,2)*100*1e3,0.002+Math.pow(v('s'+f)/1e3,2)*100*1e3*0.003),`Table 1 · ${fk(f)} P`,'I² × 100 Ω')});
    const peak=(pre,list)=>list.reduce((b,f)=>ST[pre+f]!=null&&(b==null||(pre==='s'?ST[pre+f]>ST[pre+b]:ST[pre+f]<ST[pre+b]))?f:b,null);
    const ps=peak('s',F3);g.add(ps!=null&&Math.abs(v('fos')-ps)<=500,'fos measured',`near ${ps} Hz (largest P)`);g.add(Math.abs(v('f1s')-T.f1s)<=450,'f1 measured',`≈ ${T.f1s.toFixed(0)} Hz (P = Pmax/2)`);g.add(Math.abs(v('f2s')-T.f2s)<=450,'f2 measured',`≈ ${T.f2s.toFixed(0)} Hz`);
    g.add(G.near(v('bs'),v('f2s')-v('f1s'),2),'B = f2 − f1');g.add(G.near(v('qs'),v('fos')/v('bs'),0.2),'Qo = fos / B');
    g.add(G.near(v('fost'),T.fos,40),'fos theoretical',`1/(2π√LC) = ${T.fos.toFixed(0)} Hz`);g.add(G.near(v('bst'),T.bs,40)||G.near(v('bst'),100/(2*Math.PI*0.0175),20),'B theoretical',`R/(2πL) ≈ ${T.bs.toFixed(0)} Hz (R + RL)`);
    g.add(G.near(v('f1st'),v('fost')-v('bst')/2,30),'f1 theoretical');g.add(G.near(v('f2st'),v('fost')+v('bst')/2,30),'f2 theoretical');g.add(G.near(v('qst'),v('fost')/v('bst'),0.3),'Qo theoretical');
    g.proc('IV');F4.forEach(f=>{g.add(rd('p'+f,1e3,'mA','q'+f)[0],`Table 2 · ${fk(f)} I`,rd('p'+f,1e3,'mA')[1]);g.add(G.near(v('qz'+f),2/(v('q'+f)/1e3),2/(v('q'+f)/1e3)*0.01+1),`Table 2 · ${fk(f)} Z`,'V / I')});
    const pp=peak('p',F4);g.add(pp!=null&&Math.abs(v('fop')-pp)<=200,'fop measured',`near ${pp} Hz (largest Z)`);g.add(Math.abs(v('f1p')-T.f1p)<=200,'f1 measured',`≈ ${T.f1p.toFixed(0)} Hz (Z = Zmax/√2)`);g.add(Math.abs(v('f2p')-T.f2p)<=200,'f2 measured',`≈ ${T.f2p.toFixed(0)} Hz`);
    g.add(G.near(v('bp'),v('f2p')-v('f1p'),2),'B = f2 − f1');g.add(G.near(v('qp'),v('fop')/v('bp'),0.3),'Qo = fop / B');
    g.add(G.near(v('fopt'),T.fop,40),'fop theoretical',`1/(2π√LC) = ${T.fop.toFixed(0)} Hz`);g.add(G.near(v('bpt'),T.bp,40)||G.near(v('bpt'),1/(2*Math.PI*5000*0.1e-6),15),'B theoretical',`1/(2πRC) ≈ ${T.bp.toFixed(0)} Hz`);
    g.add(G.near(v('f1pt'),v('fopt')-v('bpt')/2,30),'f1 theoretical');g.add(G.near(v('f2pt'),v('fopt')+v('bpt')/2,30),'f2 theoretical');g.add(G.near(v('qpt'),v('fopt')/v('bpt'),0.3),'Qo theoretical');
    g.show($('result'))});
  const mA=k=>()=>ST[k]!=null?ST[k]*1e3:null;
  const sweep=(pre,list,id)=>list.map(f=>({to:id+f,label:fk(f),unit:'mA',dec:pre==='p'?3:2,val:mA(pre+f)}));
  return {status,
    steps:[
      /* Procedure I (manual p. 72), steps 1–4 */
      {dev:'board',build:'6',t:'Procedure I · 1. وصّل دائرة Fig. 6 وقِس E و I و V<sub>R</sub> و V<sub>L</sub> و V<sub>C</sub> و Z = E/I.',
        acts:['وصّل Fig. 6 مع الـ BK (ACA 200m) على التوالي من المصدر، والـ Fluke (V~) على E.','الـ generator: Sine، 1 kHz، و OUTPUT ON، وعدّل AMPL لين E = 2.00 V.','قِس V<sub>R</sub> و V<sub>L</sub> و V<sub>C</sub> بالـ Fluke، وبعدين رجّعه على E.'],
        ok:s=>['e1','i1','vr1','vl1','vc1'].every(k=>ST[k]!=null),
        rec:[{to:'e1',label:'E',unit:'V',dec:3,val:()=>ST.e1},{to:'i1',label:'I',unit:'mA',dec:2,val:mA('i1')},{to:'vr1',label:'V<sub>R</sub>',unit:'V',dec:3,val:()=>ST.vr1},{to:'vl1',label:'V<sub>L</sub>',unit:'V',dec:3,val:()=>ST.vl1},{to:'vc1',label:'V<sub>C</sub>',unit:'V',dec:3,val:()=>ST.vc1}]},
      {dev:'board',t:'2. بالـ impedance diagram أثبت إن Z = Z<sub>R</sub> + Z<sub>L</sub> + Z<sub>C</sub> تساوي قيمة Z المقاسة في خطوة 1، واحسب θ.',ok:s=>ST.i1!=null},
      {dev:'board',t:'3. أثبت إن E = V<sub>R</sub> + V<sub>L</sub> + V<sub>C</sub> (phasors).',ok:s=>ST.vc1!=null},
      {dev:'board',t:'4. احسب الـ Average Power والـ Power Factor لدائرة Fig. 6.',ok:s=>ST.i1!=null},
      /* Procedure II (manual p. 73), steps 1–4 */
      {dev:'board',build:'7',t:'Procedure II · 1. وصّل دائرة Fig. 7 وقِس E و V<sub>R</sub> و V<sub>C</sub> و V<sub>L</sub> و I و I<sub>R</sub> و I<sub>C</sub> و I<sub>L</sub> و Z<sub>L</sub> و Z و θ و F<sub>P</sub> و P (تلميح: استخدم مقاومة 10 Ω على التوالي عشان تلقى θ). لاحظ إن Z = V/I.',
        acts:['وصّل Fig. 7: bridging plug في كل مكان يروح له الأميتر (الخط الرئيسي وكل فرع)، والـ Fluke (V~) على E.','OUTPUT ON على 1 kHz، وعدّل AMPL لين E = 2.00 V.','قِس I و I<sub>C</sub> و I<sub>R</sub> و I<sub>L</sub>: الـ BK مكان الـ plug، وبعدين رجّع الـ plug.','θ: 10 Ω بين الـ bottom bus والأرضي، CH I على E و CH II على الـ 10 Ω، و DUAL. بعدها رجّع الـ plug مكان الـ 10 Ω.'],
        ok:s=>['e2','i2','ir2','ic2','il2'].every(k=>ST[k]!=null)&&ST.th2,
        rec:[{to:'e2',label:'E',unit:'V',dec:3,val:()=>ST.e2},{to:'i2',label:'I',unit:'mA',dec:2,val:mA('i2')},{to:'ir2',label:'I<sub>R</sub>',unit:'mA',dec:2,val:mA('ir2')},{to:'ic2',label:'I<sub>C</sub>',unit:'mA',dec:2,val:mA('ic2')},{to:'il2',label:'I<sub>L</sub>',unit:'mA',dec:2,val:mA('il2')},
          {to:'th2',label:'θ (CRO)',unit:'°',dec:1,val:()=>{const s=status();return s.th!=null?s.th:null},none:'حط الـ 10 Ω بين الـ bottom bus والأرضي، و CH I على E و CH II على الـ 10 Ω، و DUAL'}]},
      {dev:'board',t:'2. احسب Z<sub>R</sub> و Z<sub>C</sub> و Z<sub>L</sub> و Z بقانون أوم.',ok:s=>ST.il2!=null},
      {dev:'board',t:'3. احسب I من I = E/Z = EY وقارن النتيجة بالقيمة المقاسة.',ok:s=>ST.i2!=null},
      {dev:'board',build:'7cl',t:'4. باستخدام الـ CRO قِس زاوية الطور بين I<sub>C</sub> و I<sub>L</sub> (تلميح: استخدم مقاومة 10 Ω على التوالي مع L ومع C عشان تلقى الزاوية).',
        acts:['10 Ω تحت المكثف و 10 Ω تحت الـ coil، والـ R على الأرضي مباشرة.','CH I على الـ 10 Ω اللي مع C، و CH II على اللي مع L، والأرضي على الأرضي، و DUAL.'],ok:s=>ST.cl2,
        rec:[{to:'cl2',label:'I<sub>C</sub> ↔ I<sub>L</sub>',unit:'°',dec:1,val:()=>{const s=status();return s.cl!=null?s.cl:null}}]},
      /* Procedure III (manual p. 73), steps 1–5 */
      {dev:'board',build:'8',t:'Procedure III · 1. وصّل الدائرة اللي في Fig. 8.',acts:['الـ BK على ACA 20m على التوالي، و CH I على المصدر يقيس V (الـ Fluke ما يلحق الـ kHz العالية).']},
      {dev:'gen',t:'2. خلّ جهد الدخل الـ sinusoidal على 2 V<sub>rms</sub> وغيّر التردد من 7.5 kHz لين 15 kHz بخطوات 500 Hz. عند كل تردد ثبّت V على 2 V<sub>rms</sub> (5.66 Vpp على CH I)، وقِس التيار I، وسجّل القيم في Table 1.',ok:s=>F3.every(f=>ST['s'+f]!=null),rec:sweep('s',F3,'s')},
      {dev:'gen',t:'3. احسب P = I²R وكمّل Table 1 (P = I²R إذا I قيمة rms، و P = ½I²R إذا I قيمة peak).',ok:s=>F3.every(f=>ST['s'+f]!=null)},
      {dev:'gen',t:'4. ارسم P ضد التردد، ومن الرسم طلّع الـ resonant frequency f<sub>os</sub>، والـ half-power frequencies f<sub>1</sub> و f<sub>2</sub>، والـ bandwidth B، والـ quality factor Q<sub>o</sub>.',ok:s=>F3.every(f=>ST['s'+f]!=null)},
      {dev:'gen',t:'5. قارن f<sub>os</sub> و f<sub>1</sub> و f<sub>2</sub> و B و Q<sub>o</sub> المقاسة بالقيم النظرية من Eqs. 6-a و 6-b و 6-c و 7 و 9.',ok:s=>F3.every(f=>ST['s'+f]!=null)},
      /* Procedure IV (manual pp. 74–75), steps 1–4 */
      {dev:'board',build:'9',t:'Procedure IV · 1. وصّل الدائرة اللي في Fig. 9.',acts:['الـ BK على ACA 2m على التوالي، و CH I على المصدر.']},
      {dev:'gen',t:'2. خلّ جهد الدخل الـ sinusoidal على 2 V<sub>rms</sub> وغيّر التردد من 6 kHz لين 9 kHz بخطوات 200 Hz. عند كل تردد حاول تثبّت V على 2 V<sub>rms</sub>، وقِس I وسجّله في Table 2.',ok:s=>F4.every(f=>ST['p'+f]!=null),rec:sweep('p',F4,'q')},
      {dev:'gen',t:'3. احسب Z = V/I وكمّل Table 2.',ok:s=>F4.every(f=>ST['p'+f]!=null)},
      {dev:'gen',t:'4. ارسم Z ضد التردد، ومنه طلّع الـ resonant frequency f<sub>op</sub>، والـ half-power frequencies f<sub>1</sub> و f<sub>2</sub>، والـ bandwidth B، والـ quality factor Q<sub>o</sub>.',ok:s=>F4.every(f=>ST['p'+f]!=null)}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
