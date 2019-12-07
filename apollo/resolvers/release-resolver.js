const UserPlayback = require('../../db/core/user-playback');

const resolvers = {
  Query: {
    // ToDo: improve data structure with better query so the foreach is not necessary
    async recentPlays(parent, args, context, info) {
      const releases = await UserPlayback.find({}, {_id: 0, release: 1}).sort({playbackDate: 'desc'}).limit(args.limit ? args.limit : 10).populate('release').exec();
      let releasesArray = [];
      releases.forEach((item, index) => {
        let release = item.release;
        releasesArray.push(release);
      });
      return releasesArray;
    },
  },
};

module.exports = resolvers;