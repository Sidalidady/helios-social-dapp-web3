const axios = require("axios");
require("dotenv").config();

async function requestFaucet() {
  const hre = require("hardhat");
  const [deployer] = await hre.ethers.getSigners();
  const address = deployer.address;

  console.log("🚰 Requesting test HLS tokens from Helios Testnet faucet...");
  console.log("📝 Address:", address);
  console.log("");

  try {
    // Note: Replace with actual Helios faucet API if available
    // This is a placeholder implementation
    console.log("⚠️  Please manually request test tokens from:");
    console.log("   🌐 https://faucet.helioschainlabs.org");
    console.log("");
    console.log("   Or use the Helios Discord/Telegram faucet bot if available");
    console.log("");
    console.log("   Your address:", address);
    console.log("");

    // Check current balance
    const balance = await hre.ethers.provider.getBalance(address);
    console.log("💰 Current balance:", hre.ethers.formatEther(balance), "HLS");
    
    if (balance > 0n) {
      console.log("✅ You have sufficient balance to deploy!");
    } else {
      console.log("⏳ Waiting for tokens... Check your balance with: npx hardhat run scripts/checkBalance.js --network helios");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Tip: Please use the official Helios Testnet faucet to get test tokens");
  }
}

requestFaucet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
