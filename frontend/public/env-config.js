// Runtime environment configuration for Vercel
// This file is loaded before React app starts
// IMPORTANT: API keys should be set in Vercel environment variables
// Note: This file runs in the browser, so process.env is not available
// Environment variables are injected during build time by Create React App
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0x871f6b513172b39B2069592f91f17895818BF393',
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  // API keys will be injected by build process or can be set here for local development
  REACT_APP_PINATA_API_KEY: '',
  REACT_APP_PINATA_SECRET_KEY: '',
};

console.log('🔧 Runtime ENV Config Loaded:', {
  CONTRACT_ADDRESS: window.ENV_CONFIG.REACT_APP_CONTRACT_ADDRESS,
  HELIOS_RPC_URL: window.ENV_CONFIG.REACT_APP_HELIOS_RPC_URL,
  CHAIN_ID: window.ENV_CONFIG.REACT_APP_CHAIN_ID,
  IPFS_GATEWAY: window.ENV_CONFIG.REACT_APP_IPFS_GATEWAY,
  PINATA_API_KEY: window.ENV_CONFIG.REACT_APP_PINATA_API_KEY ? '***' : 'not set',
  PINATA_SECRET_KEY: window.ENV_CONFIG.REACT_APP_PINATA_SECRET_KEY ? '***' : 'not set',
});
