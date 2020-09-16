const { GraphQLDateTime } = require("graphql-iso-date");
const { mergeResolvers } = require("@graphql-tools/merge");
const userResolver = require("./user");
const recipeResolver = require("./recipe");
const categotyResolver = require("./category");

const customDateScalarResolver = {
  Date: GraphQLDateTime,
};

const resolvers = [
  userResolver,
  recipeResolver,
  categotyResolver,
  customDateScalarResolver,
];
module.exports = mergeResolvers(resolvers);