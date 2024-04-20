import { ethers } from 'hardhat';

async function main() {
  const member1_address = "";
  const member2_addres = "";
  const member3_address = "";
  
  // Compila y despliega tu contrato
  const SquaryV2 = await ethers.getContractFactory("SquaryV2");
  const squary = await SquaryV2.deploy(
    'address_USDC', 'address_USDT', 'address_DAI'
  );
  
  await squary.deployed();
  console.log("Squary deployed to:", squary.address);

  // Simular la creación de un grupo
  const members = ['member1_address', 'member2_address', 'member3_address'];
  const signatureThreshold = 2;
  await squary.createGroup(members, signatureThreshold, 'token_address');

  // Simular la adición de un miembro
  const addMemberTx = await squary.addGroupMember('group_id', 'new_member_address', 'signatures_array');
  await addMemberTx.wait();

  // Simular el settlement de deudas
  const debts = [
    {
      debtor: 'debtor_address',
      creditor: 'creditor_address',
      amount: 100
    }
  ];
  const settleTx = await squary.settleDebtsWithSignatures('group_id', debts, 'signatures_array');
  await settleTx.wait();

  // Consultar balances y verificar resultados
  const balance = await squary.getMemberBalance('group_id', 'member_address');
  console.log("Balance:", balance.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
