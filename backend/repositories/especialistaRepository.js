// repositories/especialistaRepository.js
const pool = require("../db");

async function listar(db = pool) {
  const [filas] = await db.query(
    `SELECT e.id, e.nombre, e.especialidad, e.sede_id, s.nombre AS sede, e.foto
     FROM especialistas e
     JOIN sedes s ON s.id = e.sede_id
     ORDER BY e.nombre`
  );
  return filas;
}

module.exports = { listar };
