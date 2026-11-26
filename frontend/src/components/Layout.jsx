// components/Layout.jsx — encabezado, navegación, pie y botón de WhatsApp comunes a todas las páginas
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const THEME_KEY = "laHuellaTheme";

function useTema() {
  const [tema, setTema] = useState(() => (localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light"));
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(THEME_KEY, tema);
  }, [tema]);
  return [tema, () => setTema((t) => (t === "dark" ? "light" : "dark"))];
}

function Header() {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);

  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    const fueraDelMenu = (e) => contenedor.current && !contenedor.current.contains(e.target) && setAbierto(false);
    const escape = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("click", fueraDelMenu);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", fueraDelMenu);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const logueado = !!sesion?.logueado;
  const esAdmin = logueado && sesion.es_admin;

  const clickCuenta = async () => {
    if (!logueado) return navigate("/cuenta");
    await logout();
    navigate("/");
  };

  const titulo = !logueado
    ? "Iniciar sesión / Registrarme"
    : esAdmin
    ? `Admin: ${sesion.nombre} (clic = cerrar sesión)`
    : `Cerrar sesión (${sesion.nombre})`;

  return (
    <header className="topbar">
      <div className="container nav-wrapper" ref={contenedor}>
        <Link to="/#inicio" className="logo">
          <img src="/Fotos/logo.webp" alt="Logo La Huella-Veterinaria" className="logo-img" /> La Huella-Veterinaria
        </Link>
        <button
          className="menu-btn"
          id="menuBtn"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={abierto}
          onClick={() => setAbierto((a) => !a)}
        >
          ☰
        </button>
        <nav className={`nav${abierto ? " open" : ""}`} id="mainNav">
          <Link to="/#inicio">Home</Link>
          <Link to="/#sobre">Sobre nosotros</Link>
          <Link to="/#sedes">Nuestras sedes</Link>
          <Link to="/#servicios">Nuestros servicios</Link>
          <NavLink to="/turnos">Turnos</NavLink>
          {esAdmin && <NavLink to="/productos">Productos</NavLink>}
          {esAdmin && (
            <NavLink to="/admin" className="nav-admin-link">
              ⚙️ Admin
            </NavLink>
          )}
        </nav>
        <div className="account-menu" id="accountMenu">
          <button
            className={`account-btn${logueado ? " account-active" : ""}`}
            id="accountBtn"
            aria-label="Cuenta"
            title={titulo}
            onClick={clickCuenta}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer({ social }) {
  const [tema, alternarTema] = useTema();
  return (
    <footer className="footer">
      <div className="container">
        <button type="button" className="theme-toggle" aria-pressed={tema === "dark"} onClick={alternarTema}>
          {tema === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
        </button>
        {social && (
          <div className="footer-social">
            <a className="social-link" href="https://www.instagram.com/veterinaria.lahuella/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
              Instagram
            </a>
            <a className="social-link" href="https://www.facebook.com/vetelahuella" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>
              Facebook
            </a>
          </div>
        )}
        <p>© 2026 Veterinaria La Huella · Cuidamos con amor.</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <Outlet />
      <a href="https://wa.me/5491167956784" className="whatsapp-float" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
        <img src="/Fotos/whatsapp.webp" alt="WhatsApp" />
      </a>
      <Footer social={pathname === "/"} />
    </>
  );
}
