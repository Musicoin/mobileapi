const {
  ApolloServer
} = require('apollo-server-express');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

const Release = require('../db/core/release');

function config(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      release: Release
    })
  });
  server.applyMiddleware({
    app
  });
}

module.exports = {
  config
}