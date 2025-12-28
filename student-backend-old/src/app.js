import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // ✅ correct import

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ this line enables your login route
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

export default app;
