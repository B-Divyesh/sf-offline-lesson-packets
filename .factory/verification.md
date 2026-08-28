# Independent product verification — FAIL

Date: 2026-08-28 UTC

Work order: `offline-lesson-packets-verify-1`

Candidate tested: `e3f83b4af62fc18ebe78dedbbdc29cd1fd0ba867`

Live URL: <https://offline-lesson-packets.sociobot.in/>

Environment: Node.js `v22.23.2`, npm `10.9.8`, Chromium supplied for Playwright `1.58.2`

## Verdict

**FAIL.** The core teacher-to-learner job works, the deployed files match the
candidate, privacy behavior is local-only, and automated serious/critical axe
findings are zero. Release acceptance is nevertheless blocked by keyboard
focus defects. The live host also fails the committed response/cache policy,
and fresh Lighthouse mobile runs did not meet the required 90 performance
score.

## Reproduction from a clean candidate checkout

The checkout began clean on `main`, with local `HEAD`, `origin/main`, and the
requested candidate all equal to
`e3f83b4af62fc18ebe78dedbbdc29cd1fd0ba867`.

| Check | Fresh result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 7 unit tests; 10 applicable Playwright desktop/mobile tests; 2 intentional per-project skips |
| Type check | PASS — `tsc --noEmit`, as part of the exact build |
| Lint | N/A — no lint command/configuration exists |
| `npm run build` | PASS — Vite production build created `dist/` |
| Initial JavaScript | PASS — 24,870 B raw / 8.75 kB gzip (budget 200 KB) |
| Initial CSS | PASS — 14,045 B raw / 4.14 kB gzip (budget 50 KB) |
| Mobile hero | PASS — 28,556 B (budget 300 KB); desktop source 109,314 B |
| Fonts | PASS — system stacks only; no downloaded font payload |
| Total `dist/` | 304 KB including source maps and both hero sizes |

No separate library/CLI packaging check applies. This is a static web product,
with no backend, sign-in, billing/unlock call, or server-side API endpoint;
concurrency, persistence-service, Entra authority, and API rate-limit tests are
therefore not applicable.

## End-to-end and boundary evidence

- PASS — Composed a representative Grade 5 science packet with checklist,
  ordered steps, short response, reflection, exit check, subject, 45-minute
  estimate, and optional local learner save. Downloaded filename was
  `water-cycle-grade-5.html`.
- PASS — Opened the actual download through `file://`, with no request beyond
  the file navigation. Keyboard interaction checked an item, reordered a step,
  entered a short response, and downloaded a complete readable TXT response.
- PASS — The response contained the learner name, checklist state, new sort
  order, short answer, reflection, and exit response. Print invoked locally.
- PASS — With local saving enabled, name, answers, checklist state, and sort
  order survived reload. Canceling clear preserved data; confirming clear
  removed it.
- PASS — With browser storage writes forced to fail, the composer reported
  `Draft could not be saved` and still exported a packet.
- PASS — Corrupt saved draft JSON recovered to the starter packet without a
  page error.
- PASS — Empty required content produced six derived errors, focused the alert
  summary, linked back to the affected fields, and prevented export.
- PASS — Canceling activity removal preserved the activity.
- PASS — Template import rejected unsupported version/type, 21 activities,
  21 items, and a file over 200 KB. A valid template downloaded and re-imported.
  Twenty activities were accepted and a 21st was blocked with feedback.
- PASS — Imported `</script>`, image error-handler, and SVG-handler strings
  remained inert text; generated IDs replaced imported IDs. The standalone file
  contained no external URL or stylesheet.
- PASS with UX defect noted below — entered minute values `0` and `301` are
  bounded to `1` and `300` in preview/export.

## Browser, accessibility, and visual checks

- Chromium was exercised at 1440×1000 and 390×844 against both local production
  preview and live. There was no horizontal overflow, and export remained
  reachable. Full-page local/live screenshot pairs were pixel-identical at
  both sizes.
- Visual inspection confirmed legible hierarchy, intentional mobile stacking,
  a rendered packet iframe, and no clipping. The blank-looking iframe in the
  first full-page compositor capture was ruled out by a direct iframe capture
  and DOM inspection; its complete packet content renders.
- Root, privacy, terms, and exported packet checks found **0 serious or critical
  axe violations**. Privacy and terms had no axe violations at any impact.
  Root had one moderate best-practice result: `landmark-unique`, because axe
  sees the page `<main>` and the sandboxed preview document's unlabeled
  `<main>` together.
- No console errors, uncaught page errors, failed requests, or keyboard traps
  occurred in the tested flows. A 3 px solid focus ring was confirmed on the
  skip link; the skip link worked. Core add, edit, export, learner checklist,
  sort, response, and response-download actions were exercised through keyboard
  activation.
- Mobile target inventory found the only nominal sub-44 px element to be the
  deliberately hidden 1×1 file input; its visible label is a full-size target.
  Its keyboard focus presentation is defective as recorded below.
- `prefers-reduced-motion: reduce` matched and reduced animation/transition
  duration to effectively instant with a single iteration.

## Privacy, network, offline, and deployment evidence

- Source/runtime inspection found no analytics, telemetry, cookies, XHR,
  WebSocket, beacon, third-party script, or third-party font. Browser request
  capture during local and live loads found only same-origin resources.
- Composer content uses one documented local-storage key. Learner responses
  use local storage only when explicitly enabled; response transfer is a local
  TXT download.
- The live service worker installed and activated from `/sw.js`; an explicit
  `registration.update()` completed. Cache `lesson-packet-shell-v1` existed,
  and a subsequent network-disabled reload rendered the composer and its
  visible offline state.
- TLS certificate matched the hostname and was valid from 2026-08-28 through
  2027-02-28. Live responses used HTTP/2, Brotli when requested, HSTS,
  `X-Content-Type-Options: nosniff`, ETags, and conditional `304` responses.
- Candidate parity is confirmed by byte-for-byte SHA-256 comparison of every
  served build artifact: root, privacy, terms, JS, CSS, both WebP images,
  favicon, robots, sitemap, service worker, and three source maps (14/14
  matched; `_headers` is deployment configuration, not a served artifact). For example,
  root is `c6c770c5c1f74c5f303db85a8adbef6460c88321f7376fb7478b63ccecf5ffda`
  and JS is `c23e34e7dc8941c9cf1e6bb35f24e9d705d6449c47eafbcebf944c560c248b82`.

## Performance

Lighthouse `12.8.2` mobile results:

| Target/run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local production preview | 97 | 100 | 100 | 100 | 1.3 s | 200 ms | 0 | 45 KiB |
| Live 1 | 88 | 100 | 100 | 100 | 1.1 s | 466 ms | 0 | 45 KiB |
| Live 2 | 79 | — | — | — | 1.23 s | 964 ms | 0 | 45 KiB |
| Live 3 | 82 | — | — | — | 1.19 s | 742.5 ms | 0 | 45 KiB |

The live median is 82, below the required 90. LCP and CLS pass their budgets;
INP is not available from this lab navigation. Lighthouse emitted a Chromium
`Browser tab has unexpectedly crashed` runtime message after producing each
valid JSON report, so the performance figures should be repeated in a stable CI
runner, but all three fresh live reports were below the gate.

## Defects

### High — Composer loses keyboard focus when activities are reordered

Reproduction: focus `Move activity 1 down`, press Enter. The card list is
re-rendered and `document.activeElement` becomes `<body>`. The attempted focus
target is a non-focusable `<section>`. Removing an item/activity similarly
rebuilds the list without restoring useful focus. This breaks the attached
non-negotiable keyboard/focus contract and makes repeated reordering onerous.

### High — Import template has a false visible focus indicator

When the actual 1×1, opacity-zero file input receives keyboard focus, neither it
nor the visible `Import template` label has an outline. Instead, CSS
`.visually-hidden-file:focus + *` gives a 3 px outline to the next sibling,
`Start over`. Pressing Enter acts on file import while the screen visibly says
focus is on the destructive reset action. This fails visible, truthful keyboard
focus and is release-blocking.

### Medium — Live deployment ignores committed cache/security header policy

`dist/_headers` requests one-year immutable caching for `/assets/*`, `no-cache`
for `/sw.js`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and
`X-Frame-Options: SAMEORIGIN`. Fresh live responses instead give root, hashed
assets, and `/sw.js` the same `public, must-revalidate, max-age=30` policy;
referrer policy is `strict-origin-when-cross-origin`; Permissions Policy and
X-Frame-Options are absent. ETag revalidation works, but immutable caching and
the declared browser protections do not. This is a deployment configuration
defect even though file bytes match.

### Medium — Fresh live Lighthouse performance is below the gate

Three runs scored 88, 79, and 82 (median 82) against a required minimum of 90,
driven by 466–964 ms total blocking time under mobile throttling. Asset size,
LCP, and CLS budgets pass. Recheck in stable CI because Lighthouse also reported
a browser crash after emitting each report.

### Medium — Out-of-range time silently differs between editor and export

Entering `0` leaves `0` visible in the editor but preview/export says “About 1
minutes”; entering `301` stays visible but becomes 300 in output. The `novalidate`
form suppresses native range errors and no custom message explains the change.
This is misleading content recovery for a boundary input.

### Low — Malformed template exposes parser jargon

Importing `{oops` reports the engine string `Expected property name or '}' in
JSON at position 1 (line 1 column 2)` instead of a teacher-facing explanation
and recovery step.

### Low — Axe reports duplicate unlabeled main landmarks across preview

The root page and iframe preview each expose an unlabeled `main`, producing one
moderate `landmark-unique` best-practice finding. There are no serious/critical
axe findings.

## Acceptance summary

Core usefulness, self-contained export, local privacy, sanitization, printing,
offline reload, responsive layout, documentation, build, and bundle budgets
pass. The candidate must not be accepted until the two keyboard-focus defects
are fixed and verified. Deployment headers/caching and the live performance
gate also require correction or an explicitly accepted platform exception.
