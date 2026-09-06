# Lesson Packet repair handoff

Work order: `offline-lesson-packets-repair-2`
Completed: 2026-09-06 UTC

Implementation commit: `a015482f28f0182e54688100dc30d0df6d51d64f`
Documentation: this handoff is a later report-only change; it does not alter
the deployed product implementation.

Live URL: <https://offline-lesson-packets.sociobot.in/>

## Result

**PASS.** Teachers can build and download one self-contained lesson packet,
and the one-click sample remains isolated from real work. The seven findings
and three missing public claims from `verification-2.md` are repaired.

## What changed

- Skip links now move keyboard focus to the main landmark on the landing,
  Privacy, Terms, and 404 pages.
- The demo banner remains sticky on a 390px phone and keeps its sample label,
  **Reset demo**, and **Start for real** controls visible while editing.
- `/?demo=1` sets the route title to `Demo — Lesson Packet`.
- The same four primary links now appear in every header: Demo, How it works,
  Make a packet, and Privacy.
- Terms, Privacy, the 404 page, and the landing process copy now use direct
  labels instead of mood or metaphor headings.
- The first-action explanation and the three facts now use 16px body text and
  separate plain lines: Free, No account, and Stays on this device.
- Added three declared, outcome-based browser claims for template validation,
  imported-text HTML safety, and recovery after an accidental refresh.
- Updated the catalog description, demo documentation, copy audit, version
  display, and build-budget test so they reflect the shipped app.

## Finding disposition

| Prior finding | Current evidence |
| --- | --- |
| Skip link left focus on `BODY` | Browser regression covers all four routes; fresh live desktop and phone both focused `MAIN`. |
| Phone demo label scrolled away | Mobile regression scrolls to the preview and confirms the full banner remains in view. |
| Demo kept landing title | Demo claim checks the exact `Demo — Lesson Packet` title locally; live URL reports the same title. |
| Template validation promise unlisted | `@claim:template-validation` imports malformed shape/type/count cases and an over-limit title. |
| Imported text safety promise unlisted | `@claim:imported-text-safe` proves literal preview text, no image/dialog, and escaped download. |
| Teacher-draft refresh promise unlisted | `@claim:teacher-draft-recovery` edits, waits for save, reloads, and restores the demo draft. |
| Header changed between routes | Browser regression reads the same four primary links on root, legal routes, and 404. |
| Terms and 404 used mood headings | Removed; the 404 heading is `Page not found`. |
| First-action details were 13px | Browser regression checks the visible first-action details at 16px or greater. |

The seven older findings recorded in `.factory/verification.md` remain
repaired: activity focus restoration, truthful import focus, deployment
headers/cache policy, live performance, time-boundary feedback, teacher-facing
JSON errors, and the preview landmark name all pass the full suite.

## Verification

From the documented clean setup:

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm test
```

All commands pass. `npm test` reports 9 unit tests and 44 browser tests passed
with 4 intended project skips. The final production build creates `dist/` with
an initial application JavaScript total of 27.25 KB raw / 9.81 KB gzip and CSS
of 14.79 KB raw / 4.14 KB gzip.

Every exact command in `.factory/claims.json` passed after `npm ci`:

```sh
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:standalone-response
npm run test:e2e -- --grep @claim:free-demo
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:print-packet
npm run test:e2e -- --grep @claim:template-roundtrip
npm run test:e2e -- --grep @claim:learner-progress
npm run test:e2e -- --grep @claim:template-validation
npm run test:e2e -- --grep @claim:imported-text-safe
npm run test:e2e -- --grep @claim:teacher-draft-recovery
```

The local and live worker URL checks pass for root, demo, Privacy, and Terms:
each has a title, `lang="en"`, one `<h1>`, a main landmark, alt text, and no
browser console errors. Playwright axe checks find no serious or critical
violations on root, demo, Privacy, Terms, and 404.

Fresh live desktop (1440×1000) and phone (390×844) checks found, before
scrolling:

- Job: make one lesson packet that works offline.
- Audience: teachers building an activity, reflection, and exit check for
  learners.
- First action: **Try it with sample data**, which opens a ready-made lesson.

Both live contexts loaded the realistic “Notice, wonder, connect” sample,
kept the banner visible at the preview, stored a demo edit only in the
`demo:` namespace, reset to the sample, and restored the separate “Private
real draft” after **Start for real**. Both had no console errors and placed
skip-link focus on `MAIN`.

The live unknown route returns the expected HTTP 404 with the designed
`Page not found` page, its own title, main landmark, navigation, and way home.
This expected status is not a defect.

Live Lighthouse mobile retry: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; LCP 920 ms, TBT 29 ms, CLS 0. The first run emitted the
known post-report Chromium tab crash despite complete 100 scores; the retry
with the bundled headless shell completed cleanly. Evidence is in
`/work/.evidence/repair-lighthouse-live-retry.json`.

Deployment used `/opt/fleet/lib/deploy-static.sh offline-lesson-packets dist`.
It reused the existing `sf-offline-lesson-packets` static site and its durable
configuration. The HTTPS origin now serves `v1.0.2`, the new sample facts, the
existing CSP/referrer/permissions/frame headers, and `no-cache` for `sw.js`.

## Evidence

- `/work/.evidence/repair-live-root/verify.json`
- `/work/.evidence/repair-live-demo/verify.json`
- `/work/.evidence/repair-live-privacy/verify.json`
- `/work/.evidence/repair-live-terms/verify.json`
- `/work/.evidence/repair-live-desktop-first.png`
- `/work/.evidence/repair-live-desktop-demo.png`
- `/work/.evidence/repair-live-phone-first.png`
- `/work/.evidence/repair-live-phone-demo.png`
- `/work/.evidence/repair-lighthouse-live-retry.json`
- `/work/.evidence/catalog-description.txt`

## Known gaps and next steps

There are no known product gaps in this repair. The researched brief is free;
there is no paid offer, checkout, backend, account, or external AI feature to
register or verify. No backend health, tenancy, rate-limit, CLI, library, or
desktop-artifact check applies to this static web product.
