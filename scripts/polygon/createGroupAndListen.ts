import { ethers } from 'hardhat';

async function createGroup() {
    const contractAddress = "0xfbAf3b7764Ec01bD2AC8ED701cCa183c273E902c";
    const [signer] = await ethers.getSigners();

    const contract = await ethers.getContractAt("SquaryPolygonTest", contractAddress, signer);

    const groupName = "Jujuy35";
    const groupMembers = ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"];
    const signatureThreshold = 2;
    const tokenAddress = "0x3B22bf17D16B87286Ead98D04f5Db0c3134BD121"; 

    // Listen for the GroupCreated event
    contract.on("GroupCreated", (id, name, members) => {
        console.log("Group Created Event:");
        console.log("ID:", id);
        console.log("Name:", name);
        console.log("Members:", members);
    });
    
    const tx = await contract.createGroup(groupName, groupMembers, signatureThreshold, tokenAddress);
    await tx.wait();

    console.log("Group creation transaction hash:", tx.hash);

    // Add a small delay to allow the event listener to capture the event
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Remove the listener after capturing the event
    contract.removeAllListeners("GroupCreated");
  }

createGroup()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
