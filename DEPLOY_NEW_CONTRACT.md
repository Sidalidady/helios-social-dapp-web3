# Deploy New Contract - Fix Username Check Error

## Problem

The current deployed contract (`0x95D97F00b5979f3537E12c144E91E06658443377`) is an **old version** that doesn't have the `isUsernameAvailable()` function, causing this error:

```
invalid opcode: opcode 0xf6 not defined
```

## Solution

You need to deploy the **new contract version** with all the latest features.

## Steps to Deploy

### 1. Ensure You Have HLS Tokens

Check your balance:
```bash
# Your deployer address should have HLS tokens
# Get from faucet: https://faucet.helioschainlabs.org
```

### 2. Deploy New Contract

```bash
cd c:\Users\PC\heloioweb3social
npx hardhat run scripts/deploy.js --network helios-testnet
```

Expected output:
```
🚀 Deploying SocialFeed contract to Helios Testnet...
📝 Deploying with account: 0x032f9d761989245960a17C38De5Cc5Fac14D0b64
💰 Account balance: XXXXX HLS
📦 Deploying SocialFeed contract...
✅ SocialFeed deployed to: 0xNEW_CONTRACT_ADDRESS
```

### 3. Copy the New Contract Address

From the output, copy the new contract address (starts with `0x...`)

### 4. Update Frontend Configuration

#### A. Update `frontend/public/env-config.js`:
```javascript
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0xNEW_CONTRACT_ADDRESS_HERE',
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
};
```

#### B. Update `frontend/.env.example`:
```env
REACT_APP_CONTRACT_ADDRESS=0xNEW_CONTRACT_ADDRESS_HERE
```

### 5. Copy New ABI

```bash
Copy-Item "artifacts/contracts/SocialFeed.sol/SocialFeed.json" "frontend/src/contracts/SocialFeed.json" -Force
```

### 6. Update Vercel Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables

Update:
```
REACT_APP_CONTRACT_ADDRESS=0xNEW_CONTRACT_ADDRESS_HERE
```

### 7. Commit and Push

```bash
git add .
git commit -m "feat: Deploy new contract with username validation"
git push origin main
```

### 8. Verify Deployment

1. Wait for Vercel to deploy (2-3 minutes)
2. Open your app
3. Try creating a profile
4. Username check should work ✅

## New Contract Features

The new contract includes:

✅ `isUsernameAvailable(string)` - Check username availability
✅ `deleteProfile()` - Delete user profile
✅ `ProfileDeleted` event
✅ All previous features

## Temporary Fix (Already Applied)

I've updated the frontend to handle the missing function gracefully:
- If `isUsernameAvailable()` doesn't exist → Assumes username is available
- No errors shown to user
- Profile creation still works

**However, you should still deploy the new contract to get:**
- Real username uniqueness validation
- Profile deletion feature
- Latest improvements

## Quick Deploy Command

```bash
# One command to deploy
npx hardhat run scripts/deploy.js --network helios-testnet
```

## Troubleshooting

### Error: "Account has 0 HLS balance"
**Solution:** Get test tokens from https://faucet.helioschainlabs.org

### Error: "Cannot read properties of undefined"
**Solution:** Check that `.env` file has `PRIVATE_KEY` set

### Error: "Network not found"
**Solution:** Check `hardhat.config.js` has correct RPC URL

## After Deployment

1. ✅ Username validation will work
2. ✅ Profile deletion will work
3. ✅ No more opcode errors
4. ✅ All features functional

## Current Status

- ✅ Frontend updated to handle old contract
- ✅ No errors shown to users
- ⏳ Need to deploy new contract for full features

Deploy the new contract when you're ready! 🚀
