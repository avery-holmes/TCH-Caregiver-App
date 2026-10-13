# SENG 564 peer feedback — TCH follow-up

Date: 2026-10-13
Source: 15 peer evaluation submissions and final A12-3 rubric feedback supplied by the project author.

## What the class actually said

| Measure | Result |
| --- | --- |
| Rubric grade | 72 / 80 (90%) |
| Overall peer score | 4.2 / 5 (median 4.0) |
| Presentation delivery | 4.5 / 5 |
| Presentation content | 4.3 / 5 |
| Audio-visual aids | 4.0 / 5 |

**Strengths to preserve:** clear personal motivation, practical caregiver use case, confident presentation, functional walkthroughs, and evident product utility.

**Improvement requests:** presentation slides explaining the software lifecycle and architecture; a code walkthrough and test strategy; greater readability for small labels including "Start of day"; simpler navigation; and a plan for privacy, security, HIPAA considerations, shared-care use, and public naming.

These are classroom presentation findings, **not** usability-study measurements or an external product-market validation.

## Accepted changes — phase 1 in this branch

- Replace the five equally weighted footer destinations with **Today**, **Activity**, **Log Care**, and **More**.
- Preserve the existing Roadmap and Plans pages, accessible through **More** rather than featured as core caregiving tasks.
- Add semantic selection and expansion state to footer navigation for accessibility technology.
- Increase typography for key user-facing labels, especially care flow details, timing chips, reminder text, summary labels, profile indicators, and footer labels.
- Increase vertical room for care-flow rows and the footer to reduce cramped touch interactions.
- Keep existing event logging, AsyncStorage persistence, and business rules unchanged.
- Keep **TCH** as an internal working title while commercial naming is evaluated.

## Next accessibility acceptance criteria (manual device validation required)

- [ ] Verify that "Start of day", "Every 4 hours", and other timing chips remain fully readable at default settings and with large system text.
- [ ] Review every screen at 200% system font scale, portrait and tablet widths; eliminate truncation and overlapping labels.
- [ ] Audit touch targets (at least 44 x 44 points on iOS and recommended 48 x 48 dp on Android); do not rely on small hitSlop-only controls.
- [ ] Verify screen reader names, roles, state, focus order, and interaction with VoiceOver and TalkBack.
- [ ] Check text and icon contrast against WCAG 2.2 AA criteria where applicable.
- [ ] Respect system reduced-motion preferences before introducing more elaborate animations.
- [ ] Test switching Home/Today, Activity, Log Care, More > Roadmap, More > Plans, and returning to normal caregiving flows.
- [ ] Exercise logging, day transitions, calendar navigation, AsyncStorage reload, and error states after UI changes.
- [ ] Test on a narrow phone, a large phone, Android emulator, and tablet. Screenshots/peer feedback alone do not establish that these pass.

## Engineering presentation showcase (5–6 slides plus live demo)

1. **Problem and user:** caregiver burden; core task the MVP solves.
2. **System architecture:** Expo Router shell → React Native screen/feature logic → typed CareEvent model → careEventRepository → device AsyncStorage (local only).
3. **Design decisions:** local-first prototype, synthetic demo data, navigation and responsive layouts, accessibility trade-offs.
4. **Clean Code next steps:** current large `src/app/index.tsx` as acknowledged architectural debt; split by features and services; small functions and testable responsibility boundaries.
5. **Quality evidence:** `npm run typecheck`, Jest date and storage tests, pull-request CI; show actual CI results rather than unsupported claims.
6. **Security + roadmap:** current demo is not HIPAA compliant; authentication, authorization, encryption, audit logging, retention, threat modeling, and legal/compliance review are pre-launch gates.

Pair the deck with a focused 90-second walkthrough of Today → Log Care → Activity. Avoid a long tour of future pricing or aspirational roadmap features.

## Security/clinical safety release gates

- No real personal health information in the demo or its public repository.
- AsyncStorage is not an encrypted clinical record store.
- Before any shared-care pilot with sensitive information: define user roles and data access; server-side checks; secure session storage; transport/storage protection; event audit trails; retention/deletion; security testing and recovery.
- Determine whether the contemplated deployment involves HIPAA covered entities/business associates; obtain qualified privacy/legal review and necessary agreements where applicable.
- No claim of HIPAA compliance, clinical efficacy, or medical-device capability based on the classroom prototype.
- Care-flow indicators derived from logs are **not** confirmations of medication administration or other real-world health actions without proper validation.

## Commercial naming — preliminary diligence, no rebrand yet

The initials **TCH** are not distinctive by themselves and are already used in a related home-care context by Transformation Continuum Health (https://www.tchhealthcare.com/). Related healthcare products also already use **CareNest** (https://apps.apple.com/us/app/carenest-family-care/id6804033409) and **CareVia** (https://carevia.co/). These observations are not a legal conclusion or trademark clearance.

Before picking a new public name:
1. Generate a focused list of distinctive candidate names and test user pronunciation and recall.
2. Search USPTO live/pending marks and common-law web/company uses, including phonetic or visual variants and related classes.
3. Check iOS/Android names, domains, and social handles, without assuming lack of search results means a name is available.
4. Have appropriate trademark counsel review the finalists before spending on a launch or changing app IDs.

USPTO guidance:
- https://www.uspto.gov/trademarks/search/federal-trademark-searching
- https://www.uspto.gov/trademarks/search/likelihood-confusion

## Decision rule

**Prioritize usable, accessible, trustworthy caregiver workflows over decorative animations.** Preserve strengths of the classroom MVP and use the feedback to guide a measured engineering iteration.
