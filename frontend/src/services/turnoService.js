// services/turnoService.js
import { get, post, patch } from "./api";

export const listarSedes = async () => (await get("/sedes")).data;
export const obtenerDisponibilidad = async (sedeId) => (await get(`/turnos/disponibilidad?sede_id=${sedeId}`)).data;
export const reservarTurno = async (datos) => (await post("/turnos", datos)).message;
export const listarMisTurnos = async () => (await get("/turnos/mios")).data;
export const cancelarTurno = async (id) => (await patch(`/turnos/${id}/cancelar`)).message;

// Administración
export const listarTodosLosTurnos = async () => (await get("/turnos")).data;
export const cambiarEstadoTurno = async (id, estado) => (await patch(`/turnos/${id}`, { estado })).message;
