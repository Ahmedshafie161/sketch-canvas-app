# 🚀 QUICK START GUIDE - SketchSpace Canvas

## For Complete Beginners

### What You Need
1. **Node.js** - Download from https://nodejs.org/ (choose LTS version)
2. **A code editor** - VS Code recommended: https://code.visualstudio.com/
3. **Git** (for GitHub) - Download from https://git-scm.com/

### Run Locally in 3 Steps

#### Windows Users:
1. Double-click `start.bat`
2. Wait for installation
3. Browser opens automatically!

#### Mac/Linux Users:
1. Open Terminal in project folder
2. Run: `./start.sh`
3. Browser opens automatically!

#### Manual Method (All Systems):
```bash
npm install
npm run dev
```

Open browser to: http://localhost:3000

---

## Deploy to GitHub Pages

### Option 1: Automatic (Recommended)

1. **Create GitHub account** at https://github.com

2. **Create new repository**
   - Click the "+" icon → "New repository"
   - Name it: `sketch-canvas-app`
   - Leave everything else default
   - Click "Create repository"

3. **Update the repo name in code**
   - Open `vite.config.js`
   - Change line 6: `base: '/sketch-canvas-app/'`
   - If your repo name is different, use that name

4. **Push your code** (run these commands in terminal):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sketch-canvas-app.git
   git push -u origin main
   ```

5. **Enable GitHub Pages**
   - Go to repository → Settings → Pages
   - Under "Build and deployment"
   - Source: Select "GitHub Actions"
   - Save and wait 2-3 minutes

6. **Your app is live!**
   - URL: `https://YOUR_USERNAME.github.io/sketch-canvas-app/`

### Option 2: Simple Deploy Command

After step 4 above, just run:
```bash
npm run deploy
```

Then enable GitHub Pages (step 5).

---

## Common Issues & Solutions

### "node is not recognized"
- Node.js not installed or not in PATH
- **Fix**: Install Node.js from https://nodejs.org/
- Restart terminal/computer after installation

### "npm install" fails
- Delete `node_modules` folder
- Delete `package-lock.json` file
- Run `npm install` again

### GitHub Pages shows blank page
- Check `base` in `vite.config.js` matches your repo name exactly
- Wait 5 minutes after deploying
- Clear browser cache (Ctrl+F5)
- Check GitHub Actions tab for build errors

### Port 3000 already in use
- Another app is using that port
- **Fix**: Edit `vite.config.js`, change port to 3001 or 3002

### Can't push to GitHub
- Make sure you replaced `YOUR_USERNAME` with your actual GitHub username
- Check you're logged into Git: `git config user.name`
- Try: `git remote set-url origin https://github.com/YOUR_USERNAME/sketch-canvas-app.git`

---

## File Structure Explained

```
sketch-canvas-app/
├── src/
│   ├── App.jsx          ← Main app code (edit this for features)
│   └── main.jsx         ← Entry point (don't touch)
├── public/              ← Static files (images, icons)
├── index.html           ← HTML template
├── package.json         ← Dependencies list
├── vite.config.js       ← Build settings (change base here)
├── start.bat            ← Windows quick start
├── start.sh             ← Mac/Linux quick start
└── README.md            ← Documentation
```

---

## Customization Quick Tips

### Change App Colors
Edit `src/App.jsx`, search for:
```javascript
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```
Replace with your colors!

### Change App Name
1. Edit `index.html` - change `<title>` tag
2. Edit `package.json` - change `"name"` field

### Add Your Logo
1. Replace `public/sketch-icon.svg` with your icon
2. Keep the filename the same OR update `index.html`

---

## Testing Your App

### Local Testing
```bash
npm run dev
```
- Open http://localhost:3000
- Try all features
- Check browser console (F12) for errors

### Production Testing
```bash
npm run build
npm run preview
```
- Tests the built version
- Open http://localhost:4173

---

## Need Help?

1. **Check SETUP_GUIDE.md** - Detailed troubleshooting
2. **Check README.md** - Full documentation
3. **Browser Console** - Press F12, look for red errors
4. **GitHub Issues** - Create an issue with error details

---

## Next Steps

✅ App running locally? Great!
✅ Pushed to GitHub? Excellent!
✅ Enabled GitHub Pages? Perfect!

Now you can:
- Share your app link with friends
- Customize the design
- Add new features
- Make it your own!

**Your live app URL format:**
```
https://YOUR_USERNAME.github.io/sketch-canvas-app/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Commands Cheat Sheet

```bash
# Development
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview production build

# Deployment
npm run deploy      # Deploy to GitHub Pages

# Git
git add .           # Stage all changes
git commit -m "msg" # Commit changes
git push            # Push to GitHub
git status          # Check status
```

---

## Tips for Success

1. **Always test locally first** - Run `npm run dev` before deploying
2. **Check build works** - Run `npm run build` to catch errors
3. **Use Git regularly** - Commit often with clear messages
4. **Keep backups** - Download your project folder regularly
5. **Read error messages** - They usually tell you what's wrong!

---

## Contact & Support

- **Bug Reports**: Create GitHub issue
- **Questions**: Check documentation files
- **Contributions**: Pull requests welcome!

Happy sketching! 🎨✨
