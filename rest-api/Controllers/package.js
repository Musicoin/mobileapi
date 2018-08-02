const express = require('express');
const router = express.Router();

const ApiPackage = require('../../components/models/api-package');

const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();

/*
*   VALIDATION SCHEMAS
*/
const PackageSchema = require('../ValidatorSchemas/PackageSchema');

router.post('/create', function(Request, Response) {

    const body = {
      name: Request.body.name,
      limitApiCalls: Number(Request.body.limitApiCalls)
    };

    let validate = Validator.validate(body, PackageSchema.create);

    if(validate === true) {

        ApiPackage.create({
            name: Request.body.name,
            limitApiCalls: Request.body.limitApiCalls
        }).then( Package => {

            Response.send({success:true, data: Package})

        }).catch( Error => {
            Response.status(400);
            Response.send({success: false, error: Error})
        })

    } else {
        Response.send(validate);
    }
});

router.get('/list', function(Request, Response) {



        ApiPackage.find().then( Packages => {

            Response.send({success:true, data: Packages})

        }).catch( Error => {
            Response.status(400);
            Response.send({success: false, error: Error})
        })

});

module.exports = router;