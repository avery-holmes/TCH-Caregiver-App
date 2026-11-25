import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text, TextInput } from "react-native";
import { BetaApi, BetaApiError } from "@/data/api/betaApi";
import { BetaWorkspace } from "./BetaWorkspace";
import { BetaButton } from "./BetaButton";

jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: require("react-native").View }));
jest.mock("./ChildPhoto", () => ({ ChildPhoto: () => null }));
const account = { id: "owner", email: "test@example.test", displayName: "Test Caregiver" };
const child = { id: "child", displayName: "Sample Child", birthDate: null, timeZone: "UTC", careSummary: "Fictional notes", revision: 1, hasPhoto: false };
let screen: ReactTestRenderer;
let api: jest.Mocked<Pick<BetaApi, "me" | "login" | "logout" | "register" | "children" | "saveChild">>;

jest.setTimeout(15000);

beforeEach(() => {
  api = { me: jest.fn().mockResolvedValue(account), login: jest.fn().mockResolvedValue(account), logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn().mockResolvedValue(undefined), children: jest.fn().mockResolvedValue([]), saveChild: jest.fn().mockResolvedValue(child) };
});
afterEach(async () => { if (screen) await act(async () => screen.unmount()); });

async function render() {
  await act(async () => { screen = create(<BetaWorkspace api={api as unknown as BetaApi} onExit={jest.fn()} />); });
}
async function press(title: string) {
  await act(async () => { screen.root.findAllByType(BetaButton).find((node) => node.props.title === title)!.props.onPress(); });
}
const labels = () => screen.root.findAllByType(TextInput).map((node) => node.props.accessibilityLabel);
const text = () => screen.root.findAllByType(Text).map((node) => node.props.children).flat().join(" ");

test("restores the authenticated child without exposing a new enrollment form", async () => {
  api.children.mockResolvedValue([child]);
  await render();
  expect(text()).toContain("Sample Child");
  expect(labels()).not.toContain("Child display name");
});

test("a failed profile load requires retry instead of creating another child", async () => {
  api.children.mockRejectedValueOnce(new Error("Service unavailable"));
  await render();
  expect(labels()).not.toContain("Child display name");
  expect(api.saveChild).not.toHaveBeenCalled();
  await press("Retry loading child profile");
  expect(labels()).toContain("Child display name");
});

test("saves entered starting details without demo defaults", async () => {
  await render();
  expect(screen.root.findAllByType(TextInput)[0].props.value).toBe("");
  await act(async () => {
    screen.root.findAllByType(TextInput).find((node) => node.props.accessibilityLabel === "Child display name")!.props.onChangeText("Sample Child");
  });
  await press("Save child profile");
  expect(api.saveChild).toHaveBeenCalledWith(expect.objectContaining({ displayName: "Sample Child", birthDate: null, careSummary: "" }), undefined);
  expect(text()).toContain("Sample Child");
});

test("failed saves retain form values and permit retry", async () => {
  api.saveChild.mockRejectedValueOnce(new Error("Save unavailable"));
  await render();
  await act(async () => screen.root.findAllByType(TextInput)[0].props.onChangeText("Keep this alias"));
  await press("Save child profile");
  expect(screen.root.findAllByType(TextInput)[0].props.value).toBe("Keep this alias");
  await press("Save child profile");
  expect(api.saveChild).toHaveBeenCalledTimes(2);
});

test("sign-out removes private profile content", async () => {
  api.children.mockResolvedValue([child]);
  await render();
  await press("Sign out");
  expect(api.logout).toHaveBeenCalledTimes(1);
  expect(text()).not.toContain("Fictional notes");
  expect(labels()).toContain("Email");
});

test("expired sessions remove child details and return to sign-in", async () => {
  api.children.mockResolvedValue([child]);
  await render();
  api.children.mockRejectedValueOnce(new BetaApiError(401));
  await press("Reload child profile");
  expect(text()).not.toContain("Fictional notes");
  expect(labels()).toContain("Email");
});

test("registration completes separately from sign-in and clears the password", async () => {
  api.me.mockResolvedValue(null);
  await render();
  await press("Create a test account");
  await act(async () => {
    const inputs = screen.root.findAllByType(TextInput);
    inputs.find((node) => node.props.accessibilityLabel === "Caregiver display name")!.props.onChangeText("Test Caregiver");
    inputs.find((node) => node.props.accessibilityLabel === "Email")!.props.onChangeText("test@example.test");
    inputs.find((node) => node.props.accessibilityLabel === "Password")!.props.onChangeText("fictional-test-passphrase");
  });
  await press("Create account");
  expect(api.register).toHaveBeenCalledTimes(1);
  expect(api.login).not.toHaveBeenCalled();
  expect(screen.root.findAllByType(TextInput).find((node) => node.props.accessibilityLabel === "Password")!.props.value).toBe("");
  expect(text()).toContain("Account created.");
});
