# Shared-care boundary: design draft

This is a reviewable design for Issue #5, not implemented cloud functionality. Requirements below define intended behavior. The local Java owner-only account/profile increment in Issue #16 is recorded in [ADR 0001](decisions/0001-java-account-profile-increment.md); it does not implement memberships, invitations or shared events. Hosted identity, database and deployment choices remain open. Epic sandbox experimentation is documented separately in `EPIC-INTEGRATION.md`.

## Identity and relationships

- Each authenticated person has an application user ID independent of a display name.
- Each care circle has explicit child and caregiver membership records with status and permissions. Membership is created by a verified, accepted invitation, not by typing a name.
- A caregiver can belong to more than one circle; each request identifies the circle and child being accessed.
- Proposed initial roles: circle owner, contributor and viewer. These are application roles; the owner label does not establish legal guardianship or authority to access clinical records.

## Proposed authorization rules

| Operation | Owner | Contributor | Viewer |
| --- | --- | --- | --- |
| Read authorized circle's care timeline | Yes | Yes | Yes |
| Add caregiver-entered care events | Yes | Yes | No |
| Invite/remove members and change roles | Yes | No | No |
| Change shared profile/care-plan configuration | Yes | No | No |
| Use another person's connected MyChart token | No | No | No |
| Read imported EHR data | Separate explicit policy and authorization required | Separate explicit policy and authorization required | Separate explicit policy and authorization required |

Enforce these rules on the server for every operation. A hidden button or a client-supplied role is not an authorization check. Expired, rejected, removed or cross-circle memberships must fail closed. Invitation tokens must be short-lived, single-use and bound to their intended recipient/circle. The last active owner cannot remove themselves without a reviewed ownership-transfer/deletion path.

## API and data boundary

Use a repository/service contract between the mobile app and backend. Proposed entities are User, CareCircle, ChildProfile, Membership, Invitation, CareEvent and AuditEvent. Future EHRConnection and ExternalRecordReference remain distinct from caregiver-entered events.

The server assigns event IDs, timestamps and revision/version values. Validate all write input, derive author identity from the authenticated request, and bind every event to an authorized child/circle. Use idempotency keys so a retry does not duplicate a submitted event. Retain the intended occurrence timestamp separately from the server receipt timestamp; store timezone information needed for local-day views.

## Sync and conflicts

Start with explicit foreground synchronization and visible pending/failed state. Preserve a local mutation queue until server acknowledgement, define retry/backoff limits, and make unresolved failures actionable. Cross-device arrival order must not silently change an event's intended occurrence time. Updates use optimistic concurrency and return conflicts for review instead of silently overwriting a newer revision. Deletion needs tombstones and an explicit retention/recovery policy.

The current local-only JSON history is not this sync protocol. Its numeric IDs and date strings need a deliberate migration plan before cloud enrollment. Do not upload existing device history automatically; identify its intended owner and obtain an explicit migration decision first.

## Security and lifecycle requirements

- Transport encryption; reviewed encryption/key management and access policies for backend storage and backups.
- Use a maintained identity/OAuth implementation. Keep native session material in suitable protected storage; use an appropriate server session design for web. Do not store tokens in the existing AsyncStorage repositories.
- Separate synthetic/non-production and production environments, credentials and datasets. Store server secrets outside client bundles/repositories and define rotation procedures.
- Audit membership/role changes, sensitive access, import/export and deletion actions with actor, target, outcome and server time. Do not log tokens or clinical payloads.
- Define session expiration, revocation, lost-device handling, consent, export, retention/deletion, backup restoration and incident response before real use.
- Test cross-circle access, invitation replay, removed caregivers, conflicting edits, expired credentials and restore/delete behavior. Review dependencies, deployment configuration and the threat model.
- Review the contemplated deployment, users and data handling with qualified privacy/security support. This draft makes no HIPAA compliance determination or claim.

## Decisions and follow-up work

1. Review roles, child/proxy authority and the initial real-use workflow with Avery.
2. Select backend/identity/storage based on those requirements. Java is a candidate for the service layer, not a requirement that the current learner implement a server immediately.
3. After design review, create focused implementation issues for identity, invitations/authorization, event API, sync/conflicts, audit/lifecycle and migration. No remote issues have been created by this document.
4. Run the synthetic multi-device and security tests before considering a real-data beta. Production EHR access also needs its own registration, authorization and environment-specific validation.
