import { useState, useEffect } from 'react';
import { useCanvasHandlers } from './useCanvasHandlers';

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
  const [contextMenu, setContextMenu] = useState(null);
  const [cellMediaMenu, setCellMediaMenu] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [resizingObject, setResizingObject] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Use handlers
  const {
    handleObjectDoubleClick,
    handleCellEdit,
    handleImageUpload,
    handleVideoUpload,
    handleNestedTableAdd,
    convertDrawingToText,
    convertDrawingToShape,
    handleCellMediaMenu,
  } = useCanvasHandlers(canvasObjects, setCanvasObjects, setSelectedObject);

  // Load objects from current file
  useEffect(() => {
    if (currentFile) {
      setCanvasObjects(currentFile.objects || []);
      setConnections(currentFile.connections || []);
      setAnimations(currentFile.animations || []);
      setSelectedObject(null);
    }
  }, [currentFile]);

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

  const handleCanvasMouseDown = (e) => {
    if (!currentFile) return;

    const pos = getCanvasCoords(e);

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

  return {
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
  };
};
