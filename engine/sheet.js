/* Helpers for the manual sheet of an experiment: number inputs, selects, tables, captures and grading. */
ENGINE.sheet={
  num:(id,step='0.001',w)=>`<input type="number" step="${step}" id="${id}" class="nin"${w?` style="width:${w}px"`:''} inputmode="decimal">`,
  sel:(id,opts)=>`<select id="${id}"><option value="">— choose —</option>${opts.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select>`,
  row:(label,inner,unit='')=>`<div class="row en"><span class="lbl">${label}</span>${inner}${unit?`<span class="u">${unit}</span>`:''}</div>`,
  cap:(id,label)=>`<div class="cap"><button class="t" data-cap="${id}">📸 سجّل الشاشة في ${label}</button><div class="slot" id="${id}">${label}</div></div>`,
  v:id=>{const e=document.getElementById(id);return e?parseFloat(e.value):NaN},
  s:id=>{const e=document.getElementById(id);return e?e.value:''},
  near:(x,ref,tol)=>isFinite(x)&&isFinite(ref)&&Math.abs(x-ref)<=tol,
  /* capture the scope screen into a slot; returns the svg markup */
  capture(RT,id){if(RT.dirty)RT.recompute();const sc=RT.S.sc;const mm=sc.msg;sc.msg='';const inner=sc.run?RT.screenInner():sc.frozen;sc.msg=mm;
    document.getElementById(id).innerHTML=`<svg viewBox="12 26 336 286" direction="ltr" font-family="IBM Plex Mono, monospace"><defs><clipPath id="gridclip"><rect x="22" y="48" width="300" height="200"/></clipPath></defs>${inner}</svg>`},
  /* proc(p): the rows that follow belong to Procedure p; rows of a procedure the student did not pick are left out */
  grader(){const res=[];let P=null;const off=()=>P&&BENCH.procSel&&!BENCH.procSel.has(P);return {proc(p){P=p;return this},add(ok,t,why){if(off())return ok;res.push([!!ok,t,why]);return ok},
    show(el){const sc=res.filter(r=>r[0]).length;try{if(res.length&&typeof STATS!=='undefined')STATS.graded(BENCH.exp,sc/res.length*100)}catch(_){}
      /* Exam (Batch 6): the score is out of the experiment's graded steps; every helper used costs marks */
      const N=BENCH.marks?BENCH.marks():10,H=BENCH.helpers||{build:0,hint:0,skip:0},COST={build:1,skip:1,hint:0.5},cost=Object.keys(COST).reduce((t,k)=>t+(H[k]||0)*COST[k],0);
      const fmt=x=>Number.isInteger(x)?String(x):x.toFixed(1),score=Math.max(0,Math.round((res.length?sc/res.length*N:0)*2)/2-cost);
      const used=[['build','«وصّل لي»'],['hint','«تلميح»'],['skip','«تخطّي»']].filter(([k])=>H[k]).map(([k,n])=>`${n} × ${H[k]} (−${fmt(H[k]*COST[k])})`).join('، ');
      el.innerHTML=`<div class="result"><b>النتيجة: ${fmt(score)} / ${N}</b><div class="sub">الـ sheet: ${sc} / ${res.length} صح${used?` · المساعدات: ${used}`:' · بدون مساعدات'}</div>`+res.map(([ok,t,w])=>`<div class="${ok?'good':'bad'}">${ok?'✓':'✗'} <span class="m">${t}</span>${ok||!w?'':' — '+w}</div>`).join('')+`</div>`;el.scrollIntoView({behavior:'smooth',block:'nearest'});return [sc,res.length]}}}
};
