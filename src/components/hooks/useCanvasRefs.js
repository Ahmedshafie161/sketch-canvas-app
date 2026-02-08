import { useRef, useState } from 'react';

const useCanvasRefs = () => {
  const canvasRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  return {
    canvasRef,
    draggedItem,
    setDraggedItem,
    dragStart,
    setDragStart,
    isDraggingObject,
    setIsDraggingObject,
  };
};

export default useCanvasRefs;
