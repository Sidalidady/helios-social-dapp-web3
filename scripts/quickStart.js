const fs = require('fs');
const path = require('path');

console.log('🚀 Helios Social DApp - Quick Start Setup\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Missing .env file!');
  console.log('📝 Creating .env from template...\n');
  
  const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  
  console.log('✅ .env file created!');
  console.log('\n📋 Next steps:');
  console.log('1. Edit .env and add your PRIVATE_KEY');
  console.log('2. Get test HLS from: https://faucet.helioschainlabs.org');
  console.log('3. Run: npm run compile');
  console.log('4. Run: npm run deploy\n');
  
  process.exit(0);
}

// Check if frontend .env exists
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Missing frontend/.env file!');
  console.log('📝 Creating frontend/.env from template...\n');
  
  const frontendEnvExample = fs.readFileSync(
    path.join(__dirname, '..', 'frontend', '.env.example'), 
    'utf8'
  );
  fs.writeFileSync(frontendEnvPath, frontendEnvExample);
  
  console.log('✅ frontend/.env file created!');
  console.log('\n📋 Remember to update contract address after deployment!\n');
}

// Check if deployed
const deploymentPath = path.join(__dirname, '..', 'deployments', 'helios-testnet.json');
if (fs.existsSync(deploymentPath)) {
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  console.log('✅ Contract already deployed!');
  console.log('\n📊 Deployment Info:');
  console.log('   Address:', deployment.contractAddress);
  console.log('   Network: Helios Testnet');
  console.log('   Explorer:', deployment.explorerUrl);
  console.log('\n🎯 Quick Actions:');
  console.log('   • Frontend: cd frontend && npm start');
  console.log('   • Verify: npm run verify');
  console.log('   • Check balance: npx hardhat run scripts/checkBalance.js --network helios\n');
} else {
  console.log('📦 Contract not yet deployed');
  console.log('\n📋 Deployment steps:');
  console.log('1. Ensure .env has valid PRIVATE_KEY');
  console.log('2. Get test HLS: https://faucet.helioschainlabs.org');
  console.log('3. Run: npm run compile');
  console.log('4. Run: npm run deploy\n');
}

console.log('📚 Documentation:');
console.log('   • Setup Guide: SETUP.md');
console.log('   • README: README.md');
console.log('   • Deployment: DEPLOYMENT.md\n');
