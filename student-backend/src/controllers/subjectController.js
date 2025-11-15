import { Subject } from "../models/Subject.js";
import { User } from "../models/user.js";

/* --------------------------------------
 ✅ CREATE SUBJECT
-------------------------------------- */
export const createSubject = async (req, res) => {
  try {
    const { name, teacherId, className } = req.body;

    if (!name || !teacherId || !className) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Prevent duplicate subject for same class
    const exists = await Subject.findOne({
      where: { name, className }
    });

    if (exists) {
      return res.status(400).json({
        message: `${name} is already assigned to class ${className}`
      });
    }

    // ✅ Prevent same teacher teaching in same class
    const teacherConflict = await Subject.findOne({
      where: { teacherId, className }
    });

    if (teacherConflict) {
      return res.status(400).json({
        message: "This teacher is already assigned to this class"
      });
    }

    const subject = await Subject.create({ name, teacherId, className });

    res.status(201).json({
      message: "✅ Subject added successfully",
      subject
    });

  } catch (error) {
    console.error("❌ Create subject error:", error);
    res.status(500).json({ message: "Server error while creating subject" });
  }
};


/* --------------------------------------
 ✅ GET ALL SUBJECTS (with teacher info)
-------------------------------------- */
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["id", "ASC"]]
    });

    res.status(200).json({
      message: "Subjects fetched successfully",
      subjects
    });

  } catch (error) {
    console.error("❌ Fetch subjects error:", error);
    res.status(500).json({ message: "Server error fetching subjects" });
  }
};


/* --------------------------------------
 ✅ DELETE SUBJECT
-------------------------------------- */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.destroy();
    res.status(200).json({ message: "Subject deleted successfully" });

  } catch (error) {
    console.error("❌ Delete subject error:", error);
    res.status(500).json({ message: "Server error deleting subject" });
  }
};
