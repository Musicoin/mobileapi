const BaseController = require('../base/BaseController');
const AuthDelegator = require('../../Delegator/AuthDelegator');

// util
const cryptoUtil = require('../../../utils/crypto-util');

class AuthController extends BaseController {
  constructor(props) {
    super(props);
    this.TAG = "AuthController";

    this.AuthDelegator = new AuthDelegator();

    this.registerNewUser = this.registerNewUser.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.getClientSecret = this.getClientSecret.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.getTokenValidity = this.getTokenValidity.bind(this);
    this.quickLogin = this.quickLogin.bind(this);
  }

  /**
   * body params: 
   * email
   * password 
   */
  async quickLogin(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const password = body.password;
    try {
      // vlidate request params
      const validResult = this.validate(body, this.schema.AuthSchema.quickLogin);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }

      let apiUser = await this.AuthDelegator._loadApiUser(email);
      const user = await this.AuthDelegator._loadUserByEmail(email);

      // create a new user if not found
      if (user) {
        // verify password
        if (!cryptoUtil.comparePassword(password, user.local.password)) {
          return this.reject(Request, Response, "email and password dont match");
        }
      } else {
        // create new user
        await this.AuthDelegator._createUser(email,password);
      }

      // carete a new api user if not found
      if (!apiUser) {
        apiUser = await this.AuthDelegator._createApiUser(email);
      }
      // response clientSecret and accessToken
      const data = {
        clientSecret: apiUser.clientSecret,
        accessToken: apiUser.accessToken
      }

      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params: 
   * email
   * password
   * username 
   */
  async registerNewUser(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const password = body.password;
    const username = body.username;
    try {
      // vlidate request params
      const validResult = this.validate(body, this.schema.AuthSchema.signup);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }
      
      // create user
      await this.AuthDelegator._createUser(email,password,username);
      // create api user
      const apiUser = await this.AuthDelegator._createApiUser(email);
      // response success
      const data = {
        clientSecret: apiUser.clientSecret,
        accessToken: apiUser.accessToken
      }
      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params: 
   * email
   * password
   */
  async authenticateUser(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const password = body.password;
    try {
      // validate request params
      const validResult = this.validate(body, this.schema.AuthSchema.authenticate);
      if (validResult !== true) {
        return this.reject(Response, validResult);
      }

      const user = await this.AuthDelegator._loadUserByEmail(email);

      if (user && cryptoUtil.comparePassword(password, user.local.password)) {
        const data = {
          success: true
        }
        this.success(Request,Response, next, data);
      } else {
        this.reject(Request, Response, "email and password dont match");
      }
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params: 
   * email
   * password
   */
  async getClientSecret(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const password = body.password;
    try {
      // validate request params
      const validResult = this.validate(body, this.schema.AuthSchema.authenticate);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }
      // find user
      const user = await this.AuthDelegator._loadUserByEmail(email);
      if (!user || !cryptoUtil.comparePassword(password, user.local.password)) {
        return this.reject(Request, Response, "email and password dont match");
      }
      // find api user
      const apiUser = await this.AuthDelegator._loadApiUser(email);

      if (!apiUser) {
        return this.reject(Request, Response, "API user not found");
      }

      const data = {
        clientSecret: apiUser.clientSecret
      }
      this.success(Request,Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params:
   * eamil
   * clientSecret
   * password
   */
  async refreshAccessToken(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const password = body.password;
    const clientSecret = body.clientSecret;
    try {
      // validate request params
      const validResult = this.validate(body, this.schema.AuthSchema.accessToken);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }
      // find user
      const user = await this.AuthDelegator._loadUserByEmail(email);
      if (!user || !cryptoUtil.comparePassword(password, user.local.password)) {
        return this.reject(Request, Response, "account not found: " + email);
      }
      // find api user
      const apiUser = await this.AuthDelegator._loadApiUser(email);
      if (!apiUser || apiUser.clientSecret !== clientSecret) {
        return this.reject(Request, Response, "Client Secrets dont match");
      }
      // generate access token
      const accessToken = cryptoUtil.generateToken(this.constant.TOKEN_LENGTH);
      apiUser.timeout = Date.now();
      apiUser.accessToken = accessToken;
      // update api user
      await apiUser.save();
      const data = {
        accessToken: accessToken
      }
      this.success(Request,Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params:
   * eamil
   * clientSecret
   */
  async getAccessToken(Request, Response, next) {
    const body = Request.body;
    const clientSecret = body.clientSecret;
    const email = body.email;
    try {
      // validate request params
      const validResult = this.validate(body, this.schema.AuthSchema.accessToken);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }
      // find api user
      const apiUser = await this.AuthDelegator._loadApiUser(email);
      if (!apiUser || apiUser.clientSecret !== clientSecret) {
        return this.reject(Request, Response, "Client Secrets dont match");
      }

      const data = {
        accessToken: apiUser.accessToken
      }
      this.success(Request,Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body params:
   * email
   * accessToken 
   */
  async getTokenValidity(Request, Response, next) {
    const body = Request.body;
    const email = body.email;
    const accessToken = body.accessToken;
    try {
      // validate request params
      const validResult = this.validate(body, this.schema.AuthSchema.tokenValidity);
      if (validResult !== true) {
        return this.reject(Request, Response, validResult);
      }
      // find api user
      const user = await this.AuthDelegator._loadApiUser(email);
      if (!user) {
        return this.reject(Request, Response, "user not found");
      }

      if (user.accessToken !== accessToken) {
        return this.reject(Request, Response, "Invalid Access Token");
      }
      const now = Date.now();
      const timeElapsed = this.constant.TOKEN_TIMEOUT + user.timeout - now;
      if (timeElapsed < 0) {
        return this.reject(Request, Response, "Access Token time out");
      }

      const data = {
        expried: timeElapsed
      }
      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}



module.exports = AuthController;