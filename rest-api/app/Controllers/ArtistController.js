const mongoose = require('mongoose');
const LicenseKey = require('../../../components/models/core/key');
const Release = require('./../../../components/models/core/release');
const User = require('./../../../components/models/core/user');
const defaultRecords = 20;
const maxRecords = 100;


function getLimit(req) {
  return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

class ArtistController {

  constructor(_artistModule, _publishCredentialsProvider, _hotWalletCredentialsProvider) {
    this.artistModule = _artistModule;
    this.publishCredentialsProvider = _publishCredentialsProvider;
    this.hotWalletCredentialsProvider = _hotWalletCredentialsProvider;
  };

  getProfileByAddress(Request, Response) {
    this.artistModule.getArtistByProfile(Request.params.address).then(res => {
      Response.send(res);
    });
  }

  getNewArtists(Request, Response) {
    this.artistModule.getNewArtists(getLimit(Request)).then(artists => {

      if (artists.length === 0) {
        Response.send({
          success: false,
          message: 'Nothing found'
        });
        return;
      }
      let ResponseInstance = [];

      for (let artist of artists) {
        ResponseInstance.push({
          name: artist.draftProfile.artistName,
          joinDate: artist.joinDate,
          profileLink: 'https://musicoin.org/nav/artist/' + artist.profileAddress
        })
      }

      Response.send({
        success: true,
        data: ResponseInstance
      });
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getFeaturedArtists(Request) {
    this.artistModule.getFeaturedArtists(getLimit(Request)).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  find(Request) {
    this.artistModule.findArtists(getLimit(Request), Request.query.term).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  profile(Request) {
    this.publishCredentialsProvider.getCredentials()
      .then(function(credentials) {
        const releaseRequest = {
          profileAddress: Request.body.profileAddress,
          owner: credentials.account,
          artistName: Request.body.artistName,
          imageUrl: Request.body.imageUrl,
          socialUrl: Request.body.socialUrl,
          descriptionUrl: Request.body.descriptionUrl
        };
        console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
        return this.artistModule.releaseProfile(releaseRequest)
      }).then(function(tx) {
        Response.send({
          tx: tx
        });
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  send(Request) {
    this.artistModule.sendFromProfile(Request.body.profileAddress, Request.body.recipientAddress, Request.body.musicoins)
      .then(function(tx) {
        Response.send({
          tx: tx
        });
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  ppp(Request, Response) {
    const context = {};
    this.artistModule.pppFromProfile(Request.body.profileAddress, Request.body.licenseAddress, this.hotWalletCredentialsProvider).then(res => {
      Response.send(res);
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    });


    return LicenseKey.findOne({
        licenseAddress: Request.body.licenseAddress
      }).exec()
      .then(record => {
        if (!record) throw new Error("Key not found for license: " + Request.body.licenseAddress);
        context.key = record.key;

      })
      .then(transactions => {
        context.transactions = transactions;
        Response.send(context);
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }

  getArtistInfo(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let ResponseInstance = {
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
        const artist = User.find({
          profileAddress: Request.params.publicKey
        });
        ResponseInstance.totalFollowers = artist.followerCount;
        Response.send(ResponseInstance);
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getArtistPlays(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let playsCount = 0;
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directPlayCount != 'undefined') {
            playsCount += releases[i].directPlayCount;
          }
        }
        Response.send({
          success: true,
          playsCount: playsCount
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getArtistTips(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      let tipCount = 0;
      if (releases.length > 0) {
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directTipCount != 'undefined') {
            tipCount += releases[i].directTipCount;
            console.log(tipCount)
          }
        }
        Response.send({
          success: true,
          tipCount: tipCount
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  async isArtist(Request, Response) {
    User.findOne({
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        mostRecentReleaseDate: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        profileAddress: Request.params.publicKey
      })
      .exec()
      .then(user => {
        if (user) {
          Response.send({
            success: true
          });
        } else {
          Response.send({
            success: false
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

  async isArtistVerified(Request, Response) {
    User.findOne({
      profileAddress: Request.params.publicKey
    }).then(user => {
      if (user) {
        Response.send({
          success: true,
          verified: user.verified || false
        });
      } else {
        Response.send({
          success: false,
          message: 'This user does not exist'
        });
      }
    }).catch(Error => {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    })
  }

  getArtistEarnings(Request, Response) {
    Release.find({
      artistAddress: Request.params.publicKey
    }).then(releases => {
      if (releases.length > 0) {
        let ResponseInstance = {
          totalTrackTips: 0,
          totalPlays: 0,
          totalEarnings: 0,
          totalEarningsInUSD: parseFloat("0")
        };
        for (var i = 0; i < releases.length; i++) {
          if (typeof releases[i].directTipCount != 'undefined') {
            ResponseInstance.totalTrackTips += releases[i].directTipCount;
          }
          if (typeof releases[i].directPlayCount != 'undefined') {
            ResponseInstance.totalPlays += releases[i].directPlayCount;
          }
        }
        ResponseInstance.totalEarnings = ResponseInstance.totalTrackTips + ResponseInstance.totalPlays;
        // now call the coinmarketcap api to get the price of musicoin
        const rp = require('request-promise');
        const requestOptions = {
          method: 'GET',
          uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=MUSIC',
          headers: {
            'X-CMC_PRO_API_KEY': '95edec13-04cd-4e39-9254-c05634bc1b7f'
          },
          json: true,
          gzip: true
        };

        rp(requestOptions).then(response => {
          console.log('CMC API price of MUSIC:', response.data, response.data.MUSIC.quote.USD.price);
          ResponseInstance.totalEarningsInUSD = ResponseInstance.totalEarnings * parseFloat(response.data.MUSIC.quote.USD.price);
          Response.send(ResponseInstance);
        }).catch((err) => {
          console.log('CMC API call error:', err.message);
          Response.send({
            success: false,
            error: "CMC API Error"
          });
        });
      } else {
        Response.send({
          success: false,
          error: "No Releases Found"
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error.message
      });
    });
  }

  getArtistOfWeek(Request, Response) {
    User.find({
        AOWBadge: true,
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        mostRecentReleaseDate: {
          $exists: true,
          $ne: null
        }
      })
      .exec()
      .then(users => {
        let UsersInstance = [];

        for (let user of users) {
          UsersInstance.push({
            artistName: user.draftProfile.artistName,
            artistAddress: "http://musicoin.org/nav/artist/" + user.profileAddress
          })
        }
        Response.send({
          success: true,
          data: UsersInstance
        });
      }).catch(Error => {
        Response.send({
          success: false,
          error: Error.message
        });
      })
  }
}

module.exports = ArtistController;
