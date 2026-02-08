import { useState } from 'react';

export default function useAppState() {
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [isConvertingDrawing, setIsConvertingDrawing] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);
  return {
    drawingHistory, setDrawingHistory,
    isConvertingDrawing, setIsConvertingDrawing,
    contextMenu, setContextMenu,
    canvasOffset, setCanvasOffset,
    isPanning, setIsPanning,
    panStart, setPanStart,
    canvasScale, setCanvasScale
  };
}
