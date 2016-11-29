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

function MediaProvider(contractProvider, ipfsHost) {
  this.contractProvider = contractProvider;
  this.ipfsHost = ipfsHost;
}

MediaProvider.prototype.handleRequest = function(request, response) {
  this.contractProvider.loadLicense(request.params.address)
    .bind(this)
    .then(function(license) {
      const resourceUrl = license.resourceUrl;
      if (!resourceUrl) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("Contract did not have a resource URL" + "\n");
        response.end();
        return;
      }

      const onError = function (err) {
        console.log(err);
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
      };

      if (resourceUrl.startsWith(RAW)) {
        console.log("Pass through");
        const hash = resourceUrl.substr(RAW.length);
        http.get(this.getIpfsUrl(hash), function (proxyRes) {
          response.writeHead(200, proxyRes.headers);
          proxyRes.pipe(response);
        })
          .on('error', onError);
      }
      else {
        const password = this.computeKey(license.artist, license.title);
        const decrypt = crypto.createDecipher(algorithm, password);
        if (resourceUrl.startsWith(ENCRYPTED)) {
          console.log("Decrypting content and returning ");
          const hash = resourceUrl.substr(ENCRYPTED.length);
          http.get(this.getIpfsUrl(hash), function (proxyRes) {
            response.writeHead(200, proxyRes.headers);
            proxyRes.pipe(decrypt).pipe(response);
          })
            .on('error', onError);
        }
        else if (resourceUrl.startsWith(ZIP_ENCRYPTED)) {
          console.log("Decrypting and unzipping content and returning ");
          const hash = resourceUrl.substr(ZIP_ENCRYPTED.length);
          const unzip = zlib.createGunzip();
          http.get(this.getIpfsUrl(hash), function (proxyRes) {
            response.writeHead(200, proxyRes.headers);
            proxyRes.pipe(decrypt).pipe(unzip).pipe(response);
          })
            .on('error', onError);
        }
        else {
          response.writeHead(404);
          response.write("Could not find resource for %s, resourceUrl was %s\n", licenseAddress, resourceUrl);
          response.end();
        }
      }
    });
};

MediaProvider.prototype.getIpfsUrl = function(hash) {
  return this.ipfsHost + '/ipfs/' + hash;
};

MediaProvider.prototype.computeKey = function(v1, v2) {
  const seed = v1 + " " + v2 + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
};

module.exports = MediaProvider;