
## Smart Contract Deployment

### 1. Prepare for Deployment

```bash
# Check compilation
npm run compile

# Verify balance
npx hardhat run scripts/checkBalance.js --network helios
```

### 2. Deploy to Helios Testnet

```bash
npm run deploy
```

### 3. Verify Deployment

```bash
npm run verify
```

This will show:
- Contract address
- Deployer address
- Deployment timestamp
- Explorer link

### 4. Test the Contract

```bash
# Run tests
npx hardhat test

# Test on live network
npx hardhat console --network helios
```

In console:
```javascript
const SocialFeed = await ethers.getContractFactory("SocialFeed");
const contract = await SocialFeed.attach("YOUR_CONTRACT_ADDRESS");
const totalPosts = await contract.getTotalPosts();
console.log("Total posts:", totalPosts.toString());
```

## Frontend Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
In Vercel dashboard:
- Go to Settings → Environment Variables
- Add:
  - `REACT_APP_CONTRACT_ADDRESS`
  - `REACT_APP_HELIOS_RPC_URL`
  - `REACT_APP_CHAIN_ID`

5. **Redeploy**
```bash
vercel --prod
```

### Netlify Deployment

1. **Build**
```bash
cd frontend
npm run build
```

2. **Deploy via CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

3. **Set Environment Variables**
In Netlify dashboard → Site Settings → Environment Variables

### IPFS Deployment (Fully Decentralized)

1. **Build**
```bash
cd frontend
npm run build
```

2. **Upload to IPFS**

**Using Fleek:**
```bash
npm install -g @fleek-platform/cli
fleek site:deploy
```

**Using Web3.Storage:**
```bash
npm install -g @web3-storage/w3cli
w3 put ./build
```

3. **Access via IPFS Gateway**
```
https://ipfs.io/ipfs/YOUR_HASH
```

## Production Checklist

### Smart Contract
- [ ] Audit contract with Slither
- [ ] Run comprehensive tests
- [ ] Deploy to testnet first
- [ ] Verify on block explorer
- [ ] Document all functions
- [ ] Set up monitoring

### Frontend
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness
- [ ] Configure production IPFS (Pinata)
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (if desired)
- [ ] Test wallet connections
- [ ] Verify all environment variables

### Security
- [ ] Never commit private keys
- [ ] Use .env for sensitive data
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Test transaction signing
- [ ] Monitor for vulnerabilities

### Performance
- [ ] Optimize images
- [ ] Enable caching
- [ ] Minimize bundle size
- [ ] Test load times
- [ ] Configure CDN

## Monitoring

### Contract Events

Monitor contract activity:
```javascript
contract.on("PostCreated", (postId, author, ipfsHash, timestamp) => {
  console.log(`New post ${postId} by ${author}`);
});
```

### Error Tracking

Add Sentry to frontend:
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

### Analytics

Add Web3 analytics:
```bash
npm install @web3analytics/core
```

## Maintenance

### Update Contract

1. Deploy new version
2. Update frontend contract address
3. Migrate data if needed
4. Notify users

### Update Frontend

```bash
cd frontend
git pull
npm install
npm run build
vercel --prod
```

### Backup

Regular backups:
- Contract deployment info
- IPFS hashes
- Event logs
- User data

## Troubleshooting

### Deployment Fails

**Check:**
- Sufficient balance
- Correct network
- Valid private key
- Gas price settings

### Frontend Errors

**Check:**
- Correct contract address
- Network configuration
- CORS settings
- Environment variables

## Support

- Helios Discord: [Link]
- Documentation: [Link]
- GitHub Issues: [Link]

---

**Successfully deployed? Share your DApp with the community! 🎉**
