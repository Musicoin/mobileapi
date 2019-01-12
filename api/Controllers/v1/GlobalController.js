const BaseController = require('../base/BaseController');

const GlobalDelegator = require('../../Delegator/GlobalDelegator');

class GlobalController extends BaseController {

  constructor(props) {
    super(props);

    this.GlobalDelegator = new GlobalDelegator();

    this.search = this.search.bind(this);
  }

  async search(Request, Response, next) {
    try {
      const keyword = Request.body.keyword;
      const limit = this.limit(Request.query.limit);
      if (!keyword) {
        return this.reject(Request, Response, "keyword is required.");
      }
      const reg = new RegExp(keyword, "i");

      let ReleasesArray = [];
      let UsersArray = [];

      const tracksLoad = this.GlobalDelegator._searchTracks(reg,limit);
      const artistsLoad = this.GlobalDelegator._searchArtists(reg, limit);

      try {
        const searchResult = await Promise.all([tracksLoad, artistsLoad]);
        ReleasesArray = this.response.ReleaseResponse.responseList(searchResult[0]);
        UsersArray = this.response.ArtistResponse.responseList(searchResult[1]);
      } catch (error) {
        this.logger.error(Request.originalUrl, error);
      }

      const data = {
        tracks: ReleasesArray,
        artists: UsersArray
      }
      this.success(Request,Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = GlobalController;