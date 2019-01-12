const ControllerDelegator = require('./ControllerDelegator');
const request = require('request');
const CLIENT_ID = "OLDjonAeYPx6ZVKaMD3a";

class TrackDelegator extends ControllerDelegator {

  constructor(props){
    super(props);

    this.getLicenseKey = this.getLicenseKey.bind(this);
    this.loadLicense = this.loadLicense.bind(this);
  }

  getLicenseKey(licenseAddress) {
    return new Promise((resolve, reject)=>{
      request({
        url: `http://35.186.250.94/license/ppp/${licenseAddress}`,
        json: true,
        headers: {
          clientID: CLIENT_ID
        }
      }, function (error, response, result) {
        if (error) {
          reject(error);
        }else if (response.statusCode != 200) {
          reject("not found");
        }else{
          resolve(result);
        }
      })
    })
  }

  loadLicense(licenseAddress){
    return this.MusicoinCore.getLicenseModule().getLicense(licenseAddress);
  }

}

module.exports = TrackDelegator;