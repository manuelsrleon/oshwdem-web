import makersCsv from "./data/makers.csv?raw";
import {
  MakerLevelEnum,
  MakerLocationEnum,
  MakerProposalTypeEnum,
  type MakerRow,
} from "./database.types";
import { InMemoryMakerRepository, toMaker } from "./OSHWDemMakerRepository";

// Stand-in for oshwdem_maker until the data is in Supabase: the call-for-makers
// form's public export (makers_public_*.csv), bundled as data/makers.csv. Its
// columns are the table's, so each line goes through the same toMaker.

/** Reads data/makers.csv. */
export class CsvMakerRepository extends InMemoryMakerRepository {
  constructor(csv: string = makersCsv) {
    super(parseMakersCsv(csv).map(toMaker));
  }
}

export function parseMakersCsv(csv: string): MakerRow[] {
  const [header = [], ...records] = parseCsv(csv);
  return records
    .filter((record) => record.some((field) => field.trim() !== ""))
    .map((record, index) => {
      const field = (name: string) => record[header.indexOf(name)]?.trim() || null;
      return {
        // oshwdem_maker.id is a bigint; the form's own id goes in submission_id.
        id: index + 1,
        created_at: toIsoLocal(field("created_at")) ?? new Date(0).toISOString(),
        submission_id: field("id"),
        proposal_type: field("proposal_type") as MakerProposalTypeEnum,
        project_name: field("project_name") ?? "",
        description: field("description"),
        link_to_project: field("link_to_project"),
        inscription_link: field("inscription_link"),
        logo: field("logo"),
        participant_names: field("participant_names"),
        organization: field("organization"),
        sponsor_id: toInteger(field("sponsor_id")),
        duration_minutes: toInteger(field("duration_minutes")),
        // A value that isn't a time reads as no time rather than failing the page.
        start_time: toIsoLocal(field("start_time")),
        end_time: toIsoLocal(field("end_time")),
        location: toLocation(field("location")),
        tags: toTags(field("tags")),
        notes: field("notes"),
        level: toLevel(field("level")),
        background: field("background"),
      };
    });
}

// The column holds a Postgres array literal, {IA,"Impresión 3D"}, so the same
// file imports straight into the text[] column.
function toTags(value: string | null): string[] {
  if (value === null) return [];
  const inner = value.replace(/^\{|\}$/g, "");
  return inner === "" ? [] : parseCsv(inner)[0].map((tag) => tag.trim());
}

function toInteger(value: string | null): number | null {
  if (value === null) return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function toLevel(value: string | null): MakerLevelEnum | null {
  return Object.values(MakerLevelEnum).find((level) => level === value) ?? null;
}

function toLocation(value: string | null): MakerLocationEnum | null {
  return Object.values(MakerLocationEnum).find((location) => location === value) ?? null;
}

// The form writes "2026-09-28 16:56", which isn't ISO and which browsers don't
// all parse. With the space as a "T" it's read as local time.
function toIsoLocal(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** RFC 4180: comma-separated, fields optionally quoted, "" for a literal quote,
 *  and quoted fields may span lines (several descriptions do). */
function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}
