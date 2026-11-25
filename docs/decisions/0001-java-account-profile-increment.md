# ADR 0001: Java service for the first account/profile increment

Date: 2026-11-25. Status: accepted for local synthetic development; hosting and production identity decisions remain open. Related: GitHub #5, #6, #13 and #16.

## Context

The local React Native demo associates care events with editable caregiver labels. It has no authenticated identity or cross-device data authority. Version 2 of the product roadmap requires accounts, server-side permissions and synchronization. Avery is learning Java; the app's TypeScript interface can evolve independently behind an API boundary.

## Decision

Add `server/`, a Java 21 / Spring Boot service, rather than embedding accounts into AsyncStorage. Use Spring Security's existing session/login, CSRF and password-hashing mechanisms. Do not invent a token-signing scheme or put credentials into the mobile care-event repository. The first increment is create account → sign in → create/edit one owned child → manage an optional private photo → sign out/in and reload.

Use JDBC with a file-backed H2 database for an easy, durable local walkthrough. Keep owner-scoped queries explicit and independently testable. Use a unique owner constraint to enforce the one-child scope on the server. This does not model care-circle membership yet; a later migration must replace exclusive ownership with authorized memberships while retaining ownership authority.

Store bounded normalized image bytes alongside the local child row for this increment. This makes the ownership check atomic with the database boundary and avoids a public bucket/URL. A hosted design must assess protected object storage, access policy, encryption, retention, metadata handling and backups rather than extrapolating the local BLOB design to production.

Keep the account preview separate from the offline demo. Do not upload legacy history or reinterpret a typed caregiver label as an authenticated author. A new child starts without sample clinical instructions or fabricated care events. Select optional basic profile fields now; detailed medication/feeding plan configuration remains separate work.

## Tradeoffs and limits

- Server-side sessions provide revocation/logout without client token persistence. Browser CSRF and cookie behavior need explicit tests. Native cookie/session behavior remains a device-validation gate; a future hosted/native identity design may use a managed OIDC provider instead.
- Local account registration is useful for synthetic integration testing. Email verification, password recovery, enrollment abuse protection, persistent/distributed session policy and account lifecycle remain unimplemented. This is not a public identity service.
- H2 avoids requiring Docker/PostgreSQL before a local walkthrough but has no production encryption/backup/availability guarantees here. No real sensitive data belongs in it.
- The existing care-event engine remains local. Membership, invites, shared event APIs, idempotency and conflicts must be completed before calling this shared care.
- One child per account keeps this increment small. This is not a limit selected for the eventual product's multi-child care circles.
- No service is deployed and no account-enabled native build is distributed by this change.

## Evidence and learning connection

API integration tests exercise password hashing, session rotation, CSRF, sign-out, profile persistence across sign-in sessions, invalid fields, one-child enforcement, stale revisions, CORS and cross-account profile/photo isolation. Separate tests cover image limits and throttle expiry. App tests cover failed reads/saves and clearing private information on expiry/sign-out.

Java refresher connections: `main()` starts the service; helper methods accept parameters and return values; `validate(...)` is a `void` method; controller methods compose validation, storage and response building. Records, constructors, dependency injection and framework security are later learning topics, not prerequisites for Avery to operate the demo.

Primary references: [Spring Security session management](https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/session-management.html), [CSRF protection](https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html), [password storage](https://docs.spring.io/spring-security/reference/6.5/features/authentication/password-storage.html), [Expo image picker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/).
