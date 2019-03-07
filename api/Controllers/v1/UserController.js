const BaseController = require('../base/BaseController');
const UserDelegator = require('../../Delegator/UserDelegator');

class UserController extends BaseController {

  constructor(props) {
    super(props);

    this.UserDelegator = new UserDelegator();
    this.AuthDelegator = new AuthDelegator();

    this.getPlayList = this.getPlayList.bind(this);
    this.addPlayList = this.addPlayList.bind(this);
    this.getAllPlayList = this.getAllPlayList.bind(this);
    this.deletePlayList = this.deletePlayList.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  async getUserInfo(Request, Response, next){
    const logger = this.logger;
    const email = Request.query.email;
    try {
      const user = await this.AuthDelegator._loadUserByEmail(email);
      logger.debug("[getUserInfo]user:"+JSON.stringify(user))

      const username = this.UserDelegator.getUserName(user);
      const balance = await this.UserDelegator.getUserBalance(user.profileAddress);
      const avatar = user.draftProfile && user.draftProfile.ipfsImageUrl;
      const description = user.draftProfile && user.draftProfile.description;
      const socials = user.draftProfile && user.draftProfile.social;
      const genres = user.draftProfile && user.draftProfile.genres;

      const userInfo = {
        profileAddress: user.profileAddress || null,
        email: email,
        username: username || null,
        avatar: avatar || null,
        description: description || null,
        balance: balance || 0,
        socials: socials || {},
        genres: genres || []
      }

      const response = {
        user: userInfo
      }

      this.success(Request,Response,next,response);

    } catch (error) {
      this.error(Request,Response, error);
    }

  }

  async getPlayList(Request, Response, next) {
    try {

      const name = Request.query.name;
      const email = Request.query.email;

      // validate params
      const validateResult = this.validate(Request.query, this.schema.PlaylistSchema.getOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const playlistLoad = await this.UserDelegator.loadPlaylist(name, email);
      if (playlistLoad.error) {
        return this.reject(Request, Response, playlistLoad.error);
      }

      const data = {
        playlist: playlistLoad.data
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getAllPlayList(Request, Response, next) {
    try {
      const  email =  Request.query.email;
      // validate params
      const validateResult = this.validate(Request.query, this.schema.PlaylistSchema.getAll);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const playlistLoad = await this.UserDelegator.loadAllPlaylist(email);
      if (playlistLoad.error) {
        return this.reject(Request, Response, playlistLoad.error);
      }

      const data = {
        playlist: playlistLoad.data
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * params:
   * name
   * email
   * trackAddress
   */
  async addPlayList(Request, Response, next) {
    try {
      const name = Request.body.name;
      const trackAddress = Request.body.trackAddress;
      const email = Request.query.email;
      // validate params
      const validateResult = this.validate({
        name,
        trackAddress,
        email
      }, this.schema.PlaylistSchema.add);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: trackAddress
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "track not found: " +trackAddress);
      }
      const content = {
        name: name,
        email: email,
        release: release._id
      };
      await this.db.Playlist.findOneAndUpdate(content, content, {
        upsert: true
      }).exec();

      const data = {
        success: true
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async deletePlayList(Request, Response, next) {
    try {
      const name = Request.body.name;
      const trackAddress = Request.body.trackAddress;
      const email = Request.query.email;
      // validate params
      const validateResult = this.validate({
        name,
        trackAddress,
        email
      }, this.schema.PlaylistSchema.deleteOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: trackAddress
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "track not found: " + trackAddress);
      }
      const content = {
        name: name,
        email: email,
        release: release._id
      };

      await this.db.Playlist.findOneAndDelete(content).exec();

      const data = {
        success: true
      }
      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = UserController;
