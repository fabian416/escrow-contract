import { ethers } from "hardhat";


async function main() {

  const usdcTokenAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
  const usdtTokenAddress = "";
  const daiTokenAddress = "";

  //  get the signer (wallet) that is deploying the contract
  const [deployer] = await ethers.getSigners();

  //  print the deployer address and his balance
  console.log("Deploying contracts with the account:", deployer.address);

  const SquaryFactory = await ethers.getContractFactory("SquaryV2");
  const squary = await SquaryFactory.deploy(usdcTokenAddress);

  await squary.deployed();

  console.log("Squary deployed to:", squary.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
