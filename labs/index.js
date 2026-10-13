/* Lab registry (data only). One entry per lab of the EE department.
   Adding a lab = a folder labs/<id>/ with its experiment files + one entry here.
     id / code / title / ar   identity and the sign above its door in the corridor
     level: 5 | 6 | 7 | 8 | 'elective'   where its door is: the corridor is ordered by study level, the electives
                              open off a courtyard after Level 8; inside a level, doors follow the order of this list
     room: {rows, cols}       table layout of its room (experiments fill the rows in order); only labs with experiments
     exps: [{num, en, ar, bench, built}]
       bench: instruments standing on that table in the 3D room, left to right
       built: true when labs/<id>/exp<num>.js exists */
const LABS=[
  {id:'ee210',code:'EE210',title:'Logic Design Lab',ar:'معمل التصميم المنطقي',level:5,exps:[]},
  {id:'ee205',code:'EE205',title:'Electric Circuits Lab',ar:'معمل الدوائر الكهربائية',level:6,room:{rows:2,cols:4},exps:[
    {num:1,en:'Measurement of Resistors, Voltage & Current Divider Rules, Δ-Y Transformation',ar:'قياس المقاومات وقاعدتا تقسيم الجهد والتيار وتحويل Δ-Y',bench:['thandar','fluke','goldstar','yew','yew','yew']},
    {num:2,en:'RMS, Peak and Peak-to-Peak Values · Measurements with the Oscilloscope',ar:'القيم الفعّالة والقمة · القياس بالأوسيلوسكوب',bench:['thandar','metrix','hameg','fluke','yew']},
    {num:3,en:"Thevenin's and Maximum Power Transfer Theorems",ar:'نظرية ثفنن ونقل أقصى قدرة',bench:['metrix','flukey','flukey','yew']},
    {num:4,en:'Power Factor Improvement',ar:'تحسين معامل القدرة',bench:['lamp','px120','fluke','fluke','capbox']},
    {num:5,en:'Three-Phase AC Circuits',ar:'الدوائر ثلاثية الطور',bench:['xf3','px120','fluke','fluke','rheo']},
    {num:6,en:'Transients in DC Circuits',ar:'الحالة العابرة في دوائر التيار المستمر',bench:['metrix','hameg','yew']},
    {num:7,en:'Magnetically Coupled Circuits',ar:'الدوائر المقترنة مغناطيسياً',bench:['variac','fluke','fluke','fluke']},
    {num:8,en:'Resonance in Series and Parallel Circuits',ar:'الرنين في دوائر التوالي والتوازي',bench:['metrix','hameg','fluke','bk']}
  ]},
  {id:'ee312',code:'EE312',title:'Basic Electronics Lab',ar:'معمل أساسيات الإلكترونيات',level:6,room:{rows:2,cols:5},exps:[
    {num:1,en:'Exploring and Testing Junction Diodes',ar:'استكشاف واختبار الدايودات',bench:['psu','dmm','dmm'],built:true},
    {num:2,en:'Terminal Characteristics of Junction Diodes',ar:'خصائص أطراف الدايود',bench:['psu','dmm','dmm'],built:true},
    {num:3,en:'Limiting Circuits',ar:'دوائر التحديد (Clipping)',bench:['gen','scope'],built:true},
    {num:4,en:'Rectifiers and Voltage Regulation',ar:'التقويم وتنظيم الجهد',bench:['xf','scope'],built:true},
    {num:5,en:'The Op Amp as an Amplifier and a Comparator',ar:'المضخّم العملياتي كمكبّر ومقارن',bench:['gen','psu','scope'],built:true},
    {num:6,en:'SPICE Simulation I',ar:'محاكاة SPICE (١)',bench:['pc'],built:true},
    {num:7,en:'Terminal Characteristics of Enhancement N-MOSFET',ar:'خصائص N-MOSFET',bench:['psu','dmm','dmm'],built:true},
    {num:8,en:'SPICE Simulation II · MOS Switching Circuits',ar:'محاكاة SPICE (٢) · دوائر التبديل',bench:['pc'],built:true},
    {num:9,en:'The BJT CE Circuit with Emphasis on Switching',ar:'ترانزستور BJT كمفتاح',bench:['gen','psu','scope','dmm','dmm','dbox'],built:true},
    {num:10,en:'The Common Emitter Amplifier',ar:'مكبّر الباعث المشترك',bench:['gen','psu','scope','dmm','dmm'],built:true}
  ]},
  {id:'ee302',code:'EE302',title:'Modeling and Simulation Lab',ar:'معمل النمذجة والمحاكاة',level:7,exps:[]},
  {id:'ee357',code:'EE357',title:'Microprocessors and Microcontrollers Lab',ar:'معمل المعالجات والحاكمات الصغرى',level:7,exps:[]},
  {id:'ee356',code:'EE356',title:'Control and Measurements Lab',ar:'معمل التحكم والقياسات',level:8,exps:[]},
  {id:'ee402',code:'EE402',title:'Electronic Circuits Lab',ar:'معمل الدوائر الإلكترونية',level:'elective',exps:[]},
  {id:'ee406',code:'EE406',title:'VLSI Design Lab',ar:'معمل تصميم VLSI',level:'elective',exps:[]},
  {id:'ee421',code:'EE421',title:'Communications Lab',ar:'معمل الاتصالات',level:'elective',exps:[]},
  {id:'ee433',code:'EE433',title:'Electromechanical Energy Conversion Lab',ar:'معمل التحويل الكهروميكانيكي للطاقة',level:'elective',exps:[]},
  {id:'ee445',code:'EE445',title:'Electric Power Lab',ar:'معمل القوى الكهربائية',level:'elective',exps:[]},
  {id:'ee457',code:'EE457',title:'Applied Control Lab',ar:'معمل التحكم التطبيقي',level:'elective',exps:[]},
  {id:'ee459',code:'EE459',title:'Advanced Logic Design Lab',ar:'معمل التصميم المنطقي المتقدم',level:'elective',exps:[]}
];
/* the study levels in corridor order (the electives come last, in their courtyard) */
const LEVELS=[
  {key:5,ar:'المستوى الخامس',en:'Level 5'},{key:6,ar:'المستوى السادس',en:'Level 6'},
  {key:7,ar:'المستوى السابع',en:'Level 7'},{key:8,ar:'المستوى الثامن',en:'Level 8'},
  {key:'elective',ar:'الاختيارية',en:'Electives'}
];
