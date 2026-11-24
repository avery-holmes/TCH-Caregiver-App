import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { loadCareEvents, saveCareEvents } from "../../data/storage/careEventRepository";
import type { CareEvent } from "../../domain/careEvent";
import { useCareEvents } from "./useCareEvents";

jest.mock("../../data/storage/careEventRepository", () => ({
  loadCareEvents: jest.fn(),
  saveCareEvents: jest.fn(),
}));
const load = jest.mocked(loadCareEvents);
const save = jest.mocked(saveCareEvents);
const seed: CareEvent[] = [{
  id: 1, type: "Note", time: "8:00 AM", details: "Synthetic demo",
  caregiver: "Demo One", date: "2026-01-01",
}];
let screen: ReactTestRenderer;
let model: ReturnType<typeof useCareEvents>;

function Harness() {
  model = useCareEvents(() => seed);
  return null;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  load.mockReset();
  save.mockReset();
  load.mockResolvedValue(null);
  save.mockResolvedValue(undefined);
});

afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
});

async function renderStore() {
  await act(async () => { screen = create(<Harness />); });
}

test("a failed initial read never saves seed data over existing history", async () => {
  load.mockRejectedValue(new Error("Read failed"));
  await renderStore();
  expect(model.status).toBe("load-error");
  await act(async () => model.addEvent({ ...seed[0], id: 2 }));
  expect(save).not.toHaveBeenCalled();
  expect(model.events).toEqual(seed);
});

test("retry restores saved history after an initial read failure", async () => {
  load.mockRejectedValueOnce(new Error("Read failed"));
  await renderStore();
  const saved = [{ ...seed[0], id: 10, caregiver: "Original caregiver" }];
  load.mockResolvedValue(saved);
  await act(async () => model.retry());
  expect(model.events).toEqual(saved);
  expect(model.status).toBe("ready");
  expect(save).toHaveBeenCalledWith(saved);
});

test("an existing empty history is preserved instead of reseeding examples", async () => {
  load.mockResolvedValue([]);
  await renderStore();
  expect(model.events).toEqual([]);
  expect(save).toHaveBeenCalledWith([]);
});

test("no events are accepted or written before loading completes", async () => {
  const pending = deferred<CareEvent[] | null>();
  load.mockReturnValue(pending.promise);
  await renderStore();
  expect(model.status).toBe("loading");
  await act(async () => model.addEvent({ ...seed[0], id: 2 }));
  expect(save).not.toHaveBeenCalled();
  await act(async () => pending.resolve([]));
  expect(model.events).toEqual([]);
});

test("a failed write keeps new events in memory and retries the same snapshot", async () => {
  await renderStore();
  save.mockRejectedValueOnce(new Error("Disk full"));
  const event = { ...seed[0], id: 2 };
  await act(async () => model.addEvent(event));
  expect(model.status).toBe("save-error");
  expect(model.events).toEqual([event, ...seed]);
  await act(async () => model.retry());
  expect(model.status).toBe("ready");
  expect(save).toHaveBeenLastCalledWith([event, ...seed]);
  expect(model.events.filter((item) => item.id === 2)).toHaveLength(1);
});

test("rapid updates are written in order so the latest snapshot wins", async () => {
  await renderStore();
  save.mockClear();
  const slow = deferred<void>();
  save.mockReturnValueOnce(slow.promise);
  const first = { ...seed[0], id: 2 };
  const second = { ...seed[0], id: 3 };
  await act(async () => model.addEvent(first));
  await act(async () => model.addEvent(second));
  expect(save).toHaveBeenCalledTimes(1);
  expect(model.status).toBe("saving");
  await act(async () => slow.resolve(undefined));
  expect(save.mock.calls.map(([items]) => items)).toEqual([
    [first, ...seed], [second, first, ...seed],
  ]);
  expect(model.status).toBe("ready");
});

test("refresh cannot replace unsaved events", async () => {
  await renderStore();
  save.mockRejectedValueOnce(new Error("Write failed"));
  const event = { ...seed[0], id: 2 };
  await act(async () => model.addEvent(event));
  load.mockClear();
  await expect(model.refreshEvents()).rejects.toThrow("Save pending");
  expect(load).not.toHaveBeenCalled();
  expect(model.events).toEqual([event, ...seed]);
});

test("events added during a refresh are not replaced by the stale response", async () => {
  await renderStore();
  const pending = deferred<CareEvent[] | null>();
  load.mockReturnValueOnce(pending.promise);
  const refreshed = model.refreshEvents();
  const event = { ...seed[0], id: 2 };
  await act(async () => model.addEvent(event));
  await act(async () => {
    pending.resolve(seed);
    await refreshed;
  });
  expect(model.events).toEqual([event, ...seed]);
});
