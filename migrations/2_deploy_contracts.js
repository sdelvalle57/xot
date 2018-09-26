
const fs = require('fs');
const XotToken = artifacts.require("./XotToken.sol");
const VoteXot = artifacts.require("./VoteXot.sol");

module.exports = async (deployer) => {
  deployer.deploy(XotToken).then(function() {
    return deployer.deploy(VoteXot, XotToken.address, 5).then(function() {
      fs.writeFile('./abis/XotTokenAbi.json', JSON.stringify(XotToken.abi));
      fs.writeFile('./abis/VoteXotAbi.json', JSON.stringify(VoteXot.abi));
    });
  });
};

