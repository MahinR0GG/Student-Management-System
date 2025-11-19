import express from "express";
import {
  createClass,
  getAllClasses,
  deleteClass
} from "../controllers/classController.js";

const router = express.Router();

router.post("/classes/add", createClass);
router.get("/classes", getAllClasses);
router.delete("/classes/:id", deleteClass);

export default router;
