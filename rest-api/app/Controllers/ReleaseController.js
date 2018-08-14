const Release = require('./../../../components/models/main/release');
const ReleaseStat = require('./../../../components/models/main/release-stat');

class ReleaseController {

    async getTopTracks(Request, Response) {

        let releaseStats = await ReleaseStat.find().populate('release');

        let releases = await Release.find().populate('stats','release');

        // let stats = await releases[0].getStats();

        Response.send(releases);
    }

}

module.exports = new ReleaseController();