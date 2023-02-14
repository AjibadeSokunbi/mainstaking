const Web3 = require('web3');

// http provider configuration
const url = 'https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));

// abi of tokenpair contract
const lpABI = require("./lp.json")
const tokenabi = require("./token.json")

// contract address of tokenpair contract
const lpAddress = '0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1';

// create an instance of the lp contract
const lp = new web3.eth.Contract(lpABI, lpAddress);




async function main() {
   

    const token0Address = await lp.methods.token0().call();
    const token1Address = await lp.methods.token1().call();

    const token0Contract = new web3.eth.Contract(tokenabi, token0Address);
    const token1Contract = new web3.eth.Contract(tokenabi, token1Address);

    const token0Symbol = await token0Contract.methods.symbol().call();
    const token1Symbol = await token1Contract.methods.symbol().call();

    console.log(`Pair Address: ${lpAddress}`);
    console.log(`Token0 is ${token0Symbol}: ${token0Address}`);
    console.log(`Token1 is ${token1Symbol}: ${token1Address}`);
}

main();

