# Quick Start Guide - SketchSpace Canvas Tool

## 🚀 Getting Started (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm start
```

Open `http://localhost:3000` in your browser!

## 📁 Project Structure

```
sketch-canvas/
├── public/
│   └── sketch-icon.svg          # App icon
├── src/
│   ├── components/              # UI Components
│   │   ├── AuthScreen.jsx      # Login/Register screen
│   │   ├── Canvas.jsx          # Main canvas area
│   │   ├── ContextMenus.jsx    # Right-click menus
│   │   ├── Sidebar.jsx         # File/folder sidebar
│   │   └── Toolbar.jsx         # Top toolbar
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.js          # Authentication logic
│   │   ├── useCanvas.js        # Canvas state & handlers (MAIN HOOK)
│   │   ├── useCanvasHandlers.js # Object manipulation
│   │   ├── useDarkMode.js      # Dark mode toggle
│   │   └── useFileSystem.js    # File/folder management
│   │
│   ├── utils/                   # Helper Functions
│   │   ├── canvasRenderers.js  # Render objects on canvas
│   │   ├── canvasStyles.js     # Styling helpers
│   │   └── tableRenderer.js    # Render table objects
│   │
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
│
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── README.md                    # Full documentation
├── SETUP.md                     # Detailed setup guide
└── verify-setup.sh             # Setup verification script

```

## 🎯 Key Features

### Drawing Tools
- **Select** - Move and resize objects
- **Rectangle, Circle, Triangle** - Basic shapes
- **Text** - Add text boxes
- **Draw** - Freehand drawing
- **Table** - Create rich tables
- **Connect** - Link shapes with arrows

### Table Features
- Click cells to edit text
- Right-click cells to add:
  - 📷 Images
  - 🎥 Videos  
  - 📊 Nested tables
- Double-click cells to resize

### File Management
- Create folders
- Organize files in hierarchy
- Drag & drop files/folders
- Export/Import canvas data
- Import OneNote files

## 🔧 Architecture Overview

### Data Flow

```
User Interaction
    ↓
Toolbar/Canvas (Components)
    ↓
useCanvas Hook (State Management)
    ↓
Canvas Renderers (Rendering)
    ↓
Display on Screen
```

### State Management

All managed through custom hooks:
- `useAuth` - User authentication
- `useCanvas` - Canvas objects, tools, connections
- `useFileSystem` - Files and folders
- `useDarkMode` - Theme preference

### Storage

- **LocalStorage** for all data persistence
- Keys:
  - `canvasAuth` - Current user session
  - `canvasUsers` - User credentials
  - `canvas_{username}` - User's files and folders
  - `darkMode` - Theme preference

## 🐛 Troubleshooting

### Empty/Blank Page?

1. **Check browser console** (F12) for errors
2. **Clear cache** (Ctrl+Shift+R)
3. **Reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

### Can't see my work?

- Work is saved per user account
- Make sure you're logged in as the correct user
- Check Application → Local Storage in DevTools

### Objects not appearing?

- Make sure a file is open
- Try selecting the "Select" tool
- Check console for JavaScript errors

## 💡 Tips

1. **Save regularly** - Click the Save button after making changes
2. **Export important work** - Use Export to backup as JSON
3. **Use keyboard shortcuts**:
   - Delete key - Remove selected object
   - Ctrl + Mouse Wheel - Zoom
   - Arrow keys - Pan canvas

## 🔐 User Accounts

- Stored locally in browser
- Each user has separate workspace
- No server/cloud storage
- To reset: Clear localStorage

## 📝 First Time Use

1. **Register** an account
2. **Create a folder** (optional)
3. **Create a file**
4. **Select a tool** from toolbar
5. **Start drawing!**

## 🎨 Customization

### Change Default Theme
Edit `src/hooks/useDarkMode.js`:
```javascript
const [darkMode, setDarkMode] = useState(true); // Start with dark mode
```

### Change Canvas Background
Edit `src/utils/canvasStyles.js`

### Add New Tools
1. Add tool to `Toolbar.jsx`
2. Handle tool logic in `useCanvas.js`
3. Add renderer in `canvasRenderers.js`

## 📚 Further Reading

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup and troubleshooting
- Component files - Well-commented code

## 🆘 Still Having Issues?

1. Run verification script:
   ```bash
   ./verify-setup.sh
   ```

2. Check `SETUP.md` for detailed troubleshooting

3. Verify Node.js version:
   ```bash
   node --version  # Should be v14+
   ```

---

**Happy Sketching! 🎨**
