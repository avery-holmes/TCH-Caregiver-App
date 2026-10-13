import type { CareEvent } from "@/domain/careEvent";

/** Pure derived state for the existing prototype care-flow dashboard.
 *
 * Completion is derived from event logs. It is not a clinical confirmation that a
 * pump reset or medication administration was performed correctly.
 */
export type CareFlowItem = {
  id: string;
  type: "Feeding" | "Medication";
  title: string;
  timing: string;
  progressText: string;
  complete: boolean;
  inProgress?: boolean;
  status: "complete" | "active" | "next" | "later";
};

export function buildCareFlow(todayEvents: CareEvent[]): CareFlowItem[] {
  const feedingEventsToday = todayEvents.filter(
    (event) => event.type === "Feeding"
  );
  const morningMedicationComplete = todayEvents.some(
    (event) =>
      event.type === "Medication" && /morning/i.test(event.details)
  );
  const eveningMedicationComplete = todayEvents.some(
    (event) =>
      event.type === "Medication" && /evening/i.test(event.details)
  );

  const baseItems: Omit<CareFlowItem, "status">[] = [
    {
      id: "pump-setup",
      type: "Feeding",
      title: "Morning pump reset",
      timing: "Start of day",
      complete: feedingEventsToday.length > 0,
      progressText:
        feedingEventsToday.length > 0
          ? "Pump routine started"
          : "Reset volume total before first feeding",
    },
    {
      id: "morning-medications",
      type: "Medication",
      title: "Morning medications",
      timing: "Morning",
      complete: morningMedicationComplete,
      progressText: morningMedicationComplete ? "Logged" : "Not logged yet",
    },
    {
      id: "feeding-cycle",
      type: "Feeding",
      title: "Feeding cycle",
      timing: "Every 4 hours",
      complete: feedingEventsToday.length >= 4,
      inProgress:
        feedingEventsToday.length > 0 && feedingEventsToday.length < 4,
      progressText: `${feedingEventsToday.length} feeding${
        feedingEventsToday.length === 1 ? "" : "s"
      } logged today`,
    },
    {
      id: "evening-medications",
      type: "Medication",
      title: "Evening medications",
      timing: "Later today",
      complete: eveningMedicationComplete,
      progressText: eveningMedicationComplete ? "Logged" : "Still ahead",
    },
  ];

  let foundNext = false;
  return baseItems.map((item) => {
    if (item.complete) {
      return { ...item, status: "complete" as const };
    }
    if (item.inProgress) {
      foundNext = true;
      return { ...item, status: "active" as const };
    }
    if (!foundNext) {
      foundNext = true;
      return { ...item, status: "next" as const };
    }
    return { ...item, status: "later" as const };
  });
}
