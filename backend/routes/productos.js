// routes/productos.js — catálogo y stock (solo administradores)
const express = require("express");
const pool = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const CATEGORIAS = ["farmacia", "alimentos", "juguetes", "higiene"];

router.use(requireAdmin);

function validar({ nombre, precio, categoria, stock }) {
  if (!nombre || !String(nombre).trim()) return "Falta el nombre.";
  if (!Number.isInteger(Number(precio)) || Number(precio) < 0) return "Precio inválido.";
  if (!CATEGORIAS.includes(categoria)) return "Categoría inválida.";
  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) return "Stock inválido.";
  return null;
}

// GET /api/productos
router.get("/", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT id, nombre, precio, categoria, imagen, stock FROM productos ORDER BY precio, id");
    res.json(filas);
  } catch (err) {
    console.error("Error en GET /productos:", err);
    res.status(500).json({ error: "No se pudieron obtener los productos." });
  }
});

// POST /api/productos  { nombre, precio, categoria, stock? }
router.post("/", async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { nombre, precio, categoria, stock } = req.body;
    const [r] = await pool.query(
      "INSERT INTO productos (nombre, precio, categoria, stock) VALUES (?, ?, ?, ?)",
      [String(nombre).trim(), Number(precio), categoria, stock === undefined ? 10 : Number(stock)]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    console.error("Error en POST /productos:", err);
    res.status(500).json({ error: "No se pudo crear el producto." });
  }
});

// PUT /api/productos/:id  { nombre, precio, categoria }
router.put("/:id", async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const { nombre, precio, categoria } = req.body;
    const [r] = await pool.query(
      "UPDATE productos SET nombre = ?, precio = ?, categoria = ? WHERE id = ?",
      [String(nombre).trim(), Number(precio), categoria, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en PUT /productos:", err);
    res.status(500).json({ error: "No se pudo actualizar el producto." });
  }
});

// PATCH /api/productos/:id/stock  { delta }
router.patch("/:id/stock", async (req, res) => {
  const delta = Number(req.body.delta);
  if (!Number.isInteger(delta)) return res.status(400).json({ error: "Delta inválido." });
  try {
    const [r] = await pool.query("UPDATE productos SET stock = GREATEST(0, stock + ?) WHERE id = ?", [delta, req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado." });
    const [[fila]] = await pool.query("SELECT stock FROM productos WHERE id = ?", [req.params.id]);
    res.json({ stock: fila.stock });
  } catch (err) {
    console.error("Error en PATCH /productos/stock:", err);
    res.status(500).json({ error: "No se pudo actualizar el stock." });
  }
});

// DELETE /api/productos/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error en DELETE /productos:", err);
    res.status(500).json({ error: "No se pudo eliminar el producto." });
  }
});

module.exports = router;
