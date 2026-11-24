# TCH Architecture

## Current MVP

The current classroom prototype is a local-first React Native application.

### Application shell

- `src/app/_layout.tsx` provides a minimal Expo Router stack shell.
- `src/app/index.tsx` contains the primary TCH experience.
- the prototype uses an internal tab/pager model for Home, Activity, Log, Roadmap, and Plans.

### Demo profile and setup

- `src/domain/profile.ts` defines the profile identity, care-plan configuration and alias validation.
- `src/data/demoCarePlan.ts` supplies synthetic defaults and constructs new demo events using the profile.
- `src/data/storage/profileRepository.ts` stores versioned aliases under `@tch_demo_profile`, separately from `@tch_care_events`. Care-plan defaults remain code configuration, not editable clinical instructions.
- `src/features/profile/ProfileGate.tsx` loads a saved profile or presents first-run setup before mounting the care screens. Read failures offer retry without overwriting stored data; save failures retain the entered aliases.
- Existing events keep their stored caregiver labels. There is one profile per device; caregiver labels do not represent authenticated users.

### Data model

The central prototype record is a `CareEvent` with an ID, type, time, details, caregiver label, and date. Event categories include feeding, medication, diaper/toileting, sleep, vitals, and notes.

### Persistence

Care events are serialized to AsyncStorage under a local application key. The code also contains date-normalization logic for locally stored events. There is no remote backend in the current MVP.

`src/features/care-events/useCareEvents.ts` owns loading, in-memory updates, serialized saves and retries. A failed initial read blocks the care UI and never writes demo seeds over the unread history. Saved JSON is checked for the existing event shape before use. Failed saves keep the latest events in memory with a visible retry prompt; those events are not durable until a retry succeeds. Refresh refuses to replace unsaved changes and ignores a stale response if a new event was added while reading.

### UI behavior

The current source implements care-event forms, activity history, a calendar view, responsive phone/tablet layout behavior, roadmap/plans screens, and lightweight animation.

## Known architectural debt

`src/app/index.tsx` is intentionally large because the course project prioritized delivering a complete working prototype. For continued development, the major concern is separation of responsibilities rather than adding more features to this file.

## Target direction

A reasonable next decomposition is:

```text
src/
  app/
  components/
  features/
    care-events/
    activity/
    calendar/
    profiles/
    plans/
  data/
    storage/
    repositories/
  domain/
    models/
    validation/
  hooks/
  theme/
```

The goal is to separate UI, domain rules, persistence, and future network concerns so each can be tested and evolved independently.

## Future backend boundary

A production shared-care version should introduce a backend through explicit repository/service interfaces rather than placing API calls directly in screens. Authentication, authorization, audit logging, and secure data handling should be designed before introducing real shared-care data.

See [`SHARED-CARE-DESIGN.md`](SHARED-CARE-DESIGN.md) for the draft identity/permission/sync boundary. The separate `src/integrations/epic/` adapter is restricted to Epic's synthetic sandbox, uses injected in-memory authorized session material, and does not persist or merge external patient summaries into care events. Its login provider and production integration are not implemented; see [`EPIC-INTEGRATION.md`](EPIC-INTEGRATION.md).
