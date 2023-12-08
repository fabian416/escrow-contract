// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Squary {
  IERC20 public immutable usdcToken;

  struct Group {
    address gnosisSafe;
    address[] members;
    mapping(address => uint256) deposits;
    mapping(address => int256) balances;
    bool settleCompleted;
  }

  struct Debt {
    address debtor;
    address creditor;
    uint256 amount;
  }

  mapping(address => Group) public groups;

  event GroupCreated(address indexed gnosisSafe, address[] members);
  event DepositMade(
    address indexed gnosisSafe,
    address indexed member,
    uint256 amount
  );
  event WithdrawalMade(
    address indexed gnosisSafe,
    address indexed member,
    uint256 amount
  );
  event SettleCompleted(address indexed gnosisSafe);

  modifier onlyGnosisSafe(address gnosisSafe) {
    require(
      msg.sender == gnosisSafe,
      'Only Gnosis Safe can call this function'
    );
    _;
  }

  modifier onlyMember(address gnosisSafe) {
    require(
      isMember(gnosisSafe, msg.sender),
      'Only group member can perform this action'
    );
    _;
  }

  constructor(address _usdcTokenAddress) {
    usdcToken = IERC20(_usdcTokenAddress);
  }

  function createGroup(
    address _gnosisSafe,
    address[] memory _members
  ) external {
    require(
      groups[_gnosisSafe].gnosisSafe == address(0),
      'Group already exists'
    );
    Group storage newGroup = groups[_gnosisSafe];
    newGroup.gnosisSafe = _gnosisSafe;
    newGroup.members = _members;
    emit GroupCreated(_gnosisSafe, _members);
  }

  function depositFunds(
    address gnosisSafe,
    uint256 amount
  ) external onlyMember(gnosisSafe) {
    require(amount > 0, 'You need to deposit some funds');
    require(
      usdcToken.transferFrom(msg.sender, address(this), amount),
      'Token transfer failed'
    );
    groups[gnosisSafe].deposits[msg.sender] += amount;
    groups[gnosisSafe].balances[msg.sender] += int256(amount);
    emit DepositMade(gnosisSafe, msg.sender, amount);
  }

  function withdrawFunds(
    address gnosisSafe,
    uint256 _amount
  ) external onlyMember(gnosisSafe) {
    require(
      groups[gnosisSafe].deposits[msg.sender] >= _amount,
      'Insufficient funds to withdraw'
    );
    require(usdcToken.transfer(msg.sender, _amount), 'USDC transfer failed');
    groups[gnosisSafe].deposits[msg.sender] -= _amount;
    groups[gnosisSafe].balances[msg.sender] -= int256(_amount);
    emit WithdrawalMade(gnosisSafe, msg.sender, _amount);
  }

  function settleGroup(
    address gnosisSafe,
    Debt[] calldata simplifiedDebts
  ) external onlyGnosisSafe(gnosisSafe) {
    for (uint i = 0; i < simplifiedDebts.length; i++) {
      Debt memory debt = simplifiedDebts[i];
      int256 owedAmount = int256(debt.amount) -
        int256(groups[gnosisSafe].deposits[debt.debtor]);
      if (owedAmount > 0) {
        groups[gnosisSafe].deposits[debt.creditor] += uint256(owedAmount);
        groups[gnosisSafe].balances[debt.debtor] -= owedAmount;
      } else {
        groups[gnosisSafe].balances[debt.debtor] +=
          int256(debt.amount) -
          owedAmount;
      }
    }
    emit SettleCompleted(gnosisSafe);
  }

  function getGroupDetails(
    address gnosisSafe
  ) public view returns (address[] memory members, bool settleCompleted) {
    Group storage group = groups[gnosisSafe];
    return (group.members, group.settleCompleted);
  }

  function isMember(
    address gnosisSafe,
    address member
  ) internal view returns (bool) {
    for (uint i = 0; i < groups[gnosisSafe].members.length; i++) {
      if (groups[gnosisSafe].members[i] == member) {
        return true;
      }
    }
    return false;
  }

  function getMemberBalance(
    address gnosisSafe,
    address member
  ) public view returns (int256) {
    return groups[gnosisSafe].balances[member];
  }
}
