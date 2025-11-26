import express from "express";
import {
  markAttendance,
  getAllAttendance,
  getStudentAttendance
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/attendance/mark", markAttendance);
router.get("/attendance", getAllAttendance);
router.get("/attendance/student/:studentId", getStudentAttendance);

export default router;
