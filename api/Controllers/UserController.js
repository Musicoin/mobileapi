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
/**
 *   VALIDATION SCHEMAS
 */
const UserSchema = require('../ValidatorSchema/UserSchema');
/**
 *  LIBS
 *
 * */
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const async = require('async');


const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
/**
 *
 * User Controller class
 *
 *
 * Main user functional
 *
 * playlist create, delete, get
 *
 * useraccount delete
 *
 * */
const kInitialMaxBlocks = 5000;
const kMinBlocksToProcess = 10000;
const kMaxBlocksToProcess = 100000;
const kDefaultTargetNumberOfTransactions = 5000;

class UserController {

  constructor(web3, config) {
    this.config = config;
    this.web3 = web3;
  }

  getBalance(Request, Response) {
    this.web3.getBalanceInMusicoins(Request.params.address).then(res => {
      Response.send({
        success: true,
        balance: Number(res)
      });
    }).catch(Error => {
      Response.send(Error.message);
    })
  }

  renewMember(Request, Response) {
    const validation = Validator.validate(Request.body, UserSchema.renew);
    let $this = this;

    if (validation === true) {
      this.web3.getTransaction(Request.body.txReceipt).then(async res => {
        if (res && res.from === Request.body.publicKey && res.to == $this.config.contractOwnerAccount) {
          let web3 = this.web3.getWeb3();
          if ((web3.eth.blockNumber - res.blockNumber)) {
            Response.send({
              success: false,
              message: 'Block height greater then 1000'
            });
            return;
          }
          const amount = this.web3.convertWeiToMusicoins(res.value);
          let membershipLevel = 1;

          if (amount >= 1499.5 && amount <= 1500.5) {
            membershipLevel = 2
          } else if (amount >= 4999.5 && amount <= 5000.5) {
            membershipLevel = 3;
          }

          let user = await User.findOne({
            profileAddress: res.from
          });

          if (user) {
            let joinDate = new Date(user.joinDate);
            let now = new Date();
            let membershipDuration = parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
            if (membershipDuration > 356) {
              Response.send({
                success: false,
                message: 'The membership days count more than 356'
              });
              return;
            }
            if (user.membershipLevel !== membershipLevel) {
              user.membershipLevel = membershipLevel;
              user.save();
            }
            Response.send({
              success: true,
              days: parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)),
              membershipLevel: membershipLevel,
              name: user.draftProfile ? user.draftProfile.artistName : user.local.username,
              artistURL: 'https://musicoin.org/nav/artist/' + user.profileAddress
            })
          } else {
            Response.send({
              success: false,
              message: 'There are no such user founded',
              txInfo: res
            })
          }
        } else {
          Response.send({
            success: false
          })
        }
      }).catch(Error => {
        Response.send({
          error: Error.message
        })
      })
    } else {
      Response.status(400);
      Response.send({
        success: false,
        error: validation
      })
    }
  }

  async generateToken(Request, Response) {
    const user = await User.findById(mongoose.Types.ObjectId(Request.session.user.clientId));
    const ApiUserAccount = await ApiUser.findById(mongoose.Types.ObjectId(Request.session.user._id));
    const deletingToken = this.deletingTokenGenerate(80);
    Request.session.deletingToken = deletingToken;
    Request.store.set(Request.query.clientId, Request.session);
    Response.send({
      token: Request.session.deletingToken
    });

    console.log("SENT DELETING TOKEN", Request.session.deletingToken);
  }
  async deleteUserAccount(Request, Response) {
    const user = await User.findById(mongoose.Types.ObjectId(Request.session.user.clientId));
    const ApiUserAccount = await ApiUser.findById(mongoose.Types.ObjectId(Request.session.user._id));
    if (Request.session.deletable) {
      try {
        await user.remove();
        await ApiUserAccount.remove();
        Request.session.destroy();
        Response.send({
          success: true,
          message: 'Account was successfully deleted'
        });
      } catch (Error) {
        Response.status(400);
        Response.send({
          success: false,
          message: Error.message
        });
      }
    } else {
      Response.status(400);
      Response.send({
        success: false,
        message: 'Verify deletion with token before deletion'
      })
    }
  }

  verifyUserAccountDeleting(Request, Response) {
    let token = Request.params.token;
    console.log("CHKTHIS", Request.session);
    if (token === Request.session.deletingToken) {
      Request.session.deletable = true;
      Response.send({
        success: true
      });
    } else {
      Response.send({
        success: false,
        error: 'Wrong deletable token'
      });
    }
  }

  isMember(Request, Response) {

    try {
      User.findById(mongoose.Types.ObjectId(Request.query.clientId)).then(user => {
        if (user) {
          let joinDate = new Date(user.joinDate);
          let now = new Date();
          const daysRemaning = parseInt((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24), 10);
          Response.send({
            success: true,
            daysRemaning: daysRemaning,
            membershipLevel: user.membershipLevel
          });
        } else {
          Response.status(400);
          Response.send({
            success: false
          });
        }
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error
        });
      });
    } catch (Error) {
      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    }
  }

  getUserInfo(Request, Response) {
    User.findById(Request.query.clientId).then(async user => {
      if (!user) {
        Response.status(400);
        Response.send({
          success: false,
          error: 'There are no such user founded'
        });
        return;
      }

      let ResponseInstance = {
        createdBy: this.config.publishingAccount,
        artistName: user.draftProfile.artistName || '',
        contractVersion: this.config.contractVersion,
        imageUrl: user.draftProfile.ipfsImageUrl || '',
        followers: user.followerCount,
        socialUrl: '',
        tipCount: 0,
        balance: 0,
        forwardingAddress: this.config.forwardingAddress,
        descriptionUrl: '',
        prettyUrl: '',
        membershipLevel: user.membershipLevel
      };

      if (user.draftProfile.social) {
        ResponseInstance.socialUrl = user.draftProfile.social.socialUrl || '';
      }

      try {
        const tipCount = await Release.aggregate({
          $match: {
            artist: mongoose.Types.ObjectId(user._id)
          }
        }, {
          $group: {
            _id: mongoose.Types.ObjectId(user._id),
            total: {
              $sum: '$directTipCount'
            },
          }
        });
        if (tipCount.length > 0) {
          ResponseInstance.tipCount = tipCount[0].total;
        }
      } catch (Error) {
        Response.send(400, {
          success: false,
          error: Error.message
        });
      }

      const apiUser = await ApiUser.findOne({
        clientId: user._id
      });

      ResponseInstance.balance = apiUser.balance;
      Response.send(ResponseInstance);

    }).catch(Error => {

      Response.status(400);
      Response.send({
        success: false,
        error: Error.message
      });
    })
  }

  apiGetUsageStats(Request, Response) {
    Request.store.get(Request.query.clientId, function(Error, Session) {

      if (!Error && Session) {
        ApiUser.findOne({
          clientId: mongoose.Types.ObjectId(Session.user.clientId)
        }).populate('tie').then(async apiuser => {
          if (apiuser) {
            if (apiuser.tie !== undefined) {
              Response.send({
                tie: apiuser.tie.name,
                calls: Session.user.calls
              });
            } else {
              const Tie = await Package.findOne({
                name: 'Free'
              });
              Response.send({
                tie: Tie.name,
                calls: Session.user.calls
              });
            }
          }
        }).catch(Error => {
          Response.status(400);
          Response.send({
            success: false,
            error: Error.message
          })
        });
      } else {
        Response.send(Error)
      }
    })
  }

  deletingTokenGenerate(count) {
    let result = '';
    let words = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    let max_position = words.length - 1;
    for (let i = 0; i < count; ++i) {
      let position = Math.floor(Math.random() * max_position);
      result = result + words.substring(position, position + 1);
    }
    return result;
  }

  createPlaylist(Request, Response) {
    User.findOne({
      "local.email": Request.body.user.email,
    }).then(user => {
      if (user && bcrypt.compareSync(Request.body.user.password, user.local.password)) {
        Playlist.create({
          name: Request.body.name,
          user: {
            email: user.local.email,
            profileAddress: user.profileAddress,
            userId: user._id,
            name: user.local.username
          },
          songs: Request.body.songs
        }).then(playlist => {
          Response.send({
            success: true,
            playlistName: playlist.name,
            playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
            creatorName: playlist.user.name,
            creatorUrl: 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress
          })
        }).catch(Error => {
          Response.send({
            success: false,
            message: Error.message
          })
        })
      } else {
        Response.send({
          success: false
        });
      }
    });
  }

  getPlaylist(Request, Response) {
    Playlist.findOne({
      name: Request.params.name
    }).then(playlist => {
      Response.send({
        success: true,
        playlistName: playlist.name,
        playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
        creatorName: playlist.user.name,
        creatorUrl: playlist.user.profileAddress ? 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress : null,
        songs: playlist.songs
      });
    }).catch(Error => {
      Response.send({
        success: false,
        message: Error.message
      })
    })
  }

  deletePlaylist(Request, Response) {
    Playlist.findOne({
      name: Request.params.name
    }).populate('user.userId').then(playlist => {

      if (playlist) {
        if (playlist.user.userId.local.username === Request.body.username && bcrypt.compareSync(Request.body.password, playlist.user.userId.local.password)) {
          playlist.remove();
          Response.send({
            success: true,
            playlistName: playlist.name,
            playlistUrl: 'http://musicoin.org/playlist/' + playlist.name,
            creatorName: playlist.user.name,
            creatorUrl: 'http://musicoin.org/artist/nav/' + playlist.user.profileAddress
          });
        } else {
          Response.status(401);
          Response.send({
            success: false,
            message: 'Invalid credentials'
          });
        }
      } else {
        Response.send({
          success: false,
          message: 'Playlist does not found'
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
}

module.exports = UserController;
