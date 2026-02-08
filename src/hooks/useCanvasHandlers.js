// Canvas handlers for object and cell manipulation
export const useCanvasHandlers = (canvasObjects, setCanvasObjects, setSelectedObject) => {
  
  const handleObjectDoubleClick = (obj, e) => {
    e.stopPropagation();
    if (['text', 'rectangle', 'circle', 'triangle'].includes(obj.type)) {
      const newText = prompt('Enter text:', obj.text || '');
      if (newText !== null) {
        setCanvasObjects(canvasObjects.map(o =>
          o.id === obj.id ? { ...o, text: newText } : o
        ));
      }
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
    return {
      x: e.clientX,
      y: e.clientY,
      objId,
      row,
      col
    };
  };

  return {
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
