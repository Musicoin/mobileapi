const express = require('express');
const request = require('request');
const JsonPromiseRouter = require('./json-promise-router');
const expressRouter = express.Router();
const router = new JsonPromiseRouter(expressRouter, "tx");
let txModule;

router.get('/detail/:hash', req => txModule.getTransactionDetails(req.params.hash));
router.get('/raw/:hash', req => txModule.getTransaction(req.params.hash));
router.get('/receipt/:hash', req => txModule.getTransactionReceipt(req.params.hash));
router.get('/status/:hash', req => txModule.getTransactionStatus(req.params.hash));
router.get('/history/:address', req => {
  return getJson("http://orbiter.musicoin.org/addr", {
    addr: req.params.address,
    length: typeof req.query.length != "undefined" ? req.query.length : 10,
    start: req.query.start
  })
    .then(function(results) {
      return results.data.map(r => {
        return txModule.getTransactionDetails(r[0])
          .then(function (details) {
            details.blockNumber = r[1];
            details.internal = {
              from: r[2],
              to: r[3]
            };
            details.musicoins = r[4];
            details.timestamp = r[6];
            return details;
          });
      })
    })
    .then(function(promises) {
      return Promise.all(promises);
    })
});

function getJson(url, properties) {
  return new Promise(function(resolve, reject) {
    request({
      method: 'post',
      url: url,
      body: properties,
      json: true,
    }, function(error, response, result) {
      if (error) {
        console.log(`Request failed with ${error}, url: ${url}, properties: ${JSON.stringify(properties)}`);
        return reject(error);
      }
      resolve(result)
    })
  }.bind(this));
}

module.exports.init = function(_txModule) {
  txModule = _txModule;
  return expressRouter;
};
