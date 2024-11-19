// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract SquaryBaseTest {
  error NoZeroAddress();
  error CallerIsNotMember();
  error GroupAlreadyExist();
  error GroupDoesNotExist();
  error InsufficientSignatures();
  error InsufficientFundsToWithdraw();
  error TransferFailed();

  using ECDSA for bytes32;
  uint256 public groupCounter;

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
    if (!isMember(groupId, msg.sender)) revert CallerIsNotMember();
    _;
  }

  function generateUniqueID(
    address creator,
    uint256 counter,
    address[] memory members
  ) private pure returns (bytes32) {
    return keccak256(abi.encodePacked(creator, counter, members));
  }

  function createGroup(
    string memory _name,
    address[] memory _members,
    uint256 _signatureThreshold,
    address _tokenAddress
  ) external {
    bytes32 groupId = generateUniqueID(msg.sender, groupCounter, _members);
    if (_tokenAddress == address(0)) revert NoZeroAddress();
    if (groups[groupId].id != 0) revert GroupAlreadyExist();

    Group storage group = groups[groupId];
    group.id = groupId;
    group.members = _members;
    group.signatureThreshold = _signatureThreshold;
    group.tokenAddress = _tokenAddress;
    group.name = _name;

    groupIds.push(groupId);
    groupCounter++;

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
    if (group.balances[msg.sender] < int256(amount))
      revert InsufficientFundsToWithdraw();

    IERC20 token = IERC20(group.tokenAddress);

    require(token.transfer(msg.sender, amount), 'Token transfer failed');
    if (!token.transfer(msg.sender, amount)) revert TransferFailed();
    group.balances[msg.sender] -= int256(amount);
    emit WithdrawalMade(groupId, msg.sender, amount);
  }

  function settleDebtsWithSignatures(
    bytes32 groupId,
    Debt[] calldata debts,
    bytes[] calldata signatures
  ) external {
    if (groups[groupId].id == 0) revert GroupDoesNotExist();
    if (signatures.length < groups[groupId].signatureThreshold)
      revert InsufficientSignatures();

    bytes32 actionHash = calculateActionHash(
      groupId,
      debts,
      groups[groupId].nonce
    );

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = getSigner(actionHash, signatures[i]);
      if (!isMember(groupId, signer)) revert CallerIsNotMember();
    }

    groups[groupId].nonce++;

    for (uint256 i = 0; i < debts.length; i++) {
      Debt memory debt = debts[i];
      require(
        isMember(groupId, debt.debtor) && isMember(groupId, debt.creditor),
        'Invalid member addresses'
      );
      groups[groupId].balances[debt.debtor] -= int256(debt.amount);
      groups[groupId].balances[debt.creditor] += int256(debt.amount);
      emit SettleCompleted(groupId, debt.debtor, debt.creditor, debt.amount);
    }
  }

  function getSigner(
    bytes32 actionHash,
    bytes memory signature
  ) public pure returns (address) {
    bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(actionHash);
    return ECDSA.recover(ethSignedMessageHash, signature);
  }

  function calculateActionHash(
    bytes32 groupId,
    Debt[] memory debts,
    uint256 nonce
  ) public pure returns (bytes32) {
    bytes32 hash = keccak256(abi.encode(groupId));
    for (uint256 i = 0; i < debts.length; i++) {
      hash = keccak256(
        abi.encode(hash, debts[i].debtor, debts[i].creditor, debts[i].amount)
      );
    }
    return keccak256(abi.encode(hash, 'settleDebts', nonce));
  }

  function changeGroupThreshold(
    bytes32 groupId,
    uint256 newThreshold,
    bytes[] calldata signatures
  ) public {
    bytes32 actionHash = keccak256(
      abi.encodePacked(
        groupId,
        'ChangeThreshold',
        newThreshold,
        groups[groupId].nonce
      )
    );
    bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(actionHash);

    for (uint256 i = 0; i < signatures.length; i++) {
      address signer = ECDSA.recover(ethSignedMessageHash, signatures[i]);
      if (!isMember(groupId, signer)) revert CallerIsNotMember();
    }

    groups[groupId].nonce++;

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

  function calculateSuggestedPayment(
    bytes32 groupId,
    address member
  ) public view onlyMemberOfGroup(groupId) returns (uint256 suggestedAmount) {
    // Obtén el balance del miembro en el grupo
    int256 balance = groups[groupId].balances[member];

    // Si el balance es negativo, devuelve la cantidad necesaria para saldar la deuda
    if (balance < 0) {
      return uint256(-balance);
    }

    // Si no debe nada, devuelve 0
    return 0;
  }

  function getGroupDetails(
    bytes32 groupId
  )
    public
    view
    returns (string memory name, address[] memory members, uint256 nonce)
  {
    Group storage group = groups[groupId];
    return (group.name, group.members, group.nonce);
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

    bytes32[] memory userGroups = new bytes32[](count);
    uint256 index = 0;
    for (uint256 i = 0; i < groupIds.length; i++) {
      if (isMember(groupIds[i], user)) {
        userGroups[index] = groupIds[i];
        index++;
      }
    }

    return userGroups;
  }
}
