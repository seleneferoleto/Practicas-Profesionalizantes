// pages/Home.jsx
const SERVICIOS = [
  ["Consultas clínicas", "Control general, diagnóstico y tratamiento personalizado.", "Evaluamos a tu mascota de forma integral, revisamos sus antecedentes y elaboramos un plan de atención adaptado a sus necesidades."],
  ["Vacunación y desparasitación", "Planes anuales según la edad y necesidades de cada mascota.", "Te ayudamos a mantener al día el calendario sanitario y te indicamos los cuidados preventivos adecuados para cada etapa."],
  ["Laboratorio y diagnóstico", "Análisis clínicos, ecografías y estudios complementarios.", "Contamos con estudios complementarios para obtener información precisa y acompañar el diagnóstico veterinario."],
  ["Medicina Alopática", "Especializados en geriatría, pediatría, cardiología, cirugías y reproducción asistida, entre otros.", "Abordamos distintas especialidades con tratamientos convencionales personalizados y seguimiento profesional."],
  ["Peluquería e higiene", "Baño, corte y cuidado estético para que perros y gatos luzcan y se sientan mejor.", "Realizamos cuidados de higiene y estética priorizando el bienestar, la comodidad y las características de cada mascota."],
  ["Medicina Holista", "Profesionales especializados en acupuntura, fitomedicina, homeopatía, magnetoterapia y más.", "Combinamos distintas herramientas holistas para acompañar la salud de manera integral y respetuosa."],
];

const SEDES = [
  { nombre: "Sede Ballester", direccion: "Vicente Lopez 2996, Villa Ballester", tel: "(011) 4738 0400", mapa: "Vicente+Lopez+2996,+Villa+Ballester" },
  { nombre: "Sede Chilavert", direccion: "Lacroze 6115, Chilavert", tel: "(011) 4589 8733", mapa: "Lacroze+6115,+Chilavert" },
];

export default function Home() {
  return (
    <main id="inicio">
      <section className="hero section-spaced">
        <div className="container hero-grid">
          <div>
            <span className="pill">Atención profesional y cálida</span>
            <h1>Tu veterinaria de confianza para cuidar a toda la familia peluda</h1>
            <p>
              Brindamos atención preventiva y clínica para mascotas, con un equipo comprometido de veterinarios
              capacitados.
            </p>
          </div>
          <div className="hero-card">
            <h2>Horarios</h2>
            <ul>
              <li><strong>Lunes a Viernes:</strong> 10:00 - 13:00 / 16:00 - 19:00</li>
              <li><strong>Sábados:</strong> 10:00 - 13:00</li>
              <li><strong>Domingos:</strong> Cerrado</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="sobre" className="section-spaced section-light">
        <div className="container split-grid">
          <div>
            <h2>Sobre nosotros</h2>
            <p>
              Desde 1991 estamos en la zona de Villa Ballester intentando aportar un granito de arena para mejorar la
              calidad de vida de nuestros mejores y más fieles amigos. Luego de años de afianzarnos en la medicina
              veterinaria alopática comenzamos a investigar y profundizar más en métodos médicos que se focalicen en el
              paciente como un organismo integrado. Por ello, adquirimos vastos conocimientos y práctica en medicina
              holista. De esta manera, en La Huella trabajamos siguiendo los principios hipocráticos: “actuar sin
              dañar…”, ocupándonos de todo tipo de estímulo que actúa perjudicando o favoreciendo el bienestar animal.
            </p>
          </div>
          <div className="info-card">
            <ul>
              <li>
                Gracias a la medicina holista tratamos enfermedades crónicas utilizando medicamentos que no generen
                efectos indeseables con largos períodos de uso.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="servicios" className="section-spaced section-light">
        <div className="container" style={{ marginTop: "2.5rem" }}>
          <h2>Nuestros Servicios</h2>
          <div className="cards-grid">
            {SERVICIOS.map(([titulo, resumen, detalle]) => (
              <article className="card service-card" key={titulo}>
                <h3>{titulo}</h3>
                <p>{resumen}</p>
                <div className="service-details">
                  <p>{detalle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sedes" className="section-spaced">
        <div className="container">
          <h2>Nuestras sedes</h2>
          <p className="section-intro">Contamos con dos sedes para estar siempre cerca de vos.</p>
          <div className="cards-grid sedes-grid">
            {SEDES.map((s) => (
              <article className="card" key={s.nombre}>
                <h3>{s.nombre}</h3>
                <p>{s.direccion}</p>
                <p><strong>Tel:</strong> {s.tel}</p>
                <iframe
                  className="sede-mapa"
                  src={`https://www.google.com/maps?q=${s.mapa}&output=embed`}
                  title={`Mapa ${s.nombre}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
