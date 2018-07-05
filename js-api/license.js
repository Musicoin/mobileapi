const Release = require('../components/models/release');
const UserPlayback = require('../components/models/user-playback');

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
  const filter = genre ? {
    state: 'published',
    genres: genre,
    markedAsAbuse: {
      $ne: true
    }
  } : {
    state: 'published',
    markedAsAbuse: {
      $ne: true
    }
  };
  return this.getLicensesForEntries(filter, limit);
}

LicenseModule.prototype.getLicensesForEntries = function(condition, limit, sort) {

  return this.getReleaseEntries(condition, limit, sort)
    .then(items => items.map(item => this.convertDbRecordToLicense(item)))
    .then(promises => Promise.all(promises));
}

LicenseModule.prototype.getReleaseEntries = function(condition, limit, _sort) {
  let sort = _sort ? _sort : {
    releaseDate: 'desc'
  };
  let query = Release.find(condition).sort(sort);
  if (limit) {
    query = query.limit(limit);
  }

  return query.exec()
}

LicenseModule.prototype.convertDbRecordToLicense = function(record) {
  return this.getLicense(record.contractAddress)
    .bind(this)
    .then(function(license) {
      if (!license.artistName)
        license.artistName = record.artistName || 'Musicoin';

      license.genres = record.genres;
      license.languages = record.languages;
      license.moods = record.moods;
      license.regions = record.regions;

      license.description = record.description;
      license.directTipCount = record.directTipCount || 0;
      license.directPlayCount = record.directPlayCount || 0;
      license.releaseDate = record.releaseDate;
      license.tx = record.tx;
      license.markedAsAbuse = record.markedAsAbuse;
      license.pendingUpdateTxs = record.pendingUpdateTxs;
      return license;
    })
}

//LicenseModule.prototype.getRecentPlays = function(limit) {
//  // grab the top 2*n from the db to try to get a distinct list that is long enough.
//  return UserPlayback.find({}).sort({ playbackDate: 'desc' }).limit(limit).exec()
//    .then(records => records.map(r => r.contractAddress))
//    .then(addresses => Array.from(new Set(addresses))) // insertion order is preserved
//    .then(addresses => addresses.map(address => this.getLicense(address)))
//}

LicenseModule.prototype.getTopPlayed = function(limit, genre) {
  const filter = genre ? {
    state: 'published',
    genres: genre
  } : {
    state: 'published'
  };
  return this.getLicensesForEntries(filter, limit, {
      directPlayCount: 'desc'
    })
    .then(function(licenses) {
      // secondary sort based on plays recorded in the blockchain.  This is the number that will
      // show on the screen, but it's too slow to pull all licenses and sort.  So, sort fast with
      // our local db, then resort top results to it doesn't look stupid on the page.
      return licenses.sort((a, b) => {
        const v1 = a.playCount ? a.playCount : 0;
        const v2 = b.playCount ? b.playCount : 0;
        return v2 - v1; // descending
      });
    });
}

LicenseModule.prototype.getLicensesForEntries = function(condition, limit, sort) {
  return this.getReleaseEntries(condition, limit, sort)
    .then(items => items.map(item => this.convertDbRecordToLicense(item)))
    .then(promises => bluebird_1.Promise.all(promises));
}

LicenseModule.prototype.getWeb3Reader = function() {
  return this.web3Reader;
};

module.exports = LicenseModule;
