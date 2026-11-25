# Java account and child-profile increment

Local synthetic testing only. The service binds to `127.0.0.1:8090` and is not hosted. Use fictional names, email addresses, care notes and sample images. No invitations, shared events, email verification/recovery or production deployment are included yet.

## Run

Requires Java 21. The standard Maven wrapper downloads its pinned Maven distribution on first use and verifies its SHA-256 checksum. Maven Central access is needed to download dependencies. No global Maven installation is required.

From the repository root on Windows:

```powershell
.\scripts\run-server.ps1
```

The helper uses the ignored project-local JDK when present, otherwise your configured Java installation. It changes environment variables only for its process; it does not replace your system Java. On another machine, install/configure Java 21 first.

Or, from `server/`, with Java 21 configured:

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd verify
```

On macOS/Linux use `bash ./mvnw spring-boot:run` or `bash ./mvnw verify`. CI runs the latter with Java 21.

In another terminal, start the app from the repository root:

```powershell
npm ci
npm run web -- --port 8083
```

Open `http://localhost:8083/` (use this hostname, not `127.0.0.1`, for the configured browser origin). Choose **Caregiver account preview**. The default API address is `http://localhost:8090`. `EXPO_PUBLIC_BETA_API_URL` can select another HTTPS API origin; it is public client configuration, never a place for secrets. No hosted environment is configured by this increment.

## Walkthrough

1. Create a fictional caregiver account with a test-only passphrase of 15–64 characters. UTF-8 passwords must also fit BCrypt's 72-byte limit.
2. Sign in. Registration deliberately does not imply an authenticated session.
3. Enter a fictional child name, optional birth date (`YYYY-MM-DD`), timezone and optional starting notes. Save.
4. Add a sample JPEG/PNG under 3 MB and 8 megapixels, with neither dimension over 4096 pixels. Replace/remove it; try an invalid image to see rejection.
5. Edit starting details. Reload to verify server persistence. A stale revision is rejected rather than overwriting newer details.
6. Sign out and back in. The saved child and optional photo return. Browser refresh should also restore an unexpired session after entering the account preview.
7. Sign in as a second fictional account. It must not list, edit or retrieve the first account's child/photo. API integration tests exercise guessed-ID access as well.

**Open offline care demo** remains a separate device-local workflow. Its aliases, care events and sample clinical defaults are never enrolled into an account automatically. Account-created children have no seeded care events or prescribed care plan.

## Storage and sessions

The local H2 database lives in `server/.data/` when started from `server/`. It contains account password hashes, profiles and normalized PNG image bytes. It survives service restarts, is excluded from Git and EAS uploads, and is **not encrypted at rest**. There is no production backup/deletion system. Preserve this folder if you want to retain your fictional test profiles.

Authentication uses Spring Security's form-login/session mechanism, BCrypt hashing, session-ID rotation, HttpOnly/SameSite cookies and CSRF-protected mutations. The client stores neither passwords nor session tokens in AsyncStorage. Sessions expire after 30 minutes of inactivity and are lost when the service restarts; the accounts/profiles remain. Cookie `Secure` is enabled in base configuration and disabled only for loopback HTTP development. CORS accepts one explicit configured browser origin, with credentials; no wildcard origin is allowed.

Owner identity comes from the authenticated server principal. Every child/photo query includes the owner's ID. Incoming owner IDs and unknown JSON properties are rejected. Error responses do not contain passwords or request bodies. A bounded in-memory IP throttle limits local registration/sign-in attempts; restarting the service resets it. This is not distributed abuse protection.

Photos are decoded as JPEG/PNG with byte/pixel limits and re-encoded to PNG, discarding original metadata. They have no public URL and responses use `Cache-Control: no-store`. The app holds display bytes in memory and clears private views on sign-out/session expiry.

## Scope before a shared-family beta

This is a browser-validated local increment. Native code bundles can be checked independently; cookie/session lifecycle and photo picking still need physical iPhone/Android testing. On a physical phone, `localhost` points to that phone, so this default cannot connect to the development computer. A reviewed HTTPS deployment, reachable API configuration and native session validation are required before distributing account-enabled phone builds.

Next: care-circle membership/invitations, owner/contributor/viewer enforcement, shared events with server author attribution, conflict/retry rules, audit records, verified identity/recovery, data lifecycle/backup, qualified privacy/security review and signed device QA. The design does not assert real-data or HIPAA readiness.

See [the architecture decision](../docs/decisions/0001-java-account-profile-increment.md) and [shared-care requirements](../docs/SHARED-CARE-DESIGN.md).
