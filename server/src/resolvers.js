const bcrypt = require("bcryptjs");
const models = require("../models");

const resolvers = {
  Query: {
    async user(root, { id }) {
      return models.User.findByPk(id);
    },

    async allRecipes(root, args) {
      return models.Recipe.findAll();
    },

    async recipe(root, { id }) {
      return models.Recipe.findByPk(id);
    },
  },

  Mutation: {
    async createUser(root, { name, email, password }) {
      // console.log("you have reached createUser");
      const newUser = await models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
      });
      // console.log(newUser);
      return newUser;
    },

    async createRecipe(root, { userId, title, ingredients, direction }) {
      return models.Recipe.create({ userId, title, ingredients, direction });
    },
  },

  // define how we want our custom fields (recipes on the User and user on Recipe) to be resolved.
  // The methods, getRecipes() and getUser(), are made available on our models by Sequelize due to the relationships we defined.
  User: {
    async recipes(user) {
      return user.getRecipes();
    },
  },

  Recipe: {
    async user(recipe) {
      return recipe.getUser();
    },
  },
};

module.exports = resolvers;
