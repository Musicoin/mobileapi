const BaseController = require('../base/BaseController');

class GlobalController extends BaseController {

  constructor(props) {
    super(props);

    this.search = this.search.bind(this);
  }

  async search(Request, Response) {
    const artistModule = this.MusicoinCore.getArtistModule();
    try {
      const keyword = Request.body.keyword;
      const validateResult = this.validate(Request.body, this.schema.GlobalSchema.search);
      if (validateResult !== true) {
        return this.reject(Request,Response, validateResult[0].message);
      }

      const _limit = Request.body.limit;
      let limit = _limit ? Number(_limit) : 10;
      limit = limit > 20 ? 20 : limit;

      const reg = new RegExp(keyword, "i");

      let ReleasesArray = [];
      let UsersArray = [];

      // search releases
      try {
        const releases = await this.db.Release.find({
          state: 'published',
          markedAsAbuse: {
            $ne: true
          },
          $or: [{
            title: {
              $regex: reg
            }
          }]
        }).limit(limit).exec();

        // filter the releases and conversion result
        ReleasesArray = this.response.ReleaseResponse.responseList(releases);
      } catch (error) {
        this.logger.error(Request.originalUrl, error);
      }

      // search users
      try {
        // search artist from releases
        const users = await this.db.Release.aggregate([{
            $match: {
              artistName: {
                $regex: reg
              }
            }
          },
          {
            $group: {
              "_id": "$artistAddress",
              "name": {
                $first: "$artistName"
              },
              "profileAddress": {
                $first: "$artistAddress"
              },
              "releaseCount": {
                $sum: 1
              }
            }
          },
          {
            $limit: limit
          }
        ]).exec();

        const ArtistResponse = this.response.ArtistResponse;

        // conversion result
        UsersArray = await Promise.all(users.map(user => {
          return new Promise((resolve, reject) => {

            // load artist
            artistModule.getArtistByProfile(user.profileAddress).then(res => {
                resolve(ArtistResponse.responseData(user.profileAddress, res));
              })
              .catch(error => reject(error));

          })
        }));
      } catch (error) {
        this.logger.error(Request.originalUrl, error);
      }


      this.success(Response,{
        releases: ReleasesArray,
        artists: UsersArray
      });
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = GlobalController;