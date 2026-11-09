# HMG-Studio session-security foundation implementation plan

> Execute inline with `superpowers:executing-plans`, TDD and a final independent review. No commits, pushes, builds, dev-server starts or deployment. The complete app remains governed by the supplied phased plan.

**Goal:** Remove browser API-key exposure and make the existing shell use verified native session authentication and access control before business modules are added.

**Spec:** [PROJECT_SPEC.md](PROJECT_SPEC.md), [architecture](development-pack/01_ARCHITECTURE_TARUVI_PYTHON.md), modules 31/32, [phase sequence](development-pack/02_EXECUTION_PLAN.md).

**Architecture:** Extend the existing SDK singleton/providers and Refine route guards. Preserve native hosted sign-in and notifications. Do not introduce identity tables, a proxy credential, a Python deployment or new business persistence.

**Review focus:** missing API key must not prevent session login; privileged key must never enter Vite defines/client config; 403 must not trigger a login loop; app/nav/settings must not fetch before authenticated boundary; SDK/provider manifest floors must retain session mode and permission semantics.

## Task 1: session-only client and test harness

- Modify `src/taruviClient.ts`: require URL/app slug only; initialize `Client` with explicit session auth and no key.
- Modify `vite.config.ts` and `src/vite-env.d.ts`: remove API-key browser definition/declaration, preserving logger behavior and public configuration.
- Modify `package.json`: align React/ReactDOM/types to installed React 18; require installed Taruvi session-compatible versions; add Vitest/test/typecheck commands and declared test dependencies without a blanket dependency upgrade.
- Create `vitest.config.ts`: independent node/jsdom harness, fake public config only, no loading `.env` or merging runtime Vite defines.
- Create `src/taruviClient.test.ts`: real SDK configuration has session auth, no key; missing public settings reject; no missing-key rejection; source/config regression rejects reintroduced key injection.
- [x] Add tests and observe the expected failure before production changes.
- [x] Implement the minimum fix; review for credential leakage before the green test run.
- [x] Run Vitest plus frontend/config TypeScript checks. A config inspection test is not a production bundle audit; build remains prohibited.

## Task 2: authenticated shell and access-control wiring

- Modify `src/App.tsx`: mount Navkit/settings inside the existing authenticated route boundary; connect exported `taruviAccessControlProvider`; retain login redirect and Refine notifications. Avoid a second auth or notifications system.
- Create `src/App.test.tsx`: test public/unauthenticated/loading/authenticated states using a controlled Refine auth boundary; assert protected Navkit/settings do not mount until authenticated, and access-control provider is passed to Refine. Tests may stub unrelated devtools/layout modules, not the code under test.
- Create `src/providers/refineProviders.test.ts`: installed provider's 403 handling returns an error without login/logout; unauthenticated check denies; no API key transmitted by client.
- [x] Observe failing integration assertions on the current shell.
- [x] Extend existing components minimally; security/duplication review before tests.
- [x] Run complete local test suite and TypeScript checks.
- [ ] Browser/readback if an approved running server and session are available; otherwise explicitly leave browser acceptance pending, not passed.

## Task 3: review and checkpoint

- [x] Fresh whole-change review; fix critical/important findings with regression tests.
- [x] Preserve the original pack; update working schema/capability ledger and parity ledger with evidence and exact resume action.
- [ ] Report local proof separately from native policy, fixture, transaction, browser, deployment and provider proof.

## Deliberate boundaries

This does not create functional business modules, replace deny policies, seed unapproved records, or claim tenant security from UI gates. Python validator execution establishes only that existing pure Python validation runs. Phase 0 remains incomplete for persistence contracts and full per-action file mapping. Resume Phase 1 identity/organization authorization before catalog writes.

## Final local checkpoint

21 tests pass; both TypeScript checks pass. Independent review findings fixed in one red/green pass. Additional regression files: `src/config-security.test.ts`, `src/test-config-security.test.ts`. Browser acceptance is pending and whole-app Phase 0/1 remain incomplete. See `VALIDATION_REPORT.md`.
