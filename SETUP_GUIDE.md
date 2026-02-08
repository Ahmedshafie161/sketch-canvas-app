# Setup and Deployment Guide

## 🚀 Quick Start (Local Development)

### Step 1: Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/ (LTS version recommended)
- Verify installation: `node --version` and `npm --version`

### Step 2: Extract and Navigate
```bash
# Navigate to the project folder
cd sketch-canvas-app

# Install dependencies
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```

Your app will open at `http://localhost:3000`

## 📦 Building for Production

```bash
npm run build
```

This creates optimized files in the `dist` folder.

## 🌐 Deploy to GitHub Pages

### Method 1: Automatic Deployment

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Name it `sketch-canvas-app` (or any name)
   - Don't initialize with README
   - Click "Create repository"

2. **Update Configuration**
   - Open `vite.config.js`
   - Change `base: '/sketch-canvas-app/'` to match your repo name
   - If repo is `my-sketch-app`, use `base: '/my-sketch-app/'`

3. **Initialize Git and Push**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sketch-canvas-app.git
   git push -u origin main
   ```

4. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings
   - Click "Pages" in sidebar
   - Under "Source", select `gh-pages` branch
   - Click "Save"
   - Wait 1-2 minutes

6. **Access Your App**
   - URL: `https://YOUR_USERNAME.github.io/sketch-canvas-app/`

### Method 2: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

3. Create `gh-pages` branch:
   ```bash
   git checkout -b gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. Enable in Settings > Pages

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use
Edit `vite.config.js` and change the port:
```javascript
server: {
  port: 3001, // Change to any available port
  open: true
}
```

### GitHub Pages shows 404
- Ensure `base` in `vite.config.js` matches your repo name
- Check that GitHub Pages is enabled in repository settings
- Wait a few minutes for deployment to complete

### LocalStorage not working
- Ensure you're not in incognito/private mode
- Check browser settings allow local storage
- Clear browser cache and try again

## 📝 Development Tips

### Hot Reload
Vite supports hot module replacement. Just save your files and changes appear instantly.

### Debugging
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension for component debugging

### Adding Features
All main code is in `src/App.jsx`. Key sections:
- **Authentication**: Lines 1-100
- **File Management**: Lines 100-200
- **Canvas Tools**: Lines 200-400
- **Rendering**: Lines 400-end

## 🎨 Customization

### Change Colors
Edit the gradient in App.jsx:
```javascript
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
// Change to your preferred colors
```

### Add New Shapes
Add to the `createObject` function around line 250.

### Modify Storage
Currently uses localStorage. To use a database:
1. Replace `localStorage.setItem/getItem` calls
2. Add API endpoints
3. Update authentication logic

## 🔐 Security Notes

- Passwords are stored in plain text in localStorage
- For production, implement proper backend authentication
- Use HTTPS when deploying
- Consider adding password hashing

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## 🆘 Getting Help

1. Check the README.md
2. Review error messages in browser console
3. Search GitHub issues
4. Create new issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS info

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [GitHub Pages Guide](https://pages.github.com)
- [MDN Web Docs](https://developer.mozilla.org)
