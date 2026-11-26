// services/authService.js
import { get, post } from "./api";

export const obtenerSesion = async () => (await get("/auth/me")).data;
export const login = async (datos) => (await post("/auth/login", datos)).data;
export const registrar = async (datos) => (await post("/auth/register", datos)).data;
export const logout = () => post("/auth/logout");
