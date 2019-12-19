const pubsub = require('../pubsub');
const Release = require('../../db/core/release');

let statscount = {plays: 6781650, tips: 4380785};

const resolvers = {
  Query: {
    async stats(parent, args, context, info) {
      return statscount;
    },
  },
  Mutation: {
    async increasePlays(parent, args, context, info) {
      statscount.plays = statscount.plays + 1;
      await pubsub.publish('playsIncreased', statscount);
      if(args.releaseId) {
        await pubsub.publish('recentPlaysUpdated', args.releaseId);
      }
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