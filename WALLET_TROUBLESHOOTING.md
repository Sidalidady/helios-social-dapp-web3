# Wallet Connection Troubleshooting

## Common Issues and Solutions

### Issue: "Not Detected" appears but wallet is installed

**Solution:**
1. **Refresh the page** - Sometimes the wallet extension needs time to inject into the page
2. **Check if wallet is unlocked** - Make sure your wallet extension is unlocked
3. **Disable conflicting wallets** - If you have multiple wallet extensions, they might conflict:
   - Try disabling all wallets except the one you want to use
   - Or use the "Browser Wallet" option which will use whichever wallet is active

### Issue: Connection fails after clicking wallet

**Possible causes and solutions:**

1. **Wrong Network**
   - Make sure you've added Helios Testnet to your wallet
   - Network details:
     - Chain ID: `42000`
     - RPC URL: `https://testnet1.helioschainlabs.org`
     - Symbol: `HLS`

2. **Wallet Extension Not Responding**
   - Check if the wallet popup is blocked by your browser
   - Look for a popup blocker icon in your address bar
   - Allow popups for this site

3. **Multiple Wallets Conflict**
   - If you have MetaMask, Rabby, and OKX all installed:
     - They might compete for the connection
     - Try using the "Browser Wallet" option
     - Or temporarily disable other wallet extensions

### Issue: Can't see wallet options

**Solution:**
1. Make sure you have at least one wallet extension installed
2. Refresh the page after installing a wallet
3. Check browser console for errors (F12 → Console tab)

### Wallet-Specific Issues

#### MetaMask
- Make sure MetaMask is the active wallet
- Try clicking the MetaMask extension icon first, then connect
- Clear MetaMask's site connections and try again

#### Rabby Wallet
- Rabby might override MetaMask - this is normal
- Make sure Rabby is set as your default wallet
- Check Rabby's connected sites list

#### OKX Wallet
- OKX Wallet should be set as default in extension settings
- Make sure you're using the latest version
- Try the "Browser Wallet" option if specific detection fails

#### WalletConnect
- Requires a valid Project ID in your `.env` file
- Make sure your mobile wallet supports WalletConnect v2
- Check that QR code modal appears
- Ensure your phone and computer are on the same network (or have internet)

## Testing Your Setup

1. **Check if wallet is detected:**
   ```javascript
   // Open browser console (F12) and run:
   console.log('MetaMask:', window.ethereum?.isMetaMask);
   console.log('Rabby:', window.ethereum?.isRabby);
   console.log('OKX:', window.ethereum?.isOkxWallet);
   ```

2. **Test connection manually:**
   - Click "Connect Wallet"
   - Try each wallet option
   - Check browser console for error messages

3. **Verify network:**
   - After connecting, check your wallet shows "Helios Testnet"
   - If not, manually switch to Helios Testnet in your wallet

## Best Practices

1. **Use one wallet at a time**
   - Having multiple wallet extensions can cause conflicts
   - Choose your preferred wallet and disable others

2. **Keep wallets updated**
   - Always use the latest version of your wallet extension
   - Update regularly for security and compatibility

3. **Clear cache if issues persist**
   - Clear browser cache and cookies
   - Restart browser
   - Try again

4. **Use "Browser Wallet" option**
   - If specific wallet detection fails
   - This option works with any injected wallet
   - It will use whichever wallet responds first

## Still Having Issues?

If none of the above solutions work:

1. **Check browser compatibility:**
   - Use Chrome, Brave, Firefox, or Edge
   - Make sure browser is up to date

2. **Try incognito/private mode:**
   - This helps identify if extensions are conflicting
   - Only install one wallet extension in incognito mode

3. **Check console errors:**
   - Open Developer Tools (F12)
   - Look for red error messages
   - Share these errors when asking for help

4. **Alternative connection method:**
   - Use WalletConnect with your mobile wallet
   - This bypasses browser extension issues

## Developer Notes

The wallet detection logic checks for:
- `window.ethereum.isMetaMask` for MetaMask
- `window.ethereum.isRabby` for Rabby
- `window.ethereum.isOkxWallet` or `window.okxwallet` for OKX
- Generic `window.ethereum` for any injected wallet

All wallets are now clickable even if not detected, allowing users to try connecting anyway.
