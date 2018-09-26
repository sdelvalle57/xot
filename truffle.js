var HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(
  'quality melt parade post muscle captain front salmon beyond swing day horror',
  'https://rinkeby.infura.io/qAudSy87uo2SByV57ETq'

);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 6000000,
    },
    rinkeby: {
      provider: () => {
        return provider
      },
      network_id: '4',
      gas: 6000000,
    }
  }
}