// Runtime environment configuration for Vercel
// This file is loaded before React app starts
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0x95D97F00b5979f3537E12c144E91E06658443377',
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://ipfs.io/ipfs/', // CORS-friendly gateway
};

console.log('🔧 Runtime ENV Config Loaded:', window.ENV_CONFIG);
