const crypto = require('crypto');
const constant = '36e6f1d1cd2ff2cd7bb75a359';

const _computeKey = function(resourceSeed) {
  const seed = resourceSeed + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
};

const _makeSeed = function(data) {
  return crypto.createHash('md5')
    .update(Date.now() + data)
    .digest("hex");
};

const _makeKey = function(data) {
  const seed = _makeSeed(data);
  return {
    seed: seed,
    key: _computeKey(seed)
  };
};


module.exports.computeKey = _computeKey;
module.exports.makeSeed = _makeSeed;
module.exports.makeKey = _makeKey;