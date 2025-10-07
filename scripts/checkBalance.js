const hre = require("hardhat");
require("dotenv").config();

async function checkBalance() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("💰 Checking balance for:", deployer.address);
  console.log("🌐 Network: Helios Testnet (Chain ID: 42000)\n");
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "HLS");
  
  if (balance === 0n) {
    console.log("\n⚠️  You need test tokens to deploy!");
    console.log("Get them from: https://faucet.helioschainlabs.org");
  } else {
    console.log("\n✅ You have enough balance to deploy contracts!");
  }
}

checkBalance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
