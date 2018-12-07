const User = require('../../db/core/user');
const ApiUser = require('../../db/core/api-user');

const AuthSchema = require('../ValidatorSchema/AuthSchema');

const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const TIMEOUT = require('../constant').timeout;

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
function responseError(Response) {
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

    responseError(Response);

  }
}

async function authenticateUser(Request, Response) {

try {
  // validate request params
  const validResult = Validator.validate(Request.body, AuthSchema.login);
  if (validResult !== true) {
    return Response.status(400).json(validResult);
  }
  User.findOne({
    "local.email": Request.body.email,
  }).then(user => {
    if (user && bcrypt.compareSync(Request.body.password, user.local.password)) {
      Response.send({
        success: true
      })
    } else {
      Response.send({
        success: false
      });
    }
  });
} catch (error) {
  
}
  
  
}

class AuthController {



  

  getAPICredentials(Request, Response) {
    let Errors = Validator.validate(Request.body, AuthSchema.login);
    if (Errors === true) {
      User.findOne({
        "local.email": Request.body.email,
      }).then(user => {
        if (user && bcrypt.compareSync(Request.body.password, user.local.password)) {
          ApiUser.findOne({
            email: Request.body.email
          }).then(apiUser => {
            if (apiUser) {
              Response.send({
                success: true,
                clientSecret: apiUser.clientSecret
              });
            } else {
              Response.send({
                success: false,
                error: 'Api User Account not found'
              });
            }
          })
        } else {
          Response.send(401);
          Response.send({
            success: false,
            error: 'Invalid Credentials'
          });
        }
      });
    } else {
      Response.send(Errors);
    }
  }

  randomTokenGenerate(count) {
    return crypto.randomBytes(count).toString('hex');
  }

  async genTokenTest(Request, Response) {
    User.findOne({
      "local.email": Request.body.email,
    }).then(user => {
      ApiUser.findOne({
        email: Request.body.email
      }).then(user1 => {
        if (user1.clientSecret == Request.body.clientSecret) {
          const accessToken = this.randomTokenGenerate(40);
          user1.timeout = Date.now();
          user1.accessToken = accessToken; // save it here TODO
          console.log("USER1", user1);
          user1.save(function (err, dummy) {
            if (err) {
              console.log(err);
              Response.send({
                success: false,
                error: 'Client Secrets dont match'
              });
            } else {
              Response.send({
                success: true,
                accessToken: accessToken
              });
            }
          });
        } else {
          Response.send({
            success: false,
            error: 'Client Secrets dont match'
          });
        }
      }).catch(Error => {
        Response.send({
          success: false,
          error: Error
        });
      });
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error
      });
    });
  }

  async getTokenValidity(Request, Response) {
    ApiUser.findOne({
      email: Request.body.email
    }).then(user1 => {
      if (user1.accessToken == Request.body.accessToken) {
        if (Date.now() - user1.timeout > TIMEOUT) {
          // error out
          Response.send({
            success: false,
            error: 'Access Token timed out'
          });
        } else {
          var timeElapsed = (Date.now() - user1.timeout) / 1000; // ms to s
          Response.send({
            timeout: timeElapsed
          });
        }
      } else {
        console.log(user1.accessToken, Request.body.accessToken);
        Response.send({
          success: false,
          error: 'Invalid Access Token'
        });
      }
    }).catch(Error => {
      Response.send({
        success: false,
        error: Error
      });
    });
  }

}

module.exports = new AuthController();