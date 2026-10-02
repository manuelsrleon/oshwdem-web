import { useCallback, useEffect, useState } from "react";
import {
  createMakerRepository,
  type Maker,
  type MakerQuery,
} from "./OSHWDemMakerRepository";

export type UseMakersResult = {
  makers: Maker[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

/** Fetches call-for-makers proposals through OSHWDemMakerRepository (Supabase by default). */
export function useMakers(query: MakerQuery = {}): UseMakersResult {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Reduced to a primitive so a fresh `query` literal on every render doesn't
  // retrigger the effect.
  const { proposalType } = query;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const repository = await createMakerRepository();
        const rows = await repository.getAll({ proposalType });
        if (!cancelled) setMakers(rows);
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
  }, [proposalType, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { makers, loading, error, reload };
}
