import { createDemoEvents, createDemoProfile } from "../data/demoCarePlan";
import { getProfileInitials, normalizeProfileIdentity } from "./profile";

describe("demo profile configuration", () => {
  test("provides a synthetic profile and seed events on a fresh install", () => {
    const profile = createDemoProfile();
    const events = createDemoEvents(profile, "2026-10-21");
    expect(profile.identity.childName).toBe("Demo Child");
    expect(events.map((event) => event.caregiver)).toEqual(["Caregiver A", "Caregiver B"]);
    expect(events.every((event) => event.date === "2026-10-21")).toBe(true);
    expect(events[0].details).toContain(`Dose ${profile.carePlan.feeding.doseMl} mL`);
  });

  test("uses chosen aliases in new demo events", () => {
    const profile = createDemoProfile({ childName: " Sample Kid ", primaryCaregiver: " Demo One ", secondaryCaregiver: "Demo Two" });
    expect(profile.identity.childName).toBe("Sample Kid");
    expect(createDemoEvents(profile).map((event) => event.caregiver)).toEqual(["Demo One", "Demo Two"]);
    expect(getProfileInitials(profile.identity.childName)).toBe("SK");
  });

  test.each(["", "   ", "x".repeat(41)])("rejects an invalid alias: %p", (childName) => {
    expect(() => normalizeProfileIdentity({ ...createDemoProfile().identity, childName })).toThrow("1–40");
  });

  test("requires distinguishable caregiver aliases", () => {
    expect(() => createDemoProfile({ childName: "Demo", primaryCaregiver: "Helper", secondaryCaregiver: " helper " })).toThrow("different aliases");
  });

  test("does not leak care-plan mutations between profiles", () => {
    const first = createDemoProfile();
    first.carePlan.medications[0].name = "Changed sample";
    first.carePlan.feeding.doseMl = "100";
    const next = createDemoProfile();
    expect(next.carePlan.medications[0].name).toBe("Medication A");
    expect(next.carePlan.feeding.doseMl).toBe("250");
  });
});
