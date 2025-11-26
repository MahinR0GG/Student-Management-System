import { Class } from "../models/class.model.js";
import { User } from "../models/user.js";

// -----------------------------------------------------
// CREATE CLASS
// -----------------------------------------------------
export const createClass = async (req, res) => {
  try {
    const { classNumber, division, classTeacherId, subjectTeachers } = req.body;

    if (!classNumber || !division || !classTeacherId) {
      return res.status(400).json({ message: "All fields required" });
    }

    // duplicate check for 8-A, 9-B, etc.
    const existingDivision = await Class.findOne({
      where: { classNumber, division }
    });

    if (existingDivision) {
      return res.status(400).json({
        message: `Class ${classNumber}${division} already exists`
      });
    }

    // ✅ class teacher must exist & be a teacher
    const teacher = await User.findOne({
      where: { id: classTeacherId, role: "teacher" }
    });

    if (!teacher) {
      return res.status(404).json({ message: "Class Teacher not found" });
    }

    // ✅ ensure this teacher is not already class teacher for another class
    const assignedClass = await Class.findOne({
      where: { teacherId: classTeacherId }   // ✅ FIXED to your DB column
    });

    if (assignedClass) {
      return res.status(400).json({
        message: `Teacher is already class teacher of ${assignedClass.classNumber}${assignedClass.division}`
      });
    }

    // ✅ validate subject teachers mapping
    let validatedSubjects = {};

    if (subjectTeachers && typeof subjectTeachers === "object") {
      for (const subject in subjectTeachers) {
        const teacherId = subjectTeachers[subject];
        if (!teacherId) continue;

        const subTeacher = await User.findOne({
          where: { id: teacherId, role: "teacher" }
        });

        if (!subTeacher) {
          return res.status(400).json({
            message: `Teacher ID ${teacherId} not found`
          });
        }

        if (subTeacher.subject !== subject) {
          return res.status(400).json({
            message: `${subTeacher.name} does not teach ${subject}`
          });
        }

        validatedSubjects[subject] = teacherId;
      }
    }

    // ✅ Create class
    const newClass = await Class.create({
      classNumber,
      division,
      teacherId: classTeacherId,     // ✅ FIXED column
      classTeacher: teacher.name,
      subjectTeachers: validatedSubjects
    });

    return res.status(201).json({
      message: "✅ Class created successfully",
      class: newClass
    });

  } catch (error) {
    console.error("❌ Error creating class:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------
// GET ALL CLASSES (populate subject teacher names)
// -----------------------------------------------------
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({ order: [["id", "ASC"]] });

    for (let cls of classes) {
      const finalSubjects = {};
      const map = cls.subjectTeachers || {};

      for (const subject in map) {
        const teacherId = map[subject];
        const t = await User.findByPk(teacherId);
        finalSubjects[subject] = t
          ? { id: t.id, name: t.name }
          : null;
      }

      cls.dataValues.subjectTeachers = finalSubjects;
    }

    return res.status(200).json(classes);

  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------
// DELETE CLASS
// -----------------------------------------------------
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const cls = await Class.findByPk(id);
    if (!cls)
      return res.status(404).json({ message: "Class not found" });

    await cls.destroy();

    return res.json({ message: "✅ Class deleted successfully" });

  } catch (error) {
    console.error("❌ Delete class error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------
// GET CLASS WHERE THIS TEACHER IS CLASS TEACHER
// -----------------------------------------------------
export const getTeacherClass = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // verify teacher exists
    const teacher = await User.findOne({
      where: { id: teacherId, role: "teacher" }
    });

    if (!teacher)
      return res.status(404).json({
        assigned: false,
        message: "Teacher not found"
      });

    // ✅ FIND USING DB COLUMN teacherId
    const classData = await Class.findOne({
      where: { teacherId: teacherId }
    });

    if (!classData)
      return res.status(200).json({
        assigned: false,
        message: "No class assigned"
      });

    return res.status(200).json({
      assigned: true,
      class: classData
    });

  } catch (error) {
    console.error("❌ getTeacherClass error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------
// GET STUDENTS OF A CLASS
// -----------------------------------------------------
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await Class.findByPk(classId);
    if (!cls)
      return res.status(404).json({ message: "Class not found" });

    const students = await User.findAll({
      where: {
        role: "student",
        className: String(cls.classNumber),
        division: cls.division
      },
      order: [["name", "ASC"]]
    });

    return res.status(200).json({
      class: `${cls.classNumber}${cls.division}`,
      students
    });

  } catch (error) {
    console.error("❌ getClassStudents error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------
// SUBJECT TEACHER: LIST CLASSES THEY TEACH
// -----------------------------------------------------
export const getSubjectClassesForTeacher = async (req, res) => {
  try {
    const teacherId = Number(req.params.id);

    const t = await User.findOne({
      where: { id: teacherId, role: "teacher" }
    });

    if (!t)
      return res.status(404).json({ message: "Teacher not found" });

    const classes = await Class.findAll();
    const result = [];

    for (const c of classes) {
      const map = c.subjectTeachers || {};
      const teachesHere = Object.values(map).includes(teacherId);

      if (teachesHere) {
        result.push({
          id: c.id,
          classNumber: c.classNumber,
          division: c.division
        });
      }
    }

    return res.json(result);

  } catch (error) {
    console.error("❌ getSubjectClassesForTeacher error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
