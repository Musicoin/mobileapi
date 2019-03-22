const BaseController = require('../base/BaseController');
const AuthDelegator = require('../../Delegator/AuthDelegator');
const UserDelegator = require('../../Delegator/UserDelegator');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');
const GlobalDelegator = require('../../Delegator/GlobalDelegator');

const uuidV4 = require('uuid/v4');

const IAPVerifier = require('iap_verifier');

class GlobalController extends BaseController {

  constructor(props) {
    super(props);

    this.GlobalDelegator = new GlobalDelegator();
    this.ReleaseDelegator = new ReleaseDelegator(props);
    this.AuthDelegator = new AuthDelegator(props);

    this.search = this.search.bind(this);
    this.reportArtist = this.reportArtist.bind(this);
    this.reportRelease = this.reportRelease.bind(this);

    this.checkServices = this.checkServices.bind(this);
    this.appleIAP = this.appleIAP.bind(this);
  }

  async search(Request, Response, next) {
    try {
      const keyword = Request.body.keyword;
      const limit = this.limit(Request.body.limit);
      const skip = this.skip(Request.body.skip);
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

  async reportArtist(Request, Response, next) {
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const artistAddress = body.artistAddress;

      const user = await this.GlobalDelegator.findUserByAddress(artistAddress);
      if (!user) {
        return this.reject(Request, Response, "user not found: " + artistAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, user._id, true);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async reportRelease(Request, Response, next) {
    try {
      const body = Request.body;
      const email = body.reportEmail;
      const type = body.reportType;
      const reason = body.reason;
      const trackAddress = body.trackAddress;

      const release = await this.GlobalDelegator.findRleaseByAddress(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "track not found: " + trackAddress);
      }

      await this.GlobalDelegator.createReport(email, type, reason, release._id, false);

      this.success(Request, Response, next, {
        success: true
      })

    } catch (error) {
      this.error(Request, Response, error);
    }
  }


  async checkServices(Request, Response, next) {
    // load a artist info to check if serices is running
    const artistAddress = "0x411eedd91f172766061d705ed7e71131b84a7654";
    const ipfsHash = "ipfs://QmYV4gXcXaVLFctdTsYADCWcuzzLbcigPkwFzgtrdfHaZw";
    let user;
    let artist;
    let description;
    const response = {
      mongodb: "running",
      ipfs: "running",
      gmc: "running"
    }

    try {
      user = await this.db.User.findOne({
        profileAddress: artistAddress
      }).exec();
      this.logger.debug("find user from mongodb: ", user._id);
      this.logger.info("mongodb is running");
    } catch (error) {
      response.mongodb = "error: " + error.message;
      this.logger.info("mongodb running error: " + error.message);
    }

    try {
      artist = await this.MusicoinCore.getArtistModule().getArtistByProfile(artistAddress);
      this.logger.debug("find user from gmc: ", artist);
      this.logger.info("gmc is running");
    } catch (error) {
      response.gmc = "error: " + error.message;
      this.logger.info("gmc running error: " + error.message);
    }

    try {
      description = await this.MediaProvider.fetchTextFromIpfs(ipfsHash);
      this.logger.debug("find artist description from ipfs: ", description);
      this.logger.info("ipfs is running");
    } catch (error) {
      response.ipfs = "error: " + error.message;
      this.logger.info("ipfs running error: " + error.message);
    }

    this.success(Request, Response, next, response);
  }


  /*

    Apple IAP callback

  */
  async appleIAP(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;
    const orderid = Request.params.orderid;
    const receipt = Request.params.receipt;

    logger.info("[GlobalController]appleIAP:"+email+"-:"+receipt);

    const itunes_shared_secret = process.env.ITUNES_SHARED_SECRET?process.env.ITUNES_SHARED_SECRET:'';
    if (itunes_shared_secret == '') {
        return this.reject(Request, Response, "Empty itunes_shared_secret");
    }

    var client = new IAPVerifier(itunes_shared_secret);
    const user = await this.AuthDelegator._loadUserByEmail(email);
    logger.info("User:"+JSON.stringify(user));

    try {
      client.verifyReceipt(receipt, function(valid, msg, recv) {
        if (valid) {
          // update status of payment in your system
          logger.info("Valid receipt");
          const product_id = recv.receipt.in_app;

        } else {
          logger.info("Invalid receipt");

        }
      });

      // add coin
      await this.GlobalDelegator.directPay(user.profileAddress, 100);
    } catch (error) {
      logger.error("error:"+error);
      // DEBUG
      //this.GlobalDelegator.directPay(user.profileAddress, 100);
    }

    const data = {
        code: 0
    };
    this.success(Request, Response, next, data);
  }

  /**
   * Direct Send: TODO
   * body:
   * profileAddress
   * musicoins
   */
  async directPay(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;

    const user = await this.AuthDelegator._loadUserByEmail(email);
    logger.debug("[directSend]user:"+JSON.stringify(user))

    try {
      const musicoins = Request.body.musicoins || 10;
      const trackAddress = Request.body.trackAddress;
      const USER_ACCOUNT = user.profileAddress; //"0xc973b1c475f160c361d017fa762e6a3aa991f11c";
      const balance = + user.balance;

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      // find user
      const sender = await this.ReleaseDelegator._loadUser(USER_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: " + USER_ACCOUNT);
      }

      // TODO

      const data = {
        tx: ""
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}

module.exports = GlobalController;
