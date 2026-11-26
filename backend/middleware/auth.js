// middleware/auth.js — protege rutas que necesitan sesión o permisos de admin
const { UnauthorizedError, ForbiddenError } = require("../exceptions/AppError");

function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuarioId) return next(new UnauthorizedError());
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.usuarioId) return next(new UnauthorizedError());
  if (!req.session.esAdmin) return next(new ForbiddenError());
  next();
}

module.exports = { requireAuth, requireAdmin };
