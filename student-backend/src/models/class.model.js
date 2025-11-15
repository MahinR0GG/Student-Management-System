import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Class = sequelize.define(
  "Class",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // 8, 9, 10 only
    classNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isIn: [[8, 9, 10]] },
    },

    // A, B, C only
    division: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [["A", "B", "C"]] },
    },

    // One teacher can be class teacher for at most ONE class
    classTeacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "teacherId",   // ✅ MAP TO REAL COLUMN
    unique: true
    },


    // Keep teacher name for quick display
    classTeacher: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Map of subject -> teacherId, e.g. { "English": 17, "Maths": 22 }
    subjectTeachers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },

    students: { type: DataTypes.INTEGER, defaultValue: 0 },

    // Optional list of subject names
    subjects: { type: DataTypes.JSON, allowNull: true },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["classNumber", "division"], // prevent duplicate 8-A, 8-B, etc.
      },
    ],
    timestamps: true,
  }
);
