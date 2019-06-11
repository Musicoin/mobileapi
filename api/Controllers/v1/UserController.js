const BaseController = require('../base/BaseController');
const UserDelegator = require('../../Delegator/UserDelegator');
const AuthDelegator = require('../../Delegator/AuthDelegator');

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

    this.follow = this.follow.bind(this);
    this.unfollow = this.unfollow.bind(this);
  }

  async getUserInfo(Request, Response, next){
    const email = Request.query.email;
    try {
      const user = await this.AuthDelegator._loadUserByEmail(email);
      this.logger.debug("[getUserInfo]user:"+JSON.stringify(user))

      const username = this.UserDelegator.getUserName(user);
      const balance = await this.UserDelegator.getUserBalance(user.profileAddress);
      const avatar = user.draftProfile && user.draftProfile.ipfsImageUrl;
      const description = user.draftProfile && user.draftProfile.description;
      const socials = user.draftProfile && user.draftProfile.social;
      const genres = user.draftProfile && user.draftProfile.genres;
      const useremail = user.primaryEmail;

      const userInfo = {
        profileAddress: user.profileAddress || null,
        email: useremail,
        username: username || null,
        avatar: this.UserDelegator.getUserAvatar(avatar),
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

  async follow(Request, Response, next) {
    const email = Request.query.email;
    const follower = Request.body.follower;

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);
    const followUser = await this.AuthDelegator._findUserByUserId(follower);
    this.logger.debug("currentUser", JSON.stringify(currentUser));
    this.logger.debug("followUser", JSON.stringify(followUser));

    if (!currentUser || !followUser) {
      return this.reject(Request, Response, "Following User not found, please check");
    }

    const currentUserId = currentUser.id;
    const followUserId = followUser.id;
    const ret = await this.UserDelegator.isUserFollowing(currentUserId, followUserId);
    if (ret) {
      return this.reject(Request, Response, "Following User has been followed");

    } else {
      const followed = await this.UserDelegator.startFollowing(currentUserId, followUserId);
      if (followed) {
        const data = {
          success: true
        }
        this.success(Request, Response, next, data);
      } else {
      return this.error(Request, Response, "Failed to follow");
      }
    }
  }

  async unfollow(Request, Response, next) {
    const email = Request.query.email;
    const follower = Request.body.follower;

    this.logger.info("unfollow:"+email+"-"+follower);

    const currentUser = await this.AuthDelegator._loadUserByEmail(email);
    const followUser = await this.AuthDelegator._findUserByUserId(follower);

    if (!currentUser || !followUser) {
      return this.reject(Request, Response, "Following User not found, please check");
    }

    const currentUserId = currentUser.id;
    const followUserId = followUser.id;
    const ret = await this.UserDelegator.isUserFollowing(currentUserId, followUserId);
    if (!ret) {
      return this.reject(Request, Response, "Following User has not been followed");

    } else {
      this.logger.info("HERE")
      const followed = await this.UserDelegator.stopFollowing(currentUserId, followUserId);
      if (followed) {
        const data = {
          success: true
        }
        this.success(Request, Response, next, data);

      } else {
        return this.error(Request, Response, "Failed to unfollow");
      }
    }
  }
}

module.exports = UserController;
