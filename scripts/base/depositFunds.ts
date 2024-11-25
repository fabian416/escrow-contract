import { ethers } from 'hardhat';

async function testDepositFunds(groupId: string, amount: string) {
    const contractAddress = "0x364f3828A0FD4A7087590b2F5C083F3CD0AE6d7B"; // Dirección de tu contrato principal
    const tokenAddress = "0xd0602be1b9c3ED0715Be5786AD34114D9Da737BD"; // Dirección del token USDT
    const [signer] = await ethers.getSigners();
    
    const contractAbi = [
        "function depositFunds(bytes32 groupId, uint256 amount) external",
        "function isMember(bytes32 groupId, address user) public view returns (bool)"
    ];
    const tokenAbi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
        "function balanceOf(address owner) public view returns (uint256)"
    ];

    const groupContract = new ethers.Contract(contractAddress, contractAbi, signer);
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

    try {
        // Asegúrate de que el contrato tiene la aprobación
        const amountToApprove = ethers.parseUnits(amount, 6); // 6 decimales para USDT
        console.log(`Aprobando ${amount} tokens para el contrato...`);
        const approveTx = await tokenContract.approve(contractAddress, amountToApprove);
        await approveTx.wait();
        console.log("Aprobación confirmada.");

        // Verifica membresía
        const isMember = await groupContract.isMember(groupId, signer.address);
        console.log("¿Es miembro?", isMember);

        // Intentar depósito
        console.log(`Intentando depositar ${amount} tokens al grupo ${groupId}...`);
        const depositTx = await groupContract.depositFunds(groupId, amountToApprove);
        await depositTx.wait();
        console.log("Depósito exitoso.");
    } catch (error) {
        console.error("Error durante el depósito:", error);
    }
}

const groupId = "0x009261d9b1358e9b124079e138fe2f490d7a016b7678bbfeb83aac735ac7b43c";
const depositAmount = "50"; // Cantidad a depositar
testDepositFunds(groupId, depositAmount)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });