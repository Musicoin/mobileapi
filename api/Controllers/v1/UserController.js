const BaseController = require('../base/BaseController');

class UserController extends BaseController{

  constructor(props){
    super(props);

    this.getPlayList = this.getPlayList.bind(this);
  }

  async getPlayList(Request, Response){
    try {
      
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

}