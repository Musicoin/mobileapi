const BaseController = require('../base/BaseController');

class UserController extends BaseController {

  constructor(props) {
    super(props);

    this.getPlayList = this.getPlayList.bind(this);
    this.addPlayList = this.addPlayList.bind(this);
    this.getAllPlayList = this.getAllPlayList.bind(this);
    this.deletePlayList = this.deletePlayList.bind(this);
  }

  async getPlayList(Request, Response) {
    try {
      const params = {
        name: Request.query.name,
        email: Request.query.email
      };

      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.getOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      const playlist = await this.db.Playlist.find(params).populate("release").exec();

      if (!playlist) {
        return this.reject(Request, Response, "playlist not found: " + params.id);
      }

      const response = this.response.PlaylistResponse.responseList(playlist);
      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getAllPlayList(Request, Response) {
    try {
      const params = {
        email: Request.query.email
      }
      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.getAll);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      const playlist = await this.db.Playlist.find(params).populate("release").exec();

      const response = this.response.PlaylistResponse.responseList(playlist);
      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async addPlayList(Request, Response) {
    try {
      const params = Request.body;
      params.email = Request.query.email;
      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.add);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: params.trackAddress
      })

      if (!release) {
        return this.reject(Request, Response, "track not found: " + params.trackAddress);
      }
      const content = {
        name: params.name,
        email: params.email,
        release: release._id
      };
      await this.db.Playlist.findOneAndUpdate(content,content,{
        upsert: true
      }).exec();

      this.success(Response, {success: true});

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async deletePlayList(Request, Response) {
    try {
      const params = Request.body;
      params.email = Request.query.email;
      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.deleteOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      // find release
      const release = await this.db.Release.findOne({
        contractAddress: params.trackAddress
      })

      if (!release) {
        return this.reject(Request, Response, "track not found: " + params.trackAddress);
      }
      const content = {
        name: params.name,
        email: params.email,
        release: release._id
      };

      await this.db.Playlist.findOneAndDelete(content).exec();

      this.success(Response, {success: true});

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = UserController;