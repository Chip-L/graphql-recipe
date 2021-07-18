"use strict";

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

// The following section is what comprised the config.js file that we learned in class
// TODO: figure out how to change the use.env.variable to handle JawsDB -- I think I need to change something in the ../config/config.json file for this, but not quite sure what.
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    config
  );
}

// *I think* this is reading all of the files n this directory and adding each one as a model to the 'db' object
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// sets up the association of each model? Not sure if this is still needed:
// https://github.com/sequelize/express-example/issues/95
// https://github.com/sequelize/express-example/issues/106
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
