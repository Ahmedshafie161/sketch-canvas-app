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
  const auth = useAuth(setCurrentUser, setIsAuthenticated);
  const foldersState = useFolders();
  const { folders, setFolders, files, setFiles, expandedFolders, setExpandedFolders, createFolder, createFile, openFile } = foldersState;
  const canvasState = useCanvas();
  const { canvasObjects, setCanvasObjects, selectedTool, setSelectedTool, selectedObject, setSelectedObject, isDrawing, setIsDrawing, drawingPath, setDrawingPath, connections, setConnections, connectingFrom, setConnectingFrom, animations, setAnimations, isPlaying, setIsPlaying } = canvasState;
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

  // Placeholder handlers for missing logic
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); localStorage.removeItem('canvasAuth'); };
  const handleDragStart = () => {};
  const handleDragOver = () => {};
  const handleDrop = () => {};
  const toggleFolder = () => {};
  const deleteFolder = () => {};
  const deleteFile = () => {};
  const saveCurrentFile = () => {};
  const importOneNote = () => {};
  const handleCanvasMouseDown = () => {};
  const handleCanvasMouseMove = () => {};
  const handleCanvasMouseUp = () => {};

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