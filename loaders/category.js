const Category = require("../database/models/categories");

module.exports.batchCategories = async (categoriesIds) => {
  console.log("keys Category====", categoriesIds);
  const categories = await Category.find({ _id: { $in: categoriesIds } });
  return categoriesIds.map((categoryId) => categories.find((category) => category.id === categoryId));
};
