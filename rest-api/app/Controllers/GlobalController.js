/**
 *
 *   MODELS
 *
 * */
const User = require('./../../../components/models/core/user');
const ApiUser = require('./../../../components/models/core/api-user');
const Release = require('./../../../components/models/core/release');
const Playlist = require('./../../../components/models/core/playlist');
const Package = require('./../../../components/models/core/api-package');
const ReleaseStats = require('./../../../components/models/core/release-stat');
const mongoose = require('mongoose');

class GlobalController {

  async search(Request, Response) {
    try {
      let user = await User.findOne(Request.body);
      let releases = await Release.find(Request.body);
      let ResponseInstance = {};
      if (releases.length > 0) {
        for (let track of releases) {
          ReleasesArray.push({
            title: track.title,
            link: 'https://musicion.org/nav/track/' + track.contractAddress,
            pppLink: track.tx,
            genres: track.genres,
            author: track.artistName,
            authorLink: 'https://musicoin.org/nav/artist/' + track.artistAddress,
            trackImg: track.imageUrl,
            trackDescription: track.description,
            directTipCount: track.directTipCount,
            directPlayCount: track.directPlayCount
          });
        }
      }

      if (user) {
        let releases = await Release.find({
          artistAddress: user.profileAddress
        });

        ResponseInstance = {
          totalTips: 0,
          totalFollowers: 0,
          totalReleases: 0,
          totalPlays: 0
        };

        for (let release of releases) {
          let stats = await ReleaseStats.aggregate({
            $match: {
              release: mongoose.Types.ObjectId(release._id)
            },
          }, {
            $group: {
              _id: null,
              tipCount: {
                $sum: '$tipCount'
              },
              playCount: {
                $sum: '$playCount'
              },
            }
          });

          if (stats.length > 0) {
            ResponseInstance.totalPlays += stats[0].playCount;
            ResponseInstance.totalTips += stats[0].tipCount;
          } else {
            ResponseInstance.totalPlays += release.directPlayCount ? release.directPlayCount : 0;
            ResponseInstance.totalTips += release.directTipCount ? release.directTipCount : 0;
          }
        }
        ResponseInstance.totalReleases = releases.length;
        ResponseInstance.name = user.draftProfile.artistName;
        ResponseInstance.artistURL = 'https://musicoin.org/nav/artist/' + user.profileAddress;
        ResponseInstance.totalFollowers = user.followerCount;
      }

      Response.send({
        success: true,
        data: {
          user: ResponseInstance,
          releases: ReleasesArray
        }
      })
    } catch (Error) {
      Response.send({
        success: false,
        error: Error.message
      })
    }
  }
}

module.exports = GlobalController;
