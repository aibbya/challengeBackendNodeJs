const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const cors = require("cors");
const dotEnv = require("dotenv");
const Dataloader = require("dataloader");

const resolvers = require("./resolvers");
const typeDefs = require("./typeDefs");
const { connection } = require("./database/util");
const { verifyUser } = require("./helper/context");
const loaders = require("./loaders");

// set env variables

dotEnv.config();

const app = express();

// db connectivity
connection();

// cors
app.use(cors());

// body parser middleware
app.use(express.json());

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    const contextObj = {};
    if (req) {
      await verifyUser(req);
      (contextObj.email = req.email),
        (contextObj.loggedInUserId = req.loggedInUserId);
    }
    contextObj.loaders = {
      user: new Dataloader((keys) => loaders.user.batchUsers(keys)),
      recipe: new Dataloader((keys) => loaders.recipe.batchRecipes(keys)),
      category: new Dataloader((keys) => loaders.category.batchCategories(keys)),
    };
    return contextObj;
  },
  // formatError: (error) => {
  //   return {
  //     message: error.message,
  //   };
  // },
});

apolloServer.applyMiddleware({ app, path: "/graphql" });

const PORT = process.env.PORT || 3000;

app.use("/", (req, res, next) => {
  res.send({ message: "Hello Puzzle" });
});

const httpServer = app.listen(PORT, () => {
  console.log(`Server listen on PORT: ${PORT}`);
  console.log(`Grapphql Endpoint: ${apolloServer.graphqlPath}`);
});

apolloServer.installSubscriptionHandlers(httpServer);
