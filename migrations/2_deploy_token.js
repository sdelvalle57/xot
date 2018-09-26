const XotToken = artifacts.require("./XotToken.sol");

module.exports = async (deployer) => {
  await deployer.deploy(XotToken);  
};
