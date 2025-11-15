import { User } from "../models/user.js";
import { Class } from "../models/class.model.js";

// 🧑‍🏫 Get available teachers (those NOT assigned)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: "teacher" },
      attributes: ["id", "name", "email"],
    });

    const assignedClasses = await Class.findAll({ attributes: ["classTeacher"] });
    const assignedTeacherNames = assignedClasses.map((c) => c.classTeacher);

    const availableTeachers = teachers.filter(
      (t) => !assignedTeacherNames.includes(t.name)
    );

    res.status(200).json({
      message: "Available teachers fetched successfully",
      teachers: availableTeachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Server error" });
  }
};
