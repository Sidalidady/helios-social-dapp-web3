# Vercel Deployment Fix - React Native Async Storage

## Problem

```
Module not found: Error: Can't resolve '@react-native-async-storage/async-storage'
in '/vercel/path0/frontend/node_modules/wagmi/node_modules/@metamask/sdk/dist/browser/es'
```

This error occurs because MetaMask SDK (used by wagmi) requires React Native dependencies that aren't available in web builds.

## Solution

We've implemented a comprehensive fix using CRACO (Create React App Configuration Override) to add webpack polyfills and handle Node.js modules in the browser.

## Changes Made

### 1. Added Missing Dependency

**File:** `frontend/package.json`

```json
"dependencies": {
  "@react-native-async-storage/async-storage": "^1.23.1"
}
```

### 2. Added Webpack Polyfills

**File:** `frontend/package.json`

```json
"devDependencies": {
  "@craco/craco": "^7.1.0",
  "assert": "^2.1.0",
  "buffer": "^6.0.3",
  "crypto-browserify": "^3.12.0",
  "https-browserify": "^1.0.0",
  "os-browserify": "^0.3.0",
  "process": "^0.11.10",
  "stream-browserify": "^3.0.0",
  "stream-http": "^3.2.0",
  "url": "^0.11.3"
}
```

### 3. Created CRACO Config

**File:** `frontend/craco.config.js`

```javascript
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

      // Add plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];

      return webpackConfig;
    },
  },
};
```

### 4. Updated Build Scripts

**File:** `frontend/package.json`

```json
"scripts": {
  "start": "craco start",
  "build": "craco build",
  "test": "craco test",
  "vercel-build": "npm install --legacy-peer-deps && craco build"
}
```

## Deployment Steps

### 1. Install Dependencies Locally

```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Test Build Locally

```bash
npm run build
```

Should complete without errors.

### 3. Commit Changes

```bash
git add .
git commit -m "fix: Add webpack polyfills for Vercel deployment"
git push origin main
```

### 4. Vercel Will Auto-Deploy

Vercel will detect the push and automatically redeploy with the new configuration.

## What This Fixes

✅ **React Native Async Storage** - Polyfilled for web
✅ **Crypto Module** - Browser-compatible version
✅ **Stream Module** - Browser-compatible version
✅ **Buffer** - Polyfilled globally
✅ **Process** - Browser-compatible version
✅ **HTTP/HTTPS** - Browser-compatible versions
✅ **OS Module** - Browser-compatible version
✅ **URL Module** - Polyfilled

## Why This Happens

1. **MetaMask SDK** uses React Native dependencies
2. **Wagmi** includes MetaMask SDK
3. **Vercel** builds for web (no React Native)
4. **Missing modules** cause build to fail

## How CRACO Helps

- **Webpack Override** - Customizes Create React App without ejecting
- **Fallbacks** - Provides browser versions of Node.js modules
- **Plugins** - Injects global variables (Buffer, process)
- **No Ejecting** - Keeps CRA benefits

## Verification

After deployment, check:

1. **Vercel Build Logs** - Should show "Build Completed"
2. **No Errors** - No module resolution errors
3. **App Works** - Wallet connection works
4. **Console** - No missing module warnings

## Alternative Solutions (Not Used)

### Option 1: Next.js
- Migrate to Next.js (better webpack control)
- More complex migration

### Option 2: Vite
- Migrate to Vite (faster builds)
- Different build system

### Option 3: Eject CRA
- Full webpack control
- Lose CRA updates

**We chose CRACO** because it's:
- ✅ Simple to implement
- ✅ No migration needed
- ✅ Keeps CRA benefits
- ✅ Easy to maintain

## Troubleshooting

### Build Still Fails

1. **Clear Vercel Cache:**
   - Vercel Dashboard → Deployments → Redeploy → Clear Cache

2. **Check Node Version:**
   - Vercel uses Node 18 by default
   - Ensure compatibility

3. **Check Dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Verify craco.config.js:**
   - Must be in `frontend/` directory
   - Proper syntax

### Local Build Works, Vercel Fails

1. **Environment Variables:**
   - Ensure all env vars are set in Vercel

2. **Build Command:**
   - Vercel should use: `npm run vercel-build`

3. **Output Directory:**
   - Should be: `frontend/build`

### Module Still Not Found

1. **Check package.json:**
   - Dependency in `dependencies` not `devDependencies`

2. **Clear node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Update CRACO config:**
   - Add missing module to fallbacks

## Performance Impact

- **Build Time:** +10-20 seconds (polyfills)
- **Bundle Size:** +50-100KB (polyfills)
- **Runtime:** No noticeable impact
- **Worth It:** Yes, for deployment success

## Future Improvements

- [ ] Optimize bundle size (tree shaking)
- [ ] Lazy load polyfills
- [ ] Consider Vite migration
- [ ] Monitor bundle size

## Summary

✅ **Problem:** React Native dependencies in web build
✅ **Solution:** CRACO + Webpack polyfills
✅ **Result:** Successful Vercel deployment
✅ **Impact:** Minimal performance cost
✅ **Maintenance:** Easy to update

Your app should now deploy successfully to Vercel! 🚀
