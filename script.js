const THEME_KEY = "laHuellaTheme";

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
}

aplicarTema(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");

document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.querySelector(".footer .container");
  if (!footerContainer) return;

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "theme-toggle";

  const actualizarTexto = () => {
    const oscuro = document.documentElement.getAttribute("data-theme") === "dark";
    boton.textContent = oscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
  };

  boton.addEventListener("click", () => {
    const nuevo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    aplicarTema(nuevo);
    localStorage.setItem(THEME_KEY, nuevo);
    actualizarTexto();
  });

  actualizarTexto();
  footerContainer.prepend(boton);
});

const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

if (menuBtn && mainNav) {
  menuBtn.setAttribute("aria-controls", mainNav.id);
  menuBtn.setAttribute("aria-expanded", "false");
  const cerrarMenu = () => {
    mainNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menú");
  };

  menuBtn.addEventListener("click", () => {
    const abierto = mainNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(abierto));
    menuBtn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) cerrarMenu();
  });

  document.addEventListener("click", (event) => {
    if (!mainNav.contains(event.target) && !menuBtn.contains(event.target)) cerrarMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("open")) {
      cerrarMenu();
      menuBtn.focus();
    }
  });

  window.matchMedia("(max-width: 1200px)").addEventListener("change", () => {
    cerrarMenu();
  });
}

if (contactForm && formMsg) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMsg.textContent = "¡Gracias! Recibimos tu consulta y te contactaremos pronto.";
    contactForm.reset();
  });
}
