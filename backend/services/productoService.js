// services/productoService.js — catálogo y stock
const Producto = require("../models/Producto");
const { NotFoundError, ConflictError } = require("../exceptions/AppError");

function crearProductoService({ productoRepository, conTransaccion }) {
  const listar = () => productoRepository.listar();

  async function crear(datos) {
    const producto = Producto.validar(datos);
    if (await productoRepository.buscarPorNombre(producto.nombre)) {
      throw new ConflictError("Ya existe un producto con ese nombre.");
    }
    return { id: await productoRepository.crear(producto) };
  }

  async function actualizar(idCrudo, datos) {
    const id = Producto.validarId(idCrudo);
    const producto = Producto.validar(datos);
    if (!(await productoRepository.actualizar(id, producto))) throw new NotFoundError("Producto no encontrado.");
    return { id };
  }

  // Ajusta el stock sin permitir que quede en negativo
  async function ajustarStock(idCrudo, deltaCrudo) {
    const id = Producto.validarId(idCrudo);
    const delta = Producto.validarDelta(deltaCrudo);
    return conTransaccion(async (db) => {
      const actual = await productoRepository.obtenerStock(id, db);
      if (actual === null) throw new NotFoundError("Producto no encontrado.");
      if (actual + delta < 0) throw new ConflictError("No hay stock suficiente para esa operación.");
      await productoRepository.fijarStock(id, actual + delta, db);
      return { stock: actual + delta };
    });
  }

  async function eliminar(idCrudo) {
    const id = Producto.validarId(idCrudo);
    if (!(await productoRepository.eliminar(id))) throw new NotFoundError("Producto no encontrado.");
    return { id };
  }

  return { listar, crear, actualizar, ajustarStock, eliminar };
}

module.exports = crearProductoService;
module.exports.default = crearProductoService({
  productoRepository: require("../repositories/productoRepository"),
  conTransaccion: require("../repositories/transaccion").conTransaccion,
});
