const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const crearTurnoService = require("../services/turnoService");
const crearProductoService = require("../services/productoService");
const Usuario = require("../models/Usuario");
const { errorHandler } = require("../middleware/errorHandler");
const { ConflictError } = require("../exceptions/AppError");

const conTransaccion = (fn) => fn({});

function crearServicio({ slot, reservadosUsuario = 0, turno } = {}) {
  const llamadas = [];
  const turnoRepository = {
    bloquearHorarioLibre: async () => slot || null,
    contarReservadosDelUsuario: async () => reservadosUsuario,
    fijarDisponible: async (id, valor) => llamadas.push(["disponible", id, valor]),
    crear: async () => { llamadas.push(["crear"]); return 12; },
    buscarParaActualizar: async (id) => (turno && turno.id === id ? turno : null),
    actualizarEstado: async (id, estado) => llamadas.push(["estado", id, estado]),
    estaDisponible: async () => true,
  };
  const sedeRepository = { buscarPorId: async (id) => (id === 1 ? { id } : null) };
  return { servicio: crearTurnoService({ turnoRepository, sedeRepository, conTransaccion }), llamadas };
}

const SLOT = { id: 8, especialista_id: 2, fecha: "2026-10-29", hora: "10:00:00" };
const datos = { sede_id: 1, fecha: "2026-10-29", hora: "10:00", motivo: "Control" };

test("reservar ocupa el horario y crea el turno", async () => {
  const { servicio, llamadas } = crearServicio({ slot: SLOT });
  assert.deepEqual(await servicio.reservar(3, datos), { id: 12 });
  assert.deepEqual(llamadas, [["disponible", 8, false], ["crear"]]);
});

test("reservar rechaza un horario ocupado o sin 5 horas de anticipación", async () => {
  const { servicio, llamadas } = crearServicio();
  await assert.rejects(servicio.reservar(3, datos), (e) => e.status === 409 && /5 horas/.test(e.message));
  assert.deepEqual(llamadas, []);
});

test("reservar rechaza turnos superpuestos del mismo usuario", async () => {
  const { servicio } = crearServicio({ slot: SLOT, reservadosUsuario: 1 });
  await assert.rejects(servicio.reservar(3, datos), (e) => e.status === 409);
});

test("reservar valida datos obligatorios, formato y sucursal inexistente", async () => {
  const { servicio } = crearServicio({ slot: SLOT });
  await assert.rejects(servicio.reservar(3, { ...datos, motivo: " " }), (e) => e.status === 400);
  await assert.rejects(servicio.reservar(3, { ...datos, fecha: "29/10/2026" }), (e) => e.status === 400);
  await assert.rejects(servicio.reservar(3, { ...datos, hora: "25:00" }), (e) => e.status === 400);
  await assert.rejects(servicio.reservar(3, { ...datos, sede_id: 99 }), (e) => e.status === 404);
});

test("cancelar libera el horario solo si el turno es propio y está reservado", async () => {
  const turno = { id: 5, usuario_id: 3, disponibilidad_id: 8, estado: "reservado" };
  const { servicio, llamadas } = crearServicio({ turno });
  assert.deepEqual(await servicio.cancelarPropio(3, 5), { id: 5, estado: "cancelado" });
  assert.deepEqual(llamadas, [["estado", 5, "cancelado"], ["disponible", 8, true]]);
  await assert.rejects(servicio.cancelarPropio(4, 5), (e) => e.status === 403);
  await assert.rejects(servicio.cancelarPropio(3, 99999), (e) => e.status === 404);

  const cancelado = crearServicio({ turno: { ...turno, estado: "cancelado" } }).servicio;
  await assert.rejects(cancelado.cancelarPropio(3, 5), (e) => e.status === 409);
});

test("el admin no puede usar un estado inválido ni operar sobre turnos inexistentes", async () => {
  const { servicio } = crearServicio();
  await assert.rejects(servicio.cambiarEstado(5, "otro"), (e) => e.status === 400);
  await assert.rejects(servicio.cambiarEstado(5, "completado"), (e) => e.status === 404);
});

test("el stock no puede quedar negativo", async () => {
  let stock = 2;
  const servicio = crearProductoService({
    conTransaccion,
    productoRepository: {
      obtenerStock: async () => stock,
      fijarStock: async (id, nuevo) => { stock = nuevo; },
    },
  });
  assert.deepEqual(await servicio.ajustarStock(1, 1), { stock: 3 });
  await assert.rejects(servicio.ajustarStock(1, -5), (e) => e instanceof ConflictError);
  assert.equal(stock, 3);
});

test("el registro valida email, contraseña y obligatorios", () => {
  assert.throws(() => Usuario.validarRegistro({ nombre: "Ana", email: "ana", password: "123456" }), /email/);
  assert.throws(() => Usuario.validarRegistro({ nombre: "Ana", email: "a@a.com", password: "123" }), /6 caracteres/);
  assert.throws(() => Usuario.validarRegistro({ email: "a@a.com", password: "123456" }), /obligatorios/);
  assert.equal(Usuario.validarRegistro({ nombre: "Ana", email: "A@A.com", password: "123456" }).email, "a@a.com");
});

test("el errorHandler responde con el formato unificado", () => {
  const res = {
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
  errorHandler(new ConflictError("Duplicado"), { method: "GET", originalUrl: "/x" }, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, { success: false, message: "Duplicado" });
});

test("el generador incluye hoy y mantiene los proximos 14 dias y horarios", async () => {
  const filas = [];
  class FechaFija extends Date {
    constructor(...args) {
      super(...(args.length ? args : [2026, 9, 28, 12]));
    }
  }
  const contexto = {
    module: { exports: {} },
    Date: FechaFija,
    require(nombre) {
      assert.equal(nombre, "./db");
      return {
        async query(sql, parametros) {
          if (sql.startsWith("SELECT")) return [[{ id: 1 }]];
          filas.push(...parametros[0]);
          return [{}];
        },
      };
    },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "disponibilidad.js"), "utf8"),
    contexto
  );
  assert.equal(await contexto.module.exports.generarDisponibilidad(), 144);
  assert.equal(filas[0][1], "2026-10-28");
  assert.equal(filas.at(-1)[1], "2026-11-11");
  for (const [, fecha, hora] of filas) {
    assert.ok(fecha >= "2026-10-28");
    const dia = new Date(`${fecha}T12:00:00`).getDay();
    assert.notEqual(dia, 0);
    if (dia === 6) assert.ok(hora < "13:00");
  }
});
