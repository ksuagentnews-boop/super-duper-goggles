/* EE205 · Experiment 1 · Introduction to Measurement of Resistors, Current and Voltage Divider Rules, and Δ-Y
   Transformation Rule (manual pp. 9–16). Steps follow the manual's procedures one to one (Batch 6):
   Procedure I (steps 1–4): Table 2 (three colour-coded resistors: colour code vs ohmmeter) and Table 3 (YEW decade box at
   4 Ω ×1, 50 Ω ×10, 700 Ω ×100, 5 kΩ ×1K, 30 kΩ ×10K: reading, tolerance, % error).
   Procedure II (steps 1–6): Fig. 5, E = 10 V, R1 = 4.7 kΩ, R2 = 1 kΩ, R3 = 2.2 kΩ in series → V1, V2, V3, E (Table 4).
   Procedure III (steps 1–5): Fig. 6, E = 10 V, 1 kΩ ∥ 4.7 kΩ ∥ 2.2 kΩ → I1, I2, I3, IT with the GoldStar in series (Table 5).
   Procedure IV (steps 1–6): Fig. 7 bridge (a-c 220, a-b 470, c-b 10 k, c-d 220, b-d 1 k), E = 15 V → ID; Δ abc → Y (Ra, Rb,
   Rc on the three decade boxes), Fig. 8 → IY.
   Figures (def.figs) are the reference wiring in the lab's rectangle layout (source on the left, + top-left node 8, − bottom-
   left node 22); build steps tick when the bench IS the figure's circuit (engine/match.js); the measurement set-ups (meter
   across a part, ammeter in place of a branch plug, ohmmeter on a part / box) are matched the same way, never by node.
   Instruments (each procedure brings its own, see `procs` below): Thandar TS3022S, Fluke 77 (M1: ohmmeter / voltmeter),
   GoldStar DM-33x (M2: ammeter, as in the lab video), three YEW 2786 boxes.
   Assumptions: the three "colour code resistors" of Procedure I are 330 Ω, 6.8 kΩ and 56 kΩ (5 %, gold band); the parts
   are real (each a little off its nominal value, inside 5 %); "simulated" values of Procedure IV are the calculated
   ones (no PSpice on this bench); the Δ→Y values are set on the boxes to the nearest ohm. Procedure I step 3 says "record
   in table 2": the tolerance column is in Table 3. Fig. 6 is built with a bridging plug in every branch and between the
   source and the bus, so the one ammeter can take a plug's place for I1, I2, I3 and IT in turn. Figs. 7 and 8 draw I_D /
   I_Y on the source line: the GoldStar sits there in series (part of the figure). The calculation / comparison steps
   (I.3–4, II.3–6, III.3–5, IV.3–4, IV.6) have nothing to check on the bench and tick as soon as they are reached. */
EXP_DEFS['ee205/exp1']=(()=>{const H=ENGINE.sheet;
const PARTS={RC1:{t:'R',r:333.4,nom:330,lab:'Resistor 1'},RC2:{t:'R',r:6744,nom:6800,lab:'Resistor 2'},RC3:{t:'R',r:56620,nom:56000,lab:'Resistor 3'},
  R220:{t:'R',r:218.7,nom:220,lab:'220Ω'},R470:{t:'R',r:466.2,nom:470,lab:'470Ω'},R1k:{t:'R',r:994.1,nom:1000,lab:'1kΩ'},R2k2:{t:'R',r:2213,nom:2200,lab:'2.2kΩ'},
  R4k7:{t:'R',r:4726,nom:4700,lab:'4.7kΩ'},R10k:{t:'R',r:9874,nom:10000,lab:'10kΩ'},BR:{t:'BR',lab:''}};
const COLS=[['a','Orange · Orange · Brown · Gold'],['b','Blue · Grey · Red · Gold'],['c','Green · Blue · Orange · Gold'],['d','Orange · Orange · Red · Gold'],['e','Blue · Grey · Orange · Gold'],['f','Green · Blue · Red · Gold']];
const BOX=[['b4','×1',4,0.5],['b50','×10',50,0.2],['b700','×100',700,0.05],['b5k','×1K',5000,0.05],['b30k','×10K',30000,0.1]];
const t2=`<table class="tbl"><caption>Table 2 (Procedure I): Resistance measurement by color code and by ohmmeter</caption>
<tr><th>Resistor</th><th>Colors</th><th>Value by Calculation (Ω)</th><th>Value by Measurement (Ω)</th></tr>
${[1,2,3].map(i=>`<tr><td>${i}</td><td>${H.sel('c'+i,COLS)}</td><td>${H.num('cv'+i,'1',90)}</td><td>${H.num('cm'+i,'0.1',90)}</td></tr>`).join('')}</table>`;
const t3=`<table class="tbl"><caption>Table 3 (Procedure I): Resistance measurement and calculation of tolerance and errors</caption>
<tr><th>Readings</th><th>Decade Box Range</th><th>Assigned Resistance</th><th>Ohmmeter Reading (Ω)</th><th>Tolerance ± (Ω)</th><th>% Error</th></tr>
${BOX.map(([k,r,v],i)=>`<tr><td>${i+1}.</td><td>${r}</td><td>${v>=1000?v/1000+' kΩ':v+' Ω'}</td><td>${H.num(k,'0.1',80)}</td><td>${H.num(k+'t','0.001',70)}</td><td>${H.num(k+'e','0.01',70)}</td></tr>`).join('')}</table>`;
const t4=`<table class="tbl"><caption>Table 4 (Procedure II): Results for verification of voltage division rule · E = 10 V</caption>
<tr><th></th><th>V<sub>1</sub> (V)</th><th>V<sub>2</sub> (V)</th><th>V<sub>3</sub> (V)</th><th>V<sub>Total</sub> (V)</th></tr>
<tr><td class="l">By Measurement</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'m','0.001',70)}</td>`).join('')}</tr>
<tr><td class="l">By Calculation</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'c','0.001',70)}</td>`).join('')}</tr>
<tr><td class="l">% Error</td>${['v1','v2','v3','vt'].map(k=>`<td>${H.num(k+'e','0.01',70)}</td>`).join('')}</tr></table>`;
const t5=`<table class="tbl"><caption>Table 5 (Procedure III): Results for verification of current divider rule · E = 10 V</caption>
<tr><th></th><th>I<sub>1</sub> (mA)</th><th>I<sub>2</sub> (mA)</th><th>I<sub>3</sub> (mA)</th><th>I<sub>T</sub> (mA)</th></tr>
<tr><td class="l">By Measurement</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'m','0.01',70)}</td>`).join('')}</tr>
<tr><td class="l">By Calculation</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'c','0.01',70)}</td>`).join('')}</tr>
<tr><td class="l">% Errors</td>${['i1','i2','i3','it'].map(k=>`<td>${H.num(k+'e','0.01',70)}</td>`).join('')}</tr></table>`;
const t6=`<table class="tbl"><caption>Procedure IV: Δ-Y Transformation · E = 15 V</caption>
<tr><td class="l">I<sub>D</sub> calculated (any method except Δ-Y)</td><td>${H.num('idc','0.01',80)} mA</td></tr>
<tr><td class="l">I<sub>D</sub> measured (Fig. 7)</td><td>${H.num('idm','0.01',80)} mA</td></tr>
<tr><td class="l">R<sub>a</sub> (equivalent Y of Δ abc)</td><td>${H.num('ra','0.01',80)} Ω</td></tr>
<tr><td class="l">R<sub>b</sub></td><td>${H.num('rb','0.01',80)} Ω</td></tr>
<tr><td class="l">R<sub>c</sub></td><td>${H.num('rc','0.01',80)} Ω</td></tr>
<tr><td class="l">I<sub>Y</sub> measured (Fig. 8)</td><td>${H.num('iym','0.01',80)} mA</td></tr>
<tr><td class="l">I<sub>Y</sub> calculated</td><td>${H.num('iyc','0.01',80)} mA</td></tr></table>`;
const fig=(f,cap,w=420)=>`<div class="figbox" style="padding:8px;text-align:center"><img class="figimg" src="labs/ee205/fig/${f}" alt="${cap}" style="max-width:${w}px;width:100%"></div><div class="hint" style="text-align:center">${cap}</div>`;
/* the figures' reference wiring, in the lab's rectangle layout (bottom-left node 22, left column 22–8, top row 8–11,
   right column down to row 3, bottom row back to 22): DC + top-left (node 8), DC − bottom-left (node 22) */
const SUP=[{lead:'Lp',alt:'Rp',at:8},{lead:'Lm',alt:'Rm',at:22}];
const L5=[...SUP,{part:['R4k7',8,9]},{part:['R1k',9,10]},{part:['R2k2',10,17]},{wire:[17,24]},{wire:[24,23]},{wire:[23,22]}];
/* Fig. 6: plug 8–9 = the I_T line, bus 9–10–11, a plug per branch (9–16, 10–17, 11–18), the branches down to the bottom bus */
const P6={it:[8,9],i1:[9,16],i2:[10,17],i3:[11,18]};
const L6=[...SUP,{wire:P6.it},{wire:[9,10]},{wire:[10,11]},{wire:P6.i1},{wire:P6.i2},{wire:P6.i3},{part:['R1k',16,23]},{part:['R4k7',17,24]},{part:['R2k2',18,25]},{wire:[22,23]},{wire:[23,24]},{wire:[24,25]}];
/* Fig. 7: a = 9, b = 10/17, c = 16, d = 23/24/22; the GoldStar between DC + and a */
const AMM=[{lead:'h2v',at:8},{lead:'h2c',at:9}],DOWN=[{part:['R220',16,23]},{part:['R1k',17,24]},{wire:[24,23]},{wire:[23,22]}];
const L7=[...SUP,...AMM,{part:['R470',9,10]},{part:['R220',9,16]},{wire:[10,17]},{part:['R10k',16,17]},...DOWN];
/* Fig. 8: the Y point n = node 10; Ra (box R1) n–a, Rb (box R2) n–b, Rc (box R3) n–c (each box either way round) */
const BOXY=(k,at)=>[{lead:`y${k}H`,alt:`y${k}L`,at:10},{lead:`y${k}L`,alt:`y${k}H`,at}];
const L8=[...SUP,...AMM,...BOXY(1,9),...BOXY(2,17),...BOXY(3,16),...DOWN];
const IMG=f=>'labs/ee205/fig/'+f;
const figs={'5':{img:IMG('e1-fig5.png'),cap:'Fig. 5 · Circuit to verify voltage division rule',lines:L5},
  '6':{img:IMG('e1-fig6.png'),cap:'Fig. 6 · Circuit to verify current division rule',lines:L6},
  '7':{img:IMG('e1-fig7.png'),cap:'Fig. 7 · Δ - Y Circuit (GoldStar in series for I<sub>D</sub>)',lines:L7},
  '8':{img:IMG('e1-fig8.png'),cap:'Fig. 8 · Δ - Y Circuit (R<sub>a</sub>, R<sub>b</sub>, R<sub>c</sub> on the decade boxes)',lines:L8}};
/* measurement set-ups, matched like the figures: the ohmmeter on one resistor / on the box alone (Procedure I), the voltmeter
   across a part of Fig. 5, the ammeter in place of one plug of Fig. 6 */
const OHM={};['RC1','RC2','RC3'].forEach(t=>OHM[t]={lines:[{part:[t,0,1]},{lead:'h1v',at:0},{lead:'h1c',at:1}]});
const OHMBOX={lines:[{lead:'y1H',alt:'y1L',at:0},{lead:'y1L',alt:'y1H',at:1},{lead:'h1v',at:0},{lead:'h1c',at:1}]};
const VM={v1:[8,9],v2:[9,10],v3:[10,17],vt:[8,22]};Object.keys(VM).forEach(k=>VM[k]={lines:[...L5,{lead:'h1v',at:VM[k][0]},{lead:'h1c',at:VM[k][1]}]});
/* two of these set-ups are listed with the figures (the voltmeter / ohmmeter leads belong to a figure): */
figs.ohm={img:IMG('e1-fig5.png'),cap:'Procedure I · a resistor alone on the ohmmeter (M1)',lines:OHM.RC1.lines};
figs.V1={img:IMG('e1-fig5.png'),cap:'Fig. 5 · M1 across R1 (V<sub>1</sub>)',lines:VM.v1.lines};
const AM={};Object.keys(P6).forEach(k=>{const [a,b]=P6[k];AM[k]={lines:[...L6.filter(l=>l.wire!==P6[k]),{lead:'h2v',at:a},{lead:'h2c',at:b}]}});
return {figs,procs:[{id:'I',title:'Resistance measurement (Tables 2, 3)'},{id:'II',title:'Voltage divider rule (Fig. 5, Table 4)'},{id:'III',title:'Current divider rule (Fig. 6, Table 5)'},{id:'IV',title:'Δ-Y transformation (Figs. 7, 8)'}],
sheet:`<div class="paper" id="paper">
<h2>Experiment 1 · Measurement of Resistors, Voltage &amp; Current Divider Rules, Δ-Y Transformation</h2>
<div class="check manual-only" id="live"></div>
<div class="manual-only">
<p class="exam-note">عبّي القراءات مثل ما تطلع لك على الأجهزة، واحسب القيم النظرية من القيم الاسمية للقطع، وبعدها اضغط "صحّح إجاباتي". % Error = (measured − calculated) / calculated × 100.</p>
<h3>Procedure I</h3>${t2}${t3}
<h3>Procedure II</h3>${fig('e1-fig5.png','Fig. 5: Circuit to verify voltage division rule')}${t4}
<h3>Procedure III</h3>${fig('e1-fig6.png','Fig. 6: Circuit to verify current division rule')}${t5}
<h3>Procedure IV</h3>${fig('e1-fig7.png','Fig. 7: Δ - Y Circuit',360)}${fig('e1-fig8.png','Fig. 8: Δ - Y Circuit',360)}${t6}
<div class="row" style="margin-top:12px"><button class="t on" id="submit">صحّح إجاباتي</button></div><div id="result"></div>
</div></div>`,
params:()=>({}),
instruments:[
  {type:'thandar',procs:['II','III','IV'],prev:d=>{d.u[0].v=12;d.u[0].ilim=0.5;d.u[1].v=5;d.u[1].ilim=0.2}},
  {type:'hdmm',model:'fluke77',n:1,procs:['I','II'],prev:d=>{d.pos=2}},
  {type:'hdmm',model:'goldstar',n:2,procs:['III','IV']},
  {type:'yew',n:1,procs:['I','IV'],prev:d=>{d.d=[3,2,0,1,0,0]}},{type:'yew',n:2,procs:['IV']},{type:'yew',n:3,procs:['IV'],prev:d=>{d.d=[0,0,5,0,0,0]}}],
parts:PARTS,
tray:[['RC1','Resistor 1'],['RC2','Resistor 2'],['RC3','Resistor 3'],['R220','220 Ω'],['R470','470 Ω'],['R1k','1 kΩ'],['R2k2','2.2 kΩ'],['R4k7','4.7 kΩ'],['R10k','10 kΩ'],['BR','Bridging plug'],['W','Wire']],
setup(RT){
  const G=ENGINE.sheet;let ST={};
  const nom=t=>PARTS[t].nom;
  /* reference circuits with the real part values and the meters' own resistances */
  function dc(n,res,E,amm){/* res: [a,b,R]; source + on node 0, − on earth; returns node voltages */
    const els=[{t:'DC',a:0,b:-1,v:E,ilim:2,r:0.02}];res.forEach(([a,b,r])=>els.push({t:'G',a,b,g:1/r}));return SOLVER.point({n,els,dcs:[0]},0).x}
  const A=t=>PARTS[t].r,SH40=5,SH400=0.5;
  const REF={};
  {const x=dc(4,[[0,1,A('R4k7')],[1,2,A('R1k')],[2,-1,A('R2k2')]],10);REF.v1=x[0]-x[1];REF.v2=x[1]-x[2];REF.v3=x[2];REF.vt=x[0]}
  {const Rs=['R1k','R4k7','R2k2'];Rs.forEach((t,k)=>{const r=Rs.map(q=>A(q)+(q===t?SH40:0));const g=r.reduce((s,v)=>s+1/v,0);const vb=10/(1+0.02*g);REF['i'+(k+1)]=vb/r[k]});
    const rp=1/Rs.reduce((s,q)=>s+1/A(q),0);REF.it=10/(rp+SH40+0.02)}
  const bridge=(rac,rab,rcb,rcd,rbd,E,sh)=>{/* nodes: 0 = supply +, 1 = a, 2 = b, 3 = c; d = earth */const x=dc(4,[[0,1,sh],[1,3,rac],[1,2,rab],[3,2,rcb],[3,-1,rcd],[2,-1,rbd]],E);return (x[0]-x[1])/sh};
  REF.id=bridge(A('R220'),A('R470'),A('R10k'),A('R220'),A('R1k'),15,SH400);
  const CAL={};{const S=10000+470+220;CAL.ra=470*220/S;CAL.rb=10000*470/S;CAL.rc=220*10000/S;
    const rp=1/(1/(CAL.rc+220)+1/(CAL.rb+1000));CAL.id=15/(CAL.ra+rp)*1e3;
    CAL.v1=10*4.7/7.9;CAL.v2=10*1/7.9;CAL.v3=10*2.2/7.9;CAL.vt=10;CAL.i1=10;CAL.i2=10/4.7;CAL.i3=10/2.2;CAL.it=CAL.i1+CAL.i2+CAL.i3}
  /* the value (SI) a meter shows */
  const shown=m=>m&&m.r.shown&&!m.r.ol&&m.r.shown.si!=null?m.r.shown.si:null;
  function sup(E){for(const u of [0,1]){const P=RT.leadNet(u?'Rp':'Lp'),M=RT.leadNet(u?'Rm':'Lm');if(P==null||M==null)continue;const U=RT.S.psu.u[u];
      return {P,M,U,ok:RT.S.psu.pwr&&U.on&&Math.abs(U.v-E)<0.006}}return null}
  const box=k=>RT.inst['yew'+k].value();
  function status(){const st={};const M=RT.meters();const fl=RT.S.hm1,gs=RT.S.hm2;
    const m1=M.find(m=>m.key==='hm1'),m2=M.find(m=>m.key==='hm2');
    st.flOhm=fl.pwr&&fl.fn==='OHM';st.flV=fl.pwr&&fl.fn==='DCV';st.gs40=gs.pos===6;st.gs400=gs.pos===7;
    const ok=f=>RT.match(f).ok;
    /* Procedure I: one resistor alone on the ohmmeter, then the decade box alone */
    if(m1&&st.flOhm){const v=shown(m1);if(v!=null){for(const t in OHM)if(ok(OHM[t]))ST['r'+t]=v;
      if(ok(OHMBOX)){st.boxOn=true;BOX.forEach(([key,,val])=>{if(box(1)===val)ST[key]=v})}}}
    /* Procedure II: Fig. 5 at E = 10 V, the voltmeter across R1, R2, R3, the source */
    const s10=sup(10);st.s10=s10;
    if(s10&&s10.ok&&m1&&st.flV){const v=shown(m1);if(v!=null)for(const k in VM)if(ok(VM[k]))ST[k]=v}
    /* Procedure III: Fig. 6 at E = 10 V, the GoldStar (40 mA) in place of a branch plug / the I_T plug */
    if(s10&&s10.ok&&m2&&st.gs40&&gs.fn==='DCI'){const v=shown(m2);if(v!=null)for(const k in AM)if(ok(AM[k]))ST[k]=v}
    /* Procedure IV: Fig. 7 / Fig. 8 at E = 15 V, the GoldStar on 400 mA in series */
    const s15=sup(15);st.s15=s15;const amp=s15&&s15.ok&&m2&&st.gs400&&gs.fn==='DCI'?shown(m2):null;
    if(amp!=null&&ok('7'))ST.id=amp;
    st.ySet=Math.abs(box(1)-CAL.ra)<=1&&Math.abs(box(2)-CAL.rb)<=1&&Math.abs(box(3)-CAL.rc)<=1;
    if(amp!=null&&st.ySet&&ok('8'))ST.iy=amp;
    st.ST=ST;return st}
  $('submit').addEventListener('click',()=>{const g=G.grader(),v=G.v,s=G.s;
    g.proc('I');[['RC1','a'],['RC2','b'],['RC3','c']].forEach(([t,c],i)=>{const k=i+1;g.add(s('c'+k)===c,`Table 2 · Resistor ${k} colors`,COLS.find(q=>q[0]===c)[1]);
      g.add(v('cv'+k)===nom(t),`Table 2 · Resistor ${k} by calculation`,`${nom(t)} Ω`);
      g.add(G.near(v('cm'+k),A(t),A(t)*0.004+0.15),`Table 2 · Resistor ${k} measured`,`≈ ${A(t).toFixed(1)} Ω on the ohmmeter`)});
    BOX.forEach(([k,r,val,tol])=>{const rd=v(k);g.add(G.near(rd,val,val*tol/100+val*0.004+0.15),`Table 3 · ${r} reading`,`≈ ${val} Ω`);
      g.add(G.near(v(k+'t'),val*tol/100,val*tol/100*0.01+1e-4),`Table 3 · ${r} tolerance`,`± ${(val*tol/100).toPrecision(3)} Ω (${tol} %)`);
      g.add(G.near(v(k+'e'),(rd-val)/val*100,0.02),`Table 3 · ${r} % error`,'(reading − box) / box × 100')});
    g.proc('II');['v1','v2','v3','vt'].forEach(k=>{g.add(G.near(v(k+'m'),REF[k],Math.abs(REF[k])*0.003+0.003),`Table 4 · ${k.toUpperCase()} measured`,`≈ ${REF[k].toFixed(3)} V`);
      g.add(G.near(v(k+'c'),CAL[k],0.006),`Table 4 · ${k.toUpperCase()} calculated`,`${CAL[k].toFixed(3)} V`);g.add(G.near(v(k+'e'),(v(k+'m')-v(k+'c'))/v(k+'c')*100,0.05),`Table 4 · ${k.toUpperCase()} % error`)});
    g.proc('III');['i1','i2','i3','it'].forEach(k=>{g.add(G.near(v(k+'m'),REF[k]*1e3,REF[k]*1e3*0.004+0.02),`Table 5 · ${k.toUpperCase()} measured`,`≈ ${(REF[k]*1e3).toFixed(2)} mA`);
      g.add(G.near(v(k+'c'),CAL[k],0.02),`Table 5 · ${k.toUpperCase()} calculated`,`${CAL[k].toFixed(2)} mA`);g.add(G.near(v(k+'e'),(v(k+'m')-v(k+'c'))/v(k+'c')*100,0.05),`Table 5 · ${k.toUpperCase()} % error`)});
    g.proc('IV');g.add(G.near(v('idc'),CAL.id,0.1),'ID calculated',`${CAL.id.toFixed(2)} mA`);g.add(G.near(v('idm'),REF.id*1e3,REF.id*1e3*0.005+0.1),'ID measured',`≈ ${(REF.id*1e3).toFixed(1)} mA`);
    g.add(G.near(v('ra'),CAL.ra,0.02),'Ra',`${CAL.ra.toFixed(2)} Ω`);g.add(G.near(v('rb'),CAL.rb,0.02),'Rb',`${CAL.rb.toFixed(2)} Ω`);g.add(G.near(v('rc'),CAL.rc,0.02),'Rc',`${CAL.rc.toFixed(2)} Ω`);
    g.add(ST.iy!=null&&G.near(v('iym'),ST.iy*1e3,0.06),'IY measured',ST.iy!=null?`${(ST.iy*1e3).toFixed(1)} mA (your reading)`:'measure Fig. 8 first');
    g.add(G.near(v('iyc'),CAL.id,0.1),'IY calculated','= ID calculated (Y is equivalent to Δ)');
    g.show($('result'))});
  const COLTXT=c=>COLS.find(q=>q[0]===c)[1];
  const calc=t=>({dev:'board',t,subs:[{k:'set',t:'احسبها واكتبها في الـ sheet.',ok:()=>true}]});
  const fmtR=v=>v>=1000?v/1000+' kΩ':v+' Ω';
  /* "do it for me" helpers (Batch 7 item 3): the supply unit wired into the circuit, its voltage by COARSE then FINE; a
     handheld meter's rotary switch to a position; a decade box's dials to a value */
  const U=()=>RT.leadNet('Rp')!=null&&RT.leadNet('Lp')==null?'R':'L';
  const unit=()=>RT.S.psu.u[U()==='L'?0:1];
  const volts=async(A,E)=>{const u=U();if(!RT.S.psu.pwr)await A.press('p:PWR');for(let i=0;i<80&&Math.abs(unit().v-E)>=0.5;i++)await A.tap('p:'+u+'VC'+(unit().v<E?'+':'-'),90);
    for(let i=0;i<300&&Math.abs(unit().v-E)>0.004;i++)await A.tap('p:'+u+'VF'+(unit().v<E?'+':'-'),35)};
  const psuOn=async(A,E)=>{await volts(A,E);if(!unit().on)await A.press('p:'+U()+'ON')};
  const meterTo=(A,n,pos)=>A.until(`h${n}:SW${RT.S['hm'+n].pos<pos?'+':'-'}`,()=>RT.S['hm'+n].pos===pos,12);
  const dials=async(A,n,v)=>{const t=[0,1,2,3,4,5].map(j=>Math.floor(Math.round(v)/Math.pow(10,j))%10),d=RT.S['yew'+n].d;
    for(let j=0;j<6;j++){const k=t[j]-d[j];if(k)await A.press(`y${n}:D${j}${k>0?'+':'-'}`,Math.abs(k))}};
  return {status,
    steps:[
      /* Procedure I (manual p. 13–14), steps 1–4; every step split into its sub-steps (Batch 7 item 3) */
      {dev:'hm1',t:'Procedure I · 1. عندك على الطاولة ثلاث color coded resistors: حدّد قيمة كل وحدة، أولاً بالحساب من الـ color code، وثانياً بالقياس بالـ ohmmeter. سجّل قراءاتك في Table 2 وعلّق على الفرق.',subs:[
        {k:'set',dev:'hm1',t:'حوّل الـ Fluke 77 (M1) على Ω (الـ ohmmeter).',ok:s=>s.flOhm,do:A=>meterTo(A,1,4),hint:'لف قرص الـ Fluke لين يوقف على Ω'},
        ...[1,2,3].flatMap(k=>{const t='RC'+k,c='abc'[k-1];return [
          {k:'measure',dev:'hm1',t:`حط Resistor ${k} لحاله على اللوحة${k>1?' (شيل اللي قبلها)':''} ووصّل M1 عليه (VΩ و COM).`,ok:()=>ST['r'+t]!=null,do:A=>A.build(OHM[t]),
            hint:s=>s.flOhm?`Resistor ${k} لحاله على اللوحة، وطرفي M1 (VΩ و COM) على رجليه`:'M1 لازم يكون على Ω'},
          {k:'rec',t:`اقرا ألوان Resistor ${k} وسجّلها مع قراءة الـ ohmmeter في Table 2.`,ok:()=>ST['r'+t]!=null,
            rec:[{to:'c'+k,val:()=>ST['r'+t]!=null?c:null,txt:()=>COLTXT(c),label:`Resistor ${k} colors`,none:`حط Resistor ${k} لحاله على الـ ohmmeter`},{to:'cm'+k,val:()=>ST['r'+t],unit:'Ω',dec:1,label:`Resistor ${k} (ohmmeter)`}]}]})]},
      {dev:'yew1',t:'2. بالـ ohmmeter قِس المقاومات المحددة من الـ decade resistance box مثل Table 3، وسجّل قراءاتك. واحسب كمان الـ tolerance المكتوبة على الصندوق والـ errors في قراءاتك.',subs:[
        {k:'measure',dev:'yew1',t:'شيل المقاومة، ووصّل طرفي الـ decade box (H و L) مع أطراف M1 لحالها.',ok:s=>!!s.boxOn,do:A=>A.build(OHMBOX),hint:'الـ decade box لحاله على M1: H على VΩ و L على COM (أو بالعكس)، و M1 على Ω'},
        ...BOX.flatMap(([k,r,val])=>[
          {k:'set',dev:'yew1',t:`صفّر الأقراص واضبط قرص ${r} لين يصير الصندوق ${fmtR(val)}.`,ok:()=>ST[k]!=null,do:A=>dials(A,1,val),hint:`الصندوق لازم يكون ${fmtR(val)} بالضبط: قرص ${r} بس، وباقي الأقراص على الصفر`},
          {k:'rec',t:`سجّل قراءة الـ ohmmeter (${fmtR(val)}) في Table 3.`,ok:()=>ST[k]!=null,rec:[{to:k,val:()=>ST[k],unit:'Ω',dec:1,label:`${r} · ${fmtR(val)}`}]}])]},
      calc('3. من نسبة الـ % tolerance المكتوبة على كل range في الصندوق، احسب المدى المقبول لكل قيمة وسجّله في Table 3. مثال: ×1 عليه 0.5 %، يعني 4 Ω ± 0.02 Ω (من 3.98 Ω إلى 4.02 Ω).'),
      calc('4. احسب الـ % error لكل قراءة: % error = (actual meter reading − decade box reading) / decade box reading × 100.'),
      /* Procedure II (manual p. 14), steps 1–6 */
      {dev:'board',build:'5',t:'Procedure II · 1. وصّل الدائرة Fig. 5.',subs:[{k:'build',fig:'5'}]},
      {dev:'hm1',t:'2. قِس V<sub>1</sub> و V<sub>2</sub> و V<sub>3</sub> و E بدقة.',subs:[
        {k:'set',dev:'psu',t:'شغّل الـ POWER.',ok:()=>RT.S.psu.pwr,do:A=>A.press('p:PWR')},
        {k:'set',dev:'psu',t:'اضبط الوحدة على E = 10 V (COARSE ثم FINE).',ok:s=>!!s.s10&&Math.abs(s.s10.U.v-10)<0.006,do:A=>volts(A,10),hint:'لف COARSE لين قريب من 10 V، وكمّل بالـ FINE'},
        {k:'set',dev:'psu',t:'حوّل الـ OUTPUT على ON.',ok:s=>!!s.s10&&s.s10.ok,do:A=>psuOn(A,10)},
        {k:'set',dev:'hm1',t:'حوّل M1 على V⎓.',ok:s=>s.flV,do:A=>meterTo(A,1,2),hint:'لف قرص الـ Fluke على V⎓'},
        ...[['v1','V<sub>1</sub>','على R1'],['v2','V<sub>2</sub>','على R2'],['v3','V<sub>3</sub>','على R3'],['vt','E = V<sub>Total</sub>','على المصدر']].flatMap(([k,l,on])=>[
          {k:'measure',dev:'hm1',t:`${l}: M1 ${on} (VΩ على جهة الـ +).`,ok:()=>ST[k]!=null,do:A=>A.connect(VM[k]),hint:s=>s.flV?`طرفي M1 ${on}: VΩ على الطرف اللي جهة الـ + و COM على الثاني`:'M1 لازم يكون على V⎓'},
          {k:'rec',t:`سجّل ${l} في Table 4.`,ok:()=>ST[k]!=null,rec:[{to:k+'m',val:()=>ST[k],unit:'V',dec:3,label:l}]}])]},
      calc('3. احسب V<sub>1</sub> و V<sub>2</sub> و V<sub>3</sub> بالـ voltage division rule.'),
      calc('4. قارن قيم V<sub>1</sub> و V<sub>2</sub> و V<sub>3</sub> في الخطوات (2) و (3) و (4).'),
      calc('5. سجّل نتائجك في Table 4.'),
      calc('6. علّق على الفرق (إن وجد) بين V<sub>1</sub> و V<sub>2</sub> و V<sub>3</sub> في الخطوات (2) و (3) و (4).'),
      /* Procedure III (manual p. 15), steps 1–5 */
      {dev:'board',build:'6',t:'Procedure III · 1. وصّل الدائرة Fig. 6.',subs:[{k:'build',fig:'6'}]},
      {dev:'hm2',t:'2. قِس I<sub>1</sub> و I<sub>2</sub> و I<sub>3</sub> و I<sub>T</sub> بدقة.',subs:[
        {k:'set',dev:'psu',t:'شغّل الـ OUTPUT على E = 10 V.',ok:s=>!!s.s10&&s.s10.ok,do:A=>psuOn(A,10),hint:'الـ POWER والـ OUTPUT على ON، والوحدة على 10 V'},
        {k:'set',dev:'hm2',t:'حوّل الـ GoldStar (M2) على 40 mA.',ok:s=>s.gs40&&RT.S.hm2.fn==='DCI',do:A=>meterTo(A,2,6),hint:'لف قرص الـ GoldStar على 40 mA'},
        ...[['i1','I<sub>1</sub>','اللي في فرع R1'],['i2','I<sub>2</sub>','اللي في فرع R2'],['i3','I<sub>3</sub>','اللي في فرع R3'],['it','I<sub>T</sub>','اللي بين المصدر والفروع']].flatMap(([k,l,at])=>[
          {k:'measure',dev:'hm2',t:`${l}: شيل الـ bridging plug ${at} وحط الأميتر مكانه (V·Ω·mA على جهة المصدر، COM على الجهة الثانية)، وبعدها رجّع الـ plug.`,ok:()=>ST[k]!=null,do:A=>A.connect(AM[k]),
            hint:s=>s.gs40?`الأميتر على التوالي: مكان الـ plug ${at}`:'M2 لازم يكون على 40 mA'},
          {k:'rec',t:`سجّل ${l} في Table 5.`,ok:()=>ST[k]!=null,rec:[{to:k+'m',val:()=>ST[k]!=null?ST[k]*1e3:null,unit:'mA',dec:2,label:l}]}])]},
      calc('3. احسب I<sub>1</sub> و I<sub>2</sub> و I<sub>3</sub> بالـ current division rule.'),
      calc('4. سجّل نتائجك في Table 5.'),
      calc('5. علّق على الفرق (إن وجد) بين I<sub>1</sub> و I<sub>2</sub> و I<sub>3</sub> و I<sub>T</sub> في الخطوات (2) و (3) و (4).'),
      /* Procedure IV (manual p. 16), steps 1–6 */
      {dev:'board',build:'7',t:'Procedure IV · 1. وصّل الدائرة Fig. 7 واحسب التيار I<sub>D</sub> بأي طريقة <b>إلا</b> الـ Δ-Y transformation.',subs:[{k:'build',fig:'7'}]},
      {dev:'hm2',t:'2. قِس I<sub>D</sub> بدقة.',subs:[
        {k:'set',dev:'hm2',t:'حوّل M2 على 400 mA (I<sub>D</sub> أكبر من 40 mA).',ok:s=>s.gs400,do:A=>meterTo(A,2,7),hint:'لف قرص الـ GoldStar على 400 mA'},
        {k:'set',dev:'psu',t:'اضبط المصدر على E = 15 V.',ok:s=>!!s.s15&&Math.abs(s.s15.U.v-15)<0.006,do:A=>volts(A,15),hint:'لف COARSE لين 15 V، وكمّل بالـ FINE'},
        {k:'set',dev:'psu',t:'شغّل الـ OUTPUT.',ok:s=>!!s.s15&&s.s15.ok,do:A=>psuOn(A,15)},
        {k:'rec',t:'سجّل I<sub>D</sub>.',ok:()=>ST.id!=null,rec:[{to:'idm',val:()=>ST.id!=null?ST.id*1e3:null,unit:'mA',dec:2,label:'I<sub>D</sub>'}]}]},
      calc('3. قارن قيم I<sub>D</sub>: المحسوبة والمقاسة والـ simulated.'),
      calc('4. احسب الـ Y المكافئ لـ Δ abc وسجّل قيم المقاومات R<sub>a</sub> و R<sub>b</sub> و R<sub>c</sub>.'),
      {dev:'board',build:'8',t:'5. وصّل دائرة Fig. 8 وقِس I<sub>Y</sub>.',subs:[
        ...[['a',1,'ra','R<sub>ab</sub> R<sub>ac</sub>'],['b',2,'rb','R<sub>ab</sub> R<sub>bc</sub>'],['c',3,'rc','R<sub>ac</sub> R<sub>bc</sub>']].map(([x,n,k,num])=>
          ({k:'set',dev:'yew'+n,t:`اضبط R<sub>${x}</sub> اللي حسبته على الصندوق R${n} (لأقرب Ω).`,ok:()=>Math.abs(box(n)-CAL[k])<=1,do:A=>dials(A,n,CAL[k]),hint:`R<sub>${x}</sub> = ${num} / (R<sub>ab</sub> + R<sub>bc</sub> + R<sub>ac</sub>)`})),
        {k:'build',fig:'8',t:'شيل مقاومات الـ Δ abc (220 Ω a-c، 470 Ω a-b، 10 kΩ c-b)، ووصّل الصناديق الثلاث Y (<bdi dir="ltr">Fig. 8</bdi>): كل صندوق بين نقطة الـ Y وطرفه.'},
        {k:'rec',t:'بنفس E = 15 V سجّل I<sub>Y</sub> من M2.',ok:s=>s.ySet&&ST.iy!=null,rec:[{to:'iym',val:()=>ST.iy!=null?ST.iy*1e3:null,unit:'mA',dec:2,label:'I<sub>Y</sub>'}]}]},
      calc('6. قارن قيم I<sub>D</sub> و I<sub>Y</sub>: المقاسة والمحسوبة والـ simulated.')
    ],
    onReset(){ST={};$('result').innerHTML=''}};
}};})();
