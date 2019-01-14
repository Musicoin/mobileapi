const ControllerDelegator = require('./ControllerDelegator');

class GlobalDelegator extends ControllerDelegator {
  constructor(props) {
    super(props);

    this._searchArtists = this._searchArtists.bind(this);
    this._searchTracks = this._searchTracks.bind(this);

    this.searchArtists = this.searchArtists.bind(this);
    this.searchTracks = this.searchTracks.bind(this);
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
    }else{
      return {
        error: "artists not found"
      }
    }
  }

  _searchTracks(reg, limit) {
    return this.db.Release.find({
      state: 'published',
      markedAsAbuse: {
        $ne: true
      },
      artistAddress: {
        $in: this.getVerifiedArtist()
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
    }else{
      return {
        error: "tracks not found"
      }
    }
  }
  
}

module.exports = GlobalDelegator;