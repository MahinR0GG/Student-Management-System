import express from "express";
import {
  applyLeave,
  getLeaveHistory,
  getAllLeaveRequests,
  adminApproveLeave,
  adminRejectLeave,
  // teacherApproveLeave,
  // teacherRejectLeave,
  // finalizeLeaveStatus,
} from "../controllers/leaveController.js";

const router = express.Router();

// ======================================================
// ✅ STUDENT LEAVE ROUTES
// ======================================================

// Apply for leave
router.post("/leave/apply/:id", applyLeave);

// Student leave history
router.get("/leave/student/:id", getLeaveHistory);


// ======================================================
// ✅ ADMIN LEAVE ROUTES
// ======================================================

// Get all leave requests
router.get("/leave/all", getAllLeaveRequests);

// Approve leave
router.put("/leave/:id/approve", adminApproveLeave);

// Reject leave
router.put("/leave/:id/reject", adminRejectLeave);


// ======================================================
// ✅ TEACHER LEAVE ROUTES (G1) — COMMENTED
// ======================================================
/*
router.put("/teacher/leave/:id/approve", teacherApproveLeave);
router.put("/teacher/leave/:id/reject", teacherRejectLeave);
*/


// ======================================================
// ✅ FINAL STATUS (G3) — COMMENTED
// ======================================================
/*
router.put("/leave/:id/finalize", finalizeLeaveStatus);
*/

export default router;
