const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");


chai.use(solidity);
const { expect } = chai;

describe("Squary Contract", function () {
    let Squary, squary;
    let owner, gnosisSafeAddress, members;
    let MockUSDC;

    before(async function () {
        [owner, gnosisSafeAddress, ...members] = await ethers.getSigners();
        
        const MockUSDC = await ethers.getContractFactory("ERC20Mock");
        mockUSDC = await MockUSDC.deploy("MockUSDC", "mUSDC");
        await mockUSDC.deployed();

        await mockUSDC.mint(owner.address, ethers.utils.parseUnits("1000000", 18));


        Squary = await ethers.getContractFactory("Squary");
        squary = await Squary.deploy(mockUSDC.address);
        await squary.deployed();
    });

    it("should allow the creation of a new group", async function () {
        const tx = await squary.createGroup(gnosisSafeAddress.address, [owner.address, members[0].address, members[1].address]);
        
        await expect(tx.wait()).to.not.be.reverted;
        await expect(tx).to.emit(squary, "GroupCreated");
        console.log("Gnosis Safe: ",gnosisSafeAddress.address)
        const groupMembers = await squary.getGroupDetails(gnosisSafeAddress.address);
        console.log("Group Members: " ,groupMembers)

        expect(groupMembers).to.include(owner.address);
    });

    it("should not allow the creation of a new group with the same Gnosis Safe address", async function () {
     
        await expect(squary.createGroup(gnosisSafeAddress.address, [members[1].address]))
            .to.be.revertedWith("Group already exists");
    });
    
});
