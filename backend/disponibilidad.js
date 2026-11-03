// disponibilidad.js — genera los horarios reservables de los próximos días
const pool = require("./db");

const HORAS_SEMANA = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
];
const HORAS_SABADO = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];
const DIAS_ADELANTE = 14;

function formatearFecha(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function generarDisponibilidad() {
  const [especialistas] = await pool.query("SELECT id FROM especialistas");
  const filas = [];
  const hoy = new Date();

  for (let i = 0; i <= DIAS_ADELANTE; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const dia = fecha.getDay();
    if (dia === 0) continue; // domingos cerrado

    const horas = dia === 6 ? HORAS_SABADO : HORAS_SEMANA;
    const texto = formatearFecha(fecha);
    for (const esp of especialistas) {
      for (const hora of horas) filas.push([esp.id, texto, hora]);
    }
  }

  if (filas.length > 0) {
    await pool.query("INSERT IGNORE INTO disponibilidad (especialista_id, fecha, hora) VALUES ?", [filas]);
  }
  return filas.length;
}

module.exports = { generarDisponibilidad };
