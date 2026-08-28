# Lesson Packet repair handoff

Work order: `offline-lesson-packets-repair-1`

Completed: 2026-08-28 UTC

Original candidate: `e3f83b4af62fc18ebe78dedbbdc29cd1fd0ba867`

Verifier report commit: `4ce9837f54f339252b1e9ba8988f7552f42f2a2c`

Artifact/deployment class: static web (`dist/`) on Azure Static Web Apps

Live URL: <https://offline-lesson-packets.sociobot.in/>

## Result

Every defect in `.factory/verification.md` is repaired. The product keeps its
one-file offline packet workflow, local-only storage, import limits,
sanitization, printing, and responsive risograph design.

## Repairs

- Activity reorder restores focus to the same enabled move control. Activity
  removal focuses the next useful remove control, or the add control when the
  list becomes empty. Item removal has equivalent focus recovery.
- The hidden import input now gives its 3px visible focus ring to the
  `Import template` label. It never outlines `Start over`.
- Estimated minutes normalize visibly to 1–300 in the input. A polite message
  explains the adjustment, and singular “1 minute” is correct in the packet.
- Malformed JSON now says: “That file is not valid JSON. Check the file and try
  again.” Template/schema errors retain their specific teacher-facing text.
- The preview packet main landmark has the accessible name `Lesson packet`.
  Root, demo, legal, and packet axe scans have no violations.
- Azure Static Web Apps now reads `staticwebapp.config.json`. Hashed/assets
  receive one-year immutable caching; `/sw.js` receives `no-cache`; CSP,
  no-referrer, Permissions Policy, SAMEORIGIN, and nosniff are live.
- Startup no longer runs the off-screen packet iframe or a full-viewport SVG
  turbulence filter. The preview loads near the viewport and the page uses a
  lightweight CSS ink pattern. Live Lighthouse TBT fell from 466–964 ms to
  0 ms in all three repair runs.
- Service worker cache matching now handles `Vary` safely. Navigations are
  network-first for updates and use a marked cached shell offline, so the
  offline state remains truthful after reload.
- The first screen now opens an isolated sample lesson in one click. Demo edits
  use `demo:lesson-packet:teacher-draft:v1`, never the real draft key. Reset and
  “Start for real” behavior are tested.

## Exact regression coverage

`tests/e2e/app.spec.ts` directly asserts:

- keyboard focus after activity reorder and removal;
- truthful import-control focus styling;
- visible 0→1 and 301→300 time normalization in editor and preview;
- the plain malformed-JSON recovery message;
- removal of the `landmark-unique` axe result;
- deferred off-screen preview startup;
- isolated demo/reset/exit behavior and same-origin-only requests;
- offline shell, complete standalone export/response/print, template
  round-trip, and optional learner persistence.

`tests/model.test.ts` asserts the exact Azure header/cache configuration and
the 200 KB JS / 50 KB CSS limits. `.factory/claims.json` lists seven public
claims; each exact `npm run test:e2e -- --grep @claim:<id>` command passes.

## Clean verification evidence

- `npm ci`: PASS; 142 packages audited, 0 vulnerabilities.
- `npm run lint`: PASS (ESLint 10).
- `npm run typecheck`: PASS (`tsc --noEmit`).
- `npm test`: PASS; 9 Vitest tests and 29 applicable Playwright desktop/mobile
  tests passed; 3 intentional per-project skips.
- `npm run build`: PASS; `dist/index.html`, legal pages, and the styled 404
  route produced.
- Production payload: initial JS 26,753 B raw / 9.37 kB gzip; CSS 14,487 B raw
  / 4.07 kB gzip; mobile hero 28,556 B; social image 58,858 B; total `dist/`
  420 KB including maps and both hero sizes.
- Worker `verify-url.sh`, local and live: HTTP 200, correct title/lang, one h1,
  main landmark and image alt; 0 console errors.
- Playwright axe integration: 0 violations on root, demo, legal pages, and the
  rendered standalone packet/preview. Reduced motion, skip link, keyboard-only
  controls, 44px targets, error focus, and 390×844 layout are covered.
- Live 1440×1000 and 390×844: 0 horizontal overflow, focus restored to
  `Move activity 2 up`, import label outline `solid`, reset outline `none`, no
  external requests, and no console errors.
- Live offline/update: service worker activated; network-disabled reload showed
  the offline bar and both activity cards with JS/CSS restored.
- Local Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.1 s, TBT 60 ms, CLS 0.
- Live Lighthouse 12.8.2 mobile, three fresh runs: all category scores
  100/100/100/100; LCP 1.035 s / 1.032 s / 1.060 s; TBT 0 ms each; CLS 0.
- Live response policy: root/legal/404 return CSP, `Referrer-Policy:
  no-referrer`, Permissions Policy, `X-Frame-Options: SAMEORIGIN`, and nosniff;
  assets return `public, max-age=31536000, immutable`; service worker returns
  `no-cache`; the designed 404 response keeps HTTP 404.
- Live identity: root, service worker, hashed JS, and hashed CSS matched the
  local production build byte-for-byte after deployment.

No backend, sign-in, billing, package consumer, database, concurrency, or API
rate-limit checks apply to this static, account-free product.

## Run and verify

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

Open `/?demo=1` for the clean sample sandbox. See `.factory/demo.md` and
`.factory/claims.json` for reset/storage details and exact claim commands.

## Known gaps

- Interface and generated packet copy remain English-only.
- Local drafts intentionally remain one-browser/one-device. Downloaded JSON
  templates are the durable backup.
- Lighthouse is lab evidence; there is no field INP collection because the
  product intentionally has no analytics.
