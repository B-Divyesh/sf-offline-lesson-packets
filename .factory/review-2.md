# Review teachers can make one offline lesson packet — FAIL

Date: 2026-09-06 UTC

Work order: `offline-lesson-packets-review-2`

Implementation candidate: `ad04d5a77c7cbda2aa166ac7aa875f441d15e826`  
Documentation baseline: `bb1137dc2d4bf09b03b739e132099cc15eda83b0`

The commits after `ad04d5a` and through the documentation baseline change only
`.factory/handoff.md` and `.factory/verification-4.md`. All 22 public build
artifacts on the live site byte-match a fresh build of that implementation.

Live URL: <https://offline-lesson-packets.sociobot.in/>

Environment: Node.js `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium
1208, Lighthouse `12.8.2`.

## Verdict

**FAIL — 1 low-severity finding and zero untested claims.**

The full teacher-to-learner job works, the demo is isolated, every declared
claim command passes, and automated accessibility checks are clean. The two
legal-page return links have 17 px-high touch targets on a phone. The attached
accessibility contract requires at least 44×44 CSS px, so this strict review
cannot declare PASS.

## Job, audience, and first action

Fresh 1440×1000 desktop and 390×844 phone browser contexts showed this before
scrolling:

| Check | Live result |
| --- | --- |
| Job | Make one lesson packet that works offline. |
| Audience | Teachers making an activity, reflection, and exit check for learners. |
| First action | **Try it with sample data**. The nearby text says it opens a ready-made lesson. |
| Facts | Free; no account; stays on this device. |

The first-action group ended at 850 px on desktop and 627 px on phone, within
both initial viewports. The title names the job directly and the copy uses
plain words.

## Finding

### Low — Legal-page return links are too short for touch

At 390×844, the standalone **← Back to Lesson Packet** link measures
`183.203125 × 17` CSS px on both `/privacy/` and `/terms/`. It is visible and
keyboard accessible, but its 17 px clickable height is below the attached
44×44 px touch-target minimum. The header and footer offer other ways home, so
this is low severity.

Reproduce in a fresh phone browser:

1. Open `/privacy/` or `/terms/`.
2. Inspect the **← Back to Lesson Packet** link near the end of the main text.
3. Read `getBoundingClientRect()`: height `17`, width `183.203125`.

Give this standalone link a minimum 44 px height and an inline-flex or block
hit area. Product code was not changed under this report-only work order.

## Demo and end-to-end job

- One click opened `/?demo=1#composer`, set `Demo — Lesson Packet`, and loaded
  “Notice, wonder, connect” with two activity blocks, three checklist items,
  three ordered steps, a reflection, and an exit check.
- The demo banner stayed at the top after scrolling. It measured 1440×62 on
  desktop and 390×122 on phone, with **Reset demo** and **Start for real**
  visible.
- An edited sample wrote only
  `demo:lesson-packet:teacher-draft:v1`. The pre-existing real draft remained
  byte-for-byte unchanged. Reset restored the sample; Start for real removed
  the demo key and restored `Private real draft`.
- Live export downloaded `notice-wonder-connect.html` (12,639 bytes) with no
  external URL. A learner checked an item, reordered a step, wrote reflection
  and exit responses, invoked printing, and downloaded the 639-byte readable
  response file containing every change.
- Request capture during the full desktop flow found no off-origin request,
  console error, or uncaught page error.

## Clean-checkout verification

A new clone of `origin/main` at `bb1137d` was installed before running any
command. `npm ci` installed 141 packages with zero reported vulnerabilities.

| Command or check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — produced `dist/index.html` |
| `npm test` | PASS — 9 unit tests and 45 browser tests; 5 intended project skips |
| Initial JavaScript | PASS — 26.10 KB raw / 9.10 KB gzip main bundle |
| Initial CSS | PASS — 14.82 KB raw / 4.15 KB gzip |
| Live parity | PASS — 22 of 22 public build artifacts byte-match |

## Declared claims

Every exact command in `.factory/claims.json` was run separately after the
clean install.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS — 1 passed; 1 intended project skip |
| `standalone-response` | PASS — 2 passed |
| `free-demo` | PASS — 2 passed |
| `local-only` | PASS — 2 passed |
| `print-packet` | PASS — 2 passed |
| `template-roundtrip` | PASS — 2 passed |
| `learner-progress` | PASS — 2 passed |
| `template-validation` | PASS — 2 passed |
| `imported-text-safe` | PASS — 2 passed |
| `teacher-draft-recovery` | PASS — 2 passed |

Landing, composer, preview, packet, legal, footer, and README statements were
cross-checked against the inventory. Offline use, self-contained export,
printing, response download, free/no-account demo, local-only storage, demo
isolation, template validation and text safety, learner progress, and draft
recovery all have observable evidence. **Untested claim count: 0.**

## Invalid, boundary, and recovery paths

- Empty title plus no activities produced a focused error summary naming both
  problems and blocked export.
- Minute values `0` and `301` became `1` and `300`, with exact visible
  explanations. The full clean suite also checks matching preview output.
- Malformed JSON produced “That file is not valid JSON. Check the file and try
  again.” The suite also covers invalid shape/type/counts, overlong text,
  unsafe imported strings, corrupted saved JSON, and storage-write failure.
- Keyboard activation kept focus after activity reordering and removal. The
  hidden import input placed the visible focus ring on its label, not on Start
  over. Learner progress persistence and clearing pass in both browser
  projects.

## Accessibility, routes, privacy, and offline behavior

- `/opt/fleet/lib/verify-url.sh` passed root, demo, Privacy, and Terms with
  route titles, `lang=en`, one h1, a main landmark, alt text, labeled controls,
  and no console errors.
- Playwright axe returned zero violations on root, demo, Privacy, Terms, and
  the product-styled unknown route. The unknown route deliberately returned
  HTTP 404 with one h1, one main, stable navigation, and a return action. Its
  404 resource console message is expected, not a defect.
- Skip links focused `MAIN` on every route. Phone primary navigation targets
  measured at least 44×44 px; the repaired **Demo** link is exactly 44×44.
  Form controls meet the target rule through their own or associated label hit
  areas. The legal return links are the sole measured exception and are the
  finding above.
- Phone width had no horizontal overflow. Reduced-motion mode matched, used
  `scroll-behavior: auto`, and reduced transitions and animations to
  `0.00001s`.
- The service worker was active and completed an update check. A controlled
  demo reloaded offline with its title, two activity blocks, sample content,
  and offline notice intact.
- Live responses include same-origin CSP, `no-referrer`, permissions policy,
  SAMEORIGIN, nosniff, immutable hashed-asset caching, and `no-cache` for the
  service worker. All internal routes, anchors, and the external source link
  returned successfully.

Fresh Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
100, SEO 100; FCP 1.038 s, LCP 1.095 s, TBT 29.5 ms, CLS 0. Lighthouse wrote
valid JSON before its known post-report browser-tab crash message.

## Earlier finding disposition

| Earlier finding | Fresh disposition |
| --- | --- |
| Reordering/removal lost focus | PASS — both resulting controls retained focus live and in the clean suite. |
| Import showed a false focus ring on Start over | PASS — Import has the ring; Start over has none. |
| Live cache/security policy was missing | PASS — root, asset, service-worker, and 404 headers match policy. |
| Live Lighthouse was below 90 | PASS — fresh mobile score is 100. |
| Out-of-range time silently differed | PASS — both bounds, messages, and preview agree. |
| Malformed JSON exposed parser jargon | PASS — live recovery wording is plain. |
| Preview main lacked a unique name | PASS — `aria-label="Lesson packet"`; axe is clean. |
| Skip link did not focus main | PASS — every route moves focus to `MAIN`. |
| Phone demo controls scrolled away | PASS — the 390×122 banner stayed fully visible. |
| Demo reused the landing title | PASS — title is `Demo — Lesson Packet`. |
| Three public claims were unlisted | PASS — all ten declared commands pass; no untested claim remains. |
| Header navigation changed by route | PASS — all routes show the same four links. |
| Route headings used mood or metaphor | PASS — legal and 404 headings name their page directly. |
| First-action details were 13 px | PASS — the clean regression measures at least 16 px. |
| Phone Demo link was narrower than 44 px | PASS — live target is exactly 44×44 px. |

The new legal-return-link finding is separate from these repaired items.

## Applicability and evidence

This is a free static web product. It has no backend, database, tenant,
account, payment, rate-limited API, health endpoint, CLI, library, or desktop
artifact. Backend isolation, persistence, 429/Retry-After, and installed
consumer checks do not apply. The brief excludes AI lesson generation, and no
obvious scoped AI step is missing.

Evidence:

- `/work/.evidence/review-2/live-review.json`
- `/work/.evidence/review-2/desktop-first-screen.png`
- `/work/.evidence/review-2/phone-first-screen.png`
- `/work/.evidence/review-2/desktop-demo.png`
- `/work/.evidence/review-2/phone-demo.png`
- `/work/.evidence/review-2/learner-packet.png`
- `/work/.evidence/review-2/verify-*/verify.json`
- `/work/.evidence/review-2/lighthouse.json`

The named external `factory-evidence/.../qa-report.md` file was not mounted in
this disposable workspace. The repository verification report was read in
full, and every material check was independently repeated. No product code was
changed during this review.
