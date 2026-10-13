# محاكي معامل قسم الكهرباء · EE Labs Simulator

محاكي لمعامل قسم الهندسة الكهربائية في جامعة الملك سعود، مرجع للطلاب يجرّبون فيه التجارب بنفس أجهزة المعمل.

- `index.html`: الصفحة (القاعة، الطاولة، الوصول السريع).
- `engine/`: المحرّك المشترك: محلّل الدوائر، الأجهزة (GDS-1104B، PeakTech 4124، TTi EL302RD، MCP MT3805، المحوّل، صناديق المقاومات)، لوحة التوصيل، كمبيوتر LTspice لتجربتي 6 و 8، القاعة ثلاثية الأبعاد.
- `labs/index.js`: قائمة المعامل والتجارب. كل تجربة ملف واحد في `labs/<lab>/`. تجارب EE312 العشر كلها جاهزة.
- `tests/e2e.mjs`: اختبار آلي في متصفح headless (كمبيوتر + جوال).
- `CLAUDE.md`: قواعد المشروع لـ Claude Code.
- `docs/`: دليل كل معمل وسلايداته وصور الأجهزة. الأسئلة والقرارات: `docs/ee312/QUESTIONS.md`.

## Developer handoff

**Stack:** plain HTML + CSS + vanilla JavaScript (ES2019, classic `<script>` tags, no framework, no bundler, no build step). 3D hall: Three.js r128 from cdnjs. Instruments and bench: hand-written SVG. Circuit simulation: own MNA solver in `engine/solver.js`. Tests: Node 18+ with Playwright (Chromium).

**Runtime dependencies:** only Three.js r128 (`https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`). Optional GoatCounter analytics (`labs/site.js`, off while `goatcounter` is empty).

**Run locally**
```bash
npm start              # serves the folder at http://localhost:8080 (or any static server: python3 -m http.server)
```
Open `index.html` through a server (not `file://`), because experiments are lazy-loaded from `labs/<lab>/expN.js`.

**Tests**
```bash
npm install            # installs Playwright
npx playwright install chromium
npm test               # e2e on desktop + phone (all modules)
node tests/e2e.mjs desktop ee312-exp1      # one module, one viewport
npm run validate       # solver vs theory  ·  npm run robust  # edge-case sweep  ·  npm run test:pc  # LTspice table
```
If cdnjs is blocked, set `THREE_JS=/path/to/three.min.js`.

**Deploy:** GitHub Pages → Settings → Pages → Deploy from branch `main` (later `release`), folder `/ (root)`. No build needed.

**Where things are:** `engine/` shared engine and instruments · `labs/index.js` lab registry · `labs/<lab>/expN.js` one file per experiment · `docs/<lab>/` manuals, photos, plans · `docs/PROGRESS.md` status · `CLAUDE.md` full product rules and decisions.
