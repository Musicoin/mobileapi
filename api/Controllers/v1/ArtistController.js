const BaseController = require('../base/BaseController');

const MediaProvider = require('../../../utils/media-provider-instance');

class ArtistController extends BaseController{
  constructor(props){
    super(props);

    this.getArtistDescription = this.getArtistDescription.bind(this);
  }

  /**
   * params:
   * hash
   */
  async getArtistDescription(Request, Response) {
    const params = Request.params;
    try {
      const descUrl = this.constant.IPFS_PROTOCOL+params.hash;
      const text = await MediaProvider.fetchTextFromIpfs(descUrl);
      this.success(Response, {
        data: text
      })
    } catch (error) {
      this.error(Response, error);
    }
  }
}



module.exports = ArtistController;