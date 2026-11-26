// services/turnoService.js — reglas de negocio de los turnos
const Turno = require("../models/Turno");
const { NotFoundError, ConflictError, ForbiddenError } = require("../exceptions/AppError");

function crearTurnoService({ turnoRepository, sedeRepository, conTransaccion }) {
  async function disponibilidad(sedeIdCrudo) {
    const sedeId = Turno.validarSedeId(sedeIdCrudo);
    if (!(await sedeRepository.buscarPorId(sedeId))) throw new NotFoundError("La sucursal no existe.");
    return turnoRepository.disponibilidadPorSede(sedeId);
  }

  async function reservar(usuarioId, datos) {
    const { sedeId, fecha, hora, motivo } = Turno.validarReserva(datos);
    if (!(await sedeRepository.buscarPorId(sedeId))) throw new NotFoundError("La sucursal no existe.");

    return conTransaccion(async (db) => {
      const slot = await turnoRepository.bloquearHorarioLibre(sedeId, fecha, hora, db);
      if (!slot) {
        throw new ConflictError("Ese horario no está disponible. Elegí otro con al menos 5 horas de anticipación.");
      }
      if ((await turnoRepository.contarReservadosDelUsuario(usuarioId, slot.fecha, slot.hora, db)) > 0) {
        throw new ConflictError("Ya tenés un turno reservado en ese día y horario.");
      }

      await turnoRepository.fijarDisponible(slot.id, false, db);
      const id = await turnoRepository.crear(
        {
          usuarioId,
          sedeId,
          especialistaId: slot.especialista_id,
          disponibilidadId: slot.id,
          fecha: slot.fecha,
          hora: slot.hora,
          motivo,
        },
        db
      );
      return { id };
    });
  }

  const misTurnos = (usuarioId) => turnoRepository.listarPorUsuario(usuarioId);
  const todos = () => turnoRepository.listarTodos();

  // El cliente cancela su propio turno reservado y se libera el horario
  async function cancelarPropio(usuarioId, idCrudo) {
    const id = Turno.validarId(idCrudo);
    return conTransaccion(async (db) => {
      const turno = await turnoRepository.buscarParaActualizar(id, db);
      if (!turno) throw new NotFoundError("Turno no encontrado.");
      if (turno.usuario_id !== usuarioId) throw new ForbiddenError("Ese turno no te pertenece.");
      if (turno.estado !== "reservado") throw new ConflictError(`No se puede cancelar un turno ${turno.estado}.`);

      await turnoRepository.actualizarEstado(id, "cancelado", db);
      await turnoRepository.fijarDisponible(turno.disponibilidad_id, true, db);
      return { id, estado: "cancelado" };
    });
  }

  // El administrador cambia el estado; cancelar libera el horario y reactivar lo vuelve a ocupar
  async function cambiarEstado(idCrudo, estadoCrudo) {
    const id = Turno.validarId(idCrudo);
    const estado = Turno.validarEstado(estadoCrudo);
    return conTransaccion(async (db) => {
      const turno = await turnoRepository.buscarParaActualizar(id, db);
      if (!turno) throw new NotFoundError("Turno no encontrado.");

      if (estado === "cancelado" && turno.estado !== "cancelado") {
        await turnoRepository.fijarDisponible(turno.disponibilidad_id, true, db);
      } else if (estado !== "cancelado" && turno.estado === "cancelado") {
        if (!(await turnoRepository.estaDisponible(turno.disponibilidad_id, db))) {
          throw new ConflictError("Ese horario ya fue tomado por otro turno.");
        }
        await turnoRepository.fijarDisponible(turno.disponibilidad_id, false, db);
      }
      await turnoRepository.actualizarEstado(id, estado, db);
      return { id, estado };
    });
  }

  return { disponibilidad, reservar, misTurnos, todos, cancelarPropio, cambiarEstado };
}

module.exports = crearTurnoService;
module.exports.default = crearTurnoService({
  turnoRepository: require("../repositories/turnoRepository"),
  sedeRepository: require("../repositories/sedeRepository"),
  conTransaccion: require("../repositories/transaccion").conTransaccion,
});
