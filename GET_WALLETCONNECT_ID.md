# How to Get Your WalletConnect Project ID

WalletConnect is now enabled with a demo Project ID, but you should get your own for production use.

## Quick Steps (5 minutes)

### 1. Visit WalletConnect Cloud
Go to: **https://cloud.walletconnect.com/**

### 2. Sign Up / Log In
- Click "Get Started" or "Sign In"
- You can sign up with:
  - GitHub account (recommended - fastest)
  - Email address
  - Google account

### 3. Create a New Project
1. After logging in, click **"Create New Project"** or **"+ New Project"**
2. Fill in the project details:
   - **Project Name**: `Helios Social` (or any name you prefer)
   - **Project Description**: `Decentralized social network on Helios blockchain`
   - **Project URL**: Your app URL (can be `http://localhost:3000` for now)

### 4. Get Your Project ID
1. After creating the project, you'll see your **Project ID**
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. Click the **Copy** button to copy it

### 5. Add to Your .env File

Create or edit the file: `frontend/.env`

Add this line:
```bash
REACT_APP_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

Replace `your_actual_project_id_here` with the Project ID you copied.

### 6. Restart Your App
```bash
# Stop your app (Ctrl+C)
# Then restart it
npm start
```

## Example .env File

Your `frontend/.env` file should look like this:

```bash
REACT_APP_CONTRACT_ADDRESS=0x1234567890abcdef...
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
REACT_APP_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Why Get Your Own Project ID?

1. **Rate Limits**: Demo IDs have low rate limits
2. **Analytics**: See how many users connect via WalletConnect
3. **Reliability**: Your own ID won't be shared with others
4. **Production Ready**: Required for production deployment
5. **Free**: It's completely free for most use cases

## Troubleshooting

### Can't access WalletConnect Cloud?
- Try a different browser
- Clear your browser cache
- Use incognito/private mode

### Project ID not working?
- Make sure you copied the entire ID
- Check for extra spaces in the .env file
- Restart your development server
- Clear browser cache

### Still using demo ID?
The app will work with the demo ID, but:
- You might hit rate limits with many users
- It's not recommended for production
- Get your own ID when you can (it's free!)

## Current Status

✅ WalletConnect is **ENABLED** with a demo Project ID
✅ You can connect mobile wallets via QR code
⚠️ Get your own Project ID for production use

## Need Help?

- WalletConnect Docs: https://docs.walletconnect.com/
- WalletConnect Support: https://walletconnect.com/support
- Check the console for error messages (F12 in browser)
