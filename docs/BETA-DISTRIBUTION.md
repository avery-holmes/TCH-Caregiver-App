# Family demo distribution: iPhone and Android

Both platforms are targets. This is a synthetic-data walkthrough, not a real-data shared-care release. `eas.json` contains an internal `preview` profile: an Android APK and a physical-device iOS ad hoc build. No cloud build, upload, signing configuration or store submission has been performed.

Local validation: 89 Jest tests across eight suites and TypeScript pass, including the separate sandbox adapter. Expo has compiled the iOS, Android and web JavaScript bundles with bytecode disabled. This checks bundling; it does not produce an installable APK/IPA or verify native compilation/signing. See `STABILIZATION-REVIEW.md` for browser checks.

## Account and configuration status

See [`PREVIEW-CANDIDATE-2026-10-27.md`](PREVIEW-CANDIDATE-2026-10-27.md) for the SDK alignment, native-prebuild evidence, upload review and open dependency advisories.

| Requirement | Status / next action |
| --- | --- |
| Expo account | CLI sign-in confirmed; Avery owns personal/team namespaces; project-owner selection is pending |
| Android signing | Configure with EAS during the first approved build; preserve signing credentials for future updates |
| Paid Apple Developer membership | Not available yet; blocks the planned iPhone ad hoc distribution path |
| EAS project | Not linked in app config yet |
| Android application ID and iOS bundle identifier | Configured locally as `com.averyholmes.tch.demo`, build 1; no remote registration yet |
| Native device validation | Pending on both platforms |
| Testers and feedback channel | Avery to select privately |

Keep TCH as the internal demo name while the public naming work in Issue #14 remains open. This setup does not choose a new public brand.

## Android install path

After project linking, package identifier and signing setup, create an internal APK using EAS CLI:

```bash
npx eas-cli@latest build --profile preview --platform android
```

The command uploads project source to EAS Build. It is a future build step, not a command already executed. A Google Play release is not required for this APK test path. Share the resulting install link privately with the named testers; on the Android device, use the browser's install flow and permit that source only if required to install the intended APK. Confirm the installed build version before testing.

## iPhone install path

The planned ad hoc build requires a paid Apple Developer membership. After that is set up, link the EAS project and bundle identifier, register each tester's physical device, then build:

```bash
npx eas-cli@latest device:create
npx eas-cli@latest build --profile preview --platform ios
```

Only devices included in the provisioning profile can install the ad hoc build. Adding testers may require rebuilding or re-signing. TestFlight can be considered later when the beta metadata/support/privacy material is ready; it is not configured here.

While membership is pending, Expo Go may support a supervised developer walkthrough if its available version supports this project's SDK and native modules. That compatibility has not been verified. A browser preview can help review the flow, but neither route counts as validating the planned standalone iPhone build.

## Shared device test matrix

Record results independently for iPhone and Android. A passing web check does not mark either device column as passed.

| Scenario | iPhone | Android |
| --- | --- | --- |
| Fresh install, keep synthetic defaults | Pending | Pending |
| Fictional aliases appear in header and event attribution | Pending | Pending |
| Empty/duplicate aliases show errors without leaving setup | Pending | Pending |
| Log feeding, medication, vitals and a note | Pending | Pending |
| Native time picker, including cancel | Pending | Pending |
| Close/reopen and confirm saved aliases/events | Pending | Pending |
| Upgrade with an existing synthetic history | Pending | Pending |
| Care-history load failure: retry, with no history overwrite | Pending | Pending |
| Save failure: visible warning, retained events, retry without duplicates | Pending | Pending |
| Refresh during pending save cannot discard changes | Pending | Pending |
| Airplane mode: local logging and restart | Pending | Pending |
| Large system text, narrow layout and keyboard entry | Pending | Pending |
| VoiceOver / TalkBack labels and touch targets | Pending | Pending |

Storage-failure cases require a controlled test harness or disposable synthetic test installation; do not corrupt a tester's retained history to trigger them. Automated regression tests cover these cases before device validation.

## References

- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/): APKs, ad hoc device registration and build-link access.
- [EAS build profiles](https://docs.expo.dev/build/eas-json/): internal preview configuration.
- [Creating and sharing internal builds](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/): account, signing and installation workflow.
