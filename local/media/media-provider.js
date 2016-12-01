const Promise = require("bluebird");
const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');
const stream = require('stream');
const algorithm = 'aes-256-ctr';
const tmp = require("tmp");

// Supported formats
const RAW = "ipfs://";
const ENCRYPTED = "eipfs://";
const ZIP_ENCRYPTED = "zeipfs://";

function MediaProvider(ipfsHost) {
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
    const hash = url.substring(protocol.length);
    return {
      hash: hash,
      ipfsUrl: this.getIpfsUrl(hash),
      decrypt: protocol == ENCRYPTED || protocol == ZIP_ENCRYPTED,
      unzip: protocol == ZIP_ENCRYPTED
    }
  };
}

MediaProvider.prototype.resolveIpfsUrl = function(url) {
  const parsed = this._parseIpfsUrl(url);
  if (parsed.err) throw new Error("Could not parse URL: " + url);
  return "/ipfs/" + parsed.hash;
};

MediaProvider.prototype.readJsonFromIpfs = function(url) {
  return this.readTextFromIpfs(url)
    .then(function(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return {error: "Could not parse JSON: '" + e + "'"};
      }
    })
};

MediaProvider.prototype.readTextFromIpfs = function(url) {
  return this.getIpfsResource(url)
    .then(function(result) {
      return new Promise(function(resolve, reject) {
        var content = '';
        result.stream.on('data', function(d){ content += d; });
        result.stream.on('end', function() {
          resolve(content);
        });
        result.stream.on('err', reject);
      })
    });
};

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

MediaProvider.prototype.getIpfsUrl = function(hash) {
  return this.ipfsHost + '/ipfs/' + hash;
};

module.exports = MediaProvider;