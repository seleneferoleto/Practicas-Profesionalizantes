// controllers/turnoController.js
const turnoService = require("../services/turnoService").default;
const { success, created } = require("../responses/response");

async function disponibilidad(req, res) {
  success(res, await turnoService.disponibilidad(req.query.sede_id));
}

async function reservar(req, res) {
  const turno = await turnoService.reservar(req.session.usuarioId, req.body);
  created(res, turno, "¡Turno reservado! Te esperamos en la sucursal elegida.");
}

async function mios(req, res) {
  success(res, await turnoService.misTurnos(req.session.usuarioId));
}

async function todos(req, res) {
  success(res, await turnoService.todos());
}

async function cancelar(req, res) {
  success(res, await turnoService.cancelarPropio(req.session.usuarioId, req.params.id), "Turno cancelado.");
}

async function cambiarEstado(req, res) {
  success(res, await turnoService.cambiarEstado(req.params.id, req.body.estado), "Turno actualizado.");
}

module.exports = { disponibilidad, reservar, mios, todos, cancelar, cambiarEstado };
