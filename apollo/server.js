const {
  ApolloServer,
} = require('apollo-server-express');
const typeDefs = require('./schemas');
const resolvers = require('./resolver');
const { models } = require('../db/connections/core')

function createApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    uploads: false,
    context: async ({ req }) => {
      if (req) {
        return {
          models
        };
      }
    },
  });
}

module.exports = {
  createApolloServer
}
