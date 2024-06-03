import { ethers } from 'hardhat';

async function createGroup() {
    const contractAddress = "0xAB2BD4A1871b1c7D782dB410292cC8e645955352";
    const [signer] = await ethers.getSigners();
    const abi = [
        // ABI del contrato, añade las funciones que usarás como createGroup y getGroupDetails
        "function createGroup(string memory _name, address[] memory _members, uint256 _signatureThreshold, address _tokenAddress) external",
        "function getGroupDetails(bytes32 groupId) public view returns (string memory name, address[] memory members)",
        "function groupCounter() public view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const groupName = "Jujuy3";
    const groupMembers = ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"];
    const signatureThreshold = 2;
    const tokenAddress = "0x3B22bf17D16B87286Ead98D04f5Db0c3134BD121"; // Example USDT address on mainnet

    // Get the current group counter
    const groupCounter = await contract.groupCounter();

    // Generate the groupId using the same logic as in the smart contract
    const groupId = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "address[]"],
        [signer.address, groupCounter, groupMembers]
    ));

    console.log("Generated Group ID:", groupId);

    // Create the group and wait for the transaction to be mined
    const tx = await contract.createGroup(groupName, groupMembers, signatureThreshold, tokenAddress);
    const receipt = await tx.wait();

    console.log("Transaction receipt:", receipt);

    // Listen for the GroupCreated event in the transaction receipt
    const event = receipt.events?.find(event => event.event === "GroupCreated");

    if (event) {
        console.log("Group Created Event:");
        console.log("ID:", event.args?.id);
        console.log("Name:", event.args?.name);
        console.log("Members:", event.args?.members);
    } else {
        console.error("GroupCreated event not found in transaction receipt");
    }

    // Fetch group details from the contract using the generated groupId
    const groupDetails = await contract.getGroupDetails(groupId);
    console.log("Group Name:", groupDetails[0]);
    console.log("Group Members:", groupDetails[1]);

    return { groupId, groupMembers };
}

createGroup()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
