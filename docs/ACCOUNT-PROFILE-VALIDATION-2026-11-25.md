# Account/profile increment validation — November 25, 2026

Scope: GitHub #16, Version 2 account and private child onboarding. Built on the preserved demo foundation in PR #17. This records observed results, not a real-data or shared-family release approval.

## Implemented

- Separate account preview and offline care-demo entry points; no automatic migration/upload of old device history.
- Local Java 21 / Spring Boot 3.5.16 service using Spring Security sessions, BCrypt, session rotation, CSRF, explicit CORS and owner-scoped database access.
- Account registration/sign-in/sign-out; one owned child with editable display name, optional birth date, timezone and starting notes.
- Private JPEG/PNG upload/read/replace/remove with byte/pixel limits and metadata removal. No public photo URL; responses disable caching.
- File-backed development database, ignored by Git/EAS. Sessions are in memory; profiles survive sign-out and service restarts by design. A full restart/restore drill remains a separate test.
- Java and app CI jobs. Standard checksum-pinned Maven wrapper and Windows startup/test helper.

## Automated/local checks

| Check | Result |
| --- | --- |
| TypeScript | Pass |
| Jest | 109 tests across 11 suites pass |
| Maven verify | 17 Java tests pass; executable service JAR produced |
| Java authorization/session tests | Anonymous access, CSRF, hash storage, session rotation/logout, cross-account child/photo isolation, one-child constraint and stale revisions pass |
| Photo/throttle checks | Invalid/spoofed/oversized/dimension-heavy images and throttle expiry covered |
| App recovery | Failed profile loads do not enroll another child; failed saves retain fields; sign-out/expiry clear private views |
| Browser-picker regression | Cancellation starts no upload; invalid files rejected; valid selection can be repeated |
| Expo SDK compatibility | Pass after compatible SDK 57 patch alignment |
| Android, iOS, web JavaScript exports | Pass, bytecode disabled; not native compilation/install validation |
| Git whitespace validation | Pass |

## Interactive and real HTTP observations

Using fictional account/profile details and a generated geometric PNG:

1. Browser registration completes and returns to sign-in without retaining the typed password.
2. Sign-in opens empty child onboarding. Creating a fictional child saves display name, birth date, timezone and starting notes.
3. Signing in again restores the saved profile. No sample medication/feeding instructions or seeded events are enrolled.
4. Real HTTP multipart upload returns 204; authenticated photo retrieval returns PNG bytes with `Cache-Control: no-store`.
5. The browser reloads and displays the private photo. Browser sign-out clears child details; signing back in restores both profile and photo.
6. Real HTTP logout returns 204; subsequent private access returns 401.

The browser automation file chooser was interrupted. Investigation identified that awaiting a browser picker could leave the parent busy after cancellation; the web implementation now uses a file input and only starts uploading once selection succeeds. The revised web selection is regression-tested, and server upload plus browser photo display are verified separately. A complete manual selection/upload/cancel cycle remains a device/browser QA item; it is not recorded as passed here.

## Dependency findings

Compatible patch alignment and non-breaking audit fixes reduced the current npm audit from 12 package flags to 6 (3 high, 3 moderate). Two dependency families remain: `decode-uri-component` through router/query-string, and `minimatch` through Expo fingerprinting. See GitHub #19 for current advisories and remediation criteria. The older Zod finding no longer appears in the current report. No forced SDK-major change or untested override was applied; this is not a full dependency/security audit of the Java service.

## Still required for the requested beta

- GitHub #18: care-circle invitations/membership, roles and a shared care-event API/timeline with trustworthy authorship, retries and conflict handling.
- Verified enrollment/password recovery, appropriate audit/account lifecycle, backup/restore/deletion and deployment controls.
- A reviewed reachable HTTPS service and physical iPhone/Android session/photo tests. The loopback default cannot serve family phones.
- Resolve/review dependency findings; complete the privacy/security and real-data release gates in #6/#13.
- Signed builds, installation/upgrade/accessibility checks and tester feedback.

No cloud service, external identity account, signed phone build or store submission was created by this increment. Existing draft PRs #10 and #15 are preserved. Main is not merged or modified by the feature work.
