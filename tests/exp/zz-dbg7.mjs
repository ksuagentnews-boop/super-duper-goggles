export async function run(page, vp, ok) {
  page.on('console', m => console.log('CONSOLE', m.type(), m.text().slice(0,200)));
  const t0=Date.now();
  await page.click('#quickBtn'); await page.click(`#quick [data-level="6"]`); await page.click(`#quick [data-lab="ee205"]`); await page.click(`#quick [data-exp="ee205/exp7"]`);
  for (let i=0;i<20;i++){ const s=await page.evaluate(()=>{const m=document.getElementById('seatModal');return [m.hidden, getComputedStyle(m).display, getComputedStyle(m).visibility, getComputedStyle(m).opacity, m.getBoundingClientRect().width]});console.log(Date.now()-t0, JSON.stringify(s)); await page.waitForTimeout(500);}
}
