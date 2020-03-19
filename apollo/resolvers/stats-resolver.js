const pubsub = require('../pubsub');
const { getTrending, getStats } = require('../common')
const resolvers = {
  Query: {
    async stats(parent, args, context, info) {
      return getStats(context)
    },
  },
  Mutation: {
    async increasePlays(parent, args, context, info) {
      await context.models.Release.update({ _id: args.releaseId }, { $inc: { directPlayCount: 1, directTipCount: 1 } })
      let statscount = await getStats(context)
      await pubsub.publish('playsIncreased', statscount);
      let trendingList = await getTrending(context, { limit: 20 }, {
        tipPlays: 'desc'
      }) //parent.trendingList(parent, args, context, info)
      await pubsub.publish('trendingListUpdated', trendingList);
      return statscount
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