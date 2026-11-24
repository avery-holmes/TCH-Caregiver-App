# Epic / MyChart integration track

## Status and first acceptance target

The user has prioritized integration work over further UI polish. The existing roadmap stays intact: Version 2 secure shared care remains a prerequisite for real shared use; an early Version 7 sandbox spike can proceed alongside it.

The first integration milestone is: complete an authorized standalone launch against Epic's synthetic sandbox, then read the authorized Patient resource and retain its source attribution. It is not a claim of live MyChart connectivity, a multi-hospital record aggregator, or clinical write-back.

Implemented locally:

- `src/integrations/epic/epicSandboxClient.ts`: read-only sandbox metadata discovery and an adapter for reading the Patient associated with an already-authorized session. The OAuth login flow that supplies that session is not implemented yet.
- `src/integrations/epic/sandboxConfig.json`: public sandbox endpoints only. No production URL override or credentials.
- Synthetic tests for metadata validation, scopes/expiry, patient mismatch, network/HTTP/JSON failures and timeout.
- `npm run check:epic-sandbox`: a public metadata check requiring no account or patient token. It passed against the live sandbox. This is connectivity discovery, not a patient-data integration test.

No UI import button, authorization code exchange, session persistence, clinical import, account registration or production connection has been implemented. Imported records are not written into AsyncStorage or converted into caregiver activity.

## Account step for Avery

Avery has confirmed that an Epic developer account/app is not yet available. Complete registration personally at [Epic on FHIR](https://fhir.epic.com/), including reviewing any terms before accepting them.

For the first test application:

1. Create a patient-facing application for sandbox use and select FHIR R4.
2. Select the Patient.Read R4 API for the first connection test. Additional clinical resources will be separate, tested increments.
3. Use a public native client with authorization code and PKCE for the planned mobile flow. Do not put a client secret in a mobile bundle. Confirm exact registration options against the current portal.
4. Agree the callback/redirect URI with the implementation before registering it. The existing local demo has no OAuth callback route; `localhost:8083` is not automatically a suitable mobile callback. A browser test registration may need a separate sandbox-only app.
5. Record the non-production client ID and chosen callback URI. A client ID identifies the app; access tokens, authorization codes, passwords and client secrets must not be posted to chat or committed.
6. Use Epic's published synthetic test accounts to complete authorization after the login module is implemented. Do not use a family's real MyChart account for this milestone.

Once registration is available, implement the login/callback through a maintained SMART/OAuth library. Require PKCE S256, unpredictable state, exact callback validation, issuer/audience binding, validated token response and patient context, and cancellation/denial handling. The adapter's input contract is not a substitute for these checks. Server-side token validation and access controls remain authoritative.

## Data and authorization boundaries

- TCH sign-in, caregiver membership and MyChart authorization are separate concerns. A TCH caregiver label cannot grant EHR access.
- Parent/proxy access must be tested with the selected health system's supported patient context and proxy workflow. Do not assume the authenticated adult is the child whose chart is being read.
- External resource references use environment + FHIR base URL + resource type + resource ID. Patient IDs are not globally unique across institutions.
- Keep the connection and imported summaries in memory for the sandbox spike. Never persist tokens or raw clinical records through the existing care-event repository.
- An EHR medication order describes an order; it must not be turned into a completed medication-administration event. The same separation applies to clinical observations and caregiver-entered vitals.
- Display source and retrieval time when an import UI is added. Missing data is not evidence that a patient has no condition, allergy or medication.
- The initial adapter accepts only a bounded Patient read for the patient in the session. It exposes no arbitrary resource URL, search, write, bulk import or automatic retry.
- Before sending a token, the session's FHIR base URL must match the fixed sandbox URL. A connection from a production environment is rejected locally.
- Permission expiry, denial, revocation and partial results need explicit user-facing behavior in the later connection feature.

## Remaining integration milestones

| Milestone | Acceptance evidence | Status |
| --- | --- | --- |
| Public sandbox discovery | Expected R4 and PKCE metadata returned | Passed locally |
| Adapter behavior | 30 synthetic adapter tests pass, no production endpoints or storage | Passed locally; full suite is 89 tests across eight suites, TypeScript passes |
| App registration | Non-production client ID and matching redirect URI | Requires Avery's account setup |
| Authorized sandbox connection | Login, consent, cancel/deny, state/PKCE and Patient read tested end to end | Not implemented; awaits registration/callback decision |
| Child/proxy access | Correct authorized child, denied access and changed/revoked access tested | Target health system/workflow not selected |
| Read-only clinical resources | Agreed medication/allergy/observation contracts and provenance tests | Future increments |
| Production readiness | Reviewed privacy/security design, access controls and institution-specific availability/activation confirmed | Not ready |

## Java connection

The current adapter is agent-owned TypeScript. Its separation from the screen gives a future Java service a clear contract: obtain an authorized connection, read bounded resources, map source-attributed records and return explicit errors. Java becomes a production contribution after the refresher reaches classes, interfaces, testing and HTTP. No parallel Java rewrite or new Java framework is required at the current methods checkpoint.

## Primary references

- [Epic patient-facing apps](https://fhir.epic.com/Documentation?docId=patientfacingfhirapps): app registration, patient authorization and sandbox workflow.
- [Epic developer resources](https://open.epic.com/DeveloperResources): application identity and environment access.
- [SMART App Launch](https://www.hl7.org/fhir/smart-app-launch/): authorization protocol and supported libraries.
- [FHIR R4 Patient](https://hl7.org/fhir/R4/patient.html): resource identity and demographic representation.
