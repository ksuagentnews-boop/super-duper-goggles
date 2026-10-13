# EE205 · Validation (theory vs simulated vs old lab video)

Theory uses the nominal part values. Simulated is what the site's meters show in the Manual run (real parts are a little
off nominal, meters have their own burden / loading). Tolerance: ±5 % for passive circuits, ±10 % where a meter's
frequency response or a semiconductor is involved.

## Exp 1 · Resistors, divider rules, Δ-Y
| Quantity | Theory | Simulated | Diff | Video | Pass |
|---|---|---|---|---|---|
| V1 (4.7 k of Fig. 5, E = 10 V) | 5.949 V | 5.96 V | +0.2 % | 5.89 V | ✓ |
| V2 (1 k) | 1.266 V | 1.253 V | −1.0 % | – | ✓ |
| V3 (2.2 k) | 2.785 V | 2.789 V | +0.1 % | – | ✓ |
| I1 (1 k, GoldStar 40 mA) | 10.00 mA | 10.01 mA | +0.1 % | 10.07 mA | ✓ |
| I2 (4.7 k) | 2.128 mA | 2.11 mA | −0.8 % | – | ✓ |
| I3 (2.2 k) | 4.545 mA | 4.51 mA | −0.8 % | – | ✓ |
| IT | 16.67 mA | 16.56 mA | −0.7 % | ≈ 16 mA | ✓ |
| ID (Fig. 7, E = 15 V, 400 mA range) | 44.34 mA | 44.5 mA | +0.4 % | 42.8 mA | ✓ |
| IY (Fig. 8, boxes 10 / 440 / 206 Ω) | 44.34 mA | 44.3 mA | −0.1 % | – | ✓ |
| Box ×1 at 4 Ω on the Fluke | 4 Ω ± 0.02 | 4.0 Ω | – | 10 Ω read 09.8 Ω | ✓ |

## Exp 2 · RMS, peak, oscilloscope
| Quantity | Theory | Simulated | Diff | Video | Pass |
|---|---|---|---|---|---|
| DMM Vrms of 10 Vpp at 100 Hz | 3.536 V | 3.54 V | +0.1 % | – | ✓ |
| … at 1 kHz | 3.536 V | 3.53 V | −0.2 % | – | ✓ |
| … at 2 / 3 / 4 / 5 kHz (Fluke 77 bandwidth 1 kHz) | falls off | 3.51 / 3.43 / 3.23 / 2.90 V | −0.7 … −18 % | "the DMM rolls off" | ✓ (behaviour) |
| Coil RL (1000 turns) | 17.6 Ω | 17.6 Ω | 0 | ≈ 17.6 Ω | ✓ |
| E across the RL circuit (20 Vpp EMF, 50 Ω source) | 5.68 V | 5.68 V | 0 | – | ✓ |
| VL | 3.93 V | 3.92 V | −0.3 % | – | ✓ |
| VR | 3.54 V | 3.53 V | −0.3 % | – | ✓ |
| I (Fluke 300 mA jack in series, 1.8 Ω) | 35.0 mA | 34.9 mA | −0.3 % | – | ✓ |
| θ = atan(XL / (R + RL)) | 43.1° | Lissajous / dual trace | – | – | ✓ |
