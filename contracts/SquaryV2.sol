// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract SquaryV2 {
  using ECDSA for bytes32;

  IERC20 public immutable usdcToken;
  IERC20 public immutable usdtToken;
  IERC20 public immutable daiToken;

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

  mapping(bytes32 => Group) public groups;
  mapping(bytes32 => Debt[]) public pendingSettlements;
  bytes32[] public groupIds;

  event GroupCreated(bytes32 indexed id, string name, address[] members);
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
  event MemberAdded(bytes32 indexed groupId, address indexed newMember);
  event MemberRemoved(bytes32 indexed groupId, address indexed member);
  event ThresholdChanged(bytes32 indexed groupId, uint256 newThreshold);

  constructor(
    address _usdcTokenAddress,
    address _usdtTokenAddress,
    address _daitokenAddress
  ) {
    usdcToken = IERC20(_usdcTokenAddress);
    usdtToken = IERC20(_usdtTokenAddress);
    daiToken = IERC20(_daitokenAddress);
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

  function findMemberIndex(
    bytes32 groupId,
    address member
  ) internal view returns (int256) {
    Group storage group = groups[groupId];
    for (uint256 i = 0; i < group.members.length; i++) {
      if (group.members[i] == member) {
        return int256(i);
      }
    }
    return -1; // not found
  }

  function createGroup(
    string memory _name,
    address[] memory _members,
    uint256 _signatureThreshold,
    address _tokenAddress
  ) external {
    bytes32 groupId = generateUniqueID(msg.sender, block.timestamp, _members);
    require(_tokenAddress != address(0), 'Invalid token address');
    require(groups[groupId].id == 0, 'Group already exists');

    Group storage group = groups[groupId];
    group.id = groupId;
    group.members = _members;
    group.signatureThreshold = _signatureThreshold;
    group.tokenAddress = _tokenAddress;
    group.name = _name;

    groupIds.push(groupId); // Añadir el ID del grupo al array

    emit GroupCreated(groupId, _name, _members);
  }
  function depositFunds(
    bytes32 groupId,
    uint256 amount
  ) external onlyMemberOfGroup(groupId) {
    require(amount > 0, 'You need to deposit some funds');

    Group storage group = groups[groupId];
    IERC20 token = IERC20(group.tokenAddress); // Use the token settle by the group

    require(
      token.transferFrom(msg.sender, address(this), amount),
      'Token transfer failed'
    );

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

    IERC20 token = IERC20(group.tokenAddress);

    require(token.transfer(msg.sender, amount), 'Token transfer failed');
    group.balances[msg.sender] -= int256(amount);
    emit WithdrawalMade(groupId, msg.sender, amount);
  }

  function settleDebtsWithSignatures(bytes32 groupId, Debt[] calldata debts, bytes[] calldata signatures) external {
    require(groups[groupId].id != 0, 'Group does not exist');
    require(signatures.length >= groups[groupId].signatureThreshold, 'Insufficient signatures');

    bytes32 actionHash = keccak256(abi.encode(groupId, debts, 'settleDebts', groups[groupId].nonce));

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(actionHash, signatures[i]);
      require(isMember(groupId, signer), 'Signer is not a member of the group');
    }

    groups[groupId].nonce++;

    for (uint256 i = 0; i < debts.length; i++) {
      Debt memory debt = debts[i];
      require(isMember(groupId, debt.debtor) && isMember(groupId, debt.creditor), 'Invalid member addresses');
      groups[groupId].balances[debt.debtor] -= int256(debt.amount);
      groups[groupId].balances[debt.creditor] += int256(debt.amount);
      emit SettleCompleted(groupId, debt.debtor, debt.creditor, debt.amount);
    }
  }

  function addGroupMember(
    bytes32 groupId,
    address newMember,
    bytes[] calldata signatures
  ) public {
    // Build the hash of the action
    bytes32 actionHash = keccak256(
      abi.encode(groupId, 'AddMember', newMember, groups[groupId].nonce)
    );

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(actionHash, signatures[i]);
      require(isMember(groupId, signer), 'Signer is not a member of the group');
    }

    groups[groupId].nonce++;

    Group storage group = groups[groupId];
    require(!isMember(groupId, newMember), 'Member already exists');
    group.members.push(newMember);
    emit MemberAdded(groupId, newMember);
  }

  function removeGroupMember(
    bytes32 groupId,
    address member,
    bytes[] calldata signatures
  ) public {
    bytes32 actionHash = keccak256(
      abi.encode(groupId, 'RemoveMember', member, groups[groupId].nonce)
    );

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(actionHash, signatures[i]);
      require(isMember(groupId, signer), 'Signer is not a member of the group');
    }

    groups[groupId].nonce++;

    // Execute and remove the member if it exists
    Group storage group = groups[groupId];
    int256 index = findMemberIndex(groupId, member);
    require(index != -1, 'Member not found');

    // Delete the member from the group
    address lastMember = group.members[group.members.length - 1];
    group.members[uint256(index)] = lastMember;
    group.members.pop();

    emit MemberRemoved(groupId, member);
  }

  function changeGroupThreshold(
    bytes32 groupId,
    uint256 newThreshold,
    bytes[] calldata signatures
  ) public {
    bytes32 actionHash = keccak256(
      abi.encode(
        groupId,
        'ChangeThreshold',
        newThreshold,
        groups[groupId].nonce
      )
    );

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(actionHash, signatures[i]);
      require(isMember(groupId, signer), 'Signer is not a member of the group');
    }

    groups[groupId].nonce++;

    // Modify the signature threshold
    Group storage group = groups[groupId];
    group.signatureThreshold = newThreshold;

    emit ThresholdChanged(groupId, newThreshold);
  }

  function isMember(
    bytes32 groupId,
    address member
  ) public view returns (bool) {
    Group storage group = groups[groupId];
    for (uint i = 0; i < group.members.length; i++) {
      if (group.members[i] == member) {
        return true;
      }
    }
    return false;
  }

  function getGroupThreshold(bytes32 groupId) public view returns (uint256) {
    return groups[groupId].signatureThreshold;
  }

  function getGroupDetails(
    bytes32 groupId
  ) public view returns (string memory name, address[] memory members) {
    Group storage group = groups[groupId];
    return (group.name, group.members);
  }

  function getMemberBalance(
    bytes32 groupId,
    address member
  ) public view returns (int256) {
    return groups[groupId].balances[member];
  }

  function getUserGroups(address user) public view returns (bytes32[] memory) {
    uint256 count = 0;

    for (uint256 i = 0; i < groupIds.length; i++) {
      if (isMember(groupIds[i], user)) {
        count++;
      }
    }

    bytes32[] memory userGroupIds = new bytes32[](count);
    uint256 index = 0;

    for (uint256 i = 0; i < groupIds.length; i++) {
      if (isMember(groupIds[i], user)) {
        userGroupIds[index] = groupIds[i];
        index++;
      }
    }

    return userGroupIds;
  }
}
