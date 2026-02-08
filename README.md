# Enhanced Sketch Canvas Application

A feature-rich sketch canvas application with advanced table editing, OCR, voice recording, animations, and cloud sync capabilities.

## 🚀 New Features

### 📝 Enhanced Table Editing
- **Inline editing**: Edit cells directly like OneNote without popups
- **Cell merging**: Select multiple cells and merge them
- **Cell splitting**: Split merged cells back to individual cells
- **Add/Delete rows and columns** dynamically
- **Rich media support**: Images, GIFs, videos, voice recordings in cells
- **Nested tables**: Add sub-tables within cells
- **Text formatting**: Bold, italic, underline, font size, text color, highlighting
- **Infinite canvas**: Unlimited scrolling and panning
- **Custom cell sizing**: Resize cells individually

### 🎙️ Voice Recording & Transcription
- **Real-time transcription**: Automatic speech-to-text while recording
- **Audio playback**: Play back recordings directly in cells
- **Transcript storage**: Save transcripts with audio files
- **Multi-language support**: Built on Web Speech API

### 📄 PDF Import & OCR
- **PDF to canvas**: Import PDF pages as images
- **Text extraction**: Extract text from PDFs automatically
- **OCR on images**: Scan images and extract text using Tesseract.js
- **Editable text**: All extracted text is fully editable

### 🎬 Animation System
- **Multiple animation types**: Fade, slide, rotate, scale, bounce
- **Timing controls**: Set duration and delay for animations
- **Play all**: Execute all animations in sequence
- **Object-specific**: Assign different animations to different objects

### ☁️ Cloud Sync & Database
- **Local database**: IndexedDB for offline storage using Dexie
- **Remote sync**: Optional cloud synchronization
- **Auto-save**: Changes saved automatically to local database
- **Version control**: Track file creation and update times

### 🖊️ Drawing & Shape Recognition
- **Pen/stylus support**: Optimized for tablet pen input
- **Convert to text**: OCR on drawings to extract handwritten text
- **Convert to shapes**: Transform drawings into clean geometric shapes
- **Smooth rendering**: Optimized for tablet and touch devices

### 📱 Tablet & Touch Support
- **Touch events**: Full support for touch interactions
- **Pressure sensitivity**: Works with stylus pressure on supported devices
- **Pinch to zoom**: Zoom in/out on canvas
- **Pan canvas**: Drag to move around infinite canvas

## 📦 Installation

```bash
# Clone or extract the project
cd sketch-canvas-enhanced

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## 🔧 Dependencies

- **React 18.2**: Core framework
- **Tesseract.js**: OCR text recognition
- **PDF.js**: PDF parsing and rendering
- **Dexie**: IndexedDB wrapper for local database
- **Lucide React**: Icon library

## 🗄️ Database Structure

### Local Storage (IndexedDB)
- **users**: User accounts
- **folders**: Folder hierarchy
- **files**: Canvas files
- **canvasObjects**: Shapes, text, tables, drawings
- **connections**: Object relationships
- **animations**: Animation definitions
- **voiceRecordings**: Audio recordings with transcripts

### Remote Sync (Optional)
Configure your backend server URL in `/src/utils/database.js`:

```javascript
const remoteSync = new RemoteSync('https://your-backend-url.com/api');
```

## 📝 Usage Guide

### Creating & Editing Tables

1. **Create table**: Click "Table" tool, drag to create
2. **Edit cell**: Double-click cell to start inline editing
3. **Format text**: Select cell, use formatting toolbar
4. **Add media**: Right-click cell → choose media type
5. **Merge cells**: Select cells (Shift+Click), click "Merge"
6. **Add rows/cols**: Click "+" Row or "+" Col buttons
7. **Delete rows/cols**: Select cell, click "-" Row or "-" Col

### Voice Recording

1. Right-click on a cell
2. Click "Start Voice Recording"
3. Speak clearly (transcript appears in real-time)
4. Click "Stop Recording" when done
5. Audio and transcript saved to cell

### PDF Import with OCR

1. Click "Import" button in toolbar
2. Select a PDF file
3. Each page extracted as image + text
4. Edit extracted text directly on canvas

### Animation System

1. Select an object (shape, text, etc.)
2. Click "Animations" button
3. Choose animation type and duration
4. Click "Add to Selected"
5. Click "Play All" to preview animations

### Drawing Recognition

1. Use "Draw" tool to sketch
2. Right-click drawing
3. Choose "Convert to Text (OCR)" or "Convert to Shape"
4. Drawing transformed accordingly

## 🎨 Keyboard Shortcuts

- **Delete**: Delete selected object
- **Shift+Click**: Multi-select cells
- **Double-click**: Edit text/cell
- **Right-click**: Context menu
- **Ctrl+S**: Save file (browser dependent)

## 🔐 Authentication

Simple username/password system with local storage:
- First time: Register account
- Returning: Login with credentials
- All data tied to user account

## 📊 Cloud Sync Setup

### Backend Requirements

Your backend should implement these endpoints:

```javascript
POST /api/sync
{
  userId: number,
  folders: Array,
  files: Array,
  canvasObjects: Array,
  connections: Array,
  animations: Array,
  timestamp: number
}

GET /api/sync/:userId
Returns: {
  folders: Array,
  files: Array,
  canvasObjects: Array,
  connections: Array,
  animations: Array
}
```

## 🎯 Features Roadmap

- [x] Inline table editing
- [x] Cell merging/splitting
- [x] Voice recording with transcription
- [x] PDF import with OCR
- [x] Animation system
- [x] Cloud sync
- [x] Drawing to text conversion
- [x] Tablet pen support
- [ ] Collaborative editing
- [ ] Real-time sync
- [ ] Export to PDF
- [ ] Template library
- [ ] Mobile app version

## 🐛 Known Issues

1. **OCR Accuracy**: Depends on image quality and handwriting clarity
2. **Browser Compatibility**: Voice recognition works best in Chrome/Edge
3. **Large PDFs**: May take time to process PDFs with many pages
4. **Mobile Safari**: Limited Web Speech API support

## 🛠️ Troubleshooting

### Voice Recording Not Working
- Check microphone permissions in browser
- Ensure HTTPS (required for microphone access)
- Use Chrome or Edge for best compatibility

### OCR Not Recognizing Text
- Ensure good image quality
- Use clear, printed text when possible
- Check console for Tesseract errors

### Cloud Sync Failing
- Verify backend server is running
- Check network connection
- Review browser console for API errors

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📧 Support

For issues and questions, please open a GitHub issue or contact support.

---

**Built with ❤️ for creative minds and note-takers**
