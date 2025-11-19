import { User } from "../models/user.js";

export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // ✅ Step 1: Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ message: "Email, password, and user type are required." });
    }

    // ✅ Step 2: Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Step 3: Verify password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Step 4: Verify role safely
    if (!user.role) {
      return res.status(400).json({ message: "User role is not set in the database." });
    }

    if (user.role.toLowerCase() !== userType.toLowerCase()) {
      return res.status(403).json({ message: "Incorrect user type selected" });
    }

    // ✅ Step 5: Success response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
