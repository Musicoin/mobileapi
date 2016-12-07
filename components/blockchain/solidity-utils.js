const fs = require('fs');

const loadContractDefinition = function(sha3, definitionFile) {
  const params = JSON.parse(fs.readFileSync(definitionFile));
  const code = "0x" + fs.readFileSync(__dirname + "/../../" + params.codeFile);
  return Object.freeze({
    version: params.version,
    code: code,
    deploymentGas: params.deploymentGas,
    codeHash: sha3(code),
    codeLength: code.length,
    type: params.type,
    abi: JSON.parse(fs.readFileSync(__dirname + "/../../" + params.abiFile))
  })
};

module.exports.loadContractDefinition = loadContractDefinition;