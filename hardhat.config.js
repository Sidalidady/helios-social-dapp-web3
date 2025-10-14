require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Function to get private key (supports both plain and encrypted)
function getPrivateKey() {
  // First try environment variable
  if (process.env.PRIVATE_KEY) {
    return process.env.PRIVATE_KEY;
  }
  
  // If no private key in env, will be loaded interactively during deployment
  console.log('⚠️  No PRIVATE_KEY in .env - will use encrypted key if available');
  return undefined;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "helios-testnet": {
      url: process.env.HELIOS_RPC_URL || "https://testnet1.helioschainlabs.org",
      chainId: 42000,
      accounts: getPrivateKey() ? [getPrivateKey()] : [],
      gasPrice: "auto"
    },
    helios: {
      url: process.env.HELIOS_RPC_URL || "https://testnet1.helioschainlabs.org",
      chainId: 42000,
      accounts: getPrivateKey() ? [getPrivateKey()] : [],
      gasPrice: "auto"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
