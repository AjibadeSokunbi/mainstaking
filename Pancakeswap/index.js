const Web3 = require("web3");
const { ApolloServer, gql } = require('apollo-server');
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

// abi of tokenpair contract
const lpABI = require("./lp.json");
const tokenabi = require("./token.json");
const  pancakeswapstable  = require("./pancakestable");


const typeDefs = gql`
type Query {
getUserActivity(userAddress: String!): UserData
}

type UserData {
pools: [Pool]
}

type Pool {
poolAddress: String
poolId: Int
amount: String
rewards: String
pairAddress: String
token0: Token
token1: Token
}

type Token {
symbol: String
address: String
}
`;

const resolvers = {
Query: {
async getUserActivity(_, { userAddress }) {
try {
const pools = [];
// loop through all pool IDs
for (let i = 0; i <= 142; i++) {
const lpTokenAddress = await masterChefV2.methods.lpToken(i).call();
// get the user's information for the current LP token
const userInfo = await masterChefV2.methods.userInfo(i, userAddress).call();
        //rewards
        const rewards = await masterChefV2.methods.pendingCake(i, userAddress).call()
        // check if the user has a non-zero amount

        if (userInfo.amount > 0) {
            // create an instance of the lp contract
            const lp = new web3.eth.Contract(lpABI, lpTokenAddress);
            // call the main function to get the token pair information
            const { token0, token1 } = await main(lp);
            pools.push({
              poolAddress: lpTokenAddress,
              poolId: i,
              amount: userInfo.amount,
              rewards,
              pairAddress: lpTokenAddress,
              token0,
              token1,
            });
        }
    }
    return { pools };
  } catch (error) {
    console.log(error);
  }
},
},
};

async function main(lp) {const token0Address = await lp.methods.token0().call();
  const token1Address = await lp.methods.token1().call();
  
  const token0Contract = new web3.eth.Contract(tokenabi, token0Address);
  const token1Contract = new web3.eth.Contract(tokenabi, token1Address);
  
  const token0Symbol = await token0Contract.methods.symbol().call();
  const token1Symbol = await token1Contract.methods.symbol().call();
  
  return {
    token0: {
      symbol: token0Symbol,
      address: token0Address,
    },
    token1: {
      symbol: token1Symbol,
      address: token1Address,
    },
  };
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
console.log(`Server ready at ${url}`);
});  

