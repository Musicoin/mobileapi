const mongoose = require('mongoose');
const url = process.env.MONGO_ENDPOINT ? process.env.MONGO_ENDPOINT + "/musicoin-org" : 'mongodb://localhost/musicoin-org';
const Logger = require('../../utils/Logger')
const Release = require('../core/release')
const ReleaseStats = require('../core/release-stats')
const UserPlayback = require('../core/user-playback')
const UserStats = require('../core/user-stats')

const models = {
    Release,
    ReleaseStats,
    UserPlayback,
    UserStats
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
