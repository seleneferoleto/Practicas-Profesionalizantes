// api.js — cliente del backend (misma origen: el servidor Node sirve el sitio y la API)

const api = (() => {
  const baseUrl = window.location.port === "5500"
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : "/api";

  async function pedir(metodo, ruta, cuerpo) {
    try {
      const res = await fetch(`${baseUrl}${ruta}`, {
        method: metodo,
        credentials: "include",
        headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, status: res.status, error: data.error || "Ocurrió un error." };
      return { ok: true, data };
    } catch {
      return { ok: false, status: 0, error: "No se pudo conectar con el servidor." };
    }
  }

  let sesionCache = null;

  async function getSesion() {
    if (!sesionCache) {
      const r = await pedir("GET", "/auth/me");
      sesionCache = r.ok ? r.data : { logueado: false };
    }
    return sesionCache;
  }

  return {
    get: (ruta) => pedir("GET", ruta),
    post: (ruta, cuerpo) => pedir("POST", ruta, cuerpo || {}),
    patch: (ruta, cuerpo) => pedir("PATCH", ruta, cuerpo),
    put: (ruta, cuerpo) => pedir("PUT", ruta, cuerpo),
    delete: (ruta) => pedir("DELETE", ruta),
    getSesion,
    async login(datos) {
      sesionCache = null;
      return pedir("POST", "/auth/login", datos);
    },
    async register(datos) {
      sesionCache = null;
      return pedir("POST", "/auth/register", datos);
    },
    async logout() {
      sesionCache = null;
      return pedir("POST", "/auth/logout", {});
    },
  };
})();
