import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EnhancedToolbar from './components/EnhancedToolbar';
import Canvas from './components/Canvas';
import AuthScreen from './components/AuthScreen';
import EnhancedContextMenus from './components/EnhancedContextMenus';
import { useAuth } from './hooks/useAuth';
import { useCanvas } from './hooks/useCanvas';
import { useEnhancedFileSystem } from './hooks/useEnhancedFileSystem';
import { useDarkMode } from './hooks/useDarkMode';
import { useEnhancedCanvasHandlers } from './hooks/useEnhancedCanvasHandlers';
import { ocrProcessor } from './utils/ocr';

const EnhancedSketchCanvas = () => {
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

  // Enhanced File System with database
  const {
    folders,
    files,
    currentFile,
    expandedFolders,
    draggedItem,
    syncEnabled,
    setFolders,
    setFiles,
    setCurrentFile,
    setExpandedFolders,
    setDraggedItem,
    createFolder,
    createFile,
    openFile,
    saveCurrentFile,
    saveFileToDatabase,
    deleteFile,
    deleteFolder,
    toggleFolder,
    handleDragStart,
    handleDragOver,
    handleDrop,
    exportCanvas,
    importCanvas,
    importPDF,
    enableCloudSync,
    syncFromCloud,
  } = useEnhancedFileSystem(isAuthenticated, currentUser);

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
  } = useCanvas(currentFile, files, setFiles, darkMode, canvasRef);

  // Enhanced Canvas Handlers
  const {
    handleObjectDoubleClick,
    handleCellEdit,
    handleImageUpload,
    handleGifUpload,
    handleVideoUpload,
    handleNestedTableAdd,
    handleVoiceRecording,
    handleStopVoiceRecording,
    handleMergeCells,
    handleSplitCell,
    handleAddRow,
    handleAddColumn,
    handleDeleteRow,
    handleDeleteColumn,
    convertDrawingToText,
    convertDrawingToShape,
    handleCellMediaMenu,
    addAnimation,
    removeAnimation,
    playAnimations,
  } = useEnhancedCanvasHandlers(
    canvasObjects,
    setCanvasObjects,
    setSelectedObject,
    currentFile,
    animations,
    setAnimations
  );

  // Handle PDF import with OCR
  const handlePDFImport = async (objId, row, col, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const pages = await ocrProcessor.extractTextFromPDF(file);
      
      if (pages.length > 0) {
        const firstPage = pages[0];
        
        // Add image to cell
        handleCellEdit(objId, row, col, {
          image: firstPage.image,
          text: firstPage.text || '',
          video: null,
          gif: null,
          audio: null,
          nestedTable: null
        });

        alert(`PDF imported! Extracted text from ${pages.length} page(s)`);
      }
    } catch (error) {
      console.error('PDF import error:', error);
      alert('Failed to import PDF: ' + error.message);
    }
  };

  // Sync canvas objects with current file and save to database
  useEffect(() => {
    if (currentFile && isAuthenticated) {
      const updatedFile = {
        ...currentFile,
        objects: canvasObjects,
        connections: connections,
        animations: animations
      };

      // Update files array
      const updatedFiles = files.map(f =>
        f.id === currentFile.id ? updatedFile : f
      );
      setFiles(updatedFiles);

      // Auto-save to database (debounced)
      const timeoutId = setTimeout(() => {
        saveFileToDatabase(updatedFile);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [canvasObjects, connections, animations]);

  // Cleanup OCR on unmount
  useEffect(() => {
    return () => {
      ocrProcessor.terminate();
    };
  }, []);

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
        <EnhancedToolbar
          selectedTool={selectedTool}
          selectedObject={selectedObject}
          currentFile={currentFile}
          connectingFrom={connectingFrom}
          darkMode={darkMode}
          backgroundPattern={backgroundPattern}
          syncEnabled={syncEnabled}
          animations={animations}
          setSelectedTool={setSelectedTool}
          setDarkMode={setDarkMode}
          setBackgroundPattern={setBackgroundPattern}
          saveCurrentFile={saveCurrentFile}
          exportCanvas={exportCanvas}
          importCanvas={importCanvas}
          importPDF={importPDF}
          deleteSelected={deleteSelected}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
          addAnimation={addAnimation}
          removeAnimation={removeAnimation}
          playAnimations={playAnimations}
          enableCloudSync={enableCloudSync}
          syncFromCloud={syncFromCloud}
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
          // Enhanced handlers
          handleImageUpload={handleImageUpload}
          handleGifUpload={handleGifUpload}
          handleVideoUpload={handleVideoUpload}
          handleNestedTableAdd={handleNestedTableAdd}
          handleVoiceRecording={handleVoiceRecording}
          handleMergeCells={handleMergeCells}
          handleSplitCell={handleSplitCell}
          handleAddRow={handleAddRow}
          handleAddColumn={handleAddColumn}
          handleDeleteRow={handleDeleteRow}
          handleDeleteColumn={handleDeleteColumn}
        />
      </div>

      <EnhancedContextMenus
        contextMenu={contextMenu}
        cellMediaMenu={cellMediaMenu}
        darkMode={darkMode}
        setContextMenu={setContextMenu}
        setCellMediaMenu={setCellMediaMenu}
        convertDrawingToText={convertDrawingToText}
        convertDrawingToShape={convertDrawingToShape}
        handleImageUpload={handleImageUpload}
        handleGifUpload={handleGifUpload}
        handleVideoUpload={handleVideoUpload}
        handleNestedTableAdd={handleNestedTableAdd}
        handleCellEdit={handleCellEdit}
        handleVoiceRecording={handleVoiceRecording}
        handleStopVoiceRecording={handleStopVoiceRecording}
        handlePDFImport={handlePDFImport}
      />
    </div>
  );
};

export default EnhancedSketchCanvas;
