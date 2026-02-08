#!/bin/bash

echo "===================================="
echo " SketchSpace Canvas - Quick Start"
echo "===================================="
echo ""

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "===================================="
echo " Installation complete!"
echo "===================================="
echo ""
echo "Starting development server..."
echo "Your browser will open automatically."
echo ""
echo "Press Ctrl+C to stop the server."
echo "===================================="
echo ""

npm run dev
