const BaseController = require('../base/BaseController');
const ReleaseDelegator = require('../../Delegator/ReleaseDelegator');

const uuidV4 = require('uuid/v4');

class ReleaseController extends BaseController {
  constructor(props) {
    super(props);

    this.ReleaseDelegator = new ReleaseDelegator(props);

    this.getRecentTracks = this.getRecentTracks.bind(this);
    this.getTrackDetail = this.getTrackDetail.bind(this);
    this.getTracksByArtist = this.getTracksByArtist.bind(this);
    this.getTracksByGenre = this.getTracksByGenre.bind(this);
    this.tipTrack = this.tipTrack.bind(this);

  }

  /**
   * params:
   * address
   */
  async getTrackDetail(Request, Response, next) {
    try {
      const trackLoad = await this.ReleaseDelegator.loadTrack(Request.params.address);
      if (trackLoad.error) {
        return this.reject(Request, Response, trackLoad.error);
      }
      const data = {
        track: trackLoad.data
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * params:
   * none
   */
  async getRecentTracks(Request, Response, next) {
    try {
      const limit = this.limit(Request.query.limit);
      const skip = this.skip(Request.query.skip);
      const tracksLoad = await this.ReleaseDelegator.loadRecentTracks(skip, limit);
      if (tracksLoad.error) {
        return this.reject(Request, Response, tracksLoad.error);
      }

      const data = {
        tracks: tracksLoad.data
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body:
   * trackAddress
   * musicoins
   */
  async tipTrack(Request, Response, next) {
    try {
      const musicoins = Request.body.musicoins || 10;
      const trackAddress = Request.body.trackAddress;
      const UBIMUSIC_ACCOUNT = this.constant.UBIMUSIC_ACCOUNT;
      const logger = this.logger;

      const validateResult = this.validate({
        trackAddress,
        musicoins
      }, this.schema.ReleaseSchema.tip);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }


      // find track
      const release = await this.ReleaseDelegator._loadTrack(trackAddress);
      if (!release) {
        return this.reject(Request, Response, "Track not found: " + trackAddress);
      }

      // find ubimusic
      const sender = await this.ReleaseDelegator._loadUser(UBIMUSIC_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: " + UBIMUSIC_ACCOUNT);
      }

      // send tip amount to track address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(UBIMUSIC_ACCOUNT, trackAddress, musicoins);
      logger.debug("tip complete: ", tx);
      // increase tip count
      const tipCount = release.directTipCount || 0;
      release.directTipCount = tipCount + musicoins;
      await release.save();
      logger.debug("update tipCount: ", release.directTipCount);

      // update release stats
      await this.ReleaseDelegator.updateTrackStats(release._id, musicoins);
      logger.debug("update ReleaseStats: ", trackAddress);

      const senderName = sender.draftProfile.artistName;
      const amountUnit = musicoins === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${musicoins} ${amountUnit} on "${release.title}"`;
      const threadId = uuidV4();
      // find track srtist
      const artist = await this.ReleaseDelegator._loadUser(release.artistAddress);
      const email = this.ReleaseDelegator.getUserEmail(artist);
      // send email to artist
      if (email) {
        logger.debug("tip notification to email: ", email);
        this.ReleaseDelegator.notifyTip(email, message, senderName, release.title, threadId);
      }

      // insert a track message to db
      await this.ReleaseDelegator.createTrackMessage(trackAddress, release.artistAddress, release._id,
        artist._id, sender._id, message, threadId);

      logger.debug("record track message complete");

      const data = {
        tx: tx
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * 
   * query:
   * genre
   * limit
   * skip
   */
  async getTracksByGenre(Request, Response, next) {
    try {
      const genre = Request.query.genre;
      const limit = this.limit(Request.query.limit);
      const skip = this.skip(Request.query.skip);

      const validateResult = this.validate({
        genre,
        limit
      }, this.schema.ReleaseSchema.byGenre);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const tracksLoad = await this.ReleaseDelegator.loadTracksByGenre(genre,skip,limit);
      if (tracksLoad.error) {
        return this.reject(Request, Response, tracksLoad.error);
      }

      const data = {
        tracks: tracksLoad.data
      }
      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * 
   * query:
   * artistAddress
   * limit
   * skip
   */
  async getTracksByArtist(Request, Response, next) {
    try {
      const artistAddress = Request.query.artistAddress;
      const limit = this.limit(Request.query.limit);
      const skip = this.skip(Request.query.skip);

      const validateResult = this.validate({
        artistAddress,
        limit
      }, this.schema.ReleaseSchema.byArtist);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult);
      }

      const tracksLoad = await this.ReleaseDelegator.loadTracksByArtist(artistAddress,skip,limit);
      if (tracksLoad.error) {
        return this.reject(Request, Response, tracksLoad.error);
      }

      const data = {
        tracks: tracksLoad.data
      }

      this.success(Request, Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}

module.exports = ReleaseController;