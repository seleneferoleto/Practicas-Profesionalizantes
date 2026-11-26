// controllers/authController.js
const authService = require("../services/authService");
const { success, created } = require("../responses/response");

function iniciarSesionHttp(req, usuario) {
  req.session.usuarioId = usuario.id;
  req.session.usuarioNombre = usuario.nombre;
  req.session.esAdmin = usuario.es_admin;
}

async function register(req, res) {
  const usuario = await authService.registrar(req.body);
  iniciarSesionHttp(req, usuario);
  created(res, usuario, "Cuenta creada correctamente.");
}

async function login(req, res) {
  const usuario = await authService.iniciarSesion(req.body);
  iniciarSesionHttp(req, usuario);
  success(res, usuario, "Sesión iniciada.");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    success(res, null, "Sesión cerrada.");
  });
}

function me(req, res) {
  if (!req.session || !req.session.usuarioId) return success(res, { logueado: false });
  success(res, {
    logueado: true,
    id: req.session.usuarioId,
    nombre: req.session.usuarioNombre,
    es_admin: !!req.session.esAdmin,
  });
}

module.exports = { register, login, logout, me };
