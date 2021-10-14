import { soliditySha3, toWei } from "web3-utils";

import { loadTree } from "./merkleTree";

export function getMerkleProof(userAddress, balances) {
  const claimBalance = balances[userAddress];
  const merkleTree = loadTree(balances);

  const proof = merkleTree.getHexProof(
    soliditySha3(userAddress, toWei(claimBalance))
  );

  return {
    balance: toWei(claimBalance),
    merkleProof: proof
  };
}
