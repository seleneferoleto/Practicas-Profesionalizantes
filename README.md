# Página web - Veterinaria Huellitas Felices

Sitio web estático con secciones separadas para una veterinaria:

- Inicio
- Sobre nosotros
- Nuestras sedes
- Servicios
- Equipo
- Contacto

## Organización

- [frontend/](frontend/): páginas HTML del sitio.
  - [css/](frontend/css/): hojas de estilo.
  - [js/](frontend/js/): scripts del navegador y cliente de la API.
  - [Fotos/](frontend/Fotos/): imágenes, logos y fotos de productos.
- [backend/](backend/): servidor Node.js, API y configuración de MySQL.
  - [routes/](backend/routes/): rutas de la API.
  - [middleware/](backend/middleware/): controles de acceso.
  - [sql/](backend/sql/): esquema de la base de datos.
  - [tests/](backend/tests/): pruebas automatizadas.
- [docs/](docs/): capturas de referencia.

El archivo de configuración local `backend/.env` y las dependencias
`backend/node_modules/` no se suben al repositorio.

## Cómo iniciar el sitio

El registro, el inicio de sesión y los turnos necesitan el backend Node.js y la
base de datos MySQL. Seguí las instrucciones de configuración en
[backend/README.md](backend/README.md) y luego abrí **http://localhost:3000**.

También podés abrir la carpeta `frontend/` como raíz de Live Server y visitar
**http://localhost:5500**,
siempre que el backend esté corriendo en **http://localhost:3000** y la
configuración `FRONTEND_ORIGIN` del backend coincida.

No abras los archivos `.html` directamente desde el explorador para usar las
funciones de cuenta: en ese modo no hay un servidor que atienda la API.

Para una vista estática de solo lectura, se puede iniciar un servidor local:

```bash
cd frontend
python -m http.server 8000
```

Luego abrí:

- http://localhost:8000

Este modo estático no habilita registro, inicio de sesión ni turnos.

## Personalización rápida

- Cambiar colores: editar variables en `:root` dentro de [frontend/css/styles.css](frontend/css/styles.css).
- Cambiar datos de contacto/sedes: editar el contenido en [frontend/index.html](frontend/index.html).

## Diseño responsive

Las páginas de inicio, cuenta, turnos, productos y administración se adaptan
a celulares, tablets y escritorio. Hasta 1200 px, la navegación se abre con
el botón de menú; las tarjetas y formularios se reorganizan según el espacio.
Las tablas de administración se desplazan horizontalmente dentro de su
contenedor sin ensanchar la página. En dispositivos sin hover, los detalles
de los servicios se muestran directamente.
