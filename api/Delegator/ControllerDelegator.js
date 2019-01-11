const BaseController = require('../Controllers/base/BaseController');


const MediaProvider = require('../../utils/media-provider-instance');

const moment = require('moment');
const renderFile = require("ejs").renderFile;
const path = require("path");
const NOTIFICATION_HTML = path.join(__dirname, "../views/message.ejs");

class ControllerDelegator extends BaseController{
  constructor(props){
    super(props);
    
    this.renderMessage = this.renderMessage.bind(this);
    this.getUserEmail = this.getUserEmail.bind(this);
    this.getDatePeriodStart = this.getDatePeriodStart.bind(this);
    this.updateTipStats = this.updateTipStats.bind(this);
    this._loadUser = this._loadUser.bind(this);
    this._loadApiUser = this._loadApiUser.bind(this);

    this.MediaProvider = MediaProvider;

  }

  /**
   * render email notification html
   * @param {*} notification 
   * @param {*} callback 
   */
  renderMessage(notification, callback){
    return renderFile(NOTIFICATION_HTML, {notification}, callback);
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

  getDatePeriodStart(startDate, duration) {
    return duration === "all" ? 0 : moment(startDate).startOf(duration);
  }

  /**
   * update tip count
   * @param {*} db_table 
   * @param {*} conditions 
   * @param {*} tips 
   * @returns promise
   */
  updateTipStats(db_table, conditions, tips){
    const updateParams = {
      $inc: {
        tipCount: tips
      }
    }
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    return db_table.findOneAndUpdate(
      conditions,
      updateParams,
      options
    ).exec();
  }

  _loadUser(profileAddress){
    return this.db.User.findOne({
      profileAddress: profileAddress
    }).exec();
  }

  _loadApiUser(email){
    return this.db.ApiUser.findOne({
      email: email
    }).exec();
  }

}

module.exports = ControllerDelegator;