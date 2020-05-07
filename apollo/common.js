const API_DOMAIN = "kickass.musicoin.org";
const MediaProvider = require('../utils/media-provider-instance');
const Web3Reader = require('../modules/blockchain/web3-reader');
const Web3Writer = require('../modules/blockchain/web3-writer');
const LicenseModule = require('../modules/licenseModule');
const ConfigUtils = require('../config/config');
const { responseList } = require('../api/response-data/v1/release-model')
const config = ConfigUtils.loadConfig(process.argv);
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.web3Url))

const web3Reader = new Web3Reader(web3);
const web3Writer = new Web3Writer(web3Reader, 1);

let licenseModule = new LicenseModule(web3Reader, web3Writer)

async function getStats(context) {
    const releaseTips = await context.models.Release.aggregate([
        { $match: { state: "published" } },
        { $group: { _id: "all", tips: { $sum: "$directTipCount" } } }
    ]);
    const userTips = await context.models.UserStats.aggregate([
        { $match: { duration: "all" } },
        { $group: { _id: "all", tips: { $sum: "$tipCount" } } }
    ]);

    const playCount = await context.models.Release.aggregate([
        { $match: { state: "published" } },
        { $group: { _id: "all", plays: { $sum: "$directPlayCount" } } }
    ])
    //ToDo: instantiate logger withing context
    //this.logger.info("getAnalytics", JSON.stringify([releaseTips, userTips]));
    return { plays: playCount[0].plays, tips: releaseTips[0].tips + userTips[0].tips };
}
async function getTrending(context, args, sort) {
    let query = context.models.Release.find({
        state: 'published'
    }).populate('artist', '_id').sort(sort);
    if (args.limit) {
        query = query.limit(args.limit);
    }
    let releases = await query.exec();
    let releasesData = responseList(releases)

    return releasesData;
}

function resolveIpfsUrl(url) {
    return MediaProvider.resolveIpfsUrl(url)
}

async function loadLatestHero(context) {
    return await context.models.Hero.find().sort({
        startDate: -1
    }).limit(1).exec();
}

async function loadTrack(context, address) {
    return await context.models.Release.findOne({
        contractAddress: address
    }).exec();
}

async function loadUserByEmail(context, email) {
    return context.models.User.findOne({ 'apiEmail': email }).exec();
}


async function isLiking(context, userId, trackAddress) {
    const release = await context.models.Release.findOne({ "contractAddress": trackAddress }).exec();
    //ToDO: Add logging 
    // this.logger.debug("isLiking", JSON.stringify([trackAddress, release]));

    if (release && release.id) {
        const liked = await context.models.Like.findOne({ liker: userId, liking: release.id }).exec();
        // this.logger.debug("isLiking", JSON.stringify(liked));
        if (liked) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function loadArtist(context, address) {
    return await context.models.User.findOne({
        profileAddress: address
    }).exec();

    //this.logger.debug("loadArtist:",user);
}

async function filterFollowing(context, user, artist) {
    if (user) {
        artist.followed = await isUserFollowing(context, user.id, artist.artistAddress);
    } else {
        artist.followed = false;
    }
    return artist;
}

async function isUserFollowing(context, userId, toFollow) {
    const follower = await context.models.User.findOne({ "profileAddress": toFollow }).exec();
    //this.logger.debug("isUserFollowing", JSON.stringify([toFollow, follower]));

    if (follower && follower.id) {
        const followed = await context.models.Follow.findOne({ follower: userId, following: follower.id }).exec();
        //  this.logger.debug("isUserFollowing", JSON.stringify(followed));
        if (followed) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = {
    getTrending,
    getStats,
    resolveIpfsUrl,
    loadArtist,
    loadUserByEmail,
    loadLatestHero,
    loadTrack,
    isLiking,
    filterFollowing
}