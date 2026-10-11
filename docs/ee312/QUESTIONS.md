# EE312 · Open questions

Questions found while building Exp 1–10 without waiting for answers. Each has the assumption used, so nothing is blocked.

1. **Exp 8: `mosfet1u.lib`.** The manual links the file on LMS, and it is not in `docs/`. I used typical 1-µm Level-1 values:
   - N_1u: VTO 0.7 V, KP 127 µA/V², λ 0.02 V⁻¹.
   - P_1u: VTO −0.7 V, KP 58.6 µA/V², λ 0.02 V⁻¹.
   - Cox 1.73 fF/µm², overlap 0.3 fF/µm, drain junction 1.5 fF/µm.
   - W = L = 1 µm when no L/W is given.

   The VTC shapes are right. The propagation delays are only as good as these numbers (CMOS tPLH ≈ 38 ps). Please add the real file (or its text) to `docs/ee312/` so the models can match it.
2. **Exp 6: "R1 → 270 Ω" (A16) and "Change R1 back to 4.7 kΩ" (B1).** In Fig. 6.1, R1 is the 20 Ω primary resistor and the 4.7 kΩ load is R3. I treated both steps as changing the load R3. Is that right?
3. **Exp 6: OP747 model.** The simulated OP747 uses GBW 0.5 MHz, SR 0.2 V/µs and an output swing about 1 V inside the rails. With this model, IC_out ≈ ±12.8 V into the limiter. If the class uses a different library part, tell me which one.
4. **Exp 6 Q2 / Exp 10 PLQ 5–6 / Exp 8 PLQ 3–5.** These need `.ac` analysis, a 2N2222 or Fig. 8.7. They are report work and are not graded on the site. Should the PC table also offer `.ac` and these parts?
5. **Exp 9 Table 9.2.** The manual lists VO = 4.9, 4.5, 3.5, 3.4, 2.0, 1.0, 0.5, 0.2, 0.1 V and the slides list 4.95, 4.5, 3.5, 2.5, 2.0, 1.5, 0.5, 0.2, 0.1 V. I followed the manual. PLQ 4 uses 3.5 → 3.4. The first row's VBC is printed as 5.000; I used −5.000 (= VBE − VCE).
6. **Exp 5: the 1 kΩ.** Fig. 5.4a and 5.4b both need a 1 kΩ, but the materials list does not include one. I put a 1 kΩ in the bag. Also, the Zener is not named; I used the 1N4733A from Exp 2–4.
7. **Exp 7: RD = 270 Ω and 470 Ω (Procedure C).** These are not in the materials list. I put them in the bag.
8. **Exp 4: transformer secondary.** The voltage is not printed in the manual. I used 6.4 V rms per half (VSM ≈ 9 V). If the lab transformer is different, give me its rating.
9. **Exp 10: resistor tolerance.** The DMM reads the resistors at their nominal values. Should each table get its own random ±5 % values, like real parts?
