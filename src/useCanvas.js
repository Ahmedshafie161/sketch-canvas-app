import { useState, useEffect } from 'react';

export const useCanvas = (currentFile, files, setFiles, darkMode, canvasRef) => {
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [animations, setAnimations] = useState([]);
  const [backgroundPattern, setBackgroundPattern] = useState('grid');
  const [showTableEditor, setShowTableEditor] = useState(null);
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellMediaMenu, setCellMediaMenu] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [darkModeState, setDarkModeState] = useState(false);

  // Load dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkModeState(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkModeState));
  }, [darkModeState]);

  const setDarkMode = (value) => {
    setDarkModeState(value);
  };

  // Load canvas objects from current file
  useEffect(() => {
    if (currentFile) {
      setCanvasObjects(currentFile.objects || []);
      setConnections(currentFile.connections || []);
      setAnimations(currentFile.animations || []);
      setSelectedObject(null);
    }
  }, [currentFile?.id]);

  // Zoom with mouse wheel
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        document.body.style.cursor = 'grab';
      }

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

    x = (x / canvasScale) - canvasOffset.x;
    y = (y / canvasScale) - canvasOffset.y;

    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    if (!currentFile) return;

    const pos = getCanvasCoords(e);

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

    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

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

      setDrawingHistory([...drawingHistory, newObject]);
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

  return {
    canvasObjects,
    selectedTool,
    selectedObject,
    isDrawing,
    drawingPath,
    connections,
    connectingFrom,
    animations,
    darkMode: darkModeState,
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
    setDarkMode,
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
  };
};
