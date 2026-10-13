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

## Exp 3 · Thevenin and maximum power transfer (5 V rms EMF, 1 kHz)
| Quantity | Theory | Simulated | Diff | Video | Pass |
|---|---|---|---|---|---|
| VR (Fig. 6a) | 3.502 V | 3.50 V | 0 | – | ✓ |
| IR (Fig. 6a) | 0.350 mA | 0.35 mA | 0 | – | ✓ |
| ETH | 3.793 V | 3.79 V | −0.1 % | – | ✓ |
| ZTH (source shorted) | 785.0 + j603.2 Ω | calculated | – | – | ✓ |
| VR (Fig. 6b, box 767 Ω + coil) | ≈ 3.50 V | 3.49 V | −0.3 % | – | ✓ |
| Va-b at 0.1 µF | 0.390 V | 0.391 V | +0.3 % | – | ✓ |
| Va-b at 0.47 µF | 1.609 V | 1.611 V | +0.1 % | 1.606 V | ✓ |
| Va-b at 1 µF | 2.032 V | 2.033 V | 0 | – | ✓ |
| Va-b at 1.47 µF (maximum, XC ≈ XL) | 2.062 V | 2.063 V | 0 | – | ✓ |
| Va-b at 22 µF | 1.940 V | 1.941 V | 0 | – | ✓ |

## Exp 6 · Transients (square 0 → 10 V, 200 Hz, Rs = 50 Ω, scope 1 MΩ)
| Quantity | Theory | Simulated | Diff | Video | Pass |
|---|---|---|---|---|---|
| τ = (10 k + 50)·0.047 µF | 0.472 ms | from the trace (63 % point) | – | – | ✓ |
| vc top of the charge (1 MΩ scope load) | 9.90 × (1 − e^−5.3) ≈ 9.85 V | 9.85 V | 0 | – | ✓ |
| Overshoot at R = 600 Ω (+ RL + Rs) | e^(−πζ/√(1−ζ²)), ζ = 0.547 → 12.6 % | 11.2 % | −1.4 pt (scope load, BE steps) | – | ✓ |
| Ringing frequency at 600 Ω | 4646 Hz | trace | – | – | ✓ |
| Critical R = 2√(L/C) | 1220 Ω total (box ≈ 1152 Ω) | overshoot < 1 % (invisible) from box ≈ 950 Ω | the eye sees it vanish early | – | ✓ (behaviour) |
