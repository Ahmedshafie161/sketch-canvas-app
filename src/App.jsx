import React, { useState, useRef, useEffect } from 'react';
import { Plus, Square, Circle, Triangle, Table, Pencil, FolderPlus, File, Save, LogOut, Trash2, Download, Upload, Wand2, Type, ChevronRight, ChevronDown, Move, Edit3, Link, Play, Moon, Sun, Grid3x3, Minus as LineIcon, X, Settings } from 'lucide-react';

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
  const [backgroundPattern, setBackgroundPattern] = useState('grid'); // 'grid', 'lines', 'none'
  const [showTableEditor, setShowTableEditor] = useState(null);
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  
  const canvasRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  
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
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  
  const handleCanvasMouseDown = (e) => {
    const coords = getCanvasCoords(e);
    
    // Check for resize handle
    const resizeInfo = getResizeHandle(coords);
    if (resizeInfo && selectedTool === 'select') {
      setResizingObject(resizeInfo.object);
      setResizeHandle(resizeInfo.handle);
      return;
    }
    
    if (selectedTool === 'select') {
      const clicked = canvasObjects.find(obj => isPointInObject(coords, obj));
      setSelectedObject(clicked || null);
      if (clicked) {
        setIsDraggingObject(true);
        setDragStart({ x: coords.x - clicked.x, y: coords.y - clicked.y });
      }
    } else if (selectedTool === 'connect') {
      const clicked = canvasObjects.find(obj => isPointInObject(coords, obj));
      if (clicked) {
        if (!connectingFrom) {
          setConnectingFrom(clicked);
        } else {
          if (connectingFrom.id !== clicked.id) {
            const newConnection = {
              id: Date.now(),
              from: connectingFrom.id,
              to: clicked.id,
              type: 'arrow',
            };
            setConnections([...connections, newConnection]);
          }
          setConnectingFrom(null);
        }
      }
    } else if (selectedTool === 'draw') {
      setIsDrawing(true);
      setDrawingPath([coords]);
    } else if (selectedTool !== 'pan') {
      const newObject = createObject(selectedTool, coords);
      setCanvasObjects([...canvasObjects, newObject]);
      setSelectedObject(newObject);
    }
  };
  
  const getResizeHandle = (point) => {
    if (!selectedObject) return null;
    
    const obj = selectedObject;
    const handleSize = 8;
    
    const handles = [];
    
    if (obj.type === 'circle') {
      const right = obj.x + obj.radius * 2;
      const bottom = obj.y + obj.radius * 2;
      
      handles.push(
        { x: right, y: bottom, handle: 'se' },
        { x: obj.x, y: bottom, handle: 'sw' },
        { x: right, y: obj.y, handle: 'ne' },
        { x: obj.x, y: obj.y, handle: 'nw' }
      );
    } else if (obj.width && obj.height) {
      const right = obj.x + obj.width;
      const bottom = obj.y + obj.height;
      
      handles.push(
        { x: right, y: bottom, handle: 'se' },
        { x: obj.x, y: bottom, handle: 'sw' },
        { x: right, y: obj.y, handle: 'ne' },
        { x: obj.x, y: obj.y, handle: 'nw' }
      );
    }
    
    for (const h of handles) {
      if (Math.abs(point.x - h.x) < handleSize && Math.abs(point.y - h.y) < handleSize) {
        return { object: obj, handle: h.handle };
      }
    }
    
    return null;
  };
  
  const handleCanvasMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    
    if (resizingObject && resizeHandle) {
      const obj = resizingObject;
      const newObjects = canvasObjects.map(o => {
        if (o.id !== obj.id) return o;
        
        if (o.type === 'circle') {
          const newRadius = Math.max(20, Math.abs(coords.x - o.x) / 2);
          return { ...o, radius: newRadius };
        } else if (o.width !== undefined && o.height !== undefined) {
          let newWidth = o.width;
          let newHeight = o.height;
          let newX = o.x;
          let newY = o.y;
          
          if (resizeHandle.includes('e')) {
            newWidth = Math.max(30, coords.x - o.x);
          }
          if (resizeHandle.includes('w')) {
            newWidth = Math.max(30, o.x + o.width - coords.x);
            newX = coords.x;
          }
          if (resizeHandle.includes('s')) {
            newHeight = Math.max(30, coords.y - o.y);
          }
          if (resizeHandle.includes('n')) {
            newHeight = Math.max(30, o.y + o.height - coords.y);
            newY = coords.y;
          }
          
          return { ...o, width: newWidth, height: newHeight, x: newX, y: newY };
        }
        return o;
      });
      
      setCanvasObjects(newObjects);
      const updated = newObjects.find(o => o.id === obj.id);
      setResizingObject(updated);
      setSelectedObject(updated);
      
    } else if (isDrawing && selectedTool === 'draw') {
      const coords = getCanvasCoords(e);
      setDrawingPath([...drawingPath, coords]);
    } else if (isDraggingObject && selectedObject && selectedTool === 'select') {
      const coords = getCanvasCoords(e);
      const newX = coords.x - dragStart.x;
      const newY = coords.y - dragStart.y;
      
      setCanvasObjects(canvasObjects.map(obj => 
        obj.id === selectedObject.id 
          ? { ...obj, x: newX, y: newY }
          : obj
      ));
      setSelectedObject({ ...selectedObject, x: newX, y: newY });
    }
  };
  
  const handleCanvasMouseUp = () => {
    if (isDrawing && drawingPath.length > 1) {
      const newDrawing = {
        id: Date.now(),
        type: 'drawing',
        path: drawingPath,
        x: 0,
        y: 0,
        color: '#000000',
      };
      setCanvasObjects([...canvasObjects, newDrawing]);
      setDrawingPath([]);
      setIsDrawing(false);
    }
    setIsDraggingObject(false);
    setResizingObject(null);
    setResizeHandle(null);
  };
  
  const isPointInObject = (point, obj) => {
    if (obj.type === 'drawing') {
      return obj.path.some(p => 
        Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10
      );
    } else if (obj.type === 'triangle') {
      return point.x >= obj.x && point.x <= obj.x + obj.width &&
             point.y >= obj.y && point.y <= obj.y + obj.height;
    } else if (obj.type === 'circle') {
      return point.x >= obj.x && point.x <= obj.x + obj.radius * 2 &&
             point.y >= obj.y && point.y <= obj.y + obj.radius * 2;
    } else if (obj.type === 'table') {
      return point.x >= obj.x && point.x <= obj.x + (obj.cols * obj.cellWidth) &&
             point.y >= obj.y && point.y <= obj.y + (obj.rows * obj.cellHeight);
    }
    return point.x >= obj.x && point.x <= obj.x + (obj.width || 0) &&
           point.y >= obj.y && point.y <= obj.y + (obj.height || 0);
  };
  
  const createObject = (type, coords) => {
    const baseObj = {
      id: Date.now(),
      x: coords.x,
      y: coords.y,
      text: '',
    };
    
    switch (type) {
      case 'rectangle':
        return { ...baseObj, type: 'rectangle', width: 120, height: 80, color: '#60a5fa' };
      case 'square':
        return { ...baseObj, type: 'square', width: 100, height: 100, color: '#34d399' };
      case 'circle':
        return { ...baseObj, type: 'circle', radius: 50, color: '#f87171' };
      case 'triangle':
        return { ...baseObj, type: 'triangle', width: 100, height: 100, color: '#fbbf24' };
      case 'table':
        return {
          ...baseObj,
          type: 'table',
          rows: 3,
          cols: 3,
          cellWidth: 100,
          cellHeight: 60,
          cells: Array(9).fill(null).map((_, i) => ({
            id: i,
            content: '',
            media: null,
            nestedTable: null,
          })),
        };
      default:
        return baseObj;
    }
  };
  
  const analyzeDrawingShape = (path) => {
    const bounds = getPathBounds(path);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const aspectRatio = width / height;
    
    // Check if it's roughly circular
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const avgRadius = (width + height) / 4;
    
    let circleScore = 0;
    path.forEach(p => {
      const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
      if (Math.abs(dist - avgRadius) < avgRadius * 0.3) circleScore++;
    });
    
    if (circleScore / path.length > 0.7) {
      return 'circle';
    }
    
    // Check for triangle (3 corners)
    const corners = findCorners(path);
    if (corners.length === 3) {
      return 'triangle';
    }
    
    // Check if square
    if (aspectRatio > 0.8 && aspectRatio < 1.2) {
      return 'square';
    }
    
    return 'rectangle';
  };
  
  const findCorners = (path) => {
    // Simple corner detection
    const corners = [];
    const threshold = 45; // degrees
    
    for (let i = 1; i < path.length - 1; i++) {
      const p1 = path[i - 1];
      const p2 = path[i];
      const p3 = path[i + 1];
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const angleDiff = Math.abs(angle1 - angle2) * 180 / Math.PI;
      
      if (angleDiff > threshold && angleDiff < 180 - threshold) {
        corners.push(p2);
      }
    }
    
    return corners;
  };
  
  const convertDrawingToShape = () => {
    const lastDrawing = [...canvasObjects].reverse().find(obj => obj.type === 'drawing');
    if (!lastDrawing) {
      alert('No drawing found to convert!');
      return;
    }
    
    const bounds = getPathBounds(lastDrawing.path);
    const shapeType = analyzeDrawingShape(lastDrawing.path);
    
    let newShape;
    
    if (shapeType === 'circle') {
      const radius = (bounds.maxX - bounds.minX) / 2;
      newShape = {
        id: Date.now(),
        type: 'circle',
        x: bounds.minX,
        y: bounds.minY,
        radius: radius,
        color: '#a78bfa',
        text: '',
      };
    } else if (shapeType === 'triangle') {
      newShape = {
        id: Date.now(),
        type: 'triangle',
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        color: '#fbbf24',
        text: '',
      };
    } else if (shapeType === 'square') {
      const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
      newShape = {
        id: Date.now(),
        type: 'square',
        x: bounds.minX,
        y: bounds.minY,
        width: size,
        height: size,
        color: '#34d399',
        text: '',
      };
    } else {
      newShape = {
        id: Date.now(),
        type: 'rectangle',
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        color: '#60a5fa',
        text: '',
      };
    }
    
    const filtered = canvasObjects.filter(obj => obj.id !== lastDrawing.id);
    setCanvasObjects([...filtered, newShape]);
    alert(`Drawing converted to ${shapeType}!`);
  };
  
  const convertDrawingToText = () => {
    const lastDrawing = [...canvasObjects].reverse().find(obj => obj.type === 'drawing');
    if (!lastDrawing) {
      alert('No drawing found to convert!');
      return;
    }
    
    const text = prompt('Enter text for this drawing:');
    if (!text) return;
    
    const bounds = getPathBounds(lastDrawing.path);
    
    const newText = {
      id: Date.now(),
      type: 'text',
      x: bounds.minX,
      y: bounds.minY,
      text,
      fontSize: 24,
      color: '#000000',
    };
    
    const filtered = canvasObjects.filter(obj => obj.id !== lastDrawing.id);
    setCanvasObjects([...filtered, newText]);
  };
  
  const getPathBounds = (path) => {
    const xs = path.map(p => p.x);
    const ys = path.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  };
  
  const deleteSelected = () => {
    if (selectedObject) {
      setCanvasObjects(canvasObjects.filter(obj => obj.id !== selectedObject.id));
      setConnections(connections.filter(conn => 
        conn.from !== selectedObject.id && conn.to !== selectedObject.id
      ));
      setAnimations(animations.filter(anim => anim.objectId !== selectedObject.id));
      setSelectedObject(null);
    }
  };
  
  const editObjectText = (obj) => {
    const newText = prompt('Enter text:', obj.text || '');
    if (newText !== null) {
      setCanvasObjects(canvasObjects.map(o => 
        o.id === obj.id ? { ...o, text: newText } : o
      ));
      if (selectedObject?.id === obj.id) {
        setSelectedObject({ ...obj, text: newText });
      }
    }
  };
  
  const addAnimation = () => {
    if (!selectedObject) {
      alert('Please select an object first!');
      return;
    }
    
    const order = prompt('Enter animation order (e.g., 1, 2, 3):', '1');
    const duration = prompt('Enter duration in seconds:', '1');
    
    if (order && duration) {
      const newAnim = {
        id: Date.now(),
        objectId: selectedObject.id,
        order: parseInt(order),
        duration: parseFloat(duration),
      };
      
      setAnimations([...animations.filter(a => a.objectId !== selectedObject.id), newAnim]);
    }
  };
  
  const playAnimations = () => {
    setIsPlaying(true);
    const sortedAnims = [...animations].sort((a, b) => a.order - b.order);
    
    // Hide all animated objects initially
    const animatedIds = new Set(sortedAnims.map(a => a.objectId));
    setCanvasObjects(canvasObjects.map(obj => ({
      ...obj,
      hidden: animatedIds.has(obj.id)
    })));
    
    // Show them one by one
    let delay = 0;
    sortedAnims.forEach(anim => {
      setTimeout(() => {
        setCanvasObjects(prev => prev.map(obj => 
          obj.id === anim.objectId ? { ...obj, hidden: false } : obj
        ));
      }, delay * 1000);
      
      delay += anim.duration;
    });
    
    setTimeout(() => {
      setIsPlaying(false);
    }, delay * 1000);
  };
  
  const editTableCell = (tableObj, cellIndex) => {
    const cell = tableObj.cells[cellIndex];
    
    const action = prompt('Choose action:\n1. Add text\n2. Add image URL\n3. Add video URL\n4. Add GIF URL\n5. Add nested table\n6. Clear cell', '1');
    
    let updatedCell = { ...cell };
    
    switch(action) {
      case '1':
        const text = prompt('Enter text:', cell.content);
        if (text !== null) updatedCell.content = text;
        break;
      case '2':
        const imgUrl = prompt('Enter image URL:');
        if (imgUrl) updatedCell.media = { type: 'image', url: imgUrl };
        break;
      case '3':
        const vidUrl = prompt('Enter video URL:');
        if (vidUrl) updatedCell.media = { type: 'video', url: vidUrl };
        break;
      case '4':
        const gifUrl = prompt('Enter GIF URL:');
        if (gifUrl) updatedCell.media = { type: 'gif', url: gifUrl };
        break;
      case '5':
        const rows = prompt('Nested table rows:', '2');
        const cols = prompt('Nested table columns:', '2');
        if (rows && cols) {
          updatedCell.nestedTable = {
            rows: parseInt(rows),
            cols: parseInt(cols),
            cells: Array(parseInt(rows) * parseInt(cols)).fill(null).map(() => ({ content: '' }))
          };
        }
        break;
      case '6':
        updatedCell = { id: cellIndex, content: '', media: null, nestedTable: null };
        break;
    }
    
    const newCells = [...tableObj.cells];
    newCells[cellIndex] = updatedCell;
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === tableObj.id ? { ...obj, cells: newCells } : obj
    ));
  };
  
  const addTableRow = (tableObj) => {
    const newCells = [...tableObj.cells];
    for (let i = 0; i < tableObj.cols; i++) {
      newCells.push({ id: newCells.length, content: '', media: null, nestedTable: null });
    }
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === tableObj.id 
        ? { ...obj, rows: obj.rows + 1, cells: newCells }
        : obj
    ));
  };
  
  const addTableColumn = (tableObj) => {
    const newCells = [];
    for (let i = 0; i < tableObj.rows; i++) {
      for (let j = 0; j < tableObj.cols; j++) {
        newCells.push(tableObj.cells[i * tableObj.cols + j]);
      }
      newCells.push({ id: newCells.length, content: '', media: null, nestedTable: null });
    }
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === tableObj.id 
        ? { ...obj, cols: obj.cols + 1, cells: newCells }
        : obj
    ));
  };
  
  const deleteTableRow = (tableObj) => {
    if (tableObj.rows <= 1) {
      alert('Cannot delete the last row!');
      return;
    }
    
    const newCells = tableObj.cells.slice(0, -tableObj.cols);
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === tableObj.id 
        ? { ...obj, rows: obj.rows - 1, cells: newCells }
        : obj
    ));
  };
  
  const deleteTableColumn = (tableObj) => {
    if (tableObj.cols <= 1) {
      alert('Cannot delete the last column!');
      return;
    }
    
    const newCells = [];
    for (let i = 0; i < tableObj.rows; i++) {
      for (let j = 0; j < tableObj.cols - 1; j++) {
        newCells.push(tableObj.cells[i * tableObj.cols + j]);
      }
    }
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === tableObj.id 
        ? { ...obj, cols: obj.cols - 1, cells: newCells }
        : obj
    ));
  };
  
  const exportCanvas = () => {
    const dataStr = JSON.stringify({ 
      objects: canvasObjects,
      connections: connections,
      animations: animations
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFile?.name || 'canvas'}.json`;
    a.click();
  };
  
  const importCanvas = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setCanvasObjects(data.objects || []);
        setConnections(data.connections || []);
        setAnimations(data.animations || []);
        alert('Canvas imported successfully!');
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };
  
  const importOneNote = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.one')) {
      alert('Please select a OneNote (.one) file');
      return;
    }
    
    alert('OneNote import coming soon! For now, export your OneNote as HTML or PDF, then import as JSON.');
  };
  
  const getConnectionPoints = (obj) => {
    if (obj.type === 'circle') {
      return {
        x: obj.x + obj.radius,
        y: obj.y + obj.radius,
      };
    } else if (obj.type === 'triangle') {
      return {
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height / 2,
      };
    } else if (obj.type === 'table') {
      return {
        x: obj.x + (obj.cols * obj.cellWidth) / 2,
        y: obj.y + (obj.rows * obj.cellHeight) / 2,
      };
    }
    return {
      x: obj.x + (obj.width || 0) / 2,
      y: obj.y + (obj.height || 0) / 2,
    };
  };
  
  const renderResizeHandles = (obj) => {
    if (!selectedObject || selectedObject.id !== obj.id || selectedTool !== 'select') return null;
    
    const handles = [];
    
    if (obj.type === 'circle') {
      const right = obj.x + obj.radius * 2;
      const bottom = obj.y + obj.radius * 2;
      
      handles.push(
        { x: right, y: bottom },
        { x: obj.x, y: bottom },
        { x: right, y: obj.y },
        { x: obj.x, y: obj.y }
      );
    } else if (obj.width && obj.height) {
      const right = obj.x + obj.width;
      const bottom = obj.y + obj.height;
      
      handles.push(
        { x: right, y: bottom },
        { x: obj.x, y: bottom },
        { x: right, y: obj.y },
        { x: obj.x, y: obj.y }
      );
    }
    
    return handles.map((h, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: h.x - 4,
          top: h.y - 4,
          width: 8,
          height: 8,
          backgroundColor: '#3b82f6',
          border: '1px solid white',
          cursor: 'nwse-resize',
          zIndex: 1000,
        }}
      />
    ));
  };
  
  const renderObject = (obj) => {
    if (obj.hidden) return null;
    
    const isSelected = selectedObject?.id === obj.id;
    const style = {
      position: 'absolute',
      left: obj.x,
      top: obj.y,
      border: isSelected ? '2px solid #3b82f6' : 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '500',
      color: darkMode ? '#f1f5f9' : '#1f2937',
      textAlign: 'center',
      padding: '4px',
      wordWrap: 'break-word',
      overflow: 'hidden',
      userSelect: 'none',
    };
    
    switch (obj.type) {
      case 'rectangle':
      case 'square':
        return (
          <React.Fragment key={obj.id}>
            <div
              style={{
                ...style,
                width: obj.width,
                height: obj.height,
                backgroundColor: obj.color,
                borderRadius: '4px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                editObjectText(obj);
              }}
            >
              {obj.text}
            </div>
            {renderResizeHandles(obj)}
          </React.Fragment>
        );
      
      case 'circle':
        return (
          <React.Fragment key={obj.id}>
            <div
              style={{
                ...style,
                width: obj.radius * 2,
                height: obj.radius * 2,
                backgroundColor: obj.color,
                borderRadius: '50%',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                editObjectText(obj);
              }}
            >
              {obj.text}
            </div>
            {renderResizeHandles(obj)}
          </React.Fragment>
        );
      
      case 'triangle':
        return (
          <React.Fragment key={obj.id}>
            <div
              style={{
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                editObjectText(obj);
              }}
            >
              <svg width={obj.width} height={obj.height}>
                <polygon
                  points={`${obj.width/2},0 ${obj.width},${obj.height} 0,${obj.height}`}
                  fill={obj.color}
                  stroke={isSelected ? '#3b82f6' : 'none'}
                  strokeWidth="2"
                />
                <text
                  x={obj.width/2}
                  y={obj.height * 0.65}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="500"
                  fill={darkMode ? '#f1f5f9' : '#1f2937'}
                >
                  {obj.text}
                </text>
              </svg>
            </div>
            {renderResizeHandles(obj)}
          </React.Fragment>
        );
      
      case 'table':
        return (
          <React.Fragment key={obj.id}>
            <div
              style={{
                ...style,
                display: 'grid',
                gridTemplateColumns: `repeat(${obj.cols}, ${obj.cellWidth}px)`,
                gap: '1px',
                backgroundColor: darkMode ? '#475569' : '#e5e7eb',
                padding: '1px',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
                setShowTableEditor(obj.id);
              }}
            >
              {obj.cells.map((cell, i) => (
                <div
                  key={i}
                  style={{
                    width: obj.cellWidth,
                    height: obj.cellHeight,
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    editTableCell(obj, i);
                  }}
                >
                  {cell.media && (
                    cell.media.type === 'image' ? (
                      <img src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
                    ) : cell.media.type === 'video' ? (
                      <video src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%' }} controls />
                    ) : cell.media.type === 'gif' ? (
                      <img src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
                    ) : null
                  )}
                  {!cell.media && !cell.nestedTable && cell.content}
                  {cell.nestedTable && (
                    <div style={{ fontSize: '10px', display: 'grid', gridTemplateColumns: `repeat(${cell.nestedTable.cols}, 1fr)`, gap: '1px', width: '90%', height: '90%' }}>
                      {cell.nestedTable.cells.map((nc, ni) => (
                        <div key={ni} style={{ border: '1px solid #cbd5e1', padding: '2px', fontSize: '8px' }}>
                          {nc.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {renderResizeHandles(obj)}
            {showTableEditor === obj.id && (
              <div style={{
                position: 'absolute',
                left: obj.x + (obj.cols * obj.cellWidth) + 10,
                top: obj.y,
                backgroundColor: darkMode ? '#1e293b' : 'white',
                border: `1px solid ${darkMode ? '#475569' : '#e5e7eb'}`,
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 1000,
              }}>
                <button onClick={() => addTableRow(obj)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>+ Row</button>
                <button onClick={() => addTableColumn(obj)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>+ Column</button>
                <button onClick={() => deleteTableRow(obj)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>- Row</button>
                <button onClick={() => deleteTableColumn(obj)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>- Column</button>
                <button onClick={() => setShowTableEditor(null)} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px' }}>Close</button>
              </div>
            )}
          </React.Fragment>
        );
      
      case 'drawing':
        return (
          <svg
            key={obj.id}
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
              points={obj.path.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={obj.color}
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'text':
        return (
          <div
            key={obj.id}
            style={{
              ...style,
              fontSize: obj.fontSize,
              color: obj.color,
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'pre-wrap',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(obj);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              editObjectText(obj);
            }}
          >
            {obj.text}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const renderFolderTree = (parentId = null, depth = 0) => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    const childFiles = files.filter(f => f.folderId === parentId);
    
    return (
      <>
        {childFolders.map(folder => (
          <div key={folder.id} style={{ marginBottom: '0.5rem' }}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, folder, 'folder')}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder)}
              style={{
                paddingLeft: `${depth * 1.5}rem`,
                padding: '0.625rem',
                paddingLeft: `${0.625 + depth * 1.5}rem`,
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              <span onClick={() => toggleFolder(folder.id)}>
                {expandedFolders.has(folder.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <span onClick={() => toggleFolder(folder.id)} style={{ flex: 1 }}>
                📁 {folder.name}
              </span>
              <Plus
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  createFile(folder.id);
                }}
                style={{ opacity: 0.7 }}
                title="Add file"
              />
              <FolderPlus
                size={14}
                onClick={(e) => {
                  e.stopPropagation();
                  createFolder(folder.id);
                }}
                style={{ opacity: 0.7 }}
                title="Add subfolder"
              />
              <Trash2
                size={14}
                onClick={(e) => deleteFolder(folder.id, e)}
                style={{ opacity: 0.7 }}
              />
            </div>
            
            {expandedFolders.has(folder.id) && (
              <div>
                {renderFolderTree(folder.id, depth + 1)}
              </div>
            )}
          </div>
        ))}
        
        {childFiles.map(file => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, file, 'file')}
            style={{
              paddingLeft: `${depth * 1.5}rem`,
              padding: '0.5rem',
              paddingLeft: `${0.5 + depth * 1.5}rem`,
              backgroundColor: currentFile?.id === file.id 
                ? (darkMode ? '#3b82f6' : '#60a5fa')
                : (darkMode ? '#475569' : '#cbd5e1'),
              borderRadius: '6px',
              marginBottom: '0.25rem',
              marginLeft: `${depth > 0 ? '1.5rem' : '0'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}
            onClick={() => openFile(file)}
          >
            <span>📄 {file.name}</span>
            <Trash2
              size={14}
              onClick={(e) => deleteFile(file.id, e)}
              style={{ cursor: 'pointer', opacity: 0.7 }}
            />
          </div>
        ))}
      </>
    );
  };
  
  const getBackgroundStyle = () => {
    const baseColor = darkMode ? '#1e293b' : '#f8fafc';
    const lineColor = darkMode ? '#334155' : '#e2e8f0';
    
    if (backgroundPattern === 'grid') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `
          linear-gradient(${lineColor} 1px, transparent 1px),
          linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      };
    } else if (backgroundPattern === 'lines') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    } else {
      return {
        backgroundColor: baseColor,
      };
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Outfit", system-ui, sans-serif',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
          width: '400px',
          maxWidth: '90vw',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}>
            SketchSpace
          </h1>
          <p style={{
            color: '#6b7280',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            {authMode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
          
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setPassword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      fontFamily: '"Outfit", system-ui, sans-serif',
      backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
      color: darkMode ? 'white' : '#1f2937',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: darkMode ? '#1e293b' : '#ffffff',
        borderRight: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 12px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            SketchSpace
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {currentUser}
          </p>
        </div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
        >
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}>
            <button
              onClick={() => createFolder()}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                border: 'none',
                borderRadius: '8px',
                color: darkMode ? 'white' : '#1f2937',
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
                padding: '0.5rem',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <File size={16} />
              File
            </button>
          </div>
          
          {renderFolderTree()}
        </div>
        
        <div style={{
          padding: '1rem',
          borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          gap: '0.5rem',
        }}>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: '0.625rem',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { tool: 'select', icon: Move, label: 'Select' },
              { tool: 'rectangle', icon: Square, label: 'Rectangle' },
              { tool: 'square', icon: Square, label: 'Square' },
              { tool: 'circle', icon: Circle, label: 'Circle' },
              { tool: 'triangle', icon: Triangle, label: 'Triangle' },
              { tool: 'table', icon: Table, label: 'Table' },
              { tool: 'draw', icon: Pencil, label: 'Draw' },
              { tool: 'connect', icon: Link, label: 'Connect' },
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => {
                  setSelectedTool(tool);
                  if (tool !== 'connect') setConnectingFrom(null);
                }}
                title={label}
                style={{
                  padding: '0.625rem',
                  backgroundColor: selectedTool === tool ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                  border: 'none',
                  borderRadius: '8px',
                  color: selectedTool === tool ? 'white' : (darkMode ? 'white' : '#1f2937'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
          
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
          }} />
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={convertDrawingToShape}
              title="Convert Drawing to Shape"
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
              <Wand2 size={16} />
              To Shape
            </button>
            
            <button
              onClick={convertDrawingToText}
              title="Convert Drawing to Text"
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#ec4899',
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
              To Text
            </button>
            
            <button
              onClick={addAnimation}
              title="Add Animation"
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: '#14b8a6',
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
              <Settings size={16} />
              Animate
            </button>
            
            <button
              onClick={playAnimations}
              disabled={isPlaying || animations.length === 0}
              title="Play Animations"
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: animations.length > 0 && !isPlaying ? '#10b981' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: animations.length > 0 && !isPlaying ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <Play size={16} />
              Play
            </button>
          </div>
          
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
          }} />
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark Mode"
              style={{
                padding: '0.625rem',
                backgroundColor: darkMode ? '#fbbf24' : '#1f2937',
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
                accept=".json,.one"
                onChange={(e) => {
                  if (e.target.files[0]?.name.endsWith('.one')) {
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
          onClick={() => {
            setSelectedObject(null);
            setConnectingFrom(null);
            setShowTableEditor(null);
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
    </div>
  );
};

export default SketchCanvas;
