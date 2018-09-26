#XOT Token is at 0x6269fa2fe7da4eff730f4487773ac1a9e6555687
https://rinkeby.etherscan.io/token/0x2b9d632f120cea7a0d076f6a78e24faceb475dde

#VoteXot is at 0x564f52e6f19e8430167a857a931aa7cd14d21431
https://rinkeby.etherscan.io/address/0x564f52e6f19e8430167a857a931aa7cd14d21431

#Installation

after cloning run [`npm install`]
test can be run typing [`truffle test`]

#Proposing leader or voting
To propose a new leader sender first needs to allow the contract
some XOT value to be spend on the contract's behalf to execute 
vote and propose functions.

#Interacting with the contracts
abis are located into the [`./abis`] folder

#migrating
migrations can be done typing:
* for localhost:8545  [`truffle migrate --reset`]
* for rinkeby  [`truffle migrate --reset --network rinkeby`]