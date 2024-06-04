import { ethers } from 'hardhat';

async function proposeSettle(groupId: string, groupMembers: string[]) {
    const contractAddress = "0xa02676e00e8C53528e0F984075A0AE732D7340f9";
    const [signer] = await ethers.getSigners();

    // Aquí debes proporcionar la clave privada de la segunda dirección
    const secondarySigner = new ethers.Wallet("", ethers.provider);
    
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
    const signature2 = await secondarySigner.signMessage(ethers.getBytes(actionHash));

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

proposeSettle("0x6019552f31df322c6be9d49a43bd2d384f3465277bcbe4aaee31d9e6a6fa856d", ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
