const User = require('./../../../components/models/core/user');
const MainUser = require('./../../../components/models/main/user');
const ApiUser = require('./../../../components/models/core/api-user');
const Release = require('./../../../components/models/core/release');

const Package = require('./../../../components/models/core/api-package');

const mongoose = require('mongoose');

class UserController {

    constructor(config) {
        this.config = config;
    }

    async deleteUserAccount(Request, Response) {



        const user = await User.findById(mongoose.Types.ObjectId(Request.session.user.clientId));
        const ApiUserAccount = await ApiUser.findById(mongoose.Types.ObjectId(Request.session.user._id));
        if(Request.method === 'POST') {
            const deletingToken = this.deletingTokenGenerate(80);
            Request.session.deletingToken = deletingToken;
            Request.store.set(Request.query.clientId, Request.session);

            Response.mailer.send('deleting', {
                domain: process.env.DOMAIN,
                to: user.local.email,
                deletingToken: deletingToken,
                subject: 'Test Email',
                clientId: Request.session.user.clientId,
                clientSecret: Request.session.user.clientSecret
            }, function (Error) {

                if (Error) {
                    Response.status(400);
                    Response.send({success: false, error: Error});
                    return;
                }

            });

            Response.send({token: Request.session.deletingToken});

        } else if(Request.method === 'DELETE') {

            if(Request.session.deletable) {
                try {
                    await user.remove();
                    await ApiUserAccount.remove();
                    Request.session.destroy();
                    Response.send({success: true, message: 'User account was successfully deleted'});
                } catch(Error) {
                    Response.status(400);
                    Response.send({success: false, message: Error.message});
                }

            } else {
                Response.status(400);
                Response.send({success:false, message: 'Deleting in not verified'})
            }
        }
    }


    verifyUserAccountDeleting(Request, Response) {
        let token = Request.params.token;
        if(token === Request.session.deletingToken) {

            Request.session.deletable = true;
            Response.send({success: true});
        } else {
            Response.send({success: true, error: 'Wrong deletable token'});
        }
    }

    isMember(Request, Response) {

        try {
            User.findById(mongoose.Types.ObjectId(Request.query.clientId)).then( user => {

                if(user) {
                    let joinDate = new Date(user.joinDate);
                    let now = new Date();
                    const daysRemaning = parseInt((now.getTime() - joinDate.getTime()) / (1000*60*60*24), 10);
                    Response.send({success:true, daysRemaning:daysRemaning, membershipLevel: user.membershipLevel});
                } else {
                    Response.status(400);
                    Response.send({success:false});
                }

            }).catch( Error => {
                Response.status(400);
                Response.send({success:false, error: Error});
            });
        } catch(Error) {
            Response.status(400);
            Response.send({success:false, error: Error.message});
        }

    }

    getUserInfo(Request, Response) {

        User.findById(Request.query.clientId).then( async user => {
            if (!user) {
                Response.status(400);
                Response.send({success: false, error: 'There are no such user founded'});

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
                const tipCount = await Release.aggregate(
                    {
                        $match: {
                            artist: mongoose.Types.ObjectId(user._id)
                        }
                    },
                    {
                        $group: {
                            _id: mongoose.Types.ObjectId(user._id),
                            total: {$sum: '$directTipCount'},
                        }
                    });

                if (tipCount.length > 0) {
                    ResponseInstance.tipCount = tipCount[0].total;
                }

            } catch (Error) {
                Response.send(400, {success: false, error: Error.message});
            }

            const apiUser = await ApiUser.findOne({
                clientId: user._id
            });

            ResponseInstance.balance = apiUser.balance;

            Response.send(ResponseInstance);

        }).catch(Error => {

            Response.status(400);
            Response.send({success: false, error: Error.message});

        })
    }

    apiGetUsageStats(Request, Response) {
        Request.store.get(Request.query.clientId, function(Error, Session) {

            if(!Error && Session) {

                ApiUser.findOne({
                    clientId: mongoose.Types.ObjectId(Session.user.clientId)
                }).populate('tie').then( async apiuser => {
                    if(apiuser) {
                        if(apiuser.tie !== undefined) {
                            Response.send({
                                tie:apiuser.tie.name,
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
                }).catch( Error => {
                    Response.status(400);
                    Response.send({success: false, error: Error.message})
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
}
module.exports =  UserController;