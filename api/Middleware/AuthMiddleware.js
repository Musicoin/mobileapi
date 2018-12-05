const ApiUser = require('../../db/core/api-user');
const mongoose = require('mongoose');
const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const AuthSchema = require('../ValidatorSchema/AuthSchema');
const TIMEOUT = require('../constant').timeout;

class AuthMiddleware {

  checkTimeouts() {
    console.log("STUCK IN CHECK TIMEOUTS")
    return (Request, Response, next) => {
      ApiUser.findOne({
        email: Request.query.email
      }).then(user1 => {
        console.log("Found user1 in checktimeouts", user1)
        if (user1 === null || user1.accessToken != Request.query.accessToken) {
          // error out
          console.log("Invalid Credentials")
          Response.send({
            status: "error",
            message: 'Invalid Credentials'
          });
        } else if (Date.now() - user1.timeout > TIMEOUT) {
          // error out
          console.log("Access Token Expired")
          Response.send({
            status: "error",
            message: 'Access Token Expired'
          });
        } else {
          this.updateApiCallcount(Request.query.email, user1.calls + 1);
          next();
        }
      }).catch(Error => {
        // error out
        console.log("Errored out in checktimeouts")
        Response.send({
          status: "error",
          message: Error.message
        });
      });
    }
  }

  updateApiCallcount(email, calls) {
    ApiUser.findOne({
      email: email
    }).then(user => {
      user.update({
        calls: calls,
        timeout: Date.now()
      }).then(user => {
        console.log('User ' + email + 'now has made ' + calls + ' calls');
      });
    })
  }
}

module.exports = new AuthMiddleware();