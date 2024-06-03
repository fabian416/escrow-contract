import { ethers } from 'hardhat';

async function main() {
    const contractAddress = "0x21fBF9C5ea60307C1Ec095aa9cFdF17f6B2C4B5d";
    const [signer] = await ethers.getSigners();
    const abi = [
        "function settleDebtsWithSignatures(bytes32 groupId, (address debtor, address creditor, uint256 amount)[] debts, bytes[] signatures) public",
        "function getGroupMembers(bytes32 groupId) public view returns (address[] memory)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const groupId = "0xca615fb1b393ad404e7ff1dfb202fc27fd39a7314d2956a94109363585e22572";
    const debts = [
        {
            debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
            creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
            amount: ethers.parseUnits("50", 18)
        }
    ];

    const signatures = [
        "0xb5125249110121152a8f3c1448f2b78141ed346d00292c8ba2aeee4665a0b0c177eb5710763ee12677dcac8400959ebee6a67aeaa9179c7e0ee9376835d9f77f1c",
        "0x817ab564af6b35616d3978d18c98bade8275082f8654047c3ea00ff55a2ca5cc60ee841013fa19430d428250f75c82a723ff5f73dc8aa5b308b62bc8d26cc1231c"
    ];

    try {
        const groupMembers = await contract.getGroupMembers(groupId);
        console.log("Group Members:", groupMembers);

        const actionHash = ethers.keccak256(
            ethers.AbiCoder.defaultAbiCoder().encode(
                ["bytes32", "address[]", "address[]", "uint256[]", "string", "uint256"],
                [groupId, debts.map(d => d.debtor), debts.map(d => d.creditor), debts.map(d => d.amount), "settleDebts", 0]
            )
        );
        console.log("Action Hash:", actionHash);

        const allSignersAreMembers = signatures.every(signature => {
            const signerAddress = ethers.verifyMessage(ethers.getBytes(actionHash), signature);
            return groupMembers.includes(signerAddress);
        });

        if (!allSignersAreMembers) {
            throw new Error("One or more signers are not members of the group");
        }

        const tx = await contract.settleDebtsWithSignatures(groupId, debts, signatures);
        await tx.wait();
        console.log("Transacción completada con éxito:", tx);
    } catch (error) {
        console.error("Error al ejecutar la transacción:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
