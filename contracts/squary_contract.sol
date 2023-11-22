// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Squary {
    IERC20 public usdcToken; 

    struct Group {
        address gnosisSafe;
        address[] members;
        uint256 consentThreshold;
        mapping(address => uint256) deposits;
        mapping(address => uint256) excess;
        bool settleCompleted;
    }
     struct Debt {
        address debtor;
        address creditor;
        uint256 amount;
    }
    
    mapping(uint256 => Group) public groups;
    uint256 public nextGroupId;

    event GroupCreated(uint256 indexed groupId, address gnosisSafe, address[] members);
    event DepositMade(uint256 indexed groupId, address indexed member, uint256 amount);
    event WithdrawalMade(uint256 indexed groupId, address indexed member, uint256 amount);
    event SettleCompleted(uint256 indexed groupId);
    event DebtPaid(uint256 indexed groupId, address indexed debtor, uint256 amount);

    modifier onlyGnosisSafe(uint256 groupId) {
        require(msg.sender == groups[groupId].gnosisSafe, "This can only be called by the group's Gnosis Safe");
        _;
    }

    modifier onlyMember(uint256 groupId) {
        bool isMember = false;
        for (uint i = 0; i < groups[groupId].members.length; i++) {
            if (groups[groupId].members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Only group member can perform this action");
        _;
    }
    constructor(address _usdcTokenAddress) {
        usdcToken = IERC20(_usdcTokenAddress); 
    }

    function createGroup(
    uint256 _groupId, 
    address _gnosisSafe, 
    uint256 _consentThreshold, 
    address[] memory _members
    ) external {
    require(groups[_groupId].gnosisSafe == address(0), "GroupId already used");

    Group storage newGroup = groups[_groupId];
    newGroup.gnosisSafe = _gnosisSafe;
    newGroup.consentThreshold = _consentThreshold;
    newGroup.members = _members;

    emit GroupCreated(_groupId, _gnosisSafe, _members);
}


    function depositFunds(uint256 groupId, uint256 amount) external onlyMember(groupId) {
    require(!groups[groupId].settleCompleted, "The group is already settled");
    require(amount > 0, "You need to deposit some funds");

    // Transfer tokens from the user to the contract 
    require(usdcToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

    // Update the balance deposit of the user
    groups[groupId].deposits[msg.sender] += amount;

    
    emit DepositMade(groupId, msg.sender, amount);
    }


    function withdrawFunds(uint256 groupId, uint256 _amount) external onlyMember(groupId) {
    require(groups[groupId].settleCompleted, "The group has not been settled yet");
    require(groups[groupId].deposits[msg.sender] >= _amount, "Insufficient funds to withdraw");

    // withdraw the amount of tokens in USDC
    require(usdcToken.transfer(msg.sender, _amount), "USDC transfer failed");

    groups[groupId].deposits[msg.sender] -= _amount;
    emit WithdrawalMade(groupId, msg.sender, _amount);
    }

    function settleGroup(uint256 groupId, Debt[] calldata simplifiedDebts) external onlyGnosisSafe(groupId) {
    require(!groups[groupId].settleCompleted, "The group is already settled");

    // update the balances based on the simplify debts
    for (uint i = 0; i < simplifiedDebts.length; i++) {
        Debt memory debt = simplifiedDebts[i];
        int256 owedAmount = int256(debt.amount) - int256(groups[groupId].deposits[debt.debtor]);
        
       if (owedAmount > 0) {
        // If the debtor owes more than they have deposited
        groups[groupId].deposits[debt.creditor] += uint256(owedAmount);
        groups[groupId].deposits[debt.debtor] = 0;
        } else {
        // If the debtor has deposited more than they owe 
        groups[groupId].deposits[debt.debtor] -= debt.amount;
        groups[groupId].excess[debt.debtor] += uint256(-owedAmount); 
    }
    }

    groups[groupId].settleCompleted = true;
    emit SettleCompleted(groupId);
    }

    function payDebt(uint256 groupId, uint256 amount) external onlyMember(groupId) {
    require(groups[groupId].settleCompleted, "The group settlement has not been completed yet");
    require(amount > 0, "You need to deposit some amount");
    require(groups[groupId].deposits[msg.sender] < 0, "You do not have any debt to pay");

    // Transfer tokens from the user to the contract
    require(usdcToken.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

    // Update the user's balance deposit
    groups[groupId].deposits[msg.sender] += amount;
    
    emit DebtPaid(groupId, msg.sender, amount);
    }

    function getDeposit(uint256 groupId, address _member) external view returns (uint256) {
        return groups[groupId].deposits[_member];
    }
    // Function to get group details including members
    function getGroupDetails(uint256 groupId) public view returns (
        address gnosisSafe,
        address[] memory members,
        uint256 consentThreshold,
        bool settleCompleted
    ) {
        Group storage group = groups[groupId];
        return (
            group.gnosisSafe,
            group.members,
            group.consentThreshold,
            group.settleCompleted
        );
    }


}
