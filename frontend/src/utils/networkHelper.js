/**
 * Network Helper - Automatic Helios Testnet addition and switching
 */

import { heliosTestnet } from '../config/wagmi';

export const addHeliosNetwork = async () => {
  if (!window.ethereum) {
    console.error('No ethereum provider found');
    return false;
  }

  try {
    // Try to add the network
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
    return true;
  } catch (error) {
    console.error('❌ Error adding Helios Testnet:', error);
    return false;
  }
};

export const switchToHeliosNetwork = async () => {
  if (!window.ethereum) {
    console.error('No ethereum provider found');
    return false;
  }

  try {
    // Try to switch to Helios Testnet
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${heliosTestnet.id.toString(16)}` }],
    });
    
    console.log('✅ Switched to Helios Testnet');
    return true;
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      console.log('⚠️ Helios Testnet not found in wallet, adding it...');
      // Try to add the network
      return await addHeliosNetwork();
    }
    
    console.error('❌ Error switching to Helios Testnet:', error);
    return false;
  }
};

export const ensureHeliosNetwork = async () => {
  if (!window.ethereum) {
    console.error('No ethereum provider found');
    return false;
  }

  try {
    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);
    
    console.log('📡 Current chain ID:', currentChainId);
    console.log('🎯 Target chain ID:', heliosTestnet.id);
    
    // If already on Helios Testnet, do nothing
    if (currentChainId === heliosTestnet.id) {
      console.log('✅ Already on Helios Testnet');
      return true;
    }
    
    // Not on Helios Testnet, try to switch
    console.log('🔄 Not on Helios Testnet, attempting to switch...');
    return await switchToHeliosNetwork();
  } catch (error) {
    console.error('❌ Error checking network:', error);
    return false;
  }
};
