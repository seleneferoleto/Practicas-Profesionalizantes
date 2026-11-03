// productos.js — control de stock de productos (solo administrador)

const nombresCategorias = {
  farmacia: "Farmacia",
  alimentos: "Alimentos",
  juguetes: "Juguetes",
  higiene: "Higiene",
};

const emojisCategorias = {
  farmacia: "💊",
  alimentos: "🍖",
  juguetes: "🧸",
  higiene: "🧼",
};

let productos = [];

function formatearPrecio(precio) {
  return "$" + precio.toLocaleString("es-AR");
}

function crearMediaProducto(prod) {
  const wrap = document.createElement("div");
  wrap.className = "product-img-wrap";
  const emoji = emojisCategorias[prod.categoria] || "📦";

  const mostrarEmoji = () => {
    wrap.classList.add("product-icon");
    wrap.innerHTML = `<span>${emoji}</span>`;
  };

  if (prod.imagen) {
    const img = document.createElement("img");
    img.src = prod.imagen;
    img.alt = prod.nombre;
    img.loading = "lazy";
    img.onerror = mostrarEmoji;
    wrap.appendChild(img);
  } else {
    mostrarEmoji();
  }
  return wrap;
}

function renderProductos(lista) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  lista.forEach((prod) => {
    const article = document.createElement("article");
    article.className = "card product-card";
    article.appendChild(crearMediaProducto(prod));

    const titulo = document.createElement("h3");
    titulo.textContent = prod.nombre;

    const precio = document.createElement("p");
    precio.className = "product-price";
    precio.textContent = formatearPrecio(prod.precio);

    const stockWrap = document.createElement("div");
    stockWrap.className = "product-stock";
    const btnMenos = document.createElement("button");
    btnMenos.type = "button";
    btnMenos.className = "stock-adj";
    btnMenos.textContent = "−";
    const stockNum = document.createElement("span");
    stockNum.className = "stock-num";
    stockNum.textContent = prod.stock;
    const btnMas = document.createElement("button");
    btnMas.type = "button";
    btnMas.className = "stock-adj";
    btnMas.textContent = "+";

    [btnMenos, btnMas].forEach((btn) => {
      btn.addEventListener("click", async () => {
        const r = await api.patch(`/productos/${prod.id}/stock`, { delta: btn === btnMas ? 1 : -1 });
        if (!r.ok) {
          alert(r.error);
          return;
        }
        prod.stock = r.data.stock;
        stockNum.textContent = prod.stock;
      });
    });

    stockWrap.append(btnMenos, stockNum, btnMas);
    article.append(titulo, precio, stockWrap);
    grid.appendChild(article);
  });
}

function actualizarTitulo(categoria) {
  const titulo = document.getElementById("productsTitle");
  const subtitulo = document.getElementById("productsSubtitle");
  if (!titulo) return;
  titulo.textContent = categoria ? `Productos de ${nombresCategorias[categoria]}` : "Todos los productos";
  if (subtitulo) {
    subtitulo.textContent = categoria
      ? "Ordenados de menor a mayor precio."
      : "Mostrando los primeros 9. Elegí una categoría para ver todos.";
  }
}

function filtrarPorCategoria(categoria) {
  document.querySelectorAll(".category-card").forEach((btn) => btn.classList.remove("active"));

  let lista = productos;
  if (categoria) {
    lista = lista.filter((p) => p.categoria === categoria);
    const activo = document.querySelector(`.category-card[data-categoria="${categoria}"]`);
    if (activo) activo.classList.add("active");
  }

  lista = [...lista].sort((a, b) => a.precio - b.precio);
  if (!categoria) lista = lista.slice(0, 9);

  actualizarTitulo(categoria);
  renderProductos(lista);
}

function mostrarAccesoRestringido() {
  const main = document.querySelector("main");
  if (!main) return;
  main.innerHTML = `
    <section class="hero section-spaced">
      <div class="container" style="text-align:center">
        <span class="pill">Acceso restringido</span>
        <h1>Productos</h1>
        <p>Este apartado está disponible únicamente para la cuenta administradora.</p>
        <a href="cuenta.html" class="btn btn-primary">Iniciar sesión</a>
      </div>
    </section>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const sesion = await api.getSesion();
  if (!sesion.logueado || !sesion.es_admin) {
    mostrarAccesoRestringido();
    return;
  }

  const r = await api.get("/productos");
  if (!r.ok) {
    document.getElementById("productsGrid").innerHTML = `<p class="auth-msg error">${r.error}</p>`;
    return;
  }
  productos = r.data;

  document.querySelectorAll(".category-card[data-categoria]").forEach((card) => {
    card.addEventListener("click", () => {
      filtrarPorCategoria(card.classList.contains("active") ? null : card.dataset.categoria);
    });
  });

  const verTodas = document.getElementById("verTodas");
  if (verTodas) {
    verTodas.addEventListener("click", (e) => {
      e.preventDefault();
      filtrarPorCategoria(null);
    });
  }

  const categoriaUrl = new URLSearchParams(window.location.search).get("categoria");
  filtrarPorCategoria(nombresCategorias[categoriaUrl] ? categoriaUrl : null);
});
