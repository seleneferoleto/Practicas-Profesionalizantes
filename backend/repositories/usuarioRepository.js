// repositories/usuarioRepository.js
const pool = require("../db");

async function buscarPorEmail(email, db = pool) {
  const [filas] = await db.query(
    "SELECT id, nombre, email, password_hash, es_admin FROM usuarios WHERE email = ?",
    [email]
  );
  return filas[0] || null;
}

async function crear({ nombre, email, passwordHash, telefono }, db = pool) {
  const [r] = await db.query(
    "INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (?, ?, ?, ?)",
    [nombre, email, passwordHash, telefono]
  );
  return r.insertId;
}

module.exports = { buscarPorEmail, crear };
