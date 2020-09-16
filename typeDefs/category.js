const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    categories: [Category]
    category(id: ID!): Category
  }

  # type CategoryFeed {
  #   categoryFeed: [Category!]
  #   pageInfo: PageInfo!
  # }

  # type PageInfoCategory {
  #   nextPageCursor: String
  #   hasNextPage: Boolean
  # }

  input createCategoryInput {
    name: String!
  }
  input updateCategoryInput {
    name: String
  }

  extend type Mutation {
    createCategory(input: createCategoryInput!): Category
    updateCategory(id: ID!, input: updateCategoryInput!): Category
    deleteCategory(id: ID!): Category
  }

  type Category {
    id: ID!
    name: String!
    recipes: [Recipe!]
    # updatedAt: Date!
    # createdAt: Date!
  }
`;
