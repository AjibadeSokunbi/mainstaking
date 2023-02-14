const { ApolloServer, gql } = require("apollo-server");
const Web3 = require("web3");

const url = "https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/";
const web3 = new Web3(new Web3.providers.HttpProvider(url));
const CakePoolabi = require("./cakePool.json");
const CakePooladdress = "0x45c54210128a065de780C4B0Df3d16664f7f859e";
const CakePool = new web3.eth.Contract(CakePoolabi, CakePooladdress);

const typeDefs = gql`
  type Query {
    lockedStake(userAddress: String!): LockedStake
  }

  type LockedStake {
    stakingBalance: String
    rewards: String
    lockedAmount: String
  }
`;

const resolvers = {
  Query: {
    lockedStake: async (_, { userAddress }) => {
      const userInfo = await CakePool.methods.userInfo(userAddress).call();
      const PricePerFullShare = await CakePool.methods.getPricePerFullShare().call();

      const stakingBalance = ((userInfo.shares * PricePerFullShare / 1e18 - userInfo.userBoostedShare) / 1e18).toFixed(2);
      const lockedAmount = ((userInfo.lockedAmount) / 1e18).toFixed(2);
      const rewards = stakingBalance - lockedAmount;

      return {
        stakingBalance,
        rewards: rewards.toFixed(2),
        lockedAmount,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
