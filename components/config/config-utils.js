
const loadConfig = function(argsv) {
  const config = {
    web3Host: 'http://localhost:8545',
    ipfsHost: 'http://localhost:8080',
    port: 3000
  };
  argsv.forEach(function (val, index, array) {
    if (val == "--ipfs") {
      config.ipfsHost = array[index+1];
    }
    else if (val == "--web3") {
      config.web3Host = array[index+1];
    }
    else if (val == "--port") {
      config.port = parseInt(array[index+1]);
    }
  });
  console.log("Loaded config: " + JSON.stringify(config));
  return config;
};

module.exports.loadConfig = loadConfig;


