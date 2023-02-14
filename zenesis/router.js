const Web3 = require('web3');

// abi of pancakeswap master chef contract
const contractabi = require("./pancake.json")

// contract address of pancakeswap master chef contract
const masterChefV2abi = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';

// abi of pancakeswap factory contract
const factoryABI = require("./factory.json")

// contract address of pancakeswap factory contract
const factoryAddress = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

// create an instance of the factory contract


// abi of pancakeswap factory contract
const routerabi = require("./router.json")

// contract address of pancakeswap factory contract
const routerAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

// create an instance of the factory contract


// http provider configuration
const url = 'https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));
const masterChefV2 = new web3.eth.Contract(contractabi, masterChefV2abi);
const factory = new web3.eth.Contract(factoryABI, factoryAddress);
const router = new web3.eth.Contract(routerabi, routerAddress);


async function getUserActivity(userAddress) {
    try {
      // loop through all pool IDs
      for (let i = 0; i <= 142; i++) {
          // get the user's information for the current LP token
          const userInfo = await masterChefV2.methods.userInfo(i, userAddress).call();
          // check if the user has a non-zero amount
          if (userInfo.amount > 0) {
              console.log(`Pool ID: ${i}`);
              console.log(`LP Token: ${await masterChefV2.methods.lptoken(i).call()}`);
  
              // Get the addresses of the tokens in the pair
              let pair = await factory.methods.allPairs(i).call();
              let tokenA = pair.token0;
              let tokenB = pair.token1;
              
              // Get the individual token amounts used to create the LP token
              let reserves = await PancakeLibrary.getReserves(factoryAddress, tokenA, tokenB);
              console.log(`Token A: ${tokenA}, Amount: ${reserves.reserveA}`);
              console.log(`Token B: ${tokenB}, Amount: ${reserves.reserveB}`);
              console.log(`Amount: ${userInfo.amount}`);
              console.log(`Reward Debt: ${userInfo.rewardDebt}`);
              console.log(`Boost Multiplier: ${userInfo.boostMultiplier}\n`);
          }
      }
    } catch (error) {
      console.log(error);
    }
  }

  getUserActivity("0xd183f2bbf8b28d9fec8367cb06fe72b88778c86b");