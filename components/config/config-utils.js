const loadConfig = function(argsv) {
  let config = getDefaultKeyValueConfig();

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

function getDefaultKeyValueConfig() {
  return {
    web3Endpoint: process.env.WEB3_ENDPOINT || 'http://localhost:8545',
    ipfsReadEndpoint: process.env.IPFS_READ_ENDPOINT || 'http://localhost:8080',
    ipfsAddEndpoint: process.env.IPFS_ADD_ENDPOINT || 'http://localhost:5001',
    mongoEndpoint: process.env.MONGO_ENDPOINT || "mongodb://localhost",
    port: process.env.MUSICOIN_API_PORT || 3000,
    publishingAccount: process.env.PUBLISHING_ACCOUNT || "0xe5233d15f4993c83f066575accde2ce10e369188",
    publishingAccountPassword: process.env.PUBLISHING_ACCOUNT_PASSWORD || "dummy1",
    paymentAccount: process.env.PAYMENT_ACCOUNT || "0xe5233d15f4993c83f066575accde2ce10e369188",
    paymentAccountPassword: process.env.PAYMENT_ACCOUNT_PASSWORD || "dummy1",
    contractOwnerAccount: process.env.CONTRACT_OWNER_ACCOUNT || "0xe5233d15f4993c83f066575accde2ce10e369188",
    mashapeSecret: process.env.MASHAPE_SECRET || "mashapeSecret"
  };
}

module.exports.loadConfig = loadConfig;


