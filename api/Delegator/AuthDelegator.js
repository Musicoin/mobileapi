const ControllerDelegator = require('./ControllerDelegator');

// util
const cryptoUtil = require('../../utils/crypto-util');

class AuthDelegator extends ControllerDelegator {
  constructor(props) {
    super(props);

    this._loadUserByEmail = this._loadUserByEmail.bind(this);
    this._createApiUser = this._createApiUser.bind(this);
    this._createUser = this._createUser.bind(this);
    this.findUserBySocialEmail = this.findUserBySocialEmail.bind(this);
  }

  _loadUserByEmail(email) {
    return this.db.User.findOne({
      "local.email": email
    }).exec();
  }

  findUserBySocialEmail(channel, email){
    const filter = {};
    filter[channel+".email"] = email;
    return this.db.User.findOne(filter).exec();
  }

  createSocialUser(profile){
    return this.db.User.create(profile);
  }

  _createApiUser(email) {
    // generate client secret
    const clientSecret = cryptoUtil.generateToken(this.constant.SECRET_LENGTH);
    // generate access token
    const accessToken = cryptoUtil.generateToken(this.constant.TOKEN_LENGTH);
    // create api user
    return this.db.ApiUser.create({
      email: email,
      clientSecret: clientSecret,
      timeout: Date.now(),
      accessToken: accessToken
    });
  }

  _createUser(email, password, username) {
    // create new user
    return this.db.User.create({
      local: {
        email,
        password: cryptoUtil.hashPassword(password),
        username
      }
    });
  }

}

module.exports = AuthDelegator;