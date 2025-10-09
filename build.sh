#!/bin/bash
set -e

echo "Installing dependencies..."
cd frontend
npm install --legacy-peer-deps

echo "Building application..."
export DISABLE_ESLINT_PLUGIN=true
export SKIP_PREFLIGHT_CHECK=true
export CI=false
npm run build

echo "Build complete!"
