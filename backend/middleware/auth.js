// middleware/auth.js — protege rutas que necesitan sesión o permisos de admin
function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ error: "Tenés que iniciar sesión para hacer esto." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ error: "Tenés que iniciar sesión para hacer esto." });
  }
  if (!req.session.esAdmin) {
    return res.status(403).json({ error: "Acceso solo para administradores." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
