import { ethers } from 'hardhat';

async function createGroup() {
    const contractAddress = "0xa02676e00e8C53528e0F984075A0AE732D7340f9";
    const [signer] = await ethers.getSigners();
    const abi = [
        "function createGroup(string memory _name, address[] memory _members, uint256 _signatureThreshold, address _tokenAddress) public",
        "function getGroupDetails(bytes32 groupId) public view returns (string, address[])",
        "function groupCounter() public view returns (uint256)",
        "event GroupCreated(bytes32 indexed id, string name, address[] members)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const groupName = "Jujuy25";
    const groupMembers = ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"];
    const signatureThreshold = 2;
    const tokenAddress = "0x3B22bf17D16B87286Ead98D04f5Db0c3134BD121"; // Example USDT address on mainnet

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
