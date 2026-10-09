import {
  getDateKey,
  normalizeLegacyEventDates,
  shiftDate,
} from "./dateUtils";

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
  test("returns events unchanged when UTC date matches local date", () => {
    const events = [
      {
        id: 1,
        type: "Feeding",
        time: "8:00 AM",
        details: "Demo",
        caregiver: "Caregiver A",
        date: getDateKey(new Date()),
      },
    ];

    const result = normalizeLegacyEventDates(events);

    expect(result).toEqual(events);
  });

  test("preserves events that do not use the legacy UTC date", () => {
    const events = [
      {
        id: 2,
        type: "Medication",
        time: "9:00 AM",
        details: "Demo",
        caregiver: "Caregiver B",
        date: "2026-01-01",
      },
    ];

    const result = normalizeLegacyEventDates(events);

    expect(result[0].date).toBe("2026-01-01");
  });
});
