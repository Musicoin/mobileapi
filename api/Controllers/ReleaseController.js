/**
 *
 *   MODELS
 *
 * */

const Release = require('../../db/core/release');
const ReleaseStats = require('../../db/core/release-stats');
const TrackMessage = require('../../db/core/track-message');
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
const moment = require('moment');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const uuidV4 = require('uuid/v4');
const emailUtil = require("../../utils/email");
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../views/message.ejs");

const UBIMUSIC_ACCOUNT = "0x576b3db6f9df3fe83ea3f6fba9eca8c0ee0e4915";

const renderMessage = function (params, callback) {
  return renderFile(NOTIFICATION_HTML, {notification: params}, callback);
}

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

const DatePeriodStart = [
  "day",
  "week",
  "month",
  "year",
  "all"
];

class ReleaseController {

  constructor(ArtistModule,PublishCredentials,PaymentCredentials) {

    this.ArtistModule = ArtistModule;
    this.PublishCredentials = PublishCredentials;
    this.PaymentCredentials = PaymentCredentials;

    this.tipTrackV1 = this.tipTrackV1.bind(this);
    this.getUserEmail = this.getUserEmail.bind(this);
    this.updateReleaseStats = this.updateReleaseStats.bind(this);
    this._updateReleaseStats = this._updateReleaseStats.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
  }

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

    let where = {
      state: 'published',
      state4app: {
        $ne: "error"
      }
    };
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
        genres: Request.query.genre,
        state: 'published',
        state4app: {
          $ne: "error"
        }
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
    const filter = {
      state: 'published',
      state4app: {
        $ne: "error"
      }
    };
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
    Release.find({
        state: 'published',
        state4app: {
          $ne: "error"
        }
      })
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
      const releases = await Release.find({
        state: 'published',
        state4app: {
          $ne: "error"
        }
      }).sort({
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

  async getTopTracksByGenre(Request, Response) {
    const limit = this.limit(Number(Request.query.limit));
    try {
      const releases = await Release.find({
        state: 'published',
        state4app: {
          $ne: "error"
        }
      }).sort({
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

  async getTopTracksByGenreV1(Request, Response) {

    const genre = Request.query.genre;
    const limit = this.limit(Number(Request.query.limit));
    const filter = {
      state: 'published',
      state4app: {
        $ne: "error"
      }
    };
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
    Release.find({
        state: 'published',
        state4app: {
          $ne: "error"
        }
      })
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
      const errFilePath = "/var/www/mcorg/running-master/musicoin-streaming/log/streaming-error-address.log";
      const errFileContent = require('fs').readFileSync(errFilePath).toString();
      const errArray = errFileContent.split("\n");
      const releases = await Release.find({
        state: 'published',
        state4app: {
          $ne: "error"
        },
        contractAddress: {
          $nin: errArray
        }
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      console.log("releases: ", releases);
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
    const aritstId = Request.params.address;
    if (!aritstId) {
      return Response.status(400).json({
        error: "artistId is required."
      });
    }
    try {
      const releases = await Release.find({
        artistAddress: aritstId,
        state: 'published',
        state4app: {
          $ne: "error"
        }
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

  async tipTrackV1(Request, Response) {
    const trackAddress = Request.body.trackAddress;

    if (!trackAddress) {
      return Response.status(400).json({
        error: "track address is required."
      })
    }

    const amount = Request.body.musicoins || 10;

    try {
      // find track
      const release = await Release.findOne({
        contractAddress: trackAddress
      }).exec();
      if (!release) {
        return Response.status(400).json({
          error: "Track not found: " + trackAddress
        })
      }

      // find abimusic
      const sender = await User.findOne({
        profileAddress: UBIMUSIC_ACCOUNT
      }).exec();
      if(!sender){
        return Response.status(400).json({
          error: "UBIMUSIC not found: " + UBIMUSIC_ACCOUNT
        })
      }

      // send tip amount to track address
      const tx = await this.ArtistModule.sendTipFromProfile(UBIMUSIC_ACCOUNT, trackAddress, amount, this.PaymentCredentials);
      // increase tip count
      const tipCount = release.directTipCount || 0;
      release.directTipCount = tipCount + amount;
      await release.save();

      // update release stats
      await this.updateReleaseStats(release._id, amount);
      const senderName = sender.draftProfile.artistName;
      const amountUnit = amount === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${amount} ${amountUnit} on "${release.title}"`;
      const threadId = uuidV4();
      // find track srtist
      const artist = await User.findOne({
        profileAddress: release.artistAddress
      }).exec();
      const email = this.getUserEmail(artist);
      // send email to artist
      if (email) {
        const notification = {
          trackName: release.title || "",
          actionUrl: `https://musicoin.org/nav/thread-page?thread=${threadId}`,
          message: message,
          senderName: senderName
        };

        renderMessage(notification, (err, html) => {
          console.log("email error: ",err);
          if (html) {
            const emailContent = {
              from: "musicoin@musicoin.org",
              to: email,
              subject: `${senderName} commented on ${release.title}`,
              html: html
            }

            emailUtil.send(emailContent).then(result => {
              console.log("email send complete: ", result);
            });
          }
        })
      }
      
      // insert a track message to db
      await TrackMessage.create({
        artistAddress: release.artistAddress,
        contractAddress: trackAddress,
        senderAddress: UBIMUSIC_ACCOUNT,
        release: release._id,
        artist: artist?artist._id:null,
        sender: sender._id,
        message: message,
        replyToMessage: null,
        replyToSender: null,
        threadId: threadId,
        messageType: "tip",
        tips: amount
      });

      Response.status(200).json({
        tx: tx
      });

    } catch (error) {
      Response.status(500).json({
        error: error.message
      })
    }
  }

  getUserEmail(user) {
    if (!user) return null;
    if (user.preferredEmail) return user.preferredEmail;
    if (user.local && user.local.email) return user.local.email;
    if (user.google && user.google.email) return user.google.email;
    if (user.facebook && user.facebook.email) return user.facebook.email;
    if (user.twitter && user.twitter.email) return user.twitter.email;
    if (user.invite && user.invite.invitedAs) return user.invite.invitedAs;
    return null;
  }

  async updateReleaseStats(releaseId, amount) {
    const updatePromise = this._updateReleaseStats;
    const now = Date.now();
    return Promise.all(DatePeriodStart.map(duration => {
      return updatePromise(releaseId, now, duration, amount)
    }));
  }

  _updateReleaseStats(releaseId, startDate, duration, amount) {
    const where = {
      release: releaseId,
      startDate: this.getDatePeriodStart(startDate, duration),
      duration
    }

    const updateParams = {
      $inc: {
        tipCount: amount
      }
    }

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return ReleaseStats.findOneAndUpdate(
      where,
      updateParams,
      options
    ).exec();
  }

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
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

module.exports = ReleaseController;