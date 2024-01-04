const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");


chai.use(solidity);
const { expect } = chai;

describe("Squary Contract", function () {
    let Squary, squary;
    let owner, gnosisSafeAddress, members;
    let MockUSDC;

    beforeEach(async function () {
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
        await expect(tx).to.emit(squary, "GroupCreated");
    });

    it("should not allow the creation of a new group", async function () {
        await squary.createGroup(gnosisSafeAddress.address, [members[0].address]);
        await expect(squary.createGroup(gnosisSafeAddress.address, [members[1].address])).to.be.revertedWith("Group already exists");
    });

    it("should allow to deposit usdc", async function(){
        await mockUSDC.transfer(owner.address, ethers.utils.parseUnits("1000",18));
        
        await mockUSDC.connect(owner).approve(squary.address, ethers.utils.parseUnits("10", 18));

        const tx = await squary.connect(owner).depositFunds(gnosisSafeAddress.address, ethers.utils.parseUnits("5", 18));
        await expect(tx).to.emit(squary,"DepositMade").withArgs(gnosisSafeAddress.address, owner.address, ethers.utils.parseUnits("5", 18 ))
    });

    
});
