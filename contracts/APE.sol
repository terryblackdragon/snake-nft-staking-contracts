// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract APE is ERC721AQueryable, Ownable {
    using Strings for uint256;

    //--------------------------------------------------------------------
    // VARIABLES

    string public baseURI;
    string public constant baseExtension = ".json";

    uint256 public cost;
    uint256 public immutable maxSupply;
    uint256 public maxMintAmountPerTx;

    // USE uint256 instead of bool to save gas
    // paused = 1 & active = 2
    uint256 public paused = 1;

    //--------------------------------------------------------------------
    // ERRORS

    error APE__ContractIsPaused();
    error APE__NftSupplyLimitExceeded();
    error APE__InvalidMintAmount();
    error APE__MaxMintAmountExceeded();
    error APE__InsufficientFunds();
    error APE__QueryForNonExistentToken();

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(
        uint256 _maxSupply,
        uint256 _cost,
        uint256 _maxMintAmountPerTx
    ) ERC721A("APE Collectible", "APE") {
        cost = _cost;
        maxMintAmountPerTx = _maxMintAmountPerTx;
        maxSupply = _maxSupply;
    }

    //--------------------------------------------------------------------
    // MINT FUNCTIONS

    function mint(uint256 _mintAmount) external payable {
        if (paused == 1) revert APE__ContractIsPaused();
        if (_mintAmount == 0) revert APE__InvalidMintAmount();
        if (_mintAmount > maxMintAmountPerTx)
            revert APE__MaxMintAmountExceeded();
        uint256 supply = totalSupply();
        if (supply + _mintAmount > maxSupply)
            revert APE__NftSupplyLimitExceeded();

        if (msg.sender != owner()) {
            if (msg.value < cost * _mintAmount)
                revert APE__InsufficientFunds();
        }

        _safeMint(msg.sender, _mintAmount);
    }

    //--------------------------------------------------------------------
    // OWNER FUNCTIONS

    function setCost(uint256 _newCost) external payable onlyOwner {
        cost = _newCost;
    }

    function setMaxMintAmountPerTx(uint256 _newmaxMintAmount)
        external
        payable
        onlyOwner
    {
        maxMintAmountPerTx = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) external payable onlyOwner {
        baseURI = _newBaseURI;
    }

    function pause(uint256 _state) external payable onlyOwner {
        paused = _state;
    }

    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
    }

    //--------------------------------------------------------------------
    // VIEW FUNCTIONS

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert APE__QueryForNonExistentToken();

        tokenId = tokenId % 100;
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
