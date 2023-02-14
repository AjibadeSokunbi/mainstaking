const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const { JSBI } = require("@uniswap/sdk");
const { Network, Alchemy } = require("alchemy-sdk");


const web3 = createAlchemyWeb3(
  "https://eth-mainnet.g.alchemy.com/v2/JOHdJUN4I8RqCltE8B7e5BQBtucmGX0G"
);



   const settings = {
  apiKey: "JOHdJUN4I8RqCltE8B7e5BQBtucmGX0G",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

// ERC20 json abi file
const ERC20 = require("../Sushiswap/token.json");

// V3 pool abi json file
const IUniswapV3PoolABI = require("./V3PairAbi.json");

// V3 factory abi json
const IUniswapV3FactoryABI = require("./V3factory.json");

// V3 NFT manager abi
const IUniswapV3NFTmanagerABI = require("./UniV3NFT.json");

// V3 standard addresses (different for celo)
const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const NFTmanager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";




  const FactoryContract = new web3.eth.Contract(
  
    IUniswapV3FactoryABI,
      factory,
  );

  const NFTContract = new web3.eth.Contract(
 
    IUniswapV3NFTmanagerABI,
       NFTmanager,
  );

async function getData() {

  
  const nftowner =await alchemy.nft.getNftsForOwner("0x5cf82e6574cf1c3fd67aed973c9b2d82dde9311d")
    
  const contractAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  
  for (const nft of nftowner.ownedNfts) {
      if (nft.contract.address === contractAddress.toLocaleLowerCase()) {
          const tokenId = nft.tokenId


  let position = await NFTContract.methods.positions(tokenId).call();

  let token0contract = new web3.eth.Contract( ERC20, position.token0,);
  let token1contract = new web3.eth.Contract( ERC20, position.token1,);
  let token0Decimal = await token1contract.methods.decimals().call();
  let token1Decimal = await token1contract.methods.decimals().call();

  let token0sym = await token0contract.methods.symbol().call();
  let token1sym = await token1contract.methods.symbol().call();

  let V3pool = await FactoryContract.methods.getPool(
    position.token0,
    position.token1,
    position.fee
  ).call();
  let poolContract = new web3.eth.Contract( IUniswapV3PoolABI, V3pool,);

  let slot0 = await poolContract.methods.slot0().call();

  let pairName = token0sym + "/" + token1sym;

  console.log("Token0 : " , token0sym );
  console.log("Token1 : " , token1sym);
  console.log("pool : " , V3pool );
  console.log("pool : " , tokenId );

  let dict = {
    SqrtX96: slot0.sqrtPriceX96.toString(),
    Pair: pairName,
    T0d: token0Decimal,
    T1d: token1Decimal,
    tickLow: position.tickLower,
    tickHigh: position.tickUpper,
    liquidity: position.liquidity.toString(),
  };

  return dict;
} }}
        


const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const MIN_TICK = -887272;
const MAX_TICK = 887272;

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
  token1Decimal
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

  let amount0Human = (amount0wei / 10 ** token0Decimal).toFixed(token0Decimal);
  let amount1Human = (amount1wei / 10 ** token1Decimal).toFixed(token1Decimal);


  if (amount0Human !== "0") {
  console.log("Amount Token0 wei: " + amount0wei);
  console.log("Amount Token1 wei: " + amount1wei);
  console.log("Amount Token0 : " + amount0Human );
  console.log("Amount Token1 : " + amount1Human );
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

start();
