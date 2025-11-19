import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false }, // "admin" | "teacher" | "student"

  // For students
  className: { type: DataTypes.STRING, allowNull: true }, // e.g. "8"
  division: { type: DataTypes.STRING, allowNull: true },  // e.g. "A"

  // For teachers
  subject: { type: DataTypes.STRING, allowNull: true },   // teacher's main subject
}, {
  timestamps: true,
});
