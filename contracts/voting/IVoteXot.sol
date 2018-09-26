pragma solidity ^0.4.24;

import "../xot_token/ERC20.sol";

/**
* @title IVoteXot
* @dev Interface for VoteVox
*/

contract IVoteXot {

    event Leader(address leader);

    function vote(address _newLeader) external;
  // function setNewLeader(address _newLeader) private;
  //  function setNumberOfVotes(uint256 _number) external;
}