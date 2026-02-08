const useCanvas = ({
  canvasObjects, setCanvasObjects,
  selectedTool, setSelectedTool,
  selectedObject, setSelectedObject,
  isDrawing, setIsDrawing,
  drawingPath, setDrawingPath,
  connections, setConnections,
  connectingFrom, setConnectingFrom,
  animations, setAnimations,
  isPlaying, setIsPlaying
}) => {
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
