const BaseController = require('../base/BaseController');
const AuthDelegator = require('../../Delegator/AuthDelegator');
const UserDelegator = require('../../Delegator/UserDelegator');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');
const GlobalDelegator = require('../../Delegator/GlobalDelegator');

const cryptoUtil = require('../../../utils/crypto-util');
const uuidV4 = require('uuid/v4');
const inArray = require('in-array');
var IABVerifier = require('iab_verifier')

const iapReceiptValidator = require('iap-receipt-validator').default;

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
    this.googleIAP = this.googleIAP.bind(this);
    // debug
    this.delReceipt = this.delReceipt.bind(this);
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
    const orderid = Request.body.orderid;
    const receipt = Request.body.receipt;
    const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

    logger.info("[GlobalController]appleIAP:"+email+"-:"+receipt);

    const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
    if (!sender) {
      return this.reject(Request, Response, "sender not found: "+UBIMUSIC_ACCOUNT);
    }

    const prod = ! inArray(["bengyles@hotmail.com", "river7@gmail.com", "beng@musicoin.org", "isaac.mao@gmail.com", "ehsan.hajian@gmail.com"], email)
    //process.env.DEBUG ? process.env.DEBUG : 0; // should be change to false by default
    const itunes_shared_secret = process.env.ITUNES_SHARED_SECRET?process.env.ITUNES_SHARED_SECRET:'';
    if (itunes_shared_secret == '') {
        return this.reject(Request, Response, "Invaid secret");
    }

    const validateReceipt = iapReceiptValidator(itunes_shared_secret, prod);

    const user = await this.AuthDelegator._loadUserByEmail(email);
    logger.info("User:"+JSON.stringify(user));
    var result = {};
    try {
      const validationData = await validateReceipt(receipt);
      const product_type = validationData.receipt.in_app[0].product_id;
      var xx = product_type.split("_");

      logger.debug("validationData:"+JSON.stringify(validationData));
      let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
      if (receiptRecord) {
        logger.warn("receiptRecord:"+JSON.stringify(receiptRecord));
        return this.reject(Request, Response, "Receipt is expired");
      } else {
        // save receipt
        this.GlobalDelegator.createReceipt(receipt, xx[1], email, "apple");
        result = await this.GlobalDelegator.directPay(user.profileAddress, parseInt(xx[1]));
      }

    } catch (error) {
      logger.error("error:"+error);
      return this.reject(Request, Response, "Invalid payment receipt");
    }

    this.success(Request, Response, next, result);
  }


  /*
    Validate google payment
  */

  async googleIAP(Request, Response, next) {
    const logger = this.logger;
    const email = Request.query.email;
    const signature = Request.body.signature;
    const receipt = Request.body.receipt;

    const google_pub_key = process.env.GOOGLE_PUB_KEY ? process.env.GOOGLE_PUB_KEY : 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAooNcEwsUnK74Krn4KQC/S4tux3dwxLvxt/Tb96CfnnxrU7edwR9GWNZYT+P7X7swMUu38ka5rJOnEUaAp5kQ+rfccn6Euh4vgv0zAo0ul7KtaOUXLbD3VrzUD6Rhrxo449rmk98eSLGL/An5bWPle4kUs2xqIsY6CCPCFL87X4+RiETcZ4uy4ab6yBJ5c0yYhvWEcOnQdOGLOnf62SMboq/cJK4/CRFqLFoghPAPFfYctea7+gRK4Gh3OarqJaB4ErFgoriEmYD7R4I0bCYkHpctzLCB//TFHF7OEaJwjpz0qbxD89v7rKbqTFwEXnaAMC2YdZIpOSxq3A3fNS+KsQIDAQAB';

    logger.info("[GlobalController]googleIAP:"+email+"-:"+signature+":"+receipt+":"+google_pub_key);

    const receiptOBJ = JSON.parse(receipt);
    const productId = receiptOBJ.productId;

    const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;

    const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
    if (!sender) {
      return this.reject(Request, Response, "sender not found: "+UBIMUSIC_ACCOUNT);
    }

    if (google_pub_key == '') {
        return this.reject(Request, Response, "Invaid public key");
    }

    const user = await this.AuthDelegator._loadUserByEmail(email);

    var googleplayVerifier = new IABVerifier(google_pub_key);

    var verify_result = await googleplayVerifier.verifyReceipt(receipt, signature);

    var result = {};

    if (verify_result) {
      var xx = productId.split("_");

      let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
      if (receiptRecord) {

        logger.warn("receiptRecord:"+JSON.stringify(receiptRecord));
        return this.reject(Request, Response, "Receipt is expired");
      } else {
        // save receipt
        this.GlobalDelegator.createReceipt(receipt, xx[1], email, "google");
        result = await this.GlobalDelegator.directPay(user.profileAddress, parseInt(xx[1]));
      }

    } else {
      return this.reject(Request, Response, "Invalid payment receipt");
    }

    this.success(Request, Response, next, result);
  }



  async delReceipt(Request, Response, next) {
    const debug = process.env.DEBUG ? process.env.DEBUG : 0; // should be change to false by default
    if (!debug) {
        return this.reject(Request, Response, "debug not allowed");
    }
    const body = Request.body;
    const receipt = body.receipt;

    let receiptRecord = await this.GlobalDelegator.findReceipt(cryptoUtil.md5(receipt));
    if (!receiptRecord) {
      return this.error(Request, Response, "Receipt not found");
    } else {

      await this.GlobalDelegator.delReceipt(receipt);
      this.success(Request,Response, next, {message: "OK"});
    }
  }

  /**
   * Direct Send: TODO
   * body:
   * profileAddress
   * musicoins
   */
  async directTransfer(Request, Response, next) {
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
