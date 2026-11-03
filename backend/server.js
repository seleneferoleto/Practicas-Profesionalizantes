// server.js — arranque del servidor
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const especialistasRoutes = require("./routes/especialistas");
const turnosRoutes = require("./routes/turnos");
const sedesRoutes = require("./routes/sedes");
const productosRoutes = require("./routes/productos");
const { generarDisponibilidad } = require("./disponibilidad");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto-de-desarrollo",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/especialistas", especialistasRoutes);
app.use("/api/turnos", turnosRoutes);
app.use("/api/sedes", sedesRoutes);
app.use("/api/productos", productosRoutes);

// Solo se publican los archivos del frontend, no el backend ni la documentación.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Mantiene siempre cargados los horarios de los próximos días
const renovarHorarios = () =>
  generarDisponibilidad().catch((err) => console.error("No se pudieron generar horarios:", err.message));

app.listen(PORT, () => {
  console.log(`Servidor La Huella corriendo en http://localhost:${PORT}`);
  renovarHorarios();
  setInterval(renovarHorarios, 1000 * 60 * 60 * 6);
});
