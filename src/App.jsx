import React, { useState, useRef, useEffect } from 'react';
import { Plus, Square, Circle, Triangle, Table, Pencil, FolderPlus, File, Save, LogOut, Trash2, Download, Upload, Wand2, Type, ChevronRight, ChevronDown, Move, Edit3, Link } from 'lucide-react';

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
  
  // Auto-save current file whenever canvas changes
  useEffect(() => {
    if (currentFile && isAuthenticated) {
      const updatedFiles = files.map(f => 
        f.id === currentFile.id 
          ? { ...f, objects: canvasObjects, connections: connections } 
          : f
      );
      setFiles(updatedFiles);
    }
  }, [canvasObjects, connections]);
  
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
        createdAt: new Date().toISOString(),
      };
      setFiles([...files, newFile]);
      setCurrentFile(newFile);
      setCanvasObjects([]);
      setConnections([]);
    }
  };
  
  const openFile = (file) => {
    setCurrentFile(file);
    setCanvasObjects(file.objects || []);
    setConnections(file.connections || []);
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
  
  const handleCanvasMouseMove = (e) => {
    if (isDrawing && selectedTool === 'draw') {
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
  
  const convertDrawingToShape = () => {
    const lastDrawing = [...canvasObjects].reverse().find(obj => obj.type === 'drawing');
    if (!lastDrawing) {
      alert('No drawing found to convert!');
      return;
    }
    
    const bounds = getPathBounds(lastDrawing.path);
    
    const newShape = {
      id: Date.now(),
      type: 'rectangle',
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
      color: '#a78bfa',
      text: '',
    };
    
    const filtered = canvasObjects.filter(obj => obj.id !== lastDrawing.id);
    setCanvasObjects([...filtered, newShape]);
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
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
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
  
  const exportCanvas = () => {
    const dataStr = JSON.stringify({ 
      objects: canvasObjects,
      connections: connections 
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
        alert('Canvas imported successfully!');
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
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
    }
    return {
      x: obj.x + (obj.width || 0) / 2,
      y: obj.y + (obj.height || 0) / 2,
    };
  };
  
  const renderObject = (obj) => {
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
      color: '#1f2937',
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
          <div
            key={obj.id}
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
        );
      
      case 'circle':
        return (
          <div
            key={obj.id}
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
        );
      
      case 'triangle':
        return (
          <div
            key={obj.id}
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
                fill="#1f2937"
              >
                {obj.text}
              </text>
            </svg>
          </div>
        );
      
      case 'table':
        return (
          <div
            key={obj.id}
            style={{
              ...style,
              display: 'grid',
              gridTemplateColumns: `repeat(${obj.cols}, ${obj.cellWidth}px)`,
              gap: '1px',
              backgroundColor: '#e5e7eb',
              padding: '1px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(obj);
            }}
          >
            {obj.cells.map((cell, i) => (
              <div
                key={i}
                style={{
                  width: obj.cellWidth,
                  height: obj.cellHeight,
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  overflow: 'hidden',
                }}
              >
                {cell.media && (
                  cell.media.type === 'image' ? (
                    <img src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="" />
                  ) : cell.media.type === 'video' ? (
                    <video src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%' }} controls />
                  ) : cell.media.type === 'gif' ? (
                    <img src={cell.media.url} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="" />
                  ) : null
                )}
                {!cell.media && cell.content}
                {cell.nestedTable && <span style={{ fontSize: '10px' }}>📊</span>}
              </div>
            ))}
          </div>
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
                backgroundColor: '#334155',
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
              backgroundColor: currentFile?.id === file.id ? '#3b82f6' : '#475569',
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
      backgroundColor: '#0f172a',
      color: 'white',
      overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #334155',
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
                backgroundColor: '#334155',
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
          borderTop: '1px solid #334155',
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
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
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
                  backgroundColor: selectedTool === tool ? '#3b82f6' : '#334155',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
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
            backgroundColor: '#334155',
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
          </div>
          
          <div style={{
            width: '1px',
            height: '30px',
            backgroundColor: '#334155',
          }} />
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={saveCurrentFile}
              disabled={!currentFile}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: currentFile ? '#10b981' : '#475569',
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
                accept=".json"
                onChange={importCanvas}
                style={{ display: 'none' }}
              />
            </label>
            
            <button
              onClick={deleteSelected}
              disabled={!selectedObject}
              style={{
                padding: '0.625rem 1rem',
                backgroundColor: selectedObject ? '#ef4444' : '#475569',
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
            backgroundColor: '#f8fafc',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: `
              linear-gradient(#e2e8f0 1px, transparent 1px),
              linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            cursor: selectedTool === 'draw' ? 'crosshair' : selectedTool === 'select' ? 'default' : 'crosshair',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={() => {
            setSelectedObject(null);
            setConnectingFrom(null);
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
                stroke="#000000"
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
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#475569' }}>
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
