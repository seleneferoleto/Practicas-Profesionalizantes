// routes/especialistas.js
const express = require("express");
const controller = require("../controllers/catalogoController");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get("/", asyncHandler(controller.especialistas));

module.exports = router;
