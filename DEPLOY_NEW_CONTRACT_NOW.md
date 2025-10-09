# Deploy New Smart Contract - Fix Transaction Failures

## Problem

Transactions are failing because the current contract is an old version. You need to deploy the NEW contract with all the latest features.

## Quick Deploy Steps

### Step 1: Add Your Private Key to .env

Edit the file: `c:\Users\PC\heloioweb3social\.env`

Add this line:
```
PRIVATE_KEY=your_private_key_here
HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
```

**How to get your private key:**
1. Open MetaMask
2. Click the 3 dots → Account details
3. Click "Show private key"
4. Enter your password
5. Copy the private key
6. Paste it in `.env` file

### Step 2: Ensure You Have HLS Tokens

Your wallet needs HLS tokens for gas fees.

**Get tokens from faucet:**
https://faucet.helioschainlabs.org

### Step 3: Deploy the Contract

Run this command:
```bash
npx hardhat run scripts/deploy.js --network helios-testnet
```

You should see:
```
🚀 Deploying SocialFeed contract to Helios Testnet...
📝 Deploying with account: 0xYourAddress
💰 Account balance: XXXX HLS
📦 Deploying SocialFeed contract...
✅ SocialFeed deployed to: 0xNEW_ADDRESS_HERE
```

### Step 4: Copy the New Contract Address

From the output above, copy the new contract address (starts with `0x...`)

### Step 5: Update Frontend Configuration

#### A. Update `frontend/public/env-config.js`:
```javascript
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0xNEW_ADDRESS_HERE', // ← Paste new address
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  REACT_APP_PINATA_API_KEY: 'f8b93aafa4702b362db1',
  REACT_APP_PINATA_SECRET_KEY: '7c4d883a53b7d625746e7c45ef5afc0c2e3a87140d731e58895f77b0e00a81fc',
};
```

#### B. Update `frontend/.env.example`:
```env
REACT_APP_CONTRACT_ADDRESS=0xNEW_ADDRESS_HERE
```

### Step 6: Copy New ABI

```bash
Copy-Item "artifacts/contracts/SocialFeed.sol/SocialFeed.json" "frontend/src/contracts/SocialFeed.json" -Force
```

### Step 7: Update Vercel Environment Variables

Go to: **Vercel → Your Project → Settings → Environment Variables**

Update:
```
REACT_APP_CONTRACT_ADDRESS=0xNEW_ADDRESS_HERE
```

For all environments (Production, Preview, Development)

### Step 8: Commit and Push

```bash
git add .
git commit -m "feat: Deploy new smart contract with all features"
git push origin main
```

### Step 9: Verify Deployment

1. Wait 2-3 minutes for Vercel to deploy
2. Open your app
3. Open browser console (F12)
4. Look for: `Contract address: 0xNEW_ADDRESS_HERE`
5. Try creating a post
6. Transaction should work! ✅

---

## New Contract Features

The new contract includes:

✅ **createPost(string ipfsHash)** - Create posts
✅ **likePost(uint256 postId)** - Like posts
✅ **unlikePost(uint256 postId)** - Unlike posts
✅ **addComment(uint256 postId, string ipfsHash)** - Add comments
✅ **likeComment(uint256 postId, uint256 commentId)** - Like comments
✅ **unlikeComment(uint256 postId, uint256 commentId)** - Unlike comments
✅ **updateProfile(string displayName, string ipfsHash)** - Update profile
✅ **deleteProfile()** - Delete profile
✅ **isUsernameAvailable(string username)** - Check username
✅ **getAllPosts()** - Get all posts
✅ **getUserProfile(address user)** - Get user profile

---

## Troubleshooting

### Error: "Account has 0 HLS balance"
**Solution:** Get tokens from https://faucet.helioschainlabs.org

### Error: "Cannot read properties of undefined"
**Solution:** Add PRIVATE_KEY to `.env` file

### Error: "Network not found"
**Solution:** Check HELIOS_RPC_URL in `.env` file

### Transactions still failing after deploy
**Solution:** 
1. Clear browser cache
2. Disconnect and reconnect wallet
3. Check you're on Helios Testnet
4. Verify new contract address is loaded

---

## Quick Command Summary

```bash
# 1. Deploy contract
npx hardhat run scripts/deploy.js --network helios-testnet

# 2. Copy ABI
Copy-Item "artifacts/contracts/SocialFeed.sol/SocialFeed.json" "frontend/src/contracts/SocialFeed.json" -Force

# 3. Update env-config.js with new address

# 4. Commit and push
git add .
git commit -m "feat: Deploy new smart contract"
git push origin main

# 5. Update Vercel environment variable
# Go to Vercel dashboard and update REACT_APP_CONTRACT_ADDRESS
```

---

## Why This Fixes Transactions

**Current Problem:**
- Old contract doesn't have all functions
- Transactions fail with "invalid opcode" errors
- Features don't work properly

**After New Deploy:**
- ✅ All functions available
- ✅ Transactions succeed
- ✅ All features work
- ✅ No more errors

---

## Expected Results

After deploying the new contract:

✅ **Create Post** - Works perfectly
✅ **Like Post** - Works perfectly
✅ **Comment** - Works perfectly
✅ **Like Comment** - Works perfectly
✅ **Feed** - Loads all posts
✅ **Profile** - Create/edit works

---

**Deploy the new contract now to fix all transaction failures!** 🚀
