# Setup and Troubleshooting Guide

## Complete Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step-by-Step Setup

1. **Navigate to the project directory**
   ```bash
   cd sketch-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser to `http://localhost:3000`
   - The app should load automatically

## Common Issues and Solutions

### Issue: Blank/Empty Page

**Possible Causes:**
1. Missing dependencies
2. Incorrect file structure
3. Build errors
4. Browser cache

**Solutions:**

1. **Check browser console**
   - Press F12 to open DevTools
   - Look for error messages in the Console tab
   - Look for failed network requests in the Network tab

2. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

4. **Check if server is running**
   - Make sure `npm start` completed without errors
   - Look for message "webpack compiled successfully"

5. **Verify file structure**
   ```
   sketch-canvas/
   ├── public/
   │   └── sketch-icon.svg
   ├── src/
   │   ├── components/
   │   ├── hooks/
   │   ├── utils/
   │   ├── App.jsx
   │   └── main.jsx
   ├── index.html
   └── package.json
   ```

### Issue: Module Not Found Errors

**Solution:**
```bash
npm install react react-dom lucide-react react-scripts
```

### Issue: Build Fails

1. **Check Node version**
   ```bash
   node --version
   ```
   Should be v14 or higher

2. **Update react-scripts**
   ```bash
   npm install react-scripts@latest
   ```

### Issue: App works but features don't work

1. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - Clear if needed

2. **Try in incognito/private mode**
   - Rules out extension conflicts

## Debugging Tips

### Enable Verbose Logging

Add to the top of `src/App.jsx`:
```javascript
console.log('App loaded');
```

### Check React DevTools

1. Install React DevTools browser extension
2. Open DevTools
3. Click "Components" tab
4. Inspect component tree

### Verify Imports

Make sure all imports have correct paths:
```javascript
// Correct
import Canvas from './components/Canvas';

// Wrong (missing ./)
import Canvas from 'components/Canvas';
```

## Development Workflow

1. **Make changes to code**
2. **Save file** (Ctrl+S / Cmd+S)
3. **Wait for hot reload** (browser updates automatically)
4. **If hot reload fails**: Refresh browser

## Production Build

To create an optimized production build:

```bash
npm run build
```

This creates a `build/` folder with optimized files ready for deployment.

### Serve Production Build Locally

```bash
npm install -g serve
serve -s build
```

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not supported:**
- Internet Explorer

## Performance Tips

1. **Limit canvas objects**
   - For best performance, keep objects under 100 per file

2. **Optimize images in tables**
   - Use compressed images
   - Resize large images before uploading

3. **Regular cleanup**
   - Delete unused files
   - Clear localStorage occasionally

## Getting Help

If you're still experiencing issues:

1. **Check the console for errors**
   - Copy any error messages

2. **Verify file structure matches the guide**

3. **Try a fresh install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

4. **Test in different browser**
   - Rules out browser-specific issues

## Advanced Configuration

### Change Port

Create `.env` file:
```
PORT=3001
```

### Enable HTTPS in Development

In `.env`:
```
HTTPS=true
```

## Security Notes

- Data is stored in browser localStorage
- No server-side storage
- Clear localStorage to reset all data
- Export important work regularly

## Data Management

### Backup Your Data

1. Open DevTools (F12)
2. Application → Local Storage
3. Copy all `canvas_*` and `canvasAuth` keys
4. Save to a file

### Restore Data

1. Open DevTools
2. Application → Local Storage  
3. Paste saved data

### Export All Work

Use the Export button on each file to save as JSON.
