// controllers/productoController.js
const productoService = require("../services/productoService").default;
const { success, created } = require("../responses/response");

async function listar(req, res) {
  success(res, await productoService.listar());
}

async function crear(req, res) {
  created(res, await productoService.crear(req.body), "Producto creado.");
}

async function actualizar(req, res) {
  success(res, await productoService.actualizar(req.params.id, req.body), "Producto actualizado.");
}

async function ajustarStock(req, res) {
  success(res, await productoService.ajustarStock(req.params.id, req.body.delta), "Stock actualizado.");
}

async function eliminar(req, res) {
  success(res, await productoService.eliminar(req.params.id), "Producto eliminado.");
}

module.exports = { listar, crear, actualizar, ajustarStock, eliminar };
