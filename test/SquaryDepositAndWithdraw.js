const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { expect } = chai;

chai.use(solidity);


before(async function () {
    [owner, gnosisSafeAddress, ...members] = await ethers.getSigners();
    
    const MockUSDC = await ethers.getContractFactory("ERC20Mock");
    mockUSDC = await MockUSDC.deploy("MockUSDC", "mUSDC");
    await mockUSDC.deployed();

    await mockUSDC.mint(owner.address, ethers.utils.parseUnits("1000000", 18));


    Squary = await ethers.getContractFactory("Squary");
    squary = await Squary.deploy(mockUSDC.address);
    await squary.deployed();

    await squary.createGroup(gnosisSafeAddress.address, [owner.address, members[0].address]);
});

it("should allow to deposit usdc", async function(){

    await mockUSDC.transfer(owner.address, ethers.utils.parseUnits("1000",18));
    
    await mockUSDC.connect(owner).approve(squary.address, ethers.utils.parseUnits("10", 18));

    const tx = await squary.connect(owner).depositFunds(gnosisSafeAddress.address, ethers.utils.parseUnits("5", 18));
    await expect(tx).to.emit(squary,"DepositMade").withArgs(gnosisSafeAddress.address, owner.address, ethers.utils.parseUnits("5", 18 ))
});

it("Should allow to withdraw usdc", async function () {

    const tx = await squary.connect(owner).withdrawFunds(gnosisSafeAddress.address, ethers.utils.parseUnits("3", 18));

    await expect(tx).to.emit(squary, "WithdrawalMade").withArgs(gnosisSafeAddress.address, owner.address, ethers.utils.parseUnits("3", 18));
});

it("Should not allow to withdraw usdc", async function () {
    try {
    const tx = await squary.connect(owner).withdrawFunds(gnosisSafeAddress.address, ethers.utils.parseUnits("20", 18));
    await tx.wait()
    
    expect.fail("the transaction should not complete");
    } catch(error) {
        expect(error.message).to.include("Insufficient funds to withdraw");
    }
});