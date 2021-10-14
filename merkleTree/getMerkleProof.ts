import { soliditySha3, toWei } from "web3-utils";

import { loadTree } from "./merkleTree";

export function getClaimWeekContractParams(
  week: number,
  userAddress: string,
  balances: {
    [address: string]: {
      /* data */
    };
  }
) {
  // NOTE: balances: https://s3.amazonaws.com/staking.perp.fi/production/20/0xd6f03f5f7134a2a0d3c831ca7e8243cf88227ceba964345e1ee7ad74b595d526.json
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
