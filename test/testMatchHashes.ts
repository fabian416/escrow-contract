const { expect } = require("chai");
import { ethers } from 'hardhat';

describe("HashTest", function () {

    let HashTest, hashTest, groupId, debts, encodeHash, encodePackedHash;

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

    it("should generate the correct hash using abi.encode", async function () {
        const nonce = 1; // Consistencia con el valor devuelto por getNonce

        // Generamos el hash esperado utilizando ethers.utils.keccak256
        let hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32"], [groupId]));
        for (let debt of debts) {
            hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
                ["bytes32", "address", "address", "uint256"],
                [hash, debt.debtor, debt.creditor, debt.amount]
            ));
        }
        const expectedHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "string", "uint256"],
            [hash, "settleDebts", nonce]
        ));

        encodeHash = await hashTest.calculateActionHash(
            groupId,
            debts,
            nonce
        );

        console.log("Expected Hash Abi Encode:", expectedHash);
        console.log("Encode Hash from Contract:", encodeHash);

        expect(expectedHash).to.equal(encodeHash);
    });

    it("should generate the correct hash using abi.encodePacked", async function () {
        const nonce = 1; // Consistencia con el valor devuelto por getNonce

        // Generamos el hash esperado utilizando ethers.utils.keccak256 y abi.encodePacked
        let hash = ethers.keccak256(ethers.solidityPacked(["bytes32"], [groupId]));
        for (let debt of debts) {
            hash = ethers.keccak256(ethers.solidityPacked(
                ["bytes32", "address", "address", "uint256"],
                [hash, debt.debtor, debt.creditor, debt.amount]
            ));
        }
        const expectedPackedHash = ethers.keccak256(ethers.solidityPacked(
            ["bytes32", "string", "uint256"],
            [hash, "settleDebts", nonce]
        ));

        encodePackedHash = await hashTest.getEncodePackedHash(
            groupId,
            debts,
            nonce
        );

        console.log("Expected Hash Abi Encode Packed:", expectedPackedHash);
        console.log("Encode Packed Hash from Contract:", encodePackedHash);

        expect(expectedPackedHash).to.equal(encodePackedHash);
    });
});
