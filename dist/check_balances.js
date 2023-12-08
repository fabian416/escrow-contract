"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const { ethers } = require("hardhat");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function main() {
    const contractAddress = "0xE1856Dd6c8e6902b6a7B487caDa565a59DeC8FD6";
    const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
    const abi = [
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
            "name": "BalanceDecreased",
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
            "name": "BalanceIncreased",
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
    ];
    // Crea una instancia del contrato
    const squaryContract = new ethers.Contract(contractAddress, abi, provider);
    // Direcciones de los miembros del grupo
    const members = ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x75767610d15FA80425a2BDF6Cd8FCA6444786189", "0xc97E9BE291586e4A8c7e8aB858020873e64711Eb", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A", "0xceb0dB721150692b9DEDf566Dee240dc38bb1E65"];
    // Consulta y muestra los balances
    for (let member of members) {
        let balance = await squaryContract.getMemberBalance("0x15D6A57e307e246346Eb19A4511C92da118e49bF", member);
        console.log(`Balance de ${member}: ${balance.toString()}`);
    }
}
main()
    .then(() => process.exit(0))
    .catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=check_balances.js.map