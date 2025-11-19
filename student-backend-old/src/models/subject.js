import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./user.js";

export const Subject = sequelize.define("Subject", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  className: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Subject.belongsTo(User, {
  foreignKey: "classTeacherId",
  as: "teacher"
});
