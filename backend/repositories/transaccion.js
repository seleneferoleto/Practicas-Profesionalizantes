// repositories/transaccion.js — ejecuta una función dentro de una transacción MySQL
const pool = require("../db");

async function conTransaccion(fn) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const resultado = await fn(conexion);
    await conexion.commit();
    return resultado;
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

module.exports = { conTransaccion };
