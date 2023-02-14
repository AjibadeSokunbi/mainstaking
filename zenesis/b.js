const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: "JOHdJUN4I8RqCltE8B7e5BQBtucmGX0G",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

async function me() {
  const nftowner = await alchemy.nft.getNftsForOwner(
    "0x5cf82e6574cf1c3fd67aed973c9b2d82dde9311d"
  );

  const contractAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

  let tokenids = [];

  for (const nft of nftowner.ownedNfts) {
    if (nft.contract.address === contractAddress.toLocaleLowerCase()) {
      const tokenId = nft.tokenId;
      tokenids.push(parseInt(tokenId));
    }
  }
  for (const tokens of tokenids) {
    console.log(tokens)
  }
  console.log(tokenids)
}
me();


