import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// 👇 This creates the POST /api/auth/login route
router.post("/login", login);

export default router;
