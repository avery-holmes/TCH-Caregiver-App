# Security and Privacy Boundary

TCH is currently a classroom/portfolio prototype. This document records what the project **does not** claim today and the gates required before real-world shared-care use.

## Current prototype

- uses synthetic demo data in this repository
- persists events locally with AsyncStorage
- has no production identity/authentication layer
- has no role-based authorization
- has no production cloud backend
- has no live EHR/FHIR connection
- has no production audit trail
- does **not** claim HIPAA compliance

## Repository hygiene

The portfolio repository intentionally excludes personal demo images/data, local environment files, generated Expo state, dependency directories, signing material, credentials, and service-account files.

## Before real data or shared care

At minimum, a production design needs:

1. authenticated users and explicit caregiver/child authorization
2. secure token/session handling
3. encrypted transport and appropriately protected server-side storage
4. server-side authorization checks rather than client-only controls
5. audit/event history for security-sensitive actions
6. secrets management and environment separation
7. backup/recovery plus retention/deletion behavior
8. privacy disclosures and consent/permission design
9. threat modeling, dependency review, security testing, and compliance review appropriate to the deployment model

No real care data should be introduced merely because the prototype is functional. Security and privacy architecture are release gates, not post-launch cleanup items.
