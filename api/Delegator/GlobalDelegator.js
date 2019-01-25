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
  }

  _searchArtists(reg, limit) {
    return this.db.User.find({
      draftProfile: {
        $exists: true
      },
      "draftProfile.artistName": {
        $regex: reg
      }
    }).limit(limit).exec();
  }

  async searchArtists(reg, limit) {

    const artists = await this._searchArtists(reg, limit);

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

  async _searchTracks(reg, limit) {
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
    }).limit(limit).exec();
  }

  async searchTracks(reg, limit) {
    const releases = await this._searchTracks(reg, limit);
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

}

module.exports = GlobalDelegator;