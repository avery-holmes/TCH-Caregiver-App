import type { MedicationOption } from "@/domain/medication";
import type { DemoProfile, ProfileIdentity } from "@/domain/profile";
import { normalizeProfileIdentity } from "@/domain/profile";
import type { CareEvent } from "@/domain/careEvent";
import { getTodayKey } from "@/utils/dateUtils";

export const defaultDemoIdentity: ProfileIdentity = {
  childName: "Demo Child",
  primaryCaregiver: "Caregiver A",
  secondaryCaregiver: "Caregiver B",
};

export const medicationOptions: MedicationOption[] = [
  {
    name: "Medication A",
    morningDose: "Demo AM dose",
    eveningDose: "Demo PM dose",
  },
  {
    name: "Medication B",
    morningDose: "Demo AM dose",
    eveningDose: "Demo PM dose",
  },
  {
    name: "Medication C",
    morningDose: "Demo AM dose",
    eveningDose: "Demo PM dose",
  },
];

export function createDemoProfile(identity = defaultDemoIdentity): DemoProfile {
  return {
    identity: normalizeProfileIdentity(identity),
    carePlan: {
      feeding: { doseMl: "250", rateMlPerHour: "500", intervalHours: 4, dailyTarget: 4 },
      medications: medicationOptions.map((medication) => ({ ...medication })),
    },
  };
}

export function createDemoEvents(profile: DemoProfile, date = getTodayKey()): CareEvent[] {
  const { feeding } = profile.carePlan;
  return [
    {
      id: 1,
      type: "Feeding",
      time: "8:45 AM",
      details: `Pump feeding • Dose ${feeding.doseMl} mL • Rate ${feeding.rateMlPerHour} mL/hr`,
      caregiver: profile.identity.primaryCaregiver,
      date,
    },
    {
      id: 2,
      type: "Medication",
      time: "9:15 AM",
      details: "Morning medication routine completed",
      caregiver: profile.identity.secondaryCaregiver,
      date,
    },
  ];
}
