import { soliditySha3, toWei } from "web3-utils";

import { loadTree } from "./merkleTree";

export function getClaimWeekContractParams(week, userAddress, balances) {
  const claimBalance = balances[userAddress];
  const merkleTree = loadTree(balances);

  const proof = merkleTree.getHexProof(
    soliditySha3(userAddress, toWei(claimBalance))
  );

  return {
    week,
    balance: toWei(claimBalance),
    merkleProof: proof
  };
}
