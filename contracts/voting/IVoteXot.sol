pragma solidity ^0.4.24;

import "../xot_token/ERC20.sol";

/**
* @title IVoteXot
* @dev Interface for VoteVox
*/

contract IVoteXot {

    event Leader(address leader);

    function propose(address _proposed) external;
    function vote(address _newLeader) external;
    function proposeItself(bool value) external;
}