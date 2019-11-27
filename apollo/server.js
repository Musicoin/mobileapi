const {
  ApolloServer,
} = require('apollo-server-express');
const typeDefs = require('./schemas');
const resolvers = require('./resolver');

const Release = require('../db/core/release');

function config(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    uploads: false,
    context: ({ req }) => ({
      release: Release
    }),
    playground: {
      subscriptionEndpoint: `/subscriptions`,
    }
  });
  server.applyMiddleware({
    app
  });
}

module.exports = {
  config
}