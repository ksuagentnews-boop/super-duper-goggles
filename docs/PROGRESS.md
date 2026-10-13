# Progress

Updated after every finished item (commit + push each time).

## Done
- EE312: all ten experiments (Exp 6 and 8 on the PC table), corridor by study level, electives courtyard, quick access, two DMMs, wiring lines, bidi fix, welcome card, GoatCounter hooks, diode in the DMM jacks (Exp 1 A).
- **1 · Phone fit for real**
  - The bench follows `visualViewport`, so the host app's top bar and the iPhone toolbars are left out. It also respects the safe areas, and it refits on resize, rotation and visual-viewport scroll.
  - The default layout is chosen for the free area of the current screen: wide on phone landscape, taller where the step card takes height. Every candidate is still crossing-free.
  - The overview is fitted to instruments + board with a ≈4 % margin.
  - The hint bubble is small, is shown once per session and fades.
  - The manual sheet slides up as an overlay on short (≤ 520 px) and touch-tablet screens, so the bench keeps the width.
  - The portrait top bar is a single scrolling row.
  - Checked at 844×390, 390×844, 932×430 and iPad (1180×820).

- **2 · Device zoom ≈90 %**
  - Tapping a device body shows that device alone at ≈90 % of the free screen (89–91 % at every tested size).
  - The parts box, hint, toolbar, board, other instruments and other leads are hidden.
  - The step card keeps only its text.
  - ✕ / ESC returns to the overview.

## In progress
- 3 · Lead tray.

## Next
- 3 · All leads start unplugged in the «Coaxial cables & wires» tray; Manual steps include every lead connection.
  - This also lets the portrait layout stack instruments vertically. Today a DMM must sit beside the board with its jacks facing it, so 390×844 is width-bound.
- 4 · Welcome disclaimer; du'a under the department name on the corridor's first sign.
- 5 · Procedure picker in Manual mode; sheet and grading cover only the selected procedures.
- 6 · noindex meta + robots.txt.
- 7 · Pre-launch validation → `docs/ee312/VALIDATION.md`.
- 8 · Parts box renamed «العلبة» with a small SVG box icon.
