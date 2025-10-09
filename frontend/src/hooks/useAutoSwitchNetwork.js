import { useEffect } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { heliosTestnet } from '../config/wagmi';

/**
 * Automatically switch to Helios Testnet when wallet connects
 */
export function useAutoSwitchNetwork() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const switchToHelios = async () => {
      // Only switch if connected and not already on Helios Testnet
      if (isConnected && address && chainId !== heliosTestnet.id) {
        console.log('🔄 Wrong network detected. Current:', chainId, 'Expected:', heliosTestnet.id);
        console.log('🔄 Switching to Helios Testnet...');
        
        try {
          await switchChain({ chainId: heliosTestnet.id });
          console.log('✅ Successfully switched to Helios Testnet');
        } catch (error) {
          console.error('❌ Failed to switch network:', error);
          
          // If network doesn't exist in wallet, try to add it
          if (error.code === 4902 || error.message?.includes('Unrecognized chain')) {
            console.log('📝 Network not found in wallet. Attempting to add...');
            await addHeliosNetwork();
          } else {
            // Show user-friendly error
            alert('Please switch to Helios Testnet manually in your wallet.');
          }
        }
      } else if (isConnected && chainId === heliosTestnet.id) {
        console.log('✅ Already on Helios Testnet');
      }
    };

    switchToHelios();
  }, [isConnected, address, chainId, switchChain]);
}

/**
 * Add Helios Testnet to wallet if it doesn't exist
 */
async function addHeliosNetwork() {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet detected');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${heliosTestnet.id.toString(16)}`, // Convert to hex
          chainName: heliosTestnet.name,
          nativeCurrency: heliosTestnet.nativeCurrency,
          rpcUrls: [heliosTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: [heliosTestnet.blockExplorers.default.url],
        },
      ],
    });

    console.log('✅ Helios Testnet added to wallet');
    alert('Helios Testnet has been added to your wallet!');
  } catch (error) {
    console.error('❌ Failed to add network:', error);
    
    if (error.code === 4001) {
      // User rejected
      alert('You rejected adding Helios Testnet. Please add it manually to use the DApp.');
    } else {
      alert('Failed to add Helios Testnet. Please add it manually in your wallet settings.');
    }
  }
}
