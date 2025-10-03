import "./SchedulePage.css";

type Activity = {
  id: string;
  title: string;
  author?: string;
  type: "exposicion"|"charla" | "taller" | "competicion" | "descanso" | "apertura" | "cierre";
  location: "maker@domus" | "ext. maker@domus" |"Laboratorio" | "Competiciones" | "General";
  start: string;
  end: string;
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

const activities: Activity[] = [
  { id: "soldadura", title: "Iniciación a la Soldadura", author: "Manuel Miramontes - BricoLabs", type: "taller", location: "maker@domus", start: "10:30", end: "12:00" },
  //exposiciones
  { id: "expo1", title: "Exposición maker (mañana)", type: "exposicion", location: "maker@domus", start: "10:15", end: "14:00" },
  { id: "expo2", title: "Exposición maker (tarde)", type: "exposicion", location: "maker@domus", start: "15:00", end: "19:00" },
  //charlas y talleres
  { id: "router1", title: "Lanzamiento del proyecto OpenRAFs", author: "bluepasser", type: "charla", location: "Laboratorio", start: "11:30", end: "12:00" },
  { id: "router2", title: "Crea tu nodo openRAFs: ¡trae un router viejo y una memoria USB! (no es obligatorio)", author: "bluepasser", type: "taller", location: "Laboratorio", start: "12:00", end: "13:00" },
  { id: "bretalk", title: "Sobre el Banco de Reciclaxe", author: "Banco de Reciclaxe - Ingeniería Sin Fronteras", type: "charla", location: "Laboratorio", start: "13:00", end: "13:30" },
  { id: "belectro", title: "Creación de Bisutería Electrónica", author: "María José Lara, Mercedes Lara, Marga - BricoLabs", type: "taller", location: "maker@domus", start: "15:30", end: "17:00" },
  { id: "pcbcnc", title: "Diseño y fabricación de placas PCB con máquina CNC: De KiCad al GCode. Si puedes, ¡trae un portátil con el último KiCad y GIMP!", author: "Luis Díaz-Faes - A Industriosa", type: "taller", location: "Laboratorio", start: "15:00", end: "16:00" },
  { id: "radiotalk", title: "RADIOAFICIÓN... en modo breve.", author: "URE, CTGURE, URC", type: "charla", location: "Laboratorio", start: "16:00", end: "16:30" },
  { id: "oprobotsmicro", title: "Primeros pasos en un robot MicroMouse", author: "OPRobots", type: "charla", location: "Laboratorio", start: "18:30", end: "19:00" },
  
  //competiciones
  { id: "laberinto", title: "Laberinto", type: "competicion", location: "Competiciones", start: "10:30", end: "12:00" },
  { id: "combate", title: "Combate", type: "competicion", location: "Competiciones", start: "12:00", end: "13:00" },
  { id: "siguelineas", title: "Siguelineas", type: "competicion", location: "Competiciones", start: "13:00", end: "14:00" },
  { id: "velocistas", title: "Velocistas", type: "competicion", location: "Competiciones", start: "15:00", end: "16:30" },
  { id: "minisumo", title: "Mini-Sumo", type: "competicion", location: "Competiciones", start: "16:30", end: "18:00" },
  { id: "hebocon", title: "Hebocon", type: "competicion", location: "Competiciones", start: "18:00", end: "19:00" },
  { id: "descanso", title: "Descanso", type: "descanso", location: "General", start: "14:00", end: "15:00" },
  { id: "cierre", title: "Cierre", type: "cierre", location: "General", start: "19:00", end: "19:30" },
];

const stands: Stand[] = [
  {id: "scandlive", name: "Scandlive",exhibitors: "Gerardo Barbarov", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Actividad visual interactiva que permite la participación del público asistente a la OSHWDem, creando versiones virtuales personalizadas de la mascota del evento OSHWi, mediante el uso de plantillas para pintar, modelar con plastilina o montar puzzles. Mas info en www.scandlive.orgDemo del código Processing: https://gitlab.com/SingularDevices/scandlive_oshwy_demo" },
  {id: "oledrace", name: "Open LED Race",exhibitors: "Gerardo Barbarov", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Open LED race es un juego minimalista de coches de carreras donde se utiliza una tira de LEDs inteligentes (Neopíxeles), un arduino y varios pulsadores a modo de mandos. Para que avance un coche tienes que apretar un pulsador. Cuanto más rápido lo aprietes más rápido irá tu coche. En las rampas de ascenso del circuito debes presionar más rápidamente para compensar el efecto de la gravedad simulada. Es un proyecto de código abierto, nacido en el Arduino Day de Sevilla en 2019. https://openledrace.net/proyecto-abierto/?lang=es" },
  {id: "ti", name: "Talentos Inclusivos (CITIC)", exhibitors: "Equipo Talentos Inclusivos", location: "maker@domus", start: "10:00", end: "14:00", interactive: true, description: "Tecnologías accesibles: Realidad Virtual, juegos para el trabajo de habilidades cognitivas en personas con discapacidad intelectual.  Switch, Mario Kart con adaptación para el manejo de mando a través do tronco o de la cabeza.  Juegos personalizados para el ámbito de las personas con discapacidad: “Compra con-migo».  Demostración de pintura con producto de apoyo de cabeza y exposición de retos tecnológicos del proyecto Talentos Inclusivos."},
  {id: "sarmy", name: "SysArmy Galicia (Comunidad)", exhibitors: "Tizi & Nacho", location: "maker@domus", start: "10:00", end: "17:00", interactive: true,  description: "El soporte de los que dan soporte. Compartir diversos cacharros con relación a la administración de sistemas. Juego con leaderboard de montaje de cables de red a contrarreloj"},
  {id: "crecercreando", name: "Crecer Creando", exhibitors: "Ana Rodríguez", location: "maker@domus", start: "10:00", end: "19:00", interactive: true,  description: "Crecer Creando presenta dos propuestas educativas con licencia libre: Invasión: un juego matemático para entrenar cálculo mental de forma competitiva y divertida. Pirámides fractales: un reto de lógica y razonamiento espacial en impresión 3D. Ambos forman parte del método Crecer Creando, donde capacidades como el pensamiento computacional y el cálculo mental se entrenan desde el juego y la emoción."},
  {id: "bancoreciclaxe", name: "Banco de Reciclaxe Enxeñería Sen Fronteiras", exhibitors: "Sergio Alvariño, Jorge Lama", location: "maker@domus", start: "10:00", end: "19:00", interactive: false,  description: "Nuestra idea es presentar nuestras actividades al público, explicando las labores que llevamos a cabo en el Banco de Reciclaxe y también el Repair Café que hacemos en colaboración con BricoLabs."},
  {id: "aindustriosa", name: "A Industriosa", exhibitors: "A Industriosa", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "A Industriosa é un laboratorio tecnolóxico que desenvolve a súa actividade de promoción e difusión das tecnoloxias libres na zona de Vigo. Este ano propoñemos un stand no que amosar or proxectos máis destacados da asociación."},
  {id: "bricolabs", name: "BricoLabs", exhibitors: "Manuel Folla Saura & Manuel Miramontes, Luigi Pirelli, manuelsrleon + organización y voluntarios OSHWDem", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "BricoLabs es la asociación que organiza el evento. Es un makerspace de tecnologías libres con el fin de divulgar sobre tecnología, electrónica. A veces es difícil de definir, porque en BricoLabs hacemos cualquier cosa. Lo que nos une a todos es la curiosidad, el compañerismo y las ganas de aprender. Manuel Miramontes y Manuel Folla traerán una maqueta increíble de un edificio emblemático de Sada, mientras que Luigi nos mostrará su conocimiento enciclopédico sobre baterías de coches eléctricos y cargadores abiertos. Manuel Santamariña (un servidor) tendrá la impresora a todo cañón probablemente imprimiendo recuerdos de la OSHWDem y dando la turra sobre impresión 3D, programación, derecho a reparar, matemáticas aplicadas y soberanía digital."},
  // {id: "gpul", name: "GPUL", exhibitors: "Manuel Folla Saura, Luigi Pirelli, los de la orga que pilléis por ahí", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "A Industriosa é un laboratorio tecnolóxico que desenvolve a súa actividade de promoción e difusión das tecnoloxias libres na zona de Vigo. Este ano propoñemos un stand no que amosar or proxectos máis destacados da asociación."},
  {id: "ucu", name: "URE, CTGURE, URC", exhibitors: "Domingo Molejon Varela, +3", location: "maker@domus", start: "10:00", end: "19:00", interactive: false, description: "Este stand representa a tres asociaciones: la Unión de Radioaficionados Españoles, el Consejo territorial de Galicia de URE y la Unión de Radioaficionados Coruña. ¡Pásate por aquí si te interesa la radioafición!" }
]

const locations = ["maker@domus (3ª planta)", "Laboratorio (2ª planta)", "Competiciones (Auditorio, planta 0)"];

// Convert HH:mm → row index (10:00 is row 2)
function timeToRow(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = (h * 60 + m) - (10 * 60); // minutes since 10:00
  return Math.floor(totalMinutes / 30) + 2; // +2 for header offset
}

export default function Schedule() {
  return (
    <>
    <div className="schedule-container">
    <div className="schedule-header">
        <img src="public/logo-oshwdem.png" className="schedule-oshwdem-logo" alt="" />
        <h1 className="schedule-title">Horario</h1>
    </div>
    <div className="schedule">
      
      {locations.map(loc => (
        <div key={loc} className="header">{loc}</div>
      ))}

      {/* Time labels */}
      {/* {Array.from({ length: (19 - 10) * 2 + 1 }).map((_, i) => {
        const hour = 10 + Math.floor(i / 2);
        const min = i % 2 === 0 ? "00" : "30";
        const label = `${hour.toString().padStart(2, "0")}:${min}`;
        return (
          <div key={i} className="time-label" style={{ gridRow: i + 2 }}>
            {label}
          </div>
        );
      })} */}

      {/* Activities */}
      {activities.map(act => {
        const startRow = timeToRow(act.start);
        const endRow = timeToRow(act.end);

        const col =
          act.location === "maker@domus" ? 1 :
          act.location === "Laboratorio" ? 2 :
          act.location === "Competiciones" ? 3 :
          "1 / span 3"; // General spans all 3

        return (
          <div
            key={act.id}
            className={`activity ${act.type}`}
            style={{
              gridColumn: col,
              gridRow: `${startRow} / ${endRow}`
            }}
          >
            {act.type == "taller"?
            <>
              <div className="taller-marker">
                Taller
              </div>
            </>:<></>}
            {act.type == "charla"?<>
            <div className="charla-marker">
                Charla
              </div>
            </>:<></>}
            <div className={act.type+"-badge"}></div>
            <div className="activity-text">
                <strong>{act.title}</strong><br/>
                {act.author?
                <>
                    <span className="activity-author">{act.author}</span><br/>
                </>:<></>}
                {act.type != "cierre"?
                <><span className="activity-timeframe">{act.start+" - "+act.end}</span>
                </>:<></>
                }
            </div>
          </div>
        );
      })}
    </div>
    </div>
    <div className="stands-container">
      <h1>Stands de la exposición maker</h1>
      {stands.map(stand => {
          return <>
          <div className="stand">
            <h2 className="stand-name">{stand.name}</h2><br/>
            <h3 className="stand-time">{stand.start == "10:00" && stand.end == "19:00"? "Todo el evento":<>{stand.start+"-"+stand.end}</>}<></></h3><br/>
            <h3 className="stand-exhibitors">{stand.exhibitors}</h3><br/>
            <span className="stand-description">{stand.description}</span><br/>
          </div>
          </>
      })
      }
    </div>
    </>
  );
}
