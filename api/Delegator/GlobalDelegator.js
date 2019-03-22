const ControllerDelegator = require('./ControllerDelegator');

class GlobalDelegator extends ControllerDelegator {
  constructor(props) {
    super(props);

    this._searchArtists = this._searchArtists.bind(this);
    this._searchTracks = this._searchTracks.bind(this);

    this.searchArtists = this.searchArtists.bind(this);
    this.searchTracks = this.searchTracks.bind(this);

    this.findUserByAddress = this.findUserByAddress.bind(this);
    this.findRleaseByAddress = this.findRleaseByAddress.bind(this);
    this.createReport = this.createReport.bind(this);
    this.directPay = this.directPay.bind(this);
  }

  _searchArtists(reg, limit, skip) {
    return this.db.User.find({
      profileAddress: {
        $ne: null
      },
      draftProfile: {
        $exists: true
      },
      "draftProfile.artistName": {
        $regex: reg
      }
    }).skip(skip).limit(limit).exec();
  }

  async searchArtists(reg, limit, skip) {

    const artists = await this._searchArtists(reg, limit, skip);

    if (artists) {
      return {
        data: this.response.ArtistResponse.responseList(artists)
      }
    } else {
      return {
        error: "artists not found"
      }
    }
  }

  async _searchTracks(reg, limit, skip) {
    const artistAddressList = await this.getVerifiedArtist();
    return this.db.Release.find({
      state: 'published',
      markedAsAbuse: {
        $ne: true
      },
      artistAddress: {
        $in: artistAddressList
      },
      $or: [{
        title: {
          $regex: reg
        }
      }]
    }).skip(skip).limit(limit).exec();
  }

  async searchTracks(reg, limit, skip) {
    const releases = await this._searchTracks(reg, limit, skip);
    if (releases) {
      return {
        data: this.response.ReleaseResponse.responseList(releases)
      }
    } else {
      return {
        error: "tracks not found"
      }
    }
  }

  findUserByAddress(address) {
    return this.db.User.findOne({
      profileAddress: address
    }).exec();
  }

  findRleaseByAddress(address) {
    return this.db.Release.findOne({
      contractAddress: address
    }).exec();
  }

  createReport(email, type, reason, targetId, isArtist = false) {
    const reportContent = {
      reportEmail: email,
      reportType: type,
      reason: reason
    }
    if (isArtist) {
      reportContent["artist"] = targetId
    } else {
      reportContent["release"] = targetId
    }

    return this.db.Report.create(reportContent);

  }

  async directPay(trackAddress, musicoins) {

    const logger = this.logger;
    logger.info("[UserDelegator]directPay:"+trackAddress+"-mount:"+musicoins)

    //try {
      const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        //return validateResult;
        logger.error("validateResult: "+validateResult);
        return false;
      }

      // find ubimusic
      /*const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
      if (!sender) {
        logger.error("sender not found: "+UBIMUSIC_ACCOUNT);
        return false;
      }*/

      // send tip amount to address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(UBIMUSIC_ACCOUNT, trackAddress, musicoins);
      logger.debug("tip complete: ", tx);

      const data = {
        tx: tx
      }
      return data;

    /*} catch (error) {
      logger.error("Exception: "+error);
      return false;
    }*/
  }
}

module.exports = GlobalDelegator;
