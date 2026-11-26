// context/AuthContext.jsx — sesión compartida por toda la app
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null); // null = cargando

  useEffect(() => {
    authService
      .obtenerSesion()
      .then(setSesion)
      .catch(() => setSesion({ logueado: false }));
  }, []);

  const login = useCallback(async (datos) => {
    const usuario = await authService.login(datos);
    setSesion({ logueado: true, ...usuario });
    return usuario;
  }, []);

  const registrar = useCallback(async (datos) => {
    const usuario = await authService.registrar(datos);
    setSesion({ logueado: true, ...usuario });
    return usuario;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSesion({ logueado: false });
  }, []);

  return <AuthContext.Provider value={{ sesion, login, registrar, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
