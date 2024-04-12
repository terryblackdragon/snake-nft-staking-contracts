// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract SAPE is ERC20, ERC20Burnable, Ownable {
    //--------------------------------------------------------------------
    // VARIABLES

    mapping(address => bool) controllers;

    //--------------------------------------------------------------------
    // ERRORS

    error SAPE__OnlyControllersCanMint();

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor() ERC20("APE Token", "SAPE") {}

    //--------------------------------------------------------------------
    // FUNCTIONS

    function mint(address to, uint256 amount) external {
        if (!controllers[msg.sender])
            revert SAPE__OnlyControllersCanMint();
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        if (controllers[msg.sender]) {
            _burn(account, amount);
        }
    }

    //--------------------------------------------------------------------
    // OWNER FUNCTIONS

    function setController(address controller, bool _state)
        external
        payable
        onlyOwner
    {
        controllers[controller] = _state;
    }
}
