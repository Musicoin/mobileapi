const mongoose = require('mongoose');
const LicenseKey = require('../../../components/models/core/key');
const Release = require('./../../../components/models/core/release');
const ReleaseStats = require('./../../../components/models/core/release-stat');
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
       this.artistModule.getNewArtists(getLimit(Request)).then( artists => {

           if( artists.length === 0) {
               Response.send({success: false, message: 'Nothing founded'});
               return;
           }
           let ResponseInstance = [];

           for(let artist of artists) {
               ResponseInstance.push({
                   name: artist.draftProfile.artistName,
                   joinDate: artist.joinDate,
                   profileLink: 'https://musicoin.org/nav/artist/'+artist.profileAddress
               })
           }

           Response.send({
               success: true,
               data: ResponseInstance
           });
       }).catch(Error => {
           Response.status(400);
           Response.send({success: false, error: Error.message});
       });
    }

    getFeaturedArtists(Request) {
       this.artistModule.getFeaturedArtists(getLimit(Request)).then(res => {
           Response.send(res);
       }).catch(Error => {
           Response.status(400);
           Response.send({success: false, error: Error.message});
       });
    }

    find(Request) {
       this.artistModule.findArtists(getLimit(Request), Request.query.term).then(res => {
           Response.send(res);
       }).catch(Error => {
           Response.status(400);
           Response.send({success: false, error: Error.message});
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
                return  this.artistModule.releaseProfile(releaseRequest)
            }).then(function(tx) {
                Response.send( {tx: tx} );
            }).catch(Error => {
                Response.status(400);
                Response.send({success: false, error: Error.message});
            });
    }

    send(Request) {
      this.artistModule.sendFromProfile(Request.body.profileAddress, Request.body.recipientAddress, Request.body.musicoins)
        .then(function(tx) {
            Response.send({tx: tx});
        }).catch(Error => {
          Response.status(400);
          Response.send({success: false, error: Error.message});
        });
    }

    ppp(Request, Response) {

       const context = {};
       this.artistModule.pppFromProfile(Request.body.profileAddress, Request.body.licenseAddress,  this.hotWalletCredentialsProvider).then(res => {
           Response.send(res);
       }).catch(Error => {
           Response.status(400);
           Response.send({success: false, error: Error.message});
       });


        return LicenseKey.findOne({licenseAddress: Request.body.licenseAddress}).exec()
            .then(record => {
                if (!record) throw new Error("Key not found for license: " + Request.body.licenseAddress);
                context.key = record.key;

            })
            .then(transactions => {
                context.transactions = transactions;
                Response.send(context);
            }).catch(Error => {
                Response.status(400);
                Response.send({success: false, error: Error.message});
            });
    }

    getArtistInfo(Request, Response) {
        Release.find({
            artistAddress: Request.params.publicKey
        }).then( async releases => {
            let ResponseInstance = {
              totalTips: 0,
              totalFollowers: 0,
              totalReleases: 0,
              totalPlays: 0
            };

            for(let release of releases) {
                  let stats = await ReleaseStats.aggregate(
                    {
                        $match: {
                            release: mongoose.Types.ObjectId(release._id)
                        },
                    },{
                        $group: {
                            _id: null,
                            tipCount: {$sum:'$tipCount'},
                            playCount: {$sum:'$playCount'},
                        }

                    });

                if(stats.length > 0) {
                    ResponseInstance.totalPlays += stats[0].playCount;
                    ResponseInstance.totalTips += stats[0].tipCount;
                } else {
                    ResponseInstance.totalPlays += release.directPlayCount ? release.directPlayCount : 0;
                    ResponseInstance.totalTips += release.directTipCount ? release.directTipCount : 0;
                }
            }

            ResponseInstance.totalReleases = releases.length;

            const artist = await User.find({
                profileAddress: Request.params.publicKey
            });
            ResponseInstance.totalFollowers = artist.followerCount;
            Response.send(ResponseInstance);
        }).catch( Error => {
            Response.status(400);
            Response.send({success: false, error: Error.message})
        });
    }

    async getArtistPlays(Request, Response) {

        try{
            Release.find({
                artistAddress: Request.params.publicKey
            }).then( async releases => {

                let playsCount = 0;

                for(let release of releases) {
                    let stats = await ReleaseStats.aggregate(
                        {
                            $match: {
                                release: mongoose.Types.ObjectId(release._id)
                            },
                        },{
                            $group: {
                                _id: null,
                                tipCount: {$sum:'$tipCount'},
                                playCount: {$sum:'$playCount'},
                            }

                        });
                    if(stats.length > 0) {
                        playsCount += stats[0].playCount;

                    } else {
                        playsCount += release.directPlayCount ? release.directPlayCount : 0;
                    }
                }

                Response.send({success:true, playsCount: playsCount});

            });
        } catch (Error) {
            Response.status(400);
            Response.send({success: false, error: Error.message});
        }
    }

    async getArtistTips(Request, Response) {
        try {
            Release.find({
                artistAddress: Request.params.publicKey
            }).then( async releases => {

                let tipCount = 0;

                for(let release of releases) {
                    let stats = await ReleaseStats.aggregate(
                        {
                            $match: {
                                release: mongoose.Types.ObjectId(release._id)
                            },
                        },{
                            $group: {
                                _id: null,
                                tipCount: {$sum:'$tipCount'},
                                playCount: {$sum:'$playCount'},
                            }

                        });
                    if(stats.length > 0) {
                        tipCount += stats[0].tipCount;

                    } else {
                        tipCount += release.directTipCount ? release.directTipCount : 0;
                    }
                }

                Response.send({success:true, tipCount: tipCount});
            });
        } catch(Error) {
            Response.status(400);
            Response.send({success: false, error: Error.message});
        }
    }

    async isArtist(Request, Response) {
        User.findOne({ profileAddress: { $exists: true, $ne: null } })
            .where({ mostRecentReleaseDate: { $exists: true, $ne: null } })
            .where({ profileAddress: Request.params.publicKey})
            .exec()
            .then(user => {
                if(user) {
                    Response.send({success: true});
                } else {
                    Response.send({success: false});
                }
            }).catch(Error => {
                Response.status(400);
                Response.send({success: false, error: Error.message});
            });
    }

    async isArtistVerified(Request, Response) {
        User.findOne({
            profileAddress: Request.params.publicKey
        }).then(user => {
            if(user) {
                Response.send({success:true, verified: user.verified || false});
            } else {
                Response.send({success:false, message:'This user does not exist'});
            }
        }).catch( Error => {
            Response.status(400);
            Response.send({success: false, error: Error.message});
        })
    }

    async getArtistEarnings(Request, Response) {


            Release.find({
                artistAddress: Request.params.publicKey
            }).then( async releases => {

                let tipCount = 0;
                let playCount = 0;
                for(let release of releases) {
                    let stats = await ReleaseStats.aggregate(
                        {
                            $match: {
                                release: mongoose.Types.ObjectId(release._id)
                            },
                        },{
                            $group: {
                                _id: null,
                                tipCount: {$sum:'$tipCount'},
                                playCount: {$sum:'$playCount'},
                            }

                        });
                    if(stats.length > 0) {
                        tipCount += stats[0].tipCount;
                        playCount += stats[0].playCount;
                    } else{
                        tipCount += release.directTipCount ? release.directTipCount : 0;
                        playCount += release.directPlayCount ? release.directPlayCount : 0;
                    }

                }

                Response.send({
                    success:true,
                    tipCount: tipCount,
                    playCount: playCount,
                    earned: (tipCount + playCount)
                });
            }).catch( Error => {
                Response.status(400);
                Response.send({success: false, error: Error.message});
            });

    }

    getArtistOfWeek(Request, Response) {

        User.find({
                AOWBadge: true,
                profileAddress: { $exists: true, $ne: null }
            })
            .where({ mostRecentReleaseDate: { $exists: true, $ne: null } })
            .exec()
            .then(users => {
            let UsersInstance = [];

            for(let user of users) {
                UsersInstance.push({
                    artistName: user.draftProfile.artistName,
                    artistAddress: "http://musicoin.org/nav/artist/"+user.profileAddress
                })
            }

            Response.send({success: true, data: UsersInstance});

        }).catch( Error => {
            Response.send({success: false, error: Error.message});
        })
    }
}




module.exports = ArtistController;
