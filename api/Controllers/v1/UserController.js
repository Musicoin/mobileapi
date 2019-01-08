const BaseController = require('../base/BaseController');

class UserController extends BaseController {

  constructor(props) {
    super(props);

    this.getPlayList = this.getPlayList.bind(this);
    this.createPlayList = this.createPlayList.bind(this);
    this.addToPlayList = this.addToPlayList.bind(this);
    this.getAllPlayList = this.getAllPlayList.bind(this);
    this.deletePlayList = this.deletePlayList.bind(this);
    this.removeToPlayList = this.removeToPlayList.bind(this);

  }

  async createPlayList(Request, Response) {
    try {
      const params = Request.body;
      params.apiUserId = Request.apiUser._id.toString();
      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.create);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }
      params.songs = [];

      const playlist = await this.db.Playlist.create(params);
      const response = this.response.PlaylistResponse.responseData(playlist);
      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getPlayList(Request, Response) {
    try {
      const params = Request.params;

      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.getOne);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      const playlist = await this.db.Playlist.findById(params.id).populate("songs").exec();

      if(!playlist){
        return this.reject(Request,Response, "playlist not found: "+params.id);
      }

      const response = this.response.PlaylistResponse.responseData(playlist);
      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getAllPlayList(Request, Response) {
    try {
      const params = {
        apiUserId: Request.apiUser._id.toString()
      }
      // validate params
      const validateResult = this.validate(params, this.schema.PlaylistSchema.getAll);
      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      const playlists = await this.db.Playlist.find(params).populate("songs").exec();

      const response = this.response.PlaylistResponse.responseList(playlists);
      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async addToPlayList(Request, Response) {
    try {
      const params = Request.body;
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

      // find playlist and add song
      const playlist = await this.db.Playlist.findByIdAndUpdate(params.playlistId, {
        $push: {
          "songs": release._id.toString()
        }
      }, {
        safe: true,
        upsert: true
      }).populate("songs").exec();

      const response = this.response.PlaylistResponse.responseData(playlist);

      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async removeToPlayList(Request, Response) {
    try {

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async deletePlayList(Request, Response) {
    try {

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}

module.exports = UserController;