const express = require("express");
const router = express.Router();
const { User } = require("../models");

// ✅ Get students for the class teacher
router.get("/teacher/class/:teacherId/students", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findOne({ where: { id: teacherId } });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const className = teacher.className;
    const division = teacher.division;

    const students = await User.findAll({
      where: {
        role: "student",
        className,
        division,
      },
      attributes: { exclude: ["password"] },
    });

    res.json(students);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
