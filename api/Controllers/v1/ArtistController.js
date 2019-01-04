const BaseController = require('../base/BaseController');

const MediaProvider = require('../../../utils/media-provider-instance');
const ArtistModule = require('../../Kernel').musicoinCore.getArtistModule();

const ArtistModel = require('../../data/artist-model');

class ArtistController extends BaseController{
  constructor(props){
    super(props);

    this.getArtistDescription = this.getArtistDescription.bind(this);
    this.getProfileByAddress = this.getProfileByAddress.bind(this);
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

  /**
   * pramas:
   * address
   */
  async getProfileByAddress(Request, Response) {
    try {
      const address = Request.params.address;
      const artist = await ArtistModule.getArtistByProfile(address);
      // const desc = await MediaProvider.fetchTextFromIpfs(artist.descriptionUrl);
      this.success(Response,{
        ...ArtistModel.responseData(address, artist),
        description: "desc"
      });
    } catch (error) {
      this.error(Response, error);
    }
  }
}



module.exports = ArtistController;