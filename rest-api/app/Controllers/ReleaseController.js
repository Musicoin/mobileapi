const Release = require('./../../../components/models/core/release');
const ReleaseStat = require('./../../../components/models/main/release-stat');

const knownGenres = [
    "Alternative Rock",
    "Ambient",
    "Classical",
    "Country",
    "Dance & EDM",
    "Dancehall",
    "Deep House",
    "Disco",
    "Drum & Bass",
    "Electronic",
    "Folk & Singer-Songwriter",
    "Hip-hop & Rap",
    "House",
    "Indie",
    "Jazz & Blues",
    "Latin",
    "Metal",
    "Piano",
    "Pop",
    "R&B & Soul",
    "Reggae",
    "Reggaeton",
    "Rock",
    "Soundtrack",
    "Techno",
    "Trance",
    "World",
    "Other"
];

class ReleaseController {

    /**
     * Test method
     *
     * */
    async getTopTracks(Request, Response) {

        let releaseStats = await ReleaseStat.find().populate('release');
        let releases = await Release.find().populate('stats','release');
        Response.send(releases);
    }

    getGenres(Request, Response) {
        Response.send(knownGenres);
    }

    getTrackDetails(Request, Response) {
        Release.findById(Request.params.id).populate('artist').then( track => {
            if(track) {
                Response.send({
                    success: true,
                    data: {
                        title: track.title,
                        link: 'https://musicion.org/nav/track/'+track.contractAddress,
                        pppLink: track.tx,
                        genres: track.genres,
                        author: track.artistName,
                        authorLink: 'https://musicoin.org/nav/artist/'+track.artistAddress,
                        trackImg: track.imageUrl,
                        trackDescription: track.description,
                        directTipCount: track.directTipCount,
                        directPlayCount: track.directPlayCount
                    }
                });
            } else {
                Response.send({success: false, message: 'Track does not found'})
            }

        }).catch( Error => {
            Response.status(400);
            Response.send({success: false, error: Error.message})
        })
    }

    getRandomTrack(Request, Response) {

        let where = {};
        if(Request.query.genre) {

            if(knownGenres.indexOf(Request.query.genre) !== -1) {
                where.genres = Request.query.genre;
            } else {
                Response.send({success: false, message: 'This genre is not available'});
                return;
            }

        }

        Release.find(where).then(releases => {
            let rand = 0 + Math.random() * (releases.length);
            rand = Math.floor(rand);

            const track = releases[rand];

            if( track ) {
                Response.send({
                    success: true,
                    data: {
                        title: track.title,
                        link: 'https://musicion.org/nav/track/'+track.contractAddress,
                        pppLink: track.tx,
                        genres: track.genres,
                        author: track.artistName,
                        authorLink: 'https://musicoin.org/nav/artist/'+track.artistAddress,
                        trackImg: track.imageUrl,
                        trackDescription: track.description,
                        directTipCount: track.directTipCount,
                        directPlayCount: track.directPlayCount
                    }
                });
            } else {
                Response.send({success: false, message: 'Track does not found'})
            }

        }).catch( Error => {
           Response.status(400);
           Response.send({success: false, error: Error.message})
        });
    }

}

module.exports = new ReleaseController();