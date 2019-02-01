const BaseController = require('../base/BaseController');
const ArtistDelegator = require('../../Delegator/ArtistDelegator');

const uuidV4 = require('uuid/v4');

class ArtistController extends BaseController{
  constructor(props){
    super(props);

    this.ArtistDelegator = new ArtistDelegator(props);

    this.getProfileByAddress = this.getProfileByAddress.bind(this);
    this.getArtistOfWeek = this.getArtistOfWeek.bind(this);
    this.tipArtist = this.tipArtist.bind(this);
  }

  /**
   * pramas:
   * address
   */
  async getProfileByAddress(Request, Response, next) {
    try {
      const address = Request.params.address;

      const result = await this.ArtistDelegator.loadArtist(address);
      if (result.error) {
        return this.reject(Request, Response, result.error);
      }

      const data = {
        artist: result.data
      }

      this.success(Request,Response,next,data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  /**
   * body:
   * artistAddress
   * musicoins
   */
  async tipArtist(Request, Response, next) {
    const artistAddress = Request.body.artistAddress;
    const amount = Request.body.musicoins || 10;
    const logger = this.logger;

    if (!artistAddress) {
      return this.reject(Request, Response, "artist address is required");
    }

    try {
      // find artist
      const artist = await this.ArtistDelegator._loadUser(artistAddress);
      if (!artist) {
        return this.reject(Request, Response, "artist not found: "+artistAddress);
      }

      // find ubimusic
      const sender = await await this.ArtistDelegator._loadUser(this.constant.UBIMUSIC_ACCOUNT);
      if (!sender) {
        return this.reject(Request, Response, "sender not found: "+this.constant.UBIMUSIC_ACCOUNT);
      }

      // send tip amount to track address
      const tx = await this.MusicoinCore.getArtistModule().sendFromProfile(this.constant.UBIMUSIC_ACCOUNT, artistAddress, amount);
      logger.debug("tip complete: ", tx);
      // increase tip count
      const tipCount = artist.directTipCount || 0;
      artist.directTipCount = tipCount + amount;
      await artist.save();
      logger.debug("update tipCount: ", artist.directTipCount);

      // update release stats
      await this.ArtistDelegator.updateArtistStats(artist._id, amount);
      logger.debug("update UserStats: ", artistAddress);

      const senderName = sender.draftProfile.artistName;
      const amountUnit = amount === 1 ? "coin" : "coins";
      const message = `${senderName} tipped ${amount} ${amountUnit} on "${artist.draftProfile.artistName}"`;
      const threadId = uuidV4();

      const email = this.ArtistDelegator.getUserEmail(artist);
      // send email to artist
      if (email) {
        logger.debug("tip notification to email: ", email);
        this.ArtistDelegator.notifyTip(email,message, senderName, threadId);
      }
      
      // insert a track message to db
      await this.ArtistDelegator.createTrackMessage(artistAddress, artist._id, sender._id, message, threadId);
      logger.debug("record track message complete");

      const data = {
        tx: tx
      }
      this.success(Request,Response, next, data);

    } catch (error) {
      this.error(Request, Response, error);
    }
  }

  async getArtistOfWeek(Request, Response, next) {
    try {
      // find the record of week
      const heroLoad = await this.ArtistDelegator.loadLatestHero();
      if (heroLoad.error) {
        return this.reject(Request, Response, heroLoad.error);
      }
      const hero = heroLoad.data;

      // load release of the record
      const trackLoad = await this.ArtistDelegator.loadTrack(hero.licenseAddress);
      if(trackLoad.error){
        return this.reject(Request, Response, trackLoad.error);
      }

      const track = trackLoad.data;
      // load artist by address
      const artistLoad = await this.ArtistDelegator.loadArtist(track.artistAddress);
      if(artistLoad.error){
        return this.reject(Request, Response, artistLoad.error);
      }
      const artist = artistLoad.data;

      const data = {
        label: hero.label,
        track,
        artist
      }

      this.success(Request,Response, next, data);
    } catch (error) {
      this.error(Request, Response, error);
    }
  }
}



module.exports = ArtistController;