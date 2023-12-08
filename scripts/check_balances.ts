const { ethers } = require("hardhat");
import * as dotenv from "dotenv";

dotenv.config();

async function main() {

    const contractAddress = "0xAA04456f31a6177C4CE0Cf2655e034177E873776"
    const gnosisSafeAddress = "0x855534577263959E57454E4a6462EA32fb1a6E64"
    const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
    const abi =  [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_usdcTokenAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "member",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DepositMade",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          }
        ],
        "name": "GroupCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          }
        ],
        "name": "SettleCompleted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "member",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "WithdrawalMade",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_gnosisSafe",
            "type": "address"
          },
          {
            "internalType": "address[]",
            "name": "_members",
            "type": "address[]"
          }
        ],
        "name": "createGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "depositFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          }
        ],
        "name": "getGroupDetails",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          },
          {
            "internalType": "bool",
            "name": "settleCompleted",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "member",
            "type": "address"
          }
        ],
        "name": "getMemberBalance",
        "outputs": [
          {
            "internalType": "int256",
            "name": "",
            "type": "int256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "groups",
        "outputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "settleCompleted",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "debtor",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "creditor",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "internalType": "struct Squary.Debt[]",
            "name": "simplifiedDebts",
            "type": "tuple[]"
          }
        ],
        "name": "settleGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usdcToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "gnosisSafe",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
    // Crea una instancia del contrato
    const squaryContract = new ethers.Contract(contractAddress, abi, provider);
    // Direcciones de los miembros del grupo
    const members = ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979","0x18dd4b2D74D7269Fc68c4da13bE9Bd8CB2b8231B","0x75767610d15FA80425a2BDF6Cd8FCA6444786189","0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A", "0xE5E43E89dfDdaea8408657D9957161e7A50231dE"];
    // Consulta y muestra los balances
    for (let member of members) {
        let balance = await squaryContract.getMemberBalance(gnosisSafeAddress, member);
        console.log(`Balance de ${member}: ${balance.toString()}`);
    }
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });