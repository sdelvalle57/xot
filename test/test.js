const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const XotToken = artifacts.require('XotToken.sol');
const VoteXot = artifacts.require('VoteXot.sol');

let accounts;
const gas = '1000000';

beforeEach(async () =>{
  accounts = await web3.eth.getAccounts();
  xotToken = await new web3.eth.Contract(JSON.parse(JSON.stringify(XotToken.abi)))
    .deploy({data: XotToken.bytecode})
    .send({from: accounts[0], gas: '6000000'});    
  voteXot = await new web3.eth.Contract(JSON.parse(JSON.stringify(VoteXot.abi)))
    .deploy({
      data: VoteXot.bytecode,
      arguments: [xotToken.options.address, 5]
    })
    .send({from: accounts[0], gas: '6000000'});  
});


contract('XotToken', () =>{
  describe("Initial Deployment", () => {

    it('deploys XotToken contract', ()=>{
      assert.ok(xotToken.options.address, "xotToken deployment");
    });

    it('checks initial values', async ()=>{
      const totalSupply = await xotToken.methods.totalSupply().call();
      assert.equal(totalSupply, web3.utils.toWei('500000000', 'ether'))
      
      const name = await xotToken.methods.name().call();
      assert.equal(name, "Xot Token");

      const symbol = await xotToken.methods.symbol().call();
      assert.equal(symbol, "XOT");

      const decimals = await xotToken.methods.decimals().call();
      assert.equal(decimals, 18);

      const balanceOfCreator = await xotToken.methods.balanceOf(accounts[0]).call();
      assert.equal(balanceOfCreator, web3.utils.toWei('500000000', 'ether'));
    });

    it('transfers to another account', async () => {
      await xotToken.methods.transfer(accounts[1], web3.utils.toWei('1000000', 'ether')).send({
        from: accounts[0],
        gas: gas
      });
      const balanceOfNewHolder = await xotToken.methods.balanceOf(accounts[1]).call();
      assert.equal(balanceOfNewHolder, web3.utils.toWei('1000000', 'ether'));
    });

    it('approves to another account and transfer from that account', async () => {
      await xotToken.methods.approve(accounts[1], web3.utils.toWei('100', 'ether')).send({
        from: accounts[0],
        gas: gas
      });

      const allowance = await xotToken.methods.allowance(accounts[0], accounts[1]).call();
      assert.equal(allowance, web3.utils.toWei('100', 'ether'));

      await xotToken.methods.transferFrom(accounts[0], accounts[2], web3.utils.toWei('100', 'ether')).send({
        from: accounts[1],
        gas: gas
      })

      const balance = await xotToken.methods.balanceOf(accounts[2]).call();
      assert.equal(balance, web3.utils.toWei('100', 'ether'));
    })
  }); 
})

contract('VoteXot', async () =>{
  const minimumToVote = await voteXot.methods.minimumToVote().call();
  assert.equal(minimumToVote, web3.utils.toWei('20', 'ether'));
  describe("Initial Deployment", () => {

    it('deploys VoteXot contract', ()=>{
      assert.ok(voteXot.options.address, "voteXot deployment");
    });

    it('votes for new leader', async () => {

      const balanceOfVoter = await xotToken.methods.balanceOf(accounts[0]).call();
      assert.equal(balanceOfVoter, web3.utils.toWei('500000000', 'ether'));

      await xotToken.methods.approve(voteXot.options.address, (minimumToVote*5).toString()).send({
        from: accounts[0],
        gas: gas
      })

      const allowance = await xotToken.methods.allowance(accounts[0], voteXot.options.address).call();
      assert.equal(minimumToVote*5, allowance);

      const proposedVotes = await voteXot.methods.proposedVotes().call();
      assert.equal(proposedVotes, 5);

      for(let i = 1; i <= proposedVotes; i++) {
        await voteXot.methods.vote(accounts[1]).send({
          from: accounts[0],
          gas: '1000000'
        }); 
        const numberOfVotes = await voteXot.methods.votes(accounts[1]).call()
        assert.equal(numberOfVotes, i);
      }
          
      const contractBalance = await xotToken.methods.balanceOf(voteXot.options.address).call();
      assert.equal(contractBalance, web3.utils.toWei('500', 'ether'))


      
      // xotToken.approve(address(this), minimumToVote);
      //const allowance = await xotToken.methods.allowance(accounts[0], voteXot.options.address).call();
      //console.log(allowance);

      //const newBalanceOfVoter = await xotToken.methods.balanceOf(accounts[0]).call();
      //assert.equal(newBalanceOfVoter, web3.utils.toWei('499999900', 'ether'));

/*
function allowance(address _owner, address _spender) public view returns (uint256) {
      
      assert.equal(balanceOfCreator, web3.utils.toWei('500000000', 'ether'));
*/
    });
  }); 
})

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
