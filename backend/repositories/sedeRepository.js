// repositories/sedeRepository.js
const pool = require("../db");

async function listar(db = pool) {
  const [filas] = await db.query("SELECT id, nombre, direccion, telefono FROM sedes ORDER BY nombre");
  return filas;
}

async function buscarPorId(id, db = pool) {
  const [filas] = await db.query("SELECT id, nombre FROM sedes WHERE id = ?", [id]);
  return filas[0] || null;
}

module.exports = { listar, buscarPorId };
