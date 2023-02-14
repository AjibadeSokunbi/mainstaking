const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const { ApolloServer, gql } = require("apollo-server");
// http provider configuration

const web3 = createAlchemyWeb3(process.env.URL);

// abi of apeswap master chef contract
const apeswapV2abi = require("./MasterChefV2.json");

// contract address of apeswap master chef contract
const apeswapV2address =
  "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9";

//  master chef contract
const masterChefV2 = new web3.eth.Contract(
  apeswapV2abi,
  apeswapV2address
);

// abi of tokenpair contract
const apeSwapLPToken = require("./apeswap.json");
const tokenabi = require("./token.json");

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
        const poolLength = await masterChefV2.methods.poolLength().call();
        const pools = [];
        // loop through all pool IDs
        for (let i = 0; i <= poolLength; i++) {
          const lpTokenAddress = await masterChefV2.methods.getPoolInfo(i).call();
          // get the user's information for the current LP token
          const userInfo = await masterChefV2.methods
            .userInfo(i, userAddress)
            .call();
          //rewards
          const rewards = await masterChefV2.methods
            .pendingCake(i, userAddress)
            .call();
          // check if the user has a non-zero amount

          if (userInfo.amount > 0) {
            // create an instance of the lp contract
            const lp = new web3.eth.Contract(apeSwapLPToken, lpTokenAddress.lpToken);
            // call the main function to get the token pair information
            const { token0, token1 } = await main(lp);
            pools.push({
              poolAddress: lpTokenAddress.lpToken,
              poolId: i,
              amount: userInfo.amount,
              rewards,
              pairAddress: lpTokenAddress.lpToken,
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

async function main(lp) {
  const token0Address = await lp.methods.token0().call();
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
