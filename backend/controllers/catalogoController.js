// controllers/catalogoController.js — sedes y especialistas
const catalogoService = require("../services/catalogoService");
const { success } = require("../responses/response");

async function sedes(req, res) {
  success(res, await catalogoService.listarSedes());
}

async function especialistas(req, res) {
  success(res, await catalogoService.listarEspecialistas());
}

module.exports = { sedes, especialistas };
