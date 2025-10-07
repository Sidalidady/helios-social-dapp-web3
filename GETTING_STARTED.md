# 🎯 Getting Started with Helios Social

Welcome! This guide will help you get your decentralized social platform up and running.

## 📋 What You'll Need

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **A code editor** (VS Code recommended)
- **10-15 minutes** of your time

## 🚀 Installation

### Step 1: Clone or Download

If you have this project locally, navigate to it:

```bash
cd heloioweb3social
```

### Step 2: Install All Dependencies

Run the automated setup:

```bash
npm run setup
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

### Step 1: Create Environment Files

The setup script creates these automatically, but if needed:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### Step 2: Add Your Private Key

**⚠️ IMPORTANT: Never commit or share your private key!**

1. Open MetaMask
2. Click your account icon → Account Details
3. Click "Export Private Key"
4. Enter your MetaMask password
5. Copy the private key

Edit `.env`:

```env
HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
PRIVATE_KEY=your_private_key_here
```

### Step 3: Get Test Tokens

You need HLS tokens to deploy the smart contract.

**Option 1: Web Faucet** (Recommended)
1. Visit: https://faucet.helioschainlabs.org
2. Enter your wallet address
3. Complete any verification (captcha, etc.)
4. Request tokens

**Option 2: Check if faucet script works**
```bash
npm run faucet
```

**Verify balance:**
```bash
npm run balance
```

Expected output:
```
💰 Checking balance for: 0xYourAddress
Balance: 1.0 HLS  # Or whatever you received
✅ You have enough balance to deploy contracts!
```

## 🔧 Add Helios Testnet to MetaMask

You'll need to add Helios Testnet to MetaMask:

### Automatic Method (Recommended)
When you first connect your wallet in the app, it will prompt you to add the network.

### Manual Method
1. Open MetaMask
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter these details:

```
Network Name: Helios Testnet
New RPC URL: https://testnet1.helioschainlabs.org
Chain ID: 42000
Currency Symbol: HLS
Block Explorer URL: https://explorer.helioschainlabs.org
```

5. Click "Save"

## 📦 Compile Smart Contracts

Compile the Solidity contracts:

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

## 🚀 Deploy to Helios Testnet

Deploy your smart contract:

```bash
npm run deploy
```

Expected output:
```
🚀 Deploying SocialFeed contract to Helios Testnet...

📝 Deploying with account: 0xYourAddress
💰 Account balance: 1.0 HLS

📦 Deploying SocialFeed contract...
✅ SocialFeed deployed to: 0xContractAddress123...
🔍 View on explorer: https://explorer.helioschainlabs.org/address/0xContractAddress123...

💾 Deployment info saved to deployments/helios-testnet.json
💾 Contract ABI saved to frontend/src/contracts/SocialFeed.json

✨ Deployment complete!
```

**📝 IMPORTANT: Copy the contract address!**

## 🎨 Configure Frontend

Edit `frontend/.env` and add your contract address:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressFromAbove
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## 🎉 Run the Application

Start the frontend:

```bash
cd frontend
npm start
```

The app will open at: **http://localhost:3000**

## 📱 Using the DApp

### 1. Connect Your Wallet

1. Click the "Connect Wallet" button in the top right
2. MetaMask will pop up
3. Click "Next" → "Connect"
4. If prompted, approve adding Helios Testnet

### 2. Create Your First Post

1. Type your message in the text area (max 280 characters)
2. Watch the character counter update in real-time
3. Click the "Post" button
4. MetaMask will pop up asking you to confirm the transaction
5. Click "Confirm"
6. Wait a few seconds for the transaction to complete
7. Your post will appear in the feed!

### 3. Interact with Posts

- **Like a post:** Click the heart icon
- **Unlike a post:** Click the heart again (it will be filled if you liked it)
- **View on explorer:** Copy the transaction hash to view on Helios Explorer

## 🎯 What You Can Do

### Current Features

✅ **Post Messages** - Share thoughts (280 characters max)  
✅ **Like Posts** - Show appreciation for content  
✅ **Follow Users** - Connect with others (via contract functions)  
✅ **View Feed** - See all posts in real-time  
✅ **User Profiles** - Basic profile info tied to wallet  
✅ **Real-time Updates** - Feed updates automatically  

### Advanced (Via Contract)

You can also interact directly with the contract:

```bash
npm run console
```

```javascript
// Get contract instance
const SocialFeed = await ethers.getContractFactory("SocialFeed");
const contract = SocialFeed.attach("YOUR_CONTRACT_ADDRESS");

// Follow a user
await contract.followUser("0xUserAddress");

// Update your profile
await contract.updateProfile("YourName", "QmProfileHash");
```

## 🔍 Troubleshooting

### "Insufficient funds" Error

**Problem:** Not enough HLS to pay for gas  
**Solution:** Get more tokens from the faucet

### "Wrong network" Error

**Problem:** MetaMask is on the wrong network  
**Solution:** Switch to Helios Testnet in MetaMask

### "Transaction failed" Error

**Problem:** Transaction rejected or failed  
**Solutions:**
- Check you have enough HLS
- Try increasing gas limit manually
- Verify contract address is correct

### Posts Not Appearing

**Problem:** Feed seems empty  
**Solutions:**
- Refresh the page
- Check browser console for errors (F12)
- Verify contract address in `frontend/.env`
- Make sure you're connected to the right network

### IPFS Content Not Loading

**Problem:** Post content shows as loading  
**Solutions:**
- Content is stored locally as fallback for demo
- Check browser console for IPFS errors
- For production, configure Pinata API keys

## 📊 Check Your Deployment

Verify your deployment:

```bash
npm run verify
```

This shows:
- Contract address
- Explorer link
- Deployment info

Visit the explorer to see:
- Your contract code
- Transaction history
- Contract interactions

## 🧪 Run Tests

Test the smart contract:

```bash
npm test
```

This runs the test suite covering:
- Post creation
- Likes/unlikes
- Follow system
- Profiles
- Edge cases

## 📚 Next Steps

### 1. Customize the UI

Edit files in `frontend/src/components/`:
- `Header.js` - Navigation and wallet
- `CreatePost.js` - Post creation form
- `Feed.js` - Feed layout
- `Post.js` - Individual post display

Change colors in CSS files to match your brand.

### 2. Add Features

Check out `AI_EXTENSIONS.md` for ideas:
- AI content moderation
- Image generation
- Sentiment analysis
- Smart recommendations

### 3. Deploy to Production

**Frontend:**
```bash
cd frontend
npm run build

# Deploy to Vercel
vercel --prod

# Or Netlify
netlify deploy --prod --dir=build
```

**Contract:**
- Test thoroughly on testnet
- Audit with Slither: `slither contracts/SocialFeed.sol`
- Deploy to mainnet when ready

### 4. Set Up IPFS Properly

For production, use Pinata:

1. Create account at https://pinata.cloud
2. Get API keys
3. Add to `frontend/.env`:
```env
REACT_APP_PINATA_API_KEY=your_key
REACT_APP_PINATA_SECRET_KEY=your_secret
```
4. Update `frontend/src/utils/ipfs.js` to use Pinata

## 🎓 Learn More

### Documentation
- **README.md** - Complete project documentation
- **SETUP.md** - Detailed setup guide
- **DEPLOYMENT.md** - Production deployment
- **CONTRACT_GUIDE.md** - Smart contract reference
- **AI_EXTENSIONS.md** - AI integration ideas
- **PROJECT_SUMMARY.md** - Project overview

### External Resources
- [Helios Blockchain Docs](https://docs.helioschainlabs.org)
- [Wagmi Documentation](https://wagmi.sh/)
- [Hardhat Docs](https://hardhat.org/)
- [Solidity Docs](https://docs.soliditylang.org/)

## 💡 Pro Tips

1. **Save your contract address** - You'll need it!
2. **Use testnet first** - Always test before mainnet
3. **Keep private keys safe** - Never commit them
4. **Monitor gas prices** - Adjust for network conditions
5. **Use events** - They're cheaper than storage
6. **Backup deployments** - Save deployment info
7. **Test thoroughly** - Run the test suite often

## 🆘 Need Help?

- Check the documentation files
- Review contract comments
- Look at example code in `CONTRACT_GUIDE.md`
- Check browser console for errors (F12)
- Review transaction on Helios Explorer

## ✅ Checklist

Before you start:
- [ ] Node.js installed
- [ ] MetaMask installed
- [ ] Dependencies installed (`npm run setup`)
- [ ] `.env` configured with private key
- [ ] Test HLS tokens received
- [ ] Helios Testnet added to MetaMask

Deployment:
- [ ] Contracts compiled (`npm run compile`)
- [ ] Contract deployed (`npm run deploy`)
- [ ] Contract address copied
- [ ] `frontend/.env` updated with contract address

Running:
- [ ] Frontend started (`cd frontend && npm start`)
- [ ] Wallet connected in app
- [ ] Network switched to Helios Testnet
- [ ] First post created successfully!

## 🎉 Success!

Congratulations! You now have a fully functional decentralized social platform running on Helios Testnet!

**What's Next?**
- Invite friends to test it
- Customize the design
- Add new features
- Deploy to production
- Share with the Web3 community!

---

**Happy Building! 🚀**

*Built with ⚡ on Helios Testnet*
