import { useState } from 'react';

const useCanvas = () => {
  const [canvasObjects, setCanvasObjects] = useState([]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [animations, setAnimations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  return {
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
    connections,
    setConnections,
    connectingFrom,
    setConnectingFrom,
    animations,
    setAnimations,
    isPlaying,
    setIsPlaying,
  };
};

export default useCanvas;
