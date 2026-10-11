/* Registry API over labs/index.js: lookups by id ('<lab>/exp<n>') and lazy loading of experiment files. */
const REGISTRY=(()=>{
  const labs=LABS,byId={},byLab={};
  labs.forEach(L=>{byLab[L.id]=L;L.exps.forEach(e=>{e.id=`${L.id}/exp${e.num}`;e.lab=L;e.built=!!e.built;e.file=`labs/${L.id}/exp${e.num}.js`;byId[e.id]=e})});
  const loading={};
  function load(id){const e=byId[id];if(EXP_DEFS[id])return Promise.resolve();if(!e||!e.built)return Promise.reject(new Error('not built'));
    if(!loading[id])loading[id]=new Promise((ok,bad)=>{const s=document.createElement('script');s.src=e.file;s.onload=()=>EXP_DEFS[id]?ok():bad(new Error('no definition'));s.onerror=()=>{delete loading[id];bad(new Error('load failed'))};document.head.appendChild(s)});
    return loading[id]}
  return {labs,lab:id=>byLab[id],exp:id=>byId[id],all:()=>Object.values(byId),load};
})();
