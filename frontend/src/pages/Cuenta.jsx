// pages/Cuenta.jsx — inicio de sesión y registro
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Cuenta() {
  const { login, registrar } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [mensaje, setMensaje] = useState({ login: null, registro: null });
  const [enviando, setEnviando] = useState(false);

  const mostrar = (form, texto, tipo) => setMensaje((m) => ({ ...m, [form]: { texto, tipo } }));

  const enviar = (form, accion, textoOk) => async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    setEnviando(true);
    try {
      const usuario = await accion(datos);
      mostrar(form, textoOk(usuario), "success");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      mostrar(form, err.message, "error");
    } finally {
      setEnviando(false);
    }
  };

  const Mensaje = ({ form }) => (
    <p className={`auth-msg ${mensaje[form]?.tipo || ""}`}>{mensaje[form]?.texto}</p>
  );

  return (
    <main>
      <section className="section-spaced auth-section">
        <div className="container auth-wrapper">
          <div className="auth-card card">
            <div className="auth-tabs">
              <button type="button" className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => setTab("login")}>
                Iniciar sesión
              </button>
              <button type="button" className={`auth-tab${tab === "registro" ? " active" : ""}`} onClick={() => setTab("registro")}>
                Registrarme
              </button>
            </div>

            <form
              className={`auth-form${tab === "login" ? " active" : ""}`}
              onSubmit={enviar("login", login, (u) => `¡Bienvenido/a, ${u.nombre}!`)}
            >
              <label htmlFor="loginEmail">Email</label>
              <input id="loginEmail" name="email" type="email" required />

              <label htmlFor="loginPassword">Contraseña</label>
              <input id="loginPassword" name="password" type="password" required />

              <button className="btn btn-primary" type="submit" disabled={enviando}>Iniciar sesión</button>
              <Mensaje form="login" />
            </form>

            <form
              className={`auth-form${tab === "registro" ? " active" : ""}`}
              onSubmit={enviar("registro", registrar, (u) => `¡Cuenta creada! Bienvenido/a, ${u.nombre}.`)}
            >
              <label htmlFor="registroNombre">Nombre y apellido</label>
              <input id="registroNombre" name="nombre" type="text" required />

              <label htmlFor="registroEmail">Email</label>
              <input id="registroEmail" name="email" type="email" required />

              <label htmlFor="registroTelefono">Teléfono (opcional)</label>
              <input id="registroTelefono" name="telefono" type="tel" />

              <label htmlFor="registroPassword">Contraseña</label>
              <input id="registroPassword" name="password" type="password" minLength={6} required />

              <button className="btn btn-primary" type="submit" disabled={enviando}>Crear cuenta</button>
              <Mensaje form="registro" />
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
