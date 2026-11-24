# Internal preview candidate — October 27, 2026

This candidate prepares the synthetic-data family walkthrough for its first Android installation test. It is not a production release. All changes remain local on `codex/issue-4-demo-onboarding`; no commit, push, cloud project creation, source upload or signed build has been performed.

## Build identity and reproducibility

| Setting | Candidate value |
| --- | --- |
| App label | TCH Demo |
| Android application ID | `com.averyholmes.tch.demo` |
| iOS bundle identifier | `com.averyholmes.tch.demo` |
| User-facing version | `1.0.0` |
| Android versionCode / iOS buildNumber | `1` / `1` |
| Distribution profile | `preview`, internal APK / physical-device iOS |
| Node | `24.21.0` in EAS; Node 24 in CI |
| Version source | Local app config; no remote auto-increment |
| Expo | SDK 57, package `57.0.31` |

Aligned the seven flagged SDK packages to Expo's recommended patch versions, including the resolved `expo-constants` patch in the lockfile. Expo compatibility validation passes. The installer also added the `expo-splash-screen` config plugin. No SDK-major upgrade was performed.

CI now installs from the lockfile using `npm ci`, with npm caching and Node 24. A clean local `npm ci --no-audit --no-fund` completed successfully. Generated `dist` output and native folders are excluded from TypeScript; Jest ignores generated `dist` modules/tests to avoid duplicate-package discovery during archive inspection.

## Validation performed

- 89 tests across eight Jest suites pass after the clean SDK patch installation.
- TypeScript and Git diff whitespace checks pass.
- Local iOS, Android and web JavaScript exports succeed with bytecode disabled.
- An isolated Android native prebuild succeeds without changing the repository's native folders. Generated Gradle settings contain the expected application ID, versionCode and versionName; the generated app label is TCH Demo.
- External-storage read/write and system-overlay permissions are blocked for this demo. The generated manifest contains the corresponding removal directives. Final merged APK permissions still require build inspection.
- EAS's local upload-copy inspection succeeds. The inspected copy contains 32 files and no Git history, test sources, documentation, environment files, local tool directories or signing files. `.easignore` retains the repository's existing exclusion rules and adds build-specific exclusions.
- Android compilation, signing, APK installation and physical-device testing have not yet been performed. iOS native generation/building was not validated on this Windows host; the iOS JavaScript bundle was validated.

The inspection copies are outside the source tree in the local visualization workspace, not committed to the repository. Generated Android signing configuration in that disposable prebuild is the template's development configuration; no production signing credential has been created.

## Open dependency advisories

`npm audit` reports six package flags representing two root advisories:

| Advisory | Dependency path and assessment | Follow-up |
| --- | --- | --- |
| [Zod resource exhaustion](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | `expo` → `@expo/cli` → `zod@3.25.76`; build/development tooling dependency | Track a compatible upstream CLI fix or review a supported SDK migration. Patched Zod 4 is outside the CLI's declared Zod 3 range. |
| [URI decoding denial of service](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | `expo-router` → `query-string@7.1.3` → `decode-uri-component@0.2.2`; routing dependency | Review compatible upstream remediation before broader distribution. Patched `0.5.0` is ESM, while this consumer requires the old CommonJS API; no blind override was applied. |

These findings remain open. The audit's suggested fixes include cross-major package changes, so no `npm audit fix --force` or untested override was applied. Internal synthetic QA build approval is separate from family sharing or a public release decision.

## Next external steps

1. Avery selects the owning Expo namespace: `aiholmes` or `aiholmess-team`. CLI sign-in and ownership of both namespaces were confirmed.
2. With approval, create/link the `tch-caregiver-app` EAS project in the selected namespace and save the resulting project ID in app config.
3. With approval, configure Android signing and upload the reviewed source to EAS Build using `preview`. This may consume the account's build allowance. No paid purchase or store submission is part of the proposed step.
4. Install the resulting APK for Avery's synthetic-data smoke test. Record startup, profile setup, time selection, logging, restart/persistence and permission behavior before sharing with family testers.
5. Keep iPhone as a target; the planned ad hoc build still needs paid Apple Developer membership and registered devices.

Neither app accounts/shared-care sync nor live Epic/MyChart connectivity is implemented by this build preparation.
