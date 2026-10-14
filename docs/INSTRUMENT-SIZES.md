# Real instrument sizes: the common bench scale (batch 5, item 1)

Every instrument is drawn at its real front-panel size, all at one scale: `ENGINE.UPM` = 2.05 drawing units per mm, the same
scale as the plug-in panel (7 nodes × 88 units ≈ 300 mm). The table lives in `ENGINE.REAL` (engine/util.js); board.js wraps each
instrument at that scale (size, lead points, diode jack slot, slider). Where a drawing's aspect differs a little from the real
front, its area is matched, so it is neither too big nor too small. A zoomed device still fills the screen.

| Instrument | Front W × H (mm) | Source |
|---|---|---|
| GW Instek GDS-1104B | 310 × 142 | datasheet (310 × 142 × 140) |
| PeakTech 4124 | 235 × 110 | estimate from the lab photo vs the scope (PeakTech 4120 series) |
| TTi EL302RD | 260 × 160 | estimate (dual-unit EL series case) |
| MCP MT3805 (×2) | 225 × 100 | estimate from the lab photos (bench 5½-digit DMM) |
| Center-tapped transformer (EE312 Exp 4) | 160 × 148 | estimate from the photos |
| Resistance decade box (EE312 Exp 9, each) | 200 × 124 | estimate |
| Hameg HM 203-7 | 285 × 145 | MODELS.md |
| Metrix generator | 250 × 130 | MODELS.md |
| Thandar TS3022S | 260 × 160 | estimate (same class as the EL302RD) |
| Fluke 77 / GoldStar DM-33x / BK 2704B | 90 × 185 | MODELS.md (Fluke 85 × 185 × 50, with holster) |
| Metrix PX 120 | 90 × 190 | MODELS.md |
| Capacitor box BC05 | 420 × 80 | MODELS.md |
| YEW 2786 decade box | 330 × 90 | estimate from the photos |
| Three-phase transformer | 200 × 230 | MODELS.md |
| Rheostats (four side by side, top view + end panel) | 422 × 515 | MODELS.md (each 95 wide, 330 long, panel 160 high) |
| Wall socket + mains lead junction (EE205 Exp 4) | 190 × 190 | plate 70 × 115 mm |
| Variable ac supply 521 35 | 300 × 175 | MODELS.md |
| Fluorescent lamp batten | 600 × 92 | MODELS.md |
