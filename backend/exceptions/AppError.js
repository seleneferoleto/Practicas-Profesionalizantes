// exceptions/AppError.js — errores de negocio con su código HTTP
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Tenés que iniciar sesión para hacer esto.") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Acceso solo para administradores.") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado.") {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError };
