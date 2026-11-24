import type { MedicationOption } from "./medication";

export type ProfileIdentity = {
  childName: string;
  primaryCaregiver: string;
  secondaryCaregiver: string;
};

export type DemoProfile = {
  identity: ProfileIdentity;
  carePlan: {
    feeding: {
      doseMl: string;
      rateMlPerHour: string;
      intervalHours: number;
      dailyTarget: number;
    };
    medications: MedicationOption[];
  };
};

export function normalizeProfileIdentity(
  identity: ProfileIdentity
): ProfileIdentity {
  const result = {
    childName: identity.childName.trim(),
    primaryCaregiver: identity.primaryCaregiver.trim(),
    secondaryCaregiver: identity.secondaryCaregiver.trim(),
  };
  if (Object.values(result).some((value) => !value || value.length > 40)) {
    throw new Error("Enter a demo alias of 1–40 characters in every field.");
  }
  if (
    result.primaryCaregiver.toLowerCase() ===
    result.secondaryCaregiver.toLowerCase()
  ) {
    throw new Error("Use different aliases for the two caregivers.");
  }
  return result;
}

export function getProfileInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase();
}
