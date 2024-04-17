// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import './Squary.sol';
contract Voting {

  struct Proposal {
        address proposer;
        uint256 end;
        bool executed;
        uint256 votesFor;
        uint256 votesAgainst;
        ActionType actionType;
        uint256 newValue;
    }

  struct GroupVoting {
    uint256 votesFor;
    uint256 voteThreshold;
    address[] members; 
}

  enum ActionType {
    ChangeThreshold, // Change the voting threshold
    AddMember, // Add a new member
    RemoveMember // Remove a member
  }

  address[] public members;
  Squary public squaryContract;
  uint256 public voteThreshold;
  uint256 public proposalCount;
  uint256 public activeProposalId; // ID de la propuesta activa
  bool public isProposalActive; // Indica si hay una propuesta en curso

  mapping(uint256 => mapping(address => bool)) public hasVoted;
  mapping(uint256 => Proposal) public proposals;
  mapping(bytes32 => GroupVoting) public groupVotings;

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

  modifier onlyMember() {
    require(isMember(msg.sender), 'Caller is not a member');
    _;
  }

  constructor(
    address squaryAddress
  ) {
    squaryContract = Squary(squaryAddress);
  }
  function isThresholdMet(bytes32 groupId) public view returns (bool) {
    GroupVoting storage group = groupVotings[groupId];
    return group.votesFor > group.voteThreshold;
  }

  function createProposal(ActionType actionType, uint256 newValue) public {
        require(!isProposalActive, "There is already an active proposal.");
        uint256 proposalId = activeProposalId++;
        proposals[proposalId] = Proposal({
            proposer: msg.sender,
            end: block.timestamp + 1 days,
            executed: false,
            votesFor: 0,
            votesAgainst: 0,
            actionType: actionType,
            newValue: newValue
        });
        isProposalActive = true;
        emit ProposalCreated(proposalId, actionType, newValue);
    }

  function vote(uint256 proposalId, bool support) public onlyMember {
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp <= proposal.end, 'Voting period has ended');
    require(!hasVoted[proposalId][msg.sender], 'Already voted');

    if (support) {
      proposal.votesFor++;
    } else {
      proposal.votesAgainst++;
    }
    hasVoted[proposalId][msg.sender] = true;
    emit VoteCasted(proposalId, msg.sender, support);
  }

  function executeProposal(uint256 proposalId) public onlyMember {
    Proposal storage proposal = proposals[proposalId];
    require(block.timestamp > proposal.end, 'Voting period not yet ended');
    require(!proposal.executed, 'Proposal already executed');
    require(
      proposal.votesFor > voteThreshold,
      'Not enough votes to execute proposal'
    );

    // Ejecutar la acción dependiendo del tipo de propuesta
    if (proposal.actionType == ActionType.ChangeThreshold) {
        voteThreshold = proposal.newValue;
    } else if (proposal.actionType == ActionType.AddMember) {
        members.push(address(uint160(proposal.newValue))); // Cast uint to address
    } else if (proposal.actionType == ActionType.RemoveMember) {
        removeMember(address(uint160(proposal.newValue)));
    }

    // Marcar la propuesta como ejecutada
    proposal.executed = true;

    // Emitir evento de propuesta ejecutada
    emit ProposalExecuted(proposalId, proposal.actionType, proposal.newValue);

    // Desactivar la bandera de propuesta activa, permitiendo nuevas propuestas
    isProposalActive = false;
}

  function isMember(address user) public view returns (bool) {
    for (uint256 i = 0; i < members.length; i++) {
      if (members[i] == user) {
        return true;
      }
    }
    return false;
  }
function registerGroup(bytes32 groupId, address[] calldata newMembers, uint256 threshold) external returns (bool) {
    if (msg.sender != address(squaryContract)) {
        return false; // Retornar falso si el llamante no está autorizado
    }
    GroupVoting storage groupVoting = groupVotings[groupId];
    groupVoting.voteThreshold = threshold;
    groupVoting.members = newMembers;
    return true; // Retornar verdadero si la operación es exitosa
}


  function removeMember(address member) private {
    for (uint256 i = 0; i < members.length; i++) {
      if (members[i] == member) {
        members[i] = members[members.length - 1];
        members.pop();
        break;
      }
    }
  }
}
