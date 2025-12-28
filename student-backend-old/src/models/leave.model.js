import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Leave = sequelize.define("Leave", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  studentId: { type: DataTypes.INTEGER, allowNull: false },

  reason: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },

  // ✅ Main Approval Status (used by Admin)
  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending", // Pending / Approved / Rejected
  },

  // ✅ (G1) Teacher approval — COMMENTED
  // teacherStatus: {
  //   type: DataTypes.STRING,
  //   defaultValue: "Pending", 
  // },

  // ✅ (G3) Combined approval (teacher + admin) — COMMENTED
  // finalStatus: {
  //   type: DataTypes.STRING,
  //   defaultValue: "Pending",
  // },

  
});
// ✅ Associations (VERY IMPORTANT)
import { User } from "./user.js";

Leave.belongsTo(User, { foreignKey: "studentId", as: "student" });
User.hasMany(Leave, { foreignKey: "studentId" });

