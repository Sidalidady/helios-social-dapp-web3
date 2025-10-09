// Runtime environment configuration for Vercel
// This file is loaded before React app starts
window.ENV_CONFIG = {
  REACT_APP_CONTRACT_ADDRESS: '0xc766AB519087D9f755b33B1694f336aAfb9183b9',
  REACT_APP_HELIOS_RPC_URL: 'https://testnet1.helioschainlabs.org',
  REACT_APP_CHAIN_ID: '42000',
  REACT_APP_IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  REACT_APP_PINATA_API_KEY: 'f8b93aafa4702b362db1',
  REACT_APP_PINATA_SECRET_KEY: '7c4d883a53b7d625746e7c45ef5afc0c2e3a87140d731e58895f77b0e00a81fc',
};

console.log('🔧 Runtime ENV Config Loaded:', window.ENV_CONFIG);
