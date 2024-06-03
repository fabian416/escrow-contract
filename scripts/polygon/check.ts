import { ethers } from 'hardhat';

async function verifyGroupDetails(groupId) {
    const contractAddress = "0xAB2BD4A1871b1c7D782dB410292cC8e645955352";
    const [signer] = await ethers.getSigners();
    const abi = [
        "function getGroupDetails(bytes32 groupId) public view returns (string memory name, address[] memory members)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
        // Fetch group details from the contract using the provided groupId
        const groupDetails = await contract.getGroupDetails(groupId);
        console.log("Group Name:", groupDetails[0]);
        console.log("Group Members:", groupDetails[1]);
    } catch (error) {
        console.error("Error fetching group details:", error);
    }
}

const groupId = "0x15e253741ec19227dca8cc6fed02f15707e27ff875a96c8e7ea64bfafca8c0c4";
verifyGroupDetails(groupId)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
