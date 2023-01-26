.
The getUserActivity function takes in a user address and loops through all the pool IDs on PancakeSwap. For each pool, it retrieves the LP token address, creates instances of the LP token contract and stablecoin contract, and makes calls to various methods to retrieve information about the user's activity on that pool.
The function first checks if the LP token contract has a factory function, if so it retrieves the factory address, token0 and token1 addresses, and their symbols. If the LP token contract doesn't have a factory function, it checks if the contract has a minter function and retrieves the information from the pancakestable.js file.
For both cases, it also retrieves the user's information for the current LP token and the rewards for that user. If the user has a non-zero amount for the current LP token, the function logs the pool address, pool ID, amount, rewards, token0 and token1 addresses, and their symbols.
not all lptokens in pancakeswap are created by the pancakeswap factory contract, some are created by stableswapfactory which have a minter function, i have used this minter function for their easy identification, and only 4 of those lptokens exist, extracted them to save time of making an api call to fetch them.


