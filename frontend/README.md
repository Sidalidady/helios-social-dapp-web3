# Helios Social Frontend

React-based frontend for the Helios Social decentralized platform.

## Tech Stack

- **React 18** - UI framework
- **Wagmi v2** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Lucide React** - Icon library

## Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create `.env` file:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_HELIOS_RPC_URL=https://testnet1.helioschainlabs.org
REACT_APP_CHAIN_ID=42000
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # React components
│   ├── Header.js    # Navigation and wallet
│   ├── CreatePost.js # Post creation
│   ├── Feed.js      # Post feed
│   └── Post.js      # Individual post
├── config/          # Configuration
│   └── wagmi.js     # Web3 config
├── utils/           # Utilities
│   ├── ipfs.js      # IPFS functions
│   └── formatters.js # Helper functions
├── contracts/       # Contract ABIs (auto-generated)
├── App.js          # Main app
└── index.js        # Entry point
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features

### Wallet Connection
Uses Wagmi for MetaMask integration with automatic network switching.

### Post Creation
- 280 character limit
- Real-time counter
- IPFS upload
- Loading states

### Feed Display
- Paginated posts
- Real-time updates
- Like/unlike
- Auto-refresh

### Responsive Design
Mobile-first design with breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Customization

### Styling
Edit CSS files in `src/components/` for component-specific styles.

Global styles in `src/index.css` and `src/App.css`.

### Theme Colors
Update color variables:
```css
/* Primary */
--primary: #60a5fa;
--primary-dark: #3b82f6;

/* Background */
--bg-primary: #0a0e27;
--bg-secondary: #1a1f3a;
```

### IPFS Configuration
For production, update `src/utils/ipfs.js` with Pinata credentials:

```javascript
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET = process.env.REACT_APP_PINATA_SECRET_KEY;
```

## Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=build
```

### IPFS
```bash
npm run build
ipfs add -r build
```

## Troubleshooting

### "Contract not found"
Ensure contract address is correct in `.env`

### "Network error"
Check Helios RPC URL and network configuration

### "Wallet not connecting"
Ensure MetaMask is installed and Helios Testnet is added

## Contributing

See main [README.md](../README.md) for contribution guidelines.

## License

MIT
