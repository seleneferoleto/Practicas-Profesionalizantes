# Página web - Veterinaria Huellitas Felices

Sitio web estático con secciones separadas para una veterinaria:

- Inicio
- Sobre nosotros
- Nuestras sedes
- Servicios
- Equipo
- Contacto

## Archivos

- `index.html`: estructura de la página.
- `styles.css`: estilos, espaciado entre secciones y diseño responsive.
- `script.js`: menú móvil y mensaje de formulario.

## Cómo iniciar el sitio

El registro, el inicio de sesión y los turnos necesitan el backend Node.js y la
base de datos MySQL. Seguí las instrucciones de configuración en
[backend/README.md](backend/README.md) y luego abrí **http://localhost:3000**.

También podés servir el frontend con Live Server en **http://localhost:5500**,
siempre que el backend esté corriendo en **http://localhost:3000** y la
configuración `FRONTEND_ORIGIN` del backend coincida.

No abras los archivos `.html` directamente desde el explorador para usar las
funciones de cuenta: en ese modo no hay un servidor que atienda la API.

Para una vista estática de solo lectura, se puede iniciar un servidor local:

```bash
python -m http.server 8000
```

Luego abrí:

- http://localhost:8000

Este modo estático no habilita registro, inicio de sesión ni turnos.

## Personalización rápida

- Cambiar colores: editar variables en `:root` dentro de `styles.css`.
- Cambiar datos de contacto/sedes: editar el contenido en `index.html`.

## Diseño responsive

Las páginas de inicio, cuenta, turnos, productos y administración se adaptan
a celulares, tablets y escritorio. Hasta 1200 px, la navegación se abre con
el botón de menú; las tarjetas y formularios se reorganizan según el espacio.
Las tablas de administración se desplazan horizontalmente dentro de su
contenedor sin ensanchar la página. En dispositivos sin hover, los detalles
de los servicios se muestran directamente.
