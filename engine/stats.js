/* Anonymous usage statistics (GoatCounter: no cookies, no personal data). Off while SITE.goatcounter is empty,
   on localhost / test hosts and under automation. Never blocks the site: the script loads async and every call is guarded.
   Events (path style): lab/<lab> · exp/<lab>/expN/start/<mode> · exp/<lab>/expN/done · exp/<lab>/expN/graded/<bucket>
   · time/<lab>/expN/<bucket>min (once per seating, when the student stands up or leaves the page). */
const STATS=(()=>{
  const code=(typeof SITE!=='undefined'&&SITE.goatcounter||'').trim();
  const host=location.hostname;
  const on=!!code&&!navigator.webdriver&&location.protocol.startsWith('http')&&!/^(localhost|127\.|0\.0\.0\.0|\[::1\]|app\.local$)/.test(host);
  const queue=[];
  function flush(){const gc=window.goatcounter;if(!gc||!gc.count)return;while(queue.length){const p=queue.shift();try{gc.count({path:p,title:p,event:true})}catch(_){}}}
  if(on){try{const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=`https://${encodeURIComponent(code)}.goatcounter.com/count`;s.onload=flush;document.head.appendChild(s)}catch(_){}}
  const trace=[];/* what would be counted (kept in memory for the tests; sent only when on) */
  function ev(path){trace.push(path);if(trace.length>200)trace.shift();if(!on)return;queue.push(path);flush()}
  let seat=null;
  function start(exp,mode){endSeat();ev(`exp/${exp}/start/${mode}`);seat={exp,t:Date.now(),done:false}}
  function done(exp){if(seat&&seat.exp===exp&&!seat.done){seat.done=true;ev(`exp/${exp}/done`)}}
  function graded(exp,pct){const b=pct>=100?'100':pct>=80?'80-99':pct>=50?'50-79':'0-49';ev(`exp/${exp}/graded/${b}`)}
  function endSeat(){if(!seat)return;const m=(Date.now()-seat.t)/60000;const b=m<5?'0-5':m<15?'5-15':m<30?'15-30':m<60?'30-60':'60+';ev(`time/${seat.exp}/${b}min`);seat=null}
  addEventListener('pagehide',endSeat);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')endSeat()});
  return {on,ev,trace,lab:l=>ev(`lab/${l}`),start,done,graded,endSeat};
})();
