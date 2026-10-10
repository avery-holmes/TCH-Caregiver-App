import type { CareEvent } from "@/domain/careEvent";

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return getDateKey(new Date());
}

export function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function shiftDate(date: Date, amount: number) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + amount);

  return shifted;
}

export function normalizeLegacyEventDates(items: CareEvent[]) {
  const localToday = getTodayKey();
  const legacyUtcToday = new Date().toISOString().slice(0, 10);

  if (legacyUtcToday === localToday) {
    return items;
  }

  return items.map((item) =>
    item.date === legacyUtcToday ? { ...item, date: localToday } : item
  );
}