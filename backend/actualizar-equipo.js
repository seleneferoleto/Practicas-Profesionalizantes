require("dotenv").config();
const pool = require("./db");
const { ESPECIALISTAS } = require("./data");
const { generarDisponibilidad } = require("./disponibilidad");

async function main() {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const [sedes] = await conexion.query("SELECT id, nombre FROM sedes");
    const [especialistas] = await conexion.query("SELECT id, nombre, sede_id FROM especialistas FOR UPDATE");
    const [admins] = await conexion.query(
      "SELECT id FROM usuarios WHERE email = ? AND es_admin = 1 FOR UPDATE",
      [process.env.ADMIN_EMAIL || "admin@lahuella.com"]
    );
    if (admins.length !== 1) {
      throw new Error("No se encontró la cuenta administradora configurada en ADMIN_EMAIL.");
    }

    const nombresAnteriores = ["Dra. Lucía Gómez", "Dr. Martín Pérez", "Lic. Paula Ríos"];
    const conservados = [];
    for (const especialista of ESPECIALISTAS) {
      const sede = sedes.find((fila) => fila.nombre === especialista.sede);
      if (!sede) throw new Error(`No se encontró la sede ${especialista.sede}.`);
      const existente = especialistas.find((fila) => fila.nombre === especialista.nombre)
        || especialistas.find((fila) => fila.sede_id === sede.id && nombresAnteriores.includes(fila.nombre));
      if (existente) {
        await conexion.query(
          "UPDATE especialistas SET nombre = ?, especialidad = ?, sede_id = ?, foto = NULL WHERE id = ?",
          [especialista.nombre, especialista.especialidad, sede.id, existente.id]
        );
        conservados.push(existente.id);
      } else {
        const [resultado] = await conexion.query(
          "INSERT INTO especialistas (nombre, especialidad, sede_id) VALUES (?, ?, ?)",
          [especialista.nombre, especialista.especialidad, sede.id]
        );
        conservados.push(resultado.insertId);
      }
    }

    for (const especialista of especialistas) {
      if (conservados.includes(especialista.id)) continue;
      const [turnos] = await conexion.query(
        "SELECT id FROM turnos WHERE especialista_id = ? LIMIT 1",
        [especialista.id]
      );
      if (turnos.length) {
        throw new Error(`Hay turnos de ${especialista.nombre}: reasignalos antes de actualizar el equipo.`);
      }
      await conexion.query("DELETE FROM especialistas WHERE id = ?", [especialista.id]);
    }
    await conexion.query("UPDATE usuarios SET nombre = ? WHERE id = ?", ["Jorge Feldman", admins[0].id]);
    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
  await generarDisponibilidad();
  console.log("Equipo actualizado: Jorge Feldman en Ballester y Sandra Gomez en Chilavert. Credenciales del administrador sin cambios.");
}

main()
  .catch((err) => {
    console.error("No se pudo actualizar el equipo:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
