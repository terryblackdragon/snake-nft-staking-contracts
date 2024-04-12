require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
// const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
// const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;

const BINANCESCAN_API_KEY = process.env.BINANCE_API_KEY;

module.exports = {
  defaultNetwork: "bscTestnet",
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      }
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545/",
      chainId: 97,
      accounts: [process.env.PRIVATE_KEY],
    },
    // ganache: {
    //   chainId: 1337,
    //   url: "http://127.0.0.1:7545",
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    // mumbai: {
    //   url: MUMBAI_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 80001,
    // },
    // polygon: {
    //   url: POLYGON_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY],
    //   chainId: 137,
    // }
  },
  paths: {
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: "WKG7E5W7V6IKG78TP7M4U5ZYURDQYN3CJ2"
  }
};
