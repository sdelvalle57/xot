const XotToken = artifacts.require("./XotToken.sol");
const VoteXot = artifacts.require("./VoteXot.sol");

module.exports = async (deployer) => {
  deployer.deploy(XotToken).then(function() {
    return deployer.deploy(VoteXot, XotToken.address, 5);
  });
};

