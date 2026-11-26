# Página web - Veterinaria Huellitas Felices

Sitio web estático con secciones separadas para una veterinaria:

- Inicio
- Sobre nosotros
- Nuestras sedes
- Servicios
- Equipo
- Contacto

## Organización

- [frontend/](frontend/): aplicación React (Vite).
  - [src/services/](frontend/src/services/): todas las peticiones HTTP a la API.
  - [src/pages/](frontend/src/pages/) y [src/components/](frontend/src/components/): pantallas y componentes.
  - [src/context/](frontend/src/context/): sesión del usuario.
  - [src/css/](frontend/src/css/): hojas de estilo.
  - [public/Fotos/](frontend/public/Fotos/): imágenes, logos y fotos de productos.
- [backend/](backend/): servidor Node.js, API y configuración de MySQL, con
  routes, controllers, services, repositories, models, middleware, exceptions y responses.
  - [sql/](backend/sql/): esquema de la base de datos.
  - [tests/](backend/tests/): pruebas automatizadas (`npm test`).
- [docs/](docs/): capturas de referencia.

El archivo de configuración local `backend/.env` y las dependencias
`node_modules/` no se suben al repositorio.

## Cómo iniciar el sitio

El registro, el inicio de sesión y los turnos necesitan el backend Node.js y la
base de datos MySQL. Seguí las instrucciones de [backend/README.md](backend/README.md) y luego:

**Desarrollo** (dos terminales):

```bash
cd backend && npm start        # API en http://localhost:3000
cd frontend && npm install && npm run dev   # sitio en http://localhost:5173
```

**Producción**: `cd frontend && npm run build` y abrí **http://localhost:3000**
(el backend publica `frontend/dist`).

## Personalización rápida

- Cambiar colores: editar variables en `:root` dentro de [frontend/src/css/styles.css](frontend/src/css/styles.css).
- Cambiar datos de contacto/sedes: editar [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx).

## Diseño responsive

Las páginas de inicio, cuenta, turnos, productos y administración se adaptan
a celulares, tablets y escritorio. Hasta 1200 px, la navegación se abre con
el botón de menú; las tarjetas y formularios se reorganizan según el espacio.
Las tablas de administración se desplazan horizontalmente dentro de su
contenedor sin ensanchar la página. En dispositivos sin hover, los detalles
de los servicios se muestran directamente.
