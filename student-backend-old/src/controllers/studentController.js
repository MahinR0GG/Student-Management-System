import { User } from "../models/user.js";
import { Class } from "../models/class.model.js";

// ✅ GET Student Profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findOne({
      where: { id: studentId, role: "student" }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.className || "Not Assigned",
      division: student.division || "Not Assigned"
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ ✅ NEW: GET Student Subjects (from Class table)
export const getStudentSubjects = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1️⃣ Find student
    const student = await User.findOne({
      where: { id: studentId, role: "student" }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ Find class based on className
    const cls = await Class.findOne({
      where: { className: student.className }
    });

    if (!cls) {
      return res.json([]);
    }

    // subjects stored as JSON → return clean array
    const subjects = Array.isArray(cls.subjects) ? cls.subjects : [];

    return res.json(subjects);

  } catch (error) {
    console.error("Subjects Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
