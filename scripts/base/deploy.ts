import { ethers } from "hardhat";

async function main() {

  const usdcTokenAddress = "0x87B6F2A7A9e371f93bBbE75926400699202B8a58";
  const usdtTokenAddress = "0x8c0a45A1a3442F6Bc3aB553942139BB575036Ab1";
  const daiTokenAddress = "0x75830602E8DE3048C12a73630B6d03cE74ACc643";

  //  Get the signer (wallet) that is deploying the contract
  const [deployer] = await ethers.getSigners();

  //  Print the deployer address and his balance
  console.log("Deploying contracts with the account:", deployer.address);

  const SquaryFactory = await ethers.getContractFactory("SquaryBaseTest");
  const squary = await SquaryFactory.deploy(usdcTokenAddress, usdtTokenAddress, daiTokenAddress);

  await squary.waitForDeployment();

  console.log("Squary deployed to:", squary.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
