// services/authService.js — registro y login
const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuario");
const usuarioRepository = require("../repositories/usuarioRepository");
const { ConflictError, UnauthorizedError } = require("../exceptions/AppError");

const SALT_ROUNDS = 10;

async function registrar(datos) {
  const { nombre, email, password, telefono } = Usuario.validarRegistro(datos);
  if (await usuarioRepository.buscarPorEmail(email)) throw new ConflictError("Ya existe una cuenta con ese email.");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await usuarioRepository.crear({ nombre, email, passwordHash, telefono });
  return Usuario.publico({ id, nombre, email, es_admin: false });
}

async function iniciarSesion(datos) {
  const { email, password } = Usuario.validarLogin(datos);
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    throw new UnauthorizedError("Email o contraseña incorrectos.");
  }
  return Usuario.publico(usuario);
}

module.exports = { registrar, iniciarSesion };
