import { ethers } from 'hardhat';
import ABI from '../../artifacts/contracts/polygon/SquaryPolygonTest.sol/SquaryPolygonTest.json';

async function proposeSettle(groupId, groupMembers) {
    const contractAddress = "0x56cC4aB4101f49E5De730a601d4427846F499cCe";
    const [signer] = await ethers.getSigners();
    const secondaryPrivateKey = "7f570be45d1216529322a12375cb0aa8d7d7d62dc21ee597acb9e9ca71ba2ed7";
    const secondarySigner = new ethers.Wallet(secondaryPrivateKey, ethers.provider);

    const contract = new ethers.Contract(contractAddress, ABI.abi, signer);

    const debts = [
        {
            debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
            creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
            amount: ethers.parseUnits("50", 18)
        }
    ];

    const nonce = await contract.getNonce(groupId);
    console.log("Nonce:", nonce);

    // Usando abi.encodePacked
    const actionHashScript = ethers.solidityPacked(
        ["bytes32", "address", "address", "uint256", "string", "uint256"],
        [
            groupId,
            debts[0].debtor,
            debts[0].creditor,
            debts[0].amount,
            "settleDebts",
            nonce
        ]
    );

    const hashedEncoded = ethers.keccak256(actionHashScript);
    console.log("Action Hash (Script):", hashedEncoded);

    const actionHashContract = await contract.calculateActionHash(groupId, debts, nonce);
    console.log("Action Hash (Contract):", actionHashContract);

    if (actionHashScript !== actionHashContract) {
        throw new Error("Hashes do not match");
    }

    const signature1 = await signer.signMessage(ethers.getBytes(actionHashScript));
    const signature2 = await secondarySigner.signMessage(ethers.getBytes(actionHashScript));

    const signatures = [signature1, signature2];

    const groupDetails = await contract.getGroupDetails(groupId);
    console.log("Group Name:", groupDetails[0]);
    console.log("Group Members:", groupDetails[1]);

    const allSignersAreMembers = signatures.every(signature => {
        const signerAddress = ethers.verifyMessage(ethers.getBytes(actionHashScript), signature);
        console.log("Signer Address:", signerAddress);
        const isMember = groupMembers.includes(signerAddress);
        console.log("Is Member:", isMember);
        return isMember;
    });

    if (!allSignersAreMembers) {
        throw new Error("One or more signers are not members of the group");
    }

    contract.on("DebugSigner", (debtor, creditor) => {
        console.log(`DebugSigner Event - Debtor: ${debtor}, Creditor: ${creditor}`);
    });

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
