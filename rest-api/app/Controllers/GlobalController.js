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
    console.log("CALLING SEARCH ENDPOINT");
    // need to add a direct map from various fields here. TODO. As of now, the
    // endpoint works though
    let releases = await Release.find(Request.body);
    let ReleasesArray = [];
    let ResponseInstance = {};

    var ctr = 0;
    if (releases.length > 0) {
      for (var i = 0; i < releases.length; i++) {
        console.log("I+", i);
        if (typeof releases[i] != 'undefined') {
          ctr = i;
          ReleasesArray.push({
            title: releases[i].title,
            link: 'https://musicion.org/nav/track/' + releases[i].contractAddress,
            pppLink: releases[i].tx,
            genres: releases[i].genres,
            author: releases[i].artistName,
            authorLink: 'https://musicoin.org/nav/artist/' + releases[i].artistAddress,
            trackImg: releases[i].imageUrl,
            trackDescription: releases[i].description,
            directTipCount: releases[i].directTipCount,
            directPlayCount: releases[i].directPlayCount
          });
        }
      }

      // now we have some releases, lets find the artist from here
      if (ctr >= 0) {
        let artist = User.findOne({
          profileAddress: {
            $exists: true,
            $ne: null
          }
        }).where({
          profileAddress: releases[ctr].artistAddress
        })
        console.log("ARTS", artist);
        if (typeof artist != 'undefined' || typeof artist != 'null') {
          ResponseInstance = {
            totalTrackTips: 0,
            totalFollowers: 0,
            totalReleases: 0,
            totalPlays: 0
          };
          // loop through the releases to get the relevant stats
          for (var i = 0; i < releases.length; i++) {
            if (typeof releases[ctr].directTipCount != 'undefined') {
              ResponseInstance.totalTrackTips += releases[ctr].directTipCount;
              ResponseInstance.totalReleases += 1; // count all track wiht defined number of tips
            }
            if (typeof releases[ctr].directPlayCount != 'undefined') {
              ResponseInstance.totalPlays += releases[ctr].directPlayCount;
            }
            if (typeof releases[ctr].directPlayCount != 'undefined') {
              ResponseInstance.totalReleases += 1;
            }
          }
          ResponseInstance.name = releases[ctr].artistName;
          ResponseInstance.artistURL = 'https://musicoin.org/nav/artist/' + releases[ctr].artistAddress;
          ResponseInstance.totalFollowers = artist.followerCount;
        }
        Response.send({
          success: true,
          data: {
            user: ResponseInstance,
            releases: ReleasesArray
          }
        });
        return
      }
      Response.send({
        success: true,
        data: {
          releases: ReleasesArray
        }
      });
      return
    } else {
      console.log("GOIGN THE USER WYA")
      let user = await User.findOne(Request.body);
      if (typeof user != 'undefined' || typeof user != 'null') {
        let releases = await Release.find({
          artistAddress: user.profileAddress || ''
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
    }
  }
}

module.exports = GlobalController;
