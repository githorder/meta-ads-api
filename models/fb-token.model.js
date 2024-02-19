const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

const FBToken = sequelize.define("fbtoken", {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.TEXT,
  },
  expires: {
    type: DataTypes.INTEGER,
  },
});

module.exports = FBToken;
