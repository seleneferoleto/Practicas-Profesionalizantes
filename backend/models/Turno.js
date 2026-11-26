// models/Turno.js — estados y validación de los datos de un turno
const { ValidationError } = require("../exceptions/AppError");

const ESTADOS = ["reservado", "completado", "cancelado"];

class Turno {
  static get ESTADOS() {
    return ESTADOS;
  }

  static validarId(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) throw new ValidationError("Identificador inválido.");
    return n;
  }

  static validarReserva({ sede_id, fecha, hora, motivo } = {}) {
    if (!sede_id || !fecha || !hora || !motivo || !String(motivo).trim()) {
      throw new ValidationError("Faltan datos: sucursal, fecha, hora y motivo.");
    }
    const sedeId = Number(sede_id);
    if (!Number.isInteger(sedeId) || sedeId <= 0) throw new ValidationError("La sucursal es inválida.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha)) || Number.isNaN(Date.parse(fecha))) {
      throw new ValidationError("La fecha debe tener el formato AAAA-MM-DD.");
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(String(hora))) {
      throw new ValidationError("La hora debe tener el formato HH:MM.");
    }
    return {
      sedeId,
      fecha: String(fecha),
      hora: String(hora).slice(0, 5),
      motivo: String(motivo).trim().slice(0, 500),
    };
  }

  static validarSedeId(valor) {
    const sedeId = Number(valor);
    if (!Number.isInteger(sedeId) || sedeId <= 0) throw new ValidationError("Falta sede_id.");
    return sedeId;
  }

  static validarEstado(estado) {
    if (!ESTADOS.includes(estado)) throw new ValidationError("Estado inválido.");
    return estado;
  }
}

module.exports = Turno;
