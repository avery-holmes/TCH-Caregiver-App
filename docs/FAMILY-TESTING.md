# Family walkthrough build

The next milestone is a small, synthetic-data walkthrough with family testers. It is separate from a real-data or shared-care beta. This file tracks local implementation and remaining release work for Issues #4, #5, #6, #11 and #13; it does not record a release approval.

## Current walkthrough scope

- One synthetic child profile per device, with two fictional caregiver aliases.
- First-run setup persists aliases locally. Returning users go straight to the care screens.
- The existing sample care plan remains synthetic; there is no clinical care-plan editor.
- Log care, review today's flow, and inspect history on the same device.
- Existing care events keep their original caregiver labels. Setup does not rename old events or clear history.
- No accounts, caregiver invitations, cross-device synchronization, or production backup/recovery.

## Release gates

| Gate | Current status | Owner / next action |
| --- | --- | --- |
| Configurable demo profile and first-run setup (#4) | Implemented locally; automated and web checks pass; device review pending | Avery: review changes and try setup on a device |
| Automated regression checks (#3) | 89 tests across eight suites and TypeScript pass locally, including browser time entry and the separate Epic sandbox adapter; CI already configured | Development: keep checks passing for each change |
| Storage errors and data-loss behavior | Profile and event failures have retry flows; serialized writes and stale-refresh protection pass regression tests; device validation pending | Development + Avery: validate retry flows on devices |
| Real-device navigation and accessibility (#11) | Pending | Avery: test iOS/Android and larger text; record findings |
| Distribution and install instructions (#6) | Demo identifiers configured; SDK patches aligned; upload inspection and Android prebuild pass; signed APK/project linking pending | Avery: choose Expo namespace and approve first cloud/signing step; paid Apple membership needed for iOS ad hoc builds |
| Feedback collection (#6) | Walkthrough script below; collection channel pending | Avery: choose testers and a private feedback channel |
| Auth, permissions and sync design (#5) | Draft in `SHARED-CARE-DESIGN.md`; implementation not started | Avery + development: review roles and data flow before cloud implementation |
| Privacy/security and real-data release (#13) | Blocked pending architecture and qualified review | Avery: coordinate review; no real sensitive data in this walkthrough |
| Backup, deletion and recovery expectations (#6) | Local prototype only; no recovery guarantee | Development: define and validate before real use |

Epic/MyChart work now has a parallel sandbox track in [`EPIC-INTEGRATION.md`](EPIC-INTEGRATION.md). Public endpoint discovery is verified; authorized patient access awaits account/app registration and login implementation. The family demo remains local-only.

## Walkthrough script

See [`BETA-DISTRIBUTION.md`](BETA-DISTRIBUTION.md) for account/signing requirements, install commands and the two-platform device test matrix.

Use fictional aliases, events and notes throughout. Do not enter a real child's identity or care details.

1. On a fresh install, keep the supplied aliases or enter fictional ones. Tap **Start demo**.
2. Confirm the child alias and sample care-plan details on Home.
3. Log a synthetic feeding, medication event and note. Confirm caregiver attribution and history.
4. Change dates in Activity and return to today. Check for clipped text and confusing navigation.
5. Wait until the saving indicator clears, then close and reopen the app. Confirm setup is skipped and aliases/history persist. If a save fails, keep the app open and use **Retry saving**; unsaved changes exist only in memory.
6. For an upgrade from an existing prototype installation, confirm old events remain after completing setup.
7. Record device/OS, steps, expected result and actual result for failures. Use screenshots containing only synthetic data.

Ask testers: Could you understand the latest care without an explanation? Could you log an event unaided? What information was missing at handoff? Which labels or controls were confusing?

Do not uninstall or clear app storage to troubleshoot an installation containing history you want to retain; recovery is not implemented.

## Local validation of the setup milestone

- The family-demo/storage and web stabilization work has 59 tests across seven suites, covering profiles, persistence, onboarding, recovery and browser time entry. The Epic adapter adds 30 tests: all 89 tests across eight suites pass.
- TypeScript and Git diff whitespace checks pass. No dependencies were added.
- Web preview: fictional aliases appear in the child header and sample-event attribution; reload skips setup and retains aliases.
- Web preview: a synthetic note is attributed to the configured caregiver and remains in Activity after reload.
- iOS and Android JavaScript bundles compile using Expo export with bytecode disabled. This does not validate native compilation, signing or installation.
- Physical iOS/Android testing, upgrade testing against an existing installation and distribution remain pending.
- The tests surface a non-blocking deprecation warning for React Native's `SafeAreaView`, also used by the existing app shell.

See [`STABILIZATION-REVIEW.md`](STABILIZATION-REVIEW.md) for the browser findings, fixes and remaining release checks.

The later [`October 27 preview candidate`](PREVIEW-CANDIDATE-2026-10-27.md) records native build preparation and the open dependency advisories to review before distribution.
