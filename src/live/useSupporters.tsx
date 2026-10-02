import { useCallback, useEffect, useState } from "react";
import type { ActivityStatusEnum } from "./database.types";
import {
  createActivityRepository,
  type Activity,
  type ActivityQuery,
} from "./OSHWDemActivityRepository";

export type UseActivitiesResult = {
  activities: Activity[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
};


/** Fetches activities through OSHWDemActivityRepository (Supabase by default). */
export function useActivities(query: ActivityQuery = {}): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Reduced to primitives so a fresh `query` literal on every render doesn't
  // retrigger the effect.
  const { type } = query;
  const statusKey = query.statuses?.join(",") ?? "";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const statuses = statusKey
          ? (statusKey.split(",") as ActivityStatusEnum[])
          : undefined;
        const repository = await createActivityRepository();
        const rows = await repository.getAll({ type, statuses });
        if (!cancelled) setActivities(rows);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, statusKey, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { activities, loading, error, reload };
}
