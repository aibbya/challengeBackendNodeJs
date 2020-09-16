const Recipe = require("../database/models/recipes");

module.exports.batchRecipes = async (recipesIds) => {
  console.log("keys Recipes====", recipesIds);
  const recipes = await Recipe.find({ _id: { $in: recipesIds } });
  return recipesIds.map((recipeId) =>
    recipes.find((recipe) => recipe.id === recipeId)
  );
};
