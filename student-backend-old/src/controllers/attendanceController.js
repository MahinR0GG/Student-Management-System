import { Attendance } from "../models/Attendance.js";
import { User } from "../models/user.js";
import { Class } from "../models/class.model.js";

// ---------------------------------------------
// Single record (kept for compatibility)
// ---------------------------------------------
export const markAttendance = async (req, res) => {
  try {
    const { studentId, teacherId, date, status } = req.body;

    const student = await User.findByPk(studentId);
    const teacher = await User.findByPk(teacherId);

    if (!student || !teacher) {
      return res.status(404).json({ message: "Invalid student or teacher" });
    }

    const record = await Attendance.create({
      studentId,
      teacherId,
      date,
      status,
      className: student.className,
      division: student.division,
      markedBy: teacher.name,
    });

    res.json({ message: "Attendance marked", record });
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------
// NEW: Mark attendance for a WHOLE CLASS (only class teacher)
// Body: { classId, date, teacherId, records: [{studentId, status}] }
// ---------------------------------------------
export const markClassAttendance = async (req, res) => {
  try {
    const { classId, date, teacherId, records } = req.body;

    const cls = await Class.findByPk(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Only that class's class teacher can mark
    if (Number(teacherId) !== Number(cls.classTeacherId)) {
      return res.status(403).json({ message: "Only class teacher can mark attendance" });
    }

    const teacher = await User.findByPk(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Upsert each student's attendance for that date
    const results = [];
    for (const rec of records || []) {
      const student = await User.findByPk(rec.studentId);
      if (!student) continue;

      // Find existing record for this student & date
      const [item, created] = await Attendance.findOrCreate({
        where: { studentId: rec.studentId, date },
        defaults: {
          studentId: rec.studentId,
          teacherId,
          date,
          status: rec.status,
          className: student.className,
          division: student.division,
          markedBy: teacher.name,
        },
      });

      if (!created) {
        item.status = rec.status;
        item.teacherId = teacherId;
        item.markedBy = teacher.name;
        await item.save();
      }
      results.push(item);
    }

    return res.json({ message: "✅ Class attendance saved", count: results.length });
  } catch (err) {
    console.error("markClassAttendance error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------
// NEW: Get attendance of a class on a date
// GET /attendance/class/:classId?date=YYYY-MM-DD
// ---------------------------------------------
export const getClassAttendanceByDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const cls = await Class.findByPk(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!date) return res.status(400).json({ message: "date query param is required" });

    const classNameValue = String(cls.classNumber);
    const divisionValue = cls.division;

    const records = await Attendance.findAll({
      where: { date, className: classNameValue, division: divisionValue },
      order: [["studentId", "ASC"]],
    });

    return res.json(records);
  } catch (err) {
    console.error("getClassAttendanceByDate error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------
// Admin: All records
// ---------------------------------------------
export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.findAll({ order: [["date", "DESC"]] });
    res.json(records);
  } catch (err) {
    console.error("Get all attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------
// Student: History
// ---------------------------------------------
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const records = await Attendance.findAll({
      where: { studentId },
      order: [["date", "ASC"]],
    });
    res.json(records);
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
