import express from "express";
import { User } from "../models/user.js";
import {
  getTeacherClass,
  getClassStudents,
  getSubjectClassesForTeacher
} from "../controllers/teacherController.js";

import {
  markClassAttendance,
  getClassAttendanceByDate
} from "../controllers/attendanceController.js";

const router = express.Router();

// ✅ ALL teachers list
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: "teacher" }
    });
    res.json(teachers);
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    res.status(500).json({ message: "Server error loading teachers" });
  }
});

// ✅ GET the class assigned to a teacher (class teacher)
router.get("/teacher/class/:id", getTeacherClass);

// ✅ GET students inside a class
router.get("/class/:classId/students", getClassStudents);

// ✅ GET classes where teacher teaches subjects
router.get("/teacher/subject-classes/:id", getSubjectClassesForTeacher);

// ✅ POST mark class attendance
router.post("/attendance/mark-class", markClassAttendance);

// ✅ GET attendance records by date for a class
router.get("/attendance/class/:classId", getClassAttendanceByDate);

export default router;
