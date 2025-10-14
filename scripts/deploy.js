const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SocialFeed contract to Helios Testnet...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("📝 Deploying with account:", deployerAddress);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "HLS\n");

  if (balance === 0n) {
    console.log("⚠️  WARNING: Account has 0 HLS balance!");
    console.log("   Get test tokens from: https://faucet.helioschainlabs.org");
    console.log("   Or use the faucet script: npm run faucet\n");
    process.exit(1);
  }

  // Deploy SocialFeed contract
  console.log("📦 Deploying SocialFeed contract...");
  const SocialFeed = await hre.ethers.getContractFactory("SocialFeed");
  const socialFeed = await SocialFeed.deploy();
  
  await socialFeed.waitForDeployment();
  const contractAddress = await socialFeed.getAddress();

  console.log("✅ SocialFeed deployed to:", contractAddress);
  console.log("🔍 View on explorer: https://explorer.helioschainlabs.org/address/" + contractAddress);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: "helios-testnet",
    chainId: 42000,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    explorerUrl: `https://explorer.helioschainlabs.org/address/${contractAddress}`,
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "helios-testnet.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployments/helios-testnet.json");

  // Save contract ABI for frontend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "SocialFeed.sol", "SocialFeed.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  const contractConfig = {
    address: contractAddress,
    abi: artifact.abi,
  };
  fs.writeFileSync(
    path.join(frontendConfigDir, "SocialFeed.json"),
    JSON.stringify(contractConfig, null, 2)
  );

  console.log('✅ Contract ABI saved to frontend/src/contracts/SocialFeed.json');
  
  console.log('\n📋 Next steps:');
  console.log('1. Update REACT_APP_CONTRACT_ADDRESS in frontend/.env');
  console.log('2. Copy contract address to Vercel environment variables');
  console.log('3. Redeploy frontend to Vercel');
  console.log('\n🎉 Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
