pragma solidity ^0.4.23;

import "./StandardToken.sol";
import "../utils/Ownable.sol";


contract XotToken is StandardToken, Ownable {
    string public constant name = "Xot Token"; 
    string public constant symbol = "XOT"; 
    uint8 public constant decimals = 18; 
    uint256 public constant INITIAL_SUPPLY = 500000000 * (10 ** uint256(decimals));

    constructor() public {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }
}