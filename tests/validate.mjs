// Pre-launch reference check (CLAUDE.md "Pre-launch validation" 1): every Manual procedure is run exactly as in the
// e2e tests (manual values, full marks), the values the sheet was graded with are read back, and each one is compared
// with an independent expectation: hand calculation / textbook theory, the parts' datasheets, or the real readings in
// docs/ee312/measured/. PC tables (Exp 6, 8): the reference netlists are re-simulated and measured in steady state.
// Writes docs/ee312/VALIDATION.md.   Run:  THREE_JS=/path/three.min.js node tests/validate.mjs [1,2,…]
import fs from 'fs'; import path from 'path';
import { chromium, openPage, ROOT } from './lib.mjs';
const EXPS = (process.argv[2] || '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const VT = 0.02585, ln = Math.log, sq = Math.sqrt;

/* real 1N4001 data (student report, Exp 1 B): VD = 0.574 V @ 1 mA, 0.683 V @ 10 mA → n, IS used for the hand checks */
const N_REAL = (0.683 - 0.574) / (VT * ln(10)), IS_REAL = 0.01 / Math.exp(0.683 / (N_REAL * VT));
const vdSi = i => N_REAL * VT * ln(i / IS_REAL);
/* full-wave capacitor-input ripple, exact exponential discharge until the next half-wave meets the capacitor voltage */
function ripple(vp, R, C, f) { const w = 2 * Math.PI * f, tau = R * C; let lo = 1 / (4 * f), hi = 1 / (2 * f);
  for (let k = 0; k < 80; k++) { const t = (lo + hi) / 2; if (vp * Math.exp(-t / tau) > vp * Math.abs(Math.cos(w * t))) lo = t; else hi = t; }
  return vp * (1 - Math.exp(-lo / tau)); }
/* CMOS inverter switching threshold (square law): VM = (VDD − |VTP| + VTN·r) / (1 + r), r = √(kn/kp) */
const VM = (vdd, vtn, vtp, kn, kp) => { const r = sq(kn / kp); return (vdd - Math.abs(vtp) + vtn * r) / (1 + r); };

/* rows: q (quantity), sim(v) → simulated, exp → expected (number or [lo, hi]), tol (fraction) for numbers, src, note */
const SPEC = {
  1: [
    { q: '1N4001 forward, DMM diode test', sim: v => +v.a_si, exp: 0.550, tol: 0.10, src: 'real report' },
    { q: '1N4733A forward, diode test', sim: v => +v.a_z, exp: 0.670, tol: 0.10, src: 'real report' },
    { q: 'green LED forward, diode test', sim: v => +v.a_led, exp: 1.700, tol: 0.10, src: 'real report (datasheet 1.7–2.1 V)' },
    { q: 'Ge diode forward, diode test', sim: v => +v.a_ge, exp: 0.240, tol: 0.10, src: 'real report (1N34A ≈ 0.2–0.3 V)' },
    { q: 'V_OC = V_rev = V_DD', sim: v => +v.b_voc, exp: 5.004, tol: 0.01, src: 'real report' },
    { q: 'V_D @ 1 mA', sim: v => +v.b_vd1, exp: 0.574, tol: 0.10, src: 'real report' },
    { q: 'V_D @ 10 mA', sim: v => +v.b_vd10, exp: 0.683, tol: 0.10, src: 'real report' },
    { q: 'V_D @ 20 mA', sim: v => +v.b_vd20, exp: 0.714, tol: 0.10, src: 'real report' },
    { q: 'ΔV_D per decade (1→10 mA)', sim: v => +v.b_d1, exp: 0.109, tol: 0.10, src: 'real report (n ≈ 1.83)' },
    { q: '% change of V_D with R_L = 100 Ω', sim: v => +v.b_pct, exp: [-4, -1], src: 'theory: I_D 20 → ≈13 mA, ΔV = nV_T ln(13/20); real −1.2 %' },
  ],
  2: [
    { q: 'rectifier reverse, V_BB = 25 V: V_RS (other meter\'s 10 MΩ across the diode)', sim: v => +v.D4001_R_25_vrs, exp: 25 / 10e6 * 1e3, tol: 0.25, src: 'theory: V_BB/10 MΩ × 1 kΩ (I_R of the 1N4001 ≪ 1 µA)' },
    { q: 'Zener V_Z @ ≈20 mA (V_BB = 25 V)', sim: v => -v.Z4733_R_25_vd, exp: 5.0, tol: 0.05, src: '1N4733A datasheet (5.1 V ±5 % @ 49 mA, ≈5.0 V @ 20 mA)' },
    { q: 'Zener current @ V_BB = 25 V (mA)', sim: v => +v.Z4733_R_25_vrs, exp: (25 - 5.0) / 1, tol: 0.05, src: 'theory: (V_BB − V_Z)/R_S' },
    { q: 'Zener r_Z (PLQ 3)', sim: v => +v.q3r, exp: 7, tol: 0.25, src: 'datasheet Z_ZT = 7 Ω @ 49 mA' },
    { q: 'Zener V_BB = 4 V: below V_Z, no current', sim: v => +v.Z4733_R_4_vrs, exp: [0, 0.005], src: 'theory' },
    { q: 'rectifier forward V_D, V_FF = 10.7 V (≈10 mA)', sim: v => +v.D4001_F_10p7_vd, exp: vdSi(0.010), tol: 0.10, src: 'real Exp 1 data (n, I_S fit)' },
    { q: 'rectifier forward V_D, V_FF = 20.7 V (≈20 mA)', sim: v => +v.D4001_F_20p7_vd, exp: vdSi(0.020), tol: 0.10, src: 'real Exp 1 data' },
    { q: 'forward I_D, V_FF = 10.7 V (mA)', sim: v => -v.D4001_F_10p7_vrs, exp: (10.7 - vdSi(0.01)) / 1, tol: 0.03, src: 'theory: (V_FF − V_D)/R_S' },
    { q: 'emission coefficient n (PLQ 2)', sim: v => +v.q2n, exp: N_REAL, tol: 0.10, src: 'real Exp 1 data' },
    { q: 'saturation current I_S (nA, PLQ 2)', sim: v => +v.q2is, exp: IS_REAL * 1e9, tol: 1.0, src: 'real Exp 1 data (I_S varies ×2 unit to unit)' },
  ],
  3: [
    { q: 'A: V_O+ at 1.5 Vpp (one 1N4001, ≈0.26 mA)', sim: v => +v.a_vop, exp: vdSi(0.26e-3), tol: 0.10, src: 'theory: V_D at (0.75 − V_D)/1 kΩ, real diode data' },
    { q: 'A: V_O− at 4 Vpp (two 1N4001, ≈0.9 mA)', sim: v => +v.a_vom, exp: -2 * vdSi(0.9e-3), tol: 0.10, src: 'theory: −2V_D' },
    { q: 'B: V_O+ at 15 Vpp (V_Z + V_D, ≈2 mA)', sim: v => +v.b_vop, exp: 4.85 + 0.70, tol: 0.05, src: 'datasheet: V_Z ≈ 4.85 V @ 2 mA, forward ≈ 0.70 V' },
    { q: 'B: V_O− at 15 Vpp', sim: v => +v.b_vom, exp: -(4.85 + 0.70), tol: 0.05, src: 'symmetric double-anode Zener' },
  ],
  4: [
    { q: 'V_r(pp) 470 µF, 4.7 kΩ (mV)', sim: v => +v.r1, exp: ripple(9.05 - 0.62, 4700, 470e-6, 60) * 1e3, tol: 0.15, src: 'theory: V_SM = 6.4·√2 = 9.05 V, exact RC discharge' },
    { q: 'V_r(pp) 470 µF, 270 Ω (mV)', sim: v => +v.r2, exp: ripple(9.05 - 0.80, 270, 470e-6, 60) * 1e3, tol: 0.15, src: 'theory (diode drop ≈ 0.8 V at the charging peaks)' },
    { q: 'regulated V_r(pp), 4.7 kΩ (mV)', sim: v => +v.r4, exp: [5, 40], src: 'hand estimate: V_r,in × (r_Z∥R_L)/(R_S + r_Z∥R_L), r_Z ≈ 7–20 Ω' },
    { q: 'regulated V_r(pp), 270 Ω (mV)', sim: v => +v.r5, exp: [10, 80], src: 'hand estimate (same divider, larger input ripple)' },
    { q: 'regulator reduces the ripple at 270 Ω (×)', sim: v => v.r2 / v.r5, exp: [5, 40], src: 'theory: (R_S + r_Z∥R_L)/(r_Z∥R_L)' },
  ],
  5: [
    { q: 'non-inverting gain G (R2 = 10 kΩ)', sim: v => +v.a_g, exp: 11, tol: 0.02, src: 'theory 1 + R2/R1' },
    { q: 'bandwidth at 4.4 Vpp (kHz)', sim: v => +v.a_bw, exp: [36, 91], src: 'µA741: slew-rate limit SR/2πV_p = 36 kHz, small-signal GBW/G = 91 kHz' },
    { q: 'clipping V_O+ (R2 = 100 kΩ)', sim: v => +v.b_vox, exp: 14, tol: 0.05, src: 'µA741 datasheet: ±14 V typ. into ≥10 kΩ at ±15 V' },
    { q: 'clipping V_O−', sim: v => +v.b_von, exp: -14, tol: 0.05, src: 'µA741 datasheet' },
    { q: 'comparator v_O+ (D1 + Zener)', sim: v => +v.c_vox, exp: 0.70 + 4.9, tol: 0.05, src: 'theory V_D + V_Z (≈8 mA)' },
    { q: 'comparator v_O− (D3 + D4)', sim: v => +v.c_von, exp: -2 * vdSi(0.012), tol: 0.10, src: 'theory −2V_D (≈12 mA)' },
    { q: 'comparator v6 high (1 kΩ load)', sim: v => +v.c_v6x, exp: 13, tol: 0.08, src: 'µA741 datasheet ±13 V into 2 kΩ' },
    { q: 'comparator v6 low', sim: v => +v.c_v6n, exp: -13, tol: 0.08, src: 'µA741 datasheet' },
  ],
  6: [
    { q: 'V_SM, steady state (V)', sim: v => v.pc_vsm, exp: 311 * sq(1e-3 / 0.4) * (2 * Math.PI * 60 * 0.4) / Math.hypot(20, 2 * Math.PI * 60 * 0.4), tol: 0.02, src: 'theory: n = √(L2/L1) = 1/20, R1 against X_L1 = 151 Ω' },
    { q: 'PIV of D1, steady state (V)', sim: v => v.pc_piv, exp: v => v.pc_vsm - 0.65, tol: 0.05, src: 'theory V_SM − V_D (bridge)' },
    { q: 'PIV over the whole run, as read in the sheet (V)', sim: v => +v.a_piv, exp: v => v.pc_vsm - 0.65, tol: 0.10, src: 'includes the switch-on transient (magnetising inrush, L1/R1 = 20 ms), as LTspice shows' },
    { q: 'V_r(pp) with 470 µF, 4.7 kΩ (mV)', sim: v => v.pc_rip, exp: v => ripple(v.pc_vsm - 1.3, 4700, 470e-6, 60) * 1e3, tol: 0.15, src: 'theory: exact RC discharge, V_p = V_SM − 2V_D' },
    { q: 'B: V_out(dc), 4.7 kΩ (1N750)', sim: v => +v.b_v47, exp: 4.7, tol: 0.05, src: '1N750 datasheet V_Z = 4.7 V' },
    { q: 'B: V_out(dc), 270 Ω', sim: v => +v.b_v270, exp: 4.7, tol: 0.05, src: '1N750 datasheet' },
    { q: 'C: limits with four 1N4148 (V)', sim: v => +v.c_max, exp: 2 * 0.70, tol: 0.10, src: 'theory 2V_D (1N4148 ≈ 0.7 V at a few mA)' },
    { q: 'C: upper limit with the 1N750 (V)', sim: v => +v.c_zmax, exp: 0.70 + 4.7, tol: 0.05, src: 'theory V_D + V_Z' },
    { q: 'C: max I(R1) (mA)', sim: v => +v.c_imax, exp: v => (13.5 - +v.c_zmax) / 1, tol: 0.15, src: 'theory (op-amp swing ≈ 13.5 V − limit)/1 kΩ' },
  ],
  7: [
    { q: 'V_GS(TH) (V)', sim: v => +v.a_vth, exp: [2, 4], src: 'IRF620 datasheet 2–4 V @ 250 µA' },
    { q: 'square law: I_D(V_OV = 0.30)/I_D(0.15) at V_DS = 3 V', sim: v => v.b2_7 / v.b1_7, exp: 4, tol: 0.10, src: 'theory (V_OV ratio)²; smooth subthreshold lowers it a little' },
    { q: 'square law: I_D(0.45)/I_D(0.15)', sim: v => v.b3_7 / v.b1_7, exp: 9, tol: 0.10, src: 'theory' },
    { q: 'saturation reached by V_DS ≈ V_OV (I_D at 0.75 V / at 3 V, V_OV = 0.30)', sim: v => v.b2_5 / v.b2_7, exp: (1 + 0.02 * 0.75) / (1 + 0.02 * 3), tol: 0.03, src: 'theory: only λ (≈0.02 V⁻¹) left above V_OV' },
    { q: 'current source: I_D(1 kΩ)/I_D(270 Ω)', sim: v => v.c_id2 / v.c_id0, exp: v => (1 + 0.02 * v.c_vds2) / (1 + 0.02 * v.c_vds0), tol: 0.03, src: 'theory: saturation, (1 + λV_DS) only' },
  ],
  8: [
    { q: 'resistive inverter V_OL, R_D = 10 kΩ (V)', sim: v => v.pc_vol10, exp: (() => { const k = 127e-6, R = 1e4, vov = 4.3; const a = k / 2 * R, b = -(k * R * vov + 1), c = 5; return (-b - sq(b * b - 4 * a * c)) / (2 * a); })(), tol: 0.10, src: 'theory: triode, KP = 127 µA/V², V_TO = 0.7 V, W = L' },
    { q: 'V_OL falls as R_D grows (110 k vs 10 k)', sim: v => v.pc_vol110 / v.pc_vol10, exp: [0, 0.3], src: 'theory' },
    { q: 'CMOS switching threshold V_M (V)', sim: v => v.pc_vm, exp: VM(5, 0.7, -0.7, 127, 58.6), tol: 0.05, src: 'theory: square law, k_n/k_p = 127/58.6' },
    { q: 'CMOS V_OH / V_OL rail to rail', sim: v => v.pc_swing, exp: 5, tol: 0.01, src: 'theory' },
  ],
  9: [
    { q: 'V_BE at I_C ≈ 1.1 mA (V_O = 2 V)', sim: v => +v.vbe4, exp: 0.60, tol: 0.10, src: 'BD137 datasheet V_BE(on) ≈ 0.6 V at ≈1 mA' },
    { q: 'β = I_C/I_B in active mode (V_O = 2 V)', sim: v => v.ic4 / ((v.vi4 - v.vbe4) / 27), exp: [40, 250], src: 'BD137 h_FE 40–250' },
    { q: 'saturation: V_BC at V_O = 0.1 V', sim: v => +v.vbc8, exp: [0.4, 0.7], src: 'theory (Table 9.1)' },
    { q: 'I_C at V_O = 0.1 V (mA)', sim: v => +v.ic8, exp: (5 - 0.1) / 2.7, tol: 0.01, src: 'theory (V_CC − V_O)/R_C' },
    { q: 'LED switch R_C design (Ω)', sim: v => +v.d_rc, exp: 280, tol: 0.01, src: 'eq. 9.3' },
  ],
  10: [
    { q: 'I_E (mA)', sim: v => +v.t_ie, exp: (12 * 27 / 74 - 0.6) / (4.7 + (47 * 27 / 74) / 131), tol: 0.05, src: 'theory: Thevenin bias, V_BE = 0.6 V, β = 130' },
    { q: 'V_RE (V)', sim: v => +v.v_re, exp: 4.7 * (12 * 27 / 74 - 0.6) / (4.7 + (47 * 27 / 74) / 131), tol: 0.05, src: 'theory' },
    { q: 'V_CE (V)', sim: v => +v.v_ce, exp: (() => { const ie = (12 * 27 / 74 - 0.6) / (4.7 + (47 * 27 / 74) / 131); return 12 - ie * 130 / 131 * 5.6 - ie * 4.7; })(), tol: 0.05, src: 'theory' },
    { q: 'V_BE (V)', sim: v => +v.v_be, exp: 0.6, tol: 0.10, src: 'BD137 datasheet' },
    { q: 'β (Table 10.1)', sim: v => +v.t_beta, exp: [40, 250], src: 'BD137 h_FE 40–250' },
    { q: 'A_v measured (Fig. 10.4)', sim: v => +v.t_avm, exp: v => -(+v.t_ic) / VT * 5.6, tol: 0.05, src: 'theory −g_m R_C with the measured I_C' },
    { q: 'KVL check: V_R1 + V_R2 = V_CC', sim: v => +v.v_r1 + +v.v_r2, exp: 12, tol: 0.01, src: 'theory' },
  ],
};

/* PC tables: re-simulate the manual's netlists and measure in steady state */
const PC = {
  6: `(() => { const R = BENCH.sim.RT; const SEC = 'V1 p 0 SINE(0 311 60 0 0 0 12)\\nR1 p a 20\\nL1 a 0 400m\\nL2 b s2 1m\\nR2 b s1 2\\nK1 L1 L2 1\\nD1 s1 out 1N4148\\nD3 s2 out 1N4148\\nD4 0 s1 1N4148\\nD2 0 s2 1N4148\\n.tran 0 0.2 0 0.2m\\nR3 out 0 4.7k';
    const last = (res, e) => { const a = R.evalOn(res, e)[0], n = a.length; return a.slice(Math.floor(n * 0.6)); };
    const r0 = R.sim(SEC), r1 = R.sim(SEC + '\\nC1 out 0 470u');
    const vs = last(r0, 'V(s1,s2)'), pv = last(r0, 'V(s1,out)'), o = last(r1, 'V(out)');
    return { pc_vsm: Math.max(...vs), pc_piv: -Math.min(...pv), pc_rip: (Math.max(...o) - Math.min(...o)) * 1e3 }; })()`,
  8: `(() => { const R = BENCH.sim.RT; const S = 'V2 vdd 0 5\\nV1 in 0 PULSE(0 5 0 0.1n 0.1n 10n 20n 3)\\n.lib mosfet1u.lib\\n';
    const cs = R.sim(S + '.step param RD 10k 110k 100k\\nR1 vdd out {RD}\\nM1 out in 0 0 N_1u\\n.dc V1 0 5 5m'); const o = R.evalOn(cs, 'V(out)');
    const inv = R.sim(S + 'M1 out in 0 0 N_1u\\nM2 out in vdd vdd P_1u\\n.dc V1 0 5 5m'); const xs = inv.runs[0].xs, y = R.evalOn(inv, 'V(out)')[0];
    let vm = null; for (let i = 1; i < y.length; i++) if (y[i - 1] >= 2.5 && y[i] < 2.5) { vm = xs[i - 1] + (xs[i] - xs[i - 1]) * (y[i - 1] - 2.5) / (y[i - 1] - y[i]); break; }
    return { pc_vol10: o[0].at(-1), pc_vol110: o[1].at(-1), pc_vm: vm, pc_swing: y[0] - y.at(-1) }; })()`,
};

const browser = await chromium.launch(); const out = {}; const errors = [];
for (const n of EXPS) {
  const { ctx, page } = await openPage(browser, 'desktop', errors, `exp${n}`);
  await page.evaluate(() => { document.addEventListener('click', e => { if (e.target && e.target.id === 'submit') { const o = {}; document.querySelectorAll('#paperHost input, #paperHost select').forEach(x => { if (x.id) o[x.id] = x.value; }); window.__sheet = o; } }, true); });
  const { run } = await import(`./exp/ee312-exp${n}.mjs`); let fails = 0;
  await run(page, 'desktop', c => { if (!c) fails++; return c; });
  const v = await page.evaluate(() => window.__sheet || {});
  if (PC[n]) Object.assign(v, await page.evaluate(async ([id, code]) => { await REGISTRY.load(id); document.querySelector('#hall').hidden = true; BENCH.enter(id, 'free', true); await new Promise(r => setTimeout(r, 300)); return eval(code); }, [`ee312/exp${n}`, PC[n]]));
  for (const k in v) if (typeof v[k] === 'string' && v[k] !== '' && isFinite(+v[k])) v[k] = +v[k];
  out[n] = { fails, rows: SPEC[n].map(r => { const sim = r.sim(v); const exp = typeof r.exp === 'function' ? r.exp(v) : r.exp;
    let pass, diff = null; if (Array.isArray(exp)) pass = isFinite(sim) && sim >= exp[0] && sim <= exp[1]; else { diff = (sim - exp) / Math.abs(exp); pass = isFinite(sim) && Math.abs(diff) <= r.tol; }
    return { ...r, simv: sim, expv: exp, diff, pass }; }) };
  console.log(`exp${n}: run ${fails ? fails + ' check(s) failed' : 'ok'} · ${out[n].rows.filter(r => r.pass).length}/${out[n].rows.length} within tolerance`);
  out[n].rows.filter(r => !r.pass).forEach(r => console.log(`   ✗ ${r.q}: sim ${r.simv} vs ${JSON.stringify(r.expv)}`));
  await ctx.close();
}
await browser.close();

/* ---- report ---- */
const TITLES = { 1: 'Exploring and Testing Junction Diodes', 2: 'Terminal Characteristics of Junction Diodes', 3: 'Limiting Circuits', 4: 'Rectifiers and Voltage Regulation', 5: 'Op Amp as Amplifier and Comparator', 6: 'SPICE Simulation I (PC)', 7: 'Enhancement N-MOSFET', 8: 'SPICE Simulation II · MOS switching (PC)', 9: 'BJT CE Circuit, Switching', 10: 'Common Emitter Amplifier' };
const f = x => x == null || !isFinite(x) ? '—' : Math.abs(x) >= 100 ? x.toFixed(1) : Math.abs(x) >= 10 ? x.toFixed(2) : x.toFixed(3);
const fe = (e, r) => Array.isArray(e) ? `${f(e[0])} … ${f(e[1])}` : `${f(e)} (±${Math.round(r.tol * 100)} %)`;
let md = `# EE312 · Pre-launch validation\n\nGenerated by \`tests/validate.mjs\` (${new Date().toISOString().slice(0, 10)}). Every Manual procedure is run as in the e2e tests (the manual's values, full marks). The value the sheet was graded with ("simulated") is compared with an independent expectation: hand calculation / theory, the part's datasheet, or the real readings in \`docs/ee312/measured/\`. PC tables: the manual's netlists are re-simulated and measured over the last 40 % of the run (steady state). Tolerances: ±1–5 % for linear / passive quantities, ±10 % for semiconductor drops and model-sensitive values, wider ranges where only a hand estimate exists.\n\n`;
let tot = 0, ok = 0;
for (const n of EXPS) { const o = out[n]; md += `## Exp ${n} · ${TITLES[n]}\n\nManual run: ${o.fails ? `**${o.fails} check(s) failed**` : 'all steps ticked, sheet full marks'}.\n\n| Quantity | Expected | Simulated | Δ | Result | Source of the expectation |\n|---|---|---|---|---|---|\n`;
  o.rows.forEach(r => { tot++; if (r.pass) ok++; md += `| ${r.q} | ${fe(r.expv, r)} | ${f(r.simv)} | ${r.diff == null ? '—' : (r.diff * 100).toFixed(1) + ' %'} | ${r.pass ? '✅ pass' : '❌ fail'} | ${r.src} |\n`; }); md += '\n'; }
md = md.replace('\n\n## Exp', `\n\n**Summary: ${ok} / ${tot} quantities within tolerance.**\n\n## Exp`);
const extra = path.join(ROOT, 'docs/ee312/VALIDATION-notes.md'); if (fs.existsSync(extra)) md += fs.readFileSync(extra, 'utf8');
fs.writeFileSync(path.join(ROOT, 'docs/ee312/VALIDATION.md'), md);
console.log(`\n${ok}/${tot} within tolerance · console errors: ${errors.length} → docs/ee312/VALIDATION.md`); errors.forEach(e => console.log('  ' + e));
