const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const constant = require('../../constant');

// db model
const User = require('../../../db/core/user');
const ApiUser = require('../../../db/core/api-user');
const Hero = require('../../../db/core/hero');
const ApiPackage = require('../../../db/core/api-package');
const IPFSResource = require('../../../db/core/ipfs-resource');
const LicenseKey = require('../../../db/core/key');
const Playlist = require('../../../db/core/playlist');
const ReleaseStats = require('../../../db/core/release-stats');
const Release = require('../../../db/core/release');
const TipHistory = require('../../../db/core/tip-history');
const TrackMessage = require('../../../db/core/track-message');
const UserPlayback = require('../../../db/core/user-playback');
const UserStats = require('../../../db/core/user-stats');

// validator schema
const AuthSchema = require('../../ValidatorSchema/AuthSchema');
const PackageSchema = require('../../ValidatorSchema/PackageSchema');
const PlaylistSchema = require('../../ValidatorSchema/PlaylistSchema');
const ReleaseSchema = require('../../ValidatorSchema/ReleaseSchema');
const UserSchema = require('../../ValidatorSchema/UserSchema');
const GlobalSchema = require('../../ValidatorSchema/GlobalSchema');

// response data
const ArtistResponse = require('../../response-data/v1/artist-model');
const ReleaseResponse = require('../../response-data/v1/release-model');
const PlaylistResponse = require('../../response-data/v1/playlist-model');

// logger
const Logger = require('../../../utils/Logger');

// musicoin core
const MusicoinCore = require('../../Kernel').musicoinCore;

// verified artist
let verifiedList = [];

async function checkUserVerified(){
  if (!verifiedList || verifiedList.length === 0) {
    // load verified users
    const _verifiedList = await User.find({
      verified: true,
      profileAddress: {
        $exists: true,
        $ne: null
      }
    }).exec();
    verifiedList = _verifiedList.map(val => val.profileAddress);
  }
  console.log("verified users: ",verifiedList.length);
}

checkUserVerified();
setInterval(checkUserVerified, 1000*60*60);

/**
 * all route controller extends BaseController
 */
class BaseController {

  constructor(props) {
    // constant var
    this.constant = constant;

    // db model
    this.db = {
      User,
      ApiUser,
      Hero,
      ApiPackage,
      IPFSResource,
      LicenseKey,
      Playlist,
      Release,
      ReleaseStats,
      TipHistory,
      TrackMessage,
      UserPlayback,
      UserStats,
    }

    // validator schema
    this.schema = {
      AuthSchema,
      PackageSchema,
      PlaylistSchema,
      ReleaseSchema,
      UserSchema,
      GlobalSchema
    }

    // response data
    this.response = {
      ArtistResponse,
      ReleaseResponse,
      PlaylistResponse
    }

    // logger
    this.logger = Logger;

    this.MusicoinCore = MusicoinCore;

    this.validate = this.validate.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
    this.reject = this.reject.bind(this);
    this.limit = this.limit.bind(this);
    this.skip = this.skip.bind(this);
  }

  /**
   * validate request params
   * @param {*} body 
   * @param {*} schema 
   * @return true or error message
   */
  validate(body, schema) {
    const result = Validator.validate(body, schema);
    if(result === true){
      return true
    }else{
      return result[0].message
    }
  }

  /**
   * request error
   * @param {*} Response 
   * @param {*} error 
   */
  error(Request, Response, error) {
    const url = Request.originalUrl;
    let msg;
    if (error instanceof Error) {
      msg = error.message;
    } else {
      msg = error;
    }
    this.logger.error(url, error);
    Response.status(500).json({
      error: msg
    })
  }

  /**
   * request success
   * @param {*} Response 
   * @param {*} data 
   */
  success(Response, data) {
    Response.status(200).json(data)
  }

  /**
   * request rejest
   * @param {*} Response 
   * @param {*} error 
   */
  reject(Request, Response, message) {
    const url = Request.originalUrl;
    this.logger.warn(url, message);
    Response.status(400).json({
      error: message
    })
  }

  /**
   * 
   * @param {*} limit 
   */
  limit(num) {
    if (num) {
      const parseNum = Number(num);
      return parseNum > 0 ? (parseNum > 20 ? 20 : parseNum) : 10
    }
    return 10
  }

  skip(num){
    if (num) {
      const parseNum = Number(num);
      return parseNum > 0 ? parseNum : 0
    }
    return 10
  }

  getVerifiedArtist(){
    return verifiedList;
  }
}

module.exports = BaseController;