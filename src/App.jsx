// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFileManagement } from './hooks/useFileManagement';
import { useCanvas } from './hooks/useCanvas';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ContextMenus from './components/ContextMenus';
import { importOneNote, exportCanvas, importCanvas } from './utils/importExport';

const App = () => {
  const {
    isAuthenticated,
    currentUser,
    authMode,
    setAuthMode,
    username,
    setUsername,
    password,
    setPassword,
    handleAuth,
    handleLogout
  } = useAuth();

  const {
    folders,
    setFolders,
    files,
    setFiles,
    currentFile,
    setCurrentFile,
    expandedFolders,
    saveUserData,
    createFolder,
    createFile,
    openFile,
    deleteFile,
    deleteFolder,
    toggleFolder,
    getAllSubfolders
  } = useFileManagement(currentUser);

  const {
    canvasObjects,
    setCanvasObjects,
    selectedTool,
    setSelectedTool,
    selectedObject,
    setSelectedObject,
    connections,
    setConnections,
    connectingFrom,
    setConnectingFrom,
    canvasRef,
    canvasOffset,
    setCanvasOffset,
    canvasScale,
    setCanvasScale,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    getCanvasCoords,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    deleteSelected,
    handleConnect,
    isDrawing,
    drawingPath
  } = useCanvas(currentFile);

  const [darkMode, setDarkMode] = useState(false);
  const [backgroundPattern, setBackgroundPattern] = useState('grid');
  const [showTableEditor, setShowTableEditor] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellMediaMenu, setCellMediaMenu] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [drawingHistory, setDrawingHistory] = useState([]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (currentFile && isAuthenticated) {
      const updatedFiles = files.map(f => 
        f.id === currentFile.id 
          ? { ...f, objects: canvasObjects, connections: connections } 
          : f
      );
      setFiles(updatedFiles);
    }
  }, [canvasObjects, connections, isAuthenticated]);

  const saveCurrentFile = () => {
    if (currentFile) {
      saveUserData();
      alert('File saved successfully!');
    }
  };

  const handleObjectDoubleClick = (obj, e) => {
    e.stopPropagation();
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
              path: undefined,
              width: Math.max(100, obj.width),
              height: Math.max(40, obj.height)
            }
          : obj
      ));
      setSelectedObject(null);
    }
  };

  const convertDrawingToShape = (drawingId, shapeType) => {
    const drawing = canvasObjects.find(obj => obj.id === drawingId);
    if (!drawing || drawing.type !== 'drawing') return;
    
    setCanvasObjects(canvasObjects.map(obj => 
      obj.id === drawingId 
        ? {
            ...obj,
            type: shapeType,
            path: undefined,
            width: Math.max(50, obj.width),
            height: Math.max(50, obj.height)
          }
        : obj
    ));
    setSelectedObject(null);
  };
// Add these functions in App.jsx after the convertDrawingToShape function

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
        text: '',
        video: null,
        nestedTable: null
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
        text: '',
        image: null,
        nestedTable: null
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
    text: '',
    image: null,
    video: null
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

  const getConnectionPoints = (obj) => {
    return {
      x: obj.x + obj.width / 2,
      y: obj.y + obj.height / 2,
    };
  };

  if (!isAuthenticated) {
    return (
      <AuthForm
        authMode={authMode}
        setAuthMode={setAuthMode}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
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
        darkMode={darkMode}
        currentUser={currentUser}
        handleLogout={handleLogout}
        createFolder={createFolder}
        createFile={createFile}
        folders={folders}
        files={files}
        currentFile={currentFile}
        expandedFolders={expandedFolders}
        toggleFolder={toggleFolder}
        deleteFolder={deleteFolder}
        deleteFile={deleteFile}
        openFile={openFile}
      />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar
          darkMode={darkMode}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          selectedObject={selectedObject}
          currentFile={currentFile}
          backgroundPattern={backgroundPattern}
          setBackgroundPattern={setBackgroundPattern}
          setDarkMode={setDarkMode}
          saveCurrentFile={saveCurrentFile}
          exportCanvas={() => exportCanvas(currentFile, canvasObjects, connections)}
          importCanvas={importCanvas}
          importOneNote={importOneNote}
          deleteSelected={deleteSelected}
          connectingFrom={connectingFrom}
          convertDrawingToText={convertDrawingToText}
          convertDrawingToShape={convertDrawingToShape}
        />
        
        <Canvas
          canvasRef={canvasRef}
          darkMode={darkMode}
          backgroundPattern={backgroundPattern}
          currentFile={currentFile}
          selectedTool={selectedTool}
          canvasObjects={canvasObjects}
          selectedObject={selectedObject}
          connections={connections}
          isDrawing={isDrawing}
          drawingPath={drawingPath}
          canvasScale={canvasScale}
          canvasOffset={canvasOffset}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleCanvasMouseMove={handleCanvasMouseMove}
          handleCanvasMouseUp={handleCanvasMouseUp}
          setSelectedObject={setSelectedObject}
          setConnectingFrom={setConnectingFrom}
          setShowTableEditor={setShowTableEditor}
          setContextMenu={setContextMenu}
          setCellMediaMenu={setCellMediaMenu}
          handleObjectDoubleClick={handleObjectDoubleClick}
          handleConnect={handleConnect}
          handleContextMenu={handleContextMenu}
          getConnectionPoints={getConnectionPoints}
            handleCellMediaMenu={handleCellMediaMenu}
  handleCellEdit={handleCellEdit}
  handleCellResize={handleCellResize}
  editingCell={editingCell}
  setEditingCell={setEditingCell}
        />
      </div>

      <ContextMenus
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        cellMediaMenu={cellMediaMenu}
        setCellMediaMenu={setCellMediaMenu}
        darkMode={darkMode}
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

export default App;