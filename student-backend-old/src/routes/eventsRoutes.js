import express from "express";
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getStudentEvents
} from "../controllers/eventController.js";

const router = express.Router();

// ✅ ADMIN
router.post("/admin/events", createEvent);
router.get("/admin/events", getAllEvents);
router.put("/admin/events/:id", updateEvent);
router.delete("/admin/events/:id", deleteEvent);

// ✅ STUDENT FILTERED EVENTS
router.get("/student/:id/events", getStudentEvents);

export default router;
