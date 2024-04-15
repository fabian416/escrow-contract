// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './Voting.sol';

contract Squary {
  Voting public votingContract;
  IERC20 public immutable usdcToken;
  struct Group {
    bytes32 id;
    address[] members;
    mapping(address => int256) balances;
    uint256 signatureThreshold;
  }

  struct Debt {
    address debtor;
    address creditor;
    uint256 amount;
  }

  mapping(bytes32 => Group) public groups;

  event GroupCreated(bytes32 indexed id, address[] members);
  event DepositMade(
    bytes32 indexed groupId,
    address indexed member,
    uint256 amount
  );
  event WithdrawalMade(
    bytes32 indexed groupId,
    address indexed member,
    uint256 amount
  );
  event SettleCompleted(
    bytes32 indexed groupId,
    address indexed debtor,
    address indexed creditor,
    uint256 amount
  );

  constructor(address _usdcTokenAddress, address votingAddress) {
    usdcToken = IERC20(_usdcTokenAddress);
    votingContract = Voting(votingAddress);
  }

  modifier onlyMemberOfGroup(bytes32 groupId) {
    require(
      isMember(groupId, msg.sender),
      'Caller is not a member of the group'
    );
    _;
  }

  function generateUniqueID(
    address creator,
    uint256 timestamp,
    address[] memory members
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(creator, timestamp, members));
  }

  function createGroup(
    address[] memory _members,
    uint256 _signatureThreshold
  ) external {
    bytes32 groupId = generateUniqueID(msg.sender, block.timestamp, _members);
    require(groups[groupId].id == 0, 'Group already exists');
    Group storage group = groups[groupId];
    group.id = groupId;
    group.members = _members;
    group.signatureThreshold = _signatureThreshold;
    // Registrar el umbral inicial en Voting
    bool success = votingContract.registerGroup(groupId, _members, _signatureThreshold);
    require(success, "Failed to register group in Voting");

    emit GroupCreated(groupId, _members);
  }

  function depositFunds(
    bytes32 groupId,
    uint256 amount
  ) external onlyMemberOfGroup(groupId) {
    require(amount > 0, 'You need to deposit some funds');
    require(
      usdcToken.transferFrom(msg.sender, address(this), amount),
      'Token transfer failed'
    );
    Group storage group = groups[groupId];
    int256 memberDebt = -group.balances[msg.sender];
    int256 depositAmount = int256(amount);
    if (depositAmount > memberDebt) {
      group.balances[msg.sender] = depositAmount - memberDebt;
    } else {
      group.balances[msg.sender] += depositAmount;
    }
    emit DepositMade(groupId, msg.sender, amount);
  }

  function withdrawFunds(
    bytes32 groupId,
    uint256 amount
  ) external onlyMemberOfGroup(groupId) {
    Group storage group = groups[groupId];
    require(
      group.balances[msg.sender] >= int256(amount),
      'Insufficient funds to withdraw'
    );
    require(usdcToken.transfer(msg.sender, amount), 'USDC transfer failed');
    group.balances[msg.sender] -= int256(amount);
    emit WithdrawalMade(groupId, msg.sender, amount);
  }

  function settleGroup(
    bytes32 groupId,
    Debt[] calldata simplifiedDebts
  ) external onlyMemberOfGroup(groupId) {
    Group storage group = groups[groupId];
    for (uint256 i = 0; i < simplifiedDebts.length; i++) {
      Debt memory debt = simplifiedDebts[i];
      require(
        isMember(groupId, debt.debtor),
        'Debtor is not a member of the group'
      );
      require(
        isMember(groupId, debt.creditor),
        'Creditor is not a member of the group'
      );
      require(
        group.balances[debt.debtor] >= int256(debt.amount),
        'Debtor does not have enough balance'
      );
      group.balances[debt.debtor] -= int256(debt.amount);
      group.balances[debt.creditor] += int256(debt.amount);
      emit SettleCompleted(groupId, debt.debtor, debt.creditor, debt.amount);
    }
  }

  function isMember(
    bytes32 groupId,
    address member
  ) internal view returns (bool) {
    Group storage group = groups[groupId];
    for (uint i = 0; i < group.members.length; i++) {
      if (group.members[i] == member) {
        return true;
      }
    }
    return false;
  }

  function getGroupDetails(
    bytes32 groupId
  ) public view returns (address[] memory members) {
    return groups[groupId].members;
  }

  function getMemberBalance(
    bytes32 groupId,
    address member
  ) public view returns (int256) {
    return groups[groupId].balances[member];
  }
}