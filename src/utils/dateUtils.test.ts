import {
  getDateKey,
  normalizeLegacyEventDates,
  shiftDate,
} from "./dateUtils";
import type { CareEvent } from "../domain/careEvent";

describe("getDateKey", () => {
  test("formats a date as YYYY-MM-DD", () => {
    const date = new Date(2026, 9, 7);

    const result = getDateKey(date);

    expect(result).toBe("2026-10-07");
  });

  test("adds leading zeros to single-digit months and days", () => {
    const date = new Date(2026, 0, 5);

    const result = getDateKey(date);

    expect(result).toBe("2026-01-05");
  });
});

describe("shiftDate", () => {
  test("moves a date forward by the requested number of days", () => {
    const date = new Date(2026, 9, 7);

    const result = shiftDate(date, 3);

    expect(getDateKey(result)).toBe("2026-10-10");
  });

  test("moves a date backward by the requested number of days", () => {
    const date = new Date(2026, 9, 7);

    const result = shiftDate(date, -2);

    expect(getDateKey(result)).toBe("2026-10-05");
  });
});

describe("normalizeLegacyEventDates", () => {
  const event: CareEvent = {
    id: 1,
    type: "Feeding",
    time: "8:00 AM",
    details: "Demo",
    caregiver: "Caregiver A",
    date: "2026-10-07",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-10-08T00:30:00.000Z"));
    // Simulate local calendar dates without relying on the host timezone.
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2026);
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(9);
    jest.spyOn(Date.prototype, "getDate").mockReturnValue(8);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("returns the original array when UTC date matches local date", () => {
    const events = [{ ...event, date: "2026-10-08" }];

    expect(normalizeLegacyEventDates(events)).toBe(events);
  });

  test.each([
    [7, "2026-10-07"],
    [9, "2026-10-09"],
  ])("corrects legacy UTC dates when the local day is %i", (day, localDate) => {
    jest.mocked(Date.prototype.getDate).mockReturnValue(day);
    const legacyEvent = { ...event, date: "2026-10-08" };
    const historicalEvent = { ...event, id: 2, date: "2026-01-01" };
    const localEvent = { ...event, id: 3, date: localDate };
    const events = [legacyEvent, historicalEvent, localEvent];

    const result = normalizeLegacyEventDates(events);

    expect(result).toEqual([
      { ...legacyEvent, date: localDate },
      historicalEvent,
      localEvent,
    ]);
    expect(result[1]).toBe(historicalEvent);
    expect(result[2]).toBe(localEvent);
    expect(legacyEvent.date).toBe("2026-10-08");
    expect(events[0]).toBe(legacyEvent);
  });

  test("handles an empty event list when UTC and local dates differ", () => {
    jest.mocked(Date.prototype.getDate).mockReturnValue(7);

    expect(normalizeLegacyEventDates([])).toEqual([]);
  });
});
