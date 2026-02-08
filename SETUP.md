# Quick Setup Guide

## Installation Steps

1. **Install Node.js** (if not installed)
   - Download from https://nodejs.org/
   - Choose LTS version
   - Verify: `node --version` and `npm --version`

2. **Navigate to project directory**
   ```bash
   cd sketch-canvas-enhanced
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Automatically opens at http://localhost:3000
   - Or manually open the URL

## First Time Usage

1. **Register an account**
   - Click "Register" on auth screen
   - Choose username and password
   - Click "Register" button

2. **Login**
   - Enter credentials
   - Click "Login"

3. **Create your first file**
   - Click "+ File" button in sidebar
   - Enter file name
   - Start sketching!

## Key Features to Try

### Table Editing
- Create table from toolbar
- Double-click cells to edit inline
- Right-click for media options
- Use toolbar for row/column management

### Voice Recording
- Right-click table cell
- Select "Start Voice Recording"
- Speak clearly
- Click "Stop Recording"
- Audio and transcript saved automatically

### PDF Import
- Click "Import" in toolbar
- Select PDF file
- Each page extracted with text
- Text is fully editable

### Animations
- Select any object
- Click "Animations" button
- Choose type and duration
- Click "Play All" to preview

### Drawing Recognition
- Use Draw tool
- Sketch with mouse or pen
- Right-click drawing
- Convert to text (OCR) or shape

## Troubleshooting

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm start
```

### Voice Recording Not Working
- Ensure HTTPS (required for microphone)
- Check browser permissions
- Use Chrome or Edge for best compatibility

### OCR Not Working
- Wait for Tesseract.js to load (~30 seconds first time)
- Check browser console for errors
- Ensure good image quality for best results

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core Features | ✅ | ✅ | ✅ | ✅ |
| Voice Recording | ✅ | ❌ | ⚠️ | ✅ |
| OCR | ✅ | ✅ | ✅ | ✅ |
| Pen Input | ✅ | ✅ | ✅ | ✅ |
| Cloud Sync | ✅ | ✅ | ✅ | ✅ |

✅ Full support | ⚠️ Partial support | ❌ Not supported

## Optional Backend Setup

For cloud sync, set up a backend server:

1. Create API endpoints (see README.md)
2. Update server URL in `src/utils/database.js`
3. Enable cloud sync in toolbar

## Need Help?

- Check README.md for full documentation
- Review browser console for errors
- Ensure all dependencies installed correctly
- Try in Chrome for best compatibility

---

Happy sketching! 🎨✨
