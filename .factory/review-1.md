# Review teachers can make one offline lesson packet — FAIL

Date: 2026-09-06 UTC

Work order: `offline-lesson-packets-review-1`

Implementation candidate: `a015482f28f0182e54688100dc30d0df6d51d64f`

Documentation baseline: `50adc5850f8bfe1cdd91ef69a635cb5331a87b80`

The commits after `a015482` and through `50adc58` change only verification and
handoff documents. The live build byte-matches the implementation candidate.

Live URL: <https://offline-lesson-packets.sociobot.in/>

Environment: Node.js `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium
1208, Lighthouse `12.8.2`.

## Verdict

**FAIL — 1 low-severity finding and zero untested claims.**

The teacher-to-learner job works end to end, the sample is isolated from real
work, all ten declared claim commands pass, and automated accessibility scans
are clean. The phone header still has one touch target narrower than the
required 44 CSS pixels. This review requires zero findings, so it cannot
declare PASS.

## Job, audience, and first action

These were read before scrolling in separate empty desktop and 390×844 phone
browser contexts.

| Check | Live result |
| --- | --- |
| Job | Make one lesson packet that works offline. |
| Audience | Teachers building an activity, reflection, and exit check for learners. |
| First action | **Try it with sample data**; the nearby text says it opens a ready-made lesson. |
| Facts | Free; no account; stays on this device. |

The heading, audience sentence, action, and three facts were fully inside both
initial viewports.

## Finding

### Low — The phone header Demo link is narrower than the touch-target minimum

At a 390×844 viewport, the visible **Demo** link in the main header measures
`38.90625 × 44` CSS pixels. The attached accessibility and design contracts
require every touch target to be at least 44×44 CSS pixels. The same link is
large enough on desktop, and the phone link has space around it, but its actual
clickable width remains about 5 pixels short.

Reproduction:

1. Open the live root in a fresh browser context with a 390×844 viewport.
2. Inspect `header nav a` whose text is `Demo`.
3. Read its `getBoundingClientRect()`: width `38.90625`, height `44`.

Add enough horizontal padding or a `min-width: 44px` rule while preserving the
current navigation layout. Product code was not changed because this work
order is report-only.

## One-click sample and real-data isolation

- PASS — desktop and phone opened the populated “Notice, wonder, connect”
  lesson with one click. Its preview contained three checklist items, three
  ordered steps, a reflection, and an exit check.
- PASS — the banner remained in the viewport after scrolling on both sizes. It
  showed the sample label, **Reset demo**, and **Start for real**.
- PASS — editing and resetting the sample used
  `demo:lesson-packet:teacher-draft:v1`. A real draft named “Private real
  draft” stayed byte-for-byte unchanged.
- PASS — **Reset demo** restored the original sample. **Start for real**
  removed demo mode and restored the real draft.
- PASS — request capture found no off-origin request during either sample flow.

## Live end-to-end result

The live sample downloaded `notice-wonder-connect.html` as a 12,639-byte
self-contained file with no external URL. A learner checked an item, reordered
a step, entered reflection and exit responses, invoked printing, and downloaded
`notice-wonder-connect-response.txt`. The 640-byte response contained the
learner name, checklist state, reordered work, reflection, and exit response.

## Clean-checkout quality gates

A new clone of `origin/main` at `50adc58` was installed and tested before any
report edits.

| Command or check | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages installed; 0 vulnerabilities reported. |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — `dist/index.html` produced. |
| `npm test` | PASS — 9 unit and 44 browser tests; 4 intended project skips. |
| JavaScript budget | PASS — 26.10 KB main JS; total initial JS remains below 200 KB. |
| CSS budget | PASS — 14.79 KB raw / 4.14 KB gzip. |
| Live artifact parity | PASS — all 22 published files byte-match the clean build. |

## Declared claims

Every command was run exactly as listed in `.factory/claims.json` after the
clean install.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS — 1 passed; 1 intended mobile-project skip. |
| `standalone-response` | PASS — 2 passed. |
| `free-demo` | PASS — 2 passed. |
| `local-only` | PASS — 2 passed. |
| `print-packet` | PASS — 2 passed. |
| `template-roundtrip` | PASS — 2 passed. |
| `learner-progress` | PASS — 2 passed. |
| `template-validation` | PASS — 2 passed. |
| `imported-text-safe` | PASS — 2 passed. |
| `teacher-draft-recovery` | PASS — 2 passed. |

The landing page, composer, packet, legal pages, and README were checked
against this inventory. Public statements about offline use, self-contained
downloads, local storage, sample isolation, printing, templates, validation,
safe imported text, learner progress, and draft recovery are covered.
**Untested claim count: 0.**

## Invalid, boundary, and recovery paths

- PASS — an empty title and no activities produced a focused error summary
  with links to both problems and prevented download.
- PASS — minute inputs `0` and `301` became `1` and `300`, with exact visible
  explanations and matching preview output.
- PASS — malformed JSON used a plain recovery message. Unsupported versions,
  unsupported activity types, 21 activities, 21 items, and a 200,001-byte file
  were rejected. Text over the supported title length was bounded.
- PASS — imported handler strings stayed inert in the preview and downloaded
  packet. Valid JSON templates downloaded and re-imported.
- PASS — canceling **Start over** preserved work. Corrupt saved JSON recovered
  to the starter lesson without a page error.
- PASS — forced local-storage write failure showed “Draft could not be saved”
  and still allowed `still-exportable.html` to download.
- PASS — learner progress survived reload only when enabled and was cleared by
  the learner’s clear action.

## Accessibility, routes, privacy, and offline behavior

- PASS — Playwright axe scans returned zero violations on root, demo, Privacy,
  Terms, and the designed 404. The manual touch-target finding above is not an
  axe rule result.
- PASS — `/opt/fleet/lib/verify-url.sh` passed root, demo, Privacy, and Terms:
  correct title, `lang=en`, one h1, main landmark, alt text, labeled buttons,
  and no console errors.
- PASS — skip links focused `MAIN` on all four normal routes and the 404. Main
  navigation stayed consistent and route titles were distinct.
- PASS — the deliberate unknown route returned HTTP 404 with the product-styled
  `Page not found` page, one h1, one main landmark, navigation, and a return
  action. This expected 404 is not a defect.
- PASS — keyboard tests covered reorder, removal, import focus, validation
  focus, learner controls, and downloads. Reduced-motion mode matched and
  reduced transitions and animation to effectively instant states.
- PASS — the active service worker completed an update check. A controlled
  sample then reloaded offline with its title, activities, styles, script, and
  offline message intact.
- PASS — live CSP, no-referrer policy, permissions policy, SAMEORIGIN, nosniff,
  immutable hashed assets, and `no-cache` service-worker policy match the
  committed configuration.

Fresh Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
100, SEO 100; LCP 1.066 s, TBT 0 ms, CLS 0. Lighthouse wrote complete valid
JSON before the worker’s known post-report Chromium tab-crash message.

## Earlier finding disposition

| Earlier item | Current evidence |
| --- | --- |
| Reorder/removal lost focus | Passing desktop and phone regressions focus the new useful control. |
| Import showed focus on Start over | Passing regression shows focus on the visible Import template control. |
| Cache/security policy was missing live | Live root, asset, service-worker, and 404 headers now match policy. |
| Live Lighthouse was below 90 | Fresh mobile score is 100. |
| Time input silently differed from output | Live boundary checks show the normalized value and explanation. |
| Malformed JSON exposed parser jargon | Live message gives a plain recovery step. |
| Preview main lacked a unique name | Current preview has `aria-label="Lesson packet"`; axe is clean. |
| Skip link did not focus main | Live checks focus `MAIN` on root, legal pages, and 404. |
| Phone demo controls scrolled away | Fresh phone check keeps the full banner in the viewport. |
| Demo reused the landing title | Live demo title is `Demo — Lesson Packet`. |
| Three claims were unlisted | Ten exact claim commands now cover all three and pass. |
| Header navigation differed by route | All checked pages show Demo, How it works, Make a packet, Privacy. |
| Route headings used mood copy | Terms and 404 now use direct job headings. |
| First-action details were 13 px | Passing regression measures at least 16 px. |

All earlier findings remain repaired. The phone Demo-link width is a new
finding from this strict review.

## Applicability

This is a static product. It has no backend, tenant data, database, health
endpoint, rate-limited API, account, payment flow, CLI, library, or installed
desktop artifact. Tenant isolation, restart persistence, 429/Retry-After, and
clean-consumer package checks do not apply. The brief explicitly excludes AI
lesson generation, so no useful AI step is missing from the scoped job.

## Evidence

- `/work/.evidence/review-1/desktop-first-screen.png`
- `/work/.evidence/review-1/desktop-demo.png`
- `/work/.evidence/review-1/phone-first-screen.png`
- `/work/.evidence/review-1/phone-demo.png`
- `/work/.evidence/review-1/verify-root/verify.json` (plus demo, Privacy, and
  Terms directories)
- `/work/.evidence/review-1/lighthouse.json`

No product code was changed during this review.
