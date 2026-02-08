# SketchSpace - Canvas Tool

A powerful sketch canvas application with file management, drawing tools, and rich tables.

## Features

- 🎨 **Drawing Tools**: Rectangle, Circle, Triangle, Text, Freehand Drawing
- 📊 **Rich Tables**: Tables with nested tables, images, and videos in cells
- 🔗 **Connections**: Connect shapes with arrows
- 📁 **File Management**: Organize your sketches in folders
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 💾 **Import/Export**: Save and load your work, import OneNote files
- 🔒 **Authentication**: User accounts with local storage

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
sketch-canvas/
├── public/
├── src/
│   ├── components/        # React components
│   │   ├── AuthScreen.jsx
│   │   ├── Canvas.jsx
│   │   ├── ContextMenus.jsx
│   │   ├── Sidebar.jsx
│   │   └── Toolbar.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useCanvas.js
│   │   ├── useCanvasHandlers.js
│   │   ├── useDarkMode.js
│   │   └── useFileSystem.js
│   ├── utils/            # Utility functions
│   │   ├── canvasRenderers.js
│   │   ├── canvasStyles.js
│   │   └── tableRenderer.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html
└── package.json
```

## Usage

### Getting Started

1. **Register/Login**: Create an account or log in
2. **Create a File**: Click the "File" button in the sidebar
3. **Select a Tool**: Choose from Rectangle, Circle, Triangle, Text, Draw, Table, or Connect
4. **Draw**: Click and drag on the canvas to create shapes
5. **Edit**: Double-click objects to edit text
6. **Save**: Click the Save button to save your work

### Drawing Tools

- **Select**: Move and resize objects
- **Rectangle/Circle/Triangle**: Draw basic shapes
- **Text**: Add text boxes
- **Draw**: Freehand drawing
- **Table**: Create rich tables with media support
- **Connect**: Create arrows between shapes

### Table Features

- **Click cells** to edit text
- **Right-click cells** to add images, videos, or nested tables
- **Double-click cells** to resize them

### Keyboard Shortcuts

- **Delete**: Remove selected object
- **Ctrl/Cmd + Mouse Wheel**: Zoom in/out
- **Arrow Keys**: Pan the canvas

## Technologies

- React 18
- Lucide React (icons)
- LocalStorage (data persistence)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT
