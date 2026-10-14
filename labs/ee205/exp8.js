/* EE205 · Experiment 8 · Resonance in Series and Parallel Circuits (manual pp. 64–75).
   Procedure I: Fig. 6, series 100 Ω + 17.5 mH + 4.7 µF → E, I, VR, VL, VC, Z = E/I, θ, P, PF.
   Procedure II: Fig. 7, 4.7 µF ∥ 100 Ω ∥ 17.5 mH → E, I, IR, IC, IL, ZL, Z, θ (10 Ω in series, CRO), the phase between
   IC and IL (10 Ω in series with each).
   Procedure III: Fig. 8, series 100 Ω + 17.5 mH + 10 nF, V fixed at 2 Vrms, 7.5 → 15 kHz in 500 Hz steps → I, P = I²R
   (Table 1) → fos, f1, f2, B, Qo.
   Procedure IV: Fig. 9, 5 kΩ ∥ 4.38 mH ∥ 0.1 µF, V = 2 Vrms, 6 → 9 kHz in 200 Hz steps → I, Z = V/I (Table 2) → fop, f1,
   f2, B, Qo.
   Instruments: Metrix MTX 3240, Hameg HM 203-7 (CRO), Fluke 77 (voltmeter), BK 2704B (ammeter, as on the table photo).
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
return {procs:[{id:'I',title:'Series RLC circuit (Fig. 6)'},{id:'II',title:'Parallel RLC circuit (Fig. 7)'},{id:'III',title:'Series resonance (Fig. 8, Table 1)'},{id:'IV',title:'Parallel resonance (Fig. 9, Table 2)'}],
sheet,params:()=>({}),
instruments:[
  {type:'metrix',prev:{freq:5000,amp:3,wave:'Sine'}},
  {type:'hameg',procs:['II','III','IV'],prev:sc=>{sc.ch[0].vd=0.2;sc.td=1e-3}},
  {type:'hdmm',model:'fluke77',n:1,procs:['I','II'],prev:d=>{d.pos=2}},
  {type:'hdmm',model:'bk2704',n:2}],
parts:PARTS,
tray:[['R10','10 Ω'],['R100','100 Ω'],['R5k','5 kΩ'],['L175','17.5 mH coil'],['L438','4.38 mH coil'],['C47','4.7 µF'],['C1','1 µF'],['C01','0.1 µF'],['C10n','10 nF'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const K=ENGINE.labkit(RT),N=K.N,G=ENGINE.sheet;let ST={};
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
  const ACV=(a,b)=>K.across('ACV',N(a),b===-1?-1:N(b),true),ACI=(a,b)=>K.amm(N(a),N(b),'ACI');
  const meterOut=()=>!RT.meters().some(m=>m.D.jack==='A'&&m.hi!=null&&m.lo!=null&&m.hi!==m.lo);
  function status(){const st={};const gn=RT.leadNet('gr'),gb=RT.leadNet('gb');st.v=genV();st.v2=v2();
    /* Procedure I · Fig. 6: gen 1, plug / ammeter 1–2, 100 Ω 2–3, coil 3–4, 4.7 µF 4–11, gen ⏚ 11 */
    st.fig6=gn===N(1)&&gb===-1&&N(11)===-1&&K.has('R100',2,3)&&K.has('L175',3,4)&&K.has('C47',4,11)&&(N(1)===N(2)||K.ammOn(N(1),N(2)));
    st.run1=st.fig6&&sine(1000)&&st.v2;
    if(st.run1){[['e1',1,-1],['vr1',2,3],['vl1',3,4],['vc1',4,-1]].forEach(([k,a,b])=>{const v=ACV(a,b);if(v!=null&&(k!=='e1'||N(1)===N(2)))ST[k]=v});const i=ACI(1,2);if(i!=null)ST.i1=i}
    /* Procedure II · Fig. 7: gen 7, plug 7–8 (I); top bus 8-9-10; plugs 8–15 (IC), 9–16 (IR), 10–17 (IL); 4.7 µF 15–22, 100 Ω 16–23, coil 17–24;
       bottom bus 22-23-24; 23 → 30 (plug, or 10 Ω for θ); gen ⏚ 30 (ground row 29-30-31) */
    const br=K.has('C47',15,22)&&K.has('R100',16,23)&&K.has('L175',17,24);st.br=br;
    const top=N(8)===N(9)&&N(9)===N(10);const pl=(a,b)=>N(a)===N(b)||K.ammOn(N(a),N(b));
    st.fig7=gn===N(7)&&gb===-1&&N(30)===-1&&br&&top&&pl(7,8)&&pl(8,15)&&pl(9,16)&&pl(10,17)&&N(22)===N(23)&&N(23)===N(24)&&N(23)===-1;
    st.closed7=st.fig7&&N(7)===N(8)&&N(8)===N(15)&&N(9)===N(16)&&N(10)===N(17);
    st.run2=st.fig7&&sine(1000)&&st.v2;
    if(st.run2){if(st.closed7){const v=ACV(8,-1);if(v!=null)ST.e2=v}
      const only=(a,b)=>[[7,8],[8,15],[9,16],[10,17]].every(([x,y])=>(x===a&&y===b)||N(x)===N(y));
      [['i2',7,8],['ic2',8,15],['ir2',9,16],['il2',10,17]].forEach(([k,a,b])=>{if(only(a,b)){const i=ACI(a,b);if(i!=null)ST[k]=i}})}
    /* θ: 10 Ω from the bottom bus to ground (23–30), CH I = E (top bus), CH II = across the 10 Ω */
    const S=RT.S.sc,md=RT.inst.sc.mode();const dual=S.pwr&&(md==='DUAL'||md==='CHOP')&&!S.xy;
    st.th=gn===N(7)&&br&&top&&N(7)===N(8)&&N(8)===N(15)&&N(9)===N(16)&&N(10)===N(17)&&N(22)===N(23)&&N(23)===N(24)&&K.has('R10',23,30)&&N(23)!==-1&&N(30)===-1&&sine(1000);
    if(st.th&&RT.leadNet('c1r')===N(8)&&RT.leadNet('c2r')===N(23)&&dual)ST.th2=true;
    /* IC vs IL: 10 Ω under C (22–29) and under L (24–31), R straight to ground (23–30 plug); CH I on 22, CH II on 24 */
    st.cl=gn===N(7)&&br&&top&&N(7)===N(8)&&N(8)===N(15)&&N(9)===N(16)&&N(10)===N(17)&&K.has('R10',22,29)&&K.has('R10',24,31)&&N(23)===-1&&N(29)===-1&&N(31)===-1&&N(22)!==-1&&N(24)!==-1&&N(22)!==N(24)&&sine(1000);
    if(st.cl&&RT.leadNet('c1r')===N(22)&&RT.leadNet('c2r')===N(24)&&dual)ST.cl2=true;
    /* Procedure III · Fig. 8: gen 1, ammeter 1 → 2, 100 Ω 2–3, coil 3–4, 10 nF 4–11, gen ⏚ 11, CH I on 1 */
    st.fig8=gn===N(1)&&gb===-1&&N(11)===-1&&K.has('R100',2,3)&&K.has('L175',3,4)&&K.has('C10n',4,11)&&K.ammOn(N(1),N(2));
    st.cro=RT.leadNet('c1r')===gn&&gn!=null&&S.pwr;
    if(st.fig8&&st.v2){const g=K.gen();if(sine(g.f)&&F3.includes(g.f)){const i=ACI(1,2);if(i!=null)ST['s'+g.f]=i}}
    /* Procedure IV · Fig. 9: gen 1, ammeter 1 → 2, top bus 2-3-4, 5 kΩ 2–9, 4.38 mH 3–10, 0.1 µF 4–11, bottom bus 9-10-11, gen ⏚ 9 */
    st.fig9=gn===N(1)&&gb===-1&&N(9)===-1&&N(10)===-1&&N(11)===-1&&N(2)===N(3)&&N(3)===N(4)&&K.has('R5k',2,9)&&K.has('L438',3,10)&&K.has('C01',4,11)&&K.ammOn(N(1),N(2));
    if(st.fig9&&st.v2){const g=K.gen();if(sine(g.f)&&F4.includes(g.f)){const i=ACI(1,2);if(i!=null)ST['p'+g.f]=i}}
    st.clear=!RT.S.parts.length&&!RT.S.wires.length;st.genOff=!RT.S.gen.out||!RT.S.gen.pwr;st.mOut=meterOut();
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v;const rd=(k,sc=1,u='')=>[ST[k]!=null&&G.near(v(k),ST[k]*sc,Math.abs(ST[k]*sc)*0.003+0.011),ST[k]!=null?`${(ST[k]*sc).toFixed(sc>1?2:3)} ${u}`:'measure it'];
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
    g.proc('IV');F4.forEach(f=>{g.add(rd('p'+f,1e3,'mA')[0],`Table 2 · ${fk(f)} I`,rd('p'+f,1e3,'mA')[1]);g.add(G.near(v('qz'+f),2/(v('q'+f)/1e3),2/(v('q'+f)/1e3)*0.01+1),`Table 2 · ${fk(f)} Z`,'V / I')});
    const pp=peak('p',F4);g.add(pp!=null&&Math.abs(v('fop')-pp)<=200,'fop measured',`near ${pp} Hz (largest Z)`);g.add(Math.abs(v('f1p')-T.f1p)<=200,'f1 measured',`≈ ${T.f1p.toFixed(0)} Hz (Z = Zmax/√2)`);g.add(Math.abs(v('f2p')-T.f2p)<=200,'f2 measured',`≈ ${T.f2p.toFixed(0)} Hz`);
    g.add(G.near(v('bp'),v('f2p')-v('f1p'),2),'B = f2 − f1');g.add(G.near(v('qp'),v('fop')/v('bp'),0.3),'Qo = fop / B');
    g.add(G.near(v('fopt'),T.fop,40),'fop theoretical',`1/(2π√LC) = ${T.fop.toFixed(0)} Hz`);g.add(G.near(v('bpt'),T.bp,40)||G.near(v('bpt'),1/(2*Math.PI*5000*0.1e-6),15),'B theoretical',`1/(2πRC) ≈ ${T.bp.toFixed(0)} Hz`);
    g.add(G.near(v('f1pt'),v('fopt')-v('bpt')/2,30),'f1 theoretical');g.add(G.near(v('f2pt'),v('fopt')+v('bpt')/2,30),'f2 theoretical');g.add(G.near(v('qpt'),v('fopt')/v('bpt'),0.3),'Qo theoretical');
    g.show($('result'))});
  const P6='labs/ee205/fig/e8-fig6.png',P7='labs/ee205/fig/e8-fig7.png',P8='labs/ee205/fig/e8-fig8.png',P9='labs/ee205/fig/e8-fig9.png';
  return {status,
    steps:[
      {dev:'board',fig:P6,figCap:'Fig. 6',t:'Procedure I: ركّب Fig. 6 (series). بين node 1 و node 2 bridging plug مكان الأميتر بعدين.',
        lines:[{t:'bridging plug: node 1 ↔ node 2',wire:[1,2]},{t:'R = 100 Ω: node 2 ↔ node 3',part:['R100',2,3]},{t:'L = 17.5 mH: node 3 ↔ node 4',part:['L175',3,4]},{t:'C = 4.7 µF: node 4 ↔ node 11',part:['C47',4,11]},
          {t:'GEN OUT red → node 1',lead:'gr',at:1},{t:'GEN ⏚ black → node 11',lead:'gb',at:11}],ok:s=>s.fig6},
      {dev:'gen',t:'شغّل الـ generator: Sine، 1 kHz، و OUTPUT ON. حط الـ Fluke على V~ على المصدر (VΩ → node 1، COM → node 11) وعدّل AMPL لين E = 2.00 V.',lines:[{t:'Fluke VΩ → node 1',lead:'h1v',at:1},{t:'Fluke COM → node 11',lead:'h1c',at:11}],ok:s=>ST.e1!=null},
      {dev:'hm1',t:'1. قِس V<sub>R</sub> (node 2 ↔ 3)، و V<sub>L</sub> (node 3 ↔ 4)، و V<sub>C</sub> (node 4 ↔ 11).',ok:s=>ST.vr1!=null&&ST.vl1!=null&&ST.vc1!=null},
      {dev:'hm2',t:'وقِس I: شيل الـ plug بين node 1 و node 2، وحط الـ BK على ACA 200m مكانه (mA → node 1، COM → node 2). احسب Z = E/I و θ و P و PF.',lines:[{t:'BK mA (red) → node 1',lead:'h2ma',at:1},{t:'BK COM → node 2',lead:'h2c',at:2}],ok:s=>ST.i1!=null},
      {dev:'board',t:'Procedure II: طفّ الـ OUTPUT، شيل أطراف الأجهزة من اللوحة، وفضّها.',ok:s=>s.clear&&s.genOff},
      {dev:'board',fig:P7,figCap:'Fig. 7',t:'ركّب Fig. 7 (parallel): الـ top bus = node 8-9-10، وكل فرع ينزل له بـ plug (مكان الأميتر)، والـ bottom bus = node 22-23-24 ينزل للأرضي (node 30) بـ plug.',
        lines:[{t:'C = 4.7 µF: node 15 ↔ node 22',part:['C47',15,22]},{t:'R = 100 Ω: node 16 ↔ node 23',part:['R100',16,23]},{t:'L = 17.5 mH: node 17 ↔ node 24',part:['L175',17,24]},
          {t:'bridging plug: node 8 ↔ node 9',wire:[8,9]},{t:'bridging plug: node 9 ↔ node 10',wire:[9,10]},{t:'bridging plug: node 8 ↔ node 15',note:'I<sub>C</sub>',wire:[8,15]},{t:'bridging plug: node 9 ↔ node 16',note:'I<sub>R</sub>',wire:[9,16]},{t:'bridging plug: node 10 ↔ node 17',note:'I<sub>L</sub>',wire:[10,17]},
          {t:'bridging plug: node 22 ↔ node 23',wire:[22,23]},{t:'bridging plug: node 23 ↔ node 24',wire:[23,24]},{t:'bridging plug: node 23 ↔ node 30',wire:[23,30]},{t:'bridging plug: node 7 ↔ node 8',note:'I',wire:[7,8]},
          {t:'GEN OUT red → node 7',lead:'gr',at:7},{t:'GEN ⏚ black → node 30',lead:'gb',at:30}],ok:s=>s.closed7},
      {dev:'hm1',t:'شغّل الـ OUTPUT (1 kHz) وعدّل AMPL لين الـ Fluke يقرا E = 2.00 V على الـ top bus (VΩ → node 8، COM → node 30).',lines:[{t:'Fluke VΩ → node 8',lead:'h1v',at:8},{t:'Fluke COM → node 30',lead:'h1c',at:30}],ok:s=>ST.e2!=null},
      {dev:'hm2',t:'قِس I (الـ BK مكان plug node 7 ↔ 8)، وبعدين I<sub>C</sub> (مكان 8 ↔ 15)، و I<sub>R</sub> (9 ↔ 16)، و I<sub>L</sub> (10 ↔ 17). رجّع كل plug بعد ما تقيس.',ok:s=>ST.i2!=null&&ST.ic2!=null&&ST.ir2!=null&&ST.il2!=null},
      {dev:'sc',t:'θ: شيل الأميتر ورجّع الـ plugs، وحط 10 Ω مكان plug node 23 ↔ 30. CH I على node 8 (E) و CH II على node 23 (جهد الـ 10 Ω ∝ I)، والأرضي node 30، و DUAL: قِس فرق الطور.',
        lines:[{t:'10 Ω: node 23 ↔ node 30',part:['R10',23,30]},{t:'CH I red → node 8',lead:'c1r',at:8},{t:'CH I ⏚ → node 30',lead:'c1b',at:30},{t:'CH II red → node 23',lead:'c2r',at:23},{t:'CH II ⏚ → node 30',lead:'c2b',at:30}],ok:s=>ST.th2},
      {dev:'board',t:'4. الطور بين I<sub>C</sub> و I<sub>L</sub>: رجّع plug node 23 ↔ 30 مكان الـ 10 Ω، وشيل plugs 22 ↔ 23 و 23 ↔ 24. حط 10 Ω تحت المكثف (node 22 ↔ 29) و 10 Ω تحت الـ coil (node 24 ↔ 31)، و plugs 29 ↔ 30 و 30 ↔ 31. CH I على node 22 و CH II على node 24.',
        lines:[{t:'10 Ω: node 22 ↔ node 29',part:['R10',22,29]},{t:'10 Ω: node 24 ↔ node 31',part:['R10',24,31]},{t:'bridging plug: node 29 ↔ node 30',wire:[29,30]},{t:'bridging plug: node 30 ↔ node 31',wire:[30,31]},{t:'CH I red → node 22',lead:'c1r',at:22},{t:'CH II red → node 24',lead:'c2r',at:24}],ok:s=>ST.cl2},
      {dev:'board',t:'Procedure III: طفّ الـ OUTPUT وفضّ اللوحة.',ok:s=>s.clear&&s.genOff},
      {dev:'board',fig:P8,figCap:'Fig. 8',t:'1. ركّب Fig. 8: الأميتر (BK على ACA 20m) على التوالي من node 1 لـ node 2، و CH I على المصدر عشان تثبّت V (الـ Fluke ما يلحق الـ kHz العالية).',
        lines:[{t:'R = 100 Ω: node 2 ↔ node 3',part:['R100',2,3]},{t:'L = 17.5 mH: node 3 ↔ node 4',part:['L175',3,4]},{t:'C = 10 nF: node 4 ↔ node 11',part:['C10n',4,11]},{t:'BK mA (red) → node 1',lead:'h2ma',at:1},{t:'BK COM → node 2',lead:'h2c',at:2},
          {t:'GEN OUT red → node 1',lead:'gr',at:1},{t:'GEN ⏚ black → node 11',lead:'gb',at:11},{t:'CH I red → node 1',lead:'c1r',at:1},{t:'CH I ⏚ → node 11',lead:'c1b',at:11}],ok:s=>s.fig8&&s.cro},
      ...[F3.slice(0,8),F3.slice(8)].map((L,j)=>({dev:'gen',t:`2. ${j?'كمّل':'ابدأ'} من ${fk(L[0])} لـ ${fk(L[L.length-1])} كل 500 Hz: عند كل تردد ثبّت V على 2 Vrms (5.66 Vpp على CH I)، وسجّل I في Table 1.`,ok:s=>L.every(f=>ST['s'+f]!=null)})),
      {dev:'board',t:'3–5. احسب P = I²R وارسم P ضد التردد، وطلّع f<sub>os</sub> و f<sub>1</sub> و f<sub>2</sub> و B و Q<sub>o</sub>. Procedure IV: طفّ الـ OUTPUT وفضّ القطع.',ok:s=>!RT.S.parts.length&&s.genOff},
      {dev:'board',fig:P9,figCap:'Fig. 9',t:'1. ركّب Fig. 9: الأميتر بين node 1 و node 2، والـ top bus = node 2-3-4، والـ bottom bus = node 9-10-11 (الأرضي). حط الـ BK على ACA 2m.',
        lines:[{t:'R = 5 kΩ: node 2 ↔ node 9',part:['R5k',2,9]},{t:'L = 4.38 mH: node 3 ↔ node 10',part:['L438',3,10]},{t:'C = 0.1 µF: node 4 ↔ node 11',part:['C01',4,11]},{t:'bridging plug: node 2 ↔ node 3',wire:[2,3]},{t:'bridging plug: node 3 ↔ node 4',wire:[3,4]},
          {t:'bridging plug: node 9 ↔ node 10',wire:[9,10]},{t:'bridging plug: node 10 ↔ node 11',wire:[10,11]},{t:'GEN ⏚ black → node 9',lead:'gb',at:9},{t:'CH I ⏚ → node 9',lead:'c1b',at:9}],ok:s=>s.fig9},
      ...[F4.slice(0,8),F4.slice(8)].map((L,j)=>({dev:'gen',t:`2. ${j?'كمّل':'ابدأ'} من ${fk(L[0])} لـ ${fk(L[L.length-1])} كل 200 Hz: ثبّت V على 2 Vrms وسجّل I، واحسب Z = V/I في Table 2.`,ok:s=>L.every(f=>ST['p'+f]!=null)})),
      {dev:'gen',t:'4. ارسم Z ضد التردد وطلّع f<sub>op</sub> و f<sub>1</sub> و f<sub>2</sub> و B و Q<sub>o</sub>. وبعدين طفّ الـ generator.',ok:s=>s.genOff&&F4.every(f=>ST['p'+f]!=null)}
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
