## Robustness sweep (`tests/robust.mjs`)

Every bench (Exp 1, 2, 3, 4, 5, 7, 9, 10) in Free mode was given 120 seeded random actions:
- ≈ 55 % instrument controls, some held to the end of a knob's range;
- parts placed on random neighbouring nodes and flipped;
- leads plugged into their jacks and onto random nodes, or pulled out;
- random wires and part deletions;
- quick Free → Manual → Free switching.

The display check runs every 20 actions and scans every text on the instruments' screens for NaN / Infinity / undefined.

| Check | Result |
|---|---|
| No page / console error, every bench | ✅ pass |
| No NaN / Infinity / undefined on any display, every bench | ✅ pass |
| Ω on open leads | ✅ `OVL` (as the MT3805) |
| Supply output shorted by a wire | ✅ CC lamp on, V → 0.000 V |
| DMM red lead in the A jack straight across the supply (DCI) | ✅ the supply's current limit (CC) holds the current below the 10 A fuse; reading stays a number |
| Supply COARSE/FINE pinned at both ends | ✅ 30.00 V max, 0.00 V min |
| 470 µF electrolytic put on the transformer's ac after the instructor check | ✅ bursts (💥) |
| Scope: all 24 knob arrows turned to their ends with a live signal | ✅ no NaN on the screen |

Found and fixed during the sweep:
- **Problem:** while placing a wire (or a part), tapping a node that already held a lead's clip grabbed the lead instead of starting the wire.
  - **Fix:** a tap on a clip now counts as a tap on its node.

## Device matrix

| Device / browser | How it was checked | Result |
|---|---|---|
| Desktop Chromium 1400×900 | full e2e suite (hall, instruments, bidi, procedure picker, all 10 experiments with full marks) | ✅ |
| Phone landscape 844×390 (touch, DPR 2) | full e2e suite + screenshots of every bench | ✅ |
| Phone portrait 390×844 | bidi / layout / fit module + screenshots | ✅ (wide tables are width-bound in portrait; landscape is the main phone target) |
| Large phone landscape 932×430 (DPR 3) | bidi / layout / fit + device zoom + screenshots | ✅ |
| iPad 1180×820 (touch) | bidi / layout / fit + device zoom + screenshots | ✅ |
| Safari (iPhone / iPad / macOS), Firefox, Android Chrome | not available in this environment (Chromium only) | ⏳ to be checked by hand on real devices before sharing the link |

Hall frame rate:
- Headless Chromium renders WebGL in software (SwiftShader), so the absolute numbers (3–8 fps) say nothing about a phone's GPU.
- Relative check: on touch devices the hall now renders at 1.5× instead of 2×. That is about 45 % fewer pixels and gave 1.6–1.8× the frame rate in the same software renderer.
- The scene keeps emissive ceiling panels, hemisphere / ambient light and a few real lights (no per-panel point lights).
- Measure the frame rate on a real phone once, before launch.

## Notes on individual values
- **Exp 2, reverse bias:** V_RS ≈ 2.5 mV for the 1N4001 is the other meter's 10 MΩ across the diode (two meters on the bench), not diode leakage. A real bench with two meters shows the same.
- **Exp 2, I_S:** I_S is ≈ 1.4 × the value fitted to the real Exp 1 report. I_S varies by more than ×2 from unit to unit, while n and V_D agree within 2–4 %.
- **Exp 4, regulated ripple:** for the regulated case, only a hand estimate (Zener divider) exists, so it is checked against a range.
- **Exp 6, PIV:** the PIV read over the whole run (15.8 V) is above V_SM. The supply starts at t = 0 with a magnetising inrush (L1/R1 = 20 ms), which makes the first cycles asymmetric. LTspice shows the same. The steady-state PIV is V_SM − V_D within 0.1 %.
- **Exp 5, bandwidth:** with 4.4 Vpp at the output, the µA741's slew rate (0.5 V/µs) limits the measured bandwidth before its small-signal GBW does. The simulated 57.5 kHz lies between the slew limit (36 kHz) and GBW/G (91 kHz), as on the real chip.
