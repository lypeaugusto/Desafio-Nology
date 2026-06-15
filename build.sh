#!/bin/bash
# Build script that combines frontend and backend builds

echo "Building frontend..."
cd frontend
npm install
npm run build

# Copy built frontend to static directory
echo "Copying frontend build to static directory..."
mkdir -p ../static
rm -rf ../static/*
cp -r dist/* ../static/

cd ..
echo "Build completed successfully!"
