import type {
  ActivityLocationEnum,
  ActivityRow,
  ActivityStatusEnum,
  ActivityTypeEnum,
} from "./database.types";

export type Activity = {
  id: number;
  name: string;
  type: ActivityTypeEnum;
  startsAt: Date | null;
  endsAt: Date | null;
  maxPeople: number | null;
  sponsor: string | null;
  status: ActivityStatusEnum;
  location: ActivityLocationEnum;
  createdAt: Date;
};

export type ActivityQuery = {
  type?: ActivityTypeEnum;
  /** Restrict to these statuses. Omit for all of them. */
  statuses?: readonly ActivityStatusEnum[];
};

/** Port. `supabaseRepository` and `pretalxRepository` are the adapters. */
export interface OSHWDemActivityRepository {
  getAll(query?: ActivityQuery): Promise<Activity[]>;
  getById(id: number): Promise<Activity | null>;
}

export class ActivityRepositoryError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ActivityRepositoryError";
    this.cause = cause;
  }
}

/** oshwdem_activity row -> Activity. */
export function toActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name ?? "",
    type: row.type,
    startsAt: parseTimestamp(row.starts_at),
    endsAt: parseTimestamp(row.ends_at),
    maxPeople: row.max_people,
    sponsor: row.sponsor,
    status: row.status ?? "PENDING",
    location: row.location,
    createdAt: new Date(row.created_at),
  };
}

function parseTimestamp(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "HH:mm" in event-local time, which is what the schedule grid indexes on. */
export function toTimeLabel(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Madrid",
  }).format(date);
}

/** Chronological, undated activities last. */
export function byStartTime(a: Activity, b: Activity): number {
  if (!a.startsAt) return 1;
  if (!b.startsAt) return -1;
  return a.startsAt.getTime() - b.startsAt.getTime();
}

/** Reads in-memory. Handy for tests and for rendering before the DB is filled. */
export class InMemoryActivityRepository implements OSHWDemActivityRepository {
  private readonly activities: Activity[];

  constructor(activities: Activity[] = []) {
    this.activities = activities;
  }

  async getAll(query: ActivityQuery = {}): Promise<Activity[]> {
    return this.activities
      .filter((a) => (query.type ? a.type === query.type : true))
      .filter((a) => (query.statuses ? query.statuses.includes(a.status) : true))
      .sort(byStartTime);
  }

  async getById(id: number): Promise<Activity | null> {
    return this.activities.find((a) => a.id === id) ?? null;
  }
}

/** Resolves the adapter named by VITE_ACTIVITY_SOURCE (default: supabase). */
export async function createActivityRepository(
  source: string = import.meta.env.VITE_ACTIVITY_SOURCE ?? "supabase",
): Promise<OSHWDemActivityRepository> {
  switch (source) {
    case "supabase": {
      const { SupabaseActivityRepository } = await import("./supabaseRepository");
      return new SupabaseActivityRepository();
    }
    case "mock":
      return new InMemoryActivityRepository();
    default:
      throw new ActivityRepositoryError(
        `Unknown VITE_ACTIVITY_SOURCE "${source}" (expected "supabase" or "mock")`,
      );
  }
}
