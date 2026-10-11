/* Circuit solver: device models, DC operating point (Newton), quasi-static sweep, transient.
   Netlist: {n, els:[...], p1, p2, dcIdx}. Node -1 is earth (scope / generator ground).
   Element types:
     G  {a,b,g}            conductance
     D  {a,b,f}            two-terminal nonlinear device, f(v)->[i,g], v = Va-Vb (a = anode)
     VS {a,r}              earth-referenced source (function generator) with series r, value = sweep variable
     DC {a,b,v,ilim,r}     floating dc supply, a = +, current limit (CV/CC)
     XS {a,b,s,vp,f,r}     transformer winding, s·vp·sin(2πft) with series r
     C  {a,b,c}            capacitor (backward Euler in transient) */
const SOLVER=(()=>{
  const VT=0.02585;
  function dexp(v,Is,nvt){const a=v/nvt;if(a>40){const e=Math.exp(40);return [Is*e*(1+a-40),Is*e/nvt]}const e=Math.exp(a);return [Is*(e-1),Is*e/nvt]}
  function diodeSi(v){return dexp(v,7e-9,1.8*VT)}
  function zener(v){const [i1,g1]=dexp(v,1.5e-15,1.05*VT);const vr=-v;let a=(vr-4.95)/0.06,ib,gb;if(a>40){const e=Math.exp(40);ib=1e-3*e*(1+a-40);gb=1e-3*e/0.06}else{const e=Math.exp(a);ib=1e-3*e;gb=1e-3*e/0.06}
    // subtract tiny value at v=0 to keep i(0)=0
    const ib0=1e-3*Math.exp(-4.95/0.06);return [i1-(ib-ib0),g1+gb]}
  function uf(n){const p=[...Array(n).keys()];const f=x=>p[x]===x?x:(p[x]=f(p[x]));return {f,u:(a,b)=>{a=f(a);b=f(b);if(a!==b)p[a]=b}}}
  function lsolve(A,b,n){for(let c=0;c<n;c++){let m=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r*n+c])>Math.abs(A[m*n+c]))m=r;if(Math.abs(A[m*n+c])<1e-30)continue;
    if(m!==c){for(let k=0;k<n;k++){const t=A[c*n+k];A[c*n+k]=A[m*n+k];A[m*n+k]=t}const t=b[c];b[c]=b[m];b[m]=t}
    for(let r=c+1;r<n;r++){const f=A[r*n+c]/A[c*n+c];if(!f)continue;for(let k=c;k<n;k++)A[r*n+k]-=f*A[c*n+k];b[r]-=f*b[c]}}
    const x=new Float64Array(n);for(let r=n-1;r>=0;r--){let s=b[r];for(let k=r+1;k<n;k++)s-=A[r*n+k]*x[k];x[r]=Math.abs(A[r*n+r])<1e-30?0:s/A[r*n+r]}return x}
  /* dc operating point for sweep value vs; cc = forced current of the dc supply (CC mode) or 0 */
  function solveOp(ck,vs,x0,cc){
    const n=ck.n;const x=x0?Float64Array.from(x0):new Float64Array(n);if(!n)return {x,I:0};
    const V=i=>i<0?0:x[i];
    for(let it=0;it<300;it++){
      const A=new Float64Array(n*n),F=new Float64Array(n);
      const st=(a,b,i,g)=>{ // current i leaving a toward b, conductance g
        if(a>=0){F[a]+=i;A[a*n+a]+=g;if(b>=0)A[a*n+b]-=g}
        if(b>=0){F[b]-=i;A[b*n+b]+=g;if(a>=0)A[b*n+a]-=g}};
      for(let k=0;k<n;k++){F[k]+=1e-9*x[k];A[k*n+k]+=1e-9}
      ck.els.forEach((e,ei)=>{
        if(e.t==='G'){const i=e.g*(V(e.a)-V(e.b));st(e.a,e.b,i,e.g)}
        else if(e.t==='D'){const [i,g]=e.f(V(e.a)-V(e.b));st(e.a,e.b,i,g)}
        else if(e.t==='VS'){const g=1/e.r;const i=g*(V(e.a)-vs);if(e.a>=0){F[e.a]+=i;A[e.a*n+e.a]+=g}}
        else if(e.t==='DC'){if(cc){const i=-cc;st(e.a,e.b,i,0)}else{const g=1/e.r;const i=g*(V(e.a)-V(e.b)-e.v);st(e.a,e.b,i,g)}}
      });
      const dx=lsolve(A,F.map(v=>-v),n);let mx=0;for(let k=0;k<n;k++)mx=Math.max(mx,Math.abs(dx[k]));
      const sc=mx>0.4?0.4/mx:1;for(let k=0;k<n;k++)x[k]+=dx[k]*sc;if(mx<1e-9)break;
    }
    let I=0;if(ck.dcIdx>=0){const e=ck.els[ck.dcIdx];I=cc?cc:(e.v-(V(e.a)-V(e.b)))/e.r}
    return {x,I};
  }
  function point(ck,vs,x0){let r=solveOp(ck,vs,x0,0);let cc=false;
    if(ck.dcIdx>=0){const e=ck.els[ck.dcIdx];if(Math.abs(r.I)>e.ilim){r=solveOp(ck,vs,r.x,Math.sign(r.I)*e.ilim);cc=true}}
    const V=i=>i==null?null:i<0?0:r.x[i];return {v1:V(ck.p1),v2:V(ck.p2),I:r.I,cc,x:r.x}}
  /* quasi-static sweep of the source value over [lo,hi] */
  function sweep(ck,lo,hi,K=121){const vs=[],v1=[],v2=[],I=[];let cc=false;const tmp=new Array(K);const at=j=>lo+(hi-lo)*j/(K-1);
    let h=K>1?clamp(Math.round((0-lo)/((hi-lo)||1)*(K-1)),0,K-1):0;
    let x=null;for(let j=h;j<K;j++){const r=point(ck,at(j),x);x=r.x;tmp[j]=r}
    x=tmp[h].x;for(let j=h-1;j>=0;j--){const r=point(ck,at(j),x);x=r.x;tmp[j]=r}
    for(let j=0;j<K;j++){vs.push(at(j));v1.push(tmp[j].v1);v2.push(tmp[j].v2);I.push(tmp[j].I);if(tmp[j].cc)cc=true}
    return {lo,hi,vs,v1,v2,I,cc}}
  const interp=(tb,arr,s)=>{if(!arr||arr[0]==null)return 0;if(tb.hi===tb.lo)return arr[0];const u=(s-tb.lo)/(tb.hi-tb.lo)*(tb.vs.length-1);const i=clamp(Math.floor(u),0,tb.vs.length-2),f=clamp(u-i,0,1);return arr[i]*(1-f)+arr[i+1]*f};
  /* ---------- transient ---------- */
  function stepSolve(ck,t,x,vprev,dt){const n=ck.n;const V=i=>i<0?0:x[i];
    for(let it=0;it<60;it++){const A=new Float64Array(n*n),F=new Float64Array(n);
      const st=(a,b,i,g)=>{if(a>=0){F[a]+=i;A[a*n+a]+=g;if(b>=0)A[a*n+b]-=g}if(b>=0){F[b]-=i;A[b*n+b]+=g;if(a>=0)A[b*n+a]-=g}};
      for(let k=0;k<n;k++){F[k]+=1e-9*x[k];A[k*n+k]+=1e-9}
      ck.els.forEach((e,ei)=>{if(e.t==='G')st(e.a,e.b,e.g*(V(e.a)-V(e.b)),e.g);else if(e.t==='D'){const [i,g]=e.f(V(e.a)-V(e.b));st(e.a,e.b,i,g)}
        else if(e.t==='XS'){const v=e.s*e.vp*Math.sin(2*Math.PI*e.f*t);const g=1/e.r;st(e.a,e.b,g*(V(e.a)-V(e.b)-v),g)}
        else if(e.t==='C'){const g=e.c/dt;st(e.a,e.b,g*(V(e.a)-V(e.b)-vprev[ei]),g)}});
      const dx=lsolve(A,F.map(v=>-v),n);let mx=0;for(let k=0;k<n;k++)mx=Math.max(mx,Math.abs(dx[k]));const sc=mx>0.5?0.5/mx:1;for(let k=0;k<n;k++)x[k]+=dx[k]*sc;if(mx<1e-8)break}
    return x}
  const NS=300;
  /* simulate `cycles` periods of frequency f; returns the last period sampled at NS points */
  function simulate(ck,f,cycles=6){const n=ck.n;const dt=1/f/NS;let x=new Float64Array(n);const vprev=ck.els.map(()=>0);
    const v1=new Float64Array(NS),v2=new Float64Array(NS);let imax=0;const capMin={};
    const V=i=>i==null?0:i<0?0:x[i];
    for(let c=0;c<cycles;c++)for(let k=0;k<NS;k++){const t=(c*NS+k+1)*dt;x=stepSolve(ck,t,x,vprev,dt);
      ck.els.forEach((e,ei)=>{if(e.t==='C'){const v=V(e.a)-V(e.b);vprev[ei]=v;if(c===cycles-1)capMin[e.pid]=Math.min(capMin[e.pid]??1e9,v)}
        if(e.t==='XS'&&c===cycles-1){const v=e.s*e.vp*Math.sin(2*Math.PI*e.f*t);imax=Math.max(imax,Math.abs((V(e.a)-V(e.b)-v)/e.r))}});
      if(c===cycles-1){const kk=(k+1)%NS;v1[kk]=ck.p1==null?NaN:V(ck.p1);v2[kk]=ck.p2==null?NaN:V(ck.p2)}}
    return {v1,v2,imax,capMin,has1:ck.p1!=null,has2:ck.p2!=null}}
  return {VT,dexp,diodeSi,zener,uf,lsolve,solveOp,point,sweep,interp,stepSolve,simulate,NS};
})();
