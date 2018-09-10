const request = require('request');

const loadConfig = function(argsv) {
  const config = getDefaultKeyValueConfig()
  const cmdLineOverrides = convertArgsToKeyValuePairs(argsv);
  // Override defaults
  Object.assign(config, cmdLineOverrides);
  // computed values (N.B. make sure this is *after* defaults have been overridden)
  Object.assign(config, getComputedKeyValuePairs(config));
  // Allow computed values to be overridden directly from the command line
  Object.assign(config, cmdLineOverrides);
  return getStructuredConfig(config);
};

function getStructuredConfig(keyValuePairs) {
  return keyValuePairs;
}

function convertArgsToKeyValuePairs(argsv) {
  const config = {};
  argsv.forEach(function(val, index, array) {
    if (val.startsWith("--")) {
      config[val.substr(2)] = array[index + 1];
    }
  });
  return config;
}

function getComputedKeyValuePairs(config) {
  return {
    web3Url: config.web3Endpoint,
    ipfsReadUrl: config.ipfsReadEndpoint,
    ipfsAddUrl: `${config.ipfsAddEndpoint}/api/v0/add`,
    keyMainDatabaseUrl: `${config.mongoEndpoint}/musicoin-org`,
    keyCoreDatabaseUrl: `${config.mongoEndpoint}/key-store`,
    sessionSecretKey: config.sessionSecretKey
  };
}

function getInstanceVariables() {
  // curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/?recursive=true" -H "Metadata-Flavor: Google" | less
  return new Promise(function(resolve, reject) {
      request({
        url: "http://metadata.google.internal/computeMetadata/v1/instance/attributes/?recursive=true&alt=json",
        json: true,
        headers: {
          "Metadata-Flavor": "Google"
        }
      }, function(error, response, result) {
        if (error) {
          reject(new Error(`Failed to load instance variables: ${error}`))
        } else if (response.statusCode != 200) {
          reject(new Error(`Failed to load instance variables: ${response}`));
        } else {
          console.log(`Successfully retrieved values from google metadata service: ${JSON.stringify(result, null, 2)}`);
          resolve(result);
        }
      })
    }.bind(this))
    .catch(err => {
      console.log(`Error getting instance variables: ${err}`)
      return {}
    });
}

function getDefaultKeyValueConfig() {
  const env = process.env;
  return {
    web3Endpoint: env.WEB3_ENDPOINT || 'http://localhost:8545',
    ipfsReadEndpoint: env.IPFS_READ_ENDPOINT || 'http://localhost:8080',
    ipfsAddEndpoint: env.IPFS_ADD_ENDPOINT || 'http://localhost:5001',
    mongoEndpoint: env.MONGO_ENDPOINT || "mongodb://localhost",
    port: env.MUSICOIN_API_PORT || 3000,
    publishingAccount: env.PUBLISHING_ACCOUNT || "0x6e1d33f195e7fadcc6da8ca9e36d6d4d717cf504",
    publishingAccountPassword: env.PUBLISHING_ACCOUNT_PASSWORD || "dummy",
    paymentAccount: env.PAYMENT_ACCOUNT || "0xfef55843244453abc7e183d13139a528bdfbcbed",
    paymentAccountPassword: env.PAYMENT_ACCOUNT_PASSWORD || "dummy",
    contractOwnerAccount: env.CONTRACT_OWNER_ACCOUNT || "0x6e1d33f195e7fadcc6da8ca9e36d6d4d717cf504",
    orbiterEndpoint: env.ORBITER_ENDPOINT || "https://explorer.musicoin.org",
    maxCoinsPerPlay: env.MAX_COINS_PER_PLAY || 1,
    sessionSecretKey: env.SESSION_SECRET_KEY || 'secret',
    contractVersion: env.CONTRACT_VERSION || "v0.3",
    forwardingAddress: env.FORWARDING_ADDRESS || '0x0',
    MailClient: {
      email: "sample@gmail.com",
      host: "smtp.gmail.com",
      port: 465,
      transportMethod: "SMTP",
      auth: {
        "user": "sample@gmail.com",
        "pass": "sample"
      }
    }
  };
}

module.exports.loadConfig = loadConfig;
