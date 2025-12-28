import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Attendance = sequelize.define("Attendance", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  studentId: { type: DataTypes.INTEGER, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: false },

  date: { type: DataTypes.DATEONLY, allowNull: false },

  status: {
    type: DataTypes.STRING,
    allowNull: false, // Present / Absent
  },

  className: { type: DataTypes.STRING, allowNull: false },
  division: { type: DataTypes.STRING, allowNull: true },

  markedBy: { type: DataTypes.STRING }, // teacher name
});
