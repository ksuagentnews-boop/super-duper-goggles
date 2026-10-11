/* Lab registry (data only). One entry per lab of the EE department.
   Adding a lab = a folder labs/<id>/ with its experiment files + one entry here.
     id / code / title / ar   identity and the sign above its door in the corridor
     room: {rows, cols}       table layout of its room (experiments fill the rows in order)
     exps: [{num, en, ar, bench, built}]
       bench: instruments standing on that table in the 3D room, left to right
       built: true when labs/<id>/exp<num>.js exists */
const LABS=[
  {id:'ee312',code:'EE312',title:'Basic Electronics Lab',ar:'معمل الإلكترونيات الأساسية',room:{rows:2,cols:5},exps:[
    {num:1,en:'Exploring and Testing Junction Diodes',ar:'استكشاف واختبار الدايودات',bench:['psu','dmm'],built:true},
    {num:2,en:'Terminal Characteristics of Junction Diodes',ar:'خصائص أطراف الدايود',bench:['psu','dmm'],built:true},
    {num:3,en:'Limiting Circuits',ar:'دوائر التحديد (Clipping)',bench:['gen','scope'],built:true},
    {num:4,en:'Rectifiers and Voltage Regulation',ar:'التقويم وتنظيم الجهد',bench:['xf','scope'],built:true},
    {num:5,en:'The Op Amp as an Amplifier and a Comparator',ar:'المضخّم العملياتي كمكبّر ومقارن',bench:['gen','psu','scope'],built:true},
    {num:6,en:'SPICE Simulation I',ar:'محاكاة SPICE (١)',bench:['pc']},
    {num:7,en:'Terminal Characteristics of Enhancement N-MOSFET',ar:'خصائص N-MOSFET',bench:['psu','dmm'],built:true},
    {num:8,en:'SPICE Simulation II · MOS Switching Circuits',ar:'محاكاة SPICE (٢) · دوائر التبديل',bench:['pc']},
    {num:9,en:'The BJT CE Circuit with Emphasis on Switching',ar:'ترانزستور BJT كمفتاح',bench:['gen','psu','scope','dmm','dbox']},
    {num:10,en:'The Common Emitter Amplifier',ar:'مكبّر الباعث المشترك',bench:['gen','psu','scope','dmm']}
  ]}
];
