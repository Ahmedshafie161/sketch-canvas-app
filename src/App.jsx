import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import AuthScreen from './components/AuthScreen';
import ContextMenus from './components/ContextMenus';
import { useAuth } from './hooks/useAuth';
import { useCanvas } from './hooks/useCanvas';
import { useFileSystem } from './hooks/useFileSystem';
import { useDarkMode } from './hooks/useDarkMode';

const SketchCanvas = () => {
  const canvasRef = React.useRef(null);
  
  // Dark mode
  const { darkMode, setDarkMode } = useDarkMode();
  
  // Authentication
  const {
    isAuthenticated,
    currentUser,
    authMode,
    username,
    password,
    setAuthMode,
    setUsername,
    setPassword,
    handleAuth,
    handleLogout,
  } = useAuth();

  // File System
  const {
    folders,
    files,
    currentFile,
    expandedFolders,
    draggedItem,
    setFolders,
    setFiles,
    setCurrentFile,
    setExpandedFolders,
    setDraggedItem,
    createFolder,
    createFile,
    openFile,
    saveCurrentFile,
    deleteFile,
    deleteFolder,
    toggleFolder,
    handleDragStart,
    handleDragOver,
    handleDrop,
    exportCanvas,
    importCanvas,
    importOneNote,
  } = useFileSystem(isAuthenticated, currentUser);

  // Canvas State
  const {
    canvasObjects,
    selectedTool,
    selectedObject,
    isDrawing,
    drawingPath,
    connections,
    connectingFrom,
    animations,
    backgroundPattern,
    showTableEditor,
    contextMenu,
    cellMediaMenu,
    canvasOffset,
    canvasScale,
    setCanvasObjects,
    setSelectedTool,
    setSelectedObject,
    setIsDrawing,
    setDrawingPath,
    setConnections,
    setConnectingFrom,
    setAnimations,
    setBackgroundPattern,
    setShowTableEditor,
    setContextMenu,
    setCellMediaMenu,
    setCanvasOffset,
    setCanvasScale,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleConnect,
    deleteSelected,
    handleObjectDoubleClick,
    handleCellEdit,
    handleImageUpload,
    handleVideoUpload,
    handleNestedTableAdd,
    convertDrawingToText,
    convertDrawingToShape,
    handleCellMediaMenu,
  } = useCanvas(currentFile, files, setFiles, darkMode, canvasRef);

  // Sync canvas objects with current file
  React.useEffect(() => {
    if (currentFile && isAuthenticated) {
      const updatedFiles = files.map(f =>
        f.id === currentFile.id
          ? { ...f, objects: canvasObjects, connections: connections, animations: animations }
          : f
      );
      setFiles(updatedFiles);
    }
  }, [canvasObjects, connections, animations]);

  if (!isAuthenticated) {
    return (
      <AuthScreen
        authMode={authMode}
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        setAuthMode={setAuthMode}
        handleAuth={handleAuth}
      />
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
      <Sidebar
        currentUser={currentUser}
        folders={folders}
        files={files}
        currentFile={currentFile}
        expandedFolders={expandedFolders}
        darkMode={darkMode}
        createFolder={createFolder}
        createFile={createFile}
        openFile={openFile}
        deleteFile={deleteFile}
        deleteFolder={deleteFolder}
        toggleFolder={toggleFolder}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleLogout={handleLogout}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar
          selectedTool={selectedTool}
          selectedObject={selectedObject}
          currentFile={currentFile}
          connectingFrom={connectingFrom}
          darkMode={darkMode}
          backgroundPattern={backgroundPattern}
          setSelectedTool={setSelectedTool}
          setDarkMode={setDarkMode}
          setBackgroundPattern={setBackgroundPattern}
          saveCurrentFile={saveCurrentFile}
          exportCanvas={exportCanvas}
          importCanvas={importCanvas}
          importOneNote={importOneNote}
          deleteSelected={deleteSelected}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
        />

        <Canvas
          canvasRef={canvasRef}
          currentFile={currentFile}
          canvasObjects={canvasObjects}
          connections={connections}
          isDrawing={isDrawing}
          drawingPath={drawingPath}
          selectedObject={selectedObject}
          selectedTool={selectedTool}
          darkMode={darkMode}
          backgroundPattern={backgroundPattern}
          showTableEditor={showTableEditor}
          canvasOffset={canvasOffset}
          canvasScale={canvasScale}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseUp={handleCanvasMouseUp}
          handleObjectDoubleClick={handleObjectDoubleClick}
          handleConnect={handleConnect}
          setSelectedObject={setSelectedObject}
          setConnectingFrom={setConnectingFrom}
          setShowTableEditor={setShowTableEditor}
          setContextMenu={setContextMenu}
          setCellMediaMenu={setCellMediaMenu}
          handleCellEdit={handleCellEdit}
          handleCellMediaMenu={handleCellMediaMenu}
        />
      </div>

      <ContextMenus
        contextMenu={contextMenu}
        cellMediaMenu={cellMediaMenu}
        darkMode={darkMode}
        setContextMenu={setContextMenu}
        setCellMediaMenu={setCellMediaMenu}
        convertDrawingToText={convertDrawingToText}
        convertDrawingToShape={convertDrawingToShape}
        handleImageUpload={handleImageUpload}
        handleVideoUpload={handleVideoUpload}
        handleNestedTableAdd={handleNestedTableAdd}
        handleCellEdit={handleCellEdit}
      />
    </div>
  );
};

export default SketchCanvas;
