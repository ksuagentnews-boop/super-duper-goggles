# EE205 instruments: models, real sizes and looks

Reference for redrawing the EE205 instruments. Crops of every instrument, cut at full resolution from the table photos and video frames and enlarged 2×, are in `crops/`. Draw each instrument from its crop, not from memory, and compare the drawing with the crop side by side (see CLAUDE.md, Batch 5).

Sizes are the real outside dimensions where a datasheet gives them (W × H × D); the others are estimated from the photos against known parts, such as the 4 mm sockets (≈ 15 mm across the collar) and the plug-in panel. Use them for the one common bench scale.

| Instrument | Model (how identified) | Real size, approx. | Crop |
|---|---|---|---|
| Three-phase transformer (Exp 5) | **Leybold three-phase extra-low voltage transformer, 521 29x family**, in the old Leybold-Heraeus red housing. The electrical match is certain: the panel prints "I max 4 A / 2.3 A Δ", the datasheet's "4 A / 2.3 A each", with eight sockets for two star / delta sets (6 V / 10 V and 23 V / 40 V). The look is NOT the one in today's catalogue photo. | 20 × 23 × 14 cm (W × H × D), 7.6 kg | `threephase-transformer-a.jpg`, `-b.jpg` |
| Rheostats (Exp 5) | **Leybold rheostat, 537 3x series** (e.g. 537 331, 34 Ω, 3 A / 15 min). Beige housing, 4 mm safety sockets. | 330 × 95 × 160 mm (L × W × H) | `rheostat-front.jpg`, `rheostats-row.jpg`, `rheostat-slider-hand.jpg` |
| Variable AC supply (Exp 7) | **Leybold "Variable extra-low voltage transformer S", cat. 521 35** (L-in-a-circle Leybold logo; the bottom-right label reads "…VARIABLE EXTRA LOW VOLTAGE TRANSFORMER S"). | ≈ 30 × 20 × 23 cm | `variable-ac-supply.jpg` |
| Analog scope (Exp 2, 6, 8) | **Hameg HM 203-7** (label under the CRT). 20 MHz, 2 channels. | ≈ 285 × 145 × 380 mm (the HM 203 / 303 family is 285 mm wide) | `hameg-hm203-7.jpg` |
| Function generator (Exp 2, 3, 6, 8) | **Metrix**, blue housing ("metrix" logo bottom-right of the panel; the plan names it MTX 3240). | ≈ 25 × 13 × 25 cm | `metrix-generator.jpg` |
| Power meter (Exp 4, 5) | **Metrix PX 120**, handheld, blue holster. | ≈ 9 × 19 × 5 cm | `px120-a.jpg`, `px120-b.jpg` |
| Capacitor decade box (Exp 4) | **"Boîte de capacités / Capacitor box BC05"**, cream panel, 5 dials. | ≈ 42 × 8 × 12 cm | `capacitor-box-bc05.jpg` |
| Fluorescent lamp (Exp 4) | 20 W tube in a white batten, plugged into the **wall socket** (no ac supply on the table). | ≈ 60 cm long | `fluorescent-lamp.jpg` |
| Handheld DMM | **Fluke 77**, grey-green with holster. | 85 × 185 × 50 mm | `fluke77.jpg` |
| Coupled coils (Exp 7) | Leybold 1000-turn and 500-turn coils on a U-core with yoke. | coil ≈ 5 × 7 × 7 cm | `coupled-coils-ucore.jpg` |

Relative size order on the bench, from biggest to smallest: Hameg scope > variable ac supply ≈ Metrix generator > three-phase transformer > capacitor box (long but low) > rheostat (long, narrow) > Fluke 77 / PX 120 (handheld, clearly the smallest).

## What each crop shows

### Three-phase transformer (old Leybold-Heraeus version of the 521 29x)
**Draw it from the lab crops only** (`threephase-transformer-a.jpg`, `-b.jpg`, and the 4× sharpened close-ups `threephase-panel-top-4x.png`, `threephase-panel-sockets-4x.png`, `threephase-panel-label-5x.png`). Leybold's current shop photo of the 521 291 is a later redesign with the same ratings but a different look, so it is NOT a drawing reference.

Read from the lab photo, enlarged and sharpened:
- Upright box, about as tall as it is wide. Orange-red housing with rounded edges, and a dark grey carrying-handle recess in the middle of the top.
- Cream front panel set inside a red frame, slightly recessed.
- Top-left: a white rocker mains switch in a black square frame.
- Top-right: a printed AC / three-phase symbol with "≈ V", and under it the transformer symbol: two overlapping circles with a winding mark on each side.
- Middle: "I max 4 A / 2.3 A Δ" in two lines.
- Lower half: two printed triangle diagrams side by side, each with **four** black 4 mm sockets, **eight in all**:
  - each diagram has a socket at the top corner, one at the bottom-left, one at the bottom-right (the three phases L1, L2, L3), and one inside the triangle a little below its middle (N, the star point);
  - the two upper edges of each triangle are solid lines; the bottom edge and the three lines from N to the corners are dashed;
  - every line carries its voltage: the line-to-line (delta) value on the edges and the line-to-N (star) value on the dashed lines from N. The datasheet gives 23 V / 40 V for one set and 6 V / 10 V for the other. Read which set is which from the crop;
  - a solid printed line joins the two N sockets across the panel;
  - the right diagram sits a little lower than the left one, and its bottom-left socket is right next to the left diagram's bottom-right socket.
- Between the two triangles, above the N–N line: a ⚠ triangle with a small red pilot lamp under it.
- Bottom strip: a black band across the panel, with the old Leybold-Heraeus logo (white square mark) and a name at the left, and two lines of white text at the right: the product name in German and English, with the catalogue number.
- The handwritten pen marks on the real panel are dirt; do not draw them.

### Rheostat (Leybold 537 3x)
- Long beige box lying flat, ventilation slots along both long sides; the top is split in two halves along its length.
- The **slider** is the black rectangular carriage sitting on the top, riding along the gap between the two halves. Dragging it along the length changes the resistance.
- End panel (dark grey): a red 4 mm socket at the top; a round black recessed element in the middle; two yellow ⚠ stickers to its right (owner: leave them out); "max 500 V" print; at the bottom a black 4 mm socket and a green-yellow 4 mm socket.
- Four rheostats stand side by side on the table; three are used as the Y load.

### Variable AC supply (Leybold 521 35)
- Cream box with a carrying-handle slot on top.
- The front panel is split into three grey fields:
  - Left: a red illuminated mains rocker at the top-left; below it, two black 4 mm sockets for the fixed ac output, labelled "12 V".
  - Middle: two small round fuse holders; under them two black 4 mm sockets.
  - Right: a large white pointer knob with a scale, for the variable output; under it a blue and a red 4 mm socket.
- A printed line diagram joins the knob to the outputs.
- Bottom strip: Leybold logo bottom-left and the product text bottom-right.

### Hameg HM 203-7
- Beige-grey case with a carrying handle that doubles as a tilt stand.
- Left: a rectangular CRT with a green graticule (8 × 10 divisions) in a dark bezel. Under it, the Hameg label plate and the CAL output.
- Right: two panel sections.
  - Top section: the red POWER key with its LED; green INTENS. and FOCUS knobs; the TR (trace rotation) hole; the X-POS. knob and the slide switches; the large TIME/DIV. rotary knob with a red centre (variable) and its scale; at the right, the blue HOLD OFF / LEVEL knob, the trigger keys and the TRIG. EXT. BNC.
  - Bottom section: the Y-POS. I and Y-POS. II knobs at the outer edges; two large VOLTS/DIV. rotary knobs with red centres (variable) and their scales; the AC / DC / GD slide switches; the row of mode keys (CH I/II, DUAL, ADD, CHOP, INV., XY); the CH I and CH II input BNCs at the bottom corners, each with a red and black 4 mm socket beside it (the lab's banana adaptors).

## Sources
- Leybold 521 291: https://www.leybold-shop.com/three-phase-extra-low-voltage-transformer-521291.html
- Leybold rheostat 537 331: https://www.leybold-shop.com/rheostat-34-ohm-537331.html
- Hameg HM 203 front panel (the HM 203-4 manual, same family): https://retrocmp.de/hardware/hameg/Hameg_203-4_en.pdf
- Hameg analog scope control descriptions (HM 303-6 manual): https://ftecnologica.udistrital.edu.co/laboratorios/ciencias-basicas/sites/lab-ciencias-basicas/files/manual/2024-09/Osciloscopio%20analogo%20Hameg.pdf

Photos of these models on the web (manufacturer pages, auctions) can be found with the model names above. The owner can attach close straight-on photos from the lab, which are better than any of these.
