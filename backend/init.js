// init.js — crea la base y las tablas, y carga los datos iniciales
// Se ejecuta con: npm run init
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { SEDES, ESPECIALISTAS, PRODUCTOS } = require("./data");

const DB_NAME = process.env.DB_NAME || "la_huella";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@lahuella.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

async function main() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "sql", "schema.sql"), "utf8");
  await conexion.query(schema.replace(/la_huella/g, DB_NAME));
  await conexion.query(`USE \`${DB_NAME}\``);

  const [[{ total: totalSedes }]] = await conexion.query("SELECT COUNT(*) AS total FROM sedes");
  if (totalSedes === 0) {
    await conexion.query("INSERT INTO sedes (nombre, direccion, telefono) VALUES ?", [
      SEDES.map((s) => [s.nombre, s.direccion, s.telefono]),
    ]);
    const [sedes] = await conexion.query("SELECT id, nombre FROM sedes");
    const idPorNombre = Object.fromEntries(sedes.map((s) => [s.nombre, s.id]));
    await conexion.query("INSERT INTO especialistas (nombre, especialidad, sede_id) VALUES ?", [
      ESPECIALISTAS.map((e) => [e.nombre, e.especialidad, idPorNombre[e.sede]]),
    ]);
  }

  const [[{ total: totalProductos }]] = await conexion.query("SELECT COUNT(*) AS total FROM productos");
  if (totalProductos === 0) {
    await conexion.query("INSERT INTO productos (nombre, precio, categoria, imagen) VALUES ?", [PRODUCTOS]);
  }

  const [admins] = await conexion.query("SELECT id FROM usuarios WHERE email = ?", [ADMIN_EMAIL]);
  if (admins.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await conexion.query(
      "INSERT INTO usuarios (nombre, email, password_hash, es_admin) VALUES ('Jorge Feldman', ?, ?, 1)",
      [ADMIN_EMAIL, hash]
    );
  }

  await conexion.end();
  console.log(`Base "${DB_NAME}" lista. Admin: ${ADMIN_EMAIL}`);
}

main().catch((err) => {
  console.error("Error inicializando la base:", err.message);
  process.exit(1);
});
