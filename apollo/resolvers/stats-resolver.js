const {PubSub} = require('graphql-subscriptions');

let pubsub = new PubSub();

let statscount = {plays: 6781650, tips: 4380785};

const resolvers = {
  Query: {
    async stats(parent, args, context, info) {
      return statscount;
    },
  },
  Mutation: {
    async increasePlays(_parent, _args, _context, _info) {
      statscount.plays = statscount.plays + 1;
      await pubsub.publish('playsIncreased', statscount);
      return statscount;
    },
  },
  Subscription: {
    playsIncreased: {
      resolve: (obj) => obj,
      subscribe: () => pubsub.asyncIterator('playsIncreased'),
    },
  },
};

module.exports = resolvers;