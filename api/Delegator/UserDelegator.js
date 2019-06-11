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
    const followed = await this.db.Follow.findOne({ follower: userId, following: toFollow }).exec();
    this.logger.info("isUserFollowing: "+userId+"-"+toFollow+JSON.stringify(followed));
    if (followed) {
      return true;
    } else {
      return false;
    }

  }

  async startFollowing(userId, toFollow) {
    this.logger.error("startFollowing: ", userId, toFollow);
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const inserted = await this.db.Follow.findOneAndUpdate({follower: userId, following: toFollow}, {}, options).exec();

    // update user stat
    //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: 1}}, options).exec();

    return true;
  }

  async stopFollowing(userId, toFollow) {
    this.logger.info("stopFollowing: ", userId, toFollow);
    const removed = await this.db.Follow.findOneAndRemove({ follower: userId, following: toFollow }).exec();

    //const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    //const updated = await this.db.UserStats.findOneAndUpdate({user: userId, date: Date.now()}, {$inc: {followCount: -1}}, options).exec();
    return true;
  }
}

module.exports = UserDelegator;
