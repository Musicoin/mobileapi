const UserPlayback = require('../../db/core/user-playback');
const pubsub = require('../pubsub');
const Release = require('../../db/core/release');
const MediaProvider = require('../../utils/media-provider-instance');

const resolvers = {
  Query: {
    // ToDo: improve data structure with better query so the foreach is not necessary
    async recentPlays(parent, args, context, info) {
      const releases = await UserPlayback.find({}, {_id: 0, release: 1}).sort({playbackDate: 'desc'}).limit(args.limit ? args.limit : 10).populate('release').exec();
      let releasesArray = [];
      releases.forEach((item, index) => {
        let release = item.release;
        release.trackImg = MediaProvider.resolveIpfsUrl(release.imageUrl);
        releasesArray.push(release);
      });
      return releasesArray;
    },
    async topPlays(parent, args, context, info) {
      // ToDo: write better query from ReleaseStats like in musicoin.org repo
      let releases = await Release.find({
        state: 'published',
      }).sort({
        directTipCount: 'desc',
      }).limit(args.limit).exec();

      let ReleasesArray = [];
      for (let track of releases) {
        track.link = 'https://musicion.org/nav/track/' + track.contractAddress;
        track.authorLink = 'https://musicoin.org/nav/artist/' + track.artistAddress;
        track.trackImg = track.imageUrl;
        ReleasesArray.push(track);
      }

      return ReleasesArray;
    },
  },
  Subscription: {
    recentPlaysUpdated: {
      resolve: async (releaseId) => {
        let release = await Release.findOne({tx: releaseId}).exec();
        return release;
      },
      subscribe: () => pubsub.asyncIterator('recentPlaysUpdated'),
    },
    topPlaysUpdated: {
      resolve: async (releaseId) => {
        //ToDo; return list of the new top played
        let release = await Release.findOne({tx: releaseId}).exec();
        return release;
      },
      subscribe: () => pubsub.asyncIterator('topPlaysUpdated'),
    },
  }
};

module.exports = resolvers;