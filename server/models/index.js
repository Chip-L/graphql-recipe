"use strict";

// imports for config
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development"; // set in .env or as part of the nodejs environment
const config = require(__dirname + "/../config/config.js")[env];

// imports to set up the db
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const db = {};

// The following section is what comprised the config.js file that we learned in class
// TODO: figure out how to change the use.env.variable to handle JawsDB -- I think I need to change something in the ../config/config.json file for this, but not quite sure what.
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Test DB Connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

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

// This calls the associate function from each model and sets up the associations as described in there. In class, we did this as part of the index.js file (raw) here we do it in each model:
// user.js: ...associate(models) { User.hasMany(models.Recipe); }
// recipe.js: ...associate(models) { Recipe.belongsTo(models.User, { foreignKey: "userId" }); }
// *Note:* userId for Sequelize would normally be UserId - foreignKey is renaming it to "userId" because that is how we set it up in migrations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
