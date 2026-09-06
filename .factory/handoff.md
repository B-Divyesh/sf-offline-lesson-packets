# Lesson Packet repair handoff

Work order: `offline-lesson-packets-repair-3`

Completed: 2026-09-06 UTC

Implementation SHA: `ad04d5a77c7cbda2aa166ac7aa875f441d15e826`

Verification documentation SHA: `99327648d6eaf78048ad2c4ad13c179211302ead`

Documentation baseline: `173987e9e823c65d87cbdee7171a0a276046e5ee`

Live URL: <https://offline-lesson-packets.sociobot.in/>

## Result

**PASS — no known product findings or untested public claims.**

Lesson Packet helps teachers make one small activity, reflection, and exit
check as a standalone file. It remains free, local-first, and usable offline.

The strict-review finding is repaired at its cause: every primary header link
now has a minimum `44 × 44` CSS-pixel interactive box. The production **Demo**
link measures `44 × 44` on a 390×844 phone and `44.45 × 44` on the checked
desktop viewport. A mobile Playwright regression measures all four primary-nav
links, so short labels cannot regress below the required touch target.

## What changed

- Added `min-width: 44px` and centered link content in the shared primary-nav
  link rule. The existing 44px minimum height remains in place.
- Added an outcome-based mobile browser test that measures each primary-nav
  link's rendered width and height at 390×844.

## Verification

From a new clone of `origin/main` at the implementation SHA:

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm test
```

All commands passed. `npm test` passed 9 unit tests and 45 browser tests with
5 intentional cross-project skips. The production build contains `dist/index.html`.

Every exact command in `.factory/claims.json` was then run separately from that
same clean clone. All ten claims passed: offline reload, standalone response,
free sample, local-only isolation, printing, template round-trip, learner
progress, template validation, safe imported text, and teacher-draft recovery.

The committed static build was deployed to the product's Azure Static Web Apps
production application. The custom HTTPS origin now byte-matches all 22
published build files; deployment configuration files `_headers` and
`staticwebapp.config.json` are intentionally not public files.

Fresh live checks:

- `/opt/fleet/lib/verify-url.sh` passed root, demo, Privacy, and Terms with
  correct titles, `lang=en`, one h1, a main landmark, alt text, labelled
  buttons, and no console errors.
- Fresh desktop and 390×844 phone contexts read the job, audience, and
  **Try it with sample data** action before scrolling. Both opened the
  populated “Notice, wonder, connect” sample with two activity blocks.
- In both fresh contexts, the sample banner stayed in view after scrolling,
  reset restored the sample, the separate real-draft key stayed unchanged,
  and no off-origin request or console error occurred.
- Axe returned zero violations on root, demo, Privacy, Terms, and the designed
  404. The unknown route returned the expected HTTP 404 with one h1 and one
  main landmark.
- A service-worker-controlled demo reloaded offline with its title, sample
  lesson, activity blocks, and offline message intact.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.2 s, TBT 30 ms, CLS 0. The newest Lighthouse
  CLI could not launch against the worker's supplied Chromium; the compatible
  pinned version was used with explicit headless flags.

## Earlier findings

All earlier findings recorded in `.factory/verification.md`,
`.factory/verification-2.md`, `.factory/verification-3.md`, and
`.factory/review-1.md` remain repaired. The clean full browser suite and fresh
live checks cover the earlier keyboard-focus, import-focus, cache/header,
performance, time-boundary, malformed-template, landmark-name, skip-link,
phone-banner, demo-title, claims-inventory, route-navigation, plain-heading,
and body-text-baseline findings.

## Known gaps and next steps

No product gap remains. This is intentionally a free static tool: there is no
backend, account, payment offer, billing dependency, or AI generation feature
in the researched scope. Future changes should retain the rendered touch-target
test and re-run every declared claim command from a clean checkout.
