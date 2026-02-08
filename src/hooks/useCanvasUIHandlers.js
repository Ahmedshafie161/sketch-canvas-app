export default function useCanvasUIHandlers({
  canvasObjects,
  setCanvasObjects,
  setSelectedObject,
  setContextMenu,
  setCellMediaMenu,
  setEditingCell,
  darkMode,
  backgroundPattern
}) {
  function convertDrawingToText(drawingId) {
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
  }
  function convertDrawingToShape(drawingId, shapeType) {
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
  }
  function handleContextMenu(e, obj) {
    e.preventDefault();
    if (obj.type === 'drawing') {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        objectId: obj.id
      });
    }
  }
  function handleCellMediaMenu(e, objId, row, col) {
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
  }
  function getBackgroundStyle() {
    const baseStyle = {
      backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
      transition: 'background-color 0.3s ease',
    };
    if (backgroundPattern === 'grid') {
      return {
        ...baseStyle,
        backgroundImage: darkMode
          ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
          : 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    }
    if (backgroundPattern === 'lines') {
      return {
        ...baseStyle,
        backgroundImage: darkMode
          ? 'linear-gradient(#334155 1px, transparent 1px)'
          : 'linear-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    }
    return baseStyle;
  }
  return {
    convertDrawingToText,
    convertDrawingToShape,
    handleContextMenu,
    handleCellMediaMenu,
    getBackgroundStyle
  };
}
