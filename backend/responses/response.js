// responses/response.js — formato único de respuestas HTTP:
//   éxito: { success: true,  message, data }
//   error: { success: false, message }
function success(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function created(res, data, message = "Creado correctamente.") {
  return success(res, data, message, 201);
}

function failure(res, message, status = 500) {
  return res.status(status).json({ success: false, message });
}

module.exports = { success, created, failure };
