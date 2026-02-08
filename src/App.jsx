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
import Toolbar from './components/ui/Toolbar';

const SketchCanvas = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const auth = useAuth(setCurrentUser, setIsAuthenticated);

  // Folder/file state
  const foldersState = useFolders();
  const { folders, setFolders, files, setFiles, expandedFolders, setExpandedFolders, createFolder, createFile, openFile } = foldersState;
  const [currentFile, setCurrentFile] = React.useState(null);

  // Canvas state
  const canvasState = useCanvas();
  const { canvasObjects, setCanvasObjects, selectedTool, setSelectedTool, selectedObject, setSelectedObject, isDrawing, setIsDrawing, drawingPath, setDrawingPath, connections, setConnections, connectingFrom, setConnectingFrom, animations, setAnimations, isPlaying, setIsPlaying } = canvasState;

  // UI state
  const ui = useUI();
  const { darkMode, setDarkMode, backgroundPattern, setBackgroundPattern, showTableEditor, setShowTableEditor, resizingObject, setResizingObject, resizeHandle, setResizeHandle, editingCell, setEditingCell, cellMediaMenu, setCellMediaMenu } = ui;

  // UI handlers moved to hooks/useCanvasUIHandlers.js
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
  
  // Render logic moved to components/RenderObject.jsx, components/RenderNestedTable.jsx, and components/RenderFileTree.jsx
  // Use these components in place of the previous render functions
  
  if (!isAuthenticated) {
    return (
      <AuthForm />
    );
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
      
      {/* Main Area */}
      <div className="main-area">
        {/* Toolbar */}
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
          exportCanvas={exportCanvas}
          importOneNote={importOneNote}
          importCanvas={importCanvas}
          deleteSelected={deleteSelected}
          connectingFrom={connectingFrom}
        />
        
        {/* Canvas */}
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
          {/* Render connections */}
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
      
      {/* Context Menu for Drawing Objects */}
      {contextMenu && (
        <ContextMenu
          contextMenu={contextMenu}
          darkMode={darkMode}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
          setContextMenu={setContextMenu}
        />
      )}

      {/* Context Menu for Cell Media */}
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