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

## Incremental feature modularization

The initial classroom app was a 4,186-line `src/app/index.tsx` combining styling, rendering, state and domain rules. The current refactor moves the shared stylesheet, roadmap screen, plans screen, activity event card, and care-flow calculation out into feature-specific modules. This reduces the app shell to about 1,984 lines **without changing care-event persistence or the core user workflow**.

The care-flow builder is now a pure `buildCareFlow(todayEvents)` function with Jest coverage for empty, partial, complete and evening-only logs. Its current status flags are inferred from logged events; they must **not** be interpreted as clinically verified medication administrations or pump-resets.

## Remaining architectural debt

The main screen still owns state orchestration, activity/calendar rendering, form state and validation, profile rendering, and a large care-entry form. The shared stylesheet also needs further decomposition into co-located feature styles. These should be split incrementally, with a smoke test and preserved behavior at each step; do not attempt a full rewrite at once.

## Target direction

A reasonable next decomposition is:

```text
src/
  app/
  app/               # Expo Router shell and remaining orchestration
  features/
    activity/          # reusable CareEventCard
    care-flow/         # pure, tested buildCareFlow
    plans/             # PlansScreen
    roadmap/           # RoadmapScreen
    care-events/       # next: care-event logging feature
    calendar/          # next: activity calendar
    profiles/          # next: profile header
  data/
    storage/           # careEventRepository and AsyncStorage
  domain/              # CareEvent type and medication types
  theme/               # shared appStyles; split further later
  utils/
```

The goal is to separate UI, domain rules, persistence, and future network concerns so each can be tested and evolved independently.

## Future backend boundary

A production shared-care version should introduce a backend through explicit repository/service interfaces rather than placing API calls directly in screens. Authentication, authorization, audit logging, and secure data handling should be designed before introducing real shared-care data.
