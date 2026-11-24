import { useCallback, useEffect, useRef, useState } from "react";
import { loadCareEvents, saveCareEvents } from "@/data/storage/careEventRepository";
import type { CareEvent } from "@/domain/careEvent";
import { normalizeLegacyEventDates } from "@/utils/dateUtils";

export type CareStorageStatus =
  | "loading"
  | "load-error"
  | "saving"
  | "save-error"
  | "ready";

export function useCareEvents(createInitialEvents: () => CareEvent[]) {
  const [events, setEvents] = useState(createInitialEvents);
  const [status, setStatus] = useState<CareStorageStatus>("loading");
  const eventsRef = useRef(events);
  const statusRef = useRef<CareStorageStatus>("loading");
  const mounted = useRef(false);
  const revision = useRef(0);
  const loadRequest = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const updateStatus = useCallback((next: CareStorageStatus) => {
    statusRef.current = next;
    if (mounted.current) setStatus(next);
  }, []);

  const persist = useCallback((snapshot: CareEvent[]) => {
    const requestedRevision = ++revision.current;
    updateStatus("saving");
    // Serialize writes so an older, slower save cannot replace newer history.
    const task = saveQueue.current.then(() => saveCareEvents(snapshot));
    saveQueue.current = task.catch(() => {});
    void task.then(
      () => {
        if (revision.current === requestedRevision) updateStatus("ready");
      },
      () => {
        if (revision.current === requestedRevision) updateStatus("save-error");
      }
    );
  }, [updateStatus]);

  const hydrate = useCallback(async () => {
    const request = ++loadRequest.current;
    updateStatus("loading");
    try {
      const saved = await loadCareEvents();
      if (!mounted.current || request !== loadRequest.current) return;
      const restored = saved === null
        ? eventsRef.current
        : normalizeLegacyEventDates(saved);
      eventsRef.current = restored;
      setEvents(restored);
      // Seed or normalize only after a successful read. A failed read never writes.
      persist(restored);
    } catch {
      if (mounted.current && request === loadRequest.current) updateStatus("load-error");
    }
  }, [persist, updateStatus]);

  useEffect(() => {
    mounted.current = true;
    void hydrate();
    return () => {
      mounted.current = false;
      ++loadRequest.current;
    };
  }, [hydrate]);

  function addEvent(event: CareEvent) {
    if (statusRef.current === "loading" || statusRef.current === "load-error") return;
    const next = [event, ...eventsRef.current];
    eventsRef.current = next;
    setEvents(next);
    persist(next);
  }

  function retry() {
    if (statusRef.current === "load-error") void hydrate();
    else if (statusRef.current === "save-error") persist(eventsRef.current);
  }

  async function refreshEvents(): Promise<CareEvent[]> {
    if (statusRef.current !== "ready") {
      throw new Error("Save pending events before refreshing history.");
    }
    const startingRevision = revision.current;
    const saved = await loadCareEvents();
    // A new local event added during refresh takes priority over the stale read.
    if (!mounted.current || startingRevision !== revision.current || saved === null) {
      return eventsRef.current;
    }
    const restored = normalizeLegacyEventDates(saved);
    eventsRef.current = restored;
    setEvents(restored);
    persist(restored);
    return restored;
  }

  return { events, status, addEvent, retry, refreshEvents };
}
