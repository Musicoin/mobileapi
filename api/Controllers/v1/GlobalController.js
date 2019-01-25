const BaseController = require('../base/BaseController');

const GlobalDelegator = require('../../Delegator/GlobalDelegator');

class GlobalController extends BaseController {

  constructor(props) {
    super(props);

    this.GlobalDelegator = new GlobalDelegator();

    this.search = this.search.bind(this);
    this.reportArtist = this.reportArtist.bind(this);
    this.reportRelease = this.reportRelease.bind(this);
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

  async reportArtist(Request, Response, next){
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const artistAddress = body.artistAddress;

      const user = await this.GlobalDelegator.findUserByAddress(artistAddress);
      if (!user) {
        return this.reject(Request, Response, "user not found: "+artistAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, user._id, true);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request,Response,error);
    }
  }

  async reportRelease(Request, Response, next){
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const trackAddress = body.trackAddress;

      const release = await this.GlobalDelegator.findRleaseByAddress(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "track not found: "+trackAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, release._id, false);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request,Response,error);
    }
  }

}

module.exports = GlobalController;