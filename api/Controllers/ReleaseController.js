/**
 *
 *   MODELS
 *
 * */

const Release = require('../../db/core/release');
const Playlist = require('../../db/core/playlist');
const User = require('../../db/core/user');
const TipHistory = require('../../db/core/tip-history');
const ReleaseModel = require('../data/release-model');

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
    console.log("Calling route?")
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

  async getTrackDetailV1(Request, Response) {
    try {
      const release = await Release.findOne({
        contractAddress: Request.params.publicKey
      }).exec();
      if (release) {
        Response.status(200).json({
          success: true,
          data: ReleaseModel.responseData(release)
        })
      } else {
        Response.status(200).json({
          success: false,
          message: 'Track does not found'
        })
      }
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
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

  async getRandomTrackV1(Request, Response) {

    let where = {};
    const genre = Request.query.genre;
    if (genre) {
      if (knownGenres.indexOf(genre) !== -1) {
        where.genres = genre;
      } else {
        return Response.status(400).json({
          success: false,
          message: 'This genre is not available'
        });
      }
    }

    try {
      const total = await Release.count(where);
      const randomSkip = Math.floor(Math.random() * total);

      const track = await Release.findOne(where).skip(randomSkip).exec();
      Response.status(200).json({
        success: true,
        data: ReleaseModel.responseData(track)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
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

  async getTracksByGenreV1(Request, Response) {
    const genre = Request.query.genre;
    const limit = this.limit(Number(Request.query.limit));
    const filter = {};
    if (genre && knownGenres.indexOf(genre) !== -1) {
      filter.genres = genre;
    } else {
      return Response.status(400).json({
        success: false,
        message: 'This genre is not available'
      });
    }
    try {
      const releases = await Release.find(filter).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
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

  async getTopTracksV1(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      const releases = await Release.find({}).sort({
        directTipCount: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  getTopTracksByGenre(Request, Response) {
    Release.find()
      .sort({
        directTipCount: 'desc'
      })
      //.limit(this.limit(Number(Request.query.limit)))
      .then(releases => {
        var lim = 0;
        if (releases.length > 1000) { // DoS limit
          lim = 1000;
        } else {
          lim = releases.length;
        }
        if (Request.query.limit > 100) {
          Request.query.limit = 100;
        }
        let ReleasesArray = [];
        console.log("LIM", lim, "RELASE$SArrya")
        for (var i = 0; i < lim; i++) {
          console.log(i, "<-INDEX")
          if (releases[i].genres.indexOf(Request.query.genre) > -1) {
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
          if (ReleasesArray.length == Request.query.limit) {
            break;
          }
        }
        Response.send({
          success: true,
          data: ReleasesArray
        });
      });
  }

  async getTopTracksByGenreV1(Request, Response) {

    const genre = Request.query.genre;
    const limit = this.limit(Number(Request.query.limit));
    const filter = {};
    if (genre && knownGenres.indexOf(genre) !== -1) {
      filter.genres = genre;
    } else {
      return Response.status(400).json({
        success: false,
        message: 'This genre is not available'
      });
    }

    try {
      const releases = await Release.find(filter).sort({
        directTipCount: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
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

  async getRecentTracksV1(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      const releases = await Release.find({}).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
  }

  async getTracksByAritstV1(Request, Response) {
    console.log(Request.query);
    const limit = this.limit(Number(Request.query.limit));
    const aritstId = Request.query.aritstId;
    if(!aritstId){
      return Response.status(400).json({
        error: "artistId is required."
      });
    }
    try {
      const releases = await Release.find({
        artistAddress: aritstId
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      Response.status(200).json({
        success: true,
        releases: ReleaseModel.responseList(releases)
      })
    } catch (error) {
      Response.status(500).json({
        error: error.message
      });
    }
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
            const user = await User.findOne({
              "local.email": Request.query.email
            }).exec();
            await TipHistory.create({
              user: user._id,
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

  async getRandomTracksV1(Request, Response) {
    try {
      const limit = this.limit(Number(Request.query.limit));
      // use $sample to find the random releases
      const releases = await Release.aggregate([{
        $sample: {
          size: limit
        }
      }]).exec();

      const tracks = ReleaseModel.responseList(releases);
      Response.send({
        success: true,
        releases: tracks
      });
    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }
}

module.exports = new ReleaseController();