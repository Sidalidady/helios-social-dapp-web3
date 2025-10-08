# Deploy Helios Social DApp to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Your contract deployed on Helios Testnet

## Step 1: Push to GitHub

1. **Initialize Git (if not already done):**
```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it: `helios-social-dapp-web3`
   - Don't initialize with README (you already have one)

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/helios-social-dapp-web3.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `helios-social-dapp-web3`
   - Click "Import"

3. **Configure Build Settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install --legacy-peer-deps`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   REACT_APP_CONTRACT_ADDRESS=0x032f9d761989245960a17C38De5Cc5Fac14D0b64
   REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
   REACT_APP_CHAIN_ID=42000
   REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Option B: Using Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd c:\Users\PC\heloioweb3social
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `helios-social-dapp`
   - In which directory is your code? `./frontend`
   - Override settings? **Y**
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Output Directory: `build`
   - Development Command: `npm start`

5. **Add Environment Variables:**
```bash
vercel env add REACT_APP_CONTRACT_ADDRESS
vercel env add REACT_APP_HELIOS_RPC_URL
vercel env add REACT_APP_CHAIN_ID
vercel env add REACT_APP_IPFS_GATEWAY
```

## Step 3: Configure Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Click "Connect Wallet"
3. Connect MetaMask with Helios Testnet
4. Test creating a post
5. Verify posts load correctly

## Troubleshooting

### Build Fails with Dependency Errors
- Make sure `--legacy-peer-deps` is in the build command
- Check that `core-js-pure` version is `3.19.0` in package.json

### Environment Variables Not Working
- Ensure all variables start with `REACT_APP_`
- Redeploy after adding environment variables
- Check they're set for "Production" environment

### Wallet Connection Issues
- Verify `REACT_APP_CONTRACT_ADDRESS` is correct
- Check `REACT_APP_HELIOS_RPC_URL` is accessible
- Ensure MetaMask is configured for Helios Testnet

### Posts Not Loading
- Verify contract address is correct
- Check browser console for errors
- Ensure IPFS gateway is accessible

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show deployment status in GitHub

## Production Checklist

Before going live:
- [ ] Contract deployed on Helios Testnet
- [ ] All environment variables set
- [ ] Test wallet connection
- [ ] Test post creation
- [ ] Test post loading
- [ ] Test likes and comments
- [ ] Test on mobile devices
- [ ] Configure custom domain (optional)

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]
```

## Support

- Vercel Docs: https://vercel.com/docs
- Helios Testnet: https://helioschainlabs.org
- GitHub Issues: https://github.com/YOUR_USERNAME/helios-social-dapp-web3/issues
