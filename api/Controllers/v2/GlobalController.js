const GlobalControllerV1 = require("../v1/GlobalController");

class GlobalController extends GlobalControllerV1{
  constructor(props){
    super(props);

  }

  async search(Request, Response, next) {
    try {
      const keyword = Request.query.keyword;
      const limit = this.limit(Request.query.limit);
      const skip = this.skip(Request.query.skip);
      if (!keyword) {
        return this.reject(Request, Response, "keyword is required.");
      }
      const reg = new RegExp(keyword, "i");

      let ReleasesArray = [];
      let UsersArray = [];

      const tracksLoad = this.GlobalDelegator._searchTracks(reg, limit, skip);
      const artistsLoad = this.GlobalDelegator._searchArtists(reg, limit, skip);

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
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = GlobalController;