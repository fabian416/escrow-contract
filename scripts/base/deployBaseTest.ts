import { ethers } from "hardhat";

async function main() {

  const usdcTokenAddress = "0x87B6F2A7A9e371f93bBbE75926400699202B8a58";
  const usdtTokenAddress = "0xd0602be1b9c3ED0715Be5786AD34114D9Da737BD";
  const daiTokenAddress = "0x75830602E8DE3048C12a73630B6d03cE74ACc643";

  //  Get the signer (wallet) that is deploying the contract
  const [deployer] = await ethers.getSigners();

  //  Print the deployer address and his balance
  console.log("Deploying contracts with the account:", deployer);

  const SquaryFactory = await ethers.getContractFactory("SquaryBaseTest", deployer);
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
