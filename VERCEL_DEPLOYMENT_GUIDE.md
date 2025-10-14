# 🚀 Vercel Deployment Guide

## New Contract Deployment

**Contract Address:** `0x778Ea59b285dB81B3d13dC0E30908e886F4c067c`

**Network:** Helios Testnet (Chain ID: 42000)

**Explorer:** https://explorer.helioschainlabs.org/address/0x778Ea59b285dB81B3d13dC0E30908e886F4c067c

---

## ✅ Files Updated

The following files have been updated with the new contract address:

1. ✅ `frontend/src/contracts/SocialFeed.json` - Contract ABI and address
2. ✅ `frontend/public/env-config.js` - Runtime configuration for Vercel
3. ✅ `frontend/.env.example` - Example environment variables
4. ✅ `deployments/helios-testnet.json` - Deployment information
5. ✅ `scripts/deploy.js` - Fixed deployment script error

---

## 📋 Vercel Deployment Steps

### Step 1: Update Local Environment

Update your `frontend/.env` file:

```env
REACT_APP_CONTRACT_ADDRESS=0x778Ea59b285dB81B3d13dC0E30908e886F4c067c
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
```

### Step 2: Test Locally

```bash
cd frontend
npm start
```

Verify the app connects to the new contract.

### Step 3: Build for Production

```bash
npm run build
```

### Step 4: Update Vercel Environment Variables

Go to your Vercel project settings:

1. Navigate to: **Settings** → **Environment Variables**
2. Update or add these variables:

```
REACT_APP_CONTRACT_ADDRESS=0x778Ea59b285dB81B3d13dC0E30908e886F4c067c
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=<your_key>
REACT_APP_PINATA_SECRET_KEY=<your_secret>
```

**Important:** Make sure to set these for all environments (Production, Preview, Development)

### Step 5: Deploy to Vercel

#### Option A: Git Push (Recommended)

```bash
git add .
git commit -m "feat: deploy new contract 0x778Ea59b285dB81B3d13dC0E30908e886F4c067c"
git push origin main
```

Vercel will automatically deploy.

#### Option B: Manual Deploy via CLI

```bash
cd frontend
vercel --prod
```

#### Option C: Vercel Dashboard

1. Go to your Vercel dashboard
2. Click on your project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment

---

## 🔍 Verification Steps

After deployment, verify:

1. **Contract Connection:**
   - Open browser console
   - Check for: `✅ Contract address loaded: 0x778Ea59b285dB81B3d13dC0E30908e886F4c067c`

2. **Network Detection:**
   - Connect wallet
   - Should auto-switch to Helios Testnet

3. **Features Test:**
   - Create a post
   - Follow a user
   - Check notifications
   - View profile

---

## 🛠️ Troubleshooting

### Issue: "Contract not found" error

**Solution:**
- Verify contract address in Vercel environment variables
- Check `frontend/public/env-config.js` has correct address
- Redeploy after updating

### Issue: Wrong network

**Solution:**
- Ensure `REACT_APP_CHAIN_ID=42000`
- Clear browser cache
- Reconnect wallet

### Issue: Old contract address still showing

**Solution:**
```bash
# Clear Vercel build cache
vercel --prod --force

# Or in Vercel dashboard:
# Settings → General → Clear Build Cache
```

---

## 📊 Contract Information

```json
{
  "network": "helios-testnet",
  "chainId": 42000,
  "contractAddress": "0x778Ea59b285dB81B3d13dC0E30908e886F4c067c",
  "explorerUrl": "https://explorer.helioschainlabs.org/address/0x778Ea59b285dB81B3d13dC0E30908e886F4c067c",
  "rpcUrl": "https://testnet1.helioschainlabs.org"
}
```

---

## 🔐 Security Notes

- ✅ Private key is encrypted (see `SECURE_KEY_MANAGEMENT.md`)
- ✅ `.env` files are gitignored
- ✅ API keys stored in Vercel environment variables
- ⚠️ Never commit private keys or API keys to git

---

## 📝 Quick Commands

```bash
# Test locally
cd frontend && npm start

# Build for production
cd frontend && npm run build

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs
```

---

## 🎉 Deployment Checklist

- [x] Contract deployed: `0x778Ea59b285dB81B3d13dC0E30908e886F4c067c`
- [x] ABI updated in `frontend/src/contracts/SocialFeed.json`
- [x] Runtime config updated in `frontend/public/env-config.js`
- [x] Example env updated in `frontend/.env.example`
- [ ] Local `.env` file updated (do this manually)
- [ ] Vercel environment variables updated
- [ ] Deployed to Vercel
- [ ] Verified contract connection
- [ ] Tested all features

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify contract address in network explorer
3. Ensure wallet is on Helios Testnet (Chain ID: 42000)
4. Clear browser cache and reconnect wallet

**Contract Explorer:** https://explorer.helioschainlabs.org/address/0x778Ea59b285dB81B3d13dC0E30908e886F4c067c

---

**Last Updated:** October 15, 2025
**Contract Version:** Latest deployment
