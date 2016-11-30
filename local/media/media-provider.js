const Promise = require("bluebird");
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');
const stream = require('stream');
const algorithm = 'aes-256-ctr';
const constant = '36e6f1d1cd2ff2cd7bb75a359';
const tmp = require("tmp");

// Supported formats
const RAW = "ipfs://";
const ENCRYPTED = "eipfs://";
const ZIP_ENCRYPTED = "zeipfs://";

function MediaProvider(licenseProvider, ipfsHost) {
  this.licenseProvider = licenseProvider;
  this.ipfsHost = ipfsHost;

  // private functions
  this._parseIpfsUrl = function(resourceUrl) {
    if (resourceUrl.startsWith(ZIP_ENCRYPTED)) {
      return this._createIpfsProxyOptions(resourceUrl, ZIP_ENCRYPTED);
    }
    else if (resourceUrl.startsWith(ENCRYPTED)) {
      return this._createIpfsProxyOptions(resourceUrl, ENCRYPTED);
    }
    else if (resourceUrl.startsWith(RAW)) {
      return this._createIpfsProxyOptions(resourceUrl, RAW);
    }
    return {err: new Error("Unsupported protocol: " + resourceUrl)};
  };

  this._createIpfsProxyOptions = function(url, protocol) {
    return {
      ipfsUrl: this.getIpfsUrl(url.substring(protocol.length)),
      decrypt: protocol == ENCRYPTED || protocol == ZIP_ENCRYPTED,
      unzip: protocol == ZIP_ENCRYPTED
    }
  };
}

MediaProvider.prototype.getRawIpfsResource = function(hash) {
  return this.getIpfsResource(RAW + hash);
};

MediaProvider.prototype.getIpfsResource = function(resourceUrl, keyProvider) {
  return new Promise(function(resolve, reject) {
    const options = this._parseIpfsUrl(resourceUrl);
    if (options.err) return reject(options.err);

    http.get(options.ipfsUrl, function (proxyRes) {
      var headers = proxyRes.headers;
      var stream = proxyRes;
      stream = options.decrypt ? stream.pipe(crypto.createDecipher(algorithm, keyProvider())) : stream;
      stream = options.unzip ? stream.pipe(zlib.createGunzip()) : stream;
      resolve({
        headers: headers,
        stream: stream
      });
    }).on('error', reject);
  }.bind(this));
};

MediaProvider.prototype.getLicenseResource = function(address) {
  return  this.licenseProvider.loadLicense(address)
    .bind(this)
    .then(function(license) {
      return this.getIpfsResource(license.resourceUrl, function() {
        return _computeKey(license.artist, license.title);
      }.bind(this));
    });
};

MediaProvider.prototype.getIpfsUrl = function(hash) {
  return this.ipfsHost + '/ipfs/' + hash;
};

const _computeKey = function(v1, v2) {
  const seed = v1 + " " + v2 + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
};

module.exports = MediaProvider;