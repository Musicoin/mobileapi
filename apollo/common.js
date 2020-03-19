const API_DOMAIN = "kickass.musicoin.org";
const MediaProvider = require('../utils/media-provider-instance');
const Web3Reader = require('../modules/blockchain/web3-reader');
const Web3Writer = require('../modules/blockchain/web3-writer');
const LicenseModule = require('../modules/licenseModule');
const ConfigUtils = require('../config/config');
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
        track.trackImg = MediaProvider.resolveIpfsUrl(track.imageUrl);
        track.trackUrl = `https://${API_DOMAIN}/api/test/track/download/${track.contractAddress}`
        ReleasesArray.push(track);
    }

    return ReleasesArray;
}

module.exports = {
    getTrending,
    getStats
}