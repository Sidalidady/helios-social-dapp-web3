# 🚀 Setup Guide - Helios Social DApp

This guide will walk you through setting up and deploying the Helios Social DApp step by step.

## Prerequisites

- **Node.js** v16 or higher
- **MetaMask** browser extension
- **Git** for cloning the repository
- A code editor (VS Code recommended)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd heloioweb3social

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Get Your Private Key

1. Open MetaMask
2. Click the three dots → Account Details → Export Private Key
3. Enter your password and copy the key

⚠️ **Warning:** Never share or commit your private key!

## Step 3: Configure Environment Variables

### Root Configuration

Create `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
PRIVATE_KEY=your_private_key_from_metamask
```

## Step 4: Get Test HLS Tokens

You need HLS tokens to deploy the smart contract and interact with it.

### Check Your Balance

```bash
npx hardhat run scripts/checkBalance.js --network helios
```

### Get Tokens from Faucet

**Option 1: Web Faucet**
- Visit: https://faucet.helioschainlabs.org
- Enter your wallet address
- Request tokens

**Option 2: Script (if available)**
```bash
npm run faucet
```

Wait a few minutes for tokens to arrive, then check balance again.

## Step 5: Add Helios Testnet to MetaMask

### Automatic Method
When you connect your wallet in the app, it will prompt you to add the network.

### Manual Method
1. Open MetaMask
2. Click network dropdown → Add Network
3. Enter these details:

```
Network Name: Helios Testnet
RPC URL: https://testnet1.helioschainlabs.org
Chain ID: 42000
Currency Symbol: HLS
Block Explorer: https://explorer.helioschainlabs.org
```

## Step 6: Compile Smart Contracts

```bash
npm run compile
```

You should see:
```
Compiled 1 Solidity file successfully
```

## Step 7: Deploy Smart Contract

```bash
npm run deploy
```

Expected output:
```
🚀 Deploying SocialFeed contract to Helios Testnet...

📝 Deploying with account: 0xYourAddress
💰 Account balance: X.XXX HLS

📦 Deploying SocialFeed contract...
✅ SocialFeed deployed to: 0xContractAddress
🔍 View on explorer: https://explorer.helioschainlabs.org/address/0xContractAddress

💾 Deployment info saved to deployments/helios-testnet.json
💾 Contract ABI saved to frontend/src/contracts/SocialFeed.json

✨ Deployment complete!
```

**Important:** Copy the contract address!

## Step 8: Configure Frontend

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` with your deployed contract address:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressHere
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Step 9: Run the Application

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

## Step 10: Connect and Post!

1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Approve network addition (if prompted)
4. Type your first post (max 280 characters)
5. Click "Post" button
6. Approve the transaction in MetaMask
7. Wait for confirmation
8. See your post appear in the feed!

## 🎉 Success!

You now have a fully functional decentralized social platform running on Helios Testnet!

## Common Issues

### "Insufficient funds" Error

**Problem:** Not enough HLS tokens
**Solution:** Get more from faucet

### "Transaction Failed" Error

**Problem:** Gas estimation failed
**Solution:** 
- Ensure contract address is correct
- Check network connection
- Try increasing gas limit manually

### "IPFS Upload Failed"

**Problem:** Content not uploading
**Solution:** 
- Check internet connection
- Content stored locally as fallback
- For production, configure Pinata API keys

### Posts Not Showing

**Problem:** Feed appears empty
**Solution:**
- Refresh the page
- Check browser console for errors
- Verify contract address in .env

## Next Steps

### 1. Customize the UI
Edit files in `frontend/src/components/` to change the look and feel.

### 2. Add Features
- Implement comments
- Add media upload
- Create user profiles page

### 3. Deploy to Production
```bash
cd frontend
npm run build
```

Deploy the `build` folder to:
- Vercel
- Netlify
- IPFS (fully decentralized!)

### 4. Set Up IPFS Properly

For production, use a dedicated IPFS service:

**Pinata Setup:**
1. Create account at https://pinata.cloud
2. Get API keys
3. Update `frontend/src/utils/ipfs.js`
4. Add keys to `frontend/.env`:
```env
REACT_APP_PINATA_API_KEY=your_key
REACT_APP_PINATA_SECRET_KEY=your_secret
```

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment variables for sensitive data
- [ ] Test thoroughly before mainnet deployment
- [ ] Run security audit with Slither
- [ ] Get contract audited for production

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review [smart contract](contracts/SocialFeed.sol) comments
- Open an issue on GitHub

---

**Happy Building! 🚀**
