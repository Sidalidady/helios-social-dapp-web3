import React, { useState, useEffect } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { heliosTestnet } from '../config/wagmi';
import './NetworkSwitcher.css';

function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if not on Helios Testnet
    if (chainId && chainId !== heliosTestnet.id) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [chainId]);

  const handleSwitch = async () => {
    try {
      await switchChain({ chainId: heliosTestnet.id });
    } catch (error) {
      console.error('Failed to switch network:', error);
      
      // Try to add network if it doesn't exist
      if (error.code === 4902 || error.message?.includes('Unrecognized chain')) {
        await addHeliosNetwork();
      }
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="network-switcher-banner">
      <div className="network-switcher-content">
        <AlertTriangle size={20} />
        <span>Wrong Network! Please switch to Helios Testnet</span>
        <button 
          onClick={handleSwitch}
          disabled={isPending}
          className="network-switch-btn"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="spinning" />
              Switching...
            </>
          ) : (
            <>
              Switch Network
            </>
          )}
        </button>
      </div>
    </div>
  );
}

async function addHeliosNetwork() {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${heliosTestnet.id.toString(16)}`,
          chainName: heliosTestnet.name,
          nativeCurrency: heliosTestnet.nativeCurrency,
          rpcUrls: [heliosTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: [heliosTestnet.blockExplorers.default.url],
        },
      ],
    });

    console.log('✅ Helios Testnet added to wallet');
  } catch (error) {
    console.error('❌ Failed to add network:', error);
  }
}

export default NetworkSwitcher;
