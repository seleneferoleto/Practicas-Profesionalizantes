// models/Producto.js — categorías y validación de productos
const { ValidationError } = require("../exceptions/AppError");

const CATEGORIAS = ["farmacia", "alimentos", "juguetes", "higiene"];

class Producto {
  static get CATEGORIAS() {
    return CATEGORIAS;
  }

  static validarId(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) throw new ValidationError("Identificador inválido.");
    return n;
  }

  static validar({ nombre, precio, categoria, stock } = {}) {
    if (!nombre || !String(nombre).trim()) throw new ValidationError("Falta el nombre.");
    if (precio === undefined || precio === "" || !Number.isInteger(Number(precio)) || Number(precio) < 0) {
      throw new ValidationError("Precio inválido.");
    }
    if (!CATEGORIAS.includes(categoria)) throw new ValidationError("Categoría inválida.");
    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      throw new ValidationError("Stock inválido.");
    }
    return {
      nombre: String(nombre).trim().slice(0, 160),
      precio: Number(precio),
      categoria,
      stock: stock === undefined ? 10 : Number(stock),
    };
  }

  static validarDelta(delta) {
    const n = Number(delta);
    if (!Number.isInteger(n) || n === 0) throw new ValidationError("Delta inválido.");
    return n;
  }
}

module.exports = Producto;
