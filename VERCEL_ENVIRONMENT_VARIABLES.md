# 🔑 Complete Vercel Environment Variables Guide

## All Environment Variables for Vercel Deployment

Copy and paste these environment variables into your Vercel project settings.

---

## 📋 Required Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. Contract Configuration

```
REACT_APP_CONTRACT_ADDRESS=0xb75819e83843a3325404BfABfBC211F401661AA0
```
**Description:** Your deployed smart contract address on Helios Testnet

---

### 2. Blockchain Network Configuration

```
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
```
**Description:** Helios Testnet RPC endpoint

```
REACT_APP_CHAIN_ID=42000
```
**Description:** Helios Testnet Chain ID

---

### 3. IPFS Configuration

```
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```
**Description:** IPFS gateway for retrieving uploaded content

```
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
```
**Description:** Your Pinata API key (get from https://app.pinata.cloud/keys)

```
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key_here
```
**Description:** Your Pinata Secret API key

---

## 🚀 Quick Setup Steps

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `helios-social-dapp-web3`
3. Click **Settings** → **Environment Variables**

### Step 2: Add Each Variable
For each variable above:
1. Click **"Add New"**
2. Enter the **Key** (e.g., `REACT_APP_CONTRACT_ADDRESS`)
3. Enter the **Value** (e.g., `0xb75819e83843a3325404BfABfBC211F401661AA0`)
4. Select environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **Save**

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 📝 Complete Variable List (Copy-Paste Format)

```env
REACT_APP_CONTRACT_ADDRESS=0xb75819e83843a3325404BfABfBC211F401661AA0
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=your_pinata_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key_here
```

---

## 🔐 Getting Your Pinata API Keys

If you don't have Pinata API keys yet:

1. **Sign up:** Go to https://pinata.cloud
2. **Login:** Go to https://app.pinata.cloud
3. **Create API Key:**
   - Click **API Keys** in sidebar
   - Click **+ New Key**
   - Enable permissions:
     - ✅ `pinFileToIPFS`
     - ✅ `pinJSONToIPFS`
   - Name it: `Helios Social DApp`
   - Click **Create Key**
4. **Copy Keys:**
   - Copy **API Key** → Use for `REACT_APP_PINATA_API_KEY`
   - Copy **API Secret** → Use for `REACT_APP_PINATA_SECRET_KEY`
   - ⚠️ **Save them now!** You won't see them again

---

## ✅ Verification Checklist

After adding all variables and redeploying:

- [ ] All 6 environment variables added
- [ ] Variables applied to Production, Preview, and Development
- [ ] Project redeployed successfully
- [ ] Visit your deployed app
- [ ] Open browser console (F12)
- [ ] Look for: `🔧 Runtime ENV Config Loaded (API keys hidden)`
- [ ] API keys should show as `***`
- [ ] Test wallet connection
- [ ] Test creating a post with image
- [ ] Test IPFS upload functionality

---

## 🔄 Updating Contract Address

When you deploy a new contract:

1. Go to Vercel → Settings → Environment Variables
2. Find `REACT_APP_CONTRACT_ADDRESS`
3. Click **Edit**
4. Update to new contract address
5. Click **Save**
6. Redeploy your application

---

## 🆘 Troubleshooting

### Environment Variables Not Working
- ✅ Ensure all variables start with `REACT_APP_`
- ✅ Check they're set for all environments (Production, Preview, Development)
- ✅ Redeploy after adding/updating variables
- ✅ Clear browser cache and hard refresh (Ctrl + Shift + R)

### IPFS Upload Fails
- ✅ Verify Pinata API keys are correct
- ✅ Check Pinata dashboard for API usage
- ✅ Ensure API key has `pinFileToIPFS` and `pinJSONToIPFS` permissions
- ✅ Check browser console for specific error messages

### Wallet Connection Issues
- ✅ Verify `REACT_APP_CONTRACT_ADDRESS` is correct
- ✅ Check `REACT_APP_HELIOS_RPC_URL` is accessible
- ✅ Ensure `REACT_APP_CHAIN_ID` is `42000`
- ✅ Verify MetaMask is configured for Helios Testnet

---

## 📊 Variable Summary Table

| Variable Name | Required | Description | Example Value |
|--------------|----------|-------------|---------------|
| `REACT_APP_CONTRACT_ADDRESS` | ✅ Yes | Smart contract address | `0xb75819e83843a3325404BfABfBC211F401661AA0` |
| `REACT_APP_HELIOS_RPC_URL` | ✅ Yes | Helios RPC endpoint | `https://testnet1.helioschainlabs.org` |
| `REACT_APP_CHAIN_ID` | ✅ Yes | Helios Chain ID | `42000` |
| `REACT_APP_IPFS_GATEWAY` | ✅ Yes | IPFS gateway URL | `https://gateway.pinata.cloud/ipfs/` |
| `REACT_APP_PINATA_API_KEY` | ✅ Yes | Pinata API key | `f8b93aafa4702b362db1` |
| `REACT_APP_PINATA_SECRET_KEY` | ✅ Yes | Pinata secret key | `7c4d883a53b7d625746e7c45ef5afc0c...` |

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Pinata Dashboard:** https://app.pinata.cloud
- **Helios Explorer:** https://explorer.helioschainlabs.org
- **Helios Faucet:** https://faucet.helioschainlabs.org

---

## 🎯 Next Steps

After setting up environment variables:

1. ✅ Test your deployed app
2. ✅ Create a test post with image
3. ✅ Verify IPFS upload works
4. ✅ Test on mobile devices
5. ✅ Share your dApp URL!

---

**🎉 Your dApp is ready to go live!**
