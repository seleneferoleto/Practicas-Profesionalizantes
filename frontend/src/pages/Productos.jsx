// pages/Productos.jsx — catálogo y control de stock (solo administrador)
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as productoService from "../services/productoService";

const CATEGORIAS = {
  farmacia: { nombre: "Farmacia", emoji: "💊" },
  alimentos: { nombre: "Alimentos", emoji: "🍖" },
  juguetes: { nombre: "Juguetes", emoji: "🧸" },
  higiene: { nombre: "Higiene", emoji: "🧼" },
};

const precio = (n) => "$" + n.toLocaleString("es-AR");

function MediaProducto({ prod }) {
  const [fallo, setFallo] = useState(!prod.imagen);
  const emoji = CATEGORIAS[prod.categoria]?.emoji || "📦";
  if (fallo) {
    return <div className="product-img-wrap product-icon"><span>{emoji}</span></div>;
  }
  return (
    <div className="product-img-wrap">
      <img src={`/${prod.imagen}`} alt={prod.nombre} loading="lazy" onError={() => setFallo(true)} />
    </div>
  );
}

const FORM_VACIO = { nombre: "", precio: "", categoria: "farmacia", stock: "10" };

export default function Productos() {
  const { sesion } = useAuth();
  const [params, setParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: "", error: false });
  const [form, setForm] = useState(FORM_VACIO);

  const categoriaParam = params.get("categoria");
  const categoria = CATEGORIAS[categoriaParam] ? categoriaParam : null;
  const esAdmin = !!sesion?.logueado && sesion.es_admin;

  const avisar = (texto, error = false) => setMensaje({ texto, error });

  const cargar = () =>
    productoService.listarProductos().then(setProductos).catch((err) => avisar(err.message, true));

  useEffect(() => {
    if (esAdmin) cargar();
  }, [esAdmin]);

  const visibles = useMemo(() => {
    let lista = categoria ? productos.filter((p) => p.categoria === categoria) : productos;
    lista = [...lista].sort((a, b) => a.precio - b.precio);
    return categoria ? lista : lista.slice(0, 9);
  }, [productos, categoria]);

  if (!sesion) return null;

  if (!esAdmin) {
    return (
      <main>
        <section className="hero section-spaced">
          <div className="container" style={{ textAlign: "center" }}>
            <span className="pill">Acceso restringido</span>
            <h1>Productos</h1>
            <p>Este apartado está disponible únicamente para la cuenta administradora.</p>
            <Link to="/cuenta" className="btn btn-primary">Iniciar sesión</Link>
          </div>
        </section>
      </main>
    );
  }

  const elegirCategoria = (c) => (c === categoria ? setParams({}) : setParams({ categoria: c }));

  const ajustar = async (prod, delta) => {
    try {
      const { stock } = await productoService.ajustarStock(prod.id, delta);
      setProductos((lista) => lista.map((p) => (p.id === prod.id ? { ...p, stock } : p)));
      setMensaje({ texto: "", error: false });
    } catch (err) {
      avisar(err.message, true);
    }
  };

  const eliminar = async (prod) => {
    if (!window.confirm(`¿Eliminar "${prod.nombre}"?`)) return;
    try {
      avisar(await productoService.eliminarProducto(prod.id));
      cargar();
    } catch (err) {
      avisar(err.message, true);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      avisar(await productoService.crearProducto(form));
      setForm(FORM_VACIO);
      cargar();
    } catch (err) {
      avisar(err.message, true);
    }
  };

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <main id="productos-top">
      <section className="hero section-spaced" style={{ paddingTop: "5rem", paddingBottom: "2rem" }}>
        <div className="container">
          <span className="pill">Solo acceso autorizado</span>
          <h1>Gestión de Productos</h1>
          <p style={{ color: "var(--muted)" }}>Consultá el catálogo y administrá el stock de cada producto.</p>
        </div>
      </section>

      <section id="categorias" className="section-spaced" style={{ paddingTop: "1rem" }}>
        <div className="container">
          <div className="productos-heading">
            <h2>Categorías</h2>
            <a href="#" className="ver-todas-link" onClick={(e) => { e.preventDefault(); setParams({}); }}>
              Mostrar todas las categorías
            </a>
          </div>

          <div className="categories-grid">
            {Object.entries(CATEGORIAS).map(([clave, c]) => (
              <button
                type="button"
                key={clave}
                className={`category-card${categoria === clave ? " active" : ""}`}
                onClick={() => elegirCategoria(clave)}
              >
                <span className="category-icon">{c.emoji}</span>
                <span className="category-label">{c.nombre}</span>
              </button>
            ))}
          </div>

          <h3 className="products-subtitle">
            {categoria ? `Productos de ${CATEGORIAS[categoria].nombre}` : "Todos los productos"}
          </h3>
          <p className="section-intro">
            {categoria
              ? "Ordenados de menor a mayor precio."
              : "Mostrando los primeros 9. Elegí una categoría para ver todos."}
          </p>

          {mensaje.texto && <p className={`auth-msg${mensaje.error ? " error" : " success"}`}>{mensaje.texto}</p>}

          <div className="cards-grid productos-grid">
            {visibles.map((prod) => (
              <article className="card product-card" key={prod.id}>
                <MediaProducto prod={prod} />
                <h3>{prod.nombre}</h3>
                <p className="product-price">{precio(prod.precio)}</p>
                <div className="product-stock">
                  <button type="button" className="stock-adj" onClick={() => ajustar(prod, -1)}>−</button>
                  <span className="stock-num">{prod.stock}</span>
                  <button type="button" className="stock-adj" onClick={() => ajustar(prod, 1)}>+</button>
                </div>
                <button type="button" className="btn-cancelar btn-sm" onClick={() => eliminar(prod)}>Eliminar</button>
              </article>
            ))}
          </div>

          <h3 className="products-subtitle">Agregar producto</h3>
          <form className="auth-form active" onSubmit={crear} style={{ maxWidth: "420px" }}>
            <label htmlFor="pNombre">Nombre</label>
            <input id="pNombre" value={form.nombre} onChange={cambiar("nombre")} required />
            <label htmlFor="pPrecio">Precio</label>
            <input id="pPrecio" type="number" min="0" step="1" value={form.precio} onChange={cambiar("precio")} required />
            <label htmlFor="pCategoria">Categoría</label>
            <select id="pCategoria" className="admin-select" value={form.categoria} onChange={cambiar("categoria")}>
              {Object.entries(CATEGORIAS).map(([clave, c]) => <option key={clave} value={clave}>{c.nombre}</option>)}
            </select>
            <label htmlFor="pStock">Stock inicial</label>
            <input id="pStock" type="number" min="0" step="1" value={form.stock} onChange={cambiar("stock")} required />
            <button className="btn btn-primary" type="submit">Agregar producto</button>
          </form>
        </div>
      </section>
    </main>
  );
}
