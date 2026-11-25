# TCH — Technology for Caregivers at Home

TCH is a **React Native / TypeScript caregiver-coordination prototype** originally built for WVU SENG 564 (Software Engineering of Mobile Applications). This repository is a portfolio-safe snapshot of that classroom MVP and the starting point for continued product engineering.

> **Current boundary:** TCH is a prototype. It is not a production healthcare system, does not claim HIPAA compliance, and does not currently provide production authentication, cloud synchronization, or live EHR integration.

## What the MVP demonstrates

- child-centered care dashboard and daily care-flow status
- structured logging for feeding, medication, diaper/toileting, sleep, vitals, and notes
- configurable event timestamps
- persistent local event history with `AsyncStorage`
- activity timeline and care-calendar views
- responsive phone/tablet layouts
- product roadmap and tier concepts for future releases

All data committed to this repository is **synthetic demonstration data**. Personal demo data and images from the classroom build are intentionally excluded.

## Screenshots

| Home care flow | Quick actions |
| --- | --- |
| ![TCH home care flow](docs/screenshots/home-care-flow.jpg) | ![TCH quick actions](docs/screenshots/quick-actions.jpg) |

| Log care | Activity history |
| --- | --- |
| ![TCH log care form](docs/screenshots/log-care.jpg) | ![TCH activity history](docs/screenshots/activity-history.jpg) |

### Product roadmap

![TCH product roadmap](docs/screenshots/roadmap.jpg)

## Tech stack

- React Native 0.86
- Expo SDK 57 / Expo Router
- TypeScript
- React 19
- AsyncStorage
- React Native Community DateTimePicker
- React Native Reanimated

## Run locally

Requirements: Node.js 24 LTS and npm. The preview candidate is validated with Node 24.21.0; CI uses Node 24 and installs from the lockfile. Expo Go or a simulator/emulator can be used for compatible developer walkthroughs.

```bash
npm ci
npm start
```

Useful commands:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
```

## Testing

Run the unit tests with one command:

```bash
npm test -- --runInBand
```

The Jest suite uses the `jest-expo` preset and covers date formatting, date shifting, legacy UTC-to-local date normalization, and the care-event persistence boundary. Date-normalization tests control the clock and simulate local calendar dates so they are independent of the machine's timezone. Persistence tests mock AsyncStorage and cover missing data, saved and empty event lists, serialization, malformed JSON, and storage read/write failures.

Profile and feature tests also cover alias validation, first-run/returning-user setup, storage retries, serialized event writes and protection against stale refreshes overwriting unsaved changes.

Run TypeScript checking separately with `npm run typecheck`. GitHub Actions runs type-checking, `npm test -- --ci --runInBand`, and Java API verification on pushes to `main` and pull requests.

## Family walkthrough milestone

### Version 2 account/profile increment

The new **Caregiver account preview** connects to a local Java 21 service for test-account registration/sign-in, creating/editing one child with starting details, and an optional protected photo. The child profile reloads after signing out/in. This is local synthetic development: caregiver invitations, shared care-event logging and a hosted service remain unfinished. Existing offline care history is kept separate and is not uploaded.

Run `.\scripts\run-server.ps1` in one PowerShell terminal and `npm run web -- --port 8083` in another. Java 21 is required; the helper uses the project-local portable JDK if available. Open `http://localhost:8083/` and choose **Caregiver account preview**. See [`server/README.md`](server/README.md) for setup, the test workflow and session/photo limits, and [ADR 0001](docs/decisions/0001-java-account-profile-increment.md) for the Java decision and its tradeoffs.

Run API tests with `.\scripts\run-server.ps1 -Task test` or the Maven wrapper in `server/`. CI checks both the Java API and the TypeScript/Jest app. Phone installation and native session/photo testing remain separate gates.

See the [November 25 validation record](docs/ACCOUNT-PROFILE-VALIDATION-2026-11-25.md) for the 109 app tests, 17 Java tests, browser/HTTP walkthrough, unresolved dependency findings and remaining beta work.

### Offline demo

Choose **Open offline care demo** to use the device-local walkthrough. On first launch, a lightweight setup screen saves a synthetic child alias and two caregiver aliases locally. Returning demo users resume without repeating setup. Existing event history is preserved. Feeding and medication defaults come from the typed demo profile configuration in `src/data/demoCarePlan.ts`.

This is a demo walkthrough foundation, with one profile per device. Accounts, shared-care sync and real-data readiness remain future work. See [`docs/FAMILY-TESTING.md`](docs/FAMILY-TESTING.md) for the test script and remaining beta gates. Use fictional aliases and events only.

The planned device builds target both iPhone and Android using the internal `preview` profile in `eas.json`. Builds have not been produced yet; see [`docs/BETA-DISTRIBUTION.md`](docs/BETA-DISTRIBUTION.md) for account/signing prerequisites and device checks. Care-history failures now show a retry prompt. Keep the app open while saving or retrying unsaved changes.

The internal build is labeled **TCH Demo**, with demo-only identifiers and explicit local build versions. See the [`October 27 preview candidate`](docs/PREVIEW-CANDIDATE-2026-10-27.md) for validated build preparation and the dependency advisories that remain open.

## Epic / MyChart integration track

The first integration increment is a read-only Epic sandbox adapter, separate from the demo app and local care-event storage. Run `npm run check:epic-sandbox` to check public R4/SMART metadata without credentials. This is a network diagnostic and is separate from offline unit tests. Patient login and authorized record retrieval are not connected yet; they require app registration and the login/callback implementation. See [`docs/EPIC-INTEGRATION.md`](docs/EPIC-INTEGRATION.md) and the draft [`shared-care design`](docs/SHARED-CARE-DESIGN.md).

## Current architecture

Web shares the mobile-first care screens and bottom navigation, with additional spacing at tablet/desktop widths. It uses a browser time input and web dialogs alongside the native controls on iOS/Android. See [`docs/STABILIZATION-REVIEW.md`](docs/STABILIZATION-REVIEW.md) for the latest review and validation results.

The classroom MVP intentionally optimized for shipping a working mobile prototype quickly. Most product behavior currently lives in `src/app/index.tsx`, including navigation state, care-event state, persistence, forms, calendar behavior, roadmap content, and styling.

That makes the current build easy to inspect as one artifact, but it is **not the target production architecture**. The next engineering phase is to split the prototype into smaller feature modules, reusable components, typed data/services, and testable state/persistence boundaries. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Data and security boundary

The MVP stores care events locally using AsyncStorage. AsyncStorage should not be treated as a production secure-health-data store. Before any real shared-care use, the project needs authentication/authorization, a secure backend and data model, encryption and secrets management, auditability, retention/deletion controls, and privacy/security review.

See [`docs/SECURITY-PRIVACY.md`](docs/SECURITY-PRIVACY.md).

## Roadmap

Near-term engineering priorities:

1. modularize the current single-screen prototype
2. add component/service tests and stronger CI
3. create configurable onboarding and demo profiles
4. design authenticated shared-care data flow
5. add a secure cloud persistence layer only after the security model is defined
6. validate the product with a small closed beta before expanding scope

Later concepts shown in the prototype—such as EHR/FHIR integration, connected devices, and AI-assisted coordination—are roadmap ideas, not implemented production capabilities.

## Repository status

This repository begins with a **sanitized snapshot** of the completed SENG 564 prototype. Personal demo data/images and unused Expo starter-route assets were removed without changing the core care-tracking feature logic. The original academic ZIP remains unchanged outside this repository. Future changes will use issues, branches, pull requests, and CI so the Git history documents the engineering progression from classroom MVP to a maintainable product.

## Author

**Avery Holmes**  
M.S. Software Engineering candidate, West Virginia University
