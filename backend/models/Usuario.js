// models/Usuario.js — reglas de forma y validación de los datos de usuario
const { ValidationError } = require("../exceptions/AppError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Usuario {
  static validarRegistro({ nombre, email, password, telefono } = {}) {
    if (!nombre || !String(nombre).trim() || !email || !String(email).trim() || !password) {
      throw new ValidationError("Faltan datos: nombre, email y contraseña son obligatorios.");
    }
    if (!EMAIL_REGEX.test(String(email).trim())) throw new ValidationError("El email no tiene un formato válido.");
    if (String(password).length < 6) throw new ValidationError("La contraseña tiene que tener al menos 6 caracteres.");
    if (telefono && !/^[0-9+()\-\s]{6,40}$/.test(String(telefono))) {
      throw new ValidationError("El teléfono no tiene un formato válido.");
    }
    return {
      nombre: String(nombre).trim().slice(0, 120),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      telefono: telefono ? String(telefono).trim() : null,
    };
  }

  static validarLogin({ email, password } = {}) {
    if (!email || !password) throw new ValidationError("Ingresá email y contraseña.");
    return { email: String(email).trim().toLowerCase(), password: String(password) };
  }

  // Datos públicos que se devuelven al cliente
  static publico(u) {
    return { id: u.id, nombre: u.nombre, email: u.email, es_admin: !!u.es_admin };
  }
}

module.exports = Usuario;
