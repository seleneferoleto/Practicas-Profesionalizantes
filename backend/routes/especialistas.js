// routes/especialistas.js
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/especialistas
router.get("/", async (req, res) => {
  try {
    const [filas] = await pool.query(
      `SELECT e.id, e.nombre, e.especialidad, e.sede_id, s.nombre AS sede, e.foto
       FROM especialistas e
       JOIN sedes s ON s.id = e.sede_id
       ORDER BY e.nombre`
    );
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /especialistas:", err);
    res.status(500).json({ error: "No se pudieron obtener los especialistas." });
  }
});

module.exports = router;
