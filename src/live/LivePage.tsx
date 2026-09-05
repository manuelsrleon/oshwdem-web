import "./LivePage.css";
import type { ActivityLocationEnum, ActivityStatusEnum, ActivityTypeEnum } from "./database.types";
import {
  toTimeLabel,
  type Activity as LiveActivity,
} from "./OSHWDemActivityRepository";
import { useActivities } from "./useActivities";

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
  status?: ActivityStatusEnum;
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
const livestreamingAvailable = false; 

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
    status: activity.status,
  };
}

const MINUTES_PER_ROW = 30;
// Gaps are teased an hour at a time, not half-hour at a time.
const MYSTERY_MINUTES = 60;
// Only the Laboratorio column is still being filled in. The other two are
// closed, so a hole there is a real hole, not something still to be announced.
const MYSTERY_COLUMN = 2;
// Line 1 is the location header, so the earliest activity starts on line 2.
const FIRST_ACTIVITY_LINE = 2;

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

  const lastMinute = Math.max(...activities.map(act => toMinutes(act.end)));
  const mysteries: MysteryActivity[] = [];

  for (let start = originMinutes; start < lastMinute; start += MYSTERY_MINUTES) {
    // The last one is clipped so the mystery never runs past closing time and
    // stretches the grid with rows nothing else occupies.
    const end = Math.min(start + MYSTERY_MINUTES, lastMinute);

    const busy = activities.some(act => {
      const actColumn = columnOf(act.location);
      if (actColumn !== null && actColumn !== MYSTERY_COLUMN) return false;
      return toMinutes(act.start) < end && toMinutes(act.end) > start;
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
    <div className="live-header">
        <img src="/logo-oshwdem-2026.svg" className="schedule-oshwdem-logo" alt="" />
        <div id="livestreaming-container">
          <h3>Enlace a la retransmisión en directo:</h3>  
          {livestreamingURL && livestreamingAvailable?<LivestreamingBanner></LivestreamingBanner> :<ComingSoon></ComingSoon>}
        </div>        
    </div>
    <ContentMarquee></ContentMarquee>
    <Inscriptions></Inscriptions>
    <Schedule></Schedule> 
    <Competitions></Competitions>
    {/* <TalksAndWorkshops></TalksAndWorkshops> */}
    <Stands></Stands>
    </div>
    
  )
}
export function LivestreamingBanner() {
  return ( 
    <div id="livestreaming-banner">
     <p> Proporcionado por la EIS</p>
    </div>
  )
}
export function ComingSoon() {
  return (
    <div id="coming-soon">¡Próximamente!</div> 
  )
}
// Nothing confirmed yet, so the exposition is teased rather than listed: a few
// mystery stands that dissolve down the page.
const MYSTERY_STANDS = 5;

export function Stands() {
  return (
    <section>
      <div className="heading-row">
        <h2>Puestos, talleres, conferencias y actividades ;) </h2> 
        <Call4MakersSign></Call4MakersSign>
        <div className="ribbon-ending"></div> 
      </div>
      <div className="stands-container">
        {Array.from({ length: MYSTERY_STANDS }, (_, i) => (
          <div className="stand mystery" key={i}>
            <span className="mystery-label">Stand sin desvelar</span>
            <div className="mystery-pattern" aria-hidden="true" />
          </div>
        ))}z
      </div>
    </section>
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

export function Schedule() {
  const { activities: liveActivities, loading, error } = useActivities({
    statuses: VISIBLE_STATUSES,
  });

  // Rows without a start/end can't be placed on the grid.
  const activities = liveActivities
    .filter(act => act.startsAt && act.endsAt)
    .map(toGridActivity);

  const originMinutes = activities.length
    ? Math.floor(
        Math.min(...activities.map(act => toMinutes(act.start))) / MINUTES_PER_ROW,
      ) * MINUTES_PER_ROW
    : 0;

  const mysteryActivities = findMysteryActivities(activities, originMinutes);

  if (loading) return <div className="schedule-status">Cargando programa…</div>;
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
      <h2>Programa del evento</h2>
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
            const startRow = timeToRow(act.start, originMinutes);
            // Never let an activity collapse to zero rows: one shorter than a row
            // (or with end == start) still needs to occupy a cell.
            const endRow = Math.max(timeToRow(act.end, originMinutes), startRow + 1);

            // General has no column of its own, so it spans all three.
            const col = columnOf(act.location) ?? "1 / span 3";

            return (
              <div
                key={act.id}
                className={`activity ${act.type.toLowerCase()} ${act.status ? `status-${act.status.toLowerCase()}` : ""}`}
                style={{
                  gridColumn: col,
                  gridRow: `${startRow} / ${endRow}`
                }}
              >
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
                <div className="activity-text">
                    <strong>{act.title}</strong><br/>
                    {act.author?
                    <>
                        <span className="activity-author">{act.author}</span><br/>
                    </>:<></>}
                    {act.type != "Otro"?
                    <><span className="activity-timeframe">{act.start+" - "+act.end}</span>
                    </>:<></>
                    }
                </div>
              </div>
            );
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
    return <section>
    <h2>Competiciones</h2>
    <div className="competition-container">
        {
        competitions.map( (competition, index) => 
          <div className="competition">
        <h3>{String(index+1).padStart(2,"0")} {competition.title}</h3>
        <div className="competition-links">
          <a href={competition.rule_link} className="competition-link">Reglas</a>
          <a href={competition.inscription_link} className="competition-link">Inscripción</a>
        </div>
        </div>)
        }
    </div>
    </section>
  }

export function Sponsors(){
    return <section id="sponsors-display">
      <h2>A tope de power gracias a: </h2>
    </section>
  }

export function Call4MakersSign(){
  
  var call4MakersStatuses = ["SOON", "OPEN", "CLOSED", ]
  var call4MakersStatus = call4MakersStatuses[1]
  return <div className="call-button">
          {call4MakersStatus == "SOON"? <div className="c4m-soon">🛠️ CALL 4 MAKERS: ¡PRÓXIMAMENTE!</div>: <></>}
          {call4MakersStatus == "OPEN"? <><div className="pulsating-text-lcd c4m-open">🛠️ CALL 4 MAKERS: ¡ABIERTO!</div><a href="" className="call-inscription">¡Envíanos tu propuesta aquí!</a></>: <></>}
          {call4MakersStatus == "CLOSED"? <div className="c4m-closed">🛠️ CALL 4 MAKERS: CERRADO</div>: <></>}
      
        </div>
}