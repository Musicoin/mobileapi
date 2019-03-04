const request = require('async-request');


const BaseController = require('../base/BaseController');
const AuthDelegator = require('../../Delegator/AuthDelegator');
const OAuth = require('oauth');


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
    this.login = this.login.bind(this);
    this.socialLogin= this.socialLogin.bind(this);
    this.getGoogleClientID = this.getGoogleClientID.bind(this)
    this.getTwitterOAuthToken = this.getTwitterOAuthToken.bind(this)
    this.getFacebookAppID = this.getFacebookAppID.bind(this)
  }

  async socialLogin(Request, Response, next){
    try {
      const channel = Request.body.channel;
      const accessToken = Request.body.accessToken;
      const logger = this.logger;

      // check channel is valid
      if (this.constant.SOCIAL_CHANNELS.indexOf(channel) === -1) {
        return this.reject(Request, Response, "channel is invalid.")
      }

      let uri;
      let fbid;
      if (channel === 'google') {
        uri = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;

      } else if (channel === 'facebook') {
        const fburl = `https://graph.facebook.com/me?access_token=${accessToken}`
        const fbres = await request(fburl);


        if (fbres.error) {
          return this.error(Request, Response, fbres.error);
        } else if (fbres.body.error) {
          return this.error(Request, Response, fbres.body.error);
        } else {

          const fbody = JSON.parse(fbres.body);
          logger.debug("[socialLogin]facebook:"+JSON.stringify(fbody));

          fbid = fbody.id;
          uri = `https://graph.facebook.com/${fbid}?fields=email,first_name,last_name&access_token=${accessToken}`;
        }
      } else if (channel === 'twitter') {
        // TODO
        return this.error(Request, Response, "Not support twitter yet");
      }

      const res = await request(uri);

      if (res.error) {
        return this.error(Request, Response, res.error);
      } else if (res.body.error) {
        return this.error(Request, Response, body.error.message);
      }else {
        const profile = JSON.parse(res.body);
        // TODO
        logger.debug("[socialLogin]profile:"+JSON.stringify(profile));
        const email = profile.email ? profile.email : `${fbid}@fbmusicon`;
        logger.debug("socialLogin:"+email);
        let user = await this.AuthDelegator.findUserBySocialEmail(channel, email);
        if (!user) {
          user = await this.AuthDelegator.createSocialUser(channel, profile);
          await this.AuthDelegator.setupNewUser(user);
        } else {
          user[channel] = profile;
          await user.save();
        }
        let apiUser = await this.AuthDelegator._loadApiUser(email);

        // carete a new api user if not found
        if (!apiUser) {
          apiUser = await this.AuthDelegator._createApiUser(email);
        }
        // response clientSecret and accessToken
        const data = {
          clientSecret: apiUser.clientSecret,
          accessToken: apiUser.accessToken,
          email: email
        };
        this.success(Request, Response, next, data);
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
      
      // check if user exists
      const user = await this.db.User.findOne({"local.email": email}).exec();
      if (user) {
        return this.reject(Request, Response, "Email has been used");
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

  async login(Request, Response, next){
    try {
      const body = Request.body;
      const email = body.email;
      const password = body.password;

      const user = await this.AuthDelegator._loadUserByEmail(email);
      if (!user || !user.local) {
        return this.reject(Request, Response, "user not found");
      }
      // verify password
      if (!cryptoUtil.comparePassword(password, user.local.password)) {
        return this.reject(Request, Response, "email and password dont match");
      }

      await this.AuthDelegator.setupNewUser(user);

      let apiUser = await this.AuthDelegator._loadApiUser(email);
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
      this.error(Request,Response, error);
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
        expired: timeElapsed
      }
      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getGoogleClientID(Request, Response, next){
    let clientID = '';
    if(Request.query.platform === 'ios'){
       clientID = process.env.GOOGLE_CLIENT_ID_IOS? process.env.GOOGLE_CLIENT_ID_IOS: '';
    }else {
       clientID = process.env.GOOGLE_CLIENT_ID? process.env.GOOGLE_CLIENT_ID: '';
    }
    const data = {clientID}
    this.success(Request,Response, next, data);
  }

  async getTwitterOAuthToken(Request, Response, next){
    const twitterConsumerKey = process.env.TWITTER_KEY? process.env.TWITTER_KEY: '';
    const twitterConsumerSecret = process.env.TWITTER_SECRET?process.env.TWITTER_SECRET: '';
    const oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        twitterConsumerKey,
        twitterConsumerSecret,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    oauth.getOAuthRequestToken(
        (e, oauthToken, oauthTokenSecret, results)=>{
          if (e){
            this.error(Request, Response, e);
          }else {
            const data = {oauthToken}
            this.success(Request,Response, next, data);
          }
        })

  }

  async getFacebookAppID(Request, Response, next){
    const appID = process.env.FACEBOOK_APP_ID? process.env.FACEBOOK_APP_ID: '';
    const data = {appID}
    this.success(Request,Response, next, data);
  }

  async delUser(Request, Response, next){
    const debug = process.env.DEBUG || true; // should be change to false by default
    if (!debug) {
        return this.reject(Request, Response, "debug not allowed");
    }

    try {
      const body = Request.body;
      const email = body.email;

      const user = await this.AuthDelegator._loadUserByEmail(email);
      if (!user || !user.local) {
        return this.reject(Request, Response, "user not found");
      } else {
        user.remove.exec();
      }
      

      let apiUser = await this.AuthDelegator._loadApiUser(email);
      if (!apiUser) {
        return this.reject(Request, Response, "API user not found");
      } else {
        apiUser.remove().exec();
      }

      // response clientSecret and accessToken
      const data = {
        message: "OK"
      }

      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request,Response, error);
    }
  }


}



module.exports = AuthController;
