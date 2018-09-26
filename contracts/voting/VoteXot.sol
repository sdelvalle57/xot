pragma solidity ^0.4.24;

import "./IVoteXot.sol";
import "../xot_token/ERC20.sol";
import "../utils/SafeMath.sol";

/**
* @title VoteXot
* @dev Leader proposal and rules setting
*/

contract VoteXot is IVoteXot {
    using SafeMath for uint256;

    ERC20 public xotToken;

    /**
    * @dev uint that defines 100 XOTs
    * @param minimumToVote 100 XOT
    */
    uint256 public constant minimumToVote = 20*(10**18);
    uint256 public proposedVotes;

    address public leader;


    mapping(address => uint256) 

    /**
    * @dev mapping of votes
    * @param address The address of the proposed leader
    * @param uint256 The number of votes 
    */
    mapping(address => uint256) public votes;   


    /**
    * @dev constructor
    * @param _xotToken ERC20 Token to be set on the voting
    * @param _proposedVotes number of votes needed to be leader
    */
    constructor(ERC20 _xotToken, uint256 _proposedVotes) public {
        require(_xotToken != address(0), "Token cant be address(0)");
        require(_proposedVotes > 0);
        xotToken = _xotToken;
        proposedVotes = _proposedVotes;
    }

    /**
    * @dev vote can be called by anyone that has allowed the
    * contract at least 100 XOT, then the contract will call
    * transferFrom function to tranfer the tokens on its behalf
    * and place the vote. If the proposed leader achieves the 
    * numberOfProposeddVotes, the @param _newLeader will become
    * the new leader, and we will add one to number of proposed 
    * votes, so the next leader will become leader after reaching
    * the number of votes the actual leader has
    * @param _newLeader ERC20 Token to be set on the voting
    */
    function vote(address _newLeader) external {
        require(msg.sender != _newLeader, "User cannot vote for itself");
        require(xotToken.balanceOf(msg.sender) > minimumToVote, "User cannot vote with less than 100 XOT");
        require(leader != _newLeader, "Proposed leader is already a leader");
        require(xotToken.allowance(msg.sender, address(this)) >= minimumToVote, "usaer allowance is not enough");
        require(xotToken.transferFrom(msg.sender, address(this), minimumToVote), "transfer from didnt happen");
        votes[_newLeader] = votes[_newLeader].add(1);
        if(votes[_newLeader] >= proposedVotes) {
            proposedVotes = votes[_newLeader].add(1);
            leader = _newLeader;
            emit Leader(leader);
        }
    }


}