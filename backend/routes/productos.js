// routes/productos.js — catálogo y stock (solo administradores)
const express = require("express");
const controller = require("../controllers/productoController");
const { requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.use(requireAdmin);

router.get("/", asyncHandler(controller.listar));
router.post("/", asyncHandler(controller.crear));
router.put("/:id", asyncHandler(controller.actualizar));
router.patch("/:id/stock", asyncHandler(controller.ajustarStock));
router.delete("/:id", asyncHandler(controller.eliminar));

module.exports = router;
