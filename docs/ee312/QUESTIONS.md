# EE312 · Questions and decisions

These came up while building Exp 1–10. All of them are now closed. Each one says what was decided and why, so later changes can follow the same reading of the manual and slides.

1. **Exp 8: `mosfet1u.lib`. Closed: keep the typical 1-µm values (the user's decision).**
   - N_1u: VTO 0.7 V, KP 127 µA/V², λ 0.02 V⁻¹.
   - P_1u: VTO −0.7 V, KP 58.6 µA/V², λ 0.02 V⁻¹.
   - Capacitances: Cox 1.73 fF/µm², overlap 0.3 fF/µm, drain junction 1.5 fF/µm.
   - Size: W = L = 1 µm when the part has no L/W.

   The CMOS tPLH comes out ≈ 38 ps. It is graded against the same models.
2. **Exp 6: "R1 → 270 Ω" (A16) and "Change R1 back to 4.7 kΩ" (B1). Decision: these mean the 4.7 kΩ load.**
   - In Fig. 6.1, R1 is the 20 Ω primary resistor and the 4.7 kΩ load is R3.
   - Only the load makes sense: A16 asks how the ripple changes, and B1 says "back to 4.7 kΩ", which is the load's value.
   - The steps say "the 4.7k load (R3)". A16 keeps C1 = 470 µF; 10 µF is accepted too.
3. **Exp 6: OP747 model. Decision: keep the datasheet-based macro-model.**
   - Model: GBW 0.5 MHz, SR 0.2 V/µs, output about 1 V inside the rails, 25 mA limit.
   - This is the part named in Fig. 6.4. Its results (IC_out ≈ ±12.8 V, I(R1) ≈ 8–11 mA < 20 mA) match what the procedure expects.
4. **Exp 6 Q2, Exp 8 PLQ 3–5 and Exp 10 PLQ 5–6. Decision: report work, not graded on the site.**
   - The manual asks for these "in your report" (screen captures of your own design or simulation).
   - The site grades the in-lab results and the PLQs that have one answer. The sheets say these questions belong in the report.
5. **Exp 9 Table 9.2. Decision: follow the manual.**
   - VO = 4.9, 4.5, 3.5, 3.4, 2.0, 1.0, 0.5, 0.2, 0.1 V.
   - PLQ 4 uses the 3.5 → 3.4 V pair, which exists only in the manual's list; the slides' table is an older version.
   - The first row's VBC is −5.000 V. The manual prints 5.000, but VBC = VBE − VCE = 0 − 5.
6. **Exp 5: the 1 kΩ and the Zener. Decision: a 1 kΩ is in the bag; the Zener is the 1N4733A.**
   - Both Fig. 5.4a (R1) and Fig. 5.4b need a 1 kΩ.
   - The Zener is the one used in Exp 2–4. With it, the output upper level is ≈ 0.7 + 4.9 V, which matches the manual's "(0.7 + VZ2)".
7. **Exp 7: RD = 270 Ω and 470 Ω. Decision: in the bag.**
   - Procedure C names both values and Table 7.2 has their columns. The materials list just omits them.
8. **Exp 4: transformer secondary. Decision: 6.4 V rms per half (VSM ≈ 9 V).**
   - Neither the manual nor the slides give the rating.
   - With 9 V peak, vS and vO fill about 2 divisions at the manual's 5 V/div, and the ripple values in Table 4.1 come out in the mV range the procedure expects.
9. **Exp 10: resistor tolerance. Decision: nominal values.**
   - Table 10.1 asks for the measured values, and every calculation is graded from the student's own measured R and V. Random tolerances would add no learning and would make the reference values in the sheets harder to check.
   - The DMM reads the nominal values exactly.

## Batch 5 · Exp 5 on the breadboard (14 Oct)
- **Zener of Fig. 5.4b:** the manual does not name it; the slides read vO+ ≈ +4.24 V = V_D1 + V_Z, i.e. V_Z ≈ 3.5 V at ≈ 10 mA. Drawn and simulated as a 3.6 V Zener (1N4729A) instead of the 1N4733A (5.1 V) used before. A photo of the Zener's marking would confirm it.
- **µA741 model:** the output limits were fitted to the lab's own readings (slides 30, 33): +14.2 / −14.0 V at light load, +13.8 V sourcing ≈ 10 mA, −13.2 V sinking ≈ 12 mA; slew rate 0.68 V/µs (datasheet typ. 0.5) so the measured bandwidth at G = 11 (≈ 69 kHz, slide 28) is met.
- **Rail check with the MT3805 (slides 19–20):** the slides measure each unit on the supply's own terminals; on the simulator the meter leads go on the breadboard's posts (Vc / Va against ⏚), after the banana leads, which reads the same voltage.
- **Board size:** the Digilent board has 4 blocks × 64 columns; the simulator draws 2 blocks × 30 columns with a larger hole pitch, so every hole is reachable on a phone.
