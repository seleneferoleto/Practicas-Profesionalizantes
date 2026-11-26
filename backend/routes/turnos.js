// routes/turnos.js — disponibilidad por sede, reserva, "mis turnos" y gestión admin
const express = require("express");
const controller = require("../controllers/turnoController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/disponibilidad", asyncHandler(controller.disponibilidad));
router.post("/", requireAuth, asyncHandler(controller.reservar));
router.get("/mios", requireAuth, asyncHandler(controller.mios));
router.patch("/:id/cancelar", requireAuth, asyncHandler(controller.cancelar));
router.get("/", requireAdmin, asyncHandler(controller.todos));
router.patch("/:id", requireAdmin, asyncHandler(controller.cambiarEstado));

module.exports = router;
