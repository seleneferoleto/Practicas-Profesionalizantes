// services/api.js — cliente HTTP único. Todas las peticiones al backend pasan por acá.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Devuelve { data, message } o lanza ApiError con un mensaje legible
export async function request(method, ruta, cuerpo) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${ruta}`, {
      method,
      credentials: "include",
      headers: cuerpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor.", 0);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || "Ocurrió un error.", res.status);
  }
  return { data: json.data, message: json.message };
}

export const get = (ruta) => request("GET", ruta);
export const post = (ruta, cuerpo = {}) => request("POST", ruta, cuerpo);
export const patch = (ruta, cuerpo = {}) => request("PATCH", ruta, cuerpo);
export const put = (ruta, cuerpo = {}) => request("PUT", ruta, cuerpo);
export const del = (ruta) => request("DELETE", ruta);
