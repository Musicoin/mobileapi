const request = require('request');

const loadConfig = function(argsv) {
  let config = Object.assign(getDefaultKeyValueConfig(), getInstanceVariables());

  const cmdLineOverrides = convertArgsToKeyValuePairs(argsv);

  // Override defaults
  Object.assign(config, cmdLineOverrides);

  // computed values (N.B. make sure this is *after* defaults have been overridden)
  Object.assign(config, getComputedKeyValuePairs(config));

  // Allow computed values to be overridden directly from the command line
  Object.assign(config, cmdLineOverrides);
  return Promise.resolve(getStructuredConfig(config));
};

function getStructuredConfig(keyValuePairs) {
  return keyValuePairs;
}

function convertArgsToKeyValuePairs(argsv) {
  const config = {};
  argsv.forEach(function (val, index, array) {
    if (val.startsWith("--")) {
      config[val.substr(2)] = array[index+1];
    }
  });
  return config;
}

function getComputedKeyValuePairs(config) {
  return {
    web3Url: config.web3Endpoint,
    ipfsReadUrl: config.ipfsReadEndpoint,
    ipfsAddUrl: `${config.ipfsAddEndpoint}/api/v0/add`,
    keyDatabaseUrl: `${config.mongoEndpoint}/key-store`
  };
}

function getInstanceVariables() {
  // curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/?recursive=true" -H "Metadata-Flavor: Google" | less
  return new Promise(function(resolve, reject) {
    request({
      url: "http://metadata.google.internal/computeMetadata/v1/instance/attributes/",
      qs: {
        recursive: true
      },
      json: true,
      headers: {
        "Metadata-Flavor": "Google"
      }
    }, function(error, response, result) {
      if (error) {
        console.log(`Failed to load instance variables: ${error}`);
      }
      else if (response.statusCode != 200) {
        console.log(`Failed to load instance variables: ${response}`);
      }
      resolve(result);
    })
  }.bind(this));
}

function getDefaultKeyValueConfig() {
  console.log(JSON.stringify(getInstanceVariables(), null, 2));
  let env = Object.assign({}, process.env, {});
  return {
    web3Endpoint: env.WEB3_ENDPOINT || 'http://localhost:8545',
    ipfsReadEndpoint: env.IPFS_READ_ENDPOINT || 'http://localhost:8080',
    ipfsAddEndpoint: env.IPFS_ADD_ENDPOINT || 'http://localhost:5001',
    mongoEndpoint: env.MONGO_ENDPOINT || "mongodb://localhost",
    port: env.MUSICOIN_API_PORT || 3000,
    publishingAccount: env.PUBLISHING_ACCOUNT || "0xf527a9a52b77f6c04471914ad57c31a8ae104d71",
    publishingAccountPassword: env.PUBLISHING_ACCOUNT_PASSWORD || "dummy1",
    paymentAccount: env.PAYMENT_ACCOUNT || "0xf527a9a52b77f6c04471914ad57c31a8ae104d71",
    paymentAccountPassword: env.PAYMENT_ACCOUNT_PASSWORD || "dummy1",
    contractOwnerAccount: env.CONTRACT_OWNER_ACCOUNT || "0xf527a9a52b77f6c04471914ad57c31a8ae104d71",
    mashapeSecret: env.MASHAPE_SECRET || "mashapeSecret",
    musicoinOrgClientID: env.MUSICOIN_ORG_CLIENT_ID || "clientID",
    musicoinOrgClientSecret: env.MUSICOIN_ORG_CLIENT_SECRET || "clientSecret",
    orbiterEndpoint: env.ORBITER_ENDPOINT || "http://orbiter.musicoin.org/internal",
    maxCoinsPerPlay: env.MAX_COINS_PER_PLAY || 1
  };
}

module.exports.loadConfig = loadConfig;


