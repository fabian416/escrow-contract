import { ethers } from 'hardhat';

async function proposeSettle(groupId: string, groupMembers: string[]) {
    const contractAddress = "0x6cA654CcBAC9Fd2E097aedf470a761105Fd5D489";
    const [signer] = await ethers.getSigners();
    const secondarySigner = new ethers.Wallet("7f570be45d1216529322a12375cb0aa8d7d7d62dc21ee597acb9e9ca71ba2ed7", ethers.provider);
    const abi = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_usdcTokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_usdtTokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_daitokenAddress",
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
            "indexed": false,
            "internalType": "bytes32",
            "name": "actionHash",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "indexed": false,
            "internalType": "struct SquaryV2.Debt[]",
            "name": "debts",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "name": "DebugActionHash",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "signer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          }
        ],
        "name": "DebugSigner",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newMember",
            "type": "address"
          }
        ],
        "name": "MemberAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "member",
            "type": "address"
          }
        ],
        "name": "MemberRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "debtor",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "creditor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newThreshold",
            "type": "uint256"
          }
        ],
        "name": "ThresholdChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "newMember",
            "type": "address"
          },
          {
            "internalType": "bytes[]",
            "name": "signatures",
            "type": "bytes[]"
          }
        ],
        "name": "addGroupMember",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "struct SquaryV2.Debt[]",
            "name": "debts",
            "type": "tuple[]"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "name": "calculateActionHash",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "newThreshold",
            "type": "uint256"
          },
          {
            "internalType": "bytes[]",
            "name": "signatures",
            "type": "bytes[]"
          }
        ],
        "name": "changeGroupThreshold",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "_members",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "_signatureThreshold",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_tokenAddress",
            "type": "address"
          }
        ],
        "name": "createGroup",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "daiToken",
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          }
        ],
        "name": "getGroupDetails",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          }
        ],
        "name": "getGroupThreshold",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          }
        ],
        "name": "getNonce",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          }
        ],
        "name": "getUserGroups",
        "outputs": [
          {
            "internalType": "bytes32[]",
            "name": "",
            "type": "bytes32[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "groupCounter",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "groupIds",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "groups",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "signatureThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "member",
            "type": "address"
          }
        ],
        "name": "isMember",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "pendingSettlements",
        "outputs": [
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
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "member",
            "type": "address"
          },
          {
            "internalType": "bytes[]",
            "name": "signatures",
            "type": "bytes[]"
          }
        ],
        "name": "removeGroupMember",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
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
            "internalType": "struct SquaryV2.Debt[]",
            "name": "debts",
            "type": "tuple[]"
          },
          {
            "internalType": "bytes[]",
            "name": "signatures",
            "type": "bytes[]"
          }
        ],
        "name": "settleDebtsWithSignatures",
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
        "inputs": [],
        "name": "usdtToken",
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
            "internalType": "bytes32",
            "name": "groupId",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const debts = [
        {
            debtor: "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A",
            creditor: "0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979",
            amount: 50n * 10n ** 18n // Conversión a BigInt
        }
    ];
    const nonce = await contract.getNonce(groupId);
    // Calcular el hash de la acción utilizando el contrato
    const calculatedActionHash = await contract.calculateActionHash(groupId, debts, nonce);
    console.log("Hash de acción calculado:", calculatedActionHash);
    console.log('nonce of the group:', nonce)

    // Comparar el hash calculado con el generado localmente
    const actionHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address[]", "address[]", "uint256[]", "string", "uint256"],
        [groupId, debts.map(d => d.debtor), debts.map(d => d.creditor), debts.map(d => d.amount), "settleDebts", nonce]
      )
    );
    console.log("Hash de acción local:", actionHash);

    if (calculatedActionHash !== actionHash) {
        throw new Error("¡El hash calculado no coincide con el hash generado localmente!");
    }

    // Si los hashes coinciden, continuar con la firma y el envío de la transacción
    const signature1 = await signer.signMessage(ethers.getBytes(actionHash));
    const signature2 = await secondarySigner.signMessage(ethers.getBytes(actionHash));

    const signatures = [signature1, signature2];

    const groupDetails = await contract.getGroupDetails(groupId);
    console.log("Nombre del grupo:", groupDetails[0]);
    console.log("Miembros del grupo:", groupDetails[1]);

    const allSignersAreMembers = signatures.every(signature => {
        const signerAddress = ethers.verifyMessage(ethers.getBytes(actionHash), signature);
        console.log("Dirección del firmante:", signerAddress);
        const isMember = groupMembers.includes(signerAddress);
        console.log("¿Es miembro?:", isMember);
        return isMember;
    });

    if (!allSignersAreMembers) {
        throw new Error("Uno o más firmantes no son miembros del grupo");
    }

     // Escuchar el evento de depuración
     contract.on("DebugSigner", (signer, members) => {
        console.log(`DebugSigner Event - Signer: ${signer}, Members: ${members}`);
    });

    // Escuchar el evento de depuración del actionHash
    contract.on("DebugActionHash", (actionHash, groupId, debts, nonce) => {
        console.log(`DebugActionHash Event - actionHash: ${actionHash}, groupId: ${groupId}, debts: ${debts}, nonce: ${nonce}`);
    });

    try {
        const tx = await contract.settleDebtsWithSignatures(groupId, debts, signatures);
        await tx.wait();
        console.log("Transacción completada con éxito:", tx);
    } catch (error) {
        console.error("Error al ejecutar la transacción:", error);
    }
}

proposeSettle("0xd1d39d1bf0a2b8f7824b2b412633d124bb5985aa4e6fa9ec973f782ac718c16f", ["0xFbC66bD8466f7B7628fD32F8a8C07f3976c73979", "0x724849ca29166a27cA9a2f03A7EA15C0e8687f7A"])
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
