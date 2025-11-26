import { Event } from "../models/event.model.js";
import { User } from "../models/user.js";

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(event);
  } catch (err) {
    console.error("Event create error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [["date", "ASC"]],
    });
    res.json(events);
  } catch (err) {
    console.error("Get events error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const id = req.params.id;

    await Event.update(req.body, { where: { id } });

    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("Event update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;

    await Event.destroy({ where: { id } });

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Event delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Student Filtered Events
export const getStudentEvents = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findByPk(studentId);

    if (!student) return res.status(404).json({ message: "Student not found" });

    const events = await Event.findAll({
      where: {
        // ✅ Show ALL events
        // OR class-specific events that match the student's class/division
      },
      order: [["date", "ASC"]],
    });

    res.json(events);
  } catch (err) {
    console.error("Student events error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
