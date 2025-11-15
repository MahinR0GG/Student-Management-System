import express from "express";
import cors from "cors";
import { sequelize } from "./config/db.js";

import classRoutes from "./routes/classRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";  // ✅ FIXED NAME
import teacherRoutes from "./routes/teacherRoutes.js";

const classTeacherRoutes = require("./routes/classTeacherRoutes");
app.use("/api", classTeacherRoutes);


const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/", classRoutes);
app.use("/api", adminRoutes);
app.use("/api", subjectRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api", leaveRoutes);
app.use("/api", eventsRoutes);
app.use("/api", teacherRoutes);
 
app.get("/", (req, res) => {
  res.send("✅ Student Management System backend is running");
});

sequelize.sync().then(() => console.log("✅ Database connected successfully"));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
