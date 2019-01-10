const BaseController = require('../base/BaseController');

const uuidV4 = require('uuid/v4');
const moment = require('moment');
// email
const emailUtil = require("../../../utils/email");
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../../views/message.ejs");

const renderMessage = function (params, callback) {
  return renderFile(NOTIFICATION_HTML, {
    notification: params
  }, callback);
}

class ReleaseController extends BaseController {
  constructor(props) {
    super(props);

    this.getRecentTracks = this.getRecentTracks.bind(this);
    this.getTrackDetail = this.getTrackDetail.bind(this);
    this.getTracksByArtist = this.getTracksByArtist.bind(this);
    this.getTracksByGenre = this.getTracksByGenre.bind(this);
    this.tipTrack = this.tipTrack.bind(this);

    this.getUserEmail = this.getUserEmail.bind(this);
    this.updateReleaseStats = this.updateReleaseStats.bind(this);
    this._updateReleaseStats = this._updateReleaseStats.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
    
  }

  

  async getTrackDetail(Request, Response) {
    try {
      const release = await this.db.Release.findOne({
        contractAddress: Request.params.address
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "Track not found: " + Request.params.address);
      }

      const response = this.response.ReleaseResponse.responseData(release);
      this.success(Response, response);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getRecentTracks(Request, Response) {
    try {
      const limit = this.limit(Request.query.limit);
      const releases = await this.db.Release.find({
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
        artistAddress: {
          $in: this.getVerifiedArtist()
        }
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();
      
      const response = this.response.ReleaseResponse.responseList(releases);
      this.success(Response, response);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body:
   * trackAddress
   * musicoins
   */
  async tipTrack(Request, Response) {
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
        return this.reject(Request, Response, validateResult[0].message);
      }


      // find track
      const release = await this.db.Release.findOne({
        contractAddress: trackAddress
      }).exec();
      if (!release) {
        return this.reject(Request, Response, "Track not found: " + trackAddress);
      }

      // find ubimusic
      const sender = await this.db.User.findOne({
        profileAddress: UBIMUSIC_ACCOUNT
      }).exec();
      if (!sender) {
        return this.reject(Request, Response, "UBIMUSIC not found: " + UBIMUSIC_ACCOUNT);
      }

      // send tip amount to track address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(UBIMUSIC_ACCOUNT, trackAddress, musicoins);
      logger.debug("tip complete: ",tx);
      // increase tip count
      const tipCount = release.directTipCount || 0;
      release.directTipCount = tipCount + musicoins;
      await release.save();
      logger.debug("update tipCount: ",release.directTipCount);

      // update release stats
      await this.updateReleaseStats(release._id, musicoins);
      logger.debug("update ReleaseStats: ",trackAddress);

      const senderName = sender.draftProfile.artistName;
      const amountUnit = musicoins === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${musicoins} ${amountUnit} on "${release.title}"`;
      const threadId = uuidV4();
      // find track srtist
      const artist = await this.db.User.findOne({
        profileAddress: release.artistAddress
      }).exec();
      const email = this.getUserEmail(artist);
      // send email to artist
      if (email) {
        logger.debug("tip notification to email: ", email);
        const notification = {
          trackName: release.title || "",
          actionUrl: `https://musicoin.org/nav/thread-page?thread=${threadId}`,
          message: message,
          senderName: senderName
        };

        renderMessage(notification, (err, html) => {
          
          if (html) {
            const emailContent = {
              from: "musicoin@musicoin.org",
              to: email,
              subject: `${senderName} commented on ${release.title}`,
              html: html
            }

            emailUtil.send(emailContent).then(result => {
              logger.debug("tip notification complete: ", result);
            });
          }else{
            logger.debug(`tip notification error: `, err);
          }
        })
      }

      // insert a track message to db
      await this.db.TrackMessage.create({
        artistAddress: release.artistAddress,
        contractAddress: trackAddress,
        senderAddress: UBIMUSIC_ACCOUNT,
        release: release._id,
        artist: artist ? artist._id : null,
        sender: sender._id,
        message: message,
        replyToMessage: null,
        replyToSender: null,
        threadId: threadId,
        messageType: "tip"
      });

      logger.debug("record track message complete");

      this.success(Response, {
        tx: tx
      });
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getTracksByGenre(Request, Response) {
    try {
      const genre = Request.query.genre;
      const limit = this.limit(Request.query.limit);

      const validateResult = this.validate({
        genre,
        limit
      }, this.schema.ReleaseSchema.byGenre);

      if (validateResult !== true) {
        return this.reject(Request, Response, validateResult[0].message);
      }

      const releases = await this.db.Release.find({
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
        genres: genre
      }).limit(limit).exec();

      const response = this.response.ReleaseResponse.responseList(releases);
      this.success(Response, response);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getTracksByArtist(Request, Response) {
    try {
      const artistAddress = Request.query.artistAddress;
      const limit = this.limit(Request.query.limit);

      const validateResult = this.validate({
        artistAddress,
        limit
      },this.schema.ReleaseSchema.byArtist);

      if (validateResult !== true) {
        return this.reject(Request,Response, validateResult[0].message);
      }

      const releases = await this.db.Release.find({
        artistAddress,
        state: 'published',
        markedAsAbuse: {
          $ne: true
        },
      }).sort({
        releaseDate: 'desc'
      }).limit(limit).exec();

      const response = this.response.ReleaseResponse.responseList(releases);

      this.success(Response, response);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  getUserEmail(user) {
    if (!user) return null;
    if (user.preferredEmail) return user.preferredEmail;
    if (user.local && user.local.email) return user.local.email;
    if (user.google && user.google.email) return user.google.email;
    if (user.facebook && user.facebook.email) return user.facebook.email;
    if (user.twitter && user.twitter.email) return user.twitter.email;
    if (user.invite && user.invite.invitedAs) return user.invite.invitedAs;
    return null;
  }

  async updateReleaseStats(releaseId, amount) {
    const updatePromise = this._updateReleaseStats;
    const now = Date.now();
    return Promise.all(this.constant.DATE_PERIOD.map(duration => {
      return updatePromise(releaseId, now, duration, amount)
    }));
  }

  _updateReleaseStats(releaseId, startDate, duration, amount) {
    const where = {
      release: releaseId,
      startDate: this.getDatePeriodStart(startDate, duration),
      duration
    }

    const updateParams = {
      $inc: {
        tipCount: amount
      }
    }

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return this.db.ReleaseStats.findOneAndUpdate(
      where,
      updateParams,
      options
    ).exec();
  }

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
  }
}

module.exports = ReleaseController;