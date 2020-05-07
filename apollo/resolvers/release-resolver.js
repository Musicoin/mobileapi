const pubsub = require('../pubsub');
const { getTrending, resolveIpfsUrl } = require('../common')
const { responseList } = require('../../api/response-data/v1/release-model')
const ReleaseController = require('../../api/Controllers/v1/ReleaseController');
const Controller = new ReleaseController();

const resolvers = {
  Query: {
    async trendingList(parent, args, context, info) {
      console.log(args)
      return getTrending(context, args, {
        tipPlays: 'desc'
      })
    },
    async getReleaseById(parent, args, context, info) {
      return Controller.apolloGetTrackDetail(parent, args, context, info)
    },
    async getDebuts(parent, args, context, info) {
      try {
        //ask if it matters about verification
        // if (!verifiedList || verifiedList.length === 0) {
        //   // load verified users
        //   const _verifiedList = await context.models.User.find({
        //     verified: true,
        //     profileAddress: {
        //       $exists: true,
        //       $ne: null
        //     }
        //   }).exec();
        //   verifiedList = _verifiedList.map(val => val.profileAddress);
        // }
        //console.log("verifiedList: ", verifiedList.length);

        const releases = await context.models.Release.find({
          state: 'published',
          markedAsAbuse: {
            $ne: true
          }
        }).populate('artist', '_id').sort({
          releaseDate: 'desc'
        }).limit(args.limit).exec();
        const response = responseList(releases);
        return response

      } catch (error) {
        return error
      }
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