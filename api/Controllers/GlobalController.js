/**
 *
 *   MODELS
 *
 * */
const User = require('../../db/core/user');
const ApiUser = require('../../db/core/api-user');
const Release = require('../../db/core/release');
const Playlist = require('../../db/core/playlist');
const Package = require('../../db/core/api-package');
const mongoose = require('mongoose');

class GlobalController {
  async search(Request, Response) {
    let ReleasesArray = [];
    let ResponseInstance = {
      totalTrackTips: 0,
      totalFollowers: 0,
      totalReleases: 0,
      totalPlays: 0
    };

    var ctr = 0;
    Release.find(Request.body).then(releases => {
      console.log("Searching for a release");
      for (var i = 0; i < releases.length; i++) {
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
    }).catch(Error => {
      console.log("Searching for a user");
      // lets assume we didn't search via the user field
      let user = User.findOne(Request.body).then(user => {
        let releases = Release.find({
          artistAddress: user.profileAddress
        }).then(releases => {
          if (releases.length > 0) {
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
            // now we have the user details. Now we have to find the list of releases attached to this guy
            // if possible
            // lets take artistAddress as the field because artistName seems to vary between tracks
            console.log("ResponseInstance", ResponseInstance);
            for (var i = 0; i < releases.length; i++) {
              if (typeof releases[i] != 'undefined') {
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
            Response.send({
              success: true,
              data: {
                user: ResponseInstance,
                releases: ReleasesArray
              }
            });
          } else {
            Response.send({
              success: false,
              error: "No releases found!"
            });
          }
        }).catch(Error => {
          Response.send({
            success: false,
            error: Error.message
          });
        });
      }).catch(Error => {
        Response.send({
          success: false,
          error: Error.message
        });
      });
    });
  }

  async searchV1(Request, Response) {

    try {
      const keyword = Request.body.keyword;

      const reg = new RegExp(keyword ? keyword : "", "i");

      const releases = await Release.find({
        $or: [{
            title: {
              $regex: reg
            }
          },
          {
            author: {
              $regex: reg
            }
          },
          {
            genres: {
              $regex: reg
            }
          }
        ]
      }).exec();

      const ResponseInstance = {
        totalTrackTips: 0,
        totalReleases: 0,
        totalPlays: 0
      };

      const ReleasesArray = releases.filter(release => release !== undefined).map(release => {

        const directTipCount = release.directTipCount || 0;
        const directPlayCount = release.directPlayCount || 0;


        ResponseInstance.totalTrackTips += directPlayCount;
        ResponseInstance.totalPlays += directPlayCount;
        return {
          title: release.title,
          link: 'https://musicion.org/nav/track/' + release.contractAddress,
          pppLink: release.tx,
          genres: release.genres,
          author: release.artistName,
          authorLink: 'https://musicoin.org/nav/artist/' + release.artistAddress,
          trackImg: release.imageUrl,
          trackDescription: release.description,
          directTipCount: directPlayCount,
          directPlayCount: directPlayCount
        }
      });

      ResponseInstance.totalReleases = ReleasesArray.length;
      Response.send({
        success: true,
        data: {
          mate: ResponseInstance,
          releases: ReleasesArray
        }
      });
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }

  }

  async getAllSongsByName(Request, Response) {

    let ReleasesArray = [];
    let ResponseInstance = {
      totalTrackTips: 0,
      totalFollowers: 0,
      totalReleases: 0,
      totalPlays: 0
    };

    var ctr = 0;
    Release.find(Request.body).then(releases => {
      console.log("Searching for a release");
      for (var i = 0; i < releases.length; i++) {
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
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  async getAllSongs(Request, Response) {
    // this endpoint should accept a string (artistName) to find the artist's songs
    // this can also be the profile address I guess, should work pretty okay
    // this is a subset of the search endpoint as well
    let ReleasesArray = [];
    let ResponseInstance = {
      totalTrackTips: 0,
      totalFollowers: 0,
      totalReleases: 0,
      totalPlays: 0
    };
    User.findOne({
      artistName: Request.query.artistName
    }).then(user => {
      console.log("USER FOUND", user);
      if ((typeof user != 'null') && (typeof user != 'undefined')) {
        let releases = Release.find({
          artistAddress: user.profileAddress
        }).then(releases => {
          if (releases.length > 0) {
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
            // now we have the user details. Now we have to find the list of releases attached to this guy
            // if possible
            // lets take artistAddress as the field because artistName seems to vary between tracks
            console.log("ResponseInstance", ResponseInstance);
            for (var i = 0; i < releases.length; i++) {
              if (typeof releases[i] != 'undefined') {
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
            Response.send({
              success: true,
              data: {
                user: ResponseInstance,
                releases: ReleasesArray
              }
            });
          } else {
            Response.send({
              success: false,
              error: "No releases found!"
            });
          }
        }).catch(Error => {
          Response.send({
            success: false,
            error: Error.message
          });
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }
}

module.exports = GlobalController;