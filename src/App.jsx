import React from 'react';
import FileTree from './components/filetree/FileTree';
import Sidebar from './components/ui/Sidebar';
import './App.css';
import CanvasObject from './components/canvas/CanvasObject';
import CanvasObjectsList from './components/canvas/CanvasObjectsList';
import CanvasConnections from './components/canvas/CanvasConnections';
import RenderObject from './components/render/RenderObject';
import RenderNestedTable from './components/render/RenderNestedTable';
import RenderFileTree from './components/render/RenderFileTree';
import AuthForm from './components/form/AuthForm';
import NoFileSelected from './components/ui/NoFileSelected';
import ContextMenu from './components/ui/ContextMenu';
import CellMediaMenu from './components/ui/CellMediaMenu';
import useAuth from './components/hooks/useAuth';
import useFolders from './components/hooks/useFolders';
import useCanvas from './components/hooks/useCanvas';
import useUI from './components/hooks/useUI';
import useCanvasRefs from './components/hooks/useCanvasRefs';
import useAppEffects from './components/hooks/useAppEffects';
import useCanvasUIHandlers from './hooks/useCanvasUIHandlers';
import useAppState from './hooks/useAppState';
import useTableHandlers from './hooks/useTableHandlers';
import useCanvasHandlers from './hooks/useCanvasHandlers';
import Toolbar from './components/ui/Toolbar';
import { getConnectionPoints } from './utils/canvasUtils';
import { exportCanvas, importCanvas } from './components/CanvasImportExport';


const SketchCanvas = () => {
  // App state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentFile, setCurrentFile] = React.useState(null);

  // Hooks
  const [folders, setFolders] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const [expandedFolders, setExpandedFolders] = React.useState(new Set());
  const [canvasObjects, setCanvasObjects] = React.useState([]);
  const [selectedTool, setSelectedTool] = React.useState('select');
  const [selectedObject, setSelectedObject] = React.useState(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [drawingPath, setDrawingPath] = React.useState([]);
  const [connections, setConnections] = React.useState([]);
  const [connectingFrom, setConnectingFrom] = React.useState(null);
  const [animations, setAnimations] = React.useState([]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const auth = useAuth(setCurrentUser, setIsAuthenticated);
  const foldersState = useFolders({
    folders, setFolders, files, setFiles, expandedFolders, setExpandedFolders,
    setCurrentFile, setCanvasObjects, setConnections, setAnimations
  });
  const { createFolder, createFile, openFile } = foldersState;
  const canvasState = useCanvas({
    canvasObjects, setCanvasObjects, selectedTool, setSelectedTool, selectedObject, setSelectedObject,
    isDrawing, setIsDrawing, drawingPath, setDrawingPath, connections, setConnections,
    connectingFrom, setConnectingFrom, animations, setAnimations, isPlaying, setIsPlaying
  });
  const ui = useUI();
  const { darkMode, setDarkMode, backgroundPattern, setBackgroundPattern, showTableEditor, setShowTableEditor, resizingObject, setResizingObject, resizeHandle, setResizeHandle, editingCell, setEditingCell, cellMediaMenu, setCellMediaMenu } = ui;
  const appState = useAppState();
  const { contextMenu, setContextMenu, canvasOffset, setCanvasOffset, isPanning, setIsPanning, panStart, setPanStart, canvasScale, setCanvasScale } = appState;
  const canvasRefs = useCanvasRefs();
  const { canvasRef } = canvasRefs;

  // Handlers
  const { handleConnect, deleteSelected } = useCanvasHandlers({ connectingFrom, setConnectingFrom, setConnections, connections, setCanvasObjects, canvasObjects, selectedObject, setSelectedObject });
  const { handleObjectDoubleClick, handleCellEdit, handleImageUpload, handleVideoUpload, handleNestedTableAdd } = useTableHandlers({ setCanvasObjects, canvasObjects, setShowTableEditor });
  const {
    convertDrawingToText,
    convertDrawingToShape,
    handleContextMenu,
    handleCellMediaMenu,
    getBackgroundStyle
  } = useCanvasUIHandlers({
    canvasObjects,
    setCanvasObjects,
    setSelectedObject,
    setContextMenu,
    setCellMediaMenu,
    setEditingCell,
    darkMode,
    backgroundPattern
  });

  // Handlers for sidebar and filetree
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); localStorage.removeItem('canvasAuth'); };
  const handleDragStart = (e, item, type) => {
    e.dataTransfer.setData('item', JSON.stringify(item));
    e.dataTransfer.setData('type', type);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('item'));
    const type = e.dataTransfer.getData('type');
    if (type === 'folder' && targetFolder) {
      setFolders(prev => prev.map(f => f.id === item.id ? { ...f, parentId: targetFolder.id } : f));
    } else if (type === 'file' && targetFolder) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, folderId: targetFolder.id } : f));
    }
  };
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };
  const deleteFolder = (folderId, e) => {
    if (e) e.stopPropagation();
    setFolders(prev => prev.filter(f => f.id !== folderId && f.parentId !== folderId));
    setFiles(prev => prev.filter(f => f.folderId !== folderId));
  };
  const deleteFile = (fileId, e) => {
    if (e) e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  const saveCurrentFile = () => {};
  const importOneNote = () => {};
  // Drag and resize state
  const [dragStart, setDragStart] = React.useState(null);
  const [isDraggingObject, setIsDraggingObject] = React.useState(false);
  const [resizingObject, setResizingObject] = React.useState(null);
  const [resizeHandle, setResizeHandle] = React.useState(null);

  // Utility to get canvas coordinates
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
    return { x, y };
  };

  // Helper for hit testing
  const isPointInObject = (point, obj) => {
    return point.x >= obj.x && point.x <= obj.x + obj.width && point.y >= obj.y && point.y <= obj.y + obj.height;
  };

  // Helper for resize handle
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

  const handleCanvasMouseDown = (e) => {
    if (!currentFile) return;
    const pos = getCanvasCoords(e);
    // Handle panning (if you have panning logic)
    // ...
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
      setDrawingPath(prev => [...prev, pos]);
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
    if (isDrawing && selectedTool === 'draw' && drawingPath.length > 0) {
      const newObject = {
        id: Date.now(),
        type: 'drawing',
        path: [...drawingPath],
        x: Math.min(...drawingPath.map(p => p.x)),
        y: Math.min(...drawingPath.map(p => p.y)),
        width: Math.max(...drawingPath.map(p => p.x)) - Math.min(...drawingPath.map(p => p.x)),
        height: Math.max(...drawingPath.map(p => p.y)) - Math.min(...drawingPath.map(p => p.y)),
        strokeColor: darkMode ? '#f1f5f9' : '#000000',
        strokeWidth: 2,
      };
      setCanvasObjects(prev => [...prev, newObject]);
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
        setCanvasObjects(prev => [...prev, newObject]);
        setSelectedTool('select');
      }
    }
    setIsDrawing(false);
    setIsDraggingObject(false);
    setDragStart(null);
    setResizingObject(null);
    setResizeHandle(null);
  };

  // Effects
  useAppEffects({
    canvasRef,
    canvasScale,
    setCanvasOffset,
    setCanvasScale,
    setIsPanning,
    setPanStart,
    setIsDrawing,
    setDrawingPath,
    setSelectedObject,
    setConnectingFrom,
    setShowTableEditor,
    setContextMenu,
    setCellMediaMenu,
    isAuthenticated,
    setCurrentUser,
    setIsAuthenticated,
    loadUserData: () => {},
    darkMode,
    setDarkMode,
    folders,
    files,
    saveUserData: () => {},
    currentFile,
    canvasObjects,
    connections,
    animations
  });

  if (!isAuthenticated) {
    return <AuthForm {...auth} />;
  }

  return (
    <div className="app-root" style={{
      '--app-bg': darkMode ? '#0f172a' : '#f8fafc',
      '--app-fg': darkMode ? '#f1f5f9' : '#1e293b',
    }}>
      <Sidebar
        darkMode={darkMode}
        handleLogout={handleLogout}
        createFolder={createFolder}
        createFile={createFile}
        folders={folders}
        files={files}
        expandedFolders={expandedFolders}
        currentFile={currentFile}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        toggleFolder={toggleFolder}
        deleteFolder={deleteFolder}
        deleteFile={deleteFile}
        openFile={openFile}
        currentUser={currentUser}
      />
      <div className="main-area">
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          backgroundPattern={backgroundPattern}
          setBackgroundPattern={setBackgroundPattern}
          selectedObject={selectedObject}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
          saveCurrentFile={saveCurrentFile}
          currentFile={currentFile}
          exportCanvas={() => exportCanvas(canvasObjects, connections, animations, currentFile)}
          importOneNote={importOneNote}
          importCanvas={(e) => importCanvas(e, setCanvasObjects, setConnections, setAnimations)}
          deleteSelected={deleteSelected}
          connectingFrom={connectingFrom}
        />
        <div
          ref={canvasRef}
          className="canvas"
          style={{
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
          <CanvasConnections
            connections={connections}
            canvasObjects={canvasObjects}
            getConnectionPoints={getConnectionPoints}
          />
          <CanvasObjectsList
            canvasObjects={canvasObjects}
            selectedObject={selectedObject}
            selectedTool={selectedTool}
            darkMode={darkMode}
            setSelectedObject={setSelectedObject}
            handleConnect={handleConnect}
            handleObjectDoubleClick={handleObjectDoubleClick}
          />
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
          {!currentFile && <NoFileSelected darkMode={darkMode} />}
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          darkMode={darkMode}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
          setContextMenu={setContextMenu}
        />
      )}
      {cellMediaMenu && (
        <CellMediaMenu
          cellMediaMenu={cellMediaMenu}
          darkMode={darkMode}
          handleImageUpload={handleImageUpload}
          handleVideoUpload={handleVideoUpload}
          handleNestedTableAdd={handleNestedTableAdd}
          handleCellEdit={handleCellEdit}
          setCellMediaMenu={setCellMediaMenu}
        />
      )}
    </div>
  );
};

export default SketchCanvas;