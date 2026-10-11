/* Circuit solver: device models, DC operating point (Newton), quasi-static sweep, transient.
   Netlist ck: {n, els:[...], p1, p2, dcs:[element indices of DC supplies]}. Node -1 is earth.
   Element types:
     G   {a,b,g}             conductance
     D   {a,b,f}             two-terminal nonlinear device, f(v)->[i,g], v = Va-Vb (a = anode)
     VS  {a,r}               earth-referenced source (function generator), series r; value = sweep variable / vsFn(t)
     DC  {a,b,v,ilim,r}      floating dc supply unit, a = +, with current limit (CV/CC)
     XS  {a,b,s,vp,f,r}      transformer winding, s·vp·sin(2πft), series r
     C   {a,b,c}             capacitor (backward Euler in transient)
     CCS {a,b,i0,vmax}       meter test source (Ω / diode / continuity): pushes i0 out of a, collapses as Va-Vb -> vmax
     BJT {c,b,e,m}           npn transistor, m(vbe,vbc) -> [iC, iB]
     FET {d,g,s,m}           enhancement n-MOSFET, m.ids(vgs,vds) -> drain current (d -> s)
     L   {a,b,l}             inductor (backward Euler; a 1 mΩ short in the dc operating point); ctx.vprev holds its current
     XF  {pa,pb,sa,sb,n,j}   ideal transformer vs = n·vp (perfectly coupled inductors, SPICE K = 1); x[j] = secondary current
     OA  {p,m_,o,vp,vn,y,m}  op amp macro-model (pins +, −, out, V+, V−; y = internal node of the gain stage; m = model) */
const SOLVER=(()=>{
  const VT=0.02585;
  function dexp(v,Is,nvt){const a=v/nvt;if(a>40){const e=Math.exp(40);return [Is*e*(1+a-40),Is*e/nvt]}const e=Math.exp(a);return [Is*(e-1),Is*e/nvt]}
  /* Two-terminal junction model with series resistance, reverse breakdown and leakage.
     Junction: i(vj) = Is·(e^(vj/nVT) − 1) − Ib·e^((−vj − Vb)/nb) + gl·vj ; terminal v = vj + Rs·i.
     Returns f(v) -> [i, di/dv] (v = anode − cathode), solved for vj by damped Newton. */
  function junction(m){const nvt=m.n*VT;let last=0;
    const ij=vj=>{const [i1,g1]=dexp(vj,m.Is,nvt);let i=i1,g=g1;if(m.Vb){const a=(-vj-m.Vb)/m.nb;let e,d;if(a>40){const E=Math.exp(40);e=E*(1+a-40);d=E}else{e=Math.exp(a);d=e}
        i-=m.Ib*(e-Math.exp(-m.Vb/m.nb));g+=m.Ib*d/m.nb}if(m.gl){i+=m.gl*vj;g+=m.gl}return [i,g]};
    const f=v=>{if(!m.Rs){return ij(v)}let vj=Math.max(Math.min(last,v+5),v-5);
      for(let k=0;k<60;k++){const [i,g]=ij(vj);const h=vj+m.Rs*i-v,dh=1+m.Rs*g;let st=h/dh;if(Math.abs(st)>0.2)st=0.2*Math.sign(st);vj-=st;if(Math.abs(st)<1e-12)break}
      last=vj;const [i,g]=ij(vj);return [i,g/(1+m.Rs*g)]};
    f.model=m;return f}
  /* 1N4001 / 1N4002 silicon rectifier (n ≈ 1.8, VF ≈ 0.55 V @ 1 mA, ≈ 0.66 V @ 10 mA, VRRM 50/100 V) */
  const diodeSi=junction({Is:7e-9,n:1.8,Vb:75,Ib:1e-3,nb:0.5});
  /* 1N4733A Zener: VZ = 5.1 V @ IZT 49 mA (≈4.8 V @ 1 mA, soft knee of a 5 V zener, ZZT within 7 Ω); forward ≈ 0.68 V @ 1 mA */
  const zener=junction({Is:4e-14,n:1.1,Vb:4.80,Ib:1e-3,nb:0.065,Rs:2});
  /* 1N34A-class germanium point-contact diode: ≈0.25 V @ 1 mA, large series resistance, µA reverse leakage */
  const diodeGe=junction({Is:1.5e-6,n:1.4,Rs:25,gl:2e-7,Vb:60,Ib:1e-4,nb:1});
  /* 5 mm green LED (GaP): ≈1.8 V @ 1 mA, ≈2.1 V @ 20 mA; reverse breakdown well above 5 V */
  const led=junction({Is:1e-18,n:2.0,Rs:10,Vb:15,Ib:1e-4,nb:0.3});
  const MODELS={si:diodeSi,zener,ge:diodeGe,led};
  /* µA741 (TI / Fairchild datasheet, typical at ±15 V): Rin 2 MΩ, Avol 200 V/mV, GBW 1 MHz, SR 0.5 V/µs,
     output swing ≈ ±14 V into 10 kΩ and ≈ ±13 V into 2 kΩ, short-circuit current 25 mA, supply current 1.7 mA.
     Macro-model: a saturating transconductance stage (gm, ±Imax) drives the internal node y loaded by G1 ∥ Cc
     (dominant pole: GBW = gm/2πCc, slew rate = Imax/Cc); y is clamped Voff below / above the rails; the output
     follows y through Rout with a current limit. Internal impedances are scaled (Cc = 300 pF) for conditioning. */
  const UA741=(()=>{const Cc=300e-12,gbw=1e6,sr=0.5e6,A0=2e5;const gm=2*Math.PI*gbw*Cc;return {Rin:2e6,gm,Imax:sr*Cc,G1:gm/A0,Cc,Voff:1.0,Vc:0.03,Ic:1e-5,Rout:150,Ilim:0.025,Iq:1.7e-3}})();
  MODELS.ua741=UA741;
  /* Enhancement n-MOSFET, square law with channel-length modulation and a smooth (EKV-style) subthreshold
     transition: Veff = 2nVT·ln(1 + e^((vGS − Vt)/2nVT)); saturation iD = K/2·Veff²·(1 + λvDS),
     triode iD = K(Veff·vDS − vDS²/2)(1 + λvDS). Symmetric in d/s for vDS < 0.
     IRF620 (Vishay / ST datasheets): VGS(th) 2–4 V at ID = 250 µA (≈3.0 V typical used here), transfer curve
     ≈ 0.1 A at VGS ≈ 4 V → K ≈ 0.18 A/V² in the low-current region used in the lab, λ ≈ 0.02 V⁻¹. */
  function mosfet(m){const nv=2*m.n*VT;const veff=v=>{const a=(v-m.Vt)/nv;return a>40?v-m.Vt:nv*Math.log1p(Math.exp(a))};
    const f=(vgs,vds)=>{if(vds<0)return -f(vgs-vds,-vds);const ve=veff(vgs),cl=1+m.lam*vds;return vds<ve?m.K*(ve*vds-vds*vds/2)*cl:m.K/2*ve*ve*cl};
    f.model=m;return f}
  /* npn BJT, Ebers–Moll transport model with the Early effect:
     iCC = IS(e^(vBE/VT) − 1), iEC = IS(e^(vBC/VT) − 1); iC = (iCC − iEC)(1 + vCE/VA) − iEC/βR; iB = iCC/βF + iEC/βR.
     BD137 (ON Semi BD135G/137G/139G datasheet): hFE ≈ 100–150 from 1 mA to 0.1 A (130 used), VBE(on) ≈ 0.6 V at 1 mA,
     βR ≈ 5, VA ≈ 100 V. */
  function bjt(m){const e=v=>{const a=v/VT;if(a>40){const E=Math.exp(40);return E*(1+a-40)}return Math.exp(a)};
    const f=(vbe,vbc)=>{const icc=m.Is*(e(vbe)-1),iec=m.Is*(e(vbc)-1);return [(icc-iec)*(1+(vbe-vbc)/m.VA)-iec/m.Br,icc/m.Bf+iec/m.Br]};f.model=m;return f}
  MODELS.bd137=bjt({Is:8e-14,Bf:130,Br:5,VA:100});
  MODELS.irf620=mosfet({K:0.18,Vt:3.0,n:1.5,lam:0.02});
  const xexp=a=>{if(a>40){const E=Math.exp(40);return [E*(1+a-40),E]}const e=Math.exp(a);return [e,e]};
  function uf(n){const p=[...Array(n).keys()];const f=x=>p[x]===x?x:(p[x]=f(p[x]));return {f,u:(a,b)=>{a=f(a);b=f(b);if(a!==b)p[a]=b}}}
  function lsolve(A,b,n){for(let c=0;c<n;c++){let m=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r*n+c])>Math.abs(A[m*n+c]))m=r;if(Math.abs(A[m*n+c])<1e-30)continue;
    if(m!==c){for(let k=0;k<n;k++){const t=A[c*n+k];A[c*n+k]=A[m*n+k];A[m*n+k]=t}const t=b[c];b[c]=b[m];b[m]=t}
    for(let r=c+1;r<n;r++){const f=A[r*n+c]/A[c*n+c];if(!f)continue;for(let k=c;k<n;k++)A[r*n+k]-=f*A[c*n+k];b[r]-=f*b[c]}}
    const x=new Float64Array(n);for(let r=n-1;r>=0;r--){let s=b[r];for(let k=r+1;k<n;k++)s-=A[r*n+k]*x[k];x[r]=Math.abs(A[r*n+r])<1e-30?0:s/A[r*n+r]}return x}
  const dcList=ck=>ck.dcs||(ck.dcIdx>=0?[ck.dcIdx]:[]);
  /* meter source current pushed out of a for terminal voltage v, and its conductance */
  function ccs(e,v){const a=(v-e.vmax)/0.05;let ex,d;if(a>40){const E=Math.exp(40);ex=E*(1+a-40);d=E}else{ex=Math.exp(a);d=ex}return [e.i0*(1-ex),e.i0*d/0.05]}
  /* shared Newton loop. ctx: {vs, t, dt, vprev, cc:[forced current per dc unit or 0]} */
  function newton(ck,x0,ctx,maxIt,damp,tol){
    const n=ck.n;const x=x0?Float64Array.from(x0):new Float64Array(n);if(!n)return x;
    const V=i=>i<0?0:x[i];const dcs=dcList(ck);
    for(let it=0;it<maxIt;it++){
      const A=new Float64Array(n*n),F=new Float64Array(n);
      const st=(a,b,i,g)=>{ // current i leaving a toward b, conductance g
        if(a>=0){F[a]+=i;A[a*n+a]+=g;if(b>=0)A[a*n+b]-=g}
        if(b>=0){F[b]-=i;A[b*n+b]+=g;if(a>=0)A[b*n+a]-=g}};
      for(let k=0;k<n;k++){F[k]+=1e-9*x[k];A[k*n+k]+=1e-9}
      ck.els.forEach((e,ei)=>{
        if(e.t==='G')st(e.a,e.b,e.g*(V(e.a)-V(e.b)),e.g);
        else if(e.t==='D'){const [i,g]=e.f(V(e.a)-V(e.b));st(e.a,e.b,i,g)}
        else if(e.t==='VS'){const g=1/e.r;const i=g*(V(e.a)-ctx.vs);if(e.a>=0){F[e.a]+=i;A[e.a*n+e.a]+=g}}
        else if(e.t==='DC'){const u=dcs.indexOf(ei),cc=ctx.cc&&ctx.cc[u];if(cc)st(e.a,e.b,-cc,0);else{const g=1/e.r;st(e.a,e.b,g*(V(e.a)-V(e.b)-e.v),g)}}
        else if(e.t==='XS'){const v=e.s*e.vp*Math.sin(2*Math.PI*e.f*ctx.t);const g=1/e.r;st(e.a,e.b,g*(V(e.a)-V(e.b)-v),g)}
        else if(e.t==='C'){if(ctx.dt){const g=e.c/ctx.dt;st(e.a,e.b,g*(V(e.a)-V(e.b)-ctx.vprev[ei]),g)}else if(ctx.leak)st(e.a,e.b,ctx.leak*(V(e.a)-V(e.b)),ctx.leak)}
        else if(e.t==='CCS'){const [i,g]=ccs(e,V(e.a)-V(e.b));st(e.a,e.b,-i,g)}
        else if(e.t==='OA')stampOA(e,V,F,A,n,st,ctx,ei);
        else if(e.t==='L'){const v=V(e.a)-V(e.b);if(ctx.dt){const g=ctx.dt/e.l;st(e.a,e.b,ctx.vprev[ei]+g*v,g)}else st(e.a,e.b,1e3*v,1e3)}
        else if(e.t==='XF'){const J=(r,c,g)=>{if(r>=0&&c>=0)A[r*n+c]+=g};const is=x[e.j];
          F[e.j]+=V(e.sa)-V(e.sb)-e.n*(V(e.pa)-V(e.pb));J(e.j,e.sa,1);J(e.j,e.sb,-1);J(e.j,e.pa,-e.n);J(e.j,e.pb,e.n);
          if(e.sa>=0){F[e.sa]-=is;J(e.sa,e.j,-1)}if(e.sb>=0){F[e.sb]+=is;J(e.sb,e.j,1)}if(e.pa>=0){F[e.pa]+=e.n*is;J(e.pa,e.j,e.n)}if(e.pb>=0){F[e.pb]-=e.n*is;J(e.pb,e.j,-e.n)}}
        else if(e.t==='BJT'){const vb=V(e.b),vc=V(e.c),ve=V(e.e),h=1e-7;const [ic,ib]=e.m(vb-ve,vb-vc);
          const d1=e.m(vb-ve+h,vb-vc),d2=e.m(vb-ve,vb-vc+h);const J=(r,c,g)=>{if(r>=0&&c>=0)A[r*n+c]+=g};
          /* partial derivatives of iC, iB wrt vBE (x) and vBC (y); node voltages: vb → x,y; vc → −y; ve → −x */
          const cx=(d1[0]-ic)/h,cy=(d2[0]-ic)/h,bx=(d1[1]-ib)/h,by=(d2[1]-ib)/h;
          const row=(r,i,gx,gy)=>{if(r<0)return;F[r]+=i;J(r,e.b,gx+gy);J(r,e.c,-gy);J(r,e.e,-gx)};
          row(e.c,ic,cx,cy);row(e.b,ib,bx,by);row(e.e,-(ic+ib),-(cx+bx),-(cy+by))}
        else if(e.t==='FET'){const vg=V(e.g),vd=V(e.d),vs=V(e.s),h=1e-6;const i=e.m(vg-vs,vd-vs),gm=(e.m(vg-vs+h,vd-vs)-i)/h,gd=(e.m(vg-vs,vd-vs+h)-i)/h;
          const J=(r,c,g)=>{if(r>=0&&c>=0)A[r*n+c]+=g};
          if(e.d>=0){F[e.d]+=i;J(e.d,e.g,gm);J(e.d,e.d,gd);J(e.d,e.s,-gm-gd)}if(e.s>=0){F[e.s]-=i;J(e.s,e.g,-gm);J(e.s,e.d,-gd);J(e.s,e.s,gm+gd)}}
      });
      const dx=lsolve(A,F.map(v=>-v),n);let mx=0;for(let k=0;k<n;k++)mx=Math.max(mx,Math.abs(dx[k]));
      const sc=mx>damp?damp/mx:1;for(let k=0;k<n;k++)x[k]+=dx[k]*sc;if(mx<tol)break;
    }
    return x;
  }
  /* op amp stamp: rows get F (current leaving the node) and the Jacobian A */
  function stampOA(e,V,F,A,n,st,ctx,ei){const M=e.m;const J=(r,c,g)=>{if(r>=0&&c>=0)A[r*n+c]+=g};
    st(e.p,e.m_,(V(e.p)-V(e.m_))/M.Rin,1/M.Rin);
    const vsup=V(e.vp)-V(e.vn);const gq=M.Iq/30;st(e.vp,e.vn,gq*vsup,gq);
    const y=e.y;const vd=V(e.p)-V(e.m_);const th=Math.tanh(M.gm*vd/M.Imax);const it=M.Imax*th,gt=M.gm*(1-th*th);
    F[y]+=M.G1*V(y)-it;J(y,y,M.G1);J(y,e.p,-gt);J(y,e.m_,gt);
    if(ctx.dt){const g=M.Cc/ctx.dt;F[y]+=g*(V(y)-ctx.vprev[ei]);J(y,y,g)}
    {const [ex]=xexp((V(y)-V(e.vp)+M.Voff)/M.Vc);const i=M.Ic*ex,g=i/M.Vc;F[y]+=i;J(y,y,g);J(y,e.vp,-g)}
    {const [ex]=xexp((V(e.vn)+M.Voff-V(y))/M.Vc);const i=M.Ic*ex,g=i/M.Vc;F[y]-=i;J(y,y,g);J(y,e.vn,-g)}
    const u=(V(y)-V(e.o))/M.Rout/M.Ilim,tu=Math.tanh(u);const io=M.Ilim*tu,go=(1-tu*tu)/M.Rout;
    if(e.o>=0){F[e.o]-=io;J(e.o,y,-go);J(e.o,e.o,go)}}
  const dcI=(ck,x,cc)=>dcList(ck).map((ei,u)=>{const e=ck.els[ei];if(cc&&cc[u])return cc[u];const V=i=>i<0?0:x[i];return (e.v-(V(e.a)-V(e.b)))/e.r});
  /* dc operating point with CV/CC handling of every supply unit */
  function solveCC(ck,ctx,x0,maxIt,damp,tol){
    const dcs=dcList(ck);const cc=dcs.map(()=>0);ctx.cc=cc;
    let x=newton(ck,x0,ctx,maxIt,damp,tol);
    for(let pass=0;pass<4&&dcs.length;pass++){let ch=false;const I=dcI(ck,x,cc);const V=i=>i<0?0:x[i];
      dcs.forEach((ei,u)=>{const e=ck.els[ei];
        if(!cc[u]&&Math.abs(I[u])>e.ilim){cc[u]=Math.sign(I[u])*e.ilim;ch=true}
        else if(cc[u]&&Math.abs(V(e.a)-V(e.b))>e.v+1e-6){cc[u]=0;ch=true}});
      if(!ch)break;x=newton(ck,x,ctx,maxIt,damp,tol)}
    return {x,Is:dcI(ck,x,cc),ccs:cc.map(c=>!!c)};
  }
  function point(ck,vs,x0){const r=solveCC(ck,{vs},x0,300,0.4,1e-9);
    const V=i=>i==null?null:i<0?0:r.x[i];return {v1:V(ck.p1),v2:V(ck.p2),I:r.Is[0]||0,Is:r.Is,cc:r.ccs.some(Boolean),ccs:r.ccs,x:r.x}}
  /* quasi-static sweep of the generator value over [lo,hi] */
  function sweep(ck,lo,hi,K=121){const vs=[],v1=[],v2=[],I=[],X=[],Is=[];let cc=false;const ccs=dcList(ck).map(()=>false);const tmp=new Array(K);const at=j=>lo+(hi-lo)*j/(K-1);
    let h=K>1?clamp(Math.round((0-lo)/((hi-lo)||1)*(K-1)),0,K-1):0;
    let x=null;for(let j=h;j<K;j++){const r=point(ck,at(j),x);x=r.x;tmp[j]=r}
    x=tmp[h].x;for(let j=h-1;j>=0;j--){const r=point(ck,at(j),x);x=r.x;tmp[j]=r}
    for(let j=0;j<K;j++){const r=tmp[j];vs.push(at(j));v1.push(r.v1);v2.push(r.v2);I.push(r.I);X.push(r.x);Is.push(r.Is);if(r.cc)cc=true;r.ccs.forEach((c,u)=>{if(c)ccs[u]=true})}
    return {kind:'sweep',lo,hi,vs,v1,v2,I,X,Is,cc,ccs}}
  const interp=(tb,arr,s)=>{if(!arr||arr[0]==null)return 0;if(tb.hi===tb.lo)return arr[0];const u=(s-tb.lo)/(tb.hi-tb.lo)*(tb.vs.length-1);const i=clamp(Math.floor(u),0,tb.vs.length-2),f=clamp(u-i,0,1);return arr[i]*(1-f)+arr[i+1]*f};
  /* ---------- transient ---------- */
  const NS=300;
  /* simulate `cycles` periods of frequency f; vsFn(t) drives VS elements. Returns the last period sampled at NS points. */
  function simulate(ck,f,cycles=6,vsFn){const n=ck.n;const dt=1/f/NS;let x=new Float64Array(n);const vprev=ck.els.map(()=>0);const nd=dcList(ck).length;
    const v1=new Float64Array(NS),v2=new Float64Array(NS),X=new Array(NS);let imax=0;const capMin={};const Iabs=new Array(nd).fill(0),ccs=new Array(nd).fill(false);
    const V=i=>i==null?0:i<0?0:x[i];
    /* start from the dc operating point at t = 0 (capacitors charged to it: the circuit has been powered for a while).
       Capacitors leak 10 MΩ here so a section with no dc path to earth takes its potential through them instead of
       sitting at an arbitrary level set by gmin */
    {const r=solveCC(ck,{t:0,dt:0,vprev,leak:1e-7,vs:vsFn?vsFn(0):0},null,300,0.4,1e-9);x=r.x;ck.els.forEach((e,ei)=>{if(e.t==='C')vprev[ei]=V(e.a)-V(e.b);if(e.t==='OA')vprev[ei]=V(e.y)})}
    for(let c=0;c<cycles;c++)for(let k=0;k<NS;k++){const t=(c*NS+k+1)*dt;const r=solveCC(ck,{t,dt,vprev,vs:vsFn?vsFn(t):0},x,60,0.5,1e-8);x=r.x;
      ck.els.forEach((e,ei)=>{if(e.t==='OA')vprev[ei]=V(e.y);if(e.t==='C'){const v=V(e.a)-V(e.b);vprev[ei]=v;if(c===cycles-1)capMin[e.pid]=Math.min(capMin[e.pid]??1e9,v)}
        if(e.t==='XS'&&c===cycles-1){const v=e.s*e.vp*Math.sin(2*Math.PI*e.f*t);imax=Math.max(imax,Math.abs((V(e.a)-V(e.b)-v)/e.r))}});
      if(c===cycles-1){const kk=(k+1)%NS;v1[kk]=ck.p1==null?NaN:V(ck.p1);v2[kk]=ck.p2==null?NaN:V(ck.p2);X[kk]=Float64Array.from(x);r.Is.forEach((I,u)=>{Iabs[u]+=Math.abs(I)/NS;if(r.ccs[u])ccs[u]=true})}}
    return {kind:'tran',f,v1,v2,X,imax,capMin,has1:ck.p1!=null,has2:ck.p2!=null,Idc:Iabs,ccs}}
  return {VT,dexp,junction,bjt,mosfet,MODELS,diodeSi,zener,diodeGe,led,uf,lsolve,newton,point,sweep,interp,simulate,ccs,NS};
})();
