const BaseController = require('../base/BaseController');

const User = require('../../../db/core/user');
const UserStats = require('../../../db/core/user-stats');
const TrackMessage = require('../../../db/core/track-message');
const Release = require('../../../db/core/release');
const Hero = require('../../../db/core/hero');

const MediaProvider = require('../../../utils/media-provider-instance');
const ArtistModule = require('../../Kernel').musicoinCore.getArtistModule();

const ArtistModel = require('../../data/artist-model');
const ReleaseModel = require('../../data/release-model');

const moment = require('moment');
const uuidV4 = require('uuid/v4');
const emailUtil = require("../../../utils/email");
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../../views/message.ejs");

const renderMessage = function (params, callback) {
  return renderFile(NOTIFICATION_HTML, {notification: params}, callback);
}

class ArtistController extends BaseController{
  constructor(props){
    super(props);

    this.getArtistDescription = this.getArtistDescription.bind(this);
    this.getProfileByAddress = this.getProfileByAddress.bind(this);
    this.getArtistOfWeek = this.getArtistOfWeek.bind(this);
    this.tipArtist = this.tipArtist.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
    this.updateArtistStats = this.updateArtistStats.bind(this);
    this._updateArtistStats = this._updateArtistStats.bind(this);
    this.getUserEmail = this.getUserEmail.bind(this);
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
      this.error(Resquest,Response, error);
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
      const desc = await MediaProvider.fetchTextFromIpfs(artist.descriptionUrl);
      this.success(Response,{
        ...ArtistModel.responseData(address, artist),
        description: desc
      });
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body:
   * artistAddress
   * musicoins
   */
  async tipArtist(Request, Response) {
    const artistAddress = Request.body.artistAddress;
    const amount = Request.body.musicoins || 10;

    if (!artistAddress) {
      return this.reject(Request, Response, "artist address is required");
    }

    try {
      // find artist
      const artist = await User.findOne({
        profileAddress: artistAddress
      }).exec();
      if (!artist) {
        return this.reject(Request, Response, "artist not found: " + artistAddress);
      }

      // find abimusic
      const sender = await User.findOne({
        profileAddress: this.constant.UBIMUSIC_ACCOUNT
      }).exec();
      if(!sender){
        return this.reject(Request, Response, "UBIMUSIC not found: " + this.constant.UBIMUSIC_ACCOUNT);
      }

      // send tip amount to track address
      const tx = await ArtistModule.sendFromProfile(this.constant.UBIMUSIC_ACCOUNT, artistAddress, amount);
      // increase tip count
      const tipCount = artist.directTipCount || 0;
      artist.directTipCount = tipCount + amount;
      await artist.save();

      // update release stats
      await this.updateArtistStats(artist._id, amount);
      const senderName = sender.draftProfile.artistName;
      const amountUnit = amount === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${amount} ${amountUnit} on "${artist.draftProfile.artistName}"`;
      const threadId = uuidV4();
  
      const email = this.getUserEmail(artist);
      // send email to artist
      if (email) {
        const notification = {
          trackName: null,
          actionUrl: `https://musicoin.org/nav/thread-page?thread=${threadId}`,
          message: message,
          senderName: senderName
        };

        renderMessage(notification, (err, html) => {
          console.log("email error: ",err);
          if (html) {
            const emailContent = {
              from: "musicoin@musicoin.org",
              to: email,
              subject: `${senderName} sent you a message!`,
              html: html
            }

            emailUtil.send(emailContent).then(result => {
              console.log("email send complete: ", result);
            });
          }
        })
      }
      
      // insert a track message to db
      await TrackMessage.create({
        artistAddress: artistAddress,
        contractAddress: null,
        senderAddress: this.constant.UBIMUSIC_ACCOUNT,
        release: null,
        artist: artist?artist._id:null,
        sender: sender._id,
        message: message,
        replyToMessage: null,
        replyToSender: null,
        threadId: threadId,
        messageType: "tip"
      });

      this.success(Response, {
        tx: tx
      });

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getArtistOfWeek(Request, Response) {
    try {
      // find the record of week
      const heros = await Hero.find().sort({
        startDate: -1
      }).limit(1).exec();
      const hero = heros ? heros[0] : null;
      if (!hero) {
        return this.reject(Request, Response, "not found artist");
      }

      // load release of the record
      const release = await Release.findOne({
        contractAddress: hero.licenseAddress
      }).exec();

      if (!release) {
        return this.reject(Request, Response, "not found track");
      }
      const track = ReleaseModel.responseData(release);
      // load artist by address
      const _artist = await ArtistModule.getArtistByProfile(track.artistAddress);

      if(!_artist){
        return this.reject(Request, Response, "not found artist");
      }

      const artist = ArtistModel.responseData(track.artistAddress, _artist);

      const data = {
        label: hero.label,
        track,
        artist
      }

      this.success(Response, data);
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

  async updateArtistStats(userId, amount) {
    const updatePromise = this._updateArtistStats;
    const now = Date.now();
    return Promise.all(this.constant.DATE_PERIOD.map(duration => {
      return updatePromise(userId, now, duration, amount)
    }));
  }

  _updateArtistStats(userId, startDate, duration, amount) {
    const where = {
      user: userId,
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
    return UserStats.findOneAndUpdate(
      where,
      updateParams,
      options
    ).exec();
  }

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
  }
}



module.exports = ArtistController;