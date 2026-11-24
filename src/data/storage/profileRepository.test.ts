import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultDemoIdentity } from "../demoCarePlan";
import { loadDemoProfile, saveDemoProfile } from "./profileRepository";

jest.mock("@react-native-async-storage/async-storage", () => ({ getItem: jest.fn(), setItem: jest.fn() }));
const storage = jest.mocked(AsyncStorage);

beforeEach(() => {
  jest.resetAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

test("a missing profile requests first-run setup without writing or touching care history", async () => {
  await expect(loadDemoProfile()).resolves.toBeNull();
  expect(storage.getItem).toHaveBeenCalledWith("@tch_demo_profile");
  expect(storage.getItem).toHaveBeenCalledTimes(1);
  expect(storage.setItem).not.toHaveBeenCalled();
});

test("saves only normalized, versioned identity under a separate key", async () => {
  await saveDemoProfile({ ...defaultDemoIdentity, childName: " Demo Alias " });
  expect(storage.setItem).toHaveBeenCalledTimes(1);
  expect(storage.setItem).toHaveBeenCalledWith("@tch_demo_profile", JSON.stringify({ version: 1, identity: { ...defaultDemoIdentity, childName: "Demo Alias" } }));
});

test("restores aliases with the synthetic care-plan defaults", async () => {
  storage.getItem.mockResolvedValue(JSON.stringify({ version: 1, identity: { ...defaultDemoIdentity, childName: "Sample Kid" } }));
  const profile = await loadDemoProfile();
  expect(profile?.identity.childName).toBe("Sample Kid");
  expect(profile?.carePlan.feeding.doseMl).toBe("250");
});

test.each([
  "not json", "null", "[]", "{}",
  JSON.stringify({ version: 2, identity: defaultDemoIdentity }),
  JSON.stringify({ version: 1, identity: { ...defaultDemoIdentity, childName: 42 } }),
  JSON.stringify({ version: 1, identity: { ...defaultDemoIdentity, childName: " " } }),
])("rejects corrupt or unsupported profiles without overwriting them: %s", async (saved) => {
  storage.getItem.mockResolvedValue(saved);
  await expect(loadDemoProfile()).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});

test("propagates read failures", async () => {
  const error = new Error("Read failed");
  storage.getItem.mockRejectedValue(error);
  await expect(loadDemoProfile()).rejects.toBe(error);
});

test("propagates write failures rather than reporting success", async () => {
  const error = new Error("Write failed");
  storage.setItem.mockRejectedValue(error);
  await expect(saveDemoProfile(defaultDemoIdentity)).rejects.toBe(error);
});

test("rejects invalid aliases before writing", async () => {
  await expect(saveDemoProfile({ ...defaultDemoIdentity, childName: "" })).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});
