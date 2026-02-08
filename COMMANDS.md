# Step-by-Step Terminal Commands

Copy and paste these commands one at a time.

## Step 1: Navigate to Project
```bash
cd sketch-canvas-app
```

## Step 2: Install Dependencies
```bash
npm install
```
Wait for this to complete (may take 1-2 minutes).

## Step 3: Run Locally
```bash
npm run dev
```
Your browser should open to http://localhost:3000

Press Ctrl+C to stop the server when done.

---

## To Deploy to GitHub Pages

### First Time Setup

1. **Initialize Git**
```bash
git init
```

2. **Add all files**
```bash
git add .
```

3. **Create first commit**
```bash
git commit -m "Initial commit"
```

4. **Rename branch to main**
```bash
git branch -M main
```

5. **Connect to GitHub** (replace YOUR_USERNAME with your GitHub username)
```bash
git remote add origin https://github.com/YOUR_USERNAME/sketch-canvas-app.git
```

6. **Push to GitHub**
```bash
git push -u origin main
```

7. **Deploy to GitHub Pages**
```bash
npm run deploy
```

### After First Time (Making Updates)

1. **Save your changes**
```bash
git add .
git commit -m "Description of changes"
git push
```

2. **Deploy updates**
```bash
npm run deploy
```

---

## Useful Commands

### Check Node/npm versions
```bash
node --version
npm --version
```

### Clean install (if having issues)
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Build for production (without deploying)
```bash
npm run build
```

### Preview production build locally
```bash
npm run preview
```

### Check Git status
```bash
git status
```

### View Git commit history
```bash
git log --oneline
```

### Create new branch
```bash
git checkout -b feature-name
```

### Switch branches
```bash
git checkout main
```

---

## Troubleshooting Commands

### If port is busy
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### Clear npm cache
```bash
npm cache clean --force
```

### Update npm
```bash
npm install -g npm@latest
```

### Check for outdated packages
```bash
npm outdated
```

### Update all packages
```bash
npm update
```

---

## Git Configuration (First Time Only)

Set your name and email for commits:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Complete Workflow Example

```bash
# 1. Make changes to your code in src/App.jsx

# 2. Test locally
npm run dev
# Check if everything works, then press Ctrl+C

# 3. Build to verify no errors
npm run build

# 4. Commit changes
git add .
git commit -m "Added new feature"

# 5. Push to GitHub
git push

# 6. Deploy to GitHub Pages
npm run deploy

# Done! Changes are live in 1-2 minutes
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install | `npm install` |
| Run locally | `npm run dev` |
| Build | `npm run build` |
| Deploy | `npm run deploy` |
| Commit | `git add . && git commit -m "message"` |
| Push | `git push` |
| Status | `git status` |
| Stop server | `Ctrl+C` |

---

## Environment Check

Run this to verify everything is set up:
```bash
echo "Node version:" && node --version && echo "npm version:" && npm --version && echo "Git version:" && git --version
```

All three should show version numbers.

---

## Getting Help

If a command fails:
1. Read the error message carefully
2. Copy the error and search online
3. Check the SETUP_GUIDE.md file
4. Create a GitHub issue with the error

Most common fix:
```bash
rm -rf node_modules package-lock.json
npm install
```
