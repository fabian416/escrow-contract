"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const SquaryFactory = await hardhat_1.ethers.getContractFactory("Squary");
    const squary = await SquaryFactory.deploy();
    // Esperar a que la transacción de despliegue se confirme.
    // Usamos 'any' para evitar errores de tipo de TypeScript.
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