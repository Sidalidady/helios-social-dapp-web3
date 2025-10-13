import React, { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { X } from 'lucide-react';
import './WalletConnect.css';

function WalletConnect({ onClose }) {
  const { connect, connectors, isPending, error } = useConnect();
  const { isConnected } = useAccount();
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Auto-close when connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onClose]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      setConnectionError(error.message);
      setConnectingWallet(null);
      
      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        setConnectionError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Don't show modal if already connected
  if (isConnected) {
    return null;
  }

  const getWalletIcon = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('rabby')) return '🐰';
    if (nameLower.includes('phantom')) return '👻';
    if (nameLower.includes('trust')) return '🛡️';
    if (nameLower.includes('okx')) return '⬛';
    if (nameLower.includes('hot')) return '🔥';
    if (nameLower.includes('metamask')) return '🦊';
    if (nameLower.includes('coinbase')) return '🔵';
    if (nameLower.includes('walletconnect')) return '🔗';
    return '👛';
  };

  const getWalletName = (connector) => {
    const name = connector.name;
    if (name === 'Injected') return 'Browser Wallet';
    // Normalize wallet names to avoid duplicates
    if (name.toLowerCase().includes('rabby')) return 'Rabby';
    if (name.toLowerCase().includes('metamask')) return 'MetaMask';
    if (name.toLowerCase().includes('okx')) return 'OkxWallet';
    if (name.toLowerCase().includes('coinbase')) return 'Coinbase Wallet';
    return name;
  };

  const isWalletAvailable = (connector) => {
    const name = connector.name.toLowerCase();
    const id = connector.id.toLowerCase();
    
    if (typeof window.ethereum !== 'undefined') {
      if (name.includes('metamask') || id.includes('metamask')) {
        return window.ethereum.isMetaMask === true;
      }
      if (name.includes('coinbase') || id.includes('coinbase')) {
        return window.ethereum.isCoinbaseWallet === true || window.coinbaseWalletExtension !== undefined;
      }
      if (name.includes('rabby') || id.includes('rabby')) {
        return window.ethereum.isRabby === true;
      }
      if (name.includes('okx') || id.includes('okx')) {
        return window.ethereum.isOkxWallet === true || window.okxwallet !== undefined;
      }
      return true;
    }
    
    return false;
  };

  // Check if user is on mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Mobile deep link URLs
  const getMobileDeepLink = (walletName) => {
    const dappUrl = window.location.href;
    const encodedUrl = encodeURIComponent(dappUrl);
    
    const deepLinks = {
      'MetaMask': `https://metamask.app.link/dapp/${window.location.host}`,
      'Rabby': `rabby://dapp?url=${encodedUrl}`,
      'OkxWallet': `okx://wallet/dapp/url?dappUrl=${encodedUrl}`
    };
    
    return deepLinks[walletName];
  };

  // Add Helios Testnet to wallet
  const addHeliosNetwork = async () => {
    try {
      console.log('🌐 Adding Helios Testnet to wallet...');
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xA410', // 42000 in hex
          chainName: 'Helios Testnet',
          nativeCurrency: {
            name: 'Helios',
            symbol: 'HLS',
            decimals: 18
          },
          rpcUrls: ['https://testnet1.helioschainlabs.org'],
          blockExplorerUrls: ['https://explorer.helioschainlabs.org']
        }]
      });
      
      console.log('✅ Helios Testnet added successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error adding Helios network:', error);
      
      // If user rejected, that's okay
      if (error.code === 4001) {
        console.log('User rejected network addition');
      }
      
      return false;
    }
  };

  // Switch to Helios Testnet
  const switchToHeliosNetwork = async () => {
    try {
      console.log('🔄 Switching to Helios Testnet...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA410' }], // 42000 in hex
      });
      
      console.log('✅ Switched to Helios Testnet!');
      return true;
    } catch (error) {
      console.error('❌ Error switching network:', error);
      
      // If network doesn't exist, add it
      if (error.code === 4902) {
        console.log('Network not found, adding it...');
        return await addHeliosNetwork();
      }
      
      return false;
    }
  };

  const handleConnect = async (connector) => {
    try {
      const walletName = getWalletName(connector);
      const available = isWalletAvailable(connector);
      
      // Check if already connected
      if (isConnected) {
        console.log('Already connected, closing modal');
        onClose();
        return;
      }
      
      // Set connecting state
      setConnectingWallet(walletName);
      setConnectionError(null);
      
      console.log('🔌 Connecting to', walletName, '...');
      
      // If on mobile and wallet not installed, open mobile app
      if (isMobile() && !available) {
        const deepLink = getMobileDeepLink(walletName);
        
        if (deepLink) {
          // Try to open the wallet app
          window.location.href = deepLink;
          
          // Fallback to app store after 2 seconds if app doesn't open
          setTimeout(() => {
            const appStoreLinks = {
              'MetaMask': 'https://metamask.io/download/',
              'Rabby': 'https://rabby.io/download',
              'OkxWallet': 'https://www.okx.com/download'
            };
            
            if (appStoreLinks[walletName]) {
              window.open(appStoreLinks[walletName], '_blank');
            }
          }, 2000);
          
          setConnectingWallet(null);
          onClose();
          return;
        }
      }
      
      // Clear any stale wagmi state before connecting
      try {
        // Disconnect any existing connections first
        if (connector.getProvider) {
          const provider = await connector.getProvider();
          if (provider && provider.removeAllListeners) {
            provider.removeAllListeners();
          }
        }
      } catch (e) {
        // Ignore cleanup errors
        console.log('Cleanup error (safe to ignore):', e);
      }
      
      // Desktop or wallet is available - proceed with normal connection
      await connect({ connector });
      
      // After successful connection, automatically add and switch to Helios network
      if (window.ethereum) {
        console.log('🌐 Checking network...');
        
        // Wait a bit for connection to complete
        setTimeout(async () => {
          const switched = await switchToHeliosNetwork();
          if (switched) {
            console.log('✅ Successfully connected to Helios Testnet!');
          }
        }, 1000);
      }
      
      // Connection successful - modal will auto-close via useEffect
    } catch (error) {
      // Handle different error types
      setConnectingWallet(null);
      
      if (error.message && error.message.includes('User rejected')) {
        console.log('Connection rejected by user');
        setConnectionError('Connection rejected');
      } else if (error.message && error.message.includes('Connection interrupted')) {
        console.log('Connection cancelled by user');
        setConnectionError('Connection cancelled');
      } else if (error.message && error.message.includes('Connector not found')) {
        console.error('Wallet not found:', error);
        setConnectionError('Wallet not found. Please install it first.');
      } else if (error.message && (error.message.includes('already connected') || error.message.includes('Connector already connected'))) {
        console.log('Already connected, closing modal');
        onClose();
      } else {
        console.error('Connection error:', error);
        setConnectionError('Failed to connect. Please try again.');
      }
    }
  };

  // Filter out duplicate wallets based on name
  const uniqueConnectors = connectors.reduce((acc, connector) => {
    const name = getWalletName(connector);
    const exists = acc.find(c => getWalletName(c) === name);
    if (!exists) {
      acc.push(connector);
    }
    return acc;
  }, []);

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal-modern" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header-modern">
          <div className="wallet-modal-logo">◎</div>
          <h2>Connect Wallet</h2>
          <button className="wallet-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Getting Started Info */}
        <div className="wallet-info-section">
          <div className="wallet-info-header">
            <span className="info-icon">ℹ️</span>
            <h3>Getting Started with Stellari Social</h3>
          </div>
          <div className="wallet-info-content">
            <p className="wallet-info-step">
              <span className="step-number">1</span>
              <span className="step-text">
                <strong>Connect a Web3 Wallet</strong> (MetaMask, Rabby, OKX, etc.)
              </span>
            </p>
            <p className="wallet-info-step">
              <span className="step-number">2</span>
              <span className="step-text">
                <strong>Create Your Profile</strong> immediately after connecting
              </span>
            </p>
            <p className="wallet-info-step">
              <span className="step-number">3</span>
              <span className="step-text">
                <strong>Get Full Access</strong> to all exclusive Stellari Social features
              </span>
            </p>
          </div>
          <p className="wallet-info-note">
            💡 Don't have a wallet? Install MetaMask, Rabby, or OKX Wallet to get started!
          </p>
        </div>
        
        {connectionError && (
          <div className="wallet-connection-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{connectionError}</span>
          </div>
        )}
        
        <div className="wallet-modal-content-modern">
          {uniqueConnectors.map((connector) => {
            const available = isWalletAvailable(connector);
            const walletName = getWalletName(connector);
            const mobile = isMobile();
            const isConnecting = connectingWallet === walletName;
            
            return (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                className={`wallet-item-modern ${isConnecting ? 'connecting' : ''}`}
                disabled={isConnecting || isPending}
              >
                <div className="wallet-item-left">
                  <span className="wallet-item-icon">{getWalletIcon(connector.name)}</span>
                  <span className="wallet-item-name">{walletName}</span>
                </div>
                {isConnecting ? (
                  <span className="wallet-item-badge connecting">CONNECTING...</span>
                ) : (available || mobile) ? (
                  <span className="wallet-item-badge">INSTALLED</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WalletConnect;
