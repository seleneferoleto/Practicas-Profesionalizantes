// account.js — ícono de cuenta en el header
// Sin sesión: clic → ir a cuenta.html
// Con sesión:  clic → cerrar sesión y recargar

document.addEventListener("DOMContentLoaded", async () => {
  const btn      = document.getElementById("accountBtn");
  const dropdown = document.getElementById("accountDropdown");
  if (!btn) return;

  const sesion = await api.getSesion();

  // Ocultar el dropdown (no se usa en esta versión simplificada)
  if (dropdown) dropdown.style.display = "none";

  if (sesion.logueado) {
    btn.title = sesion.es_admin
      ? `Admin: ${sesion.nombre} (clic = cerrar sesión)`
      : `Cerrar sesión (${sesion.nombre})`;
    btn.classList.add("account-active");
    if (sesion.es_admin) {
      const nav = document.getElementById("mainNav");
      if (nav) {
        const enlacesProductos = Array.from(nav.querySelectorAll('a[href$="producto.html"]'));
        enlacesProductos.slice(1).forEach(link => link.remove());
        if (enlacesProductos.length === 0) {
          const prodLink = document.createElement("a");
          prodLink.href = "producto.html";
          prodLink.textContent = "Productos";
          const turnosLink = nav.querySelector('a[href$="turnos.html"]');
          turnosLink.after(prodLink);
        }

        const enlacesAdmin = Array.from(nav.querySelectorAll('a[href$="admin.html"]'));
        enlacesAdmin.slice(1).forEach(link => link.remove());
        if (enlacesAdmin.length === 0) {
          const adminLink = document.createElement("a");
          adminLink.href = "admin.html";
          adminLink.textContent = "⚙️ Admin";
          adminLink.className = "nav-admin-link";
          nav.appendChild(adminLink);
        }
      }
    }
  } else {
    btn.title = "Iniciar sesión / Registrarme";
  }

  btn.addEventListener("click", async () => {
    if (sesion.logueado) {
      await api.logout();
      window.location.href = "index.html";
    } else {
      window.location.href = "cuenta.html";
    }
  });
});
