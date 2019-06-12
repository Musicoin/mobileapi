const ControllerDelegator = require('./ControllerDelegator');

class UserDelegator extends ControllerDelegator{
  constructor(props){
    super(props);

    this.loadPlaylist = this.loadPlaylist.bind(this);
    this.loadAllPlaylist = this.loadAllPlaylist.bind(this);
    this.getUserBalance = this.getUserBalance.bind(this);

  }

  async loadPlaylist(name, email){
    const playlist = await this.db.Playlist.find({
      name,
      email
    }).populate("release").exec();

    if (playlist) {
      return {
        data: this.response.PlaylistResponse.responseList(playlist)
      }
    }else{
      return {
        error: "playlist not found"
      }
    }
  }

  async loadAllPlaylist(email) {
    const playlist = await this.db.Playlist.find({
      email
    }).populate("release").exec();

    if (playlist) {
      return {
        data: this.response.PlaylistResponse.responseList(playlist)
      }
    }else{
      return {
        error: "playlist not found"
      }
    }
  }

  async getUserBalance(address) {
    if (address) {
      try {
        const balance = await this.MusicoinCore.getUserModule().getUserBalance(address);
        return balance;
      } catch (error) {
        this.logger.error("get user balance error: ", error.message);
        return 0;
      }
    }else{
      return 0;
    }
  }

  async isUserFollowing(userId, toFollow) {
    const follower = this.db.User.findOne({ "profileAddress": toFollow}).exec();

    if (follower) {
      const followed = await this.db.Follow.findOne({ follower: userId, following: follower.id }).exec();
      this.logger.debug("isUserFollowing", JSON.stringify(followed));
      if (followed) {
        return true;
      } else {
        return false;
      }
      } else {
      return false;
    }

  }

  async startFollowing(userId, toFollow) {
    this.logger.debug("startFollowing", JSON.stringify([userId, toFollow]));
    const follower = this.db.User.findOne({ "profileAddress": toFollow}).exec();
    if (follower) {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const inserted = await this.db.Follow.findOneAndUpdate({follower: userId, following: follower.id}, {}, options).exec();

      // update user stat
      //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: 1}}, options).exec();

      return true;
    } else {
      return false;
    }
  }

  async stopFollowing(userId, toFollow) {
    this.logger.info("stopFollowing", JSON.stringify([userId, toFollow]));
    const follower = this.db.User.findOne({ "profileAddress": toFollow}).exec();
    if (follower) {
      const removed = await this.db.Follow.findOneAndRemove({ follower: userId, following: follower.id }).exec();
      return true;
    } else {
      return false;
    }

    //const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: -1}}, options).exec();
  }
}

module.exports = UserDelegator;
