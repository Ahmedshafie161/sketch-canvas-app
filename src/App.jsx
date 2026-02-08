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
// Removed useUI and useCanvasRefs (state will be in parent)
import useCanvasMouseHandlers from './hooks/useCanvasMouseHandlers';
import useAppEffects from './components/hooks/useAppEffects';
import useCanvasUIHandlers from './hooks/useCanvasUIHandlers';
// Removed useAppState (state will be in parent)
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
  // All state is now in parent
  const [darkMode, setDarkMode] = React.useState(false);
  const [backgroundPattern, setBackgroundPattern] = React.useState('grid');
  const [showTableEditor, setShowTableEditor] = React.useState(null);
  const [resizingObject, setResizingObject] = React.useState(null);
  const [resizeHandle, setResizeHandle] = React.useState(null);
  const [editingCell, setEditingCell] = React.useState(null);
  const [cellMediaMenu, setCellMediaMenu] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState(null);
  const [canvasOffset, setCanvasOffset] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState(null);
  const [canvasScale, setCanvasScale] = React.useState(1);
  const [dragStart, setDragStart] = React.useState(null);
  const [isDraggingObject, setIsDraggingObject] = React.useState(false);
  const canvasRef = React.useRef(null);

  // Pass all setters to useAuth so it can clear state on logout/login
  const auth = useAuth(
    setCurrentUser,
    setIsAuthenticated,
    setFolders,
    setFiles,
    setCurrentFile,
    setCanvasObjects,
    setConnections
  );
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
    // Pass all props required by AuthForm
    return (
      <AuthForm
        authMode={auth.authMode}
        setAuthMode={auth.setAuthMode}
        username={auth.username}
        setUsername={auth.setUsername}
        password={auth.password}
        setPassword={auth.setPassword}
        handleAuth={auth.handleAuth}
      />
    );
  }

  const canvasMouseHandlers = useCanvasMouseHandlers({
    canvasRef,
    canvasObjects,
    setCanvasObjects,
    selectedTool,
    setSelectedTool,
    selectedObject,
    setSelectedObject,
    isDrawing,
    setIsDrawing,
    drawingPath,
    setDrawingPath,
    setConnectingFrom,
    darkMode,
    setResizingObject,
    setResizeHandle,
    resizingObject,
    resizeHandle,
    dragStart,
    setDragStart,
    isDraggingObject,
    setIsDraggingObject,
    canvasScale,
    canvasOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    currentFile,
    setShowTableEditor,
    setContextMenu,
    setCellMediaMenu
  });

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
          onMouseDown={canvasMouseHandlers.handleCanvasMouseDown}
          onMouseMove={canvasMouseHandlers.handleCanvasMouseMove}
          onMouseUp={canvasMouseHandlers.handleCanvasMouseUp}
          onTouchStart={canvasMouseHandlers.handleCanvasMouseDown}
          onTouchMove={canvasMouseHandlers.handleCanvasMouseMove}
          onTouchEnd={canvasMouseHandlers.handleCanvasMouseUp}
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