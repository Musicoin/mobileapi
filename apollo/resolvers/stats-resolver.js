const {PubSub} = require('graphql-subscriptions');
const Release = require('../../db/core/release');

let pubsub = new PubSub();

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
    recentPlaysUpdated: {
      //ToDo: try to move this subscription to the release resolver
      resolve: async (releaseId) => {
        let release = await Release.findOne({tx: releaseId}).exec();
        console.log(release);
        return release;
      },
      subscribe: () => pubsub.asyncIterator('recentPlaysUpdated'),
    },
  },
};

module.exports = resolvers;