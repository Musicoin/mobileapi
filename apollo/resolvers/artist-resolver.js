const { loadArtist, loadLatestHero, filterFollowing, loadTrack, loadUserByEmail, isLiking } = require('../common')
const { responseData, responseList } = require('../../api/response-data/v1/release-model')
const ArtistResponseData = require('../../api/response-data/v1/artist-model').responseData
const ArtistResponseMore = require('../../api/response-data/v1/artist-model').responseMore


const resolvers = {
    Query: {
        async getArtistOfTheWeek(parent, args, context, info) {
            //rewrite the method to use async await, it will be much easier
            try {
                // find the record of week
                const email = args.email;
                const hero = await loadLatestHero(context);
                console.log(hero)
                if (hero.length < 1) {
                    return Error('error loading hero')
                }
                // load release of the record
                const track = await loadTrack(context, hero[0].licenseAddress);
                if (!track) {
                    return Error('Could not load release')
                }
                const release = responseData(track);
                console.log(release)

                const currentUser = await loadUserByEmail(context, email);
                if (currentUser) {
                    release.liked = await isLiking(context, currentUser.id, release.trackAddress);
                } else {
                    release.liked = false;
                }
                // load artist by address
                let user = await loadArtist(context, release.artistAddress);
                if (!user) {
                    return Error("user not found")
                }
                let response;
                if (user.draftProfile) {
                    response = ArtistResponseData(user);
                } else {
                    const artist = await web3Reader.getArtistByProfile(release.artistAddress);
                    //this.logger.debug("artist social: ", artist.socialUrl);
                    const description = await MediaProvider.fetchTextFromIpfs(artist.descriptionUrl);
                    const social = await MediaProvider.fetchTextFromIpfs(artist.socialUrl);
                    artist.description = description;
                    artist.social = JSON.parse(social);
                    response = ArtistResponseMore(artist, user);
                }
                console.log(response)
                response = await filterFollowing(context, currentUser, response);
                console.log(response)

                return {
                    release,
                    artist: response,
                };
            } catch (error) {
                return error
            }
        },
        async getNewArtists(parent, args, context, info) {
            try {
                let artists = await context.models.User.find({
                    profileAddress: {
                        $exists: true,
                        $ne: null
                    }
                }).where({
                    mostRecentReleaseDate: {
                        $exists: true,
                        $ne: null
                    }
                }).sort({
                    joinDate: 'desc'
                }).limit(args.limit).exec();

                let data = []
                for (let artist of artists) {
                    data.push(ArtistResponseData(artist))
                }
                return data
            } catch (error) {
                console.log(error)
                return error
            }
        },
        async getArtist(parent, args, context, info) {
            try {
                let getArtistTracks = false
                for (let selection of info.fieldNodes[0].selectionSet.selections) {
                    if (selection.name.value === 'artistTracks') {
                        getArtistTracks = true;
                        break;
                    }
                }
                let artist = await context.models.User.findById(args.id);
                let artistResponseData = ArtistResponseData(artist)
                if (getArtistTracks) {
                    console.log('gettingTracks')
                    let artistTracks = await context.models.Release.find({
                        artistAddress: artist.profileAddress,
                        state: 'published',
                        markedAsAbuse: {
                            $ne: true
                        }
                    }).populate('artist', '_id').sort({
                        releaseDate: 'desc'
                    }).limit(10).exec();

                    let artistTracksData = responseList(artistTracks)

                    return {
                        ...artistResponseData,
                        artistTracks: artistTracksData
                    }
                }
                return artistResponseData

            } catch (error) {
                return error
            }
        }
    }
};

module.exports = resolvers;