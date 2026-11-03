// seed.js — genera los horarios disponibles de los próximos días
// Se ejecuta con: npm run seed (el servidor también lo hace solo al arrancar)
require("dotenv").config();
const { generarDisponibilidad } = require("./disponibilidad");

generarDisponibilidad()
  .then((n) => {
    console.log(`Listo: se generaron/actualizaron ${n} horarios posibles.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error generando horarios:", err.message);
    process.exit(1);
  });
