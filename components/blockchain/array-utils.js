const Promise = require('bluebird');

/*
 * Some nasty code to deal with not knowing the length of the arrays in the contract.  Future versions
 * of the contracts should expose the length and then most of this will go away.
 */

const extractArray = function(provider, length) {
  var promises = [];
  for (var idx=0; idx < length; idx++) {
    promises.push(provider(idx));
  }
  return Promise.all(promises);
};

const extractAddressArray = function(provider, startIdx, result) {
  return new Promise(function(resolve, reject) {
    var output = result || [];
    var idx = startIdx || 0;
    provider(idx)
      .bind(this)
      .then(function(value) {
        if (value != "0x") {
          output.push(value);
          resolve(extractAddressArray(provider, idx+1, output));
        }
        else {
          resolve(output);
        }
      });
  })
};

const extractAddressAndValues = function(addressArray, valueArray, valueName) {
  const ctx = {};
  return extractAddressArray(addressArray, 0)
    .then(function(addresses) {
      ctx.addresses = addresses;
      return extractArray(valueArray, addresses.length);
    })
    .then(function(values) {
      return ctx.addresses.map(function(address, idx) {
        const output = {};
        output["address"] = address;
        output[valueName] = values[idx];
        return output;
      });
    });
};

module.exports.extractArray = extractArray;
module.exports.extractAddressArray = extractAddressArray;
module.exports.extractAddressAndValues = extractAddressAndValues;
