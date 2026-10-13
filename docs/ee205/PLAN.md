# EE205 · Electric Circuits Lab — build plan (approved by the owner, 13 Oct)

**Sources**
- Manual: `EE205-manual.pdf` (scanned, 75 pages, 8 experiments). It always wins.
- Table photos: `instruments/expN-table*.jpg`.
- Frames from the 12-year-old lab videos: `video-frames/` (a thumbnail plus frames at 25/50/75 % for each video, and `sheet-expN.jpg` contact sheets). These are only for looks, models and sanity readings.
- Level 6, one table per experiment (8 tables, 2 rows × 4), in manual order.

## Instruments (from the photos; manual counts win)
| Instrument | Looks like | Used in |
|---|---|---|
| **Thandar TS3022S** dual DC supply | Two units. Each has V and A displays, COARSE/FINE voltage, CURRENT LIMIT, ON switch and OUTPUT terminals. | 1, 2 |
| **Fluke 77** handheld DMM (grey) | Rotary switch: OFF, V~, V⎓, mV⎓, Ω, diode/beep, A⎓, A~. Jacks: 10 A, 300 mA, COM, VΩ. Used as an ammeter **in series** through the mA jack (fuse blows on a wrong connection). | 1, 2, 3 (yellow variant), 5, 7, 8 |
| **GoldStar DM-33x** (yellow) | Rotary switch: OFF, V, Ω, ·))), diode, Hz, 40 mA, 400 mA, 10 A. Keys: HOLD, RANGE, MIN MAX, ~/⎓. Bar graph. Its 40 mA range gives 0.01 mA resolution, which is why the doctor prefers it as the ammeter. Photo: `instruments/exp1-p3-goldstar-ammeter.jpg`. | 1 Proc III (ammeter); likely the "yellow meter" in 3 and 8 |
| **BK Tool Kit 2704B** | Handheld meter, used as the ammeter (mA jack). | 8 |
| **YEW Type 2786** resistance decade box | Six dials, ×100 kΩ … ×1 Ω, with the tolerance printed under each dial. | 1, 2, 3, 6 |
| **Hameg HM 203-7** analog dual-trace scope | Beam trace with FOCUS / INTENSITY, VOLTS/DIV with a variable, TIME/DIV, CH I / CH II / DUAL / ADD, XY, AC/DC/GND coupling. | 2, 6, 8 |
| **Metrix MTX 3240** function generator (blue) | Sine / square / triangle, frequency display, amplitude, offset. | 2, 3, 6, 8 |
| **Metrix PX 120** power meter | Reads V, I, P and PF. Has 10 A / COM current terminals, 600 V / COM voltage terminals and a 3-phase total key. | 4, 5 |
| **Capacitor decade box BC05** ("Boîte de capacités") | Five dials, ×1 µF … ×1000 pF. | 4 |
| **Three-phase transformer** (red) | Y/Δ terminals; about 24 V phase / 41 V line in the lab. | 5 |
| **Rheostats** | Four on the table, three used as the Y load. | 5 |
| **Variable AC supply** (beige, 60 Hz) | 12 V outlets plus a variable output. | 7 |
| **Coils** | 1000 turns = 17.5 mH air core (about 96 mH with the iron core in). 500 turns = 4.38 mH air core. The pair on a **U-core with yoke** forms the transformer of Exp 7. | 2, 3, 6, 7, 8 |
| **Fluorescent lamp** | 110 V 20 W fixture with a ballast (inductive load), fed from the wall socket (127 V 60 Hz as drawn in the lab). | 4 |

The plug-in panel (9-hole nodes) and the plug carriers are the same as in EE312.

## Experiments
| # | Title | Parts | Procedures | Results |
|---|---|---|---|---|
| 1 | Measurement of Resistors, Voltage & Current Divider, Δ-Y | 3 colour-code resistors, 3 decade boxes, DC supply, DMMs; 220 Ω ×2, 470 Ω, 1 k, 2.2 k, 4.7 k, 10 k | **I:** colour code vs ohmmeter (Table 2). Decade box at ×1 4 Ω, ×10 50 Ω, ×100 700 Ω, ×1K 5 kΩ, ×10K 30 kΩ → reading, % tolerance, % error (Table 3). **II:** Fig 5, series, E = 10 V, R1 = 4.7 k, R2 = 1 k, R3 = 2.2 k → V1, V2, V3, E (Table 4). **III:** Fig 6, parallel, E = 10 V, 1 k ∥ 4.7 k ∥ 2.2 k → I1, I2, I3, IT, with the GoldStar as ammeter in series (Table 5). **IV:** Fig 7 bridge, E = 15 V (a-c 220, a-b 470, c-b 10 k, c-d 220, b-d 1 k) → ID; Δ→Y gives Ra, Rb, Rc, set on the decade boxes; Fig 8 → IY. | Tables 2–5 |
| 2 | RMS, Peak, Peak-to-Peak; Oscilloscope | 100 Ω, decade box, 17.5 mH air-core coil; DC supply, generator, DMM, scope | **I:** scope controls. DC 1, 2, 5, 10 V on CH1 (DC coupling) → div × V/div. Sine on CH2 (AC coupling) → Vm, T, f, Vrms; DMM on ACV. DUAL, then ADD (10 V dc + sine). **II:** 10 Vpp sine; scope RMS 3.535 V vs DMM at 100, 1k, 2k, 3k, 4k, 5k Hz → % error (the DMM rolls off at high frequency). **III:** series RL, 17.5 mH + 100 Ω, e(t) = 10 sin(2π·10³t): coil RL; E, VL, VR on the DMM; VR and E on the scope → θ; Lissajous in XY → θ = sin⁻¹(L1/L2); I; ZT = E/I; P, PF. | tables + phasor |
| 3 | Thevenin & Maximum Power Transfer (ac) | 100 Ω, 1 k, 3.3 k, 10 k, decade box; coil with iron core; 0.1 µF ×2, 0.47, 1, 4.7, 22 µF; DMM, generator | **I:** Fig 6a: 5 V 1 kHz, 1 k series, 3.3 k shunt, 96 mH (iron core) series, 10 k load → VR, IR. Remove the 10 k → ETH. ZTH by shorting the source. Fig 6b equivalent → IR, VR, compare. **II:** Fig 7: 5 V 1 kHz, 100 Ω + 17.5 mH + RD (= R + RL, decade box) + C, with C = 0.1, 0.47, 0.57, 1, 1.1, 1.2, 1.47, 4.7, 22 µF → Va-b, \|Xc\|, P = Va-b²/RD; plot P vs \|Xc\|. | Table 1, graph |
| 4 | Power Factor Improvement | fluorescent lamp 110 V 20 W, two DMMs, wattmeter (PX 120), capacitor decade box | Fig 4. The instructor checks and energizes (a check step before power). V, I, P without C, then C = 1.0, 2.0, 3.0, 3.2 … 6.0 µF in 0.2 steps → V, I, P, PF. Find the minimum current; R, XL, ZL, θL; C for PF = 1. | Table 1 |
| 5 | Three-Phase AC Circuits | 3 rheostats, 3 ac ammeters, 2 ac voltmeters, 2 wattmeters, 3-phase transformer | **I:** Fig 7, Y load, Ran = Rbn = Rcn = 100 Ω (set with the DMM on Ω) → three ammeters, VL, VP. **II:** Fig 8, one wattmeter in phase A (voltage coil to n) → PA; PT = 3 PA vs 3 IA² RA. **III:** Fig 9, the PX 120's 3-phase total key. | readings |
| 6 | Transients in DC Circuits | decade box (10 kΩ), 0.047 µF, 17.5 mH; square-wave generator, dual-beam scope | **I:** Fig 9, RC, square 0 → +10 V at about 200 Hz, R = 10 kΩ (+ the generator's Rs) → vc(t) at six times while charging and discharging, τ (Tables 1, 2); vR, ic. **II:** Fig 10, RLC, R ≈ 600 Ω, C = 0.047 µF → underdamped; raise R until the overshoot vanishes (Rc = 2√(L/C)); overdamped; trace the three curves. | Tables 1, 2, curves |
| 7 | Magnetically Coupled Circuits | coils of 1000 / 500 turns on the U-core; 2 ammeters, 3 voltmeters; variable ac supply (60 Hz) | **I:** Rdc of each coil, R = 1.15 Rdc; at 2 Vrms → V, I → Z, X, L1; same for L2. **II:** V1, I1, V2 → XM = V2/I1, M. **III:** Fig 9, VT across the series-joined coils → dot at A or B. **IV:** series aiding / opposing at 2 Vrms → Xeq1, Xeq2, M = (Xeq1 − Xeq2)/4ω, k. | values |
| 8 | Resonance in Series and Parallel Circuits | 100 Ω, 10 Ω, 5 kΩ ×2; 17.5 mH and 4.38 mH air core; 0.1 µF, 4.7 µF, 1 µF, 10 nF; two DMMs, scope, generator | **I:** Fig 6, series 100 Ω + 17.5 mH + 4.7 µF → E, I, VR, VL, VC, Z. **II:** Fig 7, parallel with 10 Ω sense resistors → currents, θ, P. **III:** Fig 8, series 100 Ω + 17.5 mH + 10 nF at 2 Vrms, 7.5 → 15 kHz in 500 Hz steps → I, P (Table 1) → fos, f1, f2, B, Q. **IV:** Fig 9, parallel 5 kΩ ∥ 4.38 mH ∥ 0.1 µF at 2 Vrms, 6 → 9 kHz in 200 Hz steps → I, Z (Table 2) → fop, f1, f2, B, Q. | Tables 1, 2, graphs |

## Decisions (the manual wins; videos only for looks)
- Exp 1 Fig 5 order is R1 = 4.7 k, R2 = 1 k, R3 = 2.2 k (the manual's order; the video uses another).
- Exp 2 Fig 3's caption says "procedure II", but the figure belongs to Procedure III.
- Exp 3: the 17.5 mH coil with the iron core inserted is the 96 mH of Fig 6a. The capacitor combinations 0.57, 1.1, 1.2 and 1.47 µF are made by putting caps in parallel (the two 0.1 µF are used).
- Exp 4: two DMMs + wattmeter + capacitor box, as the manual says, even though the video shows only the PX 120.
- Exp 5: three ac ammeters, two ac voltmeters and two wattmeters (manual). Procedure III's title says "single wattmeter"; use the PX 120's 3-phase key.
- Exp 6 Proc I: decade box at 10 kΩ (manual); a 10 kΩ carrier may also be in «العلبة».
- Exp 7: 2 Vrms (manual), not the video's 5 V. Meters: the manual's 2 ammeters + 3 voltmeters, drawn as Fluke 77s.
- Mains-level experiments (4, 5, 7): a «المشرف يتأكد من التوصيل» check step must pass before power can be switched on.
- Every manual procedure is built, even where no video exists (Exp 2 III, Exp 8 IV).

## Sanity readings from the video frames (old lab, for the solver check)
- **Exp 1:** 10 Ω reads 09.8 Ω. Series run shows 5.89 V. Parallel run: I ≈ 16 mA, GoldStar 10.07 mA on 40 mA. Bridge I = 42.8 mA. Thandar 15.01 V / 0.17 A.
- **Exp 2:** coil resistance ≈ 17.6 Ω.
- **Exp 3:** 6.08 V, 4.58 V, 1.606 V.
- **Exp 7:** R2 = 5.2 Ω. Proc II at 5 V: V1 = 5.02 V, I1 = 7.76 mA, V2 = 2.285 V. Proc III: V1 = 5 V, V2 = 2.5 V, VT = 7.5 V.
- **Exp 8:** P1 I = 14.91 mA. P2: 20.17 / 48.1 / 60.9. P3: 18.06, 28.4 mA.

## New engine work
- **Instruments:** Hameg HM 203-7 (analog beam, focus/intensity, XY, ADD), Metrix MTX 3240, Fluke 77 / GoldStar DM-33x / BK 2704B handheld DMMs (rotary switch; ammeter in series through its own jack; fuse), Thandar TS3022S, YEW 2786, BC05 capacitor box, Metrix PX 120, three-phase transformer, rheostats, variable ac supply, fluorescent lamp (ballast model).
- **Parts:** coils with/without iron core, and the 1000/500-turn transformer on the U-core.
- **Solver:** ac steady state and 3-phase sources, coupled coils on the bench, lamp model, wattmeter.
