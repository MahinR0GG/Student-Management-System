import { Leave } from "../models/leave.model.js";
import { User } from "../models/user.js";

// =====================================================
// ✅ STUDENT: Apply for Leave
// =====================================================
export const applyLeave = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log("##################################################################3");
    console.log("req.params:", JSON.stringify(req.params, null, 2));
    console.log("studentId:", studentId);
    print("##################################################################3")
    print(req.params)
    print(studentId)
    const { reason, startDate, endDate, details } = req.body;

    const student = await User.findOne({
      where: { id: studentId, role: "student" },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const leave = await Leave.create({
      studentId,
      reason,
      startDate,
      endDate,
      details,
      status: "Pending",
    });

    res.json({ message: "Leave request submitted", leave });
  } catch (err) {
    console.error("Leave apply error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// ✅ STUDENT: Leave History
// =====================================================
export const getLeaveHistory = async (req, res) => {
  try {
    const studentId = req.params.id;

    const leaves = await Leave.findAll({
      where: { studentId },
      order: [["createdAt", "DESC"]],
    });

    res.json(leaves);
  } catch (err) {
    console.error("Leave history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// ✅ ✅ ADMIN: GET ALL LEAVE REQUESTS (USED IN UI)
// =====================================================
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      include: [
        {
          model: User,
          as: "student", // ✅ MUST MATCH THE ALIAS IN leave.model.js
          attributes: ["name", "className", "division"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format clean output
    const result = leaves.map((l) => ({
      id: l.id,
      studentId: l.studentId,
      studentName: l.student?.name,
      className: l.student?.className,
      division: l.student?.division,
      reason: l.reason,
      startDate: l.startDate,
      endDate: l.endDate,
      details: l.details,
      status: l.status,
      createdAt: l.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("Admin get all leaves error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// =====================================================
// ✅ ✅ G2: ADMIN APPROVES / REJECTS LEAVE
// =====================================================
export const adminApproveLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Approved";
    await leave.save();

    res.json({ message: "Leave approved by Admin", leave });
  } catch (err) {
    console.error("Admin approve error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminRejectLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "Rejected";
    await leave.save();

    res.json({ message: "Leave rejected by Admin", leave });
  } catch (err) {
    console.error("Admin reject error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// ✅ ✅ G1 — TEACHER APPROVAL SYSTEM (COMMENTED)
// =====================================================
/*
export const teacherApproveLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findByPk(leaveId);

    leave.teacherStatus = "Approved";
    await leave.save();

    res.json({ message: "Leave approved by Teacher", leave });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const teacherRejectLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findByPk(leaveId);

    leave.teacherStatus = "Rejected";
    await leave.save();

    res.json({ message: "Leave rejected by Teacher", leave });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
*/

// =====================================================
// ✅ ✅ G3 — FINAL STATUS (Teacher + Admin)
// =====================================================
/*
export const finalizeLeaveStatus = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findByPk(leaveId);

    if (leave.teacherStatus === "Approved" && leave.status === "Approved") {
      leave.finalStatus = "Approved";
    } else if (
      leave.teacherStatus === "Rejected" ||
      leave.status === "Rejected"
    ) {
      leave.finalStatus = "Rejected";
    } else {
      leave.finalStatus = "Pending";
    }

    await leave.save();
    res.json({ message: "Final status updated", leave });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
*/
