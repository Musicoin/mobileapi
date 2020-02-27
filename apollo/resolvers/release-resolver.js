const UserPlayback = require('../../db/core/user-playback');
const pubsub = require('../pubsub');
const MediaProvider = require('../../utils/media-provider-instance');
const { apolloReleaseModule } = require('../../api/Kernel');
const Web3Reader = require('../../modules/blockchain/web3-reader');
const Web3Writer = require('../../modules/blockchain/web3-writer');
const LicenseModule = require('../../modules/licenseModule');
const ConfigUtils = require('../../config/config');

const config = ConfigUtils.loadConfig(process.argv);
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.web3Url))

const web3Reader = new Web3Reader(web3);
const web3Writer = new Web3Writer(web3Reader, 1);

let licenseModule = new LicenseModule(web3Reader, web3Writer)

const resolvers = {
  Query: {
    async recentPlays(parent, args, context, info) {
      return getRecentPlays(context, args)

    },
    async topPlays(parent, args, context, info) {
      return getTopPlays(context, args, {
        directPlayCount: 'desc'
      })
    },
    async trendingList(parent, args, context, info) {
      return getTrending(context, args, {
        tipPlays: 'desc'
      })
    }
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

async function getRecentPlays(context, args) {
  let releases = await context.models.UserPlayback.find({}, { _id: 0, release: 1 }).sort({ playbackDate: 'desc' }).limit(args.limit).populate('release').exec();
  //on save for release call MediaProvider.resolveIpfsUrl so we wont have to create a loop here
  let releasesArray = [];
  releases.forEach((item, index) => {
    let release = item.release;
    release.trackImg = MediaProvider.resolveIpfsUrl(release.imageUrl);
    releasesArray.push(release);
  });
  return releasesArray;
}

async function getTrending(context, args, sort) {
  let query = context.models.Release.find({
    state: 'published'
  }).sort(sort);
  if (args.limit) {
    query = query.limit(args.limit);
  }
  let releases = await query.exec()
    .then(items => items.map(item => licenseModule.convertDbRecordToLicense(item)))
    .then(promises => Promise.all(promises))
    .then(function (licenses) {
      return licenses;
    });
  let ReleasesArray = [];
  for (let track of releases) {
    track.link = 'https://musicion.org/nav/track/' + track.contractAddress;
    track.authorLink = 'https://musicoin.org/nav/artist/' + track.artistAddress;
    track.trackImg = track.imageUrl;
    ReleasesArray.push(track);
  }

  return ReleasesArray;
}

async function getTopPlays(context, args, sort) {
  // ToDo: write better query from ReleaseStats like in musicoin.org repo : Using exact query from web repo ( Sammy )
  let query = context.models.Release.find({
    state: 'published'
  }).sort(sort);
  if (args.limit) {
    query = query.limit(args.limit);
  }

  let releases = await query.exec()
    .then(items => items.map(item => licenseModule.convertDbRecordToLicense(item)))
    .then(promises => Promise.all(promises))
    .then(function (licenses) {
      // secondary sort based on plays recorded in the blockchain.  This is the number that will
      // show on the screen, but it's too slow to pull all licenses and sort.  So, sort fast with
      // our local db, then resort top results to it doesn't look stupid on the page.
      return licenses.sort((a, b) => {
        const v1 = a.playCount ? a.playCount : 0;
        const v2 = b.playCount ? b.playCount : 0;
        return v2 - v1; // descending
      });
    });;

  //ToDo: Figure out wether to add correct track link on save of release. 
  let ReleasesArray = [];
  for (let track of releases) {
    track.link = 'https://musicion.org/nav/track/' + track.contractAddress;
    track.authorLink = 'https://musicoin.org/nav/artist/' + track.artistAddress;
    track.trackImg = track.imageUrl;
    ReleasesArray.push(track);
  }

  return ReleasesArray;
}

module.exports = resolvers;