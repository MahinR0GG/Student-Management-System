import { User } from "../models/user.js";

/* ----------------------------------------------------
   ✅ CREATE NEW USER (Admin, Teacher, Student)
---------------------------------------------------- */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, className, division, subject } = req.body;

    // ✅ Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // ✅ Teacher MUST have a subject
    if (role === "teacher" && !subject) {
      return res.status(400).json({ message: "Please select a subject for the teacher" });
    }

    // ✅ Create the user
    const user = await User.create({
      name,
      email,
      password,
      role,
      className: role === "student" ? className : null,
      division: role === "student" ? division : null,
      subject: role === "teacher" ? subject : null
    });

    res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error) {
    console.error("❌ Create user error:", error);
    res.status(500).json({ message: "Server error while creating user" });
  }
};



/* ----------------------------------------------------
   ✅ GET ALL USERS
---------------------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "className",
        "division",
        "subject",     // ✅ NEW
        "createdAt"
      ],
      order: [["id", "ASC"]]
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users
    });

  } catch (error) {
    console.error("❌ Fetch users error:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};



/* ----------------------------------------------------
   ✅ DELETE USER
---------------------------------------------------- */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};



/* ----------------------------------------------------
   ✅ UPDATE USER
---------------------------------------------------- */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);

    res.status(200).json({ message: "User updated successfully", user });

  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({ message: "Server error while updating user" });
  }
};
