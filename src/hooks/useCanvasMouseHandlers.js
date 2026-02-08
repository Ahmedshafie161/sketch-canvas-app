import { useCallback } from 'react';
import { getCanvasCoords, isPointInObject, getResizeHandle } from '../utils/canvasUtils';

export default function useCanvasMouseHandlers({
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
}) {
  const handleCanvasMouseDown = useCallback((e) => {
    if (!currentFile) return;

    const pos = getCanvasCoords(e, canvasRef, canvasScale, canvasOffset);

    // Handle panning (with Space key or middle mouse button)
    if (e.button === 1 || isPanning) {
      setIsPanning(true);
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
  }, [
    currentFile, selectedTool, canvasObjects, isDrawing, canvasRef, canvasScale, canvasOffset,
    isPanning, setResizingObject, setResizeHandle,
    setSelectedObject, setIsDraggingObject, setDragStart, setDrawingPath, setIsDrawing,
    setIsPanning, setPanStart
  ]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!currentFile) return;

    const pos = getCanvasCoords(e, canvasRef, canvasScale, canvasOffset);

    // Handle panning
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

    if (isDrawing && selectedTool === 'draw') {
      setDrawingPath(prev => [...prev, pos]);
      return;
    }

    if (resizingObject && resizeHandle && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      setCanvasObjects(prev => prev.map(obj => {
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
      }));
      
      setDragStart(pos);
      return;
    }
    
    if (isDraggingObject && selectedObject && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      
      setCanvasObjects(prev => prev.map(obj => 
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
  }, [
    currentFile, isDrawing, selectedTool, resizingObject, resizeHandle, dragStart,
    isDraggingObject, selectedObject, canvasRef, canvasScale, canvasOffset,
    isPanning, panStart, setCanvasOffset, setDrawingPath, setCanvasObjects,
    setSelectedObject, setDragStart
  ]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (!currentFile) return;

    const pos = getCanvasCoords(e, canvasRef, canvasScale, canvasOffset);

    // Stop panning
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
  }, [
    currentFile, isDrawing, selectedTool, drawingPath, dragStart,
    isDraggingObject, resizingObject, canvasRef, canvasScale, canvasOffset,
    isPanning, darkMode, setIsDrawing, setDrawingPath, setCanvasObjects,
    setSelectedTool, setIsDraggingObject, setDragStart, setResizingObject,
    setResizeHandle, setIsPanning, setPanStart
  ]);

  return {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp
  };
}
