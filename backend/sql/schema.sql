-- ============================================================
-- Base de datos: La Huella - Veterinaria
-- Usuarios, sedes, especialistas, turnos y stock de productos
-- ============================================================

CREATE DATABASE IF NOT EXISTS la_huella
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE la_huella;

-- Sucursales de la veterinaria
CREATE TABLE IF NOT EXISTS sedes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  direccion VARCHAR(160),
  telefono VARCHAR(40),
  especialista VARCHAR(120)
  ) ENGINE=InnoDB;

-- Usuarios (cuenta / login). es_admin habilita el panel de administración
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(40),
  es_admin TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Especialistas: cada uno atiende en una sede
CREATE TABLE IF NOT EXISTS especialistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  especialidad VARCHAR(160) NOT NULL,
  sede_id INT NOT NULL,
  foto VARCHAR(255),
  FOREIGN KEY (sede_id) REFERENCES sedes(id)
) ENGINE=InnoDB;

-- Horarios puntuales que se pueden reservar de cada especialista
CREATE TABLE IF NOT EXISTS disponibilidad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  especialista_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (especialista_id) REFERENCES especialistas(id) ON DELETE CASCADE,
  UNIQUE KEY uq_especialista_fecha_hora (especialista_id, fecha, hora)
) ENGINE=InnoDB;

-- Turnos: se registran según la sucursal elegida por el cliente
CREATE TABLE IF NOT EXISTS turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  sede_id INT NOT NULL,
  especialista_id INT NOT NULL,
  disponibilidad_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(500) NOT NULL,
  estado ENUM('reservado','completado','cancelado') NOT NULL DEFAULT 'reservado',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (sede_id) REFERENCES sedes(id),
  FOREIGN KEY (especialista_id) REFERENCES especialistas(id),
  FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidad(id)
) ENGINE=InnoDB;

-- Productos: solo para que el administrador controle el stock (no se venden en la web)
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(160) NOT NULL,
  precio INT NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  imagen VARCHAR(255),
  stock INT NOT NULL DEFAULT 10
) ENGINE=InnoDB;
