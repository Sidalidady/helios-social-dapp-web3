# Automatic Network Switching - Helios Testnet

## Overview

The DApp now automatically switches users to Helios Testnet when they connect their wallet. If the network doesn't exist in their wallet, it will be added automatically.

## Features

### 1. **Automatic Detection** ✅
- Detects current network on wallet connection
- Compares with Helios Testnet (Chain ID: 42000)
- Triggers switch if on wrong network

### 2. **Automatic Switching** ✅
- Prompts wallet to switch networks
- No manual configuration needed
- Seamless user experience

### 3. **Network Addition** ✅
- If Helios Testnet not in wallet
- Automatically adds network configuration
- One-click approval

### 4. **Visual Feedback** ✅
- Red banner when on wrong network
- "Switch Network" button
- Loading states during switch

## User Experience

### First Time Connection

1. **User connects wallet** → MetaMask/Rabby/OKX
2. **Wrong network detected** → e.g., Ethereum Mainnet
3. **Auto-switch triggered** → Wallet popup appears
4. **User approves** → Switches to Helios Testnet
5. **Success** → DApp ready to use

### Network Not in Wallet

1. **User connects wallet** → First time user
2. **Network not found** → Helios Testnet missing
3. **Auto-add triggered** → "Add Network" popup
4. **User approves** → Network added to wallet
5. **Auto-switch** → Switches to new network
6. **Success** → DApp ready to use

### Already on Helios

1. **User connects wallet** → Already on Helios Testnet
2. **No action needed** → ✅ Immediate access
3. **No popups** → Seamless experience

## Technical Implementation

### Hook: `useAutoSwitchNetwork`

**Location:** `frontend/src/hooks/useAutoSwitchNetwork.js`

```javascript
export function useAutoSwitchNetwork() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chainId !== heliosTestnet.id) {
      switchChain({ chainId: heliosTestnet.id });
    }
  }, [isConnected, chainId]);
}
```

### Component: `NetworkSwitcher`

**Location:** `frontend/src/components/NetworkSwitcher.js`

Shows a banner when user is on wrong network with a manual switch button.

### Network Configuration

**Location:** `frontend/src/config/wagmi.js`

```javascript
export const heliosTestnet = {
  id: 42000,
  name: 'Helios Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Helios',
    symbol: 'HLS',
  },
  rpcUrls: {
    default: { http: ['https://testnet1.helioschainlabs.org'] },
  },
  blockExplorers: {
    default: { 
      name: 'Helios Explorer', 
      url: 'https://explorer.helioschainlabs.org' 
    },
  },
};
```

## UI Components

### Network Banner

**Appearance:**
- Red gradient background
- Warning icon
- Clear message: "Wrong Network! Please switch to Helios Testnet"
- "Switch Network" button
- Fixed at top of page

**Behavior:**
- Shows only when on wrong network
- Hides when on Helios Testnet
- Animated slide-down entrance
- Responsive design

### Switch Button

**States:**
- **Default:** "Switch Network"
- **Loading:** "Switching..." with spinner
- **Disabled:** During network switch

## Error Handling

### Network Switch Failed

```javascript
try {
  await switchChain({ chainId: heliosTestnet.id });
} catch (error) {
  if (error.code === 4902) {
    // Network not found - try to add it
    await addHeliosNetwork();
  } else if (error.code === 4001) {
    // User rejected - show message
    alert('Please switch to Helios Testnet manually');
  }
}
```

### Network Addition Failed

```javascript
try {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [networkConfig],
  });
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    alert('Please add Helios Testnet manually');
  }
}
```

## Wallet Support

### Supported Wallets

✅ **MetaMask** - Full support
✅ **Rabby** - Full support  
✅ **OKX Wallet** - Full support
✅ **Coinbase Wallet** - Full support
✅ **Trust Wallet** - Full support
✅ **Any EIP-1193 wallet** - Full support

### Network Switch Methods

All wallets support:
- `wallet_switchEthereumChain` - Switch network
- `wallet_addEthereumChain` - Add network

## Console Logs

### Successful Switch

```
🔄 Wrong network detected. Current: 1 Expected: 42000
🔄 Switching to Helios Testnet...
✅ Successfully switched to Helios Testnet
```

### Network Added

```
📝 Network not found in wallet. Attempting to add...
✅ Helios Testnet added to wallet
```

### Already Correct

```
✅ Already on Helios Testnet
```

## User Messages

### Switch Required

```
Wrong Network! Please switch to Helios Testnet
[Switch Network]
```

### Network Added

```
Helios Testnet has been added to your wallet!
```

### Manual Switch Needed

```
Please switch to Helios Testnet manually in your wallet.
```

## Testing

### Test Cases

1. **Connect on Ethereum Mainnet**
   - Should auto-switch to Helios
   - Wallet popup appears
   - User approves
   - Success

2. **Connect on Polygon**
   - Should auto-switch to Helios
   - Wallet popup appears
   - User approves
   - Success

3. **Connect on Helios Testnet**
   - No popup
   - Immediate access
   - No banner

4. **Network Not in Wallet**
   - "Add Network" popup
   - User approves
   - Auto-switches
   - Success

5. **User Rejects Switch**
   - Banner stays visible
   - Manual switch button available
   - Alert message shown

## Benefits

### For Users

1. **No Manual Setup** - Automatic network switching
2. **Clear Guidance** - Visual banner when wrong network
3. **One-Click Fix** - Easy switch button
4. **No Confusion** - Can't use DApp on wrong network

### For Platform

1. **Correct Network** - All users on Helios Testnet
2. **Fewer Errors** - No wrong network transactions
3. **Better UX** - Seamless onboarding
4. **Less Support** - Fewer "wrong network" tickets

## Edge Cases

### Multiple Network Switches

- User switches away from Helios
- Banner appears immediately
- Auto-switch triggers again
- User can switch back easily

### Wallet Locked

- Network check waits for unlock
- Triggers after unlock
- No errors during locked state

### No Wallet

- Hook doesn't run
- No errors
- Graceful handling

## Future Enhancements

- [ ] Remember user preference (don't auto-switch)
- [ ] Support multiple networks (mainnet + testnet)
- [ ] Custom network configurations
- [ ] Network health indicator
- [ ] Gas price display

## Configuration

### Change Target Network

Edit `frontend/src/config/wagmi.js`:

```javascript
export const heliosTestnet = {
  id: YOUR_CHAIN_ID,
  name: 'Your Network',
  // ... rest of config
};
```

### Disable Auto-Switch

Comment out in `App.js`:

```javascript
// useAutoSwitchNetwork(); // Disabled
```

### Customize Banner

Edit `frontend/src/components/NetworkSwitcher.css`

## Summary

✅ **Automatic network detection**
✅ **Auto-switch to Helios Testnet**
✅ **Auto-add network if missing**
✅ **Visual feedback banner**
✅ **Manual switch button**
✅ **Error handling**
✅ **All wallets supported**

Users will always be on the correct network! 🎯
