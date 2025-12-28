import { Class } from "../models/class.model.js";
import { User } from "../models/user.js";

// ✅ 1. Get class of class-teacher
export const getTeacherClass = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const cls = await Class.findOne({
      where: { classTeacherId: teacherId }
    });

    if (!cls) {
      return res.json({ assigned: false });
    }

    return res.json({
      assigned: true,
      class: cls
    });

  } catch (error) {
    console.error("❌ Error in getTeacherClass:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ 2. Get all students in class
export const getClassStudents = async (req, res) => {
  try {
    const classId = req.params.classId;

    const cls = await Class.findByPk(classId);

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    const students = await User.findAll({
      where: {
        role: "student",
        className: cls.classNumber,
        division: cls.division
      },
      order: [["id", "ASC"]],
    });

    res.json({ class: cls, students });

  } catch (error) {
    console.error("❌ Error in getClassStudents:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ 3. For Subject Teacher, find all classes where they teach their subject
export const getSubjectClassesForTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const teacher = await User.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classes = await Class.findAll();

    const assignedClasses = classes.filter(c => {
      return c.subjectTeachers && c.subjectTeachers[teacher.subject] === teacherId;
    });

    res.json({
      teacher: teacher.name,
      subject: teacher.subject,
      classes: assignedClasses
    });

  } catch (error) {
    console.error("❌ Error in getSubjectClassesForTeacher:", error);
    res.status(500).json({ message: "Server error" });
  }
};
