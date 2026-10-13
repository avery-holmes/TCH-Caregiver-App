import type { CareEvent } from "@/domain/careEvent";
import { buildCareFlow } from "./buildCareFlow";

function careEvent(
  id: number,
  type: CareEvent["type"],
  details: string
): CareEvent {
  return {
    id,
    type,
    details,
    date: "2026-10-13",
    time: "9:00 AM",
    caregiver: "Demo caregiver",
  };
}

describe("buildCareFlow", () => {
  it("prompts for the first unfinished task with no events", () => {
    const flow = buildCareFlow([]);
    expect(flow.map((item) => item.status)).toEqual([
      "next",
      "later",
      "later",
      "later",
    ]);
    expect(flow[2].progressText).toBe("0 feedings logged today");
  });

  it("derives completed morning work and active feeding cycle from events", () => {
    const flow = buildCareFlow([
      careEvent(1, "Feeding", "Pump feeding"),
      careEvent(2, "Medication", "Morning medication routine completed"),
    ]);
    expect(flow.map((item) => item.status)).toEqual([
      "complete",
      "complete",
      "active",
      "later",
    ]);
    expect(flow[2].progressText).toBe("1 feeding logged today");
  });

  it("marks all workflow rows complete with four feedings and both medication logs", () => {
    const events = [
      ...[1, 2, 3, 4].map((id) => careEvent(id, "Feeding", "Feeding")),
      careEvent(5, "Medication", "Morning medications"),
      careEvent(6, "Medication", "Evening medications"),
    ];
    expect(buildCareFlow(events).map((item) => item.status)).toEqual([
      "complete",
      "complete",
      "complete",
      "complete",
    ]);
  });

  it("does not confuse an evening medication log with a morning medication log", () => {
    const flow = buildCareFlow([
      careEvent(1, "Medication", "Evening medication routine completed"),
    ]);
    expect(flow[1].complete).toBe(false);
    expect(flow[3].complete).toBe(true);
    expect(flow[0].status).toBe("next");
  });
});
