import { sit, bench } from '../lib.mjs';
export async function measureText(page, label) {
  return page.evaluate(label => { const t = [...document.querySelectorAll('#Ldyn text')].map(e => e.textContent).find(s => s.startsWith(label)); if (!t) return null;
    const m = t.match(/(-?[\d.]+)(mV|V)$/); return m ? +m[1] * (m[2] === 'mV' ? 1e-3 : 1) : null; }, label);
}

export async function run(page, vp, ok) {
  console.log(`[${vp}] Exp 3 · Manual mode`);
  await sit(page, 'ee312/exp3', 'manual');
  const H = bench(page); H.touch = vp === 'phone';
  await H.focus('gen'); await H.key('g:PWR'); await H.focus('psu'); await H.key('p:PWR'); await H.focus('sc'); await H.key('s:PWR');
  ok((await H.steps()).done === 1, 'step 1 (power) ticks');
  await H.focus('psu'); await H.key('p:LI-', 5); await H.key('p:LVC-', 3); await H.key('p:LON');
  ok((await H.steps()).done === 2, 'step 2 (EL302RD unit set to 2 V / 0.05 A, dc ON) ticks');
  await H.focus('board'); await H.place('R1k', 0, 1); await H.place('D4001', 1, 2); await H.place('D4001', 1, 8); await H.flip(1, 8); await H.place('Z4733', 8, 15);
  await H.lead('gr', 0); await H.lead('c2r', 1); await H.lead('Lp', 2); await H.lead('Lm', 15); await H.lead('gb', 15); await H.lead('c2b', 15);
  ok((await H.steps()).done === 3, 'step 3 (circuit) ticks');
  await H.lead('c1r', 0); await H.lead('c1b', 15);
  ok((await H.steps()).done === 4, 'step 4 (probes + grounds) ticks');
  await H.focus('gen'); await H.key('g:Sine'); await H.gen('F1', '200', 'F3'); await H.gen('F2', '6', 'F2'); await H.gen('F3', '0', 'F2'); await H.key('g:CH1');
  ok((await H.steps()).done === 5, 'step 5 (generator) ticks');
  await H.focus('sc'); await H.key('s:Default'); await H.key('s:CH2');
  ok((await H.steps()).done === 6, 'step 6 (scope channels) ticks');
  await H.key('s:Autoset'); ok((await H.steps()).done === 7, 'step 7 (Autoset) ticks');
  await page.evaluate(() => document.querySelector('[data-cap="f2"]').click());
  // CH2 Max / Min measurements, chosen through the Measure menu like on the real scope
  await H.key('s:Measure'); await H.key('s:B0'); await H.key('s:S3'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:S0'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:VAR+'); await H.key('s:SEL'); await H.key('s:MOFF'); await H.key('s:MOFF');
  await page.waitForTimeout(1400);
  const vop = await measureText(page, '②Max');
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1'); await H.key('s:MOFF'); await H.key('s:MOFF');
  ok((await H.steps()).done === 8, 'step 8 (XY) ticks');
  await page.evaluate(() => document.querySelector('[data-cap="f3"]').click());
  await H.focus('gen'); await H.gen('F2', '16', 'F2'); await H.focus('sc'); await H.key('s:Autoset');
  ok((await H.steps()).done === 9, 'step 9 (16 Vpp) ticks — all steps done');
  await page.waitForTimeout(1400);
  const vom = await measureText(page, '②Min');
  await page.evaluate(() => document.querySelector('[data-cap="f4"]').click());
  await H.key('s:Acquire'); await H.key('s:B1'); await H.key('s:S1');
  await page.evaluate(() => document.querySelector('[data-cap="f5"]').click());
  ok(vop > 2.4 && vop < 2.8 && vom < -5.3 && vom > -6, `Vo+ = ${vop} V, Vo− = ${vom} V from the scope measurements`);
  await page.evaluate(([vop, vom]) => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
    set('vop', vop.toFixed(2)); set('vom', vom.toFixed(2)); set('vzf', 'b'); set('vz', (Math.abs(vom) - 0.62).toFixed(2)); set('obs', 'b');
    Object.entries({ p1: 1, p2: 2, pz: 2, n1: 2, n2: 1, nz: 3 }).forEach(([k, v]) => set(k, v)); set('why', 'b'); document.getElementById('submit').click(); }, [vop, vom]);
  const res = await page.$eval('#result', e => e.innerText);
  ok(/النتيجة: (\d+) \/ \1/.test(res), 'manual sheet graded full marks: ' + res.split('\n')[0]);
  if (!/النتيجة: (\d+) \/ \1/.test(res)) console.log(res);
  // Free mode: same bench, no steps and no sheet questions
  await page.click('#bSwitch'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => BENCH.mode === 'free' && document.querySelector('#stepCard').hidden && getComputedStyle(document.querySelector('#live')).display === 'none'), 'Free mode: no steps, no checks');
  await page.click('#bStand'); await page.waitForTimeout(400);
}

