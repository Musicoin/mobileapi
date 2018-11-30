const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    user: User
  },
  type User{
    id: Int!
    name: String
  }
`;

module.exports = typeDefs;