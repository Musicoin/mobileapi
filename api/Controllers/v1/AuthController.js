const User = require('../../../db/core/user');
const ApiUser = require('../../../db/core/api-user');

const AuthSchema = require('../../ValidatorSchema/AuthSchema');

const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const TIMEOUT = require('../../constant').TIMEOUT;

/**
 * generate token
 * @param count 
 */
function randomTokenGenerate(count) {
  return crypto.randomBytes(count).toString('hex');
}

/**
 * response error
 * @param Response 
 */
function responseError(Response, error) {
  Response.status(500).json({
    error: error.message
  })
}

/**
 * register a user
 * @param email
 * @param username
 * @param password
 */
async function registerNewUser(Request, Response) {
  const body = Request.body;
  try {

    // encrypt password
    body.password = bcrypt.hashSync(body.password);
    // vlidate request params
    const validResult = Validator.validate(body, AuthSchema.signup);
    if (validResult !== true) {
      return Response.status(400).json(validResult);
    }
    // generate client secret
    const clientSecret = randomTokenGenerate(30);
    // create user and api-user
    const _user = new User({
      local: body
    });
    const _apiUser = new ApiUser({
      email: body.email,
      clientSecret: clientSecret
    });
    // insert to db
    await _user.save();
    await _apiUser.save();
    // response success
    Response.status(200).json({
      success: true,
      clientSecret: clientSecret
    })

  } catch (error) {

    responseError(Response, error);

  }
}

/**
 * authenticate user
 * @param email
 * @param password
 */
async function authenticateUser(Request, Response) {

  try {
    // validate request params
    const validResult = Validator.validate(Request.body, AuthSchema.login);
    if (validResult !== true) {
      return Response.status(400).json(validResult);
    }

    const user = await User.findOne({
      "local.email": Request.body.email,
    }).exec();

    if (user && bcrypt.compareSync(Request.body.password, user.local.password)) {
      Response.status(200).json({
        success: true
      })
    } else {
      Response.status(200).json({
        success: false
      })
    }
  } catch (error) {
    responseError(Response, error);
  }

}

/**
 * get client secret
 * @param {*} email 
 * @param {*} password 
 */
async function getClientSecret(Request, Response) {

  try {
    // validate request params
    const validResult = Validator.validate(Request.body, AuthSchema.login);
    if (validResult !== true) {
      return Response.status(400).json(validResult);
    }
    // find user
    const user = await User.findOne({
      "local.email": Request.body.email
    }).exec();
    if (!user && !bcrypt.compareSync(Request.body.password, user.local.password)) {
      return Response.status(401).json({
        error: 'Invalid Credentials'
      });
    }
    // find api user
    const apiUser = await ApiUser.findOne({
      email: Request.body.email
    }).exec();

    if (!apiUser) {
      return Response.status(401).json({
        error: 'Api User Account not found'
      });
    }

    Response.status(200).json({
      success: true,
      clientSecret: apiUser.clientSecret
    });
  } catch (error) {
    responseError(Response, error);
  }
}

/**
 * get access token 
 * @param {*} email 
 * @param {*} clientSecret 
 */
async function getAccessToken(Request, Response) {

  try {
    // validate request params
    const validResult = Validator.validate(Request.body, AuthSchema.signin);
    if (validResult !== true) {
      return Response.status(400).json(validResult);
    }
    // find user
    const user = await User.findOne({
      "local.email": Request.body.email
    }).exec();
    if (!user) return Response.status(400).json({
      error: "user not found"
    });
    // find api user
    const apiUser = await ApiUser.findOne({
      email: Request.body.email
    }).exec();
    if (!apiUser || apiUser.clientSecret !== Request.body.clientSecret) {
      return Response.status(400).json({
        error: "Client Secrets dont match"
      });
    }
    // generate access token
    const accessToken = randomTokenGenerate(40);
    apiUser.timeout = Date.now();
    apiUser.accessToken = accessToken;
    // update api user
    await apiUser.save();
    Response.status(200).json({
      success: true,
      accessToken: accessToken
    });
  } catch (error) {
    responseError(Response, error);
  }
}

/**
 * validate token timeout
 * @param {*} email 
 * @param {*} accessToken 
 */
async function getTokenValidity(Request, Response) {

  try {
    // validate request params
    const validResult = Validator.validate(Request.body, AuthSchema.AccessToken);
    if (validResult !== true) {
      return Response.status(400).json(validResult);
    }
    // find api user
    const user = await ApiUser.findOne({
      email: Request.body.email
    }).exec();
    if (!user) {
      return Response.status(400).json({
        error: "user not found"
      });
    }

    if (user.accessToken !== Request.body.accessToken) {
      return Response.status(400).json({
        error: "Invalid Access Token"
      });
    }
    const now = Date.now();
    const timeElapsed = TIMEOUT+user.timeout-now;
    if(timeElapsed<0){
      return Response.status(403).json({
        error: 'Access Token timed out'
      });
    }

    Response.status(200).json({
      success: true,
      expried: timeElapsed
    })

  } catch (error) {
    responseError(Response, error);
  }
}


module.exports = {
  registerNewUser,
  authenticateUser,
  getClientSecret,
  getAccessToken,
  getTokenValidity
}