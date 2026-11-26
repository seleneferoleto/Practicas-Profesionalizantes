// services/productoService.js (solo administrador)
import { get, post, patch, del } from "./api";

export const listarProductos = async () => (await get("/productos")).data;
export const crearProducto = async (datos) => (await post("/productos", datos)).message;
export const ajustarStock = async (id, delta) => (await patch(`/productos/${id}/stock`, { delta })).data;
export const eliminarProducto = async (id) => (await del(`/productos/${id}`)).message;
