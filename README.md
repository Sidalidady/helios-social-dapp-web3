# Helios Social - Decentralized Social Platform

<div align="center">

![Helios Social](https://img.shields.io/badge/Helios-Social-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A decentralized social media platform built on Helios Testnet, inspired by x Social. Share your thoughts on the blockchain with IPFS storage and Web3 authentication.

[Live Demo](#) | [Documentation](#features) | [Report Bug](https://github.com/yourusername/helios-social/issues)

</div>

---

## 🌟 Features

- **🔐 Web3 Authentication** - Connect with MetaMask, no passwords needed
- **📝 Decentralized Posts** - Store metadata on-chain, content on IPFS
- **❤️ Like & Interact** - Engage with posts through blockchain transactions
- **👥 User Profiles** - Track followers, following, and post counts
- **⚡ Real-time Updates** - Live feed updates using contract events
- **🎨 Modern UI** - Responsive design with smooth animations
- **⛽ Gas Optimized** - Efficient smart contracts with event-based indexing

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity 0.8.20** - Smart contract development
- **OpenZeppelin** - Security standards (Ownable, ReentrancyGuard)
- **Hardhat** - Development environment

### Frontend
- **React 18** - UI framework
- **Wagmi v2** - Web3 React hooks
- **Viem** - Ethereum interactions
- **Lucide React** - Icon library

### Infrastructure
- **Helios Testnet** - EVM-compatible blockchain
- **IPFS** - Decentralized storage
- **MetaMask** - Wallet integration

## 📋 Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) v16+ installed
- [MetaMask](https://metamask.io/) browser extension
- Basic understanding of Web3 and React

## 🚀 Quick Start

### 1. Clone the Repository

```bash
(https://github.com/codeoverlorderror404/helios-social-dapp-web3.git)
cd helios-social
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
PRIVATE_KEY=your_wallet_private_key_here
```

⚠️ **Never commit your private key!** Keep `.env` in `.gitignore`.

### 4. Get Test Tokens

You need HLS tokens to deploy contracts:

```bash
# Check your balance
npx hardhat run scripts/checkBalance.js --network helios

# Get tokens from faucet
# Visit: https://faucet.helioschainlabs.org
# Or run: npm run faucet
```

### 5. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to Helios Testnet
npm run deploy
```

The deployment script will:
- Deploy the SocialFeed contract
- Save deployment info to `deployments/helios-testnet.json`
- Copy contract ABI to `frontend/src/contracts/`

### 6. Configure Frontend

Create `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Update with your deployed contract address (from deployment output):

```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
```

### 7. Run the Application

```bash
cd frontend
npm start
```

Visit `http://localhost:3000` in your browser.

### 8. Add Helios Testnet to MetaMask

Click "Connect Wallet" and approve the network addition, or manually add:

- **Network Name:** Helios Testnet
- **RPC URL:** https://testnet1.helioschainlabs.org
- **Chain ID:** 42000
- **Currency Symbol:** HLS
- **Block Explorer:** https://explorer.helioschainlabs.org

## 📁 Project Structure

```
helios-social/
├── contracts/              # Solidity smart contracts
│   └── SocialFeed.sol     # Main social feed contract
├── scripts/               # Deployment & utility scripts
│   ├── deploy.js         # Deploy to Helios Testnet
│   ├── verify.js         # Verify on explorer
│   ├── checkBalance.js   # Check wallet balance
│   └── getFaucet.js      # Get test tokens
├── frontend/              # React application
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── config/        # Web3 configuration
│       ├── utils/         # Helper functions
│       └── contracts/     # Contract ABIs (auto-generated)
├── deployments/           # Deployment records
├── hardhat.config.js     # Hardhat configuration
└── package.json          # Dependencies
```

## 🔧 Smart Contract Functions

### Core Functions

#### `createPost(string memory _ipfsHash)`
Create a new post with IPFS content hash.

```solidity
await contract.createPost("QmHash123...");
```

#### `likePost(uint256 _postId)` / `unlikePost(uint256 _postId)`
Like or unlike a post.

```solidity
await contract.likePost(1);
```

#### `followUser(address _userToFollow)` / `unfollowUser(address _userToUnfollow)`
Follow or unfollow a user.

```solidity
await contract.followUser("0xAddress...");
```

#### `getRecentPosts(uint256 _offset, uint256 _limit)`
Fetch recent posts with pagination.

```solidity
const posts = await contract.getRecentPosts(0, 50);
```

### Events

```solidity
event PostCreated(uint256 indexed postId, address indexed author, string ipfsHash, uint256 timestamp);
event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
event UserFollowed(address indexed follower, address indexed following);
```

## 🎨 UI Components

### Header
- Wallet connection/disconnection
- Display connected address
- Network indicator

### CreatePost
- Textarea with 280 character limit
- Real-time character counter
- IPFS upload with loading states
- Hint tooltip

### Feed
- Paginated post list
- Real-time updates via events
- Refresh functionality
- Empty state

### Post
- Author info and timestamp
- IPFS content loading
- Like/unlike functionality
- Visual indicators for own posts

## 🧪 Testing

### Run Smart Contract Tests

```bash
npx hardhat test
```

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

## 🔒 Security Best Practices

- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **Ownable** - Access control for admin functions
- ✅ **Input Validation** - Checks for empty strings and valid addresses
- ✅ **Gas Optimization** - Uses events for efficient data indexing
- ✅ **IPFS Storage** - Reduces on-chain data storage costs

### Security Audit Tools

```bash
# Install Slither
pip install slither-analyzer

# Run security analysis
slither contracts/SocialFeed.sol
```

## 📊 Gas Optimization

- **Events over Storage** - Use events for historical data
- **Pagination** - Limit query results to prevent gas exhaustion
- **Struct Packing** - Efficient data structure layouts
- **View Functions** - Free reads for data retrieval

## 🌐 IPFS Integration

### Current Implementation (MVP)
- Uses public IPFS gateways
- Fallback to localStorage for demo
- Simple hash generation

### Production Recommendations

1. **Pinata** - Dedicated IPFS pinning service
   ```bash
   npm install @pinata/sdk
   ```

2. **Web3.Storage** - Free decentralized storage
   ```bash
   npm install web3.storage
   ```

3. **NFT.Storage** - IPFS + Filecoin
   ```bash
   npm install nft.storage
   ```

Update `frontend/src/utils/ipfs.js` with API keys.

## 🚢 Deployment

### Vercel Deployment (Frontend)

```bash
cd frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### Contract Verification

```bash
npm run verify
```

Visit the explorer URL and manually verify:
- Compiler: Solidity 0.8.20
- Optimization: Enabled (200 runs)
- License: MIT

## 🔮 Future Enhancements

### Core Features
- [ ] **Comments** - Thread discussions under posts
- [ ] **Reposts** - Share others' posts
- [ ] **Media Upload** - Images and videos via IPFS
- [ ] **Hashtags** - Topic-based discovery
- [ ] **Notifications** - Real-time activity alerts

### AI Integration (Helios Native)
- [ ] **AI Content Moderation** - Detect spam/harmful content
- [ ] **AI Recommendations** - Personalized feed
- [ ] **AI Image Generation** - Create post visuals
- [ ] **Sentiment Analysis** - Post mood detection

### Advanced Features
- [ ] **ENS Integration** - Human-readable names
- [ ] **Token Gating** - Access control via NFTs
- [ ] **Tipping** - Send HLS to creators
- [ ] **DAO Governance** - Community decisions

## 🐛 Troubleshooting

### "Insufficient funds" Error
Get test HLS from: https://faucet.helioschainlabs.org

### "Network not found"
Ensure Helios Testnet is added to MetaMask (Chain ID: 42000)

### "IPFS content not loading"
- Check browser console for errors
- Try refreshing the page
- Verify IPFS gateway is accessible

### "Transaction failed"
- Check gas settings in MetaMask
- Verify contract address in frontend/.env
- Ensure wallet has enough HLS

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Documentation:** [GitHub Wiki](#)
- **Issues:** [GitHub Issues](https://github.com/yourusername/helios-social/issues)
- **Discord:** [Join Community](#)

## 🙏 Acknowledgments

- Built on [Helios Blockchain](https://helioschainlabs.org)
- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern Web3 apps

---

<div align="center">

**Built with ⚡ on Helios Testnet**

[⬆ Back to Top](#helios-social---decentralized-social-platform)

</div>
