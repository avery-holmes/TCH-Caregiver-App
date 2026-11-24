# Local stabilization review — October 21, 2026

Reviewed the uncommitted changes on `codex/issue-4-demo-onboarding` against the local `main` baseline `45dd291`. This review covers the synthetic family-demo foundation, storage recovery, the separate sandbox adapter and the browser walkthrough. No commit, push or release was performed.

## Findings fixed

| Finding | Result |
| --- | --- |
| Resizing desktop web to phone width could leave a blank pager; Home did not recover it | Remount measured pager cells on width changes at the selected index; selected screen and parent-held form drafts survive |
| Invalid event submissions failed silently on web because React Native Web's Alert implementation is empty | Show an accessible web dialog for validation and reminder previews; native alert calls remain in place |
| Adjust event time opened an empty panel on web | Use the browser's time input through a platform-specific component; preserve native date/time picker behavior |
| Offscreen pager pages remained in the browser accessibility tree and could contain focusable controls | Mark inactive web pages inert and hidden; apply native accessibility/pointer restrictions through a dedicated page wrapper |
| Refresh text implied remote caregiver updates despite local-only storage | Describe reloading history on this device |

## Validation

- 89 Jest tests across eight suites pass, including five web time-entry regression cases.
- TypeScript and Git diff whitespace checks pass.
- iOS, Android and web Expo exports succeed with bytecode disabled. These are JavaScript bundle checks, not native binary/signing tests.
- Browser review at 390×844 and 1280×800: Home and Activity render after resizing; the selected tab and a draft note survive the transition.
- Empty-note submission displays a visible error dialog and stays in the form.
- Browser keyboard time editing updates the event time. A synthetic note saved with the adjusted time appears in Activity with caregiver attribution and survives a full reload.
- Inactive pages no longer appear in the browser accessibility tree; normal viewport sizing is restored after testing.
- No dependencies were added. Roadmap data, app identifiers, CI and the lockfile remain unchanged.

## Web layout intent

Web shares the mobile-first care screens and bottom navigation. Wider screens use the existing tablet spacing; onboarding is intentionally constrained to a readable width. It is not a separately designed desktop dashboard. The browser uses a browser time control and web dialogs where native controls are unavailable.

## Remaining release work

- Signed/installable preview builds, EAS project/identifier/signing setup and physical-device checks on both platforms.
- VoiceOver/TalkBack, large system text, native keyboard behavior and broader accessibility validation from Issue #11.
- Privacy/security and shared-care design review before implementing real accounts, permissions and sync.
- Epic app registration and authorized sandbox login/Patient-read testing. Public discovery and synthetic adapter tests do not establish live MyChart connectivity.
- The existing SafeAreaView deprecation warning is non-blocking and remains a follow-up; physical-device safe-area behavior has not been validated.

The reviewed browser demo is ready for Avery's next fictional-data walkthrough. A real-data or shared-care release has not been approved.

Subsequent native-preview preparation changed SDK patch versions, CI installation settings and internal app identifiers. See [`PREVIEW-CANDIDATE-2026-10-27.md`](PREVIEW-CANDIDATE-2026-10-27.md); the observations above describe the October 21 stabilization pass.
