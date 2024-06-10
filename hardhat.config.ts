import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19"
      }
    ]
  },
  networks: {
    Amoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY1 ? [process.env.PRIVATE_KEY1] : [],
      chainId: 80002
    },
    PolygonMainnet: { 
      url: "https://polygon-rpc.com/", // public endpoint
      accounts: process.env.PRIVATE_KEY1 ? [process.env.PRIVATE_KEY1] : [],
      chainId: 137, // ID Polygon official chain
    },
    baseTestnet: {
      url:"https://api.developer.coinbase.com/rpc/v1/base-sepolia/aOcbTxSy4UW-rAet6Qc7EQg3cM_enXfH",
      accounts: process.env.PRIVATE_KEY1 ? [process.env.PRIVATE_KEY1] : [],
      chainId: 84532
    }
  }
}

export default config;

