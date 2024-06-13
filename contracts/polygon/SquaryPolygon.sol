// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract SquaryPolygon {
    using ECDSA for bytes32;

    IERC20 immutable public usdtToken;
    IERC20 immutable public usdcToken;
    IERC20 immutable public daiToken;

    uint256 public groupCounter;
    bytes32[] public groupIds;
    mapping(bytes32 => Group) groups;

    struct Group {
        bytes32 id;
        address[] members;
        mapping(address => int256) balances;
        uint256 signatureThreshold;
        uint256 nonce;
        address tokenAddress;
        string name;
    }

    struct Debt {
        address debtor;
        address creditor;
        uint256 amount;
    }
    
    constructor (
        address _usdtTokenAddress,
        address _usdcTokenAddress,
        address _daiTokenAddress
    ) {
        usdtToken = IERC20(_usdtTokenAddress);
        usdcToken = IERC20(_usdcTokenAddress);
        daiToken = IERC20(_daiTokenAddress);
    }

    function generateUniqueId(address _creator, uint256 _groupCounter,address[] calldata _members) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_creator, _groupCounter, _members));
    }
    function createGroup(
        string calldata _name,
        address[] calldata _members,
        uint256 _signatureThreshold,
        address _tokenAddress
        ) public {
        bytes32 groupId = generateUniqueId(msg.sender,groupCounter, _members);
        require(_tokenAddress != address(0), 'Address 0 invalid');
        require(groups[groupId].id == 0, 'There is already created');

        Group storage group = groups[groupId];
            group.id = groupId;
            group.name = _name;
            group.members = _members;
            group.signatureThreshold = _signatureThreshold;
            group.tokenAddress = _tokenAddress;

        groupIds.push(groupId);

        groupCounter++;

    } 
}