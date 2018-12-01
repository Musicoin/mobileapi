const ApiUser = require('../../db/core/api-user');
const mongoose = require('mongoose');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const AuthSchema = require('../ValidatorSchema/AuthSchema');

class AuthMiddleware {

  checkTimeouts() {
    console.log("STUCK IN CHECK TIMEOUTS")
    return (Request, Response, next) => {
      ApiUser.findOne({
        email: Request.query.email
      }).then(user1 => {
        console.log("Found user1 in checktimeouts", user1)
        if (user1.accessToken != Request.query.accessToken) {
          // error out
          console.log("Client Secrets don't match", user1.clientSecret, Request.query.clientSecret)
          Response.send({
            success: false,
            error: 'Invalid Credentials'
          });
        } else if (Date.now() - user1.timeout > 3600 * 1000) {
          // error out
          console.log("Didn't find user1 in checktimeouts")
          Response.send({
            success: false,
            error: 'Access Token Expired'
          });
        } else {
          this.updateApiCallcount(Request.query.email, user1.calls + 1);
          next();
        }
      }).catch(Error => {
        // error out
        console.log("Errored out in checktimeouts")
        Response.send({
          success: false,
          error: Error
        });
      });
    }
  }

  updateApiCallcount(email, calls) {
    ApiUser.findOne({
      email: email
    }).then(user => {
      user.update({
        calls: calls
      }).then(user => {
        console.log('User ' + email + 'now has made ' + calls + ' calls');
      });
    })
  }
}

module.exports = new AuthMiddleware();
