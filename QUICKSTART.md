# ⚡ Quick Start Guide

Get your Helios Social DApp running in 5 minutes!

## Prerequisites
- Node.js v16+
- MetaMask installed
- 5 minutes of your time

## Step-by-Step

### 1️⃣ Install (1 min)

```bash
npm install
cd frontend && npm install && cd ..
```

### 2️⃣ Configure (1 min)

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env and add your private key
# PRIVATE_KEY=your_metamask_private_key
```

### 3️⃣ Get Test Tokens (1 min)

Visit: **https://faucet.helioschainlabs.org**

Check balance:
```bash
npx hardhat run scripts/checkBalance.js --network helios
```

### 4️⃣ Deploy Contract (1 min)

```bash
npm run compile
npm run deploy
```

Copy the contract address from output!

### 5️⃣ Update Frontend (30 sec)

Edit `frontend/.env`:
```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### 6️⃣ Run App (30 sec)

```bash
cd frontend
npm start
```

### 7️⃣ Use It! 🎉

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Add Helios Testnet to MetaMask
4. Post your first message!

## Troubleshooting

**No balance?** → Get tokens from faucet  
**Contract error?** → Check address in frontend/.env  
**MetaMask issues?** → Add Helios Testnet manually

### Add Helios Testnet to MetaMask

```
Network Name: Helios Testnet
RPC URL: https://testnet1.helioschainlabs.org
Chain ID: 42000
Symbol: HLS
Explorer: https://explorer.helioschainlabs.org
```

## What's Next?

- Read [README.md](README.md) for full docs
- See [SETUP.md](SETUP.md) for detailed setup
- Check [AI_EXTENSIONS.md](AI_EXTENSIONS.md) for AI features
- Review [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md) for contract usage

## Commands Cheat Sheet

```bash
# Smart Contracts
npm run compile          # Compile contracts
npm run deploy          # Deploy to Helios
npm run verify          # Verify deployment
npx hardhat test        # Run tests

# Frontend
cd frontend && npm start    # Run dev server
cd frontend && npm run build # Build for production

# Utilities
npx hardhat run scripts/checkBalance.js --network helios
npx hardhat console --network helios
```

## Project Structure

```
heloioweb3social/
├── contracts/          # Solidity contracts
├── scripts/           # Deployment scripts
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   └── utils/
│   └── public/
└── docs/             # Documentation
```

## Need Help?

- 📖 Full docs: [README.md](README.md)
- 🔧 Setup guide: [SETUP.md](SETUP.md)
- 🚀 Deploy guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- 📝 Contract guide: [CONTRACT_GUIDE.md](CONTRACT_GUIDE.md)
- 🤖 AI features: [AI_EXTENSIONS.md](AI_EXTENSIONS.md)

---

**Happy building! 🚀**
