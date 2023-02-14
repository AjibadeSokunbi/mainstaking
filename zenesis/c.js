const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { JSBI } = require("@uniswap/sdk");

const web3 = createAlchemyWeb3(
  "https://eth-mainnet.g.alchemy.com/v2/JOHdJUN4I8RqCltE8B7e5BQBtucmGX0G"
);

// ERC20 json abi file
const ERC20 = require("../uniswapv3/token.json");

// V3 pool abi json file
const IUniswapV3PoolABI = require("../uniswapv3/V3PairAbi.json");

// V3 factory abi json
const IUniswapV3FactoryABI = require("../uniswapv3/V3factory.json");

// V3 NFT manager abi
const IUniswapV3NFTmanagerABI = require("../uniswapv3/UniV3NFT.json");

// V3 standard addresses (different for celo)
const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const NFTmanager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const { Network, Alchemy } = require("alchemy-sdk");

const settings = {
  apiKey: "JOHdJUN4I8RqCltE8B7e5BQBtucmGX0G",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

const FactoryContract = new web3.eth.Contract(IUniswapV3FactoryABI, factory);

const NFTContract = new web3.eth.Contract(IUniswapV3NFTmanagerABI, NFTmanager);

async function getData(tokens) {
  let position = await NFTContract.methods.positions(tokens).call();
  let token0contract = new web3.eth.Contract(ERC20, position.token0);
  let token1contract = new web3.eth.Contract(ERC20, position.token1);
  let token0Decimal = await token0contract.methods.decimals().call();
  let token1Decimal = await token1contract.methods.decimals().call();

  let token0sym = await token0contract.methods.symbol().call();
  let token1sym = await token1contract.methods.symbol().call();

  let V3pool = await FactoryContract.methods
    .getPool(position.token0, position.token1, position.fee)
    .call();
  let poolContract = new web3.eth.Contract(IUniswapV3PoolABI, V3pool);
  let slot0 = await poolContract.methods.slot0().call();

  console.log("Token0 : " , token0sym );
  console.log("Token1 : " , token1sym);

  let dict = {
    symbol0: token0sym ,
    symbol1 :token1sym,
    SqrtX96: slot0.sqrtPriceX96.toString(),

    T0d: token0Decimal,
    T1d: token1Decimal,
    tickLow: position.tickLower,
    tickHigh: position.tickUpper,
    liquidity: position.liquidity.toString(),
  };

  return dict;
}
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

function getTickAtSqrtRatio(sqrtPriceX96) {
  let tick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001));
  return tick;
}
async function getTokenAmounts(
  liquidity,
  sqrtPriceX96,
  tickLow,
  tickHigh,
  token0Decimal,
  token1Decimal,
) {
  let sqrtRatioA = Math.sqrt(1.0001 ** tickLow);
  let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh);

  let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
  let sqrtPrice = sqrtPriceX96 / Q96;

  let amount0wei = 0;
  let amount1wei = 0;
  if (currentTick <= tickLow) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
    );
  } else if (currentTick > tickHigh) {
    amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
  } else if (currentTick >= tickLow && currentTick < tickHigh) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
    );
    amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
  }

  let amount0Human = (amount0wei / 10 ** token0Decimal).toFixed(2);
  let amount1Human = (amount1wei / 10 ** token1Decimal).toFixed(2);


  if (amount0wei !== 0) {
  console.log("Amount Token0 : " + amount0Human);
  console.log("Amount Token1 : " + amount1Human);
  console.log("======")
  }

  return [amount0wei, amount1wei];
}
async function start(positionID) {
  let data = await getData(positionID);
  let tokens = await getTokenAmounts(
    data.liquidity,
    data.SqrtX96,
    data.tickLow,
    data.tickHigh,
    data.T0d,
    data.T1d
  );
}

async function stop() {
  const nftowner = await alchemy.nft.getNftsForOwner(
    "0x471c6a1f283d2b52ff332b9706ffa6ca4f261479"
  );

  let tokenids = [];

  for (const nft of nftowner.ownedNfts) {
    if (nft.contract.address === NFTmanager.toLocaleLowerCase()) {
      const tokenId = nft.tokenId;
      tokenids.push(parseInt(tokenId));
    }
  }
  for (const tokens of tokenids) {
    start(tokens);
  }
}
stop();
