import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Helios Testnet RPC URL with fallback
const HELIOS_RPC_URL = process.env.REACT_APP_HELIOS_RPC_URL || 'https://testnet1.helioschainlabs.org';

console.log('🔧 Wagmi Config - Helios RPC URL:', HELIOS_RPC_URL);

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
    default: { http: [HELIOS_RPC_URL] },
    public: { http: [HELIOS_RPC_URL] },
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
    }),
    injected({
      target: 'rabby',
    }),
    injected({
      target: 'okxWallet',
    }),
    injected(),
  ],
  transports: {
    [heliosTestnet.id]: http(),
  },
  ssr: false,
  multiInjectedProviderDiscovery: false,
});
