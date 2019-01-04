const BaseController = require('../base/BaseController');
// db model
const User = require('../../../db/core/user');
const ApiUser = require('../../../db/core/api-user');
// data schema
const AuthSchema = require('../../ValidatorSchema/AuthSchema');
// util
const cryptoUtil = require('../../../utils/crypto-util');

class AuthController extends BaseController {
  constructor(props) {
    super(props);
    this.TAG = "AuthController";

    this.registerNewUser = this.registerNewUser.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getClientSecret = this.getClientSecret.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.getTokenValidity = this.getTokenValidity.bind(this);
  }

  /**
   * body params: 
   * email
   * password
   * username 
   */
  async registerNewUser(Request, Response) {
    const body = Request.body;
    try {
      // vlidate request params
      const validResult = this.validate(body, AuthSchema.signup);
      if (validResult !== true) {
        return this.reject(Response, validResult[0].message);
      }
      // encrypt password
      body.password = cryptoUtil.hashPassword(body.password);

      // generate client secret
      const clientSecret = cryptoUtil.generateToken(this.constant.SECRET_LENGTH);
      // create user
      const _user = new User({
        local: body
      });
      // create api user
      const _apiUser = new ApiUser({
        email: body.email,
        clientSecret: clientSecret
      });
      // insert to db
      await _user.save();
      await _apiUser.save();
      // response success
      this.success(Response, {
        success: true,
        clientSecret: clientSecret
      });

    } catch (error) {
      console.log(error);
      this.error(Response, error.message);
    }
  }

  /**
   * body params: 
   * email
   * password
   */
  async authenticateUser(Request, Response) {
    const body = Request.body;
    try {
      // validate request params
      const validResult = this.validate(body, AuthSchema.login);
      if (validResult !== true) {
        return this.reject(Response, validResult[0].message);
      }

      const user = await User.findOne({
        "local.email": body.email,
      }).exec();

      if (user && cryptoUtil.comparePassword(body.password, user.local.password)) {
        this.success(Response, {
          success: true
        })
      } else {
        this.reject(Response, "email and password dont match");
      }
    } catch (error) {
      this.error(Response, error.message);
    }
  }

  /**
   * body params: 
   * email
   * password
   */
  async getClientSecret(Request, Response) {
    const body = Request.body;
    try {
      // validate request params
      const validResult = this.validate(body, AuthSchema.login);
      if (validResult !== true) {
        return this.reject(Response, validResult[0].message);
      }
      // find user
      const user = await User.findOne({
        "local.email": body.email
      }).exec();
      if (!user || !cryptoUtil.comparePassword(body.password, user.local.password)) {
        return this.reject(Response, "email and password dont match");
      }
      // find api user
      const apiUser = await ApiUser.findOne({
        email: body.email
      }).exec();

      if (!apiUser) {
        return this.reject(Response, "API user not found");
      }

      this.success(Response, {
        success: true,
        clientSecret: apiUser.clientSecret
      });
    } catch (error) {
      this.error(Response, error.message);
    }
  }

  /**
   * body params:
   * eamil
   * clientSecret
   */
  async refreshAccessToken(Request, Response) {
    const body = Request.body;
    try {
      // validate request params
      const validResult = this.validate(body, AuthSchema.signin);
      if (validResult !== true) {
        return this.reject(Response, validResult[0].message);
      }
      // find user
      const user = await User.findOne({
        "local.email": body.email
      }).exec();
      if (!user) return this.reject(Response, "account not found: " + body.email);
      // find api user
      const apiUser = await ApiUser.findOne({
        email: body.email
      }).exec();
      if (!apiUser || apiUser.clientSecret !== body.clientSecret) {
        return this.reject(Response, "Client Secrets dont match");
      }
      // generate access token
      const accessToken = cryptoUtil.generateToken(this.constant.TOKEN_LENGTH);
      apiUser.timeout = Date.now();
      apiUser.accessToken = accessToken;
      // update api user
      await apiUser.save();
      this.success(Response, {
        success: true,
        accessToken: accessToken
      })
    } catch (error) {
      this.error(Response, error.message);
    }
  }

  async getTokenValidity(Request, Response) {
    const body = Request.body;
    try {
      // validate request params
      const validResult = this.validate(body, AuthSchema.AccessToken);
      if (validResult !== true) {
        return this.reject(Response, validResult[0].message);
      }
      // find api user
      const user = await ApiUser.findOne({
        email: body.email
      }).exec();
      if (!user) {
        return this.reject("user not found");
      }

      if (user.accessToken !== Request.body.accessToken) {
        return this.reject(Response, "Invalid Access Token");
      }
      const now = Date.now();
      const timeElapsed = this.constant.TOKEN_TIMEOUT + user.timeout - now;
      if (timeElapsed < 0) {
        return this.reject(Response, "Access Token time out");
      }

      this.success(Response, {
        success: true,
        expried: timeElapsed
      });

    } catch (error) {
      this.error(Response, error.message);
    }
  }
}



module.exports = AuthController;