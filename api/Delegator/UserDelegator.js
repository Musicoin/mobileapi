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

  async loadAllPlaylist(email){
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

  async getUserBalance(address){
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

}

module.exports = UserDelegator;
