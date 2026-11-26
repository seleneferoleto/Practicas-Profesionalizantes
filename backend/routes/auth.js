// routes/auth.js — registro, login, logout y "quién soy"
const express = require("express");
const controller = require("../controllers/authController");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post("/register", asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.post("/logout", controller.logout);
router.get("/me", controller.me);

module.exports = router;
