/* Welcome card: title, a small disclaimer, "ابدأ" (the du'a is on the corridor's department sign). Shown once per browser session (every new visit); ⓘ reopens it.
   The credit line appears only when SITE.author is filled (with a LinkedIn link when SITE.linkedin is set). */
const WELCOME=(()=>{
  const el=$q('#welcome');
  const LI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z"/></svg>';
  function credit(){const c=$q('#wlCredit');const a=(SITE.author||'').trim();if(!a){c.hidden=true;c.innerHTML='';return}
    const who=SITE.linkedin?`<a href="${SITE.linkedin}" target="_blank" rel="noopener">${a} ${LI}</a>`:a;c.innerHTML=`تم التصميم من قبل ${who}`;c.hidden=false}
  function open(){credit();el.hidden=false;setTimeout(()=>$q('#wlStart').focus(),50)}
  function close(){el.hidden=true;try{sessionStorage.setItem('eelab:welcomed','1')}catch(_){}}
  function init(){$q('#wlStart').onclick=close;$q('#infoBtn').onclick=open;el.addEventListener('pointerdown',e=>{if(e.target===el)close()});
    addEventListener('keydown',e=>{if(!el.hidden&&(e.key==='Escape'||e.key==='Enter')){e.preventDefault();e.stopImmediatePropagation();close()}},true);
    let seen=false;try{seen=sessionStorage.getItem('eelab:welcomed')==='1'}catch(_){}if(!seen)open()}
  return {init,open,close};
})();
