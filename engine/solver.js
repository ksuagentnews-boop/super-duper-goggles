/* Circuit solver: device models, DC operating point (Newton), quasi-static sweep, transient.
   Netlist ck: {n, els:[...], p1, p2, dcs:[element indices of DC supplies]}. Node -1 is earth.
   Element types:
     G   {a,b,g}             conductance
     D   {a,b,f}             two-terminal nonlinear device, f(v)->[i,g], v = Va-Vb (a = anode)
     VS  {a,r}               earth-referenced source (function generator), series r; value = sweep variable / vsFn(t)
     DC  {a,b,v,ilim,r}      floating dc supply unit, a = +, with current limit (CV/CC)
     XS  {a,b,s,vp,f,r}      transformer winding, s·vp·sin(2πft), series r
     C   {a,b,c}             capacitor (backward Euler in transient)
     CCS {a,b,i0,vmax}       meter test source (Ω / diode / continuity): pushes i0 out of a, collapses as Va-Vb -> vmax */
const SOLVER=(()=>{
  const VT=0.02585;
  function dexp(v,Is,nvt){const a=v/nvt;if(a>40){const e=Math.exp(40);return [Is*e*(1+a-40),Is*e/nvt]}const e=Math.exp(a);return [Is*(e-1),Is*e/nvt]}
  /* 1N4001/1N4002 silicon rectifier */
  function diodeSi(v){return dexp(v,7e-9,1.8*VT)}
  /* 1N4733A Zener (VZ = 5.1 V @ 49 mA): forward Si junction + reverse breakdown knee near 4.95 V */
  function zener(v){const [i1,g1]=dexp(v,1.5e-15,1.05*VT);const vr=-v;let a=(vr-4.95)/0.06,ib,gb;if(a>40){const e=Math.exp(40);ib=1e-3*e*(1+a-40);gb=1e-3*e/0.06}else{const e=Math.exp(a);ib=1e-3*e;gb=1e-3*e/0.06}
    const ib0=1e-3*Math.exp(-4.95/0.06);return [i1-(ib-ib0),g1+gb]}
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
        else if(e.t==='C'){if(ctx.dt){const g=e.c/ctx.dt;st(e.a,e.b,g*(V(e.a)-V(e.b)-ctx.vprev[ei]),g)}}
        else if(e.t==='CCS'){const [i,g]=ccs(e,V(e.a)-V(e.b));st(e.a,e.b,-i,g)}
      });
      const dx=lsolve(A,F.map(v=>-v),n);let mx=0;for(let k=0;k<n;k++)mx=Math.max(mx,Math.abs(dx[k]));
      const sc=mx>damp?damp/mx:1;for(let k=0;k<n;k++)x[k]+=dx[k]*sc;if(mx<tol)break;
    }
    return x;
  }
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
    for(let c=0;c<cycles;c++)for(let k=0;k<NS;k++){const t=(c*NS+k+1)*dt;const r=solveCC(ck,{t,dt,vprev,vs:vsFn?vsFn(t):0},x,60,0.5,1e-8);x=r.x;
      ck.els.forEach((e,ei)=>{if(e.t==='C'){const v=V(e.a)-V(e.b);vprev[ei]=v;if(c===cycles-1)capMin[e.pid]=Math.min(capMin[e.pid]??1e9,v)}
        if(e.t==='XS'&&c===cycles-1){const v=e.s*e.vp*Math.sin(2*Math.PI*e.f*t);imax=Math.max(imax,Math.abs((V(e.a)-V(e.b)-v)/e.r))}});
      if(c===cycles-1){const kk=(k+1)%NS;v1[kk]=ck.p1==null?NaN:V(ck.p1);v2[kk]=ck.p2==null?NaN:V(ck.p2);X[kk]=Float64Array.from(x);r.Is.forEach((I,u)=>{Iabs[u]+=Math.abs(I)/NS;if(r.ccs[u])ccs[u]=true})}}
    return {kind:'tran',f,v1,v2,X,imax,capMin,has1:ck.p1!=null,has2:ck.p2!=null,Idc:Iabs,ccs}}
  return {VT,dexp,diodeSi,zener,uf,lsolve,newton,point,sweep,interp,simulate,ccs,NS};
})();
