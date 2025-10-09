/**
 * Contract configuration utility
 * Ensures contract address is always available from environment variables
 */

import contractABI from '../contracts/SocialFeed.json';

// Get contract address from environment variable
const getContractAddress = () => {
  const address = process.env.REACT_APP_CONTRACT_ADDRESS;
  
  if (!address) {
    console.error('❌ REACT_APP_CONTRACT_ADDRESS is not set!');
    console.error('Please add it to your .env file or Vercel environment variables');
    throw new Error('Contract address not configured');
  }
  
  console.log('✅ Contract address loaded:', address);
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
    const address = getContractAddress();
    
    if (!address.startsWith('0x')) {
      throw new Error('Invalid contract address format');
    }
    
    if (address.length !== 42) {
      throw new Error('Invalid contract address length');
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
console.log('  Address:', process.env.REACT_APP_CONTRACT_ADDRESS);
console.log('  Chain ID:', process.env.REACT_APP_CHAIN_ID);
console.log('  RPC URL:', process.env.REACT_APP_HELIOS_RPC_URL);
