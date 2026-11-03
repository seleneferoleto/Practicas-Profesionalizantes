// routes/sedes.js
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/sedes
router.get("/", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT id, nombre, direccion, telefono FROM sedes ORDER BY nombre");
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /sedes:", err);
    res.status(500).json({ error: "No se pudieron obtener las sedes." });
  }
});

module.exports = router;
