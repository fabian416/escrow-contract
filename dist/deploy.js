"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const [deployer] = await hardhat_1.ethers.getSigners();
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${hardhat_1.ethers.utils.formatEther(balance)}`);
    const SquaryFactory = await hardhat_1.ethers.getContractFactory("Squary");
    const squary = await SquaryFactory.deploy();
    await squary.deployTransaction.wait();
    console.log("Squary deployed to:", squary.address);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=deploy.js.map