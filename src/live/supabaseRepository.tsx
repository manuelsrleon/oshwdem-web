import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import {
  ActivityRepositoryError,
  toActivity,
  type Activity,
  type ActivityQuery,
  type OSHWDemActivityRepository,
} from "./OSHWDemActivityRepository";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Cast keeps the typed client happy: an override is assumed to have the same
// shape as oshwdem_activity (e.g. a per-edition table).
const ACTIVITIES_TABLE = (import.meta.env.VITE_SUPABASE_ACTIVITIES_TABLE ??
  "oshwdem_activity") as "oshwdem_activity";

let client: SupabaseClient<Database> | undefined;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new ActivityRepositoryError(
      "Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — check your .env and restart `npm run dev`",
    );
  }
  client ??= createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
  return client;
}

export class SupabaseActivityRepository implements OSHWDemActivityRepository {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database> = getSupabaseClient()) {
    this.supabase = supabase;
  }

  async getAll(query: ActivityQuery = {}): Promise<Activity[]> {
    let request = this.supabase
      .from(ACTIVITIES_TABLE)
      .select("*")
      .order("starts_at", { ascending: true, nullsFirst: false });

    if (query.type) request = request.eq("type", query.type);
    if (query.statuses?.length) request = request.in("status", [...query.statuses]);

    const { data, error } = await request;
    if (error) {
      throw new ActivityRepositoryError(
        `Could not load activities: ${error.message}`,
        error,
      );
    }
    return (data ?? []).map(toActivity);
  }

  async getById(id: number): Promise<Activity | null> {
    const { data, error } = await this.supabase
      .from(ACTIVITIES_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ActivityRepositoryError(
        `Could not load activity ${id}: ${error.message}`,
        error,
      );
    }
    return data ? toActivity(data) : null;
  }
}
