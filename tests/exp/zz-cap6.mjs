import { sit } from '../lib.mjs';
export async function run(page, vp, ok) {
  await sit(page, 'ee205/exp6', 'manual');
  const r = await page.evaluate(async () => { const RT = BENCH.sim.RT, S = RT.S; await RT.buildFig('9', 0);
    S.yew1.d = [0, 0, 0, 0, 1, 0]; Object.assign(S.gen, { pwr: true, out: true, wave: 'Square', amp: 10, off: 5, freq: 200 });
    const sc = S.sc; sc.pwr = true; sc.ch[0].cpl = 'DC'; sc.ch[0].vd = 2; sc.ch[0].var = 0; sc.ch[0].pos = -2.5; sc.td = 2e-4; sc.trig.src = 0; sc.trig.slope = '+'; sc.trig.level = -2.2;
    RT.dirty = true; const out = { st1: BENCH.sim.status().ST };
    const caps = st => { const s = BENCH.sim.steps[st]; for (let k = 0; k < s.rec.length; k++) BENCH.capture(s); return BENCH.capsOf(s).map(c => c.html.replace(/<[^>]+>/g, '')).join(' | '); };
    out.i = BENCH.cur(); out.c2 = caps(1); out.ct = ['ct0', 'ct5', 'cv0', 'cv5', 'tce'].map(id => document.getElementById(id).value).join(',');
    sc.trig.slope = '-'; sc.trig.level = 2.2; RT.dirty = true; BENCH.sim.status(); out.c3 = caps(2); out.c5 = caps(4);
    await RT.buildFig('10', 0); S.yew1.d = [0, 0, 6, 0, 0, 0]; sc.trig.slope = '+'; sc.trig.level = -2.2; RT.dirty = true; BENCH.sim.status();
    const s = BENCH.sim.steps[6]; BENCH.capture(s); BENCH.capture(s); out.fd = document.getElementById('fd').value; out.st = BENCH.sim.status().ST; return out; });
  console.log(JSON.stringify(r, null, 1));
}
