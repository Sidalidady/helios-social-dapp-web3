# Security Setup Guide

## 🔐 Protecting Your API Keys

### Current Issue
Your Pinata API keys are currently exposed in the public repository. Follow these steps to secure them.

---

## Step 1: Update Your Local `.env` Files

### Root `.env` file
Edit `c:\Users\PC\heloioweb3social\.env`:

```env
# Helios Testnet Configuration
HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
PRIVATE_KEY=0xd1297a13ba8bfe07acbd3b7de7ea7c21911cf7c73aa1559d42b02313a46f194b

# IPFS/Pinata Configuration
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=f8b93aafa4702b362db1
PINATA_SECRET_KEY=7c4d883a53b7d625746e7c45ef5afc0c2e3a87140d731e58895f77b0e00a81fc
```

### Frontend `.env` file
Create/edit `c:\Users\PC\heloioweb3social\frontend\.env`:

```env
REACT_APP_CONTRACT_ADDRESS=0xc766AB519087D9f755b33B1694f336aAfb9183b9
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=f8b93aafa4702b362db1
REACT_APP_PINATA_SECRET_KEY=7c4d883a53b7d625746e7c45ef5afc0c2e3a87140d731e58895f77b0e00a81fc
```

---

## Step 2: Update Vercel Environment Variables

Go to your Vercel project settings:

1. **Navigate to:** Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add these variables:**

```
REACT_APP_CONTRACT_ADDRESS=0xc766AB519087D9f755b33B1694f336aAfb9183b9
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=f8b93aafa4702b362db1
REACT_APP_PINATA_SECRET_KEY=7c4d883a53b7d625746e7c45ef5afc0c2e3a87140d731e58895f77b0e00a81fc
```

3. **Apply to:** Production, Preview, and Development

4. **Redeploy** your application

---

## Step 3: Verify `.gitignore`

Ensure these files are in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
frontend/.env
frontend/.env.local
```

---

## Step 4: Rotate Your API Keys (Recommended)

Since your keys were exposed in the repository:

### Rotate Pinata API Keys:
1. Go to https://app.pinata.cloud/
2. Navigate to API Keys
3. Delete the old key
4. Create a new API key
5. Update the new keys in:
   - Local `.env` files
   - Vercel environment variables

### Rotate Private Key (If Needed):
1. Create a new wallet
2. Transfer funds to new wallet
3. Update `PRIVATE_KEY` in `.env`
4. Redeploy contract if necessary

---

## Step 5: Clean Git History (Optional but Recommended)

Your API keys are in the git history. To remove them:

### Option A: BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror https://github.com/Sidalidady/helios-social-dapp-web3.git

# Remove sensitive data
bfg --replace-text passwords.txt helios-social-dapp-web3.git

# Force push
cd helios-social-dapp-web3.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Option B: Start Fresh Repository
1. Create a new GitHub repository
2. Copy all files (except `.git` folder)
3. Initialize new git repository
4. Push to new repository
5. Update Vercel to use new repository

---

## Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore`
- Use environment variables for secrets
- Rotate keys regularly
- Use different keys for development/production
- Monitor API usage for suspicious activity

### ❌ DON'T:
- Commit `.env` files to git
- Share API keys in chat/email
- Use production keys in development
- Hardcode secrets in code
- Push sensitive data to public repos

---

## Testing After Setup

1. **Check local development:**
   ```bash
   cd frontend
   npm start
   ```
   - Upload an image to IPFS
   - Verify it works

2. **Check Vercel deployment:**
   - Go to your deployed app
   - Upload an image to IPFS
   - Verify it works

3. **Check console:**
   - Open browser DevTools (F12)
   - Look for: "Runtime ENV Config Loaded (API keys hidden)"
   - API keys should show as `***`

---

## Current Status

- ✅ `.env` files are gitignored
- ✅ `env-config.js` updated to use environment variables
- ✅ Console logging hides API keys
- ⚠️ Old keys still in git history
- ⚠️ Need to update Vercel environment variables
- ⚠️ Recommended to rotate API keys

---

## Support

If you have issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables are set
4. Test IPFS upload functionality

---

**Remember:** Never commit API keys or private keys to version control!
