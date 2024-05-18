import { ethers } from "hardhat";

async function main() {

  const usdcTokenAddress = "0x439b59e41ED27F7B2bF7ed6f72Dd4447B1cAA363";
  const usdtTokenAddress = "0x3B22bf17D16B87286Ead98D04f5Db0c3134BD121";
  const daiTokenAddress = "0x75830602E8DE3048C12a73630B6d03cE74ACc643";

  //  get the signer (wallet) that is deploying the contract
  const [deployer] = await ethers.getSigners();

  //  print the deployer address and his balance
  console.log("Deploying contracts with the account:", deployer.address);

  const SquaryFactory = await ethers.getContractFactory("SquaryV2");
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
