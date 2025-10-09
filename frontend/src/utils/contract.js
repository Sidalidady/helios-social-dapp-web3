/**
 * Contract configuration utility
 * Ensures contract address is always available from environment variables
 */

import contractABI from '../contracts/SocialFeed.json';

// Get contract address from environment variable with fallback
const getContractAddress = () => {
  // Try multiple ways to get the address (runtime config, build-time env, fallback)
  const address = (window.ENV_CONFIG && window.ENV_CONFIG.REACT_APP_CONTRACT_ADDRESS) ||
                  process.env.REACT_APP_CONTRACT_ADDRESS || 
                  '0x95D97F00b5979f3537E12c144E91E06658443377'; // Fallback to deployed address
  
  if (!address || address === 'undefined') {
    console.error('❌ REACT_APP_CONTRACT_ADDRESS is not set!');
    console.error('Using fallback address: 0x95D97F00b5979f3537E12c144E91E06658443377');
    return '0x95D97F00b5979f3537E12c144E91E06658443377';
  }
  
  console.log('✅ Contract address loaded:', address);
  console.log('   Source:', window.ENV_CONFIG ? 'Runtime Config' : 'Build-time Env');
  return address;
};

// Export contract data with address from env
export const contractData = {
  address: getContractAddress(),
  abi: contractABI.abi,
};

// Validate contract configuration on load
export const validateContractConfig = () => {
  try {
    const address = contractData.address;
    
    if (!address || !address.startsWith('0x')) {
      console.warn('⚠️ Invalid contract address format, using fallback');
      return false;
    }
    
    if (address.length !== 42) {
      console.warn('⚠️ Invalid contract address length, using fallback');
      return false;
    }
    
    console.log('✅ Contract configuration valid');
    return true;
  } catch (error) {
    console.error('❌ Contract configuration error:', error);
    return false;
  }
};

// Log contract info for debugging
console.log('📝 Contract Configuration:');
console.log('  Address:', contractData.address);
console.log('  Chain ID:', process.env.REACT_APP_CHAIN_ID || '42000');
console.log('  RPC URL:', process.env.REACT_APP_HELIOS_RPC_URL || 'https://testnet1.helioschainlabs.org');
console.log('  Environment:', process.env.NODE_ENV);

// Validate on load
validateContractConfig();
