const Release = require('../components/models/release');

function LicenseModule(web3Reader, web3Writer) {
  this.web3Reader = web3Reader;
  this.web3Writer = web3Writer;
};

/**
 * @param {string} address
 * @returns {*|Promise.<TResult>}
 */
LicenseModule.prototype.getLicense = function(address) {
  return this.web3Reader.loadLicense(address)
};

LicenseModule.prototype.getAudioLicense = function(contractAddress) {
  console.log("Getting license: " + contractAddress);
  return Release.findOne({
      contractAddress: contractAddress,
      state: 'published'
    }).exec()
    .then(record => {
      if (record)
        return this.convertDbRecordToLicense(record);
      return null;
    });
}

LicenseModule.prototype.releaseLicense = function(releaseRequest, credentialsProvider) {
  return this.web3Writer.releaseLicense(releaseRequest, credentialsProvider);
};

LicenseModule.prototype.ppp = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.ppp(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.distributeBalance = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.distributeLicenseBalance(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.updatePPPLicense = function(licenseAddress, credentialsProvider) {
  return this.web3Writer.updatePPPLicense(licenseAddress, credentialsProvider);
};

LicenseModule.prototype.getNewReleases = function(limit, genre) {
  const filter = genre ? { state: 'published', genres: genre, markedAsAbuse: { $ne: true } } : { state: 'published', markedAsAbuse: { $ne: true } };
  return this.getLicensesForEntries(filter, limit);
}

LicenseModule.prototype.getLicensesForEntries = function(condition, limit, sort) {

  return this.getReleaseEntries(condition, limit, sort)
    .then(items => items.map(item => this.convertDbRecordToLicense(item)))
    .then(promises => Promise.all(promises));
}

LicenseModule.prototype.getReleaseEntries = function(condition, limit, _sort) {
    let sort = _sort ? _sort : { releaseDate: 'desc' };
    let query = Release.find(condition).sort(sort);
    if (limit) {
      query = query.limit(limit);
    }

    return query.exec()
}

LicenseModule.prototype.convertDbRecordToLicense = function(record) {
    return this.getLicense(record.contractAddress)
      .bind(this)
      .then(function (license) {
        if (!license.artistName)
          license.artistName = record.artistName || 'Musicoin';

        license.genres = record.genres;
        license.languages = record.languages;
        license.moods = record.moods;
        license.regions = record.regions;

        license.description = record.description;
        license.timeSince = this._timeSince(record.releaseDate);
        license.directTipCount = record.directTipCount || 0;
        license.directPlayCount = record.directPlayCount || 0;
        license.releaseDate = record.releaseDate;
        license.tx = record.tx;
        license.markedAsAbuse = record.markedAsAbuse;
        license.pendingUpdateTxs = record.pendingUpdateTxs;
        return license;
      })
}

LicenseModule.prototype.getWeb3Reader = function() {
  return this.web3Reader;
};

module.exports = LicenseModule;
