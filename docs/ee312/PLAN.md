# EE312 — what the manual (v8.8) asks for, per experiment

Source: `ee312-manual-v8.8-2026.pdf` (+ slides in `slides/`). Page numbers refer to the manual.

## Instruments on the bench (Appendix G + slides)
| Instrument | Model in the lab | Used in |
|---|---|---|
| Oscilloscope, 4 channels | GW Instek GDS-1104B | 3, 4, 5, 9, 10 |
| Function generator | PeakTech 4124 | 3, 5, 9, 10 |
| DC power supply, **dual unit** (left + right, each with V and A displays, COARSE/FINE/CURRENT knobs and its own dc switch) | TTi EL302RD | 1, 2, 5 (±15 V), 7, 9, 10 |
| Bench digital multimeter (DC V, Ω, diode test, OL) | MCP MT3805 | 1, 2, 7, 9, 10 |
| Center-tapped transformer (A–B–C) | lab transformer | 4 |
| Resistance decade boxes (×2) | — | 9 (Procedure B) |
| Plug-in panel (nodes of 9 holes) + bridging plugs + wires | — | all |
| Coaxial cables: BNC→banana / alligator / mini-grabber | — | 3, 4, 5, 9, 10 |

## Experiments
| # | Title (pages) | Parts | Procedure in short | Results / PLQs |
|---|---|---|---|---|
| 1 | Exploring and Testing Junction Diodes (8–13) | 1N4001, Ge diode, LED, 1N4733A Zener, 2 × 100 Ω | A: DMM diode-test on the 4 diodes (open-circuit reading, forward drop). B: VDD = 5 V, I-limit 0.05 A, open circuit VOC, reverse diode Vrev, then forward: adjust VDD for VRS = 0.1 / 1 / 2 V (1/10/20 mA), record VD; add 100 Ω across the diode → VD′ | Tables 1.1, 1.2; 5 PLQs (voltage reference design) |
| 2 | Terminal Characteristics of Junction Diodes (14–20) | 1N4001, 1N4733A, 1 kΩ | A reverse: VBB = 25, 20, 15, 10, 7, 5, 4, 3, 2, 0 V for both diodes, DMM VD and VRS. B forward: VFF = 0.3 … 20.7 V | Table 2.2; n, IS, rZ, VZ0, load line |
| 3 | Limiting Circuits (21–27) | 2 × 1N4001, 2 × 1N4733A, 1 kΩ | A: antiparallel-diode limiter (Fig 3.4a), 200 Hz sine 500 mVpp → 1.5 Vpp (Vo+) → 4 Vpp (Vo−), 200 mV/div then 500 mV/div, Measure Max/Min on CH2, XY VTC. B: double-anode Zener limiter (Fig 3.4b), 15 Vpp, 2 V/div, Max/Min, XY | Figs 3.6a/b, 3.7a/b; 6 PLQs |
| 4 | Rectifiers and Voltage Regulation (28–35) | center-tapped transformer, 2 × 1N4001, Zener, 10 µF, 470 µF, 4.7 kΩ, 270 Ω | A: Fig 4.2 RL 4.7 kΩ no C (instructor check first), 5 V/div, Measure Pk-Pk/Max, remove D2 via bridging plug, XY VTC, add 10 µF, then 470 µF, CH2 AC coupling → Vr(pp), RL 270 Ω. B: add regulator (Fig 4.3), RL across DZ, ripple at 4.7 kΩ and 270 Ω | Figs 4.4–4.8, Table 4.1 |
| 5 | Op Amp as Amplifier and Comparator (36–42) | µA741, 3 × 1N4001, 1 Zener, 10 kΩ, 100 kΩ | A: non-inverting amp R2 = 10 kΩ, 1 kHz 400 mVpp, CH1 100 mV/div, CH2 500 mV/div, gain, raise f until output = 0.7× → BW; R2 = 100 kΩ, CH2 5 V/div → clipping at the ±15 V rails (Max/Min). B: comparator with limiter (Fig 5.4b), CH1/CH2/**CH3**, CH3 2 V/div | Figs 5.5–5.7; 6 PLQs |
| 6 | SPICE Simulation I (43–50) | — (LTspice on PC) | PC table with a simulated LTspice: A unregulated supply, B add regulator, C voltage comparator, following pages 45–48 step by step | PLQ circuits Fig 6.5, 6.6 |
| 7 | Enhancement N-MOSFET Characteristics (51–56) | IRF620, 1 kΩ (+270 Ω, 470 Ω in C) | A: VGS(TH) at VRD = 0.25 V (I-limit 0.100 A). B: two supply units, VGS = VTH + 0.15/0.30/0.45, sweep VDS 0 … 3 V, read VRD. C: VDD 10 V, RD 270/470/1 kΩ | Tables 7.1, 7.2; ro, rDS |
| 8 | SPICE Simulation II, MOS switching (57–65) | — (LTspice on PC) | PC table with a simulated LTspice: A common-source circuit (.dc sweep, RD effect), B CMOS inverter (.dc VTC + transient), pages 61–64 | PLQs p. 65 |
| 9 | BJT CE Circuit, Switching (66–72) | BD137, 27 kΩ, 2.7 kΩ, LED, 2 decade boxes | A: VCC 5 V, vary VI to get VO = 4.9 … 0.1 V, read VBE and VI. B: LED switch, square 0–5 V (Hi/Lo level) at 0.2, 2, 60 Hz | Table 9.2; modes, gains |
| 10 | Common Emitter Amplifier (73–78) | BD137, 4.7 k, 5.6 k, 27 k, 47 kΩ, 2 × 2.2 µF, 470 µF | A: DMM resistors, dc voltages VBE, VBC, VCE, VR1, VR2, VRC, VRE. B: full amplifier, 20 mVpp 1 kHz → Av, phase; 200 mVpp → distortion | Table 10.1, Figs 10.3–10.5 |

## Engine work needed before the experiments
- Replace the single DC supply with the **dual-unit** supply.
- Add the **bench DMM** (DC V, Ω, diode test with open-circuit reading, probes on the panel).
- Scope: use **CH3** as well (Exp 5).
- New models: Ge diode, LED (with glow), µA741 (rails ≈ ±13–14 V, GBW ≈ 1 MHz, slew rate), IRF620, BD137, resistance decade boxes.
- Transient solver for capacitors at audio frequencies (Exp 10).
- Exp 3 must follow the manual (Fig 3.4a/b), not the old exam-style circuit.

## Hall layout
Two rows of five tables: row 1 = Exp 1–5, row 2 = Exp 6–10, a sign above each. All ten are built.
