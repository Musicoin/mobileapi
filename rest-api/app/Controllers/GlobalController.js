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
const mongoose = require('mongoose');

class GlobalController {
  async search(Request, Response) {
    // need to add a direct map from various fields here. TODO. As of now, the
    // endpoint works though
    try {
      let user = await User.findOne(Request.body);
      let releases = await Release.find(Request.body);
      let ReleasesArray = [];
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

      if (typeof user != 'undefined' || typeof user != 'null') {
        let releases = await Release.find({
          artistAddress: user.profileAddress
        });

        ResponseInstance = {
          totalTrackTips: 0,
          totalFollowers: 0,
          totalReleases: 0,
          totalPlays: 0
        };
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directTipCount != 'undefined') {
            ResponseInstance.totalTrackTips += releases[i].directTipCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalPlays += releases[i].directPlayCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalReleases += 1;
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
