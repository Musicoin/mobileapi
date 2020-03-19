const pubsub = require('../pubsub');
const { getTrending } = require('../common')

const resolvers = {
  Query: {
    async trendingList(parent, args, context, info) {
      return getTrending(context, args, {
        tipPlays: 'desc'
      })
    }
  },
  Subscription: {
    trendingListUpdated: {
      resolve: async (trendingList) => {
        return trendingList
      },
      subscribe: () => pubsub.asyncIterator('trendingListUpdated'),
    }
  }
};


module.exports = resolvers;