import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CareEvent } from "../../domain/careEvent";
import { loadCareEvents, saveCareEvents } from "./careEventRepository";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const storage = jest.mocked(AsyncStorage);
const storageKey = "@tch_care_events";
const events: CareEvent[] = [
  {
    id: 1,
    type: "Feeding",
    time: "8:00 AM",
    details: "Synthetic demo feeding",
    caregiver: "Caregiver A",
    date: "2026-10-07",
  },
];

beforeEach(() => {
  jest.resetAllMocks();
  storage.getItem.mockResolvedValue(null);
  storage.setItem.mockResolvedValue(undefined);
});

describe("loadCareEvents", () => {
  test("returns null when no events have been saved", async () => {
    await expect(loadCareEvents()).resolves.toBeNull();
    expect(storage.getItem).toHaveBeenCalledWith(storageKey);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test("loads saved events without changing their dates or fields", async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(events));

    await expect(loadCareEvents()).resolves.toEqual(events);
    expect(storage.getItem).toHaveBeenCalledWith(storageKey);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test("preserves a saved empty list rather than treating it as missing", async () => {
    storage.getItem.mockResolvedValue("[]");

    await expect(loadCareEvents()).resolves.toEqual([]);
  });

  test("rejects malformed JSON without overwriting saved data", async () => {
    storage.getItem.mockResolvedValue("{invalid json");

    await expect(loadCareEvents()).rejects.toBeInstanceOf(SyntaxError);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  test("propagates storage read errors to the caller", async () => {
    const error = new Error("Storage read failed");
    storage.getItem.mockRejectedValue(error);

    await expect(loadCareEvents()).rejects.toBe(error);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

describe("saveCareEvents", () => {
  test("serializes all event fields under the existing storage key", async () => {
    await expect(saveCareEvents(events)).resolves.toBeUndefined();

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(storageKey, JSON.stringify(events));
  });

  test("saves an empty list so cleared history can be persisted", async () => {
    await saveCareEvents([]);

    expect(storage.setItem).toHaveBeenCalledWith(storageKey, "[]");
  });

  test("propagates storage write errors to the caller", async () => {
    const error = new Error("Storage write failed");
    storage.setItem.mockRejectedValue(error);

    await expect(saveCareEvents(events)).rejects.toBe(error);
  });
});
