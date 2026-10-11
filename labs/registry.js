/* Registry of labs and experiments.
   To add an experiment: write labs/<lab>/expN.js (it registers EXP_DEFS['<lab>/expN']) and set `file` below.
   `bench` lists the instruments standing on that table in the 3D hall (left to right). */
const REGISTRY=(()=>{
  const labs=[
    {id:'ee312',code:'EE312',title:'Basic Electronics Lab',ar:'معمل الإلكترونيات الأساسية',exps:[
      {num:1,en:'Exploring and Testing Junction Diodes',ar:'استكشاف واختبار الدايودات',bench:['psu','dmm']},
      {num:2,en:'Terminal Characteristics of Junction Diodes',ar:'خصائص أطراف الدايود',bench:['psu','dmm']},
      {num:3,en:'Limiting Circuits',ar:'دوائر التحديد (Clipping)',bench:['gen','psu','scope'],file:'labs/ee312/exp3.js'},
      {num:4,en:'Rectifiers and Voltage Regulation',ar:'التقويم وتنظيم الجهد',bench:['xf','scope'],file:'labs/ee312/exp4.js'},
      {num:5,en:'The Op Amp as an Amplifier and a Comparator',ar:'المضخّم العملياتي كمكبّر ومقارن',bench:['gen','psu','scope']},
      {num:6,en:'SPICE Simulation I',ar:'محاكاة SPICE (١)',bench:['pc']},
      {num:7,en:'Terminal Characteristics of Enhancement N-MOSFET',ar:'خصائص N-MOSFET',bench:['psu','dmm']},
      {num:8,en:'SPICE Simulation II · MOS Switching Circuits',ar:'محاكاة SPICE (٢) · دوائر التبديل',bench:['pc']},
      {num:9,en:'The BJT CE Circuit with Emphasis on Switching',ar:'ترانزستور BJT كمفتاح',bench:['gen','psu','scope','dmm','dbox']},
      {num:10,en:'The Common Emitter Amplifier',ar:'مكبّر الباعث المشترك',bench:['gen','psu','scope','dmm']}
    ]}
  ];
  const byId={};
  labs.forEach(L=>L.exps.forEach(e=>{e.id=`${L.id}/exp${e.num}`;e.lab=L;e.built=!!e.file;byId[e.id]=e}));
  const loading={};
  function load(id){const e=byId[id];if(EXP_DEFS[id])return Promise.resolve();if(!e||!e.file)return Promise.reject(new Error('not built'));
    if(!loading[id])loading[id]=new Promise((ok,bad)=>{const s=document.createElement('script');s.src=e.file;s.onload=()=>EXP_DEFS[id]?ok():bad(new Error('no definition'));s.onerror=()=>{delete loading[id];bad(new Error('load failed'))};document.head.appendChild(s)});
    return loading[id]}
  return {labs,exp:id=>byId[id],all:()=>Object.values(byId),load};
})();
