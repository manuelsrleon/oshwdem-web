import type {
  ActivityLocationEnum,
  MakerLevelEnum,
  MakerLocationEnum,
  MakerProposalTypeEnum,
  MakerRow,
} from "./database.types";
import { parseTimestamp } from "./OSHWDemActivityRepository";

/** A call-for-makers proposal: a stand, talk or workshop and who brings it.
 *  Kept apart from Activity because stands have no times and aren't on the
 *  timetable; a talk or workshop gets there as its own oshwdem_activity row. */
export type Maker = {
  id: number;
  submissionId: string | null;
  proposalType: MakerProposalTypeEnum;
  projectName: string;
  description: string;
  link: string | null;
  inscriptionLink: string | null;
  logo: string | null;
  participants: string | null;
  organization: string | null;
  sponsorId: number | null;
  durationMinutes: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  location: ActivityLocationEnum | null;
  tags: string[];
  notes: string | null;
  level: MakerLevelEnum | null;
  background: string | null;
  createdAt: Date;
};

export type MakerQuery = {
  proposalType?: MakerProposalTypeEnum;
};

/** Port. `csvMakerRepository` and `supabaseRepository` are the adapters. */
export interface OSHWDemMakerRepository {
  getAll(query?: MakerQuery): Promise<Maker[]>;
  getById(id: number): Promise<Maker | null>;
}

export class MakerRepositoryError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "MakerRepositoryError";
    this.cause = cause;
  }
}

const LOCATIONS: Record<MakerLocationEnum, ActivityLocationEnum> = {
  LAB: "Laboratorio",
  MAKER_AT_DOMUS: "maker@domus",
};

/** oshwdem_maker row -> Maker. Without an end time, the end is worked out from
 *  the duration the proposal asked for. */
export function toMaker(row: MakerRow): Maker {
  const startsAt = parseTimestamp(row.start_time);
  const endsAt = parseTimestamp(row.end_time)
    ?? (startsAt && row.duration_minutes
      ? new Date(startsAt.getTime() + row.duration_minutes * 60_000)
      : null);

  return {
    id: row.id,
    submissionId: row.submission_id,
    proposalType: row.proposal_type,
    projectName: row.project_name,
    description: row.description ?? "",
    link: row.link_to_project,
    inscriptionLink: row.inscription_link,
    logo: row.logo,
    participants: row.participant_names,
    organization: row.organization,
    sponsorId: row.sponsor_id,
    durationMinutes: row.duration_minutes,
    startsAt,
    endsAt,
    location: row.location ? LOCATIONS[row.location] : null,
    tags: row.tags ?? [],
    notes: row.notes,
    level: row.level ?? null,
    background: row.background ?? null,
    createdAt: new Date(row.created_at),
  };
}

/** "Names — Organization", or whichever of the two there is. */
export function toByline(maker: Maker): string | null {
  return [maker.participants, maker.organization].filter(Boolean).join(" — ") || null;
}

export function byProjectName(a: Maker, b: Maker): number {
  return a.projectName.localeCompare(b.projectName, "es");
}

/** Reads in-memory. Handy for tests and for rendering before the DB is filled. */
export class InMemoryMakerRepository implements OSHWDemMakerRepository {
  private readonly makers: Maker[];

  constructor(makers: Maker[] = []) {
    this.makers = makers;
  }

  async getAll(query: MakerQuery = {}): Promise<Maker[]> {
    return this.makers
      .filter((m) => (query.proposalType ? m.proposalType === query.proposalType : true))
      .sort(byProjectName);
  }

  async getById(id: number): Promise<Maker | null> {
    return this.makers.find((m) => m.id === id) ?? null;
  }
}

/** Resolves the adapter named by VITE_MAKER_SOURCE. Defaults to the bundled CSV
 *  until oshwdem_maker is filled in; switch to "supabase" then. */
export async function createMakerRepository(
  source: string = import.meta.env.VITE_MAKER_SOURCE ?? "csv",
): Promise<OSHWDemMakerRepository> {
  switch (source) {
    case "csv": {
      const { CsvMakerRepository } = await import("./csvMakerRepository");
      return new CsvMakerRepository();
    }
    case "supabase": {
      const { SupabaseMakerRepository } = await import("./supabaseRepository");
      return new SupabaseMakerRepository();
    }
    case "mock":
      return new InMemoryMakerRepository();
    default:
      throw new MakerRepositoryError(
        `Unknown VITE_MAKER_SOURCE "${source}" (expected "csv", "supabase" or "mock")`,
      );
  }
}
