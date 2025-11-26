import express from "express";
import { createUser, getAllUsers } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Add new user
router.post("/admin/add-user", createUser);

// ✅ Get all users
router.get("/admin/users", getAllUsers);

export default router;
