# TCH Architecture

## Current MVP

The current classroom prototype is a local-first React Native application.

### Application shell

- `src/app/_layout.tsx` provides a minimal Expo Router stack shell.
- `src/app/index.tsx` contains the primary TCH experience.
- the prototype uses an internal tab/pager model for Home, Activity, Log, Roadmap, and Plans.

### Data model

The central prototype record is a `CareEvent` with an ID, type, time, details, caregiver label, and date. Event categories include feeding, medication, diaper/toileting, sleep, vitals, and notes.

### Persistence

Care events are serialized to AsyncStorage under a local application key. The code also contains date-normalization logic for locally stored events. There is no remote backend in the current MVP.

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
