// admin.js — panel de administración: turnos de todas las sucursales (solo admin)

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function fmtFecha(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}

async function renderTurnos() {
  const wrap = document.getElementById("turnosAdminLista");
  const r = await api.get("/turnos");
  if (!r.ok) {
    wrap.innerHTML = `<p class="auth-msg error">${escapar(r.error)}</p>`;
    return;
  }
  if (r.data.length === 0) {
    wrap.innerHTML = "<p>No hay turnos todavía.</p>";
    return;
  }

  const filas = r.data.map((t) => `
    <tr>
      <td><strong>${escapar(t.usuario_nombre)}</strong><br><small class="muted">${escapar(t.usuario_email)}</small></td>
      <td>${escapar(t.sede)}</td>
      <td>${escapar(t.especialista)}<br><small class="muted">${escapar(t.especialidad)}</small></td>
      <td><strong>${fmtFecha(t.fecha)}</strong> ${t.hora.slice(0, 5)} hs</td>
      <td>${escapar(t.motivo)}</td>
      <td>
        <select class="admin-select" data-id="${t.id}">
          ${["reservado", "completado", "cancelado"]
            .map((e) => `<option value="${e}" ${t.estado === e ? "selected" : ""}>${e}</option>`)
            .join("")}
        </select>
      </td>
    </tr>`).join("");

  wrap.innerHTML = `
    <div class="admin-scroll" role="region" aria-label="Citas médicas, tabla desplazable" tabindex="0">
      <table class="admin-table">
        <thead><tr>
          <th>Cliente</th><th>Sucursal</th><th>Especialista</th>
          <th>Fecha / Hora</th><th>Motivo</th><th>Estado</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`;

  wrap.querySelectorAll("select[data-id]").forEach((sel) => {
    sel.addEventListener("change", async () => {
      const res = await api.patch(`/turnos/${sel.dataset.id}`, { estado: sel.value });
      if (!res.ok) alert(res.error);
      renderTurnos();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const sesion = await api.getSesion();
  if (!sesion.logueado || !sesion.es_admin) {
    window.location.href = "index.html";
    return;
  }
  renderTurnos();
});
