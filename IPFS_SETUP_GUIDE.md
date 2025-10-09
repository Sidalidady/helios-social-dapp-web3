# IPFS Setup Guide for Helios Social DApp

## Current Status

Your project currently uses **localStorage as a fallback** for IPFS. This works for local development but won't persist data across users or devices.

## IPFS Integration Options

### Option 1: Pinata (Recommended - Easiest)

**Pros:**
- ✅ Free tier (1GB storage)
- ✅ Easy to use API
- ✅ Reliable pinning
- ✅ Fast retrieval
- ✅ No blockchain knowledge needed

**Setup:**

#### Step 1: Create Pinata Account
1. Go to https://pinata.cloud
2. Sign up for free account
3. Verify your email

#### Step 2: Get API Keys
1. Go to https://app.pinata.cloud/keys
2. Click "New Key"
3. Enable "pinFileToIPFS" and "pinJSONToIPFS"
4. Give it a name: "Helios Social DApp"
5. Click "Create Key"
6. **Copy API Key and Secret** (you won't see them again!)

#### Step 3: Add to Environment Variables

**Local Development** - Edit `frontend/.env`:
```env
REACT_APP_CONTRACT_ADDRESS=0x95D97F00b5979f3537E12c144E91E06658443377
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=your_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_secret_key_here
```

**Vercel Deployment** - Add to Vercel Environment Variables:
```
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_PINATA_API_KEY=your_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_secret_key_here
```

#### Step 4: Test
Your existing code already supports Pinata! Just add the keys and it will automatically use Pinata instead of localStorage.

---

### Option 2: Web3.Storage (Free & Decentralized)

**Pros:**
- ✅ Completely free
- ✅ Backed by Protocol Labs
- ✅ No storage limits
- ✅ Decentralized

**Setup:**

#### Step 1: Install Package
```bash
cd frontend
npm install web3.storage --legacy-peer-deps
```

#### Step 2: Get API Token
1. Go to https://web3.storage
2. Sign up with email or GitHub
3. Go to Account → Create API Token
4. Copy the token

#### Step 3: Update IPFS Utils

Create `frontend/src/utils/ipfsWeb3Storage.js`:
```javascript
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({ 
  token: process.env.REACT_APP_WEB3_STORAGE_TOKEN 
});

export async function uploadToIPFS(content) {
  try {
    const blob = new Blob([content], { type: 'application/json' });
    const file = new File([blob], 'content.json');
    const cid = await client.put([file]);
    console.log('✅ Uploaded to IPFS:', cid);
    return cid;
  } catch (error) {
    console.error('Error uploading to Web3.Storage:', error);
    throw error;
  }
}

export async function getFromIPFS(cid) {
  try {
    const res = await client.get(cid);
    const files = await res.files();
    const content = await files[0].text();
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching from Web3.Storage:', error);
    throw error;
  }
}
```

#### Step 4: Add Environment Variable
```env
REACT_APP_WEB3_STORAGE_TOKEN=your_token_here
```

---

### Option 3: NFT.Storage (Free for NFTs)

**Pros:**
- ✅ Free forever
- ✅ Designed for NFTs
- ✅ Backed by Protocol Labs

**Setup:**

#### Step 1: Install
```bash
npm install nft.storage --legacy-peer-deps
```

#### Step 2: Get API Key
1. Go to https://nft.storage
2. Sign up
3. Create API key

#### Step 3: Implementation
```javascript
import { NFTStorage, File } from 'nft.storage';

const client = new NFTStorage({ 
  token: process.env.REACT_APP_NFT_STORAGE_TOKEN 
});

export async function uploadToIPFS(content) {
  const blob = new Blob([content], { type: 'application/json' });
  const cid = await client.storeBlob(blob);
  return cid;
}
```

---

### Option 4: IPFS Node (Self-Hosted)

**Pros:**
- ✅ Full control
- ✅ No API limits
- ✅ Truly decentralized

**Cons:**
- ❌ Requires server
- ❌ More complex setup
- ❌ Maintenance needed

**Setup:**

#### Step 1: Install IPFS
```bash
# Windows
choco install ipfs

# Or download from https://ipfs.io
```

#### Step 2: Initialize
```bash
ipfs init
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

#### Step 3: Start Daemon
```bash
ipfs daemon
```

#### Step 4: Use IPFS HTTP Client
```bash
npm install ipfs-http-client --legacy-peer-deps
```

```javascript
import { create } from 'ipfs-http-client';

const client = create({ url: 'http://localhost:5001' });

export async function uploadToIPFS(content) {
  const { cid } = await client.add(content);
  return cid.toString();
}

export async function getFromIPFS(cid) {
  const stream = client.cat(cid);
  let data = '';
  for await (const chunk of stream) {
    data += new TextDecoder().decode(chunk);
  }
  return JSON.parse(data);
}
```

---

## Recommended Setup (Pinata)

### Quick Start with Pinata

1. **Get Pinata Keys** (5 minutes)
   - Sign up at https://pinata.cloud
   - Create API key
   - Copy API Key and Secret

2. **Add to Local `.env`:**
```env
REACT_APP_PINATA_API_KEY=your_api_key
REACT_APP_PINATA_SECRET_KEY=your_secret_key
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

3. **Add to Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Add the same three variables

4. **Test:**
```bash
cd frontend
npm start
```

5. **Create a post** - It will now upload to real IPFS!

---

## Comparison Table

| Feature | Pinata | Web3.Storage | NFT.Storage | Self-Hosted |
|---------|--------|--------------|-------------|-------------|
| **Cost** | Free (1GB) | Free (Unlimited) | Free | Server cost |
| **Setup Time** | 5 min | 10 min | 10 min | 1+ hour |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Speed** | Fast | Medium | Medium | Depends |
| **Maintenance** | None | None | None | High |
| **Best For** | Production | Free tier | NFT projects | Advanced |

---

## Testing Your IPFS Setup

### Test Upload
```javascript
import { uploadToIPFS } from './utils/ipfs';

const testUpload = async () => {
  const content = JSON.stringify({
    content: "Hello IPFS!",
    timestamp: Date.now()
  });
  
  const hash = await uploadToIPFS(content);
  console.log('IPFS Hash:', hash);
  
  // Should see: "✅ Content uploaded to IPFS: Qm..."
};
```

### Test Retrieval
```javascript
import { getFromIPFS } from './utils/ipfs';

const testRetrieve = async (hash) => {
  const data = await getFromIPFS(hash);
  console.log('Retrieved:', data);
};
```

### Check in Browser
1. Create a post in your app
2. Open browser console
3. Look for: "✅ Content uploaded to IPFS: Qm..."
4. Copy the hash
5. Visit: `https://ipfs.io/ipfs/YOUR_HASH`
6. You should see your content!

---

## Troubleshooting

### Issue: "401 Unauthorized" with Pinata
**Solution:** Check your API keys are correct and have the right permissions.

### Issue: Content not loading
**Solution:** 
1. Check IPFS gateway URL is correct
2. Try different gateway: `https://ipfs.io/ipfs/` or `https://cloudflare-ipfs.com/ipfs/`
3. Wait a few seconds (IPFS can be slow on first load)

### Issue: CORS errors
**Solution:** Use a proxy or configure IPFS node CORS settings.

### Issue: Large files failing
**Solution:** 
- Compress images before upload
- Use Pinata's dedicated file upload endpoint
- Consider chunking large files

---

## Best Practices

1. **Always validate uploads:**
```javascript
const hash = await uploadToIPFS(content);
if (!hash) throw new Error('Upload failed');
```

2. **Cache retrieved content:**
```javascript
localStorage.setItem(`ipfs_${hash}`, JSON.stringify(data));
```

3. **Use multiple gateways:**
```javascript
const gateways = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/'
];
```

4. **Compress images:**
```javascript
// Before upload
const compressed = await compressImage(file, 0.8);
```

5. **Pin important content:**
```javascript
// With Pinata, content is automatically pinned
// With self-hosted, manually pin:
await ipfs.pin.add(cid);
```

---

## Migration from localStorage to IPFS

Your current code already handles this! When you add Pinata keys:

1. New posts → Upload to Pinata
2. Old posts → Still work from localStorage
3. Gradual migration → Users re-post naturally

No data loss! 🎉

---

## Cost Estimates

### Pinata Free Tier
- **Storage:** 1GB
- **Bandwidth:** 100GB/month
- **Requests:** Unlimited
- **Estimated posts:** ~10,000 text posts or ~500 with images

### Pinata Paid Plans
- **Picnic:** $20/month (100GB storage)
- **Submarine:** $100/month (1TB storage)

### Web3.Storage
- **Free:** Unlimited storage
- **No bandwidth limits**
- **Perfect for MVP**

---

## Next Steps

1. ✅ Choose IPFS provider (Pinata recommended)
2. ✅ Get API keys
3. ✅ Add to `.env` files
4. ✅ Test locally
5. ✅ Deploy to Vercel
6. ✅ Monitor usage

---

## Support

- **Pinata Docs:** https://docs.pinata.cloud
- **Web3.Storage Docs:** https://web3.storage/docs
- **IPFS Docs:** https://docs.ipfs.io
- **Discord:** Join IPFS Discord for help

---

## Summary

**Recommended for you: Pinata**

1. Sign up at https://pinata.cloud
2. Get API keys
3. Add to `.env`:
```env
REACT_APP_PINATA_API_KEY=xxx
REACT_APP_PINATA_SECRET_KEY=xxx
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```
4. Done! Your app now uses real IPFS! 🎉

Your existing code already supports it - just add the keys!
