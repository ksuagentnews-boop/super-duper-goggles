import { sit, bench } from '../lib.mjs';
/* The FINE knob (and COARSE) of every bench supply, both labs: every unit, both directions, through the arrows (mouse click
   / finger tap), the mouse wheel (desktop), a finger drag on the knob and the ◀ ▶ pad (touch). The set value AND the drawn
   VOLTS display must change on each step (owner, 14 Oct: "FINE does nothing" in EE312 Exp 7 / 9). */
const EXPS = ['ee312/exp1', 'ee312/exp2', 'ee312/exp5', 'ee312/exp7', 'ee312/exp9', 'ee312/exp10', 'ee205/exp1', 'ee205/exp2'];
export async function run(page, vp, ok) {
  const touch = vp !== 'desktop';
  for (const exp of EXPS) {
    await page.evaluate(() => { if (window.BENCH && BENCH.sim) BENCH.exit && BENCH.exit(); });
    await page.goto('http://app.local/'); await page.waitForFunction(() => document.querySelector('#hallLoading').hidden, null, { timeout: 20000 });
    if (await page.$eval('#welcome', e => !e.hidden)) await page.click('#wlStart');
    await sit(page, exp, 'free'); const H = bench(page); H.touch = touch;
    await H.focus('psu'); await H.key('p:PWR');
    const st = () => page.evaluate(() => { const S = BENCH.sim.RT.S.psu; return { v: S.u.map(u => u.v), txt: [...document.querySelectorAll('#bench text')].map(t => t.textContent).filter(t => /^\d+\.\d+$/.test(t)).join(' ') }; });
    const bad = [];
    for (const u of ['L', 'R']) for (const k of ['VF', 'VC']) for (const d of ['+', '-']) {
      const a = await st(); await H.key(`p:${u}${k}${d}`); const b = await st(); const i = u === 'L' ? 0 : 1;
      if (!((d === '+' ? b.v[i] > a.v[i] : b.v[i] < a.v[i]) && b.txt !== a.txt)) bad.push(`${u}${k}${d} ${a.v[i]}→${b.v[i]} display ${a.txt === b.txt ? 'unchanged' : 'ok'}`);
    }
    const knob = k => page.evaluate(k => { const e = document.querySelector(`#bench circle[data-knob="p:${k}"]`); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, k);
    if (!touch) { for (const u of ['L', 'R']) { const c = await knob(u + 'VF'), a = await st(); await page.mouse.move(c[0], c[1]); await page.mouse.wheel(0, -100); await page.waitForTimeout(40); const b = await st(); if (!(b.v[u === 'L' ? 0 : 1] > a.v[u === 'L' ? 0 : 1])) bad.push(u + 'VF wheel'); } }
    else {
      const cdp = await page.context().newCDPSession(page); const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
      for (const u of ['L', 'R']) { const i = u === 'L' ? 0 : 1; const c = await knob(u + 'VF'); let a = await st(); await T('touchStart', c[0], c[1]); for (let j = 1; j <= 8; j++) await T('touchMove', c[0] + j * 8, c[1]); await T('touchEnd'); await page.waitForTimeout(40);
        let b = await st(); if (!(b.v[i] > a.v[i])) bad.push(u + 'VF drag');
        a = b; await page.touchscreen.tap(c[0], c[1]); await page.waitForTimeout(60); const p = await page.evaluate(() => { const e = document.querySelector('#kpad:not([hidden]) .kb[data-d="-"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
        if (!p) { bad.push(u + 'VF no pad'); continue; } await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(40); b = await st(); if (!(b.v[i] < a.v[i])) bad.push(u + 'VF pad −'); await page.evaluate(() => BENCH.sim.RT.closePad()); }
      await cdp.detach();
    }
    ok(!bad.length, `${exp}: COARSE / FINE of both units turn both ways and the display follows` + (bad.length ? ': ' + bad.join('; ') : ''));
  }
}
