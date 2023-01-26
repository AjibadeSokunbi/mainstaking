const Web3 = require("web3");

// http provider configuration
const url =
  "https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/";
const web3 = new Web3(new Web3.providers.HttpProvider(url));

// abi of pancakeswap master chef contract
const contractabi = require("./pancake.json");

// contract address of pancakeswap master chef contract
const masterChefV2abi = "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652";

// create an instance of the master chef contract
const masterChefV2 = new web3.eth.Contract(contractabi, masterChefV2abi);

// abi of lptoken contract
const lpABI = require("./lp.json");
// abi of stablelp contract
const stableabi = require("./stable.json");
// abi of tokens contract
const tokenabi = require("./token.json");
// object file containing 4 pancakestable lp
const pancakeswapstable = require("./pancakestable");

async function getUserActivity(userAddress) {
  try {
    // loop through all pool IDs
    for (let i = 0; i <= 142; i++) {
      const lpTokenAddress = await masterChefV2.methods.lpToken(i).call();
      const lpTokenContract = new web3.eth.Contract(lpABI, lpTokenAddress);
      const stableContract = new web3.eth.Contract(stableabi, lpTokenAddress);
      try {
        const factoryAddress = await lpTokenContract.methods.factory().call();
        const token0 = await lpTokenContract.methods.token0().call();
        const token1 = await lpTokenContract.methods.token1().call();
        const token0symbol = await new web3.eth.Contract(
          tokenabi,
          token0
        ).methods
          .symbol()
          .call();
        const token1symbol = await new web3.eth.Contract(
          tokenabi,
          token1
        ).methods
          .symbol()
          .call();

        // get the user's information for the current LP token
        const userInfo = await masterChefV2.methods
          .userInfo(i, userAddress)
          .call();
        //rewards
        const rewards = await masterChefV2.methods
          .pendingCake(i, userAddress)
          .call();

        //
        // check if the user has 0 amount for the current LP token
        if (userInfo.amount !== "0") {
          console.log(`Pool Address: ${lpTokenAddress}`);
          console.log(`Pool ID: ${i}`);
          console.log(`Amount: ${userInfo.amount}`);
          console.log(`Rewarde: ${rewards}`);
          console.log(`Token0 is ${token0symbol}: ${token0}`);
          console.log(`Token1 is ${token1symbol}: ${token1}`);
          console.log(" ");
          console.log(" ");
        }
      } catch (error) {
        // check if the lptoken contract has minter function
        try {
          const minterAddress = await stableContract.methods.minter().call();
          const token0 = pancakeswapstable[i].token0;
          const token1 = pancakeswapstable[i].token1;
          const token0symbol = await new web3.eth.Contract(
            stableabi,
            token0
          ).methods
            .symbol()
            .call();
          const token1symbol = await new web3.eth.Contract(
            stableabi,
            token1
          ).methods
            .symbol()
            .call();

          // get the user's information for the current LP token
          const userInfo = await masterChefV2.methods
            .userInfo(i, userAddress)
            .call();
          //rewards
          const rewards = await masterChefV2.methods
            .pendingCake(i, userAddress)
            .call();

          // check if the user has 0 amount for the current LP token
          if (userInfo.amount !== "0") {
            console.log(`Pool Address: ${lpTokenAddress}`);
            console.log(`Pool ID: ${i}`);
            console.log(`Amount: ${userInfo.amount}`);
            console.log(`Reward: ${rewards}`);
            console.log(`Token0 is ${token0symbol}: ${token0}`);
            console.log(`Token1 is ${token1symbol}: ${token1}`);
            console.log(" ");
            console.log(" ");
          }
        } catch (error) {
          // console.log(`poolid: ${i} Pool Address: ${lpTokenAddress} does not have factory or minter function`);
          const symbol = await lpTokenContract.methods.symbol().call();
          // get the user's information for the current LP token
          const userInfo = await masterChefV2.methods
            .userInfo(i, userAddress)
            .call();
          const rewards = await masterChefV2.methods
            .pendingCake(i, userAddress)
            .call();
          // check if the user has 0 amount for the current LP token
          if (userInfo.amount !== "0") {
            console.log(`Pool Address: ${lpTokenAddress}`);
            console.log(`Pool ID: ${i}`);
            console.log(`Amount: ${userInfo.amount}`);
            console.log(`Reward: ${rewards}`);
            console.log(`symbol: ${symbol}`);
            console.log(" ");
            console.log(" ");
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

getUserActivity("0x4e18817d575cf7db588f526c363d8f6151931c5f");
