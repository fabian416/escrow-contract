import { ethers } from 'hardhat';

async function proposeSettle(groupId: string, groupMembers: string[]) {
    const contractAddress = "0x9eDFb6e3203c404Fb8199ad1f8866eD5Cad2be5A";
    const [signer] = await ethers.getSigners();
    const abi = [
        "function settleDebtsWithSignatures(bytes32 groupId, (address debtor, address creditor, uint256 amount)[] debts, bytes[] signatures) public",
        "function getGroupDetails(bytes32 groupId) public view returns (string, address[])"
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const debts = [
        {
            debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
            creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
            amount: ethers.parseUnits("50", 18)
        }
    ];

    const actionHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "address[]", "address[]", "uint256[]", "string", "uint256"],
            [groupId, debts.map(d => d.debtor), debts.map(d => d.creditor), debts.map(d => d.amount), "settleDebts", 0]
        )
    );
    console.log("Action Hash:", actionHash);

    const signature1 = await signer.signMessage(ethers.getBytes(actionHash));
    // Assume you get signature2 from the other group member externally
    const signature2 = "0x817ab564af6b35616d3978d18c98bade8275082f8654047c3ea00ff55a2ca5cc60ee841013fa19430d428250f75c82a723ff5f73dc8aa5b308b62bc8d26cc1231c"; // Example

    const signatures = [signature1, signature2];

    const groupDetails = await contract.getGroupDetails(groupId);
    console.log("Group Name:", groupDetails[0]);
    console.log("Group Members:", groupDetails[1]);

    const allSignersAreMembers = signatures.every(signature => {
        const signerAddress = ethers.verifyMessage(ethers.getBytes(actionHash), signature);
        console.log("Signer Address:", signerAddress);
        const isMember = groupMembers.includes(signerAddress);
        console.log("Is Member:", isMember);
        return isMember;
    });

    if (!allSignersAreMembers) {
        throw new Error("One or more signers are not members of the group");
    }

    try {
        const tx = await contract.settleDebtsWithSignatures(groupId, debts, signatures);
        await tx.wait();
        console.log("Transacción completada con éxito:", tx);
    } catch (error) {
        console.error("Error al ejecutar la transacción:", error);
    }
}

proposeSettle("0xaee43af420f0192b9efff577670c0faa0b8b13fa379f32a44c2cc529a5148de1", ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
