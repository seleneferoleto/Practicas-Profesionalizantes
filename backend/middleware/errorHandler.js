// middleware/errorHandler.js — manejo centralizado de errores
const { AppError, NotFoundError } = require("../exceptions/AppError");
const { failure } = require("../responses/response");

// Envuelve los controllers async para que los errores lleguen al errorHandler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res, next) {
  next(new NotFoundError("Ruta no encontrada."));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) return failure(res, err.message, err.status);
  if (err && err.type === "entity.parse.failed") return failure(res, "El cuerpo de la petición no es un JSON válido.", 400);

  console.error(`Error en ${req.method} ${req.originalUrl}:`, err);
  return failure(res, "Ocurrió un error inesperado en el servidor.", 500);
}

module.exports = { asyncHandler, notFound, errorHandler };
