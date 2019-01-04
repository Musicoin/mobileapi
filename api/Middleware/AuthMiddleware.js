const ApiUser = require('../../db/core/api-user');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const AuthSchema = require('../ValidatorSchema/AuthSchema');
const TIMEOUT = require('../constant').timeout;

class AuthMiddleware {


  constructor(){
    this.authenticate = this.authenticate.bind(this);
  }

  async authenticate(Request, Response, next){

    try {
      const params = Request.query;
    const email = params.email;
    const accessToken = params.accessToken;

    const validateResult = Validator.validate(params, AuthSchema.tokenValidity);

    if (validateResult !== true) {
      return Response.status(400).json({
        error: validateResult[0].message
      })
    }

    const apiUser = await ApiUser.findOne({
      email: email
    }).exec();

    if (apiUser && apiUser.accessToken === accessToken) {
      await apiUser.update({
        calls: apiUser.calls + 1,
        timeout: Date.now()
      });
      next();
    } else if (Date.now() - apiUser.timeout > TIMEOUT) {
      Response.status(401).json({
        error: 'Access Token Expired'
      });
    } else {
      Response.status(401).json({
        error: 'Invalid Credentials'
      });
    }
    } catch (error) {
      console.log("Authenticate error: ",error)
      Response.status(500).json({
        error: error.message
      });
    }
  }
}

module.exports = new AuthMiddleware();
