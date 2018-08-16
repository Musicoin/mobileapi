/**
*
*   MODELS
*
* */

const User = require('../../../components/models/core/user');
const ApiUser = require('../../../components/models/core/api-user');


/**
*   VALIDATION SCHEMAS
*/
const AuthSchema = require('../ValidatorSchemas/AuthSchema');
/**
*  LIBS
*
* */
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const bcrypt = require('bcrypt-nodejs');
/**
*  AUTH CONTROLLER
*
*  Controls users functional on authentication and authorization
*
*
* */
class AuthController {

    /**
    *
    *
    * @return Object()
    *
    *          success: Boolean
    *          publicKey: String
    *
    * */

    registerNewUser(req, res) {

        const $this = this;
        let body = req.body;

        body.password = bcrypt.hashSync(body.password);

        let errors = Validator.validate(body, AuthSchema.signup);

        if(errors === true) {

            User.create({local:body}).then( user => {

                ApiUser.create({
                    clientId: user._id,
                    clientSecret: $this.clientSecretGenerate(30)
                }).then( ApiUser => {
                    res.send({success: true, publicKey: ApiUser.clientId});
                }).catch( Error => {
                    res.status(400);
                    res.send({success: false, error: Error})
                });
            }).catch( Error => {
                res.status(400);
                res.send({success: false, error: Error});
            });


        } else {
            res.send(errors);
        }
    }


    getAPICredentials(Request, Response) {


        let Errors = Validator.validate(Request.body, AuthSchema.login);

        if(Errors === true) {
            User.findOne({
                "local.email": Request.body.email,
            }).then( user => {

                if(user && bcrypt.compareSync(Request.body.password, user.local.password)) {

                    ApiUser.findOne({
                        clientId: user._id
                    }).then( apiUser => {
                        if(apiUser) {
                            Response.send({success: true, apiuser: apiUser});
                        } else {
                            Response.send({success: false, error: 'Api user account does not found'});
                        }
                    })

                } else {
                    Response.send(401);
                    Response.send({success: false, error: 'Unauthorized'});
                }

            });
        } else {
            Response.send(Errors);
        }


    }

    /**
    *
    * @get
    *
    * count -> Number - length of generated key
    *
    * @return
    *
    * result -> String - random clientSecretKey
    *
    * */
    clientSecretGenerate(count) {
        let result       = '';
        let words        = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
        let max_position = words.length - 1;

        for( let i = 0; i < count; ++i ) {
            let position = Math.floor ( Math.random() * max_position );
            result = result + words.substring(position, position + 1);
        }

        return result;
    }
}

module.exports = new AuthController();