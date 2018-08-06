const ApiUser = require('../../components/models/core/api-user');
const { Store } = require('express-session');

const mongoose = require('mongoose');

const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();

const AuthSchema = require('./../ValidatorSchemas/AuthSchema');

class AuthMiddleware {

    checkTokens(store) {
        return (Request, Response, next) => {

            const $this = this;
            store.get(Request.query.clientId, function (error, session) {

                /*
                *
                * Handle which watch in user current api calls count
                *
                * */

                if ( session ) {
                    //Response.send({success:true, error: session});

                    if(session.user.clientSecret === Request.query.clientSecret) {

                        if( session.user.calls > session.user.limitApiCalls ) {

                            Request.session.destroy();
                            Response.send({success:false, error: 'You have exceeded an API call limit'});

                        } else {

                            Request.session.user.calls++;


                            if( (session.user.calls%1) === 0 )
                            {

                                $this.updateApiCallcount(session.user.clientId, session.user.calls);
                            }

                            next();
                        }
                    } else {
                        Response.status(401);
                        Response.send({success: false, error: 'Wrong key pare'})
                    }

                } else {
                    let valid = Validator.validate(Request.query, AuthSchema.signin);

                    if (valid === true) {

                        let clientId = mongoose.Types.ObjectId(Request.query.clientId);

                        ApiUser.findOne({
                            clientId: clientId
                        }).then(user => {

                            if (user.clientSecret === Request.query.clientSecret) {
                                /*
                                *  if secret key are the same, then we start count API calls
                                * */


                                if(user.calls >= user.limitApiCalls ) {

                                    Request.session.destroy();
                                    Response.send({success:false, error: 'You have exceeded an API call limit'});
                                    console.log('session destroy');
                                } else {

                                    console.log('session created');
                                    Request.session.user = user;

                                    if (!Request.session.user.calls || Request.session.user.calls === 0) {
                                        Request.session.user.calls = 1;
                                    }

                                    Request.session.user.calls++;

                                    next();
                                }
                            } else {
                                Response.status(401);
                                Response.send({success: false, error: 'Wrong key pare'})
                            }

                        }).catch(Error => {
                            Response.status(400);
                            Response.send({success: false, error: Error});
                        });

                    } else {
                        Response.send({success: false, error: valid});
                    }
                }
            });
        }
    }

    updateApiCallcount(userClientId, calls) {

        console.log(userClientId,calls);
        let clientId = mongoose.Types.ObjectId(userClientId);

        ApiUser.findOne({
            clientId: clientId
        }).then(user => {

            user.update({
                calls: calls
            }).then( user => {
                console.log('User '+user.clientId+' calls modified');
            } );

        })

    }
}

module.exports = new AuthMiddleware();