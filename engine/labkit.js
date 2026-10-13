/* Helpers for the step checks of experiment files (topology and live readings), shared by the labs:
   K = ENGINE.labkit(RT)
     K.N(n)                 net of panel node n          K.has(type,a,b)       a part of that type between nodes a and b
     K.shown(m)             the value a meter shows (SI), null on OL / off
     K.across(fn,a,b,both)  shown value of a meter on function fn ('DCV','ACV','OHM' …) with HI on net a, COM on net b
     K.amm(a,b,fn)          shown current of a meter used as ammeter (current jack on net a, COM on net b)
     K.ammOn(a,b)           a meter in series between nets a and b (any function)
     K.sup(E)               the supply unit wired to the board: {P,M,U,ok (power + output on, set to E)}
     K.gen()                the generator: {on, wave, f, vpp, off} (on = power + output + lead plugged) */
ENGINE.labkit=function(RT){
  const N=n=>RT.netOf(n);
  const shown=m=>m.r.shown&&!m.r.ol&&m.r.shown.si!=null?m.r.shown.si:(m.r.shown&&!m.r.ol&&m.r.val!=null&&m.r.shown.si===undefined?m.r.val:null);
  const across=(fn,a,b,both)=>{if(a==null||b==null||a===b)return null;for(const m of RT.meters()){if(!m.D.pwr||m.D.fn!==fn||m.D.jack!=='HI')continue;const v=shown(m);if(v==null)continue;
      if(m.hi===a&&m.lo===b)return v;if(both&&m.hi===b&&m.lo===a)return v}return null};
  const amm=(a,b,fn='DCI')=>{if(a==null||b==null||a===b)return null;for(const m of RT.meters()){if(!m.D.pwr||m.D.jack!=='A'||m.D.fn!==fn)continue;if(m.hi===a&&m.lo===b){const v=shown(m);if(v!=null)return v}}return null};
  const ammOn=(a,b)=>a!=null&&b!=null&&a!==b&&RT.meters().some(m=>m.D.jack==='A'&&((m.hi===a&&m.lo===b)||(m.hi===b&&m.lo===a)));
  function sup(E){for(const u of [0,1]){const P=RT.leadNet(u?'Rp':'Lp'),M=RT.leadNet(u?'Rm':'Lm');if(P==null||M==null)continue;const U=RT.S.psu.u[u];
      return {u,P,M,U,on:RT.S.psu.pwr&&U.on,ok:RT.S.psu.pwr&&U.on&&(E==null||Math.abs(U.v-E)<0.006)}}return null}
  const has=(t,a,b)=>RT.between(N(a),N(b)).some(x=>x.p.type===t);
  const gen=()=>{const g=RT.S.gen,i=RT.inst.gen;return {on:!!(i&&i.on()),pwr:g.pwr,out:g.out,wave:g.wave,f:g.freq,vpp:g.amp,off:g.off}};
  return {N,shown,across,amm,ammOn,sup,has,gen};
};
