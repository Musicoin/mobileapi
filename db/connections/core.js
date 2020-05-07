const mongoose = require('mongoose');
const url = process.env.MONGO_ENDPOINT ? process.env.MONGO_ENDPOINT + "/musicoin-org" : 'mongodb://localhost/musicoin-org';
const Logger = require('../../utils/Logger')
const User = require('../core/user');
const ApiUser = require('../core/api-user');
const Hero = require('../core/hero');
const ApiPackage = require('../core/api-package');
const IPFSResource = require('../core/ipfs-resource');
const LicenseKey = require('../core/key');
const Playlist = require('../core/playlist');
const ReleaseStats = require('../core/release-stats');
const Release = require('../core/release');
const TipHistory = require('../core/tip-history');
const TrackMessage = require('../core/track-message');
const UserPlayback = require('../core/user-playback');
const UserStats = require('../core/user-stats');
const Report = require("../core/report");
const Follow = require("../core/follow");
const Like = require("../core/like");
const Receipt = require("../core/receipt");

const models = {
    Release,
    ReleaseStats,
    UserPlayback,
    UserStats,
    User,
    Hero,
    Like,
    Follow
}
const connectDb = async () => {
    try {
        await mongoose.connect(url, { useNewUrlParser: true });
        let db = mongoose.connection
        db.on('error', err => {
            Logger.error(err);
        })
    } catch (error) {
        Logger.error(error)
    }
};

module.exports = {
    models,
    connectDb
}
