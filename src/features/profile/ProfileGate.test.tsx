import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import { createDemoProfile } from "../../data/demoCarePlan";
import { loadDemoProfile, saveDemoProfile } from "../../data/storage/profileRepository";
import { ProfileGate } from "./ProfileGate";

jest.mock("../../data/storage/profileRepository", () => ({ loadDemoProfile: jest.fn(), saveDemoProfile: jest.fn() }));
const load = jest.mocked(loadDemoProfile);
const save = jest.mocked(saveDemoProfile);
let screen: ReactTestRenderer;

// The first native render includes lazy module transforms on Windows.
jest.setTimeout(15000);

async function pressButton() {
  await act(async () => {
    const button = screen.root.findAll((node) => node.props.accessibilityRole === "button" && typeof node.props.onPress === "function")[0];
    await button.props.onPress();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  load.mockReset();
  save.mockReset();
  load.mockResolvedValue(null);
  save.mockImplementation(async (identity) => createDemoProfile(identity));
});

afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
});

async function renderGate() {
  await act(async () => {
    screen = create(<ProfileGate>{(profile) => <Text testID="care-screen">{profile.identity.childName}</Text>}</ProfileGate>);
  });
}

test("first-run setup accepts aliases and opens care screens only after saving", async () => {
  await renderGate();
  expect(screen.root.findAllByProps({ testID: "care-screen" })).toHaveLength(0);
  expect(screen.root.findAllByType(TextInput).map((input) => input.props.value)).toEqual(["", "", ""]);
  expect(screen.root.findAllByType(TextInput)[0].props.placeholder).toBe("Demo Child");
  await act(async () => screen.root.findAllByType(TextInput)[0].props.onChangeText("Sample Kid"));
  await pressButton();
  expect(save).toHaveBeenCalledWith({ childName: "Sample Kid", primaryCaregiver: "Caregiver A", secondaryCaregiver: "Caregiver B" });
  expect(screen.root.findByProps({ testID: "care-screen" }).props.children).toBe("Sample Kid");
});

test("returning users bypass setup using the saved profile", async () => {
  load.mockResolvedValue(createDemoProfile());
  await renderGate();
  expect(screen.root.findAllByType(TextInput)).toHaveLength(0);
  expect(screen.root.findByProps({ testID: "care-screen" }).props.children).toBe("Demo Child");
  expect(save).not.toHaveBeenCalled();
});

test("invalid aliases stay in setup without writing", async () => {
  await renderGate();
  await act(async () => {
    screen.root.findAllByType(TextInput)[1].props.onChangeText("Same Alias");
    screen.root.findAllByType(TextInput)[2].props.onChangeText("Same Alias");
  });
  await pressButton();
  expect(save).not.toHaveBeenCalled();
  expect(screen.root.findAllByProps({ accessibilityRole: "alert" })[0].props.children).toContain("different aliases");
});

test("a failed save retains the entered aliases and allows retry", async () => {
  save.mockRejectedValueOnce(new Error("Disk unavailable"));
  await renderGate();
  await pressButton();
  expect(screen.root.findAllByProps({ testID: "care-screen" })).toHaveLength(0);
  expect(screen.root.findAllByType(TextInput)[0].props.value).toBe("");
  expect(screen.root.findAllByType(TextInput)[0].props.placeholder).toBe("Demo Child");
  await pressButton();
  expect(screen.root.findByProps({ testID: "care-screen" }).props.children).toBe("Demo Child");
});

test("a failed load offers retry without replacing the profile", async () => {
  load.mockRejectedValueOnce(new Error("Read failed"));
  await renderGate();
  expect(screen.root.findAllByType(TextInput)).toHaveLength(0);
  expect(save).not.toHaveBeenCalled();
  load.mockResolvedValue(createDemoProfile());
  await pressButton();
  expect(screen.root.findByProps({ testID: "care-screen" }).props.children).toBe("Demo Child");
});
