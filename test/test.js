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

contract('VoteXot', () =>{
  
  describe("Initial Deployment", () => {

    it('deploys VoteXot contract', ()=>{
      assert.ok(voteXot.options.address, "voteXot deployment");
    });

    it('checks the constructor', async () => {
      const proposedVotes = await voteXot.methods.proposedVotes().call();
      assert.equal(proposedVotes, 5);

      const leader = await voteXot.methods.leader().call();
      assert.equal(leader, accounts[0]);

      const token = await voteXot.methods.xotToken().call();
      assert.equal(token, xotToken.options.address)

    })

    it('proposes and votes for new leader', async () => {

      //check and save some values
      const minimumToPropose = await voteXot.methods.minimumToPropose().call();
      assert.equal(minimumToPropose, web3.utils.toWei('100', 'ether'));
      const minimumToVote = await voteXot.methods.minimumToVote().call();
      assert.equal(minimumToVote, web3.utils.toWei('20', 'ether'));
      const allowToExpend = web3.utils.toWei('5000', 'ether');


      const balanceOfVoter = await xotToken.methods.balanceOf(accounts[0]).call();
      assert.equal(balanceOfVoter, web3.utils.toWei('500000000', 'ether'));

      //First we approve the contract to expend some amount and check allowance 
      await xotToken.methods.approve(voteXot.options.address, allowToExpend).send({
        from: accounts[0],
        gas: gas
      })

      const allowance = await xotToken.methods.allowance(accounts[0], voteXot.options.address).call();
      assert.equal(allowToExpend, allowance);

      //Then we can make a proposal for a new leader
      await voteXot.methods.propose(accounts[1]).send({
        from: accounts[0],
        gas: gas
      });

      const proposed = await voteXot.methods.proposed(accounts[1]).call();
      assert.ok(proposed)

      //Then we vote the number of times required to become leader
      let proposedVotes = await voteXot.methods.proposedVotes().call();
      assert.equal(proposedVotes, 5);

      for(let j = 1; j <= proposedVotes; j++) {
        await voteXot.methods.vote(accounts[1]).send({
          from: accounts[0],
          gas: gas
        }); 
        const numberOfVotes = await voteXot.methods.votes(accounts[1]).call()
        assert.equal(numberOfVotes, j);
      }
          
      //five times a vote = 100 plus the proposed = 200
      const contractBalance = await xotToken.methods.balanceOf(voteXot.options.address).call();
      assert.equal(contractBalance, web3.utils.toWei('200', 'ether'))

      //we check the new leader
      const newLeader = await voteXot.methods.leader().call();
      assert.equal(newLeader, accounts[1]);

      //new leader will change the rule
      await voteXot.methods.proposeItself(true).send({
        from: accounts[1],
        gas: gas
      });

      const canProposeItself = await voteXot.methods.canProposeItself().call();
      assert.ok(canProposeItself);

      //we will set a new leader by voting one more time
      proposedVotes = await voteXot.methods.proposedVotes().call();
      assert.equal(proposedVotes, 6);

      //user will propose itself
      await xotToken.methods.transfer(accounts[2], allowToExpend).send({
        from: accounts[0],
        gas: gas
      })
      await xotToken.methods.approve(voteXot.options.address, allowToExpend).send({
        from: accounts[2],
        gas: gas
      })
      await voteXot.methods.propose(accounts[2]).send({
        from: accounts[2],
        gas: gas
      });
      
      for(let i = 1; i <= proposedVotes; i++) {
        await voteXot.methods.vote(accounts[2]).send({
          from: accounts[0],
          gas: gas
        }); 

        const numberOfVotes = await voteXot.methods.votes(accounts[2]).call()
        assert.equal(numberOfVotes, i);

        const currentLeader = await voteXot.methods.leader().call();

        if(i < proposedVotes) {
          assert.equal(currentLeader, accounts[1]);
        } else {
          assert.equal(currentLeader, accounts[2]);
        }
      }
    });
  }); 
})

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
