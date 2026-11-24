import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CareEvent } from "@/domain/careEvent";

const STORAGE_KEY = "@tch_care_events";

export async function loadCareEvents(): Promise<CareEvent[] | null> {
  const savedEvents = await AsyncStorage.getItem(STORAGE_KEY);

  if (savedEvents === null) {
    return null;
  }

  const parsed: unknown = JSON.parse(savedEvents);
  if (!Array.isArray(parsed) || !parsed.every(isCareEvent)) {
    throw new Error("Saved care history is not a valid event list.");
  }
  return parsed;
}

function isCareEvent(value: unknown): value is CareEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return typeof event.id === "number" && Number.isFinite(event.id) &&
    ["type", "time", "details", "caregiver", "date"].every(
      (field) => typeof event[field] === "string"
    );
}

export async function saveCareEvents(
  events: CareEvent[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
