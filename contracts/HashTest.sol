// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashTest {
  struct Debt {
    address debtor;
    address creditor;
    uint256 amount;
  }

  function getNonce(bytes32 groupId) external pure returns (uint256) {
    return 1;
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

  function getEncodePackedHash(
    bytes32 groupId,
    Debt[] memory debts,
    uint256 nonce
  ) public pure returns (bytes32) {
    bytes32 hash = keccak256(abi.encodePacked(groupId));
    for (uint256 i = 0; i < debts.length; i++) {
      hash = keccak256(
        abi.encodePacked(
          hash,
          debts[i].debtor,
          debts[i].creditor,
          debts[i].amount
        )
      );
    }
    return keccak256(abi.encodePacked(hash, 'settleDebts', nonce));
  }
}
