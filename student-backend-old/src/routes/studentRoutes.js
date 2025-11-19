import express from "express";
import { getStudentProfile, getStudentSubjects } from "../controllers/studentController.js";

const router = express.Router();

router.get("/:id/profile", getStudentProfile);
router.get("/:id/subjects", getStudentSubjects);  // ✅ new

export default router;
