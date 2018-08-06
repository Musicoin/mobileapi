const express = require('express');
const router = express.Router();


const User = require('../../components/models/core/user');
const ApiUser = require('../../components/models/core/api-user');


const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();

/*
*   VALIDATION SCHEMAS
*/
const AuthSchema = require('../ValidatorSchemas/AuthSchema');

router.post('/signup', function(req, res) {


    let errors = Validator.validate(req.body, AuthSchema.signup);

    if(errors === true) {

        User.create({local:req.body}).then( user => {

            ApiUser.create({
               clientId: user._id,
               clientSecret: clientSecretGenerate(30)
            }).then( ApiUser => {
                res.send({
                    user: user,
                    apiUser: ApiUser
                });
            }).catch( Error => {
                res.status(400);
                res.send({success: false, error: Error})
            });
        }).catch( Error => {
            res.status(400);
            res.send({success: false, error: Error})
        });


    } else {
        res.send(errors);
    }
});


function clientSecretGenerate(count) {
    var result       = '';
    var words        = '0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    var max_position = words.length - 1;
    for( i = 0; i < count; ++i ) {
        position = Math.floor ( Math.random() * max_position );
        result = result + words.substring(position, position + 1);
    }
    return result;
}

module.exports = router;