const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function cargarRutas(pool) {
  const rutas = {};
  const router = {};
  for (const metodo of ["get", "post", "patch"]) {
    router[metodo] = (ruta, ...handlers) => {
      rutas[`${metodo} ${ruta}`] = handlers.at(-1);
    };
  }
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "..", "routes", "turnos.js"), "utf8"),
    {
      module: { exports: {} },
      console,
      require(nombre) {
        if (nombre === "express") return { Router: () => router };
        if (nombre === "../db") return pool;
        if (nombre === "../middleware/auth") return {};
        throw new Error(`Módulo inesperado: ${nombre}`);
      },
    }
  );
  return rutas;
}

function respuesta() {
  return {
    statusCode: 200,
    status(codigo) { this.statusCode = codigo; return this; },
    json(datos) { this.body = datos; return this; },
  };
}

test("la disponibilidad exige al menos 5 horas de anticipacion en MySQL", async () => {
  const rutas = cargarRutas({
    async query(sql, parametros) {
      assert.match(sql, /TIMESTAMP\(d\.fecha, d\.hora\) >= DATE_ADD\(NOW\(\), INTERVAL 5 HOUR\)/);
      assert.equal(parametros[0], 1);
      return [[{ fecha: "2026-10-29", hora: "10:00:00" }]];
    },
  });
  const res = respuesta();
  await rutas["get /disponibilidad"]({ query: { sede_id: "1" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body[0].fecha, "2026-10-29");
});

for (const disponible of [false, true]) {
  test(`la reserva ${disponible ? "confirma un horario futuro" : "rechaza un horario excluido sin escribir datos"}`, async () => {
    const operaciones = [];
    const conexion = {
      async beginTransaction() { operaciones.push("begin"); },
      async rollback() { operaciones.push("rollback"); },
      async commit() { operaciones.push("commit"); },
      release() { operaciones.push("release"); },
      async query(sql) {
        if (sql.includes("SELECT d.id")) {
          assert.match(sql, /TIMESTAMP\(d\.fecha, d\.hora\) >= DATE_ADD\(NOW\(\), INTERVAL 5 HOUR\)/);
          return [disponible
            ? [{ id: 8, especialista_id: 2, fecha: "2026-10-29", hora: "10:00:00" }]
            : []];
        }
        operaciones.push(sql.startsWith("UPDATE") ? "update" : "insert");
        return [{ insertId: 12 }];
      },
    };
    const rutas = cargarRutas({ getConnection: async () => conexion });
    const res = respuesta();
    await rutas["post /"]({
      body: { sede_id: 1, fecha: disponible ? "2026-10-29" : "2026-10-28", hora: "10:00", motivo: "Control" },
      session: { usuarioId: 3 },
    }, res);
    assert.equal(res.statusCode, disponible ? 201 : 409);
    assert.deepEqual(operaciones, disponible
      ? ["begin", "update", "insert", "commit", "release"]
      : ["begin", "rollback", "release"]);
    if (!disponible) assert.match(res.body.error, /5 horas/);
  });
}

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
