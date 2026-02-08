import React, { useState, useRef, useEffect } from 'react';
import { Plus, Square, Circle, Triangle, Table, Pencil, FolderPlus, File, Save, LogOut, Trash2, Download, Upload, Wand2, Type, ChevronRight, ChevronDown, Move, Edit3, Link, Play, Moon, Sun, Grid3x3, Minus as LineIcon, X, Settings, Image, Video } from 'lucide-react';

const SketchCanvas = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [animations, setAnimations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundPattern, setBackgroundPattern] = useState('grid');
  const [showTableEditor, setShowTableEditor] = useState(null);
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellMediaMenu, setCellMediaMenu] = useState(null); // Added for cell media menu
  
  const canvasRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  
  // New states for added features
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [isConvertingDrawing, setIsConvertingDrawing] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);
  
  useEffect(() => {
  const handleWheel = (e) => {
    if (!canvasRef.current) return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = Math.min(Math.max(0.1, canvasScale + delta), 5);
      
      // Calculate new offset to zoom towards mouse position
      const scaleRatio = newScale / canvasScale;
      setCanvasOffset(prev => ({
        x: prev.x - (mouseX / newScale) * (1 - scaleRatio),
        y: prev.y - (mouseY / newScale) * (1 - scaleRatio)
      }));
      
      setCanvasScale(newScale);
    }
  };
  
  const canvas = canvasRef.current;
  if (canvas) {
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }
}, [canvasScale, canvasOffset]);

useEffect(() => {
  const handleKeyDown = (e) => {
    // Space for panning
    if (e.code === 'Space') {
      document.body.style.cursor = 'grab';
    }
    
    // Arrow keys for navigation
    if (e.code.startsWith('Arrow')) {
      e.preventDefault();
      const step = 50 / canvasScale;
      switch(e.code) {
        case 'ArrowUp':
          setCanvasOffset(prev => ({ ...prev, y: prev.y - step }));
          break;
        case 'ArrowDown':
          setCanvasOffset(prev => ({ ...prev, y: prev.y + step }));
          break;
        case 'ArrowLeft':
          setCanvasOffset(prev => ({ ...prev, x: prev.x - step }));
          break;
        case 'ArrowRight':
          setCanvasOffset(prev => ({ ...prev, x: prev.x + step }));
          break;
      }
    }
  };
  
  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      document.body.style.cursor = '';
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [canvasScale]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('canvasAuth');
    if (savedAuth) {
      const { user } = JSON.parse(savedAuth);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserData(user);
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);
  
  const loadUserData = (user) => {
    const userData = localStorage.getItem(`canvas_${user}`);
    if (userData) {
      const data = JSON.parse(userData);
      setFolders(data.folders || []);
      setFiles(data.files || []);
    }
  };
  
  const saveUserData = () => {
    if (currentUser) {
      localStorage.setItem(`canvas_${currentUser}`, JSON.stringify({
        folders,
        files,
      }));
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      saveUserData();
    }
  }, [folders, files]);
  
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  useEffect(() => {
    if (currentFile && isAuthenticated) {
      const updatedFiles = files.map(f => 
        f.id === currentFile.id 
          ? { ...f, objects: canvasObjects, connections: connections, animations: animations } 
          : f
      );
      setFiles(updatedFiles);
    }
  }, [canvasObjects, connections, animations]);
  
  const handleAuth = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    
    const users = JSON.parse(localStorage.getItem('canvasUsers') || '{}');
    
    if (authMode === 'register') {
      if (users[username]) {
        alert('Username already exists');
        return;
      }
      users[username] = password;
      localStorage.setItem('canvasUsers', JSON.stringify(users));
      alert('Registration successful! Please login.');
      setAuthMode('login');
      setPassword('');
    } else {
      if (users[username] === password) {
        setCurrentUser(username);
        setIsAuthenticated(true);
        localStorage.setItem('canvasAuth', JSON.stringify({ user: username }));
        loadUserData(username);
      } else {
        alert('Invalid credentials');
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('canvasAuth');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setFolders([]);
    setFiles([]);
    setCurrentFile(null);
    setCanvasObjects([]);
    setConnections([]);
  };
  
  const createFolder = (parentId = null) => {
    const name = prompt('Folder name:');
    if (name) {
      setFolders([...folders, { id: Date.now(), name, parentId }]);
    }
  };
  
  const createFile = (folderId = null) => {
    const name = prompt('File name:');
    if (name) {
      const newFile = {
        id: Date.now(),
        name,
        folderId,
        objects: [],
        connections: [],
        animations: [],
        createdAt: new Date().toISOString(),
      };
      setFiles([...files, newFile]);
      setCurrentFile(newFile);
      setCanvasObjects([]);
      setConnections([]);
      setAnimations([]);
    }
  };
  
  const openFile = (file) => {
    setCurrentFile(file);
    setCanvasObjects(file.objects || []);
    setConnections(file.connections || []);
    setAnimations(file.animations || []);
    setSelectedObject(null);
  };
  
  const saveCurrentFile = () => {
    if (currentFile) {
      saveUserData();
      alert('File saved successfully!');
    }
  };
  
  const deleteFile = (fileId, e) => {
    e.stopPropagation();
    if (confirm('Delete this file?')) {
      setFiles(files.filter(f => f.id !== fileId));
      if (currentFile?.id === fileId) {
        setCurrentFile(null);
        setCanvasObjects([]);
        setConnections([]);
      }
    }
  };
  
  const deleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (confirm('Delete this folder and all its contents?')) {
      const foldersToDelete = getAllSubfolders(folderId);
      foldersToDelete.push(folderId);
      
      setFiles(files.filter(f => !foldersToDelete.includes(f.folderId)));
      setFolders(folders.filter(f => !foldersToDelete.includes(f.id)));
    }
  };
  
  const getAllSubfolders = (parentId) => {
    const subfolders = folders.filter(f => f.parentId === parentId).map(f => f.id);
    const allSubfolders = [...subfolders];
    
    subfolders.forEach(id => {
      allSubfolders.push(...getAllSubfolders(id));
    });
    
    return allSubfolders;
  };
  
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };
  
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    if (draggedItem.type === 'folder') {
      if (draggedItem.id === targetFolder?.id) return;
      if (isChildFolder(targetFolder?.id, draggedItem.id)) return;
      
      setFolders(folders.map(f => 
        f.id === draggedItem.id 
          ? { ...f, parentId: targetFolder?.id || null }
          : f
      ));
    } else if (draggedItem.type === 'file') {
      setFiles(files.map(f => 
        f.id === draggedItem.id 
          ? { ...f, folderId: targetFolder?.id || null }
          : f
      ));
    }
    
    setDraggedItem(null);
  };
  
  const isChildFolder = (parentId, childId) => {
    if (!parentId) return false;
    
    const parent = folders.find(f => f.id === parentId);
    if (!parent) return false;
    if (parent.parentId === childId) return true;
    
    return isChildFolder(parent.parentId, childId);
  };
  
  const getCanvasCoords = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  let x, y;
  
  if (e.touches) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  
  // Apply scale and offset
  x = (x / canvasScale) - canvasOffset.x;
  y = (y / canvasScale) - canvasOffset.y;
  
  return { x, y };
};
  
  const handleCanvasMouseDown = (e) => {
     if (!currentFile) return;
  
  const pos = getCanvasCoords(e);
  
  // Handle panning
  if (isPanning && panStart) {
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    
    setCanvasOffset(prev => ({
      x: prev.x + dx / canvasScale,
      y: prev.y + dy / canvasScale
    }));
    
    setPanStart({ x: e.clientX, y: e.clientY });
    return;
  }
    if (!currentFile) return;
    
    
    if (selectedTool === 'draw') {
      setIsDrawing(true);
      setDrawingPath([pos]);
      e.stopPropagation();
      return;
    }
    
    if (selectedTool === 'select') {
      const clickedObject = canvasObjects.find(obj => isPointInObject(pos, obj));
      
      if (clickedObject) {
        const handle = getResizeHandle(pos, clickedObject);
        
        if (handle) {
          setResizingObject(clickedObject);
          setResizeHandle(handle);
          setDragStart(pos);
          e.stopPropagation();
          return;
        }
        
        setSelectedObject(clickedObject);
        setIsDraggingObject(true);
        setDragStart(pos);
        e.stopPropagation();
        return;
      }
    }
    
    if (selectedTool !== 'select' && selectedTool !== 'draw' && selectedTool !== 'connect') {
      setDragStart(pos);
      e.stopPropagation();
    }
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!currentFile) return;
    
    const pos = getCanvasCoords(e);
    
    if (isDrawing && selectedTool === 'draw') {
      setDrawingPath([...drawingPath, pos]);
      return;
    }
    
    if (resizingObject && resizeHandle && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      const updatedObjects = canvasObjects.map(obj => {
        if (obj.id === resizingObject.id) {
          let newObj = { ...obj };
          
          switch (resizeHandle) {
            case 'se':
              newObj.width = Math.max(50, obj.width + dx);
              newObj.height = Math.max(50, obj.height + dy);
              break;
            case 'sw':
              newObj.x = obj.x + dx;
              newObj.width = Math.max(50, obj.width - dx);
              newObj.height = Math.max(50, obj.height + dy);
              break;
            case 'ne':
              newObj.y = obj.y + dy;
              newObj.width = Math.max(50, obj.width + dx);
              newObj.height = Math.max(50, obj.height - dy);
              break;
            case 'nw':
              newObj.x = obj.x + dx;
              newObj.y = obj.y + dy;
              newObj.width = Math.max(50, obj.width - dx);
              newObj.height = Math.max(50, obj.height - dy);
              break;
          }
          
          return newObj;
        }
        return obj;
      });
      
      setCanvasObjects(updatedObjects);
      setResizingObject(updatedObjects.find(o => o.id === resizingObject.id));
      setDragStart(pos);
      return;
    }
    
    if (isDraggingObject && selectedObject && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      setCanvasObjects(canvasObjects.map(obj => 
        obj.id === selectedObject.id
          ? { ...obj, x: obj.x + dx, y: obj.y + dy }
          : obj
      ));
      
      setSelectedObject({
        ...selectedObject,
        x: selectedObject.x + dx,
        y: selectedObject.y + dy,
      });
      
      setDragStart(pos);
    }
  };
  
  const handleCanvasMouseUp = (e) => {
    if (!currentFile) return;
    
    const pos = getCanvasCoords(e);
  
  // Stop panning
  if (isPanning) {
    setIsPanning(false);
    setPanStart(null);
    return;
  }
    
    if (isDrawing && selectedTool === 'draw' && drawingPath.length > 0) {
      const newObject = {
        id: Date.now(),
        type: 'drawing',
        path: [...drawingPath], // Create a copy
        x: Math.min(...drawingPath.map(p => p.x)),
        y: Math.min(...drawingPath.map(p => p.y)),
        width: Math.max(...drawingPath.map(p => p.x)) - Math.min(...drawingPath.map(p => p.x)),
        height: Math.max(...drawingPath.map(p => p.y)) - Math.min(...drawingPath.map(p => p.y)),
        strokeColor: darkMode ? '#f1f5f9' : '#000000',
        strokeWidth: 2,
      };
      
      // Save to drawing history
      setDrawingHistory([...drawingHistory, newObject]);
      
      // Add to canvas objects
      setCanvasObjects([...canvasObjects, newObject]);
      setIsDrawing(false);
      setDrawingPath([]);
      return;
    }
    
    if (dragStart && !isDraggingObject && !resizingObject && selectedTool !== 'select' && selectedTool !== 'draw' && selectedTool !== 'connect') {
      const width = Math.abs(pos.x - dragStart.x);
      const height = Math.abs(pos.y - dragStart.y);
      
      if (width > 10 || height > 10) {
        const newObject = {
          id: Date.now(),
          type: selectedTool,
          x: Math.min(dragStart.x, pos.x),
          y: Math.min(dragStart.y, pos.y),
          width: width || 100,
          height: height || 100,
          text: selectedTool === 'text' ? 'Double-click to edit' : '',
          rows: selectedTool === 'table' ? 3 : undefined,
          cols: selectedTool === 'table' ? 3 : undefined,
          cells: selectedTool === 'table' ? Array(3).fill().map(() => Array(3).fill({ text: '', image: null, video: null, nestedTable: null })) : undefined,
        };
        
        setCanvasObjects([...canvasObjects, newObject]);
        setSelectedTool('select');
      }
    }
    
    setIsDrawing(false);
    setIsDraggingObject(false);
    setDragStart(null);
    setResizingObject(null);
    setResizeHandle(null);
  };
  
  const isPointInObject = (point, obj) => {
    return point.x >= obj.x &&
           point.x <= obj.x + obj.width &&
           point.y >= obj.y &&
           point.y <= obj.y + obj.height;
  };
  
  const getResizeHandle = (point, obj) => {
    const handleSize = 10;
    const handles = {
      'nw': { x: obj.x, y: obj.y },
      'ne': { x: obj.x + obj.width, y: obj.y },
      'sw': { x: obj.x, y: obj.y + obj.height },
      'se': { x: obj.x + obj.width, y: obj.y + obj.height },
    };
    
    for (const [name, pos] of Object.entries(handles)) {
      if (Math.abs(point.x - pos.x) < handleSize && Math.abs(point.y - pos.y) < handleSize) {
        return name;
      }
    }
    
    return null;
  };
  
  const handleConnect = (objId) => {
    if (!connectingFrom) {
      setConnectingFrom(objId);
    } else if (connectingFrom !== objId) {
      setConnections([...connections, {
        id: Date.now(),
        from: connectingFrom,
        to: objId,
      }]);
      setConnectingFrom(null);
    }
  };
  
  const deleteSelected = () => {
    if (selectedObject) {
      setCanvasObjects(canvasObjects.filter(obj => obj.id !== selectedObject.id));
      setConnections(connections.filter(conn => 
        conn.from !== selectedObject.id && conn.to !== selectedObject.id
      ));
      setSelectedObject(null);
    }
  };
  
  const getConnectionPoints = (obj) => {
    return {
      x: obj.x + obj.width / 2,
      y: obj.y + obj.height / 2,
    };
  };
  
  const exportCanvas = () => {
    const data = {
      objects: canvasObjects,
      connections: connections,
      animations: animations,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile?.name || 'canvas'}.json`;
    a.click();
  };
  
  const importCanvas = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setCanvasObjects(data.objects || []);
          setConnections(data.connections || []);
          setAnimations(data.animations || []);
        } catch (error) {
          alert('Failed to import file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  const importOneNote = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // Read file as text first
      const text = await file.text();
      
      // Try to parse as XML/HTML (OneNote export format)
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      // Extract content from OneNote HTML format
      let content = '';
      
      // Look for common OneNote elements
      const titleElement = doc.querySelector('title') || doc.querySelector('h1');
      if (titleElement) {
        content += `Title: ${titleElement.textContent}\n\n`;
      }
      
      // Get all paragraphs
      const paragraphs = doc.querySelectorAll('p, div[class*="paragraph"]');
      if (paragraphs.length > 0) {
        paragraphs.forEach((p, i) => {
          if (p.textContent.trim()) {
            content += `${p.textContent}\n`;
          }
        });
      } else {
        // Fallback: try to get body text
        const body = doc.body;
        if (body && body.textContent) {
          content = body.textContent.substring(0, 5000);
        }
      }
      
      if (!content.trim()) {
        // If no content found, show the raw text
        content = text.substring(0, 2000);
        if (text.length > 2000) content += '...';
      }
      
      // Create a text object to show imported content
      const importedText = {
        id: Date.now(),
        type: 'text',
        x: 100,
        y: 100,
        width: 600,
        height: 400,
        text: `OneNote Import\n\n${content}`,
        backgroundColor: '#f0f9ff',
        border: '2px solid #0ea5e9',
        fontSize: '14px',
        overflow: 'auto'
      };
      
      // Also try to extract images
      const images = doc.querySelectorAll('img');
      if (images.length > 0) {
        // Create image objects for each found image
        const imageObjects = Array.from(images).map((img, index) => {
          // Try to get image source
          let src = img.src || img.getAttribute('data-src');
          
          // For data URLs, use directly
          if (src && src.startsWith('data:')) {
            return {
              id: Date.now() + index,
              type: 'rectangle',
              x: 150 + (index * 220),
              y: 550,
              width: 200,
              height: 150,
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              imageUrl: src,
              text: `Image ${index + 1}`,
              renderAsImage: true
            };
          }
          return null;
        }).filter(Boolean);
        
        setCanvasObjects([importedText, ...imageObjects]);
      } else {
        setCanvasObjects([...canvasObjects, importedText]);
      }
      
      alert(`OneNote imported successfully! Found ${images.length} images.`);
      
    } catch (error) {
      console.error('OneNote import error:', error);
      alert('Failed to parse OneNote file. Showing as raw text.');
      
      // Fallback: read as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target.result;
        const importedText = {
          id: Date.now(),
          type: 'text',
          x: 100,
          y: 100,
          width: 600,
          height: 400,
          text: `OneNote Import (Raw)\n\n${textContent.substring(0, 3000)}${textContent.length > 3000 ? '...' : ''}`,
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b'
        };
        setCanvasObjects([...canvasObjects, importedText]);
      };
      reader.readAsText(file);
    }
  };
  
  const handleObjectDoubleClick = (obj, e) => {
    e.stopPropagation();
    // Allow editing text for text, rectangle, circle, triangle
    if (['text', 'rectangle', 'circle', 'triangle'].includes(obj.type)) {
      const newText = prompt('Enter text:', obj.text || '');
      if (newText !== null) {
        setCanvasObjects(canvasObjects.map(o => 
          o.id === obj.id ? { ...o, text: newText } : o
        ));
      }
    } else if (obj.type === 'table') {
      setShowTableEditor(obj.id);
    }
  };
  
  const handleCellEdit = (objId, row, col, content) => {
    setCanvasObjects(canvasObjects.map(obj => {
      if (obj.id === objId) {
        const newCells = obj.cells.map((r, ri) => 
          r.map((c, ci) => (ri === row && ci === col) ? { ...c, ...content } : c)
        );
        return { ...obj, cells: newCells };
      }
      return obj;
    }));
  };
  
  const handleImageUpload = (objId, row, col, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, { 
          image: event.target.result,
          text: '', // Clear text when adding image
          video: null, // Remove video if exists
          nestedTable: null // Remove nested table if exists
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideoUpload = (objId, row, col, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, { 
          video: event.target.result,
          text: '', // Clear text when adding video
          image: null, // Remove image if exists
          nestedTable: null // Remove nested table if exists
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNestedTableAdd = (objId, row, col) => {
    const nestedTable = {
      rows: 2,
      cols: 2,
      cells: Array(2).fill().map(() => Array(2).fill({ text: '' }))
    };
    
    handleCellEdit(objId, row, col, { 
      nestedTable,
      text: '', // Clear text when adding nested table
      image: null, // Remove image if exists
      video: null // Remove video if exists
    });
  };
  
  const handleCellResize = (objId, row, col, e) => {
    e.stopPropagation();
    const cell = document.querySelector(`[data-cell-id="${objId}-${row}-${col}"]`);
    if (!cell) return;
    
    const newWidth = prompt('Enter cell width (px):', cell.offsetWidth);
    const newHeight = prompt('Enter cell height (px):', cell.offsetHeight);
    
    if (newWidth && newHeight) {
      setCanvasObjects(canvasObjects.map(obj => {
        if (obj.id === objId && obj.type === 'table') {
          const updatedCells = [...obj.cells];
          if (!updatedCells[row]) updatedCells[row] = [];
          if (!updatedCells[row][col]) updatedCells[row][col] = {};
          
          updatedCells[row][col] = {
            ...updatedCells[row][col],
            customWidth: parseInt(newWidth),
            customHeight: parseInt(newHeight)
          };
          
          return {
            ...obj,
            cells: updatedCells
          };
        }
        return obj;
      }));
    }
  };
  
  // Convert drawing to text using OCR simulation
  const convertDrawingToText = (drawingId) => {
    const drawing = canvasObjects.find(obj => obj.id === drawingId);
    if (!drawing || drawing.type !== 'drawing') return;
    
    const text = prompt('Enter text for this drawing:', 'Recognized text');
    if (text) {
      setCanvasObjects(canvasObjects.map(obj => 
        obj.id === drawingId 
          ? {
              ...obj,
              type: 'text',
              text: text,
              path: undefined, // Remove drawing path
              width: Math.max(100, obj.width),
              height: Math.max(40, obj.height)
            }
          : obj
      ));
      setSelectedObject(null);
    }
  };
  
  // Convert drawing to geometric shape
  const convertDrawingToShape = (drawingId, shapeType) => {
    const drawing = canvasObjects.find(obj => obj.id === drawingId);
    if (!drawing || drawing.type !== 'drawing') return;
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === drawingId 
        ? {
            ...obj,
            type: shapeType,
            path: undefined, // Remove drawing path
            width: Math.max(50, obj.width),
            height: Math.max(50, obj.height)
          }
        : obj
    ));
    setSelectedObject(null);
  };
  
  // Add context menu handler
  const handleContextMenu = (e, obj) => {
    e.preventDefault();
    if (obj.type === 'drawing') {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        objectId: obj.id
      });
    }
  };
  
  // Handle cell media menu
  const handleCellMediaMenu = (e, objId, row, col) => {
    e.preventDefault();
    e.stopPropagation();
    setCellMediaMenu({
      x: e.clientX,
      y: e.clientY,
      objId,
      row,
      col
    });
    setEditingCell({ objId, row, col });
  };
  
  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
      transition: 'background-color 0.3s ease',
    };
    
    if (backgroundPattern === 'grid') {
      return {
        ...baseStyle,
        backgroundImage: darkMode 
          ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
          : 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    } else if (backgroundPattern === 'lines') {
      return {
        ...baseStyle,
        backgroundImage: darkMode
          ? 'linear-gradient(#334155 1px, transparent 1px)'
          : 'linear-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    }
    
    return baseStyle;
  };
  
  const renderNestedTable = (nestedTable, cellStyle) => {
    return (
      <table style={{
        width: '100%',
        height: '100%',
        borderCollapse: 'collapse',
        fontSize: '10px'
      }}>
        <tbody>
          {nestedTable.cells.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    border: '1px solid #cbd5e1',
                    padding: '2px',
                    fontSize: '10px',
                    ...cellStyle
                  }}
                >
                  {cell.text}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  const renderObject = (obj) => {
    const isSelected = selectedObject?.id === obj.id;
  const commonStyle = {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    border: isSelected ? '2px solid #3b82f6' : '2px solid ' + (darkMode ? '#475569' : '#94a3b8'),
    cursor: selectedTool === 'select' ? 'move' : 'default',
    transition: 'border-color 0.2s',
    transform: `scale(${1 / canvasScale})`, // Counter-scale objects
    transformOrigin: '0 0',
  };
  
    
    const renderResizeHandles = () => {
      if (!isSelected) return null;
      
      const handleStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: '#3b82f6',
        border: '2px solid white',
        borderRadius: '50%',
        cursor: 'nwse-resize',
      };
      
      return (
        <>
          <div style={{ ...handleStyle, left: '-5px', top: '-5px', cursor: 'nw-resize' }} />
          <div style={{ ...handleStyle, right: '-5px', top: '-5px', cursor: 'ne-resize' }} />
          <div style={{ ...handleStyle, left: '-5px', bottom: '-5px', cursor: 'sw-resize' }} />
          <div style={{ ...handleStyle, right: '-5px', bottom: '-5px', cursor: 'se-resize' }} />
        </>
      );
    };
    
    switch (obj.type) {
      case 'rectangle':
        return (
          <div
            key={obj.id}
            style={{
              ...commonStyle,
              backgroundColor: obj.backgroundColor || (darkMode ? '#334155' : '#e2e8f0'),
              backgroundImage: obj.imageUrl ? `url(${obj.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              } else if (selectedTool === 'connect') {
                handleConnect(obj.id);
              }
            }}
            onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
          >
            {obj.text && (
              <div style={{
                width: '100%',
                textAlign: 'center',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                fontSize: '1rem',
                wordBreak: 'break-word',
                pointerEvents: 'none',
              }}>{obj.text}</div>
            )}
            {obj.imageUrl && obj.text && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {obj.text}
              </div>
            )}
            {renderResizeHandles()}
          </div>
        );
      case 'circle':
        return (
          <div
            key={obj.id}
            style={{
              ...commonStyle,
              borderRadius: '50%',
              backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              } else if (selectedTool === 'connect') {
                handleConnect(obj.id);
              }
            }}
            onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
          >
            {obj.text && (
              <div style={{
                width: '100%',
                textAlign: 'center',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                fontSize: '1rem',
                wordBreak: 'break-word',
                pointerEvents: 'none',
              }}>{obj.text}</div>
            )}
            {renderResizeHandles()}
          </div>
        );
      case 'triangle':
        return (
          <div
            key={obj.id}
            style={{
              ...commonStyle,
              backgroundColor: 'transparent',
              borderLeft: `${obj.width / 2}px solid transparent`,
              borderRight: `${obj.width / 2}px solid transparent`,
              borderBottom: `${obj.height}px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              width: 0,
              height: 0,
              border: isSelected ? '2px solid #3b82f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              } else if (selectedTool === 'connect') {
                handleConnect(obj.id);
              }
            }}
            onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
          >
            {obj.text && (
              <div style={{
                width: '100%',
                textAlign: 'center',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                fontSize: '1rem',
                wordBreak: 'break-word',
                pointerEvents: 'none',
              }}>{obj.text}</div>
            )}
            {renderResizeHandles()}
          </div>
        );
      
      case 'text':
        return (
          <div
            key={obj.id}
            style={{
              ...commonStyle,
              backgroundColor: obj.backgroundColor || 'transparent',
              border: isSelected ? '2px dashed #3b82f6' : 'none',
              padding: '8px',
              fontSize: obj.fontSize || '16px',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              overflow: obj.overflow || 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              }
            }}
            onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
          >
            {obj.text}
            {renderResizeHandles()}
          </div>
        );
      
      case 'table':
        return (
          <div
            key={obj.id}
            style={{
              ...commonStyle,
              backgroundColor: darkMode ? '#1e293b' : 'white',
              overflow: 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              }
            }}
            onDoubleClick={(e) => handleObjectDoubleClick(obj, e)}
          >
            <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {obj.cells.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        data-cell-id={`${obj.id}-${ri}-${ci}`}
                        style={{
                          border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
                          padding: '4px',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          position: 'relative',
                          minWidth: cell.customWidth || '80px',
                          minHeight: cell.customHeight || '60px',
                          width: cell.customWidth || 'auto',
                          height: cell.customHeight || 'auto',
                          maxWidth: '300px',
                          maxHeight: '200px',
                          overflow: 'hidden',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCell({ objId: obj.id, row: ri, col: ci });
                        }}
                        onDoubleClick={(e) => handleCellResize(obj.id, ri, ci, e)}
                        onContextMenu={(e) => handleCellMediaMenu(e, obj.id, ri, ci)}
                      >
                        {cell.image && (
                          <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <img
                              src={cell.image}
                              alt="Cell content"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open image in modal for better view
                                const modal = document.createElement('div');
                                modal.style.cssText = `
                                  position: fixed;
                                  top: 0;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  background: rgba(0,0,0,0.8);
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  z-index: 9999;
                                `;
                                modal.innerHTML = `
                                  <div style="position: relative;">
                                    <img src="${cell.image}" style="max-width: 90vw; max-height: 90vh;" />
                                    <button onclick="this.parentElement.parentElement.remove()" style="
                                      position: absolute;
                                      top: -40px;
                                      right: 0;
                                      background: #ef4444;
                                      color: white;
                                      border: none;
                                      padding: 8px 16px;
                                      border-radius: 4px;
                                      cursor: pointer;
                                    ">Close</button>
                                  </div>
                                `;
                                document.body.appendChild(modal);
                              }}
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '4px',
                              right: '4px',
                              fontSize: '10px',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              padding: '2px 4px',
                              borderRadius: '2px',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellResize(obj.id, ri, ci, e);
                            }}
                            >
                              Resize
                            </div>
                          </div>
                        )}
                        
                        {cell.video && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <video
                              src={cell.video}
                              controls
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%',
                                cursor: 'pointer',
                              }}
                            />
                          </div>
                        )}
                        
                        {cell.nestedTable && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'auto',
                          }}>
                            {renderNestedTable(cell.nestedTable, {
                              fontSize: '8px',
                              padding: '1px'
                            })}
                          </div>
                        )}
                        
                        {!cell.image && !cell.video && !cell.nestedTable && (
                          <div
                            contentEditable={editingCell?.objId === obj.id && editingCell?.row === ri && editingCell?.col === ci}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              handleCellEdit(obj.id, ri, ci, { text: e.target.textContent });
                              setEditingCell(null);
                            }}
                            style={{
                              outline: 'none',
                              minHeight: '20px',
                              color: darkMode ? '#f1f5f9' : '#1e293b',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            {cell.text}
                          </div>
                        )}
                        
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          fontSize: '10px',
                          color: '#64748b',
                          cursor: 'pointer',
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          padding: '1px 3px',
                          borderRadius: '2px',
                          display: 'none',
                        }}
                        className="cell-actions"
                        >
                          ⋮
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {renderResizeHandles()}
            
            {showTableEditor === obj.id && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: darkMode ? '#1e293b' : 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                  minWidth: '400px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ margin: '0 0 16px 0', color: darkMode ? '#f1f5f9' : '#1e293b' }}>
                  Table Editor
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Click on a cell to edit text, or right-click to add media:
                  </p>
                </div>
                
                <button
                  onClick={() => setShowTableEditor(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '14px',
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        );
      
      case 'drawing':
        return (
          <svg
            key={obj.id}
            style={{
              ...commonStyle,
              border: isSelected ? '2px dashed #3b82f6' : 'none',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === 'select') {
                setSelectedObject(obj);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, obj)}
          >
            <polyline
              points={obj.path.map(p => `${p.x - obj.x},${p.y - obj.y}`).join(' ')}
              fill="none"
              stroke={obj.strokeColor || (darkMode ? '#f1f5f9' : '#000000')}
              strokeWidth={obj.strokeWidth || 2}
            />
            {renderResizeHandles()}
          </svg>
        );
      
      default:
        return null;
    }
  };
  
  const renderFileTree = (parentId = null, level = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    const childFiles = files.filter(f => f.folderId === parentId);
    
    return (
      <div style={{ marginLeft: level > 0 ? '1rem' : 0 }}>
        {childFolders.map(folder => (
          <div key={folder.id}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, folder, 'folder')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '6px',
                backgroundColor: expandedFolders.has(folder.id) 
                  ? (darkMode ? '#334155' : '#e2e8f0')
                  : 'transparent',
                color: darkMode ? '#f1f5f9' : '#1e293b',
              }}
              onClick={() => toggleFolder(folder.id)}
            >
              {expandedFolders.has(folder.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <FolderPlus size={16} />
              <span style={{ flex: 1, fontSize: '0.9rem' }}>{folder.name}</span>
              {/* Add subfolder icon */}
              <button
                title="Add subfolder"
                onClick={e => { e.stopPropagation(); createFolder(folder.id); }}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#22c55e',
                }}
              >
                <FolderPlus size={14} />
              </button>
              {/* Add note icon */}
              <button
                title="Add note"
                onClick={e => { e.stopPropagation(); createFile(folder.id); }}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3b82f6',
                }}
              >
                <File size={14} />
              </button>
              <button
                onClick={(e) => deleteFolder(folder.id, e)}
                style={{
                  padding: '0.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {expandedFolders.has(folder.id) && renderFileTree(folder.id, level + 1)}
          </div>
        ))}
        
        {childFiles.map(file => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, file, 'file')}
            style={{
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '6px',
              backgroundColor: currentFile?.id === file.id 
                ? (darkMode ? '#1e40af' : '#3b82f6')
                : 'transparent',
              color: currentFile?.id === file.id ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b'),
              marginLeft: level > 0 ? '1.5rem' : '0.5rem',
            }}
            onClick={() => openFile(file)}
          >
            <File size={16} />
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{file.name}</span>
            <button
              onClick={(e) => deleteFile(file.id, e)}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: currentFile?.id === file.id ? 'white' : '#ef4444',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '400px',
        }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '1.5rem', textAlign: 'center' }}>
            {authMode === 'login' ? 'Login' : 'Register'}
          </h2>
          
          <form onSubmit={handleAuth}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#334155',
                border: '2px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '1rem',
              }}
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1.5rem',
                backgroundColor: '#334155',
                border: '2px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '1rem',
              }}
            />
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'transparent',
              border: '2px solid #475569',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: darkMode ? '#1e293b' : 'white',
        borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease',
      }}>
        <div style={{
          padding: '1.25rem',
          borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
              Sketch Canvas
            </h2>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
          }}>
            <button
              onClick={() => createFolder()}
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '6px',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <FolderPlus size={16} />
              Folder
            </button>
            
            <button
              onClick={() => createFile()}
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Plus size={16} />
              File
            </button>
          </div>
        </div>
        
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
          }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null)}
        >
          {renderFileTree()}
        </div>
        
        <div style={{
          padding: '1rem',
          borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          fontSize: '0.85rem',
          color: '#64748b',
        }}>
          {currentUser && `Logged in as: ${currentUser}`}
        </div>
      </div>
      
      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{
          padding: '1rem',
          backgroundColor: darkMode ? '#1e293b' : 'white',
          borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          transition: 'background-color 0.3s ease',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { tool: 'select', icon: Move, label: 'Select' },
              { tool: 'rectangle', icon: Square, label: 'Rectangle' },
              { tool: 'circle', icon: Circle, label: 'Circle' },
              { tool: 'triangle', icon: Triangle, label: 'Triangle' },
              { tool: 'text', icon: Type, label: 'Text' },
              { tool: 'draw', icon: Pencil, label: 'Draw' },
              { tool: 'table', icon: Table, label: 'Table' },
              { tool: 'connect', icon: Link, label: 'Connect' },
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: selectedTool === tool 
                    ? '#3b82f6' 
                    : (darkMode ? '#334155' : '#e2e8f0'),
                  border: 'none',
                  borderRadius: '8px',
                  color: selectedTool === tool ? 'white' : (darkMode ? '#f1f5f9' : '#1f2937'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                }}
                title={label}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
          
          {/* Drawing conversion buttons */}
          {selectedObject?.type === 'drawing' && (
            <>
              <div style={{
                width: '1px',
                height: '30px',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
              }} />
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => convertDrawingToText(selectedObject.id)}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: '#8b5cf6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Type size={16} />
                  Convert to Text
                </button>
                
                <button
                  onClick={() => convertDrawingToShape(selectedObject.id, 'rectangle')}
                  style={{
                    padding: '0.625rem 1rem',
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Square size={16} />
                  Convert to Shape
                </button>
              </div>
            </>
          )}
          
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
          }} />
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '0.625rem',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                color: darkMode ? '#fbbf24' : '#1e293b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease',
              }}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <select
              value={backgroundPattern}
              onChange={(e) => setBackgroundPattern(e.target.value)}
              style={{
                padding: '0.625rem',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                color: darkMode ? 'white' : '#1f2937',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <option value="grid">Grid</option>
              <option value="lines">Lines</option>
              <option value="none">None</option>
            </select>
          </div>
          
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
          }} />
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={saveCurrentFile}
              disabled={!currentFile}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: currentFile ? '#10b981' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: currentFile ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Save size={16} />
              Save
            </button>
            
            <button
              onClick={exportCanvas}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#f59e0b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Download size={16} />
              Export
            </button>
            
            <label style={{
              padding: '0.625rem 1rem',
              backgroundColor: '#06b6d4',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}>
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".json,.one,.txt,.html,.htm,.mht"
                onChange={(e) => {
                  if (e.target.files[0]?.name.endsWith('.one') || 
                      e.target.files[0]?.name.endsWith('.html') ||
                      e.target.files[0]?.name.endsWith('.htm') ||
                      e.target.files[0]?.name.endsWith('.mht')) {
                    importOneNote(e);
                  } else {
                    importCanvas(e);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
            
            <button
              onClick={deleteSelected}
              disabled={!selectedObject}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: selectedObject ? '#ef4444' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: selectedObject ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
          
          {currentFile && (
            <div style={{
              marginLeft: 'auto',
              fontSize: '0.9rem',
              color: '#94a3b8',
              fontWeight: '600',
            }}>
              {currentFile.name}
            </div>
          )}
          
          {connectingFrom && (
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'white',
            }}>
              Click another shape to connect
            </div>
          )}
        </div>
        
        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: selectedTool === 'draw' ? 'crosshair' : selectedTool === 'select' ? 'default' : 'crosshair',
            ...getBackgroundStyle(),
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleCanvasMouseDown}
          onTouchMove={handleCanvasMouseMove}
          onTouchEnd={handleCanvasMouseUp}
          onClick={() => {
            setSelectedObject(null);
            setConnectingFrom(null);
            setShowTableEditor(null);
            setContextMenu(null);
            setCellMediaMenu(null);
          }}
        >
          {/* Render connections */}
          <svg style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}>
            {connections.map(conn => {
              const fromObj = canvasObjects.find(o => o.id === conn.from);
              const toObj = canvasObjects.find(o => o.id === conn.to);
              if (!fromObj || !toObj) return null;
              
              const from = getConnectionPoints(fromObj);
              const to = getConnectionPoints(toObj);
              
              return (
                <g key={conn.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
          
          {canvasObjects.map(obj => renderObject(obj))}
          
          {isDrawing && drawingPath.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
              }}
            >
              <polyline
                points={drawingPath.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={darkMode ? '#f1f5f9' : '#000000'}
                strokeWidth="2"
              />
            </svg>
          )}
          
          {!currentFile && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#64748b',
            }}>
              <Edit3 size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: darkMode ? '#94a3b8' : '#475569' }}>
                No File Selected
              </h3>
              <p style={{ fontSize: '1rem' }}>
                Create or open a file to start sketching
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Context Menu for Drawing Objects */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onClick={() => setContextMenu(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => {
                convertDrawingToText(contextMenu.objectId);
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Type size={14} />
              Convert to Text
            </button>
            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0' }} />
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'rectangle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Square size={14} />
              Convert to Rectangle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'circle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Circle size={14} />
              Convert to Circle
            </button>
            <button
              onClick={() => {
                convertDrawingToShape(contextMenu.objectId, 'triangle');
                setContextMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Triangle size={14} />
              Convert to Triangle
            </button>
          </div>
        </div>
      )}
      
      {/* Context Menu for Cell Media */}
      {cellMediaMenu && (
        <div
          style={{
            position: 'fixed',
            top: cellMediaMenu.y,
            left: cellMediaMenu.x,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>
              Add to Cell
            </h4>
            
            <label style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}>
              <Image size={14} />
              Add Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>
            
            <label style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: darkMode ? '#f1f5f9' : '#1e293b',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
            }}>
              <Video size={14} />
              Add Video
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  handleVideoUpload(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, e);
                  setCellMediaMenu(null);
                }}
                style={{ display: 'none' }}
              />
            </label>
            
            <button
              onClick={() => {
                handleNestedTableAdd(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col);
                setCellMediaMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Table size={14} />
              Add Nested Table
            </button>
            
            <div style={{ height: '1px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', margin: '4px 0' }} />
            
            <button
              onClick={() => {
                handleCellEdit(cellMediaMenu.objId, cellMediaMenu.row, cellMediaMenu.col, { 
                  text: '', 
                  image: null, 
                  video: null, 
                  nestedTable: null 
                });
                setCellMediaMenu(null);
              }}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <Trash2 size={14} />
              Clear Cell
            </button>
            
            <button
              onClick={() => setCellMediaMenu(null)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SketchCanvas;