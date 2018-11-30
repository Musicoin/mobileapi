const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

function config(app) {
  const server = new ApolloServer({typeDefs, resolvers});
  server.applyMiddleware({app});
}

module.exports = {
  config
}