/* Registry of labs and experiments. Each experiment lives in labs/<lab>/<exp>.js and registers itself in EXP_DEFS. */
const EXPS={
  exp3:{num:3,en:'Limiting Circuits',ar:'دوائر التحديد (Clipping)',def:'ee312/exp3'},
  exp4:{num:4,en:'Rectifiers & Voltage Regulation',ar:'التقويم وتنظيم الجهد',def:'ee312/exp4'}
};
for(const k in EXPS)BOOT[k]=()=>ENGINE.run(EXP_DEFS[EXPS[k].def]);
