// services/catalogoService.js — consulta de sedes y especialistas
const sedeRepository = require("../repositories/sedeRepository");
const especialistaRepository = require("../repositories/especialistaRepository");

module.exports = {
  listarSedes: () => sedeRepository.listar(),
  listarEspecialistas: () => especialistaRepository.listar(),
};
