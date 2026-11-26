// repositories/productoRepository.js
const pool = require("../db");

async function listar(db = pool) {
  const [filas] = await db.query("SELECT id, nombre, precio, categoria, imagen, stock FROM productos ORDER BY precio, id");
  return filas;
}

async function buscarPorNombre(nombre, db = pool) {
  const [filas] = await db.query("SELECT id FROM productos WHERE nombre = ?", [nombre]);
  return filas[0] || null;
}

async function crear({ nombre, precio, categoria, stock }, db = pool) {
  const [r] = await db.query(
    "INSERT INTO productos (nombre, precio, categoria, stock) VALUES (?, ?, ?, ?)",
    [nombre, precio, categoria, stock]
  );
  return r.insertId;
}

async function actualizar(id, { nombre, precio, categoria }, db = pool) {
  const [r] = await db.query(
    "UPDATE productos SET nombre = ?, precio = ?, categoria = ? WHERE id = ?",
    [nombre, precio, categoria, id]
  );
  return r.affectedRows > 0;
}

async function obtenerStock(id, db = pool) {
  const [filas] = await db.query("SELECT stock FROM productos WHERE id = ? FOR UPDATE", [id]);
  return filas[0] ? filas[0].stock : null;
}

async function fijarStock(id, stock, db = pool) {
  await db.query("UPDATE productos SET stock = ? WHERE id = ?", [stock, id]);
}

async function eliminar(id, db = pool) {
  const [r] = await db.query("DELETE FROM productos WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

module.exports = { listar, buscarPorNombre, crear, actualizar, obtenerStock, fijarStock, eliminar };
