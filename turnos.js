// turnos.js — flujo: sucursal → fecha → hora → motivo → reservar (contra el backend)

document.addEventListener("DOMContentLoaded", async () => {
  const sucursalesGrid = document.getElementById("sucursalesGrid");
  const pasoFecha      = document.getElementById("pasoFecha");
  const pasoHora       = document.getElementById("pasoHora");
  const pasoMotivo     = document.getElementById("pasoMotivo");
  const fechasGrid     = document.getElementById("fechasGrid");
  const horasGrid      = document.getElementById("horasGrid");
  const turnoMsg       = document.getElementById("turnoMsg");
  const razonEl        = document.getElementById("turnoRazon");
  const confirmarBtn   = document.getElementById("confirmarTurnoBtn");

  const sesion = await api.getSesion();

  if (!sesion.logueado) {
    const aviso = document.createElement("p");
    aviso.className = "auth-msg";
    aviso.textContent = "Iniciá sesión para confirmar tu turno. Podés seguir viendo la disponibilidad antes de entrar.";
    const contenedor = document.querySelector("main .container");
    if (contenedor) contenedor.appendChild(aviso);
  }

  let sedeActual = null;
  let horariosSede = [];
  let slotSeleccionado = null;

  function fmt(f) {
    const [, m, d] = f.split("-");
    return `${d}/${m}`;
  }

  function mostrarError(texto) {
    turnoMsg.textContent = texto;
    turnoMsg.classList.add("error");
  }

  function limpiarMensaje() {
    turnoMsg.textContent = "";
    turnoMsg.classList.remove("error");
  }

  function exigirSesion() {
    if (sesion.logueado) return true;
    mostrarError("Necesitás iniciar sesión para reservar un turno.");
    pasoMotivo.style.display = "block";
    return false;
  }

  async function cargarSucursales() {
    const r = await api.get("/sedes");
    if (!r.ok) {
      sucursalesGrid.innerHTML = `<p class="auth-msg error">${r.error}</p>`;
      return;
    }
    sucursalesGrid.innerHTML = "";
    r.data.forEach((sede) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card especialista-card";
      const extra = [sede.direccion, sede.telefono && `Tel: ${sede.telefono}`].filter(Boolean).join(" · ");
      btn.innerHTML = `<h3>${sede.nombre}</h3>${extra ? `<p>${extra}</p>` : ""}`;
      btn.addEventListener("click", () => seleccionarSucursal(sede, btn));
      sucursalesGrid.appendChild(btn);
    });
  }

  async function seleccionarSucursal(sede, btn) {
    if (!exigirSesion()) return;

    document.querySelectorAll("#sucursalesGrid .especialista-card").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    sedeActual = sede;
    slotSeleccionado = null;
    limpiarMensaje();
    pasoHora.style.display = "none";
    pasoMotivo.style.display = "none";

    const r = await api.get(`/turnos/disponibilidad?sede_id=${sede.id}`);
    if (!r.ok) {
      fechasGrid.innerHTML = `<p class="auth-msg error">${r.error}</p>`;
      pasoFecha.style.display = "block";
      return;
    }
    horariosSede = r.data;

    const fechas = [...new Set(horariosSede.map((h) => h.fecha))];
    fechasGrid.innerHTML = fechas.length ? "" : "<p>No hay fechas disponibles por ahora.</p>";
    fechas.forEach((f) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot-btn";
      b.textContent = fmt(f);
      b.addEventListener("click", () => seleccionarFecha(f, b));
      fechasGrid.appendChild(b);
    });
    pasoFecha.style.display = "block";
  }

  function seleccionarFecha(fecha, btn) {
    document.querySelectorAll("#fechasGrid .slot-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    slotSeleccionado = null;
    pasoMotivo.style.display = "none";

    const horas = horariosSede.filter((h) => h.fecha === fecha).map((h) => h.hora.slice(0, 5));
    horasGrid.innerHTML = horas.length ? "" : "<p>No hay horarios para este día.</p>";
    horas.forEach((hora) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot-btn";
      b.textContent = hora;
      b.addEventListener("click", () => seleccionarHora({ fecha, hora }, b));
      horasGrid.appendChild(b);
    });
    pasoHora.style.display = "block";
  }

  function seleccionarHora(slot, btn) {
    document.querySelectorAll("#horasGrid .slot-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    slotSeleccionado = slot;
    if (razonEl) razonEl.value = "";
    limpiarMensaje();
    pasoMotivo.style.display = "block";
  }

  async function cargarMisTurnos() {
    if (!sesion.logueado) return;
    const seccion = document.getElementById("misTurnos");
    const lista = document.getElementById("misTurnosList");
    const r = await api.get("/turnos/mios");
    if (!r.ok) return;

    lista.innerHTML = r.data.length ? "" : "<p>Todavía no tenés citas solicitadas.</p>";
    r.data.forEach((t) => {
      const card = document.createElement("article");
      card.className = "card";
      const motivo = document.createElement("em");
      motivo.textContent = t.motivo;
      card.innerHTML = `
        <h3>📍 ${t.sede}</h3>
        <p>${t.especialista} — <small>${t.especialidad || ""}</small></p>
        <p><strong>${fmt(t.fecha)}</strong> a las ${t.hora.slice(0, 5)} hs</p>
        <p class="turno-motivo"></p>
        <p><span class="estado-badge estado-${t.estado}">${t.estado}</span></p>`;
      card.querySelector(".turno-motivo").appendChild(motivo);
      lista.appendChild(card);
    });
    seccion.style.display = "block";
  }

  confirmarBtn.addEventListener("click", async () => {
    const razon = (razonEl?.value || "").trim();
    if (!exigirSesion()) return;
    if (!sedeActual)       return mostrarError("Elegí una sucursal.");
    if (!slotSeleccionado) return mostrarError("Elegí una fecha y horario.");
    if (!razon)            return mostrarError("Describí el motivo de tu consulta.");

    const r = await api.post("/turnos", {
      sede_id: sedeActual.id,
      fecha: slotSeleccionado.fecha,
      hora: slotSeleccionado.hora,
      motivo: razon,
    });
    if (!r.ok) {
      mostrarError(r.error);
      if (r.status === 409) {
        await seleccionarSucursal(sedeActual, document.querySelector("#sucursalesGrid .active"));
        mostrarError(r.error);
      }
      return;
    }

    turnoMsg.textContent = "¡Turno reservado! Te esperamos en la sucursal elegida.";
    turnoMsg.classList.remove("error");
    sedeActual = null;
    slotSeleccionado = null;
    if (razonEl) razonEl.value = "";
    document.querySelectorAll(".slot-btn, .especialista-card").forEach((b) => b.classList.remove("active"));
    setTimeout(() => {
      [pasoFecha, pasoHora, pasoMotivo].forEach((p) => (p.style.display = "none"));
      turnoMsg.textContent = "";
    }, 3000);
    cargarMisTurnos();
  });

  await cargarSucursales();
  cargarMisTurnos();
});
