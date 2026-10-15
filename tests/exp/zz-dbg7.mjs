import { sit } from '../lib.mjs';
export async function run(page, vp, ok) {
  page.setDefaultTimeout(120000);
  const t0=Date.now();
  await page.click('#quickBtn'); await page.click(`#quick [data-level="6"]`); await page.click(`#quick [data-lab="ee205"]`); await page.click(`#quick [data-exp="ee205/exp${process.env.E||7}"]`);
  await page.waitForSelector('#seatModal:not([hidden])',{timeout:120000}); console.log('modal',Date.now()-t0);
  await page.click(`#seatModal button[data-mode="free"]`); console.log('clicked',Date.now()-t0);
  await page.waitForFunction(() => !document.querySelector('#benchView').hidden && BENCH.sim, null, { timeout: 120000 }); console.log('bench',Date.now()-t0);
  const r=await page.evaluate(()=>{const RT=BENCH.sim.RT;const out={};let t=performance.now();BENCH.sim.status();out.status=performance.now()-t;
    for(const id of Object.keys(RT.figs)){t=performance.now();RT.dirty=true;RT.match(id);out[id]=performance.now()-t}return out});
  console.log(JSON.stringify(r));
}
