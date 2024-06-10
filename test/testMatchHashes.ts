const { expect } = require("chai");
import { ethers } from 'hardhat';

describe("HashTest", function () {
    let HashTest, hashTest, groupId, debts,  actionHashScript, encodeHash, encodePackedHash;

    before(async function () {
        HashTest = await ethers.getContractFactory("HashTest");
        hashTest = await HashTest.deploy();
        await hashTest.waitForDeployment();

        groupId = "0x60b83bcd0ae9839cf9a60b2ae65be9f9f8cc58ed5ab61f4ac0aab76596d79794"; // Usando groupId hardcodeado

        debts = [
            {
                debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
                creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
                amount: ethers.parseUnits("50", 18)
            }
        ];

    });

    it("should generate the same hash using abi.encode and ethers.solidityPacked", async function () {
        actionHashScript = ethers.solidityPacked(
            ["bytes32", "address", "address", "uint256", "string", "uint256"],
            [
                groupId,
                debts[0].debtor,
                debts[0].creditor,
                debts[0].amount,
                "settleDebts",
                0
            ]
        );

        encodeHash = await hashTest.calculateActionHash(
            groupId,
            debts,
            0
        );

        encodePackedHash = await hashTest.getEncodePackedHash(
            groupId,
            debts,
            0
        );

        console.log("Action Hash Script:", actionHashScript);
        console.log("Encode Hash:", encodeHash);
        console.log("Encode Packed Hash:", encodePackedHash);

        expect(ethers.hexlify(actionHashScript)).to.equal(ethers.hexlify(encodePackedHash));
    });
});
