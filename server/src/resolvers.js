const bcrypt = require("bcryptjs");

const resolvers = {
  Query: {
    async UserInputError(root, { id }, { models }) {
      return models.User.findByPk(id);
    },

    async allRecipes(root, args, { models }) {
      return models.Recipe.findAll();
    },

    async recipe(root, { id }, { models }) {
      return models.Recipe.findByPk(id);
    },
  },

  Mutation: {
    async createUser(root, { name, email, password }, { models }) {
      return models.User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
      });
    },

    async createRecipe(
      root,
      { userId, title, ingredients, direction },
      { models }
    ) {
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
