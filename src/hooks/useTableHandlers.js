// Table and cell handlers extracted from App.jsx
export default function useTableHandlers({ setCanvasObjects, canvasObjects, setShowTableEditor }) {
  function handleObjectDoubleClick(obj, e) {
    e.stopPropagation();
    if (["text", "rectangle", "circle", "triangle"].includes(obj.type)) {
      const newText = prompt("Enter text:", obj.text || "");
      if (newText !== null) {
        setCanvasObjects(
          canvasObjects.map((o) => (o.id === obj.id ? { ...o, text: newText } : o))
        );
      }
    } else if (obj.type === "table") {
      setShowTableEditor(obj.id);
    }
  }

  function handleCellEdit(objId, row, col, content) {
    setCanvasObjects(
      canvasObjects.map((obj) => {
        if (obj.id === objId) {
          const newCells = obj.cells.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? { ...c, ...content } : c))
          );
          return { ...obj, cells: newCells };
        }
        return obj;
      })
    );
  }

  function handleImageUpload(objId, row, col, e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, {
          image: event.target.result,
          text: "",
          video: null,
          nestedTable: null,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleVideoUpload(objId, row, col, e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleCellEdit(objId, row, col, {
          video: event.target.result,
          text: "",
          image: null,
          nestedTable: null,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  function handleNestedTableAdd(objId, row, col) {
    const nestedTable = {
      rows: 2,
      cols: 2,
      cells: Array(2)
        .fill()
        .map(() => Array(2).fill({ text: "" })),
    };
    handleCellEdit(objId, row, col, {
      nestedTable,
      text: "",
      image: null,
      video: null,
    });
  }

  function handleCellResize(objId, row, col, e) {
    e.stopPropagation();
    const cell = document.querySelector(`[data-cell-id="${objId}-${row}-${col}"]`);
    if (!cell) return;
    const newWidth = prompt("Enter cell width (px):", cell.offsetWidth);
    const newHeight = prompt("Enter cell height (px):", cell.offsetHeight);
    if (newWidth && newHeight) {
      setCanvasObjects(
        canvasObjects.map((obj) => {
          if (obj.id === objId && obj.type === "table") {
            const updatedCells = [...obj.cells];
            if (!updatedCells[row]) updatedCells[row] = [];
            if (!updatedCells[row][col]) updatedCells[row][col] = {};
            updatedCells[row][col] = {
              ...updatedCells[row][col],
              customWidth: parseInt(newWidth),
              customHeight: parseInt(newHeight),
            };
            return {
              ...obj,
              cells: updatedCells,
            };
          }
          return obj;
        })
      );
    }
  }

  return {
    handleObjectDoubleClick,
    handleCellEdit,
    handleImageUpload,
    handleVideoUpload,
    handleNestedTableAdd,
    handleCellResize,
  };
}
