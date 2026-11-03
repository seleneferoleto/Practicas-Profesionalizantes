// cuenta-form.js — pestañas de login/registro contra el backend

document.addEventListener("DOMContentLoaded", () => {
  const tabs  = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      forms.forEach((f) => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}Form`).classList.add("active");
    });
  });

  function mostrarMensaje(id, texto, tipo) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = texto;
    el.className = `auth-msg ${tipo || ""}`;
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email    = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      const result = await api.login({ email, password });
      if (!result.ok) {
        mostrarMensaje("loginMsg", result.error, "error");
        return;
      }
      mostrarMensaje("loginMsg", `¡Bienvenido/a, ${result.data.nombre}!`, "success");
      setTimeout(() => (window.location.href = "index.html"), 800);
    });
  }

  const registroForm = document.getElementById("registroForm");
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre   = document.getElementById("registroNombre").value.trim();
      const email    = document.getElementById("registroEmail").value.trim();
      const telefono = document.getElementById("registroTelefono").value.trim();
      const password = document.getElementById("registroPassword").value;

      const result = await api.register({ nombre, email, telefono, password });
      if (!result.ok) {
        mostrarMensaje("registroMsg", result.error, "error");
        return;
      }
      mostrarMensaje("registroMsg", `¡Cuenta creada! Bienvenido/a, ${result.data.nombre}.`, "success");
      setTimeout(() => (window.location.href = "index.html"), 800);
    });
  }
});

