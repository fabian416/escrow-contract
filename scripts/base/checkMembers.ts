import { ethers } from 'hardhat';

async function verifyMembershipAndAllowance(groupId: string, userAddress: string, tokenAddress: string) {
    const contractAddress = "0x364f3828A0FD4A7087590b2F5C083F3CD0AE6d7B"; // Dirección de tu contrato principal
    const [signer] = await ethers.getSigners();
    
    const groupAbi = [
        "function isMember(bytes32 groupId, address user) public view returns (bool)",
        "function getGroupDetails(bytes32 groupId) public view returns (string memory name, address[] memory members)"
    ];
    const tokenAbi = [
        "function allowance(address owner, address spender) public view returns (uint256)",
        "function balanceOf(address owner) public view returns (uint256)"
    ];
    
    const groupContract = new ethers.Contract(contractAddress, groupAbi, signer);
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    
    try {
        // Verificar si el usuario es miembro del grupo
        const isMember = await groupContract.isMember(groupId, userAddress);
        console.log(`Is Member (${userAddress}):`, isMember);

        // Obtener detalles del grupo
        const groupDetails = await groupContract.getGroupDetails(groupId);
        console.log("Group Name:", groupDetails[0]);
        console.log("Group Members:", groupDetails[1]);

        // Verificar allowance para el contrato
        const allowance = await tokenContract.allowance(userAddress, contractAddress);
        console.log(`Allowance for ${userAddress}:`, ethers.formatUnits(allowance, 6));

        // Verificar balance del usuario
        const balance = await tokenContract.balanceOf(userAddress);
        console.log(`Balance of ${userAddress}:`, ethers.formatUnits(balance, 6));

    } catch (error) {
        console.error("Error verifying membership or allowance:", error);
    }
}

const groupId = "0x009261d9b1358e9b124079e138fe2f490d7a016b7678bbfeb83aac735ac7b43c";
const userAddress = "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"; // Dirección del usuario
const tokenAddress = "0xd0602be1b9c3ED0715Be5786AD34114D9Da737BD"; // Dirección del token USDT/USDC
verifyMembershipAndAllowance(groupId, userAddress, tokenAddress)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });