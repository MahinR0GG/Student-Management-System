import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Event = sequelize.define("Event", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  date: DataTypes.DATEONLY,
  audience: DataTypes.STRING, // ALL | CLASS
  className: DataTypes.STRING,
  division: DataTypes.STRING,
  createdBy: DataTypes.STRING,
});
