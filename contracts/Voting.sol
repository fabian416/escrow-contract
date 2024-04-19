// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './Squary.sol';
import './DebtStruct.sol';
contract Voting {
  struct Proposal {
    address proposer;
    bytes32 groupId;
    bool executed;
    uint256 votesFor;
    uint256 votesAgainst;
    ActionType actionType;
    uint256 newValue;
  }

  enum ActionType {
    ChangeThreshold, // Change the voting threshold
    AddMember, // Add a new member
    RemoveMember, // Remove a member
    SettleDebts // Nueva acción para resolver deudas
  }

  address[] public members;
  Squary public squaryContract;
  uint256 public voteThreshold;
  uint256 public proposalCount;
  uint256 public activeProposalId; // ID de la propuesta activa

  mapping(bytes32 => uint256) private activeProposalByGroup;
  mapping(uint256 => mapping(address => bool)) public hasVoted;
  mapping(uint256 => Proposal) public proposals;

  event ProposalCreated(
    uint256 indexed proposalId,
    ActionType indexed actionType,
    uint256 newValue
  );
  event VoteCasted(
    uint256 indexed proposalId,
    address indexed voter,
    bool support
  );
  event ProposalExecuted(
    uint256 indexed proposalId,
    ActionType indexed actionType,
    uint256 newValue
  );

  modifier onlyMember(bytes32 groupId) {
    require(
      squaryContract.isMember(groupId, msg.sender),
      'Caller is not a member'
    );
    _;
  }

  constructor(address squaryAddress) {
    squaryContract = Squary(squaryAddress);
  }

  function isThresholdMet(uint256 proposalId) public view returns (bool) {
    Proposal storage proposal = proposals[proposalId];
    uint256 currentThreshold = squaryContract.getGroupThreshold(
      proposal.groupId
    );
    return proposal.votesFor > currentThreshold;
  }

  function createProposal(
    bytes32 groupId,
    ActionType actionType,
    uint256 newValue
  ) public onlyMember(groupId) {
    require(
      activeProposalByGroup[groupId] == 0,
      'There is already an active proposal for this group.'
    );
    require(
      squaryContract.isMember(groupId, msg.sender),
      'Caller is not a member of the group'
    );
    uint256 proposalId = ++activeProposalId;
    proposals[proposalId] = Proposal({
      proposer: msg.sender,
      groupId: groupId, // Asignar el groupId a la propuesta
      executed: false,
      votesFor: 0,
      votesAgainst: 0,
      actionType: actionType,
      newValue: newValue
    });
    activeProposalByGroup[groupId] = proposalId;
    emit ProposalCreated(proposalId, actionType, newValue);
  }

  function vote(uint256 proposalId, bool support) public {
    Proposal storage proposal = proposals[proposalId];
    require(!hasVoted[proposalId][msg.sender], 'Already voted');
    require(
      squaryContract.isMember(proposal.groupId, msg.sender),
      'Caller is not a member of the relevant group'
    );

    if (support) {
      proposal.votesFor++;
    } else {
      proposal.votesAgainst++;
    }
    hasVoted[proposalId][msg.sender] = true;
    emit VoteCasted(proposalId, msg.sender, support);
  }

  function executeProposal(uint256 proposalId) public {
    Proposal storage proposal = proposals[proposalId];
    require(
      squaryContract.isMember(proposal.groupId, msg.sender),
      'Caller is not a member of the relevant group'
    );
    require(!proposal.executed, 'Proposal already executed');
    require(isThresholdMet(proposalId), 'Not enough votes to execute proposal');

    bool success = false;

    if (proposal.actionType == ActionType.SettleDebts) {
      Debt[] memory debts = squaryContract.getPendingDebts(proposal.groupId);
      success = squaryContract.settleGroup(proposal.groupId, debts);
    } else if (proposal.actionType == ActionType.AddMember) {
      success = squaryContract.addGroupMember(
        proposal.groupId,
        address(uint160(proposal.newValue))
      );
    } else if (proposal.actionType == ActionType.RemoveMember) {
      success = squaryContract.removeGroupMember(
        proposal.groupId,
        address(uint160(proposal.newValue))
      );
    } else if (proposal.actionType == ActionType.ChangeThreshold) {
      success = squaryContract.changeGroupThreshold(
        proposal.groupId,
        proposal.newValue
      );
    }

    require(success, 'Operation failed');

    proposal.executed = true;
    emit ProposalExecuted(proposalId, proposal.actionType, proposal.newValue);
    activeProposalByGroup[proposal.groupId] = 0;
  }
}
