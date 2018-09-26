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
    * @dev uint that defines 20 XOTs
    */
    uint256 public constant minimumToVote = 20*(10**18);
     /**
    * @dev uint that defines 100 XOTs
    */
    uint256 public constant minimumToPropose = 100*(10**18);

    uint256 public proposedVotes;

    bool public canProposeItself = false;

    address public leader;

    /**
    * @dev mapping of proposed leaders
    * @param address The address of the proposed leader
    * @param bool True if proposed 
    */
    mapping(address => bool) public proposed;

    /**
    * @dev mapping of votes
    * @param address The address of the proposed leader
    * @param uint256 The number of votes 
    */
    mapping(address => uint256) public votes;   

    /**
    * @dev Throws if called by any account other than the leader.
    */
    modifier onlyLeader() {
        require(msg.sender == leader);
        _;
    }

     /**
    * @dev Throws if allowance is not set by equal or greater of minimum
    * @param _minimum value to be allowed to the contract to spend
    */
    modifier hasAllowed(uint256 _minimum) {
        require(xotToken.balanceOf(msg.sender) > _minimum, "balance not enough");
        require(xotToken.allowance(msg.sender, address(this)) >= _minimum, "allowed not enough");
        _;
    }


    /**
    * @dev constructor sets the msg.sender as the leader 
    * @param _xotToken ERC20 Token to be set on the voting
    * @param _proposedVotes number of votes needed to be leader
    */
    constructor(ERC20 _xotToken, uint256 _proposedVotes) public {
        require(_xotToken != address(0), "Token cant be address(0)");
        require(_proposedVotes > 0);
        leader = msg.sender;
        xotToken = _xotToken;
        proposedVotes = _proposedVotes;
    }

    /**
    * @dev propose a new leader,  can be called by anyone that has 
    * allowed the contract at least 100 XOT, then the contract will call 
    * transferFrom function to tranfer the tokens on its behalf and place
    * the proposal on behalf of _proposed
    * @param _proposed address of the new proposed leader
    */
    function propose(address _proposed) external hasAllowed(minimumToPropose) {
        require(_proposed != address(0), "proposed cannot be address 0");
        if(!canProposeItself) {
            require(_proposed != msg.sender, "sender cannot be proposed itself");
        }
        require(xotToken.transferFrom(msg.sender, address(this), minimumToPropose), "transfer from didnt happen");
        proposed[_proposed] = true;
        
    }

    /**
    * @dev vote can be called by anyone that has allowed the
    * contract at least 20 XOT, the voted must be proposed first
    *, then the contract will call  transferFrom function to tranfer 
    * the tokens on its behalf  and place the vote. If the proposed 
    * leader achieves the numberOfProposeddVotes, the _newLeader
    * will become the new leader, and we will add one to number of proposed 
    * votes, so the next leader will become leader after reaching
    * the number of votes the actual leader has
    * @param _newLeader address of the voted
    */
    function vote(address _newLeader) external hasAllowed(minimumToVote) {
        require(msg.sender != _newLeader, "User cannot vote for itself");
        require(proposed[_newLeader], "voted is not proposed");
        require(xotToken.transferFrom(msg.sender, address(this), minimumToVote), "transfer from didnt happen");
        votes[_newLeader] = votes[_newLeader].add(1);
        if(votes[_newLeader] >= proposedVotes) {
            proposedVotes = votes[_newLeader].add(1);
            leader = _newLeader;
            emit Leader(leader);
        }
    }

    /** 
    * @dev only the leader can change the rule 
    * @param _value if leader can be proposed itself
    */
    function proposeItself(bool _value) external onlyLeader {
        canProposeItself = _value;
    }


}