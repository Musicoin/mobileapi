/**
 *
 *   MODELS
 *
 * */

const Release = require('../../db/core/release');
const Playlist = require('../../db/core/playlist');
const User = require('../../db/core/user');
const TipHistory = require('../../db/core/tip-history');

/**
 *   VALIDATION SCHEMAS
 */
const ReleaseSchema = require('../ValidatorSchema/ReleaseSchema');

/**
 *  LIBS
 *
 * */
const mongoose = require('mongoose');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();

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

  limit(limit) {
    if (limit && limit > 0) {
      return limit;
    } else {
      return 10;
    }
  }

  getGenres(Request, Response) {
    Response.send(knownGenres);
  }

  getTrackDetails(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).populate('artist').then(track => {

      if (track) {
        Response.send({
          success: true,
          data: {
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
          }
        });
      } else {
        Response.send({
          success: false,
          message: 'Track does not found'
        })
      }

    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      })
    })
  }

  getRandomTrack(Request, Response) {

    let where = {};
    if (Request.query.genre) {
      if (knownGenres.indexOf(Request.query.genre) !== -1) {
        where.genres = Request.query.genre;
      } else {
        Response.send({
          success: false,
          message: 'This genre is not available'
        });
        return;
      }
    }

    Release.find(where).then(releases => {
      let rand = 0 + Math.random() * (releases.length);
      rand = Math.floor(rand);

      const track = releases[rand];

      if (track) {
        Response.send({
          success: true,
          data: {
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
          }
        });
      } else {
        Response.send({
          success: false,
          message: 'Track does not found'
        })
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      })
    });
  }

  getTrackUpVotes(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).populate('artist').then(track => {

      if (track) {
        if (track.votes) {
          Response.send({
            success: true,
            upVotes: track.votes.up
          })
        } else {
          Response.send({
            success: true,
            message: 'There are no votes of this track'
          });
        }
      } else {
        Response.send({
          success: false,
          message: 'Track does not exist'
        });
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getTrackTips(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).then(track => {
      if (track) {
        Response.send({
          success: true,
          totalTips: track.directTipCount
        });
      } else {
        Response.send({
          success: false,
          message: 'Track not found'
        })
      }
    }).catch(Error => {
      Response.send(400, {
        success: false,
        error: Error.message
      });
    });
  }

  getTrackPlays(Request, Response) {
    Release.findOne({
      contractAddress: Request.params.publicKey
    }).then(track => {
      if (track) {
        Response.send(200, {
          success: true,
          plays: track.directPlayCount
        });
      } else {
        Response.send({
          success: false,
          message: 'Track not found'
        });
      }
    }).catch(Error => {
      Response.send(400, {
        success: false,
        error: Error.message
      });
    });
  }

  getTracksByGenre(Request, Response) {

    Release.find({
        genres: Request.query.genre
      })
      .limit(this.limit(Number(Request.query.limit)))
      .then(releases => {
        let ReleasesArray = [];
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

        Response.send({
          success: true,
          data: ReleasesArray
        });
      })
      .catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      })
  }

  getTopTracks(Request, Response) {
    Release.find()
      .sort({
        directTipCount: 'desc'
      })
      .limit(this.limit(Number(Request.query.limit)))
      .then(releases => {
        let ReleasesArray = [];
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

        Response.send({
          success: true,
          data: ReleasesArray
        });
      })
      .catch(Error => {
        Response.send(400, {
          success: false,
          error: Error.message
        })
      });
  }

  getRecentTracks(Request, Response) {
    Release.find({})
      .sort({
        releaseDate: 'desc'
      })
      .limit(this.limit(Number(Request.query.limit)))
      .then(tracks => {
        let TrackArray = [];
        for (let track of tracks) {
          TrackArray.push({
            artistName: track.artistName,
            artistProfile: 'https://musicoin.org/nav/artist/' + track.artistAddress,
            trackURL: 'https://musicion.org/nav/track/' + track.contractAddress
          });
        }

        Response.send({
          success: true,
          data: TrackArray
        });
      })
      .catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  tipTrack(Request, Response) {

    const body = {
      tip: Number(Request.body.tip)
    };

    const validate = Validator.validate(body, ReleaseSchema.tip);

    if (validate === true) {
      Release.findOne({
          contractAddress: Request.params.publicKey
        })
        .then(async release => {
          // now we have the release, check tipCount
          if (release) {
            if (!release.directTipCount) {
              release.directTipCount = 0;
            }
            // now before updating the db, we need to call web3 APIs to actually send coins on the blockchain

            release.directTipCount += Number(body.tip);
            release.save();
            await TipHistory.create({
              user: Request.query.clientId,
              release: release._id,
              tipCount: body.tip,
              date: Date.now()
            });
            Response.send({
              success: true,
              tipCount: release.directTipCount
            })
          } else {
            Response.send({
              success: false,
              message: 'This track does not exist'
            });
          }
        })
        .catch(Error => {
          Response.status(400);
          Response.send({
            success: false,
            error: Error.message
          });
        })
    } else {
      Response.status(400);
      Response.send({
        success: false,
        error: validate
      })
    }
  }
}

module.exports = new ReleaseController();
