// routes/auth.js — registro, login, logout y "quién soy"
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register  { nombre, email, password, telefono }
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos: nombre, email y contraseña son obligatorios." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña tiene que tener al menos 6 caracteres." });
    }

    const [existentes] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email." });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (?, ?, ?, ?)",
      [nombre, email, hash, telefono || null]
    );

    req.session.usuarioId = resultado.insertId;
    req.session.usuarioNombre = nombre;
    req.session.esAdmin = false;

    res.status(201).json({ id: resultado.insertId, nombre, email, es_admin: false });
  } catch (err) {
    console.error("Error en /register:", err);
    res.status(500).json({ error: "No se pudo crear la cuenta." });
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Ingresá email y contraseña." });
    }

    const [filas] = await pool.query(
      "SELECT id, nombre, email, password_hash, es_admin FROM usuarios WHERE email = ?",
      [email]
    );
    const usuario = filas[0];
    if (!usuario) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: "Email o contraseña incorrectos." });
    }

    req.session.usuarioId = usuario.id;
    req.session.usuarioNombre = usuario.nombre;
    req.session.esAdmin = !!usuario.es_admin;

    res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, es_admin: !!usuario.es_admin });
  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// GET /api/auth/me — para que el frontend sepa si hay sesión activa
router.get("/me", (req, res) => {
  if (!req.session || !req.session.usuarioId) {
    return res.json({ logueado: false });
  }
  res.json({
    logueado: true,
    id: req.session.usuarioId,
    nombre: req.session.usuarioNombre,
    es_admin: !!req.session.esAdmin,
  });
});

module.exports = router;
