#!/bin/bash
# Build script for Render

cd "$(dirname "$0")" || exit 1

# Install Python dependencies
pip install -r requirements.txt

# Build frontend
cd ../frontend
npm install
npm run build
cd ..

echo "Build completed!"
