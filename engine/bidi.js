/* Bidi at the root: in right-to-left text, every English / technical run (part names, values with units, node names,
   CH1, Fig. 9.2a, V<sub>CC</sub>, formulas) is wrapped in an isolated LTR <bdi>, so it never jumps ahead of the Arabic
   around it. Numbers stay with their units; Arabic punctuation stays on the Arabic side.
   BIDI.fix(el) isolates once; BIDI.watch(el) keeps a container isolated whenever its content changes. */
const BIDI=(()=>{
  const AR=/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
  const LT=/[A-Za-z0-9µͰ-Ͽ⁰-₟①-⓿]/;            // Latin, digits, µ, Greek (Ω), sub/superscripts, ①
  const JOIN=/[  .,:;\/\-−‒–+=±×÷≈~<>≤≥%°'′″|^*_→↔⇄·…⏚⇅&#@$!?Ω]/;   // may sit inside a run (brackets only as a matched pair, below), between two LTR parts
  const SKIP=new Set(['SCRIPT','STYLE','SVG','svg','INPUT','SELECT','TEXTAREA','OPTION','BDI','CANVAS','MATH','KBD','BUTTON']);
  const INL=new Set(['SUB','SUP','B','I','EM','STRONG','CODE','SMALL','A','U','S','MARK','VAR','KBD','ABBR']);   // spans are layout: looked into, never swallowed
  const isLtrBox=el=>el.nodeType===1&&(el.tagName==='BDI'||el.getAttribute('dir')==='ltr');
  const rtlHere=el=>{const d=el.closest&&el.closest('[dir]');if(d)return d.getAttribute('dir')==='rtl';try{return getComputedStyle(el).direction==='rtl'}catch(_){return true}};
  /* pieces of one element's children: {k:'L'|'A'|'N'|'E'|'X', node|text} */
  function pieces(el){const out=[];
    for(const n of [...el.childNodes]){
      if(n.nodeType===3){const t=n.nodeValue;let i=0;while(i<t.length){const ch=t[i];const k=AR.test(ch)?'A':LT.test(ch)?'L':'N';let j=i+1;while(j<t.length&&(AR.test(t[j])?'A':LT.test(t[j])?'L':'N')===k)j++;out.push({k,text:t.slice(i,j)});i=j}}
      else if(n.nodeType===1){const tc=n.textContent||'';
        if(n.tagName==='BR'||!INL.has(n.tagName)||SKIP.has(n.tagName))out.push({k:'X',node:n});
        else if(isLtrBox(n))out.push({k:'E',node:n});
        else if(!AR.test(tc)&&LT.test(tc))out.push({k:'E',node:n});
        else out.push({k:'X',node:n})}
      else out.push({k:'X',node:n})}
    return out}
  function fixEl(el){
    if(SKIP.has(el.tagName)||isLtrBox(el)||el.closest('svg'))return;
    const rtl=rtlHere(el);
    if(rtl){const P=pieces(el);let changed=false;const res=[];let i=0;
      while(i<P.length){const p=P[i];
        if(p.k==='L'||p.k==='E'){/* grow the run: LTR parts joined by neutral text */let j=i+1;let last=i;
          while(j<P.length){const q=P[j];if(q.k==='L'||q.k==='E'){last=j;j++;continue}if(q.k==='N'&&[...q.text].every(c=>JOIN.test(c))&&j+1<P.length&&(P[j+1].k==='L'||P[j+1].k==='E')){j++;continue}break}
          let grp=P.slice(i,last+1);
          /* a leading sign / bracket and a trailing unit / bracket belong to the run */
          const prev=res[res.length-1],nx=P[last+1];
          /* a sign before a number and a unit mark after it belong to the run; brackets only when both sides are here */
          if(prev&&prev.k==='N'){const m=prev.text.match(/[−\-+±~≈<>≤≥$#]$/);if(m&&/\s|^$/.test(prev.text.slice(-2,-1)||'')){prev.text=prev.text.slice(0,-1);grp=[{k:'N',text:m[0]},...grp]}}
          if(nx&&nx.k==='N'){const m=nx.text.match(/^[%°′″]+/)||nx.text.match(/^ ?[+−\-](?=\s|$|[)\]])/);if(m){grp=[...grp,{k:'N',text:m[0]}];nx.text=nx.text.slice(m[0].length)}}
          if(prev&&prev.k==='N'&&nx&&nx.k==='N'&&/[(\[]$/.test(prev.text)&&/^[)\]]/.test(nx.text)){grp=[{k:'N',text:prev.text.slice(-1)},...grp,{k:'N',text:nx.text[0]}];prev.text=prev.text.slice(0,-1);nx.text=nx.text.slice(1)}
          res.push({k:'G',grp});changed=true;i=last+1;continue}
        res.push(p);i++}
      if(changed){const frag=document.createDocumentFragment();const put=(p,into)=>{if(p.node)into.appendChild(p.node);else if(p.text)into.appendChild(document.createTextNode(p.text))};
        res.forEach(p=>{if(p.k==='G'){const b=document.createElement('bdi');b.setAttribute('dir','ltr');p.grp.forEach(q=>put(q,b));frag.appendChild(b)}else put(p,frag)});
        el.textContent='';el.appendChild(frag)}}
    for(const c of [...el.children])if(!(c.tagName==='BDI'))fixEl(c)}
  function fix(root){if(!root)return root;try{fixEl(root)}catch(e){console.warn('bidi',e)}return root}
  const OPT={childList:true,subtree:true,characterData:true};
  function watch(el){if(!el)return;const mo=new MutationObserver(recs=>{mo.disconnect();const T=new Set();recs.forEach(r=>{const t=r.type==='characterData'?r.target.parentElement:r.target;if(t&&t.isConnected)T.add(t)});
      T.forEach(t=>{if(![...T].some(o=>o!==t&&o.contains(t)))fix(t.closest('bdi')?t.closest('bdi').parentElement:t)});mo.observe(el,OPT)});fix(el);mo.observe(el,OPT)}
  /* test helper: English runs in RTL text that are not isolated */
  function leaks(root){const bad=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){const t=n.nodeValue;if(!LT.test(t))continue;const p=n.parentElement;if(!p||p.closest('svg,select,option,input,textarea,button,kbd,bdi,[dir="ltr"]'))continue;
      if(!rtlHere(p))continue;bad.push(t.trim().slice(0,60))}
    return bad}
  return {fix,watch,leaks};
})();
