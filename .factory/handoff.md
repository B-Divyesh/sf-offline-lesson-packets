# Verify teachers can make one offline lesson packet — handoff

Work order: `offline-lesson-packets-verify-2`

Completed: 2026-09-05 UTC

Implementation and documentation baseline:
`545d9f0ba4e8fcf9233709dfdd0593e82cf6d987`

Live URL: <https://offline-lesson-packets.sociobot.in/>

## Result

**FAIL — 7 findings and 3 untested public claims.**

The main workflow, all seven declared claims, deployment parity, offline reload,
sample isolation, prior repairs, security headers, bundle budgets, and three
fresh Lighthouse runs pass. Acceptance is blocked by the findings documented
in `.factory/verification-2.md`.

## Findings to repair

1. High: Skip to main content changes the hash but sends focus to `BODY`.
2. Medium: the demo label and its reset/exit controls scroll away on a phone.
3. Medium: `/?demo=1` keeps the landing-page title instead of a demo title.
4. Medium: three public promises lack exact declared claim tests: full template
   validation, imported-text HTML safety, and teacher-draft refresh recovery.
5. Low: header navigation is not consistent across root, legal, and 404 pages.
6. Low: Terms and 404 include mood/metaphor section kickers.
7. Low: the first-action explanation and facts render at 13 CSS px instead of
   the required 16 px body-text baseline.

## Verification completed

- Fresh clone at the requested candidate; `npm ci` found 0 vulnerabilities.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` passed.
- Full suite: 9 unit tests, 29 browser tests passed, 3 intended project skips.
- Every exact command in `.factory/claims.json` passed separately.
- Fresh 1440×1000 desktop and 390×844 phone browser flows exercised the first
  screen, demo, reset, exit to real work, normal export, invalid input,
  boundaries, storage failure, corrupt storage, keyboard focus, reduced motion,
  legal pages, the designed 404, and offline reload.
- Demo changes used only `demo:lesson-packet:teacher-draft:v1`; a seeded real
  draft was unchanged and restored by Start for real.
- Live root, demo, privacy, terms, 404, and mobile demo axe scans had zero
  violations. Worker `verify-url.sh` passed all 200 routes.
- Live root/legal/404 security headers, asset caching, and service-worker
  no-cache policy match the repository.
- Twelve representative live files, including the 404 body and hashed assets,
  match the candidate build byte for byte.
- Lighthouse live runs: 100/100/100/100 each; LCP 1.056/1.052/1.015 s,
  TBT 35.5/0.5/0 ms, CLS 0.
- All seven findings from `.factory/verification.md` have direct passing
  regression evidence.

## Run the same checks

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm test
```

Then run each exact command in `.factory/claims.json`. Open `/` and `/?demo=1`
in fresh desktop and 390×844 contexts. The detailed reproduction, evidence,
claim table, and earlier-finding disposition are in
`.factory/verification-2.md`.

## Handoff files

- Repository report: `.factory/verification-2.md`
- Required report copy: `/work/.evidence/qa-report.md`
- Machine result: `/work/.evidence/qa-result.json`

No product code was modified. A repair pass should address every finding and
add the three missing declared claim tests before another verification.
