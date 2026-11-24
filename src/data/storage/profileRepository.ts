import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDemoProfile } from "@/data/demoCarePlan";
import type { DemoProfile, ProfileIdentity } from "@/domain/profile";
import { normalizeProfileIdentity } from "@/domain/profile";

const STORAGE_KEY = "@tch_demo_profile";

export async function loadDemoProfile(): Promise<DemoProfile | null> {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved === null) return null;

  const parsed: unknown = JSON.parse(saved);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== 1 ||
    !("identity" in parsed) ||
    !parsed.identity ||
    typeof parsed.identity !== "object" ||
    !("childName" in parsed.identity) ||
    typeof parsed.identity.childName !== "string" ||
    !("primaryCaregiver" in parsed.identity) ||
    typeof parsed.identity.primaryCaregiver !== "string" ||
    !("secondaryCaregiver" in parsed.identity) ||
    typeof parsed.identity.secondaryCaregiver !== "string"
  ) {
    throw new Error("Saved demo profile is invalid or uses an unsupported version.");
  }
  return createDemoProfile({
    childName: parsed.identity.childName,
    primaryCaregiver: parsed.identity.primaryCaregiver,
    secondaryCaregiver: parsed.identity.secondaryCaregiver,
  });
}

export async function saveDemoProfile(
  identity: ProfileIdentity
): Promise<DemoProfile> {
  const normalized = normalizeProfileIdentity(identity);
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, identity: normalized })
  );
  return createDemoProfile(normalized);
}
