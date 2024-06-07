import { ethers } from 'hardhat';

async function proposeSettle(groupId: string, groupMembers: string[]) {
    const contractAddress = "0x3bD9f27ED60C41471157F4F95823bE43F22D4b90";
    const [signer] = await ethers.getSigners();
    const secondarySigner = new ethers.Wallet("7f570be45d1216529322a12375cb0aa8d7d7d62dc21ee597acb9e9ca71ba2ed7", ethers.provider);

    const abi = [
        "function settleDebtsWithSignatures(bytes32 groupId, (address debtor, address creditor, uint256 amount)[] debts, bytes[] signatures) public",
        "function getGroupDetails(bytes32 groupId) public view returns (string, address[])",
        "event DebugSigner(address signer, address[] members)",
        "event DebugActionHash(bytes32 actionHash, bytes32 groupId, (address debtor, address creditor, uint256 amount)[] debts, uint256 nonce)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const debts = [
        {
            debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
            creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
            amount: 50n * 10n ** 18n // BigInt conversion
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

    // Escuchar el evento de depuración
    contract.on("DebugSigner", (signer, members) => {
        console.log(`DebugSigner Event - Signer: ${signer}, Members: ${members}`);
    });

    // Escuchar el evento de depuración del actionHash
    contract.on("DebugActionHash", (actionHash, groupId, debts, nonce) => {
        console.log(`DebugActionHash Event - actionHash: ${actionHash}, groupId: ${groupId}, debts: ${debts}, nonce: ${nonce}`);
    });

    try {
        const tx = await contract.settleDebtsWithSignatures(groupId, debts, signatures);
        await tx.wait();
        console.log("Transacción completada con éxito:", tx);
    } catch (error) {
        console.error("Error al ejecutar la transacción:", error);
    }
}

proposeSettle("0x60b83bcd0ae9839cf9a60b2ae65be9f9f8cc58ed5ab61f4ac0aab76596d79794", ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
