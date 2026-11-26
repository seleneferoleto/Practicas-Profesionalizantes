// pages/Turnos.jsx — sucursal → fecha → hora → motivo → reservar, y "Mis citas"
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as turnoService from "../services/turnoService";

const fmt = (f) => {
  const [, m, d] = f.split("-");
  return `${d}/${m}`;
};

export default function Turnos() {
  const { sesion } = useAuth();
  const logueado = !!sesion?.logueado;

  const [sedes, setSedes] = useState([]);
  const [errorSedes, setErrorSedes] = useState("");
  const [sede, setSede] = useState(null);
  const [horarios, setHorarios] = useState(null);
  const [errorHorarios, setErrorHorarios] = useState("");
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", error: false });
  const [enviando, setEnviando] = useState(false);
  const [misTurnos, setMisTurnos] = useState([]);

  const avisar = (texto, error = false) => setMensaje({ texto, error });

  const cargarMisTurnos = useCallback(async () => {
    try {
      setMisTurnos(await turnoService.listarMisTurnos());
    } catch (err) {
      avisar(err.message, true);
    }
  }, []);

  useEffect(() => {
    turnoService.listarSedes().then(setSedes).catch((err) => setErrorSedes(err.message));
  }, []);

  useEffect(() => {
    if (logueado) cargarMisTurnos();
    else setMisTurnos([]);
  }, [logueado, cargarMisTurnos]);

  const cargarHorarios = async (s) => {
    setErrorHorarios("");
    try {
      setHorarios(await turnoService.obtenerDisponibilidad(s.id));
    } catch (err) {
      setHorarios([]);
      setErrorHorarios(err.message);
    }
  };

  const elegirSede = async (s) => {
    if (!logueado) return avisar("Necesitás iniciar sesión para reservar un turno.", true);
    setSede(s);
    setFecha(null);
    setHora(null);
    setMotivo("");
    avisar("");
    await cargarHorarios(s);
  };

  const confirmar = async () => {
    if (!logueado) return avisar("Necesitás iniciar sesión para reservar un turno.", true);
    if (!sede) return avisar("Elegí una sucursal.", true);
    if (!fecha || !hora) return avisar("Elegí una fecha y horario.", true);
    if (!motivo.trim()) return avisar("Describí el motivo de tu consulta.", true);

    setEnviando(true);
    try {
      const texto = await turnoService.reservarTurno({ sede_id: sede.id, fecha, hora, motivo: motivo.trim() });
      avisar(texto);
      setSede(null);
      setHorarios(null);
      setFecha(null);
      setHora(null);
      setMotivo("");
      cargarMisTurnos();
      setTimeout(() => setMensaje({ texto: "", error: false }), 3000);
    } catch (err) {
      if (err.status === 409) await cargarHorarios(sede);
      setHora(null);
      avisar(err.message, true);
    } finally {
      setEnviando(false);
    }
  };

  const cancelar = async (turno) => {
    if (!window.confirm(`¿Cancelar el turno del ${fmt(turno.fecha)} a las ${turno.hora.slice(0, 5)} hs?`)) return;
    try {
      avisar(await turnoService.cancelarTurno(turno.id));
      cargarMisTurnos();
    } catch (err) {
      avisar(err.message, true);
    }
  };

  const fechas = horarios ? [...new Set(horarios.map((h) => h.fecha))] : [];
  const horas = horarios && fecha ? horarios.filter((h) => h.fecha === fecha).map((h) => h.hora.slice(0, 5)) : [];

  return (
    <main>
      <section className="hero section-spaced">
        <div className="container">
          <span className="pill">Reservá en simples pasos</span>
          <h1>Reservá tu turno</h1>
          <p>Elegí la sucursal, el especialista, la fecha, el horario y el motivo de tu consulta.</p>
          <p>Los turnos se pueden reservar con al menos 5 horas de anticipación, incluso para el mismo día.</p>
        </div>
      </section>

      <section className="section-spaced section-light">
        <div className="container">
          <h2>1. Elegí una sucursal</h2>
          <div className="sucursales-grid">
            {errorSedes && <p className="auth-msg error">{errorSedes}</p>}
            {sedes.map((s) => {
              const extra = [s.direccion, s.telefono && `Tel: ${s.telefono}`].filter(Boolean).join(" · ");
              return (
                <button
                  type="button"
                  key={s.id}
                  className={`card especialista-card${sede?.id === s.id ? " active" : ""}`}
                  onClick={() => elegirSede(s)}
                >
                  <h3>{s.nombre}</h3>
                  {extra && <p>{extra}</p>}
                </button>
              );
            })}
          </div>

          {!logueado && (
            <p className="auth-msg">
              Iniciá sesión para confirmar tu turno. Podés seguir viendo la sede antes de entrar.
            </p>
          )}

          {horarios && (
            <div className="turno-paso">
              <h2>2. Elegí una fecha</h2>
              <div className="fechas-grid">
                {errorHorarios && <p className="auth-msg error">{errorHorarios}</p>}
                {!errorHorarios && fechas.length === 0 && <p>No hay fechas disponibles por ahora.</p>}
                {fechas.map((f) => (
                  <button
                    type="button"
                    key={f}
                    className={`slot-btn${fecha === f ? " active" : ""}`}
                    onClick={() => { setFecha(f); setHora(null); }}
                  >
                    {fmt(f)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fecha && (
            <div className="turno-paso">
              <h2>3. Elegí un horario</h2>
              <div className="horas-grid">
                {horas.length === 0 && <p>No hay horarios para este día.</p>}
                {horas.map((h) => (
                  <button
                    type="button"
                    key={h}
                    className={`slot-btn${hora === h ? " active" : ""}`}
                    onClick={() => setHora(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hora && (
            <div className="turno-paso">
              <h2>4. Motivo de la consulta</h2>
              <textarea
                rows="3"
                maxLength={500}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describí brevemente el motivo de tu consulta..."
                style={{ width: "100%", padding: "0.75rem", border: "1.5px solid var(--border)", borderRadius: "12px", fontFamily: "inherit", fontSize: "1rem", resize: "vertical", marginBottom: "1rem" }}
              />
              <button className="btn btn-primary" id="confirmarTurnoBtn" onClick={confirmar} disabled={enviando}>
                Solicitar turno
              </button>
            </div>
          )}

          {mensaje.texto && <p className={`auth-msg${mensaje.error ? " error" : " success"}`}>{mensaje.texto}</p>}
        </div>
      </section>

      {logueado && (
        <section className="section-spaced">
          <div className="container">
            <h2>Mis citas médicas</h2>
            <div className="mis-turnos-list">
              {misTurnos.length === 0 && <p>Todavía no tenés citas solicitadas.</p>}
              {misTurnos.map((t) => (
                <article className="card" key={t.id}>
                  <h3>📍 {t.sede}</h3>
                  <p>{t.especialista} — <small>{t.especialidad || ""}</small></p>
                  <p><strong>{fmt(t.fecha)}</strong> a las {t.hora.slice(0, 5)} hs</p>
                  <p className="turno-motivo"><em>{t.motivo}</em></p>
                  <p><span className={`estado-badge estado-${t.estado}`}>{t.estado}</span></p>
                  {t.estado === "reservado" && (
                    <button type="button" className="btn-cancelar btn-sm" onClick={() => cancelar(t)}>
                      Cancelar turno
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
