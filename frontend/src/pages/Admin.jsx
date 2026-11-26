// pages/Admin.jsx — turnos de todas las sucursales (solo admin)
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as turnoService from "../services/turnoService";

const ESTADOS = ["reservado", "completado", "cancelado"];

const fmtFecha = (str) => {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

export default function Admin() {
  const { sesion } = useAuth();
  const [turnos, setTurnos] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", error: false });

  const cargar = useCallback(async () => {
    try {
      setTurnos(await turnoService.listarTodosLosTurnos());
    } catch (err) {
      setTurnos([]);
      setMensaje({ texto: err.message, error: true });
    }
  }, []);

  useEffect(() => {
    if (sesion?.es_admin) cargar();
  }, [sesion, cargar]);

  if (!sesion) return null;
  if (!sesion.logueado || !sesion.es_admin) return <Navigate to="/" replace />;

  const cambiar = async (id, estado) => {
    try {
      setMensaje({ texto: await turnoService.cambiarEstadoTurno(id, estado), error: false });
    } catch (err) {
      setMensaje({ texto: err.message, error: true });
    }
    cargar();
  };

  return (
    <main>
      <section className="hero section-spaced" style={{ paddingTop: "5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <span className="pill">Solo acceso autorizado</span>
          <h1>Panel de Administración</h1>
          <p style={{ color: "var(--muted)" }}>Gestioná los turnos de todas las sucursales.</p>
        </div>
      </section>

      <section className="section-spaced" style={{ paddingTop: "1rem" }}>
        <div className="container">
          <h2>Citas médicas</h2>
          {mensaje.texto && <p className={`auth-msg${mensaje.error ? " error" : " success"}`}>{mensaje.texto}</p>}
          {turnos === null && <p>Cargando…</p>}
          {turnos && turnos.length === 0 && <p>No hay turnos todavía.</p>}
          {turnos && turnos.length > 0 && (
            <div className="admin-scroll" role="region" aria-label="Citas médicas, tabla desplazable" tabIndex={0}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th><th>Sucursal</th><th>Especialista</th>
                    <th>Fecha / Hora</th><th>Motivo</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.usuario_nombre}</strong><br /><small className="muted">{t.usuario_email}</small></td>
                      <td>{t.sede}</td>
                      <td>{t.especialista}<br /><small className="muted">{t.especialidad}</small></td>
                      <td><strong>{fmtFecha(t.fecha)}</strong> {t.hora.slice(0, 5)} hs</td>
                      <td>{t.motivo}</td>
                      <td>
                        <select className="admin-select" value={t.estado} onChange={(e) => cambiar(t.id, e.target.value)}>
                          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
