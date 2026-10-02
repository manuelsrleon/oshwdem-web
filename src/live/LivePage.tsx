import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "./LivePage.css";
import type { ActivityLocationEnum, ActivityStatusEnum, ActivityTypeEnum, MakerLevelEnum, MakerProposalTypeEnum } from "./database.types";
import {
  toTimeLabel,
  type Activity as LiveActivity,
} from "./OSHWDemActivityRepository";
import { useActivities } from "./useActivities";
import { toByline, type Maker } from "./OSHWDemMakerRepository";
import { useMakers } from "./useMakers";
import { EVENT_END, useEventInfo } from "./useEventInfo";
import { backgroundFor, type Background } from "./backgrounds";

// PENDING is deliberately absent: not yet announced, so it stays off the grid.
const VISIBLE_STATUSES: readonly ActivityStatusEnum[] = [
  "CONFIRMED",
  "MOVED",
  "CANCELLED",
];

type Activity = {
  id: string;
  title: string;
  author?: string;
  type: ActivityTypeEnum;
  location: ActivityLocationEnum | "General";
  start: string;
  end: string;
  precheckStart?: string;
  notes?: string;
  inscriptionLink?: string;
  status?: ActivityStatusEnum;
  background?: Background;
  href?: string;
};

type Stand = {
  id: string;
  name: string;
  description: string;
  exhibitors: string;
  location: "maker@domus";
  start: string;
  end: string;
  interactive: boolean;
}

// Kept for reference until every activity lives in Supabase. Exported only so
// `noUnusedLocals` doesn't fail the build while it sits unused — delete both
// the export and this comment once the table is fully populated.
// eslint-disable-next-line react-refresh/only-export-components
export const activities_old: Activity[] = [
  { id: "soldadura", title: "Iniciación a la Soldadura", author: "Manuel Miramontes - BricoLabs", type: "Taller", location: "maker@domus", start: "10:30", end: "12:00" },
  //exposiciones
  { id: "expo1", title: "Exposición maker (mañana)", type: "Stand", location: "maker@domus", start: "10:15", end: "14:00" },
  { id: "expo2", title: "Exposición maker (tarde)", type: "Stand", location: "maker@domus", start: "15:00", end: "19:00" },
  //charlas y talleres
  { id: "router1", title: "Lanzamiento del proyecto OpenRAFs", author: "bluepasser", type: "Charla", location: "Laboratorio", start: "11:30", end: "12:00" },
  { id: "router2", title: "Crea tu nodo openRAFs: ¡trae un router viejo y una memoria USB! (no es obligatorio)", author: "bluepasser", type: "Taller", location: "Laboratorio", start: "12:00", end: "13:00" },
  { id: "bretalk", title: "Sobre el Banco de Reciclaxe", author: "Banco de Reciclaxe - Ingeniería Sin Fronteras", type: "Charla", location: "Laboratorio", start: "13:00", end: "13:30" },
  { id: "belectro", title: "Creación de Bisutería Electrónica", author: "María José Lara, Mercedes Lara, Marga - BricoLabs", type: "Taller", location: "maker@domus", start: "15:30", end: "17:00" },
  { id: "pcbcnc", title: "Diseño y fabricación de placas PCB con máquina CNC: De KiCad al GCode. Si puedes, ¡trae un portátil con el último KiCad y GIMP!", author: "Luis Díaz-Faes - A Industriosa", type: "Taller", location: "Laboratorio", start: "15:00", end: "16:00" },
  { id: "radiotalk", title: "RADIOAFICIÓN... en modo breve.", author: "URE, CTGURE, URC", type: "Charla", location: "Laboratorio", start: "16:00", end: "16:30" },
  { id: "oprobotsmicro", title: "Primeros pasos en un robot MicroMouse", author: "OPRobots", type: "Charla", location: "Laboratorio", start: "18:30", end: "19:00" },
  
  //competiciones
  { id: "descanso", title: "Descanso", type: "Otro", location: "General", start: "14:00", end: "15:00" },
  { id: "cierre", title: "Cierre", type: "Otro", location: "General", start: "19:00", end: "19:30" },
];

export const competitions = [
  { id: "laberinto", title: "Laberinto", type: "Competicion", location: "Auditorio", start: "10:30", end: "12:00", rule_link: "https://rules.oshwdem.org/labirinto_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  { id: "combate", title: "Combate", type: "Competicion", location: "Auditorio", start: "12:00", end: "13:00", rule_link: "https://rules.oshwdem.org/combate_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  { id: "siguelineas", title: "Siguelíneas", type: "Competicion", location: "Auditorio", start: "13:00", end: "14:00", rule_link: "https://rules.oshwdem.org/seguelinhas_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  { id: "velocistas", title: "Velocistas", type: "Competicion", location: "Auditorio", start: "15:00", end: "16:30", rule_link: "https://rules.oshwdem.org/velocistas_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  // { id: "persecucion_velocistas", title: "Persecución velocistas", type:" Competicion", location: "Auditorio", start:"15:00", end: "16:30", rule_link: "https://rules.oshwdem.org/persecucion_velocistas_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  { id: "minisumo", title: "Mini-Sumo", type: "Competicion", location: "Auditorio", start: "16:30", end: "18:00", rule_link: "https://rules.oshwdem.org/loita_sumo_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
  { id: "hebocon", title: "Hebocon", type: "Competicion", location: "Auditorio", start: "18:00", end: "19:00", rule_link: "https://rules.oshwdem.org/hebocon_es", "inscription_link": "https://opnform.com/forms/inscripcion-competiciones-oshwdem-2026-uknhkw", "robot_inspection_time": ""},
]
// Last year's exhibitors. Nothing is signed up for this year yet, so the page
// shows mystery stands instead — kept here until sign-ups land. Exported only so
// `noUnusedLocals` doesn't fail the build while it sits unused.
// eslint-disable-next-line react-refresh/only-export-components
export const stands_old: Stand[] = [
  {id: "scandlive", name: "Scandlive",exhibitors: "Gerardo Barbarov", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Actividad visual interactiva que permite la participación del público asistente a la OSHWDem, creando versiones virtuales personalizadas de la mascota del evento OSHWi, mediante el uso de plantillas para pintar, modelar con plastilina o montar puzzles. Mas info en www.scandlive.orgDemo del código Processing: https://gitlab.com/SingularDevices/scandlive_oshwy_demo" },
  {id: "oledrace", name: "Open LED Race",exhibitors: "Gerardo Barbarov", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Open LED race es un juego minimalista de coches de carreras donde se utiliza una tira de LEDs inteligentes (Neopíxeles), un arduino y varios pulsadores a modo de mandos. Para que avance un coche tienes que apretar un pulsador. Cuanto más rápido lo aprietes más rápido irá tu coche. En las rampas de ascenso del circuito debes presionar más rápidamente para compensar el efecto de la gravedad simulada. Es un proyecto de código abierto, nacido en el Arduino Day de Sevilla en 2019. https://openledrace.net/proyecto-abierto/?lang=es" },
  {id: "ti", name: "Talentos Inclusivos (CITIC)", exhibitors: "Equipo Talentos Inclusivos", location: "maker@domus", start: "10:00", end: "14:00", interactive: true, description: "Tecnolo^gías accesibles: Realidad Virtual, juegos para el trabajo de habilidades cognitivas en personas con discapacidad intelectual.  Switch, Mario Kart con adaptación para el manejo de mando a través do tronco o de la cabeza.  Juegos personalizados para el ámbito de las personas con discapacidad: “Compra con-migo».  Demostración de pintura con producto de apoyo de cabeza y exposición de retos tecnológicos del proyecto Talentos Inclusivos."},
  {id: "sarmy", name: "SysArmy Galicia (Comunidad)", exhibitors: "Tizi & Nacho", location: "maker@domus", start: "10:00", end: "17:00", interactive: true,  description: "El soporte de los que dan soporte. Compartir diversos cacharros con relación a la administración de sistemas. Juego con leaderboard de montaje de cables de red a contrarreloj"},
  {id: "crecercreando", name: "Crecer Creando", exhibitors: "Ana Rodríguez", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Crecer Creando presenta dos propuestas educativas con licencia libre: Invasión: un juego matemático para entrenar cálculo mental de forma competitiva y divertida. Pirámides fractales: un reto de lógica y razonamiento espacial en impresión 3D. Ambos forman parte del método Crecer Creando, donde capacidades como el pensamiento computacional y el cálculo mental se entrenan desde el juego y la emoción."},
  {id: "bancoreciclaxe", name: "Banco de Reciclaxe Enxeñería Sen Fronteiras", exhibitors: "Sergio Alvariño, Jorge Lama", location: "maker@domus", start: "10:00", end: "19:00", interactive: false,  description: "Nuestra idea es presentar nuestras actividades al público, explicando las labores que llevamos a cabo en el Banco de Reciclaxe y también el Repair Café que hacemos en colaboración con BricoLabs."},
  {id: "aindustriosa", name: "A Industriosa", exhibitors: "A Industriosa", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "A Industriosa é un laboratorio tecnolóxico que desenvolve a súa actividade de promoción e difusión das tecnoloxias libres na zona de Vigo. Este ano propoñemos un stand no que amosar or proxectos máis destacados da asociación."},
  {id: "bricolabs", name: "BricoLabs", exhibitors: "Manuel Folla Saura & Manuel Miramontes, Luigi Pirelli, manuelsrleon + organización y voluntarios OSHWDem", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "BricoLabs es la asociación que organiza el evento. Es un makerspace de tecnologías libres con el fin de divulgar sobre tecnología, electrónica. A veces es difícil de definir, porque en BricoLabs hacemos cualquier cosa. Lo que nos une a todos es la curiosidad, el compañerismo y las ganas de aprender. Manuel Miramontes y Manuel Folla traerán una maqueta increíble de un edificio emblemático de Sada, mientras que Luigi nos mostrará su conocimiento enciclopédico sobre baterías de coches eléctricos y cargadores abiertos. Manuel Santamariña (un servidor) tendrá la impresora a todo cañón probablemente imprimiendo recuerdos de la OSHWDem y dando la turra sobre impresión 3D, programación, derecho a reparar, matemáticas aplicadas y soberanía digital."},
  // {id: "gpul", name: "GPUL", exhibitors: "Manuel Folla Saura, Luigi Pirelli, los de la orga que pilléis por ahí", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "A Industriosa é un laboratorio tecnolóxico que desenvolve a súa actividade de promoción e difusión das tecnoloxias libres na zona de Vigo. Este ano propoñemos un stand no que amosar or proxectos máis destacados da asociación."},
  {id: "ucu", name: "URE, CTGURE, URC", exhibitors: "Domingo Molejon Varela, +3", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "Este stand representa a tres asociaciones: la Unión de Radioaficionados Españoles, el Consejo territorial de Galicia de URE y la Unión de Radioaficionados Coruña. ¡Pásate por aquí si te interesa la radioafición!" }
]

const locations = ["maker@domus (3ª planta)", "Laboratorio (2ª planta)", "Competiciones (Auditorio, planta 0)"];

const livestreamingURL = "streaming.eis.gal";

// oshwdem_activity.type -> the CSS/layout categories the grid understands.

// Maps a row from Supabase onto the shape the grid renders.
// NOTE: oshwdem_activity has no author column, so `sponsor` stands in for it.
function toGridActivity(activity: LiveActivity): Activity {
  return {
    id: String(activity.id),
    title: activity.name,
    author: activity.sponsor ?? undefined,
    type: activity.type,
    location: activity.location ?? "General",
    start: toTimeLabel(activity.startsAt),
    end: toTimeLabel(activity.endsAt),
    precheckStart: toTimeLabel(activity.precheckStart) || undefined,
    status: activity.status,
    background: backgroundFor(String(activity.id)),
  };
}

// Call-for-makers proposals that belong on the timetable. Stands are on all day
// and listed in the Puestos section instead.
const TIMETABLE_MAKER_TYPES: Partial<Record<MakerProposalTypeEnum, ActivityTypeEnum>> = {
  TALK: "Charla",
  WORKSHOP_EVERYONE: "Taller",
};

// A maker's talk or workshop as a grid activity, once it has been given a slot:
// a start, an end (or a duration, which toMaker turns into one) and a place.
function makerToGridActivity(maker: Maker): Activity | null {
  const type = TIMETABLE_MAKER_TYPES[maker.proposalType];
  if (!type || !maker.startsAt || !maker.endsAt || !maker.location) return null;

  return {
    id: `maker-${maker.id}`,
    title: maker.projectName,
    author: toByline(maker) ?? undefined,
    type,
    location: maker.location,
    start: toTimeLabel(maker.startsAt),
    end: toTimeLabel(maker.endsAt),
    notes: maker.notes ?? undefined,
    inscriptionLink: maker.inscriptionLink ?? undefined,
    status: "CONFIRMED",
    background: backgroundFor(maker.background, maker.submissionId),
    href: `#${makerAnchor(maker)}`,
  };
}

// Activities whose title gets the larger .activity-title treatment on the grid.
const TITLED_TYPES: readonly ActivityTypeEnum[] = ["Competicion", "Exposicion", "Charla", "Taller"];

const MINUTES_PER_ROW = 30;
// Gaps are teased an hour at a time, not half-hour at a time.
const MYSTERY_MINUTES = 60;
// Only the Laboratorio column is still being filled in. The other two are
// closed, so a hole there is a real hole, not something still to be announced.
const MYSTERY_COLUMN = 2;
// Line 1 is the location header, so the earliest activity starts on line 2.
const FIRST_ACTIVITY_LINE = 2;

// Medal artwork lives in public/medallas, one SVG per competition.
function medalStyle(slug: string): CSSProperties {
  return { "--competition-medal": `url(/medallas/${slug}.svg)` } as CSSProperties;
}

// Timetable rows only have a name, so the medal is found by slugging it the way
// the files are named: "Mini-Sumo" -> "minisumo", "Siguelíneas" -> "siguelineas".
function toMedalSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Convert minutes-past-midnight → grid line, counting from the earliest activity
// on the board. The origin has to follow the data: a fixed one puts anything
// earlier on line 0 or below, which is invalid CSS (lines start at 1) and gets
// silently auto-placed at the end of the grid.
function minutesToRow(minutes: number, originMinutes: number): number {
  const offset = minutes - originMinutes;
  return Math.floor(offset / MINUTES_PER_ROW) + FIRST_ACTIVITY_LINE;
}

function timeToRow(time: string, originMinutes: number): number {
  return minutesToRow(toMinutes(time), originMinutes);
}

// Which column a location owns. General has no column of its own — it spans all
// three, so it counts as busy everywhere.
function columnOf(location: Activity["location"]): number | null {
  if (location === "maker@domus") return 1;
  if (location === "Laboratorio") return 2;
  if (location === "Auditorio") return 3;
  return null;
}

// A placeholder standing in for an activity nobody has announced yet.
type MysteryActivity = {
  key: string;
  column: number;
  startRow: number;
  endRow: number;
};

// One mystery activity per hour-long hole in the column. Only wholly empty
// hours qualify: one that overlapped a real activity would sit behind it and
// show through the gap between cells.
function findMysteryActivities(
  activities: Activity[],
  originMinutes: number,
): MysteryActivity[] {
  if (activities.length === 0) return [];

  const lastMinute = Math.max(...activities.map(act => toMinutes(act.end || act.start)));
  const mysteries: MysteryActivity[] = [];

  for (let start = originMinutes; start < lastMinute; start += MYSTERY_MINUTES) {
    // The last one is clipped so the mystery never runs past closing time and
    // stretches the grid with rows nothing else occupies.
    const end = Math.min(start + MYSTERY_MINUTES, lastMinute);

    const busy = activities.some(act => {
      const actColumn = columnOf(act.location);
      if (actColumn !== null && actColumn !== MYSTERY_COLUMN) return false;
      return toMinutes(act.start) < end && toMinutes(act.end || act.start) > start;
    });
    if (busy) continue;

    const startRow = minutesToRow(start, originMinutes);
    mysteries.push({
      key: `mystery-${start}`,
      column: MYSTERY_COLUMN,
      startRow,
      endRow: Math.max(minutesToRow(end, originMinutes), startRow + 1),
    });
  }

  return mysteries;
}
export default function SchedulePage() {
  return (
    
    <div id="schedule-page-container"> 
    <header className="live-header">
        <div className="live-header-brand">
          <img src="/logo-oshwdem-2026.svg" className="schedule-oshwdem-logo" alt="OSHWDem 2026" />
        </div>
        <div className="live-header-event">
          <Countdown></Countdown>
          <p className="event-date">Sábado, 3 de octubre de 2026</p>
        </div>
        <div id="livestreaming-container">
          <LivestreamingBanner></LivestreamingBanner>
        </div>
        <ScrollHint></ScrollHint>
    </header>
    <ContentMarquee></ContentMarquee>
    <Schedule></Schedule> 
    <SponsorsAndCollaborators></SponsorsAndCollaborators>
    <Competitions></Competitions>
    <Stands></Stands>
    <BackToTop></BackToTop>
    </div>
    
  )
}

function Countdown() {
  const { start, now, hasStarted, hasEnded } = useEventInfo({ tickMs: 1000 });

  if (hasEnded) {
    return <p className="countdown-message">¡Gracias por venir! Nos vemos en la próxima edición</p>;
  }
  if (hasStarted) {
    return <p className="countdown-message countdown-live">¡Estamos en marcha!</p>;
  }

  const totalSeconds = Math.floor((start.getTime() - now) / 1000);
  const units = [
    { label: "días", value: Math.floor(totalSeconds / 86400) },
    { label: "horas", value: Math.floor(totalSeconds / 3600) % 24 },
    { label: "min", value: Math.floor(totalSeconds / 60) % 60 },
    { label: "seg", value: totalSeconds % 60 },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Cuenta atrás para OSHWDem 2026">
      {units.map(unit => (
        <div className="countdown-unit" key={unit.label}>
          <span className="countdown-value">{String(unit.value).padStart(2, "0")}</span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScrollHint() {
  const scrollPastHeader = (event: React.MouseEvent<HTMLButtonElement>) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    event.currentTarget.closest("header")?.nextElementSibling?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button type="button" className="scroll-hint" onClick={scrollPastHeader}>
      Ver más
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

const BACK_TO_TOP_THRESHOLD = 600;

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > BACK_TO_TOP_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? " visible" : ""}`}
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
    >
      <svg className="back-to-top-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Volver arriba
    </button>
  );
}
export function LivestreamingBanner() {
  return ( 
    <a id="livestreaming-banner" href={`https://${livestreamingURL}`} target="_blank" rel="noopener noreferrer">
      <img className="livestreaming-logo" src="/sponsor-logos/Logo2Negro_EIS.png" alt="Escola de Imaxe e Son" />
      <span className="livestreaming-text">
        <span className="livestreaming-cta">Ver en directo</span>
        <span className="livestreaming-url">{livestreamingURL}</span>
        <span className="livestreaming-credit">Retransmisión de la EIS</span>
      </span>
    </a>
  )
}
export function ComingSoon() {
  return (
    <div id="coming-soon">¡Próximamente!</div> 
  )
}
// Until makers are published (and while they load), the exposition is teased
// rather than listed: a few mystery stands that dissolve down the page.
const MYSTERY_STANDS = 5;

const PROPOSAL_TYPE_LABELS: Record<MakerProposalTypeEnum, string> = {
  STAND: "Stand",
  TALK: "Charla",
  WORKSHOP_EVERYONE: "Taller",
};

const LEVEL_LABELS: Record<MakerLevelEnum, string> = {
  EVERYONE: "Para todos los públicos",
  BEGINNER: "Para usuarios principiantes",
  ADVANCED: "Usuarios avanzados",
};

const PROPOSAL_TYPE_FILTERS: { type: MakerProposalTypeEnum; label: string }[] = [
  { type: "STAND", label: "Stands" },
  { type: "TALK", label: "Charlas" },
  { type: "WORKSHOP_EVERYONE", label: "Talleres" },
];

function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function makerMatches(maker: Maker, query: string): boolean {
  const haystack = [
    maker.projectName,
    maker.description,
    maker.participants,
    maker.organization,
    ...maker.tags,
  ].filter(Boolean).join(" ");
  const normalized = normalizeForSearch(haystack);
  return normalizeForSearch(query).split(/\s+/).filter(Boolean).every(term => normalized.includes(term));
}

export function Stands() {
  const { makers, loading, error } = useMakers();
  const [filter, setFilter] = useState<MakerProposalTypeEnum | null>(null);
  const [query, setQuery] = useState("");
  const searchedMakers = useMemo(
    () => query.trim() ? makers.filter(maker => makerMatches(maker, query)) : makers,
    [makers, query],
  );
  const visibleMakers = filter ? searchedMakers.filter(maker => maker.proposalType === filter) : searchedMakers;

  useEffect(() => {
    if (loading || !window.location.hash) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }, [loading]);

  return (
    <section>
      <div className="heading-row md-v">
        <h2>Puestos, talleres, conferencias y actividades ;) </h2> 
        <Call4MakersSign></Call4MakersSign>
      </div>
      {error ? (
        <div className="schedule-status schedule-error">
          ¡No se pudieron cargar los puestos y talleres! Comprueba tu conexión a internet.
        </div>
      ) : loading || makers.length === 0 ? (
        <div className="stands-container teaser">
          {Array.from({ length: MYSTERY_STANDS }, (_, i) => (
            <div className="stand mystery" key={i}>
              <span className="mystery-label">Stand sin desvelar</span>
              <div className="mystery-pattern" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="maker-toolbar">
            <div className="maker-search">
              <svg className="maker-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                type="search"
                className="maker-search-input"
                placeholder="Buscar puestos, charlas, talleres…"
                aria-label="Buscar puestos, charlas y talleres"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </div>
            <div className="maker-filters" role="group" aria-label="Filtrar por tipo">
              <button
                type="button"
                className="maker-filter"
                aria-pressed={filter === null}
                onClick={() => setFilter(null)}
              >
                Todo <span className="maker-filter-count">{searchedMakers.length}</span>
              </button>
              {PROPOSAL_TYPE_FILTERS.map(({ type, label }) => {
                const count = searchedMakers.filter(maker => maker.proposalType === type).length;
                if (count === 0 && filter !== type) return null;
                return (
                  <button
                    type="button"
                    key={type}
                    className={`maker-filter maker-filter-${type.toLowerCase()}`}
                    aria-pressed={filter === type}
                    onClick={() => setFilter(filter === type ? null : type)}
                  >
                    {label} <span className="maker-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {visibleMakers.length === 0 ? (
            <p className="maker-search-empty">No hay nada que coincida con «{query.trim()}».</p>
          ) : (
            <div className="stands-container">
              {visibleMakers.map(maker => <MakerCard key={maker.id} maker={maker} />)}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function makerAnchor(maker: Maker): string {
  return `maker-${maker.submissionId ?? maker.id}`;
}

function competitionAnchor(slug: string): string {
  return `competition-${slug}`;
}

function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
  );
}

function InscriptionButton({ url }: { url: string }) {
  const open = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <span
      className="activity-inscription"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") open(event);
      }}
    >
      Inscribirse
    </span>
  );
}

function CardBackground({ background }: { background: Background }) {
  if (background.video) {
    return (
      <video
        className="card-background"
        src={background.url}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        ref={video => {
          if (!video) return;
          video.muted = true;
          video.play().catch(() => {});
        }}
      />
    );
  }
  return <div className="card-background" style={{ backgroundImage: `url("${background.url}")` }} aria-hidden="true" />;
}

function MakerCard({ maker }: { maker: Maker }) {
  const byline = toByline(maker);
  const background = backgroundFor(maker.background, maker.submissionId);
  const time = maker.startsAt && maker.endsAt
    ? `${toTimeLabel(maker.startsAt)} - ${toTimeLabel(maker.endsAt)}`
    : maker.startsAt
      ? toTimeLabel(maker.startsAt)
      : null;

  return (
    <article id={makerAnchor(maker)} className={`stand maker-${maker.proposalType.toLowerCase()} ${background ? "has-background" : ""}`}>
      {background ? <CardBackground background={background} /> : null}
      <div className="maker-header">
        {maker.logo ? (
          <img
            className="maker-logo"
            src={maker.logo}
            alt=""
            loading="lazy"
            // A dead link (e.g. an expired form upload) shouldn't leave a broken image.
            onError={event => { event.currentTarget.hidden = true; }}
          />
        ) : null}
        <div>
          <div className="maker-pills">
            <span className="maker-type">{PROPOSAL_TYPE_LABELS[maker.proposalType] ?? maker.proposalType}</span>
            {maker.level ? <span className={`maker-level maker-level-${maker.level.toLowerCase()}`}>{LEVEL_LABELS[maker.level]}</span> : null}
          </div>
          <h3 className="maker-name">{maker.projectName}</h3>
          {byline ? <p className="stand-exhibitors">{byline}</p> : null}
        </div>
      </div>
      {maker.location || time || maker.durationMinutes ? (
        <ul className="maker-details">
          {maker.location ? <li>📍 {maker.location}</li> : null}
          {time ? <li className="stand-time">🕑 {time}</li> : null}
          {maker.durationMinutes ? <li>⏱️ {maker.durationMinutes} min</li> : null}
        </ul>
      ) : null}
      {maker.notes ? <p className="maker-notes"><span className="activity-notes">{maker.notes}</span></p> : null}
      {maker.tags.length > 0 ? (
        <ul className="maker-tags" aria-label="Temas">
          {maker.tags.map(tag => <li key={tag}>{tag}</li>)}
        </ul>
      ) : null}
      {maker.description ? <p className="maker-description">{withBold(maker.description)}</p> : null}
      {maker.link || maker.inscriptionLink ? (
        <div className="maker-links">
          {maker.inscriptionLink ? (
            <a className="maker-link" href={maker.inscriptionLink} target="_blank" rel="noopener noreferrer">
              Inscribirse
            </a>
          ) : null}
          {maker.link ? (
            <a className="maker-link" href={maker.link} target="_blank" rel="noopener noreferrer">
              Más información
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
export function TalksAndWorkshops() {
  return <section className="tw-container">
    <h2>¡Charlas! ¡Talleres!</h2>
    <div className="activity-tw talk">
      <img src="" alt="" />
      <h3>LANZANDO PRODUCTOS OPEN SOURCE</h3>
      <h4>Oliver Bennington</h4>
      <p>Pecera - 10:00 - 12:00</p>
      <p max-participants>15/30 asientos</p>
    </div>
    <div className="activity-tw workshop">
      <h3>Test de taller</h3>
    </div>
    <div className="is-full">

    </div>
  </section>
}

function isClosing(act: Activity): boolean {
  return act.type == "Otro" && act.location == "General" && act.start == toTimeLabel(EVENT_END);
}

const FAMILY_PHOTO: Activity = {
  id: "foto-familia",
  title: "Foto familia (Makers, competidores, voluntarios y organizadores)",
  type: "Otro",
  location: "General",
  start: "19:10",
  end: "",
  status: "CONFIRMED",
};

export function Schedule() {
  const { activities: liveActivities, loading, error } = useActivities({
    statuses: VISIBLE_STATUSES,
  });
  // Makers only add to the board, so if they fail to load the timetable still
  // shows everything else rather than an error.
  const { makers, loading: makersLoading } = useMakers();
  const { inscriptionsClosed } = useEventInfo();

  // Rows without a start/end can't be placed on the grid.
  const activities = [
    ...liveActivities
      .filter(act => act.startsAt && act.endsAt)
      .map(toGridActivity),
    ...makers.flatMap(maker => makerToGridActivity(maker) ?? []),
    FAMILY_PHOTO,
  ];
  const generalRowsTaken = new Set<number>();

  const originMinutes = activities.length
    ? Math.floor(
        Math.min(...activities.map(act => toMinutes(act.start))) / MINUTES_PER_ROW,
      ) * MINUTES_PER_ROW
    : 0;

  const mysteryActivities = inscriptionsClosed ? [] : findMysteryActivities(activities, originMinutes);

  if (loading || makersLoading) {
    return (
      <section>
        <h2>🕑 Programa del evento</h2>
        <div className="schedule-loading" role="status">
          <span className="spinner" aria-hidden="true" />
          <span>Cargando programa…</span>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <div className="schedule-status schedule-error">
        ¡No se pudo cargar el programa! ¡Comprueba tu conexión a internet! O quizás nuestra base de datos esté de vacaciones.
      </div>
    );
  }
  if (activities.length === 0) return <ComingSoon />;

  return (
    <>
    <section>
      <h2>🕑 Programa del evento</h2>
      <div className="schedule-container">
        <div className="schedule">

          {locations.map(loc => (
            <div key={loc} className="schedule-header">{loc}</div>
          ))}

          {/* Before the real activities in the DOM so they paint underneath them. */}
          {mysteryActivities.map(mystery => (
            <div
              key={mystery.key}
              className="activity mystery"
              style={{
                gridColumn: mystery.column,
                gridRow: `${mystery.startRow} / ${mystery.endRow}`,
              }}
            >
              <span className="mystery-label">Sin actividad confirmada todavía</span>
              <div className="mystery-pattern" aria-hidden="true" />
            </div>
          ))}

          {/* Activities */}
          {activities.map(act => {
            let startRow = timeToRow(act.start, originMinutes);
            // Never let an activity collapse to zero rows: one shorter than a row
            // (or with end == start) still needs to occupy a cell.
            let endRow = Math.max(timeToRow(act.end || act.start, originMinutes), startRow + 1);
            if (act.location === "General") {
              while (generalRowsTaken.has(startRow)) {
                startRow++;
                endRow++;
              }
              generalRowsTaken.add(startRow);
            }

            // General has no column of its own, so it spans all three.
            const col = columnOf(act.location) ?? "1 / span 3";
            const isCompetition = act.type == "Competicion";
            const href = act.href ?? (isCompetition ? `#${competitionAnchor(toMedalSlug(act.title))}` : undefined);
            const cellProps = {
              className: `activity ${act.type.toLowerCase()} ${act.status ? `status-${act.status.toLowerCase()}` : ""} ${isCompetition ? "medal-pattern" : ""} ${act.background ? "has-background" : ""} ${href ? "activity-link" : ""}`,
              style: {
                ...(isCompetition ? medalStyle(toMedalSlug(act.title)) : {}),
                gridColumn: col,
                gridRow: `${startRow} / ${endRow}`
              },
            };

            const content = (
              <>
                {act.background ? <CardBackground background={act.background} /> : null}
                {act.type == "Taller"?
                <>
                  <div className="taller-marker">
                    Taller
                  </div>
                </>:<></>}
                {act.type == "Charla"?<>
                <div className="charla-marker">
                    Charla
                  </div>
                </>:<></>}
                {act.status == "MOVED"?
                  <div className="status-marker moved-marker">Movida</div>
                :<></>}
                {act.status == "CANCELLED"?
                  <div className="status-marker cancelled-marker">Cancelada</div>
                :<></>}
                <div className={act.type+"-badge"}></div>
                {/* One line each; the time sits right under the title so it's
                    the second thing you read. */}
                <div className="activity-text">
                    <strong className={TITLED_TYPES.includes(act.type) ? "activity-title" : undefined}>{act.title}</strong>
                    <span className="activity-timeframe">{act.end && !isClosing(act) ? act.start+" - "+act.end : act.start}</span>
                    {act.author?
                    <span className="activity-author">{act.author}</span>
                    :<></>}
                    {act.type == "Competicion" && act.precheckStart?
                    <span className="activity-precheck">{"Verificación: "+act.precheckStart}</span>
                    :<></>}
                    {act.notes?
                    <span className="activity-notes">{act.notes}</span>
                    :<></>}
                    {act.inscriptionLink?
                    <InscriptionButton url={act.inscriptionLink} />
                    :<></>}
                </div>
              </>
            );

            return href
              ? <a key={act.id} href={href} {...cellProps}>{content}</a>
              : <div key={act.id} {...cellProps}>{content}</div>;
          })}
        </div>
      </div>
      Según se vayan confirmando charlas y actividades, las verás aquí.
    </section>
    </>
  );
}
  export function ContentMarquee(){
    return <div className="content-marquee">
      Tecnologías Libres - Robótica - Impresión 3D - Radioafición - Meshtastic - Right to Repair - Repair Café
    </div>
  }
  export function Inscriptions(){
    return <section> 
    </section>
  }
  
  export function Competitions(){
    const { inscriptionsClosed } = useEventInfo();
    return <section>
    <h2>Competiciones</h2>
    <div className="competition-container">
        {
        competitions.map( (competition, index) => 
          <div
            key={competition.id}
            id={competitionAnchor(competition.id)}
            className="competition medal-pattern"
            style={medalStyle(competition.id)}
          >
        <h3>{String(index+1).padStart(2,"0")} {competition.title}</h3>
        <div className="competition-links">
          <a href={competition.rule_link} className="competition-link">Reglas</a>
          {inscriptionsClosed ? null : <a href={competition.inscription_link} className="competition-link">Inscribirse</a>}
        </div>
        </div>)
        }
    </div>
    </section>
  }

type Supporter = {
  name: string;
  image: string;
  link: string;
  tier: number;
  monochrome: boolean;
};

// The source of truth for 2026's sponsors and collaborators. Deliberately not
// read from OSHWDemCollaboratorRepository (oshwdem_collaborator) this edition.
const sponsors: Supporter[] = [
  {name: "Arduino", image: "/sponsor-logos/arduino.svg", link: "https://arduino.cc", tier: 0, monochrome: false},
  {name: "BricoGeek", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/bricogeek.jpg?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9icmljb2dlZWsuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTg1Nzg3MCwiZXhwIjoxNzk4NDk3ODcwfQ.CNfuwgUVQoGRTs1CyNpPaqRqNyHB_iC0oiUSg1GewsY", link: "https://tienda.bricogeek.com", tier: 1, monochrome: false},
  {name: "SOBotz", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/sobotz-white.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9zb2JvdHotd2hpdGUucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTkzMTQwNiwiZXhwIjoxNzk4NTcxNDA2fQ.TopR_p7qsRT5rddkv6COsArSt_M6WpnvYW3dezATyxM", link: "https://sobotz.com", tier: 1, monochrome: true},
  {name: "Lithuanian Bots", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/lithuanianbots-white.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9saXRodWFuaWFuYm90cy13aGl0ZS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5OTMxNDIxLCJleHAiOjE3OTg1NzE0MjF9.iY9wk2lyXaqV1K46oGLMM1a_C91ehdMfGudzHRsYsXY", link: "https://lithuanianbots.com", tier: 1, monochrome: true},
  {name: "Cetronic", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/cetronic.jpg?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9jZXRyb25pYy5qcGciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg5OTMxNTUxLCJleHAiOjE3OTg1NzE1NTF9.0SoINkQgBWWfbVY6bCE3HBlZHk6A3Jb3EKMn_q3SgM0", link: "https://cetronic.es", tier: 1, monochrome: false},
  {name: "PCBWay", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/pcbway.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9wY2J3YXkucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTkzMTc1MSwiZXhwIjoxNzk4NTcxNzUxfQ.WViodH9HvpxOmAJ-4leIJFFRvcxtV6oIvutFFNbXtOg", link: "https://pcbway.com", tier: 1, monochrome: false},
];

const institutionalCollaborators: Supporter[] = [
  {name: "AMTEGA", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/amtega.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9hbXRlZ2EucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTkzMjA1NSwiZXhwIjoxNzk4NTcyMDU1fQ.5rYMY0MmFI6NKsCyAyFIQq2Eo1zURWopaZAiTFiR25M", link: "https://amtega.xunta.gal", tier: 0, monochrome: false},
  {name: "Museos Científicos", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/mc2.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9tYzIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTkzMTg0NywiZXhwIjoxNzk4NTcxODQ3fQ.3wcPOI8UOpIZutsItPx3NhXKuHOXHBfirbDOGUgcYOk", link: "https://www.coruna.gal/mc2/es", tier: 1, monochrome: false},
  {name: "Escola de Imaxe e Son", image: "https://ozlggtgqioxukkqvgrbm.supabase.co/storage/v1/object/sign/image_bucket/oshwdem_sponsors/eis.png?token=eyJraWQiOiJkMzA4MmI2OC1hNmYwLTQ2NzktYTI2My1iN2E3ZGY5OTYyOGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZV9idWNrZXQvb3Nod2RlbV9zcG9uc29ycy9laXMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4OTkzMTg5MCwiZXhwIjoxNzk4NTcxODkwfQ.sajMcr_buPBeab8NhZwdjmYrKy4n3AM2c_ypi0IVuGc", link: "https://eis.gal", tier: 1, monochrome: false},
  {name: "Concello de A Coruña", image: "/sponsor-logos/concello-da-coruna.png", link: "https://www.coruna.gal/", tier: 1, monochrome: false},
];

function byTier(a: Supporter, b: Supporter): number {
  return a.tier - b.tier;
}

function SupporterWall({ supporters }: { supporters: Supporter[] }) {
  return (
    <div className="supporter-wall">
      {[...supporters].sort(byTier).map(supporter => (
        <a
          key={supporter.name}
          className={`supporter-card tier-${supporter.tier} supporter-${toMedalSlug(supporter.name)}${supporter.monochrome ? " monochrome" : ""}`}
          href={supporter.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {supporter.image
            ? <img className="supporter-logo" src={supporter.image} alt={supporter.name} loading="lazy" />
            : <span className="supporter-name">{supporter.name}</span>}
        </a>
      ))}
    </div>
  );
}

const supporterGroups = [
  { heading: "🤝 Patrocinadores", supporters: sponsors },
  { heading: "🏛️ Colaboradores institucionales", supporters: institutionalCollaborators },
];

export function SponsorsAndCollaborators() {
  const groups = useMemo(
    () => (Math.random() < 0.5 ? supporterGroups : [...supporterGroups].reverse()),
    [],
  );

  return (
    <section id="sponsors-and-collaborators">
      <h2>⚡ Powered by</h2>
      <div className="supporter-groups">
        {groups.map(group => (
          <div className="supporter-group" key={group.heading}>
            <h3>{group.heading}</h3>
            <SupporterWall supporters={group.supporters} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function Call4MakersSign(){
  
  var call4MakersStatuses = ["SOON", "OPEN", "CLOSED", ]
  var call4MakersStatus = call4MakersStatuses[2]
  if (call4MakersStatus == "CLOSED") return null
  return <><div className={`call-button c4m-${call4MakersStatus.toLowerCase()}-glow`}>
          {call4MakersStatus == "SOON"? <div className="c4m-soon">🛠️ CALL 4 MAKERS: ¡PRÓXIMAMENTE!</div>: <></>}
          {call4MakersStatus == "OPEN"? <><div className="pulsating-text-lcd c4m-open">🛠️ CALL 4 MAKERS: ¡ABIERTO!</div><a href="https://opnform.com/forms/call4makers-oshwdem-2026-gpapqw" className="call-inscription">¡Envíanos tu propuesta aquí!</a></>: <></>}
          {call4MakersStatus == "CLOSED"? <div className="c4m-closed">🛠️ CALL 4 MAKERS: FINALIZADO</div>: <></>}
        </div>
        <div className="ribbon-ending"></div> 
        </>
}