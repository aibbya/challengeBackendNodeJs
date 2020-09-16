const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    recipesAll(cursor: String, limit: Int): RecipeFeed!
    recipesOfUser(cursor: String, limit: Int): RecipeFeed!
    recipe(id: ID!): Recipe
  }

  type RecipeFeed {
    recipeFeed: [Recipe!]
    pageInfo: PageInfo!
  }

  type PageInfo {
    nextPageCursor: String
    hasNextPage: Boolean
  }  

  extend type Mutation {
    createRecipe(idCategory: ID!, input: createRecipeInput!): Recipe
    updateRecipe(id: ID!, input: updateRecipeInput!): Recipe
    deleteRecipe(id: ID!): Recipe
  }
  input createRecipeInput {
    name: String!
    description: String!
    ingredients: String!
  }

  input updateRecipeInput {
    name: String
    description: String
    ingredients: String
    category: String
  }

  type Recipe {
    id: ID!
    name: String!
    description: String!
    ingredients: String!
    user: User!
    category: Category!
    updatedAt: Date!
    createdAt: Date!
  }

  extend type Subscription {
    recipeCreated: Recipe
  }
`;
