# Backend — La Huella Veterinaria

Node.js + Express + MySQL. La API vive en `/api`; el mismo servidor publica el
build de React (`frontend/dist`) si existe.

## Arquitectura

```
routes/        define los endpoints y sus middlewares
controllers/   reciben la petición HTTP y responden (sin lógica de negocio)
services/      reglas de negocio (turnos, productos, autenticación)
repositories/  todo el SQL; reciben una conexión opcional para usar transacciones
models/        validación y forma de los datos (Usuario, Turno, Producto)
middleware/    auth (login/admin) y errorHandler centralizado
exceptions/    AppError y derivadas (400, 401, 403, 404, 409)
responses/     formato único de respuestas
```

Formato de respuesta: `{ success: true, message, data }` o `{ success: false, message }`.

Reglas de negocio de turnos: horario libre y con 5 h de anticipación, sin
turnos superpuestos para un mismo cliente, el cliente solo cancela sus propios
turnos reservados (se libera el horario) y el administrador cambia estados.
El stock nunca puede quedar negativo.

Tests: `npm test`.

## Base de datos

Tablas: `sedes`, `usuarios` (con `es_admin`), `especialistas` (cada uno pertenece a una sede),
`disponibilidad`, `turnos` (se registran según la sucursal elegida, con su motivo) y
`productos` (con `stock`, solo para que el administrador lo controle; no se venden en la web).

El esquema está en `sql/schema.sql`.

## Puesta en marcha

Requisitos: Node.js 18+ y MySQL 8 corriendo.

```bash
cd backend
copy .env.example .env      # completar DB_USER y DB_PASSWORD
npm install
npm run init                # crea la base, tablas y datos iniciales (sedes, especialistas, productos, admin)
npm start
```

Para usar el sitio: compilá el frontend (`cd frontend && npm install && npm run build`)
y abrí **http://localhost:3000**. Para desarrollar, corré `npm run dev` en `frontend/`
y abrí **http://localhost:5173** (Vite redirige `/api` al backend).

Al arrancar, el servidor genera los horarios de hoy y los próximos 14 días
(lunes a viernes 10–13 y 16–19, sábados 10–13, turnos de 30 min; domingos cerrado).
La disponibilidad y las nuevas reservas requieren al menos 5 horas de anticipación,
según la fecha y hora de MySQL. Se permiten turnos para el mismo día si cumplen
ese plazo, sin corte a las 13:00. Los turnos ya reservados se conservan.

## Administrador

`npm run init` crea el usuario admin a nombre de Jorge Feldman con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`
(por defecto `admin@lahuella.com` / `admin1234`). Cambiá la contraseña antes de publicar el sitio.

## Especialistas

- Jorge Feldman: clínica general y fitoterapia, en Sede Ballester.
- Sandra Gomez: clínica general y acupuntura, en Sede Chilavert.

Para actualizar una base ya inicializada, ejecutá `npm run actualizar-equipo`
desde `backend`. Conserva los identificadores de los especialistas que reemplaza
en cada sede, actualiza el nombre del administrador sin cambiar sus credenciales
y genera los horarios del equipo. No elimina reservas: si un especialista que
se va a quitar tiene turnos, la actualización se cancela y avisa para que se
reasignen previamente. No hace falta reinicializar ni borrar la base.
Las sesiones ya abiertas muestran el nombre actualizado al volver a iniciar sesión.

## Endpoints

| Método | Ruta                               | Descripción                                    | Acceso |
|--------|------------------------------------|------------------------------------------------|:------:|
| POST   | /api/auth/register                 | Crear cuenta                                   | público |
| POST   | /api/auth/login                    | Iniciar sesión                                 | público |
| POST   | /api/auth/logout                   | Cerrar sesión                                  | público |
| GET    | /api/auth/me                       | Sesión activa                                  | público |
| GET    | /api/sedes                         | Sucursales                                     | público |
| GET    | /api/especialistas                 | Especialistas con su sede                      | público |
| GET    | /api/turnos/disponibilidad?sede_id=1 | Fechas/horas libres de una sucursal          | público |
| POST   | /api/turnos                        | Reservar `{ sede_id, fecha, hora, motivo }`    | login |
| GET    | /api/turnos/mios                   | Mis turnos                                     | login |
| PATCH  | /api/turnos/:id/cancelar           | Cancelar mi turno reservado (libera el horario) | login |
| GET    | /api/turnos                        | Todos los turnos                               | admin |
| PATCH  | /api/turnos/:id                    | Cambiar estado (cancelar libera el horario)    | admin |
| GET    | /api/productos                     | Productos con stock                            | admin |
| POST   | /api/productos                     | Crear producto `{ nombre, precio, categoria, stock }` | admin |
| PUT    | /api/productos/:id                 | Editar producto                                | admin |
| DELETE | /api/productos/:id                 | Eliminar producto                              | admin |
| PATCH  | /api/productos/:id/stock           | Sumar/restar stock `{ delta }`                 | admin |
