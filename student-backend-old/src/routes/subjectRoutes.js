import express from "express";
import {
  createSubject,
  getAllSubjects,
  deleteSubject
} from "../controllers/subjectController.js";

const router = express.Router();

router.post("/add-subject", createSubject);
router.get("/subjects", getAllSubjects);
router.delete("/subjects/:id", deleteSubject);

export default router;
