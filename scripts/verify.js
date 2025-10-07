const fs = require("fs");
const path = require("path");

async function verify() {
  console.log("🔍 Verifying contract on Helios Explorer...\n");

  const deploymentPath = path.join(__dirname, "..", "deployments", "helios-testnet.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("❌ No deployment found. Please deploy the contract first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log("📋 Deployment Information:");
  console.log("   Contract:", deployment.contractAddress);
  console.log("   Deployer:", deployment.deployer);
  console.log("   Time:", deployment.deploymentTime);
  console.log("   Block:", deployment.blockNumber);
  console.log("");
  console.log("🔗 Explorer URL:", deployment.explorerUrl);
  console.log("");
  
  console.log("💡 Note: Helios Explorer verification may require manual steps:");
  console.log("   1. Visit:", deployment.explorerUrl);
  console.log("   2. Navigate to 'Contract' tab");
  console.log("   3. Click 'Verify and Publish'");
  console.log("   4. Upload contract source code and compiler settings");
  console.log("");
  console.log("   Compiler: Solidity 0.8.20");
  console.log("   Optimization: Enabled (200 runs)");
  console.log("   License: MIT");
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
