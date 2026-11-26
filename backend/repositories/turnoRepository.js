// repositories/turnoRepository.js
const pool = require("../db");

const SELECT_TURNO = `
  SELECT t.id, t.fecha, t.hora, t.motivo, t.estado, t.sede_id,
         s.nombre AS sede, e.nombre AS especialista, e.especialidad,
         u.nombre AS usuario_nombre, u.email AS usuario_email
  FROM turnos t
  JOIN sedes s ON s.id = t.sede_id
  JOIN especialistas e ON e.id = t.especialista_id
  JOIN usuarios u ON u.id = t.usuario_id`;

async function disponibilidadPorSede(sedeId, db = pool) {
  const [filas] = await db.query(
    `SELECT DISTINCT d.fecha, d.hora
     FROM disponibilidad d
     JOIN especialistas e ON e.id = d.especialista_id
     WHERE e.sede_id = ? AND d.disponible = 1
       AND TIMESTAMP(d.fecha, d.hora) >= DATE_ADD(NOW(), INTERVAL 5 HOUR)
     ORDER BY d.fecha, d.hora`,
    [sedeId]
  );
  return filas;
}

// Bloquea y devuelve un horario libre (con 5 horas de anticipación) de la sede
async function bloquearHorarioLibre(sedeId, fecha, hora, db = pool) {
  const [filas] = await db.query(
    `SELECT d.id, d.especialista_id, d.fecha, d.hora
     FROM disponibilidad d
     JOIN especialistas e ON e.id = d.especialista_id
     WHERE e.sede_id = ? AND d.fecha = ? AND d.hora = ? AND d.disponible = 1
       AND TIMESTAMP(d.fecha, d.hora) >= DATE_ADD(NOW(), INTERVAL 5 HOUR)
     ORDER BY d.id LIMIT 1 FOR UPDATE`,
    [sedeId, fecha, hora]
  );
  return filas[0] || null;
}

async function fijarDisponible(disponibilidadId, disponible, db = pool) {
  await db.query("UPDATE disponibilidad SET disponible = ? WHERE id = ?", [disponible ? 1 : 0, disponibilidadId]);
}

async function estaDisponible(disponibilidadId, db = pool) {
  const [filas] = await db.query("SELECT disponible FROM disponibilidad WHERE id = ? FOR UPDATE", [disponibilidadId]);
  return !!(filas[0] && filas[0].disponible);
}

// Turnos activos del usuario en la misma fecha y hora (evita superposición)
async function contarReservadosDelUsuario(usuarioId, fecha, hora, db = pool) {
  const [filas] = await db.query(
    "SELECT COUNT(*) AS total FROM turnos WHERE usuario_id = ? AND fecha = ? AND hora = ? AND estado = 'reservado'",
    [usuarioId, fecha, hora]
  );
  return filas[0].total;
}

async function crear({ usuarioId, sedeId, especialistaId, disponibilidadId, fecha, hora, motivo }, db = pool) {
  const [r] = await db.query(
    `INSERT INTO turnos (usuario_id, sede_id, especialista_id, disponibilidad_id, fecha, hora, motivo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, sedeId, especialistaId, disponibilidadId, fecha, hora, motivo]
  );
  return r.insertId;
}

async function listarPorUsuario(usuarioId, db = pool) {
  const [filas] = await db.query(`${SELECT_TURNO} WHERE t.usuario_id = ? ORDER BY t.fecha DESC, t.hora DESC`, [usuarioId]);
  return filas;
}

async function listarTodos(db = pool) {
  const [filas] = await db.query(`${SELECT_TURNO} ORDER BY t.fecha DESC, t.hora DESC`);
  return filas;
}

async function buscarParaActualizar(id, db = pool) {
  const [filas] = await db.query(
    "SELECT id, usuario_id, disponibilidad_id, estado FROM turnos WHERE id = ? FOR UPDATE",
    [id]
  );
  return filas[0] || null;
}

async function actualizarEstado(id, estado, db = pool) {
  await db.query("UPDATE turnos SET estado = ? WHERE id = ?", [estado, id]);
}

module.exports = {
  disponibilidadPorSede,
  bloquearHorarioLibre,
  fijarDisponible,
  estaDisponible,
  contarReservadosDelUsuario,
  crear,
  listarPorUsuario,
  listarTodos,
  buscarParaActualizar,
  actualizarEstado,
};
