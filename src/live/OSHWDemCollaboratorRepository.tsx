import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollaboratorRow, Database } from "./database.types";

// Not wired up for 2026: sponsors and collaborators are hardcoded in LivePage
// (`sponsors`, `institutionalCollaborators`). Kept so oshwdem_collaborator can
// take over in a later edition.

export type Collaborator = {
  id: number;
  imageLink: string | null;
  link: string | null;
  order: number;
};

/** Port. `SupabaseCollaboratorRepository` is the adapter. */
export interface OSHWDemCollaboratorRepository {
  getAll(): Promise<Collaborator[]>;
  getById(id: number): Promise<Collaborator | null>;
}

export class CollaboratorRepositoryError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "CollaboratorRepositoryError";
    this.cause = cause;
  }
}

/** oshwdem_collaborator row -> Collaborator. */
export function toCollaborator(row: CollaboratorRow): Collaborator {
  return {
    id: row.id,
    imageLink: row.image_link,
    link: row.linked_webpage,
    order: row.order,
  };
}

export function byOrder(a: Collaborator, b: Collaborator): number {
  return a.order - b.order;
}

/** Reads in-memory. Handy for tests and for rendering before the DB is filled. */
export class InMemoryCollaboratorRepository implements OSHWDemCollaboratorRepository {
  private readonly collaborators: Collaborator[];

  constructor(collaborators: Collaborator[] = []) {
    this.collaborators = collaborators;
  }

  async getAll(): Promise<Collaborator[]> {
    return [...this.collaborators].sort(byOrder);
  }

  async getById(id: number): Promise<Collaborator | null> {
    return this.collaborators.find((c) => c.id === id) ?? null;
  }
}

export class SupabaseCollaboratorRepository implements OSHWDemCollaboratorRepository {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getAll(): Promise<Collaborator[]> {
    const { data, error } = await this.supabase
      .from("oshwdem_collaborator")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      throw new CollaboratorRepositoryError(
        `Could not load collaborators: ${error.message}`,
        error,
      );
    }
    return (data ?? []).map(toCollaborator);
  }

  async getById(id: number): Promise<Collaborator | null> {
    const { data, error } = await this.supabase
      .from("oshwdem_collaborator")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new CollaboratorRepositoryError(
        `Could not load collaborator ${id}: ${error.message}`,
        error,
      );
    }
    return data ? toCollaborator(data) : null;
  }
}
