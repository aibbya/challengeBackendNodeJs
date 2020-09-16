const { skip } = require("graphql-resolvers");
const Recipe = require("../../database/models/recipes");
const Users = require("../../database/models/users");
const { isValidObjectId } = require("../../database/util");

module.exports.isAuthenticated = (_, __, { email }) => {
  if (!email) {
    throw new Error("Access denied! please login to continue");
  }
  return skip;
};

module.exports.isRecipeOwner = async (_, { id }, { loggedInUserId }) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error("Invalid recipe id");
    }
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw new Error("Recipe no found");
    } else if (recipe.user.toString() !== loggedInUserId) {
      console.log(recipe.user.toString() + "   " + loggedInUserId);
      throw new Error("Not authorized as recipe owner");
    }
    return skip;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
