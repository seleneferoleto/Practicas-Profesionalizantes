// routes/turnos.js — disponibilidad por sede, reserva, "mis turnos" y gestión admin
const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const SELECT_TURNO = `
  SELECT t.id, t.fecha, t.hora, t.motivo, t.estado, t.sede_id,
         s.nombre AS sede, e.nombre AS especialista, e.especialidad,
         u.nombre AS usuario_nombre, u.email AS usuario_email
  FROM turnos t
  JOIN sedes s ON s.id = t.sede_id
  JOIN especialistas e ON e.id = t.especialista_id
  JOIN usuarios u ON u.id = t.usuario_id`;

// GET /api/turnos/disponibilidad?sede_id=1
// Fechas y horas con al menos un especialista libre en esa sede
router.get("/disponibilidad", async (req, res) => {
  try {
    const sedeId = Number(req.query.sede_id);
    if (!sedeId) return res.status(400).json({ error: "Falta sede_id." });

    const [filas] = await pool.query(
      `SELECT DISTINCT d.fecha, d.hora
       FROM disponibilidad d
       JOIN especialistas e ON e.id = d.especialista_id
       WHERE e.sede_id = ? AND d.disponible = 1
         AND TIMESTAMP(d.fecha, d.hora) >= DATE_ADD(NOW(), INTERVAL 5 HOUR)
       ORDER BY d.fecha, d.hora`,
      [sedeId]
    );
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /turnos/disponibilidad:", err);
    res.status(500).json({ error: "No se pudo obtener la disponibilidad." });
  }
});

// POST /api/turnos  { sede_id, fecha, hora, motivo }
// Reserva el horario con un especialista libre de la sucursal elegida
router.post("/", requireAuth, async (req, res) => {
  const { sede_id, fecha, hora, motivo } = req.body;
  if (!sede_id || !fecha || !hora || !motivo || !String(motivo).trim()) {
    return res.status(400).json({ error: "Faltan datos: sucursal, fecha, hora y motivo." });
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [slots] = await conexion.query(
      `SELECT d.id, d.especialista_id, d.fecha, d.hora
       FROM disponibilidad d
       JOIN especialistas e ON e.id = d.especialista_id
       WHERE e.sede_id = ? AND d.fecha = ? AND d.hora = ? AND d.disponible = 1
         AND TIMESTAMP(d.fecha, d.hora) >= DATE_ADD(NOW(), INTERVAL 5 HOUR)
       ORDER BY d.id LIMIT 1 FOR UPDATE`,
      [sede_id, fecha, hora]
    );
    const slot = slots[0];
    if (!slot) {
      await conexion.rollback();
      return res.status(409).json({ error: "Ese horario no está disponible. Elegí otro con al menos 5 horas de anticipación." });
    }

    await conexion.query("UPDATE disponibilidad SET disponible = 0 WHERE id = ?", [slot.id]);
    const [resultado] = await conexion.query(
      `INSERT INTO turnos (usuario_id, sede_id, especialista_id, disponibilidad_id, fecha, hora, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.session.usuarioId, sede_id, slot.especialista_id, slot.id, slot.fecha, slot.hora, String(motivo).trim().slice(0, 500)]
    );

    await conexion.commit();
    res.status(201).json({ id: resultado.insertId });
  } catch (err) {
    await conexion.rollback();
    console.error("Error en POST /turnos:", err);
    res.status(500).json({ error: "No se pudo reservar el turno." });
  } finally {
    conexion.release();
  }
});

// GET /api/turnos/mios — turnos del usuario logueado
router.get("/mios", requireAuth, async (req, res) => {
  try {
    const [filas] = await pool.query(
      `${SELECT_TURNO} WHERE t.usuario_id = ? ORDER BY t.fecha DESC, t.hora DESC`,
      [req.session.usuarioId]
    );
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /turnos/mios:", err);
    res.status(500).json({ error: "No se pudieron obtener tus turnos." });
  }
});

// GET /api/turnos — todos los turnos (admin)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [filas] = await pool.query(`${SELECT_TURNO} ORDER BY t.fecha DESC, t.hora DESC`);
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /turnos:", err);
    res.status(500).json({ error: "No se pudieron obtener los turnos." });
  }
});

// PATCH /api/turnos/:id  { estado } (admin). Cancelar libera el horario.
router.patch("/:id", requireAdmin, async (req, res) => {
  const { estado } = req.body;
  if (!["reservado", "completado", "cancelado"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido." });
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [filas] = await conexion.query("SELECT disponibilidad_id, estado FROM turnos WHERE id = ? FOR UPDATE", [req.params.id]);
    const turno = filas[0];
    if (!turno) {
      await conexion.rollback();
      return res.status(404).json({ error: "Turno no encontrado." });
    }

    await conexion.query("UPDATE turnos SET estado = ? WHERE id = ?", [estado, req.params.id]);

    if (estado === "cancelado") {
      await conexion.query("UPDATE disponibilidad SET disponible = 1 WHERE id = ?", [turno.disponibilidad_id]);
    } else if (turno.estado === "cancelado") {
      const [libre] = await conexion.query("SELECT disponible FROM disponibilidad WHERE id = ? FOR UPDATE", [turno.disponibilidad_id]);
      if (!libre[0] || !libre[0].disponible) {
        await conexion.rollback();
        return res.status(409).json({ error: "Ese horario ya fue tomado por otro turno." });
      }
      await conexion.query("UPDATE disponibilidad SET disponible = 0 WHERE id = ?", [turno.disponibilidad_id]);
    }

    await conexion.commit();
    res.json({ ok: true });
  } catch (err) {
    await conexion.rollback();
    console.error("Error en PATCH /turnos:", err);
    res.status(500).json({ error: "No se pudo actualizar el turno." });
  } finally {
    conexion.release();
  }
});

module.exports = router;
