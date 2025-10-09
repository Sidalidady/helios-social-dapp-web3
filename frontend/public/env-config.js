// Runtime environment configuration for Vercel
// This file is loaded before React app starts
// IMPORTANT: API keys should be set in Vercel environment variables
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0xc766AB519087D9f755b33B1694f336aAfb9183b9',
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  REACT_APP_PINATA_API_KEY: process.env.REACT_APP_PINATA_API_KEY || '',
  REACT_APP_PINATA_SECRET_KEY: process.env.REACT_APP_PINATA_SECRET_KEY || '',
};

console.log('🔧 Runtime ENV Config Loaded (API keys hidden):', {
  ...window.ENV_CONFIG,
  REACT_APP_PINATA_API_KEY: window.ENV_CONFIG.REACT_APP_PINATA_API_KEY ? '***' : 'not set',
  REACT_APP_PINATA_SECRET_KEY: window.ENV_CONFIG.REACT_APP_PINATA_SECRET_KEY ? '***' : 'not set',
});
