const uuid = require("uuid");
const { combineResolvers } = require("graphql-resolvers");

const Recipe = require("../database/models/recipes");
const User = require("../database/models/users");
const Category = require("../database/models/categories");
const { isAuthenticated, isRecipeOwner } = require("./middleware");
const { stringToBase64, base64ToString } = require("../helper");
const PubSub = require("../subscription");
const { recipeEvents } = require("../events");

module.exports = {
  Query: {
    recipesAll: combineResolvers(async (_, { cursor, limit = 10 }) => {
      try {
        // const query = { user: loggedInUserId };
        if (cursor) {
          query["_id"] = {
            $lt: base64ToString(cursor),
          };
        }
        let recipes = await Recipe.find()
          .sort({ _id: -1 })
          .limit(limit + 1);
        const hasNextPage = recipes.length > limit;
        recipes = hasNextPage ? recipes.slice(0, -1) : recipes;
        return {
          recipeFeed: recipes,
          pageInfo: {
            nextPageCursor: hasNextPage
              ? stringToBase64(recipes[recipes.length - 1].id)
              : null,
            hasNextPage: hasNextPage,
          },
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    }),
    recipesOfUser: combineResolvers(
      isAuthenticated,
      async (_, { cursor, limit = 10 }, { loggedInUserId }) => {
        try {
          const query = { user: loggedInUserId };
          if (cursor) {
            query["_id"] = {
              $lt: base64ToString(cursor),
            };
          }
          let recipes = await Recipe.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1);
          const hasNextPage = recipes.length > limit;
          recipes = hasNextPage ? recipes.slice(0, -1) : recipes;
          return {
            recipeFeed: recipes,
            pageInfo: {
              nextPageCursor: hasNextPage
                ? stringToBase64(recipes[recipes.length - 1].id)
                : null,
              hasNextPage: hasNextPage,
            },
          };
        } catch (error) {
          console.log(error);
          throw error;
        }
      }
    ),
    recipe: combineResolvers(
      isAuthenticated /*,
      isRecipeOwner*/,
      async (_, { id }) => {
        try {
          const recipe = await Recipe.findById(id);
          return recipe;
        } catch (err) {
          console.log(err);
          throw err;
        }
      }
    ),
  },
  Mutation: {
    createRecipe: combineResolvers(
      isAuthenticated,
      async (_, { idCategory, input }, { email }) => {
        try {
          const user = await User.findOne({ email });

          const recipe = new Recipe({
            ...input,
            user: user.id,
            category: idCategory,
          });

          const category = await Category.findById(idCategory);
          console.log("la categoria =====", category);
          const result = await recipe.save();
          category.recipes.push(result.id);
          user.recipes.push(result.id);
          await user.save();
          await category.save();

          PubSub.publish(recipeEvents.RECIPE_CREATED, {
            recipeCreated: result,
          });
          return result;
        } catch (err) {
          console.log(err);
          throw err;
        }
      }
    ),
    updateRecipe: combineResolvers(
      isAuthenticated,
      isRecipeOwner,
      async (_, { id, input }) => {
        try {
          const recipe = await Recipe.findByIdAndUpdate(
            id,
            { ...input },
            { new: true }
          );
          return recipe;
        } catch (error) {
          console.log(error);
          throw error;
        }
      }
    ),
    deleteRecipe: combineResolvers(
      isAuthenticated,
      isRecipeOwner,
      async (_, { id }, { loggedInUserId }) => {
        try {
          const categoryOfRecipe = await Recipe.findById(id);

          console.log("CAte of REcipe ---------", categoryOfRecipe.category);
          const categoryId = categoryOfRecipe.category;

          const recipe = await Recipe.findByIdAndDelete(id);
          await User.updateOne(
            { _id: loggedInUserId },
            { $pull: { recipes: recipe.id } }
          );
          const category = await Category.findById(categoryId);
          // await category.findByIdAndDelete(id);
          await Category.updateOne(
            { _id: category },
            { $pull: { recipes: recipe.id } }
          );

          return recipe;
        } catch (err) {
          console.log(err);
          throw err;
        }
      }
    ),
  },
  Subscription: {
    recipeCreated: {
      subscribe: () => PubSub.asyncIterator(recipeEvents.RECIPE_CREATED),
    },
  },
  Recipe: {
    user: async (parent, _, { loaders }) => {
      try {
        const user = await loaders.user.load(parent.user.toString());
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    category: async (parent, _, { loaders }) => {
      try {
        // const user = await User.findById(parent.user);
        const category = await loaders.category.load(
          parent.category.toString()
        );
        return category;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
