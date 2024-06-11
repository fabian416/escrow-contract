import { ethers } from 'hardhat';
import ABI from '../../artifacts/contracts/polygon/SquaryPolygonTest.sol/SquaryPolygonTest.json';

async function proposeSettle(groupId, groupMembers) {
    const contractAddress = "0xfbAf3b7764Ec01bD2AC8ED701cCa183c273E902c";
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

    let hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32"], [groupId]));
    for (let debt of debts) {
        hash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32", "address", "address", "uint256"],
            [hash, debt.debtor, debt.creditor, debt.amount]
        ));
    }
    const actionHashScript = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "string", "uint256"],
        [hash, "settleDebts", nonce]
    ));

    console.log("Action Hash Script:", actionHashScript);

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

    for (const signature of signatures) {
        const signerAddress = await contract.getSigner(actionHashScript, signature);
        console.log("Signer Address from Contract:", signerAddress);
        const isMember = groupMembers.includes(signerAddress);
        console.log("Is Member:", isMember);
        if (!isMember) {
            throw new Error("One or more signers are not members of the group");
        }
    }

    try {
        const tx = await contract.settleDebtsWithSignatures(groupId, debts, signatures);
        await tx.wait();
        console.log("Transaction completed successfully:", tx);
    } catch (error) {
        console.error("Error executing transaction:", error);
    }
}

proposeSettle("0x60b83bcd0ae9839cf9a60b2ae65be9f9f8cc58ed5ab61f4ac0aab76596d79794", ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
