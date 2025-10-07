import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Helios Testnet configuration
export const heliosTestnet = {
  id: 42000,
  name: 'Helios Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Helios',
    symbol: 'HLS',
  },
  rpcUrls: {
    default: { http: [process.env.REACT_APP_HELIOS_RPC_URL || 'https://testnet1.helioschainlabs.org'] },
    public: { http: [process.env.REACT_APP_HELIOS_RPC_URL || 'https://testnet1.helioschainlabs.org'] },
  },
  blockExplorers: {
    default: { name: 'Helios Explorer', url: 'https://explorer.helioschainlabs.org' },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [heliosTestnet],
  connectors: [
    injected({
      target: 'metaMask',
      shimDisconnect: true,
    }),
    injected({
      target: 'rabby',
      shimDisconnect: true,
    }),
    injected({
      target: 'okxWallet',
      shimDisconnect: true,
    }),
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [heliosTestnet.id]: http(),
  },
});
