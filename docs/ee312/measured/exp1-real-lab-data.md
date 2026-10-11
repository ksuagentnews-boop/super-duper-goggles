# Exp 1 — readings from the student's own lab report (FALLBACK only)

Priority: derive values from the manual, the slides, datasheets and device physics first. Use this file only when that leaves a value unclear, or as a sanity check. It is one student's report and may contain mistakes.

Instruments: MCP MT3805 DMM, Aim-TTi EL302RD dual supply, RS = RL = 100 Ω.

## Procedure A — DMM diode-test position
| Reading | Value |
|---|---|
| Open circuit (leads open) | `OVL.D` |
| Reverse-biased diode | `OVL.D` |
| Rectifier 1N400x forward | 0.550 V |
| Zener (forward) | 0.670 V |
| LED (green, as in Fig. 1.2) | 1.700 V |
| Germanium | 0.240 V |

## Procedure B — Fig. 1.3, VDD = 5 V, current limit 0.05 A
| Step | Value |
|---|---|
| VOC (open circuit) | 5.004 V |
| Vrev (rectifier reversed) | 5.004 V |
| VD at ID = 1 mA (VRS = 0.1 V) | 0.574 V |
| VD at ID = 10 mA (VRS = 1 V) | 0.683 V |
| VD at ID = 20 mA (VRS = 2 V) | 0.714 V |
| Loading: VD no load → VD′ with 100 Ω across | 0.746 V → 0.737 V |

Notes
- Only one MT3805 is on the bench; the student moves the leads between RS (VRS) and the diode (VD). Fig. 1.3 draws two meters only for clarity.
- "Fig. 1.5a" in step 5 is a typo for Fig. 1.3a with the rectifier reversed (cathode toward the + side) in place of the open circuit.
- The manual does not name the Ge part; model a glass point-contact Ge diode (1N34A-class) that reads 0.24 V on diode test.
