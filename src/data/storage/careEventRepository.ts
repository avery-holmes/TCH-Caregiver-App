import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CareEvent } from "@/domain/careEvent";

const STORAGE_KEY = "@tch_care_events";

export async function loadCareEvents(): Promise<CareEvent[] | null> {
  const savedEvents = await AsyncStorage.getItem(STORAGE_KEY);

  if (!savedEvents) {
    return null;
  }

  return JSON.parse(savedEvents) as CareEvent[];
}

export async function saveCareEvents(
  events: CareEvent[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
