const uuid = require("uuid");
const { combineResolvers } = require("graphql-resolvers");

const Recipe = require("../database/models/recipes");
const Category = require("../database/models/categories");
const User = require("../database/models/users");
const { isAuthenticated } = require("./middleware");
const { stringToBase64, base64ToString } = require("../helper");

module.exports = {
  Query: {
    categories: combineResolvers(() => {
      try {       
        return Category.find();
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    category: combineResolvers(async (_, { id }) => {
      try {
        const category = await Category.findById(id);
        return category;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  },
  Mutation: {
    createCategory: combineResolvers(isAuthenticated, async (_, { input }) => {
      try {
        // const user = await User.findOne({ email });
        const category = new Category({ ...input });
        const result = await category.save();
        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    updateCategory: combineResolvers(
      isAuthenticated,
      async (_, { id, input }) => {
        try {
          const category = await Category.findByIdAndUpdate(
            id,
            { ...input },
            { new: true }
          );
          return category;
        } catch (error) {
          console.log(error);
          throw error;
        }
      }
    ),
    
  },

  Category: {
    recipes: async ({ id }) => {
      try {
        const recipes = await Recipe.findById({ category: id });
        return recipes;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
