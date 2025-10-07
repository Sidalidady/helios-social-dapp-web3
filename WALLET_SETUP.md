# Wallet Setup Guide

This guide explains how to set up and use multiple wallet options in Helios Social.

## Supported Wallets

Helios Social now supports the following wallet providers:

1. **MetaMask** 🦊 - Browser extension wallet
2. **Rabby Wallet** 🐰 - Multi-chain browser wallet
3. **OKX Wallet** ⭕ - Comprehensive crypto wallet
4. **WalletConnect** 🔗 - Connect mobile wallets via QR code

## Setup Instructions

### 1. WalletConnect Configuration

To enable WalletConnect, you need to get a Project ID from WalletConnect Cloud:

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Add it to your `.env` file:

```bash
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Install Browser Wallets

#### MetaMask
- Visit [metamask.io](https://metamask.io/)
- Install the browser extension
- Create or import a wallet

#### Rabby Wallet
- Visit [rabby.io](https://rabby.io/)
- Install the browser extension
- Create or import a wallet

#### OKX Wallet
- Visit [okx.com/web3](https://www.okx.com/web3)
- Install the browser extension
- Create or import a wallet

### 3. Add Helios Testnet to Your Wallet

After installing your preferred wallet, add the Helios Testnet network:

**Network Details:**
- Network Name: `Helios Testnet`
- RPC URL: `https://testnet1.helioschainlabs.org`
- Chain ID: `42000`
- Currency Symbol: `HLS`
- Block Explorer: `https://explorer.helioschainlabs.org`

## Using the Wallet Selector

1. Click the **"Connect Wallet"** button in the header
2. A modal will appear showing all available wallets
3. Select your preferred wallet from the list
4. Follow the wallet's prompts to complete the connection
5. If a wallet shows "Not Installed", you'll need to install it first

## Features

### Automatic Wallet Detection
The app automatically detects which wallets are installed in your browser and enables/disables options accordingly.

### WalletConnect QR Code
When selecting WalletConnect, a QR code modal will appear. Scan it with your mobile wallet app to connect.

### Multiple Wallet Support
You can switch between different wallets by disconnecting and reconnecting with a different provider.

### Profile Persistence
Your profile is linked to your wallet address, so you'll see the same profile regardless of which wallet you use with the same address.

## Troubleshooting

### Wallet Not Detected
- Make sure the wallet extension is installed and enabled
- Refresh the page after installing a new wallet
- Check that no other wallet extensions are conflicting

### Connection Failed
- Ensure you're on the correct network (Helios Testnet)
- Try disabling other wallet extensions temporarily
- Clear your browser cache and try again

### WalletConnect Not Working
- Verify your Project ID is correctly set in the `.env` file
- Make sure your mobile wallet supports WalletConnect v2
- Check your internet connection

## Security Tips

1. **Never share your seed phrase** with anyone
2. **Verify the website URL** before connecting your wallet
3. **Use a hardware wallet** for large amounts
4. **Keep your wallet software updated**
5. **Be cautious of phishing attempts**

## Development Notes

The wallet configuration is located in:
- `frontend/src/config/wagmi.js` - Wallet connector setup
- `frontend/src/components/Header.js` - Wallet selection UI

To add more wallets, update the `connectors` array in `wagmi.js`.
