const UserPlayback = require('../../db/core/user-playback');
const pubsub = require('../pubsub');
const Release = require('../../db/core/release');
const MediaProvider = require('../../utils/media-provider-instance');
const { apolloReleaseModule } = require('../../api/Kernel');

const resolvers = {
  Query: {
    // ToDo: improve data structure with better query so the foreach is not necessary
    async recentPlays(parent, args, context, info) {
      const releases = await apolloReleaseModule.getRecentPlays(args)
      //on save for release call MediaProvider.resolveIpfsUrl so we wont have to create a loop here
      let releasesArray = [];
      releases.forEach((item, index) => {
        let release = item.release;
        release.trackImg = MediaProvider.resolveIpfsUrl(release.imageUrl);
        releasesArray.push(release);
      });
      return releasesArray;
    },
    async topPlays(parent, args, context, info) {
      // ToDo: write better query from ReleaseStats like in musicoin.org repo : Using exact query from web repo ( Sammy )
      let releases = await apolloReleaseModule.getTopPlayed(args)

      //ToDo: Figure out wether to add correct track link on save of release. 
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
        let release = await Release.findOne({ tx: releaseId }).exec();
        return release;
      },
      subscribe: () => pubsub.asyncIterator('recentPlaysUpdated'),
    },
    topPlaysUpdated: {
      resolve: async (releaseId) => {
        //ToDo; return list of the new top played
        let release = await Release.findOne({ tx: releaseId }).exec();
        return release;
      },
      subscribe: () => pubsub.asyncIterator('topPlaysUpdated'),
    },
  }
};

module.exports = resolvers;