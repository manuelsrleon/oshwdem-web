import { useEffect, useState } from "react";

export const EVENT_START = new Date("2026-10-03T10:00:00+02:00");
export const EVENT_END = new Date("2026-10-03T19:00:00+02:00");
export const INSCRIPTIONS_CLOSE = new Date(EVENT_START.getTime() - 7 * 24 * 60 * 60 * 1000);

export type UseEventInfoResult = {
  start: Date;
  end: Date;
  now: number;
  hasStarted: boolean;
  hasEnded: boolean;
  inscriptionsClosed: boolean;
};

const MAX_TIMEOUT_MS = 2_147_483_647;

export function useEventInfo({ tickMs }: { tickMs?: number } = {}): UseEventInfoResult {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (tickMs) {
      const id = window.setInterval(() => setNow(Date.now()), tickMs);
      return () => window.clearInterval(id);
    }
    const nextBoundary = [INSCRIPTIONS_CLOSE.getTime(), EVENT_START.getTime(), EVENT_END.getTime()].find(time => time > now);
    if (nextBoundary === undefined) return;
    const id = window.setTimeout(() => setNow(Date.now()), Math.min(nextBoundary - now, MAX_TIMEOUT_MS));
    return () => window.clearTimeout(id);
  }, [tickMs, now]);

  return {
    start: EVENT_START,
    end: EVENT_END,
    now,
    hasStarted: now >= EVENT_START.getTime(),
    hasEnded: now >= EVENT_END.getTime(),
    inscriptionsClosed: now >= INSCRIPTIONS_CLOSE.getTime(),
  };
}
