# SketchSpace - Canvas Tool

A comprehensive sketch canvas application with authentication, file management, drawing tools, and shape creation.

## Features

- ✅ **Authentication System** - Secure login/registration with username and password
- ✅ **Local Storage** - All data persisted in browser localStorage
- ✅ **Shape Tools** - Rectangle, square, circle, triangle
- ✅ **Advanced Tables** - Support for images, GIFs, videos, and nested tables
- ✅ **Drawing Tool** - Freehand drawing with pen
- ✅ **AI Features** - Convert drawings to shapes or text
- ✅ **File Management** - Organized folder/file structure
- ✅ **Import/Export** - Save and load canvas files in JSON format
- ✅ **OneNote Import** - Import and edit OneNote exports

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/sketch-canvas-app.git
cd sketch-canvas-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploying to GitHub Pages

1. Update the `base` field in `vite.config.js` to match your repository name:
```javascript
base: '/your-repo-name/',
```

2. Build and deploy:
```bash
npm run deploy
```

This will build the app and push it to the `gh-pages` branch.

3. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "gh-pages" branch as source
   - Save

Your app will be available at: `https://YOUR_USERNAME.github.io/sketch-canvas-app/`

## Usage Guide

### Getting Started
1. **Register** - Create a new account with username and password
2. **Login** - Sign in to access your workspace

### Creating Content
1. **Create Folders** - Click "Folder" button in sidebar
2. **Create Files** - Click "File" button to create a new canvas
3. **Select File** - Click on any file to open it

### Drawing and Shapes
- **Select Tool** - Click "Select" to move and select objects
- **Shapes** - Click Rectangle, Square, Circle, or Triangle, then click canvas
- **Drawing** - Click Pencil tool and draw freely on canvas
- **Tables** - Click Table to insert a data table

### Advanced Features
- **Draw to Shape** - Draw something, then click "To Shape" to convert
- **Draw to Text** - Draw something, then click "To Text" and enter text
- **Delete** - Select an object and click "Delete" button
- **Save** - Click "Save" to persist changes
- **Export** - Download your canvas as JSON
- **Import** - Upload JSON files (including OneNote exports)

### Table Features
Tables support:
- Text content in cells
- Images, GIFs, and videos
- Nested tables within cells
- Resizable columns and rows

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **LocalStorage** - Data persistence

## Project Structure

```
sketch-canvas-app/
├── public/           # Static assets
├── src/
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Entry point
├── index.html       # HTML template
├── package.json     # Dependencies
├── vite.config.js   # Vite configuration
└── README.md        # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.
# sketch-canvas-app
