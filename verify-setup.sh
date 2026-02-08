#!/bin/bash

echo "🔍 Verifying Sketch Canvas Setup..."
echo ""

# Check Node.js
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js v14 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm --version)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found."
    exit 1
fi

echo ""
echo "📁 Checking file structure..."

# Check critical files
critical_files=(
    "index.html"
    "package.json"
    "src/main.jsx"
    "src/App.jsx"
    "src/components/Canvas.jsx"
    "src/components/Toolbar.jsx"
    "src/components/Sidebar.jsx"
    "src/hooks/useCanvas.js"
    "src/hooks/useAuth.js"
    "src/utils/canvasRenderers.js"
)

missing_files=()

for file in "${critical_files[@]}"
do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Warning: ${#missing_files[@]} critical file(s) missing!"
    echo "Please ensure all files are in the correct locations."
    exit 1
fi

echo ""
echo "📦 Checking dependencies..."

if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

echo ""
echo "✨ Setup verification complete!"
echo ""
echo "To start the app, run:"
echo "  npm start"
echo ""
